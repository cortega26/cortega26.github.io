# Operación inicial — plantillas sin datos de clientes

Guardar registros reales en un sistema privado con acceso restringido, nunca en
este repositorio público. No registrar contraseñas ni datos bancarios.

## Régimen tributario: Registro de Actividades de Subsistencia

Inscripción en el Registro de Personas Naturales que desarrollan Actividades de
Subsistencia del SII (Resolución Ex. SII N°193/2025), vigente desde el 27-09-2026.
Mientras se mantenga vigente: no requiere Inicio de Actividades, está exonerado de
IVA y liberado de emitir boletas por estas prestaciones.

Controles internos obligatorios:

- **Sólo consumidores finales.** No atender empresas, organizaciones ni
  solicitantes de factura bajo este régimen. Si el cliente es una empresa, no se
  acepta el trabajo y se deriva.
- **Controlar ingresos.** Registrar en el sistema privado el total cobrado por
  visitas, mano de obra y repuestos, y comparar contra el promedio máximo mensual
  de 5 UTM.
- **Alertar antes de acercarse al límite.** Alerte sobre 4 UTM de promedio
  mensual, no al superarlo. El valor de la UTM se actualiza cada año: verificar el
  vigente antes de fijar umbrales, no usar un valor supuesto.
- **Transición obligatoria.** Si deja de cumplir los requisitos, corresponde
  migrar al régimen tributario que aplique antes de seguir operando bajo el
  registro. El estado tributario no se deduce del volumen: se revisa.
- Este control es interno. **No** se implementa como analítica pública, no se
  publica ningún indicador de facturación y no se almacenan datos personales más
  allá del registro operativo mínimo ya definido en privacidad.

La inscripción **no sustituye permisos municipales** y no autoriza por sí sola la
atención al público.

## Pendiente operativo municipal

> Confirmar con la Municipalidad de Macul qué patente o autorización corresponde a
> un prestador inscrito en el Registro de Subsistencia que trabaja exclusivamente
> a domicilio del cliente y no atiende público en su residencia.

Es una consulta por confirmar. **No** es una afirmación legal sobre qué patente
aplica, y el tipo de permiso no se inventa ni se publica hasta tener la respuesta
por escrito. Mientras tanto el sitio no anuncia atención al público en una
dirección.

## Admisión y reserva

- Referencia TS, fecha, origen declarado, comuna, equipo/modelo.
- Síntoma, si enciende, fecha de inicio, caída/líquido/evento eléctrico.
- Importancia de los datos y respaldo disponible.
- Clasificación: domicilio / diagnóstico y cotización / remoto / derivación.
- Destinatario: consumidor final ___ (si es empresa u organización: no se acepta
  bajo el régimen de subsistence, se deriva).
- Alcance, valor base, fecha/franja, duración, acceso/estacionamiento, forma de pago.
- Dirección solo al coordinar; no en analítica ni URLs públicas.

**Señales de detención:** batería hinchada, humo, olor a quemado, líquido,
riesgo eléctrico o disco con clics y archivos valiosos. No insistir en encendido
ni usar herramientas agresivas sobre discos posiblemente dañados. Derivar.

## Orden y autorización

Referencia: ___ · Fecha: ___ · Cliente: ___ · Equipo/modelo: ___

Estado visible/accesorios: ___ · Síntoma: ___ · Respaldo confirmado: ___

Alcance y exclusiones: ___ · Precio visita: ___ · Total autorizado: ___

Acciones específicas autorizadas: ___

Confirmación expresa del cliente (texto/fecha/canal): ___

Para copias: archivos/carpetas, destino autorizado, responsable, fecha de eliminación
y confirmación de entrega. Para cambios destructivos: respaldo/limitaciones/riesgos
explicados y aceptación expresa de la acción. Nunca usar una autorización genérica
como renuncia de responsabilidad o de derechos legales.

## Cotización

Hallazgo: ___ · Solución propuesta: ___ · Tiempo estimado: ___

Mano de obra: ___ · Abono de visita: ___ · Repuestos: ___

Repuesto nuevo/reacondicionado, modelo, vendedor/comprobante: ___

Extras aprobados: ___ · Total final con impuestos aplicables: ___

Vigencia/condiciones: ___ · Autorización explícita: ___

## Informe de cierre

Pruebas iniciales: ___ · Hallazgos: ___ · Intervención autorizada: ___

Mediciones antes/después si relevantes (temperatura/red/arranque): ___

Pruebas finales y resultado observado por el cliente: ___

Limitaciones pendientes y recomendaciones: ___

Piezas instaladas y comprobantes: ___ · Respaldo entregado/copia temporal borrada: ___

Documento de pago: ___ · Plazo de responsabilidad por escrito: ___

No reducir el plazo legal de reclamo por servicio defectuoso. Distinguir garantía
de piezas y trabajo. Finalizar acceso remoto, eliminar permisos no necesarios y
comprobar que no quedó acceso desatendido.

## Respuestas rápidas

**Primera respuesta:** Hola, soy Carlos. Para confirmar si puedo ayudarte, ¿en qué
comuna estás, qué equipo tienes y qué ocurre? Dime también si enciende y si
hay archivos importantes sin respaldo. No envíes contraseñas.

**Visita:** La visita cuesta [valor confirmado] e incluye hasta [minutos] de
diagnóstico y soluciones simples. Se cobra aunque decidas no reparar. Si hace
falta más trabajo, te explico el alcance y el total antes de que autorices.

**Reserva:** Confirmamos [día/franja], en [dirección privada], para [alcance].
Valor base [importe], duración estimada [tiempo], pago [medio]. Cualquier trabajo
adicional requiere una cotización y tu autorización. ¿Confirmas estos datos?

**Fuera de alcance:** Por lo que describes, este caso necesita [especialidad]. No
realizo ese tipo de intervención. [Instrucción de no uso si hay riesgo concreto].

**Cierre:** Revisé [hallazgo], realicé [trabajo autorizado] y comprobamos [resultado].
Queda pendiente [si corresponde]. Adjunto resumen, recomendaciones y plazo de
responsabilidad. Si notas un problema relacionado con la intervención, escríbeme.

**Reseña:** Si recibiste el servicio, una reseña honesta en [URL real de Google]
me ayuda a dar a conocer esta nueva área de Tooltician. Gracias por compartir tu
experiencia. Pedir de forma consistente, sin premios ni filtro por satisfacción.

## Registro semanal privado

Campos mínimos: referencia, fecha, fuente declarada, comuna, categoría, estado,
cotizado/cobrado, costo piezas/consumibles, transporte/estacionamiento, adquisición,
minutos de conversación, viaje, trabajo y retrabajo, reseña solicitada/recibida,
referido/repetición. Usar IDs y mantener identidad/dirección en registro separado.

- Conversión = trabajos pagados / leads calificados (misma cohorte).
- Ingreso efectivo/hora = ingreso por mano de obra / horas totales dedicadas.
- Contribución = cobrado menos piezas, consumibles, transporte y captación.
- Contribución/hora = contribución / horas totales, incluido retrabajo y preventa.
- CAC = gasto de captación / nuevos clientes pagadores; sin ventas es indefinido,
  no cero. Separar ingreso de piezas del valor generado por trabajo.

Revisar después de 10 y 25 trabajos y mensualmente. Los objetivos del master plan
son hipótesis; no datos observados. Medir primero antes de anuncios pagados.
