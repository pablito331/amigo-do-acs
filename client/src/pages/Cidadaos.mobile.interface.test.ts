import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("detalhe contextual do cidadão em celular", () => {
  it("oferece fechamento explícito e atalho para registrar uma visita", () => {
    const fonte = fs.readFileSync(path.resolve(import.meta.dirname, "Cidadaos.tsx"), "utf8");
    expect(fonte).toContain('aria-label="Fechar detalhes do cidadão"');
    expect(fonte).toContain('href="#registro-visita"');
    expect(fonte).toContain('id="registro-visita"');
  });
});
