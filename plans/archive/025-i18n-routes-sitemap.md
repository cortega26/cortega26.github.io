# Plan 025: i18n route registry + normalized sitemap hreflang

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 2a10c13..HEAD -- astro.config.mjs src/layouts/BaseLayout.astro src/data/routes.ts src/pages tests/run.js tests/sitemap-i18n.mjs package.json .github/workflows/deploy.yml`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: MED (touches every page's head links + the sitemap)
- **Depends on**: none
- **Category**: SEO / i18n
- **Planned at**: commit `2a10c13`, 2026-09-23
- **Audit finding(s)**: H-02 (primary), H-11 (partial)

## Why this matters

The sitemap currently emits contradictory hreflang signals: the group for
`/`, `/en/`, `/es/` lists `en` twice (`/` and `/en/`) with no `x-default`,
and the three ES guides carry no `xhtml:link` at all even though their HTML
declares `es` + `x-default`. Search engines receive conflicting language
equivalences, which is exactly the class of bug that silently splits
indexing. The long-term fix is one source of truth for routes/alternates
consumed by both the HTML `<head>` and the sitemap serializer, so the two
cannot drift again.

## Current state (verified 2026-09-23, commit `2a10c13`)

- `astro.config.mjs`:
  ```js
  sitemap({
    i18n: { defaultLocale: 'en', locales: { en: 'en', es: 'es' } },
  })
  ```
  `@astrojs/sitemap` ^3.2.0. Its `serialize(item)` hook receives an item with
  `url`, `lastmod`, `changefreq`, `priority`, `links` (array of
  `{ url, lang }`) and may return a modified item (`dist/index.d.ts`:
  `SitemapItem = Pick<SitemapItemLoose, 'url' | 'lastmod' | 'changefreq' |
  'priority' | 'links'>`).
- Observed `dist/sitemap-0.xml`:
  - `/`, `/en/`, `/es/`: `en=/`, `en=/en/`, `es=/es/` (duplicate `en`, no `x-default`).
  - `/en/cookies/`, `/en/engagement/`, …: `en=<self>`, `es=<es twin>` (no `x-default`).
  - `/es/guias/*`: `<loc>` only — zero `xhtml:link`.
- `src/layouts/BaseLayout.astro:12-16` hardcodes `defaultAlternates` =
  `en=/en/`, `es=/es/`, `x-default=/` (used by pages that pass no
  `alternates` prop — the two home pages).
- Per-page hardcoded alternates today:
  - `src/pages/[lang]/[document].astro` (privacy/cookies/terms/engagement):
    `en`, `es`, `x-default=<en twin>`.
  - 10 service route files (e.g. `src/pages/en/services/python-automation/index.astro`):
    `en=<canonical>`, `es=<es twin>`, `x-default=<canonical>`.
  - `src/pages/en/work/index.astro` + `src/pages/es/trabajo/index.astro`:
    `en`, `es`, `x-default=/en/work/`.
  - 3 guide pages: `es=<canonical>`, `x-default=<canonical>`.
  - `src/pages/index.astro`: `es=/es/`, `en=/en/`, `x-default=/`.
- `tsconfig.json` extends `astro/tsconfigs/strictest`; JSON imports already
  work in `src/` (`PortfolioSection.astro` imports `github-stats.json`).
- Existing tests: `tests/run.js` group `I1` only asserts the sitemap
  integration exists; there is no hreflang/sitemap validator today.

## Normalization rule (single rule for the whole site)

For every route group:

- Bilingual group (has EN and ES URLs): `en=<en url>`, `es=<es url>`,
  `x-default=https://tooltician.com/` (the root landing, which Plan 031
  converts into a real bilingual page).
- Monolingual ES group (guides): `es=<es url>`, `x-default=<es url>` — the
  page is the default for unmatched users and there is deliberately no EN
  twin this cycle (maintainer decision, Plan 024).
- Every URL in a group renders the same alternate set in HTML and receives
  the same set in the sitemap. Self-referencing alternates are included.

This supersedes the current per-page variants (some pages point `x-default`
at their EN twin). That is an intentional, documented change.

## Commands you will need

| Purpose | Command | Provenance | Expected on success |
|---------|---------|------------|---------------------|
| Typecheck | `npm run check` | declared | exit 0 |
| Source tests | `node tests/run.js` | executed | exit 0 |
| Build | `npm run build` | declared | exit 0 |
| Built tests | `node tests/run.js --built` | declared | exit 0 |
| New validator | `node tests/sitemap-i18n.mjs` | declared | exit 0, all asserts pass |

## Scope

**In scope** (the only files you should create/modify):
- CREATE `src/data/routes.ts` — route registry + `alternatesFor()` helper
- CREATE `tests/sitemap-i18n.mjs` — built-output validator
- `astro.config.mjs` — import the registry; add `sitemap({ serialize })`
- `src/layouts/BaseLayout.astro` — `defaultAlternates` from the registry
- The 10 service route files under `src/pages/{en,es}/...` — pass
  `alternatesFor('service:<serviceKey>')` instead of hardcoded arrays
- `src/pages/[lang]/[document].astro` — legal docs use `alternatesFor('doc:<key>')`
- `src/pages/en/work/index.astro`, `src/pages/es/trabajo/index.astro`,
  `src/pages/es/guias/*/index.astro`, `src/pages/index.astro` — use the registry
- `package.json` — append `&& node tests/sitemap-i18n.mjs` after the `--built` step
- `.github/workflows/deploy.yml` — one blocking `Sitemap i18n check` step
  after `Built output tests`
- `tests/run.js` — replace the `I4` assertion only if Plan 031 already landed
  (see dependency note); do not add other groups here

**Out of scope** (do NOT touch):
- Sitemap generation for the guides hub (Plan 032 adds that route to the registry)
- Any copy, pricing, schema, or form behavior
- `scripts/check-links-seo.js` (leave its output contract unchanged)

## Git workflow

- Branch: `advisor/025-i18n-routes-sitemap`
- Conventional commit, e.g. `fix(seo): single-source hreflang for HTML and sitemap`
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 0: Baseline

1. `npm ci` if needed. `node tests/run.js` → green; record counts.
2. `npm run build && node tests/run.js --built` → green baseline.
3. Save the current sitemap for comparison: `cp dist/sitemap-0.xml /tmp/opencode/sitemap-before.xml`.

**Verify**: green baseline; `/tmp/opencode/sitemap-before.xml` exists.

### Step 1: Create the route registry

Create `src/data/routes.ts`. Shape (adapt to strictest TS — no `any`):

```ts
export type Locale = 'en' | 'es';

export interface RouteGroup {
  id: string;
  /** Pathname with trailing slash; null when the locale has no page. */
  paths: Partial<Record<Locale, string>>;
  /** Pathname the x-default hreflang points to. */
  xDefault: string;
}

export const SITE_ORIGIN = 'https://tooltician.com';

export const routeGroups: RouteGroup[] = [
  { id: 'home',    paths: { en: '/en/', es: '/es/' }, xDefault: '/' },
  { id: 'work',    paths: { en: '/en/work/', es: '/es/trabajo/' }, xDefault: '/' },
  { id: 'privacy', paths: { en: '/en/privacy/', es: '/es/privacy/' }, xDefault: '/' },
  // … cookies, terms, engagement, six services, three guides
];

export function alternatesFor(groupId: string): { hreflang: string; href: string }[] { /* … */ }
export function groupForPath(pathname: string): RouteGroup | undefined { /* … */ }
export function sitemapLinksForPath(pathname: string): { url: string; lang: string }[] { /* … */ }
```

Rules:
- `alternatesFor` returns absolute URLs, `en` first, then `es`, then
  `x-default` (skip locales with no path).
- `groupForPath` normalizes the pathname (ensure trailing slash) and matches
  `paths` values.
- `sitemapLinksForPath` returns `{ url, lang }` pairs using the `@astrojs/sitemap`
  link shape (`lang: 'x-default'` for the default entry).
- Keep `routeGroups` ordered; Plan 032 appends the `guides-hub` group.

**Verify**: `npm run check` → exit 0.

### Step 2: Wire the registry into the pages

1. `BaseLayout.astro`: replace the literal `defaultAlternates` with
   `alternatesFor('home')` (import from `../data/routes`). Keep the
   `alternates` prop override for pages that still pass one.
2. Service route files (10): replace the local `alternates` array with
   `alternatesFor('service:' + def.serviceKey)` (or `'service:htw'` for the
   bespoke HTW pages — read them; they are hand-built, so update their
   hardcoded arrays too).
3. `src/pages/[lang]/[document].astro`: `alternatesFor('doc:' + documentKey)`.
4. Work pages: `alternatesFor('work')`.
5. Guide pages: `alternatesFor('guide:<slug>')`.
6. `src/pages/index.astro`: `alternatesFor('home')` (root keeps its own
   canonical `/`; only the alternate links come from the registry).

**Verify**: `npm run build` → exit 0; grep built HTML for one page per type
and confirm the three alternates are the registry's.

### Step 3: Normalize the sitemap

1. `astro.config.mjs`:
   ```js
   import { sitemapLinksForPath } from './src/data/routes.ts';
   // …
   sitemap({
     i18n: { defaultLocale: 'en', locales: { en: 'en', es: 'es' } },
     serialize(item) {
       const links = sitemapLinksForPath(new URL(item.url).pathname);
       return links.length > 0 ? { ...item, links } : item;
     },
   })
   ```
   (If the config loader rejects the TS import — see STOP conditions — convert
   the registry to `src/data/routes.json` plus a thin TS wrapper and import
   the JSON.)
2. Rebuild and inspect `dist/sitemap-0.xml`:
   - `/`: `en=/en/`, `es=/es/`, `x-default=/` — no duplicate `en`.
   - `/en/cookies/`: `en`, `es`, `x-default=/`.
   - `/es/guias/…`: `es`, `x-default=<self>`.
   - No URL lists the same `hreflang` twice.

**Verify**: `diff <(grep -o 'hreflang="[^"]*"' /tmp/opencode/sitemap-before.xml | sort | uniq -c) …`
shows the duplicate-`en` entries gone; manual read of the three cases above.

### Step 4: Add the validator and wire it

1. Create `tests/sitemap-i18n.mjs` (plain node, same style as
   `tests/analytics-service-funnel.mjs`): parse `dist/sitemap-0.xml` with a
   regex over `<url>…</url>` blocks and assert:
   - every grouped URL has exactly one `en` (when bilingual), one `es`, one
     `x-default`;
   - reciprocity: if `A` lists `B` as an alternate, `B` lists `A` (skip
     `x-default`);
   - `x-default` for every group equals the registry's `xDefault`;
   - HTML↔XML parity: for every grouped built page, the `<link rel="alternate">`
     set in the HTML equals the sitemap set;
   - each grouped canonical appears exactly once in the sitemap.
   Exit non-zero with a named failure list; print a one-line PASS summary.
2. `package.json` `test` script: append `&& node tests/sitemap-i18n.mjs`
   after `node tests/run.js --built`.
3. `deploy.yml`: blocking step `Sitemap i18n check` (`run: node
   tests/sitemap-i18n.mjs`) after `Built output tests`, before the Playwright
   install step.

**Verify**: `npm run build && node tests/sitemap-i18n.mjs` → exit 0; YAML parses.

## Test plan

- `tests/sitemap-i18n.mjs` is the gate (Step 4). Negative proof: temporarily
  duplicate an `en` link in the registry output (or revert the `serialize`
  hook), rebuild, confirm the validator fails, then restore — report the
  red-then-green result.

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `src/data/routes.ts` is the only place route pairs / x-default are defined
- [ ] `dist/sitemap-0.xml` has no duplicate `hreflang` per URL and an
      `x-default` for every grouped URL
- [ ] HTML alternates equal sitemap alternates for every grouped page
- [ ] `node tests/sitemap-i18n.mjs` exits 0 (red-then-green demonstrated)
- [ ] `npm run check`, `node tests/run.js`, `node tests/run.js --built`,
      `node test-htw-snapshot.mjs` all green
- [ ] CI has the blocking sitemap step; YAML parses
- [ ] `git diff --name-only 2a10c13...HEAD` lists only in-scope files
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- `astro.config.mjs` cannot import the TS registry (report the exact loader
  error; use the JSON fallback described in Step 3, do not invent a build step).
- The plugin's `serialize` hook cannot express the rule (report the observed
  item shape; do not patch `node_modules`).
- The guide HTML's `x-default` policy conflicts with the maintainer decision
  in Plan 024 (it should be `es` + `x-default=<self>`).
- Plan 031 has already rewritten `src/pages/index.astro` in a way that
  changes its alternate handling (re-read the file first).
- A step's verification fails twice after a reasonable fix attempt.

## Maintenance notes

For the human/agent who owns this code after the change lands:

- Adding a page means adding its group to `src/data/routes.ts` and using
  `alternatesFor()` — never hardcode alternates again.
- Plan 032 appends the `guides-hub` group; Plan 031 consumes `'home'`.
- If a third locale ever lands, extend `Locale`, the `paths` records, and
  `sitemapLinksForPath` together; the validator will fail loudly on any
  page left behind.
- The `i18n` option in `astro.config.mjs` stays only because the plugin
  needs it to emit the `xhtml` namespace; the registry is authoritative.
