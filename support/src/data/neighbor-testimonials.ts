/** Testimonials supplied by the owner (2026-10-08; fuller originals 2026-10-11).
 * Quote text is verbatim, including original spelling; never invent outcomes or ratings.
 * Attribution of the private message is provided by the owner, not independently verified.
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
    quote: 'Fue buena la atención y el analisis entregado. El PC se corrigio debido a que habia una configuracion que activo y se normalizo el problema de la tarjeta de red cuando no estaba con cargador enchufado a la corriente.',
    author: 'Oscar Matías',
    context: 'Comentario de soporte técnico enviado por mensaje privado. Texto íntegro y atribución facilitados por el titular.',
    source: 'Mensaje privado',
  },
  {
    id: 'external-disk',
    type: 'soporte',
    quote: 'Muchas gracias, excelente trabajo recupere gran parte de la información q se encontraba en el disco duro externo',
    author: 'Greily Molina',
    context: 'Experiencia histórica de 2016 con un disco duro externo; no supone una oferta ni garantía de recuperación avanzada de datos.',
    source: 'LinkedIn · 2016',
  },
  {
    id: 'professional',
    type: 'trayectoria',
    quote: 'Carlos Ignacio es un profesional integral con una profunda capacidad de análisis y experiencia en el área de TI.',
    author: 'Juan Carlos Ortega Rached',
    context: 'Recomendación sobre el trabajo conjunto y la responsabilidad profesional, no sobre una reparación contratada.',
    source: 'LinkedIn · Recomendación profesional',
  },
] as const;
