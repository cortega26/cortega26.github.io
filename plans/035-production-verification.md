# Plan 035: Verify production after every deploy (live-host check script + scheduled workflow)

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 720521f..HEAD -- scripts/check-production.mjs .github/workflows/production-check.yml package.json README.md docs/tasks/maintenance-checklist.md`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: LOW
- **Depends on**: none
- **Category**: direction (production verification / operations)
- **Planned at**: commit `720521f`, 2026-09-23 (reconciled after plan 039; the only in-scope change since `1508fa2` is an additive paragraph in `maintenance-checklist.md` item 1 — item 2, the excerpt below, is unchanged)

## Why this matters

Every CI gate in this repo runs against source files or `dist/` — nothing ever
checks what `https://tooltician.com` actually serves. Security headers exist
only at the Cloudflare edge (not in the repo), the custom domain is bound by
`public/CNAME`, and the audit's closing criterion #12 (robots/sitemap/
canonicals/hreflang/llms.txt synchronized live) was left as an operator-only
manual step. When a Cloudflare CSP rule is lost or the custom domain drifts,
the first person to notice is whoever happens to run a manual scan. This plan
adds a read-only live-host verifier (`scripts/check-production.mjs`) and a
scheduled, non-blocking workflow that runs it weekly. It does not gate deploys
(the repo already rejected adding flaky external checks to `deploy.yml`).

## Current state

Facts the executor needs, inlined:

- `.github/workflows/deploy.yml` — the only workflow. All gates run before or
  against `dist/`; the `deploy` job (lines 86–97) has no post-deploy step:

  ```yaml
  42:      - name: Type check
  43:        run: npm run check
  44:      - name: Source tests
  45:        run: node tests/run.js
  46:      - name: Build Astro
  47:        run: npm run build
  ...
  56:      - name: Built output tests
  57:        run: node tests/run.js --built
  58:      - name: Sitemap i18n check
  59:        run: node tests/sitemap-i18n.mjs
  ...
  86:  deploy:
  87:    # PR runs verify only — never deploy from a pull request.
  ...
  94:    steps:
  95:      - name: Deploy to GitHub Pages
  96:        id: deployment
  97:        uses: actions/deploy-pages@cd2ce8fcbc39b97be8ca5fce6e763baed58fa128 # v5
  ```

- `docs/content-audit/audits/audit-20260923-response.md:151-153` — the live
  verification gap, verbatim:

  ```text
  Pendiente de operador (no ejecutable desde el repo): validación post-deploy del
  sitio en producción — códigos HTTP por ruta, cabecera CSP y hreflang live
  (paso 5 del plan 034).
  ```

- `docs/tasks/maintenance-checklist.md:31-45` — the A+ posture is re-checked
  by hand (line numbers shifted +3 when plan 039 appended a résumé paragraph
  to item 1; item 2's content below is unchanged):

  ```markdown
  ## 2. A+ security posture
  Where: live site vs `docs/cloudflare-security-headers.md`.
  How:
  1. Re-run `SecurityHeaders.com` and Mozilla Observatory against the
     production host.
  2. On any grade drop, diff live headers vs the doc first:
  curl -sSI https://tooltician.com | head -n 30
  ```

- `README.md:80-82` — why a live check is the only way to catch header loss:

  ```markdown
  - Production is published from GitHub Pages and proxied by Cloudflare.
  - Security headers for an `A+` score must be injected at the Cloudflare edge, because GitHub Pages does not let this repo define response headers directly.
  ```

- `scripts/check-csp-hashes.mjs:15-29` — reusable logic: find the first inline
  `<script>` containing `window.dataLayer` and compute
  `sha256-<base64>`; the pinned hashes live in
  `docs/cloudflare-security-headers.md` as `sha256-...` tokens. Reuse this
  approach against live HTML.

- `tests/sitemap-i18n.mjs:12-19` — precedent for importing the TypeScript
  route registry directly from a Node script (Node 24 strips types):

  ```js
  import {
    routeGroups,
    SITE_ORIGIN,
    alternatesFor,
    groupForPath,
  } from '../src/data/routes.ts';
  ```

- Live facts verified by the advisor on 2026-09-23 (read-only `curl`):
  - `https://tooltician.com/sitemap-index.xml` → one child sitemap,
    `https://tooltician.com/sitemap-0.xml`, containing **29** `<loc>` URLs.
  - `/` response headers include `content-security-policy` (with 5
    `sha256-...` hashes), `strict-transport-security`,
    `x-content-type-options: nosniff`, `referrer-policy`,
    `permissions-policy`.
  - `https://tooltician.com/robots.txt` contains
    `Sitemap: https://tooltician.com/sitemap-index.xml`.
  - `http://tooltician.com/` → `301` to `https://tooltician.com/`.
  - `https://tooltician.com/pricing/` → `404` (locked decision: generic
    routes stay 404).
  - `/en/` HTML carries `hreflang="en" | "es" | "x-default"` links matching
    the `home` route group in `src/data/routes.ts`.

## Commands you will need

| Purpose | Command | Provenance | Expected on success |
|---------|---------|------------|---------------------|
| Typecheck | `npm run check` | declared | exit 0, no errors |
| Source tests | `node tests/run.js` | declared | exit 0, all pass |
| Production check | `node scripts/check-production.mjs` | declared (script does not exist yet; the live URLs it targets were probed by the advisor) | exit 0, `PRODUCTION CHECK: PASS` |
| Negative control | `node scripts/check-production.mjs --base https://tooltician.invalid` | declared | exit 1, `FAIL:` lines printed |
| YAML parse | `node -e "const y=require('yaml');y.parse(require('fs').readFileSync('.github/workflows/production-check.yml','utf8'));console.log('YAML OK')"` | declared (the command itself was not run — the file does not exist yet; the advisor verified `yaml` resolves in this repo's node_modules) | `YAML OK` |
| Build (optional) | `npm run build` | declared | exit 0 |

## Scope

**In scope** (the only files you should modify):
- `scripts/check-production.mjs` (create)
- `.github/workflows/production-check.yml` (create)
- `package.json` (add one `check:prod` script line)
- `README.md` (one line in the Verification section + one bullet in Notes)
- `docs/tasks/maintenance-checklist.md` (item 2: run the automated check first)

**Out of scope** (do NOT touch, even though they look related):
- `.github/workflows/deploy.yml` — do NOT add this check as a deploy gate. The
  repo explicitly rejected making flaky external checks blocking
  (`plans/README.md`, "Findings considered and rejected": "Making the link
  audit or CSP check CI-blocking").
- `scripts/check-links-seo.js` and `scripts/check-csp-hashes.mjs` — leave them
  unchanged; the new script is standalone.
- `scripts/cloudflare-csp-rules.sh` and `docs/cloudflare-security-headers.md`
  — configuration is the operator's; the script only reads the pinned hashes.
- Any `src/` or `public/` file. This plan changes no site code.

## Git workflow

- Branch: `advisor/035-production-check`
- Commit per logical unit, conventional commits (repo examples:
  `fix(ci): run gates on pull requests, deploy on non-PR events only`,
  `chore(deps): npm audit fix — 0 vulnerabilities`). Suggested:
  `feat(ci): add live-host production verification script and scheduled workflow`
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 0: Establish a green baseline

Run `npm run check` and `node tests/run.js` on the unmodified checkout.

- If both pass: record that and proceed.
- If a `declared` command fails on the unmodified checkout: STOP and report
  (broken baseline, not your doing).

**Verify**: both commands exit 0.

### Step 1: Write `scripts/check-production.mjs`

Create a dependency-free Node 24 ESM script that checks the live site. It must:

1. Accept `--base <url>` (default `https://tooltician.com`). Normalize to no
   trailing slash.
2. Fetch with a retry helper: up to 3 attempts, 2 s apart, on network error or
   5xx. Treat 4xx as a result, not a retry.
3. **Sitemap set**: fetch `<base>/sitemap-index.xml`, extract every child
   `<loc>`, fetch each child sitemap, collect all page `<loc>` URLs
   (normalize: ensure trailing slash). Compare against the expected set built
   from `../src/data/routes.ts`:

   ```js
   import { routeGroups, SITE_ORIGIN } from '../src/data/routes.ts';
   const expected = new Set();
   for (const g of routeGroups) {
     for (const p of [g.paths.en, g.paths.es, g.paths.xDefault]) {
       if (p) expected.add(p.endsWith('/') ? p : `${p}/`);
     }
   }
   ```

   Fail on missing or extra URLs, printing both lists. Expected count on
   2026-09-23: **29**.
4. **HTTP + HTML parity**: for each URL in the live sitemap, GET it once
   (default redirect mode) and assert:
   - status 200;
   - the HTML has `<link rel="canonical" href="...">` starting with
     `SITE_ORIGIN` and equal to the fetched URL (after trailing-slash
     normalization);
   - its `<link rel="alternate" hreflang="...">` set equals
     `alternatesFor(groupForPath(pathname))` from the registry (skip the check
     with a `FAIL` if `groupForPath` returns `undefined`).
   Count and report `PASS: N/N URLs returned 200` and
   `PASS: hreflang/canonical parity for N pages`.
5. **Headers** on `<base>/` (GET, read `response.headers`): require
   `content-security-policy`, `strict-transport-security`,
   `x-content-type-options` exactly `nosniff`, `referrer-policy`,
   `permissions-policy`. Report `PASS: security headers present on /`.
6. **CSP hash**: from the `/` HTML, extract the first inline `<script>`
   (no `src=`) whose body includes `window.dataLayer`, compute
   `sha256-` + base64 SHA-256, and assert it appears in the `sha256-...`
   tokens read from `docs/cloudflare-security-headers.md`. Report
   `PASS: CSP inline stub hash matches pinned doc`.
7. **Fixed paths**: `<base>/robots.txt` → 200 and body includes `Sitemap:`;
   `<base>/llms.txt` → 200; `<base>/pricing/` → 404 (locked decision).
8. Print one `PASS: ...` line per check group, then `PRODUCTION CHECK: PASS`
   and exit 0; on any failure print `FAIL: <name>` lines, a summary, and
   exit 1. Never write files.

**Verify**: `node --check scripts/check-production.mjs` → exit 0 (syntax), then
`node scripts/check-production.mjs` → exit 0 with `PRODUCTION CHECK: PASS`.

### Step 2: Negative control

Run `node scripts/check-production.mjs --base https://tooltician.invalid` and
confirm it exits 1 with `FAIL:` output (proves the failure path works).

**Verify**: exit code is 1, no unhandled exception stack trace.

### Step 3: Add the npm script

Add to `package.json` scripts (keep alphabetical/positional style of the file,
one line):

```json
"check:prod": "node scripts/check-production.mjs",
```

**Verify**: `npm run check:prod` → exit 0, `PRODUCTION CHECK: PASS`.

### Step 4: Add the scheduled workflow

Create `.github/workflows/production-check.yml`. Follow `deploy.yml`'s
conventions exactly: pinned action SHAs (copy them from `deploy.yml`),
`node-version: 24`, `cache: npm`.

```yaml
name: Production verification
on:
  workflow_dispatch:
  schedule:
    # Mondays 06:30 UTC — after the daily 06:00 rebuild has had time to deploy.
    - cron: '30 6 * * 1'
permissions:
  contents: read
jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@900f2210b1d28bbbd0bd22d17926b9e224e8f231 # v6
      - uses: actions/setup-node@ad1b57eb8159e2fd3cc753317dd4a4016287218f # v6
        with:
          node-version: 24
          cache: npm
      - run: npm ci
      - run: node scripts/check-production.mjs
```

Do NOT add `continue-on-error` (a red scheduled run is the signal) and do NOT
wire it into `deploy.yml`.

**Verify**: the YAML parse command from the table prints `YAML OK`.

### Step 5: Update the docs

1. `README.md` — in "## Verification" (after the `npm run test:links` line),
   add:

   ```markdown
   - `npm run check:prod` — live-host verification (HTTP codes, hreflang,
     security headers, CSP stub) against `https://tooltician.com`; also runs
     weekly via the `Production verification` workflow.
   ```

2. `docs/tasks/maintenance-checklist.md` — item 2 ("A+ security posture"),
   insert as the new step 1:

   ```markdown
   1. Run `npm run check:prod` (also runs weekly in CI). If it reports FAIL,
      treat it as a header/CSP regression and diff live headers next.
   ```

   Renumber the existing steps (they become 2–4).

**Verify**: `grep -n "check:prod" README.md docs/tasks/maintenance-checklist.md`
→ one hit in each.

### Step 6: Full gate

Run `npm run check && node tests/run.js && npm run check:prod`.

**Verify**: all three exit 0.

## Test plan

- The script is itself the test; there is no unit-test framework for `scripts/`.
- Negative control (Step 2) covers the failure path.
- No new files under `tests/` — adding a network test to `npm test` would make
  the local suite flaky; the scheduled workflow is the right home.

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `node scripts/check-production.mjs` exits 0 and prints `PRODUCTION CHECK: PASS`
- [ ] `node scripts/check-production.mjs --base https://tooltician.invalid` exits 1
- [ ] `npm run check:prod` exits 0
- [ ] YAML parse of `.github/workflows/production-check.yml` prints `YAML OK`
- [ ] `grep -n "check:prod" README.md docs/tasks/maintenance-checklist.md` returns one hit each
- [ ] `npm run check` exits 0 and `node tests/run.js` exits 0
- [ ] `git diff --name-only 720521f...HEAD` lists only the five in-scope files
      (three dots — merge-base comparison)
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- The live sitemap URL set does not match the route registry (missing/extra
  URLs). That is a real drift between `src/data/routes.ts` and production —
  report the diff, do not "fix" the script to match.
- The live `/` response has no `content-security-policy` header, or the live
  inline GA4 stub hash does not match the pinned tokens in
  `docs/cloudflare-security-headers.md`. Report which hash the live site
  serves; do not edit the CSP doc or `scripts/cloudflare-csp-rules.sh`.
- A step's verification fails twice after a reasonable fix attempt.
- The baseline commands (`npm run check`, `node tests/run.js`) fail on the
  unmodified checkout.

## Maintenance notes

For the human/agent who owns this code after the change lands:

- When a new page group is added to `src/data/routes.ts`, the live check
  follows automatically after the next deploy; no script edit needed.
- If Cloudflare changes the header set deliberately, update the required-header
  list in the script and `docs/cloudflare-security-headers.md` in the same
  change — otherwise the weekly run goes red.
- Reviewer should confirm the script only issues GET requests and never writes
  files, and that the workflow is not referenced from `deploy.yml`.
- **Deferred:** create a GitHub issue automatically when the weekly run fails
  (needs `issues: write`); not worth the permission surface until the red run
  has proven actionable at least once.
- **Deferred:** assert the third-party SecurityHeaders.com / Mozilla grade
  programmatically; those APIs are unstable and the header-presence check
  covers the realistic regression.
