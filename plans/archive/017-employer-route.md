# Plan 017: Link the resume PDF (employer route)

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat e2e86eb..HEAD -- src/components/AboutSection.astro src/components/Footer.astro public/assets/docs/carlos-ortega-resume.pdf`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: direction (employer-route conversion)
- **Planned at**: commit `e2e86eb`, 2026-09-16

## Why this matters

`public/assets/docs/carlos-ortega-resume.pdf` exists but nothing links to
it (verified: zero references from `src/`). Recruiter/partner traffic
currently dead-ends. This is strategy-doc task TS-006
(`docs/tasks/tooltician-strategy-execution-plan.md:170`): "Botón
'Descargar CV' en About y enlace en Footer, con
`data-track="cta_download_cv"`", acceptance "El CV es accesible desde la
home en ≤2 clicks y la descarga emite evento". The event is already
registered in the catalog (`strategy-doc:110`: `cta_download_cv`,
locations `about`, `footer` — currently missing, to be added by this plan).

## Current state

The facts the executor needs, inlined:

- Asset: `public/assets/docs/carlos-ortega-resume.pdf` — FRESHNESS UNKNOWN.
  The maintainer could not confirm it is current. Step 0 gates everything.
- `src/components/AboutSection.astro` (74 lines): `section#about` with
  centered header (eyebrow/title/divider/intro/workstyle, lines 35-41) + a
  3-card grid (lines 42-52). There is NO link/button area today — add a
  "Download CV" button below the card grid (new `about-cv` row), styled with
  the existing `.btn .btn-ghost` classes used across the site.
- `src/components/Footer.astro:71-84`: `footer__bottom` with `meta-links`
  row (lang switch + `/llms.txt`, lines 74-77) and `legal-links` row
  (lines 78-82). Add the CV link to the `meta-links` row (it is a
  meta/about-me surface, not a legal page).
- Tracking convention (from `ServicePage.astro:358,366` + `track.js`
  auto-bind): `data-track="cta_download_cv" data-track-loc="about"` (About
  button) and `data-track-loc="footer"` (footer link). External-link
  convention: `target="_blank" rel="noopener noreferrer"` (same-file
  precedent, `Footer.astro:54,59`).
- Copy: EN button `Download CV`, ES `Descargar CV` (per TS-006). Footer link
  can reuse the same short labels; do not invent longer marketing copy.
- CV href: `/assets/docs/carlos-ortega-resume.pdf` (public/ maps to root).

## Commands you will need

| Purpose | Command | Provenance | Expected on success |
|---------|---------|------------|---------------------|
| Typecheck | `npm run check` | declared | exit 0, no errors |
| Source tests | `node tests/run.js` | executed | exit 0, green |
| Build | `npm run build` | declared | exit 0, 26 pages |
| Link check | `node scripts/check-links-seo.js` | declared | 0 internal-link issues |

## Scope

**In scope** (the only files you should modify):
- `src/components/AboutSection.astro` (CV button + minimal styles reusing
  existing classes; add a `<style>` rule only if `.btn` centering needs it)
- `src/components/Footer.astro` (one link in `meta-links`, both locales)

**Out of scope** (do NOT touch):
- The PDF itself — if stale, STOP (Step 0). Never edit the binary.
- `track.js`, event catalog, strategy doc, any other component or copy.

## Git workflow

- Branch: `advisor/017-employer-route`
- Commit as one unit; conventional commits (e.g. `feat(employer): link resume PDF from About and Footer`)
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 0: PDF freshness gate (read-only — decides everything)

1. Read the PDF with the Read tool (it renders PDFs): extract role titles,
   dates, skills, and any stale signals (old roles as current, missing
   recent work, dead links).
2. Compare against site positioning (Python automation & data systems,
   scoped engagements, EN/ES).
3. Verdict: FRESH → proceed to Step 1. STALE → STOP immediately and report
   specifics (what is outdated, line/section references). Do NOT link a
   stale CV, do NOT edit the PDF.

**Verify**: explicit FRESH verdict recorded, or STOP reported.

### Step 1: Add the links

1. AboutSection: button row below the card grid, EN `Download CV` / ES
   `Descargar CV`, `href="/assets/docs/carlos-ortega-resume.pdf"`,
   `target="_blank" rel="noopener noreferrer"`,
   `data-track="cta_download_cv" data-track-loc="about"`, classes
   `btn btn-ghost` (match `ServicesSection.astro:123` button usage).
2. Footer: link in `footer__meta-links` (both locale objects — add
   `cv: 'CV'`-style label; shortest consistent label wins, EN `CV` /
   ES `CV`), same href/rel/`data-track` with `data-track-loc="footer"`.
3. `npm run check` → exit 0.

**Verify**: typecheck green; `grep -c "cta_download_cv"` across both files → 2.

### Step 2: Build + gates

1. `npm run build` → exit 0.
2. `grep -o 'href="/assets/docs/carlos-ortega-resume.pdf"' dist/en/index.html dist/es/index.html | wc -l` → 4
   (About + Footer × EN + ES). `grep -c 'data-track="cta_download_cv"' dist/en/index.html` → 2.
3. `node scripts/check-links-seo.js` → `Internal issues: 0` (external/SEO
   informational; the PDF is a local file check).
4. `node tests/run.js --built` → exit 0.

**Verify**: all four hold.

## Test plan

- No new test files. Machine checks: typecheck, built-href greps,
  link-checker internal count, suite green (source + built).

## Done criteria

Machine-checkable. ALL must hold:

- [ ] Step-0 FRESH verdict (or plan STOPped honestly on STALE)
- [ ] `npm run check` exits 0
- [ ] Built EN+ES each contain About button + footer link with
  `data-track="cta_download_cv"` and correct `data-track-loc`
- [ ] Link checker reports 0 internal issues
- [ ] `node tests/run.js --built` exits 0
- [ ] `git diff --name-only e2e86eb...HEAD` lists only the two in-scope files
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- The PDF is stale (Step 0) — report what is outdated, do not link it.
- The code doesn't match "Current state" excerpts (drift).
- `cta_download_cv` handling in `track.js`/strategy catalog contradicts the
  auto-bind convention (read, don't assume — but do not modify tracking).
- A step's verification fails twice after a reasonable fix attempt.

## Maintenance notes

For the human/agent who owns this code after the change lands:

- The CV binary is now one click from the homepage — every future role/skill
  change must update the PDF AND the site, or they drift. Consider dating
  the PDF filename or an "updated MMM YYYY" note next to the button.
- **Deferred:** portrait photo in About (was deliberately removed in favor
  of the credibility panel; revisit only with maintainer approval).
- Reviewers: click the built link and confirm the PDF downloads (not 404s).
