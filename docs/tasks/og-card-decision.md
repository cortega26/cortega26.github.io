# OG card decision record (plan 061 spike)

> Status: **approved and wired** (2026-09-28)
> Date: 2026-09-28
> Plan: `plans/061-og-card-refresh.md` (spike)
> Generator: `scripts/generate-og.mjs` · Prototypes: `public/assets/images/og-card.png`,
> `public/assets/images/og-card-es.png`

## Inventory of the current generator (Step 1)

### Renderer

- Pure Node.js built-ins: `zlib.deflateSync` + `fs`. No dependencies.
- One 1200×630 RGBA `Uint8Array`; `setPixel` / `fillRect` / `fillRectGradV`
  helpers; backgrounds, accent bars and separator lines are drawn first.
- PNG encoding is hand-rolled: IHDR (color type 2 = RGB, bit depth 8),
  raw scanlines with filter byte 0, deflate level 9, CRC32 chunks
  (`scripts/generate-og.mjs:242-301`).

### Font table (`FONT5`, `scripts/generate-og.mjs:79-155`)

- 5 columns × 7 rows per glyph, column-major bitmask (bit `r` = row `r`,
  row 0 at the top); a `scale` multiplier is applied per pixel in
  `drawChar` (`:157-171`).
- Covered glyphs: `A-Z`, `a-z`, `0-9`, space, `.` `,` `-` `—` `:` `|`
  `(` `)` `/` `&` `'` `·`. Everything else falls back to a blank space
  (`FONT5[ch] || FONT5[' ']`).
- Lowercase letters occupy rows 2-6 (a 5-row x-height), so rows 0-1 are
  free: accented lowercase glyphs fit without shifting the base letter.
- `drawText` advances a fixed `6 × scale` per character (no kerning or
  proportional widths); `textWidth` matches.

### Layout and copy

- Name scale 4 at (60, 180); role scale 3 at (60, 260); tagline scale 2 at
  (60, 330); divider; domain scale 3 at (60, 420); location scale 2 at
  (60, 490). Decorative dots start at x = W-80.
- Practical limits: role ≈ 60 chars at scale 3 (18 px/char); tagline
  ≈ 90 chars at scale 2 (12 px/char).
- Copy was hardcoded in EN only (`:212-222`): role
  `Python Automation Consultant`, tagline `ETL · Scraping · APIs · Automation`,
  location `Santiago, Chile  ·  EN / ES`.

### Effort to add the Spanish glyphs

- The renderer needs **no change**: adding bitmaps to `FONT5` is enough.
- Required new glyphs: `á é í ó ú ñ ü ¿ ¡` (`·` already exists). The acute
  and diaeresis use rows 0-1 above the existing letter shapes; `ñ` gets a
  two-row tilde; `¿` and `¡` are hand-drawn inverted forms (the base font
  has no `?`/`!`).
- No rasterizer dependency is needed, so the STOP condition ("glyph table
  cannot be extended without redesigning the renderer") does not apply.

## Prototype notes (Step 2)

- `scripts/generate-og.mjs` now accepts `--lang=en|es` (default `en`) and
  selects copy from a single per-locale table; output paths are
  `og-card.png` (en) and `og-card-es.png` (es).
- Prototype copy uses the site's canonical positioning
  (`src/data/jsonld.ts` `jobTitle`), shortened to fit the card:
  - EN role: `Operational Systems & Python Automation Consultant`;
    tagline: `Automation · Data · Tools · Finance · Web · Hygiene`.
  - ES role: `Consultor de Sistemas Operacionales y Automatización Python`;
    tagline: `Automatización · Datos · Herramientas · Finanzas · Web · Higiene`.
  - Location: `Santiago, Chile  ·  EN / ES` / `… · ES / EN`.
- Both PNGs generated and visually inspected in the worktree: accents
  render, no overflow; the ES role line is the longest string on either
  card (59 chars ≈ 1062 px at scale 3, inside the 1140 px budget but the
  tightest line — see open question 1).
- The production card (`og-card.png`) and `BaseLayout` remain untouched
  until the maintainer answers the checkpoint.

## Open questions (checkpoint)

1. **Role line** — is the canonical
   `Operational Systems & Python Automation Consultant` /
   `Consultor de Sistemas Operacionales y Automatización Python` the right
   positioning for both locales, or should it be shorter (the ES line is
   the longest text on the card)?
2. **ES card** — same layout with Spanish text (current prototype), or a
   distinct ES tagline/emphasis for the guide-driven audience?
3. **Per-locale asset** — worth shipping a second PNG (`og-card-es.png`,
   ~2× committed asset) or keep one bilingual card for both locales?

## Decision

**Approved 2026-09-28 by the maintainer (in session):**

1. Role line: keep the canonical positioning in both locales.
2. ES card: same layout, translated copy (current prototype).
3. Per-locale asset: ship `og-card-es.png` and select it per locale.

Plan 061 Step 4 applied: `BaseLayout` selects the card per locale;
`tests/run.js` guards both files (PNG signature + size) and the built output;
`docs/tasks/maintenance-checklist.md` documents `--lang=es`.
