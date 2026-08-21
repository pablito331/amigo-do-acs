import type { Cidadao } from "./domain";
import { paraData } from "./date-utils";

export type SituacaoAntropometricaBolsaFamilia = "em-dia" | "atencao" | "atrasado" | "sem-registro";

export interface AcompanhamentoAntropometrico {
  situacao: SituacaoAntropometricaBolsaFamilia;
  diasDesdeMedicao: number | null;
  possuiPeso: boolean;
  possuiAltura: boolean;
  possuiData: boolean;
  titulo: string;
  descricao: string;
}

function inicioDoDia(data: Date): Date {
  return new Date(data.getFullYear(), data.getMonth(), data.getDate());
}

/**
 * Organiza o acompanhamento local de peso e altura para facilitar a busca ativa.
 * A regra é operacional: até 30 dias em dia; de 31 a 60 dias requer atenção;
 * acima de 60 dias ou com informação incompleta deve ser priorizado.
 */
export function avaliarAcompanhamentoAntropometrico(
  cidadao: Pick<Cidadao, "pesoKg" | "alturaCm" | "dataUltimaMedicaoPesoAltura">,
  referencia = new Date(),
): AcompanhamentoAntropometrico {
  const possuiPeso = cidadao.pesoKg !== null && cidadao.pesoKg !== undefined && cidadao.pesoKg > 0;
  const possuiAltura = cidadao.alturaCm !== null && cidadao.alturaCm !== undefined && cidadao.alturaCm > 0;
  const dataMedicao = paraData(cidadao.dataUltimaMedicaoPesoAltura);
  const possuiData = dataMedicao !== null;

  if (!possuiPeso || !possuiAltura || !dataMedicao) {
    return {
      situacao: "sem-registro",
      diasDesdeMedicao: null,
      possuiPeso,
      possuiAltura,
      possuiData,
      titulo: "Registro incompleto",
      descricao: "Importe ou atualize peso, altura e a data da última medição para acompanhar este cadastro.",
    };
  }

  const diasDesdeMedicao = Math.max(0, Math.floor((inicioDoDia(referencia).getTime() - inicioDoDia(dataMedicao).getTime()) / 86_400_000));

  if (diasDesdeMedicao <= 30) {
    return {
      situacao: "em-dia",
      diasDesdeMedicao,
      possuiPeso,
      possuiAltura,
      possuiData,
      titulo: "Em dia",
      descricao: `Peso e altura registrados há ${diasDesdeMedicao} dia(s).`,
    };
  }

  if (diasDesdeMedicao <= 60) {
    return {
      situacao: "atencao",
      diasDesdeMedicao,
      possuiPeso,
      possuiAltura,
      possuiData,
      titulo: "Atenção à atualização",
      descricao: `Última medição há ${diasDesdeMedicao} dia(s). Programe a atualização do acompanhamento.`,
    };
  }

  return {
    situacao: "atrasado",
    diasDesdeMedicao,
    possuiPeso,
    possuiAltura,
    possuiData,
    titulo: "Atualização prioritária",
    descricao: `Última medição há ${diasDesdeMedicao} dia(s), acima de 2 meses.`,
  };
}
