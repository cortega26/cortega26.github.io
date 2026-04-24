#!/usr/bin/env node
/**
 * Generates public/assets/images/og-card.png using only Node.js built-ins.
 * Design: dark bg (#070d1a), purple-to-teal left accent bar, white text.
 *
 * Run: node scripts/generate-og.mjs
 */

import { deflateSync } from 'zlib';
import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const OUT  = join(ROOT, 'public/assets/images/og-card.png');

const W = 1200;
const H = 630;

// ── Color helpers ────────────────────────────────────────────────────────────

function hex(s) {
  const v = parseInt(s.replace('#', ''), 16);
  return [(v >> 16) & 0xff, (v >> 8) & 0xff, v & 0xff];
}

function lerp(a, b, t) {
  return Math.round(a + (b - a) * t);
}

function lerpColor(c1, c2, t) {
  return [lerp(c1[0], c2[0], t), lerp(c1[1], c2[1], t), lerp(c1[2], c2[2], t)];
}

// ── Pixel buffer ─────────────────────────────────────────────────────────────

const BG      = hex('#070d1a');
const SURFACE = hex('#0f1729');
const ACCENT1 = hex('#6c63ff');
const ACCENT2 = hex('#00d4aa');
const WHITE   = [232, 234, 246];
const MUTED   = [136, 146, 164];

// RGBA uint8 flat array
const pixels = new Uint8Array(W * H * 4);

function setPixel(x, y, r, g, b, a = 255) {
  if (x < 0 || x >= W || y < 0 || y >= H) return;
  const i = (y * W + x) * 4;
  pixels[i]     = r;
  pixels[i + 1] = g;
  pixels[i + 2] = b;
  pixels[i + 3] = a;
}

function fillRect(x0, y0, w, h, r, g, b, a = 255) {
  for (let y = y0; y < y0 + h; y++) {
    for (let x = x0; x < x0 + w; x++) {
      setPixel(x, y, r, g, b, a);
    }
  }
}

function fillRectGradV(x0, y0, w, h, c1, c2) {
  for (let y = y0; y < y0 + h; y++) {
    const t = (y - y0) / (h - 1 || 1);
    const [r, g, b] = lerpColor(c1, c2, t);
    for (let x = x0; x < x0 + w; x++) {
      setPixel(x, y, r, g, b);
    }
  }
}

// ── Bitmap font (7×9 per char, ASCII 32-126) ─────────────────────────────────
// Minimal 5×7 bitmap glyphs packed as 7-bit column data (bottom bit = top row)
// Generated from a hand-crafted 5-wide font.

const FONT5 = {
  ' ': [0,0,0,0,0],
  'A': [0x7e,0x09,0x09,0x09,0x7e],
  'B': [0x7f,0x49,0x49,0x49,0x36],
  'C': [0x3e,0x41,0x41,0x41,0x22],
  'D': [0x7f,0x41,0x41,0x41,0x3e],
  'E': [0x7f,0x49,0x49,0x49,0x41],
  'F': [0x7f,0x09,0x09,0x09,0x01],
  'G': [0x3e,0x41,0x49,0x49,0x7a],
  'H': [0x7f,0x08,0x08,0x08,0x7f],
  'I': [0x00,0x41,0x7f,0x41,0x00],
  'J': [0x20,0x40,0x41,0x3f,0x01],
  'K': [0x7f,0x08,0x14,0x22,0x41],
  'L': [0x7f,0x40,0x40,0x40,0x40],
  'M': [0x7f,0x02,0x04,0x02,0x7f],
  'N': [0x7f,0x04,0x08,0x10,0x7f],
  'O': [0x3e,0x41,0x41,0x41,0x3e],
  'P': [0x7f,0x09,0x09,0x09,0x06],
  'Q': [0x3e,0x41,0x51,0x21,0x5e],
  'R': [0x7f,0x09,0x19,0x29,0x46],
  'S': [0x46,0x49,0x49,0x49,0x31],
  'T': [0x01,0x01,0x7f,0x01,0x01],
  'U': [0x3f,0x40,0x40,0x40,0x3f],
  'V': [0x1f,0x20,0x40,0x20,0x1f],
  'W': [0x3f,0x40,0x38,0x40,0x3f],
  'X': [0x63,0x14,0x08,0x14,0x63],
  'Y': [0x07,0x08,0x70,0x08,0x07],
  'Z': [0x61,0x51,0x49,0x45,0x43],
  'a': [0x20,0x54,0x54,0x54,0x78],
  'b': [0x7f,0x48,0x44,0x44,0x38],
  'c': [0x38,0x44,0x44,0x44,0x20],
  'd': [0x38,0x44,0x44,0x48,0x7f],
  'e': [0x38,0x54,0x54,0x54,0x18],
  'f': [0x08,0x7e,0x09,0x01,0x02],
  'g': [0x0c,0x52,0x52,0x52,0x3e],
  'h': [0x7f,0x08,0x04,0x04,0x78],
  'i': [0x00,0x44,0x7d,0x40,0x00],
  'j': [0x20,0x40,0x44,0x3d,0x00],
  'k': [0x7f,0x10,0x28,0x44,0x00],
  'l': [0x00,0x41,0x7f,0x40,0x00],
  'm': [0x7c,0x04,0x18,0x04,0x78],
  'n': [0x7c,0x08,0x04,0x04,0x78],
  'o': [0x38,0x44,0x44,0x44,0x38],
  'p': [0x7c,0x14,0x14,0x14,0x08],
  'q': [0x08,0x14,0x14,0x18,0x7c],
  'r': [0x7c,0x08,0x04,0x04,0x08],
  's': [0x48,0x54,0x54,0x54,0x20],
  't': [0x04,0x3f,0x44,0x40,0x20],
  'u': [0x3c,0x40,0x40,0x20,0x7c],
  'v': [0x1c,0x20,0x40,0x20,0x1c],
  'w': [0x3c,0x40,0x30,0x40,0x3c],
  'x': [0x44,0x28,0x10,0x28,0x44],
  'y': [0x0c,0x50,0x50,0x50,0x3c],
  'z': [0x44,0x64,0x54,0x4c,0x44],
  '0': [0x3e,0x51,0x49,0x45,0x3e],
  '1': [0x00,0x42,0x7f,0x40,0x00],
  '2': [0x42,0x61,0x51,0x49,0x46],
  '3': [0x21,0x41,0x45,0x4b,0x31],
  '4': [0x18,0x14,0x12,0x7f,0x10],
  '5': [0x27,0x45,0x45,0x45,0x39],
  '6': [0x3c,0x4a,0x49,0x49,0x30],
  '7': [0x01,0x71,0x09,0x05,0x03],
  '8': [0x36,0x49,0x49,0x49,0x36],
  '9': [0x06,0x49,0x49,0x29,0x1e],
  '.': [0x00,0x60,0x60,0x00,0x00],
  ',': [0x00,0x50,0x30,0x00,0x00],
  '-': [0x08,0x08,0x08,0x08,0x08],
  '—': [0x08,0x08,0x08,0x08,0x08],
  ':': [0x00,0x36,0x36,0x00,0x00],
  '|': [0x00,0x00,0x7f,0x00,0x00],
  '(': [0x00,0x3e,0x41,0x41,0x00],
  ')': [0x00,0x41,0x41,0x3e,0x00],
  '/': [0x20,0x10,0x08,0x04,0x02],
  '&': [0x36,0x49,0x55,0x22,0x50],
  "'": [0x00,0x05,0x03,0x00,0x00],
  '·': [0x00,0x18,0x18,0x00,0x00],
};

function drawChar(ch, px, py, scale, color) {
  const cols = FONT5[ch] || FONT5[' '];
  for (let col = 0; col < 5; col++) {
    const colData = cols[col];
    for (let row = 0; row < 7; row++) {
      if (colData & (1 << row)) {
        for (let sy = 0; sy < scale; sy++) {
          for (let sx = 0; sx < scale; sx++) {
            setPixel(px + col * scale + sx, py + row * scale + sy, ...color);
          }
        }
      }
    }
  }
}

function drawText(text, px, py, scale, color) {
  const charW = (5 + 1) * scale;
  let cx = px;
  for (const ch of text) {
    drawChar(ch, cx, py, scale, color);
    cx += charW;
  }
  return cx;
}

function textWidth(text, scale) {
  return text.length * (5 + 1) * scale;
}

// ── Build image ───────────────────────────────────────────────────────────────

// Background
fillRect(0, 0, W, H, ...BG);

// Subtle surface panel (right 72%)
fillRect(Math.floor(W * 0.1), 0, Math.floor(W * 0.9), H, ...SURFACE);

// Left accent bar (gradient purple→teal)
fillRectGradV(0, 0, 12, H, ACCENT1, ACCENT2);

// Subtle right border line
fillRect(W - 2, 0, 2, H, ...ACCENT1.map(v => Math.round(v * 0.3)));

// Top separator line
fillRect(0, 0, W, 2, ...ACCENT1);

// Bottom separator line
fillRect(0, H - 2, W, 2, ...ACCENT2);

// ── Text rendering ────────────────────────────────────────────────────────────

const LEFT = 60;

// Name — large scale 4
const name = 'Carlos Ortega';
const nameW = textWidth(name, 4);
drawText(name, LEFT, 180, 4, WHITE);

// Role line — scale 3
const role = 'Python Automation Consultant';
drawText(role, LEFT, 260, 3, MUTED);

// Tagline — scale 2
const tag = 'ETL · Scraping · APIs · Automation';
drawText(tag, LEFT, 330, 2, MUTED.map(v => Math.round(v * 0.7)));

// Divider line
fillRect(LEFT, 395, 280, 2, ...ACCENT1);

// Domain — accent color, scale 3
const domain = 'tooltician.com';
drawText(domain, LEFT, 420, 3, ACCENT2);

// Location small
const loc = 'Santiago, Chile  ·  EN / ES';
drawText(loc, LEFT, 490, 2, MUTED.map(v => Math.round(v * 0.6)));

// ── Decorative corner dots ────────────────────────────────────────────────────
for (let i = 0; i < 6; i++) {
  fillRect(W - 80 + i * 12, H - 50, 6, 6, ...ACCENT1);
}

// ── PNG encode ────────────────────────────────────────────────────────────────

function crc32(buf) {
  let crc = 0xffffffff;
  const table = crc32.table || (crc32.table = (() => {
    const t = new Uint32Array(256);
    for (let i = 0; i < 256; i++) {
      let c = i;
      for (let j = 0; j < 8; j++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      t[i] = c;
    }
    return t;
  })());
  for (let i = 0; i < buf.length; i++) crc = table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function pngChunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])));
  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

// Build IHDR
const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(W, 0);
ihdr.writeUInt32BE(H, 4);
ihdr[8] = 8;   // bit depth
ihdr[9] = 2;   // color type: RGB
ihdr[10] = 0;  // compression
ihdr[11] = 0;  // filter
ihdr[12] = 0;  // interlace

// Build raw scanlines (filter byte 0 + RGB)
const scanlines = Buffer.alloc(H * (1 + W * 3));
for (let y = 0; y < H; y++) {
  const rowStart = y * (1 + W * 3);
  scanlines[rowStart] = 0; // filter: none
  for (let x = 0; x < W; x++) {
    const pi = (y * W + x) * 4;
    const si = rowStart + 1 + x * 3;
    scanlines[si]     = pixels[pi];
    scanlines[si + 1] = pixels[pi + 1];
    scanlines[si + 2] = pixels[pi + 2];
  }
}

const compressed = deflateSync(scanlines, { level: 9 });

const png = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), // signature
  pngChunk('IHDR', ihdr),
  pngChunk('IDAT', compressed),
  pngChunk('IEND', Buffer.alloc(0)),
]);

mkdirSync(join(ROOT, 'public/assets/images'), { recursive: true });
writeFileSync(OUT, png);
console.log(`✓ OG card written: ${OUT} (${(png.length / 1024).toFixed(1)} KB)`);
