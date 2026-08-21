import type { Cidadao } from "./domain";

export type PossivelDuplicidade = { chave: string; criterio: "CPF" | "CNS" | "Nome e nascimento"; cidadaos: Cidadao[] };

function normalizar(valor: string | null | undefined) {
  return String(valor ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\W/g, "").toLowerCase();
}

export function encontrarPossiveisDuplicidades(cidadaos: Cidadao[]): PossivelDuplicidade[] {
  const grupos = new Map<string, PossivelDuplicidade>();
  cidadaos.forEach((cidadao) => {
    const cpf = normalizar(cidadao.cpf);
    const cns = normalizar(cidadao.cns);
    const nomeNascimento = `${normalizar(cidadao.nome)}|${normalizar(cidadao.dataNascimento)}`;
    const [chave, criterio] = cpf.length >= 11 ? [`cpf:${cpf}`, "CPF"] as const : cns.length >= 12 ? [`cns:${cns}`, "CNS"] as const : nomeNascimento !== "|" ? [`nome:${nomeNascimento}`, "Nome e nascimento"] as const : ["", "Nome e nascimento"] as const;
    if (!chave) return;
    const grupo = grupos.get(chave) ?? { chave, criterio, cidadaos: [] };
    grupo.cidadaos.push(cidadao);
    grupos.set(chave, grupo);
  });
  return Array.from(grupos.values()).filter((grupo) => grupo.cidadaos.length > 1);
}
