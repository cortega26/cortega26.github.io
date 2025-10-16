# Changelog

## 2025-10-16

### Changed
- Consolidated the English-language entry point under `/en/` and replaced the
  legacy `/english/` folder with a zero-delay redirect to preserve existing
  inbound links.

## 2025-10-15

### Removed
- Retired legacy HTML redirect shells (`index-spa.html`, `english/english.html`, `edutecno/edu-index.html`, `edutecno/PC2/*`).
  Update bookmarks and inbound links to the canonical destinations at `/es/`, `/en/` y `/projects/edutecno/pc2/` to avoid 404 responses.
