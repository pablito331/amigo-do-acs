import { describe, expect, it } from "vitest";
import { duplicidadesParaRevisao } from "./Indicadores";
import type { Cidadao } from "@/lib/domain";

const base = (id: string, parcial: Partial<Cidadao>): Cidadao => ({ id, chave: id, nome: "Pessoa", dataNascimento: "01/01/1980", idadeStr: "46", sexo: null, cpf: null, cns: null, microarea: "01", telefone: null, endereco: null, mesesUltimaVisitaDomiciliar: null, diasUltimaVisitaDomiciliar: null, pesoKg: null, alturaCm: null, dataUltimaMedicaoPesoAltura: null, beneficiarioBolsaFamilia: null, vigenciaBolsaFamilia: null, registrosPesoAltura12Meses: null, ultimaMedicaoPressao: null, dataUltimaMedicaoPressao: null, isMulher: false, examePreventivoUltimaAvaliacao: null, isGestante: false, igSemanas: null, qtdConsultasPreNatal: null, isHipertenso: false, isDiabetico: false, dataUltimaHemoglobinaGlicada: null, dataUltimaConsultaHipertensao: null, dataUltimaConsultaDiabetes: null, isIdoso: false, isCrianca: false, isSaudeBucal: false, fontes: ["Geral"], atualizadoEm: 0, ...parcial });

describe("duplicidadesParaRevisao", () => {
  it("mantém visível uma duplicidade entre microáreas e identificadores diferentes", () => {
    const grupos = duplicidadesParaRevisao([
      base("cpf", { nome: "Erica E. Barbosa", dataNascimento: "03/04/1991", microarea: "01", cpf: "033.209.030-20" }),
      base("cns", { nome: "ERICA E BARBOSA", dataNascimento: "03/04/1991", microarea: "06", cns: "704607109606424" }),
    ]);
    expect(grupos).toHaveLength(1);
    expect(grupos[0]?.cidadaos).toHaveLength(2);
  });
});
