# Tooltician Soporte — implementación V1

Estado: revisión previa al lanzamiento. No constituye un servicio abierto a reservas.

## Decisión de arquitectura

Se inspeccionaron el repositorio `cortega26/cortega26.github.io`, AGENTS.md,
CLAUDE.md, configuración Astro, workflow de Pages, dependencias, estilos,
analítica y pruebas. El portafolio es Astro estático, bilingüe, desplegado desde
master por GitHub Actions a GitHub Pages y servido detrás de Cloudflare.

Se añade `support/`, una aplicación Astro independiente con el mismo lockfile.
No se cambian las rutas, layout, analítica ni deployment del portafolio.
No se necesita convertir el repositorio en un monorepo con gestor nuevo.
La tipografía Archivo existente se importa y empaqueta desde el repositorio;
la identidad usa una variante clara, verde y dorada de Tooltician.

- Fuente: `support/src/`; hechos comerciales: `support/src/config.ts`.
- Salida: `support/dist/`, distinta de `dist/` del portafolio.
- Rutas: `/`, `/privacidad/`, `/condiciones-del-servicio/`, 404 y robots.
- Sin backend, base de datos, gestor de citas, pagos ni librerías UI adicionales.
- La ilustración del computador es CSS. El retrato es la fotografía real de
  `support/src/assets/`, procesada por `astro:assets` (WebP y `srcset`); no lleva
  filtros ni deformaciones y se recorta en 1:1 con `object-fit: cover`.
- Formularios: validación local, revisión del mensaje y apertura explícita de WhatsApp.
- El mensaje no se guarda; una edición invalida la vista preparada.
- La referencia aleatoria permite registrar la consulta en una hoja privada. No se
  envía a GA4: la conciliación individual entre visita web y venta se pospone.

## Decisiones propuestas que requieren confirmación

Visita de 45 minutos: $30.000 Macul/Ñuñoa, $35.000 Providencia. Precios finales al
consumidor, sin IVA agregado mientras rija el Registro de Actividades de
Subsistencia.
La visita se abona a la mano de obra en una misma intervención. Se cobra el mayor
de ambos importes; piezas y extras se suman con autorización. No se suma visita
más mano de obra completa por defecto. Confirmar esta política con los precios.

Se excluyen macOS y retiro de equipos inicialmente. Atención previa coordinación.
Las condiciones, impuestos incluidos en el precio final, documentación tributaria,
alcance y plazos de conservación requieren confirmación antes de publicar.

## Lanzamiento bloqueado por defecto

Sin `SUPPORT_RELEASE=1`, todas las páginas contienen `noindex, nofollow`, robots
bloquea rastreo, no se genera sitemap y no se ofrecen reservas reales.
Esto evita indexación accidental; NO equivale a control de acceso. La revisión
debe realizarse en local o en un preview privado si el contenido no debe ser público.

`SUPPORT_RELEASE=1` falla solo por hard blockers: contacto alcanzable, medio de
pago, documento tributario, cobertura, retención, retrato, confirmaciones
comerciales y prueba real de WhatsApp. Nunca se completan con números o
identidades ficticias. GA4, analytics, Search Console y reseñas son soft: se
informan como advertencia y no bloquean la publicación.

`npm run support:release-check` separa ambos grupos: sale con código 1 solo si
quedan hard blockers, y siempre imprime los pendientes de post-lanzamiento.

Comandos desde la raíz:

```bash
npm ci
npm run support:verify
npx playwright install --with-deps chromium firefox webkit
npm run support:e2e
npm run support:dev
```

`support:verify` es el orden obligatorio: `support:check` → `support:test:unit`
(lógica pura, sin build) → `support:build` → `support:test:dist` (lee
`support/dist`). Los tests de artefacto declaran esa dependencia: si falta el
build se marcan como omitidos con el motivo, nunca lo generan por su cuenta.

La CI de soporte solo verifica y guarda capturas; no despliega. Las pruebas nuevas
comprueban Unicode/inyección en WhatsApp, validación, privacidad, bloqueos de
publicación, teclado, cambio de formulario, rutas y cinco anchos responsive.

## Analítica y límites

GA4 requiere consentimiento explícito. Se desactiva la vista automática, publicidad
y Google Signals. Cookies por 90 días y solo en el subdominio. Se envía ubicación
canónica sin query/hash, referrer vacío y dimensiones bajo listas cerradas.
No se transmite el mensaje, modelo, dirección, teléfono ni la referencia de consulta.
UTM desconocidas se descartan; solo se conservan categorías predefinidas.

Eventos de página, CTA, comienzo/finalización del formulario, clic a WhatsApp y
visibilidad de secciones. Se evita duplicación en doble submit/clic de la misma
consulta. Un clic NO equivale a mensaje enviado, lead recibido, reserva ni venta.
La atribución es de la página actual y sujeta a consentimiento; no hay seguimiento
entre dispositivos ni asignación individual de ventas a sesiones.

Antes de confirmar `verified.analytics`: configurar el stream GA4 y desactivar
Enhanced Measurement (en especial formularios/clics salientes), comprobar DebugView
y la red real, rechazo/retirada de consentimiento, una emisión por acción y ausencia
de PII. No afirmar que un test con mocks acredita la recepción en GA4.

## Fuentes revisadas el 27-09-2026

- SERNAC, artículo 41: https://www.sernac.cl/portal/609/w3-propertyvalue-58819.html
- SERNAC, garantía por reparación: https://sernac.cl/portal/617/w3-article-57427.html
- BCN, Ley 21.719 y vigencia: https://www.bcn.cl/leychile/navegar?idNorma=1209272
- Astro en Cloudflare Pages: https://developers.cloudflare.com/pages/framework-guides/deploy-an-astro-site/
- GA4, configuración: https://developers.google.com/analytics/devguides/collection/ga4/reference/config

La copia no confunde garantía de bienes nuevos con responsabilidad por reparación.
La revisión legal operativa y tributaria no se considera completada automáticamente.
Revisar privacidad antes de la entrada en vigor de la Ley 21.719, 01-12-2026.
