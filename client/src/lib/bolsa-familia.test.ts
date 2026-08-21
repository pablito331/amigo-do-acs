import { describe, expect, it } from "vitest";
import { avaliarAcompanhamentoAntropometrico } from "./bolsa-familia";

const referencia = new Date(2026, 7, 21);

function dados(dataUltimaMedicaoPesoAltura: string | null, pesoKg = 18, alturaCm = 108) {
  return { dataUltimaMedicaoPesoAltura, pesoKg, alturaCm };
}

describe("avaliarAcompanhamentoAntropometrico", () => {
  it("mantém verde quando peso, altura e data têm até 30 dias", () => {
    const resultado = avaliarAcompanhamentoAntropometrico(dados("01/08/2026"), referencia);
    expect(resultado.situacao).toBe("em-dia");
    expect(resultado.diasDesdeMedicao).toBe(20);
  });

  it("mantém verde no limite de 30 dias", () => {
    expect(avaliarAcompanhamentoAntropometrico(dados("22/07/2026"), referencia).situacao).toBe("em-dia");
  });

  it("sinaliza amarelo entre 31 e 60 dias", () => {
    const resultado = avaliarAcompanhamentoAntropometrico(dados("30/06/2026"), referencia);
    expect(resultado.situacao).toBe("atencao");
    expect(resultado.diasDesdeMedicao).toBe(52);
  });

  it("sinaliza amarelo no limite inicial de 31 dias", () => {
    expect(avaliarAcompanhamentoAntropometrico(dados("21/07/2026"), referencia).situacao).toBe("atencao");
  });

  it("mantém amarelo no limite de 60 dias e vermelho a partir de 61 dias", () => {
    expect(avaliarAcompanhamentoAntropometrico(dados("22/06/2026"), referencia).situacao).toBe("atencao");
    const resultado = avaliarAcompanhamentoAntropometrico(dados("21/06/2026"), referencia);
    expect(resultado.situacao).toBe("atrasado");
  });

  it("sinaliza vermelho quando peso, altura ou data não estão completos", () => {
    const resultado = avaliarAcompanhamentoAntropometrico(dados(null, 18, null), referencia);
    expect(resultado.situacao).toBe("sem-registro");
    expect(resultado.possuiAltura).toBe(false);
  });
});
