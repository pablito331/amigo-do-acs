import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("interface do rastreador de duplicidades", () => {
  it("apresenta na tela o rastreamento global que cobre CPF e CNS diferentes", () => {
    const fonte = fs.readFileSync(path.resolve(import.meta.dirname, "Indicadores.tsx"), "utf8");
    expect(fonte).toContain("duplicidadesParaRevisao(cidadaos)");
    expect(fonte).toContain("Possíveis duplicidades na base importada");
    expect(fonte).toContain("o filtro mestre não oculta esta conferência");
  });
});
