// Index of the published ES guides (Plan 032). The guide pages are the copy
// authority for their article body; this index mirrors their H1 and meta
// description for the /es/guias/ hub, the home resources strip, and tests.

export interface GuideEntry {
  slug: string;
  href: string;
  title: string;
  description: string;
  serviceHref: string;
  serviceLabel: string;
}

export const guides: GuideEntry[] = [
  {
    slug: 'auditoria-tecnica-web-negocios-pequenos',
    href: '/es/guias/auditoria-tecnica-web-negocios-pequenos/',
    title: 'Auditoría técnica web para negocios pequeños: qué revisa y cuándo pedirla',
    description:
      'Qué revisa una auditoría técnica web para negocios pequeños: headers, HTTPS, correo, formularios y SEO básico, y cómo decidir el siguiente paso sin alarmismo.',
    serviceHref: '/es/servicios/higiene-tecnica-web/',
    serviceLabel: 'Higiene Técnica Web',
  },
  {
    slug: 'automatizar-reportes-excel-python',
    href: '/es/guias/automatizar-reportes-excel-python/',
    title: 'Automatizar reportes de Excel con Python: qué conviene y qué no',
    description:
      'Guía práctica para automatizar reportes de Excel con Python: qué flujos conviene automatizar, cómo es un pipeline reproducible y qué pedir en el alcance.',
    serviceHref: '/es/servicios/automatizacion-python/',
    serviceLabel: 'Automatización Python',
  },
  {
    slug: 'pagina-web-estatica-cuando-conviene',
    href: '/es/guias/pagina-web-estatica-cuando-conviene/',
    title: 'Qué es una página web estática y cuándo conviene',
    description:
      'Qué es una página web estática, qué ventajas ofrece frente a un CMS y en qué casos conviene elegirla para el sitio de un negocio pequeño.',
    serviceHref: '/es/servicios/sitios-web/',
    serviceLabel: 'Sitios Estáticos y Frontends Acotados',
  },
];
