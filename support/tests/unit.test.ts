import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { serve } from "./server.mjs";
import {
  buildMessage,
  leadReference,
  validateIntake,
  whatsappUrl,
  type Intake,
} from "../src/lib/contact.ts";
import { attribution, safeDimensions } from "../src/lib/analytics.ts";
import {
  basePrice,
  business,
  hardLaunchIssues,
  softLaunchIssues,
} from "../src/config.ts";
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
const complete = {
  ...business,
  whatsapp: "56912345678",
  email: "test@example.com",
  payment: "Test",
  taxRegime: "Test",
  photo: "src/assets/test.webp",
  analyticsId: "G-TEST123",
  reviewUrl: "https://example.com/r",
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
test("unconfirmed business facts cannot be released", () => {
  assert.ok(
    hardLaunchIssues().length > 0,
    "the real configuration is still not releasable",
  );
  assert.deepEqual(hardLaunchIssues(complete), []);
  assert.deepEqual(softLaunchIssues(complete), []);
  assert.ok(
    hardLaunchIssues({
      ...complete,
      confirmed: { ...complete.confirmed, prices: false },
    }).includes("Confirmar prices"),
  );
});
test("coverage is exactly the three confirmed communes at the confirmed visit rates", () => {
  assert.deepEqual(
    business.areas.map((area) => area.name),
    ["Macul", "Ñuñoa", "Providencia"],
  );
  assert.deepEqual(
    Object.fromEntries(business.areas.map((area) => [area.id, area.price])),
    { macul: 25000, nunoa: 25000, providencia: 30000 },
  );
  assert.equal(basePrice(), 25000);
  assert.equal(
    business.areas.some((area) => /sector/i.test(area.name)),
    false,
    "coverage is not sector-conditional",
  );
});
test("payment carries no surcharge and the visit credit policy stays active", () => {
  assert.match(business.payment, /transferencia/i);
  assert.match(business.payment, /efectivo/i);
  assert.match(business.payment, /tarjeta/i);
  assert.doesNotMatch(business.payment, /[0-9]+\s*%|recargo|comisi[oó]n/i);
  assert.equal(business.visitCredit, true);
});
test("retention states the confirmed windows and never stores passwords", () => {
  assert.match(business.retention, /90 d[ií]as/);
  assert.match(business.retention, /12 meses/);
  assert.match(business.retention, /contraseñas/i);
  assert.match(business.retention, /obligaciones? legales/i);
  const triage = readFileSync(
    join(import.meta.dirname, "..", "src", "client.ts"),
    "utf8",
  );
  assert.doesNotMatch(
    triage,
    /localStorage|sessionStorage|indexedDB|document\.cookie/,
    "the browser keeps no trace of the customer's data",
  );
});
test("only the real phone test still blocks a release", () => {
  assert.deepEqual(hardLaunchIssues(), [
    "Verificar realPhone (prueba desde un teléfono real)",
  ]);
  for (const resolved of [
    "payment",
    "retention",
    "taxRegime",
    "Confirmar tax",
    "Confirmar coverage",
    "Confirmar scope",
    "Confirmar terms",
    "Confirmar privacy",
  ])
    assert.ok(
      !hardLaunchIssues().some((issue) => issue.includes(resolved)),
      `${resolved} must no longer block`,
    );
  assert.deepEqual(
    hardLaunchIssues({ ...complete, verified: { ...complete.verified, realPhone: true } }),
    [],
    "a verified phone leaves nothing hard",
  );
  assert.ok(
    hardLaunchIssues({
      ...complete,
      verified: { ...complete.verified, realPhone: false },
    }).length > 0,
    "an unverified phone must block",
  );
  assert.ok(
    !hardLaunchIssues({ ...complete, analyticsId: "" }).length,
    "GA4 stays soft",
  );
  assert.ok(
    hardLaunchIssues({ ...complete, taxRegime: "" }).includes("taxRegime"),
    "an unstated tax regime still blocks",
  );
});
test("the tax status states the subsistence registry without inventing a document", () => {
  assert.equal(business.confirmed.tax, true);
  assert.match(business.taxRegime, /Registro de Actividades de Subsistencia del SII/);
  assert.match(business.taxRegime, /[Ee]xonerado de IVA/);
  assert.match(business.taxRegime, /liberado de emitir boletas/);
  assert.doesNotMatch(business.taxRegime, /pendiente/i);
  assert.doesNotMatch(
    `${business.taxRegime} ${business.payment}`,
    /factura|\d+\s*%|\+\s*IVA/i,
    "no invoice or VAT surcharge may be implied",
  );
  assert.deepEqual(
    business.areas.map((area) => area.price),
    [25000, 25000, 30000],
    "the regime adds no tax to the visit prices",
  );
});
test("measurement never blocks a release, legal and contact facts always do", () => {
  const unmeasured = {
    ...complete,
    analyticsId: "",
    reviewUrl: "",
    verified: { ...complete.verified, analytics: false },
  };

  assert.deepEqual(hardLaunchIssues(unmeasured), []);
  assert.deepEqual(softLaunchIssues(unmeasured), [
    "Identificador GA4",
    "Verificar analytics (eventos recibidos en GA4)",
    "reviewUrl",
  ]);
  assert.deepEqual(hardLaunchIssues({ ...complete, analyticsId: "G-ANY" }), []);
  for (const [key, value] of [
    ["taxRegime", ""],
    ["retention", ""],
    ["payment", ""],
    ["email", ""],
    ["whatsapp", "569"],
    ["reviewUrl", ""],
  ] as const) {
    const config = { ...complete, [key]: value };
    const issues = hardLaunchIssues(config);
    if (key === "reviewUrl") assert.deepEqual(issues, [], "reviewUrl is soft");
    else assert.ok(issues.length > 0, `${key} stays a hard blocker`);
  }
  assert.ok(
    hardLaunchIssues({ ...complete, verified: { ...complete.verified, realPhone: false } }).includes(
      "Verificar realPhone (prueba desde un teléfono real)",
    ),
  );
});
test("the verified portrait flag is backed by the declared asset", () => {
  assert.equal(business.verified.portrait, true);
  assert.ok(
    existsSync(join(import.meta.dirname, "..", business.photo)),
    `${business.photo} must exist to count as verified`,
  );
});
async function cspFromServer(
  port: number,
  options?: { loopbackHarness?: boolean },
): Promise<string> {
  const server = await serve("support/public", port, options);
  try {
    // An existing asset, so a 404 can never pass silently as "no CSP".
    const response = await fetch(`http://127.0.0.1:${port}/favicon.svg`);
    assert.equal(response.status, 200, "fixture asset is served");
    return response.headers.get("content-security-policy") ?? "";
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}
test("the default server serves the production CSP untouched", async () => {
  const csp = await cspFromServer(4341);
  const committed = (
    await readFile(
      join(import.meta.dirname, "..", "public", "_headers"),
      "utf8",
    )
  ).match(/Content-Security-Policy: (.+)/)?.[1];
  assert.equal(csp, committed, "byte for byte identical to _headers");
  assert.match(csp, /;\s*upgrade-insecure-requests$/);
});
test("the loopback harness drops only upgrade-insecure-requests", async () => {
  const production = await cspFromServer(4342);
  const harness = await cspFromServer(4343, { loopbackHarness: true });
  assert.doesNotMatch(harness, /upgrade-insecure-requests/);
  assert.equal(
    harness,
    production.replace(/;\s*upgrade-insecure-requests\b/, ""),
    "no other directive may change",
  );
  for (const directive of [
    "default-src 'self'",
    "script-src 'self' https://www.googletagmanager.com",
    "frame-ancestors 'none'",
    "object-src 'none'",
    "base-uri 'none'",
    "form-action 'none'",
  ])
    assert.ok(harness.includes(directive), `CSP keeps ${directive}`);
});
