# Operação do acervo

## Agentes executáveis

- **Catalogador**: valida IDs, fontes, campos, datas e cobertura do conteúdo.
- **Organizador**: conta itens e produz inventário e fila de expansão.
- **Observador**: consulta fontes públicas, compara hashes quando há observação anterior e sinaliza revisões.

Execute `npm run audit:content` para auditoria local ou `npm run monitor:sources` para consulta de rede. Resultados ficam em `artifacts/`, excluído do Git. O workflow editorial é manual e mantém um cache das observações e relatórios por 30 dias. Falhas de acesso são registradas como cobertura parcial; não são confundidas com ausência de novidades.

## Acompanhamento recorrente

O acompanhamento inteligente no Codex é separado dos scripts. Ele pode conferir anúncios, executar auditorias e preparar propostas de atualização. Depende da disponibilidade do ambiente, de rede e das credenciais existentes. Os scripts sozinhos não redigem novos verbetes. Não existe garantia de monitoramento em tempo real.

## Revisão e publicação

1. Obter fontes primárias e identificar o que mudou.
2. Atualizar o JSON em uma branch `codex/` e preservar a fonte anterior no histórico.
3. Compilar, testar e revisar texto, links e imagens.
4. Abrir PR em rascunho com evidências e pendências.
5. Após revisão humana e merge, GitHub Actions publica `dist/` no Pages.
6. Confirmar o workflow concluído e a resposta HTTP do site.

Sites usa publicação separada e não é atualizado pelo workflow do GitHub. Para mantê-lo equivalente, publique a mesma versão validada usando o manifesto de hospedagem existente.

## Reversão

Use `git revert <commit>` para criar uma reversão rastreável e publique após os testes. Não usar force push, apagar repositório ou substituir originais externos. Para falha de layout, restaurar os arquivos alterados a partir de um commit conhecido e preservar os dados de conteúdo.

## Limitações de verificação

Testes estáticos detectam campos ausentes, IDs duplicados, caminhos quebrados e metadados. Não substituem conferência factual, autorização de direitos ou avaliação visual e de acessibilidade por uma pessoa. Mudanças de conteúdo ou imagem devem declarar o que foi efetivamente revisado.
