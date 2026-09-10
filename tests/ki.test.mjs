import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import http from "node:http";
import { validateKi } from "../scripts/ki-page.mjs";
import { createStaticServer } from "../scripts/serve.mjs";
const ki = JSON.parse(fs.readFileSync("content/ki.json", "utf8"));

test("atlas mantém referências válidas, sinais e ausência de números", () => {
  assert.deepEqual(validateKi(ki), []);
  const original = JSON.parse(fs.readFileSync("content/encyclopedia.json", "utf8"));
  for (const c of original.characters) assert.ok(ki.records.some((r) => r.character === c.id), c.id);
  const broken = structuredClone(ki);
  broken.records[0].value = 0;
  broken.records[1].character = "personagem-ausente";
  broken.records[2].sources = [];
  assert.equal(validateKi(broken).length, 3);
  assert.equal(ki.records.find((r) => r.id === "nappa-goku-1").comparison, ">");
  assert.equal(ki.records.find((r) => r.id === "freeza-formas-freeza-2").comparison, ">");
  assert.equal(ki.records.find((r) => r.id === "super-hero-gohan-1").value, null);
});

test("atlas, busca global e pacote offline contêm os novos registros", () => {
  const page = fs.readFileSync("dist/ki.html", "utf8");
  const search = fs.readFileSync("dist/busca.html", "utf8");
  const worker = fs.readFileSync("dist/sw.js", "utf8");
  for (const row of ki.records) {
    assert.ok(page.includes(`id="registro-${row.id}"`), row.id);
    assert.ok(search.includes(`ki.html#registro-${row.id}`), row.id);
  }
  for (const file of ["ki.html", "ki.js", "ki.css", "ki-dados.json"]) assert.ok(worker.includes(`"${file}"`), file);
  assert.deepEqual(JSON.parse(fs.readFileSync("dist/ki-dados.json", "utf8")), ki);
});

function harness(address = "https://example.test/ki.html") {
  const eventNode = (extra = {}) => ({ events: {}, hidden: false, addEventListener(n, fn) { this.events[n] = fn; }, ...extra });
  const options = (values, value = "") => eventNode({ value, options: values.map((v) => ({ value: v })) });
  const character = options(["", "goku", "gohan"]), phase = options(["", "raditz", "ginyu"]), evidence = options(["", "confirmado", "sem-numero"]), query = eventNode({ value: "" });
  const inputs = { "[data-ki-character]": character, "[data-ki-phase]": phase, "[data-ki-evidence]": evidence, "[data-ki-query]": query };
  const form = eventNode({ querySelector: (s) => inputs[s] });
  const cards = [
    eventNode({ id: "registro-raditz-gohan-1", dataset: { character: "gohan", phase: "raditz", evidence: "confirmado", term: "Gohan explosão de raiva" } }),
    eventNode({ id: "registro-ginyu-goku-1", dataset: { character: "goku", phase: "ginyu", evidence: "confirmado", term: "Goku energia contida" } }),
    eventNode({ id: "registro-raditz-goku-1", dataset: { character: "goku", phase: "raditz", evidence: "sem-numero", term: "Goku aliança" } }),
  ];
  cards.forEach((c) => { c.scrollIntoView = () => { c.scrolled = true; }; });
  const first = eventNode({ value: "" }), second = eventNode({ value: "" });
  const result = { children: [], replaceChildren() { this.children = []; }, append(node) { this.children.push(node); } };
  const panel = eventNode({ querySelector: (s) => s === "[data-ki-comparison]" ? result : s.includes("compare-a") ? first : second });
  const count = {}, empty = eventNode(), share = eventNode(), message = {}, copy = eventNode();
  const nodes = { "[data-ki-filters]": form, "[data-ki-grid]": {}, "[data-ki-count]": count, "[data-ki-message]": message, "[data-ki-empty]": empty, "[data-ki-share]": share, "[data-ki-copy]": copy, "[data-ki-compare]": panel, "[data-ki-comparison]": result };
  let url = new URL(address);
  const location = { get href() { return url.href; }, get search() { return url.search; }, get hash() { return url.hash; } };
  const events = {};
  vm.runInNewContext(fs.readFileSync("public/ki.js", "utf8"), {
    URL, URLSearchParams, location,
    history: { replaceState: (_, __, next) => { url = new URL(next); } },
    window: { addEventListener: (n, fn) => { events[n] = fn; } },
    navigator: {},
    document: { querySelector: (s) => nodes[s], querySelectorAll: () => cards, createElement: () => ({}) },
  });
  return { form, cards, character, phase, evidence, query, count, empty, first, second, result, get url() { return url; } };
}

test("filtros combinam personagem, fase, evidência e busca sem acento", () => {
  const ui = harness();
  assert.equal(ui.count.textContent, "2 de 3 registros");
  ui.character.value = "gohan"; ui.phase.value = "raditz"; ui.evidence.value = "confirmado"; ui.query.value = "EXPLOSAO";
  ui.form.events.input();
  assert.equal(ui.count.textContent, "1 de 3 registros");
  assert.equal(ui.cards[0].hidden, false);
  assert.equal(ui.url.searchParams.get("personagem"), "gohan");
  ui.query.value = "sem correspondência"; ui.form.events.input();
  assert.equal(ui.empty.hidden, false);
  ui.form.events.reset({ preventDefault() {} });
  assert.equal(ui.count.textContent, "3 de 3 registros");
  assert.equal(ui.url.searchParams.get("personagem"), "");
});

test("link de um registro revela a ficha e comparador rejeita escolhas iguais", () => {
  const ui = harness("https://example.test/ki.html?personagem=goku#registro-raditz-gohan-1");
  assert.equal(ui.character.value, "gohan");
  assert.equal(ui.phase.value, "raditz");
  assert.equal(ui.cards[0].hidden, false);
  assert.equal(ui.cards[0].scrolled, true);
  ui.first.value = ui.second.value = "raditz-gohan-1";
  ui.first.events.change();
  assert.match(ui.result.children[0].textContent, /diferentes/);
});

test("servidor rejeita URL inválida sem cair e respeita requisição HEAD", async () => {
  const server = createStaticServer();
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const request = (path, method = "GET") => new Promise((resolve, reject) => {
    const req = http.request({ hostname: "127.0.0.1", port: server.address().port, path, method }, (res) => {
      let body = ""; res.on("data", (chunk) => { body += chunk; }); res.on("end", () => resolve({ status: res.statusCode, body }));
    }); req.on("error", reject); req.end();
  });
  try {
    assert.equal((await request("/%E0%A4%A")).status, 400);
    assert.equal((await request("/%00")).status, 400);
    assert.equal((await request("/ki.html")).status, 200);
    assert.equal((await request("/ki.html", "HEAD")).body, "");
  } finally { await new Promise((resolve) => server.close(resolve)); }
});
