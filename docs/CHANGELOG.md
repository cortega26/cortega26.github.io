# Changelog

## 2026-08-21 — Plan 006: GA4 migration (G-2HK4GHK7GR)

### Added
- GA4 direct (`gtag.js`, `G-2HK4GHK7GR`) in `src/layouts/BaseLayout.astro`:
  synchronous inline bootstrap (`window.dataLayer`/`window.gtag`/`gtag('js')`/`gtag('config', {cookie_expires: 60*60*24*395})` via `define:vars={{ga4Id}}` from `PUBLIC_GA4_MEASUREMENT_ID`) **before** async `https://www.googletagmanager.com/gtag/js`. Retains Ahrefs (`analytics.ahrefs.com`) 30–60d. CSP updated with `sha256-` (recalculated after cookie_expires) and GA4 hosts (`googletagmanager.com`, `google-analytics.com`, `region1`). `track.js` now maps `ttTrack({location,label,status})` → `gtag('event', name, {tt_location, tt_label, tt_status})` with no `dataLayer.push` duplication. Privacy/Cookie docs updated for GA4 cookies `_ga/_ga_*` (395 days ≈13 months, 34128000s). See `plans/006-plausible-to-ga4-migration.md` and `docs/cloudflare-security-headers.md`.

### Removed
- Plausible (`https://plausible.io`) stub and script removed from `BaseLayout.astro`; `track.js` no longer forwards to `window.plausible`; docs updated. Cloudflare CSP no longer allows `plausible.io` (remove after GA4 validation).

### Pending (manual, outside the repo)
- Set `PUBLIC_GA4_MEASUREMENT_ID=G-2HK4GHK7GR` in CI/build env (`.env` already present locally, gitignored). Until Cloudflare CSP (§5 with new `sha256-`) is applied, GA4 inline stub is blocked in production.
- GA4: create custom dimensions `tt_location`, `tt_label`, `tt_status` (event-scoped) and mark `cta_book_call`/`form_submit_success` as conversions.
- `TS-002`: confirmed the sitemap (`astro.config.mjs`) needed no code changes — `https://tooltician.com/sitemap-index.xml` already covers `en`/`es` alternates correctly. Verifying domain ownership in Google Search Console (DNS TXT record) and submitting the sitemap are manual steps in the user's DNS/Google account, outside the repo.

## 2026-06-30

### Added
- Connected Plausible (cookieless event analytics) in `BaseLayout.astro`:
  the `https://plausible.io/js/script.js` snippet with `data-domain="tooltician.com"`
  plus a queue stub so `track.js`'s existing `window.plausible` forwarding
  (no-op until now) starts reaching a real panel. `TS-001` in
  `docs/tasks/tooltician-strategy-execution-plan.md`. **Superseded 2026-08-21 by GA4 (Plan 006).**

### Pending (manual, outside the repo)
- Create/verify the `tooltician.com` site at plausible.io. **Cancelled — migrated to GA4.**
- Apply the updated Cloudflare CSP (`docs/cloudflare-security-headers.md`
  now allows `https://plausible.io` in `script-src`/`connect-src`) — until
  this is set in Cloudflare, the script is blocked in production. **Replaced by GA4 CSP (§5 with sha256).**
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
