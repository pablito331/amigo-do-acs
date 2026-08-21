import { useLiveQuery } from "dexie-react-hooks";
import { CalendarPlus, ClipboardCheck, MapPin, Phone, Search, SlidersHorizontal, UserRound, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { db, registrarVisita } from "@/lib/acs-db";
import { formatarData } from "@/lib/date-utils";
import { CONFIGURACOES_PADRAO, type Cidadao, type TipoVisita } from "@/lib/domain";
import { gerarPrioridades } from "@/lib/priority";

const tiposVisita: TipoVisita[] = ["Domiciliar", "Busca ativa", "Acompanhamento", "Atualização cadastral"];

function urgenciaDaPrioridade(nivel: "alta" | "media" | "atencao") {
  if (nivel === "alta") return { texto: "Urgência Alta", estilo: "bg-red-100 text-red-800" };
  if (nivel === "media") return { texto: "Urgência Média", estilo: "bg-amber-100 text-amber-800" };
  return { texto: "Urgência Atenção", estilo: "bg-blue-100 text-blue-800" };
}

function ResumoClinico({ cidadao }: { cidadao: Cidadao }) {
  const linhas = [
    cidadao.isGestante && ["Gestação", `IG ${cidadao.igSemanas ?? "não informada"} · ${cidadao.qtdConsultasPreNatal ?? 0} consulta(s)`],
    cidadao.isDiabetico && ["Diabetes", `Hb: ${formatarData(cidadao.dataUltimaHemoglobinaGlicada)} · consulta: ${formatarData(cidadao.dataUltimaConsultaDiabetes)}`],
    cidadao.isHipertenso && ["Hipertensão", `PA: ${formatarData(cidadao.dataUltimaMedicaoPressao)} · consulta: ${formatarData(cidadao.dataUltimaConsultaHipertensao)}`],
    cidadao.isMulher && ["Rastreamento", formatarData(cidadao.examePreventivoUltimaAvaliacao)],
    cidadao.isIdoso && ["Grupo", "Pessoa idosa"],
    cidadao.isCrianca && ["Grupo", "Desenvolvimento infantil"],
    cidadao.isSaudeBucal && ["Grupo", "Saúde bucal"],
  ].filter(Boolean) as [string, string][];

  return <div className="rounded-lg border border-blue-100 bg-[#f7fbff] p-3"><p className="text-xs font-bold uppercase tracking-wide text-[#0757a5]">Resumo clínico consolidado</p><dl className="mt-2 space-y-2 text-xs text-slate-600">{linhas.map(([rotulo, valor], indice) => <div key={`${rotulo}-${indice}`} className="flex justify-between gap-3"><dt>{rotulo}</dt><dd className="text-right font-semibold">{valor}</dd></div>)}{!linhas.length && <p>Não há condição temática identificada nas listas importadas.</p>}</dl></div>;
}

export default function Cidadaos() {
  const [localizacao] = useLocation();
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState("todos");
  const [selecionadoId, setSelecionadoId] = useState<string | null>(null);
  const [dataVisita, setDataVisita] = useState(new Date().toISOString().slice(0, 10));
  const [tipoVisita, setTipoVisita] = useState<TipoVisita>("Domiciliar");
  const [situacaoVisita, setSituacaoVisita] = useState<"concluida" | "ausente">("concluida");
  const [observacoes, setObservacoes] = useState("");

  const cidadaos = useLiveQuery(() => db.cidadaos.orderBy("nome").toArray(), []) ?? [];
  const visitas = useLiveQuery(() => db.visitas.orderBy("criadaEm").reverse().toArray(), []) ?? [];
  const configuracoes = useLiveQuery(() => db.configuracoes.get("configuracoes"), []);
  const prioridades = useMemo(() => gerarPrioridades(cidadaos, configuracoes?.regras ?? CONFIGURACOES_PADRAO.regras), [cidadaos, configuracoes?.regras]);
  const prioridadePorId = useMemo(() => new Map(prioridades.map((item) => [item.cidadaoId, item])), [prioridades]);
  const selecionado = cidadaos.find((item) => item.id === selecionadoId) ?? null;
  const prioridadeAtual = selecionado ? prioridadePorId.get(selecionado.id) : undefined;

  useEffect(() => {
    const parametros = new URLSearchParams(localizacao.split("?")[1] ?? "");
    const cidadao = parametros.get("cidadao");
    const filtroDaRota = parametros.get("filtro");
    if (cidadao && cidadaos.some((item) => item.id === cidadao)) setSelecionadoId(cidadao);
    if (filtroDaRota) setFiltro(filtroDaRota);
  }, [cidadaos, localizacao]);

  const filtrados = cidadaos.filter((item) => {
    const consulta = busca.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
    const pesquisavel = [item.nome, item.cns, item.cpf, item.endereco, item.microarea, item.fontes.join(" ")].filter(Boolean).join(" ").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    const corresponde = !consulta || pesquisavel.includes(consulta);
    const temPrioridade = prioridadePorId.has(item.id);
    const grupo = filtro === "todos" || (filtro === "prioridades" && temPrioridade) || (filtro === "gestantes" && item.isGestante) || (filtro === "diabetes" && item.isDiabetico) || (filtro === "hipertensao" && item.isHipertenso) || (filtro === "mulheres" && item.isMulher) || (filtro === "criancas" && item.isCrianca) || (filtro === "idosos" && item.isIdoso) || (filtro === "bucal" && item.isSaudeBucal);
    return corresponde && grupo;
  });

  const salvarVisita = async () => {
    if (!selecionado) return;
    await registrarVisita({ cidadaoId: selecionado.id, data: dataVisita, tipo: tipoVisita, situacao: situacaoVisita, observacoes: observacoes.trim() || null });
    setObservacoes("");
    toast.success(situacaoVisita === "concluida" ? "Visita registrada." : "Ausência registrada.");
  };

  const ultimasVisitas = selecionado ? visitas.filter((item) => item.cidadaoId === selecionado.id).slice(0, 4) : [];

  return <section className="mx-auto max-w-[1280px] pb-16 lg:pb-0">
    <div className="mb-7"><p className="text-xs font-bold uppercase tracking-[0.12em] text-[#0757a5]">Cadastro local</p><h1 className="mt-1 text-3xl font-bold tracking-tight text-[#172b4d]">Cidadãos da microárea</h1><p className="mt-2 text-sm text-slate-600">Consulte os registros importados, identifique prioridades e registre visitas diretamente neste dispositivo.</p></div>
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-[0_3px_13px_rgba(25,54,95,0.04)] sm:p-5">
      <div className="grid gap-3 md:grid-cols-[1fr_auto]"><label className="relative block"><Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" /><input value={busca} onChange={(event) => setBusca(event.target.value)} className="h-12 w-full rounded-lg border border-slate-300 bg-white pl-10 pr-4 text-sm outline-none transition focus:border-[#0757a5] focus:ring-2 focus:ring-blue-100" placeholder="Buscar por nome, CNS, CPF, endereço ou situação de saúde" /></label><label className="flex h-12 items-center gap-2 rounded-lg border border-slate-300 px-3 text-sm text-slate-600"><SlidersHorizontal className="h-4 w-4 text-[#0757a5]" /><select value={filtro} onChange={(event) => setFiltro(event.target.value)} className="min-w-[180px] bg-transparent outline-none"><option value="todos">Todos os cidadãos</option><option value="prioridades">Com prioridade</option><option value="gestantes">Gestantes</option><option value="diabetes">Diabetes</option><option value="hipertensao">Hipertensão</option><option value="mulheres">Saúde da mulher</option><option value="criancas">Desenvolvimento infantil</option><option value="idosos">Pessoa idosa</option><option value="bucal">Saúde bucal</option></select></label></div>
      <div className="mt-3 flex items-center justify-between text-xs text-slate-500"><span>{filtrados.length} cidadão(ãos) encontrado(s)</span><span>{prioridades.length} prioridade(s) com as regras atuais</span></div>
    </div>
    <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_390px]">
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_3px_13px_rgba(25,54,95,0.04)]"><div className="hidden grid-cols-[1.4fr_1fr_0.9fr_0.8fr] gap-4 border-b border-slate-100 bg-slate-50 px-5 py-3 text-[11px] font-bold uppercase tracking-wide text-slate-500 md:grid"><span>Cidadão</span><span>Endereço</span><span>Acompanhamento</span><span>Prioridade</span></div><div className="divide-y divide-slate-100">{filtrados.map((item) => { const prioridade = prioridadePorId.get(item.id); return <button key={item.id} onClick={() => setSelecionadoId(item.id)} className={`grid w-full gap-3 px-5 py-4 text-left transition hover:bg-[#f7fbff] md:grid-cols-[1.4fr_1fr_0.9fr_0.8fr] md:items-center ${selecionadoId === item.id ? "bg-[#edf6ff]" : ""}`}><span className="min-w-0"><span className="flex items-center gap-2"><UserRound className="h-4 w-4 shrink-0 text-[#0757a5]" /><strong className="truncate text-sm text-slate-700">{item.nome}</strong></span><span className="mt-1 block text-xs text-slate-500">CNS: {item.cns ?? "não informado"} · Microárea {item.microarea ?? "—"}</span></span><span className="min-w-0 text-xs text-slate-600"><MapPin className="mr-1 inline h-3.5 w-3.5 text-slate-400" />{item.endereco ?? "Endereço não informado"}</span><span className="text-xs font-semibold text-slate-600">{item.fontes.length ? item.fontes.slice(0, 2).join(" · ") : "Cadastro geral"}</span><span>{prioridade ? <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${urgenciaDaPrioridade(prioridade.nivel).estilo}`}>{urgenciaDaPrioridade(prioridade.nivel).texto}</span> : <span className="text-xs text-slate-400">Sem alerta</span>}</span></button>})}{!filtrados.length && <div className="px-5 py-16 text-center text-sm text-slate-500">Nenhum cidadão corresponde à busca ou ao filtro selecionado.</div>}</div></section>
      <aside className="min-w-0"><div className="sticky top-5 rounded-xl border border-slate-200 bg-white shadow-[0_3px_13px_rgba(25,54,95,0.04)]">{selecionado ? <><div className="flex items-start justify-between border-b border-slate-100 p-5"><div className="min-w-0"><p className="text-xs font-bold uppercase tracking-[0.1em] text-[#0757a5]">Detalhes do cidadão</p><h2 className="mt-1 truncate text-xl font-bold text-[#172b4d]">{selecionado.nome}</h2><p className="mt-1 text-xs text-slate-500">{selecionado.dataNascimento ? `Nascimento: ${formatarData(selecionado.dataNascimento)}` : "Nascimento não informado"}</p></div><button onClick={() => setSelecionadoId(null)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"><X className="h-5 w-5" /></button></div><div className="space-y-4 p-5"><div className="grid gap-2 text-sm"><p className="flex gap-2 text-slate-600"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#0757a5]" />{selecionado.endereco ?? "Endereço não informado"}</p><p className="flex gap-2 text-slate-600"><Phone className="h-4 w-4 shrink-0 text-[#0757a5]" />{selecionado.telefone ?? "Telefone não informado"}</p></div><div className="flex flex-wrap gap-1.5">{selecionado.fontes.map((fonte) => <span key={fonte} className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-[#0757a5]">{fonte}</span>)}</div><ResumoClinico cidadao={selecionado} />{prioridadeAtual && <div className="rounded-lg border border-amber-200 bg-amber-50 p-3"><div className="flex flex-wrap gap-1.5"><span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700">{prioridadeAtual.categoria}</span><span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${urgenciaDaPrioridade(prioridadeAtual.nivel).estilo}`}>{urgenciaDaPrioridade(prioridadeAtual.nivel).texto}</span></div><p className="mt-2 text-xs font-bold text-amber-900">{prioridadeAtual.titulo}</p><p className="mt-1 text-xs leading-relaxed text-amber-800">{prioridadeAtual.detalhe}</p></div>}<div className="border-t border-slate-100 pt-4"><div className="flex items-center gap-2"><CalendarPlus className="h-4 w-4 text-[#0757a5]" /><h3 className="font-bold text-slate-700">Registrar visita</h3></div><div className="mt-3 grid grid-cols-2 gap-2"><input type="date" value={dataVisita} onChange={(event) => setDataVisita(event.target.value)} className="h-10 rounded-lg border border-slate-300 px-2 text-xs outline-none focus:border-[#0757a5]" /><select value={tipoVisita} onChange={(event) => setTipoVisita(event.target.value as TipoVisita)} className="h-10 rounded-lg border border-slate-300 bg-white px-2 text-xs outline-none focus:border-[#0757a5]">{tiposVisita.map((tipo) => <option key={tipo}>{tipo}</option>)}</select></div><div className="mt-2 flex gap-3 text-xs font-semibold text-slate-600"><label className="flex items-center gap-1.5"><input type="radio" checked={situacaoVisita === "concluida"} onChange={() => setSituacaoVisita("concluida")} /> Concluída</label><label className="flex items-center gap-1.5"><input type="radio" checked={situacaoVisita === "ausente"} onChange={() => setSituacaoVisita("ausente")} /> Ausente</label></div><textarea value={observacoes} onChange={(event) => setObservacoes(event.target.value)} className="mt-2 min-h-20 w-full rounded-lg border border-slate-300 p-2 text-xs outline-none focus:border-[#0757a5]" placeholder="Observações da visita (opcional)" /><button onClick={() => void salvarVisita()} className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#0757a5] px-3 py-2.5 text-sm font-bold text-white hover:bg-[#064987]"><ClipboardCheck className="h-4 w-4" /> Salvar visita</button></div><div className="border-t border-slate-100 pt-4"><p className="text-xs font-bold uppercase tracking-wide text-slate-500">Últimos registros</p><div className="mt-2 space-y-2">{ultimasVisitas.map((item) => <div key={item.id} className="rounded-lg bg-slate-50 p-2.5 text-xs"><div className="flex justify-between gap-2"><strong className="text-slate-700">{formatarData(item.data)}</strong><span className={item.situacao === "concluida" ? "text-emerald-700" : "text-amber-700"}>{item.situacao === "concluida" ? "Concluída" : "Ausente"}</span></div><p className="mt-1 text-slate-500">{item.tipo}{item.observacoes ? ` · ${item.observacoes}` : ""}</p></div>)}{!ultimasVisitas.length && <p className="py-2 text-xs text-slate-500">Nenhuma visita registrada neste dispositivo.</p>}</div></div></div></> : <div className="p-8 text-center"><span className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-slate-100 text-slate-400"><UserRound className="h-6 w-6" /></span><h2 className="mt-4 font-bold text-slate-700">Selecione um cidadão</h2><p className="mt-1 text-sm leading-relaxed text-slate-500">Clique em um cadastro para ver dados, prioridades e registrar uma visita.</p></div>}</div></aside>
    </div>
  </section>;
}
