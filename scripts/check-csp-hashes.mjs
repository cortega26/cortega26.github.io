import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_DIR = path.resolve(__dirname, '../dist');
const DOC_PATH = path.resolve(__dirname, '../docs/cloudflare-security-headers.md');

// Every built page is checked (plan 043): the old REQUIRED/OPTIONAL pair
// covered 2 of 30 pages, so a new inline script anywhere else shipped
// unverified. Measured 2026-09-28: 30 HTML pages, each with exactly one
// executable inline script (the GA4 stub).

function isExecutable(attrs) {
  if (/\bsrc\s*=/i.test(attrs)) return false;
  const type = attrs.match(/\btype\s*=\s*["']?([^"'\s>]+)/i);
  if (!type) return true;
  return /^(text\/javascript|module)$/i.test(type[1]);
}

function collectExecutableScripts(html) {
  const regex = /<script([^>]*)>([\s\S]*?)<\/script\s*>/gi;
  const out = [];
  let match;
  while ((match = regex.exec(html)) !== null) {
    const attrs = match[1] || '';
    if (!isExecutable(attrs)) continue;
    const inner = match[2];
    out.push({ attrs, inner, isStub: inner.includes('window.dataLayer') });
  }
  return out;
}

async function walkHtml(dir) {
  const files = [];
  let entries;
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch (err) {
    return { error: err };
  }
  entries.sort((a, b) => a.name.localeCompare(b.name));
  for (const entry of entries) {
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      const sub = await walkHtml(abs);
      if (sub.error) return sub;
      files.push(...sub.files);
    } else if (entry.name.endsWith('.html')) {
      files.push(abs);
    }
  }
  return { files };
}

function sha256Base64(text) {
  return 'sha256-' + createHash('sha256').update(text, 'utf8').digest('base64');
}

async function main() {
  let doc;
  try {
    doc = await fs.readFile(DOC_PATH, 'utf-8');
  } catch (err) {
    console.error(`MISMATCH computed=<none> pinned=[none] (cannot read CSP doc: ${err.message})`);
    process.exit(1);
  }
  const pinned = doc.match(/sha256-[A-Za-z0-9+/=]+/g) || [];
  if (pinned.length === 0) {
    console.error('MISMATCH computed=<none> pinned=[none] (no sha256 tokens in CSP doc)');
    process.exit(1);
  }

  const pages = await walkHtml(DIST_DIR);
  if (pages.error) {
    console.error(`MISMATCH computed=<none> pinned=[${pinned.join(',')}] (cannot read built dir — did you run npm run build? ${pages.error.message})`);
    process.exit(1);
  }
  if (pages.files.length === 0) {
    console.error(`MISMATCH computed=<none> pinned=[${pinned.join(',')}] (no built HTML found — did you run npm run build?)`);
    process.exit(1);
  }

  let failed = false;
  for (const abs of pages.files) {
    const rel = path.relative(DIST_DIR, abs);
    let html;
    try {
      html = await fs.readFile(abs, 'utf-8');
    } catch (err) {
      console.error(`MISMATCH computed=<none> pinned=[${pinned.join(',')}] (${rel}: cannot read built file — did you run npm run build? ${err.message})`);
      failed = true;
      continue;
    }
    const scripts = collectExecutableScripts(html);
    if (scripts.length === 0) {
      console.error(`MISMATCH computed=<none> pinned=[${pinned.join(',')}] (${rel}: no executable inline <script> found in dist output)`);
      failed = true;
      continue;
    }
    scripts.forEach(({ inner, isStub }, index) => {
      const hash = sha256Base64(inner);
      const label = scripts.length === 1 ? '' : ` [script ${index + 1}/${scripts.length}]`;
      const stubNote = isStub ? '' : ' (non-stub inline script)';
      if (pinned.includes(hash)) {
        console.log(`CSP HASH MATCH ${hash} (${rel})${label}`);
      } else {
        console.error(`MISMATCH computed=${hash} pinned=[${pinned.join(',')}] (${rel})${label}${stubNote}`);
        failed = true;
      }
    });
  }

  process.exit(failed ? 1 : 0);
}

main();
