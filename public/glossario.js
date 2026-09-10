(() => {
  const form = document.querySelector("[data-lexicon-filters]");
  if (!form) return;
  const query = form.querySelector("[data-lexicon-query]");
  const category = form.querySelector("[data-lexicon-category]");
  const cards = [...document.querySelectorAll("[data-lexicon-entry]")];
  const count = form.querySelector("[data-lexicon-count]");
  const empty = document.querySelector("[data-lexicon-empty]");
  const normalize = (text) => text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  function apply(sync = true) {
    let found = 0;
    for (const card of cards) {
      card.hidden = !!(category.value && card.dataset.category !== category.value) || !normalize(card.dataset.term).includes(normalize(query.value.trim()));
      if (!card.hidden) found++;
    }
    count.textContent = `${found} de ${cards.length} verbetes`;
    empty.hidden = found !== 0;
    if (sync) {
      const url = new URL(location.href);
      url.search = ""; url.hash = "";
      if (query.value.trim()) url.searchParams.set("q", query.value.trim());
      if (category.value) url.searchParams.set("categoria", category.value);
      try { history.replaceState(null, "", url); } catch { /* A leitura local continua funcionando. */ }
    }
  }
  function restore() {
    const params = new URLSearchParams(location.search);
    query.value = params.get("q") || "";
    const selected = params.get("categoria") || "";
    category.value = [...category.options].some((item) => item.value === selected) ? selected : "";
    const target = cards.find((card) => "#" + card.id === location.hash);
    if (target) { query.value = ""; category.value = ""; }
    apply(false);
    target?.scrollIntoView({ block: "center" });
  }
  form.addEventListener("submit", (event) => { event.preventDefault(); apply(); });
  form.addEventListener("input", () => apply());
  form.addEventListener("change", () => apply());
  form.addEventListener("reset", (event) => { event.preventDefault(); query.value = ""; category.value = ""; apply(); });
  window.addEventListener("hashchange", restore);
  window.addEventListener("popstate", restore);
  restore();
})();
