# Plan 004: Fix the 26 pre-existing `noUncheckedIndexedAccess` type errors blocking plan 001

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 060190d..HEAD -- src/data/services.ts src/components/PortfolioSection.astro`
> If either file changed since this plan was written, compare the "Current
> state" excerpts against the live code before proceeding; on a mismatch,
> treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none (this plan unblocks plan 001, which is currently BLOCKED — see `plans/README.md`)
- **Category**: tech-debt
- **Planned at**: commit `060190d`, 2026-07-11

## Why this matters

Plan 001 (add a `npm run check` / `astro check` type-check gate to CI) was
executed and stopped at its own explicit STOP condition: `astro check`
reported **26 pre-existing errors** in already-shipped `src/` code, and
plan 001's scope forbids touching `src/`. All 26 errors collapse to the same
root cause — `astro/tsconfigs/strictest` enables `noUncheckedIndexedAccess`,
and two call sites in already-shipped code trip it. Both are cheap, correct
fixes, not workarounds: one makes a type annotation honest, the other adds a
guard that was implicitly assumed but never encoded. Once `astro check` exits
0, plan 001 can resume from its Step 3 and land the CI gate.

## Current state

- `src/data/services.ts:1829-1834` — the `services` export is typed with a
  loose string-keyed record even though it has exactly 4 fixed keys:

  ```ts
  export const services: Record<string, ServiceDefinition> = {
    'python-automation': pythonAutomation,
    'internal-tools': internalTools,
    'financial-tooling': financialTooling,
    'static-sites': staticSites,
  };
  ```

  Because the type is `Record<string, ServiceDefinition>`, TypeScript's
  `noUncheckedIndexedAccess` (part of `astro/tsconfigs/strictest`, see
  `tsconfig.json`) treats every index access as possibly `undefined` — even
  though the 8 callers below only ever use one of the 4 known-valid literal
  keys. This produces 24 of the 26 `astro check` errors (`ts(18048)`,
  `'def' is possibly 'undefined'`), 3 per file, at these 8 identical call
  sites (all follow the same shape — example from
  `src/pages/en/services/financial-tooling/index.astro:6-22`):

  ```astro
  ---
  const def = services['financial-tooling'];
  ---
  <ServicePage
    lang="en"
    content={def.en}
    slug={def.slugEn}
    ...
    areaServed={def.areaServed}
  />
  ```

  The other 7 call sites (same pattern, different literal key) are:
  - `src/pages/en/services/internal-tools/index.astro:6` — `services['internal-tools']`
  - `src/pages/en/services/python-automation/index.astro:6` — `services['python-automation']`
  - `src/pages/en/services/static-sites/index.astro:6` — `services['static-sites']`
  - `src/pages/es/servicios/automatizacion-python/index.astro:6` — `services['python-automation']`
  - `src/pages/es/servicios/herramientas-financieras/index.astro:6` — `services['financial-tooling']`
  - `src/pages/es/servicios/herramientas-internas/index.astro:6` — `services['internal-tools']`
  - `src/pages/es/servicios/sitios-web/index.astro:6` — `services['static-sites']`

  Confirmed via `grep -rn "services\['" src/` — these 8 are the *only* places
  the `services` export is indexed anywhere in `src/`.

- `src/components/PortfolioSection.astro:487-549` — the build-time
  `enrichProjects` function (frontmatter, lines 1–571 are all inside the
  `---`/`---` fence — this is not client-side script) merges live GitHub
  stats into evidence chips. Two sites spread a `noUncheckedIndexedAccess`
  widened index expression (`EvidenceChip | undefined`) directly into a new
  object literal, which makes `exactOptionalPropertyTypes` infer `type` as
  optional — conflicting with the required `type` field on `EvidenceChip`
  (defined at line 4-8):

  ```ts
  // lines 516-533 (star chip)
  let newEvidence = proj.evidence ? [...proj.evidence] : [];

  const starIndex = newEvidence.findIndex(chip => chip.type === 'star');
  if (starIndex !== -1) {
    newEvidence[starIndex] = {
      ...newEvidence[starIndex],
      label: `★ ${stars}`
    };
  } else if (stars > 0) {
    newEvidence.unshift({
      label: `★ ${stars}`,
      href: `https://github.com/cortega26/${repoName}/stargazers`,
      type: 'star'
    });
  }

  // lines 535-549 (fork chip) — identical shape
  const forkIndex = newEvidence.findIndex(chip => chip.type === 'fork');
  if (forkIndex !== -1) {
    newEvidence[forkIndex] = {
      ...newEvidence[forkIndex],
      label: `${forks} fork${forks !== 1 ? 's' : ''}`
    };
  } else if (forks > 0) {
    newEvidence.push({
      label: `${forks} fork${forks !== 1 ? 's' : ''}`,
      href: `https://github.com/cortega26/${repoName}/forks`,
      type: 'fork'
    });
  }
  ```

  This produces the remaining 2 errors (`ts(2375)`, at the `newEvidence[starIndex] = {`
  line and the `newEvidence[forkIndex] = {` line).

Repo conventions to match: this is a static Astro v7 site, `output: 'static'`,
strict TypeScript via `astro/tsconfigs/strictest`. Commit messages follow
Conventional Commits (see `git log --oneline`: `fix(badge): ...`, `feat: ...`).

## Commands you will need

| Purpose | Command | Expected on success |
|---|---|---|
| Type check (see note below — requires a temporary install) | `npx astro check` | exit 0, `0 errors` |
| Confirm no other indexers of `services` exist | `grep -rn "services\['" src/` | exactly 8 matches, all listed above |

> **Important**: `@astrojs/check` and `typescript` are **not yet installed**
> in this repo (plan 001, which adds them permanently, is blocked on this
> plan and hasn't landed). `npx astro check` will prompt interactively to
> install them if missing. Step 1 below installs them non-interactively so
> you can verify your fix — but this plan must **not** commit that install;
> plan 001 owns adding `@astrojs/check`/`typescript` to `package.json`
> permanently. See Step 1 and Step 5.

## Scope

**In scope** (the only files you should modify and commit):
- `src/data/services.ts` — retype the `services` export (line 1829).
- `src/components/PortfolioSection.astro` — add local guards at the two
  chip-update sites (around lines 520-541).

**Temporarily touched, but NOT committed** (see Step 1 and Step 5):
- `package.json`, `package-lock.json` — installing `@astrojs/check` +
  `typescript` is required to run the verification command in this worktree,
  but committing that install is plan 001's job, not this plan's. Revert
  both files before your final commit.

**Out of scope** (do NOT touch, even though they look related):
- `tsconfig.json` — do not weaken or change `noUncheckedIndexedAccess` or any
  other strictness flag. The whole point of this plan is to fix the code so
  the strict flag stays on.
- Any of the 8 `src/pages/{en/services,es/servicios}/*/index.astro` files —
  the fix is entirely in `services.ts`; these files do not need to change.
- `.github/workflows/deploy.yml` — CI wiring is plan 001's job, not this one.
- Any other type or component not named above.

## Git workflow

- Branch: `advisor/004-fix-nouncheckedindexedaccess-errors`
- One commit covering both fixes (they're both trivial and part of the same
  root problem); Conventional Commits style, e.g.
  `fix(types): resolve noUncheckedIndexedAccess errors in services and portfolio evidence chips`.
- Do NOT push or open a PR unless the operator instructed it.
- Do NOT commit `package.json` / `package-lock.json` changes from Step 1 (see
  Step 5) — the final commit must touch only `src/data/services.ts` and
  `src/components/PortfolioSection.astro`.

## Steps

### Step 1: Install a temporary type-check tool to verify your fix

```bash
npm install -D @astrojs/check typescript
```

This is scratch tooling for this worktree only — see the "Important" note
above. Do not commit it.

**Verify**: `npx astro check 2>&1 | tail -5` runs without the interactive
install prompt (confirms the packages resolved).

### Step 2: Confirm the current error baseline matches what this plan expects

```bash
npx astro check
```

**Verify**: output ends with `26 errors` (or very close — if the count is
meaningfully different, e.g. far more or far fewer, treat as a STOP
condition per "Current state doesn't match" below and report the actual
output instead of proceeding).

### Step 3: Retype the `services` export

In `src/data/services.ts`, change line 1829 from:

```ts
export const services: Record<string, ServiceDefinition> = {
```

to:

```ts
export const services: Record<
  'python-automation' | 'internal-tools' | 'financial-tooling' | 'static-sites',
  ServiceDefinition
> = {
```

Leave the object body (lines 1830-1833) unchanged.

**Verify**: `npx astro check 2>&1 | tail -5` → error count has dropped by 24
(from 26 to 2). If it hasn't dropped to exactly 2, STOP and report the full
output — do not proceed to guess further changes.

### Step 4: Guard the two evidence-chip index accesses in `PortfolioSection.astro`

Replace the star-chip block (around line 520-525):

```ts
    const starIndex = newEvidence.findIndex(chip => chip.type === 'star');
    if (starIndex !== -1) {
      newEvidence[starIndex] = {
        ...newEvidence[starIndex],
        label: `★ ${stars}`
      };
    } else if (stars > 0) {
```

with:

```ts
    const starIndex = newEvidence.findIndex(chip => chip.type === 'star');
    const existingStarChip = newEvidence[starIndex];
    if (starIndex !== -1 && existingStarChip) {
      newEvidence[starIndex] = {
        ...existingStarChip,
        label: `★ ${stars}`
      };
    } else if (stars > 0) {
```

Then replace the fork-chip block (around line 536-541) the same way:

```ts
    const forkIndex = newEvidence.findIndex(chip => chip.type === 'fork');
    if (forkIndex !== -1) {
      newEvidence[forkIndex] = {
        ...newEvidence[forkIndex],
        label: `${forks} fork${forks !== 1 ? 's' : ''}`
      };
    } else if (forks > 0) {
```

with:

```ts
    const forkIndex = newEvidence.findIndex(chip => chip.type === 'fork');
    const existingForkChip = newEvidence[forkIndex];
    if (forkIndex !== -1 && existingForkChip) {
      newEvidence[forkIndex] = {
        ...existingForkChip,
        label: `${forks} fork${forks !== 1 ? 's' : ''}`
      };
    } else if (forks > 0) {
```

Do not change the `else if` branches or anything outside these two blocks.

**Verify**: `npx astro check` → exits 0, output ends with `0 errors`.

### Step 5: Revert the temporary tooling install and confirm final scope

```bash
git checkout -- package.json package-lock.json
git status --short
```

**Verify**: `git status --short` shows exactly two modified files:
`src/data/services.ts` and `src/components/PortfolioSection.astro` — nothing
else.

### Step 6: Re-confirm the fix survives without the temporary install artifacts

Since `node_modules` still physically has `@astrojs/check`/`typescript` from
Step 1 (reverting `package.json` doesn't uninstall them), this is just a
final sanity check that your `src/` edits alone are sufficient:

```bash
npx astro check
```

**Verify**: exits 0, `0 errors` (same result as Step 4 — confirms the fix
doesn't depend on anything you changed in `package.json`).

## Test plan

No new automated tests — this is a type-only fix with no runtime behavior
change (the guards in Step 4 are logically redundant with the `findIndex !==
-1` check that was already there; they only make the existing invariant
visible to the type checker). Verification is entirely `npx astro check`
exiting 0. If you want to sanity-check runtime behavior is unchanged, `npm
run build` should still succeed and produce the same `dist/` output shape,
but this is optional and not a done criterion (the build already passed
before this fix, since `astro build` doesn't run full type-checking).

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `npx astro check` exits 0 with `0 errors` (Step 4/6)
- [ ] `src/data/services.ts` line ~1829 uses the literal-key `Record<...>` type shown in Step 3
- [ ] Both `PortfolioSection.astro` chip blocks use the `existingStarChip` / `existingForkChip` guard pattern shown in Step 4
- [ ] `git status --short` shows only `src/data/services.ts` and `src/components/PortfolioSection.astro` modified — no `package.json`/`package-lock.json` changes committed or left uncommitted-but-staged
- [ ] `plans/README.md` status rows for 004 (and, if you also resume it, 001) updated

## STOP conditions

Stop and report back (do not improvise) if:

- Step 2's baseline error count is far off from 26 (the codebase has drifted
  since this plan was written — re-derive the fix from the actual errors
  instead of applying this plan's exact edits blindly).
- After Step 3, the error count doesn't drop to exactly 2.
- After Step 4, `npx astro check` still reports errors.
- `grep -rn "services\['" src/` (see "Commands you will need") returns any
  match outside the 8 files listed in "Current state" — the retype in Step 3
  may not be safe if there's a 9th caller using a key outside the 4-key
  union.
- Fixing the errors appears to require touching `tsconfig.json` or any file
  outside the two named in Scope.

## Maintenance notes

For the human/agent who owns this after the change lands:

- This plan exists solely to unblock plan 001. Once this lands, **resume
  plan 001 from its Step 3** (re-run `npm run check`, which should now exit 0
  with `0 errors`, then continue through Step 4/5 to wire the CI gate).
- If a 5th service is ever added to `src/data/services.ts`, its key must be
  added to the literal union at line 1829 too — a reviewer should catch a PR
  that adds a service key to the object body without updating the type
  (TypeScript will actually catch this automatically: an unlisted key in the
  object literal would fail to type-check against the union-keyed `Record`).
- The `existingStarChip`/`existingForkChip` guard pattern in
  `PortfolioSection.astro` is the idiomatic fix for
  `noUncheckedIndexedAccess` + "I already checked this index is valid via
  `findIndex`" — if similar patterns appear elsewhere in future `astro
  check` runs, this is the pattern to reach for.
