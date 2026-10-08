import { business } from "./config";
import {
  buildNeighborMessage,
  leadReference,
  validateNeighborIntake,
  whatsappUrl,
  type NeighborIntake,
  type NeighborIntakeErrors,
} from "./lib/neighbor-contact";
import { track, type EventName, eventNames } from "./lib/analytics";

const paintErrors = (
  form: HTMLFormElement,
  fields: readonly (keyof NeighborIntake)[],
  errors: NeighborIntakeErrors,
) => {
  for (const field of fields) {
    const element = form.elements.namedItem(field);
    if (element instanceof HTMLElement)
      element.setAttribute("aria-invalid", String(Boolean(errors[field])));
    const error = document.getElementById(`${field}-error`);
    if (error) error.textContent = errors[field] ?? "";
  }
};

const form = document.querySelector<HTMLFormElement>("#neighbor-triage");
const result = document.querySelector<HTMLElement>("#neighbor-message-result");
const status = document.querySelector<HTMLElement>("#neighbor-form-status");
let reference = "";
let started = false;
let completed = false;
let clicked = false;

document.querySelectorAll<HTMLAnchorElement>("[data-neighbor-cta]").forEach((link) => {
  link.addEventListener("click", () => {
    const service = link.dataset.service;
    const select = form?.elements.namedItem("service");
    if (service && select instanceof HTMLSelectElement) {
      select.value = service;
      if (result) result.hidden = true;
    }
    track("support_cta_click", {
      location: link.dataset.neighborCta,
      service,
    });
    if (link.dataset.neighborDirect === "true") {
      track("support_whatsapp_click", {
        location: link.dataset.neighborCta,
        variant: "neighbors",
        mode: "direct",
      });
    }
  });
});

form?.addEventListener("focusin", () => {
  if (!started) {
    track("support_triage_start", { variant: "neighbors" });
    started = true;
  }
});

form?.addEventListener("input", () => {
  if (result) result.hidden = true;
});

form?.addEventListener("submit", (event) => {
  event.preventDefault();
  const fields = ["device", "power", "service", "model", "problem"] as const;
  const data = new FormData(form);
  const input = Object.fromEntries(
    fields.map((key) => [key, String(data.get(key) ?? "")]),
  ) as unknown as NeighborIntake;
  const errors = validateNeighborIntake(input);
  paintErrors(form, fields, errors);
  const first = fields.find((field) => errors[field]);

  if (first) {
    if (result) result.hidden = true;
    if (status)
      status.textContent =
        "Revisa los campos indicados para preparar tu mensaje.";
    (form.elements.namedItem(first) as HTMLElement).focus();
    return;
  }

  reference ||= leadReference();
  const message = buildNeighborMessage(input, reference);
  const preview = document.getElementById("neighbor-message-preview");
  if (preview) preview.textContent = message;

  const link = document.querySelector<HTMLAnchorElement>("#neighbor-whatsapp-link");
  if (link) link.href = whatsappUrl(business.whatsapp, message);

  if (result) result.hidden = false;
  if (status)
    status.textContent = "Mensaje preparado. Revísalo antes de enviarlo.";
  preview?.focus();

  if (!completed) {
    track("support_triage_complete", {
      service: input.service,
      variant: "neighbors",
    });
    completed = true;
  }
});

document
  .querySelector("#neighbor-whatsapp-link")
  ?.addEventListener("click", () => {
    if (!clicked) {
      track("support_whatsapp_click", {
        location: "neighbors-form",
        variant: "neighbors",
      });
      clicked = true;
    }
  });

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) =>
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const name = (entry.target as HTMLElement).dataset
          .sectionEvent as EventName;
        if (eventNames.includes(name)) track(name, { variant: "neighbors" });
        observer.unobserve(entry.target);
      }),
    { threshold: 0.15 },
  );

  document.querySelectorAll("[data-section-event]").forEach((section) => {
    observer.observe(section);
  });
}

/* The sticky button must not cover the consultation form on small screens. */
const mobileCta = document.querySelector<HTMLElement>(".mobile-cta");
const contactSection = document.querySelector<HTMLElement>("#consulta");
if (mobileCta && contactSection && "IntersectionObserver" in window) {
  const stickyObserver = new IntersectionObserver(
    ([entry]) => mobileCta.classList.toggle("is-hidden", Boolean(entry?.isIntersecting)),
    { threshold: 0 },
  );
  stickyObserver.observe(contactSection);
}
