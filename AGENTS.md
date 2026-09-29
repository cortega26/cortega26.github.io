# AGENTS.md

Guidance for AI coding agents working in this repository. `CLAUDE.md` imports this file, so this is the single source of truth.

## Stack

Static Astro 7 site (`output: 'static'`), bilingual EN/ES, published at `tooltician.com`. Requires Node >=24. Deployed from `master` via GitHub Actions (`.github/workflows/deploy.yml`: `npm ci` → `npm run build` → GitHub Pages). `public/.nojekyll` and `public/CNAME` must remain.

## Commands

| Command | Purpose |
|---|---|
| `npm run dev` | Dev server (http://localhost:4321) |
| `npm run build` | Runs `scripts/fetch-github-stats.js` (refreshes `src/data/github-stats.json`, falls back to the cache), then builds to `dist/` |
| `npm run preview` | Serve the build |
| `npm run check` | `astro check` (types) |
| `npm test` | Full suite (see Testing) |
| `npm run test:links` | Link/SEO checker |
| `npm run check:prod` | Checks live production against `src/data/routes.ts` |
| `node scripts/check-csp-hashes.mjs` | Every inline-script hash in `dist/` must be listed in `docs/cloudflare-security-headers.md` |
| `node scripts/generate-og.mjs` | Regenerates `public/assets/images/og-card.png` (dependency-free PNG builder); rerun after major content changes |

## Testing

No test framework: each suite is a standalone Node script, so run one with `node <file>`. `npm test` chains them with `&&` and stops at the first failure:
1. Source checks: `tests/run.js`, then `tests/*.mjs` (analytics guard/funnel/intake attribution, case-study invariants, root language decision, script guards).
2. Build-output checks: `tests/run.js --built` and `tests/sitemap-i18n.mjs`. These read `dist/`, so run `npm run build` first.
3. Playwright: `test-htw-snapshot.mjs` (heading snapshot, baselines in `tests/snapshots/`) and `test-behavioral.mjs` (form + filters; starts its own preview server).

## Architecture

- **Routes:** `src/pages/`. `src/data/routes.ts` is the canonical route registry and the source of the hreflang alternates. Add new pages there too. The root `/` is a language gateway: returning visitors with a stored preference are forwarded, and first-time visitors choose a language.
- **Layout:** `src/layouts/BaseLayout.astro` holds the SEO/OG/JSON-LD head and all shared client JS: scroll progress, mobile nav (focus trap, Escape), `.reveal` IntersectionObserver, and language-preference persistence in `localStorage`. `PortfolioSection` has its own filter script.
- **Components:** `src/components/*.astro`, each takes `lang: 'en' | 'es'`. `ServicePage.astro` is the shared template for the 12 service landings (6 EN + 6 ES).
- **Bilingual pattern:** components define inline `en`/`es` objects and select with `const c = lang === 'en' ? en : es`. Nav items and JSON-LD are defined per page file.
- **Data (`src/data/`):** typed single sources of truth for content (services, pricing, guides, case studies, legal copy, JSON-LD, analytics `service_id`). Edit these instead of duplicating copy in components.
- **Styles:** `src/styles/global.css` defines the dark-theme tokens (CSS custom properties on `:root`) plus utilities (`.card-glass`, `.btn`, `.badge`, `.reveal`, `.grid-*`). Component styles live in scoped `<style>` blocks and use the tokens. Token reference: `docs/styles/tokens.json`.

## Security headers / CSP

GitHub Pages can't set response headers, so the CSP and other security headers are applied at the Cloudflare edge (`docs/cloudflare-security-headers.md`, rules script `scripts/cloudflare-csp-rules.sh`). **Adding or changing any inline script changes its hash:** update the doc and the Cloudflare rules, then run `check-csp-hashes.mjs`.

## `support/` subproject

`support/` is a separate Astro app that shares the root `package.json`. Use the `support:*` scripts (`support:dev`, `support:verify`, `support:e2e`, …), which pass `--root support`. It is not covered by `npm test`.

## Docs

`docs/CHANGELOG.md`; `docs/content-audit/` (nomenclature enforces canonical product names; check it before writing copy); `docs/tasks/` (backlog, scorecards, maintenance checklist).

## Code exploration

If `.codegraph/` exists, use the CodeGraph MCP tools first for symbols, callers/callees and impact radius. Switch to direct reads/`rg` for exact copy, HTML/CSS, generated output, or line-level confirmation.
