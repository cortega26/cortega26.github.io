# Tooltician Portfolio — Implementation To-Do

Status: [ ] = todo  [x] = done  [~] = partial / needs review

---

## GROUP A — Visual / Animation

- [ ] A1 · Remove `spin-ring` animation from `.hero__photo-ring` in HeroSection.astro
- [ ] A1 · Remove `@keyframes spin-ring` block from HeroSection.astro
- [ ] A1 · Set `.hero__photo-ring` to static conic-gradient border, opacity 0.55
- [ ] A2 · Remove `animation:` from `.hero__orb--1` in HeroSection.astro
- [ ] A2 · Remove `animation-delay:` from `.hero__orb--2` in HeroSection.astro
- [ ] A2 · Remove `@keyframes hero-float` block from HeroSection.astro
- [ ] A2 · Reduce orb opacity from 0.35 to 0.18
- [ ] A3 · Replace 🔄 in ServicesSection with inline SVG
- [ ] A3 · Replace 🕷️ in ServicesSection with inline SVG
- [ ] A3 · Replace 🔌 in ServicesSection with inline SVG
- [ ] A3 · Replace 🌐 in ServicesSection with inline SVG
- [ ] A3 · Replace 🏦 in ServicesSection with inline SVG
- [ ] A3 · Replace 📊 in ServicesSection with inline SVG
- [ ] A3 · Add `.svc-icon svg` CSS rule for accent color
- [ ] A4 · Replace 👥 in AboutSection with inline SVG
- [ ] A4 · Replace 📦 in AboutSection with inline SVG
- [ ] A4 · Replace ⚙️ in AboutSection with inline SVG
- [ ] A4 · Add `.about-icon svg` CSS rule for accent color

---

## GROUP B — Hero Section

- [ ] B1 · Update EN hero eyebrow from 'Tooltician' to new value
- [ ] B1 · Update ES hero eyebrow from 'Tooltician' to new value
- [ ] B2 · Remove `display: none` from `.hero__aside` in mobile media query
- [ ] B2 · Add mobile photo sizing (200px) to HeroSection styles
- [ ] B2 · Add mobile layout: flex-column, photo first
- [ ] B2 · Hide third hero card on ≤ 640px
- [ ] B3 · Update EN hero lede to "scoped, documented, and designed to keep running after I hand them off"
- [ ] B3 · Update ES hero lede accordingly
- [ ] B3 · Confirm old "keep working after I leave" text is gone

---

## GROUP C — Section Order

- [ ] C1 · Move PortfolioSection above ServicesSection in src/pages/en/index.astro
- [ ] C1 · Move PortfolioSection above ServicesSection in src/pages/es/index.astro

---

## GROUP D — Portfolio Section

- [ ] D1 · Delete `crypto` / Real-Time Market Monitor from projectsEN
- [ ] D1 · Delete `crypto` / Real-Time Market Monitor from projectsES
- [ ] D2 · Remove `isNew: true` from ebano in projectsEN
- [ ] D2 · Remove `isNew: true` from ebano in projectsES
- [ ] D3 · Delete `pdf` / PDF Text Analyzer from projectsEN
- [ ] D3 · Delete `pdf` / PDF Text Analyzer from projectsES
- [ ] D4 · Reorder projectsEN: ebano → monedario → rutificador → conciliador → noticiencias → dnspect → polla
- [ ] D4 · Reorder projectsES: same order
- [ ] D5 · Fix Noticiencias EN impact line (remove 580M+)
- [ ] D5 · Fix Noticiencias ES impact line (remove 580M+)
- [ ] D6 · Rewrite EN El Rincón de Ébano description
- [ ] D6 · Rewrite ES El Rincón de Ébano description
- [ ] D7 · Rewrite EN Conciliador Bancario description
- [ ] D7 · Rewrite ES Conciliador Bancario description
- [ ] D8 · Rewrite EN Monedario description
- [ ] D8 · Rewrite ES Monedario description
- [ ] D9 · Update EN portfolio section subtitle
- [ ] D9 · Update ES portfolio section subtitle
- [ ] D10 · Update EN portfolio section title to 'Work in Production'
- [ ] D10 · Update ES portfolio section title to 'Trabajo en Producción'

---

## GROUP E — Services Section

- [ ] E1 · Update EN title: 'What I Build' → 'How I Can Help'
- [ ] E1 · Update ES title: 'Qué Construyo' → 'Cómo Puedo Ayudar'
- [ ] E2 · Update EN services subtitle
- [ ] E2 · Update ES services subtitle

---

## GROUP F — About Section

- [ ] F1 · Update EN about title
- [ ] F1 · Update ES about title
- [ ] F2 · Rewrite EN about intro (starts with "Operations teams")
- [ ] F2 · Rewrite ES about intro

---

## GROUP G — Credentials Section

- [ ] G1 · Update EN credentials title: 'How I Work' → 'Process & Background'
- [ ] G1 · Update ES credentials title

---

## GROUP H — Social Proof

- [ ] H1 · Add testimonial placeholder card to ProofSection (EN)
- [ ] H1 · Add testimonial placeholder card to ProofSection (ES)
- [ ] H1 · Add testimonial-placeholder CSS to ProofSection

---

## GROUP I — SEO & Meta

- [ ] I1 · Add @astrojs/sitemap import to astro.config.mjs
- [ ] I1 · Add sitemap() to integrations array in astro.config.mjs
- [ ] I2 · Update EN page title tag
- [ ] I2 · Update ES page title tag
- [ ] I3 · Update EN meta description
- [ ] I3 · Update ES meta description
- [ ] I4 · Update src/pages/index.astro with meta-refresh + improved meta
- [ ] I5 · Update root index.html email references to branded email
- [ ] I5 · Update root index.html OG image to og-card.png
- [ ] I6 · Create scripts/generate-og.mjs
- [ ] I6 · Run node scripts/generate-og.mjs to generate public/assets/images/og-card.png
- [ ] I7 · Confirm BaseLayout.astro references og-card.png (already correct, verify)
- [ ] I8 · Extend JSON-LD in en/index.astro with makesOffer + itemListElement
- [ ] I8 · Mirror JSON-LD in es/index.astro

---

## GROUP J — Email / Contact

- [ ] J1 · Replace carlosortega77@gmail.com in HeroSection.astro
- [ ] J1 · Replace carlosortega77@gmail.com in ContactSection.astro (emailHref)
- [ ] J1 · Replace carlosortega77@gmail.com in ContactSection.astro (emailCopy)
- [ ] J1 · Replace carlosortega77@gmail.com in ContactSection.astro (errorMsg EN)
- [ ] J1 · Replace carlosortega77@gmail.com in ContactSection.astro (errorMsg ES)
- [ ] J1 · Replace carlosortega77@gmail.com in Footer.astro
- [ ] J1 · Replace carlosortega77@gmail.com in index.html (root)

---

## GROUP K — Hero CTAs

- [ ] K1 · Add 'Schedule a call' CTA to hero actions EN
- [ ] K1 · Add 'Agendar llamada' CTA to hero actions ES
- [ ] K1 · Add Calendly link to hero CTA in HeroSection.astro

---

## GROUP L — Root Landing Page

- [ ] L1 · Update root index.html title
- [ ] L1 · Update root index.html meta description

---

## Verification Steps

- [ ] Run `node tests/run.js` — all source checks pass
- [ ] Run `npm run build` — zero errors
- [ ] Run `node tests/run.js --built` — all built-output checks pass
- [ ] Manual check: mobile layout looks correct (hero photo visible)
- [ ] Manual check: no spinning ring visible on profile photo
- [ ] Manual check: portfolio section appears before services section
- [ ] Manual check: 7 projects in portfolio grid
- [ ] Manual check: og-card.png exists and has correct content
