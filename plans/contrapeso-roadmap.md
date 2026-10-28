# Contrapeso — Plan maestro y protocolo de ejecución (66 minutos)

**Propuesta operativa · 25 de octubre de 2026**  
**Destino sugerido en GitHub:** `plans/contrapeso-roadmap.md`  
**Documento normativo complementario:** `docs/editorial/contrapeso-manual.md`  
**Alcance:** prototipo `public/venezuela-lab/` dentro de `cortega26/cortega26.github.io`.

> **Estado de adopción:** documento versionado como hoja de ruta propuesta. Sus decisiones editoriales no sustituyen `AGENTS.md` ni la carta vigente; ninguna regla de este plan autoriza por sí sola fusionar, publicar o levantar `noindex`.

## 1. Objetivo y criterio de éxito

Desarrollar un medio completo —actualidad, investigación, análisis, opinión y memoria— a partir de unidades pequeñas, terminadas, probadas y documentadas. **No medir éxito por cantidad de runs, fichas, PR ni comentarios, sino por contenido verificado, funcionalidad útil y riesgos realmente cerrados.**

No crear otra automatización, agenda, ledger ni infraestructura de publicación paralela. La task de ChatGPT existente se mantiene a 66 minutos; el repositorio y los PR son fuentes de estado durables.

## 2. Diagnóstico inicial verificado (foto, no verdad permanente)

- Repo público: `cortega26/cortega26.github.io`, rama `master`.
- HEAD verificado en esta actualización: `80557713087a6b4a0b1786bfff4bae4f16c088a5` (merge PR #145). Referencia histórica previa: `0418cafd608fd253ae84f5f1c3b383ea7b17c254` (#144). Verificar de nuevo en cada run.
- `AGENTS.md` define pruebas `npm test`, `npm run check`, `npm run build`, y trabajo nuevo en rama/PR; planes en `plans/`.
- Existe `docs/editorial/contrapeso-principios.md` con carta editorial y salvaguardas, pero se declara propuesta de prototipo, no redacción operativa.
- Portada en `public/venezuela-lab/index.html`; Museo en `public/venezuela-lab/museo/index.html`; memorial, fichas y archivos anuales 1999/2000 en `public/venezuela-lab/museo/victimas/`.
- La portada todavía contiene **artículos de ejemplo** y rotulación de «BOCETO EN DESARROLLO». No está lanzada como medio.
- PR #145 **fusionado el 25-10-2026**; añadió mejoras UX/UI responsive y pruebas visuales. La prueba `tests/contrapeso-layout.mjs` en `master` sigue comparando `#registered-count` con la cadena literal `301` (deuda de mantenibilidad comprobada). Los comentarios Codacy anteriores son históricos, no hallazgos activos confirmados. Verificar los checks del HEAD exacto antes de concluir sobre calidad.
- No se encontró `public/venezuela-lab/museo/victimas/2001/index.html` en `master` al inspeccionar, lo cual NO demuestra ausencia de fichas de 2001 dentro del dataset general.
- `noindex,nofollow,noarchive` debe mantenerse hasta decisión de lanzamiento.
- El repositorio y la portada contienen enlaces públicos a Tooltician: separar marca, privacidad y autoría requiere decisión independiente.

### No verificado

No se verificaron en este diagnóstico las capturas visuales finales, todos los resultados CI del commit de integración #145 ni el estado del sitio desplegado. Tampoco se auditó exhaustivamente la exactitud de cada registro nominal; ningún conteo del PR sustituye el dataset vivo.

## 3. Fases con salidas comprobables

### F0 — Saneamiento y base editorial

**Prioridad inmediata.**

- Verificar el resultado post-merge del PR #145; corregir defectos reproducibles y desacoplar las pruebas visuales del conteo fijo de fichas.
- Validar responsive 320, 390, 768, 1024 y 1440 px, navegación, contraste, overflow, estado `noindex`, filtros y detalle individual.
- Adoptar manual editorial y este roadmap después de revisarlos. No sustituir la carta ya existente ni duplicar instrucciones.
- Detectar artículos de ejemplo, elementos no funcionales o enlaces engañosos: preservarlos claramente rotulados como prototipo o preparar su reemplazo verificado.

**Cierre F0:** sin P1/P2 técnicos confirmados, PR relevante integrado con controles y comprobación de sitio (si procede); manual y plan versionados; estado de prototipo consistente.

### F1 — Normalizar el memorial como base documental

- Inventariar fichas, categorías, años, episodios, fuentes, identidad duplicada y lagunas: primero auditar lo que ya existe.
- Comprobar cada vínculo afirmación–nombre–episodio–documento; documentar casos ambiguos sin forzar certeza.
- Añadir índices anuales según datos realmente respaldados; **2001** es candidato para investigar porque falta página anual, no decisión irrevocable.
- Completar biografías y referencias sin publicar fotos privadas o historias inventadas.

**Cierre F1:** índice navegable consistente, fuente nominal verificable para cada ficha publicada, duplicados diagnosticados/corregidos y barreras de regresión mantenidas. No exige un número arbitrario de nombres.

### F2 — Museo y expedientes históricos

- Reconciliar los expedientes ya presentes (elección 2024, Barbados 2023, instituciones/represión 2017).
- Preparar un inventario de brechas para 11 de abril de 2002, otros procesos electorales, detenciones, censura, negociación política, crisis y desplazamiento.
- Elegir **un expediente concreto a la vez**, con fuentes, cronología, estado probatorio, versiones relevantes, enlaces y QA visual.

**Cierre F2:** cada sala tiene expedientes reales con fuentes, explicación y navegación; nada se presenta como estudio exhaustivo sin evidencia.

### F3 — Completar el medio, no solo el archivo

- Reemplazar gradualmente tarjetas «EJEMPLO» por publicaciones reales verificadas o mantenerlas explícitamente como demostración.
- Crear formatos reutilizables y distintivos para noticias, opinión, investigaciones y explicadores.
- Establecer páginas claras de método, correcciones, fecha de revisión y atribución editorial apropiada.
- No crear un flujo automático de noticias antes de verificar que puede sostenerse con calidad.

**Cierre F3:** navegación y secciones funcionan, cada publicación lleva género/fecha/fuentes, no hay promesas funcionales falsas, y un lector distingue actualidad de historia.

### F4 — Preparación del lanzamiento

- Decisiones pendientes del propietario: nombre/dominio, grado de anonimato, firma editorial, política de comentarios, licencias de imágenes, monetización y patrocinios.
- QA legal, seguridad y privacidad; revisión de enlaces, sitemap, metadatos, accesibilidad y presentación móvil.
- Mantener `noindex` hasta autorización expresa. Crear checklist de salida y rollback.

**Cierre F4:** decisión humana de lanzamiento y gates comprobables; publicación de dominio/indexación no automática.

## 4. Cola inicial de unidades de trabajo

La task debe **reordenar dinámicamente** esta lista contra GitHub, sin duplicar el trabajo de otros:

| ID | Prioridad | Unidad verificable | Dependencia / definición de terminado |
|---|---|---|---|
| CP-001 | P0 | Verificar post-merge de PR #145 | Integración observada; verificar despliegue/visual/CI y no abrir PR duplicado |
| CP-002 | P0 | Resolver contador fijo `301` en test visual | Defecto de mantenibilidad observado en `master`; test compara conteo real sin romper ampliaciones legítimas; evidencia RED/GREEN si se implementa |
| CP-003 | P1 | Verificar calidad post-merge de #145 | No tratar comentarios antiguos de Codacy como problemas vigentes; verificar los gates y cualquier fallo actual |
| CP-004 | P1 | Auditar dataset de víctimas existente | Inventario verificable de nombres, fuente nominal, año exacto/indeterminado y duplicados |
| CP-005 | P1 | Adoptar manual editorial | No contradice la carta actual; revisión de privacidad/atribución; archivo versionado |
| CP-006 | P1 | Inspeccionar y, si hay respaldo, crear capítulo 2001 | Sin afirmar que faltan personas; enlaces y tests pertinentes |
| CP-007 | P1 | Reconciliar memorial con expedientes del Museo | Navegación recíproca y contexto sin duplicados ni conclusiones causales excesivas |
| CP-008 | P2 | Auditar 11 de abril de 2002 | Individuos, cronología, autoría atribuida, múltiples fuentes y estado procesal |
| CP-009 | P2 | Auditar y mejorar páginas de caso individual | Accesibilidad, fuentes visibles, diferencias entre tipos de evidencia |
| CP-010 | P2 | Clasificar los contenidos «EJEMPLO» de portada | Plan para retirar/reemplazar según material listo; no publicarlos engañosamente |
| CP-011 | P2 | Plantilla de noticia/opinión/explicador | Metadatos y tratamiento editorial diferenciados, pruebas y estilo consistentes |
| CP-012 | P3 | Preparar checklist de lanzamiento y riesgo de identidad | Decisiones explícitas del propietario; no levantar noindex |

Una unidad solo se marca completada por evidencia (archivo/commit/PR/tests/resultado); no por una respuesta de la task. Si se necesita cola persistente, conservarla en este archivo bajo Git y actualizarla en PR junto con trabajo real, **no crear un segundo ledger**.

### Migración transversal de principios — decisión del propietario (28-10-2026)

Aplicar libertad individual, propiedad privada legítima y límites institucionales al poder a **toda publicación futura y a todo el archivo existente**, sin etiqueta pública «libertaria». Estos principios sirven para formular preguntas, nunca para anticipar hechos ni culpabilidades. La revisión debe indicar si cada lente aporta algo real o no aplica.

**Inventario inicial inspeccionado:** diez páginas HTML: portada, método, Museo, memorial, archivos 1999 y 2000, plantilla dinámica `perfil.html`, noticia del regreso de Machado, explicador 28J y explicador TSJ 2017. Existen también muestras no publicadas en `app.js` y registros nominales dinámicos en `museo/victimas/data.js`. Una revisión de páginas **no equivale** a una comprobación individual de todos los expedientes ni nombres.

| Superficie | Enfoque material de esta revisión | Estado y pendiente |
|---|---|---|
| Portada y método | Los tres principios ya están declarados desde PR #170 | Mantener, sin etiquetas doctrinarias ni levantar noindex |
| Actualidad: regreso de Machado | Convocatoria, autoridad, reglas, garantías y controles | Revisar contexto sin agregar hechos no respaldados |
| Explicador 28J | Resultados auditables y rendición de cuentas del poder electoral | Conservar cifras y límites de la prueba |
| Explicador TSJ 2017 | Separación de poderes y límites de competencias | Conservar sentencias, fechas y atribuciones |
| Museo y expedientes | Libertades, concentración institucional y documentos | Introducir referencia al método; contrastación por expediente pendiente |
| Memorial y archivos 1999/2000 | Vida, libertad, custodia, debido proceso | Referir criterios editoriales; no alterar identidad ni causalidades |
| Perfil nominal dinámico | Mismo método accesible en cada perfil | Auditoría **caso por caso de `data.js` aún pendiente** |

**Cierre retroactivo:** evidencia de revisión de cada caso y corrección de errores materiales, no solo un enlace al método o pruebas verdes. Priorizar por riesgo factual, privacidad y fuentes; avanzar en PR pequeños, sin segundo ledger ni task paralela.

## 5. Algoritmo de cada ejecución de 66 minutos

**La frecuencia programa oportunidades de avance; no obliga a crear un PR cada 66 minutos.**

1. **PREFLIGHT:** leer `master`/HEAD, `AGENTS.md`, carta editorial, manual, roadmap y PR/Issues actuales. Confirmar herramientas, ownership y estado vivo.
2. **RECONCILIAR:** detectar trabajos en curso, feedback reciente, cambios de SHA, CI, merges y posibles duplicados.
3. **DETERMINAR PRIMER BLOQUEO:** defecto de seguridad/precisión/fuente → bloqueo de PR/QA → trabajo editorial comenzado → primer ítem elegible del roadmap.
4. **ELEGIR SOLO UNA UNIDAD:** si otro agente progresa sobre ella, no interferir; avanzar una independiente únicamente si no compite por archivos o decisiones.
5. **EJECUTAR:** investigación con fuentes primarias **o** cambio mínimo con pruebas adecuadas. No inventar contenido para alcanzar cuota.
6. **VERIFICAR:** hechos y atribuciones, diff exacto, regresión, build/QA móvil, reviews, GitHub Actions, deploy cuando corresponda.
7. **PERSISTIR:** evidencia en PR/commit/documento canónico ya existente; sin creación de issues de estado por rutina.
8. **REPORTAR POR EXCEPCIÓN:** qué cambió materialmente, estado cierto, SHA y siguiente dependencia.

### Árbol de decisión

```text
¿Hay alerta P0/P1 verificable de seguridad, exactitud o UX grave?
  Sí → resolverla en el trabajo propietario autorizado.
  No → ¿hay PR/fix ya iniciado y accionable?
           Sí → continuar o revisar ese mismo trabajo sin duplicarlo.
           No → ¿hay una unidad elegible con fuentes suficientes?
                    Sí → investigar/implementar y verificar un incremento.
                    No → registrar brecha concreta; no fabricar publicación.

```

### Reglas de capacidad

- **Máximo un paquete cohesionado por ejecución.**
- Preferencia por un PR activo de Contrapeso a la vez; excepciones solo por independencia material y evidencia.
- Una CI pendiente sin cambio nuevo **no** justifica nuevo comentario cada 66 minutos.
- Si un cambio precisa varias ejecuciones, conservar la continuidad en el mismo PR/Issue, no abrir trabajo paralelo.
- Si GitHub no permite escribir, entregar investigación o diff propuesto y declarar `NO IMPLEMENTADO`; no eludir bloqueos de plataforma.
- Los temas sensibles siguen revisión editorial humana; no equiparar CI verde con aprobación de una acusación.
- Separar `INVESTIGADO`, `DOCUMENTADO`, `IMPLEMENTADO EN PR`, `VALIDADO EN SHA`, `INTEGRADO` y `COMPROBADO EN SITIO`.

## 6. Gates por tipo de contenido

| Tipo | Gates mínimos |
|---|---|
| Ficha nominal | Identidad, contexto, fuente para esa persona, atribución, dedupe, privacidad, test |
| Expediente histórico | Fecha, fuentes inspeccionadas, hechos frente a alegaciones, versiones relevantes, revisión, enlaces |
| Columna | Género OPINIÓN inequívoco, tesis y sustento factual, distinción opinión/hechos, corrección posible |
| Noticia | Confirmación reciente de la fuente, fecha exacta, contraste, actualización, no recircular hecho viejo como nuevo |
| UX | Capturas o pruebas reales de varios anchos, no overflow/superposición, controles accesibles, regresión |
| Lanzamiento | Autorización expresa, identidad/dominio/privacidad, revisión legal, SEO, seguridad, rollback |

## 7. Métricas de calidad, no cuotas

- Porcentaje de registros que tienen fuente nominal inspeccionable (tendencia, no inventar el denominador).
- Fichas duplicadas detectadas/corregidas y atribuciones ambiguas marcadas.
- Expedientes con enlaces primarios verificados y estado editorial.
- Regresiones visuales y errores de navegación reproducibles.
- PR bloqueados por P1/P2 o Codacy con causa y resolución documentada.
- Cambios integrados **y comprobados en el sitio**, diferenciados de investigaciones y PR.
- Contenidos rotulados falsamente como reales y enlaces sin destino funcional.

No medir como éxito «22 PR al día» ni «50 nombres nuevos por corrida». La tarea puede concluir sin cambio cuando está esperando fuentes, revisión o controles legítimos.

## 8. Integración con la task existente

La task «Contrapeso — Desarrollo incremental» debe conservar `RRULE:FREQ=MINUTELY;INTERVAL=66`. Tras adoptar este documento en el repositorio, su prompt debe **leer primero**:

1. `AGENTS.md` y documentación normativa del repo.
2. `docs/editorial/contrapeso-principios.md` (principios).
3. `docs/editorial/contrapeso-manual.md` (manual de ejecución editorial, si está integrado).
4. `plans/contrapeso-roadmap.md` (orden de trabajo, si está integrado).
5. Estado vivo de PR, Issues, rama y SHA.

**Hasta que los documentos se fusionen en `master`, no afirmar que la task los está usando.**

---

**Base verificada:** GitHub conectado, repositorio `cortega26/cortega26.github.io`; `master` HEAD actualizado a `80557713087a6b4a0b1786bfff4bae4f16c088a5` durante esta incorporación, carta editorial, README/AGENTS, portada, Museo, PR #145 y sus comentarios. No se efectuaron commits, tests locales ni actualizaciones de la task al generar esta propuesta.

## F1 — Avance documentado de 2001 (28-10-2026; primera unidad, no cierre)

**Estado:** propuesta en rama/PR pendiente de revisión humana y QA de integración. El inventario previo de `data.js` tenía **301 fichas y ninguna atribuida al año 2001**; la ruta `museo/victimas/2001/index.html` no existía en `master@9054f985`. Esta unidad incorpora **cinco nombres** descritos por el Departamento de Estado estadounidense en su informe de derechos humanos de 2001 (publicado el 4-03-2002): Jesús Alberto Febres, Luis Fernando Briceño, Ángel Ardilla, Ericson José Parra y Juan Pablo Arroyave. Su fuente canónica es <https://www.refworld.org/reference/annualreport/usdos/2002/31349> (sección 1.a). No atribuir a todos el mismo tipo de hecho ni una sentencia firme; para Febres consta una condena militar y posterior discusión de competencia, sin certificar desenlace civil.

**No cerrar 2001:** Human Rights Watch documentó los asesinatos de José Ramón Rodríguez y Belmiro Gutiérrez en mayo de 2001, vinculados al contexto de amenazas del «Grupo Exterminio»; falta verificar por separado autoría y circunstancias antes de ficharlos (<https://www.hrw.org/legacy/spanish/inf_anual/2002/venezuela.html>). Falta localizar y contrastar los anexos nominales originales de PROVEA 2000–2001, depurar posibles duplicados y determinar otras muertes bajo custodia. El recuento de **241** que reproduce el informe estadounidense corresponde a **octubre de 2000–septiembre de 2001**, por lo que **no** es un total del año calendario 2001. El siguiente incremento debe seguir con **2001**, no saltar a 2002 hasta agotar fuentes accesibles o registrar bloqueo concreto.

**Verificaciones exigidas antes de merge:** coherencia 5 registros ↔ 5 filas de la página ↔ selector por año; robots en la nueva ruta; enlaces de perfiles; source check, build, Playwright a 320/390/768/1024/1440, revisión Codacy/Codex y revisión humana para imputaciones. Esta anotación no certifica esas pruebas ni el despliegue.

## F1 — Segunda unidad documental de 2001 (28-10-2026; en PR #172)

**Investigado:** Human Rights Watch, *Informe Mundial 2002*, sección Venezuela
(hechos de 2001): <https://www.hrw.org/legacy/spanish/inf_anual/2002/venezuela.html>.
El informe identifica dos asesinatos en Portuguesa durante mayo de 2001:
**José Ramón Rodríguez**, padre de Jimmy Rodríguez y reclamante público de justicia,
y **Belmiro Gutiérrez**, testigo de los asesinatos de Jimmy Rodríguez y César Agray
Meléndez (octubre de 2000). No aporta fechas exactas ni identifica quién disparó
contra cada uno. Los informes de amenazas, presunta complicidad de funcionarios y
detenciones en el contexto del llamado «Grupo Exterminio» no son sentencias
individuales. Los casos se etiquetan como **asesinatos en investigación**, sin
atribución penal automática a agentes estatales.

**Fuente pendiente de lectura nominal:** PROVEA mantiene accesible la página del
informe octubre de 2000–septiembre de 2001:
<https://provea.org/publicaciones/informes-anuales/informe-anual-octubre-2000-septiembre-2001/>.
Su enlace «Anexos» remite a OneDrive
(<https://1drv.ms/b/s!Ao_EOncu5r6snDEzX2ZXXw4ZtM-r>), cuyo PDF no pudo abrirse
mediante la herramienta de lectura disponible en esta revisión. No se inventan
nombres ni se transforma una cifra agregada en fichas. El capítulo de 2001
**sigue abierto** a contrastación con ese anexo y fuentes adicionales.

**Criterio editorial transversal:** libertad individual — aplica (víctimas y
testigos de violencia); propiedad privada — no aplica en esta unidad;
control del poder — aplica (investigaciones y responsabilidad de cuerpos
policiales), sin prejuzgar autoría ni culpabilidad individual.

**Integración:** el incremento suma dos fichas a las cinco anteriores,
actualiza la página anual y el filtro de casos con autoría no acreditada,
y conserva la revisión humana y el gate de QA exact-SHA antes de cualquier merge.

### Contraste nominal PROVEA — fuente original localizada (28-10-2026)

Se encontró el PDF del **anexo 3 del informe octubre 2000–septiembre 2001** en el
archivo de PROVEA: <https://archivo.provea.org/wp-content/uploads/01_anexos0001.pdf>.
Se inspeccionaron las páginas impresas **475 y 476** (páginas PDF 34 y 35),
no el anexo completo. El registro n.º 184 confirma **José Ramón Rodríguez**,
**15-05-2001**, Acarigua; el n.º 191 identifica **Belmiro Alexander Gutiérrez**,
**19-05-2001**, Acarigua. Las circunstancias documentadas son compatibles
con HRW, que utiliza el nombre abreviado «Belmiro Gutiérrez».

**Discrepancia P1 de identidad:** el registro n.º 194 del mismo anexo identifica
a **Edixon Parra**, 16 años, Petare, 31-05-2001, herido en una pierna por
policías y muerto durante el traslado. El Departamento de Estado identifica a
**Ericson José Parra**, también 16 años, misma fecha, lugar y hechos.
Es **probable** que se trate de una misma víctima, pero no se ha confirmado
la forma nominal correcta. Se mantiene **una sola ficha**, con advertencia
explícita y sin crear un segundo caso. Investigar fuentes originales de
Red de Apoyo y otros testimonios antes de rectificar el nombre.

La localización del PDF **resuelve el bloqueo de acceso al anexo**, pero
**no equivale a su auditoría exhaustiva**: hay muchas más entradas y fechas
que cotejar. Próxima unidad: recorrer cronológicamente los casos de enero a
septiembre de 2001 y confrontarlos con el inventario canónico; consultar
el anexo del informe octubre 2001–septiembre 2002 para octubre–diciembre.

## F1 — Tercera unidad de 2001 — enero (28-10-2026; PR #172)

**Evidencia original inspeccionada:** PROVEA, informe anual octubre 2000–septiembre 2001, [anexo 3](https://archivo.provea.org/wp-content/uploads/01_anexos0001.pdf), **página impresa 460 / página PDF 18**, registros **62–68**. La lectura se realizó sobre la imagen de esa página, no únicamente sobre extracción textual con columnas entremezcladas. Siete registros fechados entre el **2 y el 9 de enero de 2001**: Juan Carlos Castillo Romero (2/1), José Gregorio Pastrana (5/1), Miguel Ángel Matos Idrogo (5/1), Annelk Luis Martínez Yaguarán (5/1), Oswaldo José Herrera Gurgos (7/1), Luis Fernando Briceño (7/1) y Alexander Sandoval (9/1). **Briceño ya estaba registrado** con la fuente estadounidense; se incorporan **seis personas nuevas**, sin duplicarlo. Las siete entradas se atribuyen a PROVEA y no se presentan como sentencias.

**Cautelas materiales:** PROVEA clasifica a Castillo Romero y Herrera Gurgos entre víctimas del llamado «Grupo Exterminio», pero el anexo no acredita autor material ni sentencia individual: categoría `investigacion`. Para Pastrana, Matos Idrogo, Martínez Yaguarán y Sandoval el anexo describe intervenciones policiales y versiones oficiales de enfrentamiento que deben contrastarse; categoría `policial`. El nombre poco habitual **«Annelk»** se transcribe de la p. 460 y permanece pendiente de cotejo con una segunda fuente. No se atribuye motivación política a cada caso ni se equipara la versión de PROVEA a un fallo judicial.

**Rectificación factual P1:** la página anual decía «241 ejecuciones extrajudiciales». El [gráfico original de PROVEA](https://archivo.provea.org/wp-content/uploads/01_anexos0001.pdf), **página impresa 485 / página PDF 43**, distingue **241 casos totales de violación al derecho a la vida**, de los cuales **201 clasificados como ejecuciones (83,4 %)**; otros patrones suman los 40 restantes. Además el período es **octubre 2000–septiembre 2001**, no el año calendario 2001. Se corrigió la página, el alcance de la fuente y se añadió prueba contra regresión.

**Orientación editorial por principio:** libertad individual **aplica con evidencia** (vida, detención, uso de fuerza); propiedad privada **no aplica**; control del poder **aplica con evidencia** (actuación y rendición de cuentas policiales). No se infiere culpabilidad de agentes no identificados.

**Cobertura y pendientes:** 13 fichas de 2001 en este PR tras esta unidad, sin pretensión de exhaustividad. Revisadas la p. 460, las pp. 475–476 y el gráfico p. 485 del anexo; **no se han inspeccionado todas las entradas de enero–septiembre**, ni el anexo octubre 2001–septiembre 2002 para el último trimestre. Próximo lote: registros 69 en adelante (desde el 10 de enero), incluyendo cotejo de fechas de fallecimiento distintas de fechas de incidente; continuar la discrepancia Edixon/Ericson Parra. Revisión humana de imputaciones sensibles antes de integrar.

## F1 — Cuarta unidad de 2001 — PROVEA, registros 69–73 (28-10-2026; PR #172)

**Fuente primaria inspeccionada en imagen:** [PROVEA, anexo 3, p. impresa 461 / PDF p. 19](https://archivo.provea.org/wp-content/uploads/01_anexos0001.pdf), registros 69–73, hechos de 10–11 de enero de 2001. Se contrastaron los cinco registros con el dataset de la rama del PR; el PDF sigue sin auditoría completa.

- **Registro 69, Jesús Alberto Febres Narváez:** ya estaba incluido como «Jesús Alberto Febres» a partir del informe estadounidense. PROVEA amplía el nombre, localiza los hechos en Maturín y distingue el **incidente del 10-01** del **fallecimiento del 31-01-2001**. Se conserva el identificador y se añade PRO2001 como segunda fuente; no se duplica.
- **Registro 70, Jorge Luis Aponte:** PROVEA informa detención y golpes policiales, retención de 48 horas, operación de apendicitis previa y muerte tras regresar a su domicilio y ser llevado a un hospital. **No incorporado aún**: el documento por sí solo no establece el nexo causal entre retención y fallecimiento ni la fecha exacta de muerte, distinta posiblemente de la fecha de intervención. Buscar expediente médico, testimonio familiar o investigación adicional.
- **Registro 71, José Gregorio Castillo:** nueva ficha, Barcelona, 10-01; PROVEA describe detención y agresiones por policías, posterior aparición del cadáver con tres disparos y versión oficial de enfrentamiento. Categoría `policial`, sin sentencia verificada.
- **Registro 72, Luis Enrique González:** nueva ficha, Puerto La Cruz, 10-01; PROVEA describe entrada policial sin orden, disparos y hallazgo del cuerpo en un hospital, frente a versión oficial de enfrentamiento. Categoría `policial`, sin atribución penal judicial.
- **Registro 73, Pablo José Marcano Franco:** nueva ficha, Agua Blanca, 11-01; PROVEA lo relaciona con el llamado Grupo Exterminio y describe dieciocho impactos de bala. Categoría `investigacion`, sin autor material individual acreditado.

**Resultado documental:** 3 fichas nuevas, 1 ficha ampliada y 1 registro deliberadamente pendiente. Total de **16 fichas de 2001** en la rama, no 16 casos resueltos judicialmente ni recuento anual exhaustivo; dataset total esperado **317**. En la página anual se mantiene el aviso de cobertura parcial y se explica el registro 70. Las fuentes secundarias para los tres nombres nuevos y para el nexo causal de Aponte no se localizaron en la búsqueda inicial; no se presentan como corroboraciones independientes.

**Principios:** libertad individual — aplica con evidencia en detenciones y uso de fuerza; propiedad privada — no aplica; control del poder — aplica con evidencia en intervenciones policiales y necesidad de investigación. No se imputa motivación política ni autoría judicial no probada.

**Próxima unidad:** p. impresa **462 / PDF 20**, registros 74–83; contrastar casos que solo tienen referencia agregada de Defensoría (75 y 80), fechas del hecho frente a fallecimiento y posibles nombres ya registrados. En paralelo queda pendiente Aponte (registro 70), grafía Annelk y Edixon/Ericson Parra. Exigir source/build/Playwright, Codacy y Codex del nuevo SHA, revisión editorial humana y autorización de merge.

## F1 — Quinta unidad de 2001 — PROVEA, registros 74–83 (28-10-2026; PR #172)

**Fuente inspeccionada visualmente:** [PROVEA, anexo 3, p. impresa 462 / PDF p. 20](https://archivo.provea.org/wp-content/uploads/01_anexos0001.pdf). Se cotejaron los diez nombres y fechas de los registros 74–83 contra las 16 fichas previas del PR. Diez entradas nominales nuevas, sin duplicación detectada: Edward José Morales, Julio Hurtado, Roger Eduardo Castillo Castillo, Jeimon Rodríguez, Jhonny M. Meneses, Darwin Maita, Héctor José Bolívar, Raúl Alberto Villegas, Luis Alfredo Carrera Yéguez y Danilo Enrique Martínez Carrillo.

**Límites probatorios:** los registros 75 (Julio Hurtado) y 80 (Héctor José Bolívar) solo identifican dos nombres dentro de catorce denuncias de ajusticiamientos atribuidos a agentes estatales comunicadas por la defensora Indira Narváez; no incluyen narración individual ni sentencia. Se conservan como fichas documentales de **denuncia**, sin transformar el agregado de 14 en 14 fichas. Los registros 77–79 refieren una detención conjunta denunciada por familiares y una versión oficial de enfrentamiento, sin autoría penal dirimida. El n.º 81 alude al llamado Grupo Exterminio sin sentencia individual. El n.º 83 documenta a un menor de 13 años fallecido en intervención policial, sin difundir datos privados. Para los diez casos faltan contraste judicial y fuentes independientes.

**Estado:** 26 fichas de 2001 y 327 en el dataset de la rama, **no exhaustivas**. La página anual, el dataset y pruebas de fuente se actualizan en el mismo PR #172; no hay merge ni lanzamiento autorizado. Siguiente lote: PROVEA p. 463 / PDF p. 21, registros 84 en adelante; mantener pendientes la causalidad de Jorge Luis Aponte, variantes Edixon/Ericson Parra y Annelk Martínez, y el anexo octubre 2001–septiembre 2002.

**Orientación editorial:** libertad individual **aplica con evidencia** (vida, custodia y uso de fuerza); propiedad privada **no aplica**; control del poder **aplica con evidencia** (denuncias y actuaciones de seguridad). No se imputa condena ni autoría no acreditada.

## F1 — Sexta unidad de 2001 — PROVEA, registros 84–91 (28-10-2026; PR #172)

**Fuente primaria inspeccionada visualmente:** [PROVEA, anexo 3, p. impresa 463 / PDF p. 21](https://archivo.provea.org/wp-content/uploads/01_anexos0001.pdf), registros **84–91**, hechos del 20 al 25 de enero de 2001. Se compararon los ocho nombres con las 26 fichas ya presentes en la rama del PR. El anexo sigue sin revisión integral.

**Ocho fichas nominales nuevas:** Eduardo Jesús Marchán (15 años, Caracas, 20-01), Pedro Antonio Anzola (15 años, Sarare, 20-01), Juan Quintero y Luis Marín (Ciudad Bolívar, 20-01, episodio conjunto), Reuca José Mijares E. (Internado Judicial de Carabobo, 21-01), Darwin Edison Rodríguez Cedeño (Barcelona, 23-01), Manuel Guevara Pino (Ciudad Bolívar, 24-01) y Juan Carlos García Mejías (Barcelona, 25-01).

**Límites probatorios:** PROVEA recoge relatos de disparos de cuerpos policiales o Guardia Nacional y, en varios casos, versiones oficiales de enfrentamiento contradichas por testimonios. No se presentan como sentencias ni se imputa una autoría penal individual acreditada. El n.º 88 se transcribe provisionalmente como **Reuca José Mijares E.**, pues el anexo imprime **«MIJARES E. Reuca José»**: la inicial y la grafía requieren segunda fuente; el caso se clasifica como muerte **bajo custodia** en el Internado Judicial de Carabobo, no como protesta. Los dos adolescentes se documentan sin datos privados adicionales.

**Resultado en PR:** 34 fichas nominales de 2001, 335 entradas en dataset si el lote se integra sobre el HEAD anterior, 34 enlaces anuales; no representa balance exhaustivo ni determina responsabilidades judiciales. Actualizados dataset, página anual, fuente PRO2001, pruebas de regresión y este roadmap. Las pruebas de CI, Codacy y Codex deben verificarse para el SHA exacto resultante; revisión humana y autorización de merge siguen pendientes.

**Principios:** libertad individual — aplica con evidencia (vida y custodia); propiedad privada — no aplica; control del poder — aplica con evidencia (uso de fuerza y garantías). No se infiere motivación política común ni condenas individuales.

**Siguiente unidad:** PROVEA p. impresa **464 / PDF p. 22**, registros 92 en adelante; pendientes anteriores: causalidad de Jorge Luis Aponte (70), grafía de Annelk (65), variante Edixon/Ericson Parra, grafía e inicial de Mijares (88), fuentes judiciales y anexo octubre 2001–septiembre 2002.

## F1 — Séptima unidad de 2001 — PROVEA, registros 92–99 (28-10-2026; PR #172)

**Fuente primaria inspeccionada visualmente:** [PROVEA, anexo 3, p. impresa 464 / PDF índice 22](https://archivo.provea.org/wp-content/uploads/01_anexos0001.pdf#page=23), registros 92–99, fechas 25–31 de enero de 2001. Ocho fichas nuevas: Elvis Torres, Argenis Ramón Sánchez, David Enrique Merga, Sergio Antonio Aristiguetas, José Gregorio Rangel López, Luis Miguel Castañeda Angulo, Oscar Ramón Rodríguez y Wilfredo Velásquez Soler.

**Límites:** n.º 93 Sánchez, denuncia parlamentaria sin relato individual; n.º 94 Merga, una de catorce denuncias de la Defensoría sin relato individual (no catorce fichas); n.os 95–96, versiones oficiales de enfrentamiento controvertidas; n.os 97–98, atribución documental al llamado Grupo Exterminio, sin autoría judicial individual; n.º 99, muerte posterior a agresión policial según PROVEA. No se acreditan sentencias individuales ni se da por probada la conjetura sobre drogas en n.º 96.

**Resultado de la unidad:** 42 fichas de 2001 y 343 en el dataset, 42 enlaces nominales, sin duplicados detectados en preflight; capítulo aún no exhaustivo. Actualizados dataset, página anual, pruebas de fuente y roadmap. Revisión editorial humana y autorización de merge pendientes. Las cifras agregadas de PROVEA cubren octubre de 2000–septiembre de 2001, no el calendario 2001.

**Principios:** libertad individual — aplica con evidencia (vida, integridad y garantías); propiedad privada — no aplica; control del poder — aplica con evidencia (uso de fuerza y rendición de cuentas). No se presume motivación política común.

**Próxima unidad:** PROVEA p. impresa **465 / PDF índice 23**, registros 100 en adelante. Pendientes: Jorge Luis Aponte (70), Annelk (65), Edixon/Ericson Parra, Mijares E. (88), corroboraciones judiciales y anexo octubre 2001–septiembre 2002.

## F1 — Octava unidad de 2001 — PROVEA, registros 100–106 (28-10-2026; PR #172)

**Fuente primaria inspeccionada visualmente:** [PROVEA, anexo 3, p. impresa 465 / PDF índice 23](https://archivo.provea.org/wp-content/uploads/01_anexos0001.pdf#page=24), registros 100–106, hechos del 2 al 7 de febrero de 2001. Contraste adicional del registro 100 con [Departamento de Estado, informe 2001, sección 1.a](https://www.refworld.org/reference/annualreport/usdos/2002/31349), consultados el 28-10-2026.

**Seis fichas nuevas:** Yohanny Roseliano Rodríguez Piña (Catia La Mar, 02-02), Juan Francisco Maestracci (San Félix, 04-02), Jean Pier Marshal (Petare, 04-02), Jesús Alberto Galíndez (Araure, 05-02), Pedro Eduardo Santil (San Félix, 07-02) y Ramón Antonio Granado (Ciudad Bolívar, 07-02). Los registros 105 y 106 contienen denuncias ante Humanas Dignitas y versiones oficiales de enfrentamiento, sin relato individual ni sentencia verificada. El n.º 104 se relaciona con el llamado Grupo Exterminio sin atribución penal individual firme. Los demás son relatos de actuaciones policiales o militares; no se transforman testimonios o versiones oficiales en condenas.

**Reconciliación y rectificación factual:** el n.º 100 de PROVEA identifica a **Ángel Alberto Ardila**, mientras el informe estadounidense registra **«Angel Ardilla»** con idéntica fecha (02-02-2001), lugar (Casigua El Cubo) y acompañante (Alba Marina Bustamante). Se actualiza la ficha existente `angel-ardilla` y se preserva su URL; **no** se crea una segunda víctima. Se corrige además el n.º 91: el original de PROVEA imprime **«GARCÍA MEJÍAS, Jean Carlos»**, no «Juan Carlos», conservando `juan-carlos-garcia-mejias` como identificador técnico estable. Se deja constancia de ambas variantes para evitar pérdida de trazabilidad.

**Resultado en PR:** 48 fichas de 2001, 349 en el dataset total, capítulo y pruebas actualizados. No equivalen a un balance anual exhaustivo; el período del informe PROVEA abarca octubre de 2000–septiembre de 2001. Faltan contrastes judiciales, revisión humana, QA exact-SHA y autorización de merge. No se publica ni integra automáticamente.

**Principios:** libertad individual — aplica con evidencia (vida e integridad); propiedad privada — no aplica; control del poder — aplica con evidencia (actuaciones de seguridad y denuncias). Sin presumir motivación política común ni sentencias individuales.

**Siguiente unidad:** PROVEA p. impresa **466 / PDF índice 24**, registros 107–116. Persisten pendientes Jorge Luis Aponte (70), Annelk (65), Edixon/Ericson Parra, Mijares E. (88), fuentes judiciales y el anexo octubre 2001–septiembre 2002.

## F1 — Novena unidad de 2001 — PROVEA, registros 107–116 (28-10-2026; PR #172)

**Fuente primaria inspeccionada visualmente:** [PROVEA, anexo 3, p. impresa 466 / PDF índice 24](https://archivo.provea.org/wp-content/uploads/01_anexos0001.pdf#page=25), registros **107–116**, hechos del 9 al 18 de febrero de 2001. Cotejados los nombres contra las 48 fichas anteriores de 2001; diez fichas nuevas sin duplicados nominales detectados.

**Personas:** Argenis González; José Raúl Cumare Jiménez; Williams González; Dairilis Yulibet Sánchez Pérez; José David Gallardo Gómez; José Alberto Figueroa; Edison Álvarez; Carlos A. Villanueva; Pedro Antonio Belisario; Joel Carlitos Alay Pérez.

**Límites probatorios:** los n.os 109 y 115 solo contienen denuncias ante Humanas Dignitas y versiones oficiales de enfrentamiento, sin relato individual; los n.os 108, 110, 111 y 114 están vinculados por PROVEA al llamado Grupo Exterminio sin sentencia individual; en 107, 112 y 116 la fuente recoge denuncias de actuaciones policiales y versiones oficiales de enfrentamiento. El n.º 113 consigna la fecha «17.02.01*», cuyo asterisco **requiere cotejo**. La inicial A. de Villanueva no se expande. No se afirma autoría penal ni motivación política común.

**Resultado en PR:** 58 fichas de 2001 y 359 en el dataset, 58 enlaces nominales; registro parcial, no balance anual exhaustivo. Dataset, página anual, catálogo de fuentes y pruebas actualizados; QA exact-SHA y revisión editorial humana pendientes de comprobar. Sin merge, publicación comercial ni lanzamiento.

**Principios:** libertad individual — **aplica con evidencia** (vida e integridad); propiedad privada — **no aplica**; control del poder — **aplica con evidencia** (actuaciones de seguridad y denuncias). No se presupone culpabilidad.

**Siguiente unidad:** PROVEA p. impresa **467 / PDF índice 25**, registros 117–121. Pendientes anteriores: causalidad de Jorge Luis Aponte (70), Annelk (65), Edixon/Ericson Parra, Mijares E. (88), fecha de Álvarez (113), fuentes judiciales y anexo octubre 2001–septiembre 2002.

## F1 — Décima unidad de 2001 — PROVEA, registros 117–121 (28-10-2026; PR #172)

**Fuente primaria cotejada en imagen:** [PROVEA, anexo 3, p. impresa 467 / PDF índice 25](https://archivo.provea.org/wp-content/uploads/01_anexos0001.pdf#page=26), registros 117–121. Cinco personas identificadas: Amable Jerry Useche (18-02), Wuilkenfer Antonio Gutiérrez Lunar (25-02), Franklin Manuel Alejos Rondón (27-02), Miguel Antonio Torres (28-02) y Héctor Cabrera (fecha impresa 03.02.01*). Los registros 119 y 120 están clasificados por PROVEA como víctimas del llamado Grupo Exterminio, sin que esa etiqueta determine una condena o autoría penal individual. El registro 118 contrapone testimonio y versión oficial; la grafía Wuilkenfer necesita segunda fuente. La fecha del registro 121 lleva asterisco y aparece fuera de secuencia cronológica: se conserva provisionalmente y queda pendiente de cotejo.

**Resultado documental en rama:** 63 fichas nominales de 2001, 364 en dataset, 63 enlaces al perfil; el año **no** está cerrado ni equivale a un balance anual. Orientación editorial: libertad individual — aplica con evidencia (vidas y actuaciones policiales descritas); propiedad privada — no aplica; control del poder — aplica con evidencia (atribución y contradicción entre denuncias y versión oficial). No hay sentencias individuales corroboradas en esta unidad. Revisión editorial humana y autorización de merge siguen pendientes. No se cambia indexación ni se inicia lanzamiento.

**Próxima unidad:** PROVEA p. impresa 468 / PDF índice 26, registros 122 en adelante. Mantener pendientes: causalidad Jorge Luis Aponte (70), grafías Annelk (65), Mijares (88), Wuilkenfer (118), Edixon/Ericson Parra, fechas con asterisco (113, 121), actuaciones judiciales y anexo del período octubre 2001–septiembre 2002.

## F1 — Undécima unidad de 2001 — PROVEA, registros 122–124 (28-10-2026; PR #172)

**Fuente primaria cotejada visualmente:** [PROVEA, anexo 3, p. impresa 468 / PDF índice 26](https://archivo.provea.org/wp-content/uploads/01_anexos0001.pdf#page=27), registros **122–124**, correspondientes al **1 de marzo de 2001**, El Tigre, Anzoátegui. Se cotejó la fuente con el dataset previo (63 fichas de 2001), sin coincidencias nominales previas para estas tres personas.

**Tres fichas nuevas de un mismo episodio:** **Yavidilex Placencio Borges** (13 años), **Wilmer Villarroel** (21 años) y **Rafael Leonardo Moreno** (20 años). PROVEA recoge testimonios de disparos policiales en una vivienda y una versión oficial de enfrentamiento; familiares y testigos denunciaron además que Moreno fue sacado con vida y ejecutado después. La denuncia no se transforma en determinación judicial. Se omiten datos privados adicionales de la menor.

**Resultado preparado en rama:** 66 fichas de 2001 y 367 en el dataset; tres perfiles y enlaces en el capítulo anual, fuente extendida hasta p. 468, tests de identidad/fecha/atribución y conteos flexibles. Año aún incompleto; no se han verificado sentencias individuales ni atribuido motivación política común. Principios: libertad individual — **aplica con evidencia** (vida e integridad); propiedad privada — **no aplica**; control del poder — **aplica con evidencia** (actuación policial, versión oficial y exigencia de investigación).

**Próxima unidad:** PROVEA p. impresa 468, registros **125–131** (varios casos vinculados por la fuente al llamado Grupo Exterminio, además de denuncia de extorsión policial); después p. 469, registros 132 en adelante. Pendientes: revisión humana de las imputaciones de este episodio y las anteriores, fechas con asterisco, identidades ambiguas y documentación judicial posterior. QA exact-SHA y checks pendientes al preparar este incremento.


## F1 — Duodécima unidad de 2001 — PROVEA, registros 125–131 (28-10-2026; PR #172)

**Fuente primaria inspeccionada visualmente:** [PROVEA, anexo 3, p. impresa 468 / PDF índice 26](https://archivo.provea.org/wp-content/uploads/01_anexos0001.pdf#page=27), registros **125–131**. Se revisaron la identidad, fecha, localidad y columna de circunstancias de cada registro. Siete fichas nuevas: **Ismael G. Rodríguez T.** (01-03), **Miguel Ángel Castillo** (02-03), **Daniel Evaristo Peñuela Piña** (03-03), **Luis O. Zabaleta F.** (03-03), **Melkis Emilio Silva Sánchez** (03-03), **Juan Carlos Colmenares** (06-03) y **Juan Ramón Hernández Guindano** (08-03).

**Alcance probatorio:** los registros 125–130 son clasificados por PROVEA como víctimas del llamado «Grupo Exterminio» en Portuguesa, pero el anexo no identifica sentencias penales individuales; no se les atribuye autoría judicialmente demostrada. El n.º 131 (Barcelona, Anzoátegui) relata que **un funcionario entregó Bs. 5.000 a Hernández para que comprara drogas**, y denuncia que, al no realizarse la compra ni la devolución, el funcionario lo hostigó y mató; la versión oficial sostuvo enfrentamiento. **Corrección tras revisión Codex P2:** se rectificó una inversión inicial de quién entregó el dinero, cotejando nuevamente el registro 131; se añadió regresión explícita en dataset y archivo anual. No se confunden denuncia, relato documental y sentencia. Se preservan las iniciales **G. Rodríguez T.** y **O. Zabaleta F.** sin expandir; requieren corroboración nominal adicional.

**Resultado propuesto en rama:** 73 fichas de 2001, 374 registros totales, siete perfiles nuevos enlazados desde el archivo anual. El año sigue incompleto; PROVEA cubre octubre de 2000–septiembre de 2001 y no debe convertirse en cifra de año calendario. Libertad individual — aplica con evidencia; propiedad privada — no aplica; control del poder — aplica con evidencia. La fuente no permite afirmar motivación política común ni condenas individuales.

**Siguiente unidad:** PROVEA p. impresa 469 / PDF índice 27, registros 132 en adelante; mantener pendientes nominales, causales y judiciales anteriores. QA exact-SHA, Codacy, Codex y revisión humana deben certificarse antes de merge; noindex, prototipo y ausencia de lanzamiento se mantienen.
