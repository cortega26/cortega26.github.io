export type SiteLocale = 'en' | 'es';
export type SiteDocumentKey = 'privacy' | 'cookies' | 'terms' | 'engagement';

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
            'When a project engagement begins, meetings may be recorded for documentation and requirements-scoping purposes. This practice is disclosed in the engagement terms published at tooltician.com/en/engagement/ and requires the explicit consent of all participants at the start of each session, consistent with Articles 161-A and 161-C of the Chilean Penal Code and Law 19.628 on the Protection of Personal Data.',
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
            'Una vez iniciado un proyecto, las reuniones pueden ser grabadas con fines de documentación y levantamiento de requerimientos. Esta práctica queda indicada en las condiciones de trabajo publicadas en tooltician.com/es/engagement/ y requiere el consentimiento explícito de todos los participantes al inicio de cada sesión, en conformidad con los artículos 161-A y 161-C del Código Penal chileno y la Ley N° 19.628 sobre Protección de la Vida Privada.',
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
  engagement: {
    en: {
      eyebrow: 'Policy',
      title: 'Engagement Terms',
      description: 'Responsibilities, consequences, intellectual property, and confidentiality rules that govern every project engagement with Tooltician.',
      intro: 'These terms define what each party commits to, what happens when something goes wrong, and how ownership and confidentiality are handled. They apply to every scoped engagement unless superseded by a separate written agreement.',
      updatedLabel: 'Last updated',
      updatedAt: '27 May 2026',
      sections: [
        {
          heading: 'My commitments',
          paragraphs: ['As the contractor, I commit to the following on every engagement.'],
          items: [
            'Deliver the agreed scope within the estimated timeline.',
            'Notify you before a scope change affects delivery or cost.',
            'Hand off documented, runnable work — not just code.',
            'Respond within 2 business days on active engagements.',
            'Give a direct no if a request is outside scope.',
            'Record meetings for documentation and requirements scoping. Recordings are shared only with the participants of that session and are not used for any other purpose.',
          ],
        },
        {
          heading: 'Client responsibilities',
          paragraphs: ['For the engagement to run as scoped, the client is responsible for the following.'],
          items: [
            'Define the workflow, the bottleneck, and the internal owner before kick-off.',
            'Pay the agreed deposit before work begins.',
            'Provide access to systems and data within 3 business days of request.',
            'Give feedback on deliverables within 5 business days.',
            'Designate one decision-making contact.',
          ],
        },
        {
          heading: 'If either side doesn\'t hold up',
          paragraphs: ['The following rules apply when commitments are not met by either party.'],
          items: [
            'Non-payment: work pauses and deliverables are withheld until the balance is settled.',
            'Delayed access or feedback: timeline extends by the same amount — no penalty on my end.',
            'Scope additions: quoted separately; nothing is absorbed silently.',
            'Late delivery due to my fault: timeline adjusts with written notice, no extra cost.',
            'Scope not deliverable as defined: I flag it early and offer a revised scope or refund of any unused deposit.',
            'Early termination by client: work completed to date is billed at the agreed rate; the unused deposit balance is refunded within 5 business days.',
            'Early termination by me: all completed work is delivered in full; the entire unused deposit is refunded within 5 business days.',
          ],
        },
        {
          heading: 'Intellectual property',
          paragraphs: ['Ownership follows Chilean Law 17.336 on Intellectual Property with the following explicit terms.'],
          items: [
            'Deliverables created for the engagement transfer to the client upon full payment, under Chilean Law 17.336 on Intellectual Property (Art. 8).',
            'Generic components, utilities, and patterns developed independently or predating the engagement are retained by me and may be reused in other projects.',
            'Client brand assets — logos, trademarks, domain names, and exclusive brand identifiers — remain the sole property of the client and may only be referenced in case studies or testimonials with explicit written permission.',
          ],
        },
        {
          heading: 'Confidentiality',
          paragraphs: ['All non-public information shared during an engagement is treated with the following obligations.'],
          items: [
            'Information shared during an engagement — workflows, internal processes, credentials, data, and business logic — is treated as confidential.',
            'It is used solely to deliver the agreed scope and is not disclosed, shared, or repurposed outside the engagement.',
            'This obligation applies during the engagement and for a reasonable period after its close, regardless of whether a formal NDA is in place.',
          ],
        },
      ],
      closing: 'These engagement terms are governed by the laws of Chile. Questions about scope or fit? Start with a brief.',
      ctaLabel: 'Start with a brief',
      ctaHref: '/en/#contact-form',
    },
    es: {
      eyebrow: 'Política',
      title: 'Condiciones de Trabajo',
      description: 'Responsabilidades, consecuencias, propiedad intelectual y confidencialidad que rigen cada proyecto con Tooltician.',
      intro: 'Estas condiciones definen a qué se compromete cada parte, qué ocurre cuando algo falla y cómo se gestionan la titularidad y la confidencialidad. Aplican a todo proyecto acotado salvo que un acuerdo escrito independiente las reemplace.',
      updatedLabel: 'Última actualización',
      updatedAt: '27 de mayo de 2026',
      sections: [
        {
          heading: 'Mis compromisos',
          paragraphs: ['Como contratista, me comprometo a lo siguiente en cada proyecto.'],
          items: [
            'Entregar el alcance acordado dentro del plazo estimado.',
            'Avisarte antes de que un cambio afecte la entrega o el costo.',
            'Traspasar trabajo documentado y ejecutable, no solo código.',
            'Responder en 2 días hábiles en proyectos activos.',
            'Decir no directamente si una solicitud queda fuera del alcance.',
            'Grabar las reuniones con fines de documentación y levantamiento de requerimientos. Las grabaciones se comparten únicamente con los participantes de esa sesión y no se usan para ningún otro propósito.',
          ],
        },
        {
          heading: 'Responsabilidades del cliente',
          paragraphs: ['Para que el proyecto avance según lo acordado, el cliente es responsable de lo siguiente.'],
          items: [
            'Definir el flujo, el cuello de botella y el responsable interno antes del inicio.',
            'Pagar el anticipo acordado antes de comenzar el trabajo.',
            'Entregar accesos y datos necesarios en un máximo de 3 días hábiles desde la solicitud.',
            'Dar feedback sobre entregables en un máximo de 5 días hábiles.',
            'Designar un único punto de contacto para decisiones.',
          ],
        },
        {
          heading: 'Si alguna de las partes no cumple',
          paragraphs: ['Las siguientes reglas aplican cuando alguna de las partes no cumple sus compromisos.'],
          items: [
            'Impago: el trabajo se pausa y los entregables quedan retenidos hasta saldar el saldo.',
            'Demora en accesos o feedback: el plazo se extiende en la misma proporción, sin penalización de mi parte.',
            'Solicitudes fuera de alcance: se cotizan por separado, nada se absorbe en silencio.',
            'Retraso por causa mía: el plazo se ajusta con aviso escrito, sin costo adicional.',
            'Alcance no entregable como fue definido: lo señalo temprano y ofrezco un alcance revisado o la devolución del anticipo no utilizado.',
            'Terminación anticipada por el cliente: el trabajo completado hasta esa fecha se factura según la tarifa acordada; el saldo del anticipo no utilizado se devuelve en un máximo de 5 días hábiles.',
            'Terminación anticipada de mi parte: entrego todo el trabajo completado hasta esa fecha; el anticipo no utilizado se devuelve íntegramente en un máximo de 5 días hábiles.',
          ],
        },
        {
          heading: 'Propiedad intelectual',
          paragraphs: ['La titularidad sigue la Ley N° 17.336 de Propiedad Intelectual con las siguientes condiciones explícitas.'],
          items: [
            'Los entregables creados para el proyecto se ceden al cliente tras el pago íntegro, conforme a la Ley N° 17.336 de Propiedad Intelectual (Art. 8).',
            'Los componentes genéricos, utilidades y patrones desarrollados de forma independiente o anteriores al proyecto quedan bajo mi titularidad y pueden reutilizarse en otros proyectos.',
            'Los activos de marca del cliente — logos, marcas registradas, nombres de dominio e identificadores exclusivos — son propiedad exclusiva del cliente y solo podrán referenciarse en estudios de caso o testimonios con autorización escrita explícita.',
          ],
        },
        {
          heading: 'Confidencialidad',
          paragraphs: ['Toda información no pública compartida durante un proyecto se trata con las siguientes obligaciones.'],
          items: [
            'La información compartida durante un proyecto — flujos, procesos internos, credenciales, datos y lógica de negocio — se trata como confidencial.',
            'Se usa exclusivamente para entregar el alcance acordado y no se divulga, comparte ni reutiliza fuera del proyecto.',
            'Esta obligación aplica durante el proyecto y por un período razonable posterior a su cierre, con o sin NDA formal vigente.',
          ],
        },
      ],
      closing: 'Estas condiciones se rigen por la legislación chilena. ¿Tienes preguntas sobre alcance o encaje? Empieza con un brief.',
      ctaLabel: 'Empezar con un brief',
      ctaHref: '/es/#contact-form',
    },
  },
};