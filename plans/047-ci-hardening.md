# Plan 047: Scope CI permissions to the deploy job and cache Playwright browsers

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat be975ef..HEAD -- .github/workflows/deploy.yml`
> If the file changed since this plan was written, compare the "Current
> state" excerpts against the live code before proceeding; on a mismatch,
> treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: security (plus perf)
- **Planned at**: commit `be975ef`, 2026-09-23

## Why this matters

1. `deploy.yml` grants `pages: write` and `id-token: write` at the
   **workflow** level, so the build job inherits them. The build job runs
   `npm ci` and `npm run build` (third-party `node_modules` plus repo
   scripts) and receives `GITHUB_TOKEN`; only the deploy job needs those
   elevated permissions. A compromised dependency or same-repo PR branch
   runs with more privilege than necessary.
2. The Playwright Chromium download runs on **every** push, PR, and the
   daily scheduled rebuild, with no browser cache — minutes of redundant
   download per run.

## Current state (verified at `be975ef`)

`.github/workflows/deploy.yml:12-17`:

```yaml
permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
```

Build job uses `GITHUB_TOKEN` at `:52` (stats fetch) and never needs
`pages`/`id-token`. Deploy job (`:84-97`) uses
`actions/deploy-pages` and needs both.

Playwright install, `:61-64`:

```yaml
      - name: Install Playwright browser
        # test-htw-snapshot.mjs launches real Chromium, whose binary is not
        # present on a fresh runner (npm ci installs the npm package only).
        # --with-deps also installs the OS libraries headless Chromium needs.
        run: npx playwright install --with-deps chromium
```

The only cache is `setup-node`'s npm cache (`:28-32`); no
`actions/cache` step exists anywhere in `.github/workflows/`.

Repo convention: actions are pinned by full commit SHA with a version
comment, e.g. `actions/checkout@900f2210b1d28bbbd0bd22d17926b9e224e8f231 # v6`.

## Commands you will need

| Purpose     | Command                                             | Provenance | Expected on success |
|-------------|-----------------------------------------------------|------------|---------------------|
| YAML parse  | see Step 0 (node one-liner with the `yaml` module)   | executed   | prints `permissions OK` |
| Full tests  | `npm test`                                           | executed   | exit 0 (unchanged by this plan) |
| Typecheck   | `npm run check`                                      | executed   | `0 errors`, `0 warnings`, `0 hints` |

Notes: this plan changes CI configuration only; no build is needed to
verify it. `node_modules` is required for the `yaml` module (present at
`be975ef`; `npm ci` if missing).

## Scope

**In scope** (the only file you may modify):
- `.github/workflows/deploy.yml`
- `plans/README.md` (status row only)

**Out of scope** (do NOT touch):
- `production-check.yml` — separate workflow, already `contents: read`.
- Any step ordering or test step — only permissions and the cache/install
  steps change.
- `scripts/` and `package.json`.

## Git workflow

- Branch: `advisor/047-ci-hardening`
- Conventional commits, e.g. `ci: scope deploy permissions to the deploy job; cache Playwright`.
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 0: Baseline YAML parses

```bash
node -e "const fs=require('fs'),y=require('yaml');const w=y.parse(fs.readFileSync('.github/workflows/deploy.yml','utf8'));console.log('jobs:',Object.keys(w.jobs).join(','))"
```

**Verify**: prints `jobs: build,deploy`. If the `yaml` module is missing,
run `npm ci` first. If it still fails, STOP and report.

### Step 1: Move elevated permissions to the deploy job

Replace the workflow-level block (`:12-16`) with:

```yaml
permissions:
  contents: read
```

and add to the `deploy:` job (under `deploy:`, before `environment:`):

```yaml
    permissions:
      pages: write
      id-token: write
```

Leave the build job without its own `permissions` block (it inherits
`contents: read`).

**Verify**:

```bash
node -e "const fs=require('fs'),y=require('yaml');const w=y.parse(fs.readFileSync('.github/workflows/deploy.yml','utf8'));const ok=w.permissions?.contents==='read'&&w.jobs.build.permissions===undefined&&w.jobs.deploy.permissions?.pages==='write'&&w.jobs.deploy.permissions?.['id-token']==='write';if(!ok){console.error(JSON.stringify({top:w.permissions,build:w.jobs.build.permissions,deploy:w.jobs.deploy.permissions}));process.exit(1)}console.log('permissions OK')"
```

→ prints `permissions OK`.

### Step 2: Cache the Playwright browser

1. Resolve the current `actions/cache` v4 commit SHA (the repo pins SHAs):

```bash
git ls-remote https://github.com/actions/cache 'refs/tags/v4*' | sort -V | tail -5
```

Take the highest v4.x tag's peeled commit (`refs/tags/v4.3.0^{}`), or the
commit for the moving `v4` tag. Record the tag name for the comment.

2. Add immediately **before** the existing `Install Playwright browser`
step (`:61`):

```yaml
      - name: Cache Playwright browsers
        uses: actions/cache@<SHA> # v4.x
        with:
          path: ~/.cache/ms-playwright
          key: ${{ runner.os }}-playwright-${{ hashFiles('package-lock.json') }}
          restore-keys: |
            ${{ runner.os }}-playwright-
```

Keep the existing install step unchanged (`--with-deps` still installs OS
libraries; the cache only avoids re-downloading browsers).

**Fallback (allowed, must be reported)**: if `git ls-remote` cannot reach
GitHub from the worktree, use `actions/cache@v4` with a comment
`# v4 — SHA pin pending` and note the deviation in your report.

**Verify**:

```bash
node -e "const fs=require('fs'),y=require('yaml');const w=y.parse(fs.readFileSync('.github/workflows/deploy.yml','utf8'));const names=w.jobs.build.steps.map(s=>s.name);const i=names.indexOf('Cache Playwright browsers'),j=names.indexOf('Install Playwright browser');if(i<0||j<0||i>j)process.exit(1);const step=w.jobs.build.steps[i];if(!String(step.with.key).includes(\"hashFiles('package-lock.json')\"))process.exit(1);console.log('cache OK')"
```

→ prints `cache OK`.

### Step 3: Full gate (regression sanity)

`npm run check && npm test`

**Verify**: exit 0, unchanged from baseline (this plan should not affect
the site build). If `dist/` is missing, run `npx --no-install astro build`
first (never `npm run build`).

## Test plan

No new tests: workflow configuration is verified by the YAML parse
one-liners above. A real CI run happens on the next push; the operator
should confirm the cache hit and that the deploy job still deploys.

## Done criteria

ALL must hold:

- [ ] Step 1's `permissions OK` one-liner prints `permissions OK`
- [ ] Step 2's `cache OK` one-liner prints `cache OK`
- [ ] `grep -c "pages: write" .github/workflows/deploy.yml` → 1 (deploy job only)
- [ ] `grep -c "hashFiles('package-lock.json')" .github/workflows/deploy.yml` → 1
- [ ] `npm run check` and `npm test` exit 0
- [ ] `git diff --name-only master...HEAD` lists only `.github/workflows/deploy.yml`
      and `plans/README.md`
- [ ] `plans/README.md` status row for 047 updated

## STOP conditions

Stop and report back (do not improvise) if:

- The drift check shows `deploy.yml` changed since `be975ef`.
- The `yaml` module is unavailable and `npm ci` does not restore it.
- The deploy job's structure differs from the excerpts (steps/names moved).
- Anything appears to require touching an out-of-scope file.

## Maintenance notes

- The build job must never regain `pages: write`/`id-token: write`; the
  deploy job is the only privileged one.
- If `@playwright/test` is bumped, the cache key (`package-lock.json`
  hash) changes automatically — no manual invalidation needed.
- The `actions/cache` SHA needs periodic re-pinning like the other actions.
- **Deferred:** caching Playwright's OS dependencies (`--with-deps` apt
  packages) — the browser cache covers the large download; apt installs are
  smaller and not worth a second cache layer now.
