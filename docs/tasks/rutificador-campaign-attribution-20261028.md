# Rutificador B2B — verificación de atribución y medición

**Fecha:** 2026-10-28 · **Sitio de origen:** [auditoría RUT para empresas](https://tooltician.com/rutificador/empresas/auditoria-rut/) · **Destino:** [Tooltician /es/](https://tooltician.com/es/) · [Issue de experimento #131](https://github.com/cortega26/rutificador/issues/131).

## Qué está comprobado

1. La URL de destino conserva los UTM al solicitar `/es/?utm_source=rutificador&utm_medium=referral&utm_campaign=auditoria_rut_b2b&utm_content=diagnostico#contact`. La etiqueta por sí misma **no demuestra que haya eventos en GA4**.
2. El código del sitio tiene integración GA4 directa en `src/layouts/BaseLayout.astro` (vía `PUBLIC_GA4_MEASUREMENT_ID`) y una taxonomía ya probada de `brief_start`, `brief_submit`, `brief_success`, `brief_error`. El proyecto documenta como identificador público `G-2HK4GHK7GR`.
3. **No se pudo leer GA4 directamente:** la conexión GSC Wizard se negó por suscripción inactiva; no afirmar que existen visitas/clics/conversiones medidos. Su reporte puede consultarse a través del propio GA4 (sección Acquisition / Traffic acquisition o Explorations).
4. En la versión anterior, el formulario genérico enviaba FormData sin una etiqueta de origen Rutificador: el asunto y metadatos no distinguían las consultas del experimento.

## Cambio implementado

`public/assets/js/intake-form.js` solo examina cuatro UTM con valores **exactos**: origen `rutificador`, medio `referral`, campaña `auditoria_rut_b2b`, contenido `diagnostico` o `recurrente`.

En un **envío del formulario** válido agrega a Formspree:

- `referral_product=rutificador`
- `referral_interest=diagnostico|recurrente`
- `_subject=Rutificador - Auditoria B2B (diagnostico|recurrente)`

No se capturan direcciones arbitrarias, mensajes, archivos, fragmentos de URL ni parámetros UTM sin validar. Los datos personales que la persona **decide introducir en el formulario** siguen la vía Formspree previa; esta modificación solo agrega etiquetas fijas de clasificación. No se modifica GA4, ni se instala un nuevo SDK, ni se agrega seguimiento al auditor CSV.

**Límite:** si la persona pierde los UTM antes de enviar el formulario o usa un correo en lugar del formulario, no existirá atribución automática al registro de Formspree. Los indicadores por origen pueden tener falsos negativos. No inferir que un evento `brief_submit` sea un lead recibido: exigir `brief_success` y/o el registro de Formspree.

## Procedimiento para la primera medición real

- [ ] Confirmar `PUBLIC_GA4_MEASUREMENT_ID` en el build público del destino y que el navegador envíe el evento de página a GA4, respetando bloqueo/consentimiento y DNT/GPC. **No** presentar un envío de prueba como lead real.
- [ ] En GA4, consultar *Traffic acquisition* usando `Session source / medium` y `Session campaign`, buscando `rutificador / referral` y `auditoria_rut_b2b` desde el despliegue. Usar `utm_content` para diferenciar la intención **solo si se comprueba que la dimensión está disponible**.
- [ ] En Formspree, filtrar registros recibidos por asunto `Rutificador - Auditoria B2B` y distinguir `referral_interest`. Agrupar conversaciones por organización sin publicar identificadores personales.
- [ ] Registrar por separado sesiones, envíos exitosos, leads calificados, diagnósticos pagos y proyectos contratados. Los ceros solo son verificables con una fuente consultada; si no, anotar `desconocido`.
- [ ] Comparar las primeras 7, 14 y 30 jornadas usando la fecha real de despliegue del PR del producto. Concluir según el criterio fijado en el issue #131, sin mover umbrales retroactivamente.

## Caché del recurso de formulario

Tras el primer despliegue, la URL pública sin versión de `intake-form.js` todavía devolvía el código anterior, mientras que el mismo recurso con un parámetro de consulta nuevo entregaba la atribución B2B actualizada. Para que el navegador y las cachés no sigan usando el script antiguo, **las cuatro plantillas que lo cargan** se actualizaron a una URL versionada idéntica (`?v=20261028-b2b1`). La suite de atribución verifica que ninguna conserva la ruta sin versión y que las cuatro coinciden.

La publicación y recepción final se verifican por separado en el workflow de Pages y mediante la URL de recurso versionada, sin enviar formularios reales de prueba a Formspree.

## Pruebas

`node tests/analytics-intake-attribution.mjs` cubre ambos tipos de intención y URL sin campaña, incorrecta, maliciosa o con parámetros duplicados. El resto del conjunto de calidad existente debe permanecer verde. Nunca probar contra el endpoint Formspree real con datos sintéticos no solicitados.
