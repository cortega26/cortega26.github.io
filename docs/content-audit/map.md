# Content Audit Map

| Page Type | Locale(s) | URL | Source File | Notes |
| --- | --- | --- | --- | --- |
| Home | en, es | https://cortega26.github.io/ (EN) / https://cortega26.github.io/es/ (ES) | en/index.html, es/index.html | Shared single-page layout with localized sections including hero, portfolio, and contact CTAs. |
| Category (Learning Hub) | es | https://cortega26.github.io/projects/edutecno/ | projects/edutecno/index.html | Spanish-only grid of EduTecno practice modules; relies on Bootstrap 5 CDN + legacy JS. |
| Product (Module 2 Practice) | es | https://cortega26.github.io/projects/edutecno/pc2/prueba_consolidacion_2.html | projects/edutecno/pc2/prueba_consolidacion_2.html | Static Digimon API exercise without contextual copy or evidence of production readiness. |
| Cart / Checkout Analogue | en, es | https://cortega26.github.io/en/#contact / https://cortega26.github.io/es/#contacto | en/index.html#contact, es/index.html#contacto | Contact form & CTA stack functions as intake flow; promises 2-business-day response and Calendly availability. |
| Search | — | — | — | No site search or results template implemented; surfaced as roadmap gap. |
| 404 | — | — | — | Custom 404 handling not present; GitHub Pages default served. |
| Policy (Privacy / Terms) | — | — | — | Privacy, cookie, and terms pages absent; rely on default GitHub Pages behavior. |
# Content Audit Replacement Map

## 2025-02-14 · Product nomenclature normalization

- **Registry reference:** `docs/content-audit/nomenclature.yaml` defines canonical, allowed, and forbidden product names.
- **Search step:** `rg "FastSearch API"` → identify legacy variants with spacing.
- **Replacement step:** Update matched strings to `FastSearchAPI` in structured data (JSON-LD), capability bullets, and portfolio cards.
- **Validation:** Re-run `rg "FastSearch API"` and `rg "PDF to Text Analyzer"` to confirm no forbidden variants remain after edits.
- **Scope reminder:** Apply the same `rg` + manual review workflow across `projects/` and `assets/js/` when new content is added.
