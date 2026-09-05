# 🐉 Dragon Ball · Legado Eterno

Uma enciclopédia independente de fãs em português brasileiro. Histórias, personagens, famílias, técnicas, ilustrações e reflexões sobre coragem, cuidado e crescimento.

**[Abrir o site](https://aldenirfilho.github.io/dragonballlegadoeterno/)** · **[Sugerir uma correção](https://github.com/aldenirfilho/dragonballlegadoeterno/issues/new/choose)**

## O que há no acervo

- Perfis dos personagens: trajetória, personalidade, emoções, poderes, vínculos e contradições.
- Especial de Goku: oito ensaios sobre curiosidade, prática, mestres, descanso, cooperação e responsabilidade.
- História e sagas com indicação de continuidade; famílias e vínculos de mentoria.
- Técnicas, transformações e guia histórico de filmes.
- Lições de vida com cena, interpretação, ação cotidiana e limites da analogia.
- Notícias com fonte primária, data de publicação e território de lançamento.
- Galeria de fan arts geradas por IA, acompanhadas de prompts e créditos.
- Busca, filtros, texto ampliado e páginas legíveis sem JavaScript.

O corte editorial inicial é **05/09/2026**. O acervo é expansível, não exaustivo. O número real de itens consta em `dist/build-info.json` depois da compilação.

## Rodar localmente

Requer Node.js 22 ou superior. Não há dependências externas de execução ou compilação.

```bash
npm run build
npm test
npm run dev
```

A prévia abre em `http://127.0.0.1:4173/`. O resultado estático fica em `dist/`. Para usar outro domínio canônico, defina `SITE_URL` ao executar o build.

## Organização

| Caminho | Finalidade |
| --- | --- |
| `content/encyclopedia.json` | Personagens, sagas, famílias, lições, Goku e técnicas |
| `content/news.json` | Anúncios verificados, território e corte editorial |
| `content/transformations.json` | Formas e diferenças de continuidade |
| `content/films.json` | Guia histórico de filmes |
| `content/images.json` | Créditos, prompts e textos alternativos das artes |
| `public/` | Estilos, interações e imagens locais |
| `scripts/build.mjs` | Geração das páginas estáticas |
| `scripts/editorial-agents.mjs` | Catalogação, inventário e observação de fontes |
| `agents/` | Instruções dos agentes editoriais |
| `docs/` | Política editorial, fontes, operação e validação |
| `.github/workflows/` | Verificação, publicação Pages e relatório editorial |

## Atualização contínua

```bash
npm run audit:content
npm run monitor:sources
```

O primeiro comando verifica a organização local. O segundo acessa apenas as fontes públicas declaradas, registra hashes e produz um relatório em `artifacts/`. Mudança de página não é notícia confirmada: o relatório exige leitura e revisão humana antes de alterar o acervo.

O workflow **Agentes de catalogação e observação** pode ser executado manualmente no GitHub Actions. A rotina recorrente de acompanhamento, quando configurada no Codex, opera separadamente e propõe mudanças para revisão; não deve publicar alterações editoriais sem conferência. Não são serviços de IA autônomos executados no navegador.

Veja [política editorial](docs/POLITICA_EDITORIAL.md), [contribuição](CONTRIBUTING.md), [operação](docs/OPERACAO.md) e [roteiro](docs/ROADMAP.md).

## Publicação e reversão

O workflow `pages.yml` compila e testa cada mudança. Em `main`, publica `dist/` no GitHub Pages após validação. Configure Pages com origem **GitHub Actions**. Pull requests executam verificação e não publicam.

A hospedagem Sites é uma entrega adicional do mesmo código, registrada em `.openai/hosting.json`; mudanças futuras no GitHub não atualizam Sites automaticamente. O endereço GitHub Pages é o canônico para manutenção contínua.

Reverta o commit da alteração e publique novamente para recuperar a versão anterior. O histórico anterior do repositório foi preservado. Nunca é necessário apagar o repositório ou reescrever o histórico.

## Direitos, imagens e privacidade

Projeto independente e não oficial, sem afiliação ou endosso. Dragon Ball e seus personagens pertencem aos respectivos titulares, incluindo Akira Toriyama / Bird Studio / Shueisha / Toei Animation. As imagens são fan arts geradas por IA e não conferem direitos sobre personagens ou marcas. Leia [direitos e créditos](RIGHTS.md).

Não são distribuídos episódios, filmes, páginas de mangá ou músicas. Textos são sínteses originais e interpretações identificadas. Não há anúncios, telemetria adicionada pelo projeto, cadastro, credenciais no navegador ou banco de dados de visitantes. Links externos seguem as políticas dos respectivos serviços.

Criado por **Aldenir Filho**, para fãs que desejam compreender a obra, preservar suas memórias e compartilhar leituras responsáveis.
