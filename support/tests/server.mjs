// Serve the exact static artifact, including security headers, for browser QA.
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { resolve, extname, sep } from "node:path";
export async function serve(root, port = 4331) {
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
