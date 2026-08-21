import { describe, expect, it } from "vitest";
import { mesmaMicroarea, normalizarMicroarea } from "./microarea";

describe("microárea ativa", () => {
  it("normaliza microáreas numéricas com ou sem zero à esquerda", () => {
    expect(normalizarMicroarea("04")).toBe("4");
    expect(normalizarMicroarea("4")).toBe("4");
    expect(mesmaMicroarea("04", "4")).toBe(true);
  });

  it("mantém a base visível quando nenhuma microárea está selecionada", () => {
    expect(mesmaMicroarea("06", null)).toBe(true);
    expect(mesmaMicroarea("06", "07")).toBe(false);
  });
});
