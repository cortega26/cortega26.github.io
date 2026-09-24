# Plan 052: Test service-scoped brief attribution, and run the analytics suites in CI

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat be975ef..HEAD -- public/assets/js/intake-form.js tests/analytics-service-funnel.mjs package.json .github/workflows/deploy.yml`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: LOW
- **Depends on**: none
- **Category**: tests
- **Planned at**: commit `be975ef`, 2026-09-23

## Why this matters

`intake-form.js` resolves a service context from the form
(`data-track-form="intake_<service>"`) and attaches it to the canonical
brief lifecycle (`brief_start`/`brief_submit`/`brief_success`) plus
`service_engage` on first input. Nothing executes that path in a test: the
vm suite tests the API directly, and the Playwright suite runs on
localhost where the canonical layer is deliberately suppressed. A
regression in `serviceIdForForm` would silently strip `service_id` from
every brief event with all suites green — the per-service funnel signal
Sprint 0 exists for would be gone.

Separately: `npm test` runs `tests/analytics-service-funnel.mjs` and
`tests/analytics-guard.mjs` (77 assertions), but **CI never does** —
`deploy.yml` runs `node tests/run.js`, the built suite, sitemap, HTW, and
behavioral only. The analytics contract is unguarded on `master`.

## Current state (verified at `be975ef`)

`public/assets/js/intake-form.js:22-41`:

```js
  const serviceIdForForm = (ctx, form) => {
    try {
      const analytics = typedWindow.ttAnalytics;
      if (analytics && typeof analytics.serviceIdForElement === 'function') {
        const scoped = analytics.serviceIdForElement(form);
        if (scoped) return scoped;
      }
      const suffix = String(ctx || '').replace(/^intake_/, '');
      if (analytics && typeof analytics.resolveServiceId === 'function') {
        return analytics.resolveServiceId(suffix);
      }
    } catch (_) { /* ignore */ }
    return undefined;
  };
```

`:151-165` (first input) and `:167-203` (submit lifecycle) call
`funnel('briefStart', …)`, `funnel('serviceEngage', …)`,
`funnel('briefSubmit', …)`, `funnel('briefSuccess', …)`.

`package.json:15` test chain includes
`node tests/analytics-service-funnel.mjs && node tests/analytics-guard.mjs`.
`deploy.yml:42-68` has no analytics step.

The existing vm harness (`tests/analytics-service-funnel.mjs:42-106`)
provides `FakeElement`, `loadAnalytics`, and a `window.ttTrack` spy that
captures canonical events — extend that pattern.

## Commands you will need

| Purpose      | Command                                    | Provenance | Expected on success |
|--------------|--------------------------------------------|------------|---------------------|
| Install      | `npm ci`                                   | declared   | exit 0 |
| New suite    | `node tests/analytics-intake-attribution.mjs` | executed | all pass |
| Full tests   | `npm test`                                 | executed   | exit 0 |
| Typecheck    | `npm run check`                            | executed   | `0 errors` |

Notes: this suite needs no build and no browser.

## Scope

**In scope**:
- `tests/analytics-intake-attribution.mjs` (create)
- `package.json` (test chain only)
- `.github/workflows/deploy.yml` (one new step only)
- `plans/README.md` (status row only)

**Out of scope**:
- `public/assets/js/intake-form.js` and `product-analytics.js` — no
  production change; this plan only adds tests.
- `test-behavioral.mjs` — the localhost suppression makes it the wrong
  layer for canonical assertions (documented in `test-behavioral.mjs:262-271`).
- Any event names or registry values.

## Git workflow

- Branch: `advisor/052-intake-attribution-tests`
- Conventional commits, e.g. `test(analytics): execute intake-form service attribution; run analytics suites in CI`.
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 0: Green baseline

`npm ci` → `node tests/analytics-service-funnel.mjs` (77 passed) →
`npm test`.

**Verify**: all green. If not, STOP and report.

### Step 1: Create the attribution suite

Create `tests/analytics-intake-attribution.mjs`. Structure (follow
`tests/analytics-service-funnel.mjs:16-106` for the vm harness style):

1. **Sandbox with a fake form.** Load the real
   `public/assets/js/product-analytics.js` and then
   `public/assets/js/intake-form.js` into one `vm` context with:

```js
const calls = [];
function fakeControl(id, { valid = true } = {}) {
  return {
    id, dataset: {}, value: '',
    checkValidity: () => valid,
    setAttribute() {}, removeAttribute() {}, focus() {},
    addEventListener() {}, validity: {},
  };
}
function fakeForm(ctx, { valid = true } = {}) {
  const controls = [fakeControl('contact-name', { valid }), fakeControl('contact-email', { valid })];
  const el = () => ({ classList: { add() {}, remove() {} }, hidden: true, textContent: '', focus() {}, scrollIntoView() {} });
  const successEl = el(), errorEl = el(), summaryEl = el();
  const pageField = fakeControl('page');
  const submitBtn = { textContent: 'Send', disabled: false, dataset: {} };
  const listeners = {};
  return {
    _listeners: listeners, _pageField: pageField, _controls: controls,
    getAttribute: (n) => (n === 'data-track-form' ? ctx : null),
    setAttribute() {},
    querySelector: (sel) => {
      if (sel === 'button[type="submit"]') return submitBtn;
      if (sel === '.intake-form__success') return successEl;
      if (sel === '.intake-form__error') return errorEl;
      if (sel === '[data-fill="page"]') return pageField;
      if (sel === '.intake-form__summary') return summaryEl;
      if (sel === '[data-summary-text]') return summaryEl;
      if (sel.startsWith('label[for=')) return { textContent: 'label' };
      return null;
    },
    querySelectorAll: () => controls,
    addEventListener: (name, fn) => { (listeners[name] = listeners[name] || []).push(fn); },
    reset() { controls.forEach((c) => { c.value = ''; }); },
    action: 'https://formspree.io/f/mock',
  };
}
```

2. **Sandbox globals**: `document.querySelectorAll('form.intake-form')`
   returns `[form]`; `window.location.pathname = '/en/'`;
   `window.ttTrack = (name, params) => calls.push({ name, params })`;
   `fetch` returns `{ ok: true, status: 200 }`; `FormData` is a no-op
   class; `Element` is the `FakeElement` from the other suite (or a
   minimal class). Include `console`, `URL`.

3. **Cases** (each in a fresh sandbox):

   - **Scoped form** (`ctx = 'intake_automation'`): fire the `input`
     listener once → `calls` contains `brief_start` with
     `service_id === 'automation'` and `service_engage` with
     `service_id === 'automation'`. Then fire `submit` (with
     `{ preventDefault() {} }`) and await a microtask → `brief_submit`
     and `brief_success` both carry `service_id: 'automation'`.
   - **Generic form** (`ctx = 'intake'`): the same events fire with
     **no** `service_id`/`service_category` keys (the "never fake a
     service context" rule).
   - **Negative control**: remove `ttAnalytics` from the sandbox before
     loading `intake-form.js` → no canonical calls and no thrown error
     (legacy path still works).

**Verify**: `node tests/analytics-intake-attribution.mjs` → all pass. Prove
the test can fail: temporarily change the suffix regex in a copy of the
file (do not edit the real `intake-form.js`) — or reason it through if the
harness makes mutation awkward — and report how you validated sensitivity.

### Step 2: Wire the suite into `npm test`

In `package.json:15`, insert `node tests/analytics-intake-attribution.mjs`
after `node tests/analytics-guard.mjs`.

**Verify**: `npm test` exits 0 and its output includes the new suite.

### Step 3: Run the analytics suites in CI

In `.github/workflows/deploy.yml`, after the `Source tests` step (`:42-43`),
add:

```yaml
      - name: Analytics contract tests
        run: node tests/analytics-service-funnel.mjs && node tests/analytics-guard.mjs && node tests/analytics-intake-attribution.mjs
```

Sequence note: plan 047 also edits this file (permissions/cache). If both
land, whoever lands second inserts adjacent to the first, preserving step
style. Do not reorder existing steps.

**Verify**:

```bash
node -e "const fs=require('fs'),y=require('yaml');const w=y.parse(fs.readFileSync('.github/workflows/deploy.yml','utf8'));const names=w.jobs.build.steps.map(s=>s.name);if(!names.includes('Analytics contract tests'))process.exit(1);console.log('ci step OK')"
```

→ `ci step OK`.

### Step 4: Full gate

`npm run check && npm test`

**Verify**: exit 0.

## Test plan

- The new suite is the test: three cases (scoped, generic, negative
  control) over the real `intake-form.js` + `product-analytics.js`.
- No build or browser needed; runs in ~1 s.
- CI wiring (Step 3) makes the existing 77 analytics assertions blocking.

## Done criteria

ALL must hold:

- [ ] `node tests/analytics-intake-attribution.mjs` exits 0
- [ ] `npm test` exits 0 and includes the new suite
- [ ] Step 3's `ci step OK` one-liner prints `ci step OK`
- [ ] `git diff --name-only master...HEAD` lists only the in-scope files plus
      `plans/README.md`
- [ ] `plans/README.md` status row for 052 updated

## STOP conditions

Stop and report back (do not improvise) if:

- The drift check shows an in-scope file changed since `be975ef`.
- The fake-form harness cannot drive `intake-form.js` (e.g. an unexpected
  DOM API is required) — report the API list instead of stubbing the
  production file.
- The new suite passes even with `serviceIdForForm` broken (no
  sensitivity) — report rather than weakening it.
- Anything appears to require touching an out-of-scope file.

## Maintenance notes

- New canonical intake behavior must extend this suite; the API-level
  suite (`analytics-service-funnel.mjs`) covers the event layer, this one
  covers the wiring.
- CI now blocks on all three analytics suites; keep them fast (no network,
  no browser).
- **Deferred:** a Playwright case for service-scoped canonical events would
  require disabling localhost suppression in a test build — not worth the
  production-code risk.
