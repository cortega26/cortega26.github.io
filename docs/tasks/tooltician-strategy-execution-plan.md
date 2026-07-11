# Plan de ejecución estratégica — Tooltician.com

Versión: `2026-06-30`
Estado: `Propuesto`
Ámbito: `tooltician.com` — consolidación de la plataforma de servicios y cierre de fugas de conversión/medición.
Objetivo primario: convertir una plataforma de servicios ya bien construida en una **máquina de confianza medible**, sin cambiar la dirección estratégica.
Responsable: `Carlos Ortega` (ejecución en solitario; el plan está escrito para ser ejecutable por una sola persona o por un agente).

> **Cómo leer este documento.** Es autocontenido: no requiere abrir la auditoría ni otros docs para ejecutarse. Cada tarea trae archivos, cambio mínimo, criterio de aceptación, verificación, métrica y riesgo. Las fases se ejecutan en orden; dentro de una fase, máximo 3 tareas activas. Actualiza los scoreboards (§5, §6) y el registro de decisiones (§11) a medida que avanzas: ese es el rastro de auditoría.

---

## 1. Contexto estratégico (resumen autocontenido)

**Tesis.** Tooltician.com ya **es** una plataforma de servicios técnicos productizados sobre una marca personal, con el portfolio como prueba de capacidad. No es un portfolio, ni un CV, ni un hub de productos. Esta dirección está construida en el código (5 landings de servicio con precios UF/USD, funnel de scoping pagado, Calendly + Formspree) y documentada en decisiones previas (`docs/tooltician-repositioning-audit.md`, `docs/tasks/services-catalog-proposal.md`).

**Decisión.** No se cambia el rumbo. Se **consolida y se hace medible**.

**Las tres fugas que este plan cierra:**

1. **🔴 La conversión no se mide.** `public/assets/js/track.js` es un *no-op*: reenvía eventos a `window.plausible` y `window.dataLayer`, que no existen. La analítica instalada (Ahrefs, en `src/layouts/BaseLayout.astro`) solo cuenta páginas vistas. Todos los eventos `data-track` ya instrumentados (CTAs, formularios) **van al vacío**. Hoy es imposible saber qué convierte.
2. **🟠 La ruta de empleador está abandonada a medias.** Existe `public/assets/docs/carlos-ortega-resume.pdf` pero **no está enlazado en ningún componente**. No hay trayectoria ni señal para reclutadores.
3. **🟠 La home repite la misma prueba.** `ResultsBand`, `Portfolio`, `Proof` y `ServiceSpotlight` muestran las mismas señales (Ébano, bankrecon, A+ headers). El backlog previo ya marca `TT-017` como pendiente.

**Lo que NO se hace (decisiones cerradas, ver §11):** no blog, no hub de productos, no subdominios, no CV como eje, no nuevos servicios, no rediseño visual, no tocar precios sin datos.

**Criterio de cierre del programa:** al terminar, cada CTA emite un evento capturado en un panel; existe una ruta de empleador de baja fricción; cada sección de la home aporta prueba única; y hay al menos un caso de estudio real que sustituye el "aún no hay testimonios".

---

## 2. Principios de operación

- Optimizar para `claridad`, `confianza`, `conversión medible` y `mantenibilidad para una persona`.
- Preferir `cambios incrementales` sobre rediseños especulativos.
- **Medir antes de optimizar.** Ninguna decisión de precio/copy/estructura se toma sin datos de eventos.
- Cada cambio debe dejar el sitio `desplegable` y `medible`.
- No agregar superficie (páginas, secciones) sin propósito de conversión o evidencia claro.
- Bilingüe siempre: todo cambio de copy se aplica en `EN` y `ES`.
- No romper rutas, JSON-LD, hreflang ni el funnel existente.

---

## 3. Modelo de entrega

### 3.1 Fases (orden estricto)

0. `Fase 0 — Medición` (desbloqueante; nada se optimiza sin esto)
1. `Fase 1 — Ruta de empleador` (bajo riesgo, alto valor)
2. `Fase 2 — Consolidación de home` (desduplicación)
3. `Fase 3 — Profundizar evidencia` (casos de estudio)
4. `Fase 4 — Ecosistema y GEO` (back-links + validación schema)
5. `Fase 5 — Optimización con datos` (bloqueada hasta tener ≥30 días de eventos)

**Por qué este orden:** la Fase 0 vuelve visible todo lo demás; sin ella, las fases 1–4 se ejecutan a ciegas. Las fases 1–2 son de bajo riesgo y alto retorno inmediato. La 3 fortalece la prueba. La 4 recupera sinergia. La 5 solo tiene sentido con datos reales.

### 3.2 Límites de trabajo en progreso (WIP)

- Nunca más de `1 fase activa`.
- Nunca más de `3 tareas activas` dentro de una fase.
- No iniciar una fase si la anterior no pasó su `exit gate`.

### 3.3 Ciclo por tarea

1. confirmar baseline actual (lo que el archivo hace hoy)
2. implementar el cambio mínimo coherente
3. validar (`npm run build` + verificación específica de la tarea)
4. registrar la métrica/estado en el scoreboard
5. recién entonces pasar a la siguiente tarea

### 3.4 Exit gate por fase

Cada fase debe cumplir todo esto antes de la siguiente:

- `npm run build` pasa sin errores nuevos.
- No hay errores nuevos de consola.
- No hay overflow horizontal en breakpoints requeridos (§13.1).
- La navegación por teclado no se rompe.
- Los enlaces principales y el funnel siguen funcionando.
- El scoreboard de la fase (§6) quedó actualizado.

### 3.5 Cadencia de gobierno

| Cadencia | Propósito | Salida |
|---|---|---|
| Inicio de fase | confirmar alcance y métricas de éxito | checklist de fase |
| Fin de sesión | registrar estado, bloqueos, siguiente acción | scoreboard de sesión (§14) |
| Fin de fase | go/no-go a la siguiente | revisión de exit gate |
| Fin de programa | validación final | checklist de release |

---

## 4. Catálogo de eventos (especificación de instrumentación)

Esta es la **fuente única de verdad** de la analítica. Nomenclatura: `snake_case`, con `location` (de `data-track-loc`) para segmentar. El objetivo es que el panel pueda responder *qué CTA, en qué sección, en qué idioma* genera contacto.

| Evento | Disparador | `location` esperados | Estado actual | Acción |
|---|---|---|---|---|
| `cta_book_call` | Click a Calendly | `hero`, `contact`, `intake_*`, `<slug>_brief`, `htw_brief` | ✅ emitido | Verificar captura (Fase 0) |
| `cta_send_brief` | Click a "enviar brief" | `hero` | 🟡 parcial (solo hero) | Extender a Navbar CTA |
| `proof_verify` | Click "comprobar" en ResultsBand | `results_band` | ✅ emitido | Verificar captura |
| `intent_select` | Click a intent en página de servicio | `<slug>_<index>` | ✅ emitido | Verificar captura |
| `form_start` | Primera interacción con IntakeForm | `intake_*` | ✅ emitido (intake-form.js) | Verificar captura |
| `form_submit_success` | Envío Formspree OK | `intake_*` | ✅ emitido | Verificar captura |
| `form_submit_error` | Envío Formspree falla | `intake_*` | ✅ emitido | Verificar captura |
| `cta_view_service` | Click en card de Services / "Ver servicio" | `services_<slug>` | 🔴 falta | Añadir (TS-003) |
| `price_chip_click` | Click en `shape-chip` de precio | `services_shapes` | 🔴 falta | Añadir (TS-003) |
| `cta_service_primary` | CTA primario del hero de ServicePage | `<slug>_hero` | 🔴 falta | Añadir (TS-003) |
| `outbound_repo` | Click a repo GitHub (portfolio/proof) | `portfolio_<id>`, `proof_<id>` | 🔴 falta | Añadir (TS-004) |
| `outbound_product` | Click a producto vivo (Ébano/Monedario/Noticiencias) | `portfolio_<id>` | 🔴 falta | Añadir (TS-004) |
| `cta_download_cv` | Descarga del CV | `about`, `footer` | 🔴 falta (CV no enlazado) | Añadir (TS-006) |

> Regla: **no inventar eventos nuevos fuera de este catálogo** sin registrarlos aquí primero. Mantener ≤ ~15 eventos para que el panel siga siendo legible.

---

## 5. Program scoreboard (panel de control)

| Dimensión | Baseline (2026-06-30) | Objetivo | Estado | Notas |
|---|---|---|---|---|
| Eventos de conversión capturados | `0` (no-op) | `100% del catálogo §4` | `Pendiente` | Fase 0 |
| Panel de analítica de eventos | `ninguno` (solo Ahrefs pageviews) | `1 panel cookieless` | `Pendiente` | Fase 0 |
| Ruta de empleador | `inexistente` (CV huérfano) | `CV enlazado + trayectoria` | `Pendiente` | Fase 1 |
| Redundancia de prueba en home | `alta` (4 secciones repiten) | `cada sección aporta prueba única` | `Pendiente` | Fase 2 (cierra TT-017) |
| Casos de estudio reales | `0` ("aún no hay testimonios") | `≥1` | `Pendiente` | Fase 3 |
| Back-links desde productos propios | `0` medibles | `3 con UTM` | `Pendiente` | Fase 4 |
| JSON-LD de servicios | `Service+FAQPage+BreadcrumbList` ✅ | `validado en Rich Results` | `Por validar` | Fase 4 |
| Search Console conectado | `desconocido` | `conectado + sitemap enviado` | `Pendiente` | Fase 0 |

---

## 6. Fases detalladas

> Convención de estado por tarea: `Pendiente` · `En curso` · `Hecho` · `Bloqueado`. Prioridad: `P1` (desbloqueante) · `P2` · `P3`. Esfuerzo: `S`/`M`/`L`.

### Fase 0 — Medición *(desbloqueante)*

Objetivo: que cada evento del catálogo §4 se registre en un panel consultable. Sin esto, ninguna otra fase puede evaluarse.

| ID | Tarea | P | Esf. | Archivos | Cambio mínimo | Criterio de aceptación | Verificación | Estado |
|---|---|---|---|---|---|---|---|---|
| `TS-001` | Elegir y conectar analítica de eventos cookieless | `P1` | `S` | `src/layouts/BaseLayout.astro`, `public/assets/js/track.js` | Añadir el script del proveedor (recomendado: Plausible, cookieless, sin banner) y dejar que `track.js` reenvíe a `window.plausible` (ya lo hace) | Un click en el CTA del hero aparece como `cta_book_call` en el panel del proveedor | Abrir preview, click en hero CTA, ver el evento en el panel / Network | `Bloqueado` (código listo; falta paso manual externo, ver nota) |
| `TS-002` | Conectar Google Search Console + reenviar sitemap | `P1` | `S` | DNS/dominio, `astro.config.mjs` (sitemap ya configurado) | Verificar propiedad de dominio y enviar `sitemap-index.xml` | Search Console muestra el sitio verificado y el sitemap aceptado | Panel de Search Console | `Bloqueado` (sin cambios de código; falta verificación DNS manual, ver nota) |
| `TS-003` | Instrumentar CTAs comerciales faltantes | `P1` | `M` | `src/components/ServicesSection.astro`, `src/components/ServicePage.astro` | Añadir `data-track="cta_view_service"`/`price_chip_click`/`cta_service_primary` con `data-track-loc` según §4 | Cada card, chip de precio y CTA de servicio emite su evento | Click en cada elemento → evento en panel; `grep data-track` cubre §4 | `Pendiente` |
| `TS-004` | Instrumentar enlaces salientes de evidencia | `P2` | `M` | `src/components/PortfolioSection.astro`, `src/components/ProofSection.astro` | Añadir `outbound_repo`/`outbound_product` por proyecto (usar `proj.id`) | Click a repo/producto emite evento con `location` del proyecto | Click → evento; revisar 3 proyectos | `Pendiente` |
| `TS-005` | Test de humo de instrumentación | `P2` | `M` | nuevo `test-tracking.mjs` (patrón de `test-filters.mjs`) | Script Playwright que inyecta un stub de `window.plausible`, hace click en CTAs clave y afirma que se dispararon los eventos esperados | El test pasa para hero, contact, services y portfolio | `node test-tracking.mjs` contra `npm run preview` | `Pendiente` |

> **Nota `TS-001` (2026-06-30):** código conectado — `BaseLayout.astro` carga `https://plausible.io/js/script.js` con `data-domain="tooltician.com"` y el stub de cola `window.plausible` (evita perder eventos disparados antes de que cargue el script). Verificado en preview: el script responde 200, sin errores de consola, el CTA del hero (`data-track="cta_book_call"` `data-track-loc="hero"`) existe y `window.plausible` queda definido como función. **Quedan dos pasos manuales fuera del repo que el agente no puede ejecutar:** (1) crear/verificar el sitio `tooltician.com` en `plausible.io` (cuenta del usuario); (2) actualizar la regla de Cloudflare con la CSP ya editada en `docs/cloudflare-security-headers.md` (agrega `https://plausible.io` a `script-src` y `connect-src`) — sin esto el script se bloquea en producción. Hasta que ambos se completen, el evento no aparecerá en el panel real; el criterio de aceptación de la tarea sigue sin cumplirse.
>
> **Decisión de proveedor:** el usuario no decidió proveedor en el momento de ejecutar esta tarea; se usó Plausible Cloud por ser la recomendación del plan (cookieless, sin banner, ya referenciado en `track.js`/CHANGELOG). Si se opta por self-hosted u otro proveedor, ajustar el `src`/`data-domain` en `BaseLayout.astro` y la CSP correspondiente.
>
> **Nota `TS-002` (2026-06-30):** baseline confirmado — `astro.config.mjs` ya genera `https://tooltician.com/sitemap-index.xml` (referencia a `sitemap-0.xml`) con alternates `en`/`es` correctos; no requirió ningún cambio de código. El usuario eligió verificación de dominio por **registro TXT en DNS** (cubre todos los subdominios/protocolos, no toca el repo). Esta tarea es **100% manual, fuera del alcance del agente** (no hay acceso a la cuenta de Google ni al panel DNS/Cloudflare del usuario). Pasos pendientes para el usuario:
> 1. En [Google Search Console](https://search.google.com/search-console) → Agregar propiedad → tipo **Dominio** → `tooltician.com`.
> 2. Copiar el valor TXT que entrega Google y agregarlo como registro `TXT` en la zona DNS de `tooltician.com` (Cloudflare).
> 3. Esperar propagación DNS y pulsar "Verificar" en Search Console.
> 4. Una vez verificado, ir a `Sitemaps` → enviar `sitemap-index.xml` (URL completa: `https://tooltician.com/sitemap-index.xml`).
> 5. Confirmar en el panel que el sitemap fue aceptado y que aparecen las URLs indexadas.

**Exit gate Fase 0:** todos los eventos del catálogo §4 marcados ✅ se ven en el panel; `TS-005` pasa; Search Console verificado. Anotar fecha de cierre — desde aquí corre la ventana de ≥30 días que desbloquea la Fase 5.

---

### Fase 1 — Ruta de empleador *(bajo riesgo, alto valor)*

Objetivo: abrir **una sola** ruta de baja fricción para reclutadores sin contaminar el mensaje comercial. No crear página "CV".

| ID | Tarea | P | Esf. | Archivos | Cambio mínimo | Criterio de aceptación | Verificación | Estado |
|---|---|---|---|---|---|---|---|---|
| `TS-006` | Enlazar el CV con tracking | `P1` | `S` | `src/components/AboutSection.astro`, `src/components/Footer.astro`, `public/assets/docs/carlos-ortega-resume.pdf` | Botón "Descargar CV" en About y enlace en Footer, con `data-track="cta_download_cv"` | El CV es accesible desde la home en ≤2 clicks y la descarga emite evento | Click → descarga + evento; EN y ES | `Pendiente` |
| `TS-007` | Bloque "Trayectoria" comprimido en About | `P2` | `M` | `src/components/AboutSection.astro` | Añadir 3–4 hitos verificables (rol, periodo, resultado) como subnarrativa, sin convertir About en CV literal | Un reclutador entiende experiencia y profundidad sin salir de la home | Revisión visual EN/ES; no rompe layout de las 3 cards | `Pendiente` |
| `TS-008` | Reforzar enlaces a GitHub/LinkedIn como señal de empleo | `P3` | `S` | `src/components/AboutSection.astro`/`Footer.astro` | Asegurar que GitHub/LinkedIn estén presentes y trackeados desde la zona de trayectoria | Clicks a perfiles medibles | Click → evento | `Pendiente` |

**Exit gate Fase 1:** CV descargable y medido en EN/ES; trayectoria visible sin romper el eje comercial; el H1 del hero **no** se modificó (la ruta de empleador es secundaria, no primaria).

---

### Fase 2 — Consolidación de home *(desduplicación)*

Objetivo: que cada sección de la home aporte prueba única. Cierra `TT-017` del backlog previo.

| ID | Tarea | P | Esf. | Archivos | Cambio mínimo | Criterio de aceptación | Verificación | Estado |
|---|---|---|---|---|---|---|---|---|
| `TS-009` | Mapear solapamientos de prueba | `P1` | `S` | `ResultsBand`, `PortfolioSection`, `ProofSection`, `ServiceSpotlight` | Inventario: qué señal aparece en qué sección | Tabla de solapamiento acordada antes de editar | Documento corto en este archivo (§ anexo) | `Pendiente` |
| `TS-010` | Asignar un rol único por sección | `P1` | `M` | mismos | ResultsBand = cifras duras; Portfolio = problema→solución→resultado; Proof = profundidad técnica (CI/packaging); Spotlight = oferta destacada | Ninguna de las 4 señales clave (Ébano, bankrecon, A+ headers) se repite con el mismo framing | Revisión visual; `grep` de cadenas repetidas | `Pendiente` |
| `TS-011` | Revisar densidad/orden de la home | `P2` | `M` | `src/pages/en/index.astro`, `src/pages/es/index.astro` | Confirmar que el orden proof-first sigue siendo coherente tras desduplicar; recortar lo que sobre | Home se entiende en ≤5s; sin secciones redundantes | Revisión en breakpoints §13.1 | `Pendiente` |

**Exit gate Fase 2:** sin repetición de la misma prueba con el mismo encuadre; home desplegable y más liviana de leer; `TT-017` marcado como cerrado en `docs/tasks/tooltician-refresh-backlog.md`.

---

### Fase 3 — Profundizar evidencia *(casos de estudio)*

Objetivo: sustituir "aún no hay testimonios" por narrativa real de resultados. No inventar datos.

| ID | Tarea | P | Esf. | Archivos | Cambio mínimo | Criterio de aceptación | Verificación | Estado |
|---|---|---|---|---|---|---|---|---|
| `TS-012` | Caso de estudio #1 — El Rincón de Ébano | `P1` | `M` | nuevo contenido (componente o sección dedicada) | Estructura problema → intervención → resultado verificable (0 caídas / 14 meses / 100+ SKUs) | Un cliente potencial ve un resultado concreto con contexto, no solo una cifra suelta | Revisión EN/ES; enlace vivo válido | `Pendiente` |
| `TS-013` | Casos #2 y #3 (chile-hub, Conciliador Bancario) | `P2` | `M` | mismo patrón | Reusar el formato de #1 | 3 casos publicados con evidencia enlazable | `check-links-seo.js` sin enlaces rotos | `Pendiente` |
| `TS-014` | Conectar casos al funnel | `P2` | `S` | casos + `ContactSection`/servicios | CTA contextual desde cada caso al servicio relacionado, trackeado | Cada caso ofrece un siguiente paso medible | Click → evento | `Pendiente` |

**Exit gate Fase 3:** ≥1 caso real publicado y conectado al funnel; sin afirmaciones no verificables.

---

### Fase 4 — Ecosistema y GEO

Objetivo: recuperar sinergia con los productos propios y validar la capa semántica ya existente.

| ID | Tarea | P | Esf. | Archivos | Cambio mínimo | Criterio de aceptación | Verificación | Estado |
|---|---|---|---|---|---|---|---|---|
| `TS-015` | Back-links contextuales desde productos | `P2` | `M` | repos/sitios externos (chile-hub, Monedario, Noticiencias) | Enlace "construido por Tooltician" con UTM (`?utm_source=<producto>`) | Tráfico referido medible desde cada producto | Aparece `outbound`/referido en panel | `Pendiente` |
| `TS-016` | Validar JSON-LD de servicios | `P2` | `S` | `src/components/ServicePage.astro` (ya emite Service+FAQPage+BreadcrumbList) | Pasar las 5 landings por el validador de Rich Results | 0 errores de schema en las 10 URLs (5×2 idiomas) | Rich Results Test / Search Console | `Pendiente` |
| `TS-017` | Revisar `llms.txt` / `llms-full.txt` y OG | `P3` | `S` | `public/llms.txt`, `public/llms-full.txt`, OG en `BaseLayout` | Confirmar que reflejan los 5 servicios y los casos nuevos | Archivos consistentes con el sitio actual | Revisión manual | `Pendiente` |

**Exit gate Fase 4:** 3 back-links con UTM activos; schema validado sin errores; GEO consistente.

---

### Fase 5 — Optimización con datos *(bloqueada)*

⛔ **No iniciar antes de ~`2026-08-15`** ni con menos de 30 días de datos de eventos desde el cierre de la Fase 0.

Objetivo: tomar con datos las decisiones que hoy serían adivinanzas.

| ID | Tarea | P | Esf. | Entrada requerida | Decisión que habilita | Estado |
|---|---|---|---|---|---|---|
| `TS-018` | Análisis de funnel por audiencia/idioma | `P1` | `M` | ≥30 días de eventos | Qué CTA priorizar; dónde se abandona | `Bloqueado` |
| `TS-019` | Decidir página resumen `/servicios/` `/services/` | `P2` | `M` | queries de Search Console hacia URLs inexistentes | Crear solo si hay demanda orgánica real | `Bloqueado` |
| `TS-020` | Revisar precios EN premium | `P2` | `S` | conversión por idioma | Ajustar el premium USD solo con evidencia | `Bloqueado` |

**Exit gate Fase 5:** cada decisión registrada en §11 con el dato que la respalda.

---

## 7. Master backlog (lista plana para tickets)

| ID | Fase | Área | Tarea | P | Impacto | Esf. | Estado |
|---|---|---|---|---|---|---|---|
| `TS-001` | 0 | Medición | Conectar analítica de eventos cookieless | `P1` | muy alto | `S` | `Bloqueado` (código listo; falta crear cuenta Plausible + aplicar CSP en Cloudflare) |
| `TS-002` | 0 | SEO | Conectar Search Console + sitemap | `P1` | alto | `S` | `Bloqueado` (100% manual: verificación DNS TXT + envío de sitemap pendientes del usuario) |
| `TS-003` | 0 | Medición | Instrumentar CTAs comerciales faltantes | `P1` | alto | `M` | `Pendiente` |
| `TS-004` | 0 | Medición | Instrumentar enlaces salientes de evidencia | `P2` | medio | `M` | `Pendiente` |
| `TS-005` | 0 | QA | Test de humo de instrumentación | `P2` | medio | `M` | `Pendiente` |
| `TS-006` | 1 | Empleador | Enlazar CV con tracking | `P1` | alto | `S` | `Pendiente` |
| `TS-007` | 1 | Empleador | Bloque "Trayectoria" en About | `P2` | alto | `M` | `Pendiente` |
| `TS-008` | 1 | Empleador | Reforzar GitHub/LinkedIn trackeados | `P3` | bajo | `S` | `Pendiente` |
| `TS-009` | 2 | Contenido | Mapear solapamientos de prueba | `P1` | medio | `S` | `Pendiente` |
| `TS-010` | 2 | Contenido | Rol único por sección | `P1` | alto | `M` | `Pendiente` |
| `TS-011` | 2 | IA | Revisar densidad/orden de home | `P2` | medio | `M` | `Pendiente` |
| `TS-012` | 3 | Prueba | Caso de estudio #1 (Ébano) | `P1` | alto | `M` | `Pendiente` |
| `TS-013` | 3 | Prueba | Casos #2 y #3 | `P2` | medio | `M` | `Pendiente` |
| `TS-014` | 3 | Conversión | Conectar casos al funnel | `P2` | medio | `S` | `Pendiente` |
| `TS-015` | 4 | Ecosistema | Back-links con UTM desde productos | `P2` | medio | `M` | `Pendiente` |
| `TS-016` | 4 | SEO | Validar JSON-LD de servicios | `P2` | medio | `S` | `Pendiente` |
| `TS-017` | 4 | GEO | Revisar llms.txt / OG | `P3` | bajo | `S` | `Pendiente` |
| `TS-018` | 5 | Datos | Análisis de funnel | `P1` | alto | `M` | `Bloqueado` |
| `TS-019` | 5 | SEO | Decidir página resumen de servicios | `P2` | medio | `M` | `Bloqueado` |
| `TS-020` | 5 | Pricing | Revisar premium EN | `P2` | medio | `S` | `Bloqueado` |

**Secuencia recomendada:** `TS-001 → TS-002 → TS-003 → TS-004 → TS-005` (gate) → `TS-006 → TS-007 → TS-008` (gate) → `TS-009 → TS-010 → TS-011` (gate) → `TS-012 → TS-013 → TS-014` (gate) → `TS-015 → TS-016 → TS-017` (gate) → esperar datos → `TS-018 → TS-019 → TS-020`.

---

## 8. KPIs y definición de éxito

**Métricas accionables (decisiones):**

| KPI | Definición | Cómo se captura | Meta inicial |
|---|---|---|---|
| Leads cualificados | `form_submit_success` + `cta_book_call` | Panel de eventos | Establecer baseline en mes 1, luego crecer |
| CTR de CTA por ubicación | eventos `cta_*` / páginas vistas de la sección | Panel + Ahrefs | Comparar hero vs contact vs services |
| Conversión por idioma | leads EN vs ES | `location`/segmento idioma | Detectar dónde rinde el premium |
| Descargas de CV | `cta_download_cv` | Panel | Señal de demanda de empleo |
| Impresiones/CTR de landings de servicio | Search Console | Search Console | Validar SEO comercial |
| Tráfico referido desde productos | `utm_source` por producto | Panel/referidos | >0 medible tras Fase 4 |

**Métricas vanidosas (solo contexto, no deciden):** stars de GitHub, páginas vistas totales, tiempo en página sin acción asociada.

---

## 9. Protocolo de validación y comandos

### 9.1 Breakpoints requeridos

`360x800`, `390x844` (o `414x896`), `768x1024`, `1366x900`, `1920x1080`.

### 9.2 Validaciones tras cualquier cambio de UI/copy

- Revisar home y página afectada en los breakpoints requeridos.
- Confirmar: sin overflow horizontal, nav OK desktop/móvil, foco de teclado visible, funnel intacto.
- Confirmar EN y ES.
- `npm run build`.

### 9.3 Validaciones de instrumentación (Fase 0)

- Con `npm run preview`, inyectar stub `window.plausible` y verificar que los eventos de §4 se disparan en cada CTA.
- `node test-tracking.mjs` (a crear en `TS-005`) en verde.

### 9.4 Comandos

```bash
# Build (incluye fetch de stats de GitHub)
npm run build

# Preview local para tests de humo
npm run preview            # o: npx serve dist

# Tests de humo existentes
node test-filters.mjs
node test-prod.mjs
node test-visual.mjs

# Verificación de enlaces y SEO sobre dist/
node scripts/check-links-seo.js
```

---

## 10. Definición de "Hecho" (DoD)

Una tarea está hecha solo si:

- la implementación está completa en `EN` y `ES`;
- `npm run build` pasa;
- los breakpoints afectados fueron revisados;
- no se introdujo regresión de UX ni se rompió el funnel;
- si toca instrumentación: el evento aparece en el panel y queda reflejado en §4;
- si toca enlaces: `check-links-seo.js` no reporta roturas;
- el scoreboard (§5/§6) y, si aplica, el registro de decisiones (§11) fueron actualizados.

---

## 11. Registro de decisiones (auditable)

### Decisiones cerradas (no reabrir sin evidencia nueva)

| Fecha | Decisión | Razón |
|---|---|---|
| `2026-06-30` | Dirección = plataforma de servicios productizados con portfolio como prueba | Ya construido y validado en el repo; domina la matriz de priorización |
| `2026-06-30` | NO convertir el sitio en CV web | Mataría la intención comercial; el CV va como activo secundario |
| `2026-06-30` | NO hub de productos | Los productos no comparten narrativa de usuario; mejor como evidencia |
| `2026-06-30` | NO blog/newsletter ni subdominios | Deuda de mantenimiento para una persona, sin estrategia editorial |
| `2026-06-30` | Medir antes de optimizar precios/estructura | El tracking actual es no-op; decidir sin datos es adivinar |

### Decisiones abiertas (resolver con datos en Fase 5)

| ID | Pregunta | Dato que la desbloquea |
|---|---|---|
| `D-1` | ¿Crear página resumen `/servicios/`? | queries orgánicas a URLs inexistentes en Search Console |
| `D-2` | ¿Ajustar el premium USD de EN? | conversión por idioma |
| `D-3` | ¿Qué CTA priorizar en el hero? | CTR comparado de `cta_book_call` vs `cta_send_brief` |

---

## 12. Mapa de archivos (referencia rápida)

| Área | Archivo |
|---|---|
| Tracking (no-op a conectar) | `public/assets/js/track.js` |
| Shell SEO/analytics | `src/layouts/BaseLayout.astro` |
| Home (rutas) | `src/pages/en/index.astro`, `src/pages/es/index.astro` |
| Hero / CTAs principales | `src/components/HeroSection.astro` |
| Prueba dura | `src/components/ResultsBand.astro` |
| Portfolio | `src/components/PortfolioSection.astro` |
| Servicios (home) | `src/components/ServicesSection.astro` |
| Landings de servicio | `src/components/ServicePage.astro` + `src/data/services.ts` |
| Formulario | `src/components/IntakeForm.astro` + `public/assets/js/intake-form.js` |
| Contacto | `src/components/ContactSection.astro` |
| About / ruta empleador | `src/components/AboutSection.astro` |
| Footer (legal, social, CV) | `src/components/Footer.astro` |
| CV (huérfano) | `public/assets/docs/carlos-ortega-resume.pdf` |
| GEO | `public/llms.txt`, `public/llms-full.txt` |
| Legal/engagement (dinámico) | `src/pages/[lang]/[document].astro` + `src/data/siteDocuments.ts` |

---

## 13. Registro de riesgos

| Riesgo | Probabilidad | Impacto | Mitigación |
|---|---|---|---|
| Seguir optimizando a ciegas | Alta (es el estado actual) | Alto | Fase 0 primero; nada se decide sin eventos |
| La ruta de empleador diluye el eje comercial | Media | Medio | Contener CV/trayectoria en About; no tocar el H1 |
| Desduplicar elimina señales fuertes | Media | Medio | Mapear antes de editar (`TS-009`); rol único, no borrado |
| Casos de estudio con datos no verificables | Baja | Alto | Solo cifras comprobables; enlaces vivos |
| Doble analítica (Ahrefs + nuevo) confunde | Baja | Bajo | Definir Ahrefs=pageviews, nuevo=eventos; documentar |
| Back-links externos descoordinados | Media | Bajo | UTM por producto; un commit por repo |
| Sobrecarga de mantenimiento | Media | Medio | WIP ≤1 fase; no agregar superficie sin propósito |

---

## 14. Plantilla de scoreboard de sesión

| Fecha | Fase activa | Tareas tocadas | Build | Breakpoints | Eventos capturados | Bloqueos | Siguiente acción |
|---|---|---|---|---|---|---|---|
| `2026-06-30` | `Fase 0` | — (plan creado) | `n/a` | `n/a` | `0` | `ninguno` | `Iniciar TS-001` |
| `2026-06-30` | `Fase 0` | `TS-001` | `Pass` | `n/a (sin cambio visual)` | `0` (script conectado, panel no verificado — falta cuenta Plausible + CSP Cloudflare) | `cuenta Plausible y aprobación de regla CSP en Cloudflare están fuera del repo, requieren acción del usuario` | Crear/verificar tooltician.com en plausible.io y aplicar la CSP actualizada en Cloudflare; luego confirmar `cta_book_call` en el panel y seguir con TS-002 |
| `2026-06-30` | `Fase 0` | `TS-002` | `n/a (sin cambio de código)` | `n/a` | `0` | `verificación DNS TXT en Cloudflare y envío del sitemap en Search Console son 100% manuales, fuera del repo` | Agregar el TXT de Search Console al DNS de tooltician.com, verificar, y enviar `https://tooltician.com/sitemap-index.xml`; luego seguir con TS-003 |
| `YYYY-MM-DD` | `Fase X` | `TS-00x` | `Pass/Fail` | `OK/Issue` | `lista` | `nota` | `un solo siguiente paso` |

---

## 15. Fuera de alcance (explícito — "no ahora")

- Blog, newsletter o contenido recurrente.
- Hub/landing de productos propios.
- Subdominios o separación de dominios por intención.
- Página "CV" dedicada.
- Nuevos servicios más allá de los 5 actuales.
- Rediseño visual o cambio de design system.
- Cambios de precio sin datos de conversión (ver `D-2`).

---

## 16. Autoalineación (para ejecución por agente)

Antes de empezar a ejecutar este plan:

1. Confirma el baseline real de la tarea leyendo el archivo objetivo (no asumas el estado descrito aquí si pasó tiempo).
2. Mantén `todo.md` propio derivado del master backlog (§7); marca avance por tarea.
3. Tras cada cambio significativo: `npm run build` + la verificación de la tarea + actualizar el scoreboard de sesión (§14).
4. Respeta los WIP limits (§3.2) y los exit gates (§3.4). No saltes la Fase 0.
5. Cada ~5 tareas, relee §1 y §11 para confirmar que el trabajo sigue alineado con la dirección y no reabre decisiones cerradas.
6. No pidas aclaraciones sobre lo que puedas resolver leyendo el código y ejecutando las verificaciones. Empieza por `TS-001`.
