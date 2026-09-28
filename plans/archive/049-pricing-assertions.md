# Plan 049: Replace the pricing proximity heuristic with exact stage/amount assertions

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat be975ef..HEAD -- tests/run.js src/data/pricing.ts`
> If either file changed since this plan was written, compare the "Current
> state" excerpts against the live code before proceeding; on a mismatch,
> treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: tests
- **Planned at**: commit `be975ef`, 2026-09-23

## Why this matters

The only pricing test (`H-04` in `tests/run.js:900-940`) uses a ±240-char
proximity heuristic: an amount passes if a stage word appears anywhere
within 240 characters. A swapped amount still passes — replacing `$290`
with `$1,500` in a built page keeps both stage words within range, so the
test cannot catch the exact failure it exists to prevent. Coverage is also
partial: only python-automation and HTW are asserted; retainer amounts and
three of five services are not covered at all.

Prices are the most commercially sensitive copy on the site. This plan
replaces the heuristic with exact, per-service, per-locale assertions
derived from `pricing.ts`.

## Current state (verified at `be975ef`)

`tests/run.js:912-922` (the heuristic) and `:934-939` (the partial checks):

```js
  const pairs = (html, amount, stage) => {
    let from = 0;
    while (true) {
      const idx = html.indexOf(amount, from);
      if (idx === -1) return false;
      const window = html.slice(Math.max(0, idx - 240), idx + 240).toLowerCase();
      if (window.includes(stage.toLowerCase())) return true;
      from = idx + amount.length;
    }
  };
...
  assert('H-04 ES service pairs 3 UF with Diagnóstico', pairs(esService, '3 UF', 'Diagnóstico'));
  assert('H-04 ES service pairs 30 UF with Construcción', pairs(esService, '30 UF', 'Construcción'));
  assert('H-04 EN service pairs $290 with Diagnostic', pairs(enService, '$290', 'Diagnostic'));
  assert('H-04 EN service pairs $1,500 with Build', pairs(enService, '$1,500', 'Build'));
```

`src/data/pricing.ts:9-30` is the single source:

```ts
export const pricing = {
  automation: {
    en: { scoping: '$290', scoped: '$1,500', multi: '$3,200', retainer: '$290/mo' },
    es: { scoping: '3 UF', scoped: '30 UF', multi: '60 UF', retainer: '6 UF/mes' },
  },
  internalTools: {
    en: { scoping: '$290', scoped: '$1,800', multi: '$3,600', retainer: '$290/mo' },
    es: { scoping: '3 UF', scoped: '35 UF', multi: '70 UF', retainer: '6 UF/mes' },
  },
  financial: {
    en: { scoping: '$390', scoped: '$2,400', multi: '$4,800', retainer: '$390/mo' },
    es: { scoping: '4 UF', scoped: '45 UF', multi: '90 UF', retainer: '8 UF/mes' },
  },
  staticSites: {
    en: { scoping: '$190', scoped: '$1,200', multi: '$2,600', retainer: '$150/mo' },
    es: { scoping: '2 UF', scoped: '25 UF', multi: '50 UF', retainer: '3 UF/mes' },
  },
  webHygiene: { ... },
} as const;
```

Exact strings verified present in the built output at `be975ef` (the
renderer emits the JSON-LD plan descriptions and `diagnosticLine` output):

| Locale | Pattern in the built service page |
|---|---|
| EN | `Diagnostic from <scoping>` and `From <scoped> (one-time)`, `From <multi> (one-time)`, `From <retainer> (per month)` |
| ES | `Diagnóstico desde <scoping>` and `Desde <scoped> (por proyecto)`, `Desde <multi> (por proyecto)`, `Desde <retainer> (por mes)` |

Example verified: `dist/en/services/static-sites/index.html` contains
`From $190 (credited to build)`, `From $1,200 (one-time)`,
`From $2,600 (one-time)`; `dist/es/servicios/automatizacion-python/index.html`
contains `Desde 3 UF (acreditable)`, `Desde 30 UF (por proyecto)`,
`Desde 6 UF/mes (por mes)`.

## Commands you will need

| Purpose      | Command                        | Provenance | Expected on success |
|--------------|--------------------------------|------------|---------------------|
| Install      | `npm ci`                       | declared   | exit 0 |
| Build        | `npx --no-install astro build` | executed   | `[build] Complete!`, 30 pages |
| Full tests   | `npm test`                     | executed   | exit 0 (218/218 src, 77/77 analytics, 247/247 built) |
| Source tests | `node tests/run.js`            | executed   | `All checks passed.` |
| Built tests  | `node tests/run.js --built`    | executed   | `All checks passed.` |

Notes: fresh worktree → `npm ci`, then `npx --no-install astro build`
before `--built`/`npm test`. Never `npm run build`.

## Scope

**In scope** (the only files you may modify):
- `tests/run.js` (the `H-04` group plus one new group)
- `plans/README.md` (status row only)

**Out of scope** (do NOT touch):
- `src/data/pricing.ts` and all copy — prices must not change; this plan
  only strengthens the tests.
- HTW's existing H-04 assertions — keep them (add the new group beside
  them).
- `tests/snapshots/` — HTW only.

## Git workflow

- Branch: `advisor/049-pricing-assertions`
- Conventional commits, e.g. `test(pricing): assert exact stage/amount pairs for all services`.
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 0: Green baseline

`npm ci` → `npx --no-install astro build` → `node tests/run.js --built`.

**Verify**: `All checks passed.` (247/247 built). If not, STOP and report.

### Step 1: Prove the heuristic is weak (red-then-green evidence)

Temporarily edit `dist/en/services/python-automation/index.html`: replace
one occurrence of `$290` with `$1,500` (in the entry price, not JSON-LD),
then run:

```bash
node tests/run.js --built
```

`H-04` must **still pass** — that is the defect. Restore the file by
rebuilding (`npx --no-install astro build`), not by editing it back.

**Verify**: the suite stays green with the corrupted page (record this in
your report).

### Step 2: Add the exact assertions group

Add a new group to `tests/run.js` after `H-04` (same built-skip guard as
`H-04` at `:901-906`). Define a table and loop:

```js
group('PRICING · Exact stage/amount pairs per service and locale', () => {
  const enPages = {
    automation: 'dist/en/services/python-automation/index.html',
    'recurring-data': 'dist/en/services/recurring-data-collection/index.html',
    'internal-tools': 'dist/en/services/internal-tools/index.html',
    financial: 'dist/en/services/financial-tooling/index.html',
    web: 'dist/en/services/static-sites/index.html',
  };
  const esPages = {
    automation: 'dist/es/servicios/automatizacion-python/index.html',
    'recurring-data': 'dist/es/servicios/recoleccion-recurrente-datos/index.html',
    'internal-tools': 'dist/es/servicios/herramientas-internas/index.html',
    financial: 'dist/es/servicios/herramientas-financieras/index.html',
    web: 'dist/es/servicios/sitios-web/index.html',
  };
  const amounts = {
    automation:     { en: ['$290', '$1,500', '$3,200', '$290/mo'],  es: ['3 UF', '30 UF', '60 UF', '6 UF/mes'] },
    'internal-tools': { en: ['$290', '$1,800', '$3,600', '$290/mo'], es: ['3 UF', '35 UF', '70 UF', '6 UF/mes'] },
    financial:      { en: ['$390', '$2,400', '$4,800', '$390/mo'],  es: ['4 UF', '45 UF', '90 UF', '8 UF/mes'] },
    web:            { en: ['$190', '$1,200', '$2,600', '$150/mo'],  es: ['2 UF', '25 UF', '50 UF', '3 UF/mes'] },
  };
  const enPatterns = (a) => [
    `Diagnostic from ${a[0]}`,
    `From ${a[1]} (one-time)`,
    `From ${a[2]} (one-time)`,
    `From ${a[3]} (per month)`,
  ];
  const esPatterns = (a) => [
    `Diagnóstico desde ${a[0]}`,
    `Desde ${a[1]} (por proyecto)`,
    `Desde ${a[2]} (por proyecto)`,
    `Desde ${a[3]} (por mes)`,
  ];
  for (const [key, path] of Object.entries(enPages)) {
    const html = read(path);
    if (!html) { assert(`[built] ${key} EN page (skipped — run --built)`, true); continue; }
    enPatterns(amounts[key].en).forEach((pattern) => {
      assert(`EN ${key}: contains "${pattern}"`, html.includes(pattern), `Missing exact pair in ${path}`);
    });
  }
  for (const [key, path] of Object.entries(esPages)) {
    const html = read(path);
    if (!html) { assert(`[built] ${key} ES page (skipped — run --built)`, true); continue; }
    esPatterns(amounts[key].es).forEach((pattern) => {
      assert(`ES ${key}: contains "${pattern}"`, html.includes(pattern), `Missing exact pair in ${path}`);
    });
  }
});
```

Note: `recurring-data` reuses the automation price band by design
(`services.ts:560-588` and `llms-full.txt:52` document the reuse), so its
expected values equal automation's. If that changes, update the table.

**Verify**: `node tests/run.js --built` → the new group passes; then repeat
Step 1's corruption and confirm the new group **fails** (red-then-green),
and rebuild.

### Step 3: Remove the weak heuristic

Delete the `pairs()` helper and the four `pairs(...)` assertions from
`H-04` (`tests/run.js:912-922`, `:934-937`), keeping the home-label and HTW
assertions (`:924-932`, `:938-939`). The new group now owns per-service
coverage.

**Verify**: `node tests/run.js --built` → all pass; `grep -c "const pairs"
tests/run.js` → 0.

### Step 4: Full gate

`npx --no-install astro build && npm run check && npm test`

**Verify**: exit 0.

## Test plan

- The new group is the test. Red-then-green is required: Step 1 proves the
  old heuristic misses a swap; Step 2's group must catch the same swap.
- Keep HTW/home assertions in `H-04`; do not weaken them.

## Done criteria

ALL must hold:

- [ ] `node tests/run.js --built` exits 0 with the new group green
- [ ] The Step 1 corruption makes the new group fail (recorded in your report)
- [ ] `grep -c "const pairs" tests/run.js` → 0
- [ ] `npm test` exits 0
- [ ] `git diff --name-only master...HEAD` lists only `tests/run.js` and
      `plans/README.md`
- [ ] `plans/README.md` status row for 049 updated

## STOP conditions

Stop and report back (do not improvise) if:

- The drift check shows `tests/run.js` or `pricing.ts` changed since
  `be975ef`.
- Any exact pattern in Step 2 is not present in the current built pages
  (report the page and pattern — do not weaken the assertion).
- The corruption test in Step 1 unexpectedly fails the old `H-04` (means
  the heuristic is stronger than recorded; report before proceeding).
- Anything appears to require touching an out-of-scope file.

## Maintenance notes

- `pricing.ts` changes now require updating the `amounts` table in the new
  group; that is intentional (a price change is a reviewed event).
- The table duplicates `pricing.ts` values because `tests/run.js` is
  plain ESM and cannot import TypeScript. If the repo ever gains a TS-aware
  test runner, derive the table instead.
- **Deferred:** asserting HTW's full five-tier ladder exactly — the HTW
  page builds its own schema; covered partially by `H-04` and fully by the
  JSON-LD plan (055).
