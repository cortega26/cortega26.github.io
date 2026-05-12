import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

const logs = [];
page.on('console', msg => logs.push(`[${msg.type()}] ${msg.text()}`));
page.on('pageerror', err => logs.push(`[PAGE ERROR] ${err.message}`));

await page.goto('http://localhost:4323/en/index.html', { waitUntil: 'networkidle' });

// Scroll down to portfolio section to trigger reveal animations
await page.locator('#portfolio').scrollIntoViewIfNeeded();
await page.waitForTimeout(600);

// Check card visibility after reveal animations
let visibleComputed = await page.evaluate(() => {
  const cards = document.querySelectorAll('.project-card');
  return Array.from(cards).map(c => ({
    id: c.id,
    hasHiddenAttr: c.hasAttribute('hidden'),
    computedOpacity: window.getComputedStyle(c).opacity,
    isRevealed: c.classList.contains('visible')
  }));
});
console.log('=== After scroll to portfolio ===');
visibleComputed.forEach(c => console.log('  ' + c.id + ': hidden=' + c.hasHiddenAttr + ', opacity=' + c.computedOpacity + ', revealed=' + c.isRevealed));

// Click Python filter
console.log('\n=== Clicking Python ===');
await page.locator('button[data-filter="python"]').click();
await page.waitForTimeout(100);

visibleComputed = await page.evaluate(() => {
  const cards = document.querySelectorAll('.project-card');
  return Array.from(cards).map(c => ({
    id: c.id,
    hasHiddenAttr: c.hasAttribute('hidden'),
    computedDisplay: window.getComputedStyle(c).display
  }));
});
visibleComputed.forEach(c => console.log('  ' + c.id + ': hidden=' + c.hasHiddenAttr + ', display=' + c.computedDisplay));

// Click All
console.log('\n=== Clicking All ===');
await page.locator('button[data-filter="all"]').click();
await page.waitForTimeout(100);

visibleComputed = await page.evaluate(() => {
  const cards = document.querySelectorAll('.project-card');
  return Array.from(cards).map(c => ({
    id: c.id,
    hasHiddenAttr: c.hasAttribute('hidden'),
    computedDisplay: window.getComputedStyle(c).display,
    computedOpacity: window.getComputedStyle(c).opacity
  }));
});
console.log('After clicking All:');
visibleComputed.forEach(c => console.log('  ' + c.id + ': hidden=' + c.hasHiddenAttr + ', display=' + c.computedDisplay + ', opacity=' + c.computedOpacity));

// Log any errors
const errors = logs.filter(l => l.includes('[PAGE ERROR]'));
if (errors.length) {
  console.log('\nErrors:', errors);
} else {
  console.log('\nNo page errors');
}

await browser.close();
