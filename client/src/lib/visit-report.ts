import type { Cidadao, Visita } from "./domain";

function escaparCsv(valor: string | null | undefined) {
  const texto = valor ?? "";
  return `"${texto.replaceAll('"', '""')}"`;
}

export function inicioSemana(data = new Date()) {
  const resultado = new Date(data);
  const dia = resultado.getDay() || 7;
  resultado.setDate(resultado.getDate() - dia + 1);
  resultado.setHours(0, 0, 0, 0);
  return resultado;
}

export function fimSemana(data = new Date()) {
  const resultado = inicioSemana(data);
  resultado.setDate(resultado.getDate() + 6);
  resultado.setHours(23, 59, 59, 999);
  return resultado;
}

export function exportarRelatorioSemanal(visitas: Visita[], cidadaos: Cidadao[], inicio: Date, fim: Date) {
  const porId = new Map(cidadaos.map((item) => [item.id, item]));
  const itens = visitas.filter((item) => { const data = new Date(`${item.data}T12:00:00`); return data >= inicio && data <= fim; }).sort((a, b) => a.data.localeCompare(b.data));
  const linhas = [["Data", "Cidadão", "Microárea", "Endereço", "Tipo", "Situação", "Observações"], ...itens.map((item) => { const cidadao = porId.get(item.cidadaoId); return [item.data, cidadao?.nome ?? "Cidadão removido", cidadao?.microarea ?? "", cidadao?.endereco ?? "", item.tipo, item.situacao === "concluida" ? "Concluída" : "Ausente", item.observacoes ?? ""]; })];
  const conteudo = `\uFEFF${linhas.map((linha) => linha.map(escaparCsv).join(";")).join("\n")}`;
  const url = URL.createObjectURL(new Blob([conteudo], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `amigo-do-acs-relatorio-semanal-${inicio.toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
