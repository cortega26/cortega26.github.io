# Plan 034: Audit closeout — full verification, llms.txt, and response-doc status

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 2a10c13..HEAD -- public/llms.txt public/llms-full.txt docs/content-audit/audits/audit-20260923-response.md plans/README.md plans/ROADMAP.md`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live files before proceeding; on a
> mismatch, treat it as a STOP condition. ALSO confirm Plans 025–033 are all
> DONE before starting; this plan is the integration gate.

## Status

- **Priority**: P2
- **Effort**: M
- **Risk**: LOW (verification + docs; the only code-adjacent edits are the
  llms files and plan indexes)
- **Depends on**: Plans 025–033
- **Category**: verification / governance
- **Planned at**: commit `2a10c13`, 2026-09-23
- **Audit finding(s)**: all (closeout)

## Why this matters

Each plan in the series adds its own test group and acceptance criteria, but
nothing yet verifies the series as a whole against the audit's §8 criteria,
updates the machine-readable agent corpus (`llms.txt` / `llms-full.txt`) for
the new surfaces, or closes the response-doc matrix. Without this plan the
series can land "green per plan" while the audit's acceptance criteria remain
partially unverified — exactly the gap that produced the stale H-01/H-07
evidence in the first place.

## Current state (verified 2026-09-23, commit `2a10c13`)

- `public/llms.txt` (verified content): lists both homes, the six services
  (EN/ES), legal documents, and the sitemap index. It does **not** mention
  the ES guides hub, the root landing, the staged pricing pattern, or the
  work-page schema.
- `public/llms-full.txt`: same corpus in long form; must be checked for the
  same gaps.
- `docs/content-audit/audits/audit-20260923-response.md` (created by Plan
  024): 12-finding matrix + locked decisions + acceptance-criteria mapping;
  all rows still `TODO` except H-01/H-07 (stale, no action) and 024's own row.
- Test entry points after the series:
  - `node tests/run.js` (source) — groups `H-03`, `H-04`, `H-06`, `H-08`,
    `H-09`, `H-10`, `H-11` appended by plans
  - `node tests/run.js --built`
  - `node tests/sitemap-i18n.mjs` (Plan 025)
  - `node test-htw-snapshot.mjs`, `node test-behavioral.mjs`
  - `node scripts/check-links-seo.js`, `node scripts/check-csp-hashes.mjs`
- `package.json` `test` chain includes `tests/analytics-service-funnel.mjs`
  and `tests/analytics-guard.mjs` — the series must not break them.
- CI (`deploy.yml`) runs: GA4 var check → `npm run check` → source tests →
  build → built tests → sitemap i18n → Playwright install → HTW snapshot →
  behavioral → link audit (informational) → CSP (informational) → deploy.
  Plan 025 inserts the sitemap step; this plan verifies the final order.
- Deploy target: GitHub Pages via Actions on `master`; live site is
  `https://tooltician.com`.

## Commands you will need

| Purpose | Command | Provenance | Expected on success |
|---------|---------|------------|---------------------|
| Typecheck | `npm run check` | declared | exit 0 |
| Full local chain | `npm test` | declared | exit 0 end-to-end |
| Sitemap validator | `node tests/sitemap-i18n.mjs` | declared | exit 0 |
| Link audit | `node scripts/check-links-seo.js` | declared | 0 internal issues |
| CSP hashes | `node scripts/check-csp-hashes.mjs` | declared | MATCH |
| Live root | `curl -s https://tooltician.com/ \| head` | declared | landing markers |
| Live sitemap | `curl -s https://tooltician.com/sitemap-0.xml` | declared | normalized groups |

## Scope

**In scope** (the only files you should create/modify):
- `public/llms.txt`, `public/llms-full.txt` — add the guides hub, the root
  landing, and the staged pricing pattern
- `docs/content-audit/audits/audit-20260923-response.md` — set every row to
  `DONE` / `NO ACTION` with the verifying command
- `plans/README.md`, `plans/ROADMAP.md` — final scoreboard; archive plans
  024–033 into `plans/archive/` once DONE (keep 034 active until it lands)

**Out of scope** (do NOT touch):
- Any `src/`, `public/assets/`, test, or config file — if a gap is found,
  reopen the owning plan instead of patching here
- Re-pinning CSP hashes or changing Cloudflare rules (operator-only)

## Git workflow

- Branch: `advisor/034-audit-closeout`
- Conventional commit, e.g. `docs(audit): close out the 2026-09-23 content audit`
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 0: Series gate

1. Confirm every plan 025–033 is DONE in `plans/README.md`. If any is not,
   STOP.
2. `npm ci` if needed.

**Verify**: 025–033 all DONE.

### Step 1: Full local chain

Run, in order, and record each result:
```
npm run check
node tests/run.js
npm run build
node tests/run.js --built
node tests/sitemap-i18n.mjs
node test-htw-snapshot.mjs
node test-behavioral.mjs
node scripts/check-links-seo.js
node scripts/check-csp-hashes.mjs
```
All must exit 0 (link audit: 0 internal issues; CSP: MATCH).

**Verify**: every command green; results recorded in the response doc.

### Step 2: Audit §8 acceptance criteria

Walk the audit's 12 acceptance criteria
(`docs/content-audit/audits/audit-20260923.md` §8) and, for each, run the
specific check and record the evidence:
1. Work-page promise vs content → `grep -c 'project-title' dist/{en/work,es/trabajo}/index.html`.
2. Sitemap hreflang → `node tests/sitemap-i18n.mjs` + manual read.
3. Price snippets staged → `H-04` group.
4. CTA names → `H-03` group.
5. Root landing → `H-05` group + `curl`.
6. Guides linked + CTA → `H-08` group.
7. EN USD ranges → `grep` on `dist/en/index.html`.
8. Case fichas → `H-06` group.
9. Brief errors → `test-behavioral.mjs` validation case.
10. Work H1→H2→H3 → `H-09` group.
11. Schema + robots/sitemap/llms sync → `H-11` + link audit + llms review.

**Verify**: every criterion has a command and a passing result; any failure
reopens its owning plan (STOP).

### Step 3: llms corpus

Update `public/llms.txt` and `public/llms-full.txt`:
1. Add the root landing (`https://tooltician.com/`) as the bilingual entry.
2. Add the guides hub (`/es/guias/`) and the three guide URLs.
3. State the staged pricing pattern in one line per locale (diagnostic →
   build → retainer, UF for Chile/LATAM, USD international) — no numbers
   beyond the ones published.
4. Add the work page schema surface (ten public projects with verification
   dates) if the file enumerates pages.
5. Do not invent capabilities; mirror only what the site now publishes.

**Verify**: `npm run build`; grep the built `dist/llms.txt` for `/es/guias/`
and the root URL; both llms files still respond in `dist/`.

### Step 4: Close the response doc + index

1. `docs/content-audit/audits/audit-20260923-response.md`: set each finding
   row to `DONE` (with the verifying command) or `NO ACTION` (H-01/H-07
   stale rows keep their dated verdict).
2. `plans/README.md`: final statuses; move 024–033 files to
   `plans/archive/` and update entry points.
3. `plans/ROADMAP.md`: mark the waves complete and add the scoreboard rows
   with `Verified by`.
4. Leave Plan 034's row until this plan lands, then archive it too.

**Verify**: `git status --short` shows only the intended doc moves/edits;
`ls plans/*.md` shows only `README.md` and `ROADMAP.md` (plus 034 until archived).

### Step 5: Post-deploy live validation (operator)

After `master` deploys, run and record:
```
for p in / /en/ /es/ /es/trabajo/ /en/work/ /es/guias/ /en/services/python-automation/ /es/servicios/automatizacion-python/; do
  printf '%s ' "$p"; curl -s -o /dev/null -w '%{http_code}\n' "https://tooltician.com$p"
done
curl -s https://tooltician.com/sitemap-0.xml | grep -o 'hreflang="[^"]*"' | sort | uniq -c
curl -s https://tooltician.com/llms.txt | grep -c '/es/guias/'
curl -sI https://tooltician.com/ | grep -i 'content-security-policy' | head -c 200
```
All pages 200; no duplicated hreflang; llms contains the hub; CSP header
present. If the CSP header is missing, re-run
`scripts/cloudflare-csp-rules.sh --dry-run` and report (operator action).

**Verify**: results recorded in the response doc's final section.

## Test plan

- The full chain (Step 1) plus the §8 walk (Step 2). This plan adds no new
  test groups; it is the integration gate.

## Done criteria

Machine-checkable. ALL must hold:

- [ ] All 12 audit §8 criteria verified with recorded commands
- [ ] `npm test` exits 0 end-to-end
- [ ] Link audit 0 internal issues; CSP MATCH
- [ ] `llms.txt` + `llms-full.txt` mention the root, the hub, and the staged
      pricing pattern
- [ ] Response doc has no remaining `TODO` rows
- [ ] Plans 024–033 archived; `plans/README.md` + `ROADMAP.md` final
- [ ] Post-deploy live validation recorded (operator)
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- Any plan 025–033 is not DONE.
- An §8 criterion fails — reopen the owning plan; do not patch here.
- The live deploy is stale relative to `master` (report; do not validate a
  stale deployment as if it were current).
- The CSP header is missing or different from `docs/cloudflare-security-headers.md`
  (operator action; report, do not change the doc).
- A step's verification fails twice after a reasonable fix attempt.

## Maintenance notes

For the human/agent who owns this code after the change lands:

- The response doc is the audit's permanent record; future audits get new
  files, this one stays closed.
- The `H-*` test groups are the audit's regression net: keep them named after
  findings so a future audit can map verdicts to tests in seconds.
- The next content audit should run against the deployed site and diff its
  findings against the `H-*` groups before writing new plans.
