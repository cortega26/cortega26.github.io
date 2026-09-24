# Plan 048: Single-source service display names (registry) and verify the llms corpus

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat be975ef..HEAD -- src/data/service-registry.json src/data/services.ts src/components/ServicesSection.astro src/components/ServicePage.astro public/llms.txt public/llms-full.txt tests/run.js`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: LOW
- **Depends on**: none
- **Category**: tech-debt
- **Planned at**: commit `be975ef`, 2026-09-23

## Why this matters

Service display names exist in four places and have drifted:

| Service | Registry (canonical) | `services.ts` `serviceName` | `llms.txt` heading |
|---|---|---|---|
| automation | Python Automation & Data Pipelines | same | **Python Automation & ETL Pipelines** |
| financial (EN) | Financial & Audit Systems | **Financial & Audit Tooling** | **Financial Tooling & Reconciliation** |
| financial (ES) | Sistemas Financieros y de Auditoría | **Herramientas Financieras y de Auditoría** | — |
| web (EN) | Static Sites & Focused Front Ends | **Static Sites & Front Ends** | **Static Sites & Front Ends** |
| web (ES) | Sitios Estáticos y Frontends Acotados | **Sitios Web y Frontends** | — |
| htw | Web Technical Hygiene | (bespoke pages) | **Web Technical Hygiene & Hardening** |

Consequences: the home page's JSON-LD `Offer.name` (registry-driven) differs
from the service page's `Service.name` (services.ts) for financial and web;
`ServicesSection.serviceResults` is keyed by the *title string*, so editing
a card title silently drops the "Deliverable" line; `ServicePage.astro`
carries a third copy of the `service_id → service_category` map that no
test covers (the registry↔client map is parity-tested, this one is not);
and the published `llms.txt` corpus advertises different names than the
site.

The registry's own note (`service-registry.json:4`) declares it canonical:
"public_name is the EN display name; public_name_es mirrors the ES display
names used by ServicesSection and the root landing."

## Current state (verified at `be975ef`)

`src/data/service-registry.json` (canonical values):

```json
      "service_id": "financial",
      "public_name": "Financial & Audit Systems",
      "public_name_es": "Sistemas Financieros y de Auditoría",
...
      "service_id": "web",
      "public_name": "Static Sites & Focused Front Ends",
      "public_name_es": "Sitios Estáticos y Frontends Acotados",
```

`src/data/services.ts` divergent values:
- `:1134` `serviceName: 'Financial & Audit Tooling'`
- `:1345` `serviceName: 'Herramientas Financieras y de Auditoría'`
- `:1563` `serviceName: 'Static Sites & Front Ends'`
- `:1774` `serviceName: 'Sitios Web y Frontends'`

`src/components/ServicesSection.astro`:
- Card titles (`:22-27`, `:54-59`) already match the registry.
- `serviceResults` (`:84-98`) is keyed by title strings and looked up as
  `serviceResults[svc.title]` at `:117-119`.

`src/components/ServicePage.astro:44-53`:

```ts
// Sprint 0: stable service category per serviceKey (mirrors src/data/service-registry.json).
const serviceCategories: Record<string, string> = {
  automation: 'automation',
  'recurring-data': 'data-collection',
  ...
```

`public/llms.txt` headings: `:23` "Python Automation & ETL Pipelines",
`:35` "Web Technical Hygiene & Hardening", `:39` "Financial Tooling &
Reconciliation", `:43` "Static Sites & Front Ends". `public/llms-full.txt`
also restates service names (grep for the same strings).

## Commands you will need

| Purpose      | Command                        | Provenance | Expected on success |
|--------------|--------------------------------|------------|---------------------|
| Install      | `npm ci`                       | declared   | exit 0 |
| Build        | `npx --no-install astro build` | executed   | `[build] Complete!`, 30 pages |
| Typecheck    | `npm run check`                | executed   | `0 errors`, `0 warnings`, `0 hints` |
| Full tests   | `npm test`                     | executed   | exit 0 (218/218 src, 77/77 analytics, 247/247 built) |

Notes: fresh worktree → `npm ci`, then `npx --no-install astro build`
before `npm test`. Never `npm run build`.

## Scope

**In scope** (the only files you may modify):
- `src/data/services.ts` (four `serviceName` values only)
- `src/components/ServicesSection.astro`
- `src/components/ServicePage.astro` (the category map only)
- `public/llms.txt`, `public/llms-full.txt` (service-name strings only)
- `tests/run.js` (one new group)
- `plans/README.md` (status row only)

**Out of scope** (do NOT touch):
- `src/data/service-registry.json` — it is the canonical source; do not
  rename anything there.
- `src/data/pricing.ts`, `src/data/caseStudies.ts`, `src/data/routes.ts` —
  separate plans.
- Route slugs/URLs — never rename routes for display names.
- Copy bodies (descriptions, FAQs) — only names/headings change.

## Git workflow

- Branch: `advisor/048-service-names`
- Conventional commits, e.g. `refactor(services): single-source display names from the registry`.
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 0: Green baseline

`npm ci` → `npx --no-install astro build` → `npm run check` → `npm test`.

**Verify**: all green. If not, STOP and report.

### Step 1: Align `services.ts` names to the registry

Change exactly these four values (nothing else in `services.ts`):

- `financial.en.serviceName` → `'Financial & Audit Systems'`
- `financial.es.serviceName` → `'Sistemas Financieros y de Auditoría'`
- `web.en.serviceName` → `'Static Sites & Focused Front Ends'`
- `web.es.serviceName` → `'Sitios Estáticos y Frontends Acotados'`

**Verify**:

```bash
grep -c "serviceName: 'Financial & Audit Tooling'\|serviceName: 'Herramientas Financieras y de Auditoría'\|serviceName: 'Static Sites & Front Ends'\|serviceName: 'Sitios Web y Frontends'" src/data/services.ts
```

→ 0 (the old strings are gone).

### Step 2: Derive the ServicePage category from the registry

In `ServicePage.astro`, import the registry (same pattern as
`src/pages/index.astro:2`) and replace the hand map (`:44-53`) with:

```ts
import serviceRegistry from '../data/service-registry.json';
...
// Sprint 0: service category comes from the canonical registry.
const serviceCategory =
  serviceRegistry.services.find((service) => service.service_id === serviceKey)?.service_category ?? 'site';
```

**Verify**: `npm run check` → 0 errors; `grep -c "serviceCategories" src/components/ServicePage.astro` → 0.

### Step 3: Key `ServicesSection.serviceResults` by `serviceId` and derive card titles

In `ServicesSection.astro`:

1. Import the registry and add a display-name helper near the copy objects:

```ts
import serviceRegistry from '../data/service-registry.json';
const displayName = (id: string) => {
  const service = serviceRegistry.services.find((candidate) => candidate.service_id === id);
  return service ? (lang === 'en' ? service.public_name : service.public_name_es) : id;
};
```

2. Delete the `title:` field from all 12 card objects (6 EN + 6 ES) and
   replace every use of `svc.title` in the markup with
   `displayName(svc.serviceId)` — the card `<h3>` (`:113`), the
   `serviceResults` lookup (`:117-119`), and the visually-hidden CTA suffix
   (`:122`).
3. Re-key both `serviceResults` objects by registry `service_id`
   (`automation`, `recurring-data`, `internal-tools`, `financial`, `web`,
   `htw`) and look them up with `serviceResults[svc.serviceId]`.

**Verify**: `npm run check` → 0 errors; `npx --no-install astro build`, then
confirm the six card titles still render:

```bash
for n in "Python Automation & Data Pipelines" "Recurring Data Collection" "Internal Tools & APIs" "Financial & Audit Systems" "Static Sites & Focused Front Ends" "Web Technical Hygiene"; do
  printf '%s -> %s\n' "$n" "$(grep -c "$n" dist/en/index.html)"
done
```

All six must be ≥ 1.

### Step 4: Align the llms corpus names

In `public/llms.txt` and `public/llms-full.txt`, replace the divergent
headings/names with the registry values (leave prose and links intact):

- `Python Automation & ETL Pipelines` → `Python Automation & Data Pipelines`
- `Web Technical Hygiene & Hardening` → `Web Technical Hygiene`
- `Financial Tooling & Reconciliation` → `Financial & Audit Systems`
- `Static Sites & Front Ends` → `Static Sites & Focused Front Ends`

**Verify**:

```bash
grep -c "ETL Pipelines\|Hygiene & Hardening\|Tooling & Reconciliation\|Sites & Front Ends$" public/llms.txt public/llms-full.txt
```

→ 0 for every listed stale name (the exact grep pattern is indicative;
re-run with each string individually if needed).

### Step 5: Parity test

Add a group to `tests/run.js` (source-level string checks, matching the
suite's style) that fails when the drift returns:

- Parse `src/data/service-registry.json` with `JSON.parse(read(...))`.
- For each service, assert `public/llms.txt` contains `public_name` and
  both `route_en`/`route_es`.
- For the five services present in `services.ts`, assert
  `src/data/services.ts` contains `serviceName: '<public_name>'` and
  `serviceName: '<public_name_es>'`.
- Assert `src/components/ServicePage.astro` contains
  `service.service_id === serviceKey` (derived, not hand-mapped).
- Assert `src/components/ServicesSection.astro` contains
  `serviceResults[svc.serviceId]`.

**Verify**: `node tests/run.js` → all pass, count grows by the new
assertions.

### Step 6: Full gate

`npx --no-install astro build && npm run check && npm test`

**Verify**: exit 0; HTW snapshot `no diff`; `git status --short
src/data/github-stats.json` → empty.

## Test plan

- The new parity group (Step 5) is the regression test. It is string-based
  by design, consistent with the suite; `tests/analytics-service-funnel.mjs`
  already proves registry↔client parity for categories.
- Manual spot check (operator): the home JSON-LD `Offer.name` and the
  financial/web service pages' `Service.name` now match.

## Done criteria

ALL must hold:

- [ ] `npm run check` exits 0; `npm test` exits 0
- [ ] `grep -c "Financial & Audit Tooling\|Sitios Web y Frontends" src/data/services.ts` → 0
- [ ] `grep -c "ETL Pipelines\|Hygiene & Hardening\|Tooling & Reconciliation" public/llms.txt public/llms-full.txt` → 0
- [ ] `grep -c "serviceCategories" src/components/ServicePage.astro` → 0
- [ ] `git diff --name-only master...HEAD` lists only the in-scope files plus
      `plans/README.md`
- [ ] `plans/README.md` status row for 048 updated

## STOP conditions

Stop and report back (do not improvise) if:

- The drift check shows an in-scope file changed since `be975ef`.
- Any registry name is missing from `llms.txt` after Step 4 (report which).
- The HTW pages' `Service.name` ("Web Technical Hygiene & Digital Trust")
  appears in the parity failures — that bespoke name is intentionally
  longer; do not rename it, note it in your report instead.
- Anything appears to require touching an out-of-scope file.

## Maintenance notes

- The registry is the name authority. New services must be added there
  first; the parity test enforces the downstream copies.
- The HTW page's schema name is deliberately not registry-equal (SEO copy);
  the parity test covers the five componentized services only.
- **Deferred:** generating the llms service section from the registry —
  a generator would remove the manual step; the parity test is the cheap
  guard for now.
