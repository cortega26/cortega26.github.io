# Plan 015: Verify CSP hashes in-repo and single-source the GA4 ID

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 79b5347..HEAD -- docs/cloudflare-security-headers.md src/layouts/BaseLayout.astro src/pages/index.astro src/data/siteDocuments.ts scripts/ .github/workflows/deploy.yml`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P3
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none (informational CI wiring only; safe alongside Plan 010 — coordinate step placement if 010 landed first)
- **Category**: security
- **Planned at**: commit `79b5347`, 2026-09-16

## Why this matters

The Cloudflare CSP (the site's SecurityHeaders.com A+ posture) allows the
GA4 inline bootstrap via a `sha256-` hash pinned in
`docs/cloudflare-security-headers.md`. NOTHING in the repo verifies that
hash still matches the built stub: any edit to the stub, any Astro output
change, silently breaks analytics in production (blocked script, no error
the maintainer will see — there is no `report-uri`). Separately, the GA4
measurement ID is pasted into legal copy in SIX places, so an ID rotation
today means hand-editing privacy prose. This plan adds a hash-check script
(non-blocking in CI) and single-sources the ID from the environment.

## Current state

The facts the executor needs, inlined:

- `src/layouts/BaseLayout.astro:109-120` — the hashed stub (two conditional
  blocks): inline `define:vars={{ ga4Id }}` script
  (`window.dataLayer.../gtag('config', ga4Id, { send_page_view: true,
  cookie_expires: 60 * 60 * 24 * 395 })`) + async external `gtag.js` script.
  `src/pages/index.astro:284-295` carries an identical gateway-page copy.
  ONLY the inline stub's exact bytes are hashed — the external script is
  allowlisted by host (`https://www.googletagmanager.com`).
- `docs/cloudflare-security-headers.md:22-25` — CSP `script-src` with five
  `sha256-` hashes; the GA4 one is documented as
  `sha256-4IyZhVv+RWju+1/qJEKCsZqtEjlfkQeg7lwN85qT6Y8=` computed via
  `openssl dgst -sha256 -binary | openssl base64` over the EXACT built
  `<script>` content (see `plans/006-plausible-to-ga4-migration.md:5` for
  the original procedure — read that section before writing the script).
- GA4 ID occurrences in legal copy (`src/data/siteDocuments.ts`):
  privacy EN line 44, privacy ES line 100, core-stack lines 65/121
  (`G-2HK4GHK7GR` in parens), cookies EN line 158, cookies ES line 194.
  The ID is a PUBLIC measurement identifier (already in CI logs and page
  source) — NOT a secret; no rotation/secrecy handling needed.
- `.env.example:4`: `PUBLIC_GA4_MEASUREMENT_ID=G-XXXXXXXXXX` (names only).
  CI sets the real value via `vars.PUBLIC_GA4_MEASUREMENT_ID`
  (`deploy.yml:33-51`). Local builds have it UNSET (empty) — any
  env-derivation MUST degrade gracefully for local builds.
- `src/env.d.ts` exists — check its contents at execution for
  `/// <reference types="astro/client" />` (needed for `import.meta.env`
  typing in a `.ts` data file).

## Commands you will need

| Purpose | Command | Provenance | Expected on success |
|---------|---------|------------|---------------------|
| Typecheck | `npm run check` | declared | exit 0 |
| Build | `npm run build` | declared | exit 0 |
| Hash check | `node scripts/check-csp-hashes.mjs` (you create it) | declared | exit 0, prints MATCH |
| Source tests | `node tests/run.js` | executed | same pass/fail set as Step 0 baseline |

## Scope

**In scope** (files you may create/modify):
- CREATE `scripts/check-csp-hashes.mjs` — hash verification script.
- `src/data/siteDocuments.ts` — derive the ID from env with safe fallback.
- `.github/workflows/deploy.yml` — add the NON-blocking check step (only if
  Plan 010 hasn't already landed a conflicting edit; if 010 landed, insert
  adjacent to its audit steps following its style).
- `docs/cloudflare-security-headers.md` — update ONLY the hash doc line if
  the script proves the pinned hash stale (Step 2), nothing else.

**Out of scope** (do NOT touch):
- The GA4 stub itself (`BaseLayout.astro`, `index.astro`) — if the hash
  mismatches, report + update the DOCS line; never "fix" the hash by editing
  the stub.
- The actual Cloudflare rule (outside the repo), `report-uri` additions to
  the live CSP (operator decision — note as Deferred instead).
- Any other `docs/` content, any services/pricing copy.

## Git workflow

- Branch: `advisor/015-csp-hashes`
- Commits: script first, then siteDocuments derivation; conventional commits
  (e.g. `feat(security): verify CSP hashes for GA4 inline stub`)
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 0: Baseline

1. `node tests/run.js` → record counts.
2. Read `plans/006-plausible-to-ga4-migration.md:5` (hash procedure) and
   `src/env.d.ts` (env typing). Record both.
3. `npm run build` on the unmodified tree → exit 0 (needed: the script reads
   `dist/`).

**Verify**: procedure + env typing understood; build green.

### Step 1: Write the hash-check script

Create `scripts/check-csp-hashes.mjs` (pure node, no deps; model the file
walk on `scripts/check-links-seo.js:12-23`):

1. Read the built `dist/en/index.html` (+ gateway `dist/index.html` if
   present) and extract the FIRST inline `<script>` block containing
   `window.dataLayer` (the GA4 stub). Hash its EXACT inner bytes:
   `createHash('sha256').update(bytes).digest('base64')`.
2. Read `docs/cloudflare-security-headers.md`, extract all `sha256-...`
   tokens, and assert the computed hash is among them. Print
   `CSP HASH MATCH <hash>` / `CSP HASH MISMATCH computed=<..> pinned=[..]`.
3. Exit 0 on match (both pages, when present), exit 1 on mismatch or when
   the stub block can't be found.
4. Astro minification caveat: the doc says the hash was computed OVER BUILT
   output — the script MUST read `dist/`, never `src/`. If the built stub
   differs between the homepage and gateway page, check EACH against the
   pinned set independently and report per page.

**Verify**: `npm run build && node scripts/check-csp-hashes.mjs` → exit 0,
`CSP HASH MATCH` printed. (If MISMATCH on the unmodified tree: the doc is
already stale — proceed to Step 3's docs-only update path and report it
prominently; do NOT edit the stub.)

### Step 2: Single-source the GA4 ID in legal copy

In `src/data/siteDocuments.ts`:

1. At top: `const GA4_ID = import.meta.env.PUBLIC_GA4_MEASUREMENT_ID as string | undefined;`
   and `const ga4Label = GA4_ID ?? 'Google Analytics 4 ID (configured at deploy time)';`
   — WAIT. Check the live strings first: they embed the ID mid-sentence
   (e.g. line 44 `...(gtag.js, G-2HK4GHK7GR, cookie_expires...)`). If a clean
   substitution keeps every sentence grammatical in both locales with the
   fallback text, replace all six ID occurrences with `${...}` interpolation
   of the env value-or-fallback. If ANY sentence becomes ungrammatical with
   the fallback, STOP this step (leave copy untouched, keep only Step 1) and
   report — do not rewrite legal prose to fit the refactor.
2. `npm run check` → exit 0 (if env typing missing, add ONLY the standard
   astro client reference to `src/env.d.ts` if absent — nothing else).

**Verify**: typecheck green; `grep -c "G-2HK4GHK7GR" src/data/siteDocuments.ts` → `0`;
`npm run build` with env UNSET succeeds and renders the fallback text;
with `PUBLIC_GA4_MEASUREMENT_ID=G-TEST1234 npm run build` renders the test ID
in `dist/en/privacy/index.html` (proves derivation; rebuild normally after).

### Step 3: Wire the check (non-blocking) + reconcile docs

1. CI: add after the build-dependent steps (or next to Plan 010's audit
   steps if present, same style):
   ```yaml
   - name: CSP hash check (informational)
     run: npm run build && node scripts/check-csp-hashes.mjs
   ```
   with `continue-on-error: true`. NOTE: this rebuilds (build is idempotent;
   reuses the same command CI already runs — acceptable) OR, if Plan 010
   landed, chain as `node scripts/check-csp-hashes.mjs` alone since `dist/`
   already exists in that job. Prefer the no-rebuild form when `dist/`
   freshness is guaranteed by job order.
2. Docs: ONLY if Step 1 ever printed MISMATCH on an unmodified build, update
   the single hash-doc line (`cloudflare-security-headers.md:25`) to the
   computed hash + note the recompute date. Otherwise leave docs untouched.
3. `node tests/run.js` → failure set identical to Step 0 baseline.

**Verify**: workflow snippet placed correctly; YAML still parses
(`python3 -c "import yaml; yaml.safe_load(open('.github/workflows/deploy.yml'))"`,
STOP-report if pyyaml missing); suite baseline-identical.

## Test plan

- The script self-tests via its MATCH/MISMATCH exit codes on real build
  output (no fixtures — fixtures would defeat the purpose).
- Negative proof at execution: temporarily append a space inside a COPY of
  the built stub? Forbidden to over-engineer — instead, unit-check the
  compare function by invoking the script against the gateway page vs
  homepage separately (two independent MATCH lines = two independent proofs).

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `node scripts/check-csp-hashes.mjs` exits 0 post-build with MATCH lines
- [ ] No hardcoded measurement ID remains in `siteDocuments.ts` (or Step 2 STOP-reported with copy intact)
- [ ] `npm run check` + `npm run build` exit 0 (unset AND test-set env)
- [ ] `node tests/run.js` failure set identical to baseline
- [ ] `git diff --name-only 79b5347...HEAD` lists only in-scope files
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- The stub bytes can't be extracted from `dist/` (Astro output shape changed).
- Step 2 substitution breaks sentence grammar with the fallback (leave copy).
- The pinned hash mismatches on an UNMODIFIED build (stale doc — update the
  doc line per Step 3, flag prominently, never touch the stub).
- `pyyaml` missing for the YAML check (report; don't install).
- Any step needs Cloudflare-dashboard access (outside the repo by definition).

## Maintenance notes

For the human/agent who owns this code after the change lands:

- ANY edit to the GA4 stub (or Astro major upgrade) requires re-running the
  script and, on MISMATCH, updating the pinned hash IN CLOUDFLARE first,
  docs second. The CI step is `continue-on-error` so it WARNS but never
  blocks a content deploy — treat its failure as P1 security-visibility debt.
- **Deferred:** adding `report-uri`/`report-to` to the live CSP (needs an
  operator-owned collector endpoint decision); making the check blocking
  (only safe once hash updates ride the same PR as stub changes — enforce by
  convention, not tooling, for now).
