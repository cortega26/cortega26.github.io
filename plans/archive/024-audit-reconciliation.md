# Plan 024: Audit reconciliation + response doc (audit 2026-09-23)

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 2a10c13..HEAD -- docs/content-audit/audits/`
> If the audit file or the response doc changed since this plan was written,
> compare the "Current state" excerpts against the live files before
> proceeding; on a mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: docs / governance
- **Planned at**: commit `2a10c13`, 2026-09-23
- **Audit finding(s)**: all (H-01…H-12)
- **Execution**: DONE 2026-09-23 (see "Execution record")

## Why this matters

The 2026-09-23 live audit mixes confirmed findings with evidence that no
longer matches the live site. Two findings are stale as written:

- **H-01** claims `/es/trabajo/` develops only El Rincón de Ébano; the live
  page renders all **10** projects (verified with `curl`, 2026-09-23).
- **H-07** claims the English home shows no visible USD range; `/en/` renders
  `from $1,500`, `from $290 / month`, and `from $69 diagnostic`.

Executing plans against stale evidence wastes work and risks regressing
accurate copy. The residual issues behind those two findings are real but
different: H-01's residue is H-06 (no role / verification date per case) and
H-07's residue is H-04 (stage labels: diagnostic vs build vs retainer).

This plan records the finding-by-finding reconciliation, locks the
maintainer decisions, and assigns every finding to an executable plan. The
response doc it creates is the single status authority the rest of the
series (025–034) reports against.

## Current state (verified 2026-09-23, commit `2a10c13`)

- Audit source: `docs/content-audit/audits/audit-20260923.md` — 12 findings,
  12 quick wins, 12 acceptance criteria, score 78/100.
- Live `/es/trabajo/`: 10 project titles present (curl). H-01 stale.
- Live `/en/`: USD ranges present in the engagement-shapes strip. H-07 stale.
- `dist/sitemap-0.xml`: group for `/`, `/en/`, `/es/` carries
  `en=/` + `en=/en/` + `es=/es/` (duplicate `en`, no `x-default`); the three
  ES guides carry no `xhtml:link` at all. H-02 confirmed.
- `src/components/ServicesSection.astro`: `ctaLabel: 'View service'` /
  `'Ver servicio'` used by all six service links. H-03 confirmed.
- `src/data/pricing.ts`: `engagementSummary.es.automation` = `desde 30 UF`
  while `src/data/services.ts` ES CTA reads `desde 3 UF`. H-04 confirmed.
- `src/pages/index.astro`: gateway with H1 `English / Español`, a
  `<noscript>` meta refresh, and a JS first-visit auto-redirect. H-05 confirmed.
- No `/es/guias/` hub; guides linked only from `src/data/services.ts` (2
  links) and one inline link in the ES HTW page. H-08 confirmed.
- `dist/es/trabajo/index.html`: 1 H1, 0 H2, 10 H3. H-09 confirmed.
- `src/components/IntakeForm.astro`: `novalidate`, no `aria-describedby`,
  `aria-errormessage`, or `aria-invalid`. H-10 confirmed.
- Root and work pages: no JSON-LD. `/pricing`, `/docs`, `/login`, `/demo`
  return 404, unlinked, not in the sitemap. H-11 confirmed.
- Guides: bottom `article-cta` only; work cards have no per-case CTA. H-12 confirmed.

## Decisions locked (maintainer, 2026-09-23)

1. **Root** becomes a real bilingual x-default landing; the first-visit
   browser-language auto-redirect is retired (stored preference redirect
   stays). → Plan 031.
2. **Guides** are deliberately ES-only this cycle (`es` + `x-default`);
   no English translations now. → Plans 025 / 032.
3. **Case evidence** publishes role, scope, and verification date; **no new
   metrics**; confidential work is declared explicitly if it exists. → Plan 029.
4. **Generic routes** (`/pricing`, `/docs`, `/login`, `/demo`) stay 404,
   unlinked, and out of the sitemap; they do not represent a real capability.
   → Plan 033 records this in code comments.

## Scope

**In scope** (the only files you should create/modify):
- CREATE `docs/content-audit/audits/audit-20260923-response.md`
- `plans/README.md` + `plans/ROADMAP.md` (series index — already created
  alongside this plan)

**Out of scope** (do NOT touch):
- Any `src/`, `public/`, `tests/`, `scripts/`, or config file. This plan is
  documentation only.

## Commands you will need

| Purpose | Command | Provenance | Expected on success |
|---------|---------|------------|---------------------|
| Live work page | `curl -sL -A "Mozilla/5.0" https://tooltician.com/es/trabajo/ \| grep -c 'project-title'` | executed | ≥ 10 |
| Live EN USD | `curl -s -A "Mozilla/5.0" https://tooltician.com/en/ \| grep -o 'from \$[0-9,]*'` | executed | ≥ 2 matches |
| Sitemap | `curl -s https://tooltician.com/sitemap-0.xml` | declared | 200 |

## Steps

### Step 1: Re-verify live evidence (executed)

1. `curl -sL -A "Mozilla/5.0" https://tooltician.com/es/trabajo/` → confirm
   the 10 project titles (H-01 stale).
2. `curl -s -A "Mozilla/5.0" https://tooltician.com/en/` → confirm USD
   amounts in the shapes strip (H-07 stale).
3. Confirm the remaining findings against source at `2a10c13` (excerpts in
   "Current state").

**Verify**: evidence recorded in the response doc with date + command.

### Step 2: Write the response doc (executed)

Create `docs/content-audit/audits/audit-20260923-response.md` with:

1. Front-matter: `audit`, `response_date`, `status`, `plans` (024–034).
2. A **finding matrix**: `Finding | Severity | Verdict (confirmed/stale/partial)
   | Evidence verified | Owning plan | Status`.
3. The **locked decisions** (above).
4. The **audit §8 acceptance criteria** mapped to the plan that satisfies each.
5. A short note that statuses are updated as plans land.

**Verify**: every one of H-01…H-12 appears exactly once in the matrix; every
row names a plan in 025–034 or documents "no action" with rationale.

### Step 3: Register the series (executed)

`plans/README.md` gets a "Content audit 2026-09-23 series" table (024–034,
status, dependencies, wave) and `plans/ROADMAP.md` gets the wave view with
goto commands and exit gates.

**Verify**: both files list 024–034; 024 marked DONE with the execution note.

## Test plan

Documentation-only; no automated test. The response doc is reviewed by the
maintainer against the audit file.

## Done criteria

- [x] Live H-01/H-07 evidence re-verified (curl, 2026-09-23)
- [x] `docs/content-audit/audits/audit-20260923-response.md` exists with the
      full 12-finding matrix and the four locked decisions
- [x] Every finding maps to an owning plan (025–034) or a documented no-action
- [x] `plans/README.md` + `plans/ROADMAP.md` index 024–034
- [x] Status row updated

## Execution record (2026-09-23)

Executed during plan authoring, against live site + commit `2a10c13`:

- `curl` verified 10 project titles on `/es/trabajo/` (H-01 stale) and USD
  ranges on `/en/` (H-07 stale).
- Source verification: sitemap duplicate `en` on `/` (H-02), six identical
  `VIEW SERVICE`/`Ver servicio` labels (H-03), `desde 30 UF` vs `desde 3 UF`
  (H-04), gateway root (H-05), no guides hub (H-08), 0 H2 on work pages
  (H-09), `novalidate` with no field errors (H-10), no root/work JSON-LD and
  unlinked 404 generics (H-11), guides without top CTA / cases without CTA
  (H-12).
- Decisions 1–4 locked with the maintainer in the same session.
- Response doc + series index written in this same change.

## STOP conditions

Stop and report back (do not improvise) if:

- The live site now contradicts a "confirmed" verdict (re-run the checks
  before assuming the audit is right).
- A finding cannot be mapped to a plan or an explicit no-action.
- The response doc cannot be written without inventing evidence.

## Maintenance notes

For the human/agent who owns this code after the change lands:

- The response doc is the status authority for this audit. Each plan
  (025–034) updates its own finding row when it lands; do not edit audit
  verdicts without new live evidence.
- If a future re-audit contradicts a "stale" verdict, reopen the finding and
  add a dated note — never silently delete the row.
- New findings from later audits get their own response doc; this one stays
  closed when all rows read DONE or NO ACTION.
