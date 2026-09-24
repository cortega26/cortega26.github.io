# Plan 041: Delete the orphaned `ProofSection` and `ServiceSpotlight` components

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 8bbd56c..HEAD -- src/components/ProofSection.astro src/components/ServiceSpotlight.astro tests/run.js README.md CLAUDE.md`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition. (`plans/README.md` is in scope for
> the status row only and is deliberately excluded from the drift check.)

## Status

- **Priority**: P3
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: tech-debt
- **Planned at**: commit `8bbd56c`, 2026-09-23
- **Executed**: 2026-09-23 on branch `advisor/041-orphan-components`
  (commit `3cc2e5c`), reviewer-verified; not yet merged to `master`

## Why this matters

`src/components/ProofSection.astro` (195 lines) and
`src/components/ServiceSpotlight.astro` (257 lines) are dead code: no page
imports them, they render nowhere, and their last page usage was removed in
`79b5347` ("feat(site): complete bilingual services and portfolio refresh").
They survive only because the string-match test suite still pins
`ProofSection`'s content, and two living docs list `ProofSection` as a live
component. Dead components are a real cost: readers and AI agents working in
this repo orient from `README.md` / `CLAUDE.md` and get misled, and every
future refactor must reason about files that cannot affect output. Deleting
them (and the assertions that pin them) removes ~450 lines of maintenance
surface and makes the docs honest. This is the deferred "orphaned component
cleanup" from plans 036 and 040; it has no user-visible effect.

## Current state

Facts verified at `8bbd56c`:

- `src/components/ProofSection.astro` — 195-line EN/ES proof section
  (dimensions track + proof catalog). No importer anywhere under `src/`.
  Last commit touching it: `79b5347`, which removed it from the home pages.
- `src/components/ServiceSpotlight.astro` — 257-line EN/ES HTW spotlight
  (fits list + reference-pricing aside). No importer under `src/`, no test
  references anywhere.
- Import check (executed at `8bbd56c`; returns nothing outside the component
  files themselves):
  `grep -rn "ProofSection\|ServiceSpotlight" src/ --include="*.astro" --include="*.ts"`
- Remaining references are only in `tests/run.js`, `README.md`, `CLAUDE.md`
  (all in scope below) plus historical records (`docs/**`,
  `Tooltician-audit.html`, `.codegraph/**`, `.codacy/logs/**`) — out of scope.

### `tests/run.js` — the assertions that pin the dead files

The suite is a hand-rolled string-match runner: `group(label, fn)` prints a
header, `assert(name, condition, detail)` counts pass/fail, and `read(path)`
returns file contents or `''` (see `tests/run.js:1-65`). The helper at
`tests/run.js:49`:

```js
const proof      = () => read('src/components/ProofSection.astro') || '';
```

`proof()` is used in exactly three groups (grep `proof()` at `8bbd56c`:
lines 471, 571, 581):

1. `TT-009 · Small external links read as actions` (`tests/run.js:469-488`).
   Only its third assertion touches ProofSection (around lines 483-487):

```js
  assert(
    'Proof links use dedicated proof-link class',
    proofSrc.includes('class="proof-link"') && !proofSrc.includes('class="badge badge-teal"'),
    'Proof links still read like badges instead of actions'
  );
```

   Its first two assertions are on `caseStudies()` and MUST stay.

2. `H1 · Proof section retains core proof layout` (`tests/run.js:570-577`) —
   wholly about the deleted file; remove the whole group:

```js
group('H1 · Proof section retains core proof layout', () => {
  const src = proof();
  assert(
    'ProofSection contains timeline and proof grid',
    src.includes('proof-track') && src.includes('proof-catalog'),
    'ProofSection is missing its core proof layout'
  );
});
```

3. `H2 · Portfolio Manager and LinkedIn extension are included in public work
   surfaces` (`tests/run.js:579-613`) — the first three assertions are on
   `caseStudies()` and MUST stay; the last three are on `proofSrc`
   (`tests/run.js:598-612`) and must go:

```js
  assert(
    'Proof includes Portfolio Manager evidence entry',
    proofSrc.includes('Portfolio Manager') && proofSrc.includes('portfolio-manager-server'),
    'ProofSection is missing the Portfolio Manager evidence entry'
  );
  assert(
    'Proof includes chile-hub evidence entry',
    proofSrc.includes('chile-hub') && proofSrc.includes('chile-hub'),
    'ProofSection is missing the chile-hub evidence entry'
  );
  assert(
    'Proof includes extension distribution links',
    proofSrc.includes('Chrome Web Store') && proofSrc.includes('Firefox Add-ons') && proofSrc.includes('stop-spam-linkedin'),
    'ProofSection is missing the LinkedIn Spam Blocker evidence entry'
  );
```

### Living docs to fix

- `README.md:42` (inside the project-structure list):

```
- `src/components/` — section components (`Navbar`, `HeroSection`, `ServicesSection`, `PortfolioSection`, `ProofSection`, `AboutSection`, `ContactSection`, `Footer`, …)
```

  Remove only the `` `ProofSection`, `` token (backticks + trailing comma).

- `CLAUDE.md:31` (component inventory bullet):

```
- `ProofSection.astro` — Delivery signals with track + catalog layout
```

  Delete the whole bullet line.

### Convention note (do not copy blindly)

`tests/run.js:556-568` has a `G1 · Credentials section retired from homepage`
group that asserts the retired `CredentialsSection.astro` file is absent. This
plan deliberately does NOT add an equivalent anti-resurrection guard for these
two files: the deletion is dead-code hygiene, not a locked product decision,
and a guard would block a deliberate future re-introduction. If the maintainer
wants such a guard later, it is a separate, explicit change.

## Commands you will need

| Purpose      | Command                          | Provenance | Expected on success |
|--------------|----------------------------------|------------|---------------------|
| Install      | `npm ci`                         | declared   | exit 0 |
| Build        | `npx --no-install astro build`   | executed   | `[build] Complete!`, 30 pages |
| Typecheck    | `npm run check`                  | executed   | `0 errors`, `0 warnings`, `0 hints` |
| Full tests   | `npm test`                       | executed   | exit 0; source 223/223 → 218/218, analytics 77/77, built 252/252 → 247/247, sitemap/HTW/behavioral pass |
| Source tests | `node tests/run.js`              | executed   | `All checks passed.` (223/223 before your change) |

Notes:

- `npm test` includes built-output checks (`node tests/run.js --built`) and
  Playwright behavioral tests. A fresh worktree has no `dist/`, so run the
  Build row before `npm test`.
- Do NOT run `npm run build` — it starts with
  `node scripts/fetch-github-stats.js`, which rewrites the committed
  `src/data/github-stats.json`. Use `npx --no-install astro build` (writes
  only the gitignored `dist/`) instead.
- `npm ci` is `declared`: this plan was written in a tree that already had
  `node_modules`. The lockfile exists (`package-lock.json`) and `npm ci` is
  the repo's standard install.
- `--built` reruns the whole source suite and then adds 29 built-only checks,
  so after Step 2 removes 5 source assertions the built total is
  218 + 29 = 247, not 252. (Corrected during execution review, 2026-09-23.)

## Scope

**In scope** (the only files you may modify or delete):

- `src/components/ProofSection.astro` (delete)
- `src/components/ServiceSpotlight.astro` (delete)
- `tests/run.js` (remove the stale helper/assertions named in Step 2 only)
- `README.md` (remove the `ProofSection` token from line 42)
- `CLAUDE.md` (remove the `ProofSection.astro` bullet at line 31)
- `plans/README.md` (status row only)

**Out of scope** (do NOT touch, even though they look related):

- `src/pages/**`, `src/layouts/**`, `src/data/**`, `src/styles/**` — nothing
  there references the two components; `src/data/pricing.ts` keeps five other
  consumers (`ServiceSpotlight` was only one).
- `docs/**` and `Tooltician-audit.html` — historical records that mention the
  old sections on purpose; do not rewrite history.
- `public/assets/js/product-analytics.js` — its `data-proof-click` attribute
  is an analytics mechanism used by the HTW pages, unrelated to
  `ProofSection.astro`.
- `src/pages/index.astro`'s `.proof-list` styles — the root gateway's own
  class, unrelated to `ProofSection.astro`.
- `.codegraph/**`, `.codacy/**` — generated state.

## Git workflow

- Branch: `advisor/041-orphan-components`
- Conventional commits, matching recent history (e.g.
  `refactor(home): keep one Ébano link in the hero; numbers live in the proof band`).
  Suggested single commit:
  `refactor(components): delete orphaned ProofSection and ServiceSpotlight`.
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 0: Establish a green baseline

In the worktree, run: `npm ci`, then `npx --no-install astro build`, then
`npm run check` and `npm test`.

**Verify**: `npm run check` prints `0 errors` / `0 warnings` / `0 hints`;
`npm test` exits 0 with `Results: 223/223 passed` (source), `77 passed, 0
failed` (analytics), `Results: 252/252 passed` (built), and the sitemap / HTW /
behavioral suites pass. If any of this fails on the unmodified checkout, STOP
and report it (broken baseline — do not "fix" it).

### Step 1: Delete the two component files

`git rm src/components/ProofSection.astro src/components/ServiceSpotlight.astro`

**Verify**: `ls src/components/ProofSection.astro src/components/ServiceSpotlight.astro`
→ both report `No such file or directory`; `grep -rn "ProofSection\|ServiceSpotlight" src/`
→ no matches (exit 1).

### Step 2: Remove the stale test assertions

In `tests/run.js`:

1. Delete the helper line 49 (`const proof = () => read(...)`).
2. In `TT-009` (around line 471), delete `const proofSrc = proof();` and the
   `'Proof links use dedicated proof-link class'` assertion (around lines
   483-487). Keep the group's first two assertions.
3. Delete the whole `H1 · Proof section retains core proof layout` group
   (around lines 570-577).
4. In `H2` (around line 581), delete `const proofSrc = proof();` and the three
   `Proof includes ...` assertions (around lines 598-612). Keep the group's
   three `Portfolio includes ...` assertions.

**Verify**: `grep -n "proof()\|proofSrc\|ProofSection" tests/run.js` → no
matches (exit 1); `node tests/run.js` → `All checks passed.` with exactly
`218/218` (223 baseline − 5 removed assertions). If the count is not 218, STOP
and report which assertions you removed.

### Step 3: Fix the two living docs

- `README.md:42`: remove the `` `ProofSection`, `` token from the component
  list.
- `CLAUDE.md:31`: delete the bullet line
  `` - `ProofSection.astro` — Delivery signals with track + catalog layout ``.

**Verify**: `grep -rn "ProofSection\|ServiceSpotlight" README.md CLAUDE.md tests/run.js src/`
→ no matches (exit 1).

### Step 4: Full gate on the final tree

`npx --no-install astro build && npm run check && npm test`

**Verify**: all pass; `node tests/run.js --built` → `247/247` (218 source +
29 built-only; the built run reruns the source suite, and neither component
was rendered so no built-only check changed); `git status --short
src/data/github-stats.json` → empty (no stats drift).

## Test plan

No new tests: this plan removes dead code, so the test work is deleting the
five stale assertions that pin it (Step 2). Regression protection is the
unchanged remainder of the suite: `node tests/run.js` must still pass with
223 − 5 = 218 assertions, and the built suite with 218 + 29 = 247 (the
built run reruns the source suite). The deleted assertions
are named exactly in Step 2 so a reviewer can confirm nothing else was
removed. Do not add an anti-resurrection guard (see the convention note).

## Done criteria

ALL must hold:

- [ ] `npm run check` exits 0 (`0 errors`, `0 warnings`, `0 hints`)
- [ ] `npm test` exits 0; `node tests/run.js` prints `All checks passed.` with
      `218/218`; `node tests/run.js --built` prints `247/247`
- [ ] `git ls-files src/components/ProofSection.astro src/components/ServiceSpotlight.astro`
      → empty
- [ ] `grep -rn "ProofSection\|ServiceSpotlight" src/ tests/run.js README.md CLAUDE.md`
      → no matches (exit 1)
- [ ] `git diff --name-only master...HEAD` lists only the two deleted
      components, `tests/run.js`, `README.md`, `CLAUDE.md`, and
      `plans/README.md` (three dots — compares against the merge base, so it
      still holds if other work lands on `master` meanwhile)
- [ ] `plans/README.md` status row for 041 updated

## STOP conditions

Stop and report back (do not improvise) if:

- The drift check shows an in-scope file changed since `8bbd56c` and the
  "Current state" excerpts no longer match.
- `grep -rn "ProofSection\|ServiceSpotlight" src/` finds an import or render
  (a page started using them — the premise of this plan is false).
- `node tests/run.js` does not drop by exactly 5 assertions.
- A step's verification fails twice after a reasonable fix attempt.
- Anything appears to require touching an out-of-scope file.
- `npm ci` or the Step 0 baseline fails on the unmodified checkout.

## Maintenance notes

- If either component is ever deliberately re-introduced, it must also be
  re-added to the `README.md` / `CLAUDE.md` component lists, and tests for it
  written deliberately — the assertions removed here are not a spec.
- `docs/tasks/tooltician-strategy-execution-plan.md` still lists `TS-009`
  ("map proof overlaps", status `Pendiente`) with `ProofSection` /
  `ServiceSpotlight` as inputs, and `TS-004` mentions `ProofSection`. Those are
  strategy-status records; a future docs touch may close `TS-009` as moot, but
  that is out of scope here.
- The 2026-09-23 reconcile harvest item ("orphaned component cleanup", from
  plans 036 and 040) is fully resolved by this plan; reconcile should mark it
  done and not re-harvest it.
- **Deferred:** a `G1`-style anti-resurrection guard for these two files — not
  added on purpose; unblocked by a maintainer decision to lock the deletion.
- **Deferred:** closing `TS-009` in the strategy doc — needs a maintainer
  decision on whether that doc's status tables still get maintenance; no code
  dependency.
