import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const RLS_FIRM_MESSAGE =
  "U heeft geen rechten om een kantoor aan te maken. Neem contact op met support.";

function isRlsPolicyError(message: string, code?: string): boolean {
  const m = message.toLowerCase();
  return (
    code === "42501" ||
    m.includes("row-level security") ||
    m.includes("violates row-level security") ||
    (m.includes("permission denied") && m.includes("policy"))
  );
}

function firmWriteErrorResponse(message: string, code?: string) {
  if (isRlsPolicyError(message, code)) {
    return NextResponse.json({ error: RLS_FIRM_MESSAGE }, { status: 403 });
  }
  return NextResponse.json({ error: message }, { status: 500 });
}

// ── Zod schemas ────────────────────────────────────────────────────────────

const PRACTICE_AREAS = [
  "Arbeidsrecht",
  "Bestuursrecht",
  "Erfrecht",
  "Familierecht",
  "Intellectueel eigendom",
  "IT-recht",
  "Ondernemingsrecht",
  "Onroerend goed",
  "Personen- en familierecht",
  "Strafrecht",
  "Vastgoedrecht",
  "Verbintenissenrecht",
  "Overig",
] as const;

// Bedrijfsgrootte — opties afgestemd op de juridische markt.
// Waarden worden opgeslagen als compacte strings; de UI toont ze als
// "{team_size} medewerkers" (zie o.a. FirmCard).
const TEAM_SIZES = ["1-5", "6-20", "21-50", "51-100", "100+"] as const;

// Explicit allowlist of updatable columns — prevents mass-assignment of
// sensitive columns like user_id, id, slug (on update), is_published, etc.
const updateFirmSchema = z.object({
  name: z.string().min(1).max(200).trim().optional(),
  location: z.string().min(1).max(200).trim().optional(),
  practice_areas: z.array(z.enum(PRACTICE_AREAS)).optional(),
  description: z.string().max(10_000).trim().optional(),
  contact_person: z.string().max(200).trim().optional(),
  notification_email: z.string().email().max(200).optional(),
  team_size: z.enum(TEAM_SIZES).nullable().optional(),
  why_work_with_us: z.string().max(5_000).trim().nullable().optional(),
  website_url: z.string().url().max(500).nullable().optional(),
  linkedin_url: z.string().url().max(500).nullable().optional(),
  salary_indication: z.string().max(200).trim().nullable().optional(),
  logo_url: z.string().url().max(1_000).nullable().optional(),
  // slug is allowed only on first insert (handled separately), never update
  // user_id, id, created_at are never accepted here
});

// Email-settings-only schema — used by the settings page.
// cc_emails is a list of extra CC addresses (0 or more). An empty array
// clears the field. We trim, lowercase, and de-duplicate server-side as
// a defence-in-depth measure on top of the client's validation.
const MAX_CC_EMAILS = 20;

const emailSettingsSchema = z.object({
  notification_email: z.string().email().max(200).optional(),
  cc_emails: z
    .array(z.string().email().max(200))
    .max(MAX_CC_EMAILS)
    .transform((arr) => {
      const seen = new Set<string>();
      const out: string[] = [];
      for (const raw of arr) {
        const e = raw.trim().toLowerCase();
        if (!e || seen.has(e)) continue;
        seen.add(e);
        out.push(e);
      }
      return out;
    })
    .optional(),
});

// ── PATCH /api/firms/me — update own firm (profile) ───────────────────────

export async function PATCH(request: NextRequest) {
  const supabase = await createClient();

  // Step A: verify auth
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Niet ingelogd." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Ongeldige JSON." }, { status: 400 });
  }

  // Determine which schema to use based on the request body shape
  const isEmailSettings =
    body !== null &&
    typeof body === "object" &&
    ("notification_email" in body || "cc_emails" in body) &&
    !("name" in body) &&
    !("location" in body);

  let validatedData: Record<string, unknown>;

  if (isEmailSettings) {
    const result = emailSettingsSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Ongeldige invoer.", details: result.error.flatten() },
        { status: 400 }
      );
    }
    validatedData = result.data as Record<string, unknown>;
  } else {
    const result = updateFirmSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Ongeldige invoer.", details: result.error.flatten() },
        { status: 400 }
      );
    }
    // Derive is_published from the update — a firm is live when all required
    // fields are present in the DB after the update.
    const d = result.data;
    const isPublishedUpdate = result.data;

    // We need to merge with existing data to determine is_published correctly.
    // Fetch the current record first.
    const { data: existing } = await supabase
      .from("firms")
      .select(
        "name, location, practice_areas, description, contact_person, notification_email"
      )
      .eq("user_id", user.id)
      .maybeSingle();

    const merged = {
      name: d.name ?? existing?.name,
      location: d.location ?? existing?.location,
      practice_areas: d.practice_areas ?? existing?.practice_areas,
      description: d.description ?? existing?.description,
      contact_person: d.contact_person ?? existing?.contact_person,
      notification_email:
        (isPublishedUpdate as { notification_email?: string }).notification_email ??
        existing?.notification_email,
    };

    const isPublished =
      !!merged.name?.trim() &&
      !!merged.location?.trim() &&
      (merged.practice_areas?.length ?? 0) > 0 &&
      !!merged.description?.trim() &&
      !!merged.contact_person?.trim() &&
      !!merged.notification_email?.trim();

    validatedData = { ...result.data, is_published: isPublished };
  }

  if (Object.keys(validatedData).length === 0) {
    return NextResponse.json({ error: "Geen velden om bij te werken." }, { status: 400 });
  }

  // Step B: IDOR protection — always filter by user_id = authenticated user's id.
  // No firm ID from the client is needed or trusted.
  const { data: firm } = await supabase
    .from("firms")
    .select("id, slug")
    .eq("user_id", user.id)
    .maybeSingle();

  if (firm) {
    // Update existing record — firm_id is authoritative from the DB
    const { error } = await supabase
      .from("firms")
      .update(validatedData)
      .eq("user_id", user.id);

    if (error) {
      console.error("[PATCH /api/firms/me] update error:", error.message);
      return firmWriteErrorResponse(error.message, error.code);
    }
  } else {
    // First time creating a firm profile — generate slug server-side
    if (!("name" in validatedData) || !validatedData.name) {
      return NextResponse.json(
        { error: "Naam is verplicht voor een nieuw werkgeversprofiel." },
        { status: 400 }
      );
    }
    const name = String(validatedData.name);
    const slug =
      name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") +
      "-" +
      Math.random().toString(36).substring(2, 8);

    const { data: inserted, error } = await supabase
      .from("firms")
      .insert({
        ...validatedData,
        user_id: user.id, // always server-resolved
        slug,
      })
      .select("id")
      .single();

    if (error) {
      console.error("[PATCH /api/firms/me] insert error:", error.message);
      return firmWriteErrorResponse(error.message, error.code);
    }

    const { error: profileError } = await supabase
      .from("profiles")
      .update({ firm_id: inserted.id })
      .eq("id", user.id);

    if (profileError) {
      console.error(
        "[PATCH /api/firms/me] profile firm_id link error:",
        profileError.message
      );
      if (isRlsPolicyError(profileError.message, profileError.code)) {
        return NextResponse.json({ error: RLS_FIRM_MESSAGE }, { status: 403 });
      }
      return NextResponse.json(
        { error: "Kantoor aangemaakt maar koppeling met profiel mislukt." },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ success: true });
}
