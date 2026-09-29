# Plan 050: Preserve the `page` field across resets and add a Formspree honeypot

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat be975ef..HEAD -- src/components/IntakeForm.astro public/assets/js/intake-form.js test-behavioral.mjs tests/run.js`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: LOW
- **Depends on**: none
- **Category**: correctness (plus security hardening)
- **Planned at**: commit `be975ef`, 2026-09-23

## Why this matters

1. The intake form's hidden `page` field records which page a brief came
   from. It is filled once at init; after a successful submit,
   `form.reset()` restores it to its empty default and nothing re-fills it.
   A second brief submitted from the same page posts `page=""`, losing
   source attribution on the lead record.
2. The form posts to a public Formspree endpoint with no anti-automation
   field. Bots can post arbitrary payloads, consuming quota and flooding
   the inbox; provider-side filtering is the only barrier and is not
   visible from the repo.

## Current state (verified at `be975ef`)

`src/components/IntakeForm.astro:225-227`:

```astro
  <input type="hidden" name="_subject" value={subjectMap[service]} />
  <input type="hidden" name="service" value={service} />
  <input type="hidden" name="page" value="" data-fill="page" />
```

`public/assets/js/intake-form.js:79-80` (fill once) and `:190-192`
(reset path):

```js
    const pageField = form.querySelector('[data-fill="page"]');
    if (pageField) pageField.value = window.location.pathname;
...
        if (response.ok) {
          form.reset();
          controls.forEach((control) => setFieldError(control, ''));
```

Because the input's `value` attribute is `""`, `form.reset()` restores the
default (`""`) — `pageField.value` is not re-assigned.

Behavioral harness: `test-behavioral.mjs:80-96` counts POSTs but does not
read request bodies; `:215-289` (`testSingleSubmit`) submits once.

## Commands you will need

| Purpose      | Command                        | Provenance | Expected on success |
|--------------|--------------------------------|------------|---------------------|
| Install      | `npm ci`                       | declared   | exit 0 |
| Build        | `npx --no-install astro build` | executed   | `[build] Complete!`, 30 pages |
| Behavioral   | `node test-behavioral.mjs`     | executed   | `PASS: single-submit + double-click … 0 failures` |
| Full tests   | `npm test`                     | executed   | exit 0 (218/218 src, 77/77 analytics, 247/247 built, behavioral PASS) |
| Source tests | `node tests/run.js`            | executed   | `All checks passed.` |

Notes: `test-behavioral.mjs` spawns its own preview server; a fresh
worktree needs `npm ci` and a build (`npx --no-install astro build`) first.
Never `npm run build` (rewrites committed stats).

## Scope

**In scope** (the only files you may modify):
- `src/components/IntakeForm.astro` (honeypot input + one CSS rule)
- `public/assets/js/intake-form.js` (the init line only)
- `test-behavioral.mjs` (mock body capture + one new case)
- `tests/run.js` (one new group)
- `plans/README.md` (status row only)

**Out of scope** (do NOT touch):
- `src/components/ContactSection.astro` and `public/assets/js/contact-section.js`
  — no form element is bound there anymore (plan 008); do not re-add.
- Formspree endpoint/action URLs — unchanged.
- Validation logic and error UX — unchanged.

## Git workflow

- Branch: `advisor/050-intake-hardening`
- Conventional commits, e.g. `fix(intake): preserve page attribution after reset; add Formspree honeypot`.
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 0: Green baseline

`npm ci` → `npx --no-install astro build` → `node tests/run.js` →
`node test-behavioral.mjs` → `npm test`.

**Verify**: all green. If not, STOP and report.

### Step 1: Preserve `page` across resets

In `intake-form.js:80`, set the default value too:

```js
    if (pageField) {
      pageField.value = window.location.pathname;
      pageField.defaultValue = window.location.pathname;
    }
```

`form.reset()` now restores the path instead of `""`.

**Verify**: `node --check public/assets/js/intake-form.js` → exit 0;
`grep -n "defaultValue" public/assets/js/intake-form.js` → 1 match.

### Step 2: Add the honeypot field

In `IntakeForm.astro`, after the `page` input (`:227`), add:

```astro
  <input
    type="text"
    name="_gotcha"
    class="intake-form__gotcha"
    tabindex="-1"
    autocomplete="off"
    aria-hidden="true"
  />
```

Formspree treats a submission with a filled `_gotcha` as spam. Add the
off-screen rule to the component's `<style>` block (any location inside it):

```css
.intake-form__gotcha {
  position: absolute;
  left: -9999px;
  width: 1px;
  height: 1px;
  overflow: hidden;
}
```

**Verify**: `npm run check` → 0 errors; `npx --no-install astro build`,
then `grep -c 'name="_gotcha"' dist/en/index.html` → ≥ 1 (home has an
intake form) and `grep -c 'intake-form__gotcha' dist/en/index.html` → ≥ 1.

### Step 3: Source regression tests

Add a group to `tests/run.js` (source-level):

- `IntakeForm.astro` contains `name="_gotcha"` and
  `.intake-form__gotcha` with `left: -9999px`.
- `public/assets/js/intake-form.js` contains
  `pageField.defaultValue = window.location.pathname`.

**Verify**: `node tests/run.js` → all pass, count grows by 2.

### Step 4: Behavioral proof for the second submit

1. Extend `mockGtagAndFormspree` (`test-behavioral.mjs:80-96`) to record
   request bodies:

```js
  const postBodies = [];
  await page.route('**/formspree.io/**', async (route) => {
    postAttempts++;
    postBodies.push(route.request().postData() || '');
    ...
  });
  return { getPostAttempts: getPost, getPostBodies: () => postBodies };
```

2. Add a case `testSecondSubmitKeepsPage(browser)` modeled on
   `testSingleSubmit` (`:215-289`): load `${BASE}/en/`, fill and submit
   successfully, wait for the success banner, then fill and submit again;
   assert both bodies contain a `page` part equal to `/en/`:

```js
const pagePart = (body) => (/name="page"\s*\r?\n\r?\n([^\r\n]*)/.exec(body) || [])[1] || '';
```

   Both `pagePart(bodies[0])` and `pagePart(bodies[1])` must be `/en/`.
   Register the new case in the runner list at the bottom of the file
   (follow how `testSingleSubmit` is registered).

**Verify**: `node test-behavioral.mjs` → the new case passes and the total
failure count is 0. Then temporarily revert Step 1's `defaultValue` line
and confirm the new case **fails** (red-then-green), then restore.

### Step 5: Full gate

`npx --no-install astro build && npm run check && npm test`

**Verify**: exit 0; behavioral PASS; `git status --short
src/data/github-stats.json` → empty.

## Test plan

- Source assertions (Step 3) for the honeypot and the `defaultValue` fill.
- Behavioral case (Step 4) proving the second submit carries the path;
  red-then-green required.
- No new analytics events; do not add tracking for the honeypot.

## Done criteria

ALL must hold:

- [ ] `npm run check` exits 0; `npm test` exits 0 with behavioral PASS
- [ ] `grep -c 'name="_gotcha"' src/components/IntakeForm.astro` → 1
- [ ] `grep -c "pageField.defaultValue" public/assets/js/intake-form.js` → 1
- [ ] The new behavioral case passes with the fix and fails without it
      (recorded in your report)
- [ ] `git diff --name-only master...HEAD` lists only the in-scope files plus
      `plans/README.md`
- [ ] `plans/README.md` status row for 050 updated

## STOP conditions

Stop and report back (do not improvise) if:

- The drift check shows an in-scope file changed since `be975ef`.
- The behavioral harness cannot read POST bodies (Playwright version
  limitation) — report instead of inventing a different test.
- Adding the honeypot breaks any existing behavioral case (e.g. the form's
  control loop treats it unexpectedly) — report the failure.
- Anything appears to require touching an out-of-scope file.

## Maintenance notes

- `page` now survives resets; if a future reset path bypasses
  `form.reset()`, keep the `defaultValue` semantics in mind.
- The honeypot is invisible to users and screen readers; do not add
  `required` or validation to it.
- **Deferred:** server-side rate limiting/duplicate suppression — belongs
  to the Formspree provider settings, not the repo.
