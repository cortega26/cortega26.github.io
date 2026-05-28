export type SiteLocale = 'en' | 'es';
export type SiteDocumentKey = 'privacy' | 'cookies' | 'terms';

export interface SiteDocumentSection {
  heading: string;
  paragraphs: string[];
  items?: string[];
}

export interface SiteDocumentContent {
  eyebrow: string;
  title: string;
  description: string;
  intro: string;
  updatedLabel: string;
  updatedAt: string;
  sections: SiteDocumentSection[];
  closing: string;
  ctaLabel: string;
  ctaHref: string;
}

export const siteDocuments: Record<SiteDocumentKey, Record<SiteLocale, SiteDocumentContent>> = {
  privacy: {
    en: {
      eyebrow: 'Policy',
      title: 'Privacy Policy',
      description: 'How Tooltician handles contact, scheduling, analytics, and language preference data on this site.',
      intro:
        'This page explains what this site collects, why it is collected, and which third-party services are involved when you contact me or schedule a call.',
      updatedLabel: 'Last updated',
      updatedAt: '27 May 2026',
      sections: [
        {
          heading: 'What this site collects',
          paragraphs: [
            'This site is static and does not run its own customer database.',
            'Data is collected only when you actively submit the brief form, book through Calendly, or interact with technical features that store a browser preference.',
          ],
          items: [
            'Project brief form: name, email address, and the message you submit through Formspree.',
            'Scheduling: the information you provide directly to Calendly when booking an intro call.',
            'Language preference: the selected site language stored in local browser storage so the site can remember your choice.',
            'Basic usage analytics: Ahrefs Analytics may receive page-view and browser metadata needed for aggregate traffic reporting.',
          ],
        },
        {
          heading: 'How the information is used',
          paragraphs: [
            'Submitted information is used to review project fit, reply by email, and schedule or continue an initial conversation.',
            'I do not use this site to sell contact lists or to run ad-targeting workflows from form submissions.',
          ],
        },
        {
          heading: 'Meeting recordings',
          paragraphs: [
            'When a project engagement begins, meetings may be recorded for documentation and requirements-scoping purposes. This practice is disclosed in the engagement terms and requires the explicit consent of all participants at the start of each session, consistent with Articles 161-A and 161-C of the Chilean Penal Code and Law 19.628 on the Protection of Personal Data.',
            'Recordings are shared only with the participants in that meeting and are used solely to document scope agreements, technical decisions, and commitments. They are not sold, shared with third parties, or used for any other purpose.',
            'Recordings are retained for the duration of the engagement and archived or deleted at its close. If you are a project participant and wish to request deletion of a specific recording, contact me by email from the address used in the engagement.',
          ],
        },
        {
          heading: 'Third-party services involved',
          paragraphs: [
            'Form submissions are delivered by Formspree, meeting scheduling is handled by Calendly, and site analytics are measured with Ahrefs Analytics.',
            'Those providers process information according to their own terms and privacy commitments when you use their services through this site.',
          ],
        },
        {
          heading: 'Retention and control',
          paragraphs: [
            'I keep inquiry information only for as long as it remains useful for answering, tracking, or closing a request.',
            'If you want a submitted inquiry removed, email me from the same address used in the request so I can identify it safely.',
          ],
        },
      ],
      closing: 'Questions about data handling or a specific inquiry? The project brief form is the fastest route.',
      ctaLabel: 'Open project brief',
      ctaHref: '/en/#contact-form',
    },
    es: {
      eyebrow: 'Política',
      title: 'Política de Privacidad',
      description: 'Cómo maneja Tooltician los datos de contacto, agenda, analítica y preferencia de idioma en este sitio.',
      intro:
        'Esta página explica qué recopila este sitio, por qué se recopila y qué servicios de terceros intervienen cuando contactas o agendas una llamada.',
      updatedLabel: 'Última actualización',
      updatedAt: '27 de mayo de 2026',
      sections: [
        {
          heading: 'Qué recopila este sitio',
          paragraphs: [
            'Este sitio es estático y no opera una base de datos propia de clientes.',
            'Los datos se recopilan solo cuando envías activamente el formulario de brief, agendas mediante Calendly o interactúas con funciones técnicas que guardan una preferencia del navegador.',
          ],
          items: [
            'Formulario de brief: nombre, correo y el mensaje que envías a través de Formspree.',
            'Agenda: la información que entregas directamente a Calendly al reservar una llamada inicial.',
            'Preferencia de idioma: el idioma elegido se guarda en el almacenamiento local del navegador para recordar tu elección.',
            'Analítica básica de uso: Ahrefs Analytics puede recibir vistas de página y metadatos del navegador para reportes agregados de tráfico.',
          ],
        },
        {
          heading: 'Cómo se usa la información',
          paragraphs: [
            'La información enviada se usa para revisar el encaje del proyecto, responder por correo y agendar o continuar una conversación inicial.',
            'No uso este sitio para vender listas de contacto ni para ejecutar segmentación publicitaria a partir de formularios enviados.',
          ],
        },
        {
          heading: 'Grabaciones de reuniones',
          paragraphs: [
            'Una vez iniciado un proyecto, las reuniones pueden ser grabadas con fines de documentación y levantamiento de requerimientos. Esta práctica queda indicada en las condiciones de trabajo y requiere el consentimiento explícito de todos los participantes al inicio de cada sesión, en conformidad con los artículos 161-A y 161-C del Código Penal chileno y la Ley N° 19.628 sobre Protección de la Vida Privada.',
            'Las grabaciones se comparten exclusivamente con los participantes de esa reunión y se usan únicamente para documentar acuerdos de alcance, decisiones técnicas y compromisos. No se venden, no se comparten con terceros ni se usan para ningún otro fin.',
            'Las grabaciones se conservan durante el proyecto y se archivan o eliminan al cierre del mismo. Si eres participante de un proyecto y deseas solicitar la eliminación de una grabación específica, escríbeme desde el correo usado en el proyecto.',
          ],
        },
        {
          heading: 'Servicios de terceros involucrados',
          paragraphs: [
            'Los formularios se entregan con Formspree, la agenda se gestiona con Calendly y la analítica del sitio se mide con Ahrefs Analytics.',
            'Esos proveedores procesan información según sus propios términos y compromisos de privacidad cuando usas sus servicios desde este sitio.',
          ],
        },
        {
          heading: 'Retención y control',
          paragraphs: [
            'Mantengo la información de consultas solo durante el tiempo necesario para responder, hacer seguimiento o cerrar una solicitud.',
            'Si quieres eliminar una consulta enviada, escríbeme desde el mismo correo usado en la solicitud para poder identificarla con seguridad.',
          ],
        },
      ],
      closing: 'Si tienes dudas sobre tratamiento de datos o sobre una consulta concreta, el formulario de brief sigue siendo la vía más rápida.',
      ctaLabel: 'Abrir brief',
      ctaHref: '/es/#contact-form',
    },
  },
  cookies: {
    en: {
      eyebrow: 'Policy',
      title: 'Cookie and Browser Storage Notice',
      description: 'A practical overview of cookies, local storage, and third-party browser storage used on Tooltician.com.',
      intro:
        'This site keeps browser storage to a minimum, but some local preferences and third-party services still rely on technical storage to work correctly.',
      updatedLabel: 'Last updated',
      updatedAt: '17 May 2026',
      sections: [
        {
          heading: 'What is used directly on this site',
          paragraphs: [
            'The site stores a language preference in local browser storage so the root language gateway can remember whether you prefer English or Spanish.',
            'That preference is functional only; it is used to improve navigation and does not create a marketing profile.',
          ],
        },
        {
          heading: 'Third-party storage',
          paragraphs: [
            'Calendly, Formspree, Ahrefs Analytics, and infrastructure providers may set or access technical browser storage when their services load or when you interact with them.',
            'Those mechanisms are controlled by the providers that run the service, not by a custom cookie system built into this site.',
          ],
        },
        {
          heading: 'How to control it',
          paragraphs: [
            'You can clear site data, local storage, and cookies from your browser settings at any time.',
            'Blocking third-party storage may affect scheduling, analytics measurement, or contact-form delivery if the provider depends on it.',
          ],
        },
      ],
      closing: 'If you prefer not to use browser storage at all, contact me directly by email instead of using embedded services.',
      ctaLabel: 'Go to contact',
      ctaHref: '/en/#contact',
    },
    es: {
      eyebrow: 'Política',
      title: 'Aviso de Cookies y Almacenamiento del Navegador',
      description: 'Resumen práctico de cookies, almacenamiento local y almacenamiento de terceros usado en Tooltician.com.',
      intro:
        'Este sitio mantiene el almacenamiento del navegador al mínimo, pero algunas preferencias locales y servicios de terceros dependen de almacenamiento técnico para funcionar bien.',
      updatedLabel: 'Última actualización',
      updatedAt: '17 de mayo de 2026',
      sections: [
        {
          heading: 'Qué usa directamente este sitio',
          paragraphs: [
            'El sitio guarda una preferencia de idioma en el almacenamiento local del navegador para que la puerta de idioma recuerde si prefieres español o inglés.',
            'Esa preferencia es funcional y solo se usa para mejorar la navegación; no crea un perfil de marketing.',
          ],
        },
        {
          heading: 'Almacenamiento de terceros',
          paragraphs: [
            'Calendly, Formspree, Ahrefs Analytics y proveedores de infraestructura pueden definir o leer almacenamiento técnico del navegador cuando sus servicios cargan o cuando interactúas con ellos.',
            'Esos mecanismos son controlados por los proveedores que operan el servicio, no por un sistema de cookies personalizado construido en este sitio.',
          ],
        },
        {
          heading: 'Cómo controlarlo',
          paragraphs: [
            'Puedes borrar datos del sitio, almacenamiento local y cookies desde la configuración de tu navegador en cualquier momento.',
            'Bloquear almacenamiento de terceros puede afectar la agenda, la medición analítica o la entrega del formulario si el proveedor depende de ello.',
          ],
        },
      ],
      closing: 'Si prefieres no usar ningún almacenamiento del navegador, puedes escribirme por correo en lugar de usar servicios integrados.',
      ctaLabel: 'Ir a contacto',
      ctaHref: '/es/#contact',
    },
  },
  terms: {
    en: {
      eyebrow: 'Policy',
      title: 'Terms of Use',
      description: 'Basic public-use terms for browsing Tooltician.com, following external links, and using the project brief form.',
      intro:
        'These terms set a practical baseline for using this public portfolio site and its contact routes. They are intentionally narrow and tied to how the site actually works today.',
      updatedLabel: 'Last updated',
      updatedAt: '17 May 2026',
      sections: [
        {
          heading: 'Site purpose',
          paragraphs: [
            'This site exists to present public work, explain services, and provide a route to discuss potential projects.',
            'Nothing on the site should be read as a guaranteed offer, delivery commitment, or formal statement of project availability unless confirmed directly in writing.',
          ],
        },
        {
          heading: 'Content and repositories',
          paragraphs: [
            'Site copy, structure, and presentation remain reserved unless a specific asset or repository states otherwise.',
            'Public GitHub repositories linked from the site keep their own licenses, notices, and contribution rules.',
          ],
        },
        {
          heading: 'External links and third-party services',
          paragraphs: [
            'Links to GitHub, LinkedIn, Calendly, Formspree, PyPI, and live project sites take you to services operated outside this site.',
            'Those destinations are governed by their own availability, terms, privacy practices, and technical behavior.',
          ],
        },
        {
          heading: 'No warranty',
          paragraphs: [
            'The site is provided as a public informational resource and may change without prior notice.',
            'I make a reasonable effort to keep links and content current, but I do not promise uninterrupted availability or error-free operation at all times.',
          ],
        },
      ],
      closing: 'If you need a written project scope, timeline, or commercial agreement, use the brief form so that conversation starts explicitly.',
      ctaLabel: 'Start with a brief',
      ctaHref: '/en/#contact-form',
    },
    es: {
      eyebrow: 'Política',
      title: 'Términos de Uso',
      description: 'Términos básicos de uso público para navegar Tooltician.com, seguir enlaces externos y usar el formulario de brief.',
      intro:
        'Estos términos fijan una base práctica para usar este portafolio público y sus rutas de contacto. Son intencionalmente acotados y corresponden a cómo opera hoy el sitio.',
      updatedLabel: 'Última actualización',
      updatedAt: '17 de mayo de 2026',
      sections: [
        {
          heading: 'Propósito del sitio',
          paragraphs: [
            'Este sitio existe para mostrar trabajo público, explicar servicios y ofrecer una vía para conversar sobre proyectos potenciales.',
            'Nada en el sitio debe leerse como una oferta garantizada, un compromiso de entrega o una confirmación formal de disponibilidad sin validación escrita directa.',
          ],
        },
        {
          heading: 'Contenido y repositorios',
          paragraphs: [
            'El copy, la estructura y la presentación del sitio permanecen reservados salvo que un activo o repositorio indique otra cosa.',
            'Los repositorios públicos enlazados desde el sitio conservan sus propias licencias, avisos y reglas de contribución.',
          ],
        },
        {
          heading: 'Enlaces externos y servicios de terceros',
          paragraphs: [
            'Los enlaces a GitHub, LinkedIn, Calendly, Formspree, PyPI y sitios activos llevan a servicios operados fuera de este sitio.',
            'Esos destinos se rigen por su propia disponibilidad, términos, prácticas de privacidad y comportamiento técnico.',
          ],
        },
        {
          heading: 'Sin garantía',
          paragraphs: [
            'El sitio se ofrece como un recurso público informativo y puede cambiar sin aviso previo.',
            'Hago un esfuerzo razonable por mantener enlaces y contenido actualizados, pero no prometo disponibilidad ininterrumpida ni operación libre de errores en todo momento.',
          ],
        },
      ],
      closing: 'Si necesitas un alcance, plazo o acuerdo comercial por escrito, usa el formulario de brief para iniciar esa conversación de forma explícita.',
      ctaLabel: 'Empezar con un brief',
      ctaHref: '/es/#contact-form',
    },
  },
};