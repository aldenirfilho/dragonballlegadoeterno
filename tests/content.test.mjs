import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { inspect } from "../scripts/editorial-agents.mjs";
const read = (f) => JSON.parse(fs.readFileSync(f, "utf8"));
const db = read("content/encyclopedia.json"),
  news = read("content/news.json"),
  arts = read("content/images.json");
test("catálogo possui conteúdo completo e campos rastreáveis", () => {
  const result = inspect(db, news, arts);
  assert.deepEqual(result.problems, []);
  assert.ok(db.characters.length >= 24);
  assert.ok(db.sagas.length >= 8);
  assert.ok(db.families.length >= 5);
  assert.ok(db.lessons.length >= 8);
  assert.ok(db.goku.chapters.length >= 8);
  assert.ok(arts.length >= 12);
});
test("catalogador rejeita IDs duplicados, fonte ausente e data futura", () => {
  const broken = structuredClone(db);
  broken.characters.push(structuredClone(broken.characters[0]));
  broken.characters[0].sources = [];
  const n = structuredClone(news);
  n.items[0].publishedAt = "2099-01-01";
  const issues = inspect(broken, n, arts).problems;
  assert.ok(issues.some((x) => x.includes("duplicado")));
  assert.ok(issues.some((x) => x.includes("fonte ausente")));
  assert.ok(issues.some((x) => x.includes("futura")));
});
test("todas as páginas têm conteúdo, idioma, descrição e um h1", () => {
  const pages = fs.readdirSync("dist").filter((f) => f.endsWith(".html"));
  assert.ok(pages.length >= 40);
  for (const file of pages) {
    const html = fs.readFileSync("dist/" + file, "utf8");
    assert.ok(html.includes('lang="pt-BR"'), file);
    assert.ok(html.includes('name="description"'), file);
    assert.equal((html.match(/<h1\b/g) || []).length, 1, file);
    assert.ok(!html.includes("undefined"), file);
    assert.ok(!html.includes("[object Object]"), file);
    assert.ok(!/TODO|Lorem ipsum/.test(html), file);
  }
});
test("links internos, âncoras e imagens resolvem em arquivos existentes", () => {
  for (const file of fs
    .readdirSync("dist")
    .filter((f) => f.endsWith(".html"))) {
    const html = fs.readFileSync("dist/" + file, "utf8");
    for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
      const url = match[1];
      if (/^(https?:|mailto:|data:)/.test(url)) continue;
      const [pathname, anchor] = url.split("#");
      const dest = path.join("dist", pathname || file);
      assert.ok(fs.existsSync(dest), `${file}: ${url}`);
      if (anchor && dest.endsWith(".html"))
        assert.ok(
          fs.readFileSync(dest, "utf8").includes(`id="${anchor}"`),
          `${file}: âncora ${url}`,
        );
    }
  }
});
test("galeria possui arquivos reais, texto alternativo e prompts", () => {
  for (const art of arts) {
    assert.ok(fs.statSync(`public/images/${art.id}.jpg`).size > 10000, art.id);
    assert.ok(art.alt.length > 25);
    assert.ok(art.prompt.length > 40);
  }
});
test("notícias preservam origem, território e data; site não inclui rastreadores", () => {
  for (const n of news.items) {
    const html = fs.readFileSync(`dist/noticia-${n.id}.html`, "utf8");
    assert.ok(html.includes(n.sourceUrl));
    assert.ok(html.includes(n.territory.replaceAll("&", "&amp;")));
  }
  for (const f of ["app.js", "style.css", "index.html"])
    assert.ok(
      !/google-analytics|gtag\(|facebook.net|localStorage|sessionStorage/.test(
        fs.readFileSync("dist/" + f, "utf8"),
      ),
    );
});
test("404 resolve navegação a partir da raiz canônica", () => {
  const html = fs.readFileSync("dist/404.html", "utf8");
  assert.ok(/<base href="https:\/\/[^\"]+\/">/.test(html));
});
test("busca indexa formas, filmes e técnicas além dos títulos das páginas", () => {
  const html = fs.readFileSync("dist/busca.html", "utf8");
  for (const name of ["Oozaru", "Ultra Ego", "Fusion Reborn", "Kamehameha"])
    assert.ok(html.includes(name), name);
  assert.ok(html.includes("poderes.html#forma-"));
  assert.ok(html.includes("filmes.html#filme-"));
});
