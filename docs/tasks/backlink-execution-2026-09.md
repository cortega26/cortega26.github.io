# Backlink execution runbook — 2026-09 (plan 063)

> Status: **operator pass pending** — do not mark TS-015 done until at least
> one attributed referral is recorded in GA4 / Search Console.
> Date: 2026-09-28
> Plan: `plans/063-backlink-runbook.md` · Targets from plan 019's recon
> (`plans/archive/019-sample-scope.md`).

## UTM convention

- `utm_source=<product>` where product ∈ {`chile-hub`, `rutificador`,
  `bankrecon`, `polla`, `dnspect`, `portfolio-manager`,
  `linkedin-spam-blocker`, `elrincondeebano`, `noticiencias`}.
- `utm_medium=referral` and `utm_campaign=proof-2026q3` on every link.
- Destination = the most relevant page (service page or home), never a raw
  asset.
- Values are lowercase and hyphenated, matching the product name used in the
  external page.
- TS-015 also names Monedario as an example site; it is not in plan 019's
  recon. If it is added later, extend `utm_source` with `monedario` and keep
  the same medium/campaign.

## Per-target checklist

**Count: 13 targets from plan 019's recon — 10 repositories, 2 PyPI pages,
1 GitHub profile. 12 are actionable; `tuplatainforma` is private and has no
public surface (do not expose it).**

### Repositories (edit README + repo About → Website field)

| # | Target | Edit URL | Destination (with UTMs) | Done | Verified |
|---|--------|----------|--------------------------|------|----------|
| 1 | chile-hub | https://github.com/cortega26/chile-hub (README + About → Website) | https://tooltician.com/en/services/recurring-data-collection/?utm_source=chile-hub&utm_medium=referral&utm_campaign=proof-2026q3 | [ ] | [ ] |
| 2 | rutificador | https://github.com/cortega26/rutificador (README + About → Website) | https://tooltician.com/en/services/python-automation/?utm_source=rutificador&utm_medium=referral&utm_campaign=proof-2026q3 | [ ] | [ ] |
| 3 | conciliador_bancario | https://github.com/cortega26/conciliador_bancario (README + About → Website) | https://tooltician.com/en/services/financial-tooling/?utm_source=bankrecon&utm_medium=referral&utm_campaign=proof-2026q3 | [ ] | [ ] |
| 4 | polla | https://github.com/cortega26/polla (README + About → Website) | https://tooltician.com/en/services/recurring-data-collection/?utm_source=polla&utm_medium=referral&utm_campaign=proof-2026q3 | [ ] | [ ] |
| 5 | DNSpect | https://github.com/cortega26/DNSpect (README + About → Website) | https://tooltician.com/en/services/internal-tools/?utm_source=dnspect&utm_medium=referral&utm_campaign=proof-2026q3 | [ ] | [ ] |
| 6 | portfolio-manager-server | https://github.com/cortega26/portfolio-manager-server (README + About → Website) | https://tooltician.com/en/services/financial-tooling/?utm_source=portfolio-manager&utm_medium=referral&utm_campaign=proof-2026q3 | [ ] | [ ] |
| 7 | stop-spam-linkedin | https://github.com/cortega26/stop-spam-linkedin (README + About → Website) | https://tooltician.com/en/services/static-sites/?utm_source=linkedin-spam-blocker&utm_medium=referral&utm_campaign=proof-2026q3 | [ ] | [ ] |
| 8 | elrincondeebano | https://github.com/cortega26/elrincondeebano (README + About → Website) | https://tooltician.com/en/services/static-sites/?utm_source=elrincondeebano&utm_medium=referral&utm_campaign=proof-2026q3 | [ ] | [ ] |
| 9 | noticiencias | https://github.com/cortega26/noticiencias (README + About → Website) | https://tooltician.com/en/services/recurring-data-collection/?utm_source=noticiencias&utm_medium=referral&utm_campaign=proof-2026q3 | [ ] | [ ] |
| 10 | tuplatainforma (private) | — | **N/A** — private repo; no public README or About surface. Skip. | [ ] | [ ] |

### PyPI pages (project description + Project URLs; edit in the package's `pyproject.toml` and republish)

| # | Target | Edit URL | Destination (with UTMs) | Done | Verified |
|---|--------|----------|--------------------------|------|----------|
| 11 | rutificador (PyPI) | https://pypi.org/project/rutificador/ (`[project.urls]` / description on next release) | https://tooltician.com/en/services/python-automation/?utm_source=rutificador&utm_medium=referral&utm_campaign=proof-2026q3 | [ ] | [ ] |
| 12 | bankrecon (PyPI) | https://pypi.org/project/bankrecon/ (`[project.urls]` / description on next release) | https://tooltician.com/en/services/financial-tooling/?utm_source=bankrecon&utm_medium=referral&utm_campaign=proof-2026q3 | [ ] | [ ] |

### GitHub profile

| # | Target | Edit URL | Destination (with UTMs) | Done | Verified |
|---|--------|----------|--------------------------|------|----------|
| 13 | cortega26 profile (bio Website + profile README + pins) | https://github.com/cortega26 (profile README repo) and https://github.com/settings/profile (Website field) | https://tooltician.com/en/?utm_source=portfolio-manager&utm_medium=referral&utm_campaign=proof-2026q3 | [ ] | [ ] |

The profile has no single product name; use `utm_source=portfolio-manager`
(its strongest pinned project) or extend the list with `github-profile` if a
distinct source is preferred.

## Verification

1. After each edit, open the edited page in a private window and click the
   link; confirm the destination loads with the UTM visible in the address
   bar.
2. After all edits, check GA4 → Reports → Acquisition → Traffic acquisition
   with `Session campaign = proof-2026q3` (or filter by `Session source`);
   confirm at least one referral per edited product. The "Traffic source"
   row already exists in `docs/analytics-sprint-0.md`.
3. Optionally check Search Console → Links for the new referring domains.
4. Natural review date: the `2026-11-15` checkpoint.

## Recording

- Update the strategy scoreboard row **Back-links desde productos propios**
  in `docs/tasks/tooltician-strategy-execution-plan.md`: replace `0 medibles`
  with the measured count and keep the evidence (GA4 export or dated notes)
  next to the row.
- Mark `TS-015` done only after ≥1 attributed referral is recorded; until
  then it stays `Pendiente`.
- If the pass is not executed by the `2026-11-15` review, re-date this
  runbook or fold it into that review rather than leaving a stale checklist.
