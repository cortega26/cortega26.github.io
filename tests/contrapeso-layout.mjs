// Visual regression guard for the documentary memorial (rendered Chromium).
// Run after astro build and Playwright browser installation.
import { chromium } from '@playwright/test';
import { createServer } from 'node:http';
import { readFile, stat, mkdir } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';

const root = resolve('dist');
const out = resolve('output/memorial-visual');
await mkdir(out, { recursive: true });
const contentTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png'
};
const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url || '/', 'http://localhost');
    const candidate = resolve(root, `.${decodeURIComponent(url.pathname)}`);
    if (candidate !== root && !candidate.startsWith(root + sep)) {
      res.writeHead(403).end();
      return;
    }
    const entry = await stat(candidate);
    const file = entry.isDirectory() ? resolve(candidate, 'index.html') : candidate;
    const bytes = await readFile(file);
    res.writeHead(200, { 'Content-Type': contentTypes[extname(file)] || 'application/octet-stream' });
    res.end(bytes);
  } catch {
    res.writeHead(404).end();
  }
});
await new Promise((resolveListen) => server.listen(0, '127.0.0.1', resolveListen));
const port = server.address().port;
const origin = `http://127.0.0.1:${port}`;
const browser = await chromium.launch({ headless: true });
const pages = [
  { id: 'directory', path: '/venezuela-lab/museo/victimas/', selector: '.person-card' },
  { id: 'year-1999', path: '/venezuela-lab/museo/victimas/1999/', selector: '.year-card' },
  { id: 'year-2000', path: '/venezuela-lab/museo/victimas/2000/', selector: '.year-roster-item' },
  { id: 'profile', path: '/venezuela-lab/museo/victimas/perfil.html?id=jaime-hilarion-palima-dominguez', selector: '.profile-name' }
];
const widths = [320, 390, 768, 1024, 1440];
const findings = [];
let reviewed = 0;

try {
  for (const target of pages) {
    for (const width of widths) {
      const context = await browser.newContext({ viewport: { width, height: 900 }, deviceScaleFactor: 1 });
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', (error) => errors.push(error.message));
      await page.goto(origin + target.path, { waitUntil: 'networkidle' });
      await page.locator(target.selector).first().waitFor({ timeout: 10000 });
      const result = await page.evaluate(() => ({
        background: getComputedStyle(document.body).backgroundColor,
        documentWidth: document.documentElement.scrollWidth,
        viewportWidth: document.documentElement.clientWidth
      }));
      if (result.documentWidth > result.viewportWidth + 2) {
        findings.push(`${target.id}/${width}: Horizontal overflow: ${result.documentWidth} > ${result.viewportWidth}`);
      }
      if (result.background !== 'rgb(246, 245, 239)') {
        findings.push(`${target.id}/${width}: CSS missing: ${result.background}`);
      }
      const headings = page.locator('.hero h1, .person-name, .profile-name, .year-card h3');
      const headingCount = Math.min(await headings.count(), 24);
      for (let k = 0; k < headingCount; k++) {
        const rect = await headings.nth(k).boundingBox();
        if (rect && (rect.x < -2 || rect.x + rect.width > width + 2)) {
          findings.push(`${target.id}/${width}: Heading outside viewport at index ${k}`);
        }
      }
      if (target.id === 'directory') {
        const recordCards = page.locator('.person-card');
        const cardCount = Math.min(await recordCards.count(), 6);
        for (let k = 0; k < cardCount; k++) {
          const card = recordCards.nth(k);
          const selectors = ['.person-top', '.person-name', '.person-excerpt', '.person-actions'];
          let bottom = -Infinity;
          for (const selector of selectors) {
            const rect = await card.locator(selector).boundingBox();
            if (!rect) continue;
            if (rect.y < bottom - 1) {
              findings.push(`${target.id}/${width}: Overlapping card ${k} at ${selector}`);
            }
            bottom = rect.y + rect.height;
          }
        }
      }
      for (const error of errors) findings.push(`${target.id}/${width}: Browser error: ${error}`);
      if (target.id === 'directory') {
        const n = await page.locator('.person-card').count();
        if (n !== 24) findings.push(`${target.id}/${width}: expected 24 visible records, got ${n}`);
        const count = (await page.locator('#registered-count').textContent())?.trim();
        if (count !== '301') findings.push(`${target.id}/${width}: expected 301 records, got ${count}`);
      }
      if (target.id === 'year-2000') {
        const n = await page.locator('.year-roster-item').count();
        if (n !== 50) findings.push(`${target.id}/${width}: expected 50 year records, got ${n}`);
      }
      if ([390, 1440].includes(width)) {
        await page.screenshot({ path: resolve(out, `${target.id}-${width}.png`) });
        if (target.id === 'year-2000') {
          await page.locator('.year-roster').scrollIntoViewIfNeeded();
          await page.screenshot({ path: resolve(out, `year-2000-register-${width}.png`) });
        }
      }
      reviewed++;
      console.log(`${findings.length ? 'CHECK' : 'PASS'}: ${target.id} ${width}px; document=${result.documentWidth}px; css=${result.background}`);
      await context.close();
    }
  }
} finally {
  await browser.close();
  await new Promise((done) => server.close(done));
}
console.log(`Responsive visual QA: ${reviewed} rendered viewport/page combinations, ${findings.length} finding(s).`);
if (findings.length) {
  console.error(findings.join('\n'));
  process.exitCode = 1;
}
