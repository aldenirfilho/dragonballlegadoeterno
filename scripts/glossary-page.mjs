export const categories = {
  energia: "Energia e transformações",
  tecnicas: "Técnicas e treinamento",
  nomes: "Nomes e trocadilhos",
  cultura: "Cultura e linguagem",
  objetos: "Objetos e lugares",
};

export function validateGlossary(data) {
  const errors = [];
  const ids = new Set();
  for (const [collection, fields] of Object.entries({
    entries: ["term", "meaning", "inStory"],
    comparisons: ["title", "inStory", "japan", "brazil", "bridge", "caution"],
  })) {
    if (!Array.isArray(data[collection]) || !data[collection].length) errors.push(`${collection}: coleção vazia`);
    for (const row of data[collection] || []) {
      if (!/^[a-z0-9-]+$/.test(row.id) || ids.has(row.id)) errors.push(`${collection}: ID inválido ou duplicado ${row.id}`);
      ids.add(row.id);
      for (const field of fields) if (!row[field]?.trim()) errors.push(`${row.id}: ${field} ausente`);
      if (!row.sources?.length || row.sources.some((s) => !/^https:\/\//.test(s))) errors.push(`${row.id}: fontes incompletas`);
      if (collection === "entries" && !categories[row.category]) errors.push(`${row.id}: categoria desconhecida`);
    }
  }
  return errors;
}

export function glossaryPage(data, esc) {
  const errors = validateGlossary(data);
  if (errors.length) throw new Error(errors.join("\n"));
  const entries = [...data.entries].sort((a, b) => a.term.localeCompare(b.term, "pt-BR"));
  const sources = (urls) => `<div class="source-links">${[...new Set(urls)].map((url, index) => `<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">Fonte ${index + 1} ↗</a>`).join(" · ")}</div>`;
  return `<section class="wrap lexicon-intro"><span class="eyebrow">PALAVRAS QUE ABREM UM UNIVERSO</span><h1 class="page-title">Dicionário <em>& cultura.</em></h1><p class="page-intro">O que os nomes, as técnicas e os costumes de Dragon Ball querem dizer? Explore seus sentidos em português e encontre pontos de contato — e diferenças — com a vida no Brasil.</p><nav class="lexicon-sections" aria-label="Seções do dicionário"><a class="button primary" href="#dicionario">${entries.length} verbetes ↓</a><a class="button" href="#cultura">${data.comparisons.length} encontros culturais ↓</a><a class="text-link" href="#criterios">Como ler este glossário</a></nav></section>
  <section class="wrap section lexicon-workspace" id="dicionario"><div class="section-heading"><div><span class="eyebrow">DO KI AOS TROCADILHOS</span><h2>Encontre uma palavra</h2><p>Tradução, uso na história e contexto ficam separados em cada verbete.</p></div></div><form class="lexicon-filters" data-lexicon-filters><label>Palavra ou significado<input type="search" data-lexicon-query name="q" placeholder="Ki, Kamehameha, arroz, mestre…"></label><label>Assunto<select data-lexicon-category name="categoria"><option value="">Todos os assuntos</option>${Object.entries(categories).map(([id, label]) => `<option value="${id}">${label}</option>`).join("")}</select></label><button type="reset" class="button">Limpar busca</button><output data-lexicon-count aria-live="polite">${entries.length} verbetes</output></form>
  <div class="lexicon-grid">${entries.map((entry) => `<article class="lexicon-card" id="termo-${esc(entry.id)}" data-lexicon-entry data-category="${esc(entry.category)}" data-term="${esc([entry.term, entry.original, entry.reading, entry.meaning, entry.inStory].filter(Boolean).join(" "))}"><span class="tag">${esc(categories[entry.category])}</span><h3><a href="#termo-${esc(entry.id)}">${esc(entry.term)}</a></h3>${entry.original ? `<p class="lexicon-original"><span lang="ja">${esc(entry.original)}</span>${entry.reading ? `<span>${esc(entry.reading)}</span>` : ""}</p>` : entry.reading ? `<p class="meta">${esc(entry.reading)}</p>` : ""}<dl><dt>Em português</dt><dd>${esc(entry.meaning)}</dd><dt>Em Dragon Ball</dt><dd>${esc(entry.inStory)}</dd></dl>${entry.caution ? `<p class="lexicon-caution">${esc(entry.caution)}</p>` : ""}<details><summary>Consultar as fontes</summary>${sources(entry.sources)}</details></article>`).join("")}</div><p class="empty" data-lexicon-empty hidden>Nenhum verbete encontrado. Tente outra palavra ou limpe a busca.</p><noscript><p class="notice">Todos os verbetes estão disponíveis. A busca por assunto precisa de JavaScript.</p></noscript></section>
  <section class="wrap section" id="cultura"><span class="eyebrow">DA FICÇÃO À NOSSA VIDA</span><h2>Dragon Ball, referências culturais e Brasil</h2><p class="page-intro">A história combina imaginação de Toriyama, referências japonesas e influências chinesas. As comparações abaixo são uma leitura editorial: não descrevem todos os japoneses nem todos os brasileiros.</p><div class="culture-grid">${data.comparisons.map((item, i) => `<article class="culture-card" id="cultura-${esc(item.id)}"><div class="culture-heading"><span aria-hidden="true">${String(i + 1).padStart(2, "0")}</span><h3>${esc(item.title)}</h3></div><dl><dt>Na história</dt><dd>${esc(item.inStory)}</dd><dt>Referências culturais</dt><dd>${esc(item.japan)}</dd><dt>No Brasil</dt><dd>${esc(item.brazil)}</dd></dl><div class="culture-bridge"><h4>Uma conexão possível</h4><p>${esc(item.bridge)}</p></div><p class="lexicon-caution">${esc(item.caution)}</p><details><summary>Consultar as fontes</summary>${sources(item.sources)}</details></article>`).join("")}</div></section>
  <section class="wrap section prose" id="criterios"><span class="eyebrow">TRADUZIR TAMBÉM É CONTEXTUALIZAR</span><h2>Como ler este glossário</h2><p>Uma tradução literal ajuda a reconhecer uma palavra, mas não explica sozinha a intenção do autor. Trocadilhos, escolhas das dublagens e interpretações culturais têm contextos diferentes.</p><p>As grafias em japonês aparecem quando verificadas; a romanização ajuda na leitura, sem substituir uma orientação de pronúncia. Um nome inventado não é necessariamente uma palavra corrente no Japão.</p><p>“Energia”, “deus” e “espírito” podem ter usos ficcionais, linguísticos ou religiosos distintos. O ki de Dragon Ball não é uma grandeza física comprovada. Os costumes brasileiros também variam entre famílias, regiões, tradições e gerações.</p>${(data.editorialNotes || []).map((note) => `<p>${esc(note)}</p>`).join("")}<p class="meta">Revisão desta seção: ${esc(data.checkedAt.split("-").reverse().join("/"))}. As fontes de cada verbete permitem aprofundar a leitura.</p><a class="button" href="glossario-dados.json" download>Baixar o dicionário e suas fontes</a> <a class="text-link" href="ki.html">Voltar ao Atlas do Ki →</a></section><script src="glossario.js" defer></script>`;
}
