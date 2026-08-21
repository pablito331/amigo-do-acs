# Revisão de duplicidades

O rastreador é **somente de conferência**: ele não remove nem mescla automaticamente registros de cidadãos. Cada possível ocorrência deve ser revisada pelo ACS antes de qualquer correção no PEC.

## Critérios aplicados

| Critério | Normalização aplicada | Finalidade |
|---|---|---|
| CPF | Apenas dígitos | Sinalizar o mesmo identificador em mais de um registro. |
| CNS | Apenas dígitos | Sinalizar o mesmo identificador em mais de um registro. |
| Nome e nascimento | Nome sem acentos/pontuação/espaços variáveis e data em formato `AAAA-MM-DD` | Sinalizar registros de mesmo cidadão provável, mesmo que CPF e CNS estejam diferentes. |

## Validação realizada

Os oito CSVs PEC compartilhados foram analisados. Eles contêm repetições esperadas do mesmo cidadão entre listas temáticas; quando os identificadores são iguais, o importador consolida essas linhas em um único cidadão, portanto elas não devem aparecer como duplicidade na tela.

Foi acrescentado um teste de importação que reproduz dois registros PEC com **mesmo nome e nascimento em formatos diferentes**, mas com CPFs distintos. Após a importação, os dois registros permanecem preservados e o rastreador os apresenta pelo critério **Nome e nascimento**. A área de Indicadores agora deixa o rastreador aberto por padrão e mostra, em cada ocorrência, nome, data de nascimento, CPF, CNS e microárea para revisão.

## Evidência de importação local

Em validação isolada com os **8 CSVs PEC compartilhados**, a importação local consolidou **404 cidadãos**. Antes de qualquer inserção de teste, o rastreador encontrou **5 grupos** para revisão. Em seguida, foi acrescentado à mesma base local um segundo registro com nome e data de nascimento idênticos, mas identificadores distintos; o rastreador o sinalizou com sucesso pelo critério **Nome e nascimento**. A validação foi executada em IndexedDB simulado e não alterou os dados de uso do aplicativo.
