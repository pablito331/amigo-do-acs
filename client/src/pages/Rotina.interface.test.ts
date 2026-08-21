import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("seleção manual de cidadão na agenda", () => {
  it("abre uma lista pesquisável no calendário sem redirecionar para a tela de cidadãos", () => {
    const fonte = fs.readFileSync(path.resolve(import.meta.dirname, "Rotina.tsx"), "utf8");
    expect(fonte).toContain("SeletorCidadaoAgenda");
    expect(fonte).toContain("Pesquisar cidadão");
    expect(fonte).toContain("adicionarCidadaoNaAgenda");
    expect(fonte).not.toContain("/cidadaos?agendarPara=");
  });
});
