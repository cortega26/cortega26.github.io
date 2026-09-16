# Scoping Template — TEMPLATE (annotated example, not a real engagement)

> **TEMPLATE — no client data.** This document is a blank scoping template with
> one annotated, **fictional** worked example. Names, systems, volumes, and
> figures below are invented for illustration only. A real scoping document
> replaces every bracketed placeholder with the client's actual workflow before
> any fixed-price quote is agreed.

---

## EN — Scoping template

Fixed scope, not open-ended hours. Every engagement starts with a short paid
scoping pass that locks the items below **in writing**. The scoping fee is
credited toward the build. If scoping shows the work is not worth automating
yet, the document says so with reasoning.

### 1. Inputs

- Source systems and formats: `[e.g. source A + export format]`.
- Access provided for scoping: `[e.g. sample export, read-only access, or none yet]`.
- Delivery destination: `[e.g. where the output must land and who reads it]`.
- Cadence and volume (expected): `[e.g. weekly, approximate record count]`.

### 2. Outputs

- Deliverable 1: `[e.g. scheduled pipeline + structured output]`.
- Deliverable 2: `[e.g. validation report + alert path]`.
- Handoff materials: README, runbook, setup steps, and failure points worth
  watching — so the next person can run, debug, and extend it without a call.

### 3. Owner

- Client owner: `[name / role — the person who accepts the handoff]`.
- Operator after handoff: `[who runs it day to day]`.
- Builder: Tooltician (Carlos Ortega) — scoped build, documented handoff.

### 4. Failure modes

- `[Failure 1 — e.g. source layout change]`: detection + expected response.
- `[Failure 2 — e.g. partial or empty result]`: explicit empty/partial states,
  never a silent incomplete delivery.
- `[Failure 3 — e.g. credential or access expiry]`: alert path + repair owner.

### 5. Success criteria

- `[Criterion 1 — e.g. runs on schedule N consecutive times without manual steps]`.
- `[Criterion 2 — e.g. outputs reconcile with source across runs]`.
- `[Criterion 3 — e.g. named operator completes a dry-run handoff from the runbook]`.

### 6. Fixed-price quote

- Scoping fee: credited toward the build (agreed before scoping starts).
- Build price: **fixed**, confirmed only after this scope is locked in writing.
- Excludes: `[anything explicitly out of scope — e.g. new data sources,
  real-time infrastructure, open-ended maintenance]`.
- Optional after handoff: Stabilization Retainer (monitoring + small fixes,
  no lock-in).

> **EXAMPLE — fictional report-automation flow (all details invented).**
> Client: **Fictional Example SpA (invented — not a real client).**
> Flow: a weekly operations report assembled by hand from two sample exports.
> Inputs: `[sample export A (CSV)]` + `[sample export B (spreadsheet)]`.
> Output: one scheduled structured report delivered to `[example shared folder]`
> every Monday before 09:00 (example cadence), plus a validation note.
> Owner: `[Fictional Owner — e.g. "A. Example, Operations Lead (invented)"]`.
> Failure modes: source columns renamed → run fails loudly with an alert naming
> the source; empty weekly export → explicit "no data" state, never a blank
> report. Success criteria: 4 consecutive scheduled runs with zero manual steps;
> numbers reconcile with the sample exports; the fictional owner completes the
> runbook dry-run. Quote: fixed price agreed after scoping; scoping fee credited
> toward the build. **End of example — replace everything in brackets.**

---

## ES — Plantilla de alcance

Alcance fijo, no horas abiertas. Cada proyecto empieza con un diagnóstico corto
y pagado que deja por escrito los puntos de abajo. El valor del diagnóstico se
acredita a la implementación. Si el diagnóstico muestra que aún no vale la pena
automatizar, el documento lo dice con argumentos.

### 1. Inputs

- Sistemas fuente y formatos: `[ej. fuente A + formato de exportación]`.
- Acceso entregado para el diagnóstico: `[ej. exportación de muestra,
  acceso de solo lectura, o aún sin acceso]`.
- Destino de entrega: `[ej. dónde debe quedar la salida y quién la lee]`.
- Frecuencia y volumen esperado: `[ej. semanal, cantidad aproximada de registros]`.

### 2. Outputs (entregables)

- Entregable 1: `[ej. pipeline programado + salida estructurada]`.
- Entregable 2: `[ej. reporte de validación + ruta de alertas]`.
- Materiales de traspaso: README, runbook, pasos de setup y puntos de falla a
  vigilar — para que la siguiente persona opere, depure y extienda sin
  necesitar una llamada.

### 3. Responsable

- Responsable cliente: `[nombre / rol — quien recibe el traspaso]`.
- Operador post-traspaso: `[quien lo opera día a día]`.
- Constructor: Tooltician (Carlos Ortega) — construcción acotada, traspaso
  documentado.

### 4. Modos de falla

- `[Falla 1 — ej. cambio de layout de la fuente]`: detección + respuesta esperada.
- `[Falla 2 — ej. resultado parcial o vacío]`: estados explícitos de
  vacío/parcial, nunca una entrega incompleta en silencio.
- `[Falla 3 — ej. expiración de credenciales o accesos]`: ruta de alerta +
  responsable de reparación.

### 5. Criterios de éxito

- `[Criterio 1 — ej. N ejecuciones programadas consecutivas sin pasos manuales]`.
- `[Criterio 2 — ej. los números cuadran con la fuente entre ejecuciones]`.
- `[Criterio 3 — ej. el responsable completa un traspaso de prueba con el runbook]`.

### 6. Cotización a precio fijo

- Diagnóstico: se acredita a la implementación (acordado antes de empezar).
- Construcción: precio **fijo**, confirmado solo cuando este alcance queda
  fijado por escrito.
- Excluye: `[todo lo explícitamente fuera de alcance — ej. nuevas fuentes,
  infraestructura en tiempo real, mantención abierta]`.
- Opcional post-traspaso: Retainer de Estabilización (monitoreo + arreglos
  pequeños, sin amarre).

> **EJEMPLO — flujo ficticio de automatización de reportes (todo inventado).**
> Cliente: **Ejemplo Ficticio SpA (inventado — no es un cliente real).**
> Flujo: un reporte operativo semanal armado a mano desde dos exportaciones de
> muestra. Inputs: `[exportación de muestra A (CSV)]` + `[exportación de
> muestra B (planilla)]`. Salida: un reporte estructurado programado en
> `[carpeta compartida de ejemplo]` cada lunes antes de las 09:00 (frecuencia de
> ejemplo), más una nota de validación. Responsable: `[Responsable Ficticio —
> ej. "A. Ejemplo, Jefa de Operaciones (inventado)"]`. Modos de falla: columnas
> renombradas → la ejecución falla de forma visible con una alerta que nombra la
> fuente; exportación semanal vacía → estado explícito "sin datos", nunca un
> reporte en blanco. Criterios de éxito: 4 ejecuciones programadas consecutivas
> sin pasos manuales; los números cuadran con las exportaciones de muestra; el
> responsable ficticio completa el traspaso de prueba con el runbook.
> Cotización: precio fijo acordado tras el diagnóstico; el diagnóstico se
> acredita a la construcción. **Fin del ejemplo — reemplazar todo lo que está
> entre corchetes.**
