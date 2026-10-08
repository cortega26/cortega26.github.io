import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Tests over the built site. They read support/dist and never produce it:
 * the dependency is declared by support:verify (check -> unit -> build -> artifact).
 */
const dist = join(import.meta.dirname, "..", "dist");
const artifacts = ["index.html", "robots.txt", join("vecinos", "index.html")];
const missing = artifacts.filter((file) => !existsSync(join(dist, file)));
const requiresBuild = missing.length
  ? `requiere npm run support:build (falta ${missing.map((f) => `dist/${f}`).join(", ")}); ejecuta npm run support:verify`
  : false;

test("preview output stays unindexed and has no live outbound WhatsApp", { skip: requiresBuild }, () => {
  const html = readFileSync(join(dist, "index.html"), "utf8");
  assert.match(html, /noindex, nofollow/);
  assert.match(html, /https:\/\/soporte.tooltician.com\//);
  assert.doesNotMatch(html, /href="https:\/\/wa.me\//);
  assert.equal((html.match(/<h1\b/g) ?? []).length, 1);
  assert.match(readFileSync(join(dist, "robots.txt"), "utf8"), /Disallow: \//);
  assert.match(html, /Vista previa/);
  assert.doesNotMatch(
    html,
    /googletagmanager|google-analytics|G-[A-Z0-9]{6,}/,
    "Preview ships no real measurement",
  );
});

test("built page ships the optimized portrait with sober alt text and no placeholder", { skip: requiresBuild }, () => {
  const html = readFileSync(join(dist, "index.html"), "utf8");
  assert.match(html, /<img[^>]+src="\/_astro\/[^"]*carlos-ortega[^"]*"/);
  assert.match(html, /alt="Carlos Ortega, responsable de Tooltician Soporte"/);
  assert.match(html, /srcset="[^"]+"/);
  assert.match(html, /sizes="\(max-width: 760px\) 320px, 370px"/);
  assert.match(html, /960w/);
  assert.match(html, /800w/);
  assert.doesNotMatch(html, /identity-monogram/);
});

test("support uses the Tooltician brand mark instead of the provisional t. monogram", { skip: requiresBuild }, () => {
  const html = readFileSync(join(dist, "index.html"), "utf8");
  assert.match(html, /tooltician-logo-64\.webp/);
  assert.match(html, /tooltician-logo-128\.webp/);
  assert.doesNotMatch(html, /<span class="brand-mark"[^>]*>t\.<\/span>/);
  assert.doesNotMatch(html, /<span class="screen-brand">t\.<\/span>/);
  assert.ok(existsSync(join(dist, "tooltician-logo-64.webp")), "64px Tooltician logo ships");
  assert.ok(existsSync(join(dist, "tooltician-logo-128.webp")), "128px Tooltician logo ships");
  assert.match(readFileSync(join(dist, "favicon.svg"), "utf8"), /data:image\/webp;base64,/);
});

test("published prices are final and never promise or add tax", { skip: requiresBuild }, () => {
  const conditions = readFileSync(join(dist, "condiciones-del-servicio", "index.html"), "utf8");
  assert.match(conditions, /Registro de Personas Naturales que desarrollan Actividades de Subsistencia del SII/);
  assert.match(conditions, /lo libera de emitir boletas y del IVA/);
  for (const page of ["index.html", join("privacidad", "index.html"), join("condiciones-del-servicio", "index.html")]) {
    const html = readFileSync(join(dist, page), "utf8");
    assert.doesNotMatch(
      html,
      /m[áa]s\s+IVA|\+\s*IVA|IVA\s+incluido|impuestos aplicables/i,
      `${page} must not add or promise tax`,
    );
    assert.doesNotMatch(html, /documento tributario pendiente/i);
  }
  const home = readFileSync(join(dist, "index.html"), "utf8");
  for (const price of ["$30.000", "$35.000", "$40.000", "$45.000", "$25.000"])
    assert.ok(home.includes(price), `home lists ${price}`);
});

test("search metadata matches the real intent and social tags are complete", { skip: requiresBuild }, () => {
  const html = readFileSync(join(dist, "index.html"), "utf8");
  assert.match(html, /<title>Técnico de computadores a domicilio \| Macul, Ñuñoa y Providencia<\/title>/);
  assert.equal((html.match(/<h1\b/g) ?? []).length, 1);
  assert.match(html, /<h1>Servicio técnico de<[^>]*> <em>computadores a domicilio\.<\/em><\/h1>/);
  for (const commune of ["Macul", "Ñuñoa", "Providencia"])
    assert.ok(html.includes(commune), `title/hero mentions ${commune}`);
  assert.match(
    html,
    /<link rel="canonical" href="https:\/\/soporte\.tooltician\.com\/"/,
    "canonical stays production even in noindex preview",
  );
  const description = html.match(/<meta name="description" content="([^"]*)"/)?.[1] ?? "";
  assert.ok(description.length > 90 && description.length < 200, "description length is usable");
  assert.match(description, /PC y notebooks/);
  for (const tag of [
    'property="og:site_name"',
    'property="og:image"',
    'property="og:image:width" content="1200"',
    'property="og:image:height" content="630"',
    'property="og:image:alt"',
    'name="twitter:card"',
    'name="twitter:title"',
    'name="twitter:description"',
    'name="twitter:image"',
  ])
    assert.ok(html.includes(tag), `missing ${tag}`);
});

test("structured data is valid, truthful and declares no address or ratings", { skip: requiresBuild }, () => {
  const html = readFileSync(join(dist, "index.html"), "utf8");
  const raw = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1];
  assert.ok(raw, "JSON-LD block present");
  const data = JSON.parse(raw);
  assert.equal(data["@context"], "https://schema.org");
  assert.equal(data["@type"], "Organization", "no LocalBusiness without a public address");
  assert.equal(data.telephone, "+56951118901");
  assert.equal(data.email, "carlos@tooltician.com");
  assert.equal(data.logo, "https://soporte.tooltician.com/favicon.svg");
  assert.equal(data.founder["@type"], "Person");
  assert.ok(data.founder.sameAs.length >= 3);
  assert.deepEqual(
    data.areaServed.map((area: { name: string }) => area.name),
    ["Macul", "Ñuñoa", "Providencia"],
  );
  const contact = data.contactPoint[0];
  assert.equal(contact.contactType, "customer service");
  assert.equal(contact.telephone, "+56951118901");
  assert.equal(contact.availableLanguage, "es-CL");
  const serialised = raw.toLowerCase();
  for (const forbidden of [
    "postaladdress",
    "streetaddress",
    "aggregaterating",
    '"review"',
    "vatid",
    "openinghours",
    "pricerange",
  ])
    assert.ok(!serialised.includes(forbidden), `schema must not contain ${forbidden}`);
  assert.doesNotMatch(
    html,
    /domicilio particular|direcci[óo]n particular|atiendo p[uú]blico en/i,
    "no residential address framing in the output",
  );
});

test("preview copy offers consumers only and never claims proposed prices", { skip: requiresBuild }, () => {
  const html = readFileSync(join(dist, "index.html"), "utf8");
  assert.match(html, /¿Atiendes empresas\?/);
  assert.match(html, /exclusivamente a consumidores finales/);
  assert.doesNotMatch(html, /Precios propuestos/);
  assert.doesNotMatch(html, /oficina pequeña/i);
  assert.doesNotMatch(html, /oficinas? se evalu/, "an office must not read as evaluable");
  assert.match(html, /Vista previa · Servicio aún no abierto a reservas/);
  assert.match(html, /Atención personal por Carlos Ortega/);
  assert.match(html, /Transferencia, efectivo o tarjeta · mismo precio/);
  assert.match(
    html,
    /no necesitas trasladar tu equipo a un taller/,
    "coverage states customer value, not a legal aside",
  );
  assert.doesNotMatch(html, /No hay atención de público en una dirección particular/);
});


test("neighbors evaluation page stays private and preserves the agreed offer", { skip: requiresBuild }, () => {
  const html = readFileSync(join(dist, "vecinos", "index.html"), "utf8");
  assert.match(html, /<meta name="robots" content="noindex, nofollow"/);
  assert.match(html, /Exclusivo para vecinos del edificio/i);
  assert.match(html, /alt="Carlos Ortega, responsable de Tooltician Soporte"/);
  assert.match(html, /sizes="\(max-width: 760px\) 320px, 370px"/);
  assert.match(html, /960w/);
  assert.match(html, /800w/);
  assert.match(html, /¿Tu computador está lento,[\s\S]*falla o no enciende/i);
  assert.match(html, /\$20\.000/);
  assert.match(html, /\$30\.000/);
  assert.match(html, /\$35\.000/);
  assert.match(html, /\$25\.000/);
  assert.match(html, /\$15\.000/);
  assert.match(html, /\$10\.000 menos/i);
  assert.match(html, /diagnóstico se descuenta/i);
  assert.match(html, /estimación para la revisión inicial/i);
  assert.match(html, /Identidad verificable/i);
  assert.match(html, /ubicación exacta se comparte por privado/i);
  assert.match(html, /EJEMPLO CON PRECIOS PUBLICADOS/i);
  assert.match(html, /no \$50\.000/i, "example must explain that diagnosis is credited");
  assert.match(html, /Trabajo documentado/i);
  assert.match(html, /¿Qué recibo cuando termina el trabajo\?/i);
  assert.match(html, /Esta variante está en evaluación/i);
  assert.match(html, /Describir mi problema/i);
  assert.doesNotMatch(html, /data-neighbor-direct="true"/, "preview must not expose direct booking");
  assert.doesNotMatch(html, /No voy a experimentar con tu equipo/i);
  assert.doesNotMatch(html, /Sin plazo artificial/i);
  assert.doesNotMatch(html, /Wi-Fi e impresoras<\/h3>/);
  assert.doesNotMatch(html, /href="https:\/\/wa\.me\//);
  assert.doesNotMatch(html, /Macul · Ñuñoa · Providencia/);
  assert.doesNotMatch(html, /streetAddress|PostalAddress/i);
  assert.equal((html.match(/<h1\b/g) ?? []).length, 1);
});
