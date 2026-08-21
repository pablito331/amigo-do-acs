# Arquitetura local da primeira versão

O Amigo do ACS será uma aplicação instalada no navegador do aparelho utilizado pelo ACS. Não haverá login, servidor de dados nem sincronização remota nesta versão. O **IndexedDB**, acessado pelo Dexie, guardará cidadãos consolidados, visitas, histórico de importações e configurações de prioridade no próprio navegador.

| Elemento | Decisão da primeira versão |
|---|---|
| Importação | Leitura local dos CSVs do PEC com Papa Parse e consolidação por CPF, CNS ou nome mais data de nascimento. |
| Persistência | IndexedDB do navegador; não exige instalação de banco de dados ou serviço no aparelho. |
| Operação offline | Dashboard, busca, cadastro de visitas, indicadores e listas de prioridade usam apenas a base local. |
| Proteção contra perda | Exportação e restauração de backup local. O usuário deverá guardar a cópia fora do aparelho quando necessário. |
| Privacidade | Os dados não são enviados pelo aplicativo a um servidor nesta fase. A proteção física e a senha de bloqueio do aparelho permanecem responsabilidade do usuário e do serviço. |

> A ausência de base central é apropriada para uso individual e offline, mas impede consolidação entre dispositivos, acompanhamento remoto e recuperação automática em caso de limpeza do navegador ou troca de aparelho. Essas capacidades poderão ser adicionadas em uma evolução futura com serviço central e controles de acesso.

