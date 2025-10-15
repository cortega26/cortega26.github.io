# Auditoría Welcome — Evidencias

## Resumen ejecutivo
- Auditoría en curso: priorizadas mejoras de copy, metadatos y accesibilidad en la página de selección de idioma.

## Tabla de issues corregidos
| Issue | Antes | Después | Evidencia |
|-------|-------|---------|-----------|
| Metadatos incompletos | Sin meta description ni `hreflang`. | Se añadieron description, canonical y `link rel="alternate"`. | Commit pending |
| Acceso por teclado | Sin skip link hacia las opciones de idioma. | Se agregó enlace de salto visible al enfocarse. | Commit pending |
| Copy con exceso de marketing | Frases vagas sobre "mainframe" y "synthwave". | Mensajes neutrales centrados en navegación y contenido verificable. | Commit pending |

## Enlaces revisados
- Selector EN → `./english/english.html` (interno, ok).
- Selector ES → `index-spa.html` (interno, ok).

## Evidencias textuales
- Ver diffs del commit asociado en esta rama.

## Mini changelog
- docs/welcome-audit-failsafe · Ajustes iniciales en selector bilingüe.

## Checklist de calidad (parcial)
- [x] Contenido conciso en selector de idioma.
- [x] i18n mantiene contexto entre EN/ES.
- [x] Accesibilidad: skip link agregado.
- [ ] Links auditados en profundidad (pendiente).
- [ ] SEO extendido en páginas internas (pendiente).
