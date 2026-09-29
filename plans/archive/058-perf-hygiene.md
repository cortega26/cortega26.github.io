# Plan 058: Trim page-head weight and make the scroll bar compositor-friendly

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat be975ef..HEAD -- src/layouts/BaseLayout.astro src/components/Navbar.astro src/components/ServicePage.astro src/pages/en/index.astro src/pages/es/index.astro src/pages/en/services/web-technical-hygiene/index.astro src/pages/es/servicios/higiene-tecnica-web/index.astro src/styles/global.css public/assets/js/site-layout.js tests/run.js`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: perf
- **Planned at**: commit `be975ef`, 2026-09-23

## Why this matters

Four concrete, measured costs on every page load:

1. **JetBrains Mono is preloaded on all 30 pages** (40,404 B) beside the
   LCP font (Archivo, 34,928 B) — the mono font styles only nav/labels and
   already uses `font-display: swap`, so it can be discovered from CSS.
2. **The navbar logo** (128×128 webp, 8,100 B) renders at 32×32 with
   `fetchpriority="high"` — a decorative, 4×-oversized image competing
   with the LCP font.
3. **`formspree.io` is preconnected on all 29 BaseLayout pages**, but 15
   of them contain no form (work, guides, legal, 404).
4. **The scroll progress bar** writes `style.width` (a layout property)
   and re-reads `scrollHeight` on every scroll event.

## Current state (verified at `be975ef`)

`src/layouts/BaseLayout.astro:47-49`:

```astro
  <!-- Self-hosted fonts — preload critical files first (Archivo 700 = H1/LCP element) -->
  <link rel="preload" href="/fonts/archivo-variable.woff2" as="font" type="font/woff2" crossorigin />
  <link rel="preload" href="/fonts/jetbrains-mono-variable.woff2" as="font" type="font/woff2" crossorigin />
```

`:82-83`:

```astro
  <!-- Third-party preconnects -->
  <link rel="preconnect" href="https://formspree.io" />
```

`src/components/Navbar.astro:26-35` — `src="/assets/images/tooltician-logo-128.webp"`,
`width/height=32`, `loading="eager"`, `fetchpriority="high"`.

`src/styles/global.css:146-155`:

```css
#scroll-progress {
  ...
  width: 0%;
  background: var(--clr-accent-2);
  z-index: 9999;
  transition: width 0.1s linear;
}
```

`public/assets/js/site-layout.js:23-27`:

```js
  const onScroll = () => {
    const total = document.documentElement.scrollHeight - window.innerHeight;
    const pct = total > 0 ? (window.scrollY / total) * 100 : 0;
    if (bar) bar.style.width = `${pct}%`;
```

Pages that render a form (and therefore should keep the preconnect):
`src/components/ServicePage.astro` (renders `IntakeForm`), `en/index.astro`
and `es/index.astro` (via `ContactSection`), and the two HTW pages (render
`IntakeForm` directly). All other BaseLayout users do not.

## Commands you will need

| Purpose      | Command                        | Provenance | Expected on success |
|--------------|--------------------------------|------------|---------------------|
| Install      | `npm ci`                       | declared   | exit 0 |
| Build        | `npx --no-install astro build` | executed   | `[build] Complete!`, 30 pages |
| Full tests   | `npm test`                     | executed   | exit 0 |
| CSP check    | `node scripts/check-csp-hashes.mjs` | executed | MATCH |

## Scope

**In scope**:
- `src/layouts/BaseLayout.astro` (preload line, `hasForm` prop, preconnect gate)
- `src/components/Navbar.astro` (one attribute)
- `src/components/ServicePage.astro` (pass `hasForm`)
- `src/pages/en/index.astro`, `src/pages/es/index.astro` (pass `hasForm`)
- `src/pages/en/services/web-technical-hygiene/index.astro`,
  `src/pages/es/servicios/higiene-tecnica-web/index.astro` (pass `hasForm`)
- `src/styles/global.css` (`#scroll-progress` only)
- `public/assets/js/site-layout.js` (the scroll handler only)
- `tests/run.js` (one new group)
- `plans/README.md` (status row only)

**Out of scope**:
- Creating a smaller logo asset — deferred (needs visual review).
- The GA4 preconnects, font files, `.reveal` behavior.
- `src/pages/index.astro` (root landing) — it has its own head and no
  Formspree preconnect.

## Git workflow

- Branch: `advisor/058-perf-hygiene`
- Conventional commits, e.g. `perf(layout): preload only the LCP font, gate Formspree preconnect, compositor scroll bar`.
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 0: Green baseline

`npm ci` → `npx --no-install astro build` → `npm run check` → `npm test` →
`node scripts/check-csp-hashes.mjs`.

**Verify**: all green; CSP MATCH. If not, STOP and report.

### Step 1: Preload only the LCP font

In `BaseLayout.astro`, delete the JetBrains Mono preload line (`:49`),
keeping the Archivo preload and updating the comment to say only the LCP
font is preloaded. Do the same in `src/pages/index.astro:49-50` if it has
the same pair (it does; the root is in scope for this one line only).

**Verify**: `grep -c "jetbrains-mono-variable.woff2" src/layouts/BaseLayout.astro src/pages/index.astro`
→ 0 for both files.

### Step 2: Gate the Formspree preconnect

1. Add a prop to `BaseLayout.astro`'s `Props` interface and destructuring:
   `hasForm?: boolean` (default `false`).
2. Replace the unconditional preconnect (`:83`) with
   `{hasForm && <link rel="preconnect" href="https://formspree.io" />}`.
3. Pass `hasForm` from the five form-bearing surfaces:
   - `ServicePage.astro:102` → `hasForm` on the `<BaseLayout …>` call.
   - `en/index.astro`, `es/index.astro` → `hasForm`.
   - Both HTW pages → `hasForm`.

**Verify**: `npx --no-install astro build`, then:

```bash
for p in en/index.html en/work/index.html en/privacy/index.html 404.html; do printf '%-22s %s\n' "$p" "$(grep -c 'formspree.io' dist/$p)"; done
```

→ home ≥ 1 (preconnect), work/privacy/404 → 0 (no form, no preconnect).
Also confirm the home still has a form: `grep -c '<form' dist/en/index.html`
→ ≥ 1.

### Step 3: Drop the logo's high priority

In `Navbar.astro`, delete `fetchpriority="high"` (keep `loading="eager"`,
`decoding="async"`, and the width/height attributes).

**Verify**: `grep -c "fetchpriority" src/components/Navbar.astro` → 0.

### Step 4: Make the scroll bar compositor-friendly

`global.css:146-155` — replace `width: 0%` with:

```css
  width: 100%;
  transform: scaleX(0);
  transform-origin: left center;
```

and `transition: width 0.1s linear` with `transition: transform 0.1s linear`.

`site-layout.js` — cache the total and rAF-throttle:

```js
  let scrollTotal = 0;
  const measure = () => {
    scrollTotal = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
  };
  measure();
  window.addEventListener('resize', measure, { passive: true });
  if (typeof ResizeObserver === 'function') {
    new ResizeObserver(measure).observe(document.documentElement);
  }

  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(() => {
      ticking = false;
      const pct = scrollTotal > 0 ? Math.min(1, window.scrollY / scrollTotal) : 0;
      if (bar) bar.style.transform = `scaleX(${pct})`;
      // …existing back-to-top and navbar toggles unchanged…
    });
  };
```

Keep the back-to-top and navbar class toggles inside the same rAF callback
(the existing `onScroll` body at `:28-37`).

**Verify**: `node --check public/assets/js/site-layout.js` → exit 0;
`grep -c "scaleX" public/assets/js/site-layout.js` → 1;
`grep -c "style.width" public/assets/js/site-layout.js` → 0.

### Step 5: Source guard tests

Add a group to `tests/run.js`:

- `BaseLayout.astro` does not contain `jetbrains-mono-variable.woff2` and
  contains `hasForm && <link rel="preconnect" href="https://formspree.io"`.
- `Navbar.astro` has no `fetchpriority`.
- `global.css` contains `transform: scaleX(0)` and no
  `transition: width 0.1s`.
- `site-layout.js` contains `requestAnimationFrame` and `scaleX`.

**Verify**: `node tests/run.js` → all pass.

### Step 6: Full gate

`npx --no-install astro build && npm run check && npm test && node scripts/check-csp-hashes.mjs`

**Verify**: all green; HTW snapshot `no diff`; CSP MATCH (no inline script
changes).

## Test plan

- Source guards (Step 5) + built preconnect assertions (Step 2).
- No visual regression tooling exists (explicitly out of scope); the
  operator should eyeball the scroll bar and logo on the preview server.

## Done criteria

ALL must hold:

- [ ] `grep -c "jetbrains-mono-variable.woff2" src/layouts/BaseLayout.astro` → 0
- [ ] Built pages: work/privacy/404 have 0 `formspree.io`; home has ≥ 1
- [ ] `grep -c "fetchpriority" src/components/Navbar.astro` → 0
- [ ] `grep -c "style.width" public/assets/js/site-layout.js` → 0
- [ ] `npm run check`, `npm test`, `node scripts/check-csp-hashes.mjs` all exit 0
- [ ] `git diff --name-only master...HEAD` lists only the in-scope files plus
      `plans/README.md`
- [ ] `plans/README.md` status row for 058 updated

## STOP conditions

Stop and report back (do not improvise) if:

- The drift check shows an in-scope file changed since `be975ef`.
- The root landing (`src/pages/index.astro`) uses the mono preload in a way
  that differs from the excerpt — report before editing.
- CSP hash check fails (means an inline script changed — you must not have
  touched one).
- Anything appears to require touching an out-of-scope file.

## Maintenance notes

- `hasForm` must be set on any new page that renders an intake form.
- The scroll bar now uses `transform: scaleX()`; do not reintroduce
  `style.width` or per-event `scrollHeight` reads.
- **Deferred:** a 64 px logo asset (or inline SVG) — the current file is 4×
  oversized; needs an asset-pipeline/visual decision. The high-priority
  fetch is removed here; the byte cost remains.
- **Deferred:** caching/self-hosting `gtag.js` — third-party, out of scope.
