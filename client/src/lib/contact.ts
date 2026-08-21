import type { Visita } from "./domain";

export const EMAIL_DE_CONTATO = "thepablitoshouse@gmail.com";

function mailto(assunto: string, corpo: string) {
  return `mailto:${EMAIL_DE_CONTATO}?subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(corpo)}`;
}

export function linkFaleConosco() {
  return mailto("Fale Conosco — Amigo do ACS", "Olá,\n\nEscreva sua mensagem ou sugestão para o Amigo do ACS aqui.\n\n");
}

export function linkResumoSemanal(visitas: Pick<Visita, "situacao">[], inicio: Date, fim: Date) {
  const concluidas = visitas.filter((visita) => visita.situacao === "concluida").length;
  const ausentes = visitas.filter((visita) => visita.situacao === "ausente").length;
  const periodo = `${inicio.toLocaleDateString("pt-BR")} a ${fim.toLocaleDateString("pt-BR")}`;
  const corpo = [
    "Resumo semanal de visitas — Amigo do ACS",
    `Período: ${periodo}`,
    `Visitas registradas: ${visitas.length}`,
    `Concluídas: ${concluidas}`,
    `Ausências: ${ausentes}`,
    "",
    "Para incluir dados detalhados, exporte o CSV no aplicativo e anexe-o manualmente a esta mensagem após revisar o conteúdo.",
  ].join("\n");
  return mailto(`Resumo semanal de visitas — ${periodo}`, corpo);
}
