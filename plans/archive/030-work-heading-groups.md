# Plan 030: Thematic H2 sections on the work pages

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 2a10c13..HEAD -- src/components/PortfolioSection.astro public/assets/js/portfolio-filters.js test-behavioral.mjs tests/run.js`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition. ALSO confirm Plan 029 is DONE —
> this plan consumes its `group` field.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: MED (filter behavior is locked by a behavioral test; group
  wrappers change the DOM the test counts)
- **Depends on**: Plan 029 (caseStudies `group` field)
- **Category**: accessibility / information architecture
- **Planned at**: commit `2a10c13`, 2026-09-23
- **Audit finding(s)**: H-09

## Why this matters

`/en/work/` and `/es/trabajo/` jump straight from one H1 to ten H3 cards
with zero H2 — there is no structural way to navigate ten projects by
screen reader heading list or skim them by theme. The audit asks for thematic
H2 groups. The filter bar must keep working: when a filter hides every card
in a group, the group heading must disappear too, and the behavioral test
that counts visible cards must account for the wrapper.

## Current state (verified 2026-09-23, commit `2a10c13`)

- `src/components/PortfolioSection.astro`: single `.portfolio-grid` (line
  ~615) renders `c.projects` as `article.project-card` with
  `data-categories={proj.filters.join(' ')}`; `full` mode adds the filter
  bar (line ~605) and a `<noscript>` override (613).
- `public/assets/js/portfolio-filters.js` (30 lines):
  `card.hidden = !match; card.setAttribute('aria-hidden', String(!match));`
  and focuses the first visible `.project-link` when the focused button is
  hidden. No group awareness.
- `test-behavioral.mjs` `testFiltersOnPage` (lines 412-470) computes the
  expected count from `data-categories` and compares with
  `.project-card:not([hidden])`; runs on `/en/work/` and `/es/trabajo/`.
- Built work pages today: 1 H1, 0 H2, 10 H3 (verified in
  `dist/es/trabajo/index.html`).
- Plan 029 adds `group` to every case with these four values:
  `python-data` (chile-hub, polla, rutificador), `web-apps` (ebano, monedario,
  noticiencias), `cli-tools` (conciliador, dnspect), `products`
  (portfolio-manager-unified, stop-spam-linkedin), plus `groupLabels` in
  `caseStudies.ts`.

## Commands you will need

| Purpose | Command | Provenance | Expected on success |
|---------|---------|------------|---------------------|
| Typecheck | `npm run check` | declared | exit 0 |
| Source tests | `node tests/run.js` | executed | exit 0 |
| Build | `npm run build` | declared | exit 0 |
| Built tests | `node tests/run.js --built` | declared | exit 0 |
| Behavioral | `node test-behavioral.mjs` | declared | exit 0 |

## Scope

**In scope** (the only files you should create/modify):
- `src/components/PortfolioSection.astro` — group sections in `full` mode only
- `public/assets/js/portfolio-filters.js` — group visibility + focus behavior
- `test-behavioral.mjs` — count within visible groups
- `tests/run.js` — append one `H-09` group

**Out of scope** (do NOT touch):
- Home mode (`full={false}`) layout — it must stay the flat featured grid
- `caseStudies.ts` content (Plan 029 owns it)
- JSON-LD (Plan 033 owns it)
- Filter labels/buttons

## Git workflow

- Branch: `advisor/030-work-heading-groups`
- Conventional commit, e.g. `fix(a11y): group work projects under thematic H2 headings`
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 0: Baseline

1. `node tests/run.js` → green; record counts.
2. `npm run build && node tests/run.js --built && node test-behavioral.mjs` → green baseline.
3. Confirm Plan 029 is DONE; if not, STOP.

**Verify**: green baseline; 029 DONE.

### Step 1: Group the markup (full mode only)

In `PortfolioSection.astro`:

1. Build a grouped list in the frontmatter when `full`:
   ```ts
   const groups = groupOrder.map((group) => ({
     group,
     label: groupLabels[group][lang],
     projects: c.projects.filter((p) => p.group === group),
   })).filter((g) => g.projects.length > 0);
   ```
   `groupOrder` = `['python-data', 'web-apps', 'cli-tools', 'products']`
   (from `caseStudies.ts`; export it there if not already).
2. In `full` mode render:
   ```astro
   {groups.map((g) => (
     <section class="work-group" data-group={g.group} aria-labelledby={`work-group-${g.group}`}>
       <h2 class="work-group__title" id={`work-group-${g.group}`}>{g.label}</h2>
       <div class="portfolio-grid">…cards…</div>
     </section>
   ))}
   ```
   Home mode keeps the current flat `<div class="portfolio-grid">`.
3. Keep the `noscript` override working: update it to show
   `#portfolio-grid .project-card` → `.work-group .project-card` (or use a
   shared class), and hide the filter bar.
4. Add minimal `.work-group` / `.work-group__title` styles consistent with
   the existing section header scale (smaller than the page H1, distinct
   from `.project-title`).

**Verify**: `npm run build`; the work pages now have 1 H1, 4 H2, 10 H3.

### Step 2: Group-aware filters

`public/assets/js/portfolio-filters.js`:
1. After setting each card's `hidden`, compute per group:
   ```js
   document.querySelectorAll('.work-group').forEach((group) => {
     const anyVisible = group.querySelector('.project-card:not([hidden])') !== null;
     group.hidden = !anyVisible;
     group.setAttribute('aria-hidden', String(!anyVisible));
   });
   ```
2. Focus fallback: keep focusing the first visible `.project-link` (now
   inside a visible group).
3. Keep `aria-pressed` exclusivity untouched.

**Verify**: manual click-through on `/es/trabajo/` (or via the behavioral
test) shows no empty group headings.

### Step 3: Update the behavioral test

`test-behavioral.mjs` `testFiltersOnPage`:
1. Expected visible count stays derived from `data-categories` (unchanged).
2. Add an assertion per filter: every `.work-group` with zero matching cards
   is `hidden`, and every group with matches is visible.
3. Add a `headingOutline` assertion (runs once per page, not per filter):
   exactly 1 `h1`, ≥2 `h2` inside `main`, and every `h3` has a preceding
   `h2` (compare document order via `compareDocumentPosition`).

**Verify**: `node test-behavioral.mjs` → exit 0.

### Step 4: Test group `H-09`

Append to `tests/run.js` (built section, skip without dist):
- `/en/work/` and `/es/trabajo/`: exactly one `<h1`, at least four `<h2`,
  and ten `<h3`; every `h3` index > the index of its enclosing group's `h2`
  (regex/index check is acceptable here, matching the suite's existing style).
- The four group labels for the locale appear in the HTML.

**Verify**: `node tests/run.js --built` → exit 0.

## Test plan

- `H-09` group + updated `testFiltersOnPage` + full suite. Negative control:
  temporarily remove the group-hiding logic, run the behavioral test, confirm
  the group assertion fails, restore.

## Done criteria

Machine-checkable. ALL must hold:

- [ ] Work pages: 1 H1 → 4 H2 → 10 H3 in both locales
- [ ] Filtering hides empty groups and never leaves a heading without cards
- [ ] Home portfolio (3 featured) is unchanged
- [ ] `npm run check`, `node tests/run.js`, `node tests/run.js --built`,
      `node test-htw-snapshot.mjs`, `node test-behavioral.mjs` all green
- [ ] `git diff --name-only 2a10c13...HEAD` lists only in-scope files
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- Plan 029 is not DONE (no `group` field).
- The filter behavioral test's expected-count logic cannot be preserved
  without weakening it (report the conflict; do not delete assertions).
- Grouping makes a project unreachable when `group` is missing (all ten must
  be assigned; report any unassigned case).
- A step's verification fails twice after a reasonable fix attempt.

## Maintenance notes

For the human/agent who owns this code after the change lands:

- New projects need a `group`; an unassigned project disappears from the
  grouped view — add a fallback that renders leftovers in a final group, or
  make `H-06`/`H-09` fail loudly (preferred: fail loudly).
- If a fifth group is added, update `groupOrder`, `groupLabels`, the `H-09`
  count assertion, and the behavioral outline assertion together.
