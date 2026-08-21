export function normalizarMicroarea(valor: string | null | undefined): string | null {
  const texto = valor?.trim().replace(/^["']|["']$/g, "");
  if (!texto) return null;
  if (/^\d+$/.test(texto)) return String(Number(texto));
  return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
}

export function mesmaMicroarea(valor: string | null | undefined, filtro: string | null | undefined): boolean {
  const filtroNormalizado = normalizarMicroarea(filtro);
  return !filtroNormalizado || normalizarMicroarea(valor) === filtroNormalizado;
}
