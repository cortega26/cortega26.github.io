# Plan 023: Pilot content batch (3 ES articles)

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 15a003d..HEAD -- src/pages astro.config.mjs public/llms.txt scripts/check-links-seo.js`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition. ALSO read Plan 022's status: this
> plan may only proceed if 022 is DONE — its research table is your input
> (article topics, CTA mappings, kill criteria all come from there, not from
> you).

## Status

- **Priority**: P2
- **Effort**: M
- **Risk**: MED (new public surface + new Spanish copy)
- **Depends on**: plans/022-keyword-research.md
- **Category**: direction (organic pilot)
- **Planned at**: commit `15a003d`, 2026-09-16

## Why this matters

The pilot tests whether ES organic content earns impressions at a cost
worth paying — three articles, pre-registered kill criteria, expand-or-cut
at day 60. Small bet, fast verdict, no sunk-cost surface.

## Current state

The facts the executor needs, inlined:

- NO `src/content/` exists (verified at plan time) — greenfield mechanism
  choice, no migration. Decision rule: lightest static-compatible option per
  the INSTALLED Astro version's content docs (content collections vs
  colocated markdown vs plain `.astro` pages), judged on build
  determinism + automatic sitemap inclusion. Document the choice in one
  paragraph in the final report; do not gold-plate.
- Proven patterns to reuse: `ServicePage` FAQ JSON-LD block shape;
  `BaseLayout` props (title/description/lang/canonical/alternates);
  bilingual convention (`lang === 'en' ? en : es` — pilot is ES-first: ES
  required for all 3, EN only if the 022 table justifies a row).
- `public/llms.txt` enumerates content surfaces — update ONLY if it lists
  pages individually (read it; if it describes sections generically, leave it).
- Voice reference: service-page scope/process copy in `src/data/services.ts`
  (fixed scope, handoff-ready, no open-ended hours — match this register,
  never marketing fluff).

## Commands you will need

| Purpose | Command | Provenance | Expected on success |
|---------|---------|------------|---------------------|
| Install | `npm ci` | declared | exit 0 |
| Typecheck | `npm run check` | declared | exit 0, no errors |
| Source tests | `node tests/run.js` | executed | exit 0, green |
| Build | `npm run build` | declared | exit 0 |

## Scope

**In scope** (the only files you should create/modify):
- New article pages per the chosen mechanism (exactly the 022 pilot rows —
  no extra topics)
- Bidirectional internal links (article → mapped service page; service
  page → article ONLY where it deepens an existing question — minimal,
  surgical link insertions, no service-copy rewrites)
- `public/llms.txt` — ONLY if it enumerates pages individually

**Out of scope** (do NOT touch):
- Service-page copy beyond the surgical links above; pricing; any other
  component; English versions unless a 022 row justifies one; newsletter,
  comments, or any dynamic feature.

## Git workflow

- Branch: `advisor/023-pilot-batch`
- Commit per article or as one unit; conventional commits (e.g.
  `feat(content): add ES pilot article on <topic>`)
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 0: Inputs

1. Read Plan 022's table (`docs/tasks/keyword-research-es.md`): extract the
   3 ranked picks with their CTA mappings + kill criteria. If 022 is not
   DONE, STOP.
2. `node tests/run.js` → green baseline. `npm ci` if needed.

**Verify**: 3 topics + mappings + kills in hand; green baseline.

### Step 1: Mechanism + articles

1. Choose the content mechanism per the decision rule above; record why.
2. Write the 3 articles: 800–1,200 words ES (neutral LATAM register — no
   unresolved chileanismos unless the query is Chile-specific, in which
   case say so), author byline (Carlos Ortega Gonzalez), one service CTA
   each (per 022 mapping), FAQ JSON-LD where the article answers discrete
   questions. No invented statistics, no fake case details, no testimonial
   fabrication — every factual claim must trace to site copy or be
   explicitly framed as the author's stated practice.
3. `npm run check` → exit 0.

**Verify**: typecheck green; each article traces to one 022 row.

### Step 2: Links + gates

1. Bidirectional links per Scope. Rebuild; confirm new URLs in
   `dist/sitemap-*.xml`; confirm CTA hrefs resolve in built HTML.
2. `node scripts/check-links-seo.js` → `Internal issues: 0`.
3. `node tests/run.js --built` + `test-htw-snapshot` → green.

**Verify**: sitemap includes articles; 0 internal issues; suites green.

## Test plan

- Gates above + reviewer reads all 3 articles for register, honesty, and
  CTA correctness (human judgment — the executor flags any uncertain
  phrasing in NOTES rather than smoothing it over).

## Done criteria

Machine-checkable. ALL must hold:

- [ ] Exactly the 022 pilot topics exist (no extras); ES complete
- [ ] Sitemap covers the new URLs; internal links resolve both directions
- [ ] `npm run check` + `npm run build` exit 0; link checker 0 internal
- [ ] Suites green (source + built + HTW)
- [ ] `git diff --name-only 15a003d...HEAD` lists only in-scope files
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- 022 is not DONE.
- The installed Astro version's content story contradicts the decision rule
  (report options, don't improvise a custom loader).
- An article can't be written honestly from available sources (thin topic —
  report, cut it to a 2-article pilot rather than padding).
- Kill criteria can't be traced to 022 rows.
- A step's verification fails twice after a reasonable fix attempt.

## Maintenance notes

For the human/agent who owns this code after the change lands:

- Day-60 Search Console verdict per article (criteria from 022): expand
  winners into clusters, cut losers, no sunk-cost surface. Wire the
  reference into `docs/tasks/maintenance-checklist.md` item 6 area.
- If a second batch is approved, it earns Plan 024 — never silently extend
  this pilot.
