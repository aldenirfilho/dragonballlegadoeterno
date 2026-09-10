# Validação da entrega inicial

Data: 05/09/2026. Ambiente local: macOS, Node.js 24.18.0.

## Executado

- `npm run build`: compilação concluída; 43 páginas estáticas geradas.
- `npm test`: 11 testes automatizados passaram, sem falhas.
- `npm run audit:content`: campos, IDs, datas e referências estruturais conferidos, sem problemas apontados.
- `npm run monitor:sources`: oito URLs públicas consultadas com sucesso na primeira observação. Registrados hashes e horários; isso não substitui interpretação editorial.
- `node --check`: sintaxe conferida nos scripts de construção, servidor, agentes e interações.
- `git diff --check`: nenhuma falha de whitespace apontada.
- `npx --yes prettier@3.6.2 --write ...`: formatação dos arquivos JavaScript e CSS. Não adicionou dependência ao projeto.
- Prévia local: resposta HTTP 200 no endereço do servidor.
- Revisão independente de código: correções de busca global, raiz da página 404 e cabeçalho em telas estreitas incorporadas.
- Revisão factual por amostragem: origem de Piccolo, família de Bardock, Androide 17, Senzu entregue a Cell e separação GT/DAIMA conferidas em fontes oficiais. Duas formulações editoriais foram ajustadas.
- Artes selecionadas inspecionadas como imagens; textos alternativos e prompts registrados no manifesto.

## Cobertura dos testes

1. Completude mínima e rastreabilidade do catálogo.
2. Rejeição de IDs duplicados, fontes ausentes e datas futuras em relação ao corte.
3. Idioma, descrição, título principal e ausência de valores indefinidos em cada página.
4. Existência dos destinos dos links, âncoras e imagens.
5. Arquivos de arte, textos alternativos e prompts.
6. Preservação de fonte, território e data nas notícias; ausência dos rastreadores verificados.
7. Base canônica da página 404.
8. Busca com formas, filmes e técnicas.
9. Filtragem conjunta e tolerância a acentos.
10. Estado de busca vazia e recuperação.
11. Estados acessíveis do menu e da ampliação de texto.

## Limites e homologação pendente

Não houve teste interativo do site em navegador nem homologação visual humana. Os testes de interação usam um ambiente simulado; não provam o comportamento completo do navegador. Recomenda-se conferir celular real, zoom, navegação por teclado e galeria ampliada.

A verificação factual foi amostral. Os links apontam para referências primárias, mas nem todos foram auditados por HTTP nesta entrega; algumas páginas da Toei retornaram bloqueio ao acesso direto durante pesquisa, com conteúdo oficial disponível no índice de busca. Ilustrações são fan arts geradas por IA, sujeitas a diferenças em relação aos desenhos oficiais.

O resultado de publicação deve ser conferido no histórico do GitHub Actions e na versão correspondente da hospedagem. Um teste local ou HTTP 200 não representa revisão humana integral.

## Aplicativo web — 05/09/2026, versão 1.1.0

- Build: concluído com 45 páginas e 72 recursos na lista offline.
- `npm test`: 19 testes passaram (11 anteriores e 8 de PWA).
- `npm run audit:content`: catálogo sem problemas estruturais.
- `git diff --check`: sem erros de whitespace.
- Ícones: PNGs com dimensões verificadas; ícone de 512 pixels inspecionado visualmente.
- Revisão independente encontrou fallback relativo em URL aninhada e cache removido não recomposto; ambos corrigidos com testes de regressão.
- Homologação manual em macOS, Windows, iOS/iPadOS e Android permanece pendente. Não foi executado teste de interface no navegador nesta entrega.

## Atlas do Ki — 10/09/2026, versão 1.2.0

- Build concluído: 46 páginas, 76 recursos offline.
- `npm test`: 26 testes passaram.
- `npm run audit:content`: catálogo e atlas sem problemas estruturais.
- `git diff --check` e sintaxe dos scripts modificados sem falhas.
- 29 fases, 101 registros e 12 leituras numéricas verificadas.
- As validações do navegador usam simulação; a instalação e o uso em dispositivos reais permanecem sem homologação nesta atualização.
- Metodologia, fontes, correções e reversão documentadas em `ATLAS_DO_KI.md`.
