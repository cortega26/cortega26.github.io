# Plan 051: Delete the orphaned smoke scripts and stale tracked artifacts; fix the Playwright import

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat be975ef..HEAD -- test-filters.mjs test-prod.mjs test-visual.mjs test-htw-snapshot.mjs test-behavioral.mjs .gitignore favicon.png CLAUDE.md`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: tests / dx
- **Planned at**: commit `be975ef`, 2026-09-23

## Why this matters

Three root-level Playwright scripts are presented by `CLAUDE.md:11` as the
project's smoke tests, but they are print-only (no assertions, no exit
code), hardcode ports that `npm run preview` does not serve (4322/4323 vs
4321), and are wired into neither `package.json` nor CI. A maintainer (or
agent) following CLAUDE.md runs them, sees plausible output and exit 0,
and believes verification happened. Their filter behavior is already
covered with real assertions by `test-behavioral.mjs:548-590`.

Separately: the two wired Playwright suites import `chromium` from
`playwright`, which is **not** a declared dependency (only
`@playwright/test` is); they resolve it through npm's flat hoisting. And a
failed-run artifact (`test-results/.last-run.json`, content
`"status": "failed"`) is committed and not ignored.

## Current state (verified at `be975ef`)

- `test-filters.mjs:1,11` — `import { chromium } from 'playwright'`,
  navigates to `http://localhost:4322/en/`, only `console.log`s.
- `test-prod.mjs:1,10` and `test-visual.mjs:1,10` — same pattern,
  `localhost:4323`.
- `package.json:11-19` and `.github/workflows/deploy.yml` — no references
  to the three scripts.
- `CLAUDE.md:11`:

```
- Playwright smoke tests: `node test-filters.mjs`, `node test-prod.mjs`, `node test-visual.mjs` (run against a local server — `npm run preview` or `npx serve dist`)
```

- `test-htw-snapshot.mjs:11` and `test-behavioral.mjs:12` —
  `import { chromium } from 'playwright';`
- `package.json:23` declares only `@playwright/test`.
- `git ls-files` shows `test-results/.last-run.json` tracked; `.gitignore`
  ignores `dist/`, `.playwright-cli/`, `output/` but **not** `test-results/`.
- Root `favicon.png` is byte-identical to `public/favicon.png` (`cmp`
  returns 0) and is referenced nowhere.
- Root `en/googlefaeab8b5cb4361fb.html` is tracked but outside `public/`
  and absent from `dist/` — **leave it** (Google verification is a
  maintainer decision; see Deferred).

## Commands you will need

| Purpose      | Command                        | Provenance | Expected on success |
|--------------|--------------------------------|------------|---------------------|
| Install      | `npm ci`                       | declared   | exit 0 |
| Build        | `npx --no-install astro build` | executed   | `[build] Complete!`, 30 pages |
| HTW snapshot | `node test-htw-snapshot.mjs`   | executed   | `en: no diff`, `es: no diff` |
| Behavioral   | `node test-behavioral.mjs`     | executed   | `PASS: … 0 failures` |
| Full tests   | `npm test`                     | executed   | exit 0 (218/218 src, 77/77 analytics, 247/247 built) |

Notes: fresh worktree → `npm ci`, then `npx --no-install astro build`
before the Playwright suites. Never `npm run build`.

## Scope

**In scope**:
- Delete `test-filters.mjs`, `test-prod.mjs`, `test-visual.mjs`
- `test-htw-snapshot.mjs` (import line only)
- `test-behavioral.mjs` (import line only)
- `CLAUDE.md` (line 11 only)
- `.gitignore` (add `test-results/`)
- `git rm test-results/.last-run.json`
- Delete root `favicon.png`
- `plans/README.md` (status row only)

**Out of scope**:
- `en/googlefaeab8b5cb4361fb.html` — leave tracked; see Deferred.
- `tests/run.js`, `tests/analytics-*.mjs`, `tests/sitemap-i18n.mjs`.
- Any other CLAUDE.md section — plan 059 owns the rest of that file.

## Git workflow

- Branch: `advisor/051-test-hygiene`
- Conventional commits, e.g. `chore(test): remove orphaned smoke scripts and stale artifacts`.
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 0: Green baseline

`npm ci` → `npx --no-install astro build` → `node test-htw-snapshot.mjs` →
`node test-behavioral.mjs` → `npm test`.

**Verify**: all green. If not, STOP and report.

### Step 1: Confirm the scripts are unreferenced

```bash
grep -rn "test-filters\|test-prod\|test-visual" --exclude-dir=node_modules --exclude-dir=dist --exclude-dir=.git --exclude-dir=plans . | grep -v "^./CLAUDE.md"
```

**Verify**: no matches outside `CLAUDE.md` (and historical `plans/`). If a
reference exists in `package.json`, CI, or `tests/`, STOP and report.

### Step 2: Delete the three scripts and fix the imports

```bash
git rm test-filters.mjs test-prod.mjs test-visual.mjs
```

Change `test-htw-snapshot.mjs:11` and `test-behavioral.mjs:12` to:

```js
import { chromium } from '@playwright/test';
```

**Verify**: `node test-htw-snapshot.mjs` → `no diff` for both locales;
`node test-behavioral.mjs` → `PASS … 0 failures`.

### Step 3: Remove the stale artifacts

```bash
git rm --cached test-results/.last-run.json
rm -f test-results/.last-run.json
git rm favicon.png
```

Add to `.gitignore` (after the `#Test results` section):

```
test-results/
```

**Verify**: `git status --short` shows the deletions staged and no
`test-results` entries; `grep -c "test-results/" .gitignore` → 1.

### Step 4: Fix the CLAUDE.md claim

Replace `CLAUDE.md:11` with:

```
- Browser suites (Playwright): `node test-htw-snapshot.mjs` (heading snapshot) and `node test-behavioral.mjs` (form + filters; starts its own preview server)
```

**Verify**: `grep -n "test-filters\|test-prod\|test-visual" CLAUDE.md` → no
matches.

### Step 5: Full gate

`npx --no-install astro build && npm run check && npm test`

**Verify**: exit 0; HTW `no diff`; behavioral PASS.

## Test plan

No new tests: this plan removes dead scripts and stale artifacts. The
regression protection is that the wired suites (`test-htw-snapshot.mjs`,
`test-behavioral.mjs`, `npm test`) still pass after the import change —
that proves `@playwright/test` re-exports `chromium` in this version.

## Done criteria

ALL must hold:

- [ ] `git ls-files test-filters.mjs test-prod.mjs test-visual.mjs test-results/ favicon.png` → empty
- [ ] `grep -rn "from 'playwright'" test-*.mjs tests/` → no matches
- [ ] `node test-htw-snapshot.mjs` and `node test-behavioral.mjs` pass
- [ ] `npm test` exits 0
- [ ] `git diff --name-only master...HEAD` lists only the in-scope files plus
      `plans/README.md`
- [ ] `plans/README.md` status row for 051 updated

## STOP conditions

Stop and report back (do not improvise) if:

- The drift check shows an in-scope file changed since `be975ef`.
- Step 1 finds a live reference to any of the three scripts.
- `@playwright/test` does not re-export `chromium` (the import change fails
  to run) — report instead of adding `playwright` as a dependency.
- Anything appears to require touching an out-of-scope file.

## Maintenance notes

- New browser tests belong in `test-behavioral.mjs` or a new
  `tests/*.mjs` entry wired into `package.json` and CI — not as
  print-only scripts.
- **Deferred:** `en/googlefaeab8b5cb4361fb.html` — tracked but not served
  by the Astro build. Blocked on a maintainer decision: move it into
  `public/` (served at the domain root), delete it, or confirm DNS
  verification makes it obsolete.
- **Deferred:** dead exports `serviceList` (`src/data/services.ts:1995`)
  and `engagementLine` (`src/data/pricing.ts:100`) — removal touches files
  owned by plans 048/049; fold into a later cleanup.
