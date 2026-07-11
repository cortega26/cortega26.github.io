# Plan 001: Establish a type-check verification gate and adopt the orphaned link checker

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 676bd14..HEAD -- package.json .github/workflows/deploy.yml tsconfig.json`
> If `package.json` or `.github/workflows/deploy.yml` changed since this plan
> was written, compare the "Current state" excerpts against the live code
> before proceeding; on a mismatch, treat it as a STOP condition.
>
> **Also check the working tree first**: run `git status`. If `package.json`
> and `package-lock.json` show as modified and their diff adds a
> `"geo-opt": "file:../../../../../tmp/geo-opt"` dependency, that is an
> unrelated stray experiment that will break `npm ci`. Run
> `git checkout HEAD -- package.json package-lock.json` to discard it BEFORE
> starting this plan, otherwise `npm ci`/`npm install` here may fail. If the
> diff contains anything other than the geo-opt dependency, STOP and report.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: dx / tests
- **Planned at**: commit `676bd14`, 2026-07-10

## Why this matters

`tsconfig.json` already extends `astro/tsconfigs/strictest`, but **nothing in
the repo ever runs a type check**. There is no `check` or `lint` script in
`package.json`, and the deploy workflow only does `npm ci && npm run build`.
`astro build` does not fail on most TypeScript errors in `.astro` frontmatter
or in `src/data/*.ts`, so a broken type, a malformed JSON-LD object, or a
renamed prop can ship to production silently. This plan adds one deterministic
gate (`astro check`) and runs it in CI, and it wires the already-written but
orphaned `scripts/check-links-seo.js` into an npm script so it is discoverable.
After this lands, later refactors (see plans 002 and 003) have a real safety
net instead of a green build that checks nothing.

## Current state

- `package.json` — no `check`/`lint` script; `@astrojs/check` and `typescript`
  are **not** installed. Current scripts and devDependencies:

  ```json
  "scripts": {
    "dev": "astro dev",
    "build": "node scripts/fetch-github-stats.js && astro build",
    "preview": "astro preview",
    "astro": "astro"
  },
  "devDependencies": {
    "@astrojs/sitemap": "^3.2.0",
    "@playwright/test": "^1.60.0",
    "astro": "^7.0.2"
  }
  ```

- `tsconfig.json` — strict config is already in place, so `astro check` will
  actually enforce something:

  ```json
  { "extends": "astro/tsconfigs/strictest", "compilerOptions": { "baseUrl": ".", "paths": { "@/*": ["src/*"] } } }
  ```

- `.github/workflows/deploy.yml` — the build job (lines 17–35) installs and
  builds but never type-checks:

  ```yaml
      - name: Install dependencies
        run: npm ci
      - name: Build Astro
        run: npm run build
  ```

- `scripts/check-links-seo.js` — a standalone link/SEO checker that reads the
  built site from `../dist` (line 7: `const DIST_DIR = path.resolve(__dirname, '../dist');`).
  It is run today only by hand (`node scripts/check-links-seo.js`) and is
  referenced in `docs/tasks/tooltician-strategy-execution-plan.md` but wired
  into nothing.

- `test-filters.mjs`, `test-prod.mjs`, `test-visual.mjs` — Playwright smoke
  scripts that `import { chromium } from 'playwright'` and expect a static
  server on **port 4322 or 4323** serving `dist` with `.html` URLs (i.e.
  `npx serve dist`, **not** `astro preview` on 4321). They are intentionally
  **out of scope** here (see Scope) because their hardcoded ports and browser
  install make them a poor CI gate; plan 003 builds a proper snapshot harness.

Repo conventions to match: this is a static Astro v7 site, `output: 'static'`,
Node `>=24`. Commit messages follow Conventional Commits (see
`git log --oneline`: `fix(badge): ...`, `feat: ...`, `chore(deps): ...`).

## Commands you will need

| Purpose            | Command                                   | Expected on success                 |
|--------------------|-------------------------------------------|-------------------------------------|
| Install new tools  | `npm install -D @astrojs/check typescript`| exit 0, `package.json` updated      |
| Clean install      | `npm ci`                                  | exit 0                              |
| Type check         | `npm run check`                           | exit 0, `0 errors`                  |
| Build              | `npm run build`                           | exit 0, writes `dist/`             |
| Link check         | `npm run test:links` (after a build)      | exit 0, no broken links reported    |

> Note: `npm run build` first runs `scripts/fetch-github-stats.js`, which
> fetches from the GitHub API. It has a fallback and does not fail the build
> offline, but it may print `✗ Failed to fetch ...` warnings — that is normal
> and not an error.

## Scope

**In scope** (the only files you should modify):
- `package.json` — add two devDependencies and two scripts.
- `package-lock.json` — updated automatically by `npm install`.
- `.github/workflows/deploy.yml` — add one type-check step.

**Out of scope** (do NOT touch, even though they look related):
- Any file under `src/` — this plan must not change site source. If
  `astro check` reports errors in `src/`, that is a STOP condition (see below),
  not a license to edit source here.
- `test-filters.mjs`, `test-prod.mjs`, `test-visual.mjs` — do not rewire their
  ports or add them to CI in this plan; their reconciliation is deferred.
- `scripts/check-links-seo.js` — wire it via an npm script only; do not edit
  the script itself.
- Adding ESLint/Prettier — out of scope; this plan is the type-check gate only.

## Git workflow

- Branch: `advisor/001-verification-baseline`
- One commit per logical unit; Conventional Commits style, e.g.
  `chore(dx): add astro check type gate and wire link checker`.
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Install the type-check tooling

Run:

```bash
npm install -D @astrojs/check typescript
```

This adds `@astrojs/check` and `typescript` to `devDependencies` in
`package.json` and updates `package-lock.json`.

**Verify**: `node -e "const p=require('./package.json'); if(!p.devDependencies['@astrojs/check']||!p.devDependencies.typescript) process.exit(1); console.log('ok')"` → prints `ok`

> If `npm install` errors because `@astrojs/check` is incompatible with
> `astro@^7`, STOP and report the exact npm error (do not downgrade astro).

### Step 2: Add the `check` and `test:links` scripts

Edit the `scripts` block in `package.json` so it reads exactly:

```json
  "scripts": {
    "dev": "astro dev",
    "build": "node scripts/fetch-github-stats.js && astro build",
    "preview": "astro preview",
    "check": "astro check",
    "test:links": "node scripts/check-links-seo.js",
    "astro": "astro"
  },
```

**Verify**: `npm run check --silent` runs (exit code captured in Step 3). For
now just confirm the script exists:
`node -e "const p=require('./package.json'); if(!p.scripts.check||!p.scripts['test:links']) process.exit(1); console.log('ok')"` → prints `ok`

### Step 3: Run the type check and confirm the baseline is green

```bash
npm run check
```

**Verify**: exit code `0` and output ends with `0 errors` (warnings are
acceptable; errors are not).

> **This is the load-bearing step.** If `npm run check` reports one or more
> **errors**, do NOT edit `src/` to fix them and do NOT wire a red gate into
> CI. STOP and report the full error list to the operator — they decide
> whether to fix the types or adjust `tsconfig`. Only proceed to Step 4 when
> `npm run check` exits 0.

### Step 4: Add the type-check step to CI

In `.github/workflows/deploy.yml`, insert a type-check step **between** the
"Install dependencies" and "Build Astro" steps so the pipeline fails fast on
type errors:

```yaml
      - name: Install dependencies
        run: npm ci
      - name: Type check
        run: npm run check
      - name: Build Astro
        run: npm run build
```

**Verify**: `grep -n "npm run check" .github/workflows/deploy.yml` → returns one
match; and confirm it appears on a line *before* the `npm run build` line:
`awk '/npm run check/{c=NR} /npm run build/{b=NR} END{exit !(c>0 && c<b)}' .github/workflows/deploy.yml && echo "order ok"` → prints `order ok`

### Step 5: Confirm the link checker is reachable and a clean install still works

```bash
npm run build
npm run test:links
```

**Verify**: `npm run build` exits 0 and creates `dist/`; `npm run test:links`
exits 0. If `test:links` reports genuinely broken internal links, capture the
output and note it in your report, but this is not a STOP condition for this
plan (the checker is being *adopted*, not asked to pass perfectly for the
first time) unless the operator said otherwise.

> `npm run build` also runs `scripts/fetch-github-stats.js`, which rewrites
> `src/data/github-stats.json` from the live GitHub API. That is a normal build
> side-effect, **not** part of this change. Discard it before the final
> `git status` check: `git checkout -- src/data/github-stats.json`.

Then confirm the manifest/lockfile are consistent:

```bash
npm ci
```

**Verify**: exit 0 (proves `package.json` and `package-lock.json` agree, i.e.
CI will not fail on install).

## Test plan

This plan adds tooling rather than product code, so the "tests" are the gates
themselves:

- `npm run check` must exist and exit 0 (Step 3).
- CI must run `npm run check` before `npm run build` (Step 4).
- `npm ci` must succeed with the updated lockfile (Step 5).

No new unit tests are required. Do not attempt to add the Playwright
`test-*.mjs` scripts to CI in this plan.

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `@astrojs/check` and `typescript` are in `devDependencies` (Step 1 verify)
- [ ] `npm run check` exits 0 with `0 errors`
- [ ] `npm run test:links` exists as a script and runs after a build
- [ ] `.github/workflows/deploy.yml` runs `npm run check` before `npm run build`
- [ ] `npm ci` exits 0 (lockfile consistent)
- [ ] After `git checkout -- src/data/github-stats.json`, `git status` shows
      only `package.json`, `package-lock.json`, and
      `.github/workflows/deploy.yml` modified — nothing else under `src/`
- [ ] `plans/README.md` status row for 001 updated

## STOP conditions

Stop and report back (do not improvise) if:

- The working-tree `geo-opt` dependency is present but its diff contains
  changes beyond the geo-opt line (you cannot safely revert it).
- `npm install -D @astrojs/check typescript` fails on a peer/version conflict
  with `astro@^7`.
- `npm run check` reports **errors** (Step 3) — report the list; do not fix
  `src/` and do not wire a red gate.
- Making the check pass appears to require editing any file under `src/`.
- `npm ci` fails after your changes.

## Maintenance notes

For the human/agent who owns this after the change lands:

- The Playwright smoke scripts (`test-filters.mjs`, `test-prod.mjs`,
  `test-visual.mjs`) are still orphaned. They hardcode ports 4322/4323 and
  expect `npx serve dist` (dist served with `.html` URLs), not `astro preview`
  (port 4321, extensionless URLs). Reconciling their ports and adding a
  browser-install + serve step to CI is a deliberately deferred follow-up.
  Plan 003 builds a fresh snapshot harness rather than reusing these.
- When `@astrojs/check` reports *warnings*, they do not fail the gate. If you
  want the gate stricter later, add `--minimumFailingSeverity warning` to the
  `check` script — but confirm the codebase is warning-clean first.
- A reviewer should scrutinize that the CI `Type check` step sits *before*
  `Build Astro`, so type errors fail the pipeline before the slower build.
