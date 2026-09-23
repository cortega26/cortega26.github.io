# Plan 026: Staged pricing pattern (diagnostic / build / retainer)

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 2a10c13..HEAD -- src/data/pricing.ts src/data/services.ts src/components/ServicesSection.astro src/components/HeroSection.astro src/pages/es/servicios/higiene-tecnica-web/index.astro src/pages/en/services/web-technical-hygiene/index.astro tests/snapshots/`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: MED (copy changes across home, 6 services, and the HTW snapshot)
- **Depends on**: none
- **Category**: conversion / pricing clarity
- **Planned at**: commit `2a10c13`, 2026-09-23
- **Audit finding(s)**: H-04 (primary), H-07 (residual)

## Why this matters

Outside the pricing table, a bare amount reads as "the price of this
service". The Spanish home says `Automatización acotada desde 30 UF` while
the Python Automation page's CTA says `desde 3 UF` — two numbers for the
same service, one of them a diagnostic that is credited toward the build.
The audit's fix is a single visible pattern that names the stage of every
amount: **diagnostic → build → retainer**, in UF for Chile/LATAM and USD for
international delivery. That removes the ambiguity without changing any
actual price. (H-07's "no visible USD range" is stale — `/en/` already
shows `from $1,500` — but the same staging rule must hold in English.)

## Current state (verified 2026-09-23, commit `2a10c13`)

- `src/data/pricing.ts` (38 lines) is the numeric SSOT:
  - `pricing.automation.es` = `{ scoping: '3 UF', scoped: '30 UF', multi: '60 UF', retainer: '6 UF/mes' }`
  - `pricing.internalTools.es` = `3 / 35 / 70 / 6 UF`, `financial.es` = `4 / 45 / 90 / 8 UF`,
    `staticSites.es` = `2 / 25 / 50 / 3 UF`
  - `pricing.webHygiene.es` = `{ diagnostic: '1 UF', essentials: '7 UF', operational: '13 UF', integral: '15 UF', executiveUpgrade: '2 UF', retainer: '4 UF/mes' }`
  - EN mirrors in USD (`$290 / $1,500 / $3,200 / $290/mo`, etc.).
  - `engagementSummary` = `{ en: { automation: 'from $1,500', retainer: 'from $290 / month', webDiagnostic: 'from $69 diagnostic' }, es: { automation: 'desde 30 UF', retainer: 'desde 6 UF / mes', webDiagnostic: 'desde 1 UF diagnóstico' } }`.
- Consumers (grep-verified):
  - `src/components/ServicesSection.astro:2` imports `engagementSummary`;
    the shapes strip (lines ~37-43 / 69-75) renders
    `Automatización acotada — desde 30 UF — tarifa Chile / LATAM`.
  - `src/data/services.ts` — 55 pricing references across the 5 typed
    services: `ctaPrimary` (line 131 EN / 342 ES), `entryPrice`,
    `entryCaption`, `plansSubtitle`, `plans[].priceLabel`,
    `contactCardTitle`, FAQ answers. The ES first plan (line 431) uses
    `priceLabel: pricing.automation.es.scoping` → renders `3 UF` with no
    "Desde".
  - `src/pages/es/servicios/higiene-tecnica-web/index.astro` and
    `src/pages/en/services/web-technical-hygiene/index.astro` (bespoke,
    hand-built) use `pricing.webHygiene.*` for CTAs, commercial paths,
    plans, and FAQ.
  - `src/components/HeroSection.astro` only mentions currency policy
    (`International engagements are priced in USD…`) — no amounts.
- HTW characterization snapshot: `tests/snapshots/htw-{en,es}.json` captures
  heading text, link hrefs, form fields, and JSON-LD of the two HTW pages.
  Any HTW copy change fails `node test-htw-snapshot.mjs` until regenerated
  with `--update`.
- `tests/run.js` has no pricing-string assertions; `test-behavioral.mjs`
  reads budget `<option>` values dynamically (`budgetOptions`), so
  `IntakeForm` budget labels are safe to adjust but must stay in sync.

## Pattern to implement

Stage labels (single place, in `pricing.ts`):

| Stage | EN | ES |
|---|---|---|
| Entry diagnostic | `Diagnostic` | `Diagnóstico` |
| Scoped build | `Build` | `Construcción` |
| Optional upkeep | `Retainer` | `Retainer` |

Full line (service pages, aside, plans subtitle, home strip):

- EN: `Diagnostic from $290 · Build from $1,500 · Retainer from $290/mo`
- ES: `Diagnóstico desde 3 UF · Construcción desde 30 UF · Retainer opcional desde 6 UF/mes`

Compact line (home shapes chips, CTAs):

- EN: `Diagnostic $290 · Build $1,500`
- ES: `Diagnóstico 3 UF · Construcción 30 UF`

Rule: **no amount renders without its stage label**, on any surface, in
either language.

## Commands you will need

| Purpose | Command | Provenance | Expected on success |
|---------|---------|------------|---------------------|
| Typecheck | `npm run check` | declared | exit 0 |
| Source tests | `node tests/run.js` | executed | exit 0 |
| Build | `npm run build` | declared | exit 0 |
| Built tests | `node tests/run.js --built` | declared | exit 0 |
| HTW snapshot | `node test-htw-snapshot.mjs` | declared | exit 0 (after `--update` if copy changed) |

## Scope

**In scope** (the only files you should create/modify):
- `src/data/pricing.ts` — add `engagementStages`, `engagementLine`,
  `engagementCompact`; replace `engagementSummary` (update its single consumer)
- `src/data/services.ts` — `ctaPrimary`, `entryPrice`, `entryCaption`,
  `plansSubtitle`, `plans[].priceLabel`, `contactCardTitle` for the 5 typed
  services (both locales); FAQ amounts only where a stage label is missing
- `src/components/ServicesSection.astro` — shapes strip uses
  `engagementCompact`; keep the chip layout compact
- `src/pages/{es/servicios/higiene-tecnica-web,en/services/web-technical-hygiene}/index.astro`
  — apply stage labels to CTAs, commercial paths, plan prices, and FAQ amounts
- `tests/snapshots/htw-{en,es}.json` — regenerate only if HTW copy changed
- `tests/run.js` — append one `H-04` group (see Step 4)

**Out of scope** (do NOT touch):
- Any numeric value in `pricing.ts` (this is a labeling change, not a price change)
- `src/components/IntakeForm.astro` budget option strings unless a label
  would otherwise contradict the pattern (they already carry stage words:
  `Diagnostic (1 UF)` etc.)
- Guide articles, portfolio copy, JSON-LD shapes (Plan 033 owns schema text)
- The HTW pricing model itself (5 tiers) — only label the amounts

## Git workflow

- Branch: `advisor/026-pricing-pattern`
- Conventional commit, e.g. `fix(pricing): stage every amount as diagnostic/build/retainer`
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 0: Baseline

1. `npm ci` if needed. `node tests/run.js` → green; record counts.
2. `npm run build && node tests/run.js --built && node test-htw-snapshot.mjs` → green baseline.

**Verify**: green baseline recorded (HTW snapshot counts as baseline).

### Step 1: Formatter in `pricing.ts`

Add (strictest TS — narrow the union by `serviceKey`, do not index blindly):

```ts
export type PricingServiceKey =
  | 'automation' | 'internalTools' | 'financial' | 'staticSites' | 'webHygiene';

export interface EngagementStages {
  diagnostic: string; // '3 UF' | '$290'
  build: string;      // '30 UF' | '$1,500'
  retainer: string;   // '6 UF/mes' | '$290/mo'
}

export function engagementStages(lang: 'en' | 'es', key: PricingServiceKey): EngagementStages
export function engagementLine(lang: 'en' | 'es', key: PricingServiceKey): string
export function engagementCompact(lang: 'en' | 'es', key: PricingServiceKey): string
```

- `webHygiene` maps `diagnostic → diagnostic`, `build → essentials`,
  `retainer → retainer`; the other four map `scoping / scoped / retainer`.
- Remove `engagementSummary` and update `ServicesSection.astro` to
  `engagementCompact(lang, 'automation')` (and the retainer/web chips as
  appropriate — read the current shapes and keep four chips).
- Keep the strings template-built from `pricing` so numbers stay single-sourced.

**Verify**: `npm run check` → exit 0; `grep -rn "engagementSummary" src/` → 0 hits.

### Step 2: Apply to the six services

For each of the 5 typed services in `src/data/services.ts`:
- `ctaPrimary`: EN `Start with the diagnostic — from $290`; ES
  `Empezar con el diagnóstico — desde 3 UF` (keep the service-specific verb
  if it reads better, but the stage noun must be present).
- `entryPrice`: EN `Diagnostic from $290`; ES `Diagnóstico desde 3 UF`.
- `entryCaption`: add the remaining stages, e.g. ES `Se acredita a la
  construcción (desde 30 UF). Retainer opcional desde 6 UF/mes.`
- `plansSubtitle`: use `engagementLine(...)` where it currently spells out
  entry + build.
- `plans[].priceLabel`: ES diagnostic plan must read `Desde 3 UF` (today it
  is bare `3 UF`); build/multi/retainer already say `Desde`.
- `contactCardTitle`: `Diagnóstico de automatización — desde 3 UF`.
- FAQ answers: prefix any bare amount with its stage.

HTW pages: prefix commercial-path and plan amounts with their stage
(`Diagnóstico 1 UF`, `Implementación desde 7 UF`, `Retainer desde 4 UF/mes`);
the diagnostic is fixed-price, so `desde` is optional there — keep the
existing wording where it already names the stage.

**Verify**: `npm run build`; grep built pages:
```
grep -o 'Diagnóstico[^<]*' dist/es/servicios/automatizacion-python/index.html | head
grep -o 'Diagnostic[^<]*' dist/en/services/python-automation/index.html | head
```
Both must show the stage noun next to the amount.

### Step 3: HTW snapshot

If any HTW copy changed, rebuild and regenerate:
`node test-htw-snapshot.mjs --update`, then inspect the diff (`git diff tests/snapshots/`)
and confirm every changed heading/link is an intended stage label. Commit
the snapshot in the same change.

**Verify**: `node test-htw-snapshot.mjs` → exit 0 with the new baseline.

### Step 4: Test group `H-04`

Append a group to `tests/run.js` (built section, only meaningful with
`--built`; follow the `I8b` skip pattern when dist is absent):
- `dist/es/index.html` contains `Diagnóstico` and `Construcción` inside the
  services section, and no bare `desde 30 UF` without `Construcción`.
- `dist/es/servicios/automatizacion-python/index.html` pairs `3 UF` with
  `Diagnóstico` and `30 UF` with `Construcción`.
- `dist/en/services/python-automation/index.html` pairs `$290` with
  `Diagnostic` and `$1,500` with `Build`.
- `dist/es/servicios/higiene-tecnica-web/index.html` pairs `1 UF` with
  `Diagnóstico`.

Keep assertions on text pairs, not on exact sentences (copy may be tuned).

**Verify**: `node tests/run.js --built` → exit 0.

## Test plan

- Group `H-04` above + the existing suites (source, built, HTW, behavioral).
- Manual read of the four surfaces (home ES/EN, one service ES/EN, HTW
  ES/EN) against the pattern table.

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `engagementStages` / `engagementLine` / `engagementCompact` exist and
      are the only formatters; `engagementSummary` is gone
- [ ] No amount renders without a stage label on home, services, or HTW
- [ ] ES diagnostic plan price reads `Desde 3 UF` (not bare `3 UF`)
- [ ] HTW snapshot regenerated only for intended copy changes
- [ ] `npm run check`, `node tests/run.js`, `node tests/run.js --built`,
      `node test-htw-snapshot.mjs`, `node test-behavioral.mjs` all green
- [ ] `git diff --name-only 2a10c13...HEAD` lists only in-scope files
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- A stage mapping is ambiguous for a service (e.g. `multi` has no stage noun
  in the pattern) — report the surface and propose wording, do not invent a
  fourth stage silently.
- An HTW copy change cannot be regenerated without touching link hrefs or
  form fields (snapshot diff larger than headings/links — investigate first).
- The `webHygiene` union access does not narrow under `strictest` — restructure
  the switch, do not add `any`.
- A step's verification fails twice after a reasonable fix attempt.

## Maintenance notes

For the human/agent who owns this code after the change lands:

- New surfaces with prices must call `engagementLine`/`engagementCompact`;
  never paste a bare amount.
- Changing a price means editing `pricing.ts` only — if a number appears
  anywhere else, that is a bug.
- Plan 033 reuses these strings in JSON-LD `Offer` descriptions; keep the
  formatter signatures stable or update it in the same change.
