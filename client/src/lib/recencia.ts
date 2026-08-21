export function formatarRecenciaPec(meses: number | null | undefined, dias: number | null | undefined): string {
  const mesesValidos = meses !== null && meses !== undefined && meses >= 0 ? Math.trunc(meses) : null;
  const diasValidos = dias !== null && dias !== undefined && dias >= 0 ? Math.trunc(dias) : null;
  if (mesesValidos === null && diasValidos === null) return "—";
  const partes: string[] = [];
  if (mesesValidos !== null) partes.push(`${mesesValidos} ${mesesValidos === 1 ? "mês" : "meses"}`);
  if (diasValidos !== null) partes.push(`${diasValidos} ${diasValidos === 1 ? "dia" : "dias"}`);
  return `Há ${partes.join(" e ")}`;
}
