document.documentElement.classList.add("js");
const menu = document.querySelector("[data-menu]");
menu?.addEventListener("click", () => {
  const expanded = menu.getAttribute("aria-expanded") === "true";
  menu.setAttribute("aria-expanded", String(!expanded));
  document.querySelector(".navigation").classList.toggle("is-open", !expanded);
});
const normalize = (s) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
const search = document.querySelector("#catalog-search");
const filter = document.querySelector("#catalog-filter");
function filterCards() {
  const term = normalize(search?.value || "");
  const group = filter?.value || "";
  let count = 0;
  document.querySelectorAll("[data-search]").forEach((card) => {
    const visible =
      normalize(card.dataset.search).includes(term) &&
      (!group || card.dataset.group === group);
    card.hidden = !visible;
    if (visible) count++;
  });
  const output = document.querySelector("[data-results]");
  if (output) output.textContent = count + " resultados";
  const empty = document.querySelector("[data-empty]");
  if (empty) empty.hidden = count !== 0;
}
search?.addEventListener("input", filterCards);
filter?.addEventListener("change", filterCards);
const initial = new URLSearchParams(location.search).get("q");
if (initial && search) {
  search.value = initial;
  filterCards();
}
document.querySelectorAll("[data-font]").forEach((button) =>
  button.addEventListener("click", () => {
    const large = document.documentElement.classList.toggle("large-text");
    button.setAttribute("aria-pressed", String(large));
  }),
);
const dialog = document.querySelector("#art-dialog");
document.querySelectorAll("[data-art]").forEach((button) =>
  button.addEventListener("click", () => {
    dialog.querySelector("img").src = button.dataset.art;
    dialog.querySelector("img").alt = button.dataset.alt;
    dialog.querySelector("h2").textContent = button.dataset.title;
    dialog.showModal();
  }),
);
document
  .querySelector("[data-close]")
  ?.addEventListener("click", () => dialog.close());
dialog?.addEventListener("click", (event) => {
  if (event.target === dialog) dialog.close();
});
