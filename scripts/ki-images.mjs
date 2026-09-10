export function validateKiImages(ki, catalog) {
  const errors = [], records = new Map(ki.records.map((row) => [row.id, row])), seen = new Set();
  for (const item of catalog.images || []) {
    const record = records.get(item.recordId);
    if (!record || seen.has(item.recordId)) errors.push(`${item.recordId}: imagem sem registro ou duplicada`);
    seen.add(item.recordId);
    if (record && (record.character !== item.character || record.phase !== item.phase || record.form !== item.form)) errors.push(`${item.recordId}: imagem associada a outro personagem, fase ou forma`);
    if (!item.alt?.trim() || !item.caption?.trim() || !item.credit?.trim() || !item.verificationNote?.trim()) errors.push(`${item.recordId}: descrição visual incompleta`);
    if (!/^https:\/\//.test(item.sourceUrl || "")) errors.push(`${item.recordId}: fonte visual ausente`);
    if (!/^https:\/\//.test(item.imageUrl || "") && !/^images\/[a-z0-9/-]+\.(jpg|png|webp)$/.test(item.imageUrl || "")) errors.push(`${item.recordId}: endereço de imagem inválido`);
    if (!["exact-form", "context", "fan-art"].includes(item.match)) errors.push(`${item.recordId}: relação visual desconhecida`);
  }
  for (const id of records.keys()) if (!seen.has(id)) errors.push(`${id}: imagem ausente`);
  return errors;
}

export function kiFigure(item, esc) {
  return `<figure class="ki-portrait" data-ki-image><div class="ki-image-frame"><img src="${esc(item.imageUrl)}" alt="${esc(item.alt)}" loading="lazy" decoding="async" referrerpolicy="no-referrer" width="640" height="420"><p class="ki-image-error" hidden>Imagem indisponível nesta conexão. A legenda e a fonte continuam abaixo. Recarregue a página ao reconectar.</p></div><figcaption><strong>${esc(item.caption)}</strong><span>${item.match === "fan-art" ? "Fan art · IA" : "Imagem de referência · fonte oficial"}</span><details class="ki-image-credit"><summary>Origem e relação com a fase</summary><p>${esc(item.verificationNote)}</p><p>${esc(item.credit)}</p><a href="${esc(item.sourceUrl)}" target="_blank" rel="noopener noreferrer">${item.match === "fan-art" ? "Consultar a referência da fase" : "Consultar a imagem na fonte"} ↗</a></details></figcaption></figure>`;
}
