import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { validateKi } from "./ki-page.mjs";
export const normalize = (value) =>
  String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
export function inspect(data, news, images) {
  const problems = [];
  const groups = ["characters", "sagas", "families", "lessons", "techniques"];
  const totals = {};
  for (const key of groups) {
    const rows = data[key];
    if (!Array.isArray(rows)) {
      problems.push(`${key}: coleção ausente`);
      continue;
    }
    totals[key] = rows.length;
    const ids = new Set();
    for (const row of rows) {
      if (!row.id || ids.has(row.id))
        problems.push(`${key}: ID ausente/duplicado ${row.id}`);
      ids.add(row.id);
      if (!row.sources?.length)
        problems.push(`${key}/${row.id}: fonte ausente`);
      for (const url of row.sources || [])
        if (!/^https:\/\//.test(url))
          problems.push(`${key}/${row.id}: URL inválida`);
    }
  }
  for (const c of data.characters || [])
    for (const key of [
      "name",
      "epithet",
      "description",
      "family",
      "arc",
      "lesson",
      "limitation",
      "continuity",
    ])
      if (!c[key]?.trim()) problems.push(`${c.id}: ${key} vazio`);
  const date = /^\d{4}-\d{2}-\d{2}$/;
  const ids = new Set();
  if (!date.test(news.checkedAt)) problems.push("Data de checagem ausente");
  for (const n of news.items || []) {
    if (ids.has(n.id)) problems.push(`Notícia duplicada: ${n.id}`);
    ids.add(n.id);
    if (
      !n.sourceUrl?.startsWith("https://") ||
      !n.sourceName ||
      !n.territory ||
      !n.status ||
      !date.test(n.publishedAt)
    )
      problems.push(`Notícia incompleta: ${n.id}`);
    if (n.publishedAt > news.checkedAt)
      problems.push(`Notícia futura em relação ao corte: ${n.id}`);
  }
  const artIds = new Set();
  for (const a of images) {
    if (artIds.has(a.id)) problems.push(`Arte duplicada: ${a.id}`);
    artIds.add(a.id);
    if (!a.alt || !a.prompt || !a.title)
      problems.push(`Arte sem metadados: ${a.id}`);
  }
  return {
    totals: {
      ...totals,
      news: news.items.length,
      images: images.length,
      gokuChapters: data.goku?.chapters?.length || 0,
    },
    problems,
  };
}
if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === path.resolve("scripts/editorial-agents.mjs")
) {
  const read = (f) => JSON.parse(fs.readFileSync(f, "utf8"));
  const data = read("content/encyclopedia.json"),
    news = read("content/news.json"),
    images = read("content/images.json");
  const result = inspect(data, news, images);
  const ki = read("content/ki.json");
  result.problems.push(...validateKi(ki));
  result.totals.kiPhases = ki.phases.length;
  result.totals.kiRecords = ki.records.length;
  result.totals.kiVerifiedValues = ki.records.filter((r) => r.value !== null).length;
  fs.mkdirSync("artifacts", { recursive: true });
  const text = [
    "# Relatório dos agentes editoriais",
    "",
    `Execução: ${new Date().toISOString()}`,
    `Corte das notícias: ${news.checkedAt}`,
    "",
    "## Catalogador",
    ...Object.entries(result.totals).map(([k, v]) => `- ${k}: ${v}`),
    "",
    "## Organizador",
    ...(result.problems.length
      ? result.problems.map((p) => `- ERRO: ${p}`)
      : ["- Estrutura, identificadores e campos obrigatórios conferidos."]),
    "",
    "## Fila de expansão",
    "- Acrescentar imagens individuais aos personagens ainda sem retrato.",
    "- Aprofundar referências por capítulo/episódio, sem reproduzir obras protegidas.",
    "- Verificar disponibilidade regional em novos anúncios.",
  ];
  if (process.argv.includes("--network")) {
    const urls = [
      ...new Set([
        "https://en.dragon-ball-official.com/news/",
        "https://www.toei-animation.com/",
        ...news.items.map((n) => n.sourceUrl),
      ]),
    ];
    const old = fs.existsSync("artifacts/source-observations.json")
      ? read("artifacts/source-observations.json")
      : {};
    const observations = {};
    text.push(
      "",
      "## Observador de fontes",
      "Diferença de hash sinaliza alteração na página, não confirma uma notícia.",
    );
    for (const url of urls) {
      try {
        const res = await fetch(url, {
          signal: AbortSignal.timeout(20000),
          headers: { "User-Agent": "DragonBallLegadoEterno-SourceMonitor/1.0" },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const body = await res.text();
        if (body.length > 5000000)
          throw new Error("Resposta acima do limite de 5 MB");
        const hash = crypto.createHash("sha256").update(body).digest("hex");
        const previous = old[url];
        observations[url] = {
          checkedAt: new Date().toISOString(),
          hash,
          status: res.status,
        };
        text.push(
          `- ${previous?.hash ? (previous.hash === hash ? "SEM ALTERAÇÃO" : "REVISAR ALTERAÇÃO") : "PRIMEIRA OBSERVAÇÃO"}: ${url}`,
        );
      } catch (e) {
        observations[url] = {
          checkedAt: new Date().toISOString(),
          error: e.message,
        };
        text.push(`- COBERTURA PARCIAL: ${url}: ${e.message}`);
      }
    }
    fs.writeFileSync(
      "artifacts/source-observations.json",
      JSON.stringify(observations, null, 2),
    );
  }
  fs.writeFileSync("artifacts/editorial-report.md", text.join("\n") + "\n");
  console.log(text.join("\n"));
  if (result.problems.length) process.exitCode = 1;
}
