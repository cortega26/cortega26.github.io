// Serve the exact static artifact, including security headers, for browser QA.
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { resolve, extname, sep } from "node:path";

/**
 * `loopbackHarness` is only for the E2E harness, which serves plain HTTP on
 * loopback: WebKit upgrades its asset requests to HTTPS when
 * `upgrade-insecure-requests` is present, unlike Chromium and Firefox. Only
 * that transport directive is dropped, and only on request, so the default
 * server keeps the production headers byte for byte.
 */
export async function serve(root, port = 4331, { loopbackHarness = false } = {}) {
  const directory = resolve(root);
  const headers = {};
  try {
    for (const line of (
      await readFile(resolve(directory, "_headers"), "utf8")
    ).split("\n")) {
      const match = line.match(/^  ([\w-]+): (.+)$/);
      if (match) headers[match[1]] = match[2];
    }
  } catch {}
  if (loopbackHarness && headers["Content-Security-Policy"])
    headers["Content-Security-Policy"] = headers["Content-Security-Policy"].replace(
      /;\s*upgrade-insecure-requests\b/,
      "",
    );
  const mime = {
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript",
    ".css": "text/css",
    ".svg": "image/svg+xml",
    ".png": "image/png",
    ".webp": "image/webp",
    ".woff2": "font/woff2",
    ".txt": "text/plain",
    ".xml": "application/xml",
  };
  const server = createServer(async (req, res) => {
    try {
      let path = decodeURIComponent(
        new URL(req.url, "http://localhost").pathname,
      );
      if (path.endsWith("/")) path += "index.html";
      const file = resolve(directory, "." + path);
      if (!file.startsWith(directory + sep)) {
        res.writeHead(403).end();
        return;
      }
      const content = await readFile(file);
      res
        .writeHead(200, {
          ...headers,
          "Content-Type": mime[extname(file)] ?? "application/octet-stream",
        })
        .end(content);
    } catch {
      res.writeHead(404).end("Not found");
    }
  });
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, "127.0.0.1", resolve);
  });
  return server;
}
