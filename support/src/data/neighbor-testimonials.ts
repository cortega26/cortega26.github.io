/** Testimonials reviewed against screenshots supplied by the owner (2026-10-08).
 * Do not invent names, service outcomes, dates, stars or aggregate ratings.
 * The private-chat client's identity must remain undisclosed.
 */
export interface NeighborTestimonial {
  id: string;
  type: 'soporte' | 'trayectoria';
  quote: string;
  author: string;
  context: string;
  source: string;
}

export const neighborTestimonials: readonly NeighborTestimonial[] = [
  {
    id: 'network-card',
    type: 'soporte',
    quote: 'Fue buena la atención y el análisis entregado.',
    author: 'Cliente de soporte técnico',
    context: 'El cliente señaló que se normalizó un problema de la tarjeta de red que aparecía cuando el PC funcionaba sin cargador.',
    source: 'Comentario recibido directamente · Identidad reservada',
  },
  {
    id: 'external-disk',
    type: 'soporte',
    quote: 'Muchas gracias, excelente trabajo',
    author: 'Greily Molina',
    context: 'Comentó que recuperó gran parte de la información almacenada en un disco duro externo. Es un caso anterior, no una promesa de recuperación de datos.',
    source: 'Recomendación de LinkedIn · 28 de febrero de 2016',
  },
  {
    id: 'professional',
    type: 'trayectoria',
    quote: 'Carlos Ignacio es un profesional integral con una profunda capacidad de análisis y experiencia en el área de TI.',
    author: 'Juan Carlos Ortega Rached',
    context: 'Recomendación sobre el trabajo conjunto y la responsabilidad profesional, no sobre una reparación contratada.',
    source: 'Recomendación profesional de LinkedIn',
  },
] as const;
