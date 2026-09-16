# Plan 014: Point contact CTAs at the section, not the form element

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 79b5347..HEAD -- src/components/Navbar.astro src/components/HeroSection.astro src/components/ServicesSection.astro src/components/ServicePage.astro src/data/siteDocuments.ts src/pages`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P3
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: bug
- **Planned at**: commit `79b5347`, 2026-09-16

## Why this matters

Contact CTAs across the site link to `#contact-form` — the `<form>`
element's id — instead of `#contact`, the section id. It works today only
by accident (the form exists on homepages), yanks keyboard/screen-reader
focus into the middle of the form past the section heading, and breaks the
day any page's form id differs (ServicePage forms are `<slug>-brief-form`,
so a `#contact-form` link there would already 404-anchor). One consistent
target (`#contact`) removes the fragility and fixes the focus order.

## Current state

The facts the executor needs, inlined:

- Section id: `src/components/ContactSection.astro:124`
  `<section class="section" id="contact">`; ServicePage: `ServicePage.astro:340`
  `<section class="section" id="contact">`. Both exist on their pages.
- Form id: `src/components/IntakeForm.astro:26,129`
  (`${formId}-form` → `contact-form` on homepages, `<slug>-brief-form` on
  service pages, `htw-brief-form` on HTW pages).
- `#contact-form` link sources (verified by grep at plan time):
  - `src/components/Navbar.astro:16`: `const resolvedCtaHref = ctaHref ?? '#contact-form';`
    (default; most pages pass explicit `ctaHref`, but the default must still change).
  - `src/components/HeroSection.astro:17,28,68,79`: routes `href: '#contact-form'`
    + `ctaSecondaryHref: '#contact-form'` (EN + ES).
  - `src/components/ServicesSection.astro:123`: dead comparison
    `svc.href === '#contact-form' ? c.ctaContactLabel : c.ctaLabel` — NO
    current service has that href (all point at `/en/services/...`), so the
    ternary's true-branch is dead code.
  - `src/data/siteDocuments.ts:79,135,253,295`: `ctaHref: '/en/#contact-form'`
    / `'/es/#contact-form'` (legal-page CTAs pointing at the homepage FORM).
  - `src/pages/[lang]/[document].astro:38`: `const contactHref = `/${lang}/#contact-form`;`
    (legal-page navbar CTA).
  - `src/pages/en/work/index.astro:26` + `src/pages/es/trabajo/index.astro:26`:
    `ctaHref="/en/#contact-form"` / `"/es/#contact-form"`.
- Correct precedent already in repo: homepage nav items use `#contact`
  (`src/pages/en/index.astro:21`, `es/index.astro:20`); ServicePage passes
  `ctaHref="#contact"` (`ServicePage.astro:97`); HTW nav uses `#contact`.
- `scripts/check-links-seo.js:354-368` validates `#anchors` against element
  ids in built HTML — `#contact` resolves on every page with the section.

## Commands you will need

| Purpose | Command | Provenance | Expected on success |
|---------|---------|------------|---------------------|
| Typecheck | `npm run check` | declared | exit 0 |
| Source tests | `node tests/run.js` | executed | same pass/fail set as Step 0 baseline |
| Build | `npm run build` | declared | exit 0 |
| Link check | `node scripts/check-links-seo.js` | declared | 0 internal-link issues (external/SEO informational) |

## Scope

**In scope** (the only files you should modify):
- `src/components/Navbar.astro` (default `ctaHref`)
- `src/components/HeroSection.astro` (routes + `ctaSecondaryHref`, EN+ES)
- `src/components/ServicesSection.astro` (remove dead ternary branch only)
- `src/data/siteDocuments.ts` (4 `ctaHref` values)
- `src/pages/[lang]/[document].astro` (`contactHref`)
- `src/pages/en/work/index.astro`, `src/pages/es/trabajo/index.astro` (`ctaHref`)

**Out of scope** (do NOT touch):
- `IntakeForm.astro` form ids (`contact-form`, `<slug>-brief-form`) — deep
  anchors to them keep working; intent links (`ServicePage.astro:366`,
  HTW pages `...#htw-brief-form`) already target form ids correctly and stay.
- Any other `href` values, copy, or section ids.

## Git workflow

- Branch: `advisor/014-contact-anchors`
- Commit as one unit; conventional commits
  (e.g. `fix(a11y): point contact CTAs at #contact section`)
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 0: Baseline

`node tests/run.js` → record counts. `grep -rn "#contact-form" src/`
→ record the full match list (must equal the "Current state" list above).

**Verify**: baseline recorded; grep list matches.

### Step 1: Retarget the links

1. Replace every `#contact-form` CTA default/value with `#contact`,
   preserving path prefixes: `/en/#contact-form` → `/en/#contact`,
   `/es/#contact-form` → `/es/#contact`, bare `#contact-form` → `#contact`.
   Files: `Navbar.astro:16`, `HeroSection.astro` (4 spots), `siteDocuments.ts`
   (4 spots), `[document].astro:38`, `en/work/index.astro:26`,
   `es/trabajo/index.astro:26`.
2. `ServicesSection.astro:123`: replace
   `{svc.href === '#contact-form' ? c.ctaContactLabel : c.ctaLabel}` with
   `{c.ctaLabel}`. Check whether `ctaContactLabel` then becomes unused: if
   the `en`/`es` objects still define it, REMOVE the now-unused property too
   (both locales); if anything else references it, STOP and report.
   (`grep -rn "ctaContactLabel" src/` must return zero hits after.)

**Verify**: `grep -rn "#contact-form" src/` → ONLY IntakeForm id-generation
line + intent-link hrefs + legitimate deep links remain (list and eyeball
each); `grep -rn "ctaContactLabel" src/` → zero hits; `npm run check` → 0.

### Step 2: Build + anchor validation

1. `npm run build` → exit 0.
2. `node scripts/check-links-seo.js` → `Internal issues: 0` (external/SEO
   counts informational only; do not chase them).
3. Spot-check built HTML: `grep -o 'href="[^"]*#contact"' dist/en/index.html | sort -u`
   and confirm `#contact` (not `#contact-form`) on nav/hero CTAs; confirm
   `id="contact"` exists in `dist/en/index.html`,
   `dist/es/index.html`, one service page, and `dist/en/work/index.html`.
4. `node tests/run.js` → failure set identical to Step 0 baseline.

**Verify**: all four hold.

## Test plan

- Link-checker internal-issue count (Step 2) is the behavioral test.
- Suite baseline comparison guards regressions.

## Done criteria

Machine-checkable. ALL must hold:

- [ ] No CTA points at `#contact-form` (remaining hits are form-id plumbing only)
- [ ] `ctaContactLabel` fully removed (or STOP-reported as still referenced)
- [ ] `npm run check` exits 0; `npm run build` exits 0
- [ ] Link checker reports 0 internal issues
- [ ] `node tests/run.js` failure set identical to baseline
- [ ] `git diff --name-only 79b5347...HEAD` lists only in-scope files
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- The grep list in Step 0 doesn't match "Current state" (drift).
- `ctaContactLabel` is referenced somewhere unexpected.
- The link checker reports a NEW internal issue for `#contact` on any page
  (a page missing the section — fix the page, don't revert the anchor).
- A step's verification fails twice after a reasonable fix attempt.

## Maintenance notes

For the human/agent who owns this code after the change lands:

- Convention going forward: section CTAs → `#contact`; pre-fill/focus-deep
  links → `#<formId>-form`. Never add a new `#contact-form` CTA.
- Screen-reader/keyboard focus now lands at the section top (heading +
  how-it-works) instead of mid-form — this is the INTENDED improvement, not
  a regression, if anyone reports "extra scroll".
- **Deferred:** `aria-describedby` wiring from form to section note — not
  worth a plan on its own; fold into any future contact-section a11y pass.
