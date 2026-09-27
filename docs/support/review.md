# Entrega V1 — 27 de septiembre de 2026

Implementación preparada para revisión. **No publicada; no recibe reservas.**

## Implementado

- Landing responsive con servicios, precios propuestos, proceso, identidad,
  cobertura, privacidad, preguntas frecuentes y formulario.
- Aplicación estática independiente en `support/`, compartiendo Astro y Archivo
  con el repositorio. Salida y configuración separadas del portafolio.
- Preparación y revisión del mensaje de WhatsApp, validación accesible,
  protección frente a HTML en campos y referencias aleatorias.
- Analítica opcional con consentimiento, dimensiones cerradas, eventos sin PII
  y sin vistas automáticas duplicadas.
- Privacidad, condiciones, OG, robots, sitemap de producción y cabeceras.
- Bloqueo de build de producción mientras falten hechos comerciales verificados.
- Pruebas unitarias y de navegador, CI independiente, instrucciones de despliegue
  y reversión, documentos operativos y borradores de adquisición.

## Evidencia y límites

| Comprobación | Resultado |
| --- | --- |
| Build y comprobación Astro de soporte | Correctos, cero errores/avisos |
| Pruebas unitarias y del artefacto de revisión | 5/5 |
| Chromium: formulario, teclado, rutas y privacidad | Correcto |
| Compilación de producción con datos ficticios, solo para pruebas locales | WhatsApp, consentimiento, payloads y deduplicación correctos; nada enviado a terceros |
| Revisión visual | 360, 390, 412, 768 y 1440 px, sin desbordamiento horizontal |
| axe, inicio escritorio/móvil y páginas legales | Cero infracciones en los criterios automáticos probados |
| Lighthouse móvil local, revisión | Rendimiento 99, accesibilidad 100, buenas prácticas 100; SEO reducido por noindex intencional |
| Lighthouse móvil local, fixture de producción | Rendimiento 100, accesibilidad 100, buenas prácticas 100, SEO 92; LCP 1,5 s, CLS 0,007, TBT 0 ms |
| Hallazgo SEO del fixture | Enlace «Más información» poco descriptivo; corregido a «Privacidad y medición», puntuación posterior pendiente |
| Portafolio: pruebas de fuente y salida | 361/361 y 390/390 |
| Portafolio: pruebas estáticas de analítica y sitemap | Correctas |
| Portafolio: snapshots EN/ES | Sin diferencias |
| Portafolio: suite de comportamiento completa sin adaptaciones | Pendiente por limitaciones del entorno de navegador/servidor/red; no se declara verde |
| npm audit (incluyendo desarrollo) | Cero vulnerabilidades reportadas |
| Intento de build real con SUPPORT_RELEASE=1 | Falla deliberadamente por configuración pendiente |

Las métricas Lighthouse son mediciones locales, no datos de usuarios ni resultados
de producción. Las pruebas GA4 inspeccionan la cola con red simulada; no acreditan
recepción en DebugView. Los comprobadores automáticos no certifican WCAG completa.

Para revisión visual se usó Playwright 1.51.1 instalado fuera del repositorio: el
navegador requerido por su versión bloqueada no pudo descargarse correctamente.
No se modificó el lockfile ni se degradaron dependencias del proyecto. Firefox
no completó el arranque y WebKit requiere librerías del sistema no disponibles;
su comprobación queda pendiente en CI. El 27/09 al reanudar la sesión, los binarios
de navegador temporales ya no estaban disponibles; las capturas previas se conservan.

## Pendientes antes de publicar

1. WhatsApp, correo público y retrato real.
2. Confirmar precios finales y abono de visita a la mano de obra, medios de pago,
   documentación tributaria, sectores de Providencia y límites del servicio.
3. Confirmar política de conservación de datos, términos y privacidad operativos.
4. Configurar el stream GA4 y verificar recepción, consentimiento y privacidad.
5. Completar pruebas de navegador/CI y WhatsApp en un teléfono real.
6. Crear/configurar proyecto de hosting y `soporte.tooltician.com`: TLS,
   redirecciones, cabeceras, indexación, Search Console y prueba de producción.

No se ha cambiado DNS, publicado anuncios, enviado mensajes, creado reseñas ni
modificado el deployment del sitio principal.

## Navegación de la entrega

- `implementation.md`: decisiones y configuración.
- `deployment.md`: configuración del hosting, comprobaciones y rollback.
- `operations.md`: admisión, autorización, cotización, cierre y métricas.
- `acquisition-drafts.md`: borradores para distribuir después del lanzamiento.
- `previews/desktop.png` y `previews/mobile.png`: capturas del primer viewport.
- `master-plan.md`: especificación original adjunta.
