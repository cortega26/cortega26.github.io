# Changelog

## 2026-06-30

### Added
- Connected Plausible (cookieless event analytics) in `BaseLayout.astro`:
  the `https://plausible.io/js/script.js` snippet with `data-domain="tooltician.com"`
  plus a queue stub so `track.js`'s existing `window.plausible` forwarding
  (no-op until now) starts reaching a real panel. `TS-001` in
  `docs/tasks/tooltician-strategy-execution-plan.md`.

### Pending (manual, outside the repo)
- Create/verify the `tooltician.com` site at plausible.io.
- Apply the updated Cloudflare CSP (`docs/cloudflare-security-headers.md`
  now allows `https://plausible.io` in `script-src`/`connect-src`) — until
  this is set in Cloudflare, the script is blocked in production.
- `TS-002`: confirmed the sitemap (`astro.config.mjs`) needed no code
  changes — `https://tooltician.com/sitemap-index.xml` already covers
  `en`/`es` alternates correctly. Verifying domain ownership in Google
  Search Console (DNS TXT record) and submitting the sitemap are manual
  steps in the user's DNS/Google account, outside the repo.

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
