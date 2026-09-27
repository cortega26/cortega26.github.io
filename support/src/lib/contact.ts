import { business, services } from "../config.ts";

export const devices = [
  "Notebook",
  "PC de escritorio",
  "Router / Wi-Fi",
  "Impresora",
  "Otro",
] as const;
export const powerStates = ["Sí", "No", "No corresponde"] as const;
export interface Intake {
  area: string;
  device: string;
  power: string;
  service: string;
  model: string;
  problem: string;
}
export type IntakeErrors = Partial<Record<keyof Intake, string>>;
const clean = (value: string) =>
  value.replace(/[\u0000-\u001f\u007f]/g, " ").trim();

export function validateIntake(input: Intake): IntakeErrors {
  const errors: IntakeErrors = {};
  if (![...business.areas.map((a) => a.id), "otra"].includes(input.area))
    errors.area = "Selecciona tu comuna.";
  if (!devices.some((d) => d === input.device))
    errors.device = "Selecciona el tipo de equipo.";
  if (!powerStates.some((p) => p === input.power))
    errors.power = "Indica si el equipo enciende.";
  if (![...services.map((s) => s.id), "otro"].includes(input.service))
    errors.service = "Selecciona un servicio.";
  if (clean(input.problem).length < 5 || input.problem.length > 600)
    errors.problem = "Describe el problema con entre 5 y 600 caracteres.";
  if (input.model.length > 100)
    errors.model = "Usa hasta 100 caracteres para el modelo.";
  return errors;
}

export function leadReference(): string {
  return `TS-${crypto.randomUUID().replaceAll("-", "").slice(0, 12).toUpperCase()}`;
}

export function buildMessage(input: Intake, reference: string): string {
  if (Object.keys(validateIntake(input)).length)
    throw new Error("Invalid intake");
  if (!/^TS-[A-F0-9]{12}$/.test(reference))
    throw new Error("Invalid reference");
  return [
    `Hola, vengo desde ${business.name}.`,
    `Comuna: ${business.areas.find((a) => a.id === input.area)?.name ?? "Otra comuna"}`,
    `Equipo: ${input.device}`,
    `¿Enciende?: ${input.power}`,
    `Servicio: ${services.find((s) => s.id === input.service)?.title ?? "Otro problema"}`,
    ...(clean(input.model) ? [`Marca/modelo: ${clean(input.model)}`] : []),
    `Problema: ${clean(input.problem)}`,
    `Ref: ${reference}`,
  ].join("\n");
}

export function whatsappUrl(phone: string, message: string): string {
  if (!/^569\d{8}$/.test(phone))
    throw new Error("Missing or invalid WhatsApp number");
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
