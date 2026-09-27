# Tooltician Soporte — Launch Handoff

> **Estado:** pre-lanzamiento, bloqueado únicamente por confirmación municipal escrita.

| | |
|---|---|
| **Fecha de corte** | 2026-09-27 |
| **Repositorio** | `cortega26/cortega26.github.io` |
| **Feature branch principal** | `feat/tooltician-support-v1` |
| **PR principal** | `#72` — `feat: Tooltician Soporte — sitio independiente y controles de lanzamiento` — **DRAFT, sin merge** |
| **HEAD verificado** | `56d5667` (`feat(support): polish prelaunch SEO trust and UX`) |
| **Preview estable** | `https://feat-tooltician-support-v1.tooltician-support.pages.dev` |
| **Deployment de preview vigente** | `5f0f65da-b744-48bd-9697-29be77524cbd` |
| **CI vigente** | run `36336869351` (`Support app checks`, SUCCESS sobre `56d5667`) |
| **Producción** | **NO desplegada** (`tooltician-support.pages.dev` responde 404) |
| **Dominio final previsto** | `https://soporte.tooltician.com` — **NO asociado, DNS sin cambios** |
| **`confirmed.municipalPermit`** | **`false`** |

> **Alcance de la verificación de este documento:** todas las afirmaciones de
> estado, precios, copy, cabeceras, rutas y gates de este handoff fueron
> reverificadas contra `support/src/`, `support/tests/`, `support/astro.config.ts`,
> `support/release-check.ts`, `git`, `gh` (PR #72 y runs de CI) y el preview
> público real el 2026-09-27. Donde el documento y el código discrepaban, se
> corrigió el documento. No se modificó código de producto.

---

## 0. Propósito de este documento

Este documento es el handoff operativo y técnico de **Tooltician Soporte**. Debe permitir que otro agente o desarrollador continúe el trabajo sin reconstruir decisiones, contexto, restricciones ni criterios de lanzamiento.

No reemplaza:

- `docs/support/master-plan.md` como plan de producto original;
- `docs/support/implementation.md` como descripción de la implementación;
- `docs/support/deployment.md` como guía de deployment;
- `docs/support/operations.md` como SOP operativo;
- `docs/support/review.md` como registro histórico de revisiones;
- `support/src/config.ts` como fuente de verdad de hechos comerciales usados por la app.

Cuando haya conflicto entre este handoff y el código actual, **verificar el estado real del repo y no asumir que este documento está más actualizado que el código**. El objetivo es mantenerlo actualizado en hitos importantes: respuesta municipal, producción, cambio tributario, apertura B2B y cambios materiales de pricing.

## Taxonomía de estado

Todo lo que sigue usa estas cinco etiquetas. Son exhaustivas y excluyentes: un
ítem está en exactamente una.

| Etiqueta | Significado |
|---|---|
| **DONE** | Implementado, verificado en el código y protegido por pruebas o por comprobación contra el preview real. No requiere acción para el lanzamiento, sólo no debe romperse. |
| **CURRENT BLOCKER** | Impide abrir producción. En este momento es uno solo y es externo al código. |
| **PRE-LAUNCH BACKLOG** | Trabajo que conviene terminar **antes** de abrir reservas. No bloquea el lanzamiento si se decide abrir sin él, pero mejora la apertura. |
| **POST-LAUNCH** | Explícitamente diferido. No debe retrasar la apertura. |
| **FUTURE B2B** | Requiere antes migración al régimen tributario que corresponda. Fuera de alcance del V1 y del lanzamiento actual. |

Regla de disciplina: un ítem sólo pasa a **DONE** con evidencia en el repo. La
intención, un borrador o un mensaje de commit no cuentan como evidencia.

---

# 1. Resumen ejecutivo

Tooltician Soporte es una nueva vertical de Tooltician para **soporte técnico de computadores a domicilio y remoto**, enfocada inicialmente en consumidores finales de:

- Macul;
- Ñuñoa;
- Providencia.

La propuesta no compite por ser el servicio técnico más barato ni por prometer arreglar cualquier cosa. Compite por:

1. identidad verificable de la persona que entra al domicilio y toca el equipo;
2. diagnóstico primero;
3. explicación clara;
4. precio conocido antes de cualquier trabajo adicional;
5. autorización explícita;
6. cuidado de datos y contraseñas;
7. trabajo documentado;
8. límites de alcance claros;
9. cobertura local;
10. medios de pago simples y al mismo precio.

La arquitectura está lista, el preview público funciona, WhatsApp fue probado de extremo a extremo, los precios están confirmados, el régimen tributario vigente fue incorporado al producto, la privacidad y las condiciones están definidas, el sprint de polish SEO/trust/UX está cerrado y el CI del workflow de soporte está verde.

Matiz importante sobre «el CI está verde»: el workflow `Support app checks` pasa todos sus pasos en `56d5667`, pero **PR #72 sigue en estado draft y su `mergeStateStatus` es `UNSTABLE`** por el check dethird-party `Codacy Static Code Analysis` en `ACTION_REQUIRED`. Que el CI propio esté verde no significa que el PR esté listo para mergear. Ver §2.5 y §19.

## Único blocker operativo actual — CURRENT BLOCKER

Se espera respuesta escrita del **Departamento de Rentas de la Municipalidad de Macul** para determinar qué patente o autorización municipal corresponde a una persona inscrita en el Registro de Actividades de Subsistencia del SII que:

- tiene domicilio en Macul;
- presta los servicios exclusivamente en el domicilio del cliente;
- no atiende público en su residencia;
- no almacena mercadería allí;
- no repara equipos allí;
- no instala publicidad exterior.

Hasta recibir y cumplir esa respuesta, si corresponde, **no se abre producción ni se reciben servicios pagados**.

El código registra este estado con:

```ts
confirmed.municipalPermit = false
```

y `npm run support:release-check` debe seguir fallando por ese único blocker.

Verificado el 2026-09-27: `hardLaunchIssues()` devuelve exactamente

```text
["Confirmar municipalPermit"]
```

y eso está fijado por una aserción en `support/tests/unit.test.ts`
(`deepEqual(hardLaunchIssues(), ["Confirmar municipalPermit"])`). El comando
`node support/release-check.ts` termina con **exit code 1**. Los pendientes de
medición se imprimen aparte como advertencias y no bloquean:

```text
POST-LANZAMIENTO (no bloquea)
- Identificador GA4
- Verificar analytics (eventos recibidos en GA4)
- reviewUrl
PUBLICACIÓN BLOQUEADA
- Confirmar municipalPermit
```

---

# 2. Estado técnico confirmado

## 2.1 Aplicación

La aplicación de soporte vive en:

```text
support/
```

Es una aplicación Astro estática independiente del portfolio principal.

Salida:

```text
support/dist/
```

El portfolio principal conserva su propio flujo y salida. La vertical de soporte no debe modificar la arquitectura ni el deployment de `tooltician.com` salvo una decisión explícita posterior.

## 2.2 Rutas

Rutas públicas previstas:

```text
/
/privacidad/
/condiciones-del-servicio/
/robots.txt
/404.html
```

En release se genera sitemap mediante Astro: la integración `@astrojs/sitemap`
sólo se activa cuando `SUPPORT_RELEASE=1`, y produce `sitemap-index.xml` más
`sitemap-0.xml`. `robots.txt` referencia `sitemap-index.xml` en release. En
preview no existe sitemap: verificado 404 en `/sitemap-index.xml` y
`/sitemap-0.xml` contra el preview público.

`astro.config.ts` fija `site: business.origin` y `trailingSlash: "always"`. Por
eso el **canonical y `og:url` apuntan siempre a `https://soporte.tooltician.com`,
incluso en el preview `noindex`**. Es intencional y está fijado por una prueba de
artefacto (`canonical stays production even in noindex preview`); no es un
indicio de que producción esté desplegada.

## 2.3 Arquitectura deliberadamente simple

V1 no necesita:

- backend propio;
- base de datos;
- cuentas de usuario;
- sistema de reservas;
- pagos integrados;
- CRM web;
- panel administrativo;
- API;
- acceso remoto desatendido;
- librerías UI adicionales.

El formulario de triage funciona localmente en el navegador y prepara un mensaje para WhatsApp.

## 2.4 Comando canónico de verificación

```bash
npm run support:verify
```

Equivale conceptualmente a:

```text
astro check
→ unit tests
→ build
→ artifact tests
```

También existen:

```bash
npm run support:e2e
npm run support:e2e:release
npm run support:release-check
```

## 2.5 Baseline de CI — DONE

En el HEAD `56d5667`:

- `support:verify`: PASS;
- E2E Chromium: PASS;
- E2E Firefox: PASS;
- E2E WebKit: PASS;
- release fixture: PASS;
- CI `Support app checks`: SUCCESS;
- run verificado: `36336869351` (2026-09-27, `headSha` `56d5667`, 1m43s, todos
  los pasos en `success`, incluidos `support:verify`, `support:e2e` y
  `support:e2e:release`).

El run `36334228951` que citaba la primera versión de este handoff corresponde a
`ae94465` y también fue exitoso; queda citado sólo como historial.

El E2E dejó de proxificar assets same-origin con `route.fetch()`, eliminando el flake `Request context disposed`. El rewrite de CSP se movió al servidor de pruebas detrás de una opción `loopbackHarness` explícita que quita **únicamente** `upgrade-insecure-requests`; el servidor por defecto sirve los headers de producción byte a byte, y ambas variantes están fijadas por pruebas.

Estado a nivel de PR, que es distinto del estado del workflow:

- PR #72 `headRefOid` = `56d5667`, igual al HEAD local: la rama está sincronizada.
- `build` (Deploy to GitHub Pages): SUCCESS.
- `verify` (Support app checks): SUCCESS.
- `Codacy Static Code Analysis`: **ACTION_REQUIRED** → `mergeStateStatus: UNSTABLE`.
- `mergedAt: null`, `state: OPEN`, `isDraft: true`.

## 2.6 Los gates de lanzamiento están en dos lugares

No es un único interruptor. Conviene conocer ambos antes de tocar nada:

1. **`support/release-check.ts`** — informative. Imprime hard blockers y
   post-lanzamiento, y fija `process.exitCode = 1` si queda algún hard blocker.
2. **`support/astro.config.ts`** — gate de build. Si `SUPPORT_RELEASE=1` y
   `hardLaunchIssues()` no está vacío, **lanza `Error` al cargar la config**, así
   que el build no arranca. Además verifica que el retrato exista en disco.

Consecuencia práctica, verificada el 2026-09-27: el paso 9 de §20
(`SUPPORT_RELEASE=1 npm run support:build`) **falla hoy** con

```text
Support launch blocked:
Confirmar municipalPermit
```

No es un bug: es el gate funcionando. El orden correcto es poner
`confirmed.municipalPermit = true` primero (§20 paso 4) y recién después construir.

## 2.7 Seguridad del artifact — DONE

Headers de Pages (`support/public/_headers`, aplicados también por el servidor de
pruebas y verificados byte a byte por `support/tests/unit.test.ts`):

- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: no-referrer`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- `X-Frame-Options: DENY`
- `Strict-Transport-Security: max-age=31536000`
- CSP explícita
- `upgrade-insecure-requests`

La CSP declara `default-src 'self'`, `script-src 'self' https://www.googletagmanager.com`,
`img-src`, `connect-src`, `font-src 'self'`, `frame-src 'none'`, `object-src 'none'`,
`base-uri 'none'`, `form-action 'none'`, `frame-ancestors 'none'` y
`upgrade-insecure-requests`. El E2E prueba que el navegador recibe la CSP real y que
una request saliente permitida por `connect-src` sigue siendo detectada y abortada
por el arnés (control positivo: el routing no se desarma).

El preview fue comprobado con TLS válido y redirección HTTP → HTTPS. Verificado de
nuevo el 2026-09-27 contra el host real: los siete headers aplicados, más
`x-robots-tag: noindex` que Cloudflare añade por su cuenta.

---

# 3. Estado de deployment

## 3.1 Cloudflare Pages

Proyecto:

```text
tooltician-support
```

Producción branch del proyecto:

```text
master
```

No hay Git integration: los deployments realizados hasta ahora se hicieron con Wrangler desde build local.

Alias estable del preview:

```text
https://feat-tooltician-support-v1.tooltician-support.pages.dev
```

### Deployment vigente

```text
5f0f65da-b744-48bd-9697-29be77524cbd
```

Environment `Preview`, rama `feat/tooltician-support-v1`.

**Advertencia sobre la metadata de Cloudflare.** Wrangler registra el campo
`Source` de este deployment como `ae94465`, pero el artefacto servido contiene el
contenido de `56d5667`. Se comprobó directamente contra el HTML remoto: el banner
actualizado «Vista previa · Servicio aún no abierto a reservas» está presente,
«Precios propuestos» ya no aparece, y sí aparecen la fila de identidad, la paridad
de medios de pago, el copy de domicilio y `og:site_name`. La explicación más
probable es que se construyó y desplegó el polish antes de commitearlo, de modo
que `--commit-hash "$(git rev-parse HEAD)"` seguía registrando `ae94465`. La
consecuencia práctica: **no confíes en el campo `Source` de Pages para saber qué
hay desplegado; contrasta el contenido servido.**

Corregido también un error de la primera versión de este handoff, que asociaba el
deployment `ed981fdc-803c-4c53-85be-32507eb995d2` a `ae94465`. La realidad es que
`ed981fdc` corresponde al commit `5ab2ec3` y sirve el banner antiguo «Precios
propuestos». Historial completo de previews, según `wrangler pages deployment list`:

| Deployment | Source | Banner servido |
|---|---|---|
| `5f0f65da-b744-48bd-9697-29be77524cbd` | `ae94465` | actual (contenido de `56d5667`) |
| `ed981fdc-803c-4c53-85be-32507eb995d2` | `5ab2ec3` | «Precios propuestos» |
| `4640f096-a83e-4902-8d20-18ccba0df9e6` | `dd1d1f6` | «Precios propuestos» |
| `a60a4b28-1b1d-4ddd-8221-454045e35f1b` | `5f8ec18` | «Precios propuestos» |
| `68334ce6-f0ce-44fa-ae68-55bb1ae87e73` | `54ad7cf` | «Precios propuestos» |

Ninguno es un deployment de producción: los cinco son `Preview`.

### Procedimiento de redeploy del preview

Como no hay Git integration, cada actualización del preview es manual:

```bash
rm -rf support/dist
npm run support:verify
npx wrangler pages deploy support/dist \
  --project-name tooltician-support \
  --branch feat/tooltician-support-v1 \
  --commit-hash "$(git rev-parse HEAD)"
```

Ejecutar desde la raíz del repositorio, con el `support/dist` recién construido y
`SUPPORT_RELEASE` ausente. Para que la metadata no vuelva a mentir, construir y
desplegar **después** de tener el commit listo.

## 3.2 Preview

El preview debe permanecer:

- `noindex, nofollow`;
- `robots.txt` con `Disallow: /`;
- sin sitemap de producción;
- sin CTA real `wa.me`;
- sin GA4/GTM;
- con banner explícito de preview;
- sin reservas reales.

`SUPPORT_RELEASE` debe permanecer ausente o distinto de `1`.

Todo lo anterior está **DONE** y además protegido por pruebas. Verificado de nuevo
el 2026-09-27 contra el preview público:

| Comprobación | Resultado |
|---|---|
| `/` responde 200 | sí |
| `<meta name="robots">` | `noindex, nofollow` |
| `x-robots-tag` (Cloudflare) | `noindex` |
| `/robots.txt` | `User-agent: *` / `Disallow: /` |
| `/sitemap-index.xml`, `/sitemap-0.xml` | 404 |
| `wa.me` en el HTML servido | 0 coincidencias |
| Banner «Vista previa · Servicio aún no abierto a reservas» | presente |
| Copy «exclusivamente a consumidores finales» | presente |
| «Precios propuestos» | ausente |
| `<h1>` | exactamente 1 |
| canonical | `https://soporte.tooltician.com/` (producción, intencional en preview) |
| GA4 | sin `analyticsId`, el script no se inyecta y el banner de consentimiento ni se renderiza |

El formulario funciona en preview y **no envía nada**: muestra
«Estamos preparando la apertura. Puedes probar el formulario; todavía no envía
consultas», y el enlace a WhatsApp real no existe. `support/tests/artifact.test.ts`
falla si cualquiera de estas garantías se rompe.

## 3.3 Producción

A fecha de corte:

```text
tooltician-support.pages.dev
```

no tiene deployment de producción. Verificado el 2026-09-27: responde **404**.
Los cinco deployments registrados son `Preview`; ninguno es `Production`.

No se ha asociado:

```text
soporte.tooltician.com
```

No se ha cambiado DNS.

No se ha hecho merge del PR #72, que además sigue en **draft**.

---

# 4. Posicionamiento

## 4.1 Posicionamiento recomendado

> Soporte técnico a domicilio para personas que quieren saber qué tiene su equipo, cuánto costará y qué se hará antes de autorizarlo. Atención personal, clara y documentada.

## 4.2 Promesa central

El servicio debe transmitir, antes de que el usuario contacte:

- sé quién viene a mi casa;
- sé cuánto cuesta empezar;
- me explicarán el diagnóstico;
- no cambiarán piezas sin autorización;
- no aparecerán cargos sorpresa;
- no necesito trasladar el equipo a un taller;
- no guardarán mis contraseñas;
- recibiré un resumen escrito;
- si el problema no está dentro del alcance, me lo dirán.

## 4.3 Target inicial

Consumidor final, principalmente:

- hogares de ingresos medios;
- hogares medios-altos;
- profesionales;
- trabajadores remotos;
- estudiantes/profesionales con equipos personales;
- usuarios que valoran confianza, claridad y conveniencia más que el menor precio.

Comunas:

- Macul;
- Ñuñoa;
- Providencia.

---

# 5. Régimen tributario actual — DONE, vigente

> **DONE:** el régimen ya está incorporado al producto (`business.taxRegime`,
> `confirmed.tax = true`) y ya no es blocker. Lo que queda vivo es un control
> operativo continuo, que es POST-LAUNCH.

## 5.1 Estado

El prestador quedó inscrito el 27-09-2026 en el:

**Registro de Personas Naturales que desarrollan Actividades de Subsistencia del SII**

bajo la Resolución Ex. SII N°193/2025 y sus modificaciones vigentes.

Mientras se mantengan los requisitos:

- no requiere Inicio de Actividades por esta actividad;
- está exonerado de IVA;
- está liberado de emitir boletas por estas prestaciones;
- sólo puede prestar el servicio a consumidores finales;
- debe mantenerse bajo el límite legal del régimen;
- si deja de cumplir, debe migrar al régimen tributario correspondiente antes de continuar operando como si siguiera acogido.

## 5.2 Límite de ingresos

La regla del registro es:

> promedio mensual de ingresos de la actividad de subsistencia no superior a 5 UTM.

El valor monetario de la UTM cambia. **No hardcodear una cifra anual en el producto ni en lógica de negocio permanente.**

Control operativo recomendado:

- alerta interna al acercarse a 4 UTM promedio;
- revisar semanalmente ingresos del régimen;
- no usar 5 UTM como objetivo comercial;
- si la demanda demuestra que el negocio puede superar el límite, preparar la transición en vez de restringir artificialmente ventas rentables.

## 5.3 Consumidores finales vs. oficinas

El régimen no prohíbe físicamente entrar en una oficina.

La restricción relevante es **quién contrata y para qué**.

### Compatible en principio

Una persona natural contrata el servicio como consumidor final para su computador personal, aunque el equipo esté físicamente en una oficina.

### No compatible con el régimen actual

- la empresa contrata;
- la empresa paga;
- se requiere factura;
- los equipos son activos de la empresa;
- se presta soporte a la infraestructura operativa de una pyme;
- se realiza mantención recurrente empresarial;
- se vende un plan de soporte corporativo.

Cuando el caso sea ambiguo, no forzar la interpretación para mantenerlo dentro del régimen.

## 5.4 B2B como expansión futura — FUTURE B2B

> **FUTURE B2B.** Todo lo de esta subsección está **condicionado** a haber
> migrado antes al régimen tributario que corresponda. No es trabajo de V1 ni
> depende de la respuesta municipal. Es una decisión estratégica explícita: no
> cerrar la puerta, no abrirla tampoco hoy.

Tooltician Soporte **no debe cerrar estratégicamente la puerta B2B**.

Las oficinas pueden tener:

- ticket más alto;
- recurrencia;
- varios equipos;
- upgrades múltiples;
- red/Wi-Fi;
- backup;
- mantención preventiva;
- referidos internos.

Si empiezan a aparecer oportunidades B2B valiosas, eso es una señal para evaluar migración anticipada al régimen general.

### Regla estratégica

No optimizar para permanecer para siempre bajo 5 UTM.

Optimizar para validar rápido:

1. demanda;
2. calidad de servicio;
3. unit economics;
4. recurrencia;
5. posibilidad de tickets empresariales.

Después formalizar el régimen adecuado para crecer.

---

# 6. Situación municipal — CURRENT BLOCKER

> **CURRENT BLOCKER.** Es lo único que impide abrir producción. Es una
> respuesta externa: ningún cambio de código puede producirla ni sustituirla.

## 6.1 Acción ya realizada

El 27-09-2026 se envió consulta escrita a:

```text
rentas@munimacul.cl
```

con el certificado SII adjunto.

La consulta describe que:

- el servicio se presta en domicilio de clientes;
- no hay atención de público en el domicilio particular;
- no hay venta presencial;
- no hay publicidad exterior;
- no hay bodegaje;
- no se reparan equipos en la vivienda.

## 6.2 Estado

```text
PENDIENTE RESPUESTA ESCRITA
```

No asumir:

- que no se necesita patente;
- que corresponde patente definitiva;
- que corresponde domicilio postal tributario;
- que corresponde patente profesional;
- que corresponde Microempresa Familiar;
- que el certificado SII sustituye permisos municipales.

## 6.3 Gate

Hasta obtener y cumplir la respuesta:

```ts
confirmed.municipalPermit = false
```

Sólo ponerlo en `true` con evidencia suficiente.

Si Rentas indica que no se requiere patente o que basta una determinada modalidad, documentar:

- fecha;
- respuesta;
- funcionario/canal si consta;
- requisitos;
- trámite completado si aplica.

No publicar datos personales de la respuesta en el repo.

---

# 7. Precios confirmados — DONE

> **DONE.** Confirmados por la persona dueña, publicados en la home y en las
> condiciones, y fijados por aserción en `support/tests/unit.test.ts`. No
> recomponerlos ni reinterpretarlos a la ligera.

Todos son precios finales al consumidor.

No sumar IVA durante el régimen actual.

No usar copy `+ IVA`, `más IVA` o equivalente.

La decisión de precio también busca evitar un salto brusco cuando eventualmente se migre a un régimen afecto a IVA.

| Servicio | Precio |
|---|---:|
| Visita Macul | $30.000 |
| Visita Ñuñoa | $30.000 |
| Visita Providencia | $35.000 |
| Mantención desktop | desde $40.000 |
| Mantención notebook | desde $45.000 |
| Instalación SSD/RAM | desde $30.000 |
| Windows/configuración | desde $40.000 |
| Respaldo/migración | desde $35.000 |
| Wi-Fi/impresoras | desde $35.000 |
| Soporte remoto | $25.000 |

## 7.1 Medios de pago

- transferencia;
- efectivo;
- tarjeta.

Mismo precio.

No recargo de tarjeta.

El costo del medio de pago es un costo operativo.

Historial que conviene no re-litigar: hubo un recargo de tarjeta del 3% propuesto
y registrado en el producto (`6f1aaf3`) mientras se validaba con el proveedor de
cobro. Se eliminó por completo del producto y de la documentación en `dd1d1f6`.
Hoy no existe ningún recargo, y `support/tests/unit.test.ts` lo fija con
`assert.doesNotMatch(business.payment, /[0-9]+\s*%|recargo|comisi[oó]n/i)`.
Los precios publicados no incluyen ni anuncian ningún porcentaje.

## 7.2 Visita + mano de obra

En una misma intervención:

```text
mano_de_obra = max(precio_visita, precio_servicio)
```

Luego se agregan sólo conceptos autorizados:

- repuestos;
- licencias;
- consumibles relevantes;
- extras.

Ejemplo:

```text
visita $30.000
servicio $40.000
mano de obra total $40.000
NO $70.000
```

## 7.3 Segunda visita

Si requiere comprar repuesto, buscar una pieza, volver otro día o continuar una intervención, el alcance y precio se informan **antes** y requieren acuerdo.

## 7.4 Repuestos

Preferencia:

1. recomendar repuesto compatible;
2. cliente lo compra directamente.

Si Tooltician compra:

- compatibilidad comprobada;
- costo acordado;
- pago del repuesto preferentemente previo;
- comprobante;
- no financiar inventario con caja propia por defecto;
- no aplicar margen oculto al hardware.

---

# 8. Alcance V1 — DONE

> **DONE.** El alcance está publicado en las condiciones del servicio y la FAQ
> de la home lo refleja. `business.macOS = false` y `business.offsite = false` lo
> declaran en código.

## Incluido

- diagnóstico;
- PC de escritorio;
- notebook;
- Windows/software;
- instalación SSD/RAM;
- mantención y temperaturas;
- respaldo convencional;
- migración;
- Wi-Fi;
- impresoras;
- soporte remoto apropiado.

## Fuera de alcance V1

- macOS;
- microsoldadura;
- reparación electrónica avanzada de placas;
- recuperación avanzada de datos;
- celulares;
- consolas;
- daños por líquido que requieran reparación especializada;
- intervención riesgosa sobre batería hinchada;
- trabajos eléctricos peligrosos;
- atención de emergencia;
- retiro del equipo para trabajar fuera del domicilio.

## Señales de detención

- humo;
- olor a quemado;
- batería hinchada;
- líquido;
- riesgo eléctrico;
- disco con clics y datos importantes.

No insistir con encendidos ni herramientas agresivas cuando exista riesgo de agravar daño o pérdida de datos.

---

# 9. Privacidad y datos

## 9.1 Formulario web

El formulario:

- corre localmente;
- no manda el texto a Tooltician;
- no guarda el texto en storage;
- prepara el mensaje;
- el usuario decide si abre WhatsApp.

No incluir en analytics:

- nombre;
- teléfono;
- dirección;
- descripción libre del problema;
- modelo libre;
- referencia individual;
- texto de WhatsApp.

Todo lo anterior está **DONE** y protegido por pruebas. `support/src/lib/analytics.ts`
no acepta dimensiones libres: todo parámetro pasa por `safeDimensions()`, que
descarta cualquier clave que no esté en una lista cerrada, y la atribución
descarta UTM desconocidas. El E2E navega a
`/?utm_source=secret@example.com&problem=DO-NOT-LEAK` y el fixture de release
comprueba que ni el texto del cliente, ni un correo, ni el teléfono, ni el
prefijo `TS-` de la referencia lleguen a la cola de GA4. Además se envía
`page_referrer` vacío y `page_location` sin query ni hash.

### Taxonomía de eventos — DONE

Nueve eventos, con lista cerrada en `eventNames`:

```text
support_page_view
support_whatsapp_click
support_triage_start
support_triage_complete
support_service_view
support_price_view
support_area_view
support_about_view
support_cta_click
```

Dimensiones permitidas: `location`, `service`, `source`, `medium`, `campaign`,
`content`. Cada una tiene sus valores predefinidos; cualquier otro valor se
descarta. Se desactivan `send_page_view`, Google Signals y signals de
personalización; las cookies duran 90 días y sólo en el subdominio. El
consentimiento se guarda en `localStorage` bajo
`support-analytics-consent-v1` y por defecto está apagado. Al revocar, se borran
las cookies `_ga*` y se recarga la página para detener la librería ya cargada.

Todo esto es **POST-LAUNCH**: `analyticsId` está vacío y `verified.analytics` es
`false`, ambos soft. El fixture de release exercise el camino de consentimiento
con datos ficticios y afirma que cada evento se emite exactamente una vez.

### Límites del formulario — DONE

`support/src/lib/contact.ts` valida en el navegador:

- comuna: una de Macul, Ñuñoa, Providencia u «otra»;
- equipo: una de las cinco opciones de `devices`;
- enciende: `Sí`, `No`, `No corresponde`;
- tipo de ayuda: uno de los siete servicios u `otro`;
- marca y modelo: opcional, máximo 100 caracteres;
- problema: entre 5 y 600 caracteres.

El texto se limpia de caracteres de control antes de componer el mensaje. El
mensaje se arma como texto plano y se muestra en un `<pre>` con
`textContent`, nunca como HTML, de modo que un `<script>` escrito por el usuario
se muestra literal y no se ejecuta. La URL de WhatsApp lleva el mensaje en un
único parámetro `text` codificado, verificado por prueba.

### Referencia de consulta — DONE

`leadReference()` genera en el navegador un identificador con formato
`TS-` seguido de 12 caracteres hexadecimales en mayúsculas. Viaja dentro del
mensaje de WhatsApp como línea `Ref:` y sirve para conciliar la consulta con el
registro privado. **No se envía a analytics** y no se persiste en storage: se
regenera en cada carga de página, así que sirve para una conversación, no como
identificador estable de cliente.

`support/tests/unit.test.ts` afirma que `support/src/client.ts` no contiene
`localStorage`, `sessionStorage`, `indexedDB` ni `document.cookie`, y el E2E
comprueba que `localStorage` queda vacío tras navegar y enviar el formulario.

## 9.2 Retención

### Consulta no convertida

Máximo 90 días.

### Servicio realizado

Registro operativo mínimo hasta 12 meses para seguimiento, soporte, historial, responsabilidad del trabajo y resolución de reclamos.

### Dirección exacta

Solicitar sólo cuando haga falta para la visita. Eliminar cuando deje de ser necesaria, salvo obligación legal aplicable.

### Contraseñas

Nunca almacenar. Siempre que sea posible, el cliente las escribe.

### Archivos

No conservar por defecto. Copias temporales sólo con finalidad autorizada y eliminación al terminar el propósito.

### Registros legales

Si una obligación legal exige plazo mayor, prevalece el plazo aplicable.

---

# 10. Identidad y confianza

Responsable visible:

```text
Carlos Ortega
```

Ese es el nombre que se muestra al público. En `support/src/config.ts` el campo
`business.owner` es `Carlos Ortega González`, y es ese valor el que viaja al
schema `founder`. La diferencia es intencional: nombre corto en la prosa, nombre
completo en los datos estructurados.

Hechos de contacto y enlaces, todos en `support/src/config.ts` y usados como
única fuente de verdad:

| Campo | Valor |
|---|---|
| `name` | `Tooltician Soporte` |
| `owner` | `Carlos Ortega González` |
| `origin` | `https://soporte.tooltician.com` |
| `parent` | `https://tooltician.com/es/` |
| `github` | `https://github.com/cortega26` |
| `linkedin` | `https://www.linkedin.com/in/cortega26` |
| `whatsapp` | `56951118901` |
| `email` | `carlos@tooltician.com` |
| `photo` | `src/assets/carlos-ortega.jpeg` |
| `reviewUrl` | *(vacío — soft blocker)* |
| `analyticsId` | *(vacío — soft blocker)* |
| `availability` | `Atención previa coordinación` |

`business.email` es un **hard blocker** en `hardLaunchIssues()`: sin correo
público no hay canal de privacidad ni de reclamos. Aparece en el footer, en el
schema `Organization` y como `mailto:`.

La landing enlaza a Tooltician, GitHub y LinkedIn, en la fila de confianza bajo
el CTA del hero y de nuevo en la sección de identidad.

El retrato real está en:

```text
support/src/assets/carlos-ortega.jpeg
```

Procesado por Astro a WebP responsive.

Principio:

> No usar imágenes de stock o IA para simular técnicos, clientes, talleres o servicios ya realizados.

Material visual futuro recomendado:

- retrato real;
- kit ordenado;
- espacio de trabajo;
- limpieza/mantención real de equipo propio;
- herramientas;
- imágenes reales de servicios con permiso y sin PII.

---

# 11. WhatsApp

Número:

```text
+56 9 5111 8901
```

Formato interno:

```text
56951118901
```

Se hizo prueba humana real de envío y recepción:

```ts
verified.realPhone = true
```

## Primera respuesta recomendada

> Hola, soy Carlos de Tooltician Soporte. Para confirmar si puedo ayudarte, dime por favor la comuna/sector, qué equipo tienes, qué problema presenta, si enciende normalmente y si hay archivos importantes sin respaldo. No envíes contraseñas ni información bancaria.

## Reserva

Confirmar por escrito:

- día;
- franja;
- comuna/sector;
- dirección privada;
- equipo;
- motivo;
- precio base;
- medio de pago;
- regla de autorización de extras.

## Cierre

Enviar resumen escrito con:

- hallazgo;
- trabajo autorizado;
- pruebas;
- resultado;
- piezas;
- limitaciones;
- recomendaciones;
- plazo de responsabilidad.

### Plazo de responsabilidad — DONE, ya es un compromiso publicado

Esto no es sólo una intención interna: `support/src/pages/condiciones-del-servicio.astro`
ya declara, y la FAQ de la home lo repite, que existe un plazo de **30 días
hábiles** para reclamar por daños o desperfectos causados por un servicio
defectuoso, contado desde su término o la entrega del bien reparado, citando el
**artículo 41 de la Ley 19.496**, sin perjuicio de plazos mayores y demás derechos
aplicables.

Consecuencias operativas que no deben olvidarse:

- el resumen de cierre debe **consignar el plazo**; no es opcional;
- la garantía de componentes y la responsabilidad por mano de obra se documentan
  por separado;
- ninguna autorización puede interpretarse como renuncia a derechos del
  consumidor, y las condiciones lo dicen de forma expresa;
- ese resumen escrito es un **registro del trabajo, no un documento tributario**
  — así está redactado en las condiciones, y conviene mantenerlo así mientras
  rija el régimen de subsistencia.

### Privacidad — compromiso ya publicado

La home afirma, en la franja de privacidad, que no se piden claves bancarias, no
se guardan contraseñas, no se copian archivos sin autorización y que
**«tampoco envío tu contenido a herramientas de IA»**. Es un compromiso
verificable: la arquitectura no tiene backend ni llamada a ningún modelo, y la
CSP con `connect-src 'self'` más los hosts de analytics lo impide. Mantenerlo
cierto significa no introducir un proxy, un embeddings o un assistant que rompa
esa promesa.

---

# 12. SEO — baseline cerrado

> **Estado: DONE.** Todo lo de esta sección está implementado en `56d5667` y
> verificado por `support/tests/artifact.test.ts`. La primera versión de este
> handoff lo describía como backlog pendiente; ya no lo es. No reabrir trabajo
> aquí salvo que cambie la intención de búsqueda o los hechos del negocio.

## Intención principal

Atacar de forma natural:

- técnico de computadores a domicilio;
- servicio técnico computadores;
- PC/notebook;
- Macul;
- Ñuñoa;
- Providencia.

No keyword stuffing.

## Title — DONE

```text
Técnico de computadores a domicilio | Macul, Ñuñoa y Providencia
```

Es exactamente el `<title>` publicado, fijado por aserción sobre el HTML
construido. La meta description mide entre 90 y 200 caracteres y menciona
«PC y notebooks»; también está fijada por aserción.

## H1 — DONE

```text
Servicio técnico de computadores a domicilio.
```

Con la frase «Claro, personal y sin sorpresas.» como párrafo introductorio
inmediatamente debajo, no dentro del H1. La página tiene **exactamente un `<h1>`**,
y las dos pruebas que lo comprueban fallarían si se duplicara.

## Structured data — DONE

Se mantiene `Organization` y sólo `Organization`. La decisión está razonada en el
código: el servicio se entrega en el domicilio del cliente, así que no hay
dirección pública que declarar, y sin dirección pública `LocalBusiness` sería
incorrecto.

Se enriquece sólo con hechos, y todo está publicado hoy:

- `name`, `url`, `description`, `logo` (`favicon.svg`), `image` (`og-card.png`);
- `telephone` (`+56951118901`) y `email`;
- `founder` como `Person`, con `jobTitle` y `sameAs`;
- `contactPoint` de tipo `customer service`, con `availableLanguage: es-CL` y `areaServed`;
- `areaServed` como las tres comunas;
- `sameAs` con Tooltician, GitHub y LinkedIn.

La prueba de artefacto parsea el JSON-LD y **falla** si aparece cualquiera de
estos: `postaladdress`, `streetaddress`, `aggregaterating`, `"review"`, `vatid`,
`openinghours`, `pricerange`. También falla si el HTML incluye
`domicilio particular`, `dirección particular` o `atiendo público en`.

## Social metadata — DONE

Revisado y completo: `og:site_name`, `og:title`, `og:description`, `og:url`,
`og:image`, `og:image:alt`, `og:image:width` 1200 y `og:image:height` 630, más
`twitter:card`, `twitter:title`, `twitter:description`, `twitter:image` y
`twitter:image:alt`. La presencia de cada etiqueta está afirmada por prueba.

## Páginas locales — no hacer

NO generar automáticamente `/macul/`, `/nunoa/`, `/providencia/` si sólo repiten
contenido. No existen hoy y no están en el backlog de lanzamiento.

Crear páginas locales únicamente si Search Console muestra demanda y existe
contenido local realmente útil. Queda registrado en `master-plan.md` como
experimento futuro, no como tarea.

## Nota de canonical

`canonical` y `og:url` apuntan a `https://soporte.tooltician.com` también en el
preview `noindex`. Es intencional y está fijado por prueba. Lo que no existe es el
dominio: ver §3.3.

---

# 13. UX/UI — mayormente cerrado, resto en PRE-LAUNCH BACKLOG

> **Estado: mixto.** Los ítems P0 y P1 que la primera versión de este handoff
> listaba como pendientes están implementados en `56d5667` y afirmados por
> `support/tests/artifact.test.ts`. Lo que queda abierto es sólo verificación
> responsiva y performance, que no es bloqueante.

## P0: coherencia consumidores finales — DONE

La FAQ ya no dice que «una oficina pequeña se evalúa». La pregunta es
`¿Atiendes empresas?` y la respuesta es:

> No durante esta etapa. Tooltician Soporte atiende exclusivamente a consumidores
> finales, que es lo que permite el régimen tributario vigente. No se atienden
> oficinas, organizaciones ni clientes empresa, y no se ofrecen planes de soporte
> continuo. Tampoco se retiran equipos: la atención es a domicilio.

Las pruebas de artefacto fallan si reaparecen `oficina pequeña` o cualquier
variante de `oficina(s) se evalu`.

Sobre el matiz que pedía la primera versión: la restricción se enuncia como tipo
de cliente y régimen tributario, no como regla geográfica. El copy actual nombra
las oficinas, pero no lo hace como una restricción de lugar, y en el mismo
párrafo aclara que la atención es a domicilio. Es coherente con §5.3 del handoff y
con `operations.md`. No requiere cambio de código.

## P0: preview banner — DONE

No se usa `Precios propuestos`. El banner publicado es exactamente:

```text
Vista previa · Servicio aún no abierto a reservas
```

Ambas variantes están afirmadas por prueba: el banner nuevo debe estar y
`Precios propuestos` no debe aparecer.

## P1: trust above fold — DONE

Fila de identidad ligera bajo el CTA del hero: retrato optimizado de 52 px,
«Atención personal por Carlos Ortega» y los tres enlaces (Tooltician, GitHub,
LinkedIn). Es una línea compacta, no una segunda versión de la sección de
identidad.

## P1: pagos — DONE

Visible junto al precio, en la columna explicativa de la sección de precios:

```text
Transferencia, efectivo o tarjeta · mismo precio
```

## P1: domicilio — DONE

La sección de cobertura cierra con el valor para el cliente, no con una nota legal:

```text
Servicio exclusivamente a domicilio: no necesitas trasladar tu equipo a un taller.
```

La prueba afirma que esa frase esté presente y que
`No hay atención de público en una dirección particular` **no** esté.

## P2: responsive — PRE-LAUNCH BACKLOG

El E2E ya ejercita 360, 390, 412, 768 y 1440 px y falla ante cualquier
desbordamiento horizontal, guardando capturas en `output/support/`. Lo que queda
es **revisión visual** de esos anchos — primer viewport, CTA, precio, trust,
tabla, formulario, sticky CTA, foco, errores, legales y overflow — que es una
mirada humana, no una aserción. No bloquea el lanzamiento.

## P2: performance — PRE-LAUNCH BACKLOG

Criterio, no tarea: no añadir third-party JS, preservar imágenes optimizadas,
CLS/TBT bajos, bundle pequeño y fuentes locales. Medido en el commit `56d5667`:
**LCP 149 ms / CLS 0.00**, contra 154 ms / 0.00 antes; el retrato nuevo cuesta
954 bytes a 1x y no se añadió ninguna dependencia.

---

# 14. Adquisición — estrategia inicial — PRE-LAUNCH BACKLOG

> **PRE-LAUNCH BACKLOG.** Los borradores están en
> `docs/support/acquisition-drafts.md` y son utilizables, pero **no publicar
> nada** hasta que exista producción y respuesta municipal favorable.

Principio:

> Hiperlocal + confianza + CAC casi cero.

No escalar ads antes de conocer conversión, ticket, contribución, retrabajo, capacidad y límite tributario.

## Prioridad de canales

1. comunidad del edificio / vecinos / contactos;
2. WhatsApp Status;
3. Google Business Profile después de luz verde municipal;
4. SEO local;
5. grupos locales y clasificados permitidos;
6. paid search sólo con economics demostrados.

## Google Business Profile

Configurar como service-area business:

- ocultar dirección residencial;
- áreas Macul, Ñuñoa, Providencia;
- nombre `Tooltician Soporte`;
- no meter keywords artificiales en el nombre.

---

# 15. Copy de adquisición — PRE-LAUNCH BACKLOG

> **PRE-LAUNCH BACKLOG.** Listo para usar al abrir. Contiene los precios y el
> teléfono reales, verificados contra `support/src/config.ts`. Ninguna de estas
> piezas debe publicarse mientras el servicio no esté abierto: sería publicidad
> de algo que aún no se puede contratar.

## Comunidad del edificio

> Vecinos, estoy preparando una nueva área de Tooltician orientada a soporte técnico de computadores a domicilio.
>
> Atiendo PC y notebooks con Windows, problemas de lentitud, temperatura, instalación de SSD/RAM, configuración, respaldos, Wi-Fi e impresoras.
>
> La idea es simple: primero reviso qué ocurre, explico las opciones y el costo, y cualquier trabajo adicional se hace sólo después de que lo autorices.
>
> Visita y diagnóstico:
> Macul y Ñuñoa: $30.000
> Providencia: $35.000
>
> Transferencia, efectivo o tarjeta al mismo precio.
>
> Atención previa coordinación.
>
> soporte.tooltician.com
>
> Soy Carlos Ortega, vecino del edificio. Si alguien necesita ayuda, puede escribirme directamente.

## Grupos locales

> **Servicio técnico de computadores a domicilio — Macul, Ñuñoa y Providencia**
>
> Soy Carlos Ortega y estoy abriendo Tooltician Soporte, una atención técnica personal para PC y notebooks con Windows.
>
> Puedo ayudarte con diagnóstico, lentitud, temperatura, instalación de SSD o RAM, Windows y configuración, respaldo/migración, Wi-Fi, impresoras y algunos problemas que puedan resolverse de forma remota.
>
> Trabajo con una regla sencilla: primero diagnóstico, después explicación y precio; ningún trabajo adicional sin autorización.
>
> Visita + diagnóstico hasta 45 min:
> Macul / Ñuñoa: $30.000
> Providencia: $35.000
>
> Si durante la misma visita autorizas otro servicio, no se suman automáticamente ambos cobros: se aplica el mayor valor de mano de obra más repuestos o extras autorizados.
>
> Transferencia, efectivo o tarjeta. Mismo precio.
>
> soporte.tooltician.com
>
> Atención previa coordinación.

## WhatsApp Status

> ¿Tu PC está lento, se calienta o está dando problemas? Estoy abriendo Tooltician Soporte.

> Soporte técnico a domicilio · Macul · Ñuñoa · Providencia · Diagnóstico primero · Precio antes de intervenir.

> Visitas desde $30.000 · PC · notebooks · Windows · SSD/RAM · Wi-Fi · soporte.tooltician.com

## Google Business Profile

> Tooltician Soporte ofrece atención técnica de computadores a domicilio en Macul, Ñuñoa y Providencia. Diagnóstico de PC y notebooks con Windows, mantención y temperatura, instalación de SSD y RAM, configuración de Windows, respaldo y migración de archivos, Wi-Fi, impresoras y soporte remoto cuando corresponde. Atención personal por Carlos Ortega, con diagnóstico previo, explicación clara del problema, precio acordado antes de trabajos adicionales y resumen escrito del servicio. Atención exclusivamente previa coordinación.

---

# 16. Operación inicial — PRE-LAUNCH BACKLOG

> **PRE-LAUNCH BACKLOG.** Las plantillas de `operations.md` están listas; lo
> pendiente es el mundo físico y el tracker privado, que no viven en el repo.

## Kit mínimo

Preparar mochila antes del lanzamiento:

- destornilladores;
- protección ESD;
- pasta térmica;
- alcohol/insumos apropiados;
- adaptadores SATA/NVMe;
- cable Ethernet;
- USBs confiables;
- adaptadores USB/red;
- cargadores necesarios;
- linterna;
- multímetro si ya está disponible;
- organización para tornillos/consumibles.

No comprar herramientas caras sólo por completar un laboratorio.

## Registro privado

No usar el repo.

Campos mínimos:

- referencia;
- fecha;
- fuente;
- comuna;
- tipo de cliente;
- categoría;
- estado;
- cotizado;
- cobrado;
- repuestos;
- consumibles;
- transporte;
- estacionamiento;
- minutos de conversación;
- minutos de viaje;
- minutos de trabajo;
- retrabajo;
- reseña solicitada/recibida;
- referido/repetición.

## Métricas

- leads;
- leads calificados;
- reservas;
- trabajos pagados;
- conversión;
- ticket medio;
- ingreso efectivo/hora;
- contribución;
- contribución/hora;
- CAC;
- retrabajo;
- reseñas;
- referidos;
- repetición;
- promedio mensual de ingresos en UTM.

Revisar después de 10 trabajos, 25 trabajos y luego mensualmente.

---

# 17. Reseñas y referidos — POST-LAUNCH

> **POST-LAUNCH.** Depende de que exista Google Business Profile, que a su vez
> depende de que la situación municipal esté resuelta y haya producción. Hoy
> `business.reviewUrl` está vacío y es un soft blocker.

Cuando Google Business Profile esté activo:

## Solicitud de reseña

> Si el servicio te resultó útil, una reseña honesta en Google ayuda mucho a dar a conocer esta nueva área de Tooltician.
>
> [URL]
>
> Gracias por confiarme tu equipo.

No ofrecer descuentos, premios ni compensación.

## Referido

> Si conoces a alguien en Macul, Ñuñoa o Providencia que necesite ayuda con su computador, puedes compartirle soporte.tooltician.com. Gracias.

---

# 18. Post-lanzamiento no bloqueante — POST-LAUNCH

> **POST-LAUNCH.** Nada de esta sección debe retrasar la apertura. Todo está
> clasificado como soft en `softLaunchIssues()` y por eso aparece como advertencia
> en `support:release-check`, nunca como bloqueo.

No retrasar apertura por:

- GA4;
- analytics verified;
- reviewUrl;
- Search Console;
- Google Business Profile.

Pero realizarlos pronto.

## GA4

Cuando se configure:

- consentimiento explícito;
- sin PII;
- no enviar texto libre;
- no enviar teléfono;
- no enviar referencia individual;
- verificar DebugView;
- verificar deduplicación;
- verificar retirada de consentimiento.

## Search Console

Después de dominio final:

- propiedad;
- sitemap;
- indexación;
- cobertura;
- queries reales.

## Google Business Profile

Después de situación municipal resuelta y producción:

- service-area business;
- dirección oculta;
- cobertura Macul/Ñuñoa/Providencia;
- fotos reales;
- servicios y precios;
- review URL.

---

# 19. Launch state machine

## Estado A — PREVIEW_READY

Cumplido.

## Estado B — MUNICIPAL_PENDING

**Estado actual.**

Condición:

```ts
confirmed.municipalPermit === false
```

Acción:

- esperar respuesta;
- mejorar preview;
- preparar operación;
- preparar adquisición;
- no abrir reservas.

## Estado C — RELEASE_READY

Entrar sólo cuando:

- respuesta municipal recibida;
- trámites cumplidos;
- evidencia archivada;
- `confirmed.municipalPermit = true`;
- `npm run support:release-check` sin hard blockers;
- CI verde;
- preview revisado.

Dos condiciones que la primera versión de este handoff no mencionaba y que hay
que cumplir antes de mergear:

- **PR #72 está en draft.** Hay que pasarlo a *Ready for review*.
- **El check de Codacy está en `ACTION_REQUIRED`**, y por eso el
  `mergeStateStatus` del PR es `UNSTABLE` aunque el workflow propio esté verde.
  Resolverlo —otorgarle acceso, revisarlo o descartarlo— para que GitHub permita
  mergear sin saltarse la protección de rama.

Ambas son acciones de la persona dueña del repositorio, no del código.

## Estado D — PRODUCTION_LIVE

Después de:

- merge #72;
- build release;
- Cloudflare production;
- custom domain;
- DNS/TLS;
- smoke test;
- CTA WhatsApp real;
- robots/indexación correctos.

## Estado E — POST_LAUNCH

- GBP;
- GSC;
- GA4;
- primeras reseñas;
- medición;
- iteración.

---

# 20. Procedimiento de lanzamiento final

Cuando llegue la respuesta municipal:

1. interpretar la respuesta;
2. cumplir el trámite si aplica;
3. archivar evidencia;
4. poner `confirmed.municipalPermit = true` sólo cuando proceda;
5. ejecutar:

```bash
npm run support:verify
npm run support:e2e
npm run support:e2e:release
npm run support:release-check
git diff --check
```

6. verificar PR #72 actualizado y CI nuevo HEAD verde;
7. pasar el PR de draft a *Ready for review* y resolver el check de Codacy;
8. merge con aprobación explícita;
9. desde `master`:

```bash
rm -rf support/dist
SUPPORT_RELEASE=1 npm run support:build
```

10. revisar artifact release;
11. desplegar Cloudflare Pages producción conceptualmente con:

```bash
npx wrangler pages deploy support/dist   --project-name tooltician-support   --branch master   --commit-hash "$(git rev-parse HEAD)"
```

12. asociar `soporte.tooltician.com`;
13. validar DNS/TLS;
14. smoke test;
15. abrir adquisición.

Advertencia sobre el paso 9: `astro.config.ts` lanza un `Error` al cargar la
config si `SUPPORT_RELEASE=1` y queda algún hard blocker, y además exige que el
retrato exista. Si el paso 4 se hizo mal, el build falla ahí y no se obtiene
artifact — que es el comportamiento correcto. Ver §2.6.

Advertencia sobre el paso 11: después del merge, `git rev-parse HEAD` debe
devolver el commit de `master`, no el de la feature branch. Ejecutar los comandos
desde `master` sin rama de feature activa.

---

# 21. Rollback

Ante error grave:

1. detener adquisición;
2. identificar último commit/deployment bueno;
3. redeploy del artifact estable;
4. revertir sólo DNS/custom domain si el problema está ahí;
5. validar rutas y CTA;
6. documentar incidente.

El portfolio principal no debe quedar acoplado al rollback de soporte.

---

# 22. Triggers de transición fuera de Subsistencia — FUTURE B2B

> **FUTURE B2B.** Vigilar, no ejecutar. La evaluación se dispara por señales de
> negocio, no por calendrier.

Evaluar transición si ocurre cualquiera:

- promedio interno se acerca a 4 UTM;
- pipeline indica que 5 UTM se superará pronto;
- llegan clientes empresa valiosos;
- alguien requiere factura;
- aparecen contratos recurrentes;
- B2B puede generar más valor que el costo administrativo;
- la actividad deja de ser razonablemente de subsistencia.

Antes del cambio:

- confirmar actividad económica correcta;
- régimen;
- IVA;
- documentación tributaria;
- F29/obligaciones;
- patente;
- contabilidad;
- pricing.

No asumir automáticamente que el IVA de vehículo, combustible o mantención automotriz será crédito fiscal.

---

# 23. Backlog futuro B2B — FUTURE B2B

> **FUTURE B2B.** Nada de esta lista es alcanzable bajo el régimen de
> subsistencia. Requiere, en este orden: respuesta municipal, luego la
> migración tributaria correspondiente, y recién entonces este backlog.

Una vez habilitado legal/tributariamente:

- visita empresarial;
- diagnóstico de oficina;
- packs 3/5/10 equipos;
- mantención preventiva;
- upgrades SSD/RAM múltiples;
- Wi-Fi/red;
- impresoras;
- backup;
- onboarding de equipos;
- inventario básico;
- soporte recurrente;
- SLA liviano.

Pricing B2B debe incorporar criticidad, número de equipos, downtime, documentación, responsabilidad, condiciones de pago e impuestos.

---

# 24. No hacer

- no publicar dirección residencial;
- no commitear RUT;
- no commitear certificado SII;
- no commitear contraseña del PDF;
- no commitear datos de clientes;
- no fake reviews;
- no fake ratings;
- no stock photos que simulen trabajos reales;
- no “24/7”;
- no tiempos de respuesta inventados;
- no SLA no aprobado;
- no prometer recuperación de datos;
- no aceptar empresas bajo el régimen actual;
- no superar conscientemente el régimen y seguir operando como si nada;
- no añadir IVA mientras no corresponda;
- no crear doorway pages locales;
- no meter analytics con PII;
- no financiar inventario por defecto;
- no paid ads antes de conocer economics.

---

# 25. Source of truth

## Código

```text
support/src/config.ts
support/src/pages/index.astro
support/src/pages/privacidad.astro
support/src/pages/condiciones-del-servicio.astro
support/src/lib/
support/tests/
support/public/_headers
support/astro.config.ts
```

## Documentación

```text
docs/support/master-plan.md
docs/support/implementation.md
docs/support/deployment.md
docs/support/operations.md
docs/support/review.md
docs/support/acquisition-drafts.md
docs/support/TOOLTICIAN_SUPPORT_LAUNCH_HANDOFF.md   ← este documento
```

Aviso sobre la antigüedad relativa de esos documentos, porque no todos están al
día entre sí y una lectura cruzada ingenua va a confundir:

- **`master-plan.md`** es la especificación original. Conserva intendidos ya
  superados, como «selected sectors of Providencia» y precios propuestos. **No
  usar como estado actual**; usarlo para entender el razonamiento de producto.
- **`review.md`** es el registro de la entrega del 27-09-2026 y describe un estado
  anterior: menciona «precios propuestos», pruebas 5/5, WebKit pendiente en CI y
  waits de tax/WhatsApp. Es historial, no backlog.
- **`deployment.md`** tiene la tabla del panel de Pages y las comprobaciones del
  preview, y su sección «Preview desplegado» cita el deployment `68334ce6`
  (`54ad7cf`). Hay deployments más recientes; ver §3.1 de este handoff.
- **`implementation.md`**, **`operations.md`** y **`acquisition-drafts.md`** sí
  están alineados con el estado actual.

Cuando dos documentos se contradigan, manda el código y después este handoff.

## Infra

```text
Cloudflare Pages project: tooltician-support
PR #72
branch: feat/tooltician-support-v1
```

---

# 26. Referencias oficiales relevantes

SII — Resolución Ex. N°193/2025:

```text
https://www.sii.cl/normativa_legislacion/resoluciones/2025/reso193.pdf
```

SII — Resoluciones 2026, incluida modificación del registro:

```text
https://www.sii.cl/normativa_legislacion/resoluciones/2026/res_ind2026.htm
```

Municipalidad de Macul — Patentes Comerciales:

```text
https://www.munimacul.cl/portalnv/index.php/patentes-comerciales-2/
```

Google — service-area business:

```text
https://support.google.com/business/answer/9157481
```

Google Search — Organization structured data:

```text
https://developers.google.com/search/docs/appearance/structured-data/organization
```

---

# 27. Criterio de éxito de V1

V1 no se evalúa por “tener una web bonita”.

Se evalúa por:

- clientes reales;
- servicio ejecutable;
- baja fricción;
- claridad;
- contribución positiva;
- retrabajo bajo;
- referidos;
- reseñas;
- señales de recurrencia;
- posibilidad de escalar a B2B;
- disciplina con el límite tributario.

Objetivo conceptual:

> **Producto serio primero, evidencia real inmediatamente después, escala sólo cuando los números lo justifiquen.**

---

# 28. Próxima acción concreta

## Lo que ya no hay que hacer

La primera versión de esta lista pedía «ejecutar sprint de polish SEO/UX/trust
sobre preview». **Ya está hecho**, en `56d5667`. No volver a abrirlo salvo que
haya un motivo real; el trabajo pendiente está en §12 y §13 y es de otro tipo.

## Mientras se espera Rentas Macul

1. mantener `municipalPermit=false` — no tocarlo por presión de agenda;
2. resolver el check de Codacy y pasar el PR #72 de draft a *Ready for review*;
3. revisar visualmente los cinco anchos que el E2E ya no overflowean (360, 390,
   412, 768, 1440);
4. preparar kit físico;
5. verificar medios de pago en terreno;
6. preparar tracker privado, con el formato de referencia `TS-` de §9.1;
7. preparar fotos reales de servicios, sin PII;
8. preparar los posts de adquisición;
9. no abrir reservas.

## Cuando llegue Rentas

```text
interpretar
→ cumplir
→ municipalPermit=true
→ release-check PASS
→ review final
→ PR ready + Codacy resuelto
→ merge
→ production
→ dominio
→ smoke tests
→ adquisición
```

---

# 29. Calidad — triage de Codacy

> **Estado: DONE para los hallazgos reales.** El resto es ruido medido y
> documentado. Único blocker sigue siendo el municipal.

## 29.1 Qué es y qué no es el check

El check se llama `Codacy Static Code Analysis` y su conclusión es
`action_required`, no `failure`. Eso significa que Codacy terminó el análisis y
está pidiendo una decisión, no que el análisis haya fallado. El título del run es:

```text
181 new issues (0 max.) of at least minor severity.
```

De las **50 anotaciones que GitHub expone** (GitHub las topa en 50), la
distribución por severidad es:

| Severidad | Cantidad |
|---|---|
| `error` | **0** |
| `warning` | 13 |
| `notice` | 37 |

**No hay un solo hallazgo de severidad error, ni de seguridad, ni de privacidad.**
El número 181 es aritmética de líneas nuevas, no 181 defectos: `support/` es
íntegramente nuevo en este PR, así que todo su contenido cuenta como «nuevo».

## 29.2 Clasificación de las 50 anotaciones

| categoría | count | severidad | acción |
|---|---:|---|---|
| Markdown en `master-plan.md` | 21 | notice | no arreglar — ruido |
| Markdown en `operations.md` | 6 | notice | no arreglar — ruido |
| Markdown en `implementation.md` + `acquisition-drafts.md` | 4 | notice | no arreglar — ruido |
| CSS whitespace en `styles.css` | 4 | notice | no arreglar — cosmético |
| **`analytics.ts` non-null assertion** | **1** | warning | **corregido** |
| **`analytics.ts` `arguments` en vez de rest** | **1** | warning | **corregido** (ver nota) |
| **`client.ts` `forEach` con callback que retorna valor** | **2** | warning | **corregido** |
| `client.ts` notación de punto | 3 | warning | corregido |
| `release-check.ts` template literals | 2 | notice | corregido |
| `generate-og.mjs` sombreado de `escape` | 1 | warning | corregido |
| `analytics.ts` `document.cookie` | 2 | warning | **falso positivo — no tocar** |
| `contact.ts` control chars en regex | 1 | warning | **falso positivo — no tocar** |
| `contact.ts` `.replaceAll("-", "")` | 1 | warning | **falso positivo — no tocar** |
| `generate-og.mjs` lookup object en `.replace()` | 1 | warning | **falso positivo — no tocar** |

**62% de los hallazgos visibles es formato de prosa Markdown.**

### Nota: un fix de este lote se corrigió a sí mismo

La primera versión del cambio en `analytics.ts` quitaba la aserción no-nula pero
dejaba el shim usando `arguments`, y de paso introducía una asignación dentro de
una expresión. El resultado fue **cero mejora neta** en ese archivo: se resolvió
un hallazgo, y además dos nuevos. La forma final separa las tres cosas:

```ts
const dataLayer: unknown[] = w.dataLayer ?? [];
w.dataLayer = dataLayer;
w.gtag = function (...args: unknown[]) {
  dataLayer.push(args);
};
```

Sin aserción no-nula, sin `arguments`, sin asignación en expresión, y
`window.dataLayer` sigue siendo la misma referencia que `dataLayer`, que es lo
que comprueba el fixture de release. Queda registrado para que nadie repita el
intento fallido.

## 29.3 El hallazgo que Codacy no detectó

Leyendo `generate-og.mjs` para el aviso de sombreado apareció un defecto real
que el linter no marca:

`support/generate-og.mjs` renderizaba la imagen de compartir con
**`ÑUÑOA · SECTORES DE PROVIDENCIA`**. Esa imagen **se publica**: es
`og:image` en todas las páginas, vía `Layout.astro`.

Contradecía la decisión de cobertura confirmada: `config.ts` tiene Providencia
completa, `unit.test.ts` afirma que la cobertura **no** es sectorial, y `dd1d1f6`
quitó el texto «sectores de Providencia» a propósito — pero **nunca tocó
`generate-og.mjs` ni el PNG**. Ese commit se lo saltó.

Efecto: cada compartir en redes anunciaba Providencia sectorial, en desacuerdo
con la página viva. **Corregido**: el texto ahora es `PROVIDENCIA` y la imagen se
regeneró.

## 29.4 Los cuatro falsos positivos, y por qué no se tocan

1. **`analytics.ts` — «Direct assigning to document.cookie is not recommended»**
   (2 ocurrencias). Es el código que **borra** las cookies `_ga*` al retirar el
   consentimiento. Asignar `Max-Age=0` es la **única** forma de borrar una
   cookie. El código ya cubre `Path=/` y `Domain=hostname`. «Recomendado» aquí
   significaría no borrar, y eso rompería la garantía de privacidad.

2. **`contact.ts:21` — «Unexpected control character in a regular expression»**.
   El regex es `/[\u0000-\u001f\u007f]/g`: el **sanitizador** que elimina
   caracteres de control del texto del cliente. Escrito con escapes, es correcto
   y es una medida de seguridad. La regla apunta a literales de control.

3. **`contact.ts:20` — «Non-serializable expression»** sobre
   `.replaceAll("-", "")`. Es un primitivo de cadena. La regla apunta a regex y
   funciones dentro de `.replace()`.

4. **`generate-og.mjs:13` — «Non-serializable expression»**. Es una tabla de
   búsqueda `{ "&": "&amp;", ... }[c]` dentro de un reemplazo de entidad HTML.
   Es el escape correcto.

## 29.5 Complejidad: los números no son deuda real

Codacy reporta «complexity increasing» como suma, porque todo `support/` es
nuevo. Al medir complejidad ciclomática real y longitud de función:

| archivo | loc | ciclomático | función más larga | Codacy |
|---|---:|---:|---:|---:|
| `src/client.ts` | 106 | 30 | — (código de módulo) | 35 |
| `src/config.ts` | 177 | 13 | 16 | 17 |
| `src/lib/analytics.ts` | 124 | 12 | **30** | 22 |
| `src/lib/contact.ts` | 66 | 16 | 16 | 20 |
| `tests/browser.mjs` | 159 | 12 | — | 13 |
| `tests/release-browser.mjs` | 137 | **5** | — | 13 |
| `tests/server.mjs` | 68 | 13 | 1 | 13 |
| `tests/unit.test.ts` | 332 | 14 | 3 | 31 |

La función más larga de todo el código de producción tiene **30 líneas**.
`config.ts` es 99% datos declarativos. `release-browser.mjs` tiene complejidad 5
en 137 líneas porque es una secuencia lineal de aserciones. Los archivos de tests
tienen complejidad aditiva por naturaleza, y esa complejidad **no es riesgo de
defecto**.

**No se refactorizó nada para subir una métrica.** Fragmentar funciones simples
sería degradar legibilidad a cambio de nada.

## 29.6 Configuración de Codacy

Se añadió `.codacy.yml` con **una sola** exclusión, que acota `remark-lint` a los
cuatro archivos que efectivamente produjeron ruido. No excluye ningún archivo de
código, no baja severidades y no desactiva analizadores. `support/` sigue
analizándose por completo. Justificación completa dentro del propio archivo.

Pendiente de decisión humana: según la documentación de Codacy, **Codacy Cloud
lee `.codacy.yml` desde la rama por defecto** (`master`). Este PR apunta a
`master`, así que la config puede no tener efecto hasta que se integre.

## 29.7 Ruido aceptado, no suprimido

4 avisos de stylelint en `support/src/styles.css` («expected empty line before
rule»). El archivo es compacto e internamente consistente; insertar líneas en
blanco selectivamente lo haría **menos** consistente. Cosmético, sin señal de
defecto, y se deja visible a propósito.

---

# 30. Fin del handoff

Actualizar este documento en cada cambio material de:

- situación municipal;
- régimen tributario;
- pricing;
- cobertura;
- alcance;
- producción;
- B2B;
- políticas de datos.
