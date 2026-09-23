# Plan 019: Backlink recon + sample-scope template

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat e2e86eb..HEAD -- src/components/ServicePage.astro src/components/ContactSection.astro public/assets/docs/`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P2
- **Effort**: M (recon report + template asset + links)
- **Risk**: LOW
- **Depends on**: none
- **Category**: direction (conversion asset)
- **Planned at**: commit `e2e86eb`, 2026-09-16

## Why this matters

Two trust gaps in one plan. (1) The best proof lives off-site (79 GitHub
stars, two PyPI packages, three live sites) but may not point back — every
missing backlink is a lost funnel entry. (2) The funnel sells *paid
scoping*, yet buyers can't preview the deliverable. A template with one
annotated example section de-risks the purchase. Maintainer decision:
TEMPLATE route (no client data involved — nothing to redact, nothing to leak).

## Current state

The facts the executor needs, inlined:

- Recon targets (from `PortfolioSection.astro` repoMap + copy): repos
  `chile-hub`, `rutificador`, `conciliador_bancario` (PyPI `bankrecon`),
  `polla`, `DNSpect`, `portfolio-manager-server`, `stop-spam-linkedin`,
  `elrincondeebano`, `tuplatainforma` (private), `noticiencias`; PyPI pages
  `rutificador` + `bankrecon`; GitHub profile `cortega26` (pins + profile
  README). Question per target: does a link to `https://tooltician.com`
  exist (repo README, PyPI project/author URL, profile README/pins)?
- Local checkouts: UNKNOWN from the plan — sibling directories of the repo
  root may or may not exist. Check, don't assume (see Step 0).
- Template placement: `ServicePage.astro:348-362` contact brief-card
  (renders on all 5 services × 2 locales — one edit reaches all service
  pages) and `ContactSection.astro` contact-info column (homepage). Both
  already host a Calendly CTA pattern to mirror
  (`ServicePage.astro:357-359`: `landing-cta-group` with ghost button).
- Template content model: the scoping step as sold on-site — inputs,
  outputs, owner, failure modes, success criteria, fixed-price quote
  (vocabulary from `services.ts` scope copy, e.g.
  `pythonAutomation.en` scope/process copy). One annotated example section
  (inputs+outputs for a fictional report-automation flow — clearly labeled
  EXAMPLE, no real client).
- Asset path: `public/assets/docs/scoping-template.md` (bilingual: EN half
  then ES half with a language header, matching the repo's bilingual
  convention without doubling files; served as-is from `public/`).
- Link labels: EN `See a scoping template` / ES `Ver plantilla de alcance`.

## Commands you will need

| Purpose | Command | Provenance | Expected on success |
|---------|---------|------------|---------------------|
| Typecheck | `npm run check` | declared | exit 0, no errors |
| Source tests | `node tests/run.js` | executed | exit 0, green |
| Build | `npm run build` | declared | exit 0, 26 pages |

## Scope

**In scope** (the only files you should modify/create):
- `src/components/ServicePage.astro` (one template link in the brief-card
  CTA group, both locales via existing `c` copy pattern)
- `src/components/ContactSection.astro` (one template link near the
  Calendly/email actions, both locales)
- CREATE `public/assets/docs/scoping-template.md` (bilingual template)

**Out of scope** (do NOT touch):
- Any other repo (findings go in the report; the maintainer fixes off-repo).
- PyPI/GitHub profile (can't edit from here).
- `services.ts` pricing/scope copy, `IntakeForm`, tracking events.

## Git workflow

- Branch: `advisor/019-sample-scope`
- Commits: recon is report-only (no commit); commit asset + links as one
  unit; conventional commits (e.g. `feat(conversion): add scoping template asset and links`)
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 0: Recon + baseline (read-only recon first)

1. `node tests/run.js` → exit 0 green, record.
2. List sibling directories of the repo root; for each flagship repo with a
   local checkout, grep its README for `tooltician.com` (case-insensitive).
   For PyPI pages, GitHub profile README/pins, and repos WITHOUT local
   checkouts: mark `VERIFY MANUALLY` with the exact URL to check — do not
   guess, do not fetch the network (no network recon in this plan).
3. Write the gap table into your final report (NOTES section): target →
   LINKED / MISSING / VERIFY-MANUALLY(url).

**Verify**: green baseline; gap table complete (every target has exactly one
verdict).

### Step 1: Template asset + links

1. Write `public/assets/docs/scoping-template.md`: header stating it is a
   TEMPLATE with an annotated example (not a real engagement); EN sections
   (Inputs / Outputs / Owner / Failure modes / Success criteria / Fixed-price
   quote + one worked EXAMPLE callout) then the same in ES. Tone mirrors
   site copy (fixed scope, handoff-ready, no open-ended hours). No real
   client names, data, or figures anywhere.
2. ServicePage brief-card: add ghost-button link to
   `/assets/docs/scoping-template.md` beside the Calendly CTA
   (`target="_blank" rel="noopener noreferrer"`), EN `See a scoping template`
   / ES `Ver plantilla de alcance`, following the file's `c.*` locale pattern
   (add `c.templateLabel`-style fields to the content type? NO — ServicePage
   copy comes from `services.ts` `ServiceContent`; adding a field there
   touches an out-of-scope file. Instead hardcode the two labels inline with
   a `lang === 'en' ? ... : ...` ternary, matching the file's existing inline
   locale ternaries such as the `ui` object pattern at lines 38-41 — keep it
   minimal and local).
3. ContactSection: same link near the schedule/email actions, EN+ES labels.
4. `npm run check` → exit 0.

**Verify**: typecheck green; `grep -c "scoping-template" src/components/ServicePage.astro src/components/ContactSection.astro` → 2.

### Step 2: Gates

1. `npm run build` → exit 0. `ls dist/assets/docs/scoping-template.md`
   exists (public/ passthrough). Built EN service page + EN homepage contain
   the asset href.
2. `node scripts/check-links-seo.js` → `Internal issues: 0`.
3. `node tests/run.js --built` → exit 0.

**Verify**: all hold.

## Test plan

- Gap table (report) + built-href greps + link-checker internal count +
  suite green. Template prose quality is reviewer-judged (see Maintenance).

## Done criteria

Machine-checkable. ALL must hold:

- [ ] Gap table delivered in report (all targets verdict-assigned)
- [ ] Asset exists, bilingual, zero real-client data
  (`grep -ri "eban\|client name\|acme" public/assets/docs/scoping-template.md` → no hits;
  adjust patterns to whatever fictional names you used — assert none are real)
- [ ] Built EN service + homepage pages link the asset
- [ ] `npm run check` + `npm run build` exit 0; link checker 0 internal;
  suite green source + built
- [ ] `git diff --name-only e2e86eb...HEAD` lists only the two components +
  the new asset file
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- The brief-card/contact layouts don't match "Current state" (drift).
- The `c.*` locale pattern can't accommodate the labels without touching
  `services.ts` (report; don't expand scope).
- Any template section would need real client detail to make sense (rewrite
  the section, never invent client facts).
- A step's verification fails twice after a reasonable fix attempt.

## Maintenance notes

For the human/agent who owns this code after the change lands:

- The EXAMPLE section is fictional by design — if it ever resembles a real
  engagement too closely, it becomes a confidentiality incident, not a
  marketing asset. Reviewers: read it with that lens.
- Off-repo gap fixes (READMEs, PyPI URLs, profile pins) are the
  maintainer's manual backlog — recorded in the executor report, not this repo.
- **Deferred:** converting the template into a per-service filled sample
  (needs a real redactable engagement — maintainer already chose template).
