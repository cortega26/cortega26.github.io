# Plan 016: Rewrite the stale README

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 79b5347..HEAD -- README.md package.json astro.config.mjs .github/workflows/deploy.yml .env.example docs/cloudflare-security-headers.md`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P3
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none (if Plan 010 landed, document the final CI step list — read deploy.yml live)
- **Category**: docs
- **Planned at**: commit `79b5347`, 2026-09-16

## Why this matters

The README still describes the pre-Astro static site (`index.html` language
selector, `en/`/`es/` folders, `assets/css`, `npx serve .` preview). Every
agent and every new human that onboards from it starts with a wrong mental
model and wrong commands. The fix is a contained rewrite of the two stale
sections plus a short test/env/CI reference — no new docs architecture.

## Current state

The facts the executor needs, inlined:

- Stale block 1 — `README.md:38-53` ("Repository structure" + "Local preview"):
  lists `index.html`, `en/`, `es/`, `assets/css|js|images|docs`, `CNAME`, and
  `npx serve .` — NONE of which exist at those paths anymore (legacy
  fallbacks noted in `CLAUDE.md:91` are at most `en/index.html`-era files,
  not the documented layout).
- Stale block 2 — `README.md:55-61` ("Notes"): the Cloudflare-headers pointer
  (`docs/cloudflare-security-headers.md`) is still CORRECT — keep it verbatim.
- Ground truth to document (read each live at execution, do not trust these
  summaries blindly): commands from `package.json` (`dev`→`astro dev`,
  `build`→`node scripts/fetch-github-stats.js && astro build`,
  `preview`→`astro preview`, `check`→`astro check`, `test:htw`,
  `test:links`; plus `node tests/run.js [--built]` and
  `node scripts/check-csp-hashes.mjs` IF Plans 009/015 landed);
  structure from `src/` (`pages/`, `components/`, `layouts/`, `data/`,
  `styles/`) + `public/` + `scripts/` + `tests/`; env from `.env.example`
  (`PUBLIC_GA4_MEASUREMENT_ID`; `.env` gitignored, never commit);
  deploy from `.github/workflows/deploy.yml` (master → Pages; read the live
  step list, which Plan 010 may have extended); engine floor
  `node >=24.0.0` (`package.json:6-8`, `.nvmrc`/`.node-version`).
- KEEP AS-IS: title/positioning (lines 1-25), featured projects (26-36),
  live URLs (9-14), custom-domain note (60). Do not touch positioning copy.
- Convention: README targets humans AND onboarding agents; `CLAUDE.md` owns
  deep architecture detail — link to it instead of duplicating
  (`See CLAUDE.md for ...`).

## Commands you will need

| Purpose | Command | Provenance | Expected on success |
|---------|---------|------------|---------------------|
| Source tests | `node tests/run.js` | executed | same pass/fail set as Step 0 baseline (README can't break tests; guards accidents) |
| Link sanity | `grep -c "](docs/\|](CLAUDE.md\|](es/\|](en/" README.md` | declared | informational — every relative link target must exist |

## Scope

**In scope** (the only file you should modify):
- `README.md` — rewrite "Repository structure" + "Local preview", add
  "Verification" + "Environment" subsections under Notes or as new sections.

**Out of scope** (do NOT touch):
- `CLAUDE.md`, `AGENTS.md`, any `docs/` content, `package.json` scripts,
  positioning/featured-project copy.

## Git workflow

- Branch: `advisor/016-readme`
- Commit as one unit; conventional commits (e.g. `docs(readme): describe Astro layout and verification commands`)
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 0: Baseline

`node tests/run.js` → record counts (must be unaffected at the end).

**Verify**: baseline recorded.

### Step 1: Rewrite the stale sections

1. Replace the "Repository structure" list with the real Astro layout:
   `src/pages/` (routes incl. `en/`, `es/`, service pages, `[lang]/[document]`),
   `src/components/`, `src/layouts/`, `src/data/` (pricing/services/documents
   single-sources), `src/styles/`, `public/` (favicons, fonts, `assets/js`,
   `assets/images`, `llms.txt`), `scripts/`, `tests/`, `dist/` (build output,
   gitignored). Verify EACH path exists before listing it.
2. Replace "Local preview" (`npx serve .`) with: `npm ci` → `npm run dev`
   (http://localhost:4321) / `npm run build` → `npm run preview`; required
   engine `node >= 24` (`.nvmrc`).
3. Add "Verification" subsection: `npm run check` (typecheck),
   `node tests/run.js` (+ `--built` after a build), `npm run test:htw`,
   `npm run test:links` (informational, hits network), and — ONLY if the
   files exist at execution — `node scripts/check-csp-hashes.mjs`.
   State plainly which gates run in CI (read `deploy.yml` live; if Plan 010
   landed, list the four gates; else say check+build only).
4. Add "Environment" subsection: copy `.env.example` → `.env`;
   `PUBLIC_GA4_MEASUREMENT_ID` required for production builds (CI validates);
   `.env` never committed.
5. Keep the Cloudflare-headers + custom-domain notes; add `See CLAUDE.md`
   pointer for architecture.

**Verify**: every path/command in the new text exists (`ls`/`grep` each);
no occurrence of `npx serve .`, `assets/css`, `CNAME` remains (unless a
`CNAME` file truly exists in `public/` — check; if it does, document its
real path).

### Step 2: Link + regression check

1. For every relative link in the new README, confirm the target exists.
2. `node tests/run.js` → failure set identical to Step 0 baseline.

**Verify**: all links resolve; suite baseline-identical.

## Test plan

- Existence checks per path/command (Step 1) + link-target check (Step 2).
  No product tests — docs-only change.

## Done criteria

Machine-checkable. ALL must hold:

- [ ] No stale references (`npx serve .`, legacy `assets/css`, root `index.html` as entrypoint)
- [ ] Every documented path/command verified to exist
- [ ] All relative links resolve to existing files
- [ ] Positioning/featured/URLs sections byte-identical to before
      (`git diff README.md` shows changes ONLY in structure/preview/verification/env areas)
- [ ] `node tests/run.js` failure set identical to baseline
- [ ] `git diff --name-only 79b5347...HEAD` lists only `README.md`
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- The README doesn't match "Current state" (drift — e.g. someone already
  rewrote it; note the uncommitted working-tree README one-liner fix at plan
  time — preserve its INTENT (relative link fix) in your rewrite).
- A documented command doesn't exist at execution (scripts changed).
- Positioning copy would need changes to stay truthful (out of scope —
  report instead).

## Maintenance notes

For the human/agent who owns this code after the change lands:

- README now duplicates a SMALL amount of `package.json`/CI ground truth by
  design (commands). When adding an npm script or CI step, update the
  "Verification" list in the same PR — or it rots again (this plan exists
  because nobody did).
- **Deferred:** unifying README/CLAUDE.md/AGENTS.md overlap (all three
  describe the stack). Not worth a dedicated plan; next docs touch should
  pick a lane per file.
