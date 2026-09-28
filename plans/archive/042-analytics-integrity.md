# Plan 042: Fix `service_view` page scoping, legacy PII filtering, and the untracked Navbar CTA

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat be975ef..HEAD -- public/assets/js/product-analytics.js public/assets/js/track.js src/components/Navbar.astro tests/analytics-service-funnel.mjs tests/run.js`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: correctness
- **Planned at**: commit `be975ef`, 2026-09-23

## Why this matters

Three measurement-integrity defects in the analytics layer:

1. `service_view` is meant to fire only when a **service page** loads (its
   `<main data-service-id>`). The code instead grabs the *first*
   `[data-service-id]` element in the DOM. On `/en/`, `/es/`, and the three
   ES guides the first such element is the automation **service card**, so
   every home/guide load emits `service_view{automation}` before any user
   intent. All derived rates (`service_engage/service_view`,
   `brief_start/service_view`, `book_call/service_view`) are inflated and
   misattributed — the exact signal Sprint 1 uses to decide which service
   earns investment.
2. The legacy `track.js` transport forwards `tt_label` / `tt_location` /
   `tt_status` verbatim, while the canonical layer
   (`product-analytics.js`) drops values matching email/secret patterns.
   The two layers claim the same privacy invariant; only one enforces it.
3. The Navbar's persistent "Start a project" CTA — the most-rendered brief
   CTA on the site — carries no tracking attributes at all, so no
   placement-level contact intent is recorded.

## Current state

### 1. `service_view` scope (verified at `be975ef`)

`public/assets/js/product-analytics.js:310-318`:

```js
  function bindDeclarative() {
    if (!doc || typeof doc.addEventListener !== 'function') return;
    // service_view: a service page stamps its identity on <main data-service-id>.
    try {
      const scope = doc.querySelector('[data-service-id]');
      if (scope) serviceView(scope.getAttribute('data-service-id'));
    } catch (_) {
```

The comment states the intent. The real scopes:
- Service pages: `src/components/ServicePage.astro:111` —
  `<main id="main" data-service-id={serviceKey} data-service-category={serviceCategory}>`
- HTW pages: `data-service-id="htw"` on their `<main>`.
- Home cards: `src/components/ServicesSection.astro:111` —
  `<article data-service-id={svc.serviceId} class=...>` (automation is first
  in both locales — verified in `dist/en/index.html`).
- Guides: `ArticleCta` sections also carry `data-service-id`.

Documented contract: `docs/analytics-sprint-0.md:115` defines `service_view`
as "A service page becomes available (`<main data-service-id>` at load)";
`:305` says "Home page → no `service_view` (correct: no service scope)".

### 2. Legacy PII filter

`public/assets/js/track.js:34-40`:

```js
  function sanitizeParam(value) {
    if (typeof value !== 'string') return undefined;
    const trimmed = value.trim();
    if (!trimmed) return undefined;
    return trimmed.slice(0, MAX_PARAM_LEN);
  }
```

The canonical layer has the filter (`product-analytics.js:66-68`):

```js
  const MAX_LEN = 100;
  const SECRET_PATTERN = /api[_-]?key|secret|token|passwd|password|bearer|session|cookie|auth|credential|private[_-]?key/i;
  const EMAIL_PATTERN = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;
```

`track.js:112-115` auto-binds `el.textContent` as `tt_label` for any
`[data-track]` element. No current tracked element contains an email, so the
gap is latent, not active.

### 3. Navbar CTA

`src/components/Navbar.astro:76-80`:

```astro
        <li>
          <a class="navbar__cta" href={resolvedCtaHref}>
            {ctaLabel}
          </a>
        </li>
```

Compare the hero's canonical pair (`HeroSection.astro:127`):
`data-track="cta_send_brief" data-track-loc="hero" data-contact-intent="send_brief"`.
`track.js:110-115` binds `[data-track]` and reads `data-track-loc`.

### Test harness that will break without an update

`tests/analytics-service-funnel.mjs:76-86` stubs the DOM query:

```js
  const scopeEl = opts.serviceScope
    ? { getAttribute: (n) => (n === 'data-service-id' ? opts.serviceScope : null) }
    : null;
  ...
      querySelector: (sel) => (sel === '[data-service-id]' ? scopeEl : null),
```

and `:264-265` asserts "auto service_view on service scope". Changing the
selector requires updating this stub.

## Commands you will need

| Purpose        | Command                                  | Provenance | Expected on success |
|----------------|------------------------------------------|------------|---------------------|
| Install        | `npm ci`                                 | declared   | exit 0 |
| Build          | `npx --no-install astro build`           | executed   | `[build] Complete!`, 30 pages |
| Typecheck      | `npm run check`                          | executed   | `0 errors`, `0 warnings`, `0 hints` |
| Analytics tests| `node tests/analytics-service-funnel.mjs`| executed   | `77 passed, 0 failed` before your change |
| Source tests   | `node tests/run.js`                      | executed   | `All checks passed.` (218/218 before) |
| Full gate      | `npm test`                               | executed   | exit 0 (source 218/218, analytics 77/77, built 247/247, sitemap/HTW/behavioral) |

Notes:
- A fresh worktree has no `dist/`: run the Build row before `npm test`
  (its `--built` stage reads `dist/`). Do NOT run `npm run build` — it
  rewrites the committed `src/data/github-stats.json`.
- Assertion counts are from `be975ef`; expect them to grow by the new tests
  you add, and never to shrink.

## Scope

**In scope** (the only files you may modify):
- `public/assets/js/product-analytics.js`
- `public/assets/js/track.js`
- `src/components/Navbar.astro`
- `tests/analytics-service-funnel.mjs`
- `tests/run.js`
- `plans/README.md` (status row only)

**Out of scope** (do NOT touch):
- `src/pages/index.astro` root-landing CTAs — a separate plan (054) owns
  the root shell; do not stamp them here.
- `src/components/PortfolioSection.astro` per-case CTA (`project-link--cta`)
  — its canonical stamping is an open maintainer decision (plan 038
  deferral); do not change it.
- The GA4 inline stub in `BaseLayout.astro` (CSP-hash pinned) and
  `src/data/service-registry.json` (no new events or services).
- `docs/analytics-sprint-0.md` — its contract already matches the fixed
  behavior; no doc change needed.

## Git workflow

- Branch: `advisor/042-analytics-integrity`
- Conventional commits, e.g. `fix(analytics): scope service_view to page main, filter legacy PII, stamp navbar CTA`.
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 0: Green baseline

`npm ci` → `npx --no-install astro build` → `npm run check` →
`node tests/analytics-service-funnel.mjs` → `node tests/run.js` → `npm test`.

**Verify**: all green; analytics prints `77 passed, 0 failed`; `npm test`
exit 0. If not, STOP and report the broken baseline.

### Step 1: Scope `service_view` to the page-level `<main>`

In `product-analytics.js:314`, change the selector:

```js
      const scope = doc.querySelector('main[data-service-id]');
```

In `tests/analytics-service-funnel.mjs:86`, update the stub selector string
to `'main[data-service-id]'` so `serviceScope` tests keep working.

Add a negative-control group to `tests/analytics-service-funnel.mjs` (model
it on the existing `loadAnalytics`/`calls` pattern at `:71-106`): build a
sandbox whose `document.querySelector` returns a card-like element for
`'[data-service-id]'` but `null` for `'main[data-service-id]'`, run
`product-analytics.js`, and assert **no** `service_view` call was emitted on
load. Also assert that with a `main` scope present, exactly one
`service_view` is emitted (the existing `:264` test covers the positive
case — keep it green).

**Verify**: `node tests/analytics-service-funnel.mjs` → all pass, including
the new negative control; `grep -n "querySelector('\[data-service-id\]')" public/assets/js/product-analytics.js` → no matches.

### Step 2: Apply the PII filter on the legacy transport

In `track.js`, add the two patterns next to `MAX_PARAM_LEN` (`:32`) and
enforce them in `sanitizeParam`:

```js
  const SECRET_PATTERN = /api[_-]?key|secret|token|passwd|password|bearer|session|cookie|auth|credential|private[_-]?key/i;
  const EMAIL_PATTERN = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;

  function sanitizeParam(value) {
    if (typeof value !== 'string') return undefined;
    const trimmed = value.trim();
    if (!trimmed) return undefined;
    if (SECRET_PATTERN.test(trimmed) || EMAIL_PATTERN.test(trimmed)) return undefined;
    return trimmed.slice(0, MAX_PARAM_LEN);
  }
```

Apply the same treatment to the `tt_label`/`tt_location`/`tt_status`
assignments in `send()` (`track.js:50-52`) — they are currently written
without sanitization. Route them through `sanitizeParam` (or the same
patterns) so all three legacy params share the invariant.

Add a vm test in `tests/analytics-service-funnel.mjs`: load `track.js` in the
sandbox, call `window.ttTrack('form_start', { label: 'user@example.com' })`
and assert no `gtag` event is emitted with that label (the sandbox can spy
on `gtag`), plus a positive control (`label: 'hero'` passes).

**Verify**: `node tests/analytics-service-funnel.mjs` → all pass.

### Step 3: Stamp the Navbar CTA

In `Navbar.astro:77`, mirror the hero's canonical + legacy pair:

```astro
          <a class="navbar__cta" href={resolvedCtaHref} data-track="cta_send_brief" data-track-loc="navbar" data-contact-intent="send_brief">
```

Extend the `S0` group in `tests/run.js` (find it with
`grep -n "S0 · " tests/run.js`) with one assertion that the Navbar CTA
carries `data-contact-intent="send_brief"` and `data-track-loc="navbar"`.

**Verify**: `node tests/run.js` → `All checks passed.` with the source count
grown by exactly the new assertions.

### Step 4: Full gate

`npx --no-install astro build && npm run check && npm test`

**Verify**: exit 0; `node tests/run.js --built` prints `247 + N` (N = new
built-safe assertions, if any); `git status --short src/data/github-stats.json`
→ empty.

## Test plan

- New negative control for `service_view` page scoping (Step 1).
- New legacy-PII vm test plus positive control (Step 2).
- One new source assertion for the Navbar stamp (Step 3).
- Structural pattern to follow: `tests/analytics-service-funnel.mjs:71-106`
  (`loadAnalytics` sandbox) and the `S0b` group in `tests/run.js:1311-1335`.
- No browser tests are required; the vm harness covers the JS behavior.

## Done criteria

ALL must hold:

- [ ] `npm run check` exits 0
- [ ] `node tests/analytics-service-funnel.mjs` all pass, including the new
      negative control and PII tests
- [ ] `npm test` exits 0
- [ ] `grep -n "querySelector('\[data-service-id\]')" public/assets/js/product-analytics.js`
      → no matches
- [ ] `grep -n "data-contact-intent" src/components/Navbar.astro` → 1 match
- [ ] `git diff --name-only master...HEAD` lists only the in-scope files
      plus `plans/README.md`
- [ ] `plans/README.md` status row for 042 updated

## STOP conditions

Stop and report back (do not improvise) if:

- The drift check shows an in-scope file changed since `be975ef` and the
  excerpts no longer match.
- The vm harness cannot observe the load-time `service_view` emission
  (the test approach in Step 1 turns out to be impossible without rewriting
  the sandbox).
- A step's verification fails twice after a reasonable fix attempt.
- Anything appears to require touching an out-of-scope file.

## Maintenance notes

- `service_view` now fires only for `main[data-service-id]`. If a future
  page type needs a page-level service scope, stamp its `<main>`, not a
  section.
- The legacy `track.js` and canonical `product-analytics.js` layers now
  enforce the same PII patterns; if the pattern list changes, change both
  (a parity test would be a good follow-up).
- **Deferred:** root-landing CTA stamping — owned by plan 054 (root shell).
- **Deferred:** per-case work CTA (`project-link--cta`) canonical stamping —
  blocked on the maintainer decision recorded in plan 038's deferral.
