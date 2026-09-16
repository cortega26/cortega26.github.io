#!/usr/bin/env node
/**
 * Sprint 0 (corrected) analytics tests — service/lead funnel semantics for
 * tooltician.com, a consulting/portfolio site with productized services.
 *
 * Run: node tests/analytics-service-funnel.mjs
 *
 * Loads public/assets/js/product-analytics.js (window.ttAnalytics) and
 * public/assets/js/track.js in a `vm` sandbox with faked
 * window/document/navigator and asserts: no tool_* canonical vocabulary,
 * service registry parity, event construction, deduplication, sanitization,
 * DNT/GPC suppression, error normalization, the brief lifecycle, specific
 * commercial-intent actions, and that no sensitive form values are read or
 * transmitted. No network, no browser, no GA4 ID required.
 */
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import vm from 'vm';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (rel) => readFileSync(join(ROOT, rel), 'utf8');

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
  fn();
}

class FakeElement {
  constructor({ tag = 'DIV', attrs = {}, scopeId = null } = {}) {
    this.tagName = tag;
    this.attrs = { ...attrs };
    this.scopeId = scopeId;
    this.href = attrs.href || '';
  }
  getAttribute(name) {
    if (name === 'data-service-id' && this.scopeId) return this.scopeId;
    return Object.prototype.hasOwnProperty.call(this.attrs, name) ? this.attrs[name] : null;
  }
  hasAttribute(name) {
    return Object.prototype.hasOwnProperty.call(this.attrs, name);
  }
  closest(selector) {
    const parts = selector.split(',').map((s) => s.trim());
    for (const part of parts) {
      if (part === 'a' || part === 'button') {
        if (this.tagName === 'A' || this.tagName === 'BUTTON') return this;
        continue;
      }
      const m = part.match(/^\[([^\]]+)\]$/);
      if (m && this.hasAttribute(m[1])) return this;
    }
    if (this.scopeId) return new FakeElement({ tag: this.tagName, attrs: { 'data-service-id': this.scopeId } });
    return null;
  }
}

/** Build a sandbox, run product-analytics.js in it, return handles. */
function loadAnalytics(opts = {}) {
  const calls = [];
  const listeners = {};
  const host = opts.host ?? 'tooltician.com';
  const scopeEl = opts.serviceScope
    ? { getAttribute: (n) => (n === 'data-service-id' ? opts.serviceScope : null) }
    : null;
  const sandbox = {
    console,
    URL,
    Element: FakeElement,
    navigator: { doNotTrack: opts.dnt, globalPrivacyControl: opts.gpc },
    document: {
      readyState: 'complete',
      querySelector: (sel) => (sel === '[data-service-id]' ? scopeEl : null),
      addEventListener: (name, fn) => {
        listeners[name] = listeners[name] || [];
        listeners[name].push(fn);
      },
    },
  };
  sandbox.window = {
    location: { hostname: host, protocol: host === '' ? 'file:' : 'https:', origin: `https://${host}` },
    ttTrack: (name, params) => calls.push({ name, params }),
  };
  if (opts.noAnalytics) sandbox.window.__TT_NO_ANALYTICS__ = true;
  sandbox.globalThis = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(read('public/assets/js/product-analytics.js'), sandbox, { filename: 'product-analytics.js' });
  return { sandbox, api: sandbox.window.ttAnalytics, calls, listeners };
}

function fireClick(listeners, el) {
  for (const h of listeners.click || []) h({ target: el });
}

// ─── Tests ──────────────────────────────────────────────────────────────────

group('S1 · No tool_* canonical vocabulary', () => {
  const product = read('public/assets/js/product-analytics.js');
  const intake = read('public/assets/js/intake-form.js');
  const contact = read('public/assets/js/contact-section.js');
  const track = read('public/assets/js/track.js');
  const registryRaw = read('src/data/service-registry.json');
  for (const [file, src] of [['product-analytics.js', product], ['intake-form.js', intake], ['contact-section.js', contact]]) {
    assert(`${file} has no tool_ identifiers`, !src.includes('tool_'), file);
    assert(`${file} has no ttProduct references`, !src.includes('ttProduct'), file);
  }
  assert('track.js allowlist has no tool_* params', !/'tool_id'|'tool_category'|'action_type'|'page_path'|'execution_mode'|'execution_stage'/.test(track), 'stale param');
  assert('registry uses service_* keys', registryRaw.includes('"service_id"') && registryRaw.includes('"service_category"') && !registryRaw.includes('tool_'), 'registry keys');
  const { api } = loadAnalytics();
  assert(
    'all canonical event names are service/lead vocabulary',
    Object.keys(api._internals.EVENTS).every((e) => !e.startsWith('tool_') && e !== 'result_action'),
    JSON.stringify(Object.keys(api._internals.EVENTS))
  );
});

group('S2 · Service registry parity (JSON ↔ client)', () => {
  const registry = JSON.parse(read('src/data/service-registry.json'));
  const { api } = loadAnalytics();
  const clientIds = Object.keys(api._internals.SERVICE_REGISTRY).sort();
  const jsonIds = registry.services.map((t) => t.service_id).sort();
  assert('same service_id set in JSON and client', JSON.stringify(clientIds) === JSON.stringify(jsonIds), `${clientIds} vs ${jsonIds}`);
  for (const t of registry.services) {
    assert(`category matches for ${t.service_id}`, api._internals.SERVICE_REGISTRY[t.service_id] === t.service_category);
    assert(`routes present for ${t.service_id}`, !!t.route_en && !!t.route_es, JSON.stringify(t));
  }
  assert('registry has 6 services', registry.services.length === 6, `got ${registry.services.length}`);
  assert('service_ids unique', new Set(jsonIds).size === jsonIds.length);
});

group('S3 · Event construction (service discovery → lead)', () => {
  const { api, calls } = loadAnalytics();
  assert('serviceView sent', api.serviceView('automation').sent === true);
  assert(
    'service_view params exact, no page_path',
    calls[0].name === 'service_view' && calls[0].params.service_id === 'automation' &&
      calls[0].params.service_category === 'automation' && !('page_path' in calls[0].params),
    JSON.stringify(calls[0])
  );
  api.serviceEngage('htw');
  assert('service_engage carries htw/hygiene', calls[1].name === 'service_engage' && calls[1].params.service_category === 'hygiene', JSON.stringify(calls[1]));
  api.briefStart('automation');
  api.briefSubmit('automation');
  api.briefSuccess('automation');
  assert(
    'brief lifecycle carries service context',
    calls[2].name === 'brief_start' && calls[3].name === 'brief_submit' && calls[4].name === 'brief_success' &&
      calls[4].params.service_id === 'automation',
    JSON.stringify(calls.slice(2, 5))
  );
  api.briefStart(undefined);
  assert(
    'generic-surface brief_start omits service_id (never faked)',
    calls[5].name === 'brief_start' && !('service_id' in calls[5].params) && !('service_category' in calls[5].params),
    JSON.stringify(calls[5])
  );
  api.bookCall(undefined, 'hero');
  assert('book_call params', calls[6].name === 'book_call' && calls[6].params.cta_location === 'hero' && !('service_id' in calls[6].params), JSON.stringify(calls[6]));
  api.bookCall('web', 'web_brief');
  assert('scoped book_call keeps service', calls[7].params.service_id === 'web', JSON.stringify(calls[7]));
  api.emailCopy(undefined);
  api.proofClick('financial');
  api.portfolioClick(undefined);
  api.cvDownload();
  api.templateOpen('htw');
  api.languageSelect();
  api.contactIntent('send_brief', 'hero', undefined);
  const names = calls.slice(8).map((c) => c.name);
  assert(
    'intent actions emit with truthful names',
    JSON.stringify(names) === JSON.stringify(['email_copy', 'proof_click', 'portfolio_click', 'cv_download', 'template_open', 'language_select', 'contact_intent']),
    JSON.stringify(names)
  );
  assert('proof_click scoped', calls[9].params.service_id === 'financial', JSON.stringify(calls[9]));
  assert('contact_intent type/location', calls[14].params.contact_type === 'send_brief' && calls[14].params.cta_location === 'hero', JSON.stringify(calls[14]));
});

group('S4 · Deduplication', () => {
  const { api, calls } = loadAnalytics();
  api.serviceView('automation');
  assert('second service_view suppressed', api.serviceView('automation').reason === 'duplicate_suppressed');
  api.serviceEngage('automation');
  api.serviceEngage('automation');
  api.briefStart('automation');
  api.briefStart('automation');
  api.briefStart(undefined);
  assert('view×1 engage×1 brief_start scoped×1 + generic×1', calls.length === 4, JSON.stringify(calls.map((c) => c.name)));
  api.briefSubmit('automation');
  api.briefSubmit('automation');
  api.briefSuccess('automation');
  assert('submit/success NOT deduped (every attempt counts)', calls.length === 7, `${calls.length}`);
});

group('S5 · Sanitization (behavior, not content)', () => {
  const { api, calls } = loadAnalytics();
  const before = calls.length;
  api.contactIntent('book_call', 'hero', undefined);
  assert('unknown contact_type rejected', calls.length === before, JSON.stringify(calls));
  api.contactIntent('send_brief', 'api_key=SECRET', undefined);
  assert('secret-like cta_location dropped → rejected', calls.length === before, JSON.stringify(calls));
  api.contactIntent('email', 'user@example.com', undefined);
  assert('email-like value dropped → rejected', calls.length === before, JSON.stringify(calls));
  api.bookCall(undefined, 'x'.repeat(500));
  assert('long values truncated to 100', calls[calls.length - 1].params.cta_location.length === 100);
  const r = api.serviceView('nonexistent');
  assert('unknown service rejected (never faked)', r.sent === false && r.reason === 'missing_params', JSON.stringify(r));
  const forged = api._internals.buildParams('brief_success', { service_id: 'automation', service_category: 'EVIL' });
  assert('service_category always derives from registry', forged.service_category === 'automation', JSON.stringify(forged));
  assert('unknown event rejected', api._internals.buildParams('tool_view', {}) === null);
});

group('S6 · Environment suppression', () => {
  assert('DNT suppresses', loadAnalytics({ dnt: '1' }).api.serviceView('automation').reason === 'do_not_track');
  assert('GPC suppresses', loadAnalytics({ gpc: true }).api.briefSuccess('web').reason === 'global_privacy_control');
  const local = loadAnalytics({ host: 'localhost' });
  assert('localhost suppresses', local.api.serviceView('automation').reason === 'local_host' && local.calls.length === 0);
  const flag = loadAnalytics({ noAnalytics: true });
  assert('kill-switch suppresses', flag.api.bookCall(undefined, 'hero').reason === 'disabled_flag');
  assert('debug() reports suppression', flag.api.debug().suppressed === 1 && flag.api.debug().reasons.disabled_flag === 1, JSON.stringify(flag.api.debug()));
  const noTransport = loadAnalytics();
  delete noTransport.sandbox.window.ttTrack;
  assert('missing transport reported, not thrown', noTransport.api.serviceView('automation').reason === 'no_transport');
});

group('S7 · Error normalization (brief_error)', () => {
  const { api } = loadAnalytics();
  const cases = [
    [500, 'server', 'deliver'],
    [404, 'client', 'deliver'],
    ['network', 'network', 'deliver'],
    ['Timeout', 'network', 'deliver'],
    ['validation', 'validation', 'validate'],
    ['weird-unexpected-thing', 'server', 'deliver'],
  ];
  for (const [input, cat, stage] of cases) {
    const n = api.normalizeError(input);
    assert(`normalize ${JSON.stringify(input)} → ${cat}/${stage}`, n.error_category === cat && n.error_stage === stage, JSON.stringify(n));
  }
  const { api: api2, calls } = loadAnalytics();
  api2.briefError('automation', 500);
  assert(
    'brief_error carries error_category/error_stage + service',
    calls[0].name === 'brief_error' && calls[0].params.error_category === 'server' &&
      calls[0].params.error_stage === 'deliver' && calls[0].params.service_id === 'automation' &&
      !('execution_stage' in calls[0].params),
    JSON.stringify(calls[0])
  );
});

group('S8 · Declarative bindings', () => {
  const { calls, listeners } = loadAnalytics({ serviceScope: 'htw' });
  assert('auto service_view on service scope', calls.length === 1 && calls[0].name === 'service_view' && calls[0].params.service_id === 'htw', JSON.stringify(calls));
  const noscope = loadAnalytics();
  assert('no service scope → no auto view', noscope.calls.length === 0, `${noscope.calls.length}`);

  fireClick(listeners, new FakeElement({ tag: 'A', attrs: { href: '#x-form', 'data-service-engage': '' }, scopeId: 'web' }));
  assert('engage chip → service_engage only (no fake contact event)', calls[1].name === 'service_engage' && calls[1].params.service_id === 'web' && calls.length === 2, JSON.stringify(calls));

  fireClick(listeners, new FakeElement({ tag: 'A', attrs: { href: 'https://calendly.com/ciortega26', 'data-book-call': '', 'data-track-loc': 'hero' } }));
  assert('calendly CTA → book_call (distinct from brief)', calls[2].name === 'book_call' && calls[2].params.cta_location === 'hero', JSON.stringify(calls[2]));

  fireClick(listeners, new FakeElement({ tag: 'A', attrs: { href: '#contact', 'data-contact-intent': 'send_brief', 'data-track-loc': 'hero' } }));
  assert('brief nav → contact_intent send_brief', calls[3].name === 'contact_intent' && calls[3].params.contact_type === 'send_brief', JSON.stringify(calls[3]));

  // Proof container: external link counts, internal does not, no URL leaks.
  const proofScope = new FakeElement({ tag: 'DIV', attrs: { 'data-proof-click': '' }, scopeId: 'automation' });
  const extLink = new FakeElement({ tag: 'A', attrs: { href: 'https://github.com/cortega26/chile-hub' } });
  extLink.closest = (sel) => {
    if (sel.includes('data-proof-click')) return proofScope;
    if (sel === 'a') return extLink;
    if (sel === '[data-service-id]') return { getAttribute: () => 'automation' };
    return null;
  };
  fireClick(listeners, extLink);
  assert('outbound proof link → proof_click with service', calls[4].name === 'proof_click' && calls[4].params.service_id === 'automation', JSON.stringify(calls[4]));
  assert('no href or text in params', !('href' in calls[4].params) && !('label' in calls[4].params), JSON.stringify(calls[4].params));

  fireClick(listeners, new FakeElement({ tag: 'A', attrs: { href: '/assets/docs/carlos-ortega-resume.pdf', 'data-cv-download': '' } }));
  assert('CV link → cv_download', calls[5].name === 'cv_download', JSON.stringify(calls[5]));
  fireClick(listeners, new FakeElement({ tag: 'A', attrs: { href: '/en/', 'data-language-select': '' } }));
  assert('gateway choice → language_select', calls[6].name === 'language_select', JSON.stringify(calls[6]));
  fireClick(listeners, new FakeElement({ tag: 'A', attrs: { href: 'https://github.com/x', } }));
  assert('unstamped outbound link ignored (no generic open)', calls.length === 7, `${calls.length}`);
});

group('S9 · track.js transport (legacy intact, truthful pass-through)', () => {
  const gtagCalls = [];
  const sandbox = { console, document: { addEventListener: () => {} }, window: {} };
  sandbox.window = sandbox;
  sandbox.globalThis = sandbox;
  sandbox.setInterval = () => 0;
  sandbox.clearInterval = () => {};
  vm.createContext(sandbox);
  vm.runInContext(read('public/assets/js/track.js'), sandbox, { filename: 'track.js' });
  assert('ttTrack exposed', typeof sandbox.ttTrack === 'function');
  sandbox.gtag = (...args) => gtagCalls.push(args);
  sandbox.ttTrack('cta_book_call', { location: 'hero', label: 'Book' });
  assert('legacy tt_* mapping intact', gtagCalls[0][2].tt_location === 'hero' && gtagCalls[0][2].tt_label === 'Book', JSON.stringify(gtagCalls[0]));
  sandbox.ttTrack('brief_success', { service_id: 'automation', service_category: 'automation' });
  assert('service params pass through', gtagCalls[1][2].service_id === 'automation' && gtagCalls[1][2].service_category === 'automation', JSON.stringify(gtagCalls[1]));
  sandbox.ttTrack('brief_success', { service_id: 'automation', tool_id: 'x', page_path: '/y', action_type: 'z', sneaky: 1 });
  assert('tool_*/page_path/action_type/non-strings dropped', !('tool_id' in gtagCalls[2][2]) && !('page_path' in gtagCalls[2][2]) && !('action_type' in gtagCalls[2][2]) && !('sneaky' in gtagCalls[2][2]), JSON.stringify(gtagCalls[2]));
});

group('S10 · Static privacy guards', () => {
  const product = read('public/assets/js/product-analytics.js');
  const intake = read('public/assets/js/intake-form.js');
  for (const [file, src] of [['product-analytics.js', product]]) {
    assert(`${file} never touches form data`, !src.includes('FormData') && !src.includes("querySelector('input") && !src.includes('querySelector("input'), file);
  }
  assert('intake reads FormData only for delivery, never for analytics', intake.includes('new FormData(form)') && !/ttAnalytics\.\w+\([^)]*FormData/.test(intake), 'FormData leak');
  const failArgs = [...intake.matchAll(/funnel\('briefError', serviceIdForForm\(ctx, form\)(, ([^)]+))?\)/g)].map((m) => m[2]);
  assert(
    'briefError detail args are status-only',
    failArgs.length > 0 && failArgs.every((a) => a === undefined || ["response.status", "'network'", "'validation'"].includes(a.trim())),
    JSON.stringify(failArgs)
  );
  assert('no stack-trace property access', !product.includes('.stack') && !intake.includes('.stack'), 'err.stack');
  assert('no storage reads in analytics', !product.includes('localStorage') && !product.includes('document.cookie'), 'storage');
  assert('no clipboard capture in analytics', !product.includes('clipboard') && !product.includes('writeText'), 'capture');
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed) {
  console.error(`Failures: ${failures.join(', ')}`);
  process.exit(1);
}
