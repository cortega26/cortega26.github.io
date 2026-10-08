# Despliegue independiente y reversión

Destino propuesto: proyecto Cloudflare Pages separado conectado al mismo repo.
El proyecto actual de GitHub Pages conserva configuración, dominio y salida.
No cambiar `public/CNAME` ni sustituir el workflow de despliegue del portafolio.

## Configuración recuperada del repositorio

Revisada el 27-09-2026. No es necesario pedir estos datos al propietario:

- `.github/workflows/deploy.yml`: GitHub Pages, rama `master`, Node 24,
  `npm ci`, build Astro, artefacto `dist/`. En pull requests verifica sin publicar.
- `public/CNAME`: `tooltician.com`.
- `docs/cloudflare-security-headers.md`: Cloudflare como proxy y cabeceras
  mediante Transform Rules con expresiones específicas de host/ruta.
- `scripts/cloudflare-csp-rules.sh`: aplicación de CSP para el host principal;
  obtiene el token de `CF_API_TOKEN` o entrada interactiva, no del repositorio.
- `docs/analytics-sprint-0.md`: propiedad Tooltician `551059139`, stream
  `15478383962`, identificador público `G-2HK4GHK7GR`. La CI lo lee de
  `vars.PUBLIC_GA4_MEASUREMENT_ID`. Hay validaciones previas documentadas.

El repositorio no contiene credenciales de administración de Cloudflare ni
configuración de Pages; el proyecto se administra por CLI con la sesión
personal del propietario. El proyecto `tooltician-support` ya existe en la
cuenta y sirve previews de rama (ver "Preview desplegado"); el subdominio
`soporte.tooltician.com` sigue sin asociar. Conocer la configuración del host
principal no implica que el deployment de producción exista.

La decisión de reutilizar el stream GA4 debe verificar primero sus opciones de
Enhanced Measurement: cambiarlas afecta también al portafolio. Si no puede
garantizarse aislamiento de formularios y enlaces de WhatsApp, crear otro stream
dentro de la propiedad existente. El ID conocido no se activa en previews.

## Decisiones ya resueltas por el propietario

- **Cobertura**: Macul, Ñuñoa y Providencia completas. La coordinación horaria,
  el acceso y el estacionamiento afectan la disponibilidad, no la cobertura.
- **Precios finales de lanzamiento**: visita $30.000 en Macul y Ñuñoa, $35.000 en
  Providencia, hasta 45 minutos. Se mantienen altos a propósito para no producir
  una discontinuidad cuando se migre desde el Registro de Subsistencia a un
  régimen afecto a IVA. Son precios finales al consumidor: no se agrega IVA ni
  ningún concepto, y no se afirma que incluyan IVA mientras rija el registro.
  Servicios: mantención desktop desde $40.000 y notebook desde $45.000; SSD/RAM
  desde $30.000; Windows desde $40.000; respaldo y Wi-Fi desde $35.000; remoto
  $25.000. Se cobra la visita aunque el cliente no continúe con la reparación.
- **WhatsApp verificado**: envío y recepción probados por el propietario con
  +56 9 5111 8901. `verified.realPhone` es true y ya no bloquea.
- **Visita y mano de obra**: en la misma visita se cobra el mayor valor entre visita
  y servicio, más repuestos, licencias y extras autorizados. No se suman ambos.
- **Segunda visita**: se informa alcance y precio antes, y requiere acuerdo previo.
- **Repuestos**: el cliente puede comprar sus componentes; si los compra
  Tooltician, se acuerda y se paga previamente, con comprobante. Sin inventario
  financiado ni márgenes sobre hardware.
- **Pagos**: transferencia, efectivo o tarjeta, al mismo precio. El costo del medio
  de pago es operativo y no se traslada al cliente.
- **Privacidad y retención**: 90 días para consultas no convertidas, hasta 12 meses
  de registro operativo mínimo del servicio realizado, dirección exacta eliminada
  cuando deja de ser necesaria, sin contraseñas, con eliminación de copias
  temporales y respeto a plazos legales aplicables.
- **Alcance V1**: diagnóstico, escritorio, notebooks, Windows, SSD/RAM,
  mantenimiento, respaldo, Wi-Fi, impresoras y remoto. Fuera: microsoldadura,
  reparación electrónica de placas, recuperación avanzada, celulares, consolas,
  líquidos que requieran reparación especializada, baterías hinchadas, trabajos
  eléctricos peligrosos, emergencias y retiro de equipos. macOS fuera de alcance.
- **Condiciones**: autorización expresa para cualquier acción destructiva, precios
  visibles de mano de obra, sin licencias pirateadas y sin renuncia a derechos del
  consumidor.

## Decisiones humanas pendientes antes de producción

Queda una sola, y es externa: ningún cambio de código puede resolverla.

1. **Emisión de la patente municipal** (`Confirmar municipalPermit`). El
   Departamento de Rentas de la Municipalidad de Macul respondió por escrito el
   2026-09-30 y confirmó que la modalidad aplicable es **Patente de Domicilio Postal
   Tributario**. Ya no se espera una definición de categoría: falta presentar el
   expediente y obtener la patente o una confirmación municipal equivalente que
   habilite el inicio.

`business.municipal` conserva la ruta confirmada y el estado
`application_pending`; `confirmed.municipalPermit` permanece en false hasta la
emisión efectiva. Tributario y WhatsApp ya no bloquean: `confirmed.tax` y
`verified.realPhone` son true. GA4, analytics y reviewUrl son soft.

## Régimen tributario

Inscrito en el Registro de Personas Naturales que desarrollan Actividades de
Subsistencia del SII (Resolución Ex. SII N°193/2025). `business.taxRegime`
declara el estado; `confirmed.tax` es true y el régimen ya no es hard blocker.
Mientras la inscripción esté vigente no requiere Inicio de Actividades, está
exonerado de IVA y liberado de emitir boletas, y se atende sólo a consumidores
finales dentro del promedio máximo de 5 UTM mensuales. La inscripción no sustituye
permisos municipales y el sitio no anuncia atención al público. Controles
internos y umbral de alerta en `operations.md`.

## Proyecto Pages

- Directorio raíz: raíz del repositorio (necesita lockfile y fuentes compartidas).
- Node: 24. Fijar `NODE_VERSION=24` en el panel; `.node-version` y `.nvmrc` ya
  lo declaran, pero la variable es la que garantiza el build.
- Dependencias: `.npmrc` incluye `include=dev`. Pages inyecta
  `NODE_ENV=production`, que haría que `npm ci` omita las devDependencies y el
  build fallaría por no encontrar `astro`, que es una devDependency.
- Comando preview: `npm run support:build`.
- Comando de producción: `npm run support:release-check && npm run support:build`.
- Variable solo de producción: `SUPPORT_RELEASE=1`.
- Directorio de salida: `support/dist`.
- Rama de producción: master, solo después de integrar el PR revisado.
- Evitar builds por cambios ajenos mediante build watch paths cuando se configure.
- No hay tokens de Cloudflare ni secretos en código/frontend.

### Preview (sin publicar producción)

Sin `SUPPORT_RELEASE` (ausente o distinto de `1`) el build no exige datos de
lanzamiento y produce un sitio de revisión:

- `<meta name="robots" content="noindex, nofollow">` y `robots.txt` con
  `Disallow: /`; no se genera sitemap.
- La portada general continúa sin enlace saliente a `wa.me` hasta habilitar el servicio general.
- En `/vecinos/`, se permiten **consultas informativas** por WhatsApp aun en preview. Esto **no habilita recepción ni reparación** de equipos: `neighborOffer.ready`, `operatingAuthorizationConfirmed` y `confirmed.municipalPermit` siguen en `false`.
- Sin GA4: sin `analyticsId` no se inyecta googletagmanager y no se envía ningún
  evento. La portada general mantiene el banner "Vista previa"; `/vecinos/` informa que las consultas están abiertas y la recepción exige confirmar condiciones aplicables.
- El retrato sí se optimiza y se muestra; es la única foto real publicada.

Valores exactos para el panel de Cloudflare Pages:

| Campo | Valor |
| --- | --- |
| Framework preset | None |
| Root directory | `/` |
| Build command | `npm run support:build` |
| Build output directory | `support/dist` |
| Root directory (variables) | `/` |
| `NODE_VERSION` | `24` |
| `SUPPORT_RELEASE` | sin definir (previews y producción por separado) |
| `NODE_ENV` | sin tocar; `.npmrc` ya fuerza la instalación de devDependencies |

El deploy de producción requiere todavía resolver DNS y el dominio propio. Añadir
`soporte.tooltician.com` como dominio personalizado en Pages solo cuando el
lanzamiento esté autorizado.

## Preview desplegado (2026-09-27)

Existe un preview real y público. PRODUCCIÓN sigue sin desplegarse.

- Proyecto Pages: `tooltician-support` (`tooltician-support.pages.dev`).
- Rama de producción del proyecto: `master`. No se ha desplegado producción, por
  eso `https://tooltician-support.pages.dev/` responde 404.
- Deployment: `68334ce6-f0ce-44fa-ae68-55bb1ae87e73`, environment `Preview`,
  rama `feat/tooltician-support-v1`, commit `54ad7cf`.
- URL del deployment:
  `https://68334ce6.tooltician-support.pages.dev`
- Alias estable de la rama:
  `https://feat-tooltician-support-v1.tooltician-support.pages.dev`
- Método (Wrangler 4.142.0, build local, sin Git integration):

```bash
rm -rf support/dist
npm run support:verify
npx wrangler pages deploy support/dist \
  --project-name tooltician-support \
  --branch feat/tooltician-support-v1 \
  --commit-hash "$(git rev-parse HEAD)"
```

El proyecto se creó con `npx wrangler pages project create tooltician-support
--production-branch master --force`; `--force` solo es necesario en la creación
porque esa versión de Wrangler delega el comando a Pages sobre Workers.

### Verificado contra la URL remota

- HTTP 200 en `/`, `/privacidad/`, `/condiciones-del-servicio/`, `/robots.txt`,
  `/favicon.svg` y `/og-card.png`; 404 en ruta inexistente, en
  `/sitemap-index.xml` y en `/sitemap-0.xml`.
- `noindex, nofollow` en el HTML y `x-robots-tag: noindex` añadido por Cloudflare.
- `robots.txt` responde `User-agent: *` / `Disallow: /`.
- Sin `wa.me` en el HTML, sin googletagmanager y sin ningún ID `G-` en los
  bundles; el banner "Vista previa" visible.
- Retrato optimizado en WebP, `alt="Carlos Ortega, responsable de Tooltician
  Soporte"`, 320x320 en móvil y 363x363 en escritorio, sin requests externos ni
  errores de consola.
- Cabeceras de `support/public/_headers` aplicadas: CSP, `X-Content-Type-Options`,
  `Referrer-Policy`, `Permissions-Policy`, `X-Frame-Options` y HSTS.
- HTTP→HTTPS 301 y certificado válido (`CN=tooltician-support.pages.dev`,
  Let's Encrypt, `Verify return code: 0`).

Capturas en `output/support-preview/` (390 px y 1440 px), fuera del repositorio.

### No hecho

- Sin dominio personalizado, sin `soporte.tooltician.com`, sin cambios de DNS.
- Sin `SUPPORT_RELEASE=1`, sin sitemap de producción, sin reservas reales.
- Sin GA4, sin Search Console y sin Google Business Profile.
- TLS y cabeceras verificados solo en el hostname `*.pages.dev` del preview.

## Despliegue automático del preview desde GitHub Actions (sin Desktop Commander)

La automatización está en `.github/workflows/support-cloudflare-preview.yml`. Se ejecuta
al integrar cambios en `support/**`, dependencias o el propio workflow en `master`;
también permite `workflow_dispatch` manual. No interviene en el sitio principal
de GitHub Pages, `public/CNAME`, dominio personalizado ni publicación de producción.

Credenciales de la cuenta Cloudflare, configuradas **una sola vez** en el repositorio:

- **Actions secret** `CLOUDFLARE_API_TOKEN`: token con permisos mínimos para editar
  Cloudflare Pages en la cuenta propietaria del proyecto `tooltician-support`.
  Guardarlo como secreto; nunca enviarlo por chat, añadirlo a código o logs.
- **Actions variable** `CLOUDFLARE_ACCOUNT_ID`: identificador de la cuenta de
  Cloudflare donde ya existe ese proyecto. El ID no es una credencial.
- No utilizar `CF_API_TOKEN` de scripts personales como sustituto implícito de
  esta credencial de CI. No compartir una clave de acceso global.

Si falta cualquiera de los dos valores, el job se marca como **omitido**
en su resumen, sin compilar ni realizar llamadas a Cloudflare. Una vez
configurados, en GitHub > Actions > **Tooltician Support Cloudflare Preview**
> **Run workflow** se ejecuta la publicación inicial; los cambios posteriores
en el subproyecto se despliegan al fusionarse en `master`.

El workflow ejecuta `npm ci`, `npm run support:verify` y un
`wrangler pages deploy` a la rama de preview fija
`feat/tooltician-support-v1` del proyecto **existente** `tooltician-support`,
con `SUPPORT_RELEASE=0`. Evita construir o publicar por accidente el sitio general
en modo producción. Comprueba luego por HTTP que el alias estable muestra los
dos testimonios identificados, el plazo de 24 horas, WhatsApp y `noindex`.
Falla si el contenido remoto no coincide con el commit desplegado.

**Importante:** este mecanismo solo resuelve el despliegue técnico del preview.
Las consultas para vecinos están abiertas por decisión del titular, pero el
repositorio **no** declara obtenida la autorización municipal para recibir
o reparar computadores en el departamento: los flags de permiso siguen falsos.

## Dominio y seguridad

Confirmar TLS, HTTP→HTTPS, canonical y las cabeceras de `support/public/_headers`.
No basta con comprobar el archivo: verificar respuestas de producción.
Redirigir el hostname `*.pages.dev` de producción al dominio final y proteger los
previews de ramas con Access. No redirigir previews de pruebas a producción.
Configurar una regla por hostname en Cloudflare; no introducir reglas amplias que
afecten a otros subdominios. Sin dirección residencial en HTML/schema/config.

Comprobar `/robots.txt`, `/sitemap-index.xml`, 404, favicon, OG, assets y páginas
legales. En modo de revisión robots bloquea todo y no existe sitemap, a propósito.
Registrar propiedad de Search Console y enviar sitemap solo después de abrir.
No añadir estrellas o AggregateRating sin reseñas reales.

## Smoke test y promoción

- Abrir desde teléfono real y completar una consulta sin datos privados.
- Confirmar destinatario de WhatsApp y caracteres del mensaje.
- Comprobar consentimiento y tráfico GA4 (sin texto libre ni PII).
- Confirmar precio, alcance, forma de pago y documento antes de la primera reserva.
- Medir Lighthouse en deployment y después métricas reales cuando exista tráfico.
- No promocionar si falta cualquiera de los requisitos del master plan §28.

## Reversión

Restaurar la última versión funcional del proyecto soporte desde Pages y verificar
el dominio. Para el primer despliegue, retirar la asociación DNS del nuevo
subdominio si no existe una versión anterior y detener la promoción. No modificar
el DNS apex/WWW ni GitHub Pages. Revertir el commit de soporte mediante un PR
revertible si corresponde. Conservar autorizaciones y documentos comerciales fuera
del repositorio; revertir código no elimina registros necesarios de clientes.
