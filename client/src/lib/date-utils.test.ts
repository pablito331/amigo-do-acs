import { describe, expect, it } from "vitest";
import { ehCrianca } from "./date-utils";

describe("identificação infantil pelo cadastro Geral", () => {
  const referencia = new Date(2026, 7, 21);

  it("identifica criança pela data de nascimento mesmo sem lista de desenvolvimento infantil", () => {
    expect(ehCrianca("09/05/2023", null, referencia)).toBe(true);
  });

  it("usa a idade textual quando a data de nascimento não está disponível", () => {
    expect(ehCrianca(null, "7 anos e 2 meses", referencia)).toBe(true);
    expect(ehCrianca(null, "12 anos", referencia)).toBe(false);
  });
});
