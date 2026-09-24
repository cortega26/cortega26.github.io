# Plan 046: Stop gating above-the-fold content (H1/LCP) on JavaScript

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat be975ef..HEAD -- src/styles/global.css src/components/HeroSection.astro src/components/ServicePage.astro src/components/PortfolioSection.astro src/pages/es/guias/index.astro src/pages/es/guias/auditoria-tecnica-web-negocios-pequenos/index.astro src/pages/es/guias/automatizar-reportes-excel-python/index.astro src/pages/es/guias/pagina-web-estatica-cuando-conviene/index.astro src/pages/en/services/web-technical-hygiene/index.astro src/pages/es/servicios/higiene-tecnica-web/index.astro src/pages/[lang]/[document].astro tests/run.js`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW-MED (visual entrance animation changes on hero blocks)
- **Depends on**: none
- **Category**: perf
- **Planned at**: commit `be975ef`, 2026-09-23

## Why this matters

Every commercial page hides its H1 and hero content behind the JS reveal
animation: `.reveal { opacity: 0 }` plus an `IntersectionObserver` in
`site-layout.js` (a deferred script) that adds `.visible`. Until that
script downloads, executes, and observes the element — plus the 80–160 ms
transition delay — the hero cannot paint. That gates FCP/LCP on
JavaScript that is not needed to render text, and with JS blocked or
failing the H1 stays at `opacity: 0` forever (no `<noscript>` fallback for
hero content).

Fix: above-the-fold content uses a **CSS-only entrance animation**
(`.enter-now`) that runs on load without JS; below-the-fold sections keep
the existing observer-driven `.reveal`.

## Current state (verified at `be975ef`)

`src/styles/global.css:529-540`:

```css
/* ---- Reveal Animations ---- */
.reveal {
  opacity: 0;
  transform: translateY(12px);
  transition: opacity var(--dur-slow) var(--ease-out), transform var(--dur-slow) var(--ease-out);
}
.reveal.visible {
  opacity: 1;
  transform: translateY(0);
}
.reveal-delay-1 { transition-delay: 80ms; }
.reveal-delay-2 { transition-delay: 160ms; }
```

`public/assets/js/site-layout.js:136-146` adds `.visible` via
`IntersectionObserver`; `BaseLayout.astro:121-123` loads the script with
`defer`. Reduced-motion users are handled at `global.css:658` for
`.reveal`; the new class needs its own guard.

Above-the-fold elements carrying `reveal` (all verified):

| File | Line | Element |
|---|---|---|
| `src/components/HeroSection.astro` | 107, 112, 113, 117, 118, 120, 125, 129 | hero meta, H1, featured outcome, summary, support, service note, actions, CTA note |
| `src/components/ServicePage.astro` | 115, 116, 117, 118, 119, 123 | eyebrow, H1, lede, subcopy, actions, microcopy |
| `src/components/PortfolioSection.astro` | 127 | work-page H1 |
| `src/pages/en/services/web-technical-hygiene/index.astro` | 251 | H1 |
| `src/pages/es/servicios/higiene-tecnica-web/index.astro` | 319 | H1 |
| `src/pages/es/guias/index.astro` | 70 | H1 |
| `src/pages/es/guias/auditoria-tecnica-web-negocios-pequenos/index.astro` | 102 | H1 |
| `src/pages/es/guias/automatizar-reportes-excel-python/index.astro` | 102 | H1 |
| `src/pages/es/guias/pagina-web-estatica-cuando-conviene/index.astro` | 102 | H1 |
| `src/pages/[lang]/[document].astro` | 91 | legal-page header wrapper (contains the H1) |

The root landing (`src/pages/index.astro`) and 404 do not use global
`.reveal` and are out of scope.

## Commands you will need

| Purpose      | Command                        | Provenance | Expected on success |
|--------------|--------------------------------|------------|---------------------|
| Install      | `npm ci`                       | declared   | exit 0 |
| Build        | `npx --no-install astro build` | executed   | `[build] Complete!`, 30 pages |
| Typecheck    | `npm run check`                | executed   | `0 errors`, `0 warnings`, `0 hints` |
| Full tests   | `npm test`                     | executed   | exit 0 (218/218 src, 77/77 analytics, 247/247 built) |

Notes: fresh worktree → `npm ci`, then `npx --no-install astro build`
before `npm test`. Never `npm run build`.

## Scope

**In scope** (the only files you may modify):
- `src/styles/global.css` (add the new animation classes only)
- `src/components/HeroSection.astro`
- `src/components/ServicePage.astro`
- `src/components/PortfolioSection.astro` (H1 line only)
- `src/pages/en/services/web-technical-hygiene/index.astro` (H1 line only)
- `src/pages/es/servicios/higiene-tecnica-web/index.astro` (H1 line only)
- `src/pages/es/guias/index.astro` (H1 line only)
- `src/pages/es/guias/auditoria-tecnica-web-negocios-pequenos/index.astro` (H1 line only)
- `src/pages/es/guias/automatizar-reportes-excel-python/index.astro` (H1 line only)
- `src/pages/es/guias/pagina-web-estatica-cuando-conviene/index.astro` (H1 line only)
- `src/pages/[lang]/[document].astro` (header wrapper class only)
- `tests/run.js` (one new group)
- `plans/README.md` (status row only)

**Out of scope** (do NOT touch):
- `public/assets/js/site-layout.js` — the observer stays for below-fold
  sections.
- Below-the-fold `reveal` usages (services, proof, portfolio, FAQ, etc.).
- `src/pages/index.astro` root landing (own inline styles; no global
  `.reveal`) and `src/pages/404.astro`.
- HTW pages' other reveal usages beyond the H1 line.

## Git workflow

- Branch: `advisor/046-above-fold-reveal`
- Conventional commits, e.g. `perf(home): render above-the-fold content without JS`.
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 0: Green baseline

`npm ci` → `npx --no-install astro build` → `npm run check` → `npm test`.

**Verify**: all green. If not, STOP and report.

### Step 1: Add the CSS-only entrance classes

In `src/styles/global.css`, immediately after the `.reveal-delay-2` rule
(`:540`), add:

```css
/* ---- Immediate entrance for above-the-fold content (no JS gate) ---- */
@keyframes enter-now {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}
.enter-now {
  animation: enter-now var(--dur-slow) var(--ease-out) both;
}
.enter-now--delay-1 { animation-delay: 80ms; }
.enter-now--delay-2 { animation-delay: 160ms; }
@media (prefers-reduced-motion: reduce) {
  .enter-now { animation: none; }
}
```

**Verify**: `npm run check` → 0 errors (CSS is not typechecked; this is a
syntax sanity pass).

### Step 2: Swap the classes on above-the-fold elements

For every row in the table above, replace `reveal` with `enter-now` and
`reveal-delay-N` with `enter-now--delay-N`, preserving all other classes.
Examples:

- `HeroSection.astro:112`:
  `<h1 class="hero__title enter-now enter-now--delay-1">{c.title}</h1>`
- `ServicePage.astro:116`:
  `<h1 class="section-title enter-now enter-now--delay-1">{c.h1}</h1>`
- `PortfolioSection.astro:127`:
  `<h1 class="section-title enter-now">{c.title}</h1>`
- HTW/guides H1s: `class="section-title enter-now enter-now--delay-1"`.
- `[document].astro:91`:
  `<div class="policy-page__header enter-now">`.

Do not change any other `reveal` occurrence in those files.

**Verify**: `npx --no-install astro build`, then:

```bash
grep -rn '<h1[^>]*reveal' dist --include="*.html"      # expect no matches (exit 1)
grep -rn '<h1[^>]*enter-now' dist --include="*.html"   # expect 13 matches
```

### Step 3: Regression test

Add a group to `tests/run.js` (source-level, like the `S0` group at
`tests/run.js:1243+`):

- `HeroSection.astro`, `ServicePage.astro`, `PortfolioSection.astro`, the
  two HTW pages, the guides hub, and the three guide pages: the file
  contains `enter-now` and its H1 line does **not** contain `reveal`.
- `global.css` contains `.enter-now` and the `prefers-reduced-motion`
  override.

**Verify**: `node tests/run.js` → `All checks passed.` with the source
count grown by the new assertions.

### Step 4: Full gate

`npx --no-install astro build && npm run check && npm test`

**Verify**: exit 0; the HTW snapshot reports `no diff` (heading structure
unchanged); behavioral tests pass.

## Test plan

- Source assertions as in Step 3 (cheap, catches class regressions).
- Built check: no `<h1 … reveal>` in any `dist` page.
- Manual (operator, not the executor): load `/en/` with JS disabled and
  confirm the hero renders.

## Done criteria

ALL must hold:

- [ ] `npm run check` exits 0
- [ ] `npm test` exits 0; HTW snapshot `no diff`
- [ ] `grep -rn '<h1[^>]*reveal' dist --include="*.html"` → no matches
- [ ] `grep -c 'enter-now' src/components/HeroSection.astro` → 8
- [ ] `git diff --name-only master...HEAD` lists only the in-scope files plus
      `plans/README.md`
- [ ] `plans/README.md` status row for 046 updated

## STOP conditions

Stop and report back (do not improvise) if:

- The drift check shows an in-scope file changed since `be975ef`.
- Any listed line does not contain a `reveal` class (the template changed —
  re-derive the list before editing).
- `npm test` shows HTW snapshot drift (means heading markup changed
  unexpectedly).
- Anything appears to require touching an out-of-scope file.

## Maintenance notes

- Above-the-fold content uses `.enter-now` (CSS animation, no JS); all new
  hero-like blocks should use it, not `.reveal`.
- Below-the-fold `.reveal` still requires JS. If a no-JS audience matters
  beyond the hero, add a `<noscript>` style fallback for `.reveal`
  site-wide.
- **Deferred:** site-wide `<noscript>` reveal fallback — a one-rule change
  (`<noscript><style>.reveal{opacity:1;transform:none}</style></noscript>`)
  deliberately not included to keep this change focused; unblocked by a
  decision that no-JS below-fold rendering matters.
