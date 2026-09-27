import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Tests over the built site. They read support/dist and never produce it:
 * the dependency is declared by support:verify (check -> unit -> build -> artifact).
 */
const dist = join(import.meta.dirname, "..", "dist");
const artifacts = ["index.html", "robots.txt"];
const missing = artifacts.filter((file) => !existsSync(join(dist, file)));
const requiresBuild = missing.length
  ? `requiere npm run support:build (falta ${missing.map((f) => `dist/${f}`).join(", ")}); ejecuta npm run support:verify`
  : false;

test("preview output stays unindexed and has no live outbound WhatsApp", { skip: requiresBuild }, () => {
  const html = readFileSync(join(dist, "index.html"), "utf8");
  assert.match(html, /noindex, nofollow/);
  assert.match(html, /https:\/\/soporte.tooltician.com\//);
  assert.doesNotMatch(html, /href="https:\/\/wa.me\//);
  assert.equal((html.match(/<h1\b/g) ?? []).length, 1);
  assert.match(readFileSync(join(dist, "robots.txt"), "utf8"), /Disallow: \//);
});

test("built page ships the optimized portrait with sober alt text and no placeholder", { skip: requiresBuild }, () => {
  const html = readFileSync(join(dist, "index.html"), "utf8");
  assert.match(html, /<img[^>]+src="\/_astro\/[^"]*carlos-ortega[^"]*"/);
  assert.match(html, /alt="Carlos Ortega, responsable de Tooltician Soporte"/);
  assert.match(html, /srcset="[^"]+"/);
  assert.match(html, /width="400" height="400"/);
  assert.doesNotMatch(html, /identity-monogram/);
});
