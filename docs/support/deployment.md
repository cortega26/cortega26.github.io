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
- **Precios y visita**: $25.000 en Macul y Ñuñoa, $30.000 en Providencia, hasta 45
  minutos. Se cobra aunque el cliente no continúe con la reparación.
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

Sólo dos siguen bloqueando. Ninguna se puede marcar desde el repositorio.

1. **Documento tributario** (`taxDocument`, `Confirmar tax`): qué documento se
   emite por cada visita y quién lo emite. Sigue vacío a propósito.
2. **Prueba real de WhatsApp** (`Verificar realPhone`): abrir el flujo desde un
   dispositivo real, enviar un mensaje y comprobar recepción efectiva en el
   número publicado. Conocer el número no es verificarlo.

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
- Sin enlace saliente a `wa.me` ni número de WhatsApp: el formulario prepara el
  mensaje en el navegador y no envía nada.
- Sin GA4: sin `analyticsId` no se inyecta googletagmanager y no se envía ningún
  evento. El banner "Vista previa" permanece visible.
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
