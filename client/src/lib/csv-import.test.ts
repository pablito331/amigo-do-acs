import "fake-indexeddb/auto";
import { describe, expect, it } from "vitest";
import { chaveImportacaoCidadao, normalizarIdentificador, normalizarTextoCsv } from "./csv-import";

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
});
