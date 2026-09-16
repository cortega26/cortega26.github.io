# Plan 022: ES-first keyword research

> **Executor instructions**: Follow this plan step by step. If anything in
> the "STOP conditions" section occurs, stop and report — do not improvise.
> When done, update the status row for this plan in `plans/README.md` —
> unless a reviewer dispatched you and told you they maintain the index.
>
> **Drift check (run first)**: `git diff --stat 15a003d..HEAD -- src/pages docs/tasks/maintenance-checklist.md`
> Read-only plan — the drift check only tells you whether the page inventory
> below is current; on mismatch, re-inventory from live files (no STOP unless
> the URL scheme itself changed).

## Status

- **Priority**: P1 (unblocks 023)
- **Effort**: S
- **Risk**: LOW (read-only; one new docs file)
- **Depends on**: none
- **Category**: direction (organic engine input)
- **Planned at**: commit `15a003d`, 2026-09-16

## Why this matters

The reopened content engine lives or dies on evidence: target the wrong
queries and the pilot burns weeks for nothing. Spanish-language
consulting-intent queries in CL/LATAM are thinly served; English ones pit
the site against the entire world. This plan produces the ranked table that
Plan 023 executes — nothing here builds pages.

## Current state

The facts the executor needs, inlined:

- Indexable surfaces today (do NOT target these queries for new articles):
  12 service pages (`en/services/*` ×6 incl. bespoke HTW, `es/servicios/*`
  ×6), `/en/work/`, `/es/trabajo/`, 4 legal/engagement pages ×2 locales,
  homepages. FAQ schema blocks live on: homepage `FaqSection`, all
  `ServicePage` pages, both bespoke HTW pages.
- Conversion routing rule: commercial-intent queries → existing service
  pages (articles never carry the primary CTA); articles convert THROUGH
  exactly one mapped service page each.
- Sources available WITHOUT credentials: `es-CL` autocomplete +
  people-also-ask (via normal search — no scraping infra, manual sampling
  is fine), LATAM competitor gap (read the 3–5 obvious competing pages'
  headings, note what they omit: pricing, handoff, UF context, executable
  proof). Search Console data is OPERATOR-PROVIDED only: if the maintainer
  pastes a query export into the task, use it (highest confidence); if not,
  proceed with free sources and cap confidence at MED — do NOT stop for it.

## Commands you will need

| Purpose | Command | Provenance | Expected on success |
|---------|---------|------------|---------------------|
| Baseline | `node tests/run.js` | executed | exit 0, green (guards accidents; touched nothing) |

## Scope

**In scope** (the only file you should create):
- CREATE `docs/tasks/keyword-research-es.md` — ranked table + pilot pick.

**Out of scope** (do NOT touch):
- Everything else. No pages, no copy, no config. No web-scraping tooling or
  dependencies. No paid SEO tools (no credentials exist for them).

## Git workflow

- Branch: `advisor/022-keyword-research`
- Commit as one unit; conventional commits (e.g. `docs(seo): add ES-first keyword research table`)
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 0: Baseline + inventory

1. `node tests/run.js` → green, record (no `npm ci` needed).
2. List every indexable URL (sitemap + `src/pages` walk) to enforce the
   no-cannibalization rule in Step 1.

**Verify**: green baseline; URL inventory complete.

### Step 1: Research + table

Write `docs/tasks/keyword-research-es.md` with exactly 10 rows, columns:
query | locale | intent (informational/commercial) | difficulty (LOW/MED/HIGH +
one-line why) | target (NEW article vs existing page URL) | cannibalization
verdict (explicit "none — nearest page X targets Y, this targets Z") |
service-CTA mapping (exactly one `/es/servicios/*` or `/en/services/*` URL
per NEW row) | kill criterion (e.g. "top-20 impressions in 60 days") |
confidence (HIGH only with Search Console evidence, else MED/LOW).

Rules: ES-first (≥7 of 10 ES); commercial intent → existing service page,
never NEW; every NEW row maps to exactly one service CTA; kill criterion on
every NEW row.

**Verify**: 10 rows, all columns filled, ≥7 ES, zero NEW rows competing with
an inventoried URL (reviewer spot-checks 3).

### Step 2: Pilot pick

Recommend exactly 3 (ranked 1–3 with one-line rationale each: intent ×
winnability × CTA fit). Mark which single metric kills each at day 60.

**Verify**: 3 picks, each with metric + kill line. `node tests/run.js`
still green. Commit.

## Test plan

- No product tests. Reviewer verifies table completeness + spot-checks
  cannibalization verdicts against live pages.

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `docs/tasks/keyword-research-es.md` exists: 10 complete rows, ≥7 ES
- [ ] 3 ranked pilot picks with day-60 kill criteria
- [ ] Zero NEW rows without a service-CTA mapping or kill criterion
- [ ] `node tests/run.js` green
- [ ] `git diff --name-only 15a003d...HEAD` lists only the new file
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- Fewer than 10 defensible queries exist (report a shorter honest table
  rather than padding — state this as the outcome, it still completes).
- The URL inventory contradicts "Current state" at the scheme level (e.g.
  routes moved — report, don't reinterpret).
- Any step needs credentials, paid tools, or bulk scraping (forbidden).

## Maintenance notes

For the human/agent who owns this code after the change lands:

- This table expires: re-run the research when the offering changes or
  yearly, whichever comes first. Stale keyword tables misdirect more than
  none.
- Day-60 verdicts feed the runbook (`docs/tasks/maintenance-checklist.md`,
  item 6 area) — wire that reference when the pilot lands.
