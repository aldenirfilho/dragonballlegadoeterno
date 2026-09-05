import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import fs from "node:fs";
const code = fs.readFileSync("public/app.js", "utf8");
const element = (initial = {}) => {
  const events = {};
  const attrs = {};
  const classes = new Set();
  return {
    ...initial,
    events,
    attrs,
    addEventListener: (n, fn) => (events[n] = fn),
    setAttribute: (n, v) => (attrs[n] = v),
    getAttribute: (n) => attrs[n],
    classList: {
      add: (n) => classes.add(n),
      toggle: (n, force) => {
        const on = force ?? !classes.has(n);
        if (on) classes.add(n);
        else classes.delete(n);
        return on;
      },
      contains: (n) => classes.has(n),
    },
  };
};
function harness(query = "") {
  const search = element({ value: "" }),
    filter = element({ value: "" }),
    output = element(),
    empty = element({ hidden: true }),
    menu = element(),
    nav = element(),
    root = element(),
    font = element();
  menu.attrs["aria-expanded"] = "false";
  const cards = [
    element({ dataset: { search: "Kuririn Coragem amizade", group: "Terra" } }),
    element({
      dataset: { search: "Goku transformação e coragem", group: "Saiyajin" },
    }),
    element({ dataset: { search: "Vegeta orgulho", group: "Saiyajin" } }),
  ];
  const map = {
    "#catalog-search": search,
    "#catalog-filter": filter,
    "[data-results]": output,
    "[data-empty]": empty,
    "[data-menu]": menu,
    ".navigation": nav,
  };
  const document = {
    documentElement: root,
    querySelector: (s) => map[s] || null,
    querySelectorAll: (s) =>
      s === "[data-search]" ? cards : s === "[data-font]" ? [font] : [],
  };
  vm.runInNewContext(code, {
    document,
    location: { search: query },
    URLSearchParams,
  });
  return { search, filter, output, empty, cards, menu, nav, font, root };
}
test("busca ignora acentos e aplica grupo em conjunto", () => {
  const x = harness();
  x.search.value = "TRANSFORMACAO";
  x.search.events.input();
  assert.deepEqual(
    x.cards.map((c) => c.hidden),
    [true, false, true],
  );
  x.search.value = "coragem";
  x.filter.value = "Terra";
  x.filter.events.change();
  assert.deepEqual(
    x.cards.map((c) => c.hidden),
    [false, true, true],
  );
  assert.equal(x.output.textContent, "1 resultados");
});
test("estado vazio e recuperação da busca funcionam", () => {
  const x = harness("?q=ausente");
  assert.equal(x.empty.hidden, false);
  assert.equal(x.output.textContent, "0 resultados");
  x.search.value = "";
  x.search.events.input();
  assert.equal(x.empty.hidden, true);
  assert.equal(x.output.textContent, "3 resultados");
});
test("menu e ampliação atualizam estados acessíveis", () => {
  const x = harness();
  x.menu.events.click();
  assert.equal(x.menu.attrs["aria-expanded"], "true");
  assert.equal(x.nav.classList.contains("is-open"), true);
  x.menu.events.click();
  assert.equal(x.menu.attrs["aria-expanded"], "false");
  x.font.events.click();
  assert.equal(x.font.attrs["aria-pressed"], "true");
  assert.equal(x.root.classList.contains("large-text"), true);
});
