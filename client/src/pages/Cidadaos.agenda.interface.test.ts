import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("agenda pelo detalhe do cidadão", () => {
  it("permite escolher a data e incluir diretamente na agenda sem redirecionar para a rotina", () => {
    const fonte = fs.readFileSync(path.resolve(import.meta.dirname, "Cidadaos.tsx"), "utf8");
    expect(fonte).toContain("Adicionar à agenda em uma data");
    expect(fonte).toContain("Escolha a data da visita");
    expect(fonte).toContain("adicionarCidadaoNaAgenda(cidadao.id");
    expect(fonte).not.toContain("/rotina?agendarCidadao=");
  });
});
