# Plan 006: Migración Plausible → Google Analytics 4 (gtag.js directo)

> **Estado:** `INSPECCIÓN READ-ONLY COMPLETADA — 2026-08-21` / `CORREGIDO 2026-08-21 (bootstrap+env)` / `AJUSTE FINAL 2026-08-21 (tt_status, sin dataLayer.push, CSP hash inline)` — Sin cambios en código/CSP/GA4. Esperando `G-XXXXXXXXXX` para PR.
> **Objetivo:** Usar GA4 estándar como analytics principal de `tooltician.com`, integración directa `gtag.js`, sin GTM salvo necesidad documentada. Preservar contrato `window.ttTrack` y CSP de `chile-hub`.
> **Decisiones aprobadas:** GA4 directo sin GTM · `window.ttTrack` abstraction boundary · conservar Ahrefs 30–60d · retirar Plausible tras validar GA4 · CSP §5 unificada con `sha256-BZJxfeK/xslBDpYiGCWMd7N9XoSnojTl/uxahqkTpwQ=` inline (G-2HK4GHK7GR) · mapping `location→tt_location`, `label→tt_label`, `status→tt_status` · sin `dataLayer.push` adicional (solo `gtag('event')`) · preservar íntegramente requisitos `chile-hub`.
> **No tocar hasta Measurement ID:** Cloudflare, GA4, merge.

## 1. Inspección READ-ONLY

### 1.1 Referencias a Plausible (código, tests, docs)

- `src/layouts/BaseLayout.astro:104-107` — único punto de carga:
  ```astro
  <!-- Plausible (cookieless event analytics — track.js forwards data-track events to window.plausible) -->
  <!-- TODO(TS-001): pending manual step — create/verify the tooltician.com site at plausible.io -->
  <script is:inline>window.plausible = window.plausible || function () { (window.plausible.q = window.plausible.q || []).push(arguments) }</script>
  <script is:inline defer data-domain="tooltician.com" src="https://plausible.io/js/script.js"></script>
  ```
- `public/assets/js/track.js:4-25` — forwarding:
  ```js
  // Plausible custom events (if/when loaded).
  if (typeof window.plausible === 'function') {
    window.plausible(name, { props: payload });
  }
  // Generic dataLayer (GTM / custom consumers).
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: name, ...payload });
  ```
- Docs: `docs/cloudflare-security-headers.md:22`, `docs/CHANGELOG.md:6-15`, `docs/tasks/tooltician-strategy-execution-plan.md:21,141,147` (TS-001), `docs/tasks/higiene-tecnica-web-backlog.md:322`.
- `src/layouts/BaseLayout.astro:99` carga `track.js` (`defer`), `public/assets/js/intake-form.js:4-7` solo usa `window.ttTrack`.

### 1.2 Cómo funciona `track.js`, `window.ttTrack`, `dataLayer` y formularios

**`public/assets/js/track.js:14-46`:**
- Expone `window.ttTrack(name, props)` `track.js:31`.
- Auto-bind `document.addEventListener('click', {capture:true})` → `el.closest('[data-track]')` → `track(data-track, {location: data-track-loc, label: textContent.slice(0,60)})` `track.js:34-45`.
- `location` y `label` son contrato estable. Hoy reenvía a `window.plausible` + `dataLayer`; ambos sin consumidor → no-op corroborado en `docs/tasks/tooltician-strategy-execution-plan.md:21`.

**`public/assets/js/intake-form.js:7-68`:**
- Wrapper `track(name,props) => window.ttTrack` `intake-form.js:7`.
- `form_start` en `input` primera interacción `intake-form.js:21-28` (`location: intake_<service>`).
- `form_submit_success` / `form_submit_error` tras `fetch(Formspree)` `intake-form.js:52-62` con `{location, status}`.

**Disparadores `data-track` declarativos:**
- `src/components/HeroSection.astro:128-129` — `cta_book_call` / `cta_send_brief` (`hero`)
- `src/components/ContactSection.astro:171` — `cta_book_call` (`contact`)
- `src/components/ServicePage.astro:358` — `cta_book_call` (`<slug>_brief`)
- `src/components/ServicePage.astro:366` — `intent_select` (`<slug>_<index>`)
- `src/components/ResultsBand.astro:46` — `proof_verify` (`results_band`)
- `src/components/IntakeForm.astro:132,196` — `data-track-form=intake_<service>` + CTA `cta_book_call` (`intake_<service>`)
- Páginas HTW: `src/pages/en/services/web-technical-hygiene/index.astro:580,587` idem ES.

`dataLayer` actual es solo `push({event:name, ...payload})` `track.js:25` sin consumidor GTM/GA4.

### 1.3 Reutilización del contrato para GA4 sin modificar componentes

Los componentes **no** llamarán a `gtag()` nunca. Todo el cambio queda aislado en `track.js` (bridge). Contrato público preservado:

```js
// contrato público (no cambia)
window.ttTrack('cta_book_call', { location: 'hero', label: 'Book...' })
window.ttTrack('form_start', { location: 'intake_general' })
```

Mapping interno hacia GA4 en `track.js` (ver §1.7 para elección de nombres `tt_location`/`tt_label`/`tt_status`):

```js
// antes
if (window.plausible) window.plausible(name, {props: payload})
window.dataLayer.push({event:name, ...payload})

// después (corregido, namespaced, sin dataLayer.push adicional)
// contrato público intacto: ttTrack(name, {location, label, status})
// gtag() ya empuja a dataLayer vía function gtag(){dataLayer.push(arguments)}
const p = payload && typeof payload === 'object' ? payload : {};
if (typeof window.gtag === 'function') {
  const params = {};
  if (p.location !== undefined) params.tt_location = p.location;
  if (p.label !== undefined) params.tt_label = p.label;
  if (p.status !== undefined) params.tt_status = p.status;
  window.gtag('event', name, params);
}
```

Mismo nombre de evento (`cta_book_call`, `cta_send_brief`, `proof_verify`, `intent_select`, `form_start`, `form_submit_success`, `form_submit_error`) compatible GA4 (`snake_case`, ≤40 chars). Pageview se envía automático vía `gtag('config', 'G-XXX')`. No hay `dataLayer.push({event:name,...})` adicional: `gtag()` es la cola oficial.

### 1.4 Requisitos CSP GA4 directo (gtag.js sin GTM)

| Fase | Host | Directiva | Por qué |
|------|------|-----------|---------|
| Carga `gtag.js` | `https://www.googletagmanager.com` | `script-src` | `async src="https://www.googletagmanager.com/gtag/js?id=G-XXX"` |
| Secundario (inyectado por gtag) | `https://www.google-analytics.com` | `script-src` | `gtag` puede inyectar `https://www.google-analytics.com/gtag/js` |
| Hits pageview/event | `https://www.google-analytics.com` | `connect-src` | `POST /g/collect` principal |
| Hits regional fallback | `https://region1.google-analytics.com` | `connect-src` | Endpoint regional alternativo GA4 |
| Config fetch | `https://www.googletagmanager.com` | `connect-src` | `gtag('config')` fetch |
| Pixel fallback | `https://www.google-analytics.com` | `img-src` | Ya cubierto por `img-src https:` actual, no cambio necesario |

No requiere `style-src`, `font-src`, `worker-src`.

### 1.5 CSP actual y requisitos `chile-hub` a preservar

**Efectivo en producción `curl -sSI https://tooltician.com` (2026-08-21):**
```
default-src 'self'; base-uri 'self'; form-action 'self' https://formspree.io;
frame-ancestors 'none'; object-src 'none';
script-src 'self' 'wasm-unsafe-eval'
  'sha256-TmHOajS6t5/QY5KaUTImfqGzR2lm8kRkwsvdwdyyJ2k='
  'sha256-Jg+1a9BpA31iySvZGcqQpUpwXgkkS/6nQZErUKX8Es='
  'sha256-AgdfQ26gNc5sf5Njp+l68xeI3QwSHUs5YBMqXmFAwUo='
  'sha256-R+ThK1ExJbsszqXj3FZbVZ15e9+xFQeukNF1TYuHXp8='
  https://gc.zgo.at https://plausible.io https://analytics.ahrefs.com;
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
img-src 'self' data: https:;
font-src 'self' https://fonts.gstatic.com;
connect-src 'self' blob: https://gc.zgo.at https://formspree.io https://extensions.duckdb.org https://plausible.io https://analytics.ahrefs.com;
manifest-src 'self'; media-src 'self'; worker-src 'self' blob:; upgrade-insecure-requests
```

**Preservar explícitamente** (origen `chile-hub` en `https://tooltician.com/chile-hub/`, no en `src/pages`):
- `https://gc.zgo.at` (`chile-hub/index.html` GoatCounter `data-goatcounter="https://chile-hub.goatcounter.com/count"` + `chile-hub/app.js:trackDownload` `goatcounter.count`)
- `https://extensions.duckdb.org` (`chile-hub/playground.js` DuckDB-Wasm `fetch` extensión)
- `https://fonts.googleapis.com` + `https://fonts.gstatic.com` (`chile-hub` Inter/JetBrains Mono)
- `'wasm-unsafe-eval'` + 4 hashes `sha256-...` (`chile-hub` inline JSON-LD `DataCatalog` + drawer scripts)
- `blob:` en `connect-src` y `worker-src` (`playground.js` `Blob URL` WASM + Worker `duckdb-browser-mvp.worker.js`)

> `docs/cloudflare-security-headers.md:22` está desactualizado (omite hashes, `wasm-unsafe-eval`, `gc.zgo.at`, `extensions.duckdb.org`, `blob:`). Tomar live como verdad.

### 1.6 Ahrefs Analytics — ¿conservar?

`src/layouts/BaseLayout.astro:102` `https://analytics.ahrefs.com/analytics.js` `data-key="uU7HA5yyjlR9jxjk2RvjzA"` — solo pageviews, verificado en Lighthouse `output/lighthouse/*.json` y `siteDocuments.ts:44,65`. No hay eventos custom ni consumo en `tests/run.js`.

**Recomendación (aprobada):** **Conservar 30–60d** tras GA4 validado. No duplica eventos GA4, aporta historial SEO/referrer, costo ya pagado (CSP + 6k async). Retirar solo tras baseline GA4.

### 1.7 Custom parameters GA4: `location`/`label` vs `tt_location`/`tt_label`

**Contrato público `ttTrack` no cambia:** callers siguen usando `{location, label}`.

**Análisis GA4:**

- GA4 reserva prefijos `google_`, `ga_`, `firebase_` y parámetros auto-colectados `page_location`, `page_title`, `page_referrer`, `screen_resolution`. `location` y `label` **no** están reservados, técnicamente válidos (snake_case, <40 chars).
- Riesgo de ambigüedad: en Explore/Reports `location` se confunde con `page_location` (URL completa). `label` es genérico (heredado UA `event_label`) y poco descriptivo en tabla de dimensiones.
- Best practice GA4: namespacing (`tt_` = Tooltician) evita colisión futura si Google añade `location` automático, clarifica en UI de Custom Definitions que es “placement de Tooltician (hero/contact/<slug>)” vs URL, y facilita filtros `tt_location = "hero"`.
- Límite 50 dimensiones custom event-scoped — usar 2 es trivial.

**Decisión aprobada (solo mapping interno, sin romper contrato):**

- `ttTrack({location})` → `gtag('event', name, { tt_location: location })`
- `ttTrack({label})` → `gtag('event', name, { tt_label: label })`
- `ttTrack({status})` → `gtag('event', name, { tt_status: status })` — solo cuando `status` está presente (`form_submit_error` con `status: number|'network'`).
- Registrar en GA4 como Custom dimensions (event-scoped) cuando corresponda: `tt_location`, `tt_label`, `tt_status` (ver §7). No enviar `status` si es `undefined` para no contaminar reportes.

Contrato público permanece `ttTrack(name, {location, label, status})`; GA4 recibe `tt_*`.

---

## 2. Arquitectura corregida

### Errores corregidos respecto a v1

1. **`public/assets/js/ga4.js` no puede usar `import.meta.env`** — `public/` no es procesado por Astro/Vite. `PUBLIC_GA4_MEASUREMENT_ID` debe resolverse en código procesado por Astro: `src/layouts/BaseLayout.astro` (frontmatter) o módulo en `src/`.
2. **Orden bootstrap incorrecto** — antes: `async gtag.js` antes del stub. Ahora: stub síncrono primero, `async gtag.js` después. Elimina race condition.

### Diagrama corregido

```
[HeroSection|ContactSection|ServicePage|IntakeForm]
   -- [data-track] click / intake-form.js input/submit --> window.ttTrack(name,{location,label,status}) // contrato público intacto
                               |
                  public/assets/js/track.js (defer, único bridge)
                               |-- if (window.gtag) gtag('event', name, {tt_location, tt_label, tt_status?})
                               // sin dataLayer.push — gtag() es la cola oficial (function gtag(){dataLayer.push(arguments)})
                               v
src/layouts/BaseLayout.astro (procesado por Astro)
  frontmatter: const ga4Id = import.meta.env.PUBLIC_GA4_MEASUREMENT_ID
  1) <script is:inline define:vars={{ga4Id}}>  // SÍNCRONO, primero
       window.dataLayer = window.dataLayer || [];
       function gtag(){dataLayer.push(arguments);}
       window.gtag = gtag;
       gtag('js', new Date());
       if (ga4Id) gtag('config', ga4Id, { send_page_view: true });
     </script>  // ← SHA-256 incorporado a CSP §5
  2) <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXX"></script> // async DESPUÉS
                               ^
                    https://www.google-analytics.com/g/collect
                    https://region1.google-analytics.com/g/collect
```

**Por qué no hay race (verificación):**

- Inline stub es **síncrono** (sin `async`/`defer`) → se ejecuta inmediatamente durante parseo HTML, antes de que el parser descubra el siguiente `<script async>`. Incluso si `gtag.js` está en caché y responde “instantáneamente”, `window.gtag` ya existe.
- Si `gtag.js` tarda (red lenta), `track.js` (`defer`) y eventos `ttTrack` hacen `gtag('event',...)` que empuja a `dataLayer` queue vía `function gtag(){dataLayer.push(arguments)}`; `gtag.js` al cargar drena la cola y envía. `track.js` es `defer` → ejecuta después de `DOMContentLoaded` y después del inline stub, antes/después de `gtag.js` es irrelevante por la cola.
- `track.js` usa exclusivamente `window.gtag('event',...)` — **sin** `dataLayer.push({event:name,...})` adicional, pues `gtag()` ya constituye la cola oficial.

**Alternativa sin inline hash (si quieres evitar añadir nuevo `sha256-` a CSP):**

- En lugar de `is:inline`, usar `<script>` sin `is:inline` en `BaseLayout.astro` que importe un módulo `src/scripts/ga4-init.ts` procesado por Vite. Ese módulo se emite como `/_astro/ga4-init.<hash>.js` (`self`), permitido por `script-src 'self'` sin hash. Contenido idéntico (stub + `import.meta.env.PUBLIC_GA4_MEASUREMENT_ID`). Este plan por defecto documenta la variante inline (más simple, 0 archivos nuevos); la variante bundled es válida si prefieres no rotar CSP hashes.

**Configuración:**

- `.env` → `PUBLIC_GA4_MEASUREMENT_ID=G-XXXXXXXXXX` (Astro expone `PUBLIC_*` al cliente).
- `src/layouts/BaseLayout.astro` frontmatter lee `import.meta.env.PUBLIC_GA4_MEASUREMENT_ID`, lo pasa vía `define:vars={{ga4Id}}` al inline stub y via interpolación al `src` de `gtag.js`. Ningún archivo en `public/` lee `import.meta.env`.

---

## 3. Archivos que modificarías

| Archivo | Cambio |
|---------|--------|
| `public/assets/js/track.js:19-25` | Quitar rama `window.plausible` y `dataLayer.push({event:name,...})`; añadir **solo** `if (window.gtag) gtag('event', name, {tt_location, tt_label, tt_status?})` con mapping `location→tt_location`, `label→tt_label`, `status→tt_status` (si presente). Contrato público `{location,label,status}` intacto. |
| `src/layouts/BaseLayout.astro:1-8,82,98-107` | Frontmatter: `const ga4Id = import.meta.env.PUBLIC_GA4_MEASUREMENT_ID`. Body: (1) inline stub síncrono `define:vars={{ga4Id}}` con `dataLayer/gtag/js/config`, (2) `async` `https://www.googletagmanager.com/gtag/js?id=${ga4Id}` con `is:inline`; quitar stub `window.plausible` + `plausible.io` script; añadir `preconnect` GA hosts; mantener Ahrefs. |
| _(no crear)_ `public/assets/js/ga4.js` | **Eliminado de v1** — no puede usar `import.meta.env`. Si se quiere evitar hash CSP, crear `src/scripts/ga4-init.ts` (Vite bundle) en lugar de inline; no generación custom. |
| `docs/cloudflare-security-headers.md:22` | Reemplazar CSP por unificada exacta §5 (añadir GA hosts, quitar `plausible.io`; si se usa inline stub, añadir su `sha256-` al `script-src`). |
| `docs/CHANGELOG.md` | GA4 fuente principal, retire Plausible tras validación |
| `docs/tasks/tooltician-strategy-execution-plan.md:TS-001` | Marcar Done GA4, actualizar verificación |
| `src/data/siteDocuments.ts:42-168` | Privacy/Cookies: añadir GA4 cookies `_ga/_ga_*` 14m, IP anonimizada; quitar claim Plausible cookieless |
| `tests/run.js`, `test-htw-snapshot.mjs` | Si asertan `plausible`, actualizar a `gtag`/`dataLayer`/`tt_location` |

No tocar: `public/assets/js/intake-form.js`, `src/components/*` (contrato intacto), `src/data/services.ts`, `chile-hub` deploy (`/chile-hub/` no está en `src/pages`).

---

## 4. Diff conceptual corregido

```diff
--- public/assets/js/track.js
-      // Plausible custom events (if/when loaded).
-      if (typeof window.plausible === 'function') {
-        window.plausible(name, { props: payload });
-      }
-      // Generic dataLayer (GTM / custom consumers).
-      window.dataLayer = window.dataLayer || [];
-      window.dataLayer.push({ event: name, ...payload });
+      // GA4 via gtag (direct, no GTM). Public contract {location,label,status} -> GA4 {tt_location,tt_label,tt_status}
+      // No dataLayer.push adicional — gtag() ya es function gtag(){dataLayer.push(arguments)}
+      const p = payload && typeof payload === 'object' ? payload : {};
+      if (typeof window.gtag === 'function') {
+        const params = {};
+        if (p.location !== undefined) params.tt_location = p.location;
+        if (p.label !== undefined) params.tt_label = p.label;
+        if (p.status !== undefined) params.tt_status = p.status;
+        window.gtag('event', name, params);
+      }

--- src/layouts/BaseLayout.astro
+---
+const ga4Id = import.meta.env.PUBLIC_GA4_MEASUREMENT_ID;
+---
-  <!-- Plausible (cookieless event analytics — track.js forwards data-track events to window.plausible) -->
-  <!-- TODO(TS-001): pending manual step — create/verify the tooltician.com site at plausible.io -->
-  <script is:inline>window.plausible = window.plausible || function () { (window.plausible.q = window.plausible.q || []).push(arguments) }</script>
-  <script is:inline defer data-domain="tooltician.com" src="https://plausible.io/js/script.js"></script>
+  <!-- GA4 (gtag.js direct — stub primero, luego async gtag.js) -->
+  <link rel="preconnect" href="https://www.googletagmanager.com" />
+  <link rel="preconnect" href="https://www.google-analytics.com" />
+  {ga4Id && (
+    <>
+      <script is:inline define:vars={{ ga4Id }}>
+        window.dataLayer = window.dataLayer || [];
+        function gtag(){dataLayer.push(arguments);}
+        window.gtag = gtag;
+        gtag('js', new Date());
+        gtag('config', ga4Id, { send_page_view: true });
+      </script>
+      <script is:inline async src={`https://www.googletagmanager.com/gtag/js?id=${ga4Id}`}></script>
+    </>
+  )}
   <script is:inline src="/assets/js/site-layout.js" defer></script>
   <script is:inline src="/assets/js/track.js" defer></script>

--- public/assets/js/ga4.js  (v1, eliminado)
- window.dataLayer = window.dataLayer || [];
- function gtag(){dataLayer.push(arguments)}
- window.gtag = gtag;
- gtag('js', new Date());
- gtag('config', 'G-XXXXXXXXXX');

--- docs/cloudflare-security-headers.md
- Content-Security-Policy: default-src 'self'; ... script-src 'self' https://analytics.ahrefs.com https://plausible.io; ... connect-src 'self' https://analytics.ahrefs.com https://plausible.io https://formspree.io; ...
+ Content-Security-Policy: <CSP unificada exacta §5>  (+ sha256 del inline stub si se usa inline)
```

**Nota CSP hash (aprobado inline, G-2HK4GHK7GR):** Inline stub `sha256-BZJxfeK/xslBDpYiGCWMd7N9XoSnojTl/uxahqkTpwQ=` verificado tras `astro build` con `G-2HK4GHK7GR` (`dist/en/index.html` inline `(function(){const ga4Id = "G-2HK4GHK7GR";...})();`). Ya incorporado en CSP §5. Si `G-XXX` cambia, recalcular.

---

## 5. CSP unificada exacta (Cloudflare Transform Rule)

**Fórmula:** `CSP_chile-hub_actual (live) ∪ requisitos_GA4 ∪ Ahrefs_si_se_conserva \ {plausible.io} ∪ {sha256 inline bootstrap aprobado}`

**Unificada aprobada (con inline bootstrap síncrono):**
```
default-src 'self'; base-uri 'self'; form-action 'self' https://formspree.io; frame-ancestors 'none'; object-src 'none'; script-src 'self' 'wasm-unsafe-eval' 'sha256-TmHOajS6t5/QY5KaUTImfqGzR2lm8kRkwsvdwdyyJ2k=' 'sha256-Jg+1a9BpA31iySvZGcqQpUpwXgkkS/6nQZErUKX8Es=' 'sha256-AgdfQ26gNc5sf5Njp+l68xeI3QwSHUs5YBMqXmFAwUo=' 'sha256-R+ThK1ExJbsszqXj3FZbVZ15e9+xFQeukNF1TYuHXp8=' 'sha256-BZJxfeK/xslBDpYiGCWMd7N9XoSnojTl/uxahqkTpwQ=' https://gc.zgo.at https://www.googletagmanager.com https://www.google-analytics.com https://analytics.ahrefs.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' blob: https://gc.zgo.at https://formspree.io https://extensions.duckdb.org https://www.google-analytics.com https://region1.google-analytics.com https://www.googletagmanager.com https://analytics.ahrefs.com; manifest-src 'self'; media-src 'self'; worker-src 'self' blob:; upgrade-insecure-requests
```
> `sha256-BZJxfeK/xslBDpYiGCWMd7N9XoSnojTl/uxahqkTpwQ=` = hash del inline stub síncrono `window.dataLayer/gtag/js/config` con `ga4Id="G-2HK4GHK7GR"` (ver §4). **Incorporado en esta CSP unificada** (inline bootstrap aprobado, verificado en `dist/en/index.html`, `dist/es/index.html`, `dist/en/privacy/index.html` — todos idéntico). Sin este hash, el stub sería bloqueado por `script-src` (no hay `unsafe-inline`).

- Quita `https://plausible.io` intencionalmente (retiro tras validar GA4 30–60d).
- Si eliminas Ahrefs tras 30–60d, quita `https://analytics.ahrefs.com` de `script-src` y `connect-src`.
- `img-src https:` ya cubre pixel fallback GA4.

Verificar:
```bash
curl -sSI https://tooltician.com | grep -i content-security-policy
# debe contener googletagmanager.com + google-analytics.com + region1.google-analytics.com + sha256-BZJxfeK/xslBDpYiGCWMd7N9XoSnojTl/uxahqkTpwQ=, sin plausible.io, con 4 sha256 chile-hub + 1 bootstrap y gc.zgo.at
```

---

## 6. Measurement ID que debe proporcionar

**Bloqueante.** Crear **GA4 Web Data Stream** para `https://tooltician.com` y entregar:

```
G-XXXXXXXXXX
```

Sin este valor no se puede asumir ni hardcodear nada. Convención **corregida**:

- `.env` (y Cloudflare Pages/CI env si aplica) → `PUBLIC_GA4_MEASUREMENT_ID=G-XXXXXXXXXX` (Astro expone `PUBLIC_*` al cliente).
- `src/layouts/BaseLayout.astro` frontmatter lo lee: `const ga4Id = import.meta.env.PUBLIC_GA4_MEASUREMENT_ID;` y lo inyecta vía `define:vars` + `src` templating.
- **Ningún archivo en `public/` lee `import.meta.env`.**

---

## 7. Pasos manuales en GA4 (tu acción, fuera del repo)

1. **Crear property:** GA4 → Admin → Create property → `Tooltician` | Small business | Timezone `America/Santiago` | Currency `CLP`/`USD`.
2. **Web Data Stream:** Admin → Data Streams → Add stream → Web → URL `https://tooltician.com` → Enhanced measurement **ON**.
3. **Copiar ID:** `Measurement ID G-XXXXXXXXXX`.
4. **Custom dimensions:** Configure → Custom definitions → Create custom dimension (event-scoped) → `tt_location` (Event parameter: `tt_location`), `tt_label` (Event parameter: `tt_label`), y `tt_status` (Event parameter: `tt_status`, solo para `form_submit_error` con `{status}`).
5. **Conversiones:** Configure → Conversions → `cta_book_call` y `form_submit_success` → Mark as conversion.
6. **Retención/privacidad:** Data Retention 14 months; Google Signals OFF; IP anonymization por defecto.
7. **Test:** Realtime + DebugView.

---

## 8. Pasos manuales en Cloudflare (tu acción)

1. Rules → Transform Rules → Modify Response Header → `Content-Security-Policy`.
2. Reemplazar por CSP §5 (una línea). Si usas inline stub, añadir su `sha256-` (generado tras build) en mismo cambio.
3. Save → Caching → Purge Everything (incluye `/chile-hub/*`).
4. Verificar ambos:
   ```bash
   curl -sSI https://tooltician.com | grep -i content-security-policy
   curl -sSI https://tooltician.com/chile-hub/ | grep -i content-security-policy
   ```

---

## 9. Validación en producción

```bash
curl -sSI https://tooltician.com | grep -i CSP
```

- [ ] Inline stub presente en HTML **antes** que `gtag/js` (View Source: `window.gtag` → `gtag('config'` luego `googletagmanager.com/gtag/js`).
- [ ] `https://www.googletagmanager.com/gtag/js?id=G-XXX` 200, `window.gtag` defined, sin `securitypolicyviolation`.
- [ ] Network `https://www.google-analytics.com/g/collect?v=2&tid=G-XXX` 204 (`page_view`).
- [ ] Click Hero `cta_book_call` `HeroSection.astro:128` → Realtime → `cta_book_call {tt_location:"hero", tt_label:"Book..."}` (ver §1.7).
- [ ] `form_start` → focus `IntakeForm` → `form_start {tt_location:"intake_general"}`.
- [ ] `form_submit_error` → `ttTrack('form_submit_error',{location:'intake_general', status:'network'})` → DebugView `tt_status:"network"` (o `status` numérico).
- [ ] `form_submit_success` sin lead falso: `ttTrack('form_submit_success',{location:'intake_general'})` en Console → DebugView `tt_location:"intake_general"`.
- [ ] Sin `securitypolicyviolation`; `/chile-hub/` conserva GoatCounter, Fonts, DuckDB `SELECT 1`, `blob:`.

---

## 10. Plan de rollback

- **Código:** `git revert <commit GA4>` (restaura `BaseLayout.astro:104-107` Plausible + `track.js:19-25` `window.plausible`) → `npm run build` → deploy GH Pages.
- **Cloudflare:** restaurar CSP anterior (con `plausible.io`, sin GA hosts, sin hash stub) → Save → Purge.
- **GA4:** no borrar property; solo deja de recibir hits.

---

## 11. Riesgos

| Riesgo | Prob | Impacto | Mitigación |
|--------|------|---------|------------|
| CSP inline stub sin hash → block | Media si se usa inline | Alto | Añadir `sha256-` del stub a `script-src` o usar variante `src/scripts/ga4-init.ts` bundled (`self`) |
| `G-XXX` no provisto / typo | Alta si falta | Alto | `ga4Id` falsy → no renderiza stub/gtag; verificar `collect?tid=` 204 |
| Race si gtag.js antes de stub (corregido) | Baja ahora | Alto | Orden corregido: stub síncrono primero, async después; `track.js` queue vía `dataLayer` |
| Adblockers `googletagmanager.com` | Alta | Medio | Retener Ahrefs baseline |
| Cookie banner | Media | Medio | Actualizar `siteDocuments.ts`; Signals OFF |
| `location`/`label` genéricos | Baja | Bajo | Namespacing `tt_location`/`tt_label` resuelve ambigüedad `page_location` |
| Env no inyectado | Baja | Medio | Build falla silenciosamente si `PUBLIC_GA4_*` undefined → frontmatter no renderiza GA |

---

## 12. Checklist pre-PR (no implementar hasta tu OK)

- [x] Orden bootstrap §2 (stub síncrono → async) aprobado
- [x] CSP §5 unificada aprobada con `sha256-BZJxfeK/xslBDpYiGCWMd7N9XoSnojTl/uxahqkTpwQ=` (G-2HK4GHK7GR) incorporado
- [x] Mapping `location→tt_location`, `label→tt_label`, `status→tt_status` (§1.7) aprobado
- [x] Sin `dataLayer.push` adicional — solo `gtag('event')` (cola oficial `function gtag(){dataLayer.push(arguments)}`) aprobado
- [x] Retiro Plausible después de validar GA4 (30–60d con Ahrefs) aprobado
- [ ] Provees `G-XXXXXXXXXX` → `PUBLIC_GA4_MEASUREMENT_ID` (único bloqueante)

> **Listo para PR al recibir `G-XXX`** — sin generación custom, sin GTM, con `window.ttTrack` preservado, `tt_*` registrado como custom dimensions.
