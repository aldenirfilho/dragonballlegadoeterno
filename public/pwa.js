(() => {
  const root = new URL("./", document.currentScript.src);
  const install = document.querySelector("[data-install-app]");
  const status = document.querySelector("[data-app-status]");
  const offlineStatus = document.querySelector("[data-offline-status]");
  const update = document.querySelector("[data-update-app]");
  const standalone = window.matchMedia("(display-mode: standalone)");
  let pendingInstall = null;
  let registration;
  let updating = false;
  const installed = () => standalone.matches || navigator.standalone === true;
  const setStatus = (text) => { if (status) status.textContent = text; };
  function displayInstallState() {
    if (install) install.hidden = installed() || !pendingInstall;
    if (installed()) setStatus("Você está usando o Legado Eterno como aplicativo.");
  }
  window.addEventListener("beforeinstallprompt", (event) => {
    // Nas outras páginas, deixe o navegador oferecer sua instalação normal.
    if (!install) return;
    event.preventDefault();
    pendingInstall = event;
    displayInstallState();
  });
  install?.addEventListener("click", async () => {
    if (!pendingInstall) return;
    const prompt = pendingInstall;
    pendingInstall = null;
    install.hidden = true;
    try {
      await prompt.prompt();
      const choice = await prompt.userChoice;
      setStatus(choice.outcome === "accepted"
        ? "Pedido de instalação aceito. Aguarde a confirmação do navegador."
        : "Você pode instalar depois pelo menu do navegador.");
    } catch {
      setStatus("Use as instruções abaixo para instalar pelo navegador.");
    }
  });
  window.addEventListener("appinstalled", () => {
    pendingInstall = null;
    displayInstallState();
    setStatus("Aplicativo instalado. Procure o ícone Legado Eterno no seu dispositivo.");
  });
  standalone.addEventListener?.("change", displayInstallState);
  displayInstallState();

  function connectivity() {
    document.querySelectorAll("[data-offline]").forEach((notice) => { notice.hidden = navigator.onLine; });
  }
  window.addEventListener("online", connectivity);
  window.addEventListener("offline", connectivity);
  connectivity();

  if (!("serviceWorker" in navigator) || !window.isSecureContext) {
    if (offlineStatus) offlineStatus.textContent = "A leitura offline não está disponível neste navegador ou endereço. Você pode continuar usando o site com internet.";
    return;
  }
  const showUpdate = () => {
    if (registration?.waiting && navigator.serviceWorker.controller && update) update.hidden = false;
  };
  update?.addEventListener("click", () => {
    if (!registration?.waiting) return;
    updating = true;
    update.disabled = true;
    update.textContent = "Atualizando…";
    registration.waiting.postMessage({ type: "ACTIVATE_UPDATE" });
  });
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (updating) location.reload();
  });
  navigator.serviceWorker.register(new URL("sw.js", root), { scope: root.href, updateViaCache: "none" })
    .then((reg) => {
      registration = reg;
      showUpdate();
      const observe = (worker) => worker?.addEventListener("statechange", () => {
        showUpdate();
        if (worker.state === "redundant" && !reg.active && offlineStatus)
          offlineStatus.textContent = "Não foi possível concluir o salvamento offline. Confira a conexão e o espaço disponível e abra o site novamente.";
      });
      observe(reg.installing);
      reg.addEventListener("updatefound", () => observe(reg.installing));
      return navigator.serviceWorker.ready;
    })
    .then((ready) => {
      if (!offlineStatus || !ready.active) return;
      const channel = new MessageChannel();
      const timeout = setTimeout(() => {
        offlineStatus.textContent = "Não foi possível confirmar a cópia offline. Mantenha a conexão e abra esta página novamente para conferir.";
        channel.port1.close();
      }, 6000);
      channel.port1.onmessage = (event) => {
        clearTimeout(timeout);
        offlineStatus.textContent = event.data?.complete
          ? "Enciclopédia salva neste navegador para leitura offline. Notícias mostram a data da edição salva; fontes externas e novidades precisam de internet. O sistema pode remover a cópia se faltar espaço."
          : "A cópia offline está incompleta. Navegue com internet pelas seções desejadas para salvá-las novamente. Uma nova edição também tentará salvar o acervo completo.";
        channel.port1.close();
      };
      ready.active.postMessage({ type: "CHECK_OFFLINE" }, [channel.port2]);
    })
    .catch(() => {
      if (offlineStatus) offlineStatus.textContent = "O salvamento offline não pôde ser ativado. O site continua disponível com internet; tente novamente fora da navegação privada.";
    });
})();
