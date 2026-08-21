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

  it("respeita a ativação local de cada categoria de prioridade", () => {
    const cidadao = criarCidadao({ isDiabetico: true, dataUltimaHemoglobinaGlicada: null, dataUltimaConsultaDiabetes: null });
    const regras = { ...CONFIGURACOES_PADRAO.regras, categoriasAtivas: { ...CONFIGURACOES_PADRAO.regras.categoriasAtivas, diabetes: false } };
    expect(gerarPrioridades([cidadao], regras).some((item) => item.categoria === "Diabetes")).toBe(false);
  });

  it("prioriza puericultura abaixo da meta local quando a quantidade foi importada", () => {
    const hoje = new Date();
    const nascimento = new Date(hoje.getFullYear() - 1, hoje.getMonth(), hoje.getDate()).toLocaleDateString("pt-BR");
    const cidadao = criarCidadao({ dataNascimento: nascimento, isCrianca: true, qtdConsultasAte24Meses: 8, dataPrimeiraConsultaInfantil: "01/01/2026" });
    const prioridades = gerarPrioridades([cidadao], CONFIGURACOES_PADRAO.regras);
    expect(prioridades.find((item) => item.categoria === "Puericultura")?.detalhe).toContain("8 consulta(s)");
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

  it("considera equivalentes as microáreas 4 e 04", () => {
    const microarea04 = criarCidadao({ id: "04", chave: "cpf:04", microarea: "04", isDiabetico: true, dataUltimaHemoglobinaGlicada: null, dataUltimaConsultaDiabetes: null });
    const microarea05 = criarCidadao({ id: "05", chave: "cpf:05", microarea: "05", isDiabetico: true, dataUltimaHemoglobinaGlicada: "01/01/2026", dataUltimaConsultaDiabetes: "01/01/2026" });
    const painel = calcularPainel([microarea04, microarea05], [], CONFIGURACOES_PADRAO.regras, "4");
    expect(painel.indicadores.find((item) => item.id === "diabetes")?.denominador).toBe(1);
    expect(painel.prioridades.map((item) => item.cidadaoId)).toContain("04");
    expect(painel.prioridades.map((item) => item.cidadaoId)).not.toContain("05");
  });
});
