import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("histórico de versões na tela Sobre", () => {
  it("apresenta versões numeradas em ordem da mais recente para a mais antiga", () => {
    const fonte = fs.readFileSync(path.resolve(import.meta.dirname, "Sobre.tsx"), "utf8");
    expect(fonte).toContain("Histórico de versões");
    expect(fonte).toContain('numero: "1.8.0"');
    expect(fonte).toContain('numero: "1.0.0"');
    expect(fonte.indexOf('numero: "1.8.0"')).toBeLessThan(fonte.indexOf('numero: "1.0.0"'));
    expect(fonte).toContain("Versões mais recentes no topo");
  });
});
