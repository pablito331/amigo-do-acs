import { describe, expect, it } from "vitest";
import { linkSmsCidadao, linkWhatsAppCidadao, normalizarTelefoneParaConversa } from "./citizen-contact";

describe("contato do cidadão", () => {
  it("normaliza telefone brasileiro para abertura de conversa", () => {
    expect(normalizarTelefoneParaConversa("(91) 99999-1234")).toBe("5591999991234");
    expect(linkWhatsAppCidadao("(91) 99999-1234")).toBe("https://wa.me/5591999991234");
    expect(linkSmsCidadao("(91) 99999-1234")).toBe("sms:5591999991234");
  });

  it("não cria links para telefone incompleto", () => {
    expect(linkWhatsAppCidadao("123")).toBeNull();
    expect(linkSmsCidadao(null)).toBeNull();
  });
});
