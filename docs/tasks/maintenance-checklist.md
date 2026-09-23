# Maintenance Checklist (Quarterly Freshness Runbook)

Cadence: `quarterly`. Owner: `site operator`.
Scope: `docs-only` routine that keeps availability copy, A+ posture, OG card,
`public/llms.txt`, and funnel deliverability from going stale.

## Dated runs

Record every run here (newest first):

| Date | Item | Result |
|---|---|---|
| `YYYY-MM-DD` | Full quarterly pass (items 1–6) | `Pending` |

## 1. Time-bound claims

Where: `src/` (components, pages, copy).
How:

```sh
grep -rEn "[0-9]{4}|January|February|March|April|May|June|July|August|September|October|November|December|enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre|[0-9]+[MK]|[0-9]+%" src/
```

For each month/year/count claim found, confirm it is still true or reword it
to be evergreen. Lesson: plans `013`/`018` decay-proofing — never leave a
stale date, count, or percentage in copy.

Also check the résumé PDFs — they carry dated numbers:
`pdftotext public/assets/docs/carlos-ortega-resume.pdf - | grep -Ei "as of|[0-9]{4}"` (and the same for `carlos-ortega-resume-es.pdf`). If a claim is stale, refresh per `docs/tasks/resume-refresh-runbook.md`.

## 2. A+ security posture

Where: live site vs `docs/cloudflare-security-headers.md`.
How:

1. Re-run `SecurityHeaders.com` and Mozilla Observatory against the
   production host.
2. On any grade drop, diff live headers vs the doc first:

```sh
curl -sSI https://tooltician.com | head -n 30
```

3. Fix the Cloudflare rule first (`Rules` → `Transform Rules` →
   `Modify Response Header`), then re-scan until A+ is restored.

## 3. OG card

Where: `public/assets/images/og-card.png`, source `scripts/generate-og.mjs`.
How: after any major copy change, regenerate and spot-check the render:

```sh
node scripts/generate-og.mjs
```

Confirm the output image exists, has meaningful size, and renders the current
headline correctly.

## 4. Full gates (all green)

Where: repo root. Run in this order:

```sh
npm run check
node tests/run.js
npm run build
node tests/run.js --built
node test-htw-snapshot.mjs
node scripts/check-csp-hashes.mjs
```

References: snapshots in `tests/snapshots/` (`htw-en.json`, `htw-es.json`);
HTW snapshot runner at repo-root `test-htw-snapshot.mjs`; CSP hash checker at
`scripts/check-csp-hashes.mjs`. All commands must be green before closing the
run.

## 5. Funnel self-test — `OPERATOR` / `MANUAL` (instructions only, do NOT automate)

Mark: `OPERATOR/MANUAL`. Do NOT perform this item as part of an automated
agent run — it requires a human operator with inbox and Calendly access.

1. Live brief test: submit the contact brief with a clearly-marked test
   subject/body (e.g. `[SELF-TEST YYYY-MM-DD] — ignore`).
2. Confirm inbox arrival, including the spam/junk folder check.
3. Test Calendly booking: create a test booking, then confirm the operator
   notification arrives (email/calendar) and cancel the test booking.
4. Log the outcome in the Dated runs table above
   (e.g. `2026-XX-XX | 5. Funnel self-test | Pass — inbox + Calendly OK`).

## 6. `llms.txt` + sitemap reflect the service list

Where: `public/llms.txt`, `public/llms-full.txt`, sitemap via the Astro
sitemap integration in `astro.config.mjs`.
How: after any offering/service-list change, confirm both `llms.txt` files
describe the current services and that the sitemap still covers the current
routes. Rebuild if needed (`npm run build`) and re-check the built output.
