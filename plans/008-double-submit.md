# Plan 008: Remove the duplicate Formspree submit handler

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 79b5347..HEAD -- public/assets/js/contact-section.js public/assets/js/intake-form.js src/components/ContactSection.astro`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: bug
- **Planned at**: commit `79b5347`, 2026-09-16

## Why this matters

The homepage contact form currently submits TWICE to Formspree on every
send: the legacy handler in `contact-section.js` and the current handler in
`intake-form.js` both bind to the same `<form>` element. Every homepage
brief arrives duplicated in the maintainer's inbox, and the analytics
events (`form_submit_success`, Plan 006's `form_start`) fire twice per real
submission, corrupting the conversion metrics the strategy doc depends on.

## Current state

The facts the executor needs, inlined:

- `src/components/ContactSection.astro:230` renders the shared form:
  `<IntakeForm lang={lang} service="general" formId="contact" />`
- `src/components/IntakeForm.astro:26` builds element ids as
  `const id = (name: string) => `${formId}-${name}`;` so this instance's form
  has `id="contact-form"` (`IntakeForm.astro:129-131`:
  `<form class="intake-form reveal" id={id('form')} ...>`).
- `src/components/ContactSection.astro:603-604` loads BOTH scripts on every
  page that uses `ContactSection` (the EN/ES homepages):
  ```
  <script is:inline src="/assets/js/contact-section.js" defer></script>
  <script is:inline src="/assets/js/intake-form.js" defer></script>
  ```
- `public/assets/js/intake-form.js:15` binds the modern handler:
  `document.querySelectorAll('form.intake-form').forEach((form) => {` … with
  scoped success/error elements, submit-button state, and `ttTrack` events
  (`form_start` / `form_submit_success` / `form_submit_error`).
- `public/assets/js/contact-section.js:16-58` binds the LEGACY handler to the
  same element: `const form = document.getElementById('contact-form');` …
  `form?.addEventListener('submit', async (event) => {` … `fetch(form.action,
  { method: 'POST', body: new FormData(form), ... })`. Its button/success
  element lookups (`cf-submit`, `form-success`, `form-error`) match nothing
  (the shared form uses classes), but the `fetch` still executes — hence the
  double POST. The legacy handler also fires NO tracking events.
- The FIRST half of `contact-section.js` (`lines 1-14`) is still needed: the
  copy-email clipboard button (`.copy-email-btn` → `#copy-confirm`,
  wired to `ContactSection.astro:192-218`).

## Commands you will need

| Purpose | Command | Provenance | Expected on success |
|---------|---------|------------|---------------------|
| Typecheck | `npm run check` | declared | exit 0, no errors |
| Source tests | `node tests/run.js` | executed | same pass/fail set as Step 0 baseline (suite red at baseline) |
| Syntax check | `node --check public/assets/js/contact-section.js` | declared | exit 0, no output |

## Scope

**In scope** (the only file you should modify):
- `public/assets/js/contact-section.js` — delete the dead form-submit block,
  keep the clipboard block.

**Out of scope** (do NOT touch, even though they look related):
- `public/assets/js/intake-form.js` — the surviving handler; already correct.
- `src/components/ContactSection.astro` — both `<script>` tags stay (the
  clipboard feature still needs `contact-section.js`).
- `src/components/IntakeForm.astro` — untouched.
- Any Formspree endpoint, `action`, or field names — the request itself is
  correct; only its duplication is fixed.

## Git workflow

- Branch: `advisor/008-double-submit`
- Commit as one unit; message style: conventional commits as in `git log`
  (e.g. `fix(forms): remove legacy duplicate Formspree submit handler`)
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 0: Establish the baseline

1. Run `node tests/run.js` on the unmodified checkout; record exact pass/fail
   counts (at plan time: 90 passed / 16 failed — red baseline, see Plan 009).
2. Confirm the duplication exists: `grep -n "fetch(" public/assets/js/contact-section.js public/assets/js/intake-form.js`
   → both files contain a `fetch(` inside a submit listener.

**Verify**: duplication confirmed; baseline numbers recorded.

### Step 1: Delete the legacy submit handler, keep the clipboard feature

Edit `public/assets/js/contact-section.js`:

1. Delete the entire second half of the IIFE: from
   `const form = document.getElementById('contact-form');` (line 16) through
   the end of its submit-listener block (line 58), i.e. everything after the
   `copyBtn` clipboard block's closing `});`.
2. Keep lines 1-15 verbatim (clipboard copy with `mailto:` fallback).
3. The file must still be a valid IIFE: `(() => { ...clipboard... })();`
4. Do NOT add any new behavior (no tracking, no validation — `intake-form.js`
   owns all of that).

Target shape (for confirmation, not byte-exact):
```js
(() => {
  const copyBtn = document.querySelector('.copy-email-btn');
  const copyConfirm = document.getElementById('copy-confirm');

  copyBtn?.addEventListener('click', async () => {
    const email = copyBtn.dataset.email ?? '';
    try {
      await navigator.clipboard.writeText(email);
      copyConfirm?.classList.add('show');
      window.setTimeout(() => copyConfirm?.classList.remove('show'), 2500);
    } catch {
      window.location.href = `mailto:${email}`;
    }
  });
})();
```

**Verify**: `node --check public/assets/js/contact-section.js` → exit 0;
`grep -c "fetch(" public/assets/js/contact-section.js` → `0`;
`grep -c "clipboard" public/assets/js/contact-section.js` → `1`.

### Step 2: Confirm single-submission wiring

1. `grep -rn "getElementById('contact-form')\|getElementById(\"contact-form\")" public/assets/js/ src/`
   → no matches remain (nothing else depends on the removed lookup).
2. `grep -n "contact-section.js\|intake-form.js" src/components/ContactSection.astro`
   → both script tags still present (clipboard + submit both loaded).
3. `grep -n "copy-email-btn\|copy-confirm" src/components/ContactSection.astro`
   → both still present (the kept feature has its DOM).
4. Re-run `node tests/run.js` → failure set IDENTICAL to Step 0 baseline.

**Verify**: all four checks hold.

## Test plan

- No new test files (suite rewrite is Plan 009, which runs after this plan
  and will lock in single-handler behavior).
- The `node --check` + `grep` verifications above are the machine-checkable
  test for this plan. A live double-submit check requires a browser against a
  preview server with network access to Formspree and is explicitly NOT
  required here.

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `node --check public/assets/js/contact-section.js` exits 0
- [ ] `grep -c "fetch(" public/assets/js/contact-section.js` returns 0
- [ ] Clipboard block intact (`clipboard` appears once; script tags + DOM ids unchanged)
- [ ] `node tests/run.js` failure set identical to Step 0 baseline
- [ ] `git diff --name-only 79b5347...HEAD` lists only `public/assets/js/contact-section.js`
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- The file doesn't match the "Current state" excerpts (drift — e.g. someone
  already removed the handler).
- Any OTHER file references `cf-submit`, `form-success`, or `form-error` ids
  (the legacy handler's orphan lookups) — that changes the deletion calculus.
- A step's verification fails twice after a reasonable fix attempt.

## Maintenance notes

For the human/agent who owns this code after the change lands:

- `contact-section.js` now owns ONLY the copy-email clipboard button;
  `intake-form.js` owns ALL form submission. If a second form handler ever
  seems needed, it isn't — extend `intake-form.js`'s per-form loop instead.
- **Deferred:** an automated regression test asserting exactly one submit
  listener per form (e.g. a Playwright submit-count test). Plan 009 rewrites
  the string-match suite; a behavioral test belongs to a later testing plan,
  not here.
- Reviewers: confirm no `fetch(` remains in `contact-section.js` and that the
  diff deletes only the submit block (lines ~16-58).
