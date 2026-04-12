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

const createJobSchema = z.object({
  title: z.string().min(1, "Titel is verplicht").max(200).trim(),
  location: z.string().min(1, "Vestigingsplaats is verplicht").max(200).trim(),
  type: z.enum(JOB_TYPES, { message: "Ongeldig type" }),
  practice_area: z.enum(PRACTICE_AREAS, { message: "Ongeldig rechtsgebied" }),
  description: z.string().min(1, "Beschrijving is verplicht").max(100_000),
  salary_indication: z.string().max(200).trim().nullable().optional(),
  start_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Ongeldige datum")
    .nullable()
    .optional(),
  required_education: z.string().max(300).trim().nullable().optional(),
  hours_per_week: z.number().int().min(1).max(168).nullable().optional(),
  status: z.enum(["draft", "active"]),
  slug: z.string().min(1).max(400),
});

// ── POST /api/jobs — create a new job ─────────────────────────────────────

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  // Step A: verify auth
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Niet ingelogd." }, { status: 401 });
  }

  // Step B: resolve the firm that belongs to this user (ownership anchor)
  const { data: firm } = await supabase
    .from("firms")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!firm) {
    return NextResponse.json(
      { error: "Geen werkgever gevonden voor dit account." },
      { status: 403 }
    );
  }

  // Step C: parse + validate input with Zod (prevents mass-assignment)
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Ongeldige JSON." }, { status: 400 });
  }

  const result = createJobSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: "Ongeldige invoer.", details: result.error.flatten() },
      { status: 400 }
    );
  }

  const d = result.data;

  const geo = await geocodeCity(d.location);

  const { error: insertError } = await supabase.from("jobs").insert({
    firm_id: firm.id,
    title: d.title,
    location: d.location,
    type: d.type,
    practice_area: d.practice_area,
    description: d.description,
    salary_indication: d.salary_indication ?? null,
    start_date: d.start_date ?? null,
    required_education: d.required_education ?? null,
    hours_per_week: d.hours_per_week ?? null,
    status: d.status,
    slug: d.slug,
    latitude: geo?.lat ?? null,
    longitude: geo?.lng ?? null,
  });

  if (insertError) {
    console.error("[POST /api/jobs] insert error:", insertError.message);
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true }, { status: 201 });
}
