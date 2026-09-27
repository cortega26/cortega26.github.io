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

El repositorio no contiene un proyecto Pages/Workers para el subdominio soporte
ni credenciales de administración de Cloudflare. Conocer la configuración del
host principal no implica que el deployment independiente ya exista. Mantener
Cloudflare Pages como propuesta de despliegue separado hasta configurarlo.

La decisión de reutilizar el stream GA4 debe verificar primero sus opciones de
Enhanced Measurement: cambiarlas afecta también al portafolio. Si no puede
garantizarse aislamiento de formularios y enlaces de WhatsApp, crear otro stream
dentro de la propiedad existente. El ID conocido no se activa en previews.

## Previo al lanzamiento

1. Completar `support/src/config.ts` con datos reales y confirmados.
2. Añadir foto real optimizada en `support/public`, configurar la ruta y revisar.
3. Confirmar documentación tributaria, precios finales, medios de pago, cobertura,
   contacto para derechos de datos/reclamos y política real de conservación.
4. Ejecutar las pruebas del sitio principal y soporte. Revisar las capturas a
   360, 390, 412, 768 y 1440 px y probar WhatsApp en el teléfono real.
5. Configurar/verificar GA4 como indica implementation.md, inicialmente en un
   entorno de revisión con identificador real. Las confirmaciones representan
   comprobaciones humanas y no deben activarse solo para superar el build.
6. Registrar SHA aprobado y versión previa de deployment para revertir.

## Proyecto Pages

- Directorio raíz: raíz del repositorio (necesita lockfile y fuentes compartidas).
- Node: 24.
- Comando preview: `npm run support:build`.
- Comando de producción: `npm run support:release-check && npm run support:build`.
- Variable solo de producción: `SUPPORT_RELEASE=1`.
- Directorio de salida: `support/dist`.
- Rama de producción: master, solo después de integrar el PR revisado.
- Evitar builds por cambios ajenos mediante build watch paths cuando se configure.
- No hay tokens de Cloudflare ni secretos en código/frontend.

El deploy real requiere acceso a la cuenta/proyecto Cloudflare y DNS. No está
automatizado ni ejecutado por este cambio. Añadir `soporte.tooltician.com` como
dominio personalizado en Pages y usar el DNS que indique el proveedor.

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
