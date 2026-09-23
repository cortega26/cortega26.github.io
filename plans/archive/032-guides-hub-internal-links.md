# Plan 032: Guides hub + internal linking + contextual CTAs

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 2a10c13..HEAD -- src/pages/es/guias src/pages/es/index.astro src/components/ResourcesSection.astro src/data/routes.ts src/data/services.ts src/pages/es/servicios/higiene-tecnica-web/index.astro src/components/Footer.astro tests/run.js`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition. ALSO confirm Plans 025 and 027 are
> DONE — this plan registers a route group and reuses `ArticleCta`.

## Status

- **Priority**: P2
- **Effort**: M
- **Risk**: MED (new public surface + ES home composition)
- **Depends on**: Plan 025 (route registry), Plan 027 (`ArticleCta`)
- **Category**: content / SEO
- **Planned at**: commit `2a10c13`, 2026-09-23
- **Audit finding(s)**: H-08 (primary), H-12 (guides half)

## Why this matters

The three Spanish guides are live, indexable, and honest, but they are
discovered mainly through the sitemap: the home page does not link them, the
service pages link them only twice (plus one inline link on the HTW page),
and there is no hub that presents them as a body of work. Each guide has a
bottom CTA only. The audit asks for a resources hub, inbound links from home
and the matching services, and a CTA at the start and end of each guide. The
language decision (Plan 024) is deliberately ES-only this cycle, so the hub
is `/es/guias/` with `es` + `x-default` alternates.

## Current state (verified 2026-09-23, commit `2a10c13`)

- Guides (all ES, ~350 lines each):
  - `src/pages/es/guias/auditoria-tecnica-web-negocios-pequenos/` → service
    `/es/servicios/higiene-tecnica-web/` (`#brief` anchor exists).
  - `src/pages/es/guias/automatizar-reportes-excel-python/` → service
    `/es/servicios/automatizacion-python/` (`#contact`).
  - `src/pages/es/guias/pagina-web-estatica-cuando-conviene/` → service
    `/es/servicios/sitios-web/` (`#contact`).
  - Each: `canonical`, `alternates` (es + x-default, Plan 025 replaces with
    `alternatesFor('guide:<slug>')`), `Article` + `FAQPage` + `BreadcrumbList`
    JSON-LD, `Navbar` with `ctaHref={serviceContactHref}`, bottom
    `article-cta` (Plan 027 replaces with `<ArticleCta variant="bottom">` and
    adds a top variant).
- Inbound links today:
  - `src/data/services.ts` — 2 guide links (ES Python automation line 511,
    ES static sites line 1950).
  - `src/pages/es/servicios/higiene-tecnica-web/index.astro` — 1 inline link.
  - No `/es/guias/` hub exists; `src/pages/es/index.astro` renders
    Hero / ResultsBand / Services / Portfolio / About / Faq / Contact.
- `tests/run.js` `C1` asserts Services before Portfolio on the home pages;
  `G1` asserts the retired Credentials section is absent. Nothing asserts
  exact ES home section composition.
- `public/llms.txt` lists services and legal pages; it does not enumerate
  guides (Plan 034 updates it).

## Commands you will need

| Purpose | Command | Provenance | Expected on success |
|---------|---------|------------|---------------------|
| Typecheck | `npm run check` | declared | exit 0 |
| Source tests | `node tests/run.js` | executed | exit 0 |
| Build | `npm run build` | declared | exit 0 |
| Built tests | `node tests/run.js --built` | declared | exit 0 |
| Sitemap validator | `node tests/sitemap-i18n.mjs` | declared | exit 0 |
| Link checker | `node scripts/check-links-seo.js` | declared | 0 internal issues |

## Scope

**In scope** (the only files you should create/modify):
- CREATE `src/pages/es/guias/index.astro` — the hub
- CREATE `src/components/ResourcesSection.astro` — compact ES home strip
- `src/pages/es/index.astro` — render `ResourcesSection` after `FaqSection`
- `src/data/routes.ts` — add the `guides-hub` group (Plan 025 file)
- `src/data/services.ts` — ensure each of the three guides is linked from its
  matching ES service (add the missing static-sites link; verify the other two)
- `src/pages/es/servicios/higiene-tecnica-web/index.astro` — already links its
  guide; only adjust if the link is below the fold and the hub link is needed
- `src/components/Footer.astro` — add a `Guías` link in the ES meta links
  (optional but cheap; keep EN unchanged)
- `tests/run.js` — append one `H-08` group

**Out of scope** (do NOT touch):
- English guides or EN hub (deliberately deferred, Plan 024 decision)
- Guide body copy beyond inserting the Plan 027 `ArticleCta` components
- JSON-LD helper extraction (Plan 033 owns it; the hub may use inline
  BreadcrumbList + ItemList in the current page style)
- Pricing, cases, form behavior

## Git workflow

- Branch: `advisor/032-guides-hub-internal-links`
- Conventional commit, e.g. `feat(content): add the ES guides hub and internal links`
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 0: Baseline

1. `node tests/run.js` → green; record counts.
2. `npm run build && node tests/run.js --built && node tests/sitemap-i18n.mjs` → green baseline.
3. Confirm Plans 025 and 027 are DONE; if not, STOP.

**Verify**: green baseline; 025 + 027 DONE.

### Step 1: Hub page

Create `src/pages/es/guias/index.astro`:
1. `canonical = 'https://tooltician.com/es/guias/'`, `alternates={alternatesFor('guides-hub')}`.
2. Register the group in `src/data/routes.ts`:
   `{ id: 'guides-hub', paths: { es: '/es/guias/' }, xDefault: '/es/guias/' }`
   (ES-only, per the Plan 024 decision). Also confirm the three existing
   `guide:*` groups are registered (Plan 025 created them).
3. Content: eyebrow `Guías`, H1 `Guías para decidir con criterio`, one
   intro paragraph, then a card per guide (title, one-line summary taken from
   the guide's own `description`, link `Leer guía`), and a closing CTA via
   `<ArticleCta variant="bottom" …>` pointing at `/es/#contact`.
4. JSON-LD: `CollectionPage` + `BreadcrumbList` + `ItemList` with the three
   guides as `Article` items (only visible entities; URLs = canonicals).
5. Keep the page inside `BaseLayout` + `Navbar`/`Footer` like the guides.

**Verify**: `npm run check` → exit 0; `npm run build` → `dist/es/guias/index.html` exists.

### Step 2: Home + service inbound links

1. Create `src/components/ResourcesSection.astro` (ES-only copy):
   - eyebrow `Recursos`, H2 `Guías para decidir con criterio`, subtitle, and
     three compact links (title + one-line summary) plus a `Ver todas las
     guías →` link to `/es/guias/`.
   - Use the same section classes as the rest of the home (`section`,
     `container`, `section-header`, `card-glass`) so it inherits styling.
2. `src/pages/es/index.astro`: render `<ResourcesSection />` after
   `<FaqSection />` (before `ContactSection`). Do not touch the EN home.
3. `src/data/services.ts`: add the missing guide link to the ES static-sites
   service (`Guía: página web estática y cuándo conviene`) and confirm the
   other two ES guide links resolve. Keep EN services unchanged.
4. `Footer.astro`: add `Guías` → `/es/guias/` to the ES meta links only.

**Verify**: `npm run build`; every guide is reachable from the home and from
its service; `node scripts/check-links-seo.js` → 0 internal issues.

### Step 3: Test group `H-08`

Append to `tests/run.js`:
- Source: `src/pages/es/guias/index.astro` exists and lists the three guide
  hrefs; `ResourcesSection.astro` links `/es/guias/`; `src/pages/es/index.astro`
  renders `<ResourcesSection`.
- Built (skip without dist): `dist/es/guias/index.html` contains the three
  guide URLs and a `CollectionPage` JSON-LD block; each guide page contains
  ≥1 link back to `/es/guias/` and two `article-cta` elements (Plan 027);
  `dist/es/index.html` links `/es/guias/`.
- Built: `dist/sitemap-0.xml` contains `/es/guias/` with `es` +
  `x-default=<self>` and no `en`.

**Verify**: `node tests/run.js --built` → exit 0; `node tests/sitemap-i18n.mjs` → exit 0.

## Test plan

- `H-08` + the sitemap validator (new route) + the link checker + full suite.
  Manual read of the hub for register and honesty (no invented claims).

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `/es/guias/` exists, is in the sitemap with `es` + `x-default`, and
      links all three guides
- [ ] Each guide is linked from the ES home and its matching service, and
      links back to the hub
- [ ] Each guide has a top and a bottom CTA (Plan 027 component)
- [ ] EN surfaces are unchanged (no EN hub, no EN guide links added)
- [ ] `npm run check`, `node tests/run.js`, `node tests/run.js --built`,
      `node test-htw-snapshot.mjs`, `node test-behavioral.mjs`,
      `node tests/sitemap-i18n.mjs` all green
- [ ] `node scripts/check-links-seo.js` → 0 internal issues
- [ ] `git diff --name-only 2a10c13...HEAD` lists only in-scope files
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- Plans 025 or 027 are not DONE.
- Adding the home section breaks `C1` or any home-composition assertion
  (report the assertion; do not weaken it).
- A guide's service mapping is ambiguous (report; do not guess a different
  service).
- The hub JSON-LD would describe an entity not visible on the page (drop the
  entity, do not publish invisible schema).
- A step's verification fails twice after a reasonable fix attempt.

## Maintenance notes

For the human/agent who owns this code after the change lands:

- New guides go into the hub's list, the `routes.ts` registry, and at least
  one service page; the `H-08` group checks the hub list but not new guides —
  extend it when the list grows.
- The hub is ES-only by decision; if EN guides are ever published, add the EN
  hub, update both groups in `routes.ts`, and extend `tests/sitemap-i18n.mjs`
  parity automatically (it reads the registry).
- Plan 034 updates `llms.txt` to mention the hub.
