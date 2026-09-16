// Behavioral funnel tests: single-submit intake + portfolio filters.
//
// Why: static string-match checks cannot catch behavioral regressions such as
// the pre-008 double-POST (two submit handlers on #contact-form both firing).
// These tests run against a real preview server with a real browser.
//
//   node test-behavioral.mjs   # spawns `npm run preview -- --port 4322` itself,
//                             # polls to 200 (max ~30s), runs, kills in finally.
//
// Never assumes a server is already running and never leaves one behind.
// Formspree is ALWAYS intercepted and mocked — this script never hits prod.
import { chromium } from 'playwright';
import { spawn } from 'child_process';

const PORT = 4322;
const BASE = `http://localhost:${PORT}`;
const START_TIMEOUT_MS = 30000;

const failures = [];
const fail = (name, detail = '') => {
  failures.push(name);
  console.error(`✗ ${name}${detail ? `\n    → ${detail}` : ''}`);
};
const ok = (name) => console.log(`✓ ${name}`);

function startPreview() {
  return new Promise((resolve, reject) => {
    // detached:true so SIGTERM to the group also kills the `astro preview`
    // grandchild (plain child.kill only kills the npm wrapper and orphans it).
    const child = spawn('npm', ['run', 'preview', '--', '--port', String(PORT)], {
      stdio: ['ignore', 'pipe', 'pipe'],
      detached: process.platform !== 'win32',
    });
    let settled = false;
    const out = [];
    child.stdout?.on('data', (d) => out.push(String(d)));
    child.stderr?.on('data', (d) => out.push(String(d)));
    child.on('error', (err) => {
      if (!settled) {
        settled = true;
        reject(new Error(`preview spawn failed: ${err.message}`));
      }
    });
    // Poll BASE/en/ to 200.
    const deadline = Date.now() + START_TIMEOUT_MS;
    const poll = async () => {
      try {
        const res = await fetch(`${BASE}/en/`);
        if (res.ok) {
          if (!settled) {
            settled = true;
            resolve(child);
          }
          return;
        }
      } catch {
        // not up yet
      }
      if (Date.now() >= deadline) {
        if (!settled) {
          settled = true;
          try {
            if (process.platform !== 'win32' && child.pid) process.kill(-child.pid, 'SIGTERM');
            else child.kill('SIGTERM');
          } catch { /* already dead */ }
          reject(new Error(`preview did not serve ${BASE}/en/ within ${START_TIMEOUT_MS / 1000}s. Output:\n${out.join('').slice(-2000)}`));
        }
        return;
      }
      setTimeout(poll, 500);
    };
    poll();
  });
}

async function testSingleSubmit(browser) {
  const label = 'single-submit sends exactly 1 POST and shows success';
  const context = await browser.newContext();
  const page = await context.newPage();
  const pageErrors = [];
  const consoleErrors = [];
  page.on('pageerror', (err) => pageErrors.push(err.message));
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  let postAttempts = 0;
  // NEVER hit production Formspree — intercept and mock before navigation.
  await page.route('**/formspree.io/**', async (route) => {
    postAttempts++;
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: '{}',
    });
  });

  await page.goto(`${BASE}/en/`, { waitUntil: 'networkidle' });

  const formCount = await page.locator('#contact-form').count();
  if (formCount !== 1) {
    fail(label, `expected 1 #contact-form on /en/, found ${formCount}`);
    await context.close();
    return;
  }
  await page.locator('#contact-form').scrollIntoViewIfNeeded();

  // Pick a real goal option live (first non-empty value) — never hardcode.
  const goalValue = await page.locator('#contact-goal option').evaluateAll((opts) => {
    const found = opts.map((o) => o.value).find((v) => v && v.trim() !== '');
    return found || null;
  });
  if (!goalValue) {
    fail(label, '#contact-goal has no real (non-empty) option');
    await context.close();
    return;
  }

  await page.locator('#contact-name').fill('Behavioral Test');
  await page.locator('#contact-email').fill('test@example.com');
  await page.locator('#contact-goal').selectOption({ value: goalValue });
  await page.locator('#contact-message').fill('Current workflow X · bottleneck Y · operator Z · deadline soon');

  await page.locator('#contact-form button[type="submit"]').click();

  let successVisible = false;
  try {
    await page.locator('#contact-form .intake-form__success.show').waitFor({ state: 'visible', timeout: 5000 });
    successVisible = true;
  } catch {
    successVisible = false;
  }

  if (postAttempts !== 1) {
    fail(label, `expected exactly 1 POST to formspree.io, observed ${postAttempts}`);
  } else if (!successVisible) {
    fail(label, '1 POST observed but .intake-form__success.show never became visible');
  } else if (pageErrors.length > 0 || consoleErrors.length > 0) {
    fail(label, `page errors: [${pageErrors.join('; ')}] console errors: [${consoleErrors.join('; ')}]`);
  } else {
    ok(`${label} (1 POST, success shown, 0 errors)`);
  }
  await context.close();
}

async function testFiltersOnPage(browser, path) {
  const context = await browser.newContext();
  const page = await context.newPage();
  const pageErrors = [];
  const consoleErrors = [];
  page.on('pageerror', (err) => pageErrors.push(err.message));
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  await page.goto(`${BASE}${path}`, { waitUntil: 'networkidle' });

  const filters = await page.locator('button[data-filter]').evaluateAll((els) =>
    els.map((el) => el.getAttribute('data-filter')).filter(Boolean)
  );
  if (filters.length === 0) {
    fail(`filters ${path}: no filter buttons found`, 'expected .filter-bar with button[data-filter]');
    await context.close();
    return 0;
  }

  let checked = 0;
  for (const filter of filters) {
    await page.locator(`button[data-filter="${filter}"]`).click();
    await page.waitForTimeout(100);

    const visible = await page.locator('.project-card:not([hidden])').count();
    const expected = await page.evaluate((f) => {
      const cards = Array.from(document.querySelectorAll('.project-card'));
      return cards.filter((card) => {
        const cats = (card.dataset.categories ?? '').split(' ').filter(Boolean);
        return f === 'all' || cats.includes(f);
      }).length;
    }, filter);

    const pressed = await page.locator('button[data-filter]').evaluateAll((els) =>
      els.map((el) => ({ filter: el.getAttribute('data-filter'), pressed: el.getAttribute('aria-pressed') }))
    );
    const activeOnes = pressed.filter((p) => p.pressed === 'true');
    const exclusive = activeOnes.length === 1 && activeOnes[0].filter === filter;

    if (visible !== expected) {
      fail(`filters ${path} [${filter}]`, `visible ${visible} != expected ${expected} from data-categories`);
    } else if (!exclusive) {
      fail(`filters ${path} [${filter}]`, `aria-pressed not exclusive: ${JSON.stringify(pressed)}`);
    } else {
      ok(`filters ${path} [${filter}]: ${visible}/${expected} visible, aria-pressed exclusive`);
      checked++;
    }
  }

  if (pageErrors.length > 0 || consoleErrors.length > 0) {
    fail(`filters ${path}: console/page errors`, `page: [${pageErrors.join('; ')}] console: [${consoleErrors.join('; ')}]`);
  } else {
    ok(`filters ${path}: zero console/page errors`);
  }
  await context.close();
  return checked;
}

let preview = null;
let browser = null;
try {
  preview = await startPreview();
  console.log(`preview up at ${BASE}`);
  browser = await chromium.launch({ headless: true });
  await testSingleSubmit(browser);
  const pages = ['/en/work/', '/es/trabajo/'];
  let totalFilterChecks = 0;
  for (const path of pages) {
    totalFilterChecks += await testFiltersOnPage(browser, path);
  }
} catch (err) {
  fail('harness', err?.message || String(err));
} finally {
  if (browser) await browser.close().catch(() => {});
  if (preview) {
    // Kill the whole process group (npm wrapper + astro grandchild).
    try {
      if (process.platform !== 'win32' && preview.pid) process.kill(-preview.pid, 'SIGTERM');
      else preview.kill('SIGTERM');
    } catch {
      try { preview.kill('SIGTERM'); } catch { /* already dead */ }
    }
    await new Promise((resolve) => {
      const t = setTimeout(resolve, 3000);
      preview.on('exit', () => {
        clearTimeout(t);
        resolve();
      });
    });
    // Escalate if the group survived.
    try {
      if (preview.exitCode === null && preview.signalCode === null) {
        if (process.platform !== 'win32' && preview.pid) process.kill(-preview.pid, 'SIGKILL');
        else preview.kill('SIGKILL');
      }
    } catch { /* already dead */ }
  }
}

if (failures.length > 0) {
  console.error(`\nFAIL: ${failures.length} failing check(s): ${failures.join('; ')}`);
  process.exit(1);
} else {
  console.log('PASS: single-submit (1 POST) + filters (2 pages, all live filters) — 0 failures');
  process.exit(0);
}
