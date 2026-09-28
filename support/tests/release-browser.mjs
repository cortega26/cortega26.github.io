// Production-mode fixture is created under ignored output/, never in real config.
// Outbound requests are intercepted: no real message or analytics event is sent.
import { cp, mkdir, readFile, writeFile, rm } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import assert from "node:assert/strict";
import { serve } from "./server.mjs";
const { chromium } = await import(
  process.env.SUPPORT_PLAYWRIGHT_MODULE || "playwright"
);
const root = "output/support-fixture";
// The real portrait is the one fact the fixture must not invent: the page
// imports it through astro:assets, so the fixture build needs a real image.
const portrait = "src/assets/carlos-ortega.jpeg";
await rm(root, { recursive: true, force: true });
await mkdir(root, { recursive: true });
await cp("support/src", `${root}/src`, { recursive: true });
await mkdir(`${root}/src/assets`, { recursive: true });
await cp(`support/${portrait}`, `${root}/${portrait}`);
await cp("support/public", `${root}/public`, { recursive: true });
await cp("public/fonts", "output/public/fonts", { recursive: true });
await cp("support/astro.config.ts", `${root}/astro.config.ts`);
await cp("support/tsconfig.json", `${root}/tsconfig.json`);
await writeFile(
  `${root}/src/config.ts`,
  (await readFile(`${root}/src/config.ts`, "utf8")) +
    `
Object.assign(business, {
  whatsapp: '56912345678', email: 'fixture@example.com', photo: '${portrait}',
  payment: 'Fixture', taxRegime: 'Fixture', retention: 'Fixture', analyticsId: 'G-FIXTURE123',
  confirmed: { prices:true, coverage:true, scope:true, tax:true, terms:true, privacy:true },
  verified: { realPhone:true, analytics:true, portrait:true }
});\n`,
);
execFileSync(
  process.execPath,
  ["node_modules/astro/bin/astro.mjs", "build", "--root", root],
  { env: { ...process.env, SUPPORT_RELEASE: "1" }, stdio: "pipe" },
);
const html = await readFile(`${root}/dist/index.html`, "utf8");
assert.match(html, /index, follow/);
assert.doesNotMatch(html, /noindex/);
assert.match(
  html,
  /alt="Carlos Ortega, responsable de Tooltician Soporte"/,
  "Release build ships the real portrait",
);
assert.match(
  await readFile(`${root}/dist/robots.txt`, "utf8"),
  /sitemap-index.xml/,
);
assert.match(
  await readFile(`${root}/dist/sitemap-0.xml`, "utf8"),
  /https:\/\/soporte.tooltician.com\//,
);
const server = await serve(`${root}/dist`, 4332);
const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  const external = [];
  await page.route("**/*", (route) => {
    if (route.request().url().startsWith("http://127.0.0.1:4332"))
      return route.continue();
    external.push(route.request().url());
    return route.fulfill({
      status: 200,
      contentType: "text/javascript",
      body: "",
    });
  });
  await page.goto(
    "http://127.0.0.1:4332/?utm_source=facebook&utm_medium=social&utm_content=secret@example.com",
  );
  assert.deepEqual(external, [], "No external library before consent");
  await page.click('[data-consent="yes"]');
  await page.selectOption("#area", "macul");
  await page.selectOption("#device", "Notebook");
  await page.selectOption("#power", "No");
  await page.fill("#problem", "PRIVATE-CUSTOMER-DESCRIPTION");
  await page.getByRole("button", { name: "Revisar mi mensaje" }).click();
  await page.getByRole("button", { name: "Revisar mi mensaje" }).click();
  const href = await page.locator("#whatsapp-link").getAttribute("href");
  assert.match(href, /^https:\/\/wa.me\/56912345678\?text=/);
  assert.match(
    new URL(href).searchParams.get("text"),
    /PRIVATE-CUSTOMER-DESCRIPTION/,
  );
  // Prevent navigation/popups but exercise the real click handler twice.
  await page
    .locator("#whatsapp-link")
    .evaluate((link) =>
      link.addEventListener("click", (e) => e.preventDefault()),
    );
  await page.click("#whatsapp-link");
  await page.click("#whatsapp-link");
  const events = await page.evaluate(() =>
    window.dataLayer.map((x) => Array.from(x)),
  );
  const serialized = JSON.stringify(events);
  for (const secret of [
    "PRIVATE-CUSTOMER-DESCRIPTION",
    "secret@example.com",
    "56912345678",
    "TS-",
  ])
    assert.ok(!serialized.includes(secret), `No ${secret} in GA4 queue`);
  for (const name of [
    "support_page_view",
    "support_triage_complete",
    "support_whatsapp_click",
  ])
    assert.equal(
      events.filter((e) => e[0] === "event" && e[1] === name).length,
      1,
      `Exactly one ${name}`,
    );
  assert.ok(events.some((e) => e[0] === "event" && e[2].source === "facebook"));
  await page.click('[data-consent="no"]');
  await page.waitForLoadState("load");
  assert.equal(
    await page.evaluate(() =>
      localStorage.getItem("support-analytics-consent-v1"),
    ),
    "no",
  );
  assert.equal(
    await page.evaluate(() => typeof window.dataLayer),
    "undefined",
    "Reload revokes loaded tracker",
  );
  console.log(
    "PASS release fixture: indexability, sitemap, WhatsApp, consent, no PII, exact event counts",
  );
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}
