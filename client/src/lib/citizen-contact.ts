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
