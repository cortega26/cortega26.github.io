# Plan 057: Derive service-page canonical and cross-locale links from the route registry

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat be975ef..HEAD -- src/pages/en/services src/pages/es/servicios src/components/ServicesSection.astro tests/run.js`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P2
- **Effort**: M
- **Risk**: MED (canonical/hreflang are SEO-critical; the sitemap test is the net)
- **Depends on**: none
- **Category**: tech-debt
- **Planned at**: commit `be975ef`, 2026-09-23

## Why this matters

`src/data/routes.ts:1-8` declares itself the single source of truth —
"Never hardcode an alternate set anywhere else" — yet every service page
re-types its canonical and cross-locale URL, and `ServicesSection` re-types
18 hrefs. A slug rename or a new service is a lockstep edit across ~13
files, and a missed copy ships a 404 (the language-switch `crossLocaleHref`
is not covered by the sitemap test, which checks canonical ↔ registry
only). Deriving these values makes renames one-line changes.

## Current state (verified at `be975ef`)

Thin pages — e.g. `src/pages/en/services/financial-tooling/index.astro:7-10`:

```astro
const def = services['financial-tooling'];
const canonical = 'https://tooltician.com/en/services/financial-tooling/';
const crossLocaleHref = '/es/servicios/herramientas-financieras/';
const alternates = alternatesFor('service:' + def.serviceKey);
```

All ten thin pages follow this shape (`:8` canonical, `:9` cross-locale).
The two HTW pages hardcode canonical too
(`en/…/web-technical-hygiene/index.astro:10`,
`es/…/higiene-tecnica-web/index.astro:10`).

`src/components/ServicesSection.astro` — 18 hardcoded service hrefs in the
card objects (`:22-27`, `:54-59`), the `shapes` arrays (`:39-43`,
`:71-75`), and `termsHref` (`:20`, `:77`).

`routes.ts:33-56` already defines every service group with `paths.en`,
`paths.es`; `routeGroup(id)` throws on unknown ids.

## Commands you will need

| Purpose       | Command                                   | Provenance | Expected on success |
|---------------|-------------------------------------------|------------|---------------------|
| Install       | `npm ci`                                  | declared   | exit 0 |
| Build         | `npx --no-install astro build`            | executed   | `[build] Complete!`, 30 pages |
| Sitemap check | `node tests/sitemap-i18n.mjs`             | executed   | `PASS: registry, sitemap, and HTML hreflang are consistent.` |
| Link check    | `node scripts/check-links-seo.js`         | executed   | `0/0/0` internal issues |
| Full tests    | `npm test`                                | executed   | exit 0 |

## Scope

**In scope**:
- The 10 thin service pages under `src/pages/en/services/*/index.astro` and
  `src/pages/es/servicios/*/index.astro`
- The 2 HTW pages (`src/pages/en/services/web-technical-hygiene/index.astro`,
  `src/pages/es/servicios/higiene-tecnica-web/index.astro`) — canonical
  only; do not touch their bespoke content
- `src/components/ServicesSection.astro` (hrefs/termsHref only)
- `tests/run.js` (one new group)
- `plans/README.md` (status row only)

**Out of scope**:
- `src/data/caseStudies.ts` — its `serviceHref` literals stay (the file
  must remain Node-importable for plan 053; the invariant test guards
  them). Do not add imports to it.
- `public/llms*.txt` routes — covered by plan 048's parity test.
- Route slugs themselves — never rename routes in this plan.

## Git workflow

- Branch: `advisor/057-routes-single-source`
- Conventional commits, e.g. `refactor(routes): derive service-page canonical and cross-locale links`.
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 0: Green baseline

`npm ci` → `npx --no-install astro build` → `node tests/sitemap-i18n.mjs` →
`node scripts/check-links-seo.js` → `npm test`.

**Verify**: sitemap `PASS`, links `0/0/0`, full suite green. If not, STOP.

### Step 1: Derive canonical and cross-locale on the ten thin pages

For each EN page (e.g. `en/services/financial-tooling/index.astro`):

```astro
import { alternatesFor, routeGroup } from '../../../../data/routes';
...
const def = services['financial-tooling'];
const group = routeGroup('service:' + def.serviceKey);
const canonical = `https://tooltician.com${group.paths.en}`;
const crossLocaleHref = group.paths.es ?? '/es/';
```

For each ES page:

```astro
const group = routeGroup('service:' + def.serviceKey);
const canonical = `https://tooltician.com${group.paths.es}`;
const crossLocaleHref = group.paths.en ?? '/en/';
```

**Verify**: `grep -rn "const canonical = 'https://tooltician.com" src/pages/en/services src/pages/es/servicios`
→ no matches; `npm run check` → 0 errors.

### Step 2: Derive canonical on the two HTW pages

Same pattern with `routeGroup('service:htw')` (the pages already import
from `routes` for alternates — extend the import). Do not change their
bespoke JSON-LD, copy, or layout; only the `canonical` constant changes
(and `crossLocaleHref`/`switchHref` if hardcoded — derive it from
`group.paths` when present).

**Verify**: `npm run check` → 0 errors.

### Step 3: Derive the ServicesSection hrefs from the registry

In `ServicesSection.astro`:

1. Import the registry and add a helper before the copy objects:

```ts
import serviceRegistry from '../data/service-registry.json';
import { routeGroup } from '../data/routes';
const serviceHref = (id: string) =>
  serviceRegistry.services.find((s) => s.service_id === id)?.[lang === 'en' ? 'route_en' : 'route_es'] ?? '/';
```

2. Replace every hardcoded service href in the card objects, the `shapes`
   arrays, and `termsHref`:
   - cards: `href: serviceHref(svc.serviceId)` — but the objects are
     literal, so use `href: serviceHref('automation')` etc. per card (the
     `serviceId` is already in the object; keep both consistent).
   - shapes: `href: serviceHref('automation')` and the `#plans` variant
     `serviceHref('automation') + '#plans'`.
   - `termsHref: routeGroup('doc:engagement').paths[lang] ?? '/'`.

**Verify**: `grep -c "href: '/en/services/\|href: '/es/servicios/\|termsHref: '/" src/components/ServicesSection.astro`
→ 0; `npm run check` → 0 errors.

### Step 4: Source guard test

Add a group to `tests/run.js`:

- For each of the 12 service page files: the file contains
  `routeGroup('service:` and does not contain
  `const canonical = 'https://tooltician.com`.
- `ServicesSection.astro` contains no `href: '/en/services/` or
  `href: '/es/servicios/`.

**Verify**: `node tests/run.js` → all pass.

### Step 5: SEO safety net

```bash
npx --no-install astro build && node tests/sitemap-i18n.mjs && node scripts/check-links-seo.js
```

**Verify**: sitemap `PASS` (29 grouped pages); links `0/0/0`. Then spot
check the built language switch:

```bash
grep -o 'hreflang="es" href="[^"]*"' dist/en/services/financial-tooling/index.html | head -1
```

→ the ES URL for the financial service.

### Step 6: Full gate

`npm run check && npm test`

**Verify**: exit 0; HTW snapshot `no diff` (canonical changes do not alter
heading structure, but confirm).

## Test plan

- Source guards (Step 4) prevent re-hardcoding.
- `tests/sitemap-i18n.mjs` is the behavioral net for canonical/hreflang.
- Link checker verifies no 404s from the derived hrefs.
- No new browser tests.

## Done criteria

ALL must hold:

- [ ] `grep -rn "const canonical = 'https://tooltician.com" src/pages/en/services src/pages/es/servicios` → no matches
- [ ] `grep -c "href: '/en/services/\|href: '/es/servicios/" src/components/ServicesSection.astro` → 0
- [ ] `node tests/sitemap-i18n.mjs` → PASS; `node scripts/check-links-seo.js` → 0/0/0
- [ ] `npm run check` and `npm test` exit 0
- [ ] `git diff --name-only master...HEAD` lists only the in-scope files plus
      `plans/README.md`
- [ ] `plans/README.md` status row for 057 updated

## STOP conditions

Stop and report back (do not improvise) if:

- The drift check shows an in-scope file changed since `be975ef`.
- `routeGroup('service:' + def.serviceKey)` throws for any page (unknown
  group id — report the page and key).
- The sitemap check or link checker fails after the refactor.
- Anything appears to require touching an out-of-scope file.

## Maintenance notes

- New service pages must derive canonical/cross-locale from `routes.ts` and
  add a route group there first.
- `caseStudies.serviceHref` remains literal by design (Node importability);
  plan 053's invariant test keeps it valid.
- **Deferred:** generating `llms.txt` routes and `caseStudies` hrefs from
  the registry — covered by parity tests for now.
