# Plan 006 — Fix Codex P1/P2 — GA4 vars + cookie_expires 395d

**Fecha:** 2026-08-21  
**PR:** https://github.com/cortega26/cortega26.github.io/pull/66 (`feat/ga4-migration` → `master`, base `bf90ea4`)  
**HEAD fix:** `5f2f72bb99ef23fd8b05bba21bc87d027d8df059` — `fix(analytics): address Codex P1/P2 — GA4 vars + cookie_expires 395d`  
**HEAD actual (report):** `1dd314a` — docs(report) update  
**Gates:** `check` 0 errors, `build` 22 pages con `G-2HK4GHK7GR`, `test:links` 0/0, `test:htw` ✓  
**No se modificó Cloudflare. No se mergeó.**

## HEAD / Diff

**`git rev-parse HEAD`:** `1dd314a` (report), fix funcional en `5f2f72b`  
**`git diff --stat master..HEAD`:**
```
 .github/workflows/deploy.yml                     | 10 +++  (P1: vars + validación fail-fast)
 docs/CHANGELOG.md                                |  2 +-   (cookie_expires 395d)
 docs/cloudflare-security-headers.md              |  6 +-   (nuevo hash 4IyZhVv...)
 plans/006-plausible-to-ga4-migration.md          | 23 +--  (hash + cookie_expires)
 plans/006-ga4-migration-PR-report.md             |  (actualizado)
 public/assets/js/track.js                        | 27 +-   (tt_* sin dataLayer.push) — ya en 88f020a
 src/data/siteDocuments.ts                        |  8 +-   (395d, 34128000s)
 src/layouts/BaseLayout.astro                     |  3 +-   (cookie_expires 395)
```

**No merge, no Cloudflare.**

---

## P1 — GA4 ID en producción (`deploy.yml`)

**Problema Codex (P1 — thread `PRRT_kwDOJZt8Y86bPFEu`, comment `3832269390`):** Build exportaba solo `GITHUB_TOKEN`; `vars` no se inyectan automático; `ga4Id` undefined → scripts condicionales omitidos → push/scheduled deployments silenciosamente sin analytics tras remover Plausible.

**Fix `.github/workflows/deploy.yml:31-49`:**
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
    PUBLIC_GA4_MEASUREMENT_ID: ${{ vars.PUBLIC_GA4_MEASUREMENT_ID }}  # vars, no secret, sin fallback silencioso
```

- Usa `vars.PUBLIC_GA4_MEASUREMENT_ID` (preferido, ID es público, no secreto). Sin hardcode fallback silencioso.
- Validación hace fallar `build` si variable ausente (fail-fast en vez de desplegar sin analytics).
- Verificado: único workflow que construye Tooltician es `.github/workflows/deploy.yml` (no hay otro `*.yml` con `astro build`).

**Respuesta Codex P1:** Comentario `PRRC_kwDOJZt8Y87kbgSO` en thread `PRRT_kwDOJZt8Y86bPFEu` — marcado `isResolved:true`.

---

## P2 — lifetime de cookies GA4 (`cookie_expires`)

**Problema Codex (P2 — thread `PRRT_kwDOJZt8Y86bPFEy`, comment `3832269397`):** Docs afirmaban `14 meses` pero `gtag('config')` no seteaba `cookie_expires` (default GA4 = 2 años = 63072000s), inconsistencia código↔docs.

**Decisión P2 (única política determinista):** API solo soporta segundos, sin precisión calendárica. No afirmar “14 meses” exactos.

Elegir valor determinista documentado: `60 * 60 * 24 * 395 = 34128000s` (≈395 días ≈13 meses). 395d es valor común GDPR 13m (365+30), cercano a 14m sin sobre-promesa calendárica. Si se quiere realmente 14 meses (420d), sería `60*60*24*420 = 36288000` — decisión: **395d** para alinear con práctica 13m y evitar claim 14m exacto.

**Fix:**

- **Código `src/layouts/BaseLayout.astro:113`:**
  ```js
  // cookie_expires: 60*60*24*395 = 34128000s = 395 días ≈13 meses (API solo soporta segundos)
  gtag('config', ga4Id, { send_page_view: true, cookie_expires: 60 * 60 * 24 * 395 });
  ```

- **Docs `src/data/siteDocuments.ts:44,100,157,193` + `docs/CHANGELOG.md:7`:**
  - EN privacy: `Google Analytics 4 (gtag.js, G-2HK4GHK7GR, cookie_expires: 60*60*24*395 = 34128000s ≈395 days) … _ga/_ga_* (395 days, see Cookie Notice)`
  - ES privacy: `cookie_expires: 60*60*24*395 = 34128000s ≈395 días … 395 días`
  - EN cookies: `GA4 (gtag.js, G-2HK4GHK7GR, cookie_expires: 60*60*24*395 = 34128000s ≈395 days) sets cookies _ga/_ga_* (395 days, ~13 months) … API only supports seconds, so months are expressed as deterministic days (395).`
  - ES cookies: `... 395 días (~13 meses) ... La API solo soporta segundos ... (395).`

**Respuesta Codex P2:** Comentario `PRRC_kwDOJZt8Y87kbgU7` en thread `PRRT_kwDOJZt8Y86bPFEy` — marcado `isResolved:true`.

---

## SHA-256 recalculado (P2 cambia `gtag('config')`)

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
```

**→ `sha256-4IyZhVv+RWju+1/qJEKCsZqtEjlfkQeg7lwN85qT6Y8=`**

- Hash anterior `sha256-BZJxfeK/xslBDpYiGCWMd7N9XoSnojTl/uxahqkTpwQ=` era sin `cookie_expires`; reemplazado.
- Verificado idéntico en `dist/en/index.html`, `dist/es/index.html`, `dist/en/privacy/index.html`, `dist/en/cookies/index.html`.

---

## CSP final exacta (Cloudflare Transform Rule) — con nuevo hash

**Fórmula:** `CSP_chile-hub_actual (live) ∪ GA4 hosts (googletagmanager, google-analytics, region1) ∪ Ahrefs ∪ sha256 bootstrap inline (cookie_expires) \ {plausible.io}`

```
default-src 'self'; base-uri 'self'; form-action 'self' https://formspree.io; frame-ancestors 'none'; object-src 'none'; script-src 'self' 'wasm-unsafe-eval' 'sha256-TmHOajS6t5/QY5KaUTImfqGzR2lm8kRkwsvdwdyyJ2k=' 'sha256-Jg+1a9BpA31iySvZGcqQpUpwXgkkS/6nQZErUKX8Es=' 'sha256-AgdfQ26gNc5sf5Njp+l68xeI3QwSHUs5YBMqXmFAwUo=' 'sha256-R+ThK1ExJbsszqXj3FZbVZ15e9+xFQeukNF1TYuHXp8=' 'sha256-4IyZhVv+RWju+1/qJEKCsZqtEjlfkQeg7lwN85qT6Y8=' https://gc.zgo.at https://www.googletagmanager.com https://www.google-analytics.com https://analytics.ahrefs.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' blob: https://gc.zgo.at https://formspree.io https://extensions.duckdb.org https://www.google-analytics.com https://region1.google-analytics.com https://www.googletagmanager.com https://analytics.ahrefs.com; manifest-src 'self'; media-src 'self'; worker-src 'self' blob:; upgrade-insecure-requests
```

Ver `docs/cloudflare-security-headers.md:22` (ya actualizado) y `plans/006-plausible-to-ga4-migration.md:5`.

---

## Gates re-ejecutados (tras P1/P2)

```
npm run check  → 0 errors, 0 warnings, 3 hints (ttTrack)
npm run build  → 22 pages, G-2HK4GHK7GR + cookie_expires 60*60*24*395 renderizado
npm run test:links → Internal 0, External 0, SEO 23 (alt vacíos pre-existentes)
npm run test:htw  → ✓ en: no diff (30 headings) ✓ es: no diff (48 headings)
grep -r plausible dist/ → 0
grep G-2HK4GHK7GR dist/en/index.html → 2 (stub define:vars + async src)
grep cookie_expires dist/en/index.html → 1
```

HTML producción esperado verificado:

1. Inline stub síncrono `(function(){const ga4Id="G-2HK4GHK7GR"; ... gtag('config',ga4Id,{send_page_view:true, cookie_expires: 60*60*24*395})})();` hash `4IyZhVv...`
2. `async https://www.googletagmanager.com/gtag/js?id=G-2HK4GHK7GR`
3. `/assets/js/site-layout.js` defer
4. `/assets/js/track.js` defer (`tt_location`/`tt_label`/`tt_status`, sin `dataLayer.push`)
5. `https://analytics.ahrefs.com/analytics.js` async

---

## Post-merge — instrucciones (no ejecutar antes de merge)

1. **Env CI:** Settings → Secrets and variables → Actions → Variables → New repository variable → `PUBLIC_GA4_MEASUREMENT_ID` = `G-2HK4GHK7GR` (usar **vars**, no secrets).
2. **Merge PR #66** → `astro build` con env inyectado (falla si variable falta).
3. **Cloudflare:** Rules → Transform Rules → Modify Response Header → `Content-Security-Policy` → pegar CSP exacta con `sha256-4IyZhVv...` → Save → Purge Everything.
   ```bash
   curl -sSI https://tooltician.com | grep -i content-security-policy
   curl -sSI https://tooltician.com/chile-hub/ | grep -i content-security-policy
   ```
4. **GA4:** Admin → Custom definitions (event-scoped) → `tt_location`, `tt_label`, `tt_status`; Conversions → `cta_book_call`, `form_submit_success`.
5. **Validación prod (F12):** gtag 200, `window.gtag` defined, `g/collect` 204, cookies `_ga` expira ~395d, `cta_book_call {tt_location:"hero"}`, etc., sin `securitypolicyviolation`, `/chile-hub/` GoatCounter+DuckDB+Fonts ok.

## Rollback

```bash
git revert 5f2f72b  # o 1dd314a
# Cloudflare: restaurar CSP anterior con plausible.io, sin GA4 hash
```

No borrar GA4 property `G-2HK4GHK7GR`.

## Referencias

- PR #66: https://github.com/cortega26/cortega26.github.io/pull/66 (HEAD `5f2f72b` fix, `1dd314a` report)
- Código: `src/layouts/BaseLayout.astro:108-114` (`cookie_expires: 60*60*24*395`)
- Workflow: `.github/workflows/deploy.yml:31-49` (P1)
- Docs: `src/data/siteDocuments.ts`, `docs/cloudflare-security-headers.md:22`, `plans/006-plausible-to-ga4-migration.md:5`
- Threads Codex resueltos: `PRRT_kwDOJZt8Y86bPFEu` (P1) y `PRRT_kwDOJZt8Y86bPFEy` (P2) → `isResolved:true` tras fix en HEAD (`5f2f72b`), respuestas `PRRC_kwDOJZt8Y87kbgSO` / `PRRC_kwDOJZt8Y87kbgU7`
- No se modificó Cloudflare. No se mergeó.
