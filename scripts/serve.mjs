import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
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
export function createStaticServer(directory = "dist") {
  const root = path.resolve(directory);
  return http.createServer((req, res) => {
    let name;
    try { name = decodeURIComponent(new URL(req.url, "http://localhost").pathname); }
    catch {
      res.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Endereço inválido");
      return;
    }
    if (name.includes("\0")) { res.writeHead(400); res.end("Endereço inválido"); return; }
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
      res.end(req.method === "HEAD" ? undefined : err ? "Página não encontrada" : data);
    });
  });
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  createStaticServer().listen(4173, "127.0.0.1", () =>
    console.log("Local: http://127.0.0.1:4173/"),
  );
}
