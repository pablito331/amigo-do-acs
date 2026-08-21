import { describe, expect, it } from "vitest";
import { linhasResumoClinico } from "./Cidadaos";
import type { Cidadao } from "@/lib/domain";

function cidadaoBase(): Cidadao {
  return {
    id: "crianca", chave: "crianca", nome: "Ana", dataNascimento: "01/01/2020", idadeStr: "6 anos", sexo: "Feminino", cpf: null, cns: null, microarea: "06", telefone: null, endereco: null,
    diasUltimoAtendimentoMedico: null, mesesUltimoAtendimentoMedico: null, diasUltimoAtendimentoEnfermagem: null, mesesUltimoAtendimentoEnfermagem: null, diasUltimoAtendimentoOdontologico: null, mesesUltimoAtendimentoOdontologico: null, mesesUltimaVisitaDomiciliar: null, diasUltimaVisitaDomiciliar: null, pesoKg: null, alturaCm: null, dataUltimaMedicaoPesoAltura: null, beneficiarioBolsaFamilia: null, vigenciaBolsaFamilia: null, registrosPesoAltura12Meses: null, ultimaMedicaoPressao: null, dataUltimaMedicaoPressao: null,
    isMulher: false, examePreventivoUltimaAvaliacao: null, isGestante: false, igSemanas: null, qtdConsultasPreNatal: null, isHipertenso: false, isDiabetico: true, dataUltimaHemoglobinaGlicada: null, dataUltimaConsultaHipertensao: null, dataUltimaConsultaDiabetes: null, isIdoso: false, isCrianca: false, isSaudeBucal: false, fontes: ["Geral", "Diabetes"], atualizadoEm: 0,
  };
}

describe("linhasResumoClinico", () => {
  it("mantém todos os grupos importados e reconhece criança pelo cadastro Geral", () => {
    const linhas = linhasResumoClinico(cidadaoBase());
    expect(linhas).toContainEqual(["Listas consolidadas", "Geral · Diabetes"]);
    expect(linhas).toContainEqual(["Diabetes", "Hb: Não informado · consulta: Não informado"]);
    expect(linhas).toContainEqual(["Acompanhamento infantil", "Identificado pela idade no cadastro Geral"]);
  });
});
