# Tooltician Portfolio

> Professional portfolio — Tooltician. Static site (EN/ES) with case studies, links to active projects and contact.

This repository hosts the bilingual static portfolio site served at [cortega26.github.io](https://cortega26.github.io/) (English) and [cortega26.github.io/es/](https://cortega26.github.io/es/) (Spanish).

## Where is the code?

The production code for highlighted projects lives in dedicated repositories:

- [Portfolio Manager](https://github.com/cortega26/Portfolio-Manager) — Maintains the capital-markets analytics toolkit featured in the portfolio.
- [elrincondeebano](https://github.com/cortega26/elrincondeebano) — Houses the El Rincón de Ébano educational content referenced on the site.
- [noticiencias](https://github.com/cortega26/noticiencias) — Hosts the Noticiencias news automation workflows cited in the case studies.

## Repository structure

- `en/`, `es/` — Localized builds of the static site.
- `assets/` — Shared images, styles, and scripts.
- `docs/` — Internal documentation, change history, and content governance aids.

## Local development

This portfolio is a static site. Serve it with your preferred HTTP server (for example, `npx serve .`) to preview content updates before publishing through GitHub Pages.

## About field follow-up

The GitHub About description must be updated manually to match the README. See [docs/tasks/update-about-field.md](docs/tasks/update-about-field.md) for the exact copy to apply.
