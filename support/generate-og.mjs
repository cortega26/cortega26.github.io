// Deterministic Facebook/Open Graph card, generated from the verified owner photo.
// No generative likeness or third-party image URLs are included in production.
import sharp from "sharp";
import { readFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { business, basePrice, money } from "./src/config.ts";

const WIDTH = 1200;
const HEIGHT = 630;
const outputFile = join("support", "public", "og-card-v2.png");
const portraitFile = new URL("./src/assets/carlos-ortega-hq.webp", import.meta.url);
const portrait = await sharp(await readFile(portraitFile))
  .resize(362, 408, { fit: "cover", position: "attention" })
  .png()
  .toBuffer();

const safe = (value) =>
  String(value).replace(/[&<>"']/g, (character) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[character],
  );

const areas = business.areas.map((area) => area.name.toUpperCase()).join("  ·  ");
const lowestPrice = money(basePrice());
const otherPrice = business.areas.find((area) => area.price > basePrice());

const svg = [
  '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">',
  '<defs>',
  '  <clipPath id="portrait-clip"><rect x="805" y="91" width="362" height="408" rx="23"/></clipPath>',
  '  <linearGradient id="green" x1="0" x2="1" y1="0" y2="1"><stop stop-color="#174e3e"/><stop offset="1" stop-color="#0c2924"/></linearGradient>',
  '</defs>',
  '<rect width="1200" height="630" fill="#faf9f5"/>',
  '<rect x="772" width="428" height="630" fill="url(#green)"/>',
  '<circle cx="1183" cy="95" r="185" fill="none" stroke="#87b19c" stroke-opacity=".14" stroke-width="2"/>',
  '<circle cx="1190" cy="95" r="216" fill="none" stroke="#87b19c" stroke-opacity=".1" stroke-width="2"/>',
  '<rect x="68" y="57" width="49" height="49" rx="13" fill="#205c48"/>',
  '<rect x="80" y="69" width="25" height="18" rx="2" fill="none" stroke="#fff" stroke-width="2.5"/>',
  '<path d="M76 94h34l-5 4H81z" fill="#fff"/>',
  '<g font-family="Arial,DejaVu Sans,sans-serif" fill="#172b29">',
  ' <text x="133" y="91" font-size="29" font-weight="700">Tooltician</text>',
  ' <text x="278" y="90" font-size="20" font-weight="600" letter-spacing="2" fill="#205c48">SOPORTE</text>',
  ' <text x="72" y="156" font-size="17" font-weight="700" letter-spacing="2.1" fill="#4b6b60">' + safe(areas) + '</text>',
  ' <text x="69" y="232" font-size="64" font-weight="750" letter-spacing="-2.1">¿Tu computador</text>',
  ' <text x="69" y="309" font-size="64" font-weight="750" letter-spacing="-2.1">está lento o</text>',
  ' <text x="69" y="386" font-size="64" font-weight="750" letter-spacing="-2.1">fallando?</text>',
  ' <text x="72" y="435" font-size="24" font-weight="600">Soporte técnico para PC y notebooks</text>',
  ' <text x="72" y="470" font-size="22" fill="#52645f">Diagnóstico claro. Tú decides.</text>',
  '</g>',
  '<rect x="71" y="500" width="321" height="64" rx="15" fill="#205c48"/>',
  '<text x="99" y="541" fill="#fff" font-family="Arial,DejaVu Sans,sans-serif" font-size="24" font-weight="700">Consulta tu caso  →</text>',
  '<g font-family="Arial,DejaVu Sans,sans-serif" fill="#172b29">',
  ' <text x="429" y="518" font-size="14" font-weight="700" letter-spacing="1.5" fill="#52645f">VISITA DESDE</text>',
  ' <text x="426" y="552" font-size="34" font-weight="700">' + safe(lowestPrice) + '</text>',
  otherPrice ? ' <text x="428" y="578" font-size="15" fill="#52645f">' + safe(otherPrice.name) + ": " + safe(money(otherPrice.price)) + '</text>' : '',
  ' <text x="72" y="611" font-size="20" font-weight="600" fill="#205c48">soporte.tooltician.com</text>',
  '</g>',
  '<rect x="799" y="85" width="374" height="420" rx="29" fill="#fff" opacity=".17"/>',
  '<image x="805" y="91" width="362" height="408" href="data:image/png;base64,' + portrait.toString("base64") + '" clip-path="url(#portrait-clip)"/>',
  '<text x="807" y="551" font-family="Arial,DejaVu Sans,sans-serif" font-size="18" font-weight="600" letter-spacing="2" fill="#b2dac8">ATENCIÓN PERSONAL</text>',
  '<text x="805" y="595" font-family="Arial,DejaVu Sans,sans-serif" font-size="34" font-weight="700" fill="#fff">Carlos Ortega</text>',
  '</svg>',
].join("\n");

await mkdir(join("support", "public"), { recursive: true });
const metadata = await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(outputFile);
if (metadata.width !== WIDTH || metadata.height !== HEIGHT) {
  throw new Error("OG image dimensions unexpectedly changed");
}
if (metadata.size >= 8 * 1024 * 1024) {
  throw new Error("OG image exceeds 8 MB");
}
console.log("Generated", outputFile, WIDTH + "x" + HEIGHT, metadata.size + " bytes");
