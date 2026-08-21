import { describe, expect, it } from "vitest";
import { encontrarPossiveisDuplicidades, normalizarDataNascimentoParaDuplicidade } from "./duplicates";
import type { Cidadao } from "./domain";

function cidadao(id: string, parcial: Partial<Cidadao>): Cidadao {
  return { id, chave: id, nome: "Pessoa", dataNascimento: "01/01/1980", idadeStr: "46", sexo: null, cpf: null, cns: null, microarea: "01", telefone: null, endereco: null, mesesUltimaVisitaDomiciliar: null, diasUltimaVisitaDomiciliar: null, pesoKg: null, alturaCm: null, dataUltimaMedicaoPesoAltura: null, beneficiarioBolsaFamilia: null, vigenciaBolsaFamilia: null, registrosPesoAltura12Meses: null, ultimaMedicaoPressao: null, dataUltimaMedicaoPressao: null, isMulher: false, examePreventivoUltimaAvaliacao: null, isGestante: false, igSemanas: null, qtdConsultasPreNatal: null, isHipertenso: false, isDiabetico: false, dataUltimaHemoglobinaGlicada: null, dataUltimaConsultaHipertensao: null, dataUltimaConsultaDiabetes: null, isIdoso: false, isCrianca: false, isSaudeBucal: false, fontes: ["Geral"], atualizadoEm: 0, ...parcial };
}

describe("possíveis duplicidades", () => {
  it("sinaliza a mesma identificação sem alterar os registros", () => {
    const grupos = encontrarPossiveisDuplicidades([cidadao("1", { cpf: "123.456.789-00" }), cidadao("2", { cpf: "12345678900" })]);
    expect(grupos).toHaveLength(1);
    expect(grupos[0]?.criterio).toBe("CPF");
    expect(grupos[0]?.cidadaos).toHaveLength(2);
  });

  it("sinaliza nome e nascimento iguais mesmo quando CPF e CNS são diferentes entre listas", () => {
    const grupos = encontrarPossiveisDuplicidades([
      cidadao("1", { nome: "Ciro Rocha Vallinoto", dataNascimento: "14/07/1946", cpf: "172.675.600-91" }),
      cidadao("2", { nome: "CIRO ROCHA VALLINOTO", dataNascimento: "14/07/1946", cns: "700604463429667" }),
    ]);
    expect(grupos).toHaveLength(1);
    expect(grupos[0]?.criterio).toBe("Nome e nascimento");
    expect(grupos[0]?.cidadaos.map((item) => item.id).sort()).toEqual(["1", "2"]);
  });

  it("reconhece a mesma data de nascimento com e sem zeros à esquerda", () => {
    const grupos = encontrarPossiveisDuplicidades([
      cidadao("1", { nome: "João da Silva", dataNascimento: "1/2/2013", cpf: "11111111111" }),
      cidadao("2", { nome: "JOAO DA SILVA", dataNascimento: "01/02/2013", cns: "700000000000000" }),
    ]);
    expect(grupos).toHaveLength(1);
    expect(grupos[0]?.criterio).toBe("Nome e nascimento");
    expect(normalizarDataNascimentoParaDuplicidade("1/2/2013")).toBe("2013-02-01");
  });
});
