# Plan 040: De-duplicate the hero's Ébano proof (one store link, numbers live in the proof band)

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan in
> `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 1508fa2..HEAD -- src/components/HeroSection.astro tests/run.js`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P3
- **Effort**: S
- **Risk**: MED (copy change on the homepage; both locales)
- **Depends on**: 036 (so TT-017's status is accurate when this lands)
- **Category**: direction (home clarity / proof division)
- **Planned at**: commit `1508fa2`, 2026-09-23

## Why this matters

The homepage states the same Ébano proof twice in a row: the hero featured
outcome names the store with "daily orders, 100+ SKUs, in continuous
production", the hero proof list repeats the exact same line, and the
`ResultsBand` immediately below repeats the same two numbers again. The
refresh backlog's TT-017 goal is "each section contributes unique proof", and
`ResultsBand`'s own header comment says it exists to "concentrate quantified
evidence scattered across the page into one high-contrast unit". This plan
makes that true: the hero keeps one named, linked store (instant proof), and
the numbers live only in the band.

## Current state

Facts the executor needs, inlined (verified by the advisor on 2026-09-23):

- `src/components/HeroSection.astro` — EN locale object:

  ```astro
  31:  featuredOutcome: {
  32:    text: 'elrincondeebano.com',
  33:    detail: 'live store · daily orders, 100+ SKUs, in continuous production',
  34:    href: 'https://elrincondeebano.com',
  ...
  37:  proofItems: [
  38:    { value: 'elrincondeebano.com', label: 'live store · daily orders, 100+ SKUs, in continuous production', href: 'https://elrincondeebano.com' },
  39:    { value: 'monedario.cl', label: 'public finance product · updated 2026, no ads, no paywalls', href: 'https://monedario.cl' },
  40:    { value: 'bankrecon on PyPI', label: 'fail-closed reconciliation · audit-grade logs', href: 'https://pypi.org/project/bankrecon/' },
  41:    { value: 'EN / ES handoff', label: 'README + runbook, every engagement' },
  42:  ],
  ```

  ES locale object:

  ```astro
  82:  featuredOutcome: {
  83:    text: 'elrincondeebano.com',
  84:    detail: 'tienda activa · pedidos diarios, 100+ SKUs, en producción continua',
  85:    href: 'https://elrincondeebano.com',
  ...
  88:  proofItems: [
  89:    { value: 'elrincondeebano.com', label: 'tienda activa · pedidos diarios, 100+ SKUs, en producción continua', href: 'https://elrincondeebano.com' },
  90:    { value: 'monedario.cl', label: 'producto público de finanzas · actualizado 2026, sin publicidad ni paywalls', href: 'https://monedario.cl' },
  91:    { value: 'bankrecon en PyPI', label: 'conciliación fail-closed · logs de auditoría', href: 'https://pypi.org/project/bankrecon/' },
  92:    { value: 'Traspaso ES / EN', label: 'README + runbook, en cada proyecto' },
  93:  ],
  ```

- `src/components/ResultsBand.astro:13-18` — the consolidated band that should
  own the numbers:

  ```js
  stats: [
    { value: '24/7', unit: 'in production', detail: 'live storefront serving daily orders', href: 'https://elrincondeebano.com' },
    { value: '100+', unit: 'SKUs', detail: 'daily orders handled without an internal team' },
    { value: 'A+', unit: 'headers', detail: 'own site security grade, independently checkable', href: 'https://securityheaders.com/?q=tooltician.com&followRedirects=on' },
    { value: '3', unit: 'on PyPI', detail: 'published packages with audit-grade logs', href: 'https://pypi.org/user/cortega/' },
  ],
  ```

- The home renders `HeroSection` then `ResultsBand` back to back
  (`src/pages/en/index.astro:46-47`, `src/pages/es/index.astro:47-48`).

- No existing test references `elrincondeebano` or `100+ SKUs`
  (`grep -rn "elrincondeebano\|100+ SKUs" tests/` → no matches). The HTW
  snapshot covers the web-technical-hygiene pages only, not the home.

## Commands you will need

| Purpose | Command | Provenance | Expected on success |
|---------|---------|------------|---------------------|
| Typecheck | `npm run check` | declared | exit 0 |
| Source tests | `node tests/run.js` | declared | exit 0 |
| Build | `npm run build` | declared | exit 0 |
| Built tests | `node tests/run.js --built` | declared | exit 0 |
| Behavioral (home filters) | `node test-behavioral.mjs` | declared | PASS |

## Scope

**In scope** (the only files you should modify):
- `src/components/HeroSection.astro`
- `tests/run.js` (one new group)

**Out of scope** (do NOT touch):
- `src/components/ResultsBand.astro` — it is the destination of the moved
  emphasis; its stats stay exactly as they are.
- `src/components/PortfolioSection.astro` / `src/data/caseStudies.ts` — the
  portfolio card tells the problem→solution→result story; that is a different
  framing, not duplication.
- `src/pages/en/index.astro`, `src/pages/es/index.astro` — section order
  stays.
- Any other copy on the page.

## Git workflow

- Branch: `advisor/040-home-proof-dedup`
- Conventional commit, e.g.
  `refactor(home): keep one Ébano link in the hero; numbers live in the proof band`
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 0: Establish a green baseline

Run `npm run check` and `node tests/run.js` on the unmodified checkout.

**Verify**: both exit 0.

### Step 1: Remove the duplicated hero proof entry

In `src/components/HeroSection.astro`:

1. Delete the first `proofItems` entry in the EN object (line 38) and in the
   ES object (line 89) — the `{ value: 'elrincondeebano.com', ... }` lines.
   Both lists keep monedario, bankrecon, and the handoff entry.
2. Replace `featuredOutcome.detail` in both locales so it no longer repeats
   the band's numbers:
   - EN (line 33): `detail: 'live store · in continuous production',`
   - ES (line 84): `detail: 'tienda activa · en producción continua',`

Do not change `featuredOutcome.text` or `.href`.

**Verify**:
`grep -c "elrincondeebano" src/components/HeroSection.astro` → `4`
(the text + href of each locale's featuredOutcome);
`grep -c "100+ SKUs" src/components/HeroSection.astro` → `0`.

### Step 2: Lock the division of labor with a test

In `tests/run.js`, add a new group after the `EM` group if plan 039 landed
(otherwise after `S0b`, or after `S0` which ends at line 1305):

```js
group('D6 · Home proof division of labor', () => {
  const hero = read('src/components/HeroSection.astro') || '';
  const band = read('src/components/ResultsBand.astro') || '';
  assert(
    'hero names the live store exactly once per locale (text + href)',
    (hero.match(/elrincondeebano/g) || []).length === 4,
    `elrincondeebano occurrences: ${(hero.match(/elrincondeebano/g) || []).length}`
  );
  assert('hero does not repeat the quantified band stats', !hero.includes('100+ SKUs'), 'Hero still repeats the SKU count');
  assert('proof band owns the quantified stats', band.includes("value: '100+'") && band.includes("unit: 'SKUs'"), 'ResultsBand stats missing');
});
```

**Verify**: `node tests/run.js` → exit 0 with `D6` green.

### Step 3: Full gate

```sh
npm run check
node tests/run.js
npm run build
node tests/run.js --built
node test-behavioral.mjs
```

**Verify**: all exit 0 / PASS. If `test-behavioral.mjs` needs a local preview
server, follow its header instructions (it launches its own browser against a
preview build, as it does in CI).

## Test plan

- New `D6` group in `tests/run.js` (source-level; guards the exact duplicate
  from returning and asserts the band still owns the numbers).
- `node test-behavioral.mjs` proves the home portfolio filters still work
  after the component edit.
- No snapshot update needed: the HTW snapshot does not cover the home page.

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `grep -c "elrincondeebano" src/components/HeroSection.astro` → `4`
- [ ] `grep -c "100+ SKUs" src/components/HeroSection.astro` → `0`
- [ ] `grep -n "value: '100+'" src/components/ResultsBand.astro` still returns a hit (the band keeps the numbers)
- [ ] `npm run check` exits 0; `node tests/run.js` exits 0 with `D6` green
- [ ] `npm run build && node tests/run.js --built` exits 0
- [ ] `node test-behavioral.mjs` passes
- [ ] `git diff --name-only 1508fa2...HEAD` lists only the two in-scope files
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- The hero/ES copy no longer matches the excerpts (drift), or the Ébano entry
  is not the first `proofItems` element in both locales.
- A test elsewhere asserts the removed hero strings (the plan's recon found
  none — if one exists, report it instead of editing the test's intent).
- You are tempted to also edit `ResultsBand.astro` to "balance" the page —
  that is out of scope; the band is the numbers owner.
- A verification command fails twice after a reasonable fix attempt.

## Maintenance notes

For the human/agent who owns this code after the change lands:

- Division of labor is now: hero = one named, linked live store; ResultsBand =
  quantified verifiable stats; portfolio card = problem→solution→result. New
  proof should be added to exactly one of those.
- If the Ébano store ever goes offline, update both the hero link and the
  band's stats in the same change; the `D6` count assertion will force the
  hero side.
- Reviewer should check both locales render the shortened detail line without
  awkward wrapping at the 360 px breakpoint.
- **Deferred:** the refresh backlog's broader TT-017 ("reduce redundancy
  across About, Proof, Credentials") is considered satisfied for the home
  after this plan; the orphaned `ProofSection.astro` cleanup belongs to a
  tech-debt pass (see plan 036 maintenance notes).
