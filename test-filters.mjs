import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

// Collect console messages
const logs = [];
page.on('console', msg => logs.push(`[${msg.type()}] ${msg.text()}`));
page.on('pageerror', err => logs.push(`[PAGE ERROR] ${err.message}`));

await page.goto('http://localhost:4322/en/', { waitUntil: 'networkidle' });

console.log('=== Page loaded successfully ===');
console.log('Console messages:');
logs.forEach(l => console.log(`  ${l}`));

// Count filter buttons
const btns = await page.locator('.filter-btn').count();
console.log(`\nFilter buttons found: ${btns}`);

// Count project cards
const cards = await page.locator('.project-card').count();
console.log(`Project cards found: ${cards}`);

// Check which cards are visible
const visibleCards = await page.locator('.project-card:not([hidden])').count();
console.log(`Visible cards (not hidden): ${visibleCards}`);

// Click "Python" filter
console.log('\n=== Clicking "Python" filter ===');
await page.locator('button[data-filter="python"]').click();
await page.waitForTimeout(100);

// Check active button
const activePython = await page.locator('button[data-filter="python"]').getAttribute('aria-pressed');
console.log(`Python button aria-pressed: ${activePython}`);

// Count visible cards after filtering
const pythonVisible = await page.locator('.project-card:not([hidden])').count();
console.log(`Visible cards after Python filter: ${pythonVisible}`);

// Check hidden cards
const pythonHidden = await page.locator('.project-card[hidden]').count();
console.log(`Hidden cards after Python filter: ${pythonHidden}`);

// Click "All" filter
console.log('\n=== Clicking "All" filter ===');
await page.locator('button[data-filter="all"]').click();
await page.waitForTimeout(100);
const allVisible = await page.locator('.project-card:not([hidden])').count();
console.log(`Visible cards after All filter: ${allVisible}`);

// Check console again for any errors after interactions
console.log(`\nAll console messages:`);
logs.forEach(l => {
  if (l.includes('[PAGE ERROR]') || l.includes('[error]')) {
    console.log(`  *** ${l}`);
  }
});
if (!logs.some(l => l.includes('[PAGE ERROR]') || l.includes('[error]'))) {
  console.log('  No errors found');
}

await browser.close();
