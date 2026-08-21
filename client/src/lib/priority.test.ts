import { describe, expect, it } from "vitest";
import { CONFIGURACOES_PADRAO, type Cidadao } from "./domain";
import { calcularPainel } from "./metrics";
import { gerarPrioridades } from "./priority";

function criarCidadao(parcial: Partial<Cidadao>): Cidadao {
  return {
    id: "cidadao-1", chave: "cpf:1", nome: "Maria da Silva", dataNascimento: "01/01/1980", idadeStr: "46", sexo: "Feminino", cpf: "1", cns: null, microarea: "06", telefone: null, endereco: "Rua A, 10",
    mesesUltimaVisitaDomiciliar: null, diasUltimaVisitaDomiciliar: null, ultimaMedicaoPressao: null, dataUltimaMedicaoPressao: null, isMulher: false, examePreventivoUltimaAvaliacao: null, isGestante: false, igSemanas: null, qtdConsultasPreNatal: null, isHipertenso: false, isDiabetico: false, dataUltimaHemoglobinaGlicada: null, dataUltimaConsultaHipertensao: null, dataUltimaConsultaDiabetes: null, isIdoso: false, isCrianca: false, isSaudeBucal: false, fontes: ["Geral"], atualizadoEm: Date.now(), ...parcial,
  };
}

describe("priorização local para busca ativa", () => {
  it("prioriza visita atrasada e acompanhamento de diabetes pendente", () => {
    const cidadao = criarCidadao({ mesesUltimaVisitaDomiciliar: 4, isDiabetico: true, dataUltimaHemoglobinaGlicada: null, dataUltimaConsultaDiabetes: null });
    const prioridades = gerarPrioridades([cidadao], CONFIGURACOES_PADRAO.regras);
    expect(prioridades.map((item) => item.categoria)).toContain("Visita domiciliar");
    expect(prioridades.map((item) => item.categoria)).toContain("Diabetes");
    expect(prioridades.find((item) => item.categoria === "Diabetes")?.nivel).toBe("alta");
  });

  it("sinaliza gestante com consultas abaixo da referência local", () => {
    const cidadao = criarCidadao({ isGestante: true, igSemanas: "36", qtdConsultasPreNatal: 2 });
    const prioridades = gerarPrioridades([cidadao], CONFIGURACOES_PADRAO.regras);
    expect(prioridades.some((item) => item.categoria === "Gestação e puerpério")).toBe(true);
  });

  it("resume indicadores com denominadores locais", () => {
    const cidadao = criarCidadao({ isHipertenso: true, dataUltimaConsultaHipertensao: null, dataUltimaMedicaoPressao: null });
    const painel = calcularPainel([cidadao], [], CONFIGURACOES_PADRAO.regras);
    const indicador = painel.indicadores.find((item) => item.id === "hipertensao");
    expect(indicador).toMatchObject({ denominador: 1, numerador: 0, situacao: "critico" });
  });

  it("restringe indicadores e prioridades à microárea ativa", () => {
    const microarea06 = criarCidadao({ id: "06", chave: "cpf:06", microarea: "06", isDiabetico: true, dataUltimaHemoglobinaGlicada: null, dataUltimaConsultaDiabetes: null });
    const microarea07 = criarCidadao({ id: "07", chave: "cpf:07", microarea: "07", isDiabetico: true, dataUltimaHemoglobinaGlicada: "01/01/2026", dataUltimaConsultaDiabetes: "01/01/2026" });
    const painel = calcularPainel([microarea06, microarea07], [], CONFIGURACOES_PADRAO.regras, "06");
    expect(painel.prioridades.every((item) => item.cidadaoId === "06")).toBe(true);
    expect(painel.indicadores.find((item) => item.id === "diabetes")?.denominador).toBe(1);
  });
});
