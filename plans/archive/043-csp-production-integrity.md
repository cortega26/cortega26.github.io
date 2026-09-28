# Plan 043: Reconcile the CSP/headers documentation with production and make the checks catch drift

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat be975ef..HEAD -- scripts/cloudflare-csp-rules.sh scripts/check-csp-hashes.mjs .github/workflows/deploy.yml docs/cloudflare-security-headers.md`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: MED (CSP header changes affect every path; the repo-side work is LOW)
- **Depends on**: none
- **Category**: security
- **Planned at**: commit `be975ef`, 2026-09-23

## Why this matters

The repository documents a **path-scoped CSP** for `tooltician.com` (added
2026-09-20): `/`, `/en/*`, `/es/*` and `/chile-hub/*` should serve the base
policy **plus** Cloudflare Web Analytics origins
(`static.cloudflareinsights.com`, `cloudflareinsights.com`), while
`/polla/` and other paths keep the base policy. Verified live on
2026-09-23: **every path serves the base policy** — the path-scoped rules
are not in effect. Consequences: either Cloudflare Web Analytics is being
CSP-blocked on the site pages (silent measurement loss), or the documented
control never existed (the repo is an inaccurate record of production
security state). The helper script's ordering makes this failure mode
permanent (below), and both verification paths are blind to it:

- `scripts/cloudflare-csp-rules.sh` step 5 only counts CSP headers and
  asserts *absence* on `/polla/`; it never asserts that `/en/` **has** the
  Insights origins.
- `scripts/check-csp-hashes.mjs` checks only 2 of the 30 built pages and
  accepts any pinned hash, so a new inline script on any other page ships
  unverified.

The documented header list is also wrong: live responses carry CSP, HSTS,
`X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` — but
**not** `X-Frame-Options`, `Cross-Origin-Opener-Policy`, or
`Cross-Origin-Resource-Policy`, which the doc lists as set.

## Current state (verified at `be975ef` and live, 2026-09-23)

### The script's ordering hazard

`scripts/cloudflare-csp-rules.sh:8-13` documents that the upsert is
"POST new + DELETE old" and that "la nueva siempre queda última, que es la
que gana (last rule wins)". But `upsert_rule` (`:78-97`) **skips** the POST
when the rule already has the target value (`:86-88`), and the base rule is
recreated before the path rules (`:101-112`). So when only the **base** CSP
changes (e.g. a hash update), the sequence is: base POSTed at the end, path
rules skipped — leaving the host-wide base rule **after** the path rules,
which now lose. That matches the live state exactly.

### Verification blind spot

`scripts/cloudflare-csp-rules.sh:114-125`:

```bash
for p in / /en/ /es/ /chile-hub/ /polla/; do
  n=$(curl -sSI "https://$DOMAIN$p" | grep -ci '^content-security-policy' || true)
  [[ "$n" == "1" ]] && s=OK || { s="FALLA (headers=$n)"; FAIL=1; }
```

…then only `goatcounter`-absence and `/polla/`-absence checks. A base-only
policy passes all of them.

### Hash check coverage

`scripts/check-csp-hashes.mjs:12-13`:

```js
const REQUIRED_PAGES = ['en/index.html'];
const OPTIONAL_PAGES = ['index.html'];
```

Measured from the current `dist/`: **30 HTML pages**, each with exactly one
inline executable script (the GA4 stub; the other 71 inline scripts are
`application/ld+json`, which CSP does not execute) — so a wider check is
cheap and will pass today.

### CI

`.github/workflows/deploy.yml:78-80` runs `node scripts/check-csp-hashes.mjs`
with `continue-on-error: true` and uploads no artifact, while the lower-value
link audit does (`:69-77`, artifact `seo-audit-report`). On mismatch the
computed hash is only in transient logs.

### Live header state (curl, 2026-09-23)

- `/`, `/en/`, `/es/`, `/chile-hub/`: identical base CSP; `cloudflareinsights`
  count = 0 on all paths.
- Present: `strict-transport-security`, `content-security-policy`,
  `x-content-type-options: nosniff`, `permissions-policy`,
  `referrer-policy`.
- Absent: `x-frame-options`, `cross-origin-opener-policy`,
  `cross-origin-resource-policy` (all listed in
  `docs/cloudflare-security-headers.md:27-61`).

### The doc's own verification

`docs/cloudflare-security-headers.md:117-129` ("Verify the rules override")
checks header count and absences only — it passes while the rules are
inactive. `:109-115` documents the intended Cloudflare Web Analytics setup.

## Commands you will need

| Purpose        | Command                                   | Provenance | Expected on success |
|----------------|-------------------------------------------|------------|---------------------|
| Install        | `npm ci`                                  | declared   | exit 0 |
| Build          | `npx --no-install astro build`            | executed   | `[build] Complete!`, 30 pages |
| Shell syntax   | `bash -n scripts/cloudflare-csp-rules.sh` | executed   | exit 0 |
| Dry run        | `bash scripts/cloudflare-csp-rules.sh --dry-run` | executed | exit 0, prints two rules |
| Hash check     | `node scripts/check-csp-hashes.mjs`       | executed   | `CSP HASH MATCH …` per page, exit 0 |
| Typecheck      | `npm run check`                           | executed   | `0 errors`, `0 warnings`, `0 hints` |
| Full tests     | `npm test`                                | executed   | exit 0 (218/218 src, 77/77 analytics, 247/247 built) |
| Live check     | `node scripts/check-production.mjs`       | executed   | exit 0 today; must stay exit 0 |

Notes:
- Fresh worktree: `npm ci`, then `npx --no-install astro build` before the
  hash check and `npm test`. Never `npm run build` (rewrites committed
  `src/data/github-stats.json`).
- The Cloudflare API step needs a zone token and is **operator-run**; you
  cannot and must not attempt it. Your repo-side changes must be complete
  without it.

## Scope

**In scope** (the only files you may modify):
- `scripts/cloudflare-csp-rules.sh`
- `scripts/check-csp-hashes.mjs`
- `.github/workflows/deploy.yml` (CSP artifact only — do not touch other steps)
- `docs/cloudflare-security-headers.md`
- `plans/README.md` (status row only)

**Out of scope** (do NOT touch):
- `scripts/check-production.mjs` — its header list already matches live
  reality (no XFO/COOP/CORP expected); a separate plan (056) covers its
  failure paths.
- Any live Cloudflare change executed by you (operator step only).
- The GA4 inline stub in `BaseLayout.astro` — its bytes are pinned by CSP
  hash; do not modify it.
- `docs/analytics-sprint-0.md`, `public/assets/js/*` — unrelated.

## Git workflow

- Branch: `advisor/043-csp-production-integrity`
- Conventional commits, e.g. `fix(csp): keep path rules last and verify their effect; widen hash check; reconcile doc with production`.
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 0: Green baseline

`npm ci` → `npx --no-install astro build` → `node scripts/check-csp-hashes.mjs`
→ `npm run check` → `npm test`.

**Verify**: hash check prints `CSP HASH MATCH` for both checked pages and
exits 0; everything else green. If not, STOP and report.

### Step 1: Make the script keep path rules last

In `scripts/cloudflare-csp-rules.sh`:

1. Give `upsert_rule` a force mode: `upsert_rule() { # $1 desc, $2 expr, $3 csp, $4 force }`
   and change the idempotency guard (`:86`) to
   `if [[ "${4:-}" != "force" ]] && jq -e … ; then`.
2. Track whether the base rule was recreated. In the base branch (`:103-110`),
   set `base_changed=1` when the CSP differed, else `0`.
3. After the base handling, call:
   `upsert_rule "$DESC_SITE" "$EXPR_SITE" "$CSP_SITE" "$([[ $base_changed -eq 1 ]] && echo force)"`
   and the same for HUB. (When the base changed, the path rules are always
   re-POSTed after it, restoring "last rule wins".)
4. Update the header comment (`:8-13`) to state the ordering rule: any base
   re-POST must be followed by a forced re-POST of the path rules.

**Verify**: `bash -n scripts/cloudflare-csp-rules.sh` → exit 0;
`bash scripts/cloudflare-csp-rules.sh --dry-run` → exit 0 and still prints
both path rules.

### Step 2: Make the script's live verification assert the effect

In step 5 (`:114-125`), after the existing checks, add:

```bash
for p in / /en/ /es/ /chile-hub/; do
  curl -sSI "https://$DOMAIN$p" | grep -i '^content-security-policy' | grep -q 'static.cloudflareinsights.com' \
    || { echo "   $p sin orígenes de Cloudflare Insights: FALLA"; FAIL=1; }
done
```

(Keep the existing `/polla/` absence check — together they assert the
path-scoping actually works.)

**Verify**: `bash -n scripts/cloudflare-csp-rules.sh` → exit 0.

### Step 3: Widen the built-output hash check

Rewrite the page loop in `scripts/check-csp-hashes.mjs` to walk every
`*.html` under `dist/` (a recursive readdir; `tests/sitemap-i18n.mjs:149-157`
has a `walkHtml` helper you can copy). For each page:

- Collect **executable** inline scripts: `<script>` tags without `src` whose
  `type` is absent or `text/javascript`/`module` (skip
  `application/ld+json`, `application/json`, and other data types).
- For every such script, compute the sha256 and require it to be in the
  pinned set; otherwise `MISMATCH …` and exit 1.
- Keep the existing `extractFirstDataLayerStub`-based message for a page
  whose GA4 stub hash is not pinned, so failures stay actionable.
- If `dist/` does not exist at all, keep the current "cannot read built
  file" failure behavior.

**Verify**: `node scripts/check-csp-hashes.mjs` → prints a MATCH line per
built page (30 expected) and exits 0.

### Step 4: Upload the CSP check output as an artifact

In `.github/workflows/deploy.yml`, make the CSP step write a report and add
an upload step mirroring the SEO artifact (`:69-77`):

```yaml
      - name: CSP hash check (informational)
        run: node scripts/check-csp-hashes.mjs 2>&1 | tee output/csp-hash-report.txt
        continue-on-error: true
      - name: Upload CSP hash report
        if: always()
        uses: actions/upload-artifact@330a01c490aca151604b8cf639adc76d48f6c5d4 # v5
        with:
          name: csp-hash-report
          path: output/csp-hash-report.txt
```

**Verify**: the workflow file parses as YAML (`node -e "import('yaml').then(...)"` is not installed; use
`node -e "const fs=require('fs');const s=fs.readFileSync('.github/workflows/deploy.yml','utf8');if(!s.includes('csp-hash-report'))process.exit(1)"`
or simply re-read the file and confirm the two steps are present and
indented consistently).

### Step 5: Reconcile the doc with production

In `docs/cloudflare-security-headers.md`:

1. Replace the "Verify the rules override" section (`:117-129`) with the
   stronger check: header count == 1 **and** Insights origins present on
   `/`, `/en/`, `/es/`, `/chile-hub/`, absent on `/polla/`.
2. Add a dated subsection near the top of the path-scoped section:

   ```markdown
   ### Production state (verified 2026-09-23)

   Every path served the base policy (no Cloudflare Insights origins) — the
   path-scoped rules were not in effect, because a base-only change re-POSTs
   the base rule after them. `scripts/cloudflare-csp-rules.sh` now forces the
   path rules last; re-run it and verify before trusting this document.
   ```

3. Correct the header list: mark `X-Frame-Options`,
   `Cross-Origin-Opener-Policy`, `Cross-Origin-Resource-Policy` as **not
   currently set** (live-verified 2026-09-23); note that clickjacking is
   covered by `frame-ancestors 'none'` and that setting COOP/CORP requires a
   base-rule change in the Cloudflare dashboard.

**Verify**: `grep -n "Production state (verified 2026-09-23)" docs/cloudflare-security-headers.md`
→ 1 match; `grep -n "X-Frame-Options" docs/cloudflare-security-headers.md`
→ present in the corrected section.

### Step 6: Full gate

`npx --no-install astro build && npm run check && npm test && node scripts/check-csp-hashes.mjs`

**Verify**: all green; hash check exits 0 across 30 pages.

### Step 7 (operator, not the executor): apply and verify

Report this exact operator procedure in your final report; do not run it:

```bash
./scripts/cloudflare-csp-rules.sh        # needs CF_API_TOKEN, Zone:Read + Transform Rules:Edit
for p in / /en/ /es/ /chile-hub/ /polla/; do
  printf '%s -> headers=%s insights=%s\n' "$p" \
    "$(curl -sSI https://tooltician.com$p | grep -ci '^content-security-policy')" \
    "$(curl -sSI https://tooltician.com$p | grep -ci cloudflareinsights)"
done
node scripts/check-production.mjs
```

## Test plan

No new automated tests: the repo's verification is script-based. The hash
check (Step 3) is itself the regression test for inline-script drift; the
dry run + `bash -n` cover the shell changes; the operator curl loop is the
production assertion. If you want one source test, add an assertion to
`tests/run.js` that `scripts/cloudflare-csp-rules.sh` contains the forced
re-POST (`grep` for `force`), but do not over-invest here.

## Done criteria

ALL must hold:

- [ ] `bash -n scripts/cloudflare-csp-rules.sh` exits 0; `--dry-run` exits 0
- [ ] `node scripts/check-csp-hashes.mjs` exits 0 and prints one MATCH line
      per built page (30 on a full build)
- [ ] `grep -c "csp-hash-report" .github/workflows/deploy.yml` → 2
- [ ] `grep -c "Production state (verified 2026-09-23)" docs/cloudflare-security-headers.md` → 1
- [ ] `npm run check` and `npm test` exit 0
- [ ] `git diff --name-only master...HEAD` lists only the in-scope files plus
      `plans/README.md`
- [ ] `plans/README.md` status row for 043 updated

## STOP conditions

Stop and report back (do not improvise) if:

- The drift check shows an in-scope file changed since `be975ef`.
- The widened hash check fails on the current tree for a page other than the
  two already checked (that means an unpinned inline script exists — report
  it instead of pinning it blindly).
- Applying the doc correction would contradict a fresh live check (re-run
  the curl commands in Step 7's first block before writing Step 5's note; if
  the live state changed, record the new state instead).
- Anything appears to require touching an out-of-scope file.

## Maintenance notes

- Any future base-rule edit must be followed by the forced path-rule re-POST
  (the script now does it; a manual dashboard edit does not).
- If the maintainer decides to drop Cloudflare Web Analytics, delete the
  path-rule sections instead of leaving them documented-but-inactive, and
  remove the Insights assertions from the script.
- **Deferred:** setting COOP/CORP/XFO in the base rule — needs a dashboard
  change and a decision on framing policy beyond `frame-ancestors 'none'`.
- **Deferred:** tightening GA4 hosts per path (doc `:142-144`) — separate
  change.
