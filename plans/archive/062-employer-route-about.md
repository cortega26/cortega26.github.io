# Plan 062 (design): Decide and draft the About trajectory block for the employer route

> **Executor instructions**: This is a design plan with a hard decision
> checkpoint. Do NOT modify `AboutSection.astro` or add tracking before the
> checkpoint is answered by the maintainer. Keep all deliverables in docs.
> If anything in the "STOP conditions" section occurs, stop and report.
> When done, update the status row for this plan in `plans/README.md` —
> unless a reviewer dispatched you and told you they maintain the index.
>
> **Drift check (run first)**: `git diff --stat be975ef..HEAD -- src/components/AboutSection.astro public/assets/docs/carlos-ortega-resume.pdf public/assets/docs/carlos-ortega-resume-es.pdf docs/tasks/tooltician-strategy-execution-plan.md`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P3 (decision-gated; product direction)
- **Effort**: S for the design deliverable; M if implementation is approved
- **Risk**: LOW (docs only until approved)
- **Depends on**: none
- **Category**: direction
- **Planned at**: commit `be975ef`, 2026-09-23

## Why this matters

The employer route's CV half shipped (plan 039: real EN/ES résumés wired
per locale). What remains is the in-page signal recruiters look for and the
measurement to know whether it works. The strategy doc still lists both as
`Pendiente` and explicitly says the trajectory block "requiere decisión del
mantenedor" — so this plan's job is to make that decision cheap: a drafted,
fact-checked proposal with copy and open questions, not a half-built
section.

## Current state (verified at `be975ef`)

- `docs/tasks/tooltician-strategy-execution-plan.md:24-25,197-198,272-273`
  — TS-007 (trajectory) and TS-008 (profiles) `Pendiente`; §5 scoreboard
  calls the employer route "Parcial — CV real EN/ES enlazado … trayectoria
  pendiente".
- `src/components/AboutSection.astro:9-31,59-61` — three cards (fit /
  delivery / stack) plus the CV button; no role/period/result milestones,
  and no GitHub/LinkedIn links.
- `src/components/Footer.astro:60,65` — GitHub/LinkedIn links exist but
  carry no tracking attribute; `product-analytics.js:325-329` has no
  binding for them.
- `plans/README.md` reconcile log lists "About trajectory block … and
  work-page case-CTA stamping (maintainer decisions)" as blocked.
- Verifiable facts already on file (from plan 039's résumé wiring): the
  EN/ES PDFs at `public/assets/docs/` contain role/period facts (e.g.
  Independent Software Developer Feb 2021–present; Founder Monedario /
  Noticiencias 2025–present; Atento/Movistar Aug 2019–Jan 2021). Read the
  PDFs and use only what they state.

## Commands you will need

| Purpose   | Command                        | Provenance | Expected on success |
|-----------|--------------------------------|------------|---------------------|
| Extract PDF text | `pdftotext public/assets/docs/carlos-ortega-resume.pdf -` | declared | text output |
| Full tests| `npm test`                     | executed   | exit 0 (docs-only change) |

If `pdftotext` is unavailable, read the PDF with the available PDF tooling
and state how you extracted the facts.

## Scope

**In scope**:
- `docs/tasks/about-trajectory-proposal.md` (create)
- `docs/tasks/tooltician-strategy-execution-plan.md` (add a pointer note
  under TS-007/TS-008 linking the proposal; do not change their status)
- `plans/README.md` (status row only)

**Out of scope** (do NOT touch before the checkpoint):
- `src/components/AboutSection.astro`, `src/components/Footer.astro`
- `public/assets/js/product-analytics.js`, `src/data/service-registry.json`
- The résumé PDFs.

## Steps

### Step 1: Extract the verifiable facts

Read both résumé PDFs and list every role with its period, employer, and
one concrete deliverable/result. Mark anything not stated in the PDFs as
unusable. Put the list in the proposal doc under "Verifiable facts".

**Verify**: the proposal lists 3–5 roles, each with a PDF-sourced period.

### Step 2: Draft the block (EN + ES)

In the proposal doc, draft:

- A compact About sub-block: 3–4 milestones, one line each, no invented
  metrics ("built and maintains X" is fine; "grew revenue 40%" is not
  unless the PDF states it).
- EN and ES copy following the repo's bilingual pattern (see
  `AboutSection.astro:9-31` for tone).
- Placement options (inside About vs its own strip) with a recommendation.

**Verify**: both locales drafted; every claim traceable to Step 1.

### Step 3: The measurement decision

Draft the options for profile-link tracking and recommend one:

- **Option A** — stamp `data-portfolio-click` on GitHub/LinkedIn links
  (reuses the existing `portfolio_click` event; no new vocabulary, but
  semantically "project evidence").
- **Option B** — add a canonical `profile_click` event (registry, track
  allowlist, vm tests, S0b-style assertions — more work, cleaner meaning).

State the trade-offs in two sentences each and record the recommendation.
Do not implement either.

### Step 4: DECISION CHECKPOINT — stop and report

Report the proposal path, the drafted copy, the recommended placement, and
the two tracking options. Do **not** edit `AboutSection.astro` until the
maintainer answers. If the maintainer approves in session, proceed to
Step 5; otherwise finish with the proposal and mark this plan BLOCKED
(decision) in the index.

### Step 5 (post-approval only): implement

1. Add the approved block to `AboutSection.astro` (EN/ES copy inline,
   matching the existing pattern).
2. If Option B was chosen, add the event end-to-end (registry, client
   binding, vm tests, `tests/run.js` assertion); if Option A, stamp the
   links and extend the existing `S0b` group.
3. Update the strategy scoreboard rows for TS-007/TS-008 per the outcome.

**Verify**: `npm run check && npm test`; built EN/ES About contains the
milestones; a click on GitHub/LinkedIn emits the chosen event (vm test).

## Test plan

- Design phase: none (docs).
- Implementation phase (post-approval): the chosen tracking option's tests
  plus a built-output assertion that the milestones render in both locales.

## Done criteria (design phase)

ALL must hold:

- [ ] `docs/tasks/about-trajectory-proposal.md` exists with verifiable
      facts, EN/ES drafts, placement recommendation, and the tracking
      options
- [ ] Every drafted claim cites a résumé fact (no invented numbers)
- [ ] `npm test` exits 0 (nothing else changed)
- [ ] `git diff --name-only master...HEAD` lists only in-scope files plus
      `plans/README.md`
- [ ] `plans/README.md` status row for 062 updated (DONE for design or
      BLOCKED on decision)

## STOP conditions

Stop and report back (do not improvise) if:

- A milestone cannot be sourced from the PDFs — leave it out and report.
- The maintainer does not answer the checkpoint in session.
- Anything appears to require touching an out-of-scope file.

## Maintenance notes

- The proposal doc is the decision record; implementation should follow
  the chosen placement and tracking option exactly.
- **Deferred:** making the employer route measurable in GA4 (Key Event for
  the chosen profile event) — a GA4 console step, outside the repo.
