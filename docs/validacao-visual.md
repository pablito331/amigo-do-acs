# Validação visual

## 21 de agosto de 2026

| Verificação | Resultado | Ação tomada |
|---|---|---|
| Telas desktop iniciais | Falha: carregamento em branco. | Corrigida a classe utilitária personalizada que impedia a compilação do CSS. |
| Telas desktop após a primeira correção | Falha: conteúdo renderizado sem utilidades de layout. | Identificada a ausência da importação principal do Tailwind no CSS global; importação adicionada. |

As próximas capturas devem confirmar o carregamento completo das utilidades visuais e verificar as dimensões desktop e móvel antes da entrega.

## Validação após correção de estilos

As telas principais foram verificadas em **1280×900** e **375×812**. No celular, o menu lateral passa a uma navegação inferior persistente; as grades passam a uma coluna; os controles de importação, ajustes, backup e rotina preservam áreas de toque adequadas; e a tabela semanal admite rolagem horizontal sem cortar seu conteúdo. A composição geral, a hierarquia de navegação e os botões de ação permanecem legíveis nas capturas móveis.

## Validação em tablet

As telas de painel, importação, cidadãos, rotina, backup e ajustes foram verificadas em **768×1024**. Nesse breakpoint, o sistema conserva cabeçalho compacto, cartões em colunas apropriadas, campos de formulário lado a lado quando há espaço e tabelas legíveis. A navegação permanece móvel, evitando uma barra lateral estreita e preservando espaço útil para o conteúdo de campo.

## Filtro de microárea

A tela de cidadãos foi verificada em **1280×900** após a correção. O seletor de microárea permanece visível abaixo dos filtros principais, com a opção de usar a microárea ativa, visualizar todas ou selecionar uma microárea disponível nos dados importados.

A mesma tela também foi verificada em **768×1024** após a inclusão das medidas antropométricas. O seletor de microárea, a lista e o espaço de detalhe preservam alinhamento e legibilidade no layout de tablet; o bloco de medidas é exibido no detalhe assim que há um cidadão importado com peso e altura.

## Filtro mestre global

Após a migração para um filtro mestre, as telas de Painel e Cidadãos foram verificadas em **1280×900**. O seletor persistente aparece no cabeçalho de ambas as telas, com indicação clara de que a escolha é global. A tela de cidadãos passou a exibir apenas a indicação do filtro mestre, sem duplicar o controle por página.

Em **375×812**, o filtro mestre é reduzido para um controle compacto no cabeçalho, sem competir com o indicador de funcionamento offline ou com a navegação inferior. A escolha ativa permanece legível na tela de cidadãos.

## Detalhe antropométrico em tablet

O detalhe de cidadão foi validado em **768×1024** com uma prévia isolada de desenvolvimento, removida antes da entrega. A conferência mostrou, no mesmo painel, a linha compacta de peso e altura no topo, cartões com peso, altura e IMC estimado, data da última medida e o bloco de crescimento infantil com situação do Bolsa Família, vigência e registros de peso/altura em 12 meses.

Como validação final, os oito CSVs reais compartilhados foram importados em uma janela isolada. Um cidadão real da lista de Desenvolvimento infantil foi selecionado e confirmou visualmente a linha de peso/altura, o IMC estimado e o bloco de acompanhamento infantil. A janela, os arquivos temporários e a dependência usada exclusivamente na automação foram removidos antes da entrega; nenhum dado de cidadão foi preservado no projeto.

## Painel de indicadores

A aba de indicadores foi validada em **1280×900** e **375×812**. Em desktop, o gráfico de cobertura, os cartões de resumo, as orientações e a lista de busca ativa ocupam colunas equilibradas. Em celular, os cartões e o gráfico passam a uma coluna, a navegação inferior preserva o acesso à aba e o detalhamento continua legível sem rolagem horizontal.

## Medidas antropométricas

Após a inclusão do resumo de peso e altura no detalhe do cidadão, a tela de cidadãos foi verificada em **375×812** e **1280×900**. A estrutura de busca, lista e painel de detalhe preserva o comportamento responsivo. As medidas são exibidas somente após importação de um cidadão que possua os campos no relatório Geral; a validação agregada dos CSVs confirma a disponibilidade desses campos em parte substancial da base.

## Rotina, recências e prioridade por cor

Em **21 de agosto de 2026**, as telas de Cidadãos e Rotina foram verificadas novamente em **1280×720** e **375×812**. A busca, os filtros, a ordenação, o cabeçalho com filtro mestre e a estrutura de detalhe do cidadão permanecem legíveis no celular. O detalhe é expandido abaixo do registro selecionado e pode ser recolhido ao tocar novamente o mesmo registro.

A rotina diária preserva os controles de período e meta em uma única coluna no celular. O relatório semanal mantém as ações de exportar e imprimir, os campos de condições e a tabela com rolagem horizontal quando necessário. A validação visual do conteúdo de recência PEC e prioridade por cor deve ser repetida com uma base PEC real no navegador de uso, pois as capturas finais foram feitas sem registros persistidos nesta janela de validação.
