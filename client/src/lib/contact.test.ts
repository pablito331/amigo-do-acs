import { describe, expect, it } from "vitest";
import { EMAIL_DE_CONTATO, linkFaleConosco, linkResumoSemanal } from "./contact";

describe("contato e compartilhamento transparente", () => {
  it("gera contato visível para o e-mail dedicado", () => {
    expect(linkFaleConosco()).toContain(`mailto:${EMAIL_DE_CONTATO}`);
  });

  it("gera resumo agregado sem anexar automaticamente os dados detalhados", () => {
    const link = linkResumoSemanal([{ situacao: "concluida" }, { situacao: "ausente" }], new Date("2026-08-17T12:00:00"), new Date("2026-08-23T12:00:00"));
    expect(decodeURIComponent(link)).toContain("Visitas registradas: 2");
    expect(decodeURIComponent(link)).toContain("anexe-o manualmente");
  });
});
