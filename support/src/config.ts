export interface Service {
  id: string;
  title: string;
  problem: string;
  description: string;
  price: number;
  detail: string;
}

/** Business facts belong here. Empty values are intentional launch blockers. */
export const business = {
  name: "Tooltician Soporte",
  owner: "Carlos Ortega González",
  origin: "https://soporte.tooltician.com",
  parent: "https://tooltician.com/es/",
  github: "https://github.com/cortega26",
  linkedin: "https://www.linkedin.com/in/cortega26",
  whatsapp: "56951118901",
  email: "carlos@tooltician.com",
  photo: "src/assets/carlos-ortega-hq.webp",
  reviewUrl: "",
  availability: "Atención previa coordinación",
  payment: "Transferencia, efectivo o tarjeta. Mismo precio.",
  // Registro de Personas Naturales que desarrollan Actividades de Subsistencia
  // (Resolución Ex. SII N°193/2025). Mientras la inscripción esté vigente no
  // requiere Inicio de Actividades, está exonerado de IVA y liberado de emitir
  // boletas por estas prestaciones. No sustituye permisos municipales.
  taxRegime:
    "Inscrito en el Registro de Actividades de Subsistencia del SII. Exonerado de IVA y liberado de emitir boletas mientras se mantengan los requisitos del régimen.",
  retention:
    "Las consultas que no terminan en servicio se conservan por un máximo de 90 días. De los servicios realizados se mantiene un registro operativo mínimo por hasta 12 meses para seguimiento, soporte y resolución de reclamos. La dirección exacta se elimina cuando deja de ser necesaria para coordinar o prestar el servicio. No se almacenan contraseñas y las copias temporales de archivos se eliminan al completar el propósito acordado. Los registros sujetos a obligaciones legales se conservan durante el plazo aplicable.",
  visitMinutes: 45,
  remoteMinutes: 45,
  notebookMaintenancePrice: 45000,
  // Final consumer prices. They already absorb the cost of the payment method
  // and the expected future migration out of the subsistence registry, so no
  // tax is added on top. No "más IVA" wording while the registry is in force.
  areas: [
    { id: "macul", name: "Macul", price: 30000 },
    { id: "nunoa", name: "Ñuñoa", price: 30000 },
    { id: "providencia", name: "Providencia", price: 35000 },
  ],
  // Confirmed: additional work in the same visit is charged as the greater of
  // visit and service, plus authorized parts, licenses and extras.
  visitCredit: true,
  macOS: false,
  offsite: false,
  analyticsId: "",
  // Written answer received from Municipalidad de Macul on 2026-09-30:
  // the applicable route is a Patente de Domicilio Postal Tributario. The
  // category is confirmed; issuance of the patent is still pending.
  municipal: {
    authority: "Municipalidad de Macul - Departamento de Rentas Municipales",
    permitType: "Patente de Domicilio Postal Tributario",
    responseDate: "2026-09-30",
    status: "application_pending",
  },
  confirmed: {
    prices: true,
    coverage: true,
    scope: true,
    tax: true,
    terms: true,
    privacy: true,
    municipalPermit: false,
  },
  // portrait is verified by evidence in the repo: the asset exists, the build
  // optimizes it and tests/artifact.test.ts asserts it renders with its alt
  // text. realPhone was verified by a human send/receive test on the published
  // number. analytics still needs a real reception check in GA4.
  verified: { realPhone: true, analytics: false, portrait: true },
};

export const services: Service[] = [
  {
    id: "diagnostico",
    title: "Visita y diagnóstico",
    problem: "Mi equipo falla y no sé por qué",
    description:
      "Revisión del equipo, explicación del problema y próximos pasos.",
    price: Math.min(...business.areas.map((a) => a.price)),
    detail: `Hasta ${business.visitMinutes} minutos. Incluye soluciones simples sin desmontaje.`,
  },
  {
    id: "mantencion",
    title: "Limpieza y temperatura",
    problem: "Se calienta o hace mucho ruido",
    description:
      "Limpieza interna, revisión de ventilación y pasta térmica cuando corresponda.",
    price: 40000,
    detail: `Mano de obra para PC de escritorio. Notebook desde $${business.notebookMaintenancePrice.toLocaleString("es-CL")}; según modelo.`,
  },
  {
    id: "upgrade",
    title: "Instalación de SSD o RAM",
    problem: "Quiero un computador más ágil",
    description: "Compatibilidad, instalación y comprobación del componente.",
    price: 30000,
    detail: "Mano de obra. Repuestos y migración se cotizan por separado.",
  },
  {
    id: "windows",
    title: "Windows y configuración",
    problem: "No inicia o muestra errores",
    description:
      "Diagnóstico de software, instalación y configuración según el caso.",
    price: 40000,
    detail: "Respaldo y licencia, si se necesitan, se acuerdan por separado.",
  },
  {
    id: "respaldo",
    title: "Respaldo y migración",
    problem: "Quiero cuidar o trasladar mis archivos",
    description:
      "Copia acordada de archivos y ayuda para pasar a un equipo nuevo.",
    price: 35000,
    detail: "Según volumen y estado del disco. No es recuperación avanzada.",
  },
  {
    id: "wifi",
    title: "Wi-Fi e impresoras",
    problem: "La conexión no funciona bien",
    description:
      "Revisión de conectividad y configuración de router, red o impresora.",
    price: 35000,
    detail: "Equipos adicionales y cableado no incluidos.",
  },
  {
    id: "remoto",
    title: "Ayuda a distancia",
    problem: "Necesito ayuda con una configuración",
    description:
      "Soporte para problemas que no requieren revisar físicamente el equipo.",
    price: 25000,
    detail: `Hasta ${business.remoteMinutes} minutos, sujeto a evaluación. Sin acceso desatendido permanente.`,
  },
];

export const neighborOffer = {
  // Evaluation-only variant for residents of the owner's building. It must stay
  // non-public/non-indexed and without live contact until its residential
  // operating constraints are explicitly cleared.
  ready: false,
  // Independent from the general service launch. Only true after written
  // confirmation that residential intake, custody and work are permitted.
  operatingAuthorizationConfirmed: false,
  residentsOnly: true,
  priceReduction: 10000,
  diagnosticCredit: true,
  delivery:
    "Entrega y retiro coordinados en el edificio. La ubicación exacta se comparte por privado.",
  turnaround:
    "La disponibilidad y una estimación de revisión se confirman antes de recibir el equipo; el plazo de reparación depende del caso.",
  notebookMaintenancePrice: business.notebookMaintenancePrice - 10000,
} as const;

export const neighborServices: Service[] = services
  .filter((service) => service.id !== "wifi")
  .map((service) => ({
    ...service,
    title:
      service.id === "diagnostico" ? "Recepción y diagnóstico" : service.title,
    price: service.price - neighborOffer.priceReduction,
    detail:
      service.id === "diagnostico"
        ? "Revisión inicial del equipo, explicación del problema y cotización antes de intervenir."
        : service.id === "mantencion"
          ? `Mano de obra para PC de escritorio. Notebook desde ${neighborOffer.notebookMaintenancePrice.toLocaleString("es-CL")}; según modelo.`
          : service.detail,
  }));

export const money = (value: number) =>
  new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(value);
export const basePrice = () => Math.min(...business.areas.map((a) => a.price));

/**
 * Hard blockers: without these the service cannot be responsibly offered or
 * charged (reachable contact, stated tax regime, privacy terms, a real phone
 * test, and the municipal authorization answer that only the owner can obtain).
 * Measurement and discovery tooling never belongs here.
 */
export function hardLaunchIssues(config = business): string[] {
  const issues: string[] = [];
  if (!/^569\d{8}$/.test(config.whatsapp))
    issues.push("WhatsApp chileno verificado (569 + 8 dígitos)");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(config.email))
    issues.push("Correo público para privacidad y reclamos");
  for (const key of ["payment", "taxRegime", "retention", "photo"] as const) {
    if (!config[key].trim()) issues.push(key);
  }
  for (const [key, done] of Object.entries(config.confirmed))
    if (!done) issues.push(`Confirmar ${key}`);
  if (!config.verified.realPhone)
    issues.push("Verificar realPhone (prueba desde un teléfono real)");
  if (!config.verified.portrait) issues.push("Verificar portrait");
  return issues;
}

/**
 * Soft / post-launch: analytics, Search Console, Business Profile and public
 * reviews. Reported as warnings, never blocking a publication.
 */
export function softLaunchIssues(config = business): string[] {
  const issues: string[] = [];
  if (!/^G-[A-Z0-9]+$/.test(config.analyticsId))
    issues.push("Identificador GA4");
  if (!config.verified.analytics)
    issues.push("Verificar analytics (eventos recibidos en GA4)");
  if (!config.reviewUrl.trim()) issues.push("reviewUrl");
  return issues;
}
