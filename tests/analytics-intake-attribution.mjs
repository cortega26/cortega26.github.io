#!/usr/bin/env node
/**
 * Intake-form service attribution tests — wiring between
 * public/assets/js/intake-form.js and public/assets/js/product-analytics.js.
 *
 * Run: node tests/analytics-intake-attribution.mjs
 *
 * Loads the REAL product-analytics.js and then the REAL intake-form.js into
 * one `vm` context per case (fresh sandbox each time, so the analytics
 * fire-once guards never leak across cases) with a fake form and asserts:
 *
 * - scoped form (data-track-form="intake_<service>"): brief_start /
 *   service_engage on first input and brief_submit / brief_success on submit
 *   all carry the resolved service_id;
 * - generic form (data-track-form="intake"): the same lifecycle fires with
 *   NO service_id / service_category keys (never fake a service context);
 * - negative control (ttAnalytics removed): no canonical calls, no throw,
 *   legacy form_start still fires.
 *
 * No network, no browser, no GA4 ID required. The sandbox host is
 * production-like (tooltician.com/https) because the canonical layer
 * deliberately suppresses itself on localhost.
 *
 * Mutation-sensitivity check: point TT_INTAKE_SRC at a copy of intake-form.js
 * with the `intake_` suffix regex broken — the scoped case must fail.
 * (Env override exists only for that check; default is the real file.)
 */
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import vm from 'vm';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (rel) => readFileSync(join(ROOT, rel), 'utf8');

const ANALYTICS_SRC = read('public/assets/js/product-analytics.js');
const INTAKE_SRC = process.env.TT_INTAKE_SRC
  ? readFileSync(process.env.TT_INTAKE_SRC, 'utf8')
  : read('public/assets/js/intake-form.js');

let passed = 0;
let failed = 0;
const failures = [];
function assert(name, condition, detail = '') {
  if (condition) {
    console.log(`  ✓  ${name}`);
    passed++;
  } else {
    console.log(`  ✗  ${name}${detail ? `\n       → ${detail}` : ''}`);
    failed++;
    failures.push(name);
  }
}
function group(label, fn) {
  console.log(`\n── ${label}`);
  return fn();
}

/** Minimal stand-in for Element (intake-form never needs a real one). */
class FakeElement {
  getAttribute() {
    return null;
  }
  hasAttribute() {
    return false;
  }
  closest() {
    return null;
  }
}

function fakeControl(id, { valid = true } = {}) {
  return {
    id,
    dataset: {},
    value: '',
    checkValidity: () => valid,
    setAttribute() {},
    removeAttribute() {},
    focus() {},
    addEventListener() {},
    validity: {},
  };
}

function fakeForm(ctx, { valid = true } = {}) {
  const controls = [fakeControl('contact-name', { valid }), fakeControl('contact-email', { valid })];
  const el = () => ({
    classList: { add() {}, remove() {} },
    hidden: true,
    textContent: '',
    focus() {},
    scrollIntoView() {},
  });
  const successEl = el();
  const errorEl = el();
  const summaryEl = el();
  const pageField = fakeControl('page');
  const submitBtn = { textContent: 'Send', disabled: false, dataset: {} };
  const listeners = {};
  return {
    _listeners: listeners,
    _pageField: pageField,
    _controls: controls,
    getAttribute: (n) => (n === 'data-track-form' ? ctx : null),
    setAttribute() {},
    querySelector: (sel) => {
      if (sel === 'button[type="submit"]') return submitBtn;
      if (sel === '.intake-form__success') return successEl;
      if (sel === '.intake-form__error') return errorEl;
      if (sel === '[data-fill="page"]') return pageField;
      if (sel === '.intake-form__summary') return summaryEl;
      if (sel === '[data-summary-text]') return summaryEl;
      if (sel.startsWith('label[for=')) return { textContent: 'label' };
      return null;
    },
    querySelectorAll: () => controls,
    addEventListener: (name, fn) => {
      (listeners[name] = listeners[name] || []).push(fn);
    },
    reset() {
      controls.forEach((c) => {
        c.value = '';
      });
    },
    action: 'https://formspree.io/f/mock',
  };
}

/**
 * Build a fresh sandbox, load the real analytics + intake sources, return
 * handles. Set withAnalytics=false for the negative control (ttAnalytics is
 * removed before intake-form loads, so only the legacy track path remains).
 */
function loadIntake({ ctx, valid = true, withAnalytics = true } = {}) {
  const calls = [];
  const form = fakeForm(ctx, { valid });
  const docListeners = {};
  const sandbox = {
    console,
    URL,
    Element: FakeElement,
    navigator: {},
    FormData: class {
      constructor() {}
    },
    fetch: async () => ({ ok: true, status: 200 }),
    document: {
      readyState: 'complete',
      querySelector: () => null,
      querySelectorAll: (sel) => (sel === 'form.intake-form' ? [form] : []),
      getElementById: () => null,
      addEventListener: (name, fn) => {
        (docListeners[name] = docListeners[name] || []).push(fn);
      },
    },
  };
  sandbox.window = {
    location: {
      hostname: 'tooltician.com',
      protocol: 'https:',
      origin: 'https://tooltician.com',
      pathname: '/en/',
    },
    ttTrack: (name, params) => calls.push({ name, params }),
  };
  sandbox.globalThis = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(ANALYTICS_SRC, sandbox, { filename: 'product-analytics.js' });
  if (!withAnalytics) delete sandbox.window.ttAnalytics;
  vm.runInContext(INTAKE_SRC, sandbox, { filename: 'intake-form.js' });
  return { sandbox, form, calls, docListeners };
}

function fireInput(form, target) {
  for (const h of form._listeners.input || []) h({ target });
}

async function fireSubmit(form) {
  for (const h of form._listeners.submit || []) await h({ preventDefault() {} });
  await new Promise((resolve) => setImmediate(resolve));
}

const find = (calls, name) => calls.filter((c) => c.name === name);
const CANONICAL = new Set(['brief_start', 'brief_submit', 'brief_success', 'brief_error', 'service_engage']);

// ─── Tests ──────────────────────────────────────────────────────────────────

await group('A1 · Scoped form attributes the brief lifecycle to the service', async () => {
  const { form, calls } = loadIntake({ ctx: 'intake_automation' });
  fireInput(form, form._controls[0]);
  const start = find(calls, 'brief_start');
  const engage = find(calls, 'service_engage');
  assert('brief_start fires once on first input', start.length === 1, JSON.stringify(calls));
  assert(
    "brief_start carries service_id 'automation'",
    start.length === 1 && start[0].params.service_id === 'automation',
    JSON.stringify(start)
  );
  assert('service_engage fires once on first input', engage.length === 1, JSON.stringify(calls));
  assert(
    "service_engage carries service_id 'automation'",
    engage.length === 1 && engage[0].params.service_id === 'automation',
    JSON.stringify(engage)
  );
  await fireSubmit(form);
  const submit = find(calls, 'brief_submit');
  const success = find(calls, 'brief_success');
  assert(
    "brief_submit carries service_id 'automation'",
    submit.length === 1 && submit[0].params.service_id === 'automation',
    JSON.stringify(submit)
  );
  assert(
    "brief_success carries service_id 'automation'",
    success.length === 1 && success[0].params.service_id === 'automation',
    JSON.stringify(success)
  );
});

await group('A2 · Generic form never fakes a service context', async () => {
  const { form, calls } = loadIntake({ ctx: 'intake' });
  fireInput(form, form._controls[0]);
  await fireSubmit(form);
  for (const name of ['brief_start', 'brief_submit', 'brief_success']) {
    const events = find(calls, name);
    assert(`${name} still fires for the generic form`, events.length === 1, JSON.stringify(calls));
    assert(
      `${name} carries no service_id/service_category`,
      events.length === 1 && !('service_id' in events[0].params) && !('service_category' in events[0].params),
      JSON.stringify(events)
    );
  }
  assert('no service_engage for the generic form', find(calls, 'service_engage').length === 0, JSON.stringify(calls));
});

await group('A3 · Negative control: no analytics, no throw, legacy intact', async () => {
  let threw = null;
  let outcome = null;
  try {
    const { form, calls } = loadIntake({ ctx: 'intake_automation', withAnalytics: false });
    fireInput(form, form._controls[0]);
    await fireSubmit(form);
    outcome = calls;
  } catch (err) {
    threw = err;
  }
  assert('no error without ttAnalytics', threw === null, String(threw));
  const canonical = (outcome || []).filter((c) => CANONICAL.has(c.name));
  assert('no canonical calls without ttAnalytics', canonical.length === 0, JSON.stringify(outcome));
  assert(
    'legacy form_start still fires without ttAnalytics',
    find(outcome || [], 'form_start').length === 1,
    JSON.stringify(outcome)
  );
});

// ─── Summary ────────────────────────────────────────────────────────────────

console.log(`\n${passed} passed, ${failed} failed`);
if (failures.length) {
  console.log(`Failures: ${failures.join(', ')}`);
  process.exit(1);
}
