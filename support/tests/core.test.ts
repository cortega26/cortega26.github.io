import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  buildMessage,
  leadReference,
  validateIntake,
  whatsappUrl,
  type Intake,
} from "../src/lib/contact.ts";
import { attribution, safeDimensions } from "../src/lib/analytics.ts";
import { business, launchIssues } from "../src/config.ts";
const valid: Intake = {
  area: "nunoa",
  device: "Notebook",
  power: "Sí",
  service: "windows",
  model: "Prueba & modelo",
  problem: "No inicia después de actualizar. ¿Qué hago?",
};
test("WhatsApp preserves Spanish, punctuation and line breaks, without turning input into URL parameters", () => {
  const reference = leadReference();
  const message = buildMessage(
    { ...valid, problem: "A&B #fragment?text=otro <script>alert(1)</script>" },
    reference,
  );
  const url = new URL(whatsappUrl("56912345678", message));
  assert.equal(url.hostname, "wa.me");
  assert.equal(url.searchParams.size, 1);
  assert.equal(url.searchParams.get("text"), message);
  assert.ok(message.includes("Comuna: Ñuñoa"));
  assert.ok(message.includes(reference));
});
test("contact rejects missing, malformed and oversized data", () => {
  assert.equal(Object.keys(validateIntake(valid)).length, 0);
  for (const [key, value] of Object.entries({
    area: "fake",
    device: "fake",
    power: "fake",
    service: "fake",
    problem: "a",
    model: "a".repeat(101),
  })) {
    assert.ok(validateIntake({ ...valid, [key]: value })[key as keyof Intake]);
  }
  assert.throws(() =>
    buildMessage({ ...valid, problem: "x".repeat(601) }, leadReference()),
  );
  assert.throws(() => buildMessage(valid, "ref-with-PII"));
  for (const phone of ["", "+56912345678", "javascript:alert(1)", "569000"])
    assert.throws(() => whatsappUrl(phone, "Hola"));
});
test("attribution retains only known categories and strips arbitrary PII", () => {
  assert.deepEqual(
    attribution(
      "?utm_source=facebook&utm_medium=social&utm_campaign=local&utm_content=nunoa",
    ),
    {
      source: "facebook",
      medium: "social",
      campaign: "local",
      content: "nunoa",
    },
  );
  const malicious =
    "?utm_source=persona@example.com&utm_content=calle-123&email=secret@example.com&problem=private";
  assert.deepEqual(attribution(malicious), {
    source: "other",
    medium: "none",
    campaign: "none",
    content: "none",
  });
  assert.deepEqual(
    safeDimensions({
      ...valid,
      email: "secret",
      location: "hero",
      source: "google",
      lead_ref: "secret",
    }),
    { location: "hero", service: "windows", source: "google" },
  );
});
test("unconfirmed business facts cannot be released", () => {
  assert.ok(launchIssues().length > 5);
  const complete = {
    ...business,
    whatsapp: "56912345678",
    email: "test@example.com",
    payment: "Test",
    taxDocument: "Test",
    providenciaSectors: "Test",
    retention: "Test",
    photo: "/test.webp",
    analyticsId: "G-TEST123",
    confirmed: {
      prices: true,
      coverage: true,
      scope: true,
      tax: true,
      terms: true,
      privacy: true,
    },
    verified: { realPhone: true, analytics: true, portrait: true },
  };
  assert.deepEqual(launchIssues(complete), []);
  assert.ok(
    launchIssues({
      ...complete,
      confirmed: { ...complete.confirmed, prices: false },
    }).includes("Confirmar prices"),
  );
});
test("preview output stays unindexed and has no live outbound WhatsApp", () => {
  const html = readFileSync("support/dist/index.html", "utf8");
  assert.match(html, /noindex, nofollow/);
  assert.match(html, /https:\/\/soporte.tooltician.com\//);
  assert.doesNotMatch(html, /href="https:\/\/wa.me\//);
  assert.equal((html.match(/<h1\b/g) ?? []).length, 1);
  assert.match(readFileSync("support/dist/robots.txt", "utf8"), /Disallow: \//);
});
