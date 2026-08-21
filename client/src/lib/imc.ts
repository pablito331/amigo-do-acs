export type ClassificacaoImcAdulto = { texto: "Baixo peso" | "Faixa adequada" | "Sobrepeso" | "Obesidade"; estilo: string };

export function classificarImcAdulto(imc: number | null, idade: number | null): ClassificacaoImcAdulto | null {
  if (imc === null || idade === null || idade < 20) return null;
  if (imc < 18.5) return { texto: "Baixo peso", estilo: "bg-amber-100 text-amber-800" };
  if (imc < 25) return { texto: "Faixa adequada", estilo: "bg-emerald-100 text-emerald-800" };
  if (imc < 30) return { texto: "Sobrepeso", estilo: "bg-amber-100 text-amber-800" };
  return { texto: "Obesidade", estilo: "bg-red-100 text-red-800" };
}
