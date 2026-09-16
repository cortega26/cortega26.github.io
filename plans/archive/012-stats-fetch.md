# Plan 012: Harden the build-time GitHub stats fetch

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 79b5347..HEAD -- scripts/fetch-github-stats.js src/data/github-stats.json package.json`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: dx
- **Planned at**: commit `79b5347`, 2026-09-16

## Why this matters

`npm run build` starts with `node scripts/fetch-github-stats.js`, which
fetches 10 repos SEQUENTIALLY with no timeout and the deprecated
`token`-scheme auth header, then overwrites `src/data/github-stats.json`
(a tracked source file — every build dirties the working tree). One hung
API call stalls the whole build past usefulness; silent zero-fallbacks then
render wrong star counts on the portfolio (feeds Plan 013's drift). The fix
keeps the resilient never-break-the-build contract while making the fetch
fast, time-bounded, and honest about failures.

## Current state

The facts the executor needs, inlined — `scripts/fetch-github-stats.js`
today (72 lines):

- `REPOS` (10) + `PRIVATE_REPOS = ['tuplatainforma']` (lines 4-17).
- Fallback load of committed `src/data/github-stats.json` (lines 25-29).
- Auth (lines 31-38): `headers['Authorization'] = `token ${token}`` —
  deprecated scheme; current GitHub API expects `Bearer`.
- Fetch loop (lines 41-62): `for (const repo of REPOS)` — sequential,
  `await fetch(...)` with NO timeout/abort, per-repo try/catch falling back
  to `fallback[repo] || { stars: 0, forks: 0 }` (a repo missing from the
  fallback renders as 0/0 with only a console warning).
- Write-back (lines 64-69): always overwrites `src/data/github-stats.json`,
  even when every fetch failed (can persist all-zeros over good data — the
  fallback-then-overwrite ordering means a fully-offline build writes back
  exactly what it read, but a PARTIAL failure bakes zeros for the failed
  repos into the committed file on the next commit).
- `package.json:12`: `"build": "node scripts/fetch-github-stats.js && astro build"` —
  a non-zero exit from the script ABORTS the build. Preserve that the script
  exits 0 whenever the fallback path works (offline builds must keep working).

## Commands you will need

| Purpose | Command | Provenance | Expected on success |
|---------|---------|------------|---------------------|
| Install | `npm ci` | declared | exit 0 |
| Syntax | `node --check scripts/fetch-github-stats.js` | declared | exit 0 |
| Fetch run | `node scripts/fetch-github-stats.js` | declared | exit 0; valid JSON summary (works offline via fallback) |
| Typecheck | `npm run check` | declared | exit 0 |
| Source tests | `node tests/run.js` | executed | same pass/fail set as Step 0 baseline |

## Scope

**In scope** (the only files you should modify):
- `scripts/fetch-github-stats.js` — concurrency, timeout, auth scheme,
  write-back guard, failure summary.

**Out of scope** (do NOT touch, even though they look related):
- `src/data/github-stats.json` VALUES (the script may rewrite the file at
  runtime, but do not hand-edit counts; do not commit the rewritten file in
  this plan — see Step 3).
- `src/components/PortfolioSection.astro` enrichment (Plan 013).
- `package.json` build chain, `.github/workflows/deploy.yml` (Plan 010).
- Caching the API response across builds (no new files/cache dirs — out of
  proportion for 10 tiny responses on a daily build).

## Git workflow

- Branch: `advisor/012-stats-fetch`
- Commit as one unit; message style: conventional commits
  (e.g. `fix(build): harden github stats fetch with timeout and Bearer auth`)
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 0: Baseline

1. `node tests/run.js` → record pass/fail counts.
2. `cp src/data/github-stats.json /tmp/opencode/github-stats.before.json`
   (outside the repo).
3. `node --check scripts/fetch-github-stats.js` → exit 0.

**Verify**: baseline recorded; backup exists.

### Step 1: Concurrent, time-bounded fetch with Bearer auth

Edit `scripts/fetch-github-stats.js` (keep the overall structure, constants,
logging style, and the never-break-the-build contract):

1. Auth: `headers['Authorization'] = `Bearer ${token}`` (keep the
   `User-Agent` + `Accept` headers as-is).
2. Per-request timeout: add `signal: AbortSignal.timeout(10000)` to the
   `fetch` options (10s per repo).
3. Concurrency: replace the sequential `for` loop with `Promise.all` over
   `REPOS.map(...)` (10 parallel requests; same per-repo try/catch →
   fallback semantics). Keep the private-repo skip (`tuplatainforma` without
   token → fallback + info log) as a pre-check inside the mapper.
4. Track per-repo outcome (`ok` vs `fallback`) and, after all settle, print a
   one-line summary: `N/10 live, M/10 fallback`. If MORE than half the repos
   fell back AND a token was present, print a prominent warning line
   (`::warning::`-free plain text — this script also runs locally) but STILL
   exit 0 (offline/tokenless builds must keep working — the build chain uses
   `&&`).

**Verify**: `node --check scripts/fetch-github-stats.js` → exit 0.

### Step 2: Guard the write-back against baking in zeros

Change the write block so the file is only overwritten when at least ONE
repo fetched live; when ALL repos fell back, skip the write and log
`All repos used fallback — leaving src/data/github-stats.json untouched`.
(Rationale: a fully-offline run currently rewrites identical content and
touches mtime; a partially-failed run bakes zeros. The guard fixes both
without changing the happy path.)

**Verify**: simulate full-fallback WITHOUT network trickery: temporarily run
with an invalid token to force failures? NO — that hits the real API.
Instead: `GITHUB_TOKEN= node scripts/fetch-github-stats.js` in a sandbox
copy? The script resolves paths via `process.cwd()`. Safest local proof:
run the script normally once (exit 0), then `node -e` JSON.parse the file
(valid JSON), then `diff` against `/tmp/opencode/github-stats.before.json`
and confirm any differences are ONLY numeric star/fork updates (no shape
change, no zeros where backup had non-zeros unless the API truly returned
them — if a zero appears for a repo the backup had non-zero for, STOP and
report rather than assuming).

### Step 3: Regression check and clean tree

1. `npm run check` → exit 0. `node tests/run.js` → failure set identical to
   Step 0 baseline.
2. `git status --short src/data/github-stats.json` — if the Step 2 run
   modified it, `git checkout -- src/data/github-stats.json` to restore the
   committed counts (this plan changes the SCRIPT; count updates arrive via
   the normal daily build, not via this diff).

**Verify**: suite baseline-identical; working tree contains ONLY the script
change (plus your branch commits).

## Test plan

- No new test files (a network-dependent script is not unit-testable without
  mocks disproportionate to its size; CI's daily build exercises it).
- Machine checks: `node --check`, exit-0 run, JSON validity + numeric-only
  diff, suite baseline comparison.

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `node --check scripts/fetch-github-stats.js` exits 0
- [ ] Script runs exit 0 with AND without `GITHUB_TOKEN` set
- [ ] Console prints the `N/10 live, M/10 fallback` summary
- [ ] `Authorization` uses `Bearer` (grep); no `AbortSignal`-less `fetch(` remains
- [ ] All-fallback runs skip the write (code path present; verified by reading
      the diff if not triggerable offline)
- [ ] `node tests/run.js` failure set identical to Step 0 baseline
- [ ] `git diff --name-only 79b5347...HEAD` lists only `scripts/fetch-github-stats.js`
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- The script doesn't match "Current state" (drift).
- A run exits non-zero in any configuration (the never-break-build contract
  is load-bearing for `npm run build` + scheduled CI).
- Post-run `github-stats.json` shows a zero where the backup had non-zero
  (possible API/auth behavior change — report, don't commit zeros).
- Verification needs network mocks or fixture servers (out of scope).

## Maintenance notes

For the human/agent who owns this code after the change lands:

- If GitHub deprecates `Bearer` for this endpoint or the API shape changes
  (`stargazers_count`/`forks_count`), this script warns-and-falls-back by
  design — staleness shows up as frozen counts, never as a broken build.
  The `N/10 live` summary line is the thing to watch in CI logs.
- **Deferred:** cross-build response caching (unnecessary at daily cadence);
  committing refreshed counts more often than the daily build (counts update
  when the scheduled build's tree is committed — currently they only refresh
  in `dist/`, see the strategy doc's notes on stats freshness).
