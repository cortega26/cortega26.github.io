# Tooltician Soporte para Vecinos — habilitación y decisiones pendientes

> Auditoría de producto y contenido: 2026-10-08. Documento operativo de la variante `/vecinos/`, **no** es una autorización municipal ni legal. La fuente de los datos de precios y del estado de la oferta es `support/src/config.ts`. La descripción de las restricciones municipales vigentes está en `docs/support/operations.md`.

## Implementado en la revisión comercial

- Mensaje inicial centrado en problemas que un vecino reconoce, sin presentar ser vecino como prueba suficiente de competencia.
- Beneficios comprobables: diagnóstico explicado, presupuesto previo, trabajo autorizado y resumen final. No se añadieron reseñas, credenciales, resultados ni plazos ficticios.
- Servicios expresados por síntoma; tarifas existentes intactas y ejemplo de acreditación del diagnóstico basado en los valores de `neighborServices`.
- Explicación de coordinación de la revisión, sin prometer plazos de reparación no confirmados.
- Un acceso directo a WhatsApp **solo en modo autorizado** y un formulario estructurado opcional. En preview no se habilita contacto real.
- CTA móvil que desaparece cuando la sección de consulta es visible; estilo propio para resultado del formulario.
- Regresiones cubiertas por pruebas de build/artefacto y unidades.

## Consultas y referencias verificadas (2026-10-08)

El titular decidió recibir **consultas informativas por WhatsApp** aun cuando la patente municipal para la reparación en su departamento no está acreditada. Esta opción es deliberadamente distinta de habilitar la recepción de equipos. `neighborOffer.consultationsOpen=true` no modifica `ready=false`, `operatingAuthorizationConfirmed=false` ni `business.confirmed.municipalPermit=false`. No llamar «autorizado» a este servicio por el simple hecho de recibir mensajes.

La primera revisión que el titular afirma poder cumplir es dentro de 24 horas **desde la recepción coordinada**; no constituye un compromiso de reparación completa en 24 horas.

Evidencias proporcionadas mediante capturas por el titular, sin fingir revisión independiente:
- Mensaje privado de un cliente: satisfacción con el análisis y corrección de un problema de tarjeta de red cuando el PC funcionaba sin cargador. Mostrarlo anónimo; no exponer chat, teléfono ni imagen completa.
- Recomendación de Greily Molina publicada en LinkedIn el 28-02-2016: agradece un trabajo de recuperación parcial de información en un disco externo. Es histórica, no acredita capacidad de laboratorio ni garantiza recuperación futura.
- Recomendación de Juan Carlos Ortega Rached sobre desempeño general en TI: **referencia profesional**, no testimonio de reparación.

Antes de usar expresiones de testimonios privados en publicidad, verificar que el uso es compatible con la autorización del cliente. No fabricar fotos, enlaces directos a recomendaciones no obtenidos ni puntuaciones.

## Bloqueo independiente de la modalidad residencial — P0

`support/src/config.ts` mantiene `neighborOffer.ready=false` y `neighborOffer.operatingAuthorizationConfirmed=false`. La página comprueba **ambos** además de `__SUPPORT_RELEASE__`, `business.confirmed.municipalPermit` y el teléfono válido. La autorización para prestar soporte general no basta para abrir esta variante.

**Contradicción pendiente:** `docs/support/operations.md` documenta que la patente de domicilio postal tributario no habilita reparar equipos en la vivienda, mientras el modelo para vecinos plantea recibir, custodiar y trabajar equipos allí. No asumir que el parentesco vecinal, una entrega privada ni la ausencia de avisos públicos resuelven la restricción.

Para activar esta página debe existir evidencia escrita suficiente y actual de que la modalidad concreta está habilitada, no solo una patente genérica. Confirmar con Municipalidad y, donde corresponda, administración/reglamento de copropiedad:

1. Si está permitida la recepción temporal de equipos de otros residentes y su custodia en la vivienda.
2. Si está permitido diagnóstico, mantenimiento y reparación material de esos equipos en la vivienda.
3. Si existen restricciones por tránsito, entrega en espacios comunes, seguridad, ruido, residuos o almacenamiento.
4. Si el régimen y la patente habilitan recibir pagos por esta modalidad.

Si no está permitida, **replantear el producto** (por ejemplo, modalidad a domicilio del cliente dentro del edificio, solamente si es compatible con las autorizaciones aplicables) y reescribir el flujo, el precio y las condiciones antes de habilitar. No abrir con el texto actual ni ocultar la ubicación para eludir la regla.

## Definiciones mínimas para empezar a vender — P1

- **Tiempo:** fijar únicamente una política que pueda cumplirse: confirmación de disponibilidad, primera revisión y avisos si la reparación depende de piezas o aceptación. No prometer «mismo día» sin capacidad demostrada.
- **Custodia:** adaptar el checklist de `docs/support/operations.md` al ingreso y devolución de equipos, con estado inicial, cargador/accesorios, fotos solo si procede y consentimiento pertinente, pruebas de cierre y registro privado.
- **Condiciones del servicio:** redactar condiciones específicas de recepción, almacenamiento, retiro, autorización y responsabilidad. La página general `/condiciones-del-servicio/` describe atención **en** el domicilio del cliente y no debe reutilizarse literalmente como contrato de esta variante.
- **Credibilidad:** solicitar permiso para usar testimonios reales de clientes anteriores. Publicar exclusivamente textos autorizados, sin inventar estrellas, cifras, resultados o credenciales. No convertir experiencia de desarrollo de software en una afirmación de experiencia en reparación de hardware.
- **Precios:** validar costes reales de custodia, tiempo, mano de obra, consumibles y retrabajo antes de alterar los valores que hoy están configurados. Mantener la acreditación documentada del diagnóstico.

## Validación posterior a habilitación

1. Comprobar en móvil y escritorio H1, precios, formularios, imágenes y flujo de WhatsApp real; probar un envío de prueba consentido.
2. Comprobar `noindex`, privacidad del número de departamento y ausencia de datos de terceros en HTML, logs y analytics.
3. Medir consultas calificadas, trabajo autorizado, pago y origen de los contactos. No inferir aumento de conversiones por cambios de copy sin actividad medida.
4. Revisar tras 10 y 25 trabajos según `docs/support/FUTURE_ROADMAP.md`.

## No hacer

- No habilitar `neighborOffer.ready` ni `operatingAuthorizationConfirmed` por inferencia.
- No desplegar como producción una oferta residencial no autorizada.
- No inventar testimonios, reseñas o muestras presentadas como trabajos reales.
- No añadir promociones agresivas ni descuentos sin información sobre margen.
- No exponer dirección residencial exacta ni abrir atención espontánea sin coordinación.
