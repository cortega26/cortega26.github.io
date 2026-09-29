# Tooltician — Auditoría de reposicionamiento (Mayo 2026)

## Resumen

El sitio ya tenía los elementos correctos para una oferta comercial clara, pero los comunicaba con el sesgo de "consultor Python individual". Esta auditoría documenta los problemas encontrados, las decisiones tomadas y los cambios aplicados en la sesión de reposicionamiento.

---

## Estado del sitio antes de los cambios

### Páginas existentes

| Ruta | Estado |
|------|--------|
| `/` | Gateway de idioma con redirección automática |
| `/en/` | Homepage one-page EN |
| `/es/` | Homepage one-page ES |
| `/en/services/web-technical-hygiene/` | Página de servicio con precios USD, completa |
| `/es/servicios/higiene-tecnica-web/` | Página de servicio con precios UF/CLP, completa |
| `/[lang]/[document]` | Páginas legales dinámicas (privacidad, cookies, términos) |

### Componentes de homepage

Ambas versiones usan: `HeroSection`, `PortfolioSection`, `ServicesSection`, `ServiceSpotlight` (ES only), `ProofSection`, `AboutSection`, `ContactSection`.

### Lo que ya funcionaba bien (no se tocó)

- **Página ES de Higiene Técnica Web**: diagnóstico breve, planes con precios, FAQ, evidencia antes/después, sección de entregables. Está profesional y comercialmente honesta.
- **Página EN de Hygiene**: equivalente en inglés con precios en USD ($69–$499+/mes).
- **Portfolio cards**: cada proyecto tiene estructura problema → solución → resultado verificable, con evidencia enlazable.
- **ServicesSection**: 7 servicios organizados, con precios referenciados y CTAs.
- **ServiceSpotlight ES**: sección intermedia bien diseñada que destaca Higiene Técnica Web con precio y CTA directo.

---

## Problemas identificados

### 1. Hero EN no mencionaba Web Technical Hygiene

`HeroSection.astro` tiene soporte para `serviceLine`/`serviceHref`/`serviceCta` en ambos idiomas, pero la sección `en` los tenía declarados como `undefined`. Un visitante de la versión inglesa no veía nada sobre Web Technical Hygiene en el hero.

**Solución**: Se agregó el serviceLine en EN:
> "I also cover web technical hygiene for live sites: security headers, HTTPS, DNS, forms, and lightweight monitoring — no internal hire needed."

### 2. Página EN no tenía ServiceSpotlight

La página ES tenía `<ServiceSpotlight />` como sección intermedia entre Services y Proof. La página EN no lo tenía, haciendo la oferta de Higiene Técnica Web invisible para el mercado EN excepto en la card #7 de ServicesSection.

**Solución**: Se hizo ServiceSpotlight bilingüe con prop `lang: 'en' | 'es'` y se agregó a la página EN después de ServicesSection.

### 3. ServiceSpotlight estaba hardcodeado en español

El componente tenía URLs, títulos y precios hardcodeados en español, lo que impedía reutilizarlo en la versión EN.

**Solución**: Reescritura completa del componente con objetos `en`/`es` y prop `lang`. Precios EN: $69 diagnóstico, desde $279/mes. Precios ES: 1 UF diagnóstico, desde 4 UF/mes.

### 4. Titles y metadata orientados a "Python Automation Consultant"

Los `<title>` y `description` del homepage en ambos idiomas nombraban solo la línea de automatización Python, sin mencionar Higiene Técnica Web.

**Solución**: Actualizados ambas versiones:
- EN: "Python Automation & Web Technical Hygiene | Tooltician"
- ES: "Automatización Python e Higiene Técnica Web | Tooltician"

### 5. jsonLd no incluía la oferta de Web Technical Hygiene

El schema `makesOffer` en la página EN no mencionaba el servicio de Higiene Técnica Web.

**Solución**: Se agregó la oferta con URL directa a la página del servicio.

---

## Lo que NO se cambió y por qué

| Elemento | Razón |
|----------|-------|
| Diseño visual y CSS | Está bien, no hay problemas de presentación |
| Orden de secciones | El flujo actual es coherente y mantenible |
| Página ES de Higiene Técnica Web | Está completa y comercialmente clara |
| Página EN de Web Technical Hygiene | Equivalente bien estructurado |
| Portfolio cards | Ya usan formato problema/solución/evidencia |
| Precios publicados | Son honestos y ya están en producción |
| Rutas y URLs existentes | No se rompieron ni se crearon redirects |
| Nuevas páginas de servicio | Sin ROI claro para Automatización Operativa o Herramientas Web como páginas separadas |

---

## Archivos modificados

| Archivo | Cambio |
|---------|--------|
| `src/components/ServiceSpotlight.astro` | Reescritura completa: prop `lang`, objetos `en`/`es`, precios bilingües |
| `src/components/HeroSection.astro` | `serviceLine`/`serviceHref`/`serviceCta` en sección `en` (antes `undefined`) |
| `src/pages/en/index.astro` | Import + uso de ServiceSpotlight, title, description, jobTitle, makesOffer, knowsAbout |
| `src/pages/es/index.astro` | `lang="es"` en ServiceSpotlight, title, description, jobTitle, knowsAbout |

---

## Decisiones de diseño y trade-offs

### No crear páginas de resumen de servicios

El prompt sugería `/es/servicios/` y `/en/services/` como páginas de resumen. Se evaluó y descartó porque:
- `ServicesSection` en el homepage ya funciona como resumen de 7 servicios
- Las páginas de servicio específicas (Higiene Técnica Web) ya existen
- Crear páginas de resumen sin contenido propio añade superficie sin propósito comercial
- Riesgo de fragmentación SEO sin beneficio claro

### No crear fichas de proyecto individuales

Los proyectos ya tienen fichas detalladas inline en `PortfolioSection` con problema/solución/evidencia verificable. Una ruta `/es/proyectos/[slug]/` añadiría complejidad sin mejorar la conversión.

### Metadata actualizada con ambas líneas pero sin sacrificar keywords de automatización

El título nuevo ("Python Automation & Web Technical Hygiene") mantiene la keyword de automatización que puede tener tráfico orgánico existente, y agrega la segunda línea. No se eliminó la referencia Python.

---

## Próximos pasos sugeridos (no implementados)

1. **Revisar el hero copy de ES**: el `serviceLine` es claro pero podría reforzarse el título principal del hero para que comunique ambas líneas desde el H1 (bajo riesgo, alto impacto potencial).
2. **Agregar Open Graph images específicas** para las páginas de servicio (actualmente comparten la OG card general).
3. **Página de resumen de servicios** si se registra tráfico orgánico hacia URLs de servicios no existentes (monitorear en Search Console).
4. **Formulario de contacto en página de Higiene Técnica Web**: actualmente el CTA de la página ES usa `mailto:` — considerar un formulario web para reducir fricción.
5. **Ampliar la oferta EN** de Web Technical Hygiene si llegan leads en inglés — actualmente la página EN está completa pero menos integrada al homepage que la versión ES.
