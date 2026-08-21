import type { Visita } from "./domain";
import { normalizarTelefoneParaConversa } from "./citizen-contact";

export const EMAIL_DE_CONTATO = "thepablitoshouse@gmail.com";

function mailto(assunto: string, corpo: string) {
  return `mailto:${EMAIL_DE_CONTATO}?subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(corpo)}`;
}

export function linkFaleConosco() {
  return mailto("Fale Conosco — Amigo do ACS", "Olá,\n\nEscreva sua mensagem ou sugestão para o Amigo do ACS aqui.\n\n");
}

export function dadosResumoSemanal(visitas: Pick<Visita, "situacao">[], inicio: Date, fim: Date) {
  const concluidas = visitas.filter((visita) => visita.situacao === "concluida").length;
  const ausentes = visitas.filter((visita) => visita.situacao === "ausente").length;
  const periodo = `${inicio.toLocaleDateString("pt-BR")} a ${fim.toLocaleDateString("pt-BR")}`;
  const assunto = `Resumo semanal de visitas — ${periodo}`;
  const corpo = [
    "Resumo semanal de visitas — Amigo do ACS",
    `Período: ${periodo}`,
    `Visitas registradas: ${visitas.length}`,
    `Concluídas: ${concluidas}`,
    `Ausências: ${ausentes}`,
    "",
    "Para incluir dados detalhados, exporte o CSV no aplicativo e anexe-o manualmente a esta mensagem após revisar o conteúdo.",
  ].join("\n");
  return { assunto, corpo };
}

export function linkResumoSemanal(visitas: Pick<Visita, "situacao">[], inicio: Date, fim: Date, destinatario: string) {
  const resumo = dadosResumoSemanal(visitas, inicio, fim);
  return `mailto:${encodeURIComponent(destinatario.trim())}?subject=${encodeURIComponent(resumo.assunto)}&body=${encodeURIComponent(resumo.corpo)}`;
}

export function linkResumoSemanalWhatsApp(visitas: Pick<Visita, "situacao">[], inicio: Date, fim: Date, telefone: string): string | null {
  const destino = normalizarTelefoneParaConversa(telefone);
  if (!destino) return null;
  return `https://wa.me/${destino}?text=${encodeURIComponent(dadosResumoSemanal(visitas, inicio, fim).corpo)}`;
}

export function textoAgendaDiaria(data: Date, itens: { nome: string; endereco: string | null; motivo: string }[]) {
  const cabecalho = `Agenda de visitas — Amigo do ACS\nData: ${data.toLocaleDateString("pt-BR")}`;
  const visitas = itens.length ? itens.map((item, indice) => `${indice + 1}. ${item.nome}${item.endereco ? ` — ${item.endereco}` : ""}\n   ${item.motivo}`).join("\n") : "Nenhuma visita agendada para este dia.";
  return `${cabecalho}\n\n${visitas}`;
}

export function linkAgendaDiariaWhatsApp(data: Date, itens: { nome: string; endereco: string | null; motivo: string }[], telefone: string): string | null {
  const destino = normalizarTelefoneParaConversa(telefone);
  if (!destino) return null;
  return `https://wa.me/${destino}?text=${encodeURIComponent(textoAgendaDiaria(data, itens))}`;
}
