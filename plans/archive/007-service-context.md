# Plan 007: Pass service context from ServicePage into IntakeForm

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 79b5347..HEAD -- src/components/ServicePage.astro src/components/IntakeForm.astro src/data/services.ts src/pages/en/services src/pages/es/servicios`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: bug
- **Planned at**: commit `79b5347`, 2026-09-16

## Why this matters

Every productized service page (5 services × 2 locales = 10 pages) renders
its brief form via `ServicePage.astro`, which hardcodes
`service="general"`. As a result, Formspree briefs arriving from e.g.
`/en/services/python-automation/` are indistinguishable from homepage
briefs (wrong `_subject`, wrong hidden `service` value, generic
`data-track-form="intake_general"`), and the per-service `serviceKey`
field in `services.ts` is dead data. Fixing this restores per-service
lead attribution and unblocks per-service funnel measurement.

## Current state

The facts the executor needs, inlined:

- `src/components/ServicePage.astro:18` destructures props (no service key):
  `const { lang, content: c, slug, canonical, alternates, crossLocaleHref, areaServed } = Astro.props;`
- `src/components/ServicePage.astro:20`: `const formId = `${slug}-brief`;`
- `src/components/ServicePage.astro:361` (the bug):
  `<IntakeForm lang={lang} service="general" formId={formId} heading={c.intakeHeading} />`
- `src/components/IntakeForm.astro:9-10` — the prop type only allows two values:
  ```
  /** Context preset. 'general' = portfolio brief, 'htw' = web technical hygiene. */
  service?: 'general' | 'htw';
  ```
- `src/components/IntakeForm.astro:117-126` — `service` drives the hidden
  field, the email subject, the option lists, and the tracking context:
  ```
  const subjectMap = {
    general: lang === 'en' ? 'Project brief from tooltician.com' : 'Brief de proyecto desde tooltician.com',
    htw: lang === 'en' ? 'Web Technical Hygiene — intake' : 'Higiene Técnica Web — intake',
  };
  const goalOptions = c.goalOptions[service];
  const budgetOptions = c.budgetOptions[service];
  ...
  data-track-form={`intake_${service}`}
  ```
  and `src/components/IntakeForm.astro:145`: `<input type="hidden" name="service" value={service} />`
- `src/data/services.ts` defines five `ServiceDefinition` objects, each with
  a `serviceKey` that nothing consumes (`services.ts:109`:
  `serviceKey: string; // IntakeForm 'service' value`):
  `automation` (python-automation, line 118), `recurring-data`
  (recurring-data-collection, line 547), `internal-tools` (line 698),
  `financial` (financial-tooling, line 1127), `web` (static-sites, line 1556).
- The 10 thin route files each resolve `const def = services['<key>'];`
  (e.g. `src/pages/en/services/python-automation/index.astro:6`) and render
  `<ServicePage ... slug={def.slugEn} ... />` without passing `def.serviceKey`.
  Note the key/slug mismatch: the record key is `'recurring-data'` while
  `slugEn` is `'recurring-data-collection'` — always use `def.serviceKey`,
  never derive the key from the slug.
- Bespoke hygiene pages correctly pass `service="htw"`
  (`src/pages/en/services/web-technical-hygiene/index.astro:584`,
  `src/pages/es/servicios/higiene-tecnica-web/index.astro:826`) — do not touch them.
- Repo conventions: bilingual `en`/`es` objects inline per component, selected
  via `const c = lang === 'en' ? en : es` (see `IntakeForm.astro:116`);
  commercial values come from `src/data/pricing.ts` (single source of truth —
  never hardcode prices in new copy).

## Commands you will need

| Purpose | Command | Provenance | Expected on success |
|---------|---------|------------|---------------------|
| Install | `npm ci` | declared | exit 0 |
| Typecheck | `npm run check` | declared | exit 0, no errors |
| Source tests | `node tests/run.js` | executed | same pass count as Step 0 baseline (suite is red at baseline — see Step 0) |
| Build | `npm run build` | declared | exits 0, `dist/` written |

## Scope

**In scope** (the only files you should modify):
- `src/components/ServicePage.astro` (add `serviceKey` prop, pass through)
- `src/components/IntakeForm.astro` (extend `service` union + maps)
- The 10 ServicePage route files (one-line prop pass-through each):
  `src/pages/en/services/{python-automation,recurring-data-collection,internal-tools,financial-tooling,static-sites}/index.astro`,
  `src/pages/es/servicios/{automatizacion-python,recoleccion-recurrente-datos,herramientas-internas,herramientas-financieras,sitios-web}/index.astro`

**Out of scope** (do NOT touch, even though they look related):
- `src/pages/en/services/web-technical-hygiene/index.astro` and
  `src/pages/es/servicios/higiene-tecnica-web/index.astro` — bespoke pages,
  already correct (`service="htw"`).
- `src/data/services.ts` — `serviceKey` values are already correct; only read it.
- `src/data/pricing.ts` — do not change prices.
- Formspree endpoint / `action` prop — the endpoint stays the same.
- Per-service customized goal/budget option copy — explicitly deferred (see Maintenance notes).

## Git workflow

- Branch: `advisor/007-service-context`
- Commit per logical unit (`ServicePage`+routes, then `IntakeForm`); message style:
  conventional commits as in `git log` (e.g. `fix(forms): pass serviceKey from ServicePage to IntakeForm`)
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 0: Establish the baseline

1. Run `npm ci` (only if `node_modules` is absent; do not upgrade anything).
2. Run `npm run check` on the unmodified checkout → must exit 0.
   If it fails, STOP and report (pre-existing breakage, not yours).
3. Run `node tests/run.js` on the unmodified checkout and record the exact
   pass/fail counts. At plan time this was **90 passed / 16 failed** — the
   suite is red at baseline (stale assertions, fixed separately in Plan 009).
   Record YOUR baseline numbers; they are the comparison point for Step 3.

**Verify**: baseline numbers recorded; `npm run check` exits 0.

### Step 1: Extend IntakeForm's `service` union with the five service keys

In `src/components/IntakeForm.astro`:

1. Change the prop type to
   `service?: 'general' | 'htw' | 'automation' | 'recurring-data' | 'internal-tools' | 'financial' | 'web';`
   and update the doc comment to note the five keys come from
   `ServiceDefinition.serviceKey` in `src/data/services.ts`.
2. For each of the five new keys, add entries to every per-service map that
   is indexed by `service`: `subjectMap`, `c.goalOptions`, `c.budgetOptions`,
   `c.urlLabel`, `c.urlPh`, `c.messagePh`, `c.intro` — in BOTH `en` and `es`.
   Each new entry MUST reuse the corresponding `general` entry verbatim
   (e.g. `goalOptions: { general: [...], htw: [...], automation: <same array as general>, ... }`
   — referencing the same array is fine; do not copy-paste the literals if a
   shared reference compiles, otherwise duplicate the literals exactly).
   Rationale: per-service customized options are deferred; this step fixes
   identity/tracking without changing visible form behavior.
3. `subjectMap` additions: EN `` `<Key> brief from tooltician.com` `` with
   Key = `Automation`, `Recurring data`, `Internal tools`, `Financial`, `Web`;
   ES `Brief (<key>) desde tooltician.com` with
   `Automatización`, `Recolección de datos`, `Herramientas internas`,
   `Finanzas`, `Web`. Keep the existing `general` and `htw` subjects
   byte-identical (the maintainer may filter email on them).
4. The hidden `<input name="service">` and `data-track-form` require no code
   change (they already interpolate `service`).

**Verify**: `npm run check` → exit 0 (exhaustive indexing still typecovers
all keys; `noUncheckedIndexedAccess` is on — index with the union type, not
a plain string).

### Step 2: Plumb `serviceKey` through ServicePage and the 10 routes

1. `src/components/ServicePage.astro`: add `serviceKey: string;` to `Props`,
   destructure it, and change line 361 to
   `<IntakeForm lang={lang} service={serviceKey as ...} formId={formId} heading={c.intakeHeading} />`
   using the same union type imported from `IntakeForm` (export the type from
   `IntakeForm.astro` if needed — e.g. `export type IntakeService = ...` —
   rather than casting through `any`; `as` from `string` to the union is
   acceptable only via the exported type, never via `any`).
2. In each of the 10 route files, pass `serviceKey={def.serviceKey}` to
   `<ServicePage>`. Use `def.serviceKey` verbatim — never derive from slug
   (record key `'recurring-data'` ≠ `slugEn` `'recurring-data-collection'`).

**Verify**: `npm run check` → exit 0.

### Step 3: Build and confirm per-page form identity

1. Run `npm run build` → exit 0.
2. For each of the 10 built service pages
   (`dist/en/services/*/index.html`, `dist/es/servicios/*/index.html`),
   confirm the form carries the right identity, e.g.:
   `grep -o 'data-track-form="intake_[a-z-]*"' dist/en/services/python-automation/index.html`
   → `data-track-form="intake_automation"`, and the hidden field
   `grep -o 'name="service" value="[a-z-]*"' ...` → `value="automation"`.
   Repeat for all 10 (script it in bash; all must match their `serviceKey`).
3. Confirm the homepage and HTW pages are unchanged:
   `dist/en/index.html` still `intake_general`; HTW pages still `intake_htw`.
4. Re-run `node tests/run.js`; the failure set must be IDENTICAL to the Step 0
   baseline (no new failures, none fixed — the suite is stale by design until
   Plan 009).

**Verify**: all 10 pages report their own key; homepage/HTW unchanged;
test failure set identical to baseline.

## Test plan

- No new test files in this plan (the suite rewrite is Plan 009). Structural
  pattern for the build-output greps above: none — they are one-off
  verification commands whose expected outputs are stated in Step 3.
- If `tests/run.js` gains a failure vs baseline, the change regressed
  something — investigate before proceeding.

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `npm run check` exits 0
- [ ] `npm run build` exits 0
- [ ] All 10 built service pages contain their own `data-track-form` /
  hidden `service` value; homepage is `intake_general`; HTW pages `intake_htw`
- [ ] `node tests/run.js` failure set is identical to the Step 0 baseline
- [ ] `git diff --name-only 79b5347...HEAD` lists only the in-scope files
      (three dots — merge-base comparison). `git status` is not a scope check
      here: this plan tells you to commit, and committed work leaves it clean
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- The code at "Current state" doesn't match the excerpts (drift).
- `npm run check` fails on the unmodified checkout (Step 0) — broken baseline.
- A step's verification fails twice after a reasonable fix attempt.
- The fix appears to require touching an out-of-scope file (e.g. `services.ts`
  keys turn out inconsistent across locales).
- `IntakeForm`'s per-service maps cannot be extended without changing visible
  copy (then keep behavior identical and report rather than rewriting copy).

## Maintenance notes

For the human/agent who owns this code after the change lands:

- **Deferred:** per-service goal/budget/intro option customization. Each new
  service key currently reuses the `general` lists. If the maintainer wants
  tailored options per service, extend the maps added in Step 1 — the
  plumbing already supports it.
- If a sixth service is added to `services.ts`, its route MUST pass the new
  `serviceKey` and `IntakeForm`'s union + maps MUST gain the key, or
  `npm run check` will fail (this is intentional — the compiler enforces it).
- Reviewers: scrutinize that `general`/`htw` subjects and option lists are
  byte-identical to before (email-filter compatibility).
