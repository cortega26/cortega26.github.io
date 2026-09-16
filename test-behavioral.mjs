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

// GA4's gtag() stub (inlined in BaseLayout) pushes straight into
// window.dataLayer regardless of whether the external gtag.js script ever
// loads, so capturing dataLayer is sufficient to assert the analytics
// lifecycle fired — no real network call to googletagmanager.com required.
async function mockGtagAndFormspree(page, { formspreeStatus = 200 } = {}) {
  let postAttempts = 0;
  await page.route('**/formspree.io/**', async (route) => {
    postAttempts++;
    await route.fulfill({
      status: formspreeStatus,
      contentType: 'application/json',
      body: formspreeStatus < 300 ? '{}' : '{"error":"mock failure"}',
    });
  });
  // Stub the external gtag.js load itself (never hit real Google servers in tests).
  await page.route('**/googletagmanager.com/**', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/javascript', body: '' });
  });
  const getPost = () => postAttempts;
  return { getPostAttempts: getPost };
}

async function fillIntakeForm(page) {
  await page.locator('#contact-form').scrollIntoViewIfNeeded();
  const goalValue = await page.locator('#contact-goal option').evaluateAll((opts) => {
    const found = opts.map((o) => o.value).find((v) => v && v.trim() !== '');
    return found || null;
  });
  if (!goalValue) return null;
  await page.locator('#contact-name').fill('Behavioral Test');
  await page.locator('#contact-email').fill('test@example.com');
  await page.locator('#contact-goal').selectOption({ value: goalValue });
  await page.locator('#contact-message').fill('Current workflow X · bottleneck Y · operator Z · deadline soon');
  return goalValue;
}

async function testSingleSubmit(browser) {
  const label = 'single-submit sends exactly 1 POST, shows success, and fires the GA4 lifecycle with no PII';
  const context = await browser.newContext();
  const page = await context.newPage();
  const pageErrors = [];
  const consoleErrors = [];
  page.on('pageerror', (err) => pageErrors.push(err.message));
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  const { getPostAttempts } = await mockGtagAndFormspree(page);

  await page.goto(`${BASE}/en/`, { waitUntil: 'networkidle' });

  const formCount = await page.locator('#contact-form').count();
  if (formCount !== 1) {
    fail(label, `expected 1 #contact-form on /en/, found ${formCount}`);
    await context.close();
    return;
  }

  if (!(await fillIntakeForm(page))) {
    fail(label, '#contact-goal has no real (non-empty) option');
    await context.close();
    return;
  }

  await page.locator('#contact-form button[type="submit"]').click();

  let successVisible = false;
  try {
    await page.locator('#contact-form .intake-form__success.show').waitFor({ state: 'visible', timeout: 5000 });
    successVisible = true;
  } catch {
    successVisible = false;
  }

  // Read back what actually reached the GA4 dataLayer for this submission,
  // and confirm no PII (name/email/message) leaked into it.
  //
  // NOTE: this preview server runs on http://localhost, and product-analytics.js
  // (the canonical brief_* layer) deliberately suppresses ALL canonical events
  // on localhost/127.0.0.1/file: by design (privacy: never instrument a dev
  // environment) — see suppressionReason() in product-analytics.js and the
  // "S6 · Environment suppression" unit tests in tests/analytics-service-funnel.mjs,
  // which already prove brief_* fires correctly against a real (non-localhost)
  // host in isolation. This E2E test therefore asserts what a real browser
  // actually does on localhost: canonical suppressed (with the documented
  // reason), legacy (form_start/form_submit_success) NOT suppressed — legacy
  // has no such gating and must fire in every environment, including production.
  const result = await page.evaluate(() => ({
    dataLayerEvents: (window.dataLayer || [])
      .filter((entry) => entry && entry[0] === 'event' && entry.length >= 2)
      .map((entry) => ({ name: entry[1], params: entry[2] || {} })),
    debug: window.ttAnalytics && typeof window.ttAnalytics.debug === 'function' ? window.ttAnalytics.debug() : null,
  }));
  const eventNames = result.dataLayerEvents.map((e) => e.name);
  const legacySuccessSeen = eventNames.includes('form_submit_success');
  const canonicalCorrectlySuppressed =
    result.debug && result.debug.sent === 0 && result.debug.reasons && result.debug.reasons.local_host > 0;
  const serialized = JSON.stringify(result.dataLayerEvents);
  const noPii =
    !serialized.includes('Behavioral Test') &&
    !serialized.includes('test@example.com') &&
    !serialized.includes('Current workflow X');

  const postAttempts = getPostAttempts();
  if (postAttempts !== 1) {
    fail(label, `expected exactly 1 POST to formspree.io, observed ${postAttempts}`);
  } else if (!successVisible) {
    fail(label, '1 POST observed but .intake-form__success.show never became visible');
  } else if (!legacySuccessSeen) {
    fail(label, `legacy form_submit_success never reached the dataLayer. observed: ${JSON.stringify(eventNames)}`);
  } else if (!canonicalCorrectlySuppressed) {
    fail(label, `expected canonical brief_* events suppressed with reason local_host on this preview host; got debug()=${JSON.stringify(result.debug)}`);
  } else if (!noPii) {
    fail(label, `PII leaked into dataLayer params: ${serialized}`);
  } else if (pageErrors.length > 0 || consoleErrors.length > 0) {
    fail(label, `page errors: [${pageErrors.join('; ')}] console errors: [${consoleErrors.join('; ')}]`);
  } else {
    ok(`${label} (1 POST, success shown, legacy form_submit_success fired, canonical correctly suppressed on localhost, no PII, 0 errors)`);
  }
  await context.close();
}

async function testDoubleClickProtection(browser) {
  const label = 'double-click on submit sends exactly 1 POST (button disabled during the request)';
  const context = await browser.newContext();
  const page = await context.newPage();
  const pageErrors = [];
  const consoleErrors = [];
  page.on('pageerror', (err) => pageErrors.push(err.message));
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  let postAttempts = 0;
  await page.route('**/formspree.io/**', async (route) => {
    postAttempts++;
    // Delay the response so a second click during the pending request would
    // land while the first is still in flight, if the button weren't disabled.
    await new Promise((resolve) => setTimeout(resolve, 300));
    await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
  });
  await page.route('**/googletagmanager.com/**', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/javascript', body: '' });
  });

  await page.goto(`${BASE}/en/`, { waitUntil: 'networkidle' });

  if (!(await fillIntakeForm(page))) {
    fail(label, '#contact-goal has no real (non-empty) option');
    await context.close();
    return;
  }

  const submitBtn = page.locator('#contact-form button[type="submit"]');
  // Fire two rapid clicks; the second should be a no-op once the button is disabled.
  await Promise.all([submitBtn.click({ force: true }), submitBtn.click({ force: true, timeout: 1000 }).catch(() => {})]);

  let successVisible = false;
  try {
    await page.locator('#contact-form .intake-form__success.show').waitFor({ state: 'visible', timeout: 5000 });
    successVisible = true;
  } catch {
    successVisible = false;
  }

  if (postAttempts !== 1) {
    fail(label, `expected exactly 1 POST after double-click, observed ${postAttempts}`);
  } else if (!successVisible) {
    fail(label, '1 POST observed but success banner never became visible');
  } else if (pageErrors.length > 0 || consoleErrors.length > 0) {
    fail(label, `page errors: [${pageErrors.join('; ')}] console errors: [${consoleErrors.join('; ')}]`);
  } else {
    ok(`${label} (1 POST, success shown, 0 errors)`);
  }
  await context.close();
}

async function testErrorPath(browser) {
  const label = 'failed submission (500) shows the error banner and fires form_submit_error, never success';
  const context = await browser.newContext();
  const page = await context.newPage();
  const pageErrors = [];
  const consoleErrors = [];
  page.on('pageerror', (err) => pageErrors.push(err.message));
  page.on('console', (msg) => {
    // Chromium logs the mocked 500 network response itself as a console
    // error — that's the browser's own network log, not a JS error our code
    // threw, and it's expected on this intentionally-failing test. Any other
    // console error still fails the test.
    if (msg.type() === 'error' && !/status of 500/.test(msg.text())) consoleErrors.push(msg.text());
  });

  const { getPostAttempts } = await mockGtagAndFormspree(page, { formspreeStatus: 500 });

  await page.goto(`${BASE}/en/`, { waitUntil: 'networkidle' });

  if (!(await fillIntakeForm(page))) {
    fail(label, '#contact-goal has no real (non-empty) option');
    await context.close();
    return;
  }

  await page.locator('#contact-form button[type="submit"]').click();

  let errorVisible = false;
  try {
    await page.locator('#contact-form .intake-form__error.show').waitFor({ state: 'visible', timeout: 5000 });
    errorVisible = true;
  } catch {
    errorVisible = false;
  }
  const successVisible = await page.locator('#contact-form .intake-form__success.show').count();

  // See the localhost-suppression note in testSingleSubmit: brief_error is
  // canonical and is suppressed on this localhost preview by design, so only
  // the legacy form_submit_error (which has no such gating) is asserted here.
  const result = await page.evaluate(() => ({
    dataLayerEvents: (window.dataLayer || [])
      .filter((entry) => entry && entry[0] === 'event' && entry.length >= 2)
      .map((entry) => entry[1]),
    debug: window.ttAnalytics && typeof window.ttAnalytics.debug === 'function' ? window.ttAnalytics.debug() : null,
  }));
  const legacyErrorSeen = result.dataLayerEvents.includes('form_submit_error');
  const canonicalCorrectlySuppressed =
    result.debug && result.debug.sent === 0 && result.debug.reasons && result.debug.reasons.local_host > 0;

  const postAttempts = getPostAttempts();
  if (postAttempts !== 1) {
    fail(label, `expected exactly 1 POST attempt, observed ${postAttempts}`);
  } else if (!errorVisible) {
    fail(label, 'error banner never became visible on a 500 response');
  } else if (successVisible > 0) {
    fail(label, 'success banner incorrectly shown on a failed submission');
  } else if (!legacyErrorSeen) {
    fail(label, `legacy form_submit_error never reached the dataLayer. observed: ${JSON.stringify(result.dataLayerEvents)}`);
  } else if (!canonicalCorrectlySuppressed) {
    fail(label, `expected canonical brief_error suppressed with reason local_host on this preview host; got debug()=${JSON.stringify(result.debug)}`);
  } else if (pageErrors.length > 0 || consoleErrors.length > 0) {
    fail(label, `page errors: [${pageErrors.join('; ')}] console errors: [${consoleErrors.join('; ')}]`);
  } else {
    ok(`${label} (error shown, form_submit_error fired, canonical correctly suppressed on localhost, no success, 0 errors)`);
  }
  await context.close();
}

async function testMobileSuccessVisibility(browser) {
  // Reproduces a real defect found via live production inspection at 375x812:
  // the success banner sits right after the submit button in the DOM, and on
  // a short/mobile viewport that position can render below the visible
  // viewport with no scroll or focus change — so the confirmation exists but
  // a real phone user can submit and see nothing change on screen. Every
  // other behavioral test here runs at Playwright's default (much taller)
  // desktop viewport, which is why this went unnoticed until live inspection.
  const label = 'on a mobile viewport, the success banner is scrolled into view (not left below the fold)';
  const context = await browser.newContext({ viewport: { width: 375, height: 812 } });
  const page = await context.newPage();
  const pageErrors = [];
  const consoleErrors = [];
  page.on('pageerror', (err) => pageErrors.push(err.message));
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  await mockGtagAndFormspree(page);
  await page.goto(`${BASE}/en/`, { waitUntil: 'networkidle' });

  if (!(await fillIntakeForm(page))) {
    fail(label, '#contact-goal has no real (non-empty) option');
    await context.close();
    return;
  }

  // Scroll so the submit button sits at the bottom edge of the viewport —
  // the natural resting scroll position right before a real user taps it.
  await page.locator('#contact-form button[type="submit"]').scrollIntoViewIfNeeded();
  await page.locator('#contact-form button[type="submit"]').click();

  try {
    await page.locator('#contact-form .intake-form__success.show').waitFor({ state: 'visible', timeout: 5000 });
  } catch {
    fail(label, 'success banner never became visible');
    await context.close();
    return;
  }
  // `scrollIntoView({behavior:'smooth'})` animates over time — Playwright's
  // "visible" wait only checks CSS visibility, not scroll position, so give
  // the smooth-scroll animation a moment to actually finish before checking.
  await page.waitForTimeout(600);

  const inViewport = await page.locator('#contact-form .intake-form__success').evaluate((el) => {
    const r = el.getBoundingClientRect();
    return r.top >= 0 && r.bottom <= window.innerHeight;
  });

  if (!inViewport) {
    fail(label, 'success banner is visible in the DOM but its box is outside the mobile viewport after submit');
  } else if (pageErrors.length > 0 || consoleErrors.length > 0) {
    fail(label, `page errors: [${pageErrors.join('; ')}] console errors: [${consoleErrors.join('; ')}]`);
  } else {
    ok(`${label} (banner scrolled into the 375x812 viewport, 0 errors)`);
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
  await testDoubleClickProtection(browser);
  await testErrorPath(browser);
  await testMobileSuccessVisibility(browser);
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
  console.log('PASS: single-submit + double-click protection + error-path + filters (2 pages, all live filters) — 0 failures');
  process.exit(0);
}
