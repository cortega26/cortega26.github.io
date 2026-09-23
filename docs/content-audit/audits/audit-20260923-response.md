---
title: "Respuesta a la auditoría live 2026-09-23 — Tooltician"
audit: "docs/content-audit/audits/audit-20260923.md"
response_date: "2026-09-23"
status: "closed"
plans: "024–034"
planned_at_commit: "2a10c13"
intended_consumer: "maintainers and implementation agents"
---

# Respuesta a la auditoría 2026-09-23

Este documento es la **autoridad de estado** de la auditoría
`audit-20260923.md`. Contiene la reconciliación finding por finding contra el
sitio live y el código en `2a10c13`, las decisiones bloqueadas con el
mantenedor, el plan que resuelve cada hallazgo y el mapeo de los criterios de
aceptación §8.

Regla de mantenimiento: cada plan actualiza su fila al aterrizar. Un veredicto
`stale` o `no action` solo se reabre con evidencia live nueva y una nota
fechada.

## 1. Reconciliación de evidencia (2026-09-23)

Verificado contra el sitio live y el código en `2a10c13`:

- `curl -sL -A "Mozilla/5.0" https://tooltician.com/es/trabajo/` → renderiza
  los **10** proyectos (El Rincón de Ébano, Portfolio Manager, chile-hub,
  Monedario, LinkedIn Spam Blocker, Conciliador Bancario, Rutificador,
  DNSpect, Pipeline de Datos de Lotería, Noticiencias). **H-01 es stale**:
  la promesa "Ver los 10 proyectos" se cumple.
- `curl -s -A "Mozilla/5.0" https://tooltician.com/en/` → muestra
  `from $1,500`, `from $290 / month`, `from $69 diagnostic`. **H-07 es stale**:
  sí hay rangos USD visibles.
- `dist/sitemap-0.xml` → el grupo de `/`, `/en/`, `/es/` lista `en=/` +
  `en=/en/` + `es=/es/` (duplicado, sin `x-default`); las tres guías ES no
  llevan `xhtml:link`. **H-02 confirmado.**
- `src/components/ServicesSection.astro` → `ctaLabel` idéntico para los seis
  enlaces. **H-03 confirmado.**
- `engagementSummary.es.automation` = `desde 30 UF` vs CTA del servicio
  `desde 3 UF`. **H-04 confirmado.**
- `src/pages/index.astro` → gateway con H1 `English / Español`, meta refresh
  en `<noscript>` y auto-redirect JS. **H-05 confirmado.**
- No existe `/es/guias/`; enlaces a guías solo en `services.ts` (2) y en la
  página HTW ES (1). **H-08 confirmado.**
- `dist/es/trabajo/index.html` → 1 H1, 0 H2, 10 H3. **H-09 confirmado.**
- `IntakeForm.astro` → `novalidate` sin `aria-describedby`/`aria-invalid`.
  **H-10 confirmado.**
- Raíz y trabajo sin JSON-LD; `/pricing`, `/docs`, `/login`, `/demo` → 404,
  sin enlaces y fuera del sitemap. **H-11 confirmado.**
- Guías con CTA solo al final; tarjetas de trabajo sin CTA por caso.
  **H-12 confirmado.**

## 2. Decisiones bloqueadas (mantenedor, 2026-09-23)

1. **Raíz**: landing x-default bilingüe real; se retira el auto-redirect de
   primer ingreso (se conserva el redirect por preferencia guardada). → 031.
2. **Guías**: estrategia deliberadamente monolingüe ES este ciclo
   (`es` + `x-default`); sin traducciones EN ahora. → 025 / 032.
3. **Evidencia de casos**: publicar rol, alcance y fecha de verificación; **sin
   métricas nuevas**; confidencialidad declarada explícitamente si existe.
   → 029.
4. **Rutas genéricas**: `/pricing`, `/docs`, `/login`, `/demo` permanecen 404,
   sin enlaces y fuera del sitemap; no representan una capacidad real. → 033
   (nota en código) y este documento.

## 3. Matriz finding → plan → estado

| Finding | Sev. | Veredicto | Evidencia verificada | Plan | Estado |
|---|---|---|---|---|---|
| H-01 — "10 proyectos" vs índice público | Alta | **Stale** (live muestra 10) | `curl /es/trabajo/` → 10 títulos | 029 (residuo: rol/fecha/contexto) | **DONE** (029: nota de proyectos públicos + rol/fecha por caso) |
| H-02 — hreflang inconsistente en sitemap | Alta | Confirmado | `dist/sitemap-0.xml`: `en` duplicado en `/`; guías sin `xhtml:link` | 025 | **DONE** (`node tests/sitemap-i18n.mjs` PASS, 28 URLs, HTML↔XML parity) |
| H-03 — CTAs de servicio genéricos | Alta | Confirmado | 6× `VIEW SERVICE` / `Ver servicio` | 027 | **DONE** (6 nombres accesibles únicos EN/ES; grupo `H-03`) |
| H-04 — entrada de precio diagnóstica vs construcción | Media | Confirmado | `desde 30 UF` (home) vs `desde 3 UF` (servicio) | 026 | **DONE** (grupo `H-04` 8/8; home y 6 servicios con etapas) |
| H-05 — raíz con poco valor antes del refresh | Media | Confirmado | gateway sin H2/JSON-LD/CTA; auto-redirect | 031 | **DONE** (landing + `WebSite`/`Organization`; sin meta refresh ni auto-redirect; `H-05` + CSP MATCH) |
| H-06 — evidencia sin resultados cuantificados | Media | Confirmado | casos sin rol ni fecha de verificación | 029 | **DONE** (10 fichas con rol + fecha + CTA por caso; grupo `H-06`) |
| H-07 — oferta internacional sin rango USD | Media | **Stale** (live muestra USD) | `from $1,500`, `from $290 / month`, `from $69 diagnostic` | 026 (residuo: patrón por etapas) | **DONE** (026: patrón por etapas también en EN) |
| H-08 — guías sin red interna | Media | Confirmado | sin hub; 3 enlaces entrantes en total | 032 | **DONE** (hub `/es/guias/` + strip en home + footer; guías con CTA top+bottom; grupo `H-08`) |
| H-09 — trabajo salta de H1 a H3 | Media | Confirmado | 1 H1, 0 H2, 10 H3 en `dist/es/trabajo/` | 030 | **DONE** (1 H1 → 4 H2 → 10 H3; filtros ocultan grupos vacíos; grupo `H-09`) |
| H-10 — brief sin errores por campo | Media | Confirmado | `novalidate`, sin `aria-invalid`/`aria-describedby` | 028 | **DONE** (behavioral: 0 POST inválido, foco + aria, 1 POST válido; control negativo probado) |
| H-11 — schema desigual + rutas genéricas | Baja | Confirmado | raíz/trabajo sin JSON-LD; genéricas 404 | 033 (schema) + decisión 4 (rutas) | **DONE** (builders `jsonld.ts`; work `CollectionPage`+`BreadcrumbList`+`ItemList`; raíz `WebSite`/`Organization`; rutas genéricas documentadas como no-action) |
| H-12 — CTA contextual insuficiente | Baja | Confirmado | guías solo con CTA final; trabajo sin CTA por caso | 027 (guías) + 029 (trabajo) | **DONE** (guías con CTA top+bottom; 10 CTAs por página de trabajo) |

## 4. Criterios de aceptación §8 → plan responsable

| # | Criterio de la auditoría | Plan | Verificación |
|---:|---|---|---|
| 1 | La página de trabajo cumple la promesa visible o la promesa se ajusta | 029 | Live ya muestra 10; 029 añade nota "proyectos públicos" + rol/fecha |
| 2 | `sitemap-0.xml` con grupo único, recíproco y `x-default` coherente | 025 | `node tests/sitemap-i18n.mjs` |
| 3 | Snippets de precio distinguen diagnóstico, construcción y retainer | 026 | Grupo `H-04` |
| 4 | Cada CTA identifica el servicio en su nombre visible o accesible | 027 | Grupo `H-03` |
| 5 | La raíz es redirect HTTP explícito o landing x-default real | 031 | Grupo `H-05` + `curl /` |
| 6 | Guías enlazadas desde home y servicios, con CTA contextual | 032 | Grupo `H-08` |
| 7 | La home inglesa muestra rangos o ejemplos USD verificables | 026 | Ya visibles; 026 mantiene el patrón por etapas |
| 8 | Casos públicos muestran problema, alcance, rol, resultado, fecha y evidencia, o declaran confidencialidad | 029 | Grupo `H-06` |
| 9 | El brief asocia errores por campo, usa `aria-invalid` y enfoca el primer error | 028 | `test-behavioral.mjs` (validación) |
| 10 | `/en/work/` y `/es/trabajo/` con jerarquía H1 → H2 → H3 | 030 | Grupo `H-09` |
| 11 | La raíz tiene schema de marca; las colecciones usan solo entidades visibles | 031 + 033 | Grupos `H-05` / `H-11` |
| 12 | `robots`, sitemap, canonicals, hreflang, `llms.txt` y códigos HTTP sincronizados | 025 + 034 | `tests/sitemap-i18n.mjs` + link audit + cierre 034 |

## 5. Serie de planes

| Plan | Título | Depende de | Estado |
|---|---|---|---|
| 024 | Reconciliación + response doc | — | DONE (2026-09-23) |
| 025 | Registro i18n de rutas + sitemap normalizado | — | DONE (2026-09-23) |
| 026 | Patrón de precios por etapas | — | DONE (2026-09-23) |
| 027 | CTAs accesibles + componente de CTA de guías | 026 | DONE (2026-09-23) |
| 028 | Errores accesibles por campo en el brief | — | DONE (2026-09-23) |
| 029 | Modelo de evidencia de casos (rol/fecha/CTA) | — | DONE (2026-09-23) |
| 030 | Secciones H2 temáticas en trabajo | 029 | DONE (2026-09-23) |
| 031 | Raíz como landing x-default bilingüe | 025 | DONE (2026-09-23) |
| 032 | Hub de guías + enlazado interno | 025, 027 | DONE (2026-09-23) |
| 033 | Paridad de datos estructurados | 025, 029 | DONE (2026-09-23) |
| 034 | Cierre de auditoría (verificación + llms + estado) | 025–033 | DONE (2026-09-23) |

Olas y gates: ver `plans/ROADMAP.md`.

## 6. Verificación de cierre (2026-09-23)

Cadena completa ejecutada sobre la rama actual:

| Comando | Resultado |
|---|---|
| `npm run check` | 0 errores, 0 warnings |
| `node tests/run.js` | 207/207 |
| `node tests/run.js --built` | 232/232 (incluye grupos `H-03`…`H-11`) |
| `node tests/sitemap-i18n.mjs` | PASS — 29 URLs agrupadas, reciprocidad y paridad HTML↔XML |
| `node test-htw-snapshot.mjs` | sin drift (EN 30 / ES 48 headings) |
| `node test-behavioral.mjs` | PASS — validación accesible del brief, single-submit, 500, móvil, filtros + grupos |
| `node scripts/check-links-seo.js` | 0 internos / 0 externos / 0 SEO |
| `node scripts/check-csp-hashes.mjs` | MATCH en `/` y `/en/` |

Criterios §8 de la auditoría, con evidencia:

| # | Criterio | Evidencia |
|---:|---|---|
| 1 | Trabajo cumple la promesa visible | 10 `project-title` por página (EN/ES) + nota "Diez proyectos públicos…" + rol/fecha por caso |
| 2 | Sitemap con grupo único, recíproco y `x-default` | `tests/sitemap-i18n.mjs` PASS (0 hreflang duplicados) |
| 3 | Precios distinguen diagnóstico/construcción/retainer | `H-04` 8/8; home ES muestra `Diagnóstico 3 UF · Construcción 30 UF` |
| 4 | Cada CTA identifica su servicio | 6 enlaces `svc-inline-cta` por locale con nombres accesibles únicos (`H-03`) |
| 5 | Raíz es landing x-default real | `dist/index.html`: 1 H1, 0 meta refresh, `WebSite`+`Organization`; `H-05` |
| 6 | Guías enlazadas desde home y servicios, con CTA | Hub `/es/guias/` + strip en home + footer; 2 CTAs por guía (`H-08`, `H-12`) |
| 7 | Home inglesa muestra USD verificable | `Diagnostic $290 · Build $1,500` en `/en/` |
| 8 | Casos con problema, alcance, rol, resultado, fecha y evidencia | 10 `project-meta` + 10 CTAs por página de trabajo (`H-06`) |
| 9 | Brief con errores por campo, `aria-invalid` y foco | `test-behavioral.mjs` caso de validación (0 POST inválido, foco + aria) |
| 10 | Trabajo con H1 → H2 → H3 | 1 H1 / 4 H2 / 10 H3 en ambos idiomas (`H-09`) |
| 11 | Schema de marca y colecciones con entidades visibles | Raíz `WebSite`/`Organization`; work `CollectionPage`+`ItemList` con nombres = H3 renderizados (`H-11`) |
| 12 | `robots`, sitemap, canonicals, hreflang, `llms.txt` y HTTP sincronizados | Validador de sitemap PASS, link checker 0/0/0, `llms.txt`/`llms-full.txt` actualizados (raíz, hub, patrón de precios) |

Pendiente de operador (no ejecutable desde el repo): validación post-deploy del
sitio en producción — códigos HTTP por ruta, cabecera CSP y hreflang live
(paso 5 del plan 034).

## 7. Notas de mantenimiento

- Este documento no se reescribe: los estados se actualizan fila por fila.
- Una futura auditoría genera su propio response doc y se contrasta contra los
  grupos de test `H-*` antes de planificar.
- Si un veredicto `stale` se contradice con evidencia live nueva, se reabre el
  finding con fecha y comando, nunca se borra la fila.
