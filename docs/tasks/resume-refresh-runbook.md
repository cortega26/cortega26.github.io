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
