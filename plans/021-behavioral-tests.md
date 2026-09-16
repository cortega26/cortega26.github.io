# Plan 021: Behavioral funnel tests (submit-count + filter interaction)

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 15a003d..HEAD -- package.json .github/workflows/deploy.yml src/components/PortfolioSection.astro src/components/IntakeForm.astro public/assets/js/intake-form.js`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: LOW
- **Depends on**: none (needs green tree + Playwright browser in CI — both true)
- **Category**: tests
- **Planned at**: commit `15a003d`, 2026-09-16

## Why this matters

The string-match suite cannot catch behavioral regressions: the
double-submit bug (Plan 008) passed all static checks while firing two
Formspree POSTs per brief. With the funnel under daily traffic, this class
needs a locked gate. An existing smoke script (`test-filters.mjs`) clicks
filters but asserts nothing — and worse, targets `/en/`, where the filter
bar does not render (`PortfolioSection.astro:590`: `{full && <div
class="filter-bar"...` — homepage renders `full=false`). Its "coverage" is
theater. This plan promotes the pattern into asserting tests against the
pages where the behaviors actually live.

## Current state

The facts the executor needs, inlined:

- `test-filters.mjs` (root, 64 lines): `chromium.launch({headless:true})`,
  console/pageerror capture, `page.goto('http://localhost:4322/en/')`,
  counts `.filter-btn` / `.project-card`, clicks
  `button[data-filter="python"]`, checks `aria-pressed`, re-clicks `all`.
  Pure logging, zero assertions, wrong page for filters. USE AS PATTERN ONLY
  (locators, error capture) — do not extend it in place.
- Playwright 1.60.0 in devDependencies; CI installs the browser (HTW step).
  `package.json:14` test chain: `node tests/run.js && node tests/run.js
  --built && node test-htw-snapshot.mjs`. No `test:behavioral` script yet.
- Form under test: homepage `IntakeForm` (`formId="contact"` →
  `id="contact-form"`, `data-track-form="intake_general"`); required fields
  name/email/goal(select)/message; submit handler in
  `public/assets/js/intake-form.js:35-73` (preventDefault → checkValidity →
  fetch POST → success/error UI + ttTrack). Filter pages: `/en/work/` +
  `/es/trabajo/` (`<PortfolioSection full />`); cards carry
  `data-categories`, buttons `data-filter` + `aria-pressed`.
- Local preview convention (CLAUDE.md): `npm run preview` serves `dist/`
  (default port 4321; pass `-- --port 4322` to avoid clashes).

## Commands you will need

| Purpose | Command | Provenance | Expected on success |
|---------|---------|------------|---------------------|
| Install | `npm ci` | declared | exit 0 |
| New suite | `node test-behavioral.mjs` (you create it) | declared | exit 0, all asserts pass |
| Full chain | `npm test` | declared | exit 0 end-to-end |

## Scope

**In scope** (the only files you should create/modify):
- CREATE `test-behavioral.mjs` (root, both tests, self-server-starting — see Step 1)
- `package.json` (append `&& node test-behavioral.mjs` to the `test` script)
- `.github/workflows/deploy.yml` (one blocking step after HTW snapshot; no rebuild)

**Out of scope** (do NOT touch):
- `test-filters.mjs`, `test-htw-snapshot.mjs`, `tests/run.js` (leave the
  legacy smoke script as-is).
- Any `src/` or `public/assets/js/` file — except the temporary,
  never-committed 008-revert used for negative proof (Step 2).

## Git workflow

- Branch: `advisor/021-behavioral-tests`
- Commit as one unit; conventional commits (e.g. `test(e2e): add behavioral submit-count and filter tests`)
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 0: Baseline

`npm ci` if needed. `node tests/run.js --built` → green (dist may be stale;
rebuild first if so). Record counts.

**Verify**: green baseline recorded.

### Step 1: Write the suite (self-contained, server-managing)

Create `test-behavioral.mjs` (plain node + `playwright` import, same style
as `test-filters.mjs`/`test-htw-snapshot.mjs`):

1. Server lifecycle INSIDE the script: spawn `npm run preview -- --port
   4322` as a child process, poll `http://localhost:4322/en/` until 200
   (max ~30s), run tests, kill the server in `finally` (also on failure).
   Never assume a server is already running; never leave one running.
2. Test A — single submit: `page.route('**/formspree.io/**', ...)` counting
   attempts and fulfilling `{status:200, contentType:'application/json',
   body:'{}'}` — NEVER hit production Formspree. Fill name/email/goal
   (select a real option)/message, click submit, assert: exactly 1 POST
   attempt, `.intake-form__success.show` visible, no page errors. (Read the
   live IntakeForm markup for exact selectors — class names cited here are
   from the plan date.)
3. Test B — filters, on BOTH `/en/work/` and `/es/trabajo/`: for each
   filter button, click, assert visible-card count equals cards whose
   `data-categories` includes the filter (compute expectation live from the
   DOM, don't hardcode counts), `aria-pressed` exclusively true, zero
   console/page errors.
4. Exit non-zero with a named failure list on any assert failure; print a
   one-line PASS summary otherwise.

**Verify**: `node test-behavioral.mjs` → exit 0 (proves nothing yet — Step 2
proves it bites).

### Step 2: Prove it bites (negative control, never committed)

1. `git stash list` must be empty before starting (record it). Temporarily
   restore the pre-008 duplicate handler: `git show
   <merge-base-or-pre-008-SHA>:public/assets/js/contact-section.js` — find
   the exact pre-fix blob via `git log --oneline -- public/assets/js/contact-section.js`
   (the 008 fix commit message contains `double-submit`/`duplicate
   Formspree`), write it over the working file (DO NOT commit).
2. Rebuild (`npm run build` — needed: preview serves dist) and run the
   suite → Test A MUST fail with "2 POST attempts" (proves the regression
   lock works). Then `git checkout -- public/assets/js/contact-section.js`,
   rebuild, re-run → green.
3. Confirm `git status --short` shows ONLY the three in-scope paths.

**Verify**: red-then-green demonstrated; tree contains only intended changes.

### Step 3: Wire into chain + CI

1. `package.json`: `test` becomes `node tests/run.js && node tests/run.js --built && node test-htw-snapshot.mjs && node test-behavioral.mjs`.
2. `deploy.yml`: blocking `Behavioral tests` step (`run: node test-behavioral.mjs`)
   after `HTW snapshot` (dist fresh, browser installed — no new setup).
3. Full `npm test` locally → exit 0. YAML parses.

**Verify**: chain green end-to-end; YAML parses; diff lists only the 3 files.

## Test plan

- The suite tests itself via Step 2's red-then-green proof. No separate test files.

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `node test-behavioral.mjs` exits 0 standalone
- [ ] Negative control demonstrated (2-POST failure on restored legacy
  handler, green after restore) — reported with command outputs
- [ ] `npm test` exits 0 end-to-end (includes the new suite)
- [ ] CI contains the blocking step in the right position; YAML parses
- [ ] `git diff --name-only 15a003d...HEAD` lists only the 3 in-scope files
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- Selectors/markup don't match "Current state" (drift — read live, adapt
  minimally, document).
- `astro preview` can't serve dist in this environment (report exact error).
- Formspree interception can't fulfill without network (it must be fully
  offline-safe — if not, STOP, don't weaken to "try live").
- Playwright browser missing despite documented CI install (report; don't
  add install logic to the test file — environment owns browsers).
- A step's verification fails twice after a reasonable fix attempt.

## Maintenance notes

For the human/agent who owns this code after the change lands:

- If IntakeForm fields change, Test A breaks loudly — that's the point; update
  selectors in the same PR as the form change.
- Never point Test A at production Formspree. The interception is load-bearing
  for both correctness and the maintainer's inbox.
- **Deferred:** visual regression (screenshot diffing) — explicitly out of
  scope; propose separately if layout regressions ever bite.
