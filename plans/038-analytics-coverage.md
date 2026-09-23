# Plan 038: Close the remaining analytics blind spots (home service cards + guide CTAs)

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan in
> `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 26d8529..HEAD -- src/components/ServicesSection.astro src/components/ArticleCta.astro src/pages/es/guias tests/run.js docs/analytics-sprint-0.md`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P2
- **Effort**: M
- **Risk**: MED (analytics semantics; no user-visible change)
- **Depends on**: none
- **Category**: direction (measurement coverage)
- **Planned at**: commit `26d8529`, 2026-09-23 (reconciled after plan 039; the only in-scope drift is `tests/run.js`, which gained the `EM` group at lines 1317–1331 — Step 5 accounts for it)

## Why this matters

The Sprint 0 canonical analytics layer answers "which service page gets
visited and engaged" but nothing on the home page emits a canonical event:
clicking a service card, a price chip, or an example badge is invisible, and
guide CTAs (the entire conversion path of the ES content pilot) emit nothing
either. The Sprint 1 hypotheses in `docs/analytics-sprint-0.md` §15 — which
offering earns deeper investment, whether guides produce service engagement —
cannot be answered without these stamps. This plan extends the existing
`service_engage`/`portfolio_click` events to those surfaces. It adds **no new
event names and no new GA4 dimensions**; `service_id` and `service_category`
are already registered.

## Current state

Facts the executor needs, inlined (verified by the advisor on 2026-09-23):

- `docs/analytics-sprint-0.md:346-357` — §14 known gaps, verbatim:

  ```text
  - Guide pages and work pages carry no `service_id` (correct per §3);
    per-article granularity is future work — GA4 page dimensions cover volume.
  - ProofSection card links and ServicesSection example badges have no canonical
    event yet (candidate: extend `proof_click` stamping — needs per-card service
    mapping first).
  ```

- `src/components/ServicesSection.astro` — the home services grid. Each card
  is built from `c.services` (en array lines 22–27, es array lines 54–59; the
  entries currently have `icon`, `title`, `desc`, `fit`, `scope`, `examples`,
  `href`, but **no service id**). Card markup (lines 110–142):

  ```astro
  111:  <article class={`card-glass svc-card ${svc.href ? 'svc-card--linked' : ''} reveal reveal-delay-${(i % 2) + 1}`}>
  ...
  121:    <a class="btn btn-ghost btn-sm svc-inline-cta" href={svc.href}>
  ...
  128:    <a class="badge badge-accent" href={ex.href} target="_blank" rel="noopener noreferrer">{ex.name}</a>
  ...
  137:    <a class="badge badge-accent" href={ex.href} target="_blank" rel="noopener noreferrer">{ex.name}</a>
  ```

  The price chips (lines 154–165) are built from `c.shapes` (en lines 39–42,
  es lines 71–74) with `href` only:

  ```astro
  158:  <a class="shape-chip" href={s.href}>
  ```

- `src/components/ArticleCta.astro` — shared guide CTA (Plan 027). Three
  anchors per instance, none tracked: top CTA (line 42), bottom CTA (line 54),
  alt service link (line 57). Used **twice per guide** (top + bottom):
  `src/pages/es/guias/auditoria-tecnica-web-negocios-pequenos/index.astro:113,226`,
  `src/pages/es/guias/automatizar-reportes-excel-python/index.astro:113,232`,
  `src/pages/es/guias/pagina-web-estatica-cuando-conviene/index.astro:113,226`.
  Each guide already declares its service via `serviceHref`/`serviceLabel`.

- `public/assets/js/product-analytics.js` — the canonical layer. Relevant
  facts:
  - `service_engage` (lines 49–51, 229–233) fires on `[data-service-engage]`
    clicks and dedups once per service per page load.
  - `portfolio_click` (lines 59, 276–278, 347–353) fires on
    `[data-portfolio-click]` only when the clicked element is an external
    `<a>`.
  - `serviceIdForElement()` (lines 109–120) resolves the nearest
    `[data-service-id]` ancestor (including the element itself).
  - `book_call` (lines 56, 264–266) fires on `[data-book-call]` and reads
    `cta_location` from `data-cta-loc` or `data-track-loc`.

- Service ids (from `src/data/service-registry.json`): `automation`,
  `recurring-data`, `internal-tools`, `financial`, `web`, `htw`.

- Guide → service mapping (`src/data/guides.ts`): auditoría técnica →
  `htw`; automatizar reportes → `automation`; página estática → `web`.

- `tests/analytics-service-funnel.mjs` already covers the runtime behavior:
  S8 (line 269) proves a `[data-service-engage]` element inside a
  `[data-service-id]` scope fires `service_engage` with the right service, and
  S8 (lines 279–288) proves `[data-portfolio-click]` on an external link fires
  `portfolio_click`. No unit-suite change is strictly required; the missing
  piece is the source stamping plus wiring assertions in `tests/run.js`.

## Commands you will need

| Purpose | Command | Provenance | Expected on success |
|---------|---------|------------|---------------------|
| Typecheck | `npm run check` | declared | exit 0 |
| Analytics unit suite | `node tests/analytics-service-funnel.mjs` | declared | all pass |
| Source tests | `node tests/run.js` | declared | exit 0 |
| Build | `npm run build` | declared | exit 0 |
| Built tests | `node tests/run.js --built` | declared | exit 0 |
| Stamping check | `grep -c "data-service-engage" src/components/ServicesSection.astro src/components/ArticleCta.astro` | declared | ≥ 1 in each |

## Scope

**In scope** (the only files you should modify):
- `src/components/ServicesSection.astro`
- `src/components/ArticleCta.astro`
- `src/pages/es/guias/auditoria-tecnica-web-negocios-pequenos/index.astro`
- `src/pages/es/guias/automatizar-reportes-excel-python/index.astro`
- `src/pages/es/guias/pagina-web-estatica-cuando-conviene/index.astro`
- `tests/run.js`
- `docs/analytics-sprint-0.md`

**Out of scope** (do NOT touch, even though they look related):
- `public/assets/js/product-analytics.js` — the canonical layer already
  supports every attribute this plan adds. Changing it risks the privacy
  guarantees and the 77-test suite.
- `public/assets/js/track.js`, `intake-form.js`, `contact-section.js` — no
  changes needed.
- `src/data/service-registry.json` — ids already exist; the parity test in
  `tests/run.js` S0 must stay green.
- `src/components/PortfolioSection.astro` — work pages already carry
  `data-portfolio-click` and the per-case service CTA.
- `src/components/ProofSection.astro` — orphaned (zero references); do not
  edit it.
- The guides hub (`src/pages/es/guias/index.astro`) — hub cards link to
  articles, not services; GA4 page dimensions cover that navigation.
- Any new event name or GA4 dimension.

## Git workflow

- Branch: `advisor/038-analytics-coverage`
- Conventional commit, e.g.
  `feat(analytics): stamp home service cards and guide CTAs with canonical service context`
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 0: Establish a green baseline

Run `npm run check`, `node tests/analytics-service-funnel.mjs`,
`node tests/run.js`, `npm run build`, `node tests/run.js --built`.

**Verify**: all exit 0. If a `declared` command fails on the unmodified
checkout, STOP and report (broken baseline).

### Step 1: Add service ids to the ServicesSection data

In `src/components/ServicesSection.astro`, add a `serviceId` property as the
first field of each object in both `services` arrays (en lines 22–27, es lines
54–59), in this order (both locales use the same ids in the same order):

| Array index | `serviceId` | EN href (for cross-check) |
|---|---|---|
| 1 | `automation` | `/en/services/python-automation/` |
| 2 | `recurring-data` | `/en/services/recurring-data-collection/` |
| 3 | `internal-tools` | `/en/services/internal-tools/` |
| 4 | `financial` | `/en/services/financial-tooling/` |
| 5 | `web` | `/en/services/static-sites/` |
| 6 | `htw` | `/en/services/web-technical-hygiene/` |

Example shape for the first EN entry:

```js
{ serviceId: 'automation', icon: SVG_REFRESH, title: 'Python Automation & Data Pipelines', ... },
```

Also add `serviceId` to each `shapes` chip entry (en lines 39–42, es lines
71–74): `Scoped automation` → `automation`; `Stabilization retainer` →
`automation`; `Web hygiene` → `htw`; `Diagnostic call` → no `serviceId` (it
links to Calendly, not a service page).

**Verify**: `grep -c "serviceId:" src/components/ServicesSection.astro` → 18
(6 en cards + 6 es cards + 3 en chips + 3 es chips; the "Diagnostic call" chip
row is excluded in both locales).

### Step 2: Stamp the ServicesSection markup

In the same file:

1. Card container (line 111): add `data-service-id={svc.serviceId}` to the
   `<article>`.
2. Card CTA (line 121): add `data-service-engage` to the `svc-inline-cta`
   anchor.
3. Example badges (lines 128 and 137): add `data-portfolio-click` to both
   anchors (they are external links, which is required for the event to fire).
4. Price chips (line 158): add `data-service-id={s.serviceId}` and
   `data-service-engage={s.serviceId ? '' : undefined}` to the `shape-chip`
   anchor. Because Astro renders `undefined` attributes as absent, chips
   without `serviceId` stay generic — that is intended.
5. Diagnostic-call chip: add `data-book-call` and
   `data-track-loc="services_shapes"` to the same `shape-chip` anchor
   conditionally — since all chips share one markup block, gate it on the
   chip entry instead: add a boolean `bookCall: true` to the `Diagnostic call`
   chip entry (en + es) and render
   `data-book-call={s.bookCall ? '' : undefined}` and
   `data-track-loc={s.bookCall ? 'services_shapes' : undefined}`. This fixes
   an untracked Calendly CTA that exists today.
   **The engage gate in item 4 is load-bearing**: the click handler checks
   `data-service-engage` first and returns (product-analytics.js:334-337); an
   ungated engage attribute on the service-less Diagnostic chip would swallow
   the click and no-op (`missing_params`), so `book_call` would never fire.
   With the gate, the Diagnostic chip falls through to the `data-book-call`
   branch and emits `book_call { cta_location: 'services_shapes' }`.

**Verify**: `grep -c "data-service-engage" src/components/ServicesSection.astro` → 2;
`grep -c "data-portfolio-click" src/components/ServicesSection.astro` → 2;
`grep -c "data-book-call" src/components/ServicesSection.astro` → 1.

### Step 3: Add the serviceId prop to ArticleCta

In `src/components/ArticleCta.astro`:

1. Extend the `Props` interface with `serviceId?: string;` and destructure it.
2. Top variant (line 33–45): add `data-service-id={serviceId}` to the
   `<section class="article-cta-band">` element and `data-service-engage` to
   the top CTA anchor (line 42).
3. Bottom variant (lines 46–60): add `data-service-id={serviceId}` to the
   wrapper `<div class="card-glass article-cta reveal">` (line 48),
   `data-service-engage` to the bottom CTA anchor (line 54), and both
   `data-service-id={serviceId}` and `data-service-engage` to the alt service
   link (line 57). The alt link lives in `<p class="article-alt">`, a sibling
   of the scoped `<div>`, so it needs its own scope (Element.closest includes
   the element itself).

**Verify**: `grep -c "data-service-engage" src/components/ArticleCta.astro` → 3;
`grep -c "data-service-id" src/components/ArticleCta.astro` → 3.

### Step 4: Pass the id from the three guides

For each guide page, add `serviceId="<id>"` to **both** `<ArticleCta>`
usages (top and bottom):

| File | `serviceId` |
|---|---|
| `src/pages/es/guias/auditoria-tecnica-web-negocios-pequenos/index.astro` | `htw` |
| `src/pages/es/guias/automatizar-reportes-excel-python/index.astro` | `automation` |
| `src/pages/es/guias/pagina-web-estatica-cuando-conviene/index.astro` | `web` |

**Verify**: `grep -c "serviceId=" src/pages/es/guias/*/index.astro` → each
file reports `2`.

### Step 5: Extend the test wiring

In `tests/run.js`, add a new group **immediately after the `EM` group**
(added by plan 039; it spans lines 1317–1331 and ends just before the
`// ─── Summary` comment at line 1332), following the same `read()`/`assert()`
style:

```js
group('S0b · Home service cards and guide CTAs carry canonical service context', () => {
  const servicesSection = read('src/components/ServicesSection.astro') || '';
  const registry = JSON.parse(read('src/data/service-registry.json'));
  const registryIds = registry.services.map((s) => s.service_id).sort();
  const stampedIds = [...servicesSection.matchAll(/serviceId: '([^']+)'/g)].map((m) => m[1]);
  assert('every card/chip serviceId exists in the registry', stampedIds.every((id) => registryIds.includes(id)), JSON.stringify(stampedIds));
  assert('cards are stamped with data-service-id', servicesSection.includes('data-service-id={svc.serviceId}'), 'missing card scope');
  assert('card CTAs + chips engage the service', (servicesSection.match(/data-service-engage/g) || []).length === 2, 'engage stamps');
  assert('example badges count as outbound portfolio clicks', (servicesSection.match(/data-portfolio-click/g) || []).length === 2, 'badge stamps');
  assert('calendly chip books a call', servicesSection.includes('data-book-call={s.bookCall'), 'chip book-call missing');
  assert('service-less chip is not swallowed by the engage branch', servicesSection.includes("data-service-engage={s.serviceId ? '' : undefined}"), 'chip engage gate missing');

  const articleCta = read('src/components/ArticleCta.astro') || '';
  assert('ArticleCta carries a service scope on section, card, and alt link', articleCta.includes('serviceId?: string') && (articleCta.match(/data-service-id=\{serviceId\}/g) || []).length === 3, 'ArticleCta scope missing');
  assert('ArticleCta anchors engage the service', (articleCta.match(/data-service-engage/g) || []).length === 3, 'ArticleCta engage stamps');

  for (const rel of [
    'src/pages/es/guias/auditoria-tecnica-web-negocios-pequenos/index.astro',
    'src/pages/es/guias/automatizar-reportes-excel-python/index.astro',
    'src/pages/es/guias/pagina-web-estatica-cuando-conviene/index.astro',
  ]) {
    const src = read(rel) || '';
    assert(`${rel} passes serviceId twice`, (src.match(/serviceId=/g) || []).length === 2, 'ArticleCta props');
  }
});
```

Then in the `if (BUILT)` block (starts line 787), after the two `[built]`
résumé assertions plan 039 added (they follow the cookies assertions near
line 906), add:

```js
assert(
  '[built] home cards carry service scope + engage stamps',
  distEN.includes('data-service-id="automation"') && distEN.includes('data-service-engage') && distES.includes('data-service-id="automation"'),
  'home service stamps missing from dist'
);
const distGuide = read('dist/es/guias/automatizar-reportes-excel-python/index.html') || '';
assert(
  '[built] guide carries service scope + engage stamps',
  distGuide.includes('data-service-id="automation"') && distGuide.includes('data-service-engage'),
  'guide stamps missing from dist'
);
```

**Verify**: `node tests/run.js` → exit 0 with the new group green;
`npm run build && node tests/run.js --built` → exit 0.

### Step 6: Update the analytics doc

In `docs/analytics-sprint-0.md`:

1. §4 event dictionary, `service_engage` row (line 116): change the trigger
   text to
   `First meaningful interaction showing interest in a service: intent-chip click, service-card CTA / price-chip click (home), guide CTA click, or first input into that service's brief form. Never page load; once per service per page load`.
2. §4 `portfolio_click` row (line 124): append
   `; also service example badges on the home cards` to the trigger.
3. §5 step 3 (line 160): append
   `Home service cards stamp data-service-id on the card and data-service-engage on the CTA/chip; example badges use data-portfolio-click; guide CTAs pass serviceId to ArticleCta.`
4. §14 known gaps: replace the two lines quoted in "Current state" with:

   ```text
   - Guide/work page granularity: resolved (plan 038) — guide CTAs are
     service-scoped; work-page case CTAs and project links already emit
     canonical events.
   - Home service cards, example badges, and price chips: resolved (plan 038).
     ProofSection was removed from the home in `79b5347`; its file is orphaned.
   ```

**Verify**: `grep -c "plan 038" docs/analytics-sprint-0.md` → ≥ 2;
`node tests/run.js` still exits 0.

### Step 7: Full gate

```sh
npm run check
node tests/analytics-service-funnel.mjs
node tests/run.js
npm run build
node tests/run.js --built
node test-behavioral.mjs
```

**Verify**: all exit 0.

## Test plan

- New source + built assertions in `tests/run.js` (Step 5) cover the stamping
  and registry parity.
- The runtime behavior is already proven by `tests/analytics-service-funnel.mjs`
  S8 (engage with scope, outbound portfolio click); do not duplicate it.
- `node test-behavioral.mjs` proves the home filters and forms still work
  after the markup change.

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `npm run check` exits 0
- [ ] `node tests/analytics-service-funnel.mjs` exits 0
- [ ] `node tests/run.js` exits 0 with the new `S0b` group green
- [ ] `npm run build && node tests/run.js --built` exits 0 with the two new `[built]` assertions green
- [ ] `node test-behavioral.mjs` exits 0
- [ ] `grep -c "data-service-engage" src/components/ServicesSection.astro src/components/ArticleCta.astro` reports 2 and 3
- [ ] No new canonical event name appears in `public/assets/js/product-analytics.js` (`git diff --name-only` must not list it)
- [ ] `git diff --name-only 26d8529...HEAD` lists only the seven in-scope files
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- The `serviceId` order in `ServicesSection.astro` does not line up with the
  `href` values in the table (the arrays were reordered) — report which card
  mismatches; do not guess the id from the title alone.
- A guide's `serviceHref` does not match the mapping table (e.g. the guide was
  repointed to a different service) — report and stop.
- The `BUILT` home assertions fail because the card markup changed shape —
  report the diff rather than weakening the assertion.
- You find yourself editing `product-analytics.js` to make an event fire:
  that means the attribute is wrong, not the layer. Stop and report.
- A verification command fails twice after a reasonable fix attempt.

## Maintenance notes

For the human/agent who owns this code after the change lands:

- `service_engage` now fires from more surfaces. Reporting by GA4 page
  dimension separates "engage on a service page" (chips) from "engage from the
  home" (cards) and "engage from a guide" (CTAs) — no dimension change needed.
- Adding a seventh service requires: registry entry, `serviceId` in both
  ServicesSection arrays, and the S0b parity assertion picks it up
  automatically.
- Reviewer should check that no user-visible markup changed (attributes only)
  and that the privacy suite (`node tests/analytics-service-funnel.mjs` S10)
  stays green.
- **Deferred:** work-page case CTA (`project-link--cta`) canonical stamping;
  it already carries a legacy `data-track` and its destination emits
  `service_view`. Unblocked by a decision that per-case CTA clicks are worth a
  canonical event.
- **Deferred:** guides-hub card events; GA4 page dimensions cover article
  selection today.
