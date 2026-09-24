# Plan 060: Make the source suite fail on missing reads, remove vacuous built skips, and drop duplicated pins

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat be975ef..HEAD -- tests/run.js`
> If the file changed since this plan was written, compare the "Current
> state" excerpts against the live code before proceeding; on a mismatch,
> treat it as a STOP condition.

## Status

- **Priority**: P3
- **Effort**: M
- **Risk**: MED (drops some regression pins; do not drop more than listed)
- **Depends on**: none (plan 041 already removed the `proof()` helper)
- **Category**: tests
- **Planned at**: commit `be975ef`, 2026-09-23

## Why this matters

`tests/run.js` has three self-inflicted weaknesses:

1. **Vacuous built checks.** Ten groups read `dist/` and, when a file is
   missing, emit `assert('… (skipped — run --built)', true)` — a *passing*
   assertion, even under `--built`. A missing build should fail.
2. **Silent source reads.** Helpers coerce missing files to `''`
   (`const hero = () => read(...) || ''`), so an assertion like
   "hero does not contain X" passes vacuously if the file is renamed.
   `rootHTML()` reads a repo-root `index.html` that does not exist, making
   its J1 assertion dead.
3. **Duplicated contract pins.** The `S0` group re-asserts by substring
   what `tests/analytics-service-funnel.mjs` proves by executing the code
   (event vocabulary, track allowlist, intake lifecycle). Two copies drift.

## Current state (verified at `be975ef`)

Skip branches (all ten):
`tests/run.js:731, 904, 992, 1041, 1057, 1079, 1115, 1163, 1195, 1239`.

Helper pattern (`:44-63`), e.g. `:44` `const hero = () => read('src/components/HeroSection.astro') || '';`
and `:56` `const rootHTML   = () => read('index.html') || '';` — the root
`index.html` does not exist (J1 at `:683-688` uses it).

Duplicated S0 assertions (`:1270-1280`): "canonical layer uses
service/lead events only", "track.js passes service params through",
"track.js carries no tool_* params", "track.js keeps legacy tt_* mapping",
"intake mirrors brief lifecycle", "intake keeps legacy form_* events".
The unique pins to keep: registry parse/ids/routes (`:1249-1265`),
BaseLayout script order + GA4 stub bytes (`:1282-1284`), ServicePage
stamps/HTW scope/gateway wiring (`:1286-1293`).

## Commands you will need

| Purpose       | Command                        | Provenance | Expected on success |
|---------------|--------------------------------|------------|---------------------|
| Install       | `npm ci`                       | declared   | exit 0 |
| Build         | `npx --no-install astro build` | executed   | `[build] Complete!`, 30 pages |
| Source suite  | `node tests/run.js`            | executed   | `All checks passed.` |
| Built suite   | `node tests/run.js --built`    | executed   | `All checks passed.` |
| Full tests    | `npm test`                     | executed   | exit 0 |

## Scope

**In scope**: `tests/run.js`, `plans/README.md` (status row).
**Out of scope**:
- `tests/analytics-service-funnel.mjs` and the other suites — unchanged.
- The string-pin content assertions beyond the S0 duplicates (a wholesale
  migration to snapshots is deferred).

## Git workflow

- Branch: `advisor/060-runjs-quality`
- Conventional commits, e.g. `test(runner): fail on missing reads, drop vacuous built skips, dedupe S0`.
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 0: Green baseline and count record

`npm ci` → `npx --no-install astro build` → `node tests/run.js` →
`node tests/run.js --built`. Record both counts (expected 218/218 and
247/247 at `be975ef`, plus any assertions added by earlier plans in this
series).

**Verify**: both green; record the counts in your report.

### Step 1: Replace the ten vacuous skips

For each group whose guard matches
`assert('[built] … (skipped — run --built)', true);`, change the guard to:

```js
  if (!BUILT) return;
  const esHome = read('dist/es/index.html');
  assert('[built] dist/es/index.html exists', !!esHome, 'run npm run build first');
  if (!esHome) return;
```

Adapt the file paths per group (use the file each group actually reads
first). The effect: source mode skips silently (no fake pass); `--built`
fails when the artifact is missing.

**Verify**:

```bash
grep -c "skipped — run --built" tests/run.js   # 0
node tests/run.js --built                       # green
rm -rf dist && node tests/run.js --built; echo "exit=$?"; npx --no-install astro build
```

→ `exit=1` without dist, then rebuild and confirm green again. (`dist/` is
gitignored and rebuildable.)

### Step 2: Fail on missing source files

Add next to `read()` (`:20-24`):

```js
function readRequired(relPath) {
  const content = read(relPath);
  if (content === null) throw new Error(`Required source file missing: ${relPath}`);
  return content;
}
```

Convert these helpers (`:44-63`) from `read(...) || ''` to
`readRequired(...)`: `hero`, `portfolio`, `caseStudies`, `services`,
`about`, `contact`, `footer`, `navbar`, `pageEN`, `pageES`, `astroConf`,
`indexAstro`, `layout`, `globalCss`, `siteLayoutJs`, `portfolioFiltersJs`,
`intakeForm`. Do **not** convert `creds` (its absence is asserted by G1) or
`rootHTML` (removed next).

**Verify**: `node tests/run.js` → green; then
`mv src/components/Footer.astro /tmp/Footer.astro.bak && node tests/run.js; echo "exit=$?"; mv /tmp/Footer.astro.bak src/components/Footer.astro`
→ exits non-zero with the "Required source file missing" error, then green
again.

### Step 3: Remove the dead `rootHTML` check

Delete the `rootHTML` helper (`:56`) and the `['index.html (root)', rootHTML()]`
entry in J1 (`:688`). Keep the other J1 entries.

**Verify**: `grep -c "rootHTML" tests/run.js` → 0; `node tests/run.js` green.

### Step 4: Drop the duplicated S0 pins

In the `S0` group, delete the six assertions at `:1270-1280` listed in
Current state. Keep everything else in the group.

**Verify**: `node tests/run.js` → green with the source count reduced by
exactly 6 from the Step 0 baseline (plus the count changes from Steps 1-3:
Step 1 removes 10 fake passes from source mode — record the arithmetic in
your report). Confirm the vm suite still proves those contracts:
`node tests/analytics-service-funnel.mjs` → `77 passed, 0 failed`.

### Step 5: Full gate

`npm run check && npm test`

**Verify**: exit 0; built suite green; sitemap/HTW/behavioral pass.

## Test plan

No new tests; this plan strengthens the existing runner. Required
red-then-green evidence:
- `--built` without `dist/` exits non-zero (Step 1).
- A renamed source file makes `node tests/run.js` exit non-zero (Step 2).
- `analytics-service-funnel.mjs` still covers the removed S0 pins
  (Step 4).

## Done criteria

ALL must hold:

- [ ] `grep -c "skipped — run --built" tests/run.js` → 0
- [ ] `grep -c "rootHTML" tests/run.js` → 0
- [ ] `node tests/run.js` and `node tests/run.js --built` green with a build
      present; `--built` exits non-zero without `dist/`
- [ ] `node tests/analytics-service-funnel.mjs` → `77 passed, 0 failed`
- [ ] `npm test` exits 0
- [ ] `git diff --name-only master...HEAD` lists only `tests/run.js` and
      `plans/README.md`
- [ ] `plans/README.md` status row for 060 updated

## STOP conditions

Stop and report back (do not improvise) if:

- The drift check shows `tests/run.js` changed since `be975ef`.
- Any built group reads a file whose absence is legitimate (e.g. an
  optional page) — report the group instead of failing it.
- Removing the S0 pins makes the source count drop by more or less than
  the arithmetic you recorded — investigate and report.
- Anything appears to require touching an out-of-scope file.

## Maintenance notes

- `readRequired` is the default for must-exist sources; `read` stays for
  optional artifacts (`dist/`, retired components).
- Built groups must run only under `--built`; never reintroduce a passing
  "skipped" assertion.
- **Deferred:** migrating the copy pins (132 `src.includes` assertions) to
  per-component snapshots — MED risk, M effort; do it group by group when
  copy churn next becomes painful.
