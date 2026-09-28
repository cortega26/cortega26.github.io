# Plan 044: Make the Recurring Data Collection page self-contained (remove automation copy leakage)

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat be975ef..HEAD -- src/data/services.ts tests/run.js`
> If either file changed since this plan was written, compare the "Current
> state" excerpts against the live code before proceeding; on a mismatch,
> treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: MED (two live pages change copy; snapshots/tests must be re-run)
- **Depends on**: none
- **Category**: correctness
- **Planned at**: commit `be975ef`, 2026-09-23

## Why this matters

`recurringData` is defined as a spread-override of `pythonAutomation`:

```ts
  en: {
    ...pythonAutomation.en,
    title: 'Recurring Data Collection & Scraping | Tooltician',
```

It overrides most fields but not all. The live collection page therefore
renders **automation-specific copy** in several sections. Verified in the
built output at `be975ef`:

- `dist/es/servicios/recoleccion-recurrente-datos/index.html` contains
  `2–3 proyectos nuevos al mes` (automation availability),
  `Diagnóstico de automatización` (automation process step), and
  `bankrecon` (automation `whyNote` proof).
- The same class of leak exists in English.

This is a live content defect on a paid-service page: a prospect reading
the collection page sees availability, process steps, and proof belonging
to a different service. Any future edit to automation's shared fields will
silently rewrite the collection page again.

## Current state (verified at `be975ef`)

`src/data/services.ts:545-551`:

```ts
const recurringData: ServiceDefinition = {
  slugEn: 'recurring-data-collection',
  slugEs: 'recoleccion-recurrente-datos',
  serviceKey: 'recurring-data',
  areaServed: ['US', 'GB', 'EU', 'LATAM'],
  en: {
    ...pythonAutomation.en,
```

The `ServiceContent` interface (`services.ts:26-104`) defines the fields.
`recurringData` already overrides the hero, problem, scope, review,
plans, cases, FAQ, and contact sections, but **not** these content-bearing
fields (inherited from `pythonAutomation`):

| Field | Automation value (EN) | Leaks to collection page as |
|---|---|---|
| `availability` | `'2–3 new builds per month. Response within 24–48 business hours.'` | availability line |
| `processTitle` / `processSubtitle` / `processSteps` | "How an automation build works" / "Automation scoping" / … | process section |
| `tableFeatures` | 8 automation rows | plans comparison table |
| `whyTitle` / `whySubtitle` / `whyAltItems` / `whyUsItems` | "Not the same as a one-off script…" | why section |
| `whyNote` | cites `chile-hub`, `bankrecon`, `rutificador` | "Proof, not promises" note |
| `contactRiskNote` | automation scoping risk note | contact aside |
| `outreach` | "a manual report, a fragile scrape…" | closing paragraph |

(The ES side mirrors all of the above.)

Test coverage: `tests/run.js` has no assertion that the recurring-data
pages differ from the automation pages. `tests/snapshots/` covers only the
HTW pages.

## Commands you will need

| Purpose      | Command                                | Provenance | Expected on success |
|--------------|----------------------------------------|------------|---------------------|
| Install      | `npm ci`                               | declared   | exit 0 |
| Build        | `npx --no-install astro build`         | executed   | `[build] Complete!`, 30 pages |
| Typecheck    | `npm run check`                        | executed   | `0 errors`, `0 warnings`, `0 hints` |
| Source tests | `node tests/run.js`                    | executed   | `All checks passed.` (218/218 before) |
| Full tests   | `npm test`                             | executed   | exit 0 (218/218 src, 77/77 analytics, 247/247 built) |

Notes: fresh worktree → `npm ci`, then `npx --no-install astro build`
before `npm test`. Never `npm run build` (rewrites committed stats).

## Scope

**In scope** (the only files you may modify):
- `src/data/services.ts` (the `recurringData` definition only — do not
  touch `pythonAutomation` or any other service)
- `tests/run.js` (one new group)
- `plans/README.md` (status row only)

**Out of scope** (do NOT touch):
- `src/data/service-registry.json`, `src/data/caseStudies.ts`,
  `src/data/pricing.ts` — unrelated (names/prices are plan 048's scope).
- `src/components/ServicePage.astro` — the renderer is correct; the data
  was not.
- `tests/snapshots/*` — HTW only; no rebase needed.

## Git workflow

- Branch: `advisor/044-recurring-data-copy`
- Conventional commits, e.g. `fix(services): make recurring-data page self-contained (no automation copy)`.
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 0: Green baseline

`npm ci` → `npx --no-install astro build` → `npm run check` → `npm test`.

**Verify**: all green. If not, STOP and report.

### Step 1: Enumerate the actual leaks on both pages

```bash
for m in '2–3 new builds per month' 'Automation scoping' 'bankrecon' 'rutificador' 'one-off script'; do
  printf '%s -> EN %s\n' "$m" "$(grep -c "$m" dist/en/services/recurring-data-collection/index.html)"
done
for m in '2–3 proyectos nuevos al mes' 'Diagnóstico de automatización' 'bankrecon' 'rutificador'; do
  printf '%s -> ES %s\n' "$m" "$(grep -c "$m" dist/es/servicios/recoleccion-recurrente-datos/index.html)"
done
```

Record the counts. Every non-zero count above (except a marker you can
prove is legitimately collection-specific) is a field you must override in
Step 2. Also diff the two pages' visible section text if you want to be
exhaustive:

```bash
node -e "const fs=require('fs');const t=(p)=>fs.readFileSync(p,'utf8').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ');const a=t('dist/en/services/python-automation/index.html');const b=t('dist/en/services/recurring-data-collection/index.html');for(const s of a.split(/(?<=[.!?]) /)){if(s.length>40&&b.includes(s))console.log('SHARED:',s.slice(0,120));}"
```

**Verify**: the recorded counts are non-zero for the automation markers
(this confirms the premise). If all counts are already zero, STOP — the
codebase has changed.

### Step 2: Add the missing overrides to `recurringData`

In `src/data/services.ts`, inside `recurringData.en` (and the matching
`recurringData.es`), add explicit overrides **after** the existing ones.
Use the following maintainer-reviewed copy verbatim. If a field is already
overridden in the current definition, leave the existing value.

EN (insert inside `recurringData.en`):

```ts
    availabilityEyebrow: 'Availability',
    availability: '2–3 new collectors per month. Response within 24–48 business hours.',
    processTitle: 'How a recurring collection build works',
    processSubtitle:
      'Concrete from the first step: lock the source contract, build the smallest reliable collector, and leave it documented enough to run and repair without me.',
    processSteps: [
      ['01', 'Free diagnostic call', 'A 15-minute call to confirm the source, its authorization, and the downstream use are a fit. No charge, no obligation.'],
      ['02', 'Collection scoping', 'A short paid discovery that locks sources, authorization, cadence, validation rules, failure behavior, and the handoff owner — agreed in writing. The fee is credited toward the build.'],
      ['03', 'Scoped collector build', 'Implementation with visible progress in GitHub, validation, logging, alerts, and pragmatic tradeoffs documented instead of surprise scope creep.'],
      ['04', 'Handoff', 'README, runbook, repair notes, and the failure points worth watching — so the next person can run, debug, and repair it without me on a call.'],
    ],
    tableFeatures: [
      ['Free 15-min diagnostic call', true, true, true, true],
      ['Written source & output contract', true, true, true, false],
      ['One collector built end-to-end', false, true, true, false],
      ['Multiple sources orchestrated', false, false, true, false],
      ['Validation & schema checks', false, true, true, true],
      ['Failure alerts & drift states', false, true, true, true],
      ['README + repair runbook', false, true, true, true],
      ['Ongoing source upkeep', false, false, false, true],
    ],
    whyTitle: 'Not the same as a one-off scraper from a marketplace',
    whySubtitle:
      'A marketplace freelancer delivers the scraper you describe. Tooltician builds a collector that validates, alerts, and can be repaired when the source changes.',
    whyAltItems: [
      'Delivers the script you asked for. When the source changes, a partial run still looks like a good run.',
      'No validation, no alerts, no runbook — every break is a surprise.',
      'No handoff. When it breaks, the knowledge left with the author.',
      'Each repair is a new project with no memory of how the collector works.',
    ],
    whyUsItems: [
      'Builds for the failure modes you did not know to ask about — empty, partial, duplicate, and drift states.',
      'Validation, logging, retries, and alerts so source changes surface early and loudly.',
      'Handoff materials so the next person can repair the collector without reverse-engineering.',
      'Public, auditable work: scheduled collection pipelines, data layers, and production systems.',
    ],
    whyNote: {
      label: 'Proof, not promises',
      body: 'Tooltician runs scheduled collection in production (polla, noticiencias) and ships open-source data layers (chile-hub) with handoff-ready docs. The same standards apply to your collector.',
    },
    contactRiskNote:
      'If scoping shows the source is not lawful, stable, or worth collecting on a schedule, the document says so with reasoning — knowing the real constraint early is also valuable. The fee applies regardless, but there are no surprises or additional charges.',
    outreach:
      'If you arrived here because a recurring source feeds your reporting, operations, or publishing — or because a scraper keeps failing quietly — the scope is this: lock the source contract, build it reliably, and hand it off documented. Fixed price, no open-ended hours.',
```

ES (insert inside `recurringData.es`; keep the ES `whyNote.label`
"Evidencia, no promesas" convention):

```ts
    availabilityEyebrow: 'Disponibilidad',
    availability: '2–3 colectores nuevos al mes. Respuesta dentro de 24–48 horas hábiles.',
    processTitle: 'Cómo funciona una construcción de recolección recurrente',
    processSubtitle:
      'Concreto desde el primer paso: fijar el contrato de fuente, construir el colector más pequeño que sea confiable y dejarlo documentado para operarlo y repararlo sin mí.',
    processSteps: [
      ['01', 'Llamada de diagnóstico gratuita', 'Una llamada de 15 minutos para confirmar que la fuente, su autorización y el uso posterior son un buen encaje. Sin costo ni compromiso.'],
      ['02', 'Levantamiento de recolección', 'Un descubrimiento breve y pagado que fija fuentes, autorización, frecuencia, reglas de validación, comportamiento ante fallas y responsable de traspaso — acordado por escrito. El monto se acredita a la construcción.'],
      ['03', 'Construcción del colector acotado', 'Implementación con progreso visible en GitHub, validación, logging, alertas y decisiones documentadas en lugar de scope creep sorpresivo.'],
      ['04', 'Traspaso', 'README, runbook, notas de reparación y los puntos de falla a vigilar — para que la siguiente persona pueda operarlo, depurarlo y repararlo sin una llamada conmigo.'],
    ],
    tableFeatures: [
      ['Llamada de diagnóstico gratuita (15 min)', true, true, true, true],
      ['Contrato escrito de fuente y salida', true, true, true, false],
      ['Un colector construido de punta a punta', false, true, true, false],
      ['Múltiples fuentes orquestadas', false, false, true, false],
      ['Validación y chequeo de esquema', false, true, true, true],
      ['Alertas y estados de drift', false, true, true, true],
      ['README + runbook de reparación', false, true, true, true],
      ['Mantención de fuentes', false, false, false, true],
    ],
    whyTitle: 'No es lo mismo que un scraper suelto de un marketplace',
    whySubtitle:
      'Un freelancer de marketplace entrega el scraper que describes. Tooltician construye un colector que valida, alerta y se puede reparar cuando la fuente cambia.',
    whyAltItems: [
      'Entrega el script que pediste. Cuando la fuente cambia, una corrida parcial parece una corrida buena.',
      'Sin validación, sin alertas, sin runbook — cada falla es una sorpresa.',
      'Sin traspaso. Cuando se rompe, el conocimiento se fue con el autor.',
      'Cada reparación es un proyecto nuevo sin memoria de cómo funciona el colector.',
    ],
    whyUsItems: [
      'Construye para los modos de falla que no sabías que había que preguntar — vacío, parcial, duplicado y drift.',
      'Validación, logging, reintentos y alertas para que los cambios de fuente aparezcan temprano y fuerte.',
      'Materiales de traspaso para que la siguiente persona repare el colector sin ingeniería inversa.',
      'Trabajo público y auditable: pipelines de recolección programados, capas de datos y sistemas en producción.',
    ],
    whyNote: {
      label: 'Evidencia, no promesas',
      body: 'Tooltician opera recolección programada en producción (polla, noticiencias) y mantiene capas de datos open source (chile-hub) con documentación lista para traspaso. Los mismos estándares aplican a tu colector.',
    },
    contactRiskNote:
      'Si el levantamiento muestra que la fuente no es lícita, estable o no vale la pena recolectarla de forma programada, el documento lo dirá con fundamentos — conocer la restricción real a tiempo también vale. El monto se aplica igual, pero sin sorpresas ni cargos adicionales.',
    outreach:
      'Si llegaste aquí porque una fuente recurrente alimenta tus reportes, operaciones o publicación — o porque un scraper sigue fallando en silencio — el alcance es este: fijar el contrato de fuente, construirlo de forma confiable y traspasarlo documentado. Precio fijo, sin horas abiertas.',
```

**Verify**: `npm run check` → 0 errors (the `ServiceContent` type will catch
any wrong field shape); rebuild and re-run Step 1's greps.

### Step 3: Add a regression test that the pages cannot re-couple

Add a group to `tests/run.js` (follow the `H-04` built-group pattern at
`tests/run.js:900-940`, including the `read('dist/...')` + skip-if-absent
guard):

- On `dist/en/services/recurring-data-collection/index.html` and
  `dist/es/servicios/recoleccion-recurrente-datos/index.html`:
  `bankrecon` count == 0, `rutificador` count == 0, and the automation
  availability/process markers are absent (`2–3 new builds per month`,
  `Automation scoping` for EN; `2–3 proyectos nuevos al mes`,
  `Diagnóstico de automatización` for ES).
- Positive control on the automation pages: those markers **are** present
  (so the test fails loudly if the marker strings ever change).

**Verify**: `node tests/run.js --built` → new group green; `node tests/run.js`
→ source count unchanged plus any source-only assertions you added.

### Step 4: Full gate

`npx --no-install astro build && npm run check && npm test`

**Verify**: exit 0; `git status --short src/data/github-stats.json` → empty.

## Test plan

- New built-output group as described in Step 3 (red before Step 2's fix,
  green after — prove it by running it once before applying the copy if you
  want the red-then-green record).
- No Playwright work: the copy is static and covered by the string checks.
- Snapshot note: `test-htw-snapshot.mjs` covers only HTW pages, so no
  snapshot rebase is expected; if `npm test` reports HTW drift, STOP and
  report.

## Done criteria

ALL must hold:

- [ ] `npm run check` exits 0
- [ ] `npm test` exits 0
- [ ] Built-output greps: `bankrecon`/`rutificador` count == 0 on both
      recurring-data pages; the automation markers are absent there and
      present on both automation pages
- [ ] `grep -c "\.\.\.pythonAutomation" src/data/services.ts` → still 2
      (the spread is intentional for generic labels; only content fields
      are overridden) — **do not** remove the spread unless every remaining
      inherited field is verified generic
- [ ] `git diff --name-only master...HEAD` lists only `src/data/services.ts`,
      `tests/run.js`, `plans/README.md`
- [ ] `plans/README.md` status row for 044 updated

## STOP conditions

Stop and report back (do not improvise) if:

- The drift check shows `services.ts` or `tests/run.js` changed since
  `be975ef` and the excerpts no longer match.
- Step 1's greps return zero for every automation marker (the premise is
  false — report instead of editing).
- The `ServiceContent` type rejects any provided copy (report the field and
  error rather than inventing a different shape).
- `npm test` shows HTW snapshot drift or any failure outside your new group.
- Anything appears to require touching an out-of-scope file.

## Maintenance notes

- The spread-override remains a hazard: any future automation field edit
  can leak again. The guard test (Step 3) covers the specific markers; a
  structural fix (explicit shared-label object + required content fields)
  is a reasonable follow-up, deliberately deferred to keep this change
  copy-only.
- If the collection service's proof assets change (polla/noticiencias/
  chile-hub), update `whyNote` and `related` together.
- **Deferred:** structural refactor of `services.ts` to make every
  content-bearing field explicit (no cross-service spread) — unblocked by a
  decision to touch all six service definitions in one pass.
