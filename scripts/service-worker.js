// O build injeta a revisão e os arquivos da mesma publicação.
const REVISION = __REVISION__;
const FILES = __FILES__;
const ROOT = new URL(self.registration.scope);
const PREFIX = `db-legado-${encodeURIComponent(ROOT.pathname)}-`;
const CACHE = PREFIX + REVISION;
const urls = FILES.map((file) => new URL(file, ROOT).href);
const allowed = new Set(urls);

self.addEventListener("install", (event) => {
  // Instalação atômica: se faltar um recurso, a versão anterior continua ativa.
  event.waitUntil(caches.open(CACHE).then((cache) =>
    cache.addAll(urls.map((url) => new Request(url, { cache: "reload" }))),
  ));
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((key) => key.startsWith(PREFIX) && key !== CACHE)
      .map((key) => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "ACTIVATE_UPDATE") event.waitUntil(self.skipWaiting());
  if (event.data?.type === "CHECK_OFFLINE" && event.ports?.[0]) {
    event.waitUntil((async () => {
      try {
        const cache = await caches.open(CACHE);
        const present = await Promise.all(urls.map((url) => cache.match(url)));
        event.ports[0].postMessage({ complete: present.every(Boolean) });
      } catch { event.ports[0].postMessage({ complete: false }); }
    })());
  }
});

async function respond(request, key) {
  let cache, saved;
  try { cache = await caches.open(CACHE); saved = await cache.match(key); }
  catch { /* Armazenamento negado não pode bloquear a rede. */ }
  // Imagens fazem parte do snapshot; uma nova publicação renova seu cache.
  if (request.destination === "image" && saved) return saved;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4000);
  try {
    const response = await fetch(request, { signal: controller.signal, cache: "no-cache" });
    if (response.status >= 500) throw new Error("Servidor indisponível");
    // Recompõe os recursos visitados se o sistema tiver removido o cache.
    if (cache && response.ok && !response.redirected && allowed.has(key)) {
      try { await cache.put(key, response.clone()); } catch { /* Falta de espaço não impede a leitura online. */ }
    }
    return response;
  } catch {
    if (saved) return saved;
    if (request.mode === "navigate") {
      let fallback;
      try { fallback = await cache?.match(new URL("offline.html", ROOT).href); } catch { /* Cache indisponível. */ }
      if (fallback) return Response.redirect(new URL("offline.html", ROOT).href);
    }
    return new Response("Recurso indisponível sem conexão.", { status: 503 });
  } finally {
    clearTimeout(timeout);
  }
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== ROOT.origin || !url.pathname.startsWith(ROOT.pathname)) return;
  url.search = "";
  url.hash = "";
  if (url.pathname === ROOT.pathname) url.pathname += "index.html";
  // URLs externas, outros projetos e recursos novos não entram no cache.
  if (!allowed.has(url.href) && request.mode !== "navigate") return;
  event.respondWith(respond(request, url.href));
});
