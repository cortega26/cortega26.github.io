# Reporte de integración — Launch Handoff de Tooltician Soporte

> **Fecha:** 2026-09-27
> **Branch:** `feat/tooltician-support-v1`
> **Alcance:** integración y verificación de `docs/support/TOOLTICIAN_SUPPORT_LAUNCH_HANDOFF.md`
> **Naturaleza del cambio:** sólo documentación (docs-only). Sin cambios en código de producto.

---

## Estado encontrado

- **HEAD inicial:** `56d5667` — `feat(support): polish prelaunch SEO trust and UX`
- **Working tree inicial:** limpio, salvo un único archivo sin trackear:
  `docs/support/TOOLTICIAN_SUPPORT_LAUNCH_HANDOFF.md`
- **PR #72:** `OPEN`, **`isDraft: true`**, `mergedAt: null`, `headRefOid`
  sincronizado con HEAD, `mergeable: MERGEABLE`,
  `mergeStateStatus: **UNSTABLE**` (check `Codacy Static Code Analysis` en
  `ACTION_REQUIRED`)

### Nota de ruta

El archivo no estaba en `docs/support/LAUNCH_HANDOFF.md`, como indicaba el
encargo, sino en:

```text
docs/support/TOOLTICIAN_SUPPORT_LAUNCH_HANDOFF.md
```

El propio handoff se auto-referenciaba con la ruta inexistente
`docs/support/LAUNCH_HANDOFF.md` (§25), de modo que el error era interno al
documento, no sólo del encargo.

---

## Discrepancias encontradas

### Entre handoff y repo

| # | Afirmación del handoff | Realidad verificada |
|---|---|---|
| 1 | HEAD `ae94465` | `56d5667` — el handoff quedó un commit atrás |
| 2 | Deployment `ed981fdc` «para `ae94465`» | `ed981fdc` es de `5ab2ec3` y sirve el banner viejo «Precios propuestos». **El ID y el commit no correspondían** |
| 3 | Sin registro del deployment vigente | El vigente es `5f0f65da`. Además su campo `Source` dice `ae94465` pero **sirve el contenido de `56d5667`** (verificado contra el HTML remoto) |
| 4 | Run de CI `36334228951` | Pertenece a `ae94465`. El vigente es `36336869351` |
| 5 | §12 SEO y §13 UX/UI como backlog abierto | **Todo P0 y P1 ya está implementado** en `56d5667` y fijado por `support/tests/artifact.test.ts` |
| 6 | §25 se referencia como `docs/support/LAUNCH_HANDOFF.md` | Ruta inexistente |
| 7 | §28 pide «ejecutar sprint de polish SEO/UX/trust» | Ya ejecutado en `56d5667` |
| 8 | «el CI está verde» | El workflow propio sí; el PR **no** es merge-ready (draft + Codacy) |
| 9 | §2.4/§20 no documentan el gate de build | `support/astro.config.ts` lanza `Error` con `SUPPORT_RELEASE=1`. El build de release **falla hoy**, a propósito |

### Entre handoff y PR

El documento no mencionaba en ningún punto que **PR #72 está en draft** ni el
check de Codacy en `ACTION_REQUIRED`, pese a que §19 y §20 describen el merge
como un paso casi inmediato. Un agente que hubiera seguido §20 habría llegado al
merge sin saber que el PR no era mergeable ni estaba listo para revisión.

### Correcto y NO tocado

Verificado como exacto y vigente, por lo que no se modificó:

- los 10 precios (coinciden con `support/src/config.ts` y con aserciones de
  `support/tests/unit.test.ts`);
- `confirmed.municipalPermit = false`;
- ausencia de recargo de tarjeta — el 3% propuesto se había eliminado en
  `dd1d1f6` y hoy una aserción lo impide;
- rutas públicas y el `404.html`;
- cabeceras de seguridad y CSP, byte a byte;
- ventanas de retención (90 días / 12 meses);
- redacción del régimen tributario;
- todas las garantías del preview verificadas contra el host real.

---

## Cambios realizados al handoff

- **Cabecera** con HEAD, deployment, CI y PR reales; `municipalPermit`,
  producción y DNS explícitos en tabla.
- **Taxonomía** DONE / CURRENT BLOCKER / PRE-LAUNCH BACKLOG / POST-LAUNCH /
  FUTURE B2B definida en §0 y aplicada en todas las secciones.
- **§2.5** CI corregido, con desglose de estado a nivel de workflow frente a
  estado a nivel de PR.
- **§2.6 (nuevo)** los dos puntos de enforcement del gate de lanzamiento.
- **§2.7** (antes 2.6) cabeceras, con la CSP enumerada.
- **§3.1** deployment real, tabla de los 5 previews, advertencia sobre el campo
  `Source` y procedimiento de redeploy.
- **§3.2** tabla de verificación contra el preview público real.
- **§7.1** historial del recargo de 3% ya retirado.
- **§9.1** taxonomía de eventos GA4, límites del formulario y formato de
  referencia `TS-`.
- **§10** tabla de hechos de `config.ts` (correo, URLs, nombre completo).
- **§11** compromiso publicado de 30 días hábiles (art. 41 Ley 19.496) y
  compromiso de no enviar contenido a herramientas de IA.
- **§12/§13** reclasificados de backlog a DONE, con lo que realmente queda
  abierto (revisión responsiva y performance).
- **§19/§20** draft + Codacy, y el guard de build de `astro.config.ts`.
- **§25** ruta corregida y aviso de antigüedad relativa de `master-plan.md`,
  `review.md` y `deployment.md`.

---

## Archivos finales cambiados

```text
docs/support/TOOLTICIAN_SUPPORT_LAUNCH_HANDOFF.md
```

Único archivo. Verificado que `support/`, `src/`, `public/`, `package.json` y
`.github/` no tienen diff contra `56d5667`.

---

## Verificación

| Comprobación | Resultado |
|---|---|
| `git diff --check` | **exit 0, limpio** |
| Trailing whitespace | ninguno |
| Caracteres CJK / kana / hangul | ninguno |
| Patrones tipo RUT | ninguno (los 2 hits son `max-age=31536000` y una URL de Google) |
| Menciones de «certificado» / «RUT» | 4, todas **prohibiciones** (`no commitear ...`) |
| Único `.pdf` | URL pública de la resolución SII `reso193.pdf` |
| Tablas Markdown | anchos de columna consistentes |
| `node support/release-check.ts` | exit 1, `["Confirmar municipalPermit"]` |
| `SUPPORT_RELEASE=1 npm run support:build` | falla con `Support launch blocked: Confirmar municipalPermit` (gate funcionando) |

**Desviación de formato respecto del original:** el blockquote de cabecera usaba
hard-breaks de Markdown (dos espacios finales) en 10 líneas, lo que hacía fallar
`git diff --check` con exit 2. Se convirtió esa cabecera a tabla: mismo render,
sin los avisos de whitespace. El resto del archivo conserva el estilo del
documento original.

---

## Git

| Commit | Mensaje |
|---|---|
| `f0fe518` | `docs(support): add launch handoff` |
| `bbab67b` | `docs(support): correct two references in launch handoff` |

- Push a `feat/tooltician-support-v1` — exit 0.
- Local y remoto en `bbab67b`.
- **Sin merge. Sin force-push. Sin `amend`.**

El segundo commit existe porque el primero capturó el snapshot del índice y dejó
sin commitear dos correcciones: el conteo de pasos del run de CI y el número de
paso del build de release en §20.

---

## Confirmación explícita

- `confirmed.municipalPermit` sigue en **`false`** (`support/src/config.ts:59`, sin modificar).
- Producción sigue **sin desplegar** — `tooltician-support.pages.dev` → **404**, verificado tras el push.
- PR #72 sigue **sin merge** — `state=OPEN`, `isDraft=true`, `mergedAt=null`.
- **No se cambió DNS** — `soporte.tooltician.com` no resuelve registro A.
- `soporte.tooltician.com` **no** está asociado a Pages.
- Sin `SUPPORT_RELEASE=1` en el entorno.
- Régimen de subsistencia limitado a **considores finales**; B2B diferido hasta
  migración al régimen que corresponda.

---

## Contradicciones que requieren cambio de código

**No se encontró ninguna que requiera cambio de código.** No se modificó código
de producto. Tres observaciones, ninguna bloqueante:

### 1. Metadata de Cloudflare Pages desalineada

`5f0f65da` registra `Source: ae94465` pero sirve el contenido de `56d5667`.
Explicación probable: se construyó y desplegó el polish antes de commitearlo, de
modo que `--commit-hash "$(git rev-parse HEAD)"` seguía registrando `ae94465`.

Se corrige en el próximo redeploy — build y deploy **después** del commit —, no
tocando código. Documentado en §3.1 del handoff.

### 2. `deployment.md` quedó atrás respecto de los deployments reales

Su sección «Preview desplegado» cita `68334ce6` / `54ad7cf`, cuando hoy el
deployment vigente es `5f0f65da`.

**No se modificó** por dos razones: es un registro fechado con carácter propio, y
su tabla de configuración del panel de Pages — lo Operativamente útil — sigue
siendo exacta. Se señaló en §25 del handoff para que un agente nuevo no lo lea
como estado actual. Si se desea actualizar, corresponde a un commit aparte.

### 3. `review.md` y `master-plan.md` contienen intendidos superados

`review.md` menciona «precios propuestos», pruebas 5/5, WebKit pendiente en CI y
los waits de tax/WhatsApp. `master-plan.md` conserva «selected sectors of
Providencia» y su pricing experimental original.

**No se modificaron** por la misma razón que el punto anterior: `review.md` es un
registro de entrega y `master-plan.md` es la especificación original que el propio
handoff declara no reemplazar. Editarlos habría destruido su valor como
histórico. Documentado en §25.

---

## Fin del reporte
