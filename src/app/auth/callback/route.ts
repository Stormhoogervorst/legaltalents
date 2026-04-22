import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Supabase auth callback.
 *
 * Supabase's default e-mail templates (sign-up verification, magic link én
 * password recovery) verwijzen standaard naar `{{ .SiteURL }}/auth/callback`
 * met daarin een `code` query parameter. Die code moet hier worden
 * ingewisseld voor een sessie (cookies) via `exchangeCodeForSession`.
 *
 * Zonder deze route landt de gebruiker gewoon op de homepage met een losse
 * `?code=…` in de URL — precies het probleem dat we hier oplossen.
 *
 * Recovery-detectie:
 *   - `type=recovery` wordt door Supabase toegevoegd bij een password reset
 *     link. Dat is de primaire signal.
 *   - Daarnaast respecteren we een optionele `next` query param zodat
 *     aanroepers zelf de bestemming kunnen kiezen.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const type = searchParams.get("type");
  const nextParam = searchParams.get("next");
  const errorParam = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  const base = process.env.NEXT_PUBLIC_SITE_URL || origin;

  // Supabase kan ook direct met een fout terugkomen (bijv. verlopen link).
  if (errorParam) {
    console.warn("[auth/callback] Supabase returned an error:", {
      errorParam,
      errorDescription,
    });
    return NextResponse.redirect(
      `${base}/login?error=${encodeURIComponent(errorParam)}`
    );
  }

  if (!code) {
    return NextResponse.redirect(`${base}/login?error=missing_code`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("[auth/callback] exchangeCodeForSession failed:", error.message);
    return NextResponse.redirect(`${base}/login?error=auth_callback_failed`);
  }

  // Recovery flow: Supabase hangt `type=recovery` aan de callback URL bij een
  // password reset mail. In dat geval sturen we de gebruiker naar een pagina
  // waar ze een nieuw wachtwoord kunnen instellen. We plakken altijd
  // `reset=1` aan de bestemming zodat de settings-pagina kan herkennen dat
  // dit een recovery-flow is (en bovenaan een duidelijke melding toont),
  // ongeacht welke `next` de aanroeper meegaf.
  if (type === "recovery") {
    const destination = withResetFlag(nextParam || "/portal/settings");
    return NextResponse.redirect(`${base}${destination}`);
  }

  // Normale login / e-mail verificatie: respecteer `next` indien opgegeven,
  // anders naar het dashboard.
  const destination = nextParam || "/dashboard";
  return NextResponse.redirect(`${base}${destination}`);
}

/**
 * Voegt `reset=1` toe aan een (mogelijk al van query-params voorziene)
 * relatieve URL, zonder bestaande parameters te verliezen.
 */
function withResetFlag(relativeUrl: string): string {
  const [path, query = ""] = relativeUrl.split("?");
  const params = new URLSearchParams(query);
  params.set("reset", "1");
  return `${path}?${params.toString()}`;
}
