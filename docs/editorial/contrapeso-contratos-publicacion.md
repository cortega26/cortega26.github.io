# Contrapeso — Contratos de publicación por género (CP-011)

**Estado:** guía interna para el prototipo, actualizada el 29-10-2026 por mandato del propietario. Complementa la carta editorial y el manual; exige auditoría editorial propia y gates técnicos antes de integrar. Las plantillas son campos de trabajo, **no contenido listo para mostrar**.

## Campos comunes obligatorios

- **Género y título:** `ACTUALIDAD`, `OPINIÓN` o `EXPLICADOR`; un solo H1, título verificable y bajada específica.
- **Procedencia:** autoría o responsabilidad editorial realmente acreditada; no inventar firma, corresponsalía, entrevistas ni acceso a documentos. Si es síntesis de terceros, declararlo.
- **Temporalidad:** fecha del hecho (cuando corresponda), fecha de publicación y última revisión. Una fecha de revisión no convierte historia en actualidad.
- **Prueba:** cada afirmación central vinculada a fuentes inspeccionadas, con emisor, fecha, pasaje, qué acredita y límites. Registrar versiones contrarias pertinentes.
- **Incertidumbre:** apartado visible con lo que no se sabe, no pudo verificarse o está en disputa.
- **Correcciones:** enlace a `/venezuela-lab/metodo/`; si se corrige un error material, nota pública con fecha, versión anterior, cambio y motivo.
- **Prototipo:** `noindex,nofollow,noarchive`, etiqueta de prototipo, sin formularios ni scripts añadidos por defecto. Ruta únicamente en `prototypeOnlyRoutes`, nunca en `routeGroups`/sitemap.
- **QA:** fuente, build y Chromium exact-SHA; Codacy, auditoría editorial propia documentada, revisión independiente selectiva cuando corresponda, merge condicionado y verificación postdeploy diferenciadas. No hay gate humano editorial por publicación. Los riesgos sensibles requieren prueba reforzada; lanzamiento, indexación, identidad personal y monetización siguen reservados al propietario.

## Autonomía editorial y revisión independiente por aislamiento (29-10-2026)

El responsable de Contrapeso ejecuta de punta a punta investigación, redacción, verificación, evaluación de riesgos, correcciones, pruebas y merges de prototipo cuando se cumplen los gates. **No se requiere revisor humano editorial** por pieza, ficha, noticia o PR. Para acusaciones sensibles, verificar y registrar fuentes primarias con pasaje, corroboración pertinente, evidencia adversa, atribución precisa (denuncia/hallazgo/sentencia), causalidad, privacidad, deduplicación e incertidumbre. Si no existe prueba suficiente, excluir, desidentificar, corregir o posponer la afirmación.

Una sesión nueva realmente aislada del contexto de desarrollo puede aportar **revisión independiente de criterio**, pero no es aprobación externa ni cumple por sí sola un requisito de aprobador distinto de GitHub. Documentar SHA, alcance, fuentes y hallazgos; si no existe aislamiento comprobable, declarar «auditoría propia, sin revisión de sesión aislada». Usar revisión fresca solo ante riesgo o hito sustancial, sin pedir Codex por rutina. El merge del prototipo puede exponer URLs directas aunque haya `noindex`; no equivale a autorización de lanzamiento, indexación, identidad personal, dominio ni comercialización.

## Criterio transversal de orientación editorial

Cada PR que publique o revise un contenido debe indicar en su descripción, para **libertad individual**, **propiedad privada** y **control del poder**, uno de estos resultados: **aplica con evidencia / no aplica / requiere investigación**. Justificar sucintamente las elecciones relevantes y separar siempre hechos de valoraciones.

- **Actualidad:** informar primero el hecho; explicar los mecanismos de control o derechos implicados únicamente si son pertinentes, sin convertir la noticia en columna.
- **Investigaciones y explicadores:** contrastar decisiones, competencias y garantías con sus documentos; distinguir la conclusión factual del juicio editorial.
- **Opinión:** puede defender tesis desde principios declarados, manteniendo género, autoría autorizada y evidencia para sus premisas.
- **Museo y memorial:** aplicar dignidad, libertad y rendición de cuentas sin presuponer motivos, responsables o delitos por afinidades políticas.
- **Archivo existente:** cada página y ficha individual se revisa de forma gradual; las plantillas y los índices no son verificación de cientos de casos. No reescribir narraciones sólidas solo para insertar palabras doctrinarias.

El contrato de `tests/contrapeso-orientacion.mjs` verifica enlaces al método y robots en las páginas existentes y futuras; no acredita la evaluación editorial semántica ni los documentos.

## Plantilla A — Noticia contextualizada / Actualidad

**Género:** ACTUALIDAD  
**Título:** [hecho específico, sin anticipar desenlaces]  
**Bajada:** [qué pasó, dónde y cuándo, con atribución]  
**Procedencia:** [reporteo propio comprobado O síntesis atribuida de terceros]  
**Hecho:** [fecha y zona horaria cuando importa]  
**Publicado:** [fecha] · **Revisado:** [fecha y hora]  

1. **Qué está confirmado:** hechos separados de declaraciones de actores; corroboración y fuentes independientes.
2. **Desarrollo y contexto:** secuencia temporal, decisiones y versiones pertinentes.
3. **Por qué importa:** consecuencias demostrables, sin presentar proyecciones como hechos.
4. **Qué falta verificar:** dudas, contradicciones y límites de cobertura; no suponer que un anuncio equivale a una ejecución.
5. **Fuentes consultadas y alcance:** emisor, fecha, URL, pasaje y tipo de acceso; indicar originales inaccesibles.
6. **Actualización/rectificación:** si procede, nota visible distinta de la fecha inicial.

**Gate específico:** no republicar como novedad una noticia desactualizada. Contrastar cambios materiales al momento de publicar.

## Plantilla B — Columna / Opinión institucional (sin firma personal atribuida)

**Género:** OPINIÓN (visible en portada, encabezado y artículo)  
**Título/tesis:** [posición defendida explícitamente]  
**Responsabilidad editorial:** [Contrapeso; sin atribuir la opinión a una persona real ni inventar firma]  
**Publicado/revisado:** [fechas verificables de integración y revisión editorial]  

1. **Tesis y razonamiento:** qué sostiene el autor y por qué.
2. **Hechos de soporte:** datos y citas comprobables con enlaces; distinguirlos de juicios de valor.
3. **Objeción fuerte:** examinar evidencia adversa relevante sin falsa simetría.
4. **Alcance y límites:** qué no puede concluirse; distinguir crítica política de imputación penal.
5. **Fuentes y rectificaciones:** referencias inspeccionables y enlace al método.

**Gate específico:** puede prepararse e integrarse al prototipo una columna institucional genuina, identificada como OPINIÓN y atribuida a la responsabilidad editorial de Contrapeso, cuando se hayan verificado hechos, objeciones, fuentes y controles. No adjudicarse la voz personal del propietario ni inventar autor, firma o corresponsal. Si incluye una imputación sensible, aplicar el gate reforzado de evidencia o excluirla. Integrar en el prototipo no equivale a lanzamiento ni levanta `noindex`.

## Plantilla C — Explicador documental

**Género:** EXPLICADOR, con etiqueta **HISTÓRICO** si el hecho es pasado.  
**Pregunta/título:** [qué necesita entender el lector]  
**Período del hecho:** [fecha o intervalo]  
**Publicado/revisado:** [fechas]  

1. **Respuesta breve y definiciones:** qué se sabe y qué significan los términos.
2. **Cronología/documentos:** fechas, decisiones, tablas o cálculos reproducibles.
3. **Qué demuestra cada fuente:** original/reproducción, emisor, pasaje y alcance.
4. **Versiones/objeciones:** respuestas institucionales, evidencia contraria y discrepancias.
5. **Qué acredita y qué no:** incertidumbres, inferencias prohibidas y preguntas abiertas.
6. **Fuentes y rectificaciones:** referencias fechadas y enlace al método.

**Gate específico:** no presentar como primario un documento no inspeccionado; no convertir una reconstrucción histórica en noticia reciente.

## Aplicación técnica actual

Las páginas reales de Actualidad y Explicadores ya usan `article-header`, `article-meta`, `sources` y `method`, con CSS compartido. No duplicar plantillas HTML ni CSS sin necesidad. `tests/contrapeso-publication-contracts.mjs` comprueba automáticamente las páginas de `actualidad/`, `explicadores/` y, cuando exista una publicación autorizada, `opinion/`. Es un **guard de estructura**, no una certificación de veracidad, de enlaces externos vivos, de autoría auténtica ni de auditoría editorial propia. Las pruebas específicas de cada publicación siguen siendo obligatorias.

**Fuentes de autoridad:** `AGENTS.md`, `docs/editorial/contrapeso-principios.md`, `docs/editorial/contrapeso-manual.md`, `plans/contrapeso-roadmap.md`.
