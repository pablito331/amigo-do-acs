import type { Cidadao } from "./domain";

export type PossivelDuplicidade = { chave: string; criterio: "CPF" | "CNS" | "Nome e nascimento"; cidadaos: Cidadao[] };

function normalizar(valor: string | null | undefined) {
  return String(valor ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\W/g, "").toLowerCase();
}

export function normalizarDataNascimentoParaDuplicidade(valor: string | null | undefined) {
  const texto = String(valor ?? "").trim();
  const brasileira = texto.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{2,4})$/);
  if (brasileira) {
    const [, dia, mes, anoOriginal] = brasileira;
    const ano = anoOriginal.length === 2 ? `19${anoOriginal}` : anoOriginal;
    return `${ano.padStart(4, "0")}-${mes.padStart(2, "0")}-${dia.padStart(2, "0")}`;
  }
  const iso = texto.match(/^(\d{4})[\/-](\d{1,2})[\/-](\d{1,2})$/);
  if (iso) return `${iso[1]}-${iso[2].padStart(2, "0")}-${iso[3].padStart(2, "0")}`;
  return normalizar(texto);
}

export function encontrarPossiveisDuplicidades(cidadaos: Cidadao[]): PossivelDuplicidade[] {
  const grupos = new Map<string, PossivelDuplicidade>();
  const adicionar = (chave: string, criterio: PossivelDuplicidade["criterio"], cidadao: Cidadao) => {
    if (!chave) return;
    const grupo = grupos.get(chave) ?? { chave, criterio, cidadaos: [] };
    if (!grupo.cidadaos.some((item) => item.id === cidadao.id)) grupo.cidadaos.push(cidadao);
    grupos.set(chave, grupo);
  };
  cidadaos.forEach((cidadao) => {
    const cpf = normalizar(cidadao.cpf);
    const cns = normalizar(cidadao.cns);
    const nomeNascimento = `${normalizar(cidadao.nome)}|${normalizarDataNascimentoParaDuplicidade(cidadao.dataNascimento)}`;
    if (cpf.length >= 11) adicionar(`cpf:${cpf}`, "CPF", cidadao);
    if (cns.length >= 12) adicionar(`cns:${cns}`, "CNS", cidadao);
    if (nomeNascimento !== "|") adicionar(`nome:${nomeNascimento}`, "Nome e nascimento", cidadao);
  });
  const prioridade = { CPF: 3, CNS: 2, "Nome e nascimento": 1 } as const;
  const semRepeticao = new Map<string, PossivelDuplicidade>();
  Array.from(grupos.values()).filter((grupo) => grupo.cidadaos.length > 1).forEach((grupo) => {
    const assinatura = grupo.cidadaos.map((item) => item.id).sort().join("|");
    const existente = semRepeticao.get(assinatura);
    if (!existente || prioridade[grupo.criterio] > prioridade[existente.criterio]) semRepeticao.set(assinatura, grupo);
  });
  return Array.from(semRepeticao.values()).sort((a, b) => a.cidadaos[0]?.nome.localeCompare(b.cidadaos[0]?.nome ?? "") ?? 0);
}
