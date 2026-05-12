import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

const logs = [];
page.on('console', msg => logs.push(`[${msg.type()}] ${msg.text()}`));
page.on('pageerror', err => logs.push(`[PAGE ERROR] ${err.message}`));

await page.goto('http://localhost:4323/en/index.html', { waitUntil: 'networkidle' });

console.log('=== Production build loaded ===');
logs.forEach(l => console.log(`  ${l}`));

const btns = await page.locator('.filter-btn').count();
console.log(`\nFilter buttons: ${btns}`);

const cards = await page.locator('.project-card').count();
console.log(`Project cards: ${cards}`);

// Click Python
console.log('\n--- Clicking Python ---');
await page.locator('button[data-filter="python"]').click();
await page.waitForTimeout(100);

const pyPressed = await page.locator('button[data-filter="python"]').getAttribute('aria-pressed');
const pyVisible = await page.locator('.project-card:not([hidden])').count();
const pyHidden = await page.locator('.project-card[hidden]').count();
console.log(`Python aria-pressed: ${pyPressed}, Visible: ${pyVisible}, Hidden: ${pyHidden}`);

// Click Web
console.log('\n--- Clicking Web ---');
await page.locator('button[data-filter="web"]').click();
await page.waitForTimeout(100);

const webPressed = await page.locator('button[data-filter="web"]').getAttribute('aria-pressed');
const webVisible = await page.locator('.project-card:not([hidden])').count();
console.log(`Web aria-pressed: ${webPressed}, Visible: ${webVisible}`);

// Click All
console.log('\n--- Clicking All ---');
await page.locator('button[data-filter="all"]').click();
await page.waitForTimeout(100);

const allPressed = await page.locator('button[data-filter="all"]').getAttribute('aria-pressed');
const allVisible = await page.locator('.project-card:not([hidden])').count();
console.log(`All aria-pressed: ${allPressed}, Visible: ${allVisible}`);

// Check for errors
console.log('\n--- Page errors ---');
const errors = logs.filter(l => l.includes('[PAGE ERROR]') || l.includes('[error]'));
if (errors.length) {
  errors.forEach(l => console.log(`  ${l}`));
} else {
  console.log('  No errors found');
}

// Check Spanish page too
console.log('\n=== Testing Spanish page ===');
await page.goto('http://localhost:4323/es/index.html', { waitUntil: 'networkidle' });
const esBtns = await page.locator('.filter-btn').count();
console.log(`ES filter buttons: ${esBtns}`);
await page.locator('button[data-filter="cli"]').click();
await page.waitForTimeout(100);
const cliPressed = await page.locator('button[data-filter="cli"]').getAttribute('aria-pressed');
const cliVisible = await page.locator('.project-card:not([hidden])').count();
console.log(`CLI aria-pressed: ${cliPressed}, Visible: ${cliVisible}`);

await browser.close();
