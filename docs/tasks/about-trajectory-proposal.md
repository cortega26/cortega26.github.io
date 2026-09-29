# About trajectory proposal (plan 062)

> Status: **approved and implemented** (2026-09-28)
> Date: 2026-09-28
> Plan: `plans/062-employer-route-about.md`
> Sources: `public/assets/docs/carlos-ortega-resume.pdf`,
> `carlos-ortega-resume-es.pdf` (extracted with `pdftotext`; no other source used)

## Verifiable facts

| Role | Period | Context | Facts usable in copy (PDF-stated) |
|---|---|---|---|
| Independent Software Developer · Data & Automation | Feb 2021 – present | Santiago, Chile; current work published under Tooltician.com | Designs and implements Python/SQL automation, ETL/ELT, data extraction/integration, APIs, scraping, reporting workflows, and internal tools; builds validation, deterministic outputs, automated tests, CI/CD, logging, traceability, and operational documentation |
| Founder & Developer | 2025 – present | Monedario.cl & Noticiencias.com (own production products) | Monedario.cl: personal-finance platform with calculators, economic indicators, structured data, consistency controls. Noticiencias.com: automated acquisition, normalization, source-verification, multilingual processing, and publishing pipeline with editorial controls |
| Data Analysis & Corporate Accounts | Aug 2019 – Jan 2021 | Atento Chile / Movistar, Santiago (two roles) | Branch Tutor / Data Analyst: churn, retention, operational performance, and KPI analysis; reports and visualizations. Corporate Accounts Analyst: balances, payments, charges, transactions, and discrepancies; case resolution with accuracy, consistency, traceability |
| Open-source / production proof (optional 4th line) | as of Sep 23, 2026 | chile-hub; bankrecon (PyPI); Portfolio Manager Unified; DNSpect | chile-hub: 22 reproducible validated Chilean public-data layers, 79★ as of 2026-09-23. Bank Reconciliation: PyPI CLI with deterministic matching, fail-closed behavior, audit artifacts. Portfolio Manager Unified: local-first Electron/React/Fastify/SQLite, decimal.js. DNSpect: deterministic DNS benchmarking, 49-provider catalog |
| Profile line | — | — | "Python developer and data analyst with 5+ years building automation, pipelines, APIs and internal tools for real operations" |

**Explicitly not usable (absent from the PDFs):** revenue or growth percentages,
team sizes, "reduced X%" claims, years beyond "5+", client names, or any metric
not quoted above.

## Draft copy (EN / ES)

Recommended placement: **inside the About section**, as a compact "Trajectory"
sub-block between the three cards and the CV button. No new section, no nav
change, reuses the existing `.reveal` system, and the CV button stays the last
CTA in the block.

**EN** — eyebrow `Trajectory`, milestones (one line each):

1. `2021–present · Independent software developer — Python/SQL automation, ETL, scraping, APIs, and internal tools for real operations, published under Tooltician.com.`
2. `2025–present · Founder & developer, Monedario.cl and Noticiencias.com — a personal-finance platform and an automated publishing pipeline with source verification.`
3. `2019–2021 · Atento Chile / Movistar — data analysis for churn and retention, and corporate-account reconciliation of balances, payments, and discrepancies.`

**ES** — eyebrow `Trayectoria`:

1. `2021–actualidad · Desarrollador de software independiente — automatización Python/SQL, ETL, scraping, APIs y herramientas internas para operaciones reales, publicado bajo Tooltician.com.`
2. `2025–actualidad · Fundador y desarrollador, Monedario.cl y Noticiencias.com — plataforma de finanzas personales y pipeline de publicación automatizada con verificación de fuentes.`
3. `2019–2021 · Atento Chile / Movistar — analítica de churn y retención, y conciliación de saldos, pagos y discrepancias de cuentas corporativas.`

Optional 4th line (proof, if wanted in-block): `Open source with production
proof: chile-hub (22 reproducible public-data layers), bankrecon on PyPI,
DNSpect.` — otherwise the Work section already carries this evidence.

Placement alternatives considered:

1. **Inside About, below the cards (recommended).** Smallest diff; the section
   already owns the employer signal (CV button); no new navigation surface.
2. **Standalone strip after About.** More visual weight, but a new section and
   layout to maintain; deferred unless the employer route becomes primary.

## Profile-link tracking decision

Current state: `Footer.astro` renders GitHub/LinkedIn links with no tracking
attribute; `product-analytics.js` has no profile binding, and its
`portfolio_click` event accepts only optional `service_id`/`service_category`
(no location param).

- **Option A — stamp `data-portfolio-click` on the GitHub/LinkedIn links.**
  Zero analytics-surface change (no new event, no new allowlist entry, no new
  tests). Trade-off: profile clicks become indistinguishable from
  project-evidence clicks in GA4, so the employer-route signal stays
  unmeasurable — the exact gap TS-008 exists to close.
- **Option B — add a canonical `profile_click` event (recommended).**
  End-to-end: registry allowlist, client binding for `[data-profile-link]`,
  vm tests in `analytics-service-funnel.mjs`, one `tests/run.js` assertion.
  Clean, separately measurable, and eligible as a GA4 Key Event; more work and
  a new event in the vocabulary.

**Recommendation: Option B.** The point of TS-008 is measurable profile
clicks; A ships the links but cannot answer whether recruiters click them.
If the maintainer prefers zero analytics-surface change, A is the fallback.

## Open questions (checkpoint)

1. Approve the three-milestone copy and the inside-About placement?
2. Tracking: Option B (new `profile_click`, recommended) or Option A
   (`portfolio_click` stamp, no analytics change)?
3. Include the optional 4th open-source proof line in the block, or leave
   proof to the Work section?

## Decision

**Approved 2026-09-28 by the maintainer (in session):**

1. Copy + placement: approved as drafted — three milestones inside About,
   between the cards and the CV button.
2. Tracking: **Option B** — canonical `profile_click` event with
   `profile_network` ∈ {github, linkedin}, bound to `[data-profile-link]`;
   the Footer GitHub/LinkedIn links carry the stamps.
3. No fourth proof line — the Work section carries the open-source evidence.

Plan 062 Step 5 applied: `AboutSection.astro` renders the block in EN/ES;
`product-analytics.js` registers/binds `profile_click`; vm tests and a
`tests/run.js` group cover the event and the stamps; strategy rows
TS-007/TS-008 are `Hecho (Plan 062)`.
