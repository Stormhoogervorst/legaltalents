# Security & Code Quality Audit — Legal Talents

**Datum:** 15 mei 2026
**Auditor:** Wiex Agency (geautomatiseerd via Claude Code)
**Scope:** Volledige codebase `/Users/patrick/Sites/legaltalents`
**Tech stack:** Next.js 16.2.1, Supabase (auth + DB + storage), Tailwind, Vercel

---

## Samenvatting

| Categorie | Kritisch | Hoog | Medium | Laag |
|-----------|----------|------|--------|------|
| Security  | 1        | 3    | 5      | 2    |
| Code Quality | —    | 2    | 4      | 3    |
| **Totaal** | **1**  | **5** | **9** | **5** |

De applicatie heeft een degelijke basis (RLS-policies, rate limiting via Upstash, reCAPTCHA, Zod-validatie), maar er zijn **kritieke gaten** in secret management, XSS-preventie en testdekking die voor productie opgelost moeten worden.

---

## 1. Security Findings

### SEC-01 — XSS via `dangerouslySetInnerHTML` (HOOG)

**Bestanden:**
- `src/app/vacature/[slug]/page.tsx:438` — `typedJob.description`
- `src/app/kennisbank/[slug]/page.tsx:321` — `blog.content`

**Probleem:** User-generated content (vacaturebeschrijvingen, blogposts) wordt als rauwe HTML gerenderd zonder sanitization. Een werkgever of admin die kwaadaardige HTML invoert kan JavaScript injecteren.

**Impact:** Stored XSS — session hijacking, data-exfiltratie, phishing overlays.

**Aanbeveling:**
```bash
npm install dompurify @types/dompurify
```
```tsx
import DOMPurify from "dompurify";
dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(typedJob.description) }}
```

> **Opmerking:** De overige `dangerouslySetInnerHTML`-gevallen betreffen `JSON.stringify()` van gecontroleerde JSON-LD schema's — die zijn veilig.

---

### SEC-02 — Onvoldoende file upload validatie (HOOG)

**Bestanden:**
- `src/app/api/apply/route.ts:177-217`
- `src/app/api/auth/linkedin-apply/confirm/route.ts`
- `src/app/api/firms/me/logo/route.ts`

**Probleem:** CV-uploads worden alleen gecheckt op bestandsgrootte (5 MB). Er is geen validatie van:
- Magic bytes (file header) — client kan MIME type faken
- Bestandsinhoud (een `.pdf` kan een executable bevatten)
- Virus scanning

De logo-upload (`firms/me/logo/route.ts`) checkt wel `file.type` tegen een allowlist, maar `file.type` is client-supplied en kan gespoofed worden.

**Impact:** Malware distributie via CV-uploads, server-side exploitation.

**Aanbeveling:**
```bash
npm install file-type
```
```ts
import { fileTypeFromBuffer } from "file-type";
const type = await fileTypeFromBuffer(buffer);
if (type?.mime !== "application/pdf") {
  return NextResponse.json({ error: "Alleen PDF-bestanden." }, { status: 400 });
}
```

---

### SEC-03 — Ontbrekende security headers (HOOG)

**Bestand:** `next.config.ts`

**Probleem:** Alleen CORS-headers worden gezet op `/api/*`. De volgende headers ontbreken globaal:

| Header | Risico zonder |
|--------|---------------|
| `X-Frame-Options: DENY` | Clickjacking |
| `X-Content-Type-Options: nosniff` | MIME-sniffing aanvallen |
| `Strict-Transport-Security` | Downgrade naar HTTP |
| `Referrer-Policy` | Lekkage van URL-parameters |
| `Content-Security-Policy` | Onbeperkte script-injectie |
| `Permissions-Policy` | Toegang tot camera/microfoon/etc. |

**Aanbeveling:** Voeg een globale headers-config toe in `next.config.ts`:
```ts
{
  source: "/:path*",
  headers: [
    { key: "X-Frame-Options", value: "DENY" },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
    { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  ],
}
```

---

### SEC-04 — Geen audit logging voor impersonatie (HOOG)

**Bestand:** `src/lib/impersonation.ts`

**Probleem:** Het admin-impersonatiesysteem:
- Logt niet welke admin welke werkgever impersoneert
- Heeft geen tijdslimiet op de impersonatie-cookie
- Stuurt geen notificatie naar de werkgever
- Maakt forensisch onderzoek bij een incident onmogelijk

**Impact:** Ongeautoriseerde toegang gaat onopgemerkt. AVG-verantwoording ontbreekt.

**Aanbeveling:**
1. Maak een `audit_logs`-tabel met admin_id, target_firm_id, action, created_at
2. Zet `maxAge: 3600` (1 uur) op de impersonatie-cookie
3. Log elke start/stop van impersonatie

---

### SEC-05 — Rate limiting via in-memory Map (MEDIUM)

**Bestand:** `middleware.ts:4-24`

**Probleem:** De middleware rate limiter gebruikt een `Map()` in-memory. Op Vercel draait elke serverless function in een eigen instance — de Map wordt niet gedeeld. Een aanvaller kan rate limits omzeilen door simpelweg een nieuwe instance te triggeren.

**Opmerking:** Er is ook een Upstash-based rate limiter in `src/lib/security/rate-limit.ts` die wél persistent is, maar die wordt alleen per-route gebruikt. De middleware-limiter is dus een schijnveiligheid.

**Aanbeveling:** Verwijder de in-memory rate limiter uit de middleware, of vervang deze door de Upstash-implementatie. Op Vercel is in-memory state per definitie onbetrouwbaar.

---

### SEC-06 — IP-spoofing in rate limiting (MEDIUM)

**Bestanden:**
- `middleware.ts:30-31`
- `src/lib/security/rate-limit.ts:72-75`

**Probleem:** IP-adres wordt gelezen uit `x-forwarded-for` header. Op Vercel is dit betrouwbaar (Vercel overschrijft de header), maar als de app ooit achter een andere proxy draait of lokaal wordt getest, is dit spoofbaar.

**Aanbeveling:** Documenteer dat dit alleen betrouwbaar is op Vercel. Overweeg Vercel's `request.ip` property te gebruiken.

---

### SEC-07 — CORS fallback bij ontbrekende env var (MEDIUM)

**Bestand:** `next.config.ts:7-9`

**Probleem:** Als `NEXT_PUBLIC_SITE_URL` niet is gezet, wordt `allowedOrigins` een lege array. `[].join(", ")` resulteert in een lege string als `Access-Control-Allow-Origin` header, wat door sommige browsers anders wordt geïnterpreteerd dan verwacht.

**Aanbeveling:** Voeg een fallback toe en gooi een fout bij het ontbreken:
```ts
const origin = process.env.NEXT_PUBLIC_SITE_URL;
if (!origin) throw new Error("NEXT_PUBLIC_SITE_URL is niet geconfigureerd");
```

---

### SEC-08 — Gevoelige data in console.log (MEDIUM)

**Bestanden:** Meerdere API routes, met name:
- `src/app/api/apply/route.ts:227,249,272-279,326,359`
- `src/app/api/auth/callback/route.ts`

**Probleem:** E-mailadressen, firm names, en job IDs worden naar console gelogd. Op Vercel zijn deze logs zichtbaar in het dashboard en worden ze opgeslagen.

**Impact:** AVG-risico — persoonsgegevens in logs. Bij een breach van het Vercel-account zijn sollicitantengegevens zichtbaar.

**Aanbeveling:** Gebruik gestructureerde logging met data-masking:
```ts
console.log("[/api/apply] Firm email sent", { jobId: jobId.slice(0, 8) + "..." });
```

---

### SEC-09 — Geen CSRF-tokens op formulieren (MEDIUM)

**Probleem:** Formulieren (sollicitatie, blog aanmaken, account verwijderen) hebben geen expliciete CSRF-bescherming. Supabase session cookies bieden enige bescherming via `SameSite`, maar expliciete CSRF-tokens zijn best practice.

**Impact:** Cross-site request forgery op gevoelige acties (account verwijderen, vacature aanmaken).

**Aanbeveling:** Implementeer een CSRF-token mechanisme, of verifieer de `Origin` header in API routes.

---

### SEC-10 — reCAPTCHA is optioneel (LAAG)

**Bestand:** `src/app/api/apply/route.ts:179`

**Probleem:** `if (process.env.RECAPTCHA_SECRET_KEY)` — als de env var ontbreekt, wordt reCAPTCHA volledig overgeslagen. Dit is bedoeld voor lokale development, maar als de var per ongeluk ontbreekt in productie, staat de deur open voor bots.

**Aanbeveling:** Log een waarschuwing als reCAPTCHA overgeslagen wordt:
```ts
if (!process.env.RECAPTCHA_SECRET_KEY) {
  console.warn("[SECURITY] reCAPTCHA is uitgeschakeld — RECAPTCHA_SECRET_KEY ontbreekt");
}
```

---

### SEC-11 — Blog content zonder grootte-limiet in database (LAAG)

**Bestand:** `supabase-migration-blogs.sql`

**Probleem:** `content text NOT NULL DEFAULT ''` zonder `CHECK`-constraint. Een admin kan theoretisch gigabytes aan content opslaan.

**Aanbeveling:** Voeg een constraint toe:
```sql
ALTER TABLE blogs ADD CONSTRAINT blogs_content_max_length CHECK (char_length(content) <= 500000);
```

---

## 2. Code Quality Findings

### CQ-01 — Geen enkele test aanwezig (HOOG)

**Probleem:** Er zijn **0 testbestanden** in het project:
- Geen unit tests
- Geen integration tests
- Geen E2E tests
- Geen test-framework geconfigureerd (geen Jest, Vitest, Playwright, Cypress)
- `package.json` bevat geen `test` script

**Impact:** Elke code-wijziging kan ongemerkt regressies introduceren. Er is geen geautomatiseerde validatie van:
- Business logic (sollicitatie-flow, RLS-policies)
- API route responses
- Input validatie
- Edge cases

**Aanbeveling:**
1. Installeer Vitest voor unit/integration tests:
   ```bash
   npm install -D vitest @testing-library/react @testing-library/jest-dom
   ```
2. Installeer Playwright voor E2E tests:
   ```bash
   npm install -D @playwright/test
   ```
3. Begin met tests voor de meest kritieke paden:
   - `POST /api/apply` — volledige sollicitatieflow
   - `POST /api/auth/callback` — authenticatie
   - `DELETE /api/account` — account deletion
   - Input validatie functies
   - RLS policies (via Supabase test helpers)

---

### CQ-02 — Supabase migraties staan NIET in `supabase/migrations/` (HOOG)

**Probleem:** Er liggen **17 losse SQL-bestanden** in de project root:

```
supabase-migration-account-deletion-cascade.sql
supabase-migration-applications.sql
supabase-migration-blogs.sql
supabase-migration-drop-moderation-billing.sql
supabase-migration-firms-cc-emails.sql
supabase-migration-fix-firms-rls.sql
supabase-migration-fix-rls.sql
supabase-migration-fix-trigger.sql
supabase-migration-geo.sql
supabase-migration-invitations.sql
supabase-migration-job-expires-at.sql
supabase-migration-job-views.sql
supabase-migration-linkedin-id.sql
supabase-migration-moderation-billing.sql
supabase-migration-public-read-policies.sql
supabase-migration-rechtsgebieden-rename.sql
supabase-migration-single-admin.sql
```

De officiële `supabase/` map bevat alleen `supabase/schema.sql` — geen `migrations/` map, geen `config.toml`.

**Impact:**
- Migraties zijn niet reproduceerbaar via `supabase db push` of `supabase migration up`
- Geen volgorde-garantie (geen timestamps in bestandsnamen)
- Onmogelijk te bepalen welke migraties al zijn uitgevoerd
- Nieuwe developers kunnen de database niet lokaal opzetten
- Rollbacks zijn onmogelijk

**Aanbeveling:**
1. Initialiseer Supabase CLI: `npx supabase init`
2. Verplaats migraties naar `supabase/migrations/` met timestamp-prefixen:
   ```
   supabase/migrations/
   ├── 20250101000000_initial_schema.sql
   ├── 20250115000000_applications.sql
   ├── 20250120000000_blogs.sql
   └── ...
   ```
3. Voeg `supabase/config.toml` toe voor lokale development
4. Documenteer de migratievolgorde

---

### CQ-03 — Geen TypeScript strict mode (MEDIUM)

**Probleem:** Veelvuldig gebruik van `as` type assertions en `!` non-null assertions:
- `process.env.NEXT_PUBLIC_SUPABASE_URL!` (middleware.ts:44)
- `user!.id` (middleware.ts:94)
- Diverse `as string` casts op form data

**Impact:** Runtime errors die TypeScript had kunnen vangen worden gemist.

**Aanbeveling:** Controleer `tsconfig.json` op strict mode settings en vermijd `!` assertions waar een `if`-check volstaat.

---

### CQ-04 — Dubbele rate limiting implementaties (MEDIUM)

**Bestanden:**
- `middleware.ts:4-24` — In-memory `Map()`-gebaseerde rate limiter
- `src/lib/security/rate-limit.ts` — Upstash Redis-gebaseerde rate limiter

**Probleem:** Twee verschillende rate limiting systemen die naast elkaar bestaan. De middleware-versie is onbetrouwbaar op serverless (zie SEC-05), de Upstash-versie is degelijk maar wordt alleen per-route aangeroepen.

**Aanbeveling:** Kies één systeem (Upstash) en verwijder de in-memory variant.

---

### CQ-05 — Email templates als inline HTML strings (MEDIUM)

**Bestand:** `src/app/api/apply/route.ts:16-123`

**Probleem:** Email templates zijn ~100 regels inline template literals met string interpolation. Geen escaping van user input in de HTML-context.

**Impact:**
- HTML injection in emails (bijv. via `firstName` of `motivation` velden)
- Moeilijk te onderhouden
- Niet testbaar

**Aanbeveling:**
1. Gebruik een email template library (bijv. `@react-email/components`)
2. Escape user input: `htmlEncode(firstName)`
3. Verplaats templates naar aparte bestanden

---

### CQ-06 — Geen CI/CD pipeline configuratie (MEDIUM)

**Probleem:** Geen `.github/workflows/`, geen `vercel.json` met build checks, geen Husky/lint-staged.

**Impact:** Geen geautomatiseerde checks bij pull requests — linting, type checking, en (toekomstige) tests worden niet afgedwongen.

**Aanbeveling:**
```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run lint
      - run: npx tsc --noEmit
      - run: npm test
```

---

### CQ-07 — `console.error` als enige error handling (LAAG)

**Probleem:** Fouten worden overal afgevangen met `console.error` en dan doorgegaan of een generieke foutmelding teruggegeven. Er is geen:
- Gecentraliseerde error tracking (Sentry, LogRocket)
- Error boundary componenten
- Structured logging

**Aanbeveling:** Installeer Sentry of vergelijkbaar:
```bash
npx @sentry/wizard@latest -i nextjs
```

---

### CQ-08 — Inconsistente code organisatie (LAAG)

**Probleem:**
- SQL-bestanden in de root naast `package.json`
- `supabase/schema.sql` vs. losse `supabase-migration-*.sql` bestanden
- Sommige utilities in `src/lib/`, andere logica direct in route handlers
- Geen duidelijke scheiding tussen business logic en route handlers

**Aanbeveling:** Overweeg een structuur als:
```
src/
├── app/          # Routes (thin controllers)
├── lib/          # Shared utilities
├── services/     # Business logic
├── types/        # TypeScript types
└── components/   # UI componenten
supabase/
├── migrations/   # Geordende SQL migraties
├── schema.sql    # Huidige schema snapshot
└── config.toml   # Supabase CLI config
```

---

### CQ-09 — Geen `.env.local` in `.env.example` instructies (LAAG)

**Bestand:** `.env.example`

**Probleem:** Het bestand instrueert om naar `.env.local` te kopiëren, maar de `.gitignore` excludeert `.env*` — er is een risico dat iemand `.env` (zonder `.local`) aanmaakt en dat bestand niet expliciet is uitgesloten tenzij de glob-match correct werkt.

**Status:** De `.gitignore` pattern `.env*` dekt dit correct af. `.env` is momenteel niet gecommit in git. **Geen actie nodig**, maar verduidelijk de instructie.

---

## 3. Positieve observaties

De codebase doet het volgende goed:

| Aspect | Implementatie |
|--------|--------------|
| **RLS policies** | Alle tabellen hebben Row Level Security policies |
| **Auth middleware** | Supabase session refresh op elk request |
| **Admin guard** | Role-check in middleware + per-route verificatie |
| **Rate limiting** | Upstash Redis sliding window (naast de in-memory variant) |
| **Input validatie** | Zod schemas en handmatige validatie op API routes |
| **reCAPTCHA** | v3 op sollicitatieformulieren |
| **LinkedIn URL sanitization** | Dedicated sanitize/validate functies |
| **Account deletion** | Correcte cascade via FK constraints |
| **Cookie security** | Supabase SSR met httpOnly cookies |
| **Impersonatie verificatie** | Admin role wordt elke request opnieuw gecheckt |

---

## 4. Prioriteiten roadmap

### Week 1 — Kritisch
- [ ] SEC-01: Installeer DOMPurify, sanitize alle `dangerouslySetInnerHTML`
- [ ] SEC-02: Valideer file uploads op magic bytes
- [ ] SEC-03: Voeg security headers toe aan `next.config.ts`

### Week 2 — Hoog
- [ ] SEC-04: Implementeer audit logging voor impersonatie
- [ ] CQ-01: Stel Vitest op, schrijf eerste tests voor `/api/apply`
- [ ] CQ-02: Migreer SQL-bestanden naar `supabase/migrations/`

### Week 3-4 — Medium
- [ ] SEC-05: Verwijder in-memory rate limiter uit middleware
- [ ] SEC-08: Mask persoonsgegevens in logs
- [ ] SEC-09: Implementeer CSRF-bescherming of Origin-header check
- [ ] CQ-05: Verplaats email templates naar aparte componenten
- [ ] CQ-06: Stel CI/CD pipeline op

### Ongoing
- [ ] CQ-07: Integreer error tracking (Sentry)
- [ ] CQ-01: Breid testdekking uit (E2E met Playwright)
- [ ] SEC-07: Harden CORS-configuratie

---

*Rapport gegenereerd op 15 mei 2026 door Wiex Agency security audit tooling.*
