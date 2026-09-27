import { serve } from "./server.mjs";
const { chromium, firefox, webkit } = await import(
  process.env.SUPPORT_PLAYWRIGHT_MODULE || "playwright"
);
import { mkdir, readFile } from "node:fs/promises";
import assert from "node:assert/strict";
const base = "http://127.0.0.1:4331";
const server = await serve("support/dist");
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
  const headersText = await readFile("support/public/_headers", "utf8");
  const csp = headersText.match(/Content-Security-Policy: (.+)/)?.[1];
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
    await context.route("**/*", async (route) => {
      if (!route.request().url().startsWith(base)) {
        external.push(route.request().url());
        return route.abort();
      }
      const response = await route.fetch();
      await route.fulfill({
        response,
        headers: { ...response.headers(), "content-security-policy": csp },
      });
    });
    await page.goto(
      `${base}/?utm_source=secret@example.com&problem=DO-NOT-LEAK`,
    );
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
    assert.deepEqual(errors, [], `${name} browser errors`);
    console.log(`PASS ${name}: form, escaping, keyboard, privacy, navigation`);
    await browser.close();
    browser = undefined;
  }
} finally {
  await browser?.close();
  await new Promise((resolve) => server.close(resolve));
}
