# Plan 011: Queue analytics events until GA4 is ready

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 79b5347..HEAD -- public/assets/js/track.js public/assets/js/intake-form.js src/layouts/BaseLayout.astro`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition. ALSO read Plan 007's status: if
> DONE, per-service `data-track-form` values exist and the queue must carry
> them through untouched.

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: LOW
- **Depends on**: plans/007-service-context.md (segmentation values flow through; queue is agnostic to them)
- **Category**: bug
- **Planned at**: commit `79b5347`, 2026-09-16

## Why this matters

`track.js` is the single analytics bridge (Plan 006): every CTA click and
form event funnels through `window.ttTrack`. But when `window.gtag` isn't
present yet (slow `gtag.js`, ad-blocker, CSP hiccup), `track()` silently
drops the event (`track.js:21` — the `if typeof gtag === 'function'` guard
with no `else`). Early events are exactly the valuable ones (`form_start`
on first keystroke, hero CTA clicks before the async library lands), so the
Fase-0 funnel undercounts precisely the users it most wants to measure.

## Current state

The facts the executor needs, inlined — `public/assets/js/track.js` today
(49 lines, full file):

```js
function track(name, props) {
  if (!name) return;
  const payload = props && typeof props === 'object' ? props : {};
  try {
    if (typeof typedWindow.gtag === 'function') {
      const params = {};
      if (payload.location !== undefined) params.tt_location = payload.location;
      if (payload.label !== undefined) params.tt_label = payload.label;
      if (payload.status !== undefined) params.tt_status = payload.status;
      typedWindow.gtag('event', name, params);
    }
    // ← no else: event is lost when gtag is absent
  } catch (_) { /* never let instrumentation break the page */ }
}
typedWindow.ttTrack = track;
// Auto-bind: document click listener on [data-track], capture phase,
// label = textContent trimmed to 60 chars (lines 36-48).
```

- Callers: `intake-form.js:12-13,30,59,62,66` (`form_start`,
  `form_submit_success/error` with `{location: ctx}`); auto-bound
  `[data-track]` clicks across all pages. Public contract (stated in the
  file header): `ttTrack(name, {location, label, status})` → single
  `gtag('event', name, {tt_location, tt_label, tt_status})`.
- `BaseLayout.astro:109-120` defines the inline `gtag` stub synchronously,
  so `gtag` is USUALLY present — loss happens when the stub is blocked
  (ad-block/CSP) or a click precedes parse. `track.js` loads `defer` (line
  123), so it always runs after parsing; the gap is real but narrow — size
  the fix accordingly (small queue, no persistence).
- Conventions: plain IIFE JS with JSDoc typedefs, zero dependencies, "never
  let instrumentation break the page" (try/catch everything).

## Commands you will need

| Purpose | Command | Provenance | Expected on success |
|---------|---------|------------|---------------------|
| Syntax | `node --check public/assets/js/track.js` | declared | exit 0, no output |
| Contract test | `node /tmp/opencode/track-queue-test.mjs` (you write it per Step 2) | declared | exit 0, all assertions pass |
| Source tests | `node tests/run.js` | executed | same pass/fail set as Step 0 baseline |

## Scope

**In scope** (the only file you should modify):
- `public/assets/js/track.js` — add a bounded in-memory queue + flush.

**Out of scope** (do NOT touch, even though they look related):
- `src/layouts/BaseLayout.astro` (stub is fine), `intake-form.js`,
  auto-bind selector/label logic (keep label truncation at 60 chars),
  the `tt_*` param mapping (frozen by Plan 006), any persistence
  (no localStorage queue — stale events are worse than dropped ones).

## Git workflow

- Branch: `advisor/011-track-queue`
- Commit as one unit; message style: conventional commits
  (e.g. `fix(analytics): queue ttTrack events until gtag is ready`)
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 0: Baseline

Run `node tests/run.js`; record pass/fail counts (plan-time: 90/106; if Plan
009 landed, expect green — record whatever is true).

**Verify**: baseline recorded.

### Step 1: Add queue + flush to track.js

Rewrite the `track` internals (keep the IIFE, typedefs, `ttTrack` export,
auto-bind listener, and the swallow-all-errors posture byte-for-byte in
spirit):

1. Add `const queue = []; const MAX_QUEUE = 50;` at module scope.
2. Extract the existing mapping+send into `function send(name, payload)`
   (identical mapping logic, still inside try/catch).
3. `track(name, props)`: normalize payload as today; if `gtag` is a
   function → `send` immediately; else push `{name, payload}` (if
   `queue.length < MAX_QUEUE`, else drop oldest then push — bounded memory).
4. Flush: after assigning `typedWindow.ttTrack`, if `gtag` already exists,
   drain the queue in order. ALSO poll briefly for late arrival: check every
   500ms up to 10 times (5s total); on each tick, if `gtag` exists, drain and
   stop polling. Use `setInterval`/`clearInterval` guarded in try/catch; if
   timers throw, fail silent (page must never break). Do NOT flush the same
   event twice (splice-drain, not re-read).
5. Keep the auto-bind listener EXACTLY as-is (it calls `track`, so queued
   automatically).

**Verify**: `node --check public/assets/js/track.js` → exit 0.

### Step 2: Prove the contract with a throwaway harness (not committed)

Write `/tmp/opencode/track-queue-test.mjs` (outside the repo — never commit
it) that:

1. Stubs `window`/`document`: `window = {}`, `document = { addEventListener(){}, }`
   sufficient for the IIFE to load (it only calls `document.addEventListener`
   at load and touches `event.target` inside the click callback, which the
   test never fires).
2. Loads `track.js` source via `readFileSync` + `new Function('window','document', src)`.
3. Asserts: (a) `ttTrack('e1',{location:'x'})` with no `gtag` does not throw
   and buffers; (b) defining `window.gtag = (...a)=>calls.push(a)` then
   `ttTrack('e2',{})` flushes `e1` BEFORE `e2` with identical
   `{tt_location:'x'}` mapping; (c) 60 rapid events with no `gtag` then
   defining `gtag` delivers exactly 50 (bound holds); (d) `ttTrack(null)`
   and `ttTrack('e',{location:undefined})` behave as today (early return /
   param omitted).
4. `node /tmp/opencode/track-queue-test.mjs` → exit 0.

**Verify**: harness exits 0; delete nothing from the repo; confirm
`git status --short` shows only `public/assets/js/track.js` modified.

### Step 3: Regression check

Re-run `node tests/run.js` → failure set identical to Step 0 baseline.

**Verify**: no new failures.

## Test plan

- The throwaway harness in Step 2 IS the test (not committed — jsdom isn't a
  dependency and adding one for a 60-line bridge is disproportionate).
- Pattern reference: none in-repo for JS unit tests; the harness is
  self-contained by design.

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `node --check public/assets/js/track.js` exits 0
- [ ] Throwaway harness exits 0 (queue order, mapping, 50-event bound, null-safety)
- [ ] `node tests/run.js` failure set identical to Step 0 baseline
- [ ] `git diff --name-only 79b5347...HEAD` lists only `public/assets/js/track.js`
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- `track.js` doesn't match the "Current state" excerpt (drift — e.g. Plan
  006 follow-ups changed the mapping).
- The IIFE can't load under the stub (needs more DOM than expected) — report
  the exact failure rather than expanding the stub into a fake browser.
- Any temptation to persist the queue (localStorage/cookies) — forbidden by
  scope; privacy posture must not change in this plan.
- A step's verification fails twice after a reasonable fix attempt.

## Maintenance notes

For the human/agent who owns this code after the change lands:

- Queue is memory-only, 50 events, ~5s flush window. If `gtag.js` is blocked
  long-term (ad-block), events are still lost — that is accepted and honest;
  closing THAT gap needs server-side measurement, which is a different plan.
- If new event params are ever added, extend BOTH `send()` AND the queue
  payload (they share the normalized object — keep it that way).
- **Deferred:** nothing. This plan fully closes its finding.
