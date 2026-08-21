import { AtSign, BookOpenCheck, HeartHandshake, History, Info, Mail, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { EMAIL_DE_CONTATO, linkFaleConosco } from "@/lib/contact";

const notasPublicadas = [
  "Rotina aprimorada com planejamento diário/semanal e relatórios para impressão.",
  "Acompanhamento infantil do Bolsa Família por recência de peso e altura.",
  "Recências PEC, prioridade por cor, filtros de microárea e ícone instalável do aplicativo.",
];

export default function Sobre() {
  const [versao, setVersao] = useState("carregando");
  useEffect(() => {
    void fetch("/__manus__/version.json", { cache: "no-store" })
      .then(async (resposta) => resposta.ok ? resposta.json() as Promise<{ version?: string }> : null)
      .then((dados) => setVersao(dados?.version ?? "não disponível"))
      .catch(() => setVersao("não disponível"));
  }, []);
  const abrirContato = () => {
    if (!window.confirm(`Abrir seu cliente de e-mail com o destinatário ${EMAIL_DE_CONTATO}?`)) return;
    window.location.href = linkFaleConosco();
  };
  return <section className="mx-auto max-w-4xl pb-16 lg:pb-0"><div className="rounded-2xl bg-gradient-to-br from-[#082b59] to-[#0757a5] p-6 text-white shadow-[0_12px_30px_rgba(7,87,165,0.18)] sm:p-8"><div className="flex flex-wrap items-start justify-between gap-5"><div><div className="inline-flex items-center gap-2 rounded-full bg-white/12 px-3 py-1 text-xs font-bold"><Info className="h-3.5 w-3.5" />Sobre o aplicativo</div><h1 className="mt-4 text-3xl font-bold tracking-tight">Amigo do ACS</h1><p className="mt-2 max-w-2xl text-sm leading-relaxed text-blue-100">Ferramenta local e offline para apoiar a organização da microárea, a busca ativa e o registro de visitas na Atenção Primária.</p></div><span className="rounded-xl bg-white/12 px-3 py-2 text-xs font-bold text-blue-50">Dados neste dispositivo</span></div></div>

    <div className="mt-7 grid gap-5 md:grid-cols-2"><section className="rounded-xl border border-slate-200 bg-white p-5 shadow-[0_3px_13px_rgba(25,54,95,0.04)]"><div className="flex items-center gap-2 text-[#0757a5]"><ShieldCheck className="h-5 w-5" /><h2 className="font-bold text-slate-800">Privacidade e uso local</h2></div><p className="mt-3 text-sm leading-relaxed text-slate-600">Os cadastros, visitas, agenda e lembretes ficam armazenados no navegador deste dispositivo. Faça backups regularmente e use a restauração apenas em um local seguro.</p></section><section className="rounded-xl border border-slate-200 bg-white p-5 shadow-[0_3px_13px_rgba(25,54,95,0.04)]"><div className="flex items-center gap-2 text-[#0757a5]"><BookOpenCheck className="h-5 w-5" /><h2 className="font-bold text-slate-800">Como usar</h2></div><p className="mt-3 text-sm leading-relaxed text-slate-600">Importe as listas exportadas do PEC, selecione a microárea mestre, consulte prioridades e use a agenda para registrar o atendimento de cada visita.</p></section></div>

    <section className="mt-7 rounded-xl border border-slate-200 bg-white p-5 shadow-[0_3px_13px_rgba(25,54,95,0.04)]"><div className="flex items-center gap-2 text-[#0757a5]"><History className="h-5 w-5" /><div><h2 className="font-bold text-slate-800">Notas de versão</h2><p className="mt-1 text-xs text-slate-500">Versão instalada · {versao}</p></div></div><ul className="mt-4 space-y-3">{notasPublicadas.map((nota) => <li key={nota} className="flex gap-3 text-sm leading-relaxed text-slate-600"><span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-emerald-500" />{nota}</li>)}</ul><p className="mt-4 rounded-lg bg-blue-50 p-3 text-xs leading-relaxed text-[#0757a5]">As próximas publicações acrescentarão nesta área um resumo das correções, melhorias e recursos incluídos.</p></section>

    <section className="mt-7 rounded-xl border border-[#c9dcf3] bg-[#f7fbff] p-5"><div className="flex flex-wrap items-start justify-between gap-4"><div><div className="flex items-center gap-2 text-[#0757a5]"><HeartHandshake className="h-5 w-5" /><h2 className="font-bold text-slate-800">Fale Conosco</h2></div><p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">Envie uma sugestão ou relato para o canal dedicado. Antes de abrir o seu cliente de e-mail, o aplicativo informa claramente o destinatário e pede sua confirmação.</p></div><button onClick={abrirContato} className="inline-flex items-center gap-2 rounded-lg bg-[#0757a5] px-3 py-2 text-xs font-bold text-white hover:bg-[#064987]"><Mail className="h-4 w-4" />Escrever mensagem</button></div><div className="mt-4 flex items-center gap-2 text-xs text-slate-600"><AtSign className="h-4 w-4 text-[#0757a5]" />Destinatário: <strong>{EMAIL_DE_CONTATO}</strong></div></section>
  </section>;
}
