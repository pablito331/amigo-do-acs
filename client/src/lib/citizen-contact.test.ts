import { describe, expect, it } from "vitest";
import { linkSmsCidadao, linkWhatsAppCidadao, linkWhatsAppResumoCidadao, normalizarTelefoneParaConversa, textoResumoCidadao } from "./citizen-contact";

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

  it("prepara um resumo completo do cidadão e permite escolher o WhatsApp destinatário", () => {
    const cidadao = { nome: "Ana da Silva", endereco: "Rua das Flores, 15", microarea: "06", telefone: "(91) 99999-1234" };
    const texto = textoResumoCidadao(cidadao);

    expect(texto).toContain("Nome: Ana da Silva");
    expect(texto).toContain("Endereço: Rua das Flores, 15");
    expect(texto).toContain("Microárea: 06");
    expect(texto).toContain("Telefone: (91) 99999-1234");
    expect(linkWhatsAppResumoCidadao(cidadao, "(91) 98888-0000")).toContain("https://wa.me/5591988880000?text=");
    expect(linkWhatsAppResumoCidadao(cidadao)).toContain("https://wa.me/?text=");
  });
});
