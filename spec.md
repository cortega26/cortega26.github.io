# Tooltician Portfolio — Implementation Spec

## Purpose
Implement all improvements identified in the portfolio audit to make tooltician.com look substantially more professional, credible, and high-value. Every change must be verifiable by automated test.

## Guiding Constraints
- Do not change meaning or factual claims in copy without explicit instruction.
- Email address change (`carlosortega77@gmail.com` → `carlos@tooltician.com`) is a **code change only**; the actual mail routing requires the user to configure Google Workspace separately.
- No new npm runtime dependencies. Dev dependencies are fine.
- The site must pass `astro build` after every batch of changes.
- All changes must be bilingual (EN + ES) unless a change is purely structural/CSS.
- Tests run against source files by default; pass `--built` to also check `dist/`.

## Current Phase
Wave 3 — Portfolio, Proof, and Contact Clarity (`completed 2026-04-29`; next up: `Wave 4`)

### Goals
- Make portfolio filtering behave like a real layout change instead of a visual hide/show trick.
- Rewrite project cards so a visitor can scan problem, build scope, and proof quickly.
- Emphasize the strongest anchor projects first without forcing a full redesign of the section.
- Make small external links read like actions, not decorative labels.
- Align contact labels and calls to action with what each control actually does in both languages.

### Implementation Notes
- `src/components/PortfolioSection.astro`
  - Replace the single-paragraph project body with a tighter structure: summary plus `Problem / Built / Proof`.
  - Store explicit filter categories per project so one project can participate in multiple filters where appropriate.
  - Use `hidden`-based filtering so non-matching cards leave the grid entirely.
  - Promote anchor projects with stronger placement in the desktop grid while preserving a single-column mobile layout.
- `src/components/ProofSection.astro`
  - Replace badge-like proof links with clearer text links plus an external-link affordance.
- `src/components/ContactSection.astro`
  - Make email the clear primary path.
  - Keep copy-to-clipboard as a secondary action with accurate labeling.
  - Add proper form labels, localized sending state, and clearer explanatory copy.

### Verification
- Automated:
  - `node tests/run.js`
  - `npm run build`
  - `node tests/run.js --built`
- Manual breakpoint review:
  - `360x800`
  - `390x844`
  - `414x896`
  - `768x1024`
  - `1366x900`
- Manual interaction checks:
  - Portfolio filters remove non-matching cards from layout with no empty slots.
  - Anchor projects remain first and visually prominent on desktop while collapsing cleanly on mobile.
  - Proof and portfolio external links read clearly as actions.
  - Contact actions match their behavior: email opens email, copy copies, schedule opens Calendly.

---

## Change Catalogue

Each entry format: **ID · File(s) · What changes · Verification**

---

### GROUP A — Visual / Animation

**A1 · Remove spinning ring on profile photo**
- File: `src/components/HeroSection.astro`
- Remove `animation: spin-ring 8s linear infinite` from `.hero__photo-ring`
- Replace with static thin gradient border (same `conic-gradient`, no animation, `opacity: 0.55`)
- Also remove the `@keyframes spin-ring` block
- Verify: source file must not contain the string `spin-ring` in a CSS `animation:` property

**A2 · Remove floating orb animations**
- File: `src/components/HeroSection.astro`
- Remove the `animation:` property from both `.hero__orb--1` and `.hero__orb--2` rules
- Remove the `@keyframes hero-float` block entirely
- Keep the orbs as static radial-gradient blurs; reduce opacity from 0.35 to 0.18 for more sober appearance
- Verify: source file must not contain `hero-float`; orb opacity must be ≤ 0.2

**A3 · Replace emoji icons in ServicesSection with SVG**
- File: `src/components/ServicesSection.astro`
- Replace the six emoji icon strings (🔄 🕷️ 🔌 🌐 🏦 📊) with inline SVG elements
- SVG dimensions: `width="24" height="24"`, `viewBox="0 0 24 24"`, `fill="none"`, `stroke="currentColor"`, `stroke-width="1.75"`, `aria-hidden="true"`
- Use Lucide-compatible path data for each semantic meaning:
  - ETL/Automation: `<path d="M21 12a9 9 0 0 1-9 9m9-9a9 9 0 0 0-9-9m9 9H3m9 9a9 9 0 0 1-9-9m9 9c1.66 0 3-4.03 3-9s-1.34-9-3-9m0 18c-1.66 0-3-4.03-3-9s1.34-9 3-9m-9 9a9 9 0 0 1 9-9"/>` (arrows/loop)
  - Scraping: `<circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>` (search)
  - APIs: `<path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/>` (bars)
  - Static Sites: `<circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>` (globe)
  - Financial: `<rect width="20" height="14" x="2" y="5" rx="2"/><path d="M2 10h20"/>` (card)
  - Reporting: `<path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/>` (chart)
- Add `.svc-icon svg { color: var(--clr-accent); }` to section styles
- Verify: source file must not contain any of the six emoji characters

**A4 · Replace emoji icons in AboutSection with SVG**
- File: `src/components/AboutSection.astro`
- Replace 👥 📦 ⚙️ with inline SVGs (same spec as A3)
  - Who I help (👥): `<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>` (users)
  - What clients get (📦): `<path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>` (package)
  - Preferred stack (⚙️): `<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>` (settings)
- Verify: source file must not contain 👥 📦 ⚙️

---

### GROUP B — Hero Section

**B1 · Fix hero eyebrow text**
- File: `src/components/HeroSection.astro`
- EN: Change `eyebrow: 'Tooltician'` → `eyebrow: 'Freelance Consultant · LATAM & US'`
- ES: Change `eyebrow: 'Tooltician'` → `eyebrow: 'Consultor Independiente · LATAM y EE.UU.'`
- Verify: eyebrow values in source must not equal the string `'Tooltician'`

**B2 · Fix mobile hero layout (photo + cards visible on mobile)**
- File: `src/components/HeroSection.astro`
- Remove `display: none` from `.hero__aside` in the `@media (max-width: 900px)` block
- Restructure mobile layout:
  - Hero becomes single column with: photo → copy → cards
  - `.hero__figure`: reduce to 200px × 200px on mobile
  - `.hero__cards`: stack below CTA buttons on mobile, max 2 cards (hide 3rd card on ≤ 640px)
  - `.hero__layout` on mobile: flex-direction column, photo first
- Verify: `@media` block in source must not contain `hero__aside.*display.*none`

**B3 · Update hero lede (minor improvement)**
- File: `src/components/HeroSection.astro`
- EN: Add "scoped," before "documented" in lede: "...Python automation systems: scoped, documented, and designed to keep running after I hand them off."
- ES: Update accordingly: "...sistemas de automatización Python: acotados, documentados y diseñados para seguir funcionando cuando los traspaso."
- Remove trailing "I build Python automation systems:" sentence fragment (the sentence now reads cleanly)
- Verify: EN lede contains "scoped" and "hand them off"; old lede text "keep working after I leave" is gone

---

### GROUP C — Section Order

**C1 · Reorder page sections: Portfolio before Services**
- Files: `src/pages/en/index.astro`, `src/pages/es/index.astro`
- New order: HeroSection → PortfolioSection → ServicesSection → AboutSection → ProofSection → CredentialsSection → ContactSection
- Verify: In both page files, the line importing/using PortfolioSection must appear before ServicesSection

---

### GROUP D — Portfolio Section

**D1 · Remove Real-Time Market Monitor**
- File: `src/components/PortfolioSection.astro`
- Delete the entire `crypto` project object from both `projectsEN` and `projectsES` arrays
- Verify: source must not contain `crypto-price-tracker`

**D2 · Remove "New" badge from El Rincón de Ébano**
- File: `src/components/PortfolioSection.astro`
- Delete `isNew: true` from the `ebano` project in both EN and ES arrays
- Verify: ebano object must not contain `isNew`

**D3 · Remove PDF Text Analyzer**
- File: `src/components/PortfolioSection.astro`
- Delete the entire `pdf` project object from both EN and ES arrays (reducing to 7 projects)
- Verify: source must not contain `PDF-Text-Analyzer`

**D4 · Reorder portfolio projects**
- File: `src/components/PortfolioSection.astro`
- New order for both EN and ES: ebano → monedario → rutificador → conciliador → noticiencias → dnspect → polla
- Verify: in the projectsEN array, `ebano` appears before `monedario`, `monedario` before `rutificador`, `rutificador` before `conciliador`

**D5 · Fix Noticiencias impact line**
- File: `src/components/PortfolioSection.astro`
- EN: Change impact from `'Live at noticiencias.com · Science media for 580M+ Spanish speakers'` to `'Live at noticiencias.com · Spanish-language science media, 8 disciplines'`
- ES: Change from `'Activo en noticiencias.com · Ciencia en español para 580M+ lectores'` to `'Activo en noticiencias.com · Divulgación científica en español, 8 disciplinas'`
- Verify: source must not contain `580M`

**D6 · Rewrite El Rincón de Ébano description**
- File: `src/components/PortfolioSection.astro`
- EN desc: `'E-commerce storefront for a private residential community — designed, built, and actively operated as a live business. 100+ SKUs, real-time cart, bundle promotions, product filtering, and WhatsApp-integrated checkout. This is not a demo: it runs daily transactions and I maintain it.'`
- ES desc: `'Tienda e-commerce para una comunidad residencial privada — diseñada, desarrollada y operada activamente como un negocio real. Más de 100 SKUs, carrito en tiempo real, promociones por combo, filtrado de productos y checkout integrado con WhatsApp. Esto no es una demo: procesa transacciones diarias y lo mantengo.'`
- Verify: EN desc contains "This is not a demo"

**D7 · Rewrite Conciliador Bancario description**
- File: `src/components/PortfolioSection.astro`
- EN desc: `'Bank reconciliation tool built for audit-grade environments — not just accounting convenience. Fail-closed by design: if the data does not reconcile, the tool halts and reports why, rather than silently producing a wrong result. Append-only audit logs, deterministic outputs, and a traceable record of every run. Distributed via PyPI for reproducible installation.'`
- ES desc: `'Herramienta de conciliación bancaria construida para entornos de auditoría — no solo comodidad contable. Diseñada fail-closed: si los datos no coinciden, el sistema se detiene e informa el motivo, en lugar de producir silenciosamente un resultado incorrecto. Logs de auditoría append-only, salidas deterministas y registro trazable de cada ejecución. Distribuido vía PyPI.'`
- Verify: EN desc contains "silently producing a wrong result"

**D8 · Rewrite Monedario description**
- File: `src/components/PortfolioSection.astro`
- EN desc: `'Personal finance platform for Chilean users — built, launched, and maintained as a live product without advertising or paywalls. Nine guide categories, interactive calculators, and real-time economic indicators (UF, UTM, exchange rates). Updated 2026. This exists because the information should be free and in plain language.'`
- ES desc: `'Plataforma de finanzas personales para usuarios chilenos — construida, lanzada y mantenida como producto activo sin publicidad ni paywalls. Nueve categorías de guías, calculadoras interactivas e indicadores económicos en tiempo real (UF, UTM, tipo de cambio). Actualizado 2026. Existe porque esta información debería ser gratuita y en lenguaje claro.'`
- Verify: EN desc contains "without advertising or paywalls"

**D9 · Update portfolio section subtitle**
- File: `src/components/PortfolioSection.astro`
- EN: Change subtitle from `'Nine public projects...'` to `'Live sites with real users, published packages with CI and CodeQL, and automation that runs in production — not just repositories that demonstrate effort.'`
- ES: `'Sitios activos con usuarios reales, paquetes publicados con CI y CodeQL, y automatización que corre en producción — no solo repositorios que demuestran esfuerzo.'`
- Verify: EN subtitle contains "not just repositories"

**D10 · Update portfolio section title**
- File: `src/components/PortfolioSection.astro`
- EN: Change `title` from `'Selected Work'` to `'Work in Production'`
- ES: Change from `'Trabajo Seleccionado'` to `'Trabajo en Producción'`
- Verify: title values match new strings

---

### GROUP E — Services Section

**E1 · Rename Services section title**
- File: `src/components/ServicesSection.astro`
- EN: Change `title: 'What I Build'` → `title: 'How I Can Help'`
- ES: Change `title: 'Qué Construyo'` → `title: 'Cómo Puedo Ayudar'`
- Verify: title values match new strings

**E2 · Update Services section subtitle**
- File: `src/components/ServicesSection.astro`
- EN: Change to `'The recurring problem I solve: brittle manual work that should be automated, documented, and handed off.'`
- ES: `'El problema recurrente que resuelvo: trabajo manual frágil que debería estar automatizado, documentado y traspasado.'`
- Verify: EN subtitle contains "recurring problem"

---

### GROUP F — About Section

**F1 · Rename About section title**
- File: `src/components/AboutSection.astro`
- EN: Change `title: 'Who I Work With & How'` → `title: 'Who I Help and What They Get'`
- ES: Change `title: 'Con quién trabajo y cómo'` → `title: 'A quién ayudo y qué obtienen'`
- Verify: title values match new strings

**F2 · Rewrite About section intro**
- File: `src/components/AboutSection.astro`
- EN: `'Operations teams accumulate the same category of pain: data that arrives late, reports that break unpredictably, and workflows nobody truly owns. I solve that — starting with the workflow, then packaging the result so it is testable, documented, and easier to keep running.'`
- ES: `'Los equipos operativos acumulan la misma categoría de problemas: datos que llegan tarde, reportes que se rompen impredeciblemente y flujos que nadie realmente posee. Eso es lo que resuelvo — empezando por el flujo, luego empaquetando el resultado para que sea testeable, documentado y más fácil de mantener.'`
- Verify: EN intro starts with "Operations teams"

---

### GROUP G — Credentials Section

**G1 · Rename Credentials section H2**
- File: `src/components/CredentialsSection.astro`
- EN: Change `title: 'How I Work'` → `title: 'Process & Background'`
- ES: Change `title: 'Cómo trabajo'` → `title: 'Proceso y formación'`
- Verify: title values match new strings

---

### GROUP H — Social Proof (Testimonial Placeholder)

**H1 · Add testimonial placeholder to ProofSection**
- File: `src/components/ProofSection.astro`
- Add a new `<div class="testimonial-placeholder">` block between the timeline and the proof-grid
- Content EN: A styled card with a quote icon, placeholder text `"Currently gathering client testimonials — the work speaks in the meantime."` in italic, and a subtle border
- Content ES: `"Recopilando testimonios de clientes — mientras tanto, el trabajo habla por sí solo."`
- Style: Same `card-glass` base, softer border (`var(--clr-border)`), italic text, centered quote mark in accent color
- Verify: ProofSection source contains `testimonial`

---

### GROUP I — SEO & Meta

**I1 · Add sitemap integration to Astro config**
- File: `astro.config.mjs`
- Import and register `@astrojs/sitemap` integration
- Verify: `astro.config.mjs` contains `sitemap`

**I2 · Update <title> tag format**
- File: `src/pages/en/index.astro`
- Change title to: `'Carlos Ortega — Python Automation Consultant | Tooltician'`
- File: `src/pages/es/index.astro`
- Change title to: `'Carlos Ortega — Consultor de Automatización Python | Tooltician'`
- Verify: title strings contain "Tooltician" at the end and use em dash format

**I3 · Update meta description**
- File: `src/pages/en/index.astro`
- Change description to: `'Bilingual Python automation consultant (EN/ES) based in Santiago, Chile. ETL pipelines, scraping workflows, internal APIs, and reporting automation — scoped delivery with CI, documentation, and handoff-ready systems.'`
- File: `src/pages/es/index.astro`
- Change description to: `'Consultor de automatización Python bilingüe (ES/EN) en Santiago de Chile. Pipelines ETL, flujos de scraping, APIs internas y automatización de reportes — entrega acotada con CI, documentación y sistemas listos para traspaso.'`
- Verify: EN description contains "Bilingual" and "handoff-ready"

**I4 · Fix root redirect page (src/pages/index.astro)**
- File: `src/pages/index.astro`
- Add proper `<meta http-equiv="refresh" content="0;url=/en/">` as primary redirect (not just in noscript)
- Update title to: `'Tooltician | Carlos Ortega — Python Automation Consultant'`
- Update meta description to match the EN one
- Add OG tags pointing to `og-card.png`
- Add the JSON-LD Person schema
- Verify: source contains `http-equiv="refresh"`

**I5 · Fix root landing page email and OG image**
- File: `index.html` (root static landing page)
- Update `mailto:carlosortega77@gmail.com` → `mailto:carlos@tooltician.com`
- Update OG image from `profile-photo.png` → `assets/images/og-card.png`
- Verify: `index.html` must not contain `carlosortega77@gmail.com`

**I6 · Create OG card image**
- New file: `scripts/generate-og.mjs`
- Run with `node scripts/generate-og.mjs` to generate `public/assets/images/og-card.png`
- Dimensions: 1200 × 630 px
- Design: dark background (#070d1a), left-side accent bar in purple-to-teal gradient, white text "Carlos Ortega" (large), "Python Automation Consultant" (medium), "tooltician.com" (small, accent color)
- Uses only Node.js built-ins (`zlib`, `fs`) — no npm packages required
- Verify: `public/assets/images/og-card.png` exists and has file size > 1000 bytes

**I7 · Update OG image reference in BaseLayout**
- File: `src/layouts/BaseLayout.astro`
- Confirm default `ogImage` points to `/assets/images/og-card.png` (already correct, but ensure it matches what we generate)
- Verify: source contains `og-card.png`

**I8 · Add structured data for projects in JSON-LD**
- File: `src/pages/en/index.astro`
- Extend `jsonLd` to include `makesOffer` array listing each of the 6 services as `Offer` objects with `name` and `description`
- Add `itemListElement` for top 5 projects as `ListItem` → `SoftwareApplication` / `CreativeWork`
- File: `src/pages/es/index.astro`
- Mirror the same structure in Spanish
- Verify: EN page source contains `"@type": "SoftwareApplication"` or `"itemListElement"`

---

### GROUP J — Email / Contact

**J1 · Replace gmail address throughout codebase**
- Files: ALL components that reference `carlosortega77@gmail.com`
  - `src/components/HeroSection.astro` (CTA href)
  - `src/components/ContactSection.astro` (emailHref, emailCopy, errorMsg)
  - `src/components/Footer.astro` (email icon link)
  - `index.html` (covered by I5)
- Replace all instances with `carlos@tooltician.com`
- Update `mailto:` hrefs and displayed text accordingly
- Update Formspree error fallback message
- Verify: No source file in `src/` or root `index.html` contains `carlosortega77@gmail.com`
- NOTE FOR USER: You must configure `carlos@tooltician.com` as a receiving address in Google Workspace or another mail service. The code change alone is insufficient.

---

### GROUP K — Navbar

**K1 · Add Calendly as hero-level CTA option**
- File: `src/components/HeroSection.astro`
- Add a fourth CTA button in the hero actions: `'Schedule a call'` → `https://calendly.com/ciortega26`
- EN label: `'Schedule a call'`
- ES label: `'Agendar llamada'`
- Style: `btn btn-ghost` (consistent with GitHub CTA)
- Verify: HeroSection source contains `calendly.com` and `Schedule a call`

---

### GROUP L — Root Landing Page

**L1 · Update root index.html meta/copy**
- File: `index.html`
- Update all mailto links from gmail to branded email (covered by J1/I5)
- Update title to: `'Tooltician — Python Automation Consultant | Carlos Ortega'`
- Update meta description to lead with bilingual differentiator
- The language selector page itself is served from root when JS is disabled; it should look good
- Verify: title contains "Tooltician" and new description text

---

## Out of Scope (Requires External Action)

These improvements are noted in spec but cannot be implemented by code changes to this repo:

- Configuring `carlos@tooltician.com` mail routing (Google Workspace / Zoho / Fastmail setup)
- Adding reciprocal backlinks FROM elrincondeebano.com, monedario.cl, noticiencias.com TO tooltician.com (requires access to those repos)
- Removing "Beta v0.9" banner from noticiencias.com (separate repo)
- Adding real client testimonials
- Paid Google Workspace subscription for branded email

---

## Verification Protocol

Run `node tests/run.js` from the repo root after completing each GROUP.
Run `node tests/run.js --built` after `npm run build` to verify the final output.

A test suite of ≥ 35 checks covers all groups above. All checks must pass before the implementation is considered complete.

After every ~20 file changes, spawn a fresh review sub-agent with:
> "Review spec.md and the current implementation state of the Tooltician portfolio for gaps between what the spec requires and what the source files actually contain."
