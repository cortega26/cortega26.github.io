# Plan 055: Single-source HTW schema prices and guard the JSON-LD builders

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat be975ef..HEAD -- src/data/pricing.ts src/data/jsonld.ts src/pages/en/services/web-technical-hygiene/index.astro src/pages/es/servicios/higiene-tecnica-web/index.astro tests/run.js`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: tech-debt (structured data)
- **Planned at**: commit `be975ef`, 2026-09-23

## Why this matters

Two structured-data defects:

1. The HTW pages hardcode their schema.org prices as string literals
   (`priceValue: '69'` …) next to `pricing.ts` imports. A price change
   updates `pricing.ts` and the rendered page but leaves the schema at the
   old value in both locales.
2. `jsonld.ts` has two unchecked lookups: `offerDescriptions[lang][service.service_id]`
   silently yields `undefined` when a new service is added to the registry
   (the `Offer` loses its description), and the portfolio `ItemList` can
   emit `url: ''`, which is invalid schema.

Both ship with a green build and green tests today.

## Current state (verified at `be975ef`)

`src/pages/en/services/web-technical-hygiene/index.astro:69,83,97,111,126`:

```ts
    priceValue: '69',
...
    priceValue: '499',
...
    priceValue: '899',
...
    priceValue: '999',
...
    priceValue: '279',
```

The ES page mirrors this at `:108,122,136,150,165` with UF values
(`'1','7','13','15','4'`). Both feed `price: plan.priceValue` into their
JSON-LD (`en:203`, `es:271`). `src/data/pricing.ts:26-29` already holds the
same values:

```ts
  webHygiene: {
    en: { diagnostic: '$69', essentials: '$499', operational: '$899', integral: '$999', executiveUpgrade: '$100', retainer: '$279/mo' },
    es: { diagnostic: '1 UF', essentials: '7 UF', operational: '13 UF', integral: '15 UF', executiveUpgrade: '2 UF', retainer: '4 UF/mes' },
  },
```

`src/data/jsonld.ts:21-37` defines `offerDescriptions` for exactly six
`service_id`s per locale; `:97-102` uses it unchecked:

```ts
    makesOffer: serviceRegistry.services.map((service) => ({
      '@type': 'Offer',
      name: lang === 'en' ? service.public_name : service.public_name_es,
      description: offerDescriptions[lang][service.service_id],
      url: `${SITE_ORIGIN}${lang === 'en' ? service.route_en : service.route_es}`,
    })),
```

`:120-129`:

```ts
        url: project.evidence?.find((chip) => chip.type === 'pypi' && chip.href)?.href ?? project.links[0]?.href ?? '',
```

Note: `jsonld.ts` uses extensionless imports and cannot be imported by
plain Node — test its **built output** instead (below).

## Commands you will need

| Purpose      | Command                        | Provenance | Expected on success |
|--------------|--------------------------------|------------|---------------------|
| Install      | `npm ci`                       | declared   | exit 0 |
| Build        | `npx --no-install astro build` | executed   | `[build] Complete!`, 30 pages |
| Full tests   | `npm test`                     | executed   | exit 0 |
| Source tests | `node tests/run.js`            | executed   | `All checks passed.` |

## Scope

**In scope**:
- `src/data/pricing.ts` (add one exported helper)
- `src/data/jsonld.ts` (two guards)
- `src/pages/en/services/web-technical-hygiene/index.astro` (priceValue lines)
- `src/pages/es/servicios/higiene-tecnica-web/index.astro` (priceValue lines)
- `tests/run.js` (one new group)
- `plans/README.md` (status row only)

**Out of scope**:
- Consolidating the HTW JSON-LD builders into shared code — deferred (see
  Maintenance); this plan only single-sources the prices.
- Adding `price` to the `ServicePage.astro` offer catalog (changes 10
  pages' schema) — deferred.
- Visible copy and prices themselves.

## Git workflow

- Branch: `advisor/055-jsonld-hardening`
- Conventional commits, e.g. `fix(seo): derive HTW schema prices from pricing.ts and guard JSON-LD lookups`.
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 0: Green baseline

`npm ci` → `npx --no-install astro build` → `npm run check` → `npm test`.

**Verify**: all green. If not, STOP and report.

### Step 1: Add a price-amount helper

In `pricing.ts`, after the `pricing` object:

```ts
/** Numeric amount for schema.org price fields: "$69" → "69", "1 UF" → "1", "$279/mo" → "279". */
export function priceAmount(value: string): string {
  return value.replace(/[^0-9.]/g, '');
}
```

**Verify**: `npm run check` → 0 errors.

### Step 2: Derive the HTW `priceValue`s

In both HTW pages, import `priceAmount` alongside the existing `pricing`
import and replace each literal, e.g. EN:

```ts
    priceValue: priceAmount(pricing.webHygiene.en.diagnostic),
    priceValue: priceAmount(pricing.webHygiene.en.essentials),
    priceValue: priceAmount(pricing.webHygiene.en.operational),
    priceValue: priceAmount(pricing.webHygiene.en.integral),
    priceValue: priceAmount(pricing.webHygiene.en.retainer),
```

ES uses `pricing.webHygiene.es.*` (diagnostic/essentials/operational/
integral/retainer). Keep the plan-name/label mapping exactly as-is.

**Verify**: `grep -c "priceValue: '" src/pages/en/services/web-technical-hygiene/index.astro src/pages/es/servicios/higiene-tecnica-web/index.astro`
→ 0 for both; rebuild and confirm the schema prices are unchanged:

```bash
node -e "const fs=require('fs');for(const p of ['dist/en/services/web-technical-hygiene/index.html','dist/es/servicios/higiene-tecnica-web/index.html']){const h=fs.readFileSync(p,'utf8');const m=[...h.matchAll(/\"price\":\"([^\"]+)\"/g)].map(x=>x[1]);console.log(p,JSON.stringify(m))}"
```

EN should print `["69","499","899","999","279"]` (order per the plan
array), ES `["1","7","13","15","4"]`. If the order differs, record it in
your report (order is not asserted).

### Step 3: Guard the JSON-LD lookups

In `jsonld.ts`:

- `:100` → `description: offerDescriptions[lang][service.service_id] ?? service.public_name,`
- `:126` → build the url first and omit it when empty:

```ts
    itemListElement: cases.map((project, index) => {
      const url = project.evidence?.find((chip) => chip.type === 'pypi' && chip.href)?.href ?? project.links[0]?.href;
      return {
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': project.id === 'noticiencias' ? 'WebSite' : 'SoftwareApplication',
          name: project.title,
          ...(url ? { url } : {}),
          description: project.summary,
        },
      };
    }),
```

**Verify**: `npm run check` → 0 errors.

### Step 4: Built-output guard tests

Add a group to `tests/run.js` (built pattern with the skip guard):

- For `dist/en/index.html` and `dist/es/index.html`: parse every
  `application/ld+json` block; find the Person block's `makesOffer`; assert
  every offer has a non-empty `description` and a `url` starting with
  `https://tooltician.com/`.
- For `dist/en/work/index.html` and `dist/es/trabajo/index.html`: assert
  every `ItemList` item has a non-empty `name`, and any `url` present is
  non-empty and starts with `http`.
- HTW price parity: assert the EN/ES HTW JSON-LD `price` values equal the
  expected arrays from Step 2.

**Verify**: `node tests/run.js --built` → new group green; then temporarily
change one `priceAmount` call to a wrong band and confirm the parity
assertion fails (red-then-green), and restore.

### Step 5: Full gate

`npx --no-install astro build && npm run check && npm test`

**Verify**: exit 0.

## Test plan

- Built-output assertions (Step 4) are the tests: they read the real
  generated schema, including the guard behavior.
- No source-import tests (jsonld.ts is not Node-importable).

## Done criteria

ALL must hold:

- [ ] `npm run check` exits 0; `npm test` exits 0
- [ ] `grep -c "priceValue: '" src/pages/en/services/web-technical-hygiene/index.astro src/pages/es/servicios/higiene-tecnica-web/index.astro` → 0
- [ ] The Step 4 parity assertion fails with a mutated `priceAmount` and
      passes restored (recorded in your report)
- [ ] `git diff --name-only master...HEAD` lists only the in-scope files plus
      `plans/README.md`
- [ ] `plans/README.md` status row for 055 updated

## STOP conditions

Stop and report back (do not improvise) if:

- The drift check shows an in-scope file changed since `be975ef`.
- The built HTW prices do not match the expected arrays after Step 2.
- A `makesOffer` offer already lacks a description on the current build
  (report it — that means a registry service is missing from
  `offerDescriptions`).
- Anything appears to require touching an out-of-scope file.

## Maintenance notes

- Adding a service to the registry now yields a fallback `Offer.description`
  (the public name) instead of dropping the field; adding it to
  `offerDescriptions` is still the right thing to do, and the parity test
  in plan 048 covers name drift.
- **Deferred:** consolidating the two HTW JSON-LD builder sets with
  `ServicePage.astro`'s builders (and deciding whether all service offers
  should carry `price`) — L effort, changes 10 pages' schema; needs a
  maintainer decision on schema shape.
