import "fake-indexeddb/auto";
import { describe, expect, it } from "vitest";
import { alturaEmCentimetros, chaveImportacaoCidadao, normalizarIdentificador, normalizarTextoCsv, numeroCsv } from "./csv-import";

describe("normalização dos CSVs do PEC", () => {
  it("converte hífen e valores vazios em null", () => {
    expect(normalizarTextoCsv("-")).toBeNull();
    expect(normalizarTextoCsv("  ")).toBeNull();
    expect(normalizarTextoCsv("  Maria  ")).toBe("Maria");
  });

  it("remove caracteres de CPF e CNS antes de formar a chave", () => {
    expect(normalizarIdentificador("123.456.789-00")).toBe("12345678900");
    expect(chaveImportacaoCidadao({ CPF: "123.456.789-00", CNS: "999", Nome: "Maria", "Data de nascimento": "01/01/1990" })).toBe("cpf:12345678900");
  });

  it("usa nome e data de nascimento quando CPF e CNS estão ausentes", () => {
    expect(chaveImportacaoCidadao({ CPF: "-", CNS: "-", Nome: "  Ana Júlia ", "Data de nascimento": "02/03/2010" })).toBe("nome:ana julia|02/03/2010");
  });

  it("normaliza peso e converte altura informada em metros ou centímetros", () => {
    expect(numeroCsv("12,4 kg")).toBe(12.4);
    expect(alturaEmCentimetros("1,08 m")).toBe(108);
    expect(alturaEmCentimetros("108 cm")).toBe(108);
  });
});
