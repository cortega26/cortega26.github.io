# Plan 018: Reword unverifiable outage claims

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat e2e86eb..HEAD -- src/components/HeroSection.astro src/components/ResultsBand.astro tests/run.js`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: docs (trust-copy correctness)
- **Planned at**: commit `e2e86eb`, 2026-09-16

## Why this matters

"0 outages in 14 months" is the site's most repeated number (Hero EN+ES,
ResultsBand EN+ES) and its least verifiable: the maintainer confirms there
are no uptime logs — it is testimony, not evidence. A skeptical technical
buyer discounting that line discounts everything next to it. The decided
fix (maintainer-approved): drop the zero-claim, keep what is confirmed true
("daily orders", "100+ SKUs" — both explicitly confirmed current), and use
durable, non-decaying wording (no new time-bombs like "14 months", which
rots the same way hardcoded star counts did).

## Current state

The facts the executor needs, inlined — exact strings to replace:

- `src/components/HeroSection.astro:33,38` (EN):
  `detail: 'live store · daily orders, 100+ SKUs, 0 outages in 14 months'`
  and proof item label `'live store · daily orders, 100+ SKUs, 0 outages in 14 months'`.
- `src/components/HeroSection.astro:84,89` (ES):
  `detail: 'tienda activa · pedidos diarios, 100+ SKUs, 0 caídas en 14 meses'`
  and matching proof label.
- `src/components/ResultsBand.astro:14` (EN):
  `{ value: '0', unit: 'outages', detail: 'live store, 14 months in production', href: 'https://elrincondeebano.com' }`
- `src/components/ResultsBand.astro:26` (ES):
  `{ value: '0', unit: 'caídas', detail: 'tienda en producción, 14 meses activos', href: 'https://elrincondeebano.com' }`
- Untouched neighbors (do not alter): ResultsBand stats `100+ SKUs`,
  `A+ headers`, `3 on PyPI` (+ ES equivalents); Hero `bankrecon`,
  `monedario.cl`, `EN / ES handoff` proof items.

## Commands you will need

| Purpose | Command | Provenance | Expected on success |
|---------|---------|------------|---------------------|
| Typecheck | `npm run check` | declared | exit 0, no errors |
| Source tests | `node tests/run.js` | executed | exit 0, green |
| Build | `npm run build` | declared | exit 0, 26 pages |

## Scope

**In scope** (the only files you should modify):
- `src/components/HeroSection.astro` (4 strings: featuredOutcome detail +
  proof label, EN+ES)
- `src/components/ResultsBand.astro` (2 stat entries, EN+ES)
- `tests/run.js` — ONLY if an assertion reads an old string you changed
  (same test-only follow-up rule as Plan 013 Step 3; list each in the commit
  message)

**Out of scope** (do NOT touch):
- Any other copy, component, or claim. "Daily orders", "100+ SKUs", A+,
  PyPI, test counts stay exactly as they are.
- No new evidence links, no status page, no monitoring.

## Git workflow

- Branch: `advisor/018-claim-reword`
- Commit as one unit (+ optional test-only commit); conventional commits
  (e.g. `fix(copy): replace unverifiable outage claims with durable wording`)
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 0: Baseline

`node tests/run.js` → exit 0 green, record counts. `grep -rn "0 outages\|0 caídas" src/` → record the 6 hits above.

**Verify**: green baseline; 6 hits recorded.

### Step 1: Reword (exact replacements — apply verbatim)

1. Hero EN (2 spots): `live store · daily orders, 100+ SKUs, 0 outages in 14 months`
   → `live store · daily orders, 100+ SKUs, in continuous production`
2. Hero ES (2 spots): `tienda activa · pedidos diarios, 100+ SKUs, 0 caídas en 14 meses`
   → `tienda activa · pedidos diarios, 100+ SKUs, en producción continua`
3. ResultsBand EN stat: `{ value: '0', unit: 'outages', detail: 'live store, 14 months in production', href: 'https://elrincondeebano.com' }`
   → `{ value: '24/7', unit: 'in production', detail: 'live storefront serving daily orders', href: 'https://elrincondeebano.com' }`
   ("24/7" = always-on per maintainer testimony, no fake precision, no decay.)
4. ResultsBand ES stat:
   → `{ value: '24/7', unit: 'en producción', detail: 'tienda activa con pedidos diarios', href: 'https://elrincondeebano.com' }`
5. `npm run check` → exit 0.

**Verify**: `grep -rn "0 outages\|0 caídas\|14 months\|14 meses" src/` → zero hits;
typecheck green.

### Step 2: Gates

1. `npm run build` → exit 0.
2. `grep -rn "0 outages\|0 caídas" dist/` → zero hits. Spot-check
   `dist/en/index.html` contains `in continuous production` and `24/7`.
3. `node tests/run.js --built` → exit 0. If an assertion read an old string
   (Step-1 change), update ONLY that assertion to the new literal (Plan 009
   conventions) in a second commit; suite must be green, never worse.

**Verify**: zero stale claims in src and dist; suite green (source + built).

## Test plan

- Grep-proofs (src + dist zero-hits) + full suite green. No new test files.

## Done criteria

Machine-checkable. ALL must hold:

- [ ] Zero `0 outages` / `0 caídas` / `14 months` / `14 meses` in `src/` and `dist/`
- [ ] Confirmed claims (`daily orders`, `100+ SKUs`, A+, PyPI) byte-identical
- [ ] `npm run check` + `npm run build` exit 0
- [ ] `node tests/run.js --built` exits 0
- [ ] `git diff --name-only e2e86eb...HEAD` lists only in-scope files
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- The strings don't match "Current state" (drift — e.g. someone already
  reworded).
- A suite assertion depends on the old wording in a way that changes its
  meaning (report; don't dilute the test).
- Any other claim looks false while editing nearby (report as a finding for
  the maintainer; do not expand scope).

## Maintenance notes

For the human/agent who owns this code after the change lands:

- The new wording is deliberately decay-proof (no counts, no dates). If real
  uptime monitoring is ever added, THAT is the moment to reintroduce a
  number — with a link to the status page, per the ResultsBand "verifiable"
  contract.
- Reviewers: confirm no `14 months` variant survives in EITHER locale.
