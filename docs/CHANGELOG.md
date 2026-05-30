# Changelog

## 2026-05-29

### Added
- `IntakeForm.astro` — a reusable, lead-qualifying contact form (Formspree)
  with name, email, site URL, goal, budget band, timeline, and brief. Replaces
  the previous mailto / generic-form split across the home page and both Web
  Technical Hygiene landings, in `EN` and `ES`.
- `ResultsBand.astro` — a high-contrast band consolidating verifiable
  quantified proof (0 outages / 14 months, 100+ SKUs, A+ security headers,
  PyPI packages), inserted on both home pages after the hero. Honest stand-in
  for testimonials until the first named client case exists (HTW-B04).
- Vendor-agnostic conversion instrumentation (`track.js` + `intake-form.js`):
  `[data-track]` clicks on primary CTAs and `form_start` /
  `form_submit_success` / `form_submit_error` events. Forwards to
  `window.plausible` and `dataLayer` when present; no-op otherwise.
- Concrete per-service deliverable line ("Deliverable:" / "Entregable:") on
  every card in `ServicesSection`, anchoring perceived value to a tangible
  outcome.

### Changed
- Web Technical Hygiene landings (`ES`/`EN`): all prefilled-mailto brief CTAs
  now scroll to the in-page intake form (lower friction, qualified capture,
  tracked events). The generic footer email link is unchanged.

## 2025-10-16

### Changed
- Consolidated the English-language entry point under `/en/` and replaced the
  legacy `/english/` folder with a zero-delay redirect to preserve existing
  inbound links.
- Added hreflang annotations to the `/english/` redirect shell so search bots
  discover the canonical `/en/` and `/es/` destinations without duplication.

## 2025-10-15

### Removed
- Retired legacy HTML redirect shells (`index-spa.html`, `english/english.html`, `edutecno/edu-index.html`, `edutecno/PC2/*`).
  Update bookmarks and inbound links to the canonical destinations at `/es/`, `/en/` y `/projects/edutecno/pc2/` to avoid 404 responses.
