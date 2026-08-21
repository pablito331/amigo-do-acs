import { idadeEmAnos, mesesDesde } from "./date-utils";
import type { Cidadao, Prioridade, RegrasPrioridade } from "./domain";

function consultasEsperadas(igSemanas: string | null): number {
  const semanas = Number(String(igSemanas ?? "").match(/\d+/)?.[0]);
  if (!Number.isFinite(semanas) || semanas <= 0) return 1;
  if (semanas < 20) return 2;
  if (semanas < 28) return 3;
  if (semanas < 34) return 4;
  if (semanas < 37) return 5;
  return 6;
}

export function gerarPrioridades(cidadaos: Cidadao[], regras: RegrasPrioridade): Prioridade[] {
  const prioridades: Prioridade[] = [];

  cidadaos.forEach((cidadao) => {
    const identificador = cidadao.nome || "Cidadão sem nome informado";
    const mesesVisita = cidadao.mesesUltimaVisitaDomiciliar;
    if (mesesVisita !== null && mesesVisita >= regras.mesesVisitaAtrasada) {
      prioridades.push({
        id: `${cidadao.id}:visita`,
        cidadaoId: cidadao.id,
        nivel: mesesVisita >= regras.mesesVisitaAtrasada + 2 ? "alta" : "media",
        categoria: "Visita domiciliar",
        titulo: `${identificador}: visita em atraso`,
        detalhe: `A última visita registrada foi há ${mesesVisita} mês(es).`,
        referencia: null,
      });
    }

    const idade = idadeEmAnos(cidadao.dataNascimento);
    const mesesPreventivo = mesesDesde(cidadao.examePreventivoUltimaAvaliacao);
    if (cidadao.isMulher && idade !== null && idade >= 25 && idade <= 64 && (mesesPreventivo === null || mesesPreventivo > regras.mesesPreventivo)) {
      prioridades.push({
        id: `${cidadao.id}:preventivo`,
        cidadaoId: cidadao.id,
        nivel: "media",
        categoria: "Saúde da mulher",
        titulo: `${identificador}: rastreamento pendente`,
        detalhe: mesesPreventivo === null ? "Não há avaliação de rastreamento registrada." : `Última avaliação há ${mesesPreventivo} mês(es).`,
        referencia: cidadao.examePreventivoUltimaAvaliacao,
      });
    }

    const mesesHemoglobina = mesesDesde(cidadao.dataUltimaHemoglobinaGlicada);
    const mesesConsultaDiabetes = mesesDesde(cidadao.dataUltimaConsultaDiabetes);
    if (cidadao.isDiabetico && (mesesHemoglobina === null || mesesHemoglobina > regras.mesesDiabetes || mesesConsultaDiabetes === null || mesesConsultaDiabetes > regras.mesesDiabetes)) {
      prioridades.push({
        id: `${cidadao.id}:diabetes`,
        cidadaoId: cidadao.id,
        nivel: "alta",
        categoria: "Diabetes",
        titulo: `${identificador}: acompanhamento de diabetes`,
        detalhe: "Há pendência de hemoglobina glicada ou de consulta no intervalo configurado.",
        referencia: cidadao.dataUltimaHemoglobinaGlicada ?? cidadao.dataUltimaConsultaDiabetes,
      });
    }

    const mesesConsultaHiper = mesesDesde(cidadao.dataUltimaConsultaHipertensao);
    const mesesPressao = mesesDesde(cidadao.dataUltimaMedicaoPressao);
    if (cidadao.isHipertenso && (mesesConsultaHiper === null || mesesConsultaHiper > regras.mesesHipertensao || mesesPressao === null || mesesPressao > regras.mesesHipertensao)) {
      prioridades.push({
        id: `${cidadao.id}:hipertensao`,
        cidadaoId: cidadao.id,
        nivel: "alta",
        categoria: "Hipertensão",
        titulo: `${identificador}: acompanhamento de hipertensão`,
        detalhe: "Há pendência de consulta ou aferição de pressão no intervalo configurado.",
        referencia: cidadao.dataUltimaConsultaHipertensao ?? cidadao.dataUltimaMedicaoPressao,
      });
    }

    const esperado = consultasEsperadas(cidadao.igSemanas);
    if (cidadao.isGestante && (cidadao.qtdConsultasPreNatal ?? 0) < esperado) {
      prioridades.push({
        id: `${cidadao.id}:gestacao`,
        cidadaoId: cidadao.id,
        nivel: "alta",
        categoria: "Gestação e puerpério",
        titulo: `${identificador}: pré-natal requer atenção`,
        detalhe: `Há ${cidadao.qtdConsultasPreNatal ?? 0} consulta(s) para a idade gestacional informada; referência local: ${esperado}.`,
        referencia: cidadao.igSemanas,
      });
    }
  });

  const ordem = { alta: 0, media: 1, atencao: 2 };
  return prioridades.sort((a, b) => ordem[a.nivel] - ordem[b.nivel] || a.titulo.localeCompare(b.titulo));
}
