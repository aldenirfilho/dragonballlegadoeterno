import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const workerCode = fs.readFileSync("dist/sw.js", "utf8");
function worker(scope = "https://example.test/dragonballlegadoeterno/") {
  const events = {}, stores = new Map();
  let online = true, claimed = false, skipped = false;
  const cacheFor = (name) => {
    if (!stores.has(name)) stores.set(name, new Map());
    const store = stores.get(name);
    return {
      addAll: async (requests) => {
        if (!online) throw new Error("offline");
        for (const request of requests) store.set(request.url, new Response("salvo:" + request.url));
      },
      match: async (key) => store.get(key)?.clone(),
      put: async (key, response) => { store.set(key, response.clone()); },
    };
  };
  const self = {
    registration: { scope },
    addEventListener: (name, fn) => { events[name] = fn; },
    clients: { claim: async () => { claimed = true; } },
    skipWaiting: async () => { skipped = true; },
  };
  vm.runInNewContext(workerCode, {
    self, URL, Request, Response, AbortController, setTimeout, clearTimeout,
    caches: { open: async (key) => cacheFor(key), keys: async () => [...stores.keys()], delete: async (key) => stores.delete(key) },
    fetch: async (request) => {
      if (!online) throw new Error("offline");
      return new Response("rede:" + request.url, { status: request.url.includes("ausente") ? 404 : 200 });
    },
  });
  const dispatch = async (type, properties = {}) => {
    const pending = [];
    events[type]({ ...properties, waitUntil: (promise) => pending.push(promise) });
    await Promise.all(pending);
  };
  const fetchPage = async (relative, properties = {}) => {
    let response;
    events.fetch({ request: { url: new URL(relative, scope).href, method: "GET", mode: "navigate", ...properties }, respondWith: (r) => { response = r; } });
    return response;
  };
  return { stores, dispatch, fetchPage, setOnline: (value) => { online = value; }, get claimed() { return claimed; }, get skipped() { return skipped; } };
}

test("manifest e ícones permitem instalação tanto na raiz quanto no subdiretório", () => {
  const manifest = JSON.parse(fs.readFileSync("dist/manifest.webmanifest", "utf8"));
  assert.equal(manifest.display, "standalone");
  for (const base of ["https://example.test/", "https://example.test/dragonballlegadoeterno/"]) {
    assert.equal(new URL(manifest.scope, base).href, base);
    assert.equal(new URL(manifest.id, base).href, base);
    assert.equal(new URL(manifest.start_url, base).href, base + "index.html");
    for (const shortcut of manifest.shortcuts) assert.ok(new URL(shortcut.url, base).href.startsWith(base));
  }
  for (const icon of [...manifest.icons, { src: "icons/apple-touch-icon.png", sizes: "180x180" }, { src: "icons/favicon-32.png", sizes: "32x32" }]) {
    const data = fs.readFileSync("dist/" + icon.src);
    assert.equal(data.subarray(1, 4).toString(), "PNG");
    assert.equal(`${data.readUInt32BE(16)}x${data.readUInt32BE(20)}`, icon.sizes);
  }
  for (const page of fs.readdirSync("dist").filter((f) => f.endsWith(".html"))) {
    const html = fs.readFileSync("dist/" + page, "utf8");
    assert.ok(html.includes('rel="manifest"'), page);
    assert.ok(html.includes('rel="apple-touch-icon"'), page);
    assert.ok(html.includes('src="pwa.js"'), page);
  }
});

test("snapshot contém páginas e imagens reais e mantém navegação e busca sem rede", async () => {
  for (const scope of ["https://example.test/", "https://example.test/dragonballlegadoeterno/"]) {
    const w = worker(scope);
    await w.dispatch("install");
    const cache = [...w.stores.values()][0];
    for (const url of cache.keys()) {
      const file = url.slice(scope.length);
      assert.ok(fs.existsSync("dist/" + file), file);
    }
    assert.ok(cache.has(scope + "goku.html"));
    assert.ok(cache.has(scope + "images/hero.jpg"));
    w.setOnline(false);
    assert.equal(await (await w.fetchPage("./")).text(), "salvo:" + scope + "index.html");
    assert.equal(await (await w.fetchPage("busca.html?q=goku")).text(), "salvo:" + scope + "busca.html");
    assert.equal(await (await w.fetchPage("images/hero.jpg", { mode: "cors", destination: "image" })).text(), "salvo:" + scope + "images/hero.jpg");
    assert.equal((await w.fetchPage("pasta/nova-pagina.html")).headers.get("location"), scope + "offline.html");
  }
});

test("rede tem prioridade para notícias; 404 não é mascarado pelo cache", async () => {
  const w = worker();
  await w.dispatch("install");
  assert.match(await (await w.fetchPage("noticias.html")).text(), /^rede:/);
  assert.equal((await w.fetchPage("ausente.html")).status, 404);
});

test("worker ignora outros projetos, origens, POST e recursos fora da lista", async () => {
  const w = worker();
  assert.equal(await w.fetchPage("https://official.test/news"), undefined);
  assert.equal(await w.fetchPage("/outro-projeto/index.html"), undefined);
  assert.equal(await w.fetchPage("/dragonballlegadoeterno-falso/index.html"), undefined);
  assert.equal(await w.fetchPage("index.html", { method: "POST" }), undefined);
  assert.equal(await w.fetchPage("build-info.json", { mode: "cors" }), undefined);
});

test("ativação limpa apenas caches deste escopo e atualização exige mensagem", async () => {
  const w = worker();
  await w.dispatch("install");
  const current = [...w.stores.keys()][0];
  const prefix = current.slice(0, current.lastIndexOf("-") + 1);
  w.stores.set(prefix + "antigo", new Map());
  w.stores.set("outro-projeto", new Map());
  await w.dispatch("activate");
  assert.ok(w.stores.has(current));
  assert.ok(w.stores.has("outro-projeto"));
  assert.ok(!w.stores.has(prefix + "antigo"));
  assert.equal(w.claimed, true);
  assert.equal(w.skipped, false);
  await w.dispatch("message", { data: { type: "IGNORAR" } });
  assert.equal(w.skipped, false);
  await w.dispatch("message", { data: { type: "ACTIVATE_UPDATE" } });
  assert.equal(w.skipped, true);
});

test("falha no download rejeita instalação sem apagar cache anterior", async () => {
  const w = worker();
  w.stores.set("db-legado-%2Fdragonballlegadoeterno%2F-anterior", new Map());
  w.setOnline(false);
  await assert.rejects(w.dispatch("install"), /offline/);
  assert.ok(w.stores.has("db-legado-%2Fdragonballlegadoeterno%2F-anterior"));
});

test("cache removido é detectado e recursos visitados voltam a ser salvos", async () => {
  const w = worker();
  await w.dispatch("install");
  let complete;
  const check = () => w.dispatch("message", { data: { type: "CHECK_OFFLINE" }, ports: [{ postMessage: (value) => { complete = value.complete; } }] });
  await check();
  assert.equal(complete, true);
  w.stores.clear();
  await check();
  assert.equal(complete, false);
  await w.fetchPage("goku.html");
  w.setOnline(false);
  assert.match(await (await w.fetchPage("goku.html")).text(), /^rede:/);
});

function installUI() {
  const events = {}, buttonEvents = {};
  const button = { hidden: true, addEventListener: (name, fn) => { buttonEvents[name] = fn; } };
  const status = {}, offlineStatus = {}, notice = { hidden: true }, link = { hidden: false };
  const media = { matches: false, addEventListener: () => {} };
  const nodes = { "[data-install-app]": button, "[data-app-status]": status, "[data-offline-status]": offlineStatus };
  const navigator = { onLine: true };
  vm.runInNewContext(fs.readFileSync("public/pwa.js", "utf8"), {
    URL, navigator,
    window: { matchMedia: () => media, addEventListener: (name, fn) => { events[name] = fn; } },
    document: {
      currentScript: { src: "https://example.test/dragonballlegadoeterno/pwa.js" },
      querySelector: (name) => nodes[name],
      querySelectorAll: (name) => name === "[data-offline]" ? [notice] : [link],
    },
  });
  return { events, buttonEvents, button, status, offlineStatus, notice, navigator };
}

test("oferta de instalação aparece apenas após evento; recusa mantém instruções", async () => {
  const ui = installUI();
  assert.equal(ui.button.hidden, true);
  assert.match(ui.offlineStatus.textContent, /não está disponível/);
  let prevented = false, prompted = 0;
  ui.events.beforeinstallprompt({ preventDefault: () => { prevented = true; }, prompt: async () => { prompted++; }, userChoice: Promise.resolve({ outcome: "dismissed" }) });
  assert.equal(prevented, true);
  assert.equal(ui.button.hidden, false);
  await ui.buttonEvents.click();
  assert.equal(prompted, 1);
  assert.equal(ui.button.hidden, true);
  assert.match(ui.status.textContent, /instalar depois/);
  ui.navigator.onLine = false;
  ui.events.offline();
  assert.equal(ui.notice.hidden, false);
  ui.events.appinstalled();
  assert.match(ui.status.textContent, /Aplicativo instalado/);
});
