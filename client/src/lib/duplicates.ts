import type { Cidadao } from "./domain";

export type PossivelDuplicidade = { chave: string; criterio: "CPF" | "CNS" | "Nome e nascimento"; cidadaos: Cidadao[] };

function normalizar(valor: string | null | undefined) {
  return String(valor ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\W/g, "").toLowerCase();
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
    const nomeNascimento = `${normalizar(cidadao.nome)}|${normalizar(cidadao.dataNascimento)}`;
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
