import http from "node:http";
import fs from "node:fs";
import path from "node:path";
const root = path.resolve("dist");
const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css",
  ".js": "text/javascript",
  ".json": "application/json",
  ".webmanifest": "application/manifest+json",
  ".webp": "image/webp",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
};
http
  .createServer((req, res) => {
    const name = decodeURIComponent(
      new URL(req.url, "http://localhost").pathname,
    );
    const file = path.resolve(
      root,
      "." + name + (name.endsWith("/") ? "index.html" : ""),
    );
    if (!file.startsWith(root + path.sep)) {
      res.writeHead(403);
      res.end();
      return;
    }
    fs.readFile(file, (err, data) => {
      res.writeHead(err ? 404 : 200, {
        "Content-Type": types[path.extname(file)] || "text/plain",
      });
      res.end(err ? "Página não encontrada" : data);
    });
  })
  .listen(4173, "127.0.0.1", () =>
    console.log("Local: http://127.0.0.1:4173/"),
  );
