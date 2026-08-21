# Campos antropométricos identificados nas exportações PEC

As exportações compartilhadas do relatório **Acompanhamento de Condições de Saúde** apresentam os campos abaixo na seção comum dos cidadãos. Eles podem ser consolidados localmente e exibidos no perfil individual sem exigir uma nova fonte de dados.

| Campo no CSV PEC | Uso no Amigo do ACS |
|---|---|
| `Última medição de peso` | Peso mais recente informado no relatório. |
| `Última medição de altura` | Altura mais recente informada no relatório. |
| `Data da última medição de peso e altura` | Referência temporal das medidas. |
| `Beneficiário do programa Bolsa Família` | Sinalização operacional de vinculação ao programa. |
| `Vigência do programa Bolsa Família` | Informação de vigência trazida pelo PEC. |
| `Registros de peso e altura simultâneos nos últimos 12 meses` | Indicador operacional presente, entre outros, na lista de pessoa idosa. |

O IMC, quando houver peso e altura válidos, será apresentado apenas como **cálculo estimado da medida informada**, sem classificação clínica automática. A tela preservará o dado original importado e deverá ser usada em conjunto com as orientações da equipe de saúde.

## Validação agregada

A importação controlada dos oito arquivos compartilhados consolidou **404 cidadãos**, dos quais **346** possuíam peso e altura reconhecidos e **404** traziam a informação de vinculação ao Bolsa Família. A verificação foi executada em banco temporário e descartável, sem armazenar ou exibir registros individuais.
