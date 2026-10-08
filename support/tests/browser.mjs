import { serve } from "./server.mjs";
const { chromium, firefox, webkit } = await import(
  process.env.SUPPORT_PLAYWRIGHT_MODULE || "playwright"
);
import { mkdir } from "node:fs/promises";
import assert from "node:assert/strict";
const base = "http://127.0.0.1:4331";
// The loopback harness drops only `upgrade-insecure-requests` from the served
// CSP so WebKit stops upgrading asset requests to HTTPS. Nothing is proxied:
// same-origin responses come straight from the server, which keeps the real
// production CSP intact and leaves no request in flight when the browser closes.
const server = await serve("support/dist", 4331, { loopbackHarness: true });
const output = "output/support";
await mkdir(output, { recursive: true });
let browser;
try {
  let ready = false;
  for (let i = 0; i < 100; i++) {
    try {
      if ((await fetch(base)).ok) {
        ready = true;
        break;
      }
    } catch {}
    await new Promise((r) => setTimeout(r, 100));
  }
  assert.ok(ready, "preview server started");
  for (const [name, engine] of [
    ["chromium", chromium],
    ["firefox", firefox],
    ["webkit", webkit],
  ]) {
    if (
      process.env.SUPPORT_BROWSERS &&
      !process.env.SUPPORT_BROWSERS.split(",").includes(name)
    )
      continue;
    browser = await engine.launch({ timeout: 20000 });
    const context = await browser.newContext();
    const errors = [];
    const external = [];
    const page = await context.newPage();
    page.on("pageerror", (e) => errors.push(e.message));
    await context.route("**/*", (route) => {
      if (!route.request().url().startsWith(base)) {
        external.push(route.request().url());
        return route.abort();
      }
      return route.continue();
    });
    await page.goto(
      `${base}/?utm_source=secret@example.com&problem=DO-NOT-LEAK`,
    );
    const servedCsp = await page.evaluate(async () => {
      const response = await fetch(location.href);
      return response.headers.get("content-security-policy");
    });
    assert.ok(servedCsp, "CSP served to the browser");
    assert.doesNotMatch(servedCsp, /upgrade-insecure-requests/);
    for (const directive of [
      "default-src 'self'",
      "frame-ancestors 'none'",
      "object-src 'none'",
      "form-action 'none'",
    ])
      assert.ok(servedCsp.includes(directive), `CSP keeps ${directive}`);
    if (name === "chromium") {
      for (const width of [360, 390, 412, 768, 1440]) {
        await page.setViewportSize({ width, height: 950 });
        await page.evaluate(() => document.fonts.ready);
        assert.ok(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
          `No horizontal overflow at ${width}`,
        );
        await page.screenshot({
          path: `${output}/${width}.png`,
          fullPage: true,
        });
      }
    }
    await page.setViewportSize({ width: 390, height: 844 });
    await page.locator('[data-service="upgrade"]').click();
    assert.equal(await page.locator("#service").inputValue(), "upgrade");
    await page.getByRole("button", { name: "Revisar mi mensaje" }).click();
    assert.equal(await page.locator(":focus").getAttribute("id"), "area");
    assert.equal(
      await page.locator("#area").getAttribute("aria-invalid"),
      "true",
    );
    await page.selectOption("#area", "nunoa");
    await page.selectOption("#device", "Notebook");
    await page.selectOption("#power", "Sí");
    await page.fill("#model", "Modelo de prueba");
    await page.fill("#problem", "PRIVATE: no inicia <script>alert(1)</script>");
    await page.getByRole("button", { name: "Revisar mi mensaje" }).click();
    assert.ok(await page.locator("#message-result").isVisible());
    assert.match(
      await page.locator("#message-preview").textContent(),
      /PRIVATE: no inicia <script>/,
    );
    assert.match(await page.locator("#message-preview").textContent(), /Ñuñoa/);
    assert.equal(await page.locator("#message-preview script").count(), 0);
    const before = await page.locator("#message-preview").textContent();
    await page.getByRole("button", { name: "Revisar mi mensaje" }).click();
    assert.equal(await page.locator("#message-preview").textContent(), before);
    await page.fill("#problem", "Changed problem");
    assert.ok(
      await page.locator("#message-result").isHidden(),
      "editing invalidates prepared message",
    );
    assert.deepEqual(
      external,
      [],
      "no external network, analytics or form submissions before consent",
    );
    // Positive control: routing stays armed. This URL is allowed by the CSP
    // `connect-src`, so only the harness can stop it: the request must be
    // recorded and aborted without ever leaving the machine.
    const probe = "https://www.googletagmanager.com/gtag/js?id=G-HARNESS-PROBE";
    assert.equal(
      await page.evaluate(
        (url) => fetch(url).then(() => "reached").catch(() => "blocked"),
        probe,
      ),
      "blocked",
    );
    assert.ok(external.includes(probe), "outbound request detected and blocked");
    assert.equal(
      await page.evaluate(() => localStorage.length),
      0,
      "no query retention",
    );
    for (const path of ["/privacidad/", "/condiciones-del-servicio/"]) {
      const response = await page.goto(base + path);
      assert.equal(response.status(), 200);
      assert.equal(await page.locator("h1").count(), 1);
    }
    await page.goto(base);
    await page.keyboard.press("Tab");
    assert.equal(await page.locator(":focus").textContent(), "Ir al contenido");
    await page.keyboard.press("Enter");
    assert.ok(page.url().endsWith("#main"));
    await page.locator("summary").first().focus();
    await page.keyboard.press("Enter");
    assert.ok(
      (await page.locator("details").first().getAttribute("open")) !== null,
    );
    // Residents preview: no outbound booking, but a usable guided message.
    await page.goto(base + "/vecinos/");
    if (name === "chromium") {
      for (const width of [390, 1440]) {
        await page.setViewportSize({ width, height: 950 });
        await page.evaluate(() => document.fonts.ready);
        assert.ok(
          await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
          `Neighbors: no horizontal overflow at ${width}`,
        );
        await page.screenshot({
          path: `${output}/neighbors-${width}.png`,
          fullPage: true,
        });
      }
      await page.setViewportSize({ width: 390, height: 844 });
    }
    assert.match(await page.locator("h1").innerText(), /falla o no enciende/i);
    assert.equal(await page.locator(".neighbor-testimonial").count(), 3);
    assert.match(await page.locator("#experiencias").innerText(), /Greily Molina/);
    assert.equal(await page.locator("#neighbor-whatsapp-link").count(), 1);
    await page.locator('[data-neighbor-cta="services"][data-service="upgrade"]').click();
    assert.equal(await page.locator("#neighbor-triage #service").inputValue(), "upgrade");
    await page.locator("#consulta").scrollIntoViewIfNeeded();
    await page.waitForFunction(
      () => getComputedStyle(document.querySelector(".mobile-cta")).display === "none",
      undefined,
      { timeout: 5000 },
    );
    await page.getByRole("button", { name: "Preparar mensaje para consultar" }).click();
    assert.equal(await page.locator(":focus").getAttribute("id"), "device");
    await page.selectOption("#neighbor-triage #device", "Notebook");
    await page.selectOption("#neighbor-triage #power", "Sí");
    await page.fill("#neighbor-triage #problem", "El computador se reinicia sin aviso.");
    await page.getByRole("button", { name: "Preparar mensaje para consultar" }).click();
    assert.ok(await page.locator("#neighbor-message-result").isVisible());
    assert.match(
      await page.locator("#neighbor-message-preview").innerText(),
      /soy vecino\/a del edificio/i,
    );
    assert.match(await page.locator("#neighbor-whatsapp-link").getAttribute("href"), /^https:\/\/wa\.me\//);
    await page.fill("#neighbor-triage #problem", "Un síntoma distinto.");
    assert.ok(await page.locator("#neighbor-message-result").isHidden());
    assert.deepEqual(errors, [], `${name} browser errors`);

    console.log(`PASS ${name}: form, escaping, keyboard, privacy, navigation`);
    await browser.close();
    browser = undefined;
  }
} finally {
  await browser?.close();
  await new Promise((resolve) => server.close(resolve));
}
