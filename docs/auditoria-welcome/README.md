# Auditoría Welcome — Evidencias

## Resumen ejecutivo
- Auditoría en curso: priorizadas mejoras de copy, metadatos y accesibilidad en la página de selección de idioma.

## Tabla de issues corregidos
| Issue | Antes | Después | Evidencia |
|-------|-------|---------|-----------|
| Metadatos incompletos | Sin meta description ni `hreflang`. | Se añadieron description, canonical y `link rel="alternate"`. | feat/seo-audit |
| Acceso por teclado | Sin skip link hacia las opciones de idioma. | Se agregó enlace de salto visible al enfocarse. | feat/seo-audit |
| Copy con exceso de marketing | Frases vagas sobre "mainframe" y "synthwave". | Mensajes neutrales centrados en navegación y contenido verificable. | feat/seo-audit |
| SEO extendido páginas internas | Sin Open Graph ni datos estructurados en `/en`, `/es`, `/projects/edutecno`. | Descripciones enriquecidas, etiquetas OG/Twitter y JSON-LD por página. | feat/seo-audit |
| Auditoría de enlaces | Atributo `rel` faltante y botones sin estado. | `rel="noopener noreferrer"` aplicado y tablero EduTecno con estados de módulos. | feat/seo-audit |

## Enlaces revisados
- Portafolio EN → 47 enlaces auditados (35 externos con `rel="noopener noreferrer"`, 9 internos, 1 descarga, 2 `mailto`).
- Portafolio ES → 47 enlaces auditados (35 externos con `rel="noopener noreferrer"`, 9 internos, 1 descarga, 2 `mailto`).
- Hub EduTecno → 1 enlace interno activo (`./PC2/prueba_consolidacion_2.html`) y 8 módulos señalados como "En preparación" con botones deshabilitados.

### Evidencia técnica
- Script de inventario de enlaces ejecutado localmente (`html.parser`) confirma cero enlaces externos sin `rel`. Ver salida adjunta en esta rama.
- Los bloques JSON-LD fueron parseados con `json.loads` para asegurar sintaxis válida (ver script en outputs locales).

### TODOs
- Ejecutar Google Rich Results Test una vez desplegado para confirmar la ingesta del JSON-LD agregado.

## Evidencias textuales
- Ver diffs del commit asociado en esta rama.

## Mini changelog
- docs/welcome-audit-failsafe · Ajustes iniciales en selector bilingüe.
- en/index.html · Metadatos extendidos, JSON-LD y hardening de enlaces.
- es/index.html · Paridad SEO en español + JSON-LD.
- projects/edutecno/index.html · Tablero accesible con estados y schema `ItemList`.
- docs/auditoria-welcome/inventory.md · Inventario actualizado tras la auditoría.

## Checklist de calidad (parcial)
- [x] Contenido conciso en selector de idioma.
- [x] i18n mantiene contexto entre EN/ES.
- [x] Accesibilidad: skip link agregado.
- [x] Links auditados en profundidad.
- [x] SEO extendido en páginas internas.
