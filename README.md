# Tooltician Portfolio

Static bilingual portfolio for Carlos Ortega Gonzalez.

Live URLs:

- `https://tooltician.com/`
- `https://tooltician.com/en/`
- `https://tooltician.com/es/`
- Fallback: `https://cortega26.github.io/`

## Positioning

This site is the public portfolio for Python automation and data systems consulting.
It is intentionally lightweight and focused on:

- clear value proposition
- strong featured project proofs
- bilingual access
- direct contact paths

## Featured projects

- [rutificador](https://github.com/cortega26/rutificador) — Python library and CLI for Chilean RUT validation and formatting.
- [conciliador_bancario](https://github.com/cortega26/conciliador_bancario) — fail-closed bank reconciliation CLI with deterministic audit artifacts.
- [noticiencias](https://github.com/cortega26/noticiencias) — science-news frontend focused on readability, accessibility, and SEO.
- [Monedario](https://github.com/cortega26/tuplatainforma) — Chile-focused personal finance education site with practical calculators and evergreen guides. Live site: `https://monedario.cl/`
- [polla](https://github.com/cortega26/polla) — reliable jackpot ingestion workflow with deterministic fallbacks and Google Sheets publishing.
- [PDF-Text-Analyzer](https://github.com/cortega26/PDF-Text-Analyzer) — multilingual PDF extraction, search, and analysis toolkit.
- [crypto-price-tracker](https://github.com/cortega26/crypto-price-tracker) — real-time crypto monitor with configurable alerts and GUI-based setup.

## Repository structure

- `index.html` — language selector landing page
- `en/`, `es/` — localized portfolio pages
- `assets/css/` — shared styling
- `assets/js/` — shared client-side behavior
- `assets/images/` — profile and site imagery
- `assets/docs/` — downloadable resume and supporting assets
- `CNAME` — GitHub Pages custom domain binding

## Local preview

This is a static site. Preview it with any HTTP server, for example:

```bash
npx serve .
```

## Notes

- GitHub Pages publishes from the `master` branch root.
- The custom domain is `tooltician.com`.
- The GitHub profile README in `cortega26/cortega26` is intended to route visitors here.
