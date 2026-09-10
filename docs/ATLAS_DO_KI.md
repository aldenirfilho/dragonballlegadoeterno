# Atlas do Ki — versão 1.2.0

Revisão em 10/09/2026. Atualização da versão 1.1.0 para 1.2.0.

## Cobertura

29 fases editoriais, 101 registros, 27 nomes (os 24 perfis existentes mais Nail, Ginyu e Saibaman) e 12 leituras numéricas verificadas. O atlas seleciona marcos do Clássico, Z, Super, DAIMA e GT; não pretende enumerar cada episódio nem cada lutador. Cada registro distingue a continuidade, a forma, o momento e a fonte.

O nível de poder de luta é um índice ficcional, não uma unidade física de energia. Energia contida, ataque concentrado, limite inferior e máximo declarado não são medidas intercambiáveis. Uma cifra ausente não equivale a zero. Não foram preenchidas lacunas com estatísticas de jogos ou extrapolações de fãs. Há páginas promocionais oficiais como evidência da existência/nome de formas; seus atributos de jogo não são usados como valores do anime ou mangá.

## Leituras verificadas

| Registro | Valor | Fonte primária |
| --- | --- | --- |
| Piccolo · Makankosappo contra Raditz | 1.330 | [Retrospectiva dos namekuseijins](https://en.dragon-ball-official.com/news/01_530.html) |
| Gohan · reação contra Raditz | 1.307 | [Gohan na saga Saiyajin](https://en.dragon-ball-official.com/news/01_503.html) |
| Saibaman · invasão da Terra | 1.200 | [Perfil oficial](https://en.dragon-ball-official.com/news/01_2894.html) |
| Gohan · Masenko contra Nappa | 2.800 | [Gohan na saga Saiyajin](https://en.dragon-ball-official.com/news/01_503.html) |
| Goku · chegada contra Nappa | > 8.000 | [Comentário oficial sobre a diferença entre dublagens](https://en.dragon-ball-official.com/news/01_184.html) |
| Vegeta · primeira fase em Namek | 24.000 | [Nail](https://en.dragon-ball-official.com/news/01_2250.html), [Dodoria](https://en.dragon-ball-official.com/news/01_3406.html) |
| Goku · energia contida diante de Ginyu | 5.000 | [Perfil de Ginyu](https://en.dragon-ball-official.com/news/01_2068.html) |
| Goku · demonstração com Kaioken | 180.000 | [Perfil de Ginyu](https://en.dragon-ball-official.com/news/01_2068.html) |
| Ginyu · corpo original | 120.000 | [Perfil de Ginyu](https://en.dragon-ball-official.com/news/01_2068.html) |
| Freeza · primeira forma em Namek | 530.000 | [Freeza na segunda forma](https://en.dragon-ball-official.com/news/01_1819.html) |
| Freeza · segunda forma | > 1.000.000 | [Freeza na segunda forma](https://en.dragon-ball-official.com/news/01_1819.html) |
| Nail · antes do duelo com Freeza | 42.000 | [Perfil oficial](https://en.dragon-ball-official.com/news/01_2250.html) |

O portal oficial tem textos traduzidos automaticamente. Para o registro de Goku diante de Ginyu foi seguida a leitura de 180.000 reproduzida no perfil de Ginyu; a descrição do perfil de Jiece emprega “over 180,000”. O atlas identifica a fonte usada e não trata essa descrição como um teto da capacidade de Goku.

## Funções

- Filtrar por personagem, fase, presença de medição e palavras do contexto, ignorando acentos.
- Copiar um link com os filtros; se o clipboard for negado, selecionar o endereço manualmente.
- Abrir uma ficha por âncora, inclusive a partir da busca global, sem deixá-la escondida pelos filtros.
- Comparar duas leituras lado a lado com suas condições, sem prever vencedores nem calcular multiplicadores artificiais.
- Ler todas as fichas sem JavaScript e baixar `ki-dados.json` com as fontes.
- Consultar o atlas offline após o PWA salvar a nova edição.

## Manutenção

Editar `content/ki.json`, usando IDs estáveis. `validateKi` confere integridade, relações, fontes e coerência entre ausência de valor e o tipo de registro. A auditoria editorial agora inclui o atlas. Após alterar dados ou código, executar build, testes e auditoria. O service worker recebe uma revisão calculada a partir dos recursos publicados.

## Correções

1. Falha em CacheStorage era propagada antes da tentativa de rede; agora a leitura online continua.
2. `beforeinstallprompt` era interceptado inclusive sem botão na página; nessas páginas a oferta nativa é preservada.
3. Uma URL com escape inválido lançava exceção no servidor local; agora retorna HTTP 400, mantém o processo ativo e respeita HEAD sem corpo.
4. O menu pode ser fechado com Escape, devolvendo o foco ao botão, e ao seguir um link. A navegação em larguras intermediárias tem espaço próprio.

## Verificação executada

Build concluído com 46 páginas e 76 recursos offline. Os 26 testes Node passaram, incluindo regressões do cache negado, instalação nativa, URL inválida, filtros combinados, links diretos, evidência e inclusão do atlas no pacote offline. Auditoria de conteúdo e `git diff --check` sem problemas. Sintaxe de `ki.js`, `pwa.js` e servidor conferida.

Não foi realizada homologação interativa em navegador ou instalação em aparelhos reais nesta atualização. Conferir manualmente filtros no celular, comparação, clipboard, teclado e atualização do aplicativo antes de considerar esses ambientes homologados.

## Notícias

Em 10/09/2026 foram reconsultados o índice Anime e os anúncios oficiais de Beerus e The Galactic Patrol. Não foi incorporada mudança de data. A busca em fontes brasileiras não localizou novo anúncio pertinente; essa cobertura é parcial. O corte do radar permaneceu em 05/09/2026, sem aparentar uma revisão integral que não foi executada.

## Reversão

Reverter este commit e publicar novamente recupera o site 1.1.0, que já possui worker PWA. A publicação da revisão anterior deve também ser feita no Sites caso as duas hospedagens sejam mantidas. Clientes offline recebem a reversão ao reconectar e atualizar. Não apagar caches de outros sites, o repositório ou fontes editoriais.
