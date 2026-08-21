export function normalizarTelefoneParaConversa(telefone: string | null | undefined) {
  const digitos = (telefone ?? "").replace(/\D/g, "");
  if (digitos.length < 10) return null;
  return digitos.length <= 11 ? `55${digitos}` : digitos;
}

export function linkWhatsAppCidadao(telefone: string | null | undefined) {
  const numero = normalizarTelefoneParaConversa(telefone);
  return numero ? `https://wa.me/${numero}` : null;
}

export function linkSmsCidadao(telefone: string | null | undefined) {
  const numero = normalizarTelefoneParaConversa(telefone);
  return numero ? `sms:${numero}` : null;
}

export type DadosCompartilhamentoCidadao = {
  nome: string;
  endereco: string | null;
  microarea: string | null;
  telefone: string | null;
};

export function textoResumoCidadao(cidadao: DadosCompartilhamentoCidadao) {
  return [
    "*Amigo do ACS · resumo do cidadão*",
    `Nome: ${cidadao.nome}`,
    `Endereço: ${cidadao.endereco ?? "Não informado"}`,
    `Microárea: ${cidadao.microarea ?? "Não informada"}`,
    `Telefone: ${cidadao.telefone ?? "Não informado"}`,
  ].join("\n");
}

export function linkWhatsAppResumoCidadao(cidadao: DadosCompartilhamentoCidadao, destinatario?: string) {
  const texto = encodeURIComponent(textoResumoCidadao(cidadao));
  const informado = destinatario?.trim();
  if (!informado) return `https://wa.me/?text=${texto}`;
  const numero = normalizarTelefoneParaConversa(informado);
  return numero ? `https://wa.me/${numero}?text=${texto}` : null;
}
