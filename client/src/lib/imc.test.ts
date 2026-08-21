import { describe, expect, it } from "vitest";
import { classificarImcAdulto } from "./imc";

describe("classificarImcAdulto", () => {
  it("classifica as quatro faixas orientativas de IMC em adultos", () => {
    expect(classificarImcAdulto(18.4, 30)?.texto).toBe("Baixo peso");
    expect(classificarImcAdulto(18.5, 30)?.texto).toBe("Faixa adequada");
    expect(classificarImcAdulto(24.9, 30)?.texto).toBe("Faixa adequada");
    expect(classificarImcAdulto(25, 30)?.texto).toBe("Sobrepeso");
    expect(classificarImcAdulto(29.9, 30)?.texto).toBe("Sobrepeso");
    expect(classificarImcAdulto(30, 30)?.texto).toBe("Obesidade");
  });

  it("não aplica classificação de adulto a crianças e adolescentes", () => {
    expect(classificarImcAdulto(21, 12)).toBeNull();
  });
});
