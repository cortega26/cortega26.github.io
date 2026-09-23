# Plan 027: Accessible service CTAs + shared guide CTA component

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 2a10c13..HEAD -- src/components/ServicesSection.astro src/components/ArticleCta.astro src/styles/global.css src/pages/es/guias tests/run.js`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition. ALSO confirm Plan 026 is DONE —
> this plan edits `ServicesSection.astro` after 026's pricing change.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: Plan 026 (same file: `ServicesSection.astro`)
- **Category**: accessibility / conversion
- **Planned at**: commit `2a10c13`, 2026-09-23
- **Audit finding(s)**: H-03 (primary), H-12 (guides half; work-card half is Plan 029)

## Why this matters

The home page renders six links with the identical accessible name
`VIEW SERVICE` (EN) / `Ver servicio` (ES), each pointing at a different
service. Screen-reader users and link-extraction tools cannot tell them
apart — WCAG 2.4.4 (Link Purpose) territory. Guides have a bottom CTA but no
conversion action near the top, and the three guide pages duplicate the same
CTA block three times. The fix is a small shared component plus a
visually-hidden qualifier that keeps the short visible label (WCAG 2.5.3
Label in Name) while making each accessible name unique.

## Current state (verified 2026-09-23, commit `2a10c13`)

- `src/components/ServicesSection.astro`:
  - `en.ctaLabel = 'View service'`, `es.ctaLabel = 'Ver servicio'`.
  - Rendered once per card (line ~121):
    `<a class="btn btn-ghost btn-sm svc-inline-cta" href={svc.href}>{c.ctaLabel}</a>`.
  - Each `svc` already carries the localized service title in `svc.title`
    (e.g. `Automatización Python y Pipelines de Datos`) — use it, do not add
    a parallel name registry.
- `src/styles/global.css`: **no** `.visually-hidden` / `.sr-only` utility
  exists (grep-verified) — add one.
- Guide pages (`src/pages/es/guias/*/index.astro`, 3 files, ~350 lines each):
  - Each defines `serviceHref` + `serviceContactHref` and renders a
    `card-glass article-cta` block near the end (`<p
    class="article-cta__eyebrow">Servicio relacionado</p>`, `h3`, body,
    `btn btn-primary`). The three blocks are near-duplicates with different
    copy and hrefs.
  - No CTA near the hero/top; the Navbar's `ctaHref` points at the service.
  - `#brief` anchor used by the HTW guide exists on the HTW page
    (`id="brief"`) — verified; do not "fix" it.
- `tests/run.js` has no CTA-name assertions today. `test-behavioral.mjs`
  does not exercise the service CTA links.
- Plan 026 has just touched `ServicesSection.astro` (shapes strip +
  `engagementCompact`) — re-read the file before editing.

## Commands you will need

| Purpose | Command | Provenance | Expected on success |
|---------|---------|------------|---------------------|
| Typecheck | `npm run check` | declared | exit 0 |
| Source tests | `node tests/run.js` | executed | exit 0 |
| Build | `npm run build` | declared | exit 0 |
| Built tests | `node tests/run.js --built` | declared | exit 0 |

## Scope

**In scope** (the only files you should create/modify):
- `src/components/ServicesSection.astro` — unique accessible name per CTA
- CREATE `src/components/ArticleCta.astro` — one component, two variants
- `src/pages/es/guias/auditoria-tecnica-web-negocios-pequenos/index.astro`
- `src/pages/es/guias/automatizar-reportes-excel-python/index.astro`
- `src/pages/es/guias/pagina-web-estatica-cuando-conviene/index.astro`
- `src/styles/global.css` — `.visually-hidden` utility
- `tests/run.js` — append one `H-03` group

**Out of scope** (do NOT touch):
- `PortfolioSection.astro` / work-card CTA — Plan 029 owns it
- Pricing copy — Plan 026 owns it
- The guides hub page — Plan 032 owns it (it will import `ArticleCta`)
- Navbar/Footer CTA labels

## Git workflow

- Branch: `advisor/027-accessible-service-ctas`
- Conventional commit, e.g. `fix(a11y): name service CTAs and share the guide CTA`
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 0: Baseline

1. `node tests/run.js` → green; record counts.
2. `npm run build && node tests/run.js --built` → green baseline.
3. Confirm Plan 026 is DONE in `plans/README.md`; if not, STOP.

**Verify**: green baseline; 026 DONE.

### Step 1: Unique service CTA names

In `ServicesSection.astro`:

1. Add the utility to `global.css`:
   ```css
   .visually-hidden {
     position: absolute;
     width: 1px; height: 1px;
     padding: 0; margin: -1px;
     overflow: hidden; clip: rect(0 0 0 0);
     white-space: nowrap; border: 0;
   }
   ```
2. Render the CTA as:
   ```astro
   <a class="btn btn-ghost btn-sm svc-inline-cta" href={svc.href}>
     {c.ctaLabel}<span class="visually-hidden">: {svc.title}</span>
   </a>
   ```
   Accessible name becomes `View service: Python Automation & Data Pipelines`
   / `Ver servicio: Automatización Python y Pipelines de Datos` — the visible
   text stays a contiguous prefix (2.5.3) and all six names are unique.

**Verify**: `npm run build`; then
```
grep -o 'View service: [^<]*' dist/en/index.html | sort | uniq -c
grep -o 'Ver servicio: [^<]*' dist/es/index.html | sort | uniq -c
```
→ six distinct names each, count 1 per name.

### Step 2: Shared `ArticleCta.astro`

Create `src/components/ArticleCta.astro` with props:

```ts
interface Props {
  lang: 'en' | 'es';
  variant: 'top' | 'bottom';
  eyebrow: string;        // 'Servicio relacionado' / 'Related service'
  title: string;
  body: string;
  ctaLabel: string;
  ctaHref: string;
  serviceLabel: string;   // link text to the service page
  serviceHref: string;
}
```

- `variant="top"`: compact inline banner rendered right after the article
  hero (eyebrow + one sentence + primary button). No `<h3>` — use a `<p>`
  with strong text to avoid disturbing the H1→H2 outline.
- `variant="bottom"`: the existing `card-glass article-cta` block, including
  the `h3` and the "más detalle en la página del servicio" line.
- Move the duplicated styles into the component (`article-cta`,
  `article-cta__eyebrow`, and the top variant's styles). Remove those style
  blocks from the three guide pages (keep page-specific styles).

**Verify**: `npm run check` → exit 0.

### Step 3: Wire the three guides

For each guide:
1. Keep `serviceHref` / `serviceContactHref`.
2. Replace the inline bottom block with
   `<ArticleCta lang="es" variant="bottom" … />` passing the current copy
   verbatim (do not rewrite the copy in this plan).
3. Add `<ArticleCta lang="es" variant="top" … />` immediately after the
   `article-hero` section, with a one-sentence version of the same offer and
   the same `ctaHref`.
4. `npm run build`; confirm each guide page has exactly two CTAs pointing at
   its service contact anchor.

**Verify**: `grep -c 'article-cta' dist/es/guias/*/index.html` → 2 per page
(one top + one bottom); `node scripts/check-links-seo.js` → 0 internal issues.

### Step 4: Test group `H-03`

Append a group to `tests/run.js`:
- Source: `ServicesSection.astro` includes `visually-hidden` and the CTA
  renders `svc.title` inside the link.
- Built (skip when dist absent, `I8b` pattern): extract the six
  `svc-inline-cta` anchors from `dist/en/index.html` and `dist/es/index.html`;
  assert six unique accessible names (text content including the
  visually-hidden span) and that every href resolves to a distinct service
  path.
- Built: each `dist/es/guias/*/index.html` contains two elements with class
  `article-cta`.

**Verify**: `node tests/run.js --built` → exit 0.

## Test plan

- Group `H-03` above; full suite (`check`, source, built, HTW, behavioral)
  must stay green. Manual check: keyboard-focus the six CTAs and confirm the
  screen-reader name includes the service (or verify via the built HTML).

## Done criteria

Machine-checkable. ALL must hold:

- [ ] Six service CTAs have six distinct accessible names in EN and ES
- [ ] `ArticleCta.astro` exists and all three guides use both variants
- [ ] No duplicated `article-cta` styles remain in the guide pages
- [ ] `npm run check`, `node tests/run.js`, `node tests/run.js --built`,
      `node test-htw-snapshot.mjs`, `node test-behavioral.mjs` all green
- [ ] `node scripts/check-links-seo.js` → 0 internal issues
- [ ] `git diff --name-only 2a10c13...HEAD` lists only in-scope files
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- Plan 026 is not DONE (this plan edits the same file after it).
- The guide copy cannot be passed through the component without changing
  wording (do not rewrite articles here — report the mismatch).
- `svc.title` is not unique across the six services (report the collision).
- A step's verification fails twice after a reasonable fix attempt.

## Maintenance notes

For the human/agent who owns this code after the change lands:

- New service cards must keep the visually-hidden qualifier — the unique-name
  test will fail otherwise.
- New guides should import `ArticleCta` instead of copying the block; Plan 032
  reuses the same component on the hub.
- If a future redesign changes the visible CTA label, keep the accessible
  name a superset of the visible text (WCAG 2.5.3).
