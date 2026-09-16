import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_DIR = path.resolve(__dirname, '../dist');
const DOC_PATH = path.resolve(__dirname, '../docs/cloudflare-security-headers.md');

// Pages to check independently. Gateway (dist/index.html) only if present.
const REQUIRED_PAGES = ['en/index.html'];
const OPTIONAL_PAGES = ['index.html'];

function extractFirstDataLayerStub(html) {
  const regex = /<script([^>]*)>([\s\S]*?)<\/script\s*>/gi;
  let match;
  while ((match = regex.exec(html)) !== null) {
    const attrs = match[1] || '';
    if (/\bsrc\s*=/i.test(attrs)) continue;
    const inner = match[2];
    if (inner.includes('window.dataLayer')) return inner;
  }
  return null;
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

  const pages = [...REQUIRED_PAGES];
  for (const rel of OPTIONAL_PAGES) {
    try {
      await fs.access(path.join(DIST_DIR, rel));
      pages.push(rel);
    } catch {
      // gateway absent — skip, per spec ("if present")
    }
  }

  let failed = false;
  for (const rel of pages) {
    const abs = path.join(DIST_DIR, rel);
    let html;
    try {
      html = await fs.readFile(abs, 'utf-8');
    } catch (err) {
      console.error(`MISMATCH computed=<none> pinned=[${pinned.join(',')}] (${rel}: cannot read built file — did you run npm run build? ${err.message})`);
      failed = true;
      continue;
    }
    const stub = extractFirstDataLayerStub(html);
    if (stub === null) {
      console.error(`MISMATCH computed=<none> pinned=[${pinned.join(',')}] (${rel}: no inline <script> containing window.dataLayer found in dist output)`);
      failed = true;
      continue;
    }
    const hash = sha256Base64(stub);
    if (pinned.includes(hash)) {
      console.log(`CSP HASH MATCH ${hash} (${rel})`);
    } else {
      console.error(`MISMATCH computed=${hash} pinned=[${pinned.join(',')}] (${rel})`);
      failed = true;
    }
  }

  process.exit(failed ? 1 : 0);
}

main();
