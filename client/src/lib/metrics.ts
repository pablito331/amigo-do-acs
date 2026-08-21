import { estaNoMesAtual, mesesDesde } from "./date-utils";
import type { Cidadao, IndicadorLocal, Prioridade, RegrasPrioridade, Visita } from "./domain";
import { gerarPrioridades } from "./priority";

function indicador(id: string, nome: string, descricao: string, adequados: number, total: number, meta = 80): IndicadorLocal {
  const percentual = total ? Math.round((adequados / total) * 100) : null;
  const situacao = percentual === null ? "sem-base" : percentual >= meta ? "adequado" : percentual >= Math.round(meta * 0.75) ? "atencao" : "critico";
  return { id, nome, descricao, numerador: adequados, denominador: total, percentual, meta, situacao };
}

export function calcularPainel(cidadaos: Cidadao[], visitas: Visita[], regras: RegrasPrioridade, microareaAtiva: string | null = null): {
  prioridades: Prioridade[];
  indicadores: IndicadorLocal[];
  visitasNoMes: number;
  domicilios: number;
} {
  const base = microareaAtiva ? cidadaos.filter((item) => item.microarea === microareaAtiva) : cidadaos;
  const idsDaBase = new Set(base.map((item) => item.id));
  const prioridades = gerarPrioridades(base, regras);
  const gestantes = base.filter((item) => item.isGestante);
  const diabetes = base.filter((item) => item.isDiabetico);
  const hipertensao = base.filter((item) => item.isHipertenso);
  const mulheres = base.filter((item) => item.isMulher);
  const idosos = base.filter((item) => item.isIdoso);
  const criancas = base.filter((item) => item.isCrianca);
  const bucal = base.filter((item) => item.isSaudeBucal);

  const temPrioridade = (id: string, categoria: string) => prioridades.some((item) => item.cidadaoId === id && item.categoria === categoria);
  const indicadores = [
    indicador("gestacao", "Gestação e puerpério", "Gestantes sem pendência de pré-natal pela regra local.", gestantes.filter((item) => !temPrioridade(item.id, "Gestação e puerpério")).length, gestantes.length),
    indicador("diabetes", "Diabetes", "Pessoas sem pendência de consulta ou hemoglobina glicada.", diabetes.filter((item) => !temPrioridade(item.id, "Diabetes")).length, diabetes.length),
    indicador("hipertensao", "Hipertensão", "Pessoas sem pendência de consulta ou aferição de pressão.", hipertensao.filter((item) => !temPrioridade(item.id, "Hipertensão")).length, hipertensao.length),
    indicador("mulher", "Prevenção em saúde da mulher", "Mulheres sem pendência de rastreamento pela regra local.", mulheres.filter((item) => !temPrioridade(item.id, "Saúde da mulher")).length, mulheres.length),
    indicador("crianca", "Desenvolvimento infantil", "Crianças identificadas na lista temática importada.", criancas.length, criancas.length),
    indicador("idoso", "Pessoa idosa", "Pessoas idosas identificadas na lista temática importada.", idosos.length, idosos.length),
    indicador("bucal", "Saúde bucal", "Cidadãos presentes na lista de saúde bucal importada.", bucal.length, bucal.length),
  ];

  const enderecos = new Set(base.map((item) => item.endereco?.trim()).filter(Boolean));
  return {
    prioridades,
    indicadores,
    visitasNoMes: visitas.filter((item) => idsDaBase.has(item.cidadaoId) && estaNoMesAtual(item.data)).length,
    domicilios: enderecos.size,
  };
}

export function pendenciaVisita(cidadao: Cidadao, regras: RegrasPrioridade): boolean {
  return cidadao.mesesUltimaVisitaDomiciliar !== null && cidadao.mesesUltimaVisitaDomiciliar >= regras.mesesVisitaAtrasada;
}

export function resumoAcompanhamento(cidadao: Cidadao): string {
  if (cidadao.isGestante) return "Gestação e puerpério";
  if (cidadao.isDiabetico) return "Diabetes";
  if (cidadao.isHipertenso) return "Hipertensão";
  if (cidadao.isCrianca) return "Desenvolvimento infantil";
  if (cidadao.isIdoso) return "Pessoa idosa";
  if (cidadao.isMulher) return "Saúde da mulher";
  if (cidadao.isSaudeBucal) return "Saúde bucal";
  return mesesDesde(cidadao.dataUltimaMedicaoPressao) === null ? "Cadastro geral" : "Acompanhamento geral";
}
