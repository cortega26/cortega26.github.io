# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & dev commands

- `npm run dev` — Start Astro dev server (default http://localhost:4321)
- `npm run build` — Static build to `dist/`
- `npm run preview` — Preview the production build locally
- `node scripts/generate-og.mjs` — Generate OG image (`public/assets/images/og-card.png`)
- Playwright smoke tests: `node test-filters.mjs`, `node test-prod.mjs`, `node test-visual.mjs` (run against a local server)

## Architecture

**Static Astro site** (v6, `output: 'static'`), deployed from the `master` branch via GitHub Pages.

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
- `CredentialsSection.astro` — Working style + certifications
- `ContactSection.astro` — Form (Formspree), copy email, Calendly, LinkedIn
- `Footer.astro` — Brand, social, copyright, lang switch

### Bilingual pattern
Every component with user-facing text defines `en` and `es` objects inline, then selects via `const c = lang === 'en' ? en : es`. Nav items and JSON-LD are defined per-page in the route files. The language preference is persisted to `localStorage` when users interact with language switches.

### Styles
Single `src/styles/global.css` with CSS custom properties for the dark theme design system (colors, typography, spacing, shadows, transitions). Utility classes: `.card-glass`, `.btn` variants, `.badge` variants, `.reveal` animation, `.grid-*` helpers. Component-specific styles live in `<style>` tags within each `.astro` file. All styles use CSS custom properties from `:root`.

### Client JS (in BaseLayout)
- Scroll progress bar
- Mobile nav with focus trapping and escape-to-close
- Reveal-on-scroll via IntersectionObserver with `.reveal` class
- Language preference persistence
- PortfolioSection has its own filter-script

## Testing
Playwright scripts in `./test-*.mjs` are ad-hoc browser smoke tests run directly with `node`. Start a preview server first (`npm run preview` or `npx serve dist`), then run the test script. The tests check filter functionality, page load errors, and card reveal behavior.

## Deployment
Published from `master` branch root via GitHub Pages. Custom domain: `tooltician.com`. The static HTML in `en/index.html`, `es/index.html`, and root `index.html` are legacy fallback pages — the Astro build output in `dist/` is what gets published. Check `dist/` structure after build if routing issues appear.

## OG images
Generated via pure Node.js script (no dependencies) that builds a PNG from raw pixel data + embedded bitmap font. Run after significant content changes. Output goes to `public/assets/images/og-card.png`.
