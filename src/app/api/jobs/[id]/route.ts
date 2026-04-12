import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { geocodeCity } from "@/lib/geocode";

// ── Zod schemas ────────────────────────────────────────────────────────────

const JOB_TYPES = ["fulltime", "parttime", "business-course", "stage"] as const;

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

const updateJobSchema = z.object({
  title: z.string().min(1).max(200).trim().optional(),
  location: z.string().min(1).max(200).trim().optional(),
  type: z.enum(JOB_TYPES).optional(),
  practice_area: z.enum(PRACTICE_AREAS).optional(),
  description: z.string().min(1).max(100_000).optional(),
  salary_indication: z.string().max(200).trim().nullable().optional(),
  start_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullable()
    .optional(),
  required_education: z.string().max(300).trim().nullable().optional(),
  hours_per_week: z.number().int().min(1).max(168).nullable().optional(),
  status: z.enum(["draft", "active", "closed"]).optional(),
});

type Params = { params: Promise<{ id: string }> };

// ── Shared: resolve authenticated user's firm ──────────────────────────────

async function getAuthFirm(supabase: Awaited<ReturnType<typeof createClient>>) {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) return { user: null, firm: null, response: NextResponse.json({ error: "Niet ingelogd." }, { status: 401 }) };

  const { data: firm } = await supabase
    .from("firms")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!firm) return { user, firm: null, response: NextResponse.json({ error: "Geen werkgever gevonden voor dit account." }, { status: 403 }) };

  return { user, firm, response: null };
}

// ── PATCH /api/jobs/[id] — update a job ───────────────────────────────────

export async function PATCH(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const supabase = await createClient();

  const { firm, response } = await getAuthFirm(supabase);
  if (response) return response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Ongeldige JSON." }, { status: 400 });
  }

  const result = updateJobSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: "Ongeldige invoer.", details: result.error.flatten() },
      { status: 400 }
    );
  }

  const updatePayload: Record<string, unknown> = {
    ...result.data,
    updated_at: new Date().toISOString(),
  };

  if (result.data.location) {
    const geo = await geocodeCity(result.data.location);
    updatePayload.latitude = geo?.lat ?? null;
    updatePayload.longitude = geo?.lng ?? null;
  }

  const { data: updated, error } = await supabase
    .from("jobs")
    .update(updatePayload)
    .eq("id", id)
    .eq("firm_id", firm!.id)
    .select("id");

  if (error) {
    console.error("[PATCH /api/jobs/[id]] update error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!updated || updated.length === 0) {
    return NextResponse.json(
      { error: "Vacature niet gevonden of geen toegang." },
      { status: 403 }
    );
  }

  return NextResponse.json({ success: true });
}

// ── DELETE /api/jobs/[id] — delete a job ──────────────────────────────────

export async function DELETE(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  const supabase = await createClient();

  const { firm, response } = await getAuthFirm(supabase);
  if (response) return response;

  // Step B: IDOR protection — WHERE id = :id AND firm_id = :auth_firm_id
  // Werkgever A cannot delete a vacature belonging to werkgever B even if
  // they know the UUID, because the firm_id filter will return 0 rows.
  const { data: deleted, error } = await supabase
    .from("jobs")
    .delete()
    .eq("id", id)
    .eq("firm_id", firm!.id)
    .select("id");

  if (error) {
    console.error("[DELETE /api/jobs/[id]] delete error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!deleted || deleted.length === 0) {
    return NextResponse.json(
      { error: "Vacature niet gevonden of geen toegang." },
      { status: 403 }
    );
  }

  return NextResponse.json({ success: true });
}
