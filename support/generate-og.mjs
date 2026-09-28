// Reproducible typographic share image; no stock person or fabricated endorsement.
import { business } from "./src/config.ts";
import { mkdir } from "node:fs/promises";
const { chromium } = await import(
  process.env.SUPPORT_PLAYWRIGHT_MODULE || "playwright"
);
const browser = await chromium.launch();
try {
  const page = await browser.newPage({
    viewport: { width: 1200, height: 630 },
    deviceScaleFactor: 1,
  });
  const escapeHtml = (text) =>
    text.replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
  await page.setContent(
    `<html lang="es"><body style="margin:0;background:#faf9f5;color:#172b29;font-family:Arial,sans-serif;padding:64px 74px;box-sizing:border-box;height:630px;border-bottom:18px solid #205c48"><div style="font-size:28px;font-weight:bold">${escapeHtml(business.name)}</div><div style="font-size:17px;letter-spacing:3px;margin-top:44px;color:#52645f">MACUL · ÑUÑOA · PROVIDENCIA</div><h1 style="font-size:72px;font-weight:600;line-height:1.08;letter-spacing:-3px;margin:25px 0">Tu computador debería<br><span style="font-family:Georgia,serif;font-weight:400">hacerte la vida fácil.</span></h1><p style="font-size:25px;color:#52645f;margin-top:30px">Soporte técnico a domicilio. Diagnóstico primero.</p><p style="font-size:19px;margin-top:30px">soporte.tooltician.com</p></body></html>`,
  );
  await mkdir("support/public", { recursive: true });
  await page.screenshot({ path: "support/public/og-card.png" });
} finally {
  await browser.close();
}
