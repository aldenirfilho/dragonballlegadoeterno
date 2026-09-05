# Como contribuir

1. Escolha um erro ou lacuna concreta e procure uma issue existente.
2. Registre a proposta com referência: fonte oficial, capítulo, episódio ou filme, versão e contexto.
3. Modifique a coleção correspondente em `content/`; use ID estável, texto original e o português brasileiro.
4. Preserve o campo de continuidade. Emoções e lições devem ser apresentadas como interpretação.
5. Para notícias, preencha fonte, data de publicação, status e território. Atualize `checkedAt` somente após nova conferência das fontes do radar; não use a data do build como se fosse checagem.
6. Para arte nova, registre prompt, origem, limitações e texto alternativo em `content/images.json`. Não use imagens encontradas na internet sem avaliar autorização de uso.
7. Execute `npm run build`, `npm test` e `npm run audit:content`.
8. Abra um pull request em rascunho, documente os resultados executados e pendências. Mudanças visuais exigem revisão no celular e no computador e comparação antes/depois.
9. Faça revisão humana antes do merge. O merge em `main` publica o GitHub Pages.

Não inclua informações pessoais, documentos privados, tokens, obras integrais, supostas falas sem referência, rumores como fatos ou promessas de benefício psicológico. Não altere fontes originais fora deste repositório.
