import { idadeEmAnos, idadeEmMeses, mesesDesde } from "./date-utils";
import { normalizarRegrasPrioridade, type Cidadao, type Prioridade, type RegrasPrioridade } from "./domain";
import { avaliarAcompanhamentoAntropometrico } from "./bolsa-familia";

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
  const regrasAtivas = normalizarRegrasPrioridade(regras);
  const prioridades: Prioridade[] = [];

  cidadaos.forEach((cidadao) => {
    const identificador = cidadao.nome || "Cidadão sem nome informado";
    const mesesVisita = cidadao.mesesUltimaVisitaDomiciliar;
    if (regrasAtivas.categoriasAtivas.visitaDomiciliar && mesesVisita !== null && mesesVisita >= regrasAtivas.mesesVisitaAtrasada) {
      prioridades.push({
        id: `${cidadao.id}:visita`,
        cidadaoId: cidadao.id,
        nivel: mesesVisita >= regrasAtivas.mesesVisitaAtrasada + 2 ? "alta" : "media",
        categoria: "Visita domiciliar",
        titulo: `${identificador}: visita em atraso`,
        detalhe: `A última visita registrada foi há ${mesesVisita} mês(es).`,
        referencia: null,
      });
    }

    const idade = idadeEmAnos(cidadao.dataNascimento);
    const mesesPreventivo = mesesDesde(cidadao.examePreventivoUltimaAvaliacao);
    if (regrasAtivas.categoriasAtivas.saudeMulher && cidadao.isMulher && idade !== null && idade >= 25 && idade <= 64 && (mesesPreventivo === null || mesesPreventivo > regrasAtivas.mesesPreventivo)) {
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
    if (regrasAtivas.categoriasAtivas.diabetes && cidadao.isDiabetico && (mesesHemoglobina === null || mesesHemoglobina > regrasAtivas.mesesDiabetes || mesesConsultaDiabetes === null || mesesConsultaDiabetes > regrasAtivas.mesesDiabetes)) {
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
    if (regrasAtivas.categoriasAtivas.hipertensao && cidadao.isHipertenso && (mesesConsultaHiper === null || mesesConsultaHiper > regrasAtivas.mesesHipertensao || mesesPressao === null || mesesPressao > regrasAtivas.mesesHipertensao)) {
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
    if (regrasAtivas.categoriasAtivas.gestacao && cidadao.isGestante && (cidadao.qtdConsultasPreNatal ?? 0) < esperado) {
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

    const idadeMeses = idadeEmMeses(cidadao.dataNascimento);
    if (regrasAtivas.categoriasAtivas.puericultura && idadeMeses !== null && idadeMeses <= 24 && cidadao.qtdConsultasAte24Meses !== null && cidadao.qtdConsultasAte24Meses < regrasAtivas.metaConsultasPuericultura) {
      prioridades.push({ id: `${cidadao.id}:puericultura`, cidadaoId: cidadao.id, nivel: "media", categoria: "Puericultura", titulo: `${identificador}: consultas de puericultura`, detalhe: `${cidadao.qtdConsultasAte24Meses} consulta(s) até 24 meses; referência local: ${regrasAtivas.metaConsultasPuericultura}.`, referencia: cidadao.dataPrimeiraConsultaInfantil });
    }

    const antropometria = avaliarAcompanhamentoAntropometrico(cidadao);
    if (regrasAtivas.categoriasAtivas.antropometriaInfantil && idadeMeses !== null && idadeMeses < 12 * 12 && (antropometria.situacao === "sem-registro" || (antropometria.diasDesdeMedicao ?? 0) > regrasAtivas.diasAcompanhamentoAntropometrico)) {
      prioridades.push({ id: `${cidadao.id}:antropometria`, cidadaoId: cidadao.id, nivel: "media", categoria: "Peso e altura infantil", titulo: `${identificador}: acompanhamento antropométrico`, detalhe: antropometria.situacao === "sem-registro" ? "Peso, altura ou data da medição não foram informados." : `Última medição há ${antropometria.diasDesdeMedicao} dia(s); limite local: ${regrasAtivas.diasAcompanhamentoAntropometrico}.`, referencia: cidadao.dataUltimaMedicaoPesoAltura });
    }

    const mesesAtendimentoIdoso = Math.min(...[cidadao.mesesUltimoAtendimentoMedico, cidadao.mesesUltimoAtendimentoEnfermagem].filter((valor): valor is number => valor !== null));
    if (regrasAtivas.categoriasAtivas.pessoaIdosa && cidadao.isIdoso && (!Number.isFinite(mesesAtendimentoIdoso) || mesesAtendimentoIdoso > regrasAtivas.mesesIdosoAtendimento)) {
      prioridades.push({ id: `${cidadao.id}:idoso`, cidadaoId: cidadao.id, nivel: "media", categoria: "Pessoa idosa", titulo: `${identificador}: acompanhamento da pessoa idosa`, detalhe: "Não há atendimento médico ou de enfermagem no intervalo local definido.", referencia: null });
    }

    const mesesOdontologico = cidadao.mesesUltimoAtendimentoOdontologico;
    if (regrasAtivas.categoriasAtivas.saudeBucal && cidadao.isSaudeBucal && (mesesOdontologico === null || mesesOdontologico > regrasAtivas.mesesSaudeBucal)) {
      prioridades.push({ id: `${cidadao.id}:bucal`, cidadaoId: cidadao.id, nivel: "atencao", categoria: "Saúde bucal", titulo: `${identificador}: acompanhamento odontológico`, detalhe: mesesOdontologico === null ? "Não há atendimento odontológico informado." : `Último atendimento há ${mesesOdontologico} mês(es); limite local: ${regrasAtivas.mesesSaudeBucal}.`, referencia: null });
    }
  });

  const ordem = { alta: 0, media: 1, atencao: 2 };
  return prioridades.sort((a, b) => ordem[a.nivel] - ordem[b.nivel] || a.titulo.localeCompare(b.titulo));
}
