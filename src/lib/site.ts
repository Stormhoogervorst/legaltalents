/**
 * Canonical site URL — single source of truth.
 *
 * Gebruikt voor canonicals, OG-URLs, sitemap entries en JSON-LD `url` velden.
 * Zet `NEXT_PUBLIC_SITE_URL` in .env.local voor dev/preview overrides.
 *
 * Het canonieke productiedomein is `https://www.legal-vacatures.nl`.
 * Alle andere varianten (apex, http://) worden via DNS/proxy geredirect.
 */
export function getSiteUrl(fallbackOrigin?: string) {
  const configured =
    process.env.NEXT_PUBLIC_SITE_URL ??
    fallbackOrigin ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined) ??
    (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");

  return configured.replace(/\/+$/, "");
}

export const SITE_URL = getSiteUrl();

/**
 * Safelist van interne paden die we als post-auth bestemming (`next`) toestaan.
 *
 * Door enkel deze exacte paden te accepteren voorkomen we open-redirect-misbruik:
 * een aanvaller kan via de `next`-query parameter geen externe of
 * protocol-relatieve URL injecteren in de auth-callback.
 */
const SAFE_NEXT_PATHS = new Set<string>([
  "/portal",
  "/login",
  "/dashboard",
  "/vacancies",
  "/auth/login",
  "/update-wachtwoord",
]);

/**
 * Valideert een `next`-pad tegen de safelist en geeft anders de fallback terug.
 *
 * Accepteert alleen interne, absolute paden (beginnend met één `/`, niet `//`)
 * die in {@link SAFE_NEXT_PATHS} voorkomen. Externe URLs, protocol-relatieve
 * URLs (`//evil.com`) en onbekende paden worden afgewezen.
 */
export function sanitizeNextPath(
  next: string | null | undefined,
  fallback = "/portal"
): string {
  if (!next) return fallback;
  if (!next.startsWith("/") || next.startsWith("//")) return fallback;

  const pathOnly = next.split(/[?#]/)[0];
  return SAFE_NEXT_PATHS.has(pathOnly) ? pathOnly : fallback;
}
