import { useLiveQuery } from "dexie-react-hooks";
import { Save, SlidersHorizontal } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { db, obterConfiguracoes, salvarConfiguracoes } from "@/lib/acs-db";
import { CONFIGURACOES_PADRAO, type ConfiguracoesLocais } from "@/lib/domain";

type Formulario = Omit<ConfiguracoesLocais, "chave" | "atualizadoEm">;

export default function Ajustes() {
  const configuracoes = useLiveQuery(() => db.configuracoes.get("configuracoes"), []);
  const [formulario, setFormulario] = useState<Formulario>({ nomeDispositivo: CONFIGURACOES_PADRAO.nomeDispositivo, microareaAtiva: null, regras: CONFIGURACOES_PADRAO.regras });

  useEffect(() => { void obterConfiguracoes(); }, []);
  useEffect(() => { if (configuracoes) setFormulario({ nomeDispositivo: configuracoes.nomeDispositivo, microareaAtiva: configuracoes.microareaAtiva, regras: configuracoes.regras }); }, [configuracoes]);

  const salvar = async () => { await salvarConfiguracoes(formulario); toast.success("Ajustes salvos neste dispositivo."); };
  const atualizarRegra = (campo: keyof Formulario["regras"], valor: string) => setFormulario((atual) => ({ ...atual, regras: { ...atual.regras, [campo]: Math.max(1, Number(valor) || 1) } }));
  const campos = [
    { campo: "mesesVisitaAtrasada" as const, rotulo: "Visita domiciliar atrasada", descricao: "Meses desde a última visita para entrar na lista de prioridade." },
    { campo: "mesesPreventivo" as const, rotulo: "Rastreamento em saúde da mulher", descricao: "Meses desde a última avaliação considerada pela lista local." },
    { campo: "mesesDiabetes" as const, rotulo: "Acompanhamento de diabetes", descricao: "Intervalo para consulta ou hemoglobina glicada pendente." },
    { campo: "mesesHipertensao" as const, rotulo: "Acompanhamento de hipertensão", descricao: "Intervalo para consulta ou aferição de pressão pendente." },
  ];

  return <section className="mx-auto max-w-[980px] pb-16 lg:pb-0"><div className="mb-7"><p className="text-xs font-bold uppercase tracking-[0.12em] text-[#0757a5]">Configuração local</p><h1 className="mt-1 text-3xl font-bold tracking-tight text-[#172b4d]">Ajustes do dispositivo</h1><p className="mt-2 text-sm text-slate-600">Defina uma identificação para o aparelho, o filtro mestre de microárea e os parâmetros operacionais usados nas listas de prioridade.</p></div>
    <div className="rounded-xl border border-slate-200 bg-white shadow-[0_3px_13px_rgba(25,54,95,0.04)]"><div className="border-b border-slate-100 px-5 py-4"><h2 className="font-bold text-[#172b4d]">Identificação e filtro mestre</h2></div><div className="grid gap-5 p-5 sm:grid-cols-2"><label className="grid gap-2 text-sm font-semibold text-slate-700">Nome deste dispositivo<input value={formulario.nomeDispositivo} onChange={(event) => setFormulario((atual) => ({ ...atual, nomeDispositivo: event.target.value }))} className="h-11 rounded-lg border border-slate-300 bg-white px-3 text-sm font-normal outline-none transition focus:border-[#0757a5] focus:ring-2 focus:ring-blue-100" placeholder="Ex.: Tablet da microárea 06" /></label><label className="grid gap-2 text-sm font-semibold text-slate-700">Microárea mestre<input value={formulario.microareaAtiva ?? ""} onChange={(event) => setFormulario((atual) => ({ ...atual, microareaAtiva: event.target.value.trim() || null }))} className="h-11 rounded-lg border border-slate-300 bg-white px-3 text-sm font-normal outline-none transition focus:border-[#0757a5] focus:ring-2 focus:ring-blue-100" placeholder="Todas as microáreas ou ex.: 06" /><span className="text-xs font-normal leading-relaxed text-slate-500">A seleção também pode ser alterada no cabeçalho e vale para painel, cidadãos, rotina e relatórios.</span></label></div></div>
    <div className="mt-7 rounded-xl border border-slate-200 bg-white shadow-[0_3px_13px_rgba(25,54,95,0.04)]"><div className="flex gap-3 border-b border-slate-100 px-5 py-4"><SlidersHorizontal className="h-5 w-5 text-[#0757a5]" /><div><h2 className="font-bold text-[#172b4d]">Regras locais de prioridade</h2><p className="mt-0.5 text-xs text-slate-500">Ajuste com a orientação da sua equipe. Estas regras organizam a lista de trabalho e não substituem avaliação clínica.</p></div></div><div className="divide-y divide-slate-100">{campos.map((item) => <label key={item.campo} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between"><span><span className="block text-sm font-semibold text-slate-700">{item.rotulo}</span><span className="mt-1 block text-xs leading-relaxed text-slate-500">{item.descricao}</span></span><span className="flex shrink-0 items-center gap-2 text-sm text-slate-500"><input type="number" min="1" value={formulario.regras[item.campo]} onChange={(event) => atualizarRegra(item.campo, event.target.value)} className="h-10 w-20 rounded-lg border border-slate-300 px-3 text-right font-bold text-slate-700 outline-none focus:border-[#0757a5] focus:ring-2 focus:ring-blue-100" /> meses</span></label>)}</div><div className="flex justify-end border-t border-slate-100 p-5"><button onClick={() => void salvar()} className="inline-flex items-center gap-2 rounded-lg bg-[#0757a5] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#064987] active:scale-[0.98]"><Save className="h-4 w-4" /> Salvar ajustes</button></div></div>
  </section>;
}
