# Plan 028: Accessible per-field errors in the intake form

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 2a10c13..HEAD -- src/components/IntakeForm.astro public/assets/js/intake-form.js test-behavioral.mjs src/styles/global.css`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: MED (the form is the primary conversion path; the behavioral
  suite locks its current lifecycle)
- **Depends on**: none
- **Category**: accessibility / forms
- **Planned at**: commit `2a10c13`, 2026-09-23
- **Audit finding(s)**: H-10

## Why this matters

The brief form ships with `novalidate` and no per-field error wiring: on an
invalid submission the browser's own validation UI is suppressed and the only
feedback is the generic `Something went wrong` banner or nothing at all until
the user guesses which field is wrong. For screen-reader users the failure is
worse: no `aria-invalid`, no `aria-describedby`, no error summary, no focus
move. The fix keeps the current async submit + analytics lifecycle intact and
adds a complete accessible validation layer, with the native constraint
attributes as the no-JS fallback.

## Current state (verified 2026-09-23, commit `2a10c13`)

- `src/components/IntakeForm.astro` (471 lines):
  - `<form … novalidate>` (line ~194) with fields: `name` (text, required),
    `email` (email, required), `site_url` (url, optional), `goal` (select,
    required), `budget` (select, optional), `timeline` (select, optional),
    `message` (textarea, required). IDs are `{formId}-{name}`; the home form
    uses `formId="contact"` → `#contact-name`, `#contact-goal`, etc.
  - Success/error banners: `<p class="intake-form__success" role="status"
    aria-live="polite" tabindex="-1">` and `.intake-form__error` with
    `role="alert"`, plus localized copy (`c.success`, `c.error`).
  - No error text, no `aria-describedby`, no `aria-invalid`, no summary.
- `public/assets/js/intake-form.js` (external file — CSP-safe; **do not**
  introduce inline JS):
  - On submit: `preventDefault` → `form.checkValidity()` → if invalid,
    `funnel('briefError', …, 'validation')` + `form.reportValidity()` (native
    bubbles, which `novalidate` suppresses visually in some browsers) →
    return.
  - If valid: disable button, POST Formspree, toggle `.show` on the banners,
    `revealFeedback()` (smooth scroll + focus), track legacy + canonical events.
- `test-behavioral.mjs` locks: exactly 1 POST on submit (line 112), double
  click protection (206), 500-error banner + focus + value preservation
  (261), mobile success visibility (340), filters (412). `fillIntakeForm()`
  fills `#contact-name`, `#contact-email`, `#contact-goal`, `#contact-message`
  — keep those IDs.
- `tests/run.js` TT-018 asserts `data-sending={c.submitSending}` stays.
- CSP: `docs/cloudflare-security-headers.md` + `scripts/check-csp-hashes.mjs`
  only pin the inline GA4 stub; external JS edits are safe.

## Commands you will need

| Purpose | Command | Provenance | Expected on success |
|---------|---------|------------|---------------------|
| Typecheck | `npm run check` | declared | exit 0 |
| Source tests | `node tests/run.js` | executed | exit 0 |
| Build | `npm run build` | declared | exit 0 |
| Behavioral suite | `node test-behavioral.mjs` | declared | exit 0 |
| HTW snapshot | `node test-htw-snapshot.mjs` | declared | exit 0 (form field names unchanged) |

## Scope

**In scope** (the only files you should create/modify):
- `src/components/IntakeForm.astro` — error elements, copy, summary, `novalidate` policy
- `public/assets/js/intake-form.js` — validation layer
- `test-behavioral.mjs` — new `testValidationErrors` case + summary line
- `src/styles/global.css` — error styles (or component-scoped styles inside IntakeForm)
- `tests/run.js` — append one `H-10` group (source-level only)

**Out of scope** (do NOT touch):
- Formspree endpoint, hidden fields (`_subject`, `service`, `page`), funnel
  event names, `data-sending`, success/error banner copy
- Budget/goal option values (Plan 026 owns pricing labels)
- Any inline `<script>` (CSP)

## Design

- **Progressive enhancement**: remove `novalidate` from the markup and add it
  from `intake-form.js` at init. No-JS users keep native validation and a
  native POST; JS users get the custom accessible layer.
- **Per field**: `<p class="intake-form__field-error" id="{id}-error" hidden>`
  after the control. JS sets, only while invalid:
  - `aria-invalid="true"` on the control,
  - `aria-describedby="{id}-error"` (append, don't clobber other ids),
  - unhides the error with a message chosen from `validity` state:
    `valueMissing` → "Enter your name" / "Enter your email" / "Choose an
    option" / "Add a short brief"; `typeMismatch` email → "Enter a valid
    email address"; `typeMismatch` url → "Enter a valid URL (https://…)".
  - On input/change, re-validate that field and clear when valid.
- **Summary**: `<div class="intake-form__summary" role="alert" tabindex="-1"
  hidden>` at the top of the form, listing the invalid field labels. Copy
  templates live in `data-*` attributes on the form so localization stays in
  the Astro component (`data-error-summary="Please fix: {fields}"`,
  `data-error-join=", "`, and per-field `data-error-*` messages).
- **Focus**: on invalid submit, focus the **first invalid control** (audit
  requirement); the summary is announced by `role="alert"`.
- **Analytics**: keep `funnel('briefError', serviceId, 'validation')` exactly
  once per invalid submit; do not emit POST attempts when invalid.

## Git workflow

- Branch: `advisor/028-accessible-intake-errors`
- Conventional commit, e.g. `fix(a11y): per-field errors and error summary in the intake form`
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 0: Baseline

1. `node tests/run.js` → green; record counts.
2. `npm run build && node test-behavioral.mjs` → green baseline.
3. Record the current `novalidate` behavior (submit empty form in a browser or
   via the new test after Step 3).

**Verify**: green baseline recorded.

### Step 1: Markup + copy (`IntakeForm.astro`)

1. Remove `novalidate` from the `<form>`.
2. For each required/typed field, add the error `<p>` with a stable id and
   the localized default messages (per field type), plus `data-error-*`
   attributes for JS.
3. Add the summary `<div role="alert" tabindex="-1" hidden>` as the form's
   first child.
4. Add localized `summaryPrefix`, `summaryJoin`, and per-field messages to
   the `en`/`es` copy objects.
5. Add component styles for `.intake-form__field-error` and
   `.intake-form__summary` (error color matches `.intake-form__error`).

**Verify**: `npm run check` → exit 0; `grep -c "novalidate" src/components/IntakeForm.astro` → 0.

### Step 2: Validation layer (`intake-form.js`)

1. At init: `form.setAttribute('novalidate', '')` (progressive enhancement).
2. Implement `validateField(control)` + `validateForm()`:
   - map `validity.valueMissing` / `typeMismatch` / `select` to the
     `data-error-*` message,
   - set/clear `aria-invalid` and `aria-describedby`, show/hide the message.
3. On submit: `if (!form.checkValidity()) { validateForm(); focus first
   invalid; funnel('briefError', …, 'validation'); return; }` — remove the
   `reportValidity()` call.
4. On `input`/`change` (delegated): clear a field's error as soon as it
   becomes valid; when all fields are valid, hide the summary.
5. Keep everything else byte-for-byte behaviorally identical (button state,
   fetch, banners, `revealFeedback`, tracking).

**Verify**: `node --check public/assets/js/intake-form.js` → exit 0.

### Step 3: Behavioral test

Add `testValidationErrors(browser)` to `test-behavioral.mjs` (call it in the
try block before `testSingleSubmit`):
1. `mockGtagAndFormspree(page)`; goto `/en/`.
2. Click submit with the form empty.
3. Assert: `getPostAttempts() === 0`; `document.activeElement` is
   `#contact-name`; `#contact-name` has `aria-invalid="true"` and
   `aria-describedby` pointing at a **visible** error element;
   `.intake-form__summary` is visible; no success/error banner shown.
4. Fill email with `not-an-email`, submit → assert the email error message is
   visible and focus is on `#contact-email`.
5. Fill everything valid (reuse `fillIntakeForm`) → submit → assert exactly
   1 POST and the success banner (proves the layer doesn't block valid sends).
6. Include the case in the PASS summary line.

**Verify**: `node test-behavioral.mjs` → exit 0.

### Step 4: Test group `H-10`

Append a source-level group to `tests/run.js`:
- `IntakeForm.astro` contains `aria-describedby` wiring attributes and the
  `intake-form__field-error` / `intake-form__summary` elements.
- `intake-form.js` contains `setAttribute('novalidate'`, `aria-invalid`, and
  `aria-describedby` logic, and no longer calls `reportValidity(`.
- Keep TT-018's `data-sending` assertion untouched.

**Verify**: `node tests/run.js` → exit 0.

## Test plan

- New `testValidationErrors` (Step 3) + existing behavioral cases + `H-10`
  source group. Negative control: temporarily remove the `aria-describedby`
  assignment, run the behavioral test, confirm it fails, restore.

## Done criteria

Machine-checkable. ALL must hold:

- [ ] Empty submit: 0 POSTs, focus on first invalid field, `aria-invalid`,
      visible per-field message, visible summary
- [ ] Invalid email: message + focus on the email field
- [ ] Valid submit: exactly 1 POST, success banner, no regression in the
      double-click / 500-error / mobile cases
- [ ] No inline JS added (CSP untouched)
- [ ] `npm run check`, `node tests/run.js`, `node tests/run.js --built`,
      `node test-htw-snapshot.mjs`, `node test-behavioral.mjs` all green
- [ ] `git diff --name-only 2a10c13...HEAD` lists only in-scope files
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- Removing `novalidate` changes any existing behavioral test outcome for
  reasons other than the intended validation path.
- Formspree rejects the no-JS native POST contract (check the form `action`
  and `method`; report, don't add a server).
- `aria-describedby` cannot be scoped per form when two forms render on one
  page (IDs are already `{formId}-*`; report a collision if found).
- A step's verification fails twice after a reasonable fix attempt.

## Maintenance notes

For the human/agent who owns this code after the change lands:

- Adding a required field means adding its `data-error-*` message and its
  error `<p>` in the same change; the `H-10` group checks the wiring, and
  `testValidationErrors` will fail if the first invalid field changes order.
- Never reintroduce `novalidate` in the markup — it is set by JS on purpose
  so the no-JS path keeps native validation.
- Keep messages content-free of user input; analytics must never receive
  field values (the behavioral suite asserts no PII).
