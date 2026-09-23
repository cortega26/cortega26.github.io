# Plan 031: Root as a real bilingual x-default landing

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 2a10c13..HEAD -- src/pages/index.astro public/assets/js/root-language-redirect.js public/assets/js/root-language-picker.js tests/run.js`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition. ALSO confirm Plan 025 is DONE —
> this plan consumes `alternatesFor('home')`.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: MED (root is the entry point; CSP pins the inline GA4 stub)
- **Depends on**: Plan 025 (route registry)
- **Category**: SEO / conversion
- **Planned at**: commit `2a10c13`, 2026-09-23
- **Audit finding(s)**: H-05 (primary), H-11 (root schema, shared with Plan 033)

## Why this matters

`https://tooltician.com/` returns 200 with a minimal language gateway: H1
`English / Español`, no H2, no JSON-LD, no proof, no CTA, a `<noscript>` meta
refresh, and a first-visit JS auto-redirect. It is the `x-default` target for
every hreflang group on the site, so both users and crawlers can land there
with almost no commercial context. The maintainer decision (Plan 024) is a
real bilingual x-default landing: the root keeps the language choice, adds a
micro-proposition, external proof, service links, and CTAs, and stops
auto-redirecting first-time visitors away from it.

## Current state (verified 2026-09-23, commit `2a10c13`)

- `src/pages/index.astro` (300 lines) is standalone: own `<style>`, gateway
  panel, `<h1>English / Español</h1>`, two language cards with
  `data-language-preference` / `data-language-select`, footer note, and:
  - `<noscript><meta http-equiv="refresh" content="0; url=/en/"></noscript>`
    (line 16),
  - `<script is:inline src="/assets/js/root-language-redirect.js">` (line 42),
  - `root-language-picker.js`, `track.js`, `product-analytics.js`,
  - the GA4 inline stub + async gtag (lines 287-298), **byte-identical to
    `BaseLayout.astro`'s stub** — `scripts/check-csp-hashes.mjs` extracts the
    first `window.dataLayer` inline stub from `dist/index.html` and
    `dist/en/index.html` and compares it to pinned hashes.
- `public/assets/js/root-language-redirect.js`: if a stored preference exists
  → redirect; else on the **first visit** auto-redirects by
  `navigator.languages` and sets a one-time flag.
- `public/assets/js/root-language-picker.js`: stores the chosen language in
  `localStorage` (`tooltician-language`) and lets the default navigation
  proceed.
- `tests/run.js`:
  - `I4` asserts `src/pages/index.astro` contains `http-equiv` + `refresh`
    — this assertion must be updated by this plan.
  - `S0` asserts the gateway loads `/assets/js/product-analytics.js` and
    contains `data-language-select` — keep both true.
  - `I8b` reads `dist/en/index.html` for JSON-LD; it does not cover the root.
- Plan 025 provides `alternatesFor('home')` (en=/en/, es=/es/, x-default=/)
  and keeps the root's canonical `/`.

## Commands you will need

| Purpose | Command | Provenance | Expected on success |
|---------|---------|------------|---------------------|
| Typecheck | `npm run check` | declared | exit 0 |
| Source tests | `node tests/run.js` | executed | exit 0 |
| Build | `npm run build` | declared | exit 0 |
| Built tests | `node tests/run.js --built` | declared | exit 0 |
| CSP hashes | `npm run build && node scripts/check-csp-hashes.mjs` | declared | MATCH both pages |

## Scope

**In scope** (the only files you should create/modify):
- `src/pages/index.astro` — landing content, schema, CTAs, head links
- `public/assets/js/root-language-redirect.js` — stored-preference redirect
  only (no browser-language auto-redirect)
- `tests/run.js` — update `I4`; append one `H-05` group
- `src/styles/global.css` — only if the landing reuses global classes

**Out of scope** (do NOT touch):
- `BaseLayout.astro` head wiring (Plan 025 owns alternates)
- `product-analytics.js`, `track.js`, `root-language-picker.js` (keep working)
- Work/service/guide pages
- JSON-LD helper extraction — Plan 033 centralizes it; this plan may write the
  root block inline in the current page style

## Git workflow

- Branch: `advisor/031-root-x-default-landing`
- Conventional commit, e.g. `feat(seo): make the root a bilingual x-default landing`
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 0: Baseline

1. `node tests/run.js` → green; record counts.
2. `npm run build && node tests/run.js --built && node scripts/check-csp-hashes.mjs` → green + MATCH baseline.
3. Confirm Plan 025 is DONE; if not, STOP.

**Verify**: green baseline; 025 DONE; CSP MATCH.

### Step 1: Retire the auto-redirect

`public/assets/js/root-language-redirect.js`:
1. Keep the stored-preference redirect (`tooltician-language`).
2. Delete the first-visit browser-language branch and the
   `tooltician-language-autoredirect` flag.
3. Update the file comment to state the policy: the root is a landing; only
   returning users with a stored preference are forwarded.
4. Keep the try/catch fallback (gateway stays usable when storage is blocked).

**Verify**: `node --check public/assets/js/root-language-redirect.js` → exit 0;
`grep -n "navigator.languages" public/assets/js/root-language-redirect.js` → 0 hits.

### Step 2: Landing content

Rewrite the body of `src/pages/index.astro` (keep it standalone and keep the
existing visual language):

1. **Head**: keep canonical `/`, `index,follow`, og/twitter tags, and replace
   the three hardcoded alternate links with `alternatesFor('home')` (absolute
   URLs from Plan 025). Remove the `<noscript>` meta refresh.
2. **H1** (single): bilingual, e.g.
   `Reliable operational systems — Sistemas operativos confiables`.
3. **Micro-proposition**: one short paragraph per language, each with a link
   to its locale (`/en/`, `/es/`) — reuse the existing language-card copy
   (`Proof, production work, and a direct project brief.` etc.).
4. **Proof strip**: external, verifiable links only — elrincondeebano.com,
   monedario.cl, bankrecon on PyPI, chile-hub on GitHub (same set the home
   hero uses).
5. **Services**: a compact two-column list of the six services, EN column
   linking to `/en/services/...`, ES column to `/es/servicios/...`. Source the
   names from `src/data/service-registry.json` (`public_name` + routes) plus
   the ES display names already used in `ServicesSection.astro`; do not
   hardcode a third copy of the names.
6. **CTAs**: `Send a written brief` → `/en/#contact`, `Enviar brief` →
   `/es/#contact`; keep the two language cards (`data-language-select`) as the
   primary choice.
7. **Keep**: `root-language-picker.js`, `track.js`, `product-analytics.js`,
   the GA4 stub and async gtag **byte-identical**, `data-language-select`,
   and the language cards' hrefs.
8. **JSON-LD** (inline, current style): `WebSite` (url `/`, name Tooltician,
   `inLanguage: ['en','es']`) + `Organization` (name Tooltician, url,
   `sameAs` GitHub + LinkedIn, `founder` Person Carlos Ortega Gonzalez).
   Plan 033 will move this to a shared helper — keep the shape conventional.

**Verify**: `npm run check` → exit 0.

### Step 3: Tests

1. Update `I4` in `tests/run.js`: assert the root page has **no**
   `http-equiv="refresh"` and contains the landing markers (H1 + at least two
   locale CTAs).
2. Append `H-05` (built, skip without dist):
   - `dist/index.html` has exactly one `<h1`, ≥2 `href="/en/#contact"` /
     `href="/es/#contact"` CTAs, and parses as valid JSON-LD with `WebSite`
     and `Organization` blocks;
   - alternates in `dist/index.html` are `en=/en/`, `es=/es/`, `x-default=/`;
   - `dist/index.html` does not contain `http-equiv="refresh"`.
3. `node scripts/check-csp-hashes.mjs` must still print MATCH (the GA4 stub
   is untouched). If it does not, revert the stub change — never re-pin a hash
   as part of this plan.

**Verify**: `npm run build && node tests/run.js --built && node scripts/check-csp-hashes.mjs`
→ exit 0 + MATCH.

## Test plan

- Updated `I4` + `H-05` + `S0` (must stay green) + CSP check + full suite.
- Manual: load `/` with cleared storage — it must stay on the landing; choose
  a language; revisit `/` — it must forward to the stored preference.

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `/` renders a bilingual landing with H1, proof, services, CTAs, and
      WebSite/Organization JSON-LD
- [ ] First-visit auto-redirect removed; stored-preference redirect works
- [ ] `dist/index.html` alternates: `en=/en/`, `es=/es/`, `x-default=/`
- [ ] `scripts/check-csp-hashes.mjs` → MATCH (GA4 stub untouched)
- [ ] `npm run check`, `node tests/run.js`, `node tests/run.js --built`,
      `node test-htw-snapshot.mjs`, `node test-behavioral.mjs` all green
- [ ] `git diff --name-only 2a10c13...HEAD` lists only in-scope files
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- Plan 025 is not DONE.
- The GA4 stub hash changes (CSP MATCH fails) — restore the stub exactly.
- Service names cannot be sourced from the registry without duplicating them
  (report; do not create a third list).
- The landing cannot be built standalone without breaking `root-language-picker.js`
  (report the dependency; do not migrate to `BaseLayout` in this plan).
- A step's verification fails twice after a reasonable fix attempt.

## Maintenance notes

For the human/agent who owns this code after the change lands:

- The root is now the `x-default` target for every hreflang group: keep it
  bilingual, commercial, and free of auto-redirects.
- Never edit the inline GA4 stub without re-pinning the CSP hashes and
  updating `docs/cloudflare-security-headers.md` (operator step).
- Plan 033 replaces the inline JSON-LD with the shared helper; keep the
  `WebSite` + `Organization` semantics when it does.
- Plan 032 links the guides hub from the ES surfaces; if the root should link
  the hub too, add it in 032, not here.
