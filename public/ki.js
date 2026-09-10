(() => {
  const form = document.querySelector("[data-ki-filters]");
  if (!form) return;
  const character = form.querySelector("[data-ki-character]");
  const phase = form.querySelector("[data-ki-phase]");
  const evidence = form.querySelector("[data-ki-evidence]");
  const query = form.querySelector("[data-ki-query]");
  const cards = [...document.querySelectorAll("[data-ki-record]")];
  const normalize = (s) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const count = document.querySelector("[data-ki-count]");
  const message = document.querySelector("[data-ki-message]");
  const empty = document.querySelector("[data-ki-empty]");
  const share = document.querySelector("[data-ki-share]");
  const copy = document.querySelector("[data-ki-copy]");
  const fields = { personagem: character, fase: phase, evidencia: evidence, termo: query };
  function restore() {
    const params = new URLSearchParams(location.search);
    for (const [name, input] of Object.entries(fields)) {
      const value = params.get(name);
      if (value === null) input.value = name === "personagem" && !location.search ? "goku" : "";
      else input.value = input === query || [...input.options].some((o) => o.value === value) ? value : "";
    }
    const selected = cards.find((c) => "#" + c.id === location.hash);
    if (selected) {
      character.value = selected.dataset.character;
      phase.value = selected.dataset.phase;
      evidence.value = "";
      query.value = "";
    }
    apply(false);
    selected?.scrollIntoView({ block: "center" });
  }
  function apply(sync = true) {
    let visible = 0;
    for (const card of cards) {
      card.hidden = (character.value && card.dataset.character !== character.value) || (phase.value && card.dataset.phase !== phase.value) || (evidence.value && card.dataset.evidence !== evidence.value) || !normalize(card.dataset.term).includes(normalize(query.value.trim()));
      if (!card.hidden) visible++;
    }
    count.textContent = `${visible} de ${cards.length} registros`;
    empty.hidden = visible !== 0;
    if (sync) {
      const url = new URL(location.href);
      url.hash = "";
      url.search = "";
      // Valor vazio explícito distingue “todos” da seleção inicial de Goku.
      for (const [name, input] of Object.entries(fields)) if (input.value || name === "personagem") url.searchParams.set(name, input.value);
      try { history.replaceState(null, "", url); } catch { /* Filtros continuam funcionando em arquivos locais. */ }
    }
    copy.hidden = true;
    message.textContent = "";
  }
  form.addEventListener("submit", (event) => { event.preventDefault(); apply(); });
  form.addEventListener("input", () => apply());
  form.addEventListener("change", () => apply());
  form.addEventListener("reset", (event) => { event.preventDefault(); Object.values(fields).forEach((input) => { input.value = ""; }); apply(); });
  window.addEventListener("popstate", restore);
  window.addEventListener("hashchange", restore);
  share.hidden = false;
  share.addEventListener("click", async () => {
    try { await navigator.clipboard.writeText(location.href); message.textContent = "Link dos filtros copiado."; }
    catch { copy.hidden = false; const input = copy.querySelector("input"); input.value = location.href; input.focus(); input.select(); message.textContent = "Selecione e copie o endereço abaixo."; }
  });
  const panel = document.querySelector("[data-ki-compare]");
  const first = panel.querySelector("[data-ki-compare-a]");
  const second = panel.querySelector("[data-ki-compare-b]");
  const result = panel.querySelector("[data-ki-comparison]");
  panel.hidden = false;
  function compare() {
    result.replaceChildren();
    if (!first.value || !second.value || first.value === second.value) {
      const p = document.createElement("p"); p.textContent = "Escolha dois registros diferentes para comparar."; result.append(p); return;
    }
    for (const id of [first.value, second.value]) {
      const original = cards.find((c) => c.id === "registro-" + id);
      if (!original) continue;
      const clone = original.cloneNode(true);
      clone.removeAttribute("id"); clone.removeAttribute("data-ki-record"); clone.hidden = false;
      // A cópia oferece o link do registro original, sem IDs duplicados.
      result.append(clone);
    }
  }
  first.addEventListener("change", compare);
  second.addEventListener("change", compare);
  restore();
})();
