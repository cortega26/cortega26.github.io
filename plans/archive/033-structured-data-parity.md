# Plan 033: Structured-data parity (shared helpers, work-page schema, root schema)

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 2a10c13..HEAD -- src/data/jsonld.ts src/pages/en/index.astro src/pages/es/index.astro src/pages/en/work/index.astro src/pages/es/trabajo/index.astro src/pages/index.astro src/data/caseStudies.ts tests/run.js`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition. ALSO confirm Plans 025 and 029 are
> DONE — this plan consumes the route registry and the case-study records.

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: LOW–MED (JSON-LD is asserted by existing tests)
- **Depends on**: Plan 025 (routes), Plan 029 (`caseStudies.ts`)
- **Category**: SEO / structured data
- **Planned at**: commit `2a10c13`, 2026-09-23
- **Audit finding(s)**: H-11 (primary), H-05 (root schema, shared with Plan 031)

## Why this matters

Structured data coverage is uneven: the two home pages carry
`Person`/`ProfessionalService`, an `ItemList` of 10 projects, and a
`BreadcrumbList`; the service pages carry `Service` + `FAQPage` +
`BreadcrumbList` + `OfferCatalog`; but the work pages carry none, and the
root (after Plan 031) carries `WebSite` + `Organization` written inline. The
same project list is duplicated in EN and ES home frontmatter, so it can
drift from `caseStudies.ts`. The audit asks for brand schema on the root,
a coherent collection schema on work, and only visible/verifiable entities.
This plan creates one helper module and makes home, work, and root consume
it.

## Current state (verified 2026-09-23, commit `2a10c13`)

- `src/pages/en/index.astro` (115 lines) and `src/pages/es/index.astro`
  (114 lines): inline `jsonLd` (`Person` + `ProfessionalService`, with
  `makesOffer` for the six services), `portfolioJsonLd` (`ItemList`,
  `numberOfItems: 10`, hardcoded `itemListElement`), `breadcrumbJsonLd`.
- `src/pages/en/work/index.astro` / `src/pages/es/trabajo/index.astro`:
  no `<Fragment slot="head">`, no JSON-LD.
- `src/pages/index.astro`: Plan 031 adds inline `WebSite` + `Organization`.
- `tests/run.js` `I8b` asserts on `dist/en/index.html`: a JSON-LD block whose
  `@type` array includes `Person`, that it has a `makesOffer` array and no
  `itemListElement`; and an `ItemList` block with exactly 10
  `itemListElement` entries. `I8` asserts the EN page mentions
  `itemListElement`/`makesOffer`/`SoftwareApplication`. Plan 031 adds an
  `H-05` assertion for root `WebSite`/`Organization`.
- Plan 029 exports `casesByLocale` from `src/data/caseStudies.ts` with the
  extended `Project` interface (including `group`, `role`, `serviceHref`).
- Plan 025 exports `SITE_ORIGIN` and the route registry from
  `src/data/routes.ts`.
- `@astrojs/sitemap` and the site are static; JSON-LD is inline
  `is:inline` in page heads.

## Commands you will need

| Purpose | Command | Provenance | Expected on success |
|---------|---------|------------|---------------------|
| Typecheck | `npm run check` | declared | exit 0 |
| Source tests | `node tests/run.js` | executed | exit 0 |
| Build | `npm run build` | declared | exit 0 |
| Built tests | `node tests/run.js --built` | declared | exit 0 |

## Scope

**In scope** (the only files you should create/modify):
- CREATE `src/data/jsonld.ts` — typed builders:
  `buildProfessionalService`, `buildPortfolioItemList`, `buildBreadcrumb`,
  `buildWorkCollection`, `buildWebSite`, `buildOrganization`
- `src/pages/en/index.astro` + `src/pages/es/index.astro` — consume the
  builders; output must stay semantically identical (tests `I8`/`I8b` lock it)
- `src/pages/en/work/index.astro` + `src/pages/es/trabajo/index.astro` — add
  `CollectionPage` + `BreadcrumbList` + `ItemList`
- `src/pages/index.astro` — replace Plan 031's inline blocks with the builders
- `tests/run.js` — append one `H-11` group

**Out of scope** (do NOT touch):
- Service-page JSON-LD (`ServicePage.astro`) — already compliant
- `caseStudies.ts` content, `PortfolioSection.astro` markup
- Any schema entity without visible page content (e.g. do not add ratings,
  prices, or awards)
- The generic 404 routes (decision recorded, no code change)

## Git workflow

- Branch: `advisor/033-structured-data-parity`
- Conventional commit, e.g. `refactor(seo): single-source JSON-LD builders for home, work, and root`
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 0: Baseline

1. `node tests/run.js` → green; record counts.
2. `npm run build && node tests/run.js --built` → green baseline (this locks
   the current home JSON-LD).
3. Confirm Plans 025 and 029 are DONE; if not, STOP.

**Verify**: green baseline; 025 + 029 DONE.

### Step 1: Builders

Create `src/data/jsonld.ts` (strictest TS, no `any`):
- `buildPortfolioItemList(lang, cases)` — 10 items derived from
  `casesByLocale[lang]`; keep the current `SoftwareApplication`/`WebSite`
  typing and `numberOfItems` derived from the array length.
- `buildWorkCollection(lang, cases)` — `CollectionPage` with
  `name`, `url` (from the route registry), `inLanguage`,
  `isPartOf` WebSite, and `mainEntity: buildPortfolioItemList(...)`.
- `buildBreadcrumb(lang, crumbs)` — generic `BreadcrumbList`.
- `buildWebSite()`, `buildOrganization()` — root brand schema with `sameAs`
  GitHub + LinkedIn and `inLanguage: ['en','es']`.
- `buildProfessionalService(lang)` — the current `Person` +
  `ProfessionalService` shape, with `makesOffer` built from
  `service-registry.json` (public_name + localized route) so the six offers
  cannot drift from the registry.

**Verify**: `npm run check` → exit 0.

### Step 2: Wire the pages

1. Home EN/ES: replace the three inline objects with the builders. **Output
   must remain semantically identical** — `I8b` asserts Person/makesOffer/
   ItemList(10). Run `node tests/run.js --built` immediately after this
   sub-step and fix any mismatch before continuing.
2. Work EN/ES: add a `<Fragment slot="head">` with `buildWorkCollection` +
   `buildBreadcrumb` (`Tooltician → Work`). Only include projects rendered on
   the page (all 10).
3. Root: replace Plan 031's inline `WebSite`/`Organization` with the builders.

**Verify**: `npm run build && node tests/run.js --built` → green.

### Step 3: Test group `H-11`

Append to `tests/run.js` (built, skip without dist):
- `dist/en/work/index.html` and `dist/es/trabajo/index.html`: parseable
  JSON-LD containing `CollectionPage`, `BreadcrumbList`, and an `ItemList`
  with 10 entries; the ItemList names equal the page's `h3.project-title`
  texts (parity check, same locale).
- `dist/index.html`: `WebSite` and `Organization` blocks present and
  parseable (also asserted by `H-05`; keep this one focused on the builder
  shape: `sameAs` non-empty, `inLanguage` includes both locales).
- `dist/en/index.html`: unchanged assertions (`I8b`) still pass — do not
  duplicate them, just ensure ordering doesn't break.
- Document the generic-routes decision in a comment above the group:
  `/pricing`, `/docs`, `/login`, `/demo` stay 404 and out of the sitemap
  (Plan 024 decision) — no assertion needed.

**Verify**: `node tests/run.js --built` → exit 0.

## Test plan

- `H-11` + existing `I8`/`I8b` + full suite. Negative control: temporarily
  change one project name in the ItemList builder, rebuild, confirm the
  parity assertion fails, restore.

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `src/data/jsonld.ts` is the only JSON-LD source for home, work, and root
- [ ] Home output semantically unchanged (`I8b` green)
- [ ] Work pages carry `CollectionPage` + `BreadcrumbList` + `ItemList(10)`
      with names matching the rendered H3s
- [ ] Root carries `WebSite` + `Organization`
- [ ] No schema entity exists without visible page content
- [ ] `npm run check`, `node tests/run.js`, `node tests/run.js --built`,
      `node test-htw-snapshot.mjs`, `node test-behavioral.mjs` all green
- [ ] `git diff --name-only 2a10c13...HEAD` lists only in-scope files
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- Plans 025 or 029 are not DONE.
- The home JSON-LD output changes in a way `I8b` rejects (compare the built
  block before/after; do not edit the test to accommodate a regression).
- A builder would need a value not present in `caseStudies.ts` or the
  registry (report; do not hardcode a second list).
- A step's verification fails twice after a reasonable fix attempt.

## Maintenance notes

For the human/agent who owns this code after the change lands:

- New schema must come from a builder; inline JSON-LD objects in pages are
  the drift vector this plan removes.
- The ItemList is derived from `caseStudies.ts` — adding a project updates
  home and work automatically; the `H-11` parity check keeps the names honest.
- If a future audit asks for `FAQPage`/`Article` on the work page, extend the
  builders rather than pasting new objects.
