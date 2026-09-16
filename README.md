# Tooltician Portfolio

*Hub central del [ecosistema Tooltician](https://tooltician.com) — portafolio bilingüe de Carlos Ortega Gonzalez.*

[![Parte de Tooltician](https://img.shields.io/badge/Parte_de-Tooltician.com-6C47FF?v=2)](https://tooltician.com)

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

- [chile-hub](https://github.com/cortega26/chile-hub) — curated data registry for Chile with automated ETL, statistical schema validation, and multi-format outputs.
- [rutificador](https://github.com/cortega26/rutificador) — Python library and CLI for Chilean RUT validation and formatting.
- [conciliador_bancario](https://github.com/cortega26/conciliador_bancario) — fail-closed bank reconciliation CLI with deterministic audit artifacts.
- [noticiencias](https://github.com/cortega26/noticiencias) — science-news frontend focused on readability, accessibility, and SEO.
- [Monedario](https://github.com/cortega26/Monedario) — Chile-focused personal finance education site with practical calculators and evergreen guides. Live site: `https://monedario.cl/`
- [polla](https://github.com/cortega26/polla) — reliable jackpot ingestion workflow with deterministic fallbacks and Google Sheets publishing.
- [PDF-Text-Analyzer](https://github.com/cortega26/PDF-Text-Analyzer) — multilingual PDF extraction, search, and analysis toolkit.
- [crypto-price-tracker](https://github.com/cortega26/crypto-price-tracker) — real-time crypto monitor with configurable alerts and GUI-based setup.

## Repository structure

Astro static site (`output: 'static'`, config in `astro.config.mjs`):

- `src/pages/` — routes: `index.astro` language gateway, `en/` + `es/` homepages, `en/services/*` + `es/servicios/*` service pages, `en/work/` + `es/trabajo/`, `[lang]/[document].astro` legal pages
- `src/components/` — section components (`Navbar`, `HeroSection`, `ServicesSection`, `PortfolioSection`, `ProofSection`, `AboutSection`, `ContactSection`, `Footer`, …)
- `src/layouts/` — `BaseLayout.astro` HTML shell (SEO meta, Open Graph, JSON-LD, fonts, nav)
- `src/data/` — single-source content (`services.ts`, `pricing.ts`, `siteDocuments.ts`)
- `src/styles/` — `global.css` design system
- `public/` — static assets: favicons, `fonts/`, `assets/js`, `assets/images`, `llms.txt`, `CNAME` (custom-domain binding)
- `scripts/` — `fetch-github-stats.js` (build-time stats), `check-links-seo.js` (link/SEO audit), `generate-og.mjs`
- `tests/` — `run.js` source + built-output checks; `test-htw-snapshot.mjs` snapshot test at the repo root
- `dist/` — build output, gitignored (what gets published)

## Local development

Requires `node >= 24` (see `.nvmrc`):

```bash
npm ci
npm run dev      # http://localhost:4321
npm run build    # fetch GitHub stats, then `astro build` → `dist/`
npm run preview  # serve the production build locally
```

## Verification

- `npm test` — full gate: source tests, built-output tests, HTW snapshot
- `node tests/run.js` — source checks (`--built` variant runs against `dist/`, needs a build first)
- `npm run check` — Astro typecheck
- `npm run test:htw` — HTW snapshot test
- `npm run test:links` — link & SEO audit (informational, hits the network)

CI (`master` → GitHub Pages) runs four blocking gates — Source tests → Build → Built tests → HTW snapshot — plus a non-blocking Link & SEO audit whose report is uploaded as an artifact.

## Environment

- Local builds read `PUBLIC_GA4_MEASUREMENT_ID` from `.env` (gitignored — never committed).
- Production builds get it from the `PUBLIC_GA4_MEASUREMENT_ID` repository variable; CI fails the build if it is unset.
- See [CLAUDE.md](CLAUDE.md) for architecture detail.

## Notes

- Production is published from GitHub Pages and proxied by Cloudflare.
- Security headers for an `A+` score must be injected at the Cloudflare edge, because GitHub Pages does not let this repo define response headers directly.
- Use the Cloudflare header set documented in [`docs/cloudflare-security-headers.md`](docs/cloudflare-security-headers.md).
- The custom domain is `tooltician.com`.
- The GitHub profile README in `cortega26/cortega26` is intended to route visitors here.
