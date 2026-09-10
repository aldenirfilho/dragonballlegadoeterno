import { kiFigure, validateKiImages } from "./ki-images.mjs";
export function validateKi(data) {
  const errors = [];
  const indexes = {};
  for (const key of ["characters", "phases", "records"]) {
    indexes[key] = new Set();
    for (const row of data[key] || []) {
      if (!/^[a-z0-9-]+$/.test(row.id) || indexes[key].has(row.id)) errors.push(`${key}: ID inválido ou duplicado ${row.id}`);
      indexes[key].add(row.id);
    }
    if (!indexes[key].size) errors.push(`${key}: coleção vazia`);
  }
  for (const r of data.records || []) {
    if (!indexes.characters.has(r.character) || !indexes.phases.has(r.phase)) errors.push(`${r.id}: referência inexistente`);
    if (!r.form?.trim() || !r.note?.trim() || !r.reference?.trim() || !r.sources?.length) errors.push(`${r.id}: contexto incompleto`);
    if (r.sources?.some((s) => !/^https:\/\//.test(s))) errors.push(`${r.id}: fonte inválida`);
    if (r.value !== null && (!Number.isFinite(r.value) || r.value <= 0 || !["=", ">"].includes(r.comparison) || r.status !== "confirmado")) errors.push(`${r.id}: medição inválida`);
    if (r.value === null && (r.status !== "sem-numero" || r.comparison !== null)) errors.push(`${r.id}: ausência de medição mal identificada`);
  }
  for (const p of data.phases || []) if (!data.records.some((r) => r.phase === p.id)) errors.push(`${p.id}: fase sem registro`);
  return errors;
}

export function kiPage(data, esc, catalog) {
  const issues = [...validateKi(data), ...validateKiImages(data, catalog)];
  const pictures = new Map(catalog.images.map((item) => [item.recordId, item]));
  if (issues.length) throw new Error(issues.join("\n"));
  const characters = new Map(data.characters.map((c) => [c.id, c]));
  const phases = new Map(data.phases.map((p) => [p.id, p]));
  const format = (r) => r.value === null ? "Sem número verificado" : (r.comparison === ">" ? "> " : "") + r.value.toLocaleString("pt-BR");
  const numeric = data.records.filter((r) => r.value !== null);
  const option = (r) => `<option value="${esc(r.id)}">${esc(characters.get(r.character).name)} · ${esc(phases.get(r.phase).title)} · ${esc(r.form)} · ${format(r)}</option>`;
  return `<section class="wrap ki-intro"><div><span class="eyebrow">ENERGIA · TÉCNICA · TRANSFORMAÇÃO</span><h1 class="page-title">Atlas do <em>Ki.</em></h1><p class="page-intro">Acompanhe o poder dos personagens ao longo das sagas. Descubra o que foi medido, o que mudou e o que os números não contam.</p><div class="ki-stats"><span><strong>${data.phases.length}</strong> fases</span><span><strong>${data.records.length}</strong> registros</span><span><strong>${numeric.length}</strong> leituras com fonte</span></div></div><figure><img src="images/rivalidade.jpg" alt="Goku e Vegeta em uma ilustração de fãs gerada por IA." width="800" height="600"><figcaption>Fan art · IA. Uma mesma forma não garante a mesma força.</figcaption></figure></section>
  <section class="wrap ki-workspace" aria-label="Explorar o ki dos personagens">
    <form class="ki-filters" data-ki-filters><label>Personagem<select name="personagem" data-ki-character><option value="">Todos os personagens</option>${data.characters.map((c) => `<option value="${esc(c.id)}" ${c.id === "goku" ? "selected" : ""}>${esc(c.name)}</option>`).join("")}</select></label><label>Fase da saga<select name="fase" data-ki-phase><option value="">Todas as fases</option>${data.phases.map((p) => `<option value="${esc(p.id)}">${esc(p.era)} · ${esc(p.title)}</option>`).join("")}</select></label><label>Tipo de registro<select name="evidencia" data-ki-evidence><option value="">Todos os registros</option><option value="confirmado">Com número confirmado</option><option value="sem-numero">Sem número verificado</option></select></label><label>Buscar técnica ou contexto<input type="search" name="termo" data-ki-query placeholder="Kaioken, Blue, energia contida…"></label><button type="reset" class="button">Limpar filtros</button></form>
    <div class="ki-toolbar"><output data-ki-count aria-live="polite">${data.records.length} registros · ative JavaScript para filtrar</output><button class="button" data-ki-share hidden>Copiar link dos filtros</button></div><p data-ki-message role="status" class="meta"></p><label class="ki-copy" data-ki-copy hidden>Copie este endereço<input readonly aria-label="Endereço com os filtros selecionados"></label>
    <div class="notice ki-explanation"><strong>Uma leitura é um momento, não uma sentença.</strong> Ki é a energia da ficção; o nível de poder é uma leitura ou declaração contextual. “Sem número verificado” não significa zero. <a href="#como-ler">Como ler os dados</a>. Imagens oficiais precisam de internet; as legendas identificam a forma representada.</div>
    <div class="ki-grid" data-ki-grid>${data.records.map((r) => {
      const c = characters.get(r.character), p = phases.get(r.phase);
      return `<article class="ki-card" id="registro-${esc(r.id)}" data-ki-record data-character="${esc(r.character)}" data-phase="${esc(r.phase)}" data-evidence="${esc(r.status)}" data-term="${esc(c.name + " " + p.title + " " + p.era + " " + r.form + " " + r.note)}">${kiFigure(pictures.get(r.id), esc)}<div class="ki-card-heading"><span class="tag">${esc(p.era)}</span><span class="meta">${esc(p.title)}</span></div><h2>${esc(c.name)}</h2><p class="ki-form">${esc(r.form)}</p><p class="ki-value ${r.value === null ? "unmeasured" : ""}">${format(r)}</p><p class="meta">${r.value === null ? "Contexto da obra · sem extrapolação" : "Índice informado na fonte primária"}</p><p>${esc(r.note)}</p><details><summary>Contexto e fonte</summary><p>${esc(r.reference)}</p><p class="meta">${esc(p.continuity)}</p>${r.sources.map((url, i) => `<a class="text-link" href="${esc(url)}" target="_blank" rel="noopener noreferrer">Fonte oficial ${i + 1} ↗</a>`).join(" · ")}</details><div class="ki-card-links">${c.profile ? `<a href="${esc(c.profile)}">Perfil completo</a>` : ""}<a href="#registro-${esc(r.id)}" data-ki-permalink>Link deste registro</a></div></article>`;
    }).join("")}</div><p class="empty" data-ki-empty hidden>Nenhum registro combina com esses filtros. Use “Limpar filtros” para explorar o acervo inteiro.</p><noscript><p class="notice">Todos os registros estão disponíveis nesta página. Os filtros e o comparador precisam de JavaScript.</p></noscript>
  </section><section class="wrap section" data-ki-compare hidden><span class="eyebrow">DOIS MOMENTOS, DOIS CONTEXTOS</span><h2>Compare leituras verificadas</h2><p>Compare a medição e suas condições. O painel não prevê vencedores e não converte energia contida em força máxima.</p><div class="ki-compare-selects"><label>Primeiro registro<select data-ki-compare-a><option value="">Escolher uma leitura</option>${numeric.map(option).join("")}</select></label><label>Segundo registro<select data-ki-compare-b><option value="">Escolher outra leitura</option>${numeric.map(option).join("")}</select></label></div><div class="ki-comparison" data-ki-comparison aria-live="polite"><p>Escolha dois registros acima.</p></div></section>
  <section class="wrap section prose ki-method" id="como-ler"><span class="eyebrow">TRANSPARÊNCIA DO ACERVO</span><h2>O que o scouter consegue contar?</h2><p>${esc(data.methodology.unit)}</p><h3>Valor confirmado, limite e ausência</h3><p>Um valor com <strong>&gt;</strong> é um limite inferior: “mais de 8.000” não é exatamente 8.000. Um golpe concentrado pode produzir uma leitura diferente daquela obtida com energia contida.</p><p>${esc(data.methodology.unknown)}</p><h3>Por que tantas fases não têm um número?</h3><p>${esc(data.methodology.sources)} As formas divinas, a energia artificial e as diferentes adaptações precisam ser identificadas antes de qualquer comparação.</p><p>${esc(data.methodology.coverage)}</p><p class="notice">Potência de combate não mede caráter. Cooperação, inteligência, controle e cuidado continuam importantes mesmo quando nenhum scouter consegue representá-los.</p><p class="meta">Revisão deste atlas: 10/09/2026. O corte editorial das notícias é informado separadamente.</p><a class="button" href="ki-dados.json" download>Baixar dados e fontes · JSON</a> <a class="text-link" href="poderes.html">Técnicas e transformações →</a> <a class="text-link" href="glossario.html">O significado dessas palavras →</a></section><script src="ki.js" defer></script><script src="ki-images.js" defer></script>`;
}
