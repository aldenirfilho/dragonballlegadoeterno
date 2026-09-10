# Imagens por fase e dicionário cultural — 1.3.0

## Entrega

As 101 fichas do Atlas do Ki recebem imagem, legenda, crédito, fonte e uma descrição de sua relação com a forma. O dicionário reúne 45 verbetes e dez comparações culturais brasileiras. Cada entrada separa significado, uso na história, ressalva pertinente e fontes.

As imagens oficiais foram selecionadas pela associação explícita entre imagem e texto da publicação original. Seus endereços responderam HTTP 200 e Content-Type de imagem na pesquisa. Não foi feita inspeção de pixels desse conjunto externo. Fotografias de figuras e artes de jogos têm sua natureza identificada; servem à aparência/forma, nunca à determinação do nível de poder.

As novas fan arts têm prompts e origem em `content/ki-fan-art.json`, entram na galeria e foram inspecionadas visualmente como arquivos locais. São interpretações de idade, forma e contexto, sem promessa de reproduzir um frame, uniforme em cada detalhe ou instante exato de uma leitura. Os originais da geração foram preservados; versões JPEG menores são usadas no site. Não foi editada ou recortada mídia externa.

## Continuidade e fontes

`content/ki-images.json` exige correspondência de registro, personagem, fase e forma. O validador rejeita referências desconhecidas, duplicadas ou incompletas. Essa validação estrutural não decide se a imagem realmente corresponde à história: a relação textual e suas limitações permanecem no inventário.

Foram corrigidos links que apontavam outra fase ou outro personagem. As alterações estão em `docs/KI_CORRECOES_FONTES.json`. As 12 leituras numéricas não foram alteradas. O nível medido e sua origem textual permanecem separados da fonte da imagem.

## Dicionário e Brasil

`content/glossary.json` reúne energia, técnicas, nomes, vocabulário cultural e objetos. As traduções explicativas não são anunciadas como localização oficial. Kanji, trocadilhos e etimologias são tratados separadamente; as incertezas de Kamehameha e Zenkai não foram preenchidas com versões populares sem confirmação.

As comparações usam referências culturais japonesas e recortes brasileiros identificados: capoeira, baianas de acarajé, cordel, Bumba-meu-boi do Maranhão, alimentação e práticas da Fundação Japão no Brasil. Não atribuem um costume único a uma nacionalidade nem afirmam influência direta sobre Dragon Ball sem fonte. As notas metodológicas estão em `docs/GLOSSARIO_PESQUISA.md`.

## Funcionamento e limites

- Busca por palavra e assunto, sem distinguir acentos, com preservação dos filtros na URL.
- Links diretos revelam o verbete mesmo quando a URL traz filtros conflitantes.
- Busca geral encontra verbetes e comparações culturais.
- Dicionário, dados, legendas e fan arts locais integram a edição offline.
- Imagens oficiais incorporadas dependem de internet e da disponibilidade do servidor de origem. Quando falham, a página mantém a legenda e o link para a fonte. O mesmo tratamento cobre as cópias do comparador.
- Sem JavaScript, o conteúdo continua legível; somente os filtros ficam indisponíveis.

Não foi realizada homologação interativa em navegador, instalação em aparelho real ou revisão linguística humana especializada. Testes automatizados não substituem essas etapas.

## Manutenção e reversão

Para ampliar a coleção, preservar IDs, acrescentar fontes e declarar a relação entre imagem, fase e forma. Executar build, testes e auditoria antes da publicação. O rollback consiste em reverter o commit e republicar nas duas hospedagens; não apagar o repositório nem o histórico.

## Verificação executada em 10/09/2026

Build concluído com 47 páginas, 28 fan arts na galeria e 92 recursos locais offline. Os 32 testes Node passaram, assim como a auditoria editorial e `git diff --check`. Foram verificadas 85 URLs de imagens oficiais com HEAD 200 e MIME de imagem. O atlas usa 95 imagens distintas em 101 fichas: 89 referências oficiais e 12 associações às dez novas fan arts.

O dicionário foi revisado por pesquisa paralela em fontes primárias; foram corrigidos a redação de Senzu, o escopo do verbete Zenkai e a referência de Gohan. As duas gerações de Goku que falharam no sistema de imagens foram substituídas por referências oficiais pertinentes, sem improvisar uma forma visual diferente.
