import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Vangnet voor Supabase-bevestigingsmails ────────────────────────────────
  // Supabase valt soms terug op de Site URL (homepage) i.p.v. de meegegeven
  // `redirect_to`. Daardoor landt een bevestigingslink op bijv.
  // "/?code=<uuid>": de homepage met een auth-code die nergens wordt
  // ingewisseld. We onderscheppen elk NIET-callback request met een ?code= en
  // sturen het — zonder `next` — door naar /api/auth/callback. Die route
  // wisselt de code in en bepaalt role-aware de juiste bestemming.
  // De callback-route is via de matcher uitgesloten; de pathname-check is een
  // extra waarborg tegen een redirect-loop.
  const authCode = request.nextUrl.searchParams.get("code");
  if (authCode && pathname !== "/api/auth/callback") {
    const callbackUrl = request.nextUrl.clone();
    callbackUrl.pathname = "/api/auth/callback";
    callbackUrl.search = "";
    callbackUrl.searchParams.set("code", authCode);
    return NextResponse.redirect(callbackUrl);
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(
          cookiesToSet: {
            name: string;
            value: string;
            options?: Record<string, unknown>;
          }[]
        ) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh the Supabase session — must be called on every request
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // /admin/login is de publieke "geheime voordeur" voor de Super Admin.
  // Hier mag elke (niet-)bezoeker langs zonder role-check.
  const isAdminLogin =
    pathname === "/admin/login" || pathname.startsWith("/admin/login/");

  // Resolve admin role once, only when a downstream branch needs it. The
  // profiles_self_read RLS policy (id = auth.uid()) allows this query with the
  // anon key + the user's session cookie — no service role needed here.
  const needsRoleLookup =
    !!user &&
    (pathname.startsWith("/admin") ||
      pathname.startsWith("/login") ||
      pathname.startsWith("/register"));

  let isAdmin = false;
  if (needsRoleLookup) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user!.id)
      .maybeSingle();
    isAdmin = profile?.role === "admin";
  }

  // ── /admin guard ──────────────────────────────────────────────────────────
  // /admin/login zelf staat altijd open (de inlogpagina kan zichzelf nooit
  // dichtmaken). Een ingelogde admin die /admin/login bezoekt wordt
  // doorgestuurd naar /admin, een ingelogde non-admin naar de homepage.
  if (isAdminLogin) {
    if (user) {
      const url = request.nextUrl.clone();
      url.pathname = isAdmin ? "/admin" : "/";
      url.search = "";
      if (!isAdmin) url.searchParams.set("error", "unauthorized");
      return NextResponse.redirect(url);
    }
  } else if (pathname.startsWith("/admin")) {
    // Geen sessie → naar de admin-voordeur, NIET naar de werkgevers-login.
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      url.search = "";
      return NextResponse.redirect(url);
    }
    // Ingelogd maar geen admin → terug naar homepage met waarschuwing.
    if (!isAdmin) {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      url.search = "";
      url.searchParams.set("error", "unauthorized");
      return NextResponse.redirect(url);
    }
  }

  // Unauthenticated users cannot access /portal
  if (pathname.startsWith("/portal") && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(url);
  }

  // Logged-in users are sent away from auth pages.
  // Admins land on /admin, everyone else on /portal.
  // Explicitly excluded: the LinkedIn apply confirmation flow at
  // /vacature/[slug]/bevestig-linkedin so users arriving after OAuth
  // are never bounced away mid-application.
  const isApplyFlow =
    pathname.startsWith("/vacature/") &&
    pathname.includes("/bevestig-linkedin");
  if (
    user &&
    !isApplyFlow &&
    (pathname.startsWith("/login") || pathname.startsWith("/register"))
  ) {
    const url = request.nextUrl.clone();
    url.pathname = isAdmin ? "/admin" : "/portal";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    // Het vangnet hoeft enkel te draaien op paginaroutes waar een gebruiker met
    // ?code= kan landen (typisch de homepage). We sluiten daarom expliciet uit:
    //   - api/   → alle API-routes (incl. /api/auth/callback; voorkomt loop én
    //              voorkomt dat de middleware overhead op /api introduceert)
    //   - _next/ → Next.js-internals (static + image)
    //   - favicon.ico en elk pad met een bestandsextensie → statische assets
    // Zo draait de ?code=-catch nooit op /api en introduceert het vangnet geen
    // rate limiting of andere overhead op API-verkeer.
    "/((?!api/|_next/|favicon.ico|.*\\.[^/]+$).*)",
  ],
};
