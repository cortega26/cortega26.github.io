# Tooltician Portfolio

> Professional portfolio — Tooltician. Static site (EN/ES) with case studies, links to active projects and contact.

This repository hosts the bilingual static portfolio site served at [cortega26.github.io](https://cortega26.github.io/) (English) and [cortega26.github.io/es/](https://cortega26.github.io/es/) (Spanish).

## Scope

This repo contains the static site shell (HTML, CSS, assets) only. The production code for featured projects lives in their own repositories:

- [Portfolio Manager](https://github.com/cortega26/Portfolio-Manager) — Capital-markets analytics toolkit powering the portfolio case study dashboards.
- [elrincondeebano](https://github.com/cortega26/elrincondeebano) — Learning resources and curriculum materials showcased under the El Rincón de Ébano initiative.
- [noticiencias](https://github.com/cortega26/noticiencias) — Automated news aggregation pipelines referenced throughout the Noticiencias write-up.

## Repository structure

- `en/`, `es/` — Localized builds of the static site. The legacy `english/`
  directory only hosts a redirect shim that points to `/en/` for backwards
  compatibility.
- `assets/` — Shared images, styles, and scripts.
- `docs/` — Internal documentation, change history, and content governance aids.

## Local development

This portfolio is a static site. Serve it with your preferred HTTP server (for example, `npx serve .`) to preview content updates before publishing through GitHub Pages.

## About field follow-up

The GitHub About description must be updated manually to match the README. See [docs/tasks/update-about-field.md](docs/tasks/update-about-field.md) for the exact copy to apply.
