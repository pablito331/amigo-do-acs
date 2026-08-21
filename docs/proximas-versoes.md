# Próximas versões — Amigo do ACS

Este documento reúne **ideias, melhorias e correções futuras**. Os itens aqui registrados **não serão implementados** até que o usuário autorize explicitamente o início de uma nova versão.

| Situação | Ideia ou correção | Observação |
|---|---|---|
| Pendente de autorização | Conversa a partir do telefone do cidadão. | Ao tocar no número, oferecer um canal de conversa compatível e confirmado pelo ACS, como WhatsApp ou aplicativo de mensagens disponível no dispositivo. |
| Pendente de autorização | Notas de versão. | Exibir em cada versão publicada um resumo das correções, melhorias e recursos incluídos. |
| Em implementação | Compartilhamento de relatório por e-mail. | Usar o e-mail dedicado informado, com ação visível, destinatário claramente apresentado, prévia do conteúdo e confirmação explícita antes do envio. |
| Pendente de autorização | Correção do detector de duplicados. | Existem duplicidades conhecidas que não foram identificadas pela versão atual; revisar normalização, chaves e critérios de comparação sem excluir dados automaticamente. |
| Pendente de autorização | Agenda/calendário de visitas. | Planejar a rotina em uma agenda diária, permitindo visualizar os cidadãos previstos em cada data. |
| Pendente de autorização | Lembretes da agenda. | Criar uma área de lembretes por dia para apoiar a organização do ACS. |
| Pendente de autorização | Fluxo “Visitar” antes de concluir. | A ação deve abrir o atendimento com campo de anotações; a visita só será concluída depois desse registro. |
| Pendente de autorização | Fale Conosco. | Criar um canal de contato ligado ao e-mail dedicado que será informado, com destinatário e mensagem visíveis antes do envio. |
| Pendente de autorização | Tela Sobre. | Informar o objetivo do aplicativo, o uso local/offline e a versão instalada. |
| Pendente de autorização | Notas de versão dentro do app. | Mostrar as correções, melhorias e recursos incluídos em cada publicação. |

## Decisão de navegação implementada

As informações de **Sobre**, **Fale Conosco** e **Notas de versão** ficam reunidas na rota única **`/sobre`**. Essa decisão mantém a navegação simples em dispositivos móveis e concentra os avisos de privacidade, a versão instalada, o canal de contato e o histórico de atualizações em um único local.
