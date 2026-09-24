# Plan 056: Make the build/verification scripts testable and test their failure paths

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat be975ef..HEAD -- scripts/fetch-github-stats.js scripts/check-production.mjs package.json .github/workflows/deploy.yml`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P2
- **Effort**: M
- **Risk**: MED (refactors a build script that writes committed data)
- **Depends on**: 052 (CI step; if 052 is not DONE, add the step yourself)
- **Category**: tests
- **Planned at**: commit `be975ef`, 2026-09-23

## Why this matters

Two critical scripts have zero tests, and both have silent-pass paths:

1. `scripts/fetch-github-stats.js:86-89` protects the committed
   `src/data/github-stats.json`: when **every** repo fetch falls back, it
   returns without writing, so an offline/scheduled build cannot overwrite
   real star counts with zeros. If that guard regresses, the committed
   stats silently become `0/0` for all ten repos.
2. `scripts/check-production.mjs:254-264` silently skips the CSP stub
   verification when the pinned doc contains no `sha256-` tokens
   (`if (pinned.length > 0) { … }` with no else) — the weekly production
   check can report PASS with CSP validation skipped, unlike
   `scripts/check-csp-hashes.mjs:40-43`, which fails on the same condition.

Neither script can be imported by a test because both run their `main()`
on import (`fetch-github-stats.js:99`, `check-production.mjs:313`).

## Current state (verified at `be975ef`)

`scripts/fetch-github-stats.js:81-97`:

```js
  console.log(`${liveCount}/${REPOS.length} live, ${fallbackCount}/${REPOS.length} fallback`);
  ...
  if (liveCount === 0) {
    console.log('All repos used fallback — leaving src/data/github-stats.json untouched');
    return;
  }

  try {
    writeFileSync(statsFilePath, JSON.stringify(stats, null, 2), 'utf8');
```

…ending with `fetchStats();` at `:99`.

`scripts/check-production.mjs:253-265`:

```js
      const computed = sha256Base64(stub);
      let pinned = [];
      try {
        const doc = await fs.readFile(CSP_DOC_PATH, 'utf8');
        pinned = doc.match(/sha256-[A-Za-z0-9+/=]+/g) || [];
      } catch (error) {
        fail('CSP inline stub hash', `cannot read ${CSP_DOC_PATH}: ${error.message}`);
      }
      if (pinned.length > 0) {
        if (pinned.includes(computed)) pass('CSP inline stub hash matches pinned doc');
        else fail('CSP inline stub hash', `live=${computed} pinned=[${pinned.join(', ')}]`);
      }
```

…ending with `main().catch(...)` at `:310-315`.

## Commands you will need

| Purpose        | Command                                    | Provenance | Expected on success |
|----------------|--------------------------------------------|------------|---------------------|
| Install        | `npm ci`                                   | declared   | exit 0 |
| New suite      | `node tests/script-guards.mjs`             | executed   | all pass |
| Import safety  | see Step 3 verification                    | executed   | no network, no write |
| Full tests     | `npm test`                                 | executed   | exit 0 |

## Scope

**In scope**:
- `scripts/fetch-github-stats.js` (refactor for injection + import guard)
- `scripts/check-production.mjs` (extract a pure CSP verifier + import guard + fail-on-no-pins)
- `tests/script-guards.mjs` (create)
- `package.json` (test chain only)
- `.github/workflows/deploy.yml` (extend the contract-test step)
- `plans/README.md` (status row only)

**Out of scope**:
- The scripts' network behavior, URLs, and output formats — unchanged.
- `scripts/check-csp-hashes.mjs` — already correct.
- `src/data/github-stats.json` — must not change.

## Git workflow

- Branch: `advisor/056-script-guard-tests`
- Conventional commits, e.g. `test(scripts): cover stats fallback guard and production CSP skip; fail on missing pins`.
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 0: Green baseline

`npm ci` → `node scripts/fetch-github-stats.js`? **No** — it would rewrite
the committed stats. Instead: `npm run check` → `npm test`.

**Verify**: all green. If not, STOP and report.

### Step 1: Make `fetch-github-stats.js` injectable and import-safe

1. Change the signature to accept dependencies:

```js
export async function fetchStats({
  fetchImpl = fetch,
  writeImpl = writeFileSync,
  statsFilePath = join(process.cwd(), 'src/data/github-stats.json'),
  repos = REPOS,
  token = process.env.GITHUB_TOKEN,
} = {}) {
```

   Replace the internal `fetch(...)` calls with `fetchImpl(...)`, the
   `REPOS` references with `repos`, the `process.env.GITHUB_TOKEN` reads
   with `token`, and the final `writeFileSync` with `writeImpl`.

2. Guard the CLI invocation at the bottom:

```js
import { pathToFileURL } from 'url';
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  fetchStats();
}
```

**Verify**: `node -e "import('./scripts/fetch-github-stats.js').then(()=>console.log('import OK'))"`
→ prints `import OK` with no network call and no file write;
`node --check scripts/fetch-github-stats.js` → exit 0.

### Step 2: Extract and fix the production CSP verifier

In `check-production.mjs`:

1. Add and export a pure function:

```js
export function verifyCspStub(html, pinnedTokens) {
  const stub = extractFirstDataLayerStub(html);
  if (stub === null) return { ok: false, computed: null, reason: 'no inline <script> containing window.dataLayer' };
  const computed = sha256Base64(stub);
  if (pinnedTokens.length === 0) return { ok: false, computed, reason: 'no sha256 tokens in pinned doc' };
  return pinnedTokens.includes(computed)
    ? { ok: true, computed, reason: 'match' }
    : { ok: false, computed, reason: `live=${computed} pinned=[${pinnedTokens.join(', ')}]` };
}
```

2. Use it in the `main()` CSP block, replacing the `if (pinned.length > 0)`
   silent skip with a `fail(...)` when `!result.ok` (message from
   `result.reason`). A missing pinned list must now **fail**, matching
   `check-csp-hashes.mjs`.

3. Guard `main()` at the bottom:

```js
import { pathToFileURL } from 'url';
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(`FAIL: ${error.message}`);
    process.exit(1);
  });
}
```

**Verify**: `node -e "import('./scripts/check-production.mjs').then(()=>console.log('import OK'))"`
→ `import OK` with no network call; `node --check scripts/check-production.mjs` → exit 0.

### Step 3: Write `tests/script-guards.mjs`

Cover:

- **Stats all-fallback**: call `fetchStats` with a `fetchImpl` that always
  rejects, a `writeImpl` spy, and a temp `statsFilePath` (point it at a
  throwaway file under `os.tmpdir()`); assert the spy was **not** called
  and the function resolved.
- **Stats partial**: `fetchImpl` succeeds for one repo, rejects for the
  rest; assert the spy received JSON containing the live repo's counts and
  fallback zeros for the others (provide a small `repos` array).
- **Stats success**: all succeed → written JSON has the live values.
- **CSP verifier**: build a fake HTML page with an inline
  `window.dataLayer` stub; assert `verifyCspStub(html, [correctHash]).ok`
  is true, `.ok` is false with `[]` (no pins), false with a wrong pin, and
  false for HTML with no stub.

Assertion style: copy the minimal `assert`/`group` harness from
`tests/analytics-service-funnel.mjs:24-40`.

**Verify**: `node tests/script-guards.mjs` → all pass; prove sensitivity by
temporarily passing a wrong pin in one case and confirming the failure
(record it).

### Step 4: Wire into `npm test` and CI

- `package.json:15`: add `node tests/script-guards.mjs` after the other
  contract suites.
- `.github/workflows/deploy.yml`: extend the `Contract tests` step (from
  plan 052) with `&& node tests/script-guards.mjs`. If 052 is not DONE, add
  a step with just this suite.

**Verify**:

```bash
node -e "const fs=require('fs'),y=require('yaml');const w=y.parse(fs.readFileSync('.github/workflows/deploy.yml','utf8'));const step=w.jobs.build.steps.find(s=>s.name==='Contract tests');if(!step||!step.run.includes('script-guards'))process.exit(1);console.log('ci step OK')"
```

→ `ci step OK`.

### Step 5: Confirm the real pipeline still works

```bash
node scripts/fetch-github-stats.js && git status --short src/data/github-stats.json
```

This runs the real script (network + possible rewrite of the committed
stats). **Acceptable only if** the file is byte-identical after the run
(stars unchanged). If it changed, restore it:

```bash
git checkout -- src/data/github-stats.json
```

**Verify**: `git status --short src/data/github-stats.json` → empty.

### Step 6: Full gate

`npm run check && npm test`

**Verify**: exit 0.

## Test plan

- `tests/script-guards.mjs`: three stats cases + four CSP-verifier cases,
  all offline and deterministic.
- Import-safety checks (Steps 1-2) are part of the contract: importing a
  script must have no side effects.
- Sensitivity check required for at least one case per script.

## Done criteria

ALL must hold:

- [ ] `node tests/script-guards.mjs` exits 0
- [ ] `node -e "import('./scripts/fetch-github-stats.js').then(()=>console.log('import OK'))"` prints `import OK` without writing
- [ ] `node -e "import('./scripts/check-production.mjs').then(()=>console.log('import OK'))"` prints `import OK` without network
- [ ] `npm test` exits 0 and includes the new suite
- [ ] Step 4's `ci step OK` one-liner prints `ci step OK`
- [ ] `git status --short src/data/github-stats.json` → empty
- [ ] `git diff --name-only master...HEAD` lists only the in-scope files plus
      `plans/README.md`
- [ ] `plans/README.md` status row for 056 updated

## STOP conditions

Stop and report back (do not improvise) if:

- The drift check shows an in-scope file changed since `be975ef`.
- `node scripts/fetch-github-stats.js` changes `github-stats.json` and
  cannot be restored with `git checkout --` (report immediately).
- The `main()` guard changes the scripts' behavior when run as CLIs
  (verify by running `check-production.mjs` only if the network is
  available; otherwise state that it was not re-run live).
- Anything appears to require touching an out-of-scope file.

## Maintenance notes

- Both scripts are now importable; any new test can call their pure parts.
- The production checker now fails (rather than skips) when the CSP doc has
  no pinned hashes — that is intentional; keep it in sync with
  `check-csp-hashes.mjs`.
- **Deferred:** driving `check-production.mjs` against a local fixture
  server — would need URL/header injection; the pure verifier covers the
  risky branch.
