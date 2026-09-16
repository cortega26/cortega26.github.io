# Keyword Research ES-first (Plan 022)

Method: free sources only — 4 small-sample web searches (Sep 2026) across ES
automatización-pymes, "higiene técnica web", herramientas-internas-pymes, and
sitios-estáticos SERPs. No Search Console export was provided, so confidence is
capped at MED per plan; no row claims HIGH. No paid tools, no credentials, no
scraping.

Rules applied: commercial intent → existing service page, never NEW. Every NEW
row is an informational article that converts THROUGH exactly one mapped service
page (its CTA). Kill criterion per row: impressions window is 60 days post-publish
unless the row says otherwise.

## Indexable-URL inventory (no-cannibalization basis, verified 2026-09-16)

Source: `src/pages` walk (no `dist/` in worktree; drift confirmed CLEAN against
plan STATE — no new/changed pages).

- Homepages: `/`, `/en/`, `/es/`
- EN services: `/en/services/financial-tooling/`, `/en/services/internal-tools/`,
  `/en/services/python-automation/`, `/en/services/recurring-data-collection/`,
  `/en/services/static-sites/`, `/en/services/web-technical-hygiene/`
- ES servicios: `/es/servicios/automatizacion-python/`,
  `/es/servicios/herramientas-financieras/`,
  `/es/servicios/herramientas-internas/`,
  `/es/servicios/higiene-tecnica-web/`,
  `/es/servicios/recoleccion-recurrente-datos/`, `/es/servicios/sitios-web/`
- Work: `/en/work/`, `/es/trabajo/`
- Legal/engagement ×2 locales: `/en|/es/{privacy,cookies,terms,engagement}/`

## Keyword table (10 rows; 8 ES + 2 EN)

| # | Query | Locale | Intent | Difficulty + why | Target | Cannibalization verdict | Service-CTA mapping | Kill criterion | Confidence |
|---|---|---|---|---|---|---|---|---|---|
| 1 | automatizar reportes de Excel con Python | ES | informational | MED — ES SERP is enterprise RPA vendors, SaaS listicles and forum tutorials; no consultant-led page speaks to SME owners | NEW (article) | none — nearest /es/servicios/automatizacion-python/ targets hire-a-consultant intent, this targets how-to research | exactly one: /es/servicios/automatizacion-python/ | < top-20 impressions/60d → drop CTA, keep as unlinked note | MED |
| 2 | qué es una página web estática y cuándo conviene | ES | informational | MED — SiteGround ES / Kinsta ES / Shopify ES own the tool-centric explainer; the consultant cost/maintenance angle is uncovered | NEW (article) | none — nearest /es/servicios/sitios-web/ targets hire-to-build intent, this targets should-I explainer intent | exactly one: /es/servicios/sitios-web/ | < top-20 impressions/60d → drop CTA, keep as unlinked note | MED |
| 3 | consultor automatización Python pymes | ES | commercial | MED — SERP is RPA platforms and AI-training consultancies; bespoke solo-consultant results are thin | EXISTING /es/servicios/automatizacion-python/ | none — this IS /es/servicios/automatizacion-python/ per the commercial→existing rule; nearest sibling /es/servicios/herramientas-internas/ targets internal-tooling builds, this targets automation engagements | n/a (commercial maps to existing page) | < top-10 impressions/60d → reword H1/CTA on the existing page, do NOT create a new page | MED |
| 4 | auditoría técnica web para negocios pequeños | ES | informational | LOW — coined "higiene técnica web" has ~zero literal competition; plain-language audit queries are served only by generic translated guides | NEW (article) | none — nearest /es/servicios/higiene-tecnica-web/ targets hire-for-audit intent, this targets do-I-need-one research | exactly one: /es/servicios/higiene-tecnica-web/ | < top-20 impressions/60d → drop CTA, keep as unlinked note | MED |
| 5 | controlar mi negocio en Excel vs herramienta a medida | ES | informational | LOW — inferred thin: adjacent SERP is generic consultoras plus SaaS listicles, no build-vs-spreadsheet piece for owners | NEW (article) | none — nearest /es/servicios/herramientas-internas/ targets commission-a-build intent, this targets Excel-pain research | exactly one: /es/servicios/herramientas-internas/ | < top-20 impressions/60d → drop CTA, keep as unlinked note | LOW |
| 6 | cómo vigilar precios de la competencia automáticamente | ES | informational | LOW — inferred thin: price-tracking SERP is SaaS tools, no consultant-led recurrent-collection piece for Latam/ES SMEs | NEW (article) | none — nearest /es/servicios/recoleccion-recurrente-datos/ targets hire-for-pipeline intent, this targets is-this-possible research | exactly one: /es/servicios/recoleccion-recurrente-datos/ | < top-20 impressions/60d → drop CTA, keep as unlinked note | LOW |
| 7 | desarrollo de herramientas internas a medida | ES | commercial | MED — SERP is large generic consultoras and SaaS listicles; the solo-dev custom-build angle is thinly served | EXISTING /es/servicios/herramientas-internas/ | none — this IS /es/servicios/herramientas-internas/ per the commercial→existing rule; nearest sibling /es/servicios/automatizacion-python/ targets script-automation engagements, this targets internal-product builds | n/a (commercial maps to existing page) | < top-10 impressions/60d → reword H1/CTA on the existing page, do NOT create a new page | MED |
| 8 | automatizar facturas y conciliación pequeña empresa | ES | informational | LOW — inferred thin: invoicing SERP is SaaS billing tools, no bespoke-reconciliation piece for small firms | NEW (article) | none — nearest /es/servicios/herramientas-financieras/ targets hire-to-automate-finance intent, this targets manual-bookkeeping-pain research | exactly one: /es/servicios/herramientas-financieras/ | < top-20 impressions/60d → drop CTA, keep as unlinked note | LOW |
| 9 | static site vs WordPress for small business | EN | informational | MED — Yoast / Simply Static / Publii own the tool-centric explainer; the solo-consultant cost-and-upkeep angle is thinner | NEW (article) | none — nearest /en/services/static-sites/ targets hire-to-build intent, this targets platform-choice research | exactly one: /en/services/static-sites/ | < top-20 impressions/60d → drop CTA, keep as unlinked note | MED |
| 10 | custom internal tools consultant small business | EN | commercial | LOW — inferred thin: EN SERP is global agencies and low-code SaaS; solo-consultant SMB angle unobserved, treat cautiously | EXISTING /en/services/internal-tools/ | none — this IS /en/services/internal-tools/ per the commercial→existing rule; nearest sibling /en/services/python-automation/ targets script-automation engagements, this targets internal-product builds | n/a (commercial maps to existing page) | < top-10 impressions/60d → reword H1/CTA on the existing page, do NOT create a new page | LOW |

Verification: 10 complete rows; 8 ES (rows 1–8) ≥ 7; commercial rows (3, 7, 10)
all target existing pages, zero NEW; every NEW row (1, 2, 4, 5, 6, 8, 9) carries
exactly one CTA plus a kill; zero NEW rows compete with an inventoried URL (each
verdict names the nearest page and separates its intent).

## Ranked picks (3)

1. Row 1 — automatizar reportes de Excel con Python → /es/servicios/automatizacion-python/. Rationale: strongest intent × winnability × CTA fit — Excel pain is the modal SME entry point and the ES SERP has no consultant-led answer. Day-60 kill: < top-20 impressions/60d → drop CTA.
2. Row 4 — auditoría técnica web para negocios pequeños → /es/servicios/higiene-tecnica-web/. Rationale: the bespoke HTW category has ~zero literal competition, and a plain-language bridge article is the cheapest way to test whether anyone searches for it. Day-60 kill: < top-20 impressions/60d → drop CTA.
3. Row 2 — qué es una página web estática y cuándo conviene → /es/servicios/sitios-web/. Rationale: the explainer SERP has proven ES volume (hosting vendors rank for it) with the consultant angle still open, and the CTA page is the strongest proof surface. Day-60 kill: < top-20 impressions/60d → drop CTA.
