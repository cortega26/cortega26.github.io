# Content Audit Replacement Map

## 2025-02-14 · Product nomenclature normalization

- **Registry reference:** `docs/content-audit/nomenclature.yaml` defines canonical, allowed, and forbidden product names.
- **Search step:** `rg "FastSearch API"` → identify legacy variants with spacing.
- **Replacement step:** Update matched strings to `FastSearchAPI` in structured data (JSON-LD), capability bullets, and portfolio cards.
- **Validation:** Re-run `rg "FastSearch API"` and `rg "PDF to Text Analyzer"` to confirm no forbidden variants remain after edits.
- **Scope reminder:** Apply the same `rg` + manual review workflow across `projects/` and `assets/js/` when new content is added.
