# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & dev commands

- `npm run dev` — Start Astro dev server (default http://localhost:4321)
- `npm run build` — Static build to `dist/`
- `npm run preview` — Preview the production build locally
- `node scripts/generate-og.mjs` — Generate OG image (`public/assets/images/og-card.png`)
- Playwright smoke tests: `node test-filters.mjs`, `node test-prod.mjs`, `node test-visual.mjs` (run against a local server — `npm run preview` or `npx serve dist`)

## Architecture

**Static Astro site** (v7, `output: 'static'`), deployed from `master` branch via GitHub Actions → GitHub Pages. Custom domain: `tooltician.com`. Requires `node >=24.0.0`.

Astro config (`astro.config.mjs`) uses `@astrojs/sitemap` with i18n config — default locale `en`, locales `en` and `es`.

### Routes (src/pages/)
- `/index.astro` — Language gateway with auto-redirect from browser language + localStorage persistence
- `/en/index.astro` — English portfolio page
- `/es/index.astro` — Spanish portfolio page

### Layout
- `src/layouts/BaseLayout.astro` — HTML shell with SEO meta, Open Graph, JSON-LD schema, fonts, scroll progress bar, skip link, back to top, mobile nav toggle, reveal-on-scroll intersection observer, nav-open body lock

### Components (src/components/)
Each section component receives a `lang: 'en' | 'es'` prop and defines inline `en`/`es` copy objects:
- `Navbar.astro` — Sticky nav with lang switch and CTA
- `HeroSection.astro` — Title, routes panel, highlights, proof signals, operating notes
- `ProofSection.astro` — Delivery signals with track + catalog layout
- `PortfolioSection.astro` — Project cards with client-side filter buttons (Python/Web/CLI/Data)
- `ServicesSection.astro` — 6 service cards with SVG icons
- `AboutSection.astro` — Who, what, preferred stack
- `ContactSection.astro` — Form (Formspree), copy email, Calendly, LinkedIn
- `Footer.astro` — Brand, social, copyright, lang switch

### Data (src/data/)
- `siteDocuments.ts` — Typed content for legal pages (privacy, cookies, terms) with `SiteDocumentKey`/`SiteLocale` types, bilingual content records per document. This is the single source of truth for legal copy.

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
Playwright scripts in `./test-*.mjs` are ad-hoc browser smoke tests run directly with `node` (no Playwright test runner). Start a preview server first (`npm run preview` or `npx serve dist`), then run the test script. Tests check filter functionality, page load errors, and card reveal behavior.

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
