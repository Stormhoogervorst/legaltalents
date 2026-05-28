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
