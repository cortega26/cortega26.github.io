# Plan 010: Gate deploys on the test suite

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 79b5347..HEAD -- .github/workflows/deploy.yml package.json tests/run.js test-htw-snapshot.mjs scripts/check-links-seo.js`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition. ALSO read Plan 009's status: this
> plan may only proceed if Plan 009 is DONE (a red suite must never gate deploys).

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: LOW
- **Depends on**: plans/009-stale-suite.md
- **Category**: dx
- **Planned at**: commit `79b5347`, 2026-09-16

## Why this matters

CI (`.github/workflows/deploy.yml`) currently runs `npm ci` → GA4-var
check → `npm run check` → `npm run build` and ships `dist/`. None of the
three existing verification tools ever run: `tests/run.js` (content
regression suite), `test-htw-snapshot.mjs` (flagship-page characterization
net from Plan 003), `scripts/check-links-seo.js` (internal-link/SEO audit).
Findings like the double-submit or stale JSON-LD can therefore ship with
zero signal. Wiring the deterministic checks as blocking gates — and the
flaky network-dependent link check as non-blocking with an artifact — closes
that hole without making deploys brittle.

## Current state

The facts the executor needs, inlined:

- `.github/workflows/deploy.yml:31-55` — the `build` job today:
  ```
  - name: Install dependencies
    run: npm ci
  - name: Validate GA4 Measurement ID (Plan 006) ...
  - name: Type check
    run: npm run check
  - name: Build Astro
    run: npm run build
    env: (GITHUB_TOKEN, PUBLIC_GA4_MEASUREMENT_ID)
  - name: Upload artifact ...
  ```
  No test step exists anywhere in the file.
- `package.json:9-18` scripts at planned commit: `dev`, `build`
  (`node scripts/fetch-github-stats.js && astro build`), `preview`,
  `check` (`astro check`), `test:htw` (`node test-htw-snapshot.mjs`),
  `test:links` (`node scripts/check-links-seo.js`), `astro`. There is NO
  `test` script at HEAD (one exists only as an uncommitted working-tree
  change — ignore it; this plan invokes the `node` entrypoints directly so
  it works with or without that change).
- `tests/run.js:11-12`: `const BUILT = process.argv.includes('--built');`
  source-only by default; `--built` additionally asserts against `dist/`.
  Exits 1 on any failure (lines 888-899).
- `test-htw-snapshot.mjs` (root): compares built HTW pages against
  `tests/snapshots/htw-{en,es}.json`; exits non-zero on diff (verified in
  Plan 003's index entry). Requires `dist/` (i.e. must run AFTER build).
- `scripts/check-links-seo.js:73-102,186-194`: fetches every unique EXTERNAL
  URL with 6s timeouts in batches of 5, writes `output/seo-audit-report.md`
  (line 425-428; `output/` is gitignored per `.gitignore:34`). Network +
  third-party dependent → inherently flaky → must be NON-blocking.
- Repo conventions: step names are sentence-case (`Type check`, `Build
  Astro`); the GA4-var step shows the `run: |` + `::error::` style for
  custom gates.

## Commands you will need

| Purpose | Command | Provenance | Expected on success |
|---------|---------|------------|---------------------|
| Source tests | `node tests/run.js` | executed | exit 0 (green after Plan 009) |
| Build | `npm run build` | declared | exit 0 |
| Built tests | `node tests/run.js --built` | declared | exit 0 |
| HTW snapshot | `node test-htw-snapshot.mjs` | declared | exit 0, `✓ en: no diff`, `✓ es: no diff` |
| Link checker | `node scripts/check-links-seo.js` | declared | informational (non-blocking by design) |

## Scope

**In scope** (the only file you should modify):
- `.github/workflows/deploy.yml` — insert test steps into the `build` job.

**Out of scope** (do NOT touch, even though they look related):
- `package.json` — no new scripts (entrypoints invoked directly).
- `tests/run.js`, `test-htw-snapshot.mjs`, `scripts/check-links-seo.js`,
  baselines — owned by Plans 003/009; behavior must not change here.
- Anything outside the `build` job (permissions, concurrency, deploy job,
  schedule, GA4-var step).

## Git workflow

- Branch: `advisor/010-ci-gates`
- Commit as one unit; message style: conventional commits
  (e.g. `ci(deploy): gate build on test suite and HTW snapshot`)
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 0: Confirm the precondition

1. Read `plans/README.md`: Plan 009 status must be DONE. If not, STOP —
   gating a red suite would block all deploys.
2. Run `node tests/run.js` locally → exit 0. If red, STOP (same reason).

**Verify**: Plan 009 DONE; local source suite green.

### Step 1: Insert the gates into the build job

Edit `.github/workflows/deploy.yml`, `build` job, to this step order
(names follow existing style):

1. `Checkout`, `Setup Node`, `Install dependencies` — unchanged.
2. `Validate GA4 Measurement ID (Plan 006)` — unchanged.
3. `Type check` (`npm run check`) — unchanged.
4. NEW `Source tests` (blocking): `run: node tests/run.js`
   (fail-fast before the build; no `env` needed).
5. `Build Astro` (`npm run build` + existing `env`) — unchanged.
6. NEW `Built output tests` (blocking): `run: node tests/run.js --built`
7. NEW `HTW snapshot` (blocking): `run: node test-htw-snapshot.mjs`
8. NEW `Link & SEO audit` (NON-blocking): `run: node scripts/check-links-seo.js`
   with `continue-on-error: true`, followed by artifact upload of
   `output/seo-audit-report.md`:
   ```yaml
   - name: Link & SEO audit (informational)
     run: node scripts/check-links-seo.js
     continue-on-error: true
   - name: Upload SEO audit report
     if: always()
     uses: actions/upload-artifact@v5
     with:
       name: seo-audit-report
       path: output/seo-audit-report.md
   ```
   Pin the upload action version only if a v5 pin already exists in the file
   for another action — otherwise use the same `actions/upload-artifact@v5`
   line style as `upload-pages-artifact@v5` already present (line 53); do NOT
   introduce a new SHA pin style the repo doesn't use. Match surrounding
   indentation exactly (6 spaces under `steps:`).
9. `Upload artifact` — unchanged.

**Verify**: local re-read of the file shows the 4 new steps in the order
above; `Build Astro` still carries its `env:` block untouched.

### Step 2: Validate workflow syntax without pushing

1. Structural check: `grep -n "run: node tests/run.js\|run: node test-htw-snapshot\|run: node scripts/check-links-seo\|continue-on-error" .github/workflows/deploy.yml`
   → all four present, `continue-on-error` ONLY on the link-audit step.
2. Indentation sanity: `awk` or visual diff — every `- name:` at the same
   indent as existing steps; every `run:`/`uses:`/`with:` aligned with the
   existing `Build Astro` block.
3. YAML parse check: `python3 -c "import yaml,sys; yaml.safe_load(open('.github/workflows/deploy.yml'))"` → exit 0.
   If `pyyaml` is unavailable, STOP and report (do not install anything;
   the reviewer will validate on push).

**Verify**: grep hits as specified; YAML parses.

## Test plan

- No product tests (CI config change). Verification is Step 2 + review of
  the first CI run on the branch (operator's call to push; NOT this plan).
- The gates themselves are covered by Plans 003/009 suites.

## Done criteria

Machine-checkable. ALL must hold:

- [ ] Plan 009 DONE before this plan executes (precondition)
- [ ] `node tests/run.js` exits 0 locally
- [ ] New steps present in order: Source tests → Build → Built tests → HTW → Link audit (non-blocking + artifact)
- [ ] `continue-on-error` appears exactly once (link audit only)
- [ ] YAML parses (`python3 -c` exit 0)
- [ ] `git diff --name-only 79b5347...HEAD` lists only `.github/workflows/deploy.yml`
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- Plan 009 is not DONE, or the local source suite is red.
- `pyyaml` is missing (can't validate YAML locally — report, don't install).
- The live `deploy.yml` doesn't match the "Current state" excerpt (drift).
- Any step would need `env`/secrets beyond what `Build Astro` already has.

## Maintenance notes

For the human/agent who owns this code after the change lands:

- The link audit is `continue-on-error` ON PURPOSE (third-party flakiness).
  If it goes red every run, fix the linked URLs or the checker's allowlist —
  do NOT make it blocking without addressing flake rate first.
- Watch CI minutes: the daily 06:00 UTC scheduled rebuild now also runs the
  full suite. If runtime becomes a problem, cache nothing — instead move the
  source-tests step before the build (already is: fail-fast).
- First push of this branch will exercise the gates end-to-end; review that
  run before merging.
