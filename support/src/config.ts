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
  photo: "src/assets/carlos-ortega.jpeg",
  reviewUrl: "",
  availability: "Atención previa coordinación",
  payment: "Transferencia, efectivo o tarjeta. Mismo precio.",
  taxDocument: "",
  retention:
    "Las consultas que no terminan en servicio se conservan por un máximo de 90 días. De los servicios realizados se mantiene un registro operativo mínimo por hasta 12 meses para seguimiento, soporte y resolución de reclamos. La dirección exacta se elimina cuando deja de ser necesaria para coordinar o prestar el servicio. No se almacenan contraseñas y las copias temporales de archivos se eliminan al completar el propósito acordado. Los registros sujetos a obligaciones legales se conservan durante el plazo aplicable.",
  visitMinutes: 45,
  remoteMinutes: 45,
  notebookMaintenancePrice: 40000,
  areas: [
    { id: "macul", name: "Macul", price: 25000 },
    { id: "nunoa", name: "Ñuñoa", price: 25000 },
    { id: "providencia", name: "Providencia", price: 30000 },
  ],
  // Confirmed: additional work in the same visit is charged as the greater of
  // visit and service, plus authorized parts, licenses and extras.
  visitCredit: true,
  macOS: false,
  offsite: false,
  analyticsId: "",
  confirmed: {
    prices: true,
    coverage: true,
    scope: true,
    tax: false,
    terms: true,
    privacy: true,
  },
  // portrait is verified by evidence in the repo: the asset exists, the build
  // optimizes it and tests/artifact.test.ts asserts it renders with its alt
  // text. realPhone and analytics still need real-world checks.
  verified: { realPhone: false, analytics: false, portrait: true },
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
    price: 35000,
    detail: `Mano de obra para PC de escritorio. Notebook desde $${business.notebookMaintenancePrice.toLocaleString("es-CL")}; según modelo.`,
  },
  {
    id: "upgrade",
    title: "Instalación de SSD o RAM",
    problem: "Quiero un computador más ágil",
    description: "Compatibilidad, instalación y comprobación del componente.",
    price: 25000,
    detail: "Mano de obra. Repuestos y migración se cotizan por separado.",
  },
  {
    id: "windows",
    title: "Windows y configuración",
    problem: "No inicia o muestra errores",
    description:
      "Diagnóstico de software, instalación y configuración según el caso.",
    price: 35000,
    detail: "Respaldo y licencia, si se necesitan, se acuerdan por separado.",
  },
  {
    id: "respaldo",
    title: "Respaldo y migración",
    problem: "Quiero cuidar o trasladar mis archivos",
    description:
      "Copia acordada de archivos y ayuda para pasar a un equipo nuevo.",
    price: 30000,
    detail: "Según volumen y estado del disco. No es recuperación avanzada.",
  },
  {
    id: "wifi",
    title: "Wi-Fi e impresoras",
    problem: "La conexión no funciona bien",
    description:
      "Revisión de conectividad y configuración de router, red o impresora.",
    price: 30000,
    detail: "Equipos adicionales y cableado no incluidos.",
  },
  {
    id: "remoto",
    title: "Ayuda a distancia",
    problem: "Necesito ayuda con una configuración",
    description:
      "Soporte para problemas que no requieren revisar físicamente el equipo.",
    price: 20000,
    detail: `Hasta ${business.remoteMinutes} minutos, sujeto a evaluación. Sin acceso desatendido permanente.`,
  },
];

export const money = (value: number) =>
  new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(value);
export const basePrice = () => Math.min(...business.areas.map((a) => a.price));

/**
 * Hard blockers: without these the service cannot be responsibly offered or
 * charged (reachable contact, priceable scope, fiscal document, privacy terms).
 * Measurement and discovery tooling never belongs here.
 */
export function hardLaunchIssues(config = business): string[] {
  const issues: string[] = [];
  if (!/^569\d{8}$/.test(config.whatsapp))
    issues.push("WhatsApp chileno verificado (569 + 8 dígitos)");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(config.email))
    issues.push("Correo público para privacidad y reclamos");
  for (const key of [
    "payment",
    "taxDocument",
    "retention",
    "photo",
  ] as const) {
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
