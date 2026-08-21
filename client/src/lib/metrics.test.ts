import { describe, expect, it } from "vitest";
import { CONFIGURACOES_PADRAO, type Cidadao, type Visita } from "./domain";
import { calcularPainel } from "./metrics";

function cidadao(id: string, microarea: string, dias: number | null, meses: number | null): Cidadao {
  return {
    id, chave: id, nome: id, dataNascimento: null, idadeStr: null, sexo: null, cpf: null, cns: null, microarea, telefone: null, endereco: "Rua A",
    mesesUltimaVisitaDomiciliar: meses, diasUltimaVisitaDomiciliar: dias, pesoKg: null, alturaCm: null, dataUltimaMedicaoPesoAltura: null, beneficiarioBolsaFamilia: null, vigenciaBolsaFamilia: null, registrosPesoAltura12Meses: null, ultimaMedicaoPressao: null, dataUltimaMedicaoPressao: null,
    isMulher: false, examePreventivoUltimaAvaliacao: null, isGestante: false, igSemanas: null, qtdConsultasPreNatal: null, isHipertenso: false, isDiabetico: false, dataUltimaHemoglobinaGlicada: null, dataUltimaConsultaHipertensao: null, dataUltimaConsultaDiabetes: null, isIdoso: false, isCrianca: false, qtdConsultasAte24Meses: null, dataPrimeiraConsultaInfantil: null, qtdMedicoesPesoAlturaAte24Meses: null, isSaudeBucal: false, fontes: ["Geral"], atualizadoEm: 0,
  };
}

describe("painel de visitas por microárea", () => {
  it("separa visitas locais da recência reportada pelo PEC e respeita a microárea ativa", () => {
    const hoje = new Date().toISOString().slice(0, 10);
    const visitas: Visita[] = [{ id: "v1", cidadaoId: "um", data: hoje, tipo: "Domiciliar", situacao: "concluida", observacoes: null, criadaEm: Date.now() }];
    const painel = calcularPainel([cidadao("um", "06", 12, 0), cidadao("dois", "06", 70, 3), cidadao("tres", "07", 4, 0)], visitas, CONFIGURACOES_PADRAO.regras, "06");

    expect(painel.visitasNaSemana).toBe(1);
    expect(painel.visitasNoMes).toBe(1);
    expect(painel.pecVisitaRecente).toBe(1);
    expect(painel.pecVisitaAtrasada).toBe(1);
  });

  it("calcula cobertura de puericultura apenas com consultas informadas e não trata ausência de campo como pendência", () => {
    const hoje = new Date();
    const nascimento = new Date(hoje.getFullYear() - 1, hoje.getMonth(), hoje.getDate()).toLocaleDateString("pt-BR");
    const emDia = { ...cidadao("em-dia", "06", null, null), dataNascimento: nascimento, isCrianca: true, qtdConsultasAte24Meses: 9 };
    const pendente = { ...cidadao("pendente", "06", null, null), dataNascimento: nascimento, isCrianca: true, qtdConsultasAte24Meses: 8 };
    const semCampo = { ...cidadao("sem-campo", "06", null, null), dataNascimento: nascimento, isCrianca: true };
    const painel = calcularPainel([emDia, pendente, semCampo], [], CONFIGURACOES_PADRAO.regras, "06");
    const puericultura = painel.indicadores.find((item) => item.id === "puericultura");

    expect(puericultura).toMatchObject({ numerador: 1, denominador: 2, percentual: 50 });
    expect(painel.puericulturaSemRegistro).toBe(1);
  });
});
