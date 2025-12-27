# Tooltician Portfolio

> Bilingual (EN/ES) portfolio showcasing data products, automation, and open-source highlights.

This repository hosts the bilingual static portfolio site served at
[cortega26.github.io](https://cortega26.github.io/) (English) and
[cortega26.github.io/es/](https://cortega26.github.io/es/) (Spanish).

## Profile snapshot

- Data product consultant focused on analytics automation, APIs, and KPI storytelling.
- Builds Python-first tooling: pipelines, scrapers, and reporting systems.
- Bilingual delivery (ES/EN) across LATAM and U.S.-aligned time zones.

## Scope

This repo contains the static site shell (HTML, CSS, assets) only. The production code for featured projects lives in their own repositories:

- [Portfolio Manager (Server Edition)](https://github.com/cortega26/portfolio-manager-server) — Full-stack portfolio tracker with analytics, security, and observability.
- [Rutificador](https://github.com/cortega26/rutificador) — Python package for Chilean RUT validation, formatting, and batch processing.
- [Polla App](https://github.com/cortega26/polla) — Jackpot ingestion pipeline with CLI workflows and Google Sheets updates.
- [Noticiencias News Collector](https://github.com/cortega26/noticiencias_news_collector) — Modular news ingestion and scoring pipeline with runbooks.
- [El Rincón de Ébano](https://github.com/cortega26/elrincondeebano) — Offline-first static catalog with automated asset and data pipelines.
- [PDF Text Analyzer](https://github.com/cortega26/PDF-Text-Analyzer) — PDF extraction + NLP analysis for multilingual documents.
- [Crypto Price Tracker](https://github.com/cortega26/crypto-price-tracker) — Real-time price alerts, GUI, and reporting.
- [PoGo Rarity](https://github.com/cortega26/PoGo) — Data aggregation + Streamlit UI for Pokémon GO rarity scoring.

## Highlighted repositories

These repos are the best entry points for recruiters and collaborators:

1. **rutificador** — packaged library + CI + coverage and a clear user-facing API.
2. **polla** — production-minded scraping pipeline with observability and CLI tooling.
3. **noticiencias_news_collector** — end-to-end ingestion system with runbooks.
4. **portfolio-manager-server** — full-stack analytics platform with security controls.
5. **elrincondeebano** — offline-first static site with automated asset workflows.
6. **PDF-Text-Analyzer** — focused NLP pipeline with practical, reusable utilities.
7. **crypto-price-tracker** — real-time alerts + GUI for daily operations.
8. **PoGo** — data aggregation and Streamlit delivery for gaming analytics.

## Repository structure

- `en/`, `es/` — Localized builds of the static site. The legacy `/english/`
  path is now served by a redirect rule configured in `_config.yml` using the
  `jekyll-redirect-from` plugin.
- `assets/` — Shared images, styles, and scripts.
- `docs/` — Internal documentation, change history, and content governance aids.

## Local development

This portfolio is a static site. Serve it with your preferred HTTP server (for example, `npx serve .`) to preview content updates before publishing through GitHub Pages.

## Configuration

| name | type | default | required | description |
| --- | --- | --- | --- | --- |
| N/A | N/A | N/A | no | Static site; no runtime configuration is required. |

## About field follow-up

The GitHub About description must be updated manually to match the README.
See [docs/tasks/update-about-field.md](docs/tasks/update-about-field.md) for
the exact copy to apply.
