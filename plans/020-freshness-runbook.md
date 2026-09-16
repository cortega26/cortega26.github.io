# Plan 020: Freshness runbook + funnel self-test

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `ls docs/tasks/` (must exist; new file goes inside)
> If the directory is absent or restructured, treat it as a STOP condition.

## Status

- **Priority**: P3
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: dx (maintenance process)
- **Planned at**: commit `e2e86eb`, 2026-09-16

## Why this matters

This series eliminated staleness (star counts, suite assertions, README) —
but nothing prevents its return. Time-bound claims ("14 months" is gone;
"2–3 builds/month" and availability copy remain), the A+ header posture,
and the contact funnel all rot silently. A 30-line quarterly checklist plus
a one-time live funnel self-test converts "someone should check" into a
dated, owned routine.

## Current state

The facts the executor needs, inlined:

- `docs/tasks/` exists with strategy/backlog docs (convention: markdown
  task docs; new file `docs/tasks/maintenance-checklist.md` follows it).
- Rot-prone surfaces inventoried by the advisor: availability/engagement
  copy (`services.ts` availability lines, hero panel), A+ posture
  (`docs/cloudflare-security-headers.md` + live headers), OG card
  (`public/assets/images/og-card.png` + `scripts/generate-og.mjs`),
  `llms.txt` freshness, contact funnel (Formspree delivery + Calendly
  booking — CANNOT be verified from the repo; operator manual steps below).
- The repo now has machine gates for code staleness (CI) and hash drift
  (015 script) — the checklist covers what machines can't: prose decay,
  third-party posture, and inbox deliverability.

## Commands you will need

| Purpose | Command | Provenance | Expected on success |
|---------|---------|------------|---------------------|
| Source tests | `node tests/run.js` | executed | exit 0, green (docs-only change; guards accidents) |

## Scope

**In scope** (the only file you should create):
- CREATE `docs/tasks/maintenance-checklist.md` — quarterly checklist.

**Out of scope** (do NOT touch):
- Everything else. No code, no copy, no config changes.

## Git workflow

- Branch: `advisor/020-runbook`
- Commit as one unit; conventional commits (e.g. `docs(tasks): add quarterly maintenance checklist`)
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 0: Baseline

`node tests/run.js` → exit 0 green, record. `ls docs/tasks/` → directory
exists.

**Verify**: green baseline; directory present.

### Step 1: Write the checklist

Create `docs/tasks/maintenance-checklist.md` with dated-run rows
(`| Date | Item | Result |`) and these quarterly items (each one line +
where/how):

1. Time-bound claims: grep `src/` for month/year/count claims; confirm each
   still true or reword (the 013/018 lesson: prefer decay-proof wording).
2. A+ posture: re-run SecurityHeaders + Observatory on tooltician.com;
   on any drop, diff the live headers (`curl -sSI`) against
   `docs/cloudflare-security-headers.md` and fix the Cloudflare rule first.
3. OG/social card: regenerate only after major copy changes
   (`node scripts/generate-og.mjs`); spot-check card render.
4. Full gates: `npm run check`, `node tests/run.js --built` (after build),
   `test-htw-snapshot`, CSP hash script — all green.
5. Funnel self-test (OPERATOR, manual — write as instructions, do not
   perform): submit a live test brief → confirm inbox arrival (check spam);
   complete a test Calendly booking → confirm notification. Quarterly.
6. `llms.txt` + sitemap: confirm they still reflect the service list after
   any offering change.

**Verify**: file exists; every item names its command or manual action;
`node tests/run.js` still green.

## Test plan

- Existence + completeness read-through. No product tests (docs-only).

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `docs/tasks/maintenance-checklist.md` exists with all six items
- [ ] `node tests/run.js` green
- [ ] `git diff --name-only e2e86eb...HEAD` lists only the new file
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- `docs/tasks/` is absent/restructured.
- Any referenced command/file doesn't exist (report; don't invent).

## Maintenance notes

For the human/agent who owns this code after the change lands:

- Item 5 is manual by nature — the checklist's value is the DATE column.
  An unchecked quarter is the signal, not the failure.
- OPERATOR TODO (not executable by any agent): the live test-brief +
  Calendly self-test, and calendarizing the quarterlies.
