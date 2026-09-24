# Plan 063 (runbook): Execute the plan-019 backlink pass with tracked links

> **Executor instructions**: This plan produces an operator runbook and the
> UTM convention; the external edits (owned repos, PyPI, profile) are
> maintainer actions. Create the runbook doc, verify the target list against
> the plan-019 recon, and update the strategy scoreboard row. Do not edit
> external repositories from this plan. When done, update the status row in
> `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat be975ef..HEAD -- docs/tasks/tooltician-strategy-execution-plan.md docs/analytics-sprint-0.md public/assets/docs/scoping-template.md`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P3 (operator work; no site code)
- **Effort**: S to create the runbook; M to execute externally
- **Risk**: LOW-MED (UTM consistency; each external repo is a separate commit)
- **Depends on**: none
- **Category**: direction
- **Planned at**: commit `be975ef`, 2026-09-23

## Why this matters

Zero measurable backlinks exist from the strongest proof assets (79 stars,
two PyPI packages, three live sites) — the strategy scoreboard still reads
"Back-links desde productos propios | 0 medibles | 3 con UTM | `Pendiente`".
The target list and the scoping-template half of plan 019 already shipped;
what remains is an operator pass with consistent attribution. This plan
turns that pass into a checklist with a verification step, so it actually
gets executed and measured rather than re-planned.

## Current state (verified at `be975ef`)

- `docs/tasks/tooltician-strategy-execution-plan.md:151,238,280,287` —
  scoreboard and TS-015 status `Pendiente`; TS-015 is the next unshipped
  program item.
- `plans/archive/019-sample-scope.md:26-34,44-56` — the recon target list:
  `chile-hub`, `rutificador`, `conciliador_bancario`/`bankrecon`, `polla`,
  `DNSpect`, `portfolio-manager-server`, `stop-spam-linkedin`,
  `elrincondeebano`, `tuplatainforma`, `noticiencias`; PyPI pages; the
  `cortega26` GitHub profile.
- `public/assets/docs/scoping-template.md` exists and is linked from
  `ServicePage.astro:371` and `ContactSection.astro:218`.
- `docs/analytics-sprint-0.md:340` — a "Traffic source" measurement row
  already exists, so referrals/UTMs are readable.

## Commands you will need

| Purpose        | Command                                   | Provenance | Expected on success |
|----------------|-------------------------------------------|------------|---------------------|
| Read targets   | `sed -n '26,56p' plans/archive/019-sample-scope.md` | executed | target list |
| Full tests     | `npm test`                                | executed   | exit 0 (docs-only change) |
| Live link check| `node scripts/check-links-seo.js`         | executed   | unaffected |

## Scope

**In scope**:
- `docs/tasks/backlink-execution-2026-09.md` (create)
- `docs/tasks/tooltician-strategy-execution-plan.md` (scoreboard row + a
  pointer to the runbook; do not mark TS-015 done)
- `plans/README.md` (status row only)

**Out of scope**:
- External repositories, PyPI pages, and the GitHub profile — operator
  actions, never automated here.
- `public/assets/docs/scoping-template.md` — already shipped.

## Steps

### Step 1: Build the runbook

Create `docs/tasks/backlink-execution-2026-09.md` containing:

1. **UTM convention** (one line per rule):
   - `utm_source=<product>` where product ∈ {chile-hub, rutificador,
     bankrecon, polla, dnspect, portfolio-manager, linkedin-spam-blocker,
     elrincondeebano, noticiencias}
   - `utm_medium=referral`; `utm_campaign=proof-2026q3`
   - Links point at the most relevant page (service page or home), never a
     raw asset.
2. **Per-target checklist** — for each target from the plan-019 list: the
   exact URL to edit (repo README / PyPI description / profile bio), the
   destination URL with UTMs, a checkbox, and a "verified" column.
3. **Verification** — after each edit, open the link from the external
   source and confirm it lands with the UTM in the address bar; after all
   edits, record referral/UTM presence in GA4 and Search Console (the
   `2026-11-15` review checkpoint is the natural date).
4. **Recording** — how to update the strategy scoreboard row (measured
   backlinks count) and where the evidence lives.

**Verify**: the doc lists every target from `plans/archive/019-sample-scope.md:26-34`
(count them; report the number).

### Step 2: Update the strategy scoreboard pointer

In `docs/tasks/tooltician-strategy-execution-plan.md`, add under the
backlink row a line: "Runbook: `docs/tasks/backlink-execution-2026-09.md` —
operator pass pending; do not mark done until ≥1 attributed referral is
recorded." Leave the status as `Pendiente`.

**Verify**: `grep -n "backlink-execution-2026-09" docs/tasks/tooltician-strategy-execution-plan.md` → 1 match.

### Step 3: Full gate

`npm test` (docs-only; must stay green).

**Verify**: exit 0.

## Test plan

None — operator runbook. The verification is the GA4/Search Console
checkpoint named in the runbook.

## Done criteria

ALL must hold:

- [ ] `docs/tasks/backlink-execution-2026-09.md` exists with the UTM
      convention, the full per-target checklist, and the verification step
- [ ] Every target from plan 019's list is present (count reported)
- [ ] The strategy doc points at the runbook; TS-015 remains `Pendiente`
- [ ] `npm test` exits 0
- [ ] `git diff --name-only master...HEAD` lists only in-scope files plus
      `plans/README.md`
- [ ] `plans/README.md` status row for 063 updated

## STOP conditions

Stop and report back (do not improvise) if:

- The plan-019 target list is missing from the archive (drift).
- You are asked to edit external repositories — that is outside this plan;
  report the request instead.
- Anything appears to require touching an out-of-scope file.

## Maintenance notes

- The runbook is dated (`2026-09`); if the pass is not executed by the
  `2026-11-15` review, re-date or fold it into that review rather than
  leaving a stale checklist.
- **Deferred:** automating referral verification via the Search Console API
  — blocked until the property export is automated (its own deferred item).
