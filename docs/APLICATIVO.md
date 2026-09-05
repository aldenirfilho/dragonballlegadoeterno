# Aplicativo web instalável — versão 1.1.0

Atualização da versão 1.0.0 para 1.1.0, preparada em 05/09/2026.

## Entrega

- Manifest com nome, início e escopo relativos, ícones normais e adaptável, janela independente e atalhos de Goku, personagens e notícias.
- Ícones PNG: 192 e 512 pixels, Apple Touch 180 e favicon 32. Matriz preservada e prompt em `ICONE.md`.
- Página `instalar.html` com instruções manuais sempre disponíveis; botão nativo somente após `beforeinstallprompt`.
- Service worker gerado a partir de `scripts/service-worker.js`. O build calcula uma revisão pelo conteúdo dos arquivos e do próprio worker.
- Primeiro salvamento: todas as páginas, estilos, scripts, ícones de uso e 18 ilustrações. Cerca de 11 MB; matriz original fora do cache automático.
- Conteúdo e scripts priorizam rede com limite de espera de 4 segundos; a cópia salva atende falhas de conexão ou servidor. Erros HTTP 404 permanecem 404. Imagens já salvas priorizam cache até a nova edição.
- Uma edição nova aguarda fechamento das abas antigas ou confirmação em “Atualizar aplicativo”. Não há recarregamento forçado sem a ação do usuário.
- URLs aninhadas desconhecidas, sem rede, redirecionam para a página offline real; os caminhos relativos continuam válidos.
- A confirmação offline consulta a presença dos recursos. Se o sistema remover o cache, a mensagem informa cópia incompleta. Recursos conhecidos visitados online voltam a ser salvos. Falha de armazenamento não impede resposta online.

## Compatibilidade e limites

Instalação e leitura offline dependem do navegador, HTTPS e armazenamento disponível. A abertura instalada em cada sistema operacional requer homologação em dispositivo real; não foi executada nesta entrega. Não foram criados instaladores EXE/DMG/APK nem publicações em lojas: a instalação ocorre pelo próprio navegador.

GitHub Pages usa `/dragonballlegadoeterno/`; Sites usa `/`. O manifest, o registro do worker e os atalhos resolvem a partir do endereço atual. Cada host e navegador mantém sua instalação e cópia offline separadas.

Safari macOS: Sonoma 14 ou posterior, Arquivo → Adicionar ao Dock. iOS/iPadOS: Safari → Compartilhar → Adicionar à Tela de Início. Windows: Edge/Chrome oferecem instalação no menu. Android: Chrome oferece Instalar. Nomes e disponibilidade variam; `instalar.html` apresenta as fontes oficiais consultadas.

## Segurança e dados

Sem contas, APIs externas novas, rastreadores ou pedidos de notificações, câmera, microfone ou localização. Cache contém apenas recursos públicos deste acervo. O worker ignora POST, outras origens e outros projetos. A limpeza remove somente caches com o prefixo desta aplicação e deste escopo, preservando dados de outros sites.

Fontes externas continuam sendo links. O projeto mantém sua arquitetura estática e nenhuma dependência foi adicionada.

## Verificação e manutenção

Executar `npm run build`, `npm test` e `npm run audit:content`. A suíte PWA verifica escopos de raiz/subdiretório, tamanho real dos PNGs, referências em todas as páginas, navegação e busca offline, prioridade da rede, preservação de 404, limites de origem/escopo, atualização explícita, falha no download, cache apagado e recusa de instalação.

Os testes usam Node e ambiente simulado de service worker; não equivalem a homologação no Safari/Chrome/Edge em aparelhos reais. Conferir manualmente ícone recortado, instalação, abertura sem conexão após confirmação, atualização e desinstalação em cada plataforma.

## Reversão

Para uma correção comum, publique uma nova edição: a revisão é gerada automaticamente. Para reverter conteúdo, restaure a fonte anterior e preserve temporariamente o mecanismo PWA atualizado até migrar os clientes. Remover apenas `sw.js` do servidor não desinstala workers existentes.

Para retirar o PWA de produção, publique primeiro um worker de retirada no mesmo endereço/escopo, removendo apenas caches do prefixo `db-legado-` correspondente e cancelando o próprio registro. Mantenha-o disponível durante a transição; depois remova manifest e UI. Quem usa a edição antiga sem internet continuará nela até reconectar ou limpar os dados deste site.

## Documentação oficial

- [Apple — aplicativos web no Mac](https://support.apple.com/pt-br/104996)
- [Apple — site como aplicativo no iPhone](https://support.apple.com/pt-br/guide/iphone/iphea86e5236/ios)
- [Microsoft — aplicativos no Edge](https://support.microsoft.com/en-us/edge/install-manage-or-uninstall-apps-in-microsoft-edge)
- [Google — aplicativos web no Chrome](https://support.google.com/chrome/answer/9658361?hl=pt-BR)
- [MDN — operação offline](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Offline_and_background_operation)
- [MDN — escopo do manifest](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Manifest/Reference/scope)
