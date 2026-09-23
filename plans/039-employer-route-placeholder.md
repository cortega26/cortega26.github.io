# Plan 039: Wire the real EN/ES résumés per locale and retire the placeholder

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan in
> `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 1508fa2..HEAD -- src/components/AboutSection.astro src/components/Footer.astro public/assets/docs/carlos-ortega-resume.pdf public/assets/docs/carlos-ortega-resume-es.pdf docs/tasks/resume-refresh-runbook.md docs/tasks/maintenance-checklist.md tests/run.js`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1 (a live production trust leak is being fixed)
- **Effort**: M
- **Risk**: LOW–MED (binary replacement + locale wiring; both files verified by the advisor)
- **Depends on**: none (036 references this plan; if 036 lands after, its TS-006 row is already updated)
- **Category**: direction (employer route / trust)
- **Planned at**: commit `1508fa2`, 2026-09-23

## Why this matters

The site currently links a **placeholder résumé** in production
(`carlos@example.com`, "This placeholder résumé PDF can be replaced…",
generic React/Node claims). The maintainer has now supplied two real,
current PDFs (created 2026-09-23 17:32, verified by the advisor):
an EN résumé and an ES résumé, both aligned with Tooltician positioning. This
plan replaces the placeholder binary with the EN file, adds the ES file, and
wires each locale to its own PDF (EN → EN, ES → ES) in About and Footer. It
also records the refresh runbook, because both PDFs carry dated claims
("79 GitHub stars as of Sep 23, 2026") that will decay.

## Current state

Facts the executor needs, inlined (all verified by the advisor on 2026-09-23):

**Source PDFs (outside the repo — the executor must not modify these):**

| Locale | Absolute path | Size | SHA-256 | Pages |
|---|---|---|---|---|
| EN | `/home/carlos/Descargas/Carlos_Ortega_Gonzalez_Tooltician_Resume_EN.pdf` | 63,945 B | `33ec1b7ce8524bbbab8fdcd8e52cfc22b1f6ce73354cf70b312445361b168fe0` | 2 (letter) |
| ES | `/home/carlos/Descargas/CV_Carlos_Ortega_Gonzalez_Tooltician_ES.pdf` | 65,583 B | `1db76740601b17a1205bab73a2aa5ab18e7f7e1c9e8f7e2a0076744d1e2dc67e` | 2 (letter) |

Content checks already performed by the advisor (`pdftotext`):
- EN starts with `CARLOS ORTEGA GONZÁLEZ / Python Developer · Automation & Data Systems`; contact `carlos@tooltician.com`.
- ES starts with `CARLOS ORTEGA GONZÁLEZ / Desarrollador Python · Automatización y Sistemas de Datos`; contact `carlos@tooltician.com`.
- Neither contains the word `placeholder`.

**The placeholder in the repo:**
- `public/assets/docs/carlos-ortega-resume.pdf` — 1,948 B, SHA-256
  `21f595ac91cbff90eed012bb82656493a06055b87fca17bf96c8040bdde5cd1f`; text:
  `"This placeholder résumé PDF can be replaced with the latest version as needed. Contact: carlos@example.com"`.
- There is **no** ES file today.

**The two link sites:**
- `src/components/AboutSection.astro` — `cvLabel: 'Download CV'` (line 11, en)
  and `cvLabel: 'Descargar CV'` (line 23, es); anchor at line 56:
  ```astro
  <a class="btn btn-ghost" href="/assets/docs/carlos-ortega-resume.pdf" target="_blank" rel="noopener noreferrer" data-track="cta_download_cv" data-track-loc="about" data-cv-download>{c.cvLabel}</a>
  ```
  inside `<div class="about-cta reveal">` (lines 55–57).
- `src/components/Footer.astro` — `cv: 'CV'` labels (lines 21 en, 34 es);
  anchor at line 80:
  ```astro
  <a href="/assets/docs/carlos-ortega-resume.pdf" target="_blank" rel="noopener noreferrer" data-track="cta_download_cv" data-track-loc="footer" data-cv-download>{c.cv}</a>
  ```

- No other file references the résumé path: `grep -rn "carlos-ortega-resume" src/ public/ docs/ tests/`
  returns only those two components (verified). `public/llms.txt` and
  `docs/tasks/maintenance-checklist.md` do not mention it.
- Tracking already works: `data-cv-download` fires canonical `cv_download`
  (`public/assets/js/product-analytics.js:280-282,354-357`), and
  `data-track="cta_download_cv"` fires the legacy event. No analytics change
  is needed.
- Naming decision (keep the EN URL stable): the EN file **replaces** the
  existing `carlos-ortega-resume.pdf` so any saved link keeps working; the ES
  file is new at `carlos-ortega-resume-es.pdf`. Document this in the runbook.

## Commands you will need

| Purpose | Command | Provenance | Expected on success |
|---------|---------|------------|---------------------|
| Copy EN | `cp "/home/carlos/Descargas/Carlos_Ortega_Gonzalez_Tooltician_Resume_EN.pdf" public/assets/docs/carlos-ortega-resume.pdf` | declared | exit 0 |
| Copy ES | `cp "/home/carlos/Descargas/CV_Carlos_Ortega_Gonzalez_Tooltician_ES.pdf" public/assets/docs/carlos-ortega-resume-es.pdf` | declared | exit 0 |
| Verify EN | `pdftotext public/assets/docs/carlos-ortega-resume.pdf - \| grep -c "Python Developer"` | executed (advisor ran `pdftotext` on the source) | `1` |
| Verify ES | `pdftotext public/assets/docs/carlos-ortega-resume-es.pdf - \| grep -c "Desarrollador Python"` | executed | `1` |
| Verify no placeholder | `pdftotext public/assets/docs/carlos-ortega-resume.pdf - \| grep -c "placeholder"` | executed | `0` |
| Typecheck | `npm run check` | declared | exit 0 |
| Source tests | `node tests/run.js` | declared | exit 0 |
| Build | `npm run build` | declared | exit 0 |
| Built tests | `node tests/run.js --built` | declared | exit 0 |
| Link check | `node scripts/check-links-seo.js` | declared | 0 internal issues |
| Behavioral | `node test-behavioral.mjs` | declared | PASS |

`pdftotext` is available at `/usr/bin/pdftotext` in this environment
(verified). If it is missing, use the Read tool on the PDFs instead.

## Scope

**In scope** (the only files you should modify):
- `public/assets/docs/carlos-ortega-resume.pdf` (binary — overwrite with the EN source)
- `public/assets/docs/carlos-ortega-resume-es.pdf` (binary — create from the ES source)
- `src/components/AboutSection.astro`
- `src/components/Footer.astro`
- `docs/tasks/resume-refresh-runbook.md` (create)
- `docs/tasks/maintenance-checklist.md` (item 1: also check the PDFs for dated claims)
- `tests/run.js` (one `EM` group)

**Out of scope** (do NOT touch):
- The source files in `/home/carlos/Descargas/` — read-only inputs. Never edit
  or rename them.
- `public/assets/docs/scoping-template.md` and any other asset.
- `public/assets/js/product-analytics.js`, `track.js` — no analytics change.
- `docs/analytics-sprint-0.md` — plan 038 owns it; nothing here needs it.
- `docs/tasks/tooltician-strategy-execution-plan.md` — plan 036 owns it.
- The About "trajectory" block (strategy TS-007): the résumé now supplies the
  facts, but adding career milestones to the homepage is a separate content
  decision. **Deferred** (see maintenance notes).
- Any other locale copy.

## Git workflow

- Branch: `advisor/039-employer-route`
- Conventional commit, e.g.
  `feat(employer): wire real EN/ES résumés per locale and retire the placeholder`
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 0: Establish a green baseline

Run `npm run check` and `node tests/run.js` on the unmodified checkout.

**Verify**: both exit 0. If either fails, STOP and report (broken baseline).

### Step 1: Copy the PDFs into the repo

Run the two `cp` commands from the table, then verify byte-for-byte:

```sh
sha256sum public/assets/docs/carlos-ortega-resume.pdf public/assets/docs/carlos-ortega-resume-es.pdf
```

Expected:
- `carlos-ortega-resume.pdf` → `33ec1b7ce8524bbbab8fdcd8e52cfc22b1f6ce73354cf70b312445361b168fe0`
- `carlos-ortega-resume-es.pdf` → `1db76740601b17a1205bab73a2aa5ab18e7f7e1c9e8f7e2a0076744d1e2dc67e`

Then the three `pdftotext` verification commands from the table.

**Verify**: hashes match exactly; EN grep `1`; ES grep `1`; placeholder grep `0`.

### Step 2: Wire AboutSection per locale

In `src/components/AboutSection.astro`, add after the `const c = ...` line
(currently line 33):

```js
const cvHref =
  lang === 'en'
    ? '/assets/docs/carlos-ortega-resume.pdf'
    : '/assets/docs/carlos-ortega-resume-es.pdf';
```

Change the anchor at line 56 to use `href={cvHref}` (keep every other
attribute and the `{c.cvLabel}` label unchanged).

**Verify**: `grep -n "cvHref" src/components/AboutSection.astro` → 2 hits
(declaration + anchor); `grep -c "carlos-ortega-resume-es.pdf" src/components/AboutSection.astro` → `1`.

### Step 3: Wire Footer per locale

In `src/components/Footer.astro`, add after `const c = copy[lang];`
(currently line 37):

```js
const cvHref =
  lang === 'en'
    ? '/assets/docs/carlos-ortega-resume.pdf'
    : '/assets/docs/carlos-ortega-resume-es.pdf';
```

Change the anchor at line 80 to `href={cvHref}` (keep every other attribute
and `{c.cv}`).

**Verify**: `grep -n "cvHref" src/components/Footer.astro` → 2 hits;
`grep -c "carlos-ortega-resume-es.pdf" src/components/Footer.astro` → `1`.

### Step 4: Write the refresh runbook

Create `docs/tasks/resume-refresh-runbook.md` with exactly these sections:

```markdown
# Résumé refresh runbook

The site serves two PDFs, one per locale:
- EN: `public/assets/docs/carlos-ortega-resume.pdf`
- ES: `public/assets/docs/carlos-ortega-resume-es.pdf`

Both are linked from About and Footer with `data-cv-download` (canonical
`cv_download`) and `data-track="cta_download_cv"` (legacy). EN pages link only
the EN file; ES pages link only the ES file.

## Refresh procedure

1. Produce the new PDF(s) and drop them in your Downloads folder.
2. Copy, keeping the repo filenames:
   `cp "<new EN>.pdf" public/assets/docs/carlos-ortega-resume.pdf`
   `cp "<new ES>.pdf" public/assets/docs/carlos-ortega-resume-es.pdf`
3. Verify both are real and current:
   `pdftotext public/assets/docs/carlos-ortega-resume.pdf - | head -5`
   `pdftotext public/assets/docs/carlos-ortega-resume-es.pdf - | head -5`
   The EN file must contain `carlos@tooltician.com` and the EN headline;
   the ES file the ES headline. Neither may contain `placeholder`.
4. `npm run check && node tests/run.js && npm run build && node tests/run.js --built`
5. Record the date in the changelog below.

## Dated claims

The résumés contain time-bound numbers (e.g. "79 GitHub stars as of
Sep 23, 2026", "5+ years"). Treat them like any dated site claim: refresh the
PDF at least quarterly (maintenance checklist item 1), or whenever a number
changes materially.

## Changelog

| Date | Change |
|---|---|
| `2026-09-23` | Real EN/ES résumés wired per locale (plan 039); placeholder retired |
```

**Verify**: `test -f docs/tasks/resume-refresh-runbook.md && grep -c "carlos-ortega-resume-es.pdf" docs/tasks/resume-refresh-runbook.md` → at least `1`.

### Step 5: Add the PDFs to the maintenance checklist

In `docs/tasks/maintenance-checklist.md` item 1 ("Time-bound claims"), append
one paragraph after the existing `grep` block:

```markdown
Also check the résumé PDFs — they carry dated numbers:
`pdftotext public/assets/docs/carlos-ortega-resume.pdf - | grep -Ei "as of|[0-9]{4}"` (and the same for `carlos-ortega-resume-es.pdf`). If a claim is stale, refresh per `docs/tasks/resume-refresh-runbook.md`.
```

**Verify**: `grep -c "resume-refresh-runbook" docs/tasks/maintenance-checklist.md` → `1`.

### Step 6: Lock locale wiring with tests

In `tests/run.js`, add a new group after `S0b` if plan 038 landed (otherwise
after `S0`, which ends at line 1305):

```js
group('EM · Résumés wired per locale', () => {
  const about = read('src/components/AboutSection.astro') || '';
  const footer = read('src/components/Footer.astro') || '';
  assert(
    'About resolves the CV per locale',
    about.includes('carlos-ortega-resume.pdf') && about.includes('carlos-ortega-resume-es.pdf') && about.includes('lang === \'en\''),
    'About CV href not locale-aware'
  );
  assert(
    'Footer resolves the CV per locale',
    footer.includes('carlos-ortega-resume.pdf') && footer.includes('carlos-ortega-resume-es.pdf') && footer.includes('lang === \'en\''),
    'Footer CV href not locale-aware'
  );
});
```

Then, inside the existing `if (BUILT)` block (starts line 787), add:

```js
assert(
  '[built] EN page links the EN résumé and not the ES one',
  distEN.includes('/assets/docs/carlos-ortega-resume.pdf') && !distEN.includes('carlos-ortega-resume-es.pdf'),
  'EN locale CV href wrong'
);
assert(
  '[built] ES page links the ES résumé',
  distES.includes('/assets/docs/carlos-ortega-resume-es.pdf'),
  'ES locale CV href wrong'
);
```

**Verify**: `npm run build && node tests/run.js --built` → exit 0 with `EM`
and both `[built]` assertions green.

### Step 7: Full gate

```sh
npm run check
node tests/run.js
npm run build
node tests/run.js --built
node test-behavioral.mjs
node scripts/check-links-seo.js
```

**Verify**: all exit 0 / PASS; link checker `Internal issues: 0` (the two
PDFs are local assets and must not 404 in `dist/` — confirm with
`ls -la dist/assets/docs/`).

### Step 8: Commit

Stage the two PDFs, the two components, the runbook, the checklist, and the
test file. Commit with the message above. Do not push.

## Test plan

- New `EM` group in `tests/run.js` (source-level locale-awareness).
- Two `[built]` assertions prove the rendered EN page links the EN PDF and
  the rendered ES page links the ES PDF — this is the "respectively" check.
- `node scripts/check-links-seo.js` + `ls dist/assets/docs/` confirm both
  binaries are published.
- `pdftotext` checks in Step 1 are manual and intentionally not part of the
  automated suite (CI runners do not guarantee poppler-utils).

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `sha256sum` of `public/assets/docs/carlos-ortega-resume.pdf` equals `33ec1b7ce8524bbbab8fdcd8e52cfc22b1f6ce73354cf70b312445361b168fe0`
- [ ] `sha256sum` of `public/assets/docs/carlos-ortega-resume-es.pdf` equals `1db76740601b17a1205bab73a2aa5ab18e7f7e1c9e8f7e2a0076744d1e2dc67e`
- [ ] `pdftotext public/assets/docs/carlos-ortega-resume.pdf - | grep -c "placeholder"` → `0`
- [ ] `grep -n "cvHref" src/components/AboutSection.astro src/components/Footer.astro` → 2 hits per file
- [ ] `npm run check` exits 0; `node tests/run.js` exits 0 with `EM` green
- [ ] `npm run build && node tests/run.js --built` exits 0 with both `[built]` résumé assertions green
- [ ] `ls dist/assets/docs/` lists both PDFs
- [ ] `node scripts/check-links-seo.js` reports 0 internal issues
- [ ] `git diff --name-only 1508fa2...HEAD` lists only the seven in-scope files
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- Either source file in `/home/carlos/Descargas/` is missing, or its SHA-256
  does not match the table (the files changed after this plan was written).
- `pdftotext` output for either copied file contains `placeholder`, or the
  headline does not match its locale (files swapped).
- Any in-scope component has drifted so the anchors no longer match the
  excerpts (e.g. plan 038 already changed `AboutSection.astro` — it should
  not have, but check).
- A verification command fails twice after a reasonable fix attempt.

## Maintenance notes

For the human/agent who owns this code after the change lands:

- EN keeps the legacy filename `carlos-ortega-resume.pdf` so saved links keep
  working; ES is `carlos-ortega-resume-es.pdf`. Do not rename either without
  updating About, Footer, the runbook, and the `EM` test together.
- Both PDFs carry dated claims; the quarterly checklist now includes them.
- `cv_download` will now fire real downloads in GA4 — the first meaningful
  data for the employer route.
- Reviewer should download both PDFs from the built site (`npm run preview`)
  in EN and ES and confirm the language matches the page.
- **Deferred:** the About trajectory block (strategy TS-007). The résumé now
  supplies verifiable role/period facts (Independent Software Developer
  Feb 2021–present; Founder Monedario/Noticiencias 2025–present; Atento/
  Movistar Aug 2019–Jan 2021), so a follow-up content plan can draft it
  without inventing anything. Unblocked by a maintainer decision to put
  career milestones on the homepage.
- **Deferred:** an "updated <month year>" note next to the CV buttons; the
  PDFs are the source of truth and the runbook covers freshness.
