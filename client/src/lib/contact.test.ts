import { describe, expect, it } from "vitest";
import { EMAIL_DE_CONTATO, linkFaleConosco, linkResumoSemanal, linkResumoSemanalWhatsApp } from "./contact";

describe("contato e compartilhamento transparente", () => {
  it("gera contato visível para o e-mail dedicado", () => {
    expect(linkFaleConosco()).toContain(`mailto:${EMAIL_DE_CONTATO}`);
  });

  it("gera resumo agregado para o e-mail que o ACS escolher, sem anexar dados detalhados", () => {
    const link = linkResumoSemanal([{ situacao: "concluida" }, { situacao: "ausente" }], new Date("2026-08-17T12:00:00"), new Date("2026-08-23T12:00:00"), "equipe@exemplo.com");
    expect(link).toContain("mailto:equipe%40exemplo.com");
    expect(decodeURIComponent(link)).toContain("Visitas registradas: 2");
    expect(decodeURIComponent(link)).toContain("anexe-o manualmente");
  });

  it("gera link de WhatsApp apenas para o telefone escolhido e válido", () => {
    const link = linkResumoSemanalWhatsApp([{ situacao: "concluida" }], new Date("2026-08-17T12:00:00"), new Date("2026-08-23T12:00:00"), "(11) 99999-1234");
    expect(link).toContain("https://wa.me/5511999991234?text=");
    expect(linkResumoSemanalWhatsApp([], new Date(), new Date(), "sem telefone")).toBeNull();
  });
});
