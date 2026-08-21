import { describe, expect, it } from "vitest";
import { formatarRecenciaPec } from "./recencia";

describe("formatarRecenciaPec", () => {
  it("combina meses e dias no formato operacional", () => {
    expect(formatarRecenciaPec(1, 6)).toBe("Há 1 mês e 6 dias");
    expect(formatarRecenciaPec(2, 27)).toBe("Há 2 meses e 27 dias");
  });

  it("informa ausência de recência quando o PEC não trouxe o valor", () => {
    expect(formatarRecenciaPec(null, null)).toBe("—");
  });
});
