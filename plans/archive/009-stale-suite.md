# Plan 009: Rewrite the stale assertions in tests/run.js

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 79b5347..HEAD -- tests/run.js src/layouts/BaseLayout.astro public/assets/js src/components src/pages/en/index.astro src/pages/es/index.astro src/data/siteDocuments.ts`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition. ALSO read Plans 007 and 008 first:
> if either already landed, its behavior changes are the new expected values
> (not deviations).

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: LOW
- **Depends on**: plans/007-service-context.md, plans/008-double-submit.md
- **Category**: tests
- **Planned at**: commit `79b5347`, 2026-09-16

## Why this matters

`tests/run.js` is the repo's only automated verification suite, and it is
red on an unmodified checkout (90/106 at plan time). Nearly all 16 failures
are stale assertions: the suite checks source locations the code has vacated
(client JS moved to `public/assets/js/`), copy the refresh rewrote, and a
JSON-LD shape Plan 002 deliberately replaced. A red baseline means no future
change — including Plans 007/008 — can be verified against it. This plan
updates the assertions to the CURRENT intended behavior so the suite is
green and trustworthy again. It changes tests to match intended behavior; it
changes NO source, NO copy, NO behavior.

## Current state

The facts the executor needs, inlined:

- Run `node tests/run.js` on the unmodified checkout. At plan time the 16
  failures were exactly:
  `Layout script uses setNavOpen helper`, `Layout handles Escape and scroll lock`,
  `EN page: PortfolioSection before ServicesSection`, `ES page: PortfolioSection before ServicesSection`,
  `Portfolio subtitle contains "not just repositories"`, `EN title is 'Production Work Index'`,
  `Filter script uses hidden property`, `Submit button has localized sending label`,
  `EN title is 'How I Can Help'`, `Services subtitle contains "recurring problem"`,
  `About title contains "Who I Help"`, `About intro starts with "Operations teams"`,
  `EN description contains "Bilingual"`, `Contact section references privacy expectations`,
  `JSON-LD @type is Person`, `JSON-LD has itemListElement array`.
  Re-run at execution; if Plans 007/008 landed, their intended effects apply.
- Root causes (each verified by the advisor by reading both sides):
  1. **Moved JS** (`tests/run.js` reads the wrong file): `setNavOpen`/`closeNav`/
     Escape/scroll-lock live in `public/assets/js/site-layout.js:68-128`
     (helpers `setNavOpen`, `closeNav`, `event.key === 'Escape'`,
     `document.body.classList.toggle('nav-open'`), not in
     `src/layouts/BaseLayout.astro` (which only loads
     `/assets/js/site-layout.js` + `/assets/js/track.js`, lines 122-123).
     Same for `card.hidden = !match` → `public/assets/js/portfolio-filters.js:15`,
     and `data-sending` → `src/components/IntakeForm.astro:195`
     (`<button ... data-sending={c.submitSending}>`), while the test reads
     `ContactSection.astro`.
  2. **Rewritten copy** (test expects pre-refresh strings): current intended
     strings are — Services title `'Six scoped services. One delivery standard.'`
     (`ServicesSection.astro:13`); Services subtitle starts `Each service starts
     with a concrete operational problem` (same line); About copy lives in
     `AboutSection.astro` (titles differ from `Who I Help`/`Operations teams`);
     Portfolio title/subtitle come from `PortfolioSection.astro:565-577`
     (`Selected production work` / `Production work, with evidence` when full,
     subtitle `Live sites, published packages, and automation already running
     in production.`); EN meta description in `src/pages/en/index.astro:92`
     (`Scoped Python automation, data pipelines, internal tools, ...` — no
     `Bilingual` lead).
  3. **Superseded JSON-LD**: Plan 002 (commit `f61b50c`) split the portfolio
     `ItemList` into its own `portfolioJsonLd` block. Current
     `src/pages/en/index.astro:24-79`: `jsonLd['@type']` is the ARRAY
     `['Person', 'ProfessionalService']` with `makesOffer` (no
     `itemListElement`), plus a separate `portfolioJsonLd` (`@type:
     'ItemList'`, 10 items). Test group `I8b` (`tests/run.js:738-758`)
     asserts the OLD shape (`@type === 'Person'` + `itemListElement` on the
     first block) and therefore fails even on correct output.
  4. **Section order**: homepages now render Services BEFORE Portfolio
     (`src/pages/en/index.astro:107-108`, `src/pages/es/index.astro:106-107`;
     nav order Overview/Proof/Services/Work). Test group `C1`
     (`tests/run.js:244-262`) asserts the old Portfolio-first order.
  5. **Privacy-copy drift**: built check `tests/run.js:874-878` requires the
     EN privacy page to mention `Ahrefs`; `src/` no longer mentions Ahrefs
     anywhere (GA4 migration) — `src/data/siteDocuments.ts` discloses
     `Google Analytics 4`, Formspree, Calendly instead (lines 44, 65, 158).
  6. **Contact privacy note**: `L1` (`tests/run.js:712-726`) reads only
     `ContactSection.astro` for `/privacy/` links, but the disclosure now
     lives in the shared `IntakeForm.astro:67-68,111-112`
     (`privacyHref: '/en/privacy/'`, `cookiesHref: ...`).
- Suite conventions to PRESERVE: the `group`/`assert` helpers, the
  `read()`-relative-path pattern, source-only by default with `--built`
  gating the `dist/` checks, exit-1-on-failure summary. Write new assertions
  in the same style. Do not migrate frameworks.

## Commands you will need

| Purpose | Command | Provenance | Expected on success |
|---------|---------|------------|---------------------|
| Source tests | `node tests/run.js` | executed | exit 0, all pass (after fix; red before) |
| Typecheck | `npm run check` | declared | exit 0 |
| Build | `npm run build` | declared | exit 0 (needed only for `--built` re-check) |
| Built tests | `node tests/run.js --built` | declared | exit 0, all pass (requires `dist/`) |

## Scope

**In scope** (the only file you should modify):
- `tests/run.js` — update stale assertions to current intended behavior ONLY.

**Out of scope** (do NOT touch, even though the failures point at them):
- Every `src/` file, `public/assets/js/` file, `src/data/*` — behavior and
  copy are CORRECT; the tests are wrong. If you find a behavior that looks
  wrong while rewriting an assertion, STOP (see below) — do not "fix" it here.
- `test-htw-snapshot.mjs`, `tests/snapshots/*`, `scripts/check-links-seo.js`.
- `package.json` — do not add/remove scripts.

## Git workflow

- Branch: `advisor/009-stale-suite`
- Commit as one unit (or per test-group cluster); message style: conventional
  commits (e.g. `test(suite): update stale assertions to current behavior`)
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 0: Record the exact baseline

Run `node tests/run.js` on the unmodified checkout; save the full output to
`/tmp/opencode/baseline-tests.txt` (create the dir if needed — it is outside
the repo). Record the failing check names. Read Plans 007/008 status from
`plans/README.md`: if DONE, note their intended effects (per-service
`data-track-form` values; no `fetch(` in `contact-section.js`) as expected.

**Verify**: baseline file exists; failing set matches (or is a stated subset
of) the 16 names in "Current state".

### Step 1: Repoint moved-JS assertions at their real files

Following the existing helper pattern (add `siteLayoutJs`, `portfolioFiltersJs`,
`intakeForm` readers next to the existing shortcuts at `tests/run.js:43-59`):

1. `TT-008` (`tests/run.js:203-228`): read `public/assets/js/site-layout.js`
   for `function setNavOpen` + `closeNav`, `event.key === 'Escape'` +
   `document.body.classList.toggle('nav-open'`, `.navbar__overlay.open` +
   `html.nav-open` (CSS part stays on `globalCss()`).
2. `TT-004` (`tests/run.js:407-424`): assert `card.hidden = !match` in
   `portfolio-filters.js`; keep the `data-categories` source assertion on
   `PortfolioSection.astro` (still true, line 605); keep the
   legacy-hidden-class negative assertions.
3. `TT-018` submit part (`tests/run.js:497-503`): assert `data-sending=`
   in `IntakeForm.astro` instead of `ContactSection.astro`. Keep the other
   three `TT-018` assertions on `ContactSection.astro` (copy labels still live
   there, lines 27-29, 85).

**Verify**: `node tests/run.js` → those three groups pass; nothing else changed.

### Step 2: Update superseded-behavior assertions (order, JSON-LD, privacy)

1. `C1`: flip to the intended order — assert `ServicesSection` BEFORE
   `PortfolioSection` in both `pageEN()` and `pageES()` (match `<ServicesSection`
   / `<PortfolioSection` usage tags as today, just swap the comparison).
2. `I8b` (`tests/run.js:738-758`): rewrite to the Plan-002 shape —
   first JSON-LD block: `@type` is an array containing `Person`, has
   `makesOffer` array, has NO `itemListElement`; SECOND script block parses
   with `@type === 'ItemList'` and `itemListElement.length === 10`.
   (Parse all `ld+json` blocks from `dist/en/index.html`, not just the first.)
3. Built privacy check (`tests/run.js:874-878`): replace the `Ahrefs`
   requirement with `Google Analytics 4` (keep Formspree + Calendly).
4. `L1` (`tests/run.js:712-726`): keep the footer assertion; change the
   contact-side assertion to read `IntakeForm.astro` for `/en/privacy/` +
   `/en/cookies/` + `Formspree` + `Calendly` (and ES equivalents) — the
   disclosure's real home.

**Verify**: `node tests/run.js` (source-only; I8b self-skips without `dist/`)
→ C1/L1 groups pass. Then `npm run build` → exit 0, and
`node tests/run.js --built` → I8b + privacy checks pass.

### Step 3: Update rewritten-copy assertions to current intended strings

Update the expected literals to the CURRENT copy (read each from the cited
source at execution; do not invent). Groups: `D9`, `D10`, `E1`, `E2`, `F1`,
`F2`, `I3`. Current values at plan time are listed in "Current state" §2
(e.g. `D10` → `'Production Work Index'` no longer exists; current EN title
conditional is `Production work, with evidence` (full) /
`Selected production work` (home) — assert against the home value since the
test reads the component default path; `E1` → `Six scoped services. One
delivery standard.`; `F1`/`F2` → read `AboutSection.astro` live).
If Plans 007/008 landed and changed any asserted string/behavior, assert the
POST-007/008 value and note it in the commit message.

**Verify**: `node tests/run.js` → exit 0, `Results: N/N passed` with zero
failures. Then `npm run build && node tests/run.js --built` → exit 0.

## Test plan

- This plan IS the test plan: the suite itself, run source-only and `--built`.
- Structural pattern: existing `group`/`assert` helpers; new file readers
  follow the `const x = () => read('...') || '';` pattern at lines 43-59.
- No `src/` behavior changes, so no new product tests are needed here.

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `node tests/run.js` exits 0 with 0 failures
- [ ] `npm run build` exits 0 and `node tests/run.js --built` exits 0
- [ ] `npm run check` exits 0
- [ ] `git diff --name-only 79b5347...HEAD` lists only `tests/run.js`
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- The baseline failure set does NOT match the 16 names above AND the delta
  isn't explained by Plans 007/008 having landed (something else changed).
- Any stale-looking assertion turns out to describe behavior that is
  genuinely broken (e.g. a `/privacy/` link 404s in built output) — report it
  as a bug instead of blessing it in a test.
- Current copy strings can't be found where cited (drift) — report, don't guess.
- A step's verification fails twice after a reasonable fix attempt.
- The fix requires touching anything outside `tests/run.js`.

## Maintenance notes

For the human/agent who owns this code after the change lands:

- This suite asserts COPY STRINGS — every future copy refresh will redden it.
  That is by design (it catches unintended copy drift), but refresh PRs must
  budget for suite updates in the same PR.
- The suite still doesn't cover: per-service form identity (Plan 007),
  single-submit behavior (Plan 008), or any JS behavior beyond string
  presence. Those are behavioral-test gaps for a later plan, recorded here:
  **Deferred:** Playwright submit-count + filter-interaction tests; unblocked
  by nothing, just not worth doing in a string-match rewrite.
- Reviewers: for each rewritten group, confirm the new expected value was
  read from live source (not invented) and that NO `src/` file changed in
  the diff.
