import { neighborServices } from "../config.ts";
import { devices, leadReference, powerStates, whatsappUrl } from "./contact.ts";

export { devices, leadReference, powerStates, whatsappUrl };

export interface NeighborIntake {
  device: string;
  power: string;
  service: string;
  model: string;
  problem: string;
}

export type NeighborIntakeErrors = Partial<Record<keyof NeighborIntake, string>>;

const clean = (value: string) =>
  value.replace(/[\u0000-\u001f\u007f]/g, " ").trim();

export function validateNeighborIntake(
  input: NeighborIntake,
): NeighborIntakeErrors {
  const errors: NeighborIntakeErrors = {};
  if (!devices.some((device) => device === input.device))
    errors.device = "Selecciona el tipo de equipo.";
  if (!powerStates.some((state) => state === input.power))
    errors.power = "Indica si el equipo enciende.";
  if (
    ![...neighborServices.map((service) => service.id), "otro"].includes(
      input.service,
    )
  )
    errors.service = "Selecciona un servicio.";
  if (clean(input.problem).length < 5 || input.problem.length > 600)
    errors.problem = "Describe el problema con entre 5 y 600 caracteres.";
  if (input.model.length > 100)
    errors.model = "Usa hasta 100 caracteres para el modelo.";
  return errors;
}

export function buildNeighborMessage(
  input: NeighborIntake,
  reference: string,
): string {
  if (Object.keys(validateNeighborIntake(input)).length)
    throw new Error("Invalid neighbor intake");
  if (!/^TS-[A-F0-9]{12}$/.test(reference))
    throw new Error("Invalid reference");

  return [
    "Hola, soy vecino/a del edificio y vengo desde Tooltician Soporte Vecinos.",
    `Equipo: ${input.device}`,
    `¿Enciende?: ${input.power}`,
    `Servicio: ${neighborServices.find((service) => service.id === input.service)?.title ?? "Otro problema"}`,
    ...(clean(input.model) ? [`Marca/modelo: ${clean(input.model)}`] : []),
    `Problema: ${clean(input.problem)}`,
    `Ref: ${reference}`,
  ].join("\n");
}
