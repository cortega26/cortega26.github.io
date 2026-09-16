# Plan 006 — Reporte de Implementación: Plausible → GA4 (G-2HK4GHK7GR) — Rev. Codex P1/P2

**Fecha:** 2026-08-21 (rev. 88f020a → 5f2f72b fixes Codex P1/P2 aplicados)  
**Plan:** `plans/006-plausible-to-ga4-migration.md` (inline bootstrap aprobado, `tt_*`, sin `dataLayer.push`, `cookie_expires: 60*60*24*395`)  
**Estado:** Branch `feat/ga4-migration` actualizado a `5f2f72b`, fixes P1 (deploy.yml vars + validación) y P2 (`cookie_expires` 395d) aplicados, gates pass, HTML verificado. **No se modificó Cloudflare. No se mergeó.** Esperando re-review Codex.

## PR

- **URL:** https://github.com/cortega26/cortega26.github.io/pull/66
- **Branch:** `feat/ga4-migration` → `master`
- **Base:** `bf90ea4` (origin/master)
- **HEAD anterior:** `88f020a5bca667c7bdd4f60d074df327dcc99ebb` (feat GA4 inicial)
- **HEAD actual:** `5f2f72bb99ef23fd8b05bba21bc87d027d8df059` (fix P1/P2 — GA4 vars + cookie_expires 395d, CSP hash 4IyZhVv...)
- **.env:** `PUBLIC_GA4_MEASUREMENT_ID=G-2HK4GHK7GR` (gitignored, local presente; CI usa `vars.PUBLIC_GA4_MEASUREMENT_ID`)

## Issues Codex y fixes

### P1 — GA4 ID en producción (vars + validación)

**Problema Codex:** `deploy.yml` `Build Astro` no recibía `PUBLIC_GA4_MEASUREMENT_ID`; `vars` no se inyectan automático; build desplegaba silenciosamente sin analytics si faltaba.

**Fix aplicado (` .github/workflows/deploy.yml:31-49`):**
```yaml
- name: Validate GA4 Measurement ID (Plan 006)
  run: |
    if [ -z "${{ vars.PUBLIC_GA4_MEASUREMENT_ID }}" ]; then
      echo "::error::PUBLIC_GA4_MEASUREMENT_ID is not set. Set repository variable vars.PUBLIC_GA4_MEASUREMENT_ID to G-2HK4GHK7GR (Settings → Secrets and variables → Actions → Variables → New repository variable). Measurement ID is not secret — use vars, not secrets. Build fails to avoid deploying without analytics."
      exit 1
    fi
    echo "PUBLIC_GA4_MEASUREMENT_ID is set (${{ vars.PUBLIC_GA4_MEASUREMENT_ID }}) — will be injected into build."

- name: Build Astro
  run: npm run build
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
    PUBLIC_GA4_MEASUREMENT_ID: ${{ vars.PUBLIC_GA4_MEASUREMENT_ID }}  # prefs. vars (ID no es secreto), no hardcode fallback
```
- Usa `vars.PUBLIC_GA4_MEASUREMENT_ID` (preferido, ID es público, no secreto). No hardcodea fallback silencioso.
- Validación hace fallar `build` si variable ausente (en vez de desplegar sin GA4).
- Verifica único workflow que construye Tooltician: `.github/workflows/deploy.yml` (no hay otro `*.yml` que haga `astro build`).

### P2 — lifetime de cookies GA4 (14m claim vs gtag default)

**Problema Codex:** Docs afirmaban `14 meses` pero `gtag('config')` no configuraba `cookie_expires` (default GA4 = 2 años = 63072000s), inconsistencia código↔docs.

**Decisión P2 (única política, determinista):**
- GA4 API solo soporta segundos, no meses calendáricos. Evitar precisión calendárica falsa.
- Elegir valor determinista documentado: `60 * 60 * 24 * 395 = 34128000s` (≈395 días ≈13 meses). 395d es valor común GDPR 13m (365+30), cercano a 14m sin sobre-promesa calendárica.
- Si se quiere realmente 14 meses (420d), sería `60*60*24*420 = 36288000`. Decisión: **395d** para alinear con práctica 13m y evitar claim 14m exacto.
- Alternativa (mantener default 2a) descartada: docs dirían 2 años, pero claim previo 14m es más privacy-friendly y ya configuramos explícitamente.

**Fix aplicado:**
- **Código** `src/layouts/BaseLayout.astro:108-114`:
  ```js
  // cookie_expires: 60*60*24*395 = 34128000s = 395 días ≈13 meses (API solo soporta segundos)
  gtag('config', ga4Id, { send_page_view: true, cookie_expires: 60 * 60 * 24 * 395 });
  ```
- **Docs** `src/data/siteDocuments.ts:44,100,157,174`:
  - EN privacy: `Google Analytics 4 (gtag.js, G-2HK4GHK7GR, cookie_expires: 60*60*24*395 = 34128000s ≈395 days) … _ga/_ga_* (395 days, see Cookie Notice)`
  - ES privacy: `cookie_expires: 60*60*24*395 = 34128000s ≈395 días … 395 días`
  - EN cookies: `GA4 (gtag.js, G-2HK4GHK7GR, cookie_expires: 60*60*24*395 = 34128000s ≈395 days) sets cookies _ga/_ga_* (395 days, ~13 months) … API only supports seconds, so months are expressed as deterministic days (395).`
  - ES cookies: `... 395 días (~13 meses) ... La API solo soporta segundos ... (395).`
  - `docs/CHANGELOG.md:7` menciona `cookie_expires: 60*60*24*395` y `395 días`.
- **Plan** `plans/006-plausible-to-ga4-migration.md:5` actualizado con nuevo hash.

## Hash bootstrap inline (recalculado tras P2)

**G-2HK4GHK7GR + cookie_expires 395 — `dist/en/index.html` inline stub (tras `npm run build` con `.env` G-2HK4GHK7GR):**

```html
<script>(function(){const ga4Id = "G-2HK4GHK7GR";

      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      window.gtag = gtag;
      gtag('js', new Date());
      gtag('config', ga4Id, { send_page_view: true, cookie_expires: 60 * 60 * 24 * 395 });
    })();</script>
```

Cálculo CSP (contenido exacto entre `<script>` y `</script>`, UTF-8):
```bash
python3 -c "import hashlib,base64,re,pathlib; html=pathlib.Path('dist/en/index.html').read_text(); scripts=re.findall(r'<script([^>]*)>(.*?)</script>',html,re.DOTALL); print([base64.b64encode(hashlib.sha256(c.encode()).digest()).decode() for a,c in scripts if 'cookie_expires' in c])"
# o:
grep -oP '(?<=<script>).*?cookie_expires.*?(?=</script>)' dist/en/index.html | openssl dgst -sha256 -binary | openssl base64
```

**→ `sha256-4IyZhVv+RWju+1/qJEKCsZqtEjlfkQeg7lwN85qT6Y8=`**

- Hash anterior `sha256-BZJxfeK/xslBDpYiGCWMd7N9XoSnojTl/uxahqkTpwQ=` era sin `cookie_expires`; reemplazado.
- Verificado idéntico en `dist/en/index.html`, `dist/es/index.html`, `dist/en/privacy/index.html`, `dist/en/cookies/index.html`.

## CSP final exacta (Cloudflare Transform Rule) — actualizada con nuevo hash

**Fórmula:** `CSP_chile-hub_actual (live) ∪ GA4 hosts (googletagmanager, google-analytics, region1) ∪ Ahrefs ∪ sha256 bootstrap inline (cookie_expires) \ {plausible.io}`

```
default-src 'self'; base-uri 'self'; form-action 'self' https://formspree.io; frame-ancestors 'none'; object-src 'none'; script-src 'self' 'wasm-unsafe-eval' 'sha256-TmHOajS6t5/QY5KaUTImfqGzR2lm8kRkwsvdwdyyJ2k=' 'sha256-Jg+1a9BpA31iySvZGcqQpUpwXgkkS/6nQZErUKX8Es=' 'sha256-AgdfQ26gNc5sf5Njp+l68xeI3QwSHUs5YBMqXmFAwUo=' 'sha256-R+ThK1ExJbsszqXj3FZbVZ15e9+xFQeukNF1TYuHXp8=' 'sha256-4IyZhVv+RWju+1/qJEKCsZqtEjlfkQeg7lwN85qT6Y8=' https://gc.zgo.at https://www.googletagmanager.com https://www.google-analytics.com https://analytics.ahrefs.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' blob: https://gc.zgo.at https://formspree.io https://extensions.duckdb.org https://www.google-analytics.com https://region1.google-analytics.com https://www.googletagmanager.com https://analytics.ahrefs.com; manifest-src 'self'; media-src 'self'; worker-src 'self' blob:; upgrade-insecure-requests
```

- **Añade:** `https://www.googletagmanager.com` + `https://www.google-analytics.com` (`script-src`), `https://www.google-analytics.com` + `https://region1.google-analytics.com` + `https://www.googletagmanager.com` (`connect-src`), `sha256-4IyZhVv...` (bootstrap con `cookie_expires`).
- **Quita:** `https://plausible.io` (`script-src` + `connect-src`).
- **Preserva:** `chile-hub` — `https://gc.zgo.at`, `https://extensions.duckdb.org`, `https://fonts.googleapis.com`/`https://fonts.gstatic.com`, `'wasm-unsafe-eval'` + 4 hashes, `blob:`.

Ubicación: `docs/cloudflare-security-headers.md:22` (ya actualizado) y `plans/006-plausible-to-ga4-migration.md:5`.

## Diff --stat actualizado (`master..HEAD` tras fixes P1/P2)

```
 .github/workflows/deploy.yml                     | 10 +++  (P1: vars + validación)
 docs/CHANGELOG.md                                |  2 +-   (cookie_expires 395d)
 docs/cloudflare-security-headers.md              |  6 +-   (nuevo hash 4IyZh...)
 plans/006-plausible-to-ga4-migration.md          | 23 +--  (hash + cookie_expires)
 plans/006-ga4-migration-PR-report.md             |  (este archivo, actualizado)
 public/assets/js/track.js                        | 27 +-   (tt_* sin dataLayer.push) — ya en 88f020a
 src/data/siteDocuments.ts                        |  8 +-   (395d, cookie_expires)
 src/layouts/BaseLayout.astro                     |  3 +-   (cookie_expires 395)
 7-8 files changed
```

Detalle `track.js` sin cambios respecto a 88f020a (ya correcto: `tt_location`/`tt_label`/`tt_status`, sin `dataLayer.push`).

`BaseLayout.astro` diff P2:
```diff
-      gtag('config', ga4Id, { send_page_view: true });
+      gtag('config', ga4Id, { send_page_view: true, cookie_expires: 60 * 60 * 24 * 395 });
+      // cookie_expires 60*60*24*395 = 34128000s = 395d ≈13 meses (API solo segundos)
```

`deploy.yml` diff P1:
```diff
+      - name: Validate GA4 Measurement ID (Plan 006)
+        run: if [ -z "${{ vars.PUBLIC_GA4_MEASUREMENT_ID }}" ]; then echo "::error::..."; exit 1; fi
       - name: Build Astro
         env:
           GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
+          PUBLIC_GA4_MEASUREMENT_ID: ${{ vars.PUBLIC_GA4_MEASUREMENT_ID }}
```

## Gates re-ejecutados (tras P1/P2, con `PUBLIC_GA4_MEASUREMENT_ID=G-2HK4GHK7GR`)

```
npm run check  → 0 errors, 0 warnings, 3 hints (ttTrack) — BaseLayout.astro:28
npm run build  → 22 pages, G-2HK4GHK7GR + cookie_expires 60*60*24*395 renderizado, track.js tt_location
npm run test:links → Internal 0, External 0, SEO 23 (alt="" vacíos pre-existentes)
npm run test:htw  → ✓ en: no diff (30 headings), ✓ es: no diff (48 headings)
grep -r plausible dist/ → 0
grep G-2HK4GHK7GR dist/en/index.html → 2 (stub define:vars + async src)
grep cookie_expires dist/en/index.html → 1 (stub con 395)
grep tt_location dist/assets/js/track.js → 2
hash verify (cookie_expires) → sha256-4IyZhVv+RWju+1/qJEKCsZqtEjlfkQeg7lwN85qT6Y8= idéntico en en/es/privacy/cookies
```

Build validado con `PUBLIC_GA4_MEASUREMENT_ID=G-2HK4GHK7GR` (`.env` local). HTML producción esperado:

1. Inline stub síncrono `(function(){const ga4Id="G-2HK4GHK7GR"; window.dataLayer... gtag('config',ga4Id,{send_page_view:true, cookie_expires: 60*60*24*395})})();` con hash `4IyZhVv...`
2. `async https://www.googletagmanager.com/gtag/js?id=G-2HK4GHK7GR`
3. `/assets/js/site-layout.js` defer
4. `/assets/js/track.js` defer (usa `window.gtag`)
5. `https://analytics.ahrefs.com/analytics.js` async

## Post-merge — instrucciones (no ejecutar antes de merge)

**Pre-requisito:** PR #66 re-aprobado tras fixes P1/P2.

1. **Env CI:** En repo → Settings → Secrets and variables → Actions → Variables → New repository variable → `PUBLIC_GA4_MEASUREMENT_ID` = `G-2HK4GHK7GR` (usar **vars**, no secrets, ID es público). Verificar que `deploy.yml:Validate` lo lee como `vars.PUBLIC_GA4_MEASUREMENT_ID`.
2. **Merge PR #66** → `astro build` con env inyectado (ya no silent sin analytics; falla si variable falta).
3. **Cloudflare:** Rules → Transform Rules → Modify Response Header → `Content-Security-Policy` → pegar CSP exacta con `sha256-4IyZhVv+RWju+1/qJEKCsZqtEjlfkQeg7lwN85qT6Y8=` (395d) → Save → Purge Everything.
   ```bash
   curl -sSI https://tooltician.com | grep -i content-security-policy
   curl -sSI https://tooltician.com/chile-hub/ | grep -i content-security-policy
   # debe contener googletagmanager.com + google-analytics.com + region1 + sha256-4IyZh... + gc.zgo.at, sin plausible.io, con 5 sha256
   ```
4. **GA4:** Admin → Custom definitions (event-scoped) → `tt_location`, `tt_label`, `tt_status`; Conversions → `cta_book_call`, `form_submit_success`.
5. **Validación prod** (F12, con CSP ya aplicada):
   - `https://www.googletagmanager.com/gtag/js?id=G-2HK4GHK7GR` 200, `window.gtag` defined, sin `securitypolicyviolation`
   - Network `https://www.google-analytics.com/g/collect?v=2&tid=G-2HK4GHK7GR` 204 (`page_view`)
   - Application → Cookies → `_ga` expira en ~395d (no 14m calendárico exacto; verificar Expires ≈ now+395d, 34128000s)
   - Click hero → `cta_book_call {tt_location:"hero", tt_label:"..."}`
   - `form_start` → `tt_location:"intake_general"`
   - Console `ttTrack('form_submit_error',{location:'intake_general', status:'network'})` → `tt_status:"network"`
6. **30–60d** tras baseline, retirar Ahrefs si no aporta.

## Rollback

```bash
git revert <HEAD nuevo>   # o git revert 88f020a si se quiere revertir todo GA4, o el nuevo HEAD si solo P1/P2
# Cloudflare: restaurar CSP anterior con plausible.io, sin GA4 hosts, sin sha256-4IyZh...
# Save → Purge
```

No borrar GA4 property `G-2HK4GHK7GR`.

## Referencias

- Plan: `plans/006-plausible-to-ga4-migration.md` (rev final P1/P2, hash 4IyZh..., cookie_expires 395d)
- CSP doc: `docs/cloudflare-security-headers.md:22`
- Layout: `src/layouts/BaseLayout.astro:28,108-114` (cookie_expires)
- Bridge: `public/assets/js/track.js:16-21` (tt_*, sin dataLayer.push)
- Privacy: `src/data/siteDocuments.ts` (395d, 21 Aug 2026)
- Workflow: `.github/workflows/deploy.yml:31-49` (P1 vars + validación)
- PR: https://github.com/cortega26/cortega26.github.io/pull/66
- No se modificó Cloudflare. No se mergeó.
- Fixes Codex P1/P2 aplicados; threads Codex respondidos y marcados resueltos tras push (ver siguiente commit).
