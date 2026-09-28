# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & dev commands

- `npm run dev` — Start Astro dev server (default http://localhost:4321)
- `npm run build` — Static build to `dist/`
- `npm run preview` — Preview the production build locally
- `node scripts/generate-og.mjs` — Generate OG image (`public/assets/images/og-card.png`)
- Browser suites (Playwright): `node test-htw-snapshot.mjs` (heading snapshot) and `node test-behavioral.mjs` (form + filters; starts its own preview server)

## Architecture

**Static Astro site** (v7, `output: 'static'`), deployed from `master` branch via GitHub Actions → GitHub Pages. Custom domain: `tooltician.com`. Requires `node >=24.0.0`.

Astro config (`astro.config.mjs`) uses `@astrojs/sitemap` with i18n config — default locale `en`, locales `en` and `es`.

### Routes (src/pages/)
Routes live in `src/pages/` (23 pages: root gateway, EN/ES homes, 6 EN + 6 ES service pages, EN/ES work pages, ES guides hub + 3 guides, legal pages, 404). See `src/data/routes.ts` for the canonical route registry. The root is a language gateway; returning visitors with a stored preference are forwarded, first-time visitors choose explicitly (Plan 031).

### Layout
- `src/layouts/BaseLayout.astro` — HTML shell with SEO meta, Open Graph, JSON-LD schema, fonts, scroll progress bar, skip link, back to top, mobile nav toggle, reveal-on-scroll intersection observer, nav-open body lock

### Components (src/components/)
13 section components in `src/components/` (each takes `lang: 'en' | 'es'`):
- `Navbar.astro` — Sticky nav with lang switch and CTA
- `HeroSection.astro` — Title, routes panel, highlights, proof signals, operating notes
- `PortfolioSection.astro` — Project cards with client-side filter buttons
- `ServicesSection.astro` — 6 service cards with SVG icons and staged pricing
- `ServicePage.astro` — Shared template for the 12 service landings
- `AboutSection.astro` — Who, what, preferred stack
- `ContactSection.astro` — Project-brief section hosting the intake form
- `IntakeForm.astro` — Reusable qualifying form (Formspree) with per-field errors
- `ResultsBand.astro` — High-contrast quantified-proof band
- `FaqSection.astro` — Service FAQ fed by pricing data
- `ResourcesSection.astro` — ES home guides strip fed by `guides.ts`
- `ArticleCta.astro` — Shared contextual CTA for guide articles
- `Footer.astro` — Brand, social, copyright, lang switch

### Data (src/data/)
9 files in `src/data/`:
- `services.ts` — Typed bilingual content for the 12 service landings
- `pricing.ts` — Staged pricing (diagnostic/build/retainer) single source
- `routes.ts` — Canonical i18n route registry + hreflang alternates
- `guides.ts` — Index of the published ES guides for hub and strips
- `caseStudies.ts` — Case-study evidence model (role/date/CTA) for work surfaces
- `jsonld.ts` — Shared JSON-LD builders (home/work/root schema)
- `siteDocuments.ts` — Typed content for legal pages (privacy, cookies, terms) with `SiteDocumentKey`/`SiteLocale` types, bilingual content records per document. This is the single source of truth for legal copy.
- `service-registry.json` — Canonical service registry for analytics (`service_id`)
- `github-stats.json` — Build-time GitHub stats cache

### Static assets (public/)
- `CNAME` — GitHub Pages custom domain binding
- Favicon set: `favicon.ico`, `favicon.png`, `favicon-16x16.png`, `favicon-32x32.png`, `apple-touch-icon.png`, `robots.txt`
- `fonts/` — Self-hosted font files
- `assets/` — Images, OG card, downloadable docs

### Bilingual pattern
Every component with user-facing text defines `en` and `es` objects inline, then selects via `const c = lang === 'en' ? en : es`. Nav items and JSON-LD are defined per-page in the route files. The language preference is persisted to `localStorage` when users interact with language switches.

### Styles
Single `src/styles/global.css` with CSS custom properties for the dark theme design system (colors, typography, spacing, shadows, transitions). Utility classes: `.card-glass`, `.btn` variants, `.badge` variants, `.reveal` animation, `.grid-*` helpers. Component-specific styles live in `<style>` tags within each `.astro` file. All styles use CSS custom properties from `:root`.

### Client JS (in BaseLayout)
- Scroll progress bar
- Mobile nav with focus trapping and escape-to-close
- Reveal-on-scroll via IntersectionObserver with `.reveal` class
- Language preference persistence
- PortfolioSection has its own filter script

## Testing
Wired browser suites: `test-htw-snapshot.mjs` and `test-behavioral.mjs` (self-spawns its preview server); run via `npm test`.

## Documentation (docs/)
- `CHANGELOG.md` — Site change log
- `cloudflare-security-headers.md` — Security header config applied at Cloudflare edge (GitHub Pages can't set response headers)
- `content-audit/` — Copy audit with inventory, nomenclature (enforces canonical product names), and rewrite proposals per locale
- `tasks/` — Backlog and scorecard for site improvements (currently HTW audit and site refresh)
- `styles/` — Design system reference

## CodeGraph

When `.codegraph/` exists in this repository, prefer the CodeGraph MCP server for structural exploration before broad text search.

Use CodeGraph first to:
- find symbols and relevant files
- inspect callers, callees, and impact radius
- confirm index freshness or missing coverage with status/files views

Fall back to manual reads and `rg` when:
- the graph does not contain the needed detail yet
- the task depends on exact copy, HTML, CSS, or generated output
- you need line-level confirmation after narrowing the target with CodeGraph

## Deployment

Published from `master` branch via GitHub Actions (`.github/workflows/deploy.yml`):
1. `npm ci` → `npm run build` outputs to `dist/`
2. `actions/upload-pages-artifact@v5` uploads `dist/`
3. `actions/deploy-pages@v5` deploys to GitHub Pages

The `.nojekyll` file must exist in `public/` so GitHub Pages doesn't process the static output as Jekyll. The static HTML in `en/index.html`, `es/index.html`, and root `index.html` are legacy fallback pages — the Astro build output in `dist/` is what gets published. Check `dist/` structure after build if routing issues appear.

Security headers (A+ score) are injected at the Cloudflare edge — see `docs/cloudflare-security-headers.md`.

## OG images
Generated via pure Node.js script (no dependencies) that builds a PNG from raw pixel data + embedded bitmap font. Run after significant content changes. Output goes to `public/assets/images/og-card.png`.

## Memory
Persistent memory is stored at `.claude/projects/` (not in the repo). The MEMORY.md index at that path is loaded into conversation context. Use it for cross-session context about user preferences, project decisions, and reference information.
