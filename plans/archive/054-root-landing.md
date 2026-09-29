# Plan 054: Guard the root-landing language decision, drop the dead redirect key, and restore missing head metadata

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat be975ef..HEAD -- src/pages/index.astro public/assets/js/root-language-redirect.js public/assets/js/root-language-picker.js public/assets/js/site-layout.js package.json .github/workflows/deploy.yml`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: LOW-MED (the root is the x-default for every route group)
- **Depends on**: 052 (CI step; if 052 is not DONE, add the step yourself)
- **Category**: tests / correctness
- **Planned at**: commit `be975ef`, 2026-09-23

## Why this matters

Plan 031 turned the root into a real bilingual x-default landing and
removed the browser-language auto-redirect. The decision is enforced by
nothing: no test executes `root-language-redirect.js`, so reintroducing
`navigator.language` detection (the exact regression 031 locked out) would
pass every suite. Meanwhile:

- Two scripts still write a dead localStorage key
  (`tooltician-language-autoredirect`) that nothing reads — 031's plan
  required deleting it; the readers were removed, the writers were missed.
- The root page (the `x-default` for every route group) omits head
  metadata that `BaseLayout` provides to every other page: referrer
  policy, the llms.txt alternate, `og:locale`, and the `rel="me"` identity
  links.

## Current state (verified at `be975ef`)

`public/assets/js/root-language-redirect.js` (whole file, 27 lines):

```js
(() => {
  const preferenceKey = 'tooltician-language';
  const normalizeLanguage = (value) => { ... };
  try {
    const storedPreference = normalizeLanguage(window.localStorage.getItem(preferenceKey));
    if (storedPreference) {
      window.location.replace(`/${storedPreference}/`);
    }
  } catch {
    // Storage blocked — keep the landing usable.
  }
})();
```

Dead key writers — `public/assets/js/site-layout.js:2-3,11-12`:

```js
  const languagePreferenceKey = 'tooltician-language';
  const firstVisitRedirectKey = 'tooltician-language-autoredirect';
...
        window.localStorage.setItem(languagePreferenceKey, preference);
        window.localStorage.setItem(firstVisitRedirectKey, '1');
```

and `public/assets/js/root-language-picker.js:2-3,11-12` (same shape).
Verified: `grep -rn "autoredirect"` finds only these two writers and the
binary codegraph index — no reader.

Root head (`src/pages/index.astro:20-59`) — has canonical, hreflang
alternates, robots, OG/Twitter, favicons, font preloads, preconnects; it
does **not** have (compare `BaseLayout.astro:35,41-42,54-55,79-80`):
`<meta name="referrer">`, the llms.txt alternate link, `og:locale` /
`og:locale:alternate`, and the two `rel="me"` links. The inline GA4 stub
(`index.astro:445-450`) must stay byte-identical (CSP hash).

## Commands you will need

| Purpose     | Command                                | Provenance | Expected on success |
|-------------|----------------------------------------|------------|---------------------|
| Install     | `npm ci`                               | declared   | exit 0 |
| Build       | `npx --no-install astro build`         | executed   | `[build] Complete!`, 30 pages |
| New suite   | `node tests/root-language-decision.mjs`| executed   | all pass |
| CSP check   | `node scripts/check-csp-hashes.mjs`    | executed   | MATCH on all pages |
| Full tests  | `npm test`                             | executed   | exit 0 |

## Scope

**In scope**:
- `tests/root-language-decision.mjs` (create)
- `src/pages/index.astro` (head tags only)
- `public/assets/js/site-layout.js` (remove the dead key constant + write)
- `public/assets/js/root-language-picker.js` (remove the dead key constant + write)
- `package.json` (test chain only)
- `.github/workflows/deploy.yml` (extend the contract-test step)
- `plans/README.md` (status row only)

**Out of scope** (do NOT touch):
- The root's inline `:root` tokens and `@font-face` block
  (`index.astro:61-90`) — the full de-fork is deferred (see Maintenance).
- `root-language-redirect.js` behavior — it is correct; only tests are added.
- `CLAUDE.md:20` (still says "auto-redirect from browser language") —
  plan 059 owns that correction.
- The GA4 stub bytes.

## Git workflow

- Branch: `advisor/054-root-landing`
- Conventional commits, e.g. `fix(root): guard the language decision, drop dead redirect key, complete head metadata`.
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 0: Green baseline

`npm ci` → `npx --no-install astro build` → `node scripts/check-csp-hashes.mjs`
→ `npm test`.

**Verify**: all green; CSP `MATCH`. If not, STOP and report.

### Step 1: Remove the dead key writes

In `site-layout.js` and `root-language-picker.js`, delete the
`firstVisitRedirectKey` / `firstVisitKey` constant and its
`localStorage.setItem(..., '1')` call. Keep the
`tooltician-language` preference write.

**Verify**: `grep -rn "tooltician-language-autoredirect" src/ public/ tests/` → no matches.

### Step 2: Restore the missing head metadata on the root

In `src/pages/index.astro`'s `<head>` (after the Twitter tags at `:39-43`),
add, matching BaseLayout's exact tags:

```html
  <meta name="referrer" content="strict-origin-when-cross-origin" />
  <link rel="alternate" type="text/plain" href="https://tooltician.com/llms.txt" title="LLM-friendly site summary" />
  <meta property="og:locale" content="en_US" />
  <meta property="og:locale:alternate" content="es_CL" />
  <link rel="me" href="https://github.com/cortega26" />
  <link rel="me" href="https://www.linkedin.com/in/cortega26" />
```

Do not move or reformat anything else in the head; the GA4 stub is not in
the head and must not be touched.

**Verify**: `npx --no-install astro build && node scripts/check-csp-hashes.mjs`
→ `MATCH`; then:

```bash
for tag in 'name="referrer"' 'llms.txt' 'og:locale' 'rel="me"'; do printf '%s -> %s\n' "$tag" "$(grep -c "$tag" dist/index.html)"; done
```

All ≥ 1.

### Step 3: Write the decision suite

Create `tests/root-language-decision.mjs`:

1. **vm test for the redirect** — load
   `public/assets/js/root-language-redirect.js` in a `vm` sandbox
   (pattern: `tests/analytics-guard.mjs`) with:
   - `localStorage.getItem` returning `null` → assert `location.replace`
     was **not** called (first-time visitors stay on the landing).
   - returning `'es'` → assert `location.replace('/es/')`.
   - returning `'en'` → assert `location.replace('/en/')`.
   - returning `'fr'` → assert no replace.
2. **Source guard** — read all three files
   (`root-language-redirect.js`, `root-language-picker.js`,
   `site-layout.js`) and assert none contains `navigator.language` or
   `navigator.languages`.
3. **Key agreement** — assert all three files use the
   `tooltician-language` key and none mentions `autoredirect`.
4. **Head metadata (built)** — if `dist/index.html` exists, assert it
   contains `name="referrer"`, `llms.txt`, `og:locale`, and `rel="me"`;
   otherwise skip with a clear message (run `--built`-style only when dist
   exists, mirroring `tests/run.js:727-733`).

**Verify**: `node tests/root-language-decision.mjs` → all pass; then
temporarily edit a copy to confirm each vm branch is falsifiable and
report how.

### Step 4: Wire into `npm test` and CI

- `package.json:15`: add `node tests/root-language-decision.mjs` after the
  other contract suites.
- `.github/workflows/deploy.yml`: extend the `Contract tests` step (added
  by plan 052) with `&& node tests/root-language-decision.mjs`. If 052 is
  not DONE, add a step with just this suite.

**Verify**:

```bash
node -e "const fs=require('fs'),y=require('yaml');const w=y.parse(fs.readFileSync('.github/workflows/deploy.yml','utf8'));const step=w.jobs.build.steps.find(s=>s.name==='Contract tests');if(!step||!step.run.includes('root-language-decision'))process.exit(1);console.log('ci step OK')"
```

→ `ci step OK`.

### Step 5: Full gate

`npx --no-install astro build && npm run check && npm test && node scripts/check-csp-hashes.mjs`

**Verify**: all green; CSP MATCH.

## Test plan

- vm redirect cases (4), source guards (no navigator.language; key
  agreement), built head metadata.
- Model the vm harness on `tests/analytics-guard.mjs`.
- No browser needed.

## Done criteria

ALL must hold:

- [ ] `node tests/root-language-decision.mjs` exits 0
- [ ] `node scripts/check-csp-hashes.mjs` exits 0 (`MATCH`)
- [ ] `grep -rn "autoredirect" src/ public/ tests/` → no matches
- [ ] `npm test` exits 0 and includes the new suite
- [ ] Step 4's `ci step OK` one-liner prints `ci step OK`
- [ ] `git diff --name-only master...HEAD` lists only the in-scope files plus
      `plans/README.md`
- [ ] `plans/README.md` status row for 054 updated

## STOP conditions

Stop and report back (do not improvise) if:

- The drift check shows an in-scope file changed since `be975ef`.
- The CSP hash check fails after Step 2 (the stub was touched).
- The root's redirect behavior differs from the excerpts.
- Anything appears to require touching an out-of-scope file.

## Maintenance notes

- The root language decision is now test-enforced: first-time visitors
  never auto-redirect; only a stored preference forwards.
- The dead key is gone; do not reintroduce a first-visit flag without a
  reader and a test.
- **Deferred:** full de-fork of the root shell (its own `:root` tokens,
  `@font-face` copies, and `root-language-picker.js` duplicating the
  `site-layout.js` listener) — MED risk/M effort; requires rewriting ~400
  lines of bespoke root CSS to the global token names. Unblocked by a
  decision to invest in that refactor.
- **Deferred:** `CLAUDE.md:20` still describes browser-language
  auto-redirect — corrected by plan 059.
