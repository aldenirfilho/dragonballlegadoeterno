import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import { validateGlossary } from "../scripts/glossary-page.mjs";
import { validateKiImages } from "../scripts/ki-images.mjs";
const read = (name) => JSON.parse(fs.readFileSync(name, "utf8"));

test("dicionário e comparações têm significados, contexto e fontes", () => {
  const glossary = read("content/glossary.json");
  assert.deepEqual(validateGlossary(glossary), []);
  const broken = structuredClone(glossary);
  broken.entries[0].sources = [];
  broken.entries[1].category = "categoria-inventada";
  broken.comparisons[0].brazil = "";
  assert.equal(validateGlossary(broken).length, 3);
});

test("cada registro de ki tem imagem da identidade e fase declaradas", () => {
  const ki = read("content/ki.json"), images = read("content/ki-images.json");
  assert.deepEqual(validateKiImages(ki, images), []);
  assert.equal(images.images.length, ki.records.length);
  const broken = structuredClone(images);
  broken.images[0].phase = "outra-fase";
  broken.images[1].character = "outra-pessoa";
  assert.equal(validateKiImages(ki, broken).length, 2);
  broken.images.pop();
  assert.ok(validateKiImages(ki, broken).some((error) => error.includes("imagem ausente")));
});

test("glossário e imagens aparecem no site e na busca com arquivos offline", () => {
  const glossary = read("content/glossary.json"), pictures = read("content/ki-images.json");
  const html = fs.readFileSync("dist/glossario.html", "utf8");
  const search = fs.readFileSync("dist/busca.html", "utf8");
  const ki = fs.readFileSync("dist/ki.html", "utf8");
  const worker = fs.readFileSync("dist/sw.js", "utf8");
  for (const row of glossary.entries) {
    assert.ok(html.includes(`id="termo-${row.id}"`));
    assert.ok(search.includes(`glossario.html#termo-${row.id}`));
  }
  for (const row of glossary.comparisons) {
    assert.ok(html.includes(`id="cultura-${row.id}"`));
    assert.ok(search.includes(`glossario.html#cultura-${row.id}`));
  }
  assert.equal((ki.match(/data-ki-image>/g) || []).length, pictures.images.length);
  for (const name of ["glossario.html", "glossario.css", "glossario.js", "glossario-dados.json", "ki-imagens.json", "ki-images.js"]) assert.ok(worker.includes(`"${name}"`), name);
  assert.deepEqual(read("dist/glossario-dados.json"), glossary);
});

function harness(address = "https://example.test/glossario.html") {
  const node = (extra = {}) => ({ events: {}, addEventListener(name, fn) { this.events[name] = fn; }, ...extra });
  const query = node({ value: "" });
  const category = node({ value: "", options: ["", "energia", "nomes"].map((value) => ({ value })) });
  const count = {}, empty = {};
  const form = node({ querySelector: (selector) => ({ "[data-lexicon-query]": query, "[data-lexicon-category]": category, "[data-lexicon-count]": count })[selector] });
  const cards = [
    { id: "termo-ki", dataset: { category: "energia", term: "Ki energia e disposição 気" } },
    { id: "termo-gohan", dataset: { category: "nomes", term: "Gohan arroz refeição ご飯" } },
  ];
  cards.forEach((card) => { card.scrollIntoView = () => { card.scrolled = true; }; });
  let url = new URL(address);
  const location = { get href() { return url.href; }, get search() { return url.search; }, get hash() { return url.hash; } };
  vm.runInNewContext(fs.readFileSync("public/glossario.js", "utf8"), {
    URL, URLSearchParams, location,
    history: { replaceState: (_, __, value) => { url = new URL(value); } },
    window: { addEventListener() {} },
    document: { querySelector: (selector) => selector === "[data-lexicon-filters]" ? form : empty, querySelectorAll: () => cards },
  });
  return { form, query, category, count, empty, cards, get url() { return url; } };
}

test("busca do glossário combina assunto e acentos, preservando link e reset", () => {
  const ui = harness();
  ui.query.value = "REFEICAO"; ui.category.value = "nomes";
  ui.form.events.input();
  assert.deepEqual(ui.cards.map((card) => card.hidden), [true, false]);
  assert.equal(ui.count.textContent, "1 de 2 verbetes");
  assert.equal(ui.url.searchParams.get("q"), "REFEICAO");
  ui.category.value = "energia"; ui.form.events.change();
  assert.equal(ui.empty.hidden, false);
  ui.form.events.reset({ preventDefault() {} });
  assert.equal(ui.empty.hidden, true);
  assert.equal(ui.url.search, "");
});

test("âncora de um verbete prevalece sobre filtros e palavras japonesas funcionam", () => {
  const ui = harness("https://example.test/glossario.html?q=ki&categoria=energia#termo-gohan");
  assert.equal(ui.cards[1].hidden, false);
  assert.equal(ui.cards[1].scrolled, true);
  ui.query.value = "ご飯"; ui.form.events.input();
  assert.deepEqual(ui.cards.map((card) => card.hidden), [true, false]);
});

test("imagem externa indisponível preserva legenda inclusive no comparador", () => {
  const message = { hidden: true }, img = { hidden: false, complete: true, naturalWidth: 0 };
  const frame = { querySelector: (selector) => selector === "img" ? img : message };
  img.closest = () => frame;
  const events = {};
  vm.runInNewContext(fs.readFileSync("public/ki-images.js", "utf8"), { document: {
    querySelectorAll: () => [frame], addEventListener: (name, handler) => { events[name] = handler; },
  } });
  assert.equal(img.hidden, true);
  assert.equal(message.hidden, false);
  const cloned = { hidden: false, closest: () => frame };
  events.error({ target: cloned });
  assert.equal(cloned.hidden, true);
});
