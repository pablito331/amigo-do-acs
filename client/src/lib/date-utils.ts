export function paraData(valor: string | null | undefined): Date | null {
  if (!valor) return null;
  const limpo = valor.trim();
  if (!limpo || limpo === "-") return null;

  const br = limpo.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (br) {
    const [, dia, mes, ano] = br;
    const data = new Date(Number(ano), Number(mes) - 1, Number(dia));
    return Number.isNaN(data.getTime()) ? null : data;
  }

  const data = new Date(limpo);
  return Number.isNaN(data.getTime()) ? null : data;
}

export function mesesDesde(valor: string | null | undefined, referencia = new Date()): number | null {
  const data = paraData(valor);
  if (!data) return null;
  return Math.max(0, (referencia.getFullYear() - data.getFullYear()) * 12 + referencia.getMonth() - data.getMonth());
}

export function idadeEmAnos(valor: string | null | undefined, referencia = new Date()): number | null {
  const nascimento = paraData(valor);
  if (!nascimento) return null;
  let idade = referencia.getFullYear() - nascimento.getFullYear();
  const aniversarioAindaNaoOcorreu =
    referencia.getMonth() < nascimento.getMonth() ||
    (referencia.getMonth() === nascimento.getMonth() && referencia.getDate() < nascimento.getDate());
  if (aniversarioAindaNaoOcorreu) idade -= 1;
  return idade;
}

export function ehCrianca(dataNascimento: string | null | undefined, idadeStr: string | null | undefined, referencia = new Date()): boolean {
  const idadePorData = idadeEmAnos(dataNascimento, referencia);
  if (idadePorData !== null) return idadePorData < 12;
  const idadeInformada = Number(String(idadeStr ?? "").match(/\d+/)?.[0]);
  return Number.isFinite(idadeInformada) && idadeInformada < 12;
}

export function formatarData(valor: string | null | undefined): string {
  const data = paraData(valor);
  return data ? new Intl.DateTimeFormat("pt-BR").format(data) : "Não informado";
}

export function estaNoMesAtual(valor: string | null | undefined, referencia = new Date()): boolean {
  const data = paraData(valor);
  return Boolean(data && data.getMonth() === referencia.getMonth() && data.getFullYear() === referencia.getFullYear());
}
