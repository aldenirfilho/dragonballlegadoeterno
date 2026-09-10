(() => {
  const frames = [...document.querySelectorAll("[data-ki-image]")];
  const failed = (img) => {
    const frame = img.closest?.("[data-ki-image]");
    if (!frame) return;
    img.hidden = true;
    frame.querySelector(".ki-image-error").hidden = false;
  };
  // Captura também erros nas fichas copiadas pelo comparador.
  document.addEventListener("error", (event) => failed(event.target), true);
  for (const frame of frames) {
    const img = frame.querySelector("img");
    // Uma imagem pode terminar de falhar antes de o script defer executar.
    if (img.complete && img.naturalWidth === 0) failed(img);
  }
})();
