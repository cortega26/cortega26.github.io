# Content Pilot Review — ES Guides (Plan 023/037)

Cadence: `one review at day 60, then per-batch`. Owner: `site operator`.
Source rules: `docs/tasks/keyword-research-es.md` (kill criteria per row).

## 1. Precondition — Search Console connected (operator)

The kill criteria need impressions, which only Search Console provides. Until
this is done, the review is BLOCKED (record it, do not guess):

1. Search Console → Add property → Domain → `tooltician.com`.
2. Add the TXT record Google gives you to the `tooltician.com` DNS zone
   (Cloudflare) and press Verify.
3. Sitemaps → submit `https://tooltician.com/sitemap-index.xml`.
4. Confirm the panel shows the sitemap as accepted.

## 2. Review window

Pilot batch published `2026-09-16` (commit `0246f64`). Day-60 checkpoint:
`2026-11-15`. Do not judge before the window closes.

## 3. Guides under review

| Guide | Service CTA | Kill criterion |
|---|---|---|
| `/es/guias/automatizar-reportes-excel-python/` | `/es/servicios/automatizacion-python/` | < top-20 impressions in 60 days → drop CTA, keep as unlinked note |
| `/es/guias/auditoria-tecnica-web-negocios-pequenos/` | `/es/servicios/higiene-tecnica-web/` | same |
| `/es/guias/pagina-web-estatica-cuando-conviene/` | `/es/servicios/sitios-web/` | same |

## 4. How to run the review (operator)

1. Search Console → Performance → Search results → filter Page = each guide
   URL above; window = last 60 days; export or note **impressions** and the
   **average position**.
2. Record one row per guide in the dated-runs table of
   `docs/tasks/maintenance-checklist.md`.
3. Apply the decision matrix in §5.

## 5. Decision matrix (per guide)

| Result | Action |
|---|---|
| ≥ top-20 impressions and position improving | Keep guide + CTA; candidate for the next batch |
| < top-20 impressions | Drop the `ArticleCta` from that guide (keep the article as an unlinked note); record why |
| Zero impressions for all three guides | Stop the content track: no new guides; record the verdict in this file |

## 6. Next-batch rule (only after a passing review)

Candidate rows are #5, #6, #8 and #9 in `docs/tasks/keyword-research-es.md`.
Publish at most two per batch, and only if at least one pilot guide passed its
kill criterion. Each new guide must keep exactly one mapped service CTA and
its own 60-day kill criterion. If no guide passes, publish nothing and record
the stop decision here.

## 7. Dated reviews

| Date | Search Console verified? | Guide | Impressions | Avg. position | Decision |
|---|---|---|---|---|---|
| `YYYY-MM-DD` | `yes/no` | ... | ... | ... | `keep/drop/stop` |
