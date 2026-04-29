# Tooltician Portfolio — Implementation To-Do

Status: [ ] = todo  [x] = done  [~] = partial / needs review

---

## GROUP A — Visual / Animation

- [x] A1 · Remove `spin-ring` animation from `.hero__photo-ring` in HeroSection.astro
- [x] A1 · Remove `@keyframes spin-ring` block from HeroSection.astro
- [x] A1 · Set `.hero__photo-ring` to static conic-gradient border, opacity 0.55
- [x] A2 · Remove `animation:` from `.hero__orb--1` in HeroSection.astro
- [x] A2 · Remove `animation-delay:` from `.hero__orb--2` in HeroSection.astro
- [x] A2 · Remove `@keyframes hero-float` block from HeroSection.astro
- [x] A2 · Reduce orb opacity from 0.35 to 0.18
- [x] A3 · Replace 🔄 in ServicesSection with inline SVG
- [x] A3 · Replace 🕷️ in ServicesSection with inline SVG
- [x] A3 · Replace 🔌 in ServicesSection with inline SVG
- [x] A3 · Replace 🌐 in ServicesSection with inline SVG
- [x] A3 · Replace 🏦 in ServicesSection with inline SVG
- [x] A3 · Replace 📊 in ServicesSection with inline SVG
- [x] A3 · Add `.svc-icon svg` CSS rule for accent color
- [x] A4 · Replace 👥 in AboutSection with inline SVG
- [x] A4 · Replace 📦 in AboutSection with inline SVG
- [x] A4 · Replace ⚙️ in AboutSection with inline SVG
- [x] A4 · Add `.about-icon svg` CSS rule for accent color

---

## GROUP B — Hero Section

- [x] B1 · Update EN hero eyebrow from 'Tooltician' to new value
- [x] B1 · Update ES hero eyebrow from 'Tooltician' to new value
- [x] B2 · Remove `display: none` from `.hero__aside` in mobile media query
- [x] B2 · Add mobile photo sizing (200px) to HeroSection styles
- [x] B2 · Add mobile layout: flex-column, photo first
- [x] B2 · Hide third hero card on ≤ 640px
- [x] B3 · Update EN hero lede to "scoped, documented, and designed to keep running after I hand them off"
- [x] B3 · Update ES hero lede accordingly
- [x] B3 · Confirm old "keep working after I leave" text is gone

---

## GROUP C — Section Order

- [x] C1 · Move PortfolioSection above ServicesSection in src/pages/en/index.astro
- [x] C1 · Move PortfolioSection above ServicesSection in src/pages/es/index.astro

---

## GROUP D — Portfolio Section

- [x] D1 · Delete `crypto` / Real-Time Market Monitor from projectsEN
- [x] D1 · Delete `crypto` / Real-Time Market Monitor from projectsES
- [x] D2 · Remove `isNew: true` from ebano in projectsEN
- [x] D2 · Remove `isNew: true` from ebano in projectsES
- [x] D3 · Delete `pdf` / PDF Text Analyzer from projectsEN
- [x] D3 · Delete `pdf` / PDF Text Analyzer from projectsES
- [x] D4 · Reorder projectsEN: ebano → monedario → rutificador → conciliador → noticiencias → dnspect → polla
- [x] D4 · Reorder projectsES: same order
- [x] D5 · Fix Noticiencias EN impact line (remove 580M+)
- [x] D5 · Fix Noticiencias ES impact line (remove 580M+)
- [x] D6 · Rewrite EN El Rincón de Ébano description
- [x] D6 · Rewrite ES El Rincón de Ébano description
- [x] D7 · Rewrite EN Conciliador Bancario description
- [x] D7 · Rewrite ES Conciliador Bancario description
- [x] D8 · Rewrite EN Monedario description
- [x] D8 · Rewrite ES Monedario description
- [x] D9 · Update EN portfolio section subtitle
- [x] D9 · Update ES portfolio section subtitle
- [x] D10 · Update EN portfolio section title to 'Work in Production'
- [x] D10 · Update ES portfolio section title to 'Trabajo en Producción'

---

## GROUP E — Services Section

- [x] E1 · Update EN title: 'What I Build' → 'How I Can Help'
- [x] E1 · Update ES title: 'Qué Construyo' → 'Cómo Puedo Ayudar'
- [x] E2 · Update EN services subtitle
- [x] E2 · Update ES services subtitle

---

## GROUP F — About Section

- [x] F1 · Update EN about title
- [x] F1 · Update ES about title
- [x] F2 · Rewrite EN about intro (starts with "Operations teams")
- [x] F2 · Rewrite ES about intro

---

## GROUP G — Credentials Section

- [x] G1 · Update EN credentials title: 'How I Work' → 'Process & Background'
- [x] G1 · Update ES credentials title

---

## GROUP H — Social Proof

- [x] H1 · Add testimonial placeholder card to ProofSection (EN)
- [x] H1 · Add testimonial placeholder card to ProofSection (ES)
- [x] H1 · Add testimonial-placeholder CSS to ProofSection

---

## GROUP I — SEO & Meta

- [x] I1 · Add @astrojs/sitemap import to astro.config.mjs
- [x] I1 · Add sitemap() to integrations array in astro.config.mjs
- [x] I2 · Update EN page title tag
- [x] I2 · Update ES page title tag
- [x] I3 · Update EN meta description
- [x] I3 · Update ES meta description
- [x] I4 · Update src/pages/index.astro with meta-refresh + improved meta
- [x] I5 · Update root index.html email references to branded email
- [x] I5 · Update root index.html OG image to og-card.png
- [x] I6 · Create scripts/generate-og.mjs
- [x] I6 · Run node scripts/generate-og.mjs to generate public/assets/images/og-card.png
- [x] I7 · Confirm BaseLayout.astro references og-card.png (already correct, verify)
- [x] I8 · Extend JSON-LD in en/index.astro with makesOffer + itemListElement
- [x] I8 · Mirror JSON-LD in es/index.astro

---

## GROUP J — Email / Contact

- [x] J1 · Replace carlosortega77@gmail.com in HeroSection.astro
- [x] J1 · Replace carlosortega77@gmail.com in ContactSection.astro (emailHref)
- [x] J1 · Replace carlosortega77@gmail.com in ContactSection.astro (emailCopy)
- [x] J1 · Replace carlosortega77@gmail.com in ContactSection.astro (errorMsg EN)
- [x] J1 · Replace carlosortega77@gmail.com in ContactSection.astro (errorMsg ES)
- [x] J1 · Replace carlosortega77@gmail.com in Footer.astro
- [x] J1 · Replace carlosortega77@gmail.com in index.html (root)

---

## GROUP K — Hero CTAs

- [x] K1 · Add 'Schedule a call' CTA to hero actions EN
- [x] K1 · Add 'Agendar llamada' CTA to hero actions ES
- [x] K1 · Add Calendly link to hero CTA in HeroSection.astro

---

## GROUP L — Root Landing Page

- [x] L1 · Update root index.html title
- [x] L1 · Update root index.html meta description

---

## Verification Steps

- [x] Run `node tests/run.js` — all source checks pass (80/80)
- [x] Run `npm run build` — zero errors
- [x] Run `node tests/run.js --built` — all built-output checks pass (90/90)
- [x] Manual check: hero CTA visibility and no overflow validated at `360`, `390`, `414`, and `768`
- [x] Manual check: mobile nav overlay, scroll lock, and `Escape` close verified in Playwright
- [x] Manual check: keyboard focus ring visible on hero CTA and mobile nav link
- [x] Manual check: Wave 2 screenshots captured under `output/playwright/`

---

## WAVE 2 — Mobile Navigation and Hero Credibility

- [x] TT-006 · Remove the portrait-led hero aside and replace it with a more professional credibility panel
- [x] TT-007 · Simplify the hero support content so it feels less templated and easier to scan
- [x] TT-008 · Add mobile nav backdrop, scroll lock, escape close, and controlled overlay behavior
- [x] TT-014 · Add shared `:focus-visible` styles for key interactive elements
- [x] Tests · Extend `tests/run.js` for Wave 2 behavior checks
- [x] Verify · Run `node tests/run.js`
- [x] Verify · Run `npm run build`
- [x] Verify · Run `node tests/run.js --built`
- [x] Verify · Review `360`, `390/414`, and `768` breakpoints with the mobile nav open and closed

---

## WAVE 3 — Portfolio, Proof, and Contact Clarity

- [x] TT-004 · Replace visual-only portfolio filtering with layout-safe filtering
- [x] TT-004 · Allow projects to appear in multiple relevant filter categories
- [x] TT-015 · Rewrite EN portfolio cards around summary, problem, build scope, and proof
- [x] TT-015 · Rewrite ES portfolio cards around summary, problem, build scope, and proof
- [x] TT-016 · Promote anchor projects with stronger placement in the desktop portfolio grid
- [x] TT-009 · Replace badge-like proof links with explicit external-link actions
- [x] TT-009 · Replace generic portfolio link labels (`Repo`, `Docs`) with explicit action labels
- [x] TT-018 · Make email the primary contact path and keep copy as a secondary action
- [x] TT-018 · Add proper form labels and localized submit-pending text
- [x] Tests · Extend `tests/run.js` for Wave 3 behavior checks
- [x] Verify · Run `node tests/run.js`
- [x] Verify · Run `npm run build`
- [x] Verify · Run `node tests/run.js --built`
- [x] Verify · Review `360`, `390/414`, `768`, and `1366` breakpoints for portfolio filtering and contact clarity
