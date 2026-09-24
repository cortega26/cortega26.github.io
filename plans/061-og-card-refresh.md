# Plan 061 (spike): Bring the OG card under one copy source and give ES its own card

> **Executor instructions**: This is a design/spike plan. Follow the steps,
> keep the deliverables in the repo (docs + the prototype), and STOP at the
> decision checkpoint before wiring anything into production pages. If
> anything in the "STOP conditions" section occurs, stop and report — do
> not improvise. When done, update the status row for this plan in
> `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat be975ef..HEAD -- scripts/generate-og.mjs src/layouts/BaseLayout.astro tests/run.js public/assets/images/og-card.png`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P2
- **Effort**: M (spike; implementation follows the checkpoint)
- **Risk**: LOW-MED (committed binary assets; social previews)
- **Depends on**: none
- **Category**: direction
- **Planned at**: commit `be975ef`, 2026-09-23

## Why this matters

The OG card is the first impression for LinkedIn/GitHub shares (the
employer route) and for the ES-first guide push. Today:

- Its text is hardcoded in the generator ("Python Automation Consultant",
  "ETL · Scraping · APIs · Automation") and predates the six-service
  positioning and the 2026-09 content refresh.
- The bitmap font in the generator has no accented glyphs, so Spanish text
  cannot render — yet every ES page advertises the same English card
  (`BaseLayout` sets one `ogImage` for both locales).
- Regeneration is manual and unchecked; nothing fails when the source
  strings change and the PNG does not.

## Current state (verified at `be975ef`)

`scripts/generate-og.mjs:212-222`:

```js
const name = 'Carlos Ortega';
...
const role = 'Python Automation Consultant';
...
const tag = 'ETL · Scraping · APIs · Automation';
```

The bitmap font is defined at `:79-155`; output goes to
`public/assets/images/og-card.png` (last changed 2026-04-24, commit
`33c592c`). `src/layouts/BaseLayout.astro:21,59` uses one `ogImage` for
both locales while `og:locale` switches to `es_CL`; no page overrides it.
`tests/run.js:651-663` checks only existence/size. `deploy.yml` never runs
the generator; `docs/tasks/maintenance-checklist.md:50-61` documents manual
regeneration.

## Commands you will need

| Purpose    | Command                          | Provenance | Expected on success |
|------------|----------------------------------|------------|---------------------|
| Generate   | `node scripts/generate-og.mjs`   | declared   | writes the PNG(s), exit 0 |
| Full tests | `npm test`                       | executed   | exit 0 (after wiring) |

`generate-og.mjs` was not executed during recon (it writes a committed
asset); treat it as `declared` and run it only inside the worktree.

## Scope

**In scope**:
- `scripts/generate-og.mjs`
- `src/layouts/BaseLayout.astro` (ogImage selection only, after checkpoint)
- `public/assets/images/og-card.png`, `public/assets/images/og-card-es.png`
- `tests/run.js` (OG guard group)
- `docs/tasks/maintenance-checklist.md` (regeneration note)
- a new `docs/tasks/og-card-decision.md` (the spike record)
- `plans/README.md` (status row only)

**Out of scope**:
- Redesigning the card's visual style.
- Adding a rasterizer dependency (no new deps without a maintainer call).

## Steps

### Step 1: Inventory the generator

Read `scripts/generate-og.mjs` end to end and record in
`docs/tasks/og-card-decision.md`: the font table's covered glyphs, where
text is laid out, how the PNG is encoded, and what it would take to add the
Spanish glyphs `á é í ó ú ñ ü ¿ ¡` (and `·` if missing). Do not edit yet.

**Verify**: the decision doc exists with the inventory section.

### Step 2: Prototype the ES card

1. Extend the glyph table with the accented characters (copy the shape
   style of existing glyphs; the table is hand-drawn — keep it consistent).
2. Parameterize the generator: accept `--lang=en|es` (or read a small
   `src/data/ogCard.ts` with `{ name, role, tagline }` per locale) and write
   `og-card.png` / `og-card-es.png`.
3. Generate both and inspect the PNGs (open them; verify accents render and
   nothing overflows).

**Verify**: `node scripts/generate-og.mjs --lang=en && node scripts/generate-og.mjs --lang=es`
→ both files written, exit 0; the ES card shows correct accents.

### Step 3: DECISION CHECKPOINT — stop and report

Report the two generated cards (paths), the copy used, and the open
questions:

- Is the role line ("Operational Systems & Python Automation Consultant"
  vs something shorter) the right positioning for both locales?
- Should ES use the same layout with Spanish text, or a distinct tagline?
- Is a per-locale card worth the extra asset, or is one bilingual card
  preferable?

Do **not** wire the new card into `BaseLayout` or commit the PNGs as the
production card until the maintainer answers. If the maintainer approves in
session, proceed to Step 4; otherwise finish the spike with the decision
doc and mark this plan BLOCKED (decision) in the index.

### Step 4 (post-approval): Wire and guard

1. `BaseLayout.astro`: select `ogImage` per locale
   (`lang === 'es' ? '/assets/images/og-card-es.png' : '/assets/images/og-card.png'`),
   keeping the existing meta shape.
2. `tests/run.js`: extend the OG group to assert both files exist, are PNG,
   and are ≥ some minimum size; add a drift note that copy changes require
   regeneration.
3. `docs/tasks/maintenance-checklist.md`: update the manual regeneration
   steps to include `--lang=es`.

**Verify**: `npm run check && npm test`; built ES pages reference the ES
card (`grep og-card-es dist/es/index.html` → 1).

## Test plan

- Existence/size assertions for both cards; a built-output assertion that
  ES pages reference `og-card-es.png` (post-approval).
- No visual diffing tooling exists (out of scope).

## Done criteria (spike)

ALL must hold:

- [ ] `docs/tasks/og-card-decision.md` exists with inventory, prototype
      notes, and the three open questions
- [ ] Both PNGs generated in the worktree (or explicitly reported as
      blocked on the accent-glyph problem)
- [ ] `npm test` exits 0 (spike must not break the suite)
- [ ] `git diff --name-only master...HEAD` lists only in-scope files plus
      `plans/README.md`
- [ ] `plans/README.md` status row for 061 updated (DONE or BLOCKED)

## STOP conditions

Stop and report back (do not improvise) if:

- The glyph table cannot be extended without redesigning the renderer —
  report the blocker instead of pulling in a new dependency.
- The maintainer does not answer the checkpoint in session — leave the
  production card untouched.
- Anything appears to require touching an out-of-scope file.

## Maintenance notes

- Until the checkpoint is approved, production keeps the single English
  card; the spike's PNGs are prototypes, not the live asset.
- **Deferred:** generating the card in CI on copy change — needs a stable
  renderer and a deterministic output first.
