# Inventario Welcome Pages

## Selector bilingüe (`index.html`)
- Título previo: "Welcome / Bienvenido" → actualizado a "Select language · Carlos Ortega Portfolio".
- Componentes: hero, tarjetas de idioma EN/ES, script `assets/js/landing.js`.
- Pendientes: revisar animaciones JS, medir contraste de tarjetas.

## Portafolio español (`index-spa.html`)
- Secciones: navegación, hero, perfil, capacidades, experiencia, credenciales, portafolio, laboratorio, contacto.
- Recursos externos: Bootstrap 4.5.2, Font Awesome 5.15.3, Google Fonts (Inter, Playfair Display).
- Metadatos: canonical, `hreflang` cruzado con versión EN, Open Graph, Twitter Card, JSON-LD (tipo `Person`).
- To-do: depurar claims cuantitativos y alinear con evidencias públicas (GitHub, LinkedIn).

## Portafolio inglés (`english/english.html`)
- Estructura espejo de la versión en español con copy original en inglés.
- Metadatos: canonical, `hreflang`, OG/Twitter paridad EN, JSON-LD `Person`.
- To-do: sincronizar ajustes tras depurar versión ES.

## Assets relevantes
- `assets/css/landing.css`: estilos para selector de idioma.
- `assets/js/landing.js`: efectos de partículas (evaluar rendimiento/accesibilidad).
- Documentos: `assets/docs/carlos-ortega-resume.pdf` referenciado en CTA.

## Hub EduTecno (`edutecno/edu-index.html`)
- Componentes: cabecera contextual, grid de botones por módulo con estados accesibles.
- Estado de enlaces: solo módulo 2 publicado (`./PC2/prueba_consolidacion_2.html`); módulos restantes marcados "En preparación" con botones `disabled`.
- Metadatos: canonical, OG/Twitter, JSON-LD `ItemList` con 9 entradas.
