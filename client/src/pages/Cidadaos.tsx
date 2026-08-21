import { useLiveQuery } from "dexie-react-hooks";
import { Baby, BadgeCheck, CalendarPlus, CircleAlert, ClipboardCheck, MapPin, MessageCircle, MessageSquare, Phone, Ruler, Scale, Search, SlidersHorizontal, UserRound, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { db, obterConfiguracoes, registrarVisita } from "@/lib/acs-db";
import { avaliarAcompanhamentoAntropometrico } from "@/lib/bolsa-familia";
import { ehCrianca, formatarData, idadeEmAnos, idadeEmMeses } from "@/lib/date-utils";
import { CONFIGURACOES_PADRAO, type Cidadao, type Prioridade, type TipoVisita } from "@/lib/domain";
import { mesmaMicroarea } from "@/lib/microarea";
import { classificarImcAdulto } from "@/lib/imc";
import { gerarPrioridades } from "@/lib/priority";
import { criarTarefaAtualizacaoPec } from "@/lib/routine";
import { formatarRecenciaPec } from "@/lib/recencia";
import { linkSmsCidadao, linkWhatsAppCidadao } from "@/lib/citizen-contact";

const tiposVisita: TipoVisita[] = ["Domiciliar", "Busca ativa", "Acompanhamento", "Atualização cadastral"];

function corDaPrioridade(nivel: "alta" | "media" | "atencao") {
  if (nivel === "alta") return { cor: "bg-red-500", descricao: "Prioridade alta" };
  if (nivel === "media") return { cor: "bg-amber-500", descricao: "Prioridade intermediária" };
  return { cor: "bg-blue-500", descricao: "Prioridade de acompanhamento" };
}

export function linhasResumoClinico(cidadao: Cidadao): [string, string][] {
  const eCrianca = ehCrianca(cidadao.dataNascimento, cidadao.idadeStr);
  return [
    ["Listas consolidadas", cidadao.fontes.length ? cidadao.fontes.join(" · ") : "Cadastro Geral"],
    cidadao.isGestante && ["Gestação", `IG ${cidadao.igSemanas ?? "não informada"} · ${cidadao.qtdConsultasPreNatal ?? 0} consulta(s)`],
    cidadao.isDiabetico && ["Diabetes", `Hb: ${formatarData(cidadao.dataUltimaHemoglobinaGlicada)} · consulta: ${formatarData(cidadao.dataUltimaConsultaDiabetes)}`],
    cidadao.isHipertenso && ["Hipertensão", `PA: ${formatarData(cidadao.dataUltimaMedicaoPressao)} · consulta: ${formatarData(cidadao.dataUltimaConsultaHipertensao)}`],
    cidadao.isMulher && ["Rastreamento", formatarData(cidadao.examePreventivoUltimaAvaliacao)],
    eCrianca && !cidadao.fontes.includes("Desenvolvimento infantil") && ["Acompanhamento infantil", "Identificado pela idade no cadastro Geral"],
  ].filter(Boolean) as [string, string][];
}

function ResumoClinico({ cidadao }: { cidadao: Cidadao }) {
  const linhas = linhasResumoClinico(cidadao);
  return <div className="rounded-lg border border-blue-100 bg-[#f7fbff] p-3"><p className="text-xs font-bold uppercase tracking-wide text-[#0757a5]">Resumo clínico consolidado</p><dl className="mt-2 space-y-2 text-xs text-slate-600">{linhas.map(([rotulo, valor], indice) => <div key={`${rotulo}-${indice}`} className="flex justify-between gap-3"><dt>{rotulo}</dt><dd className="text-right font-semibold">{valor}</dd></div>)}{!linhas.length && <p>Não há condição temática identificada nas listas importadas.</p>}</dl><button onClick={() => { window.location.href = `/rotina?agendarCidadao=${encodeURIComponent(cidadao.id)}`; }} className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-[#9ebadf] bg-white px-3 py-2 text-xs font-bold text-[#0757a5] hover:bg-blue-50"><CalendarPlus className="h-3.5 w-3.5" /> Adicionar à agenda em uma data</button></div>;
}

async function solicitarAtualizacaoPec(cidadao: Cidadao) {
  const motivo = window.prompt(`Qual o motivo para atualizar ${cidadao.nome} no PEC?`, "");
  if (!motivo?.trim()) return;
  await criarTarefaAtualizacaoPec(cidadao.id, motivo);
  toast.success("Tarefa de atualização criada na agenda.");
}

function AcoesConversa({ telefone }: { telefone: string | null }) {
  const whatsapp = linkWhatsAppCidadao(telefone);
  const sms = linkSmsCidadao(telefone);
  if (!telefone || !whatsapp || !sms) return <p className="flex gap-2 text-slate-600"><Phone className="h-4 w-4 shrink-0 text-[#0757a5]" />Telefone não informado ou inválido</p>;
  return <div className="rounded-lg border border-blue-100 bg-[#f7fbff] p-3"><div className="flex items-center gap-2 text-xs text-slate-600"><Phone className="h-4 w-4 shrink-0 text-[#0757a5]" /><span>{telefone}</span></div><p className="mt-2 text-[11px] font-semibold text-[#0757a5]">Escolha como abrir a conversa. Nenhuma mensagem é enviada automaticamente.</p><div className="mt-2 flex flex-wrap gap-2"><a href={whatsapp} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-2.5 py-2 text-xs font-bold text-white hover:bg-emerald-700"><MessageCircle className="h-3.5 w-3.5" />WhatsApp</a><a href={sms} className="inline-flex items-center gap-1.5 rounded-lg border border-[#9ebadf] bg-white px-2.5 py-2 text-xs font-bold text-[#0757a5] hover:bg-blue-50"><MessageSquare className="h-3.5 w-3.5" />SMS</a></div></div>;
}

function LinhaPesoAltura({ cidadao }: { cidadao: Cidadao }) {
  const peso = cidadao.pesoKg ?? null;
  const altura = cidadao.alturaCm ?? null;
  if (peso === null && altura === null) return null;
  const partes = [peso !== null ? `${peso.toLocaleString("pt-BR", { maximumFractionDigits: 1 })} kg` : null, altura !== null ? `${altura} cm` : null].filter(Boolean);
  return <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-emerald-800"><Scale className="h-3.5 w-3.5 shrink-0" /><span>Peso/altura: {partes.join(" / ")}{cidadao.dataUltimaMedicaoPesoAltura ? ` em ${formatarData(cidadao.dataUltimaMedicaoPesoAltura)}` : ""}</span></p>;
}


function ResumoRecenciasPec({ cidadao }: { cidadao: Cidadao }) {
  const linhas = [
    ["Médico", formatarRecenciaPec(cidadao.mesesUltimoAtendimentoMedico, cidadao.diasUltimoAtendimentoMedico)],
    ["Enfermagem", formatarRecenciaPec(cidadao.mesesUltimoAtendimentoEnfermagem, cidadao.diasUltimoAtendimentoEnfermagem)],
    ["Odontológico", formatarRecenciaPec(cidadao.mesesUltimoAtendimentoOdontologico, cidadao.diasUltimoAtendimentoOdontologico)],
    ["Visita domiciliar", formatarRecenciaPec(cidadao.mesesUltimaVisitaDomiciliar, cidadao.diasUltimaVisitaDomiciliar)],
  ] as const;
  const possuiDados = linhas.some(([, valor]) => valor !== "—");
  if (!possuiDados) return null;
  return <div className="rounded-lg border border-slate-200 bg-white p-3"><p className="text-xs font-bold uppercase tracking-wide text-[#0757a5]">Recência de acompanhamento · PEC</p><dl className="mt-2 space-y-1.5 text-xs text-slate-600">{linhas.map(([rotulo, valor]) => <div key={rotulo} className="flex justify-between gap-3"><dt className="font-semibold text-slate-700">{rotulo}</dt><dd className="text-right">{valor}</dd></div>)}</dl><p className="mt-2 border-t border-slate-100 pt-2 text-[10px] leading-relaxed text-slate-500">Dados de recência do último CSV PEC; as visitas salvas no Amigo do ACS permanecem no histórico local.</p></div>;
}

function resumoRecenciasEmLinha(cidadao: Cidadao): string | null {
  const campos = [
    ["M", formatarRecenciaPec(cidadao.mesesUltimoAtendimentoMedico, cidadao.diasUltimoAtendimentoMedico)],
    ["E", formatarRecenciaPec(cidadao.mesesUltimoAtendimentoEnfermagem, cidadao.diasUltimoAtendimentoEnfermagem)],
    ["O", formatarRecenciaPec(cidadao.mesesUltimoAtendimentoOdontologico, cidadao.diasUltimoAtendimentoOdontologico)],
    ["VD", formatarRecenciaPec(cidadao.mesesUltimaVisitaDomiciliar, cidadao.diasUltimaVisitaDomiciliar)],
  ].filter(([, valor]) => valor !== "—") as [string, string][];
  return campos.length ? `PEC · ${campos.map(([sigla, valor]) => `${sigla}: ${valor}`).join(" · ")}` : null;
}

function FlagBolsaFamilia({ cidadao }: { cidadao: Cidadao }) {
  const acompanhamento = avaliarAcompanhamentoAntropometrico(cidadao);
  const visual = acompanhamento.situacao === "em-dia"
    ? { estilo: "border-emerald-200 bg-emerald-50 text-emerald-900", badge: "bg-emerald-600 text-white", icone: BadgeCheck }
    : acompanhamento.situacao === "atencao"
      ? { estilo: "border-amber-200 bg-amber-50 text-amber-900", badge: "bg-amber-500 text-white", icone: CircleAlert }
      : { estilo: "border-red-200 bg-red-50 text-red-900", badge: "bg-red-600 text-white", icone: CircleAlert };
  const Icone = visual.icone;
  return <div className={`mt-3 rounded-lg border p-3 ${visual.estilo}`}><div className="flex items-start gap-2"><Icone className="mt-0.5 h-4 w-4 shrink-0" /><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center justify-between gap-2"><p className="text-xs font-bold">Acompanhamento de peso e altura</p><span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${visual.badge}`}>{acompanhamento.titulo}</span></div><p className="mt-1 text-xs leading-relaxed">{acompanhamento.descricao}</p><p className="mt-2 text-[11px] font-semibold">Até 30 dias: verde. De 31 a 60 dias: amarelo. Acima de 60 dias ou com registro incompleto: vermelho.</p></div></div></div>;
}

function MedidasEAcompanhamento({ cidadao }: { cidadao: Cidadao }) {
  const eCrianca = ehCrianca(cidadao.dataNascimento, cidadao.idadeStr);
  const idade = idadeEmAnos(cidadao.dataNascimento);
  const peso = cidadao.pesoKg ?? null;
  const altura = cidadao.alturaCm ?? null;
  const pesoDisponivel = peso !== null;
  const alturaDisponivel = altura !== null;
  const imc = peso !== null && altura !== null && altura > 0 ? peso / ((altura / 100) ** 2) : null;
  const classificacaoImc = classificarImcAdulto(imc, idade);
  const temMedidas = pesoDisponivel || alturaDisponivel;

  if (!temMedidas && !eCrianca) return null;

  return <div className="rounded-lg border border-emerald-100 bg-emerald-50/50 p-3">
    <div className="flex items-center gap-2"><Scale className="h-4 w-4 text-emerald-700" /><p className="text-xs font-bold uppercase tracking-wide text-emerald-800">Medidas e acompanhamento</p></div>
    {temMedidas ? <><div className="mt-3 grid grid-cols-3 gap-2"><div className="rounded-md bg-white p-2 text-center shadow-sm"><Scale className="mx-auto h-3.5 w-3.5 text-emerald-700" /><p className="mt-1 text-[10px] font-bold uppercase text-slate-500">Peso</p><p className="mt-0.5 text-sm font-bold text-slate-800">{pesoDisponivel ? `${peso?.toLocaleString("pt-BR", { maximumFractionDigits: 1 })} kg` : "—"}</p></div><div className="rounded-md bg-white p-2 text-center shadow-sm"><Ruler className="mx-auto h-3.5 w-3.5 text-emerald-700" /><p className="mt-1 text-[10px] font-bold uppercase text-slate-500">Altura</p><p className="mt-0.5 text-sm font-bold text-slate-800">{alturaDisponivel ? `${altura} cm` : "—"}</p></div><div className="rounded-md bg-white p-2 text-center shadow-sm"><p className="mt-1 text-[10px] font-bold uppercase text-slate-500">IMC estimado</p><p className="mt-1.5 text-sm font-bold text-slate-800">{imc ? imc.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 }) : "—"}</p>{classificacaoImc && <span className={`mt-1 inline-flex rounded-full px-1.5 py-0.5 text-[9px] font-bold ${classificacaoImc.estilo}`}>{classificacaoImc.texto}</span>}</div></div><p className="mt-2 text-[11px] text-slate-500">Última medição de peso e altura: <strong>{formatarData(cidadao.dataUltimaMedicaoPesoAltura)}</strong>. {idade !== null && idade < 20 ? "Para crianças e adolescentes, a interpretação requer curvas por idade e sexo; não é aplicada a classificação de adultos." : "A classificação exibida é orientativa e não substitui avaliação profissional."}</p></> : <p className="mt-2 text-xs text-slate-600">Não há medida de peso ou altura informada nos relatórios importados.</p>}
    {eCrianca && <div className="mt-3 border-t border-emerald-100 pt-3"><div className="flex items-center gap-2"><Baby className="h-4 w-4 text-emerald-700" /><p className="text-xs font-bold text-emerald-900">Crescimento e acompanhamento infantil</p></div><dl className="mt-2 space-y-1.5 text-xs text-slate-600"><div className="flex justify-between gap-3"><dt>Bolsa Família</dt><dd className="text-right font-semibold">{cidadao.beneficiarioBolsaFamilia ?? "Não informado"}</dd></div><div className="flex justify-between gap-3"><dt>Vigência</dt><dd className="text-right font-semibold">{cidadao.vigenciaBolsaFamilia ?? "Não informada"}</dd></div>{cidadao.registrosPesoAltura12Meses && <div className="flex justify-between gap-3"><dt>Registros simultâneos em 12 meses</dt><dd className="text-right font-semibold">{cidadao.registrosPesoAltura12Meses}</dd></div>}</dl><FlagBolsaFamilia cidadao={cidadao} /></div>}
  </div>;
}

function DetalheMovel({ cidadao, prioridade, onFechar }: { cidadao: Cidadao; prioridade?: Prioridade; onFechar: () => void }) {
  return <div className="md:hidden border-t border-blue-100 bg-[#f7fbff] px-4 py-4"><div className="flex items-center justify-between gap-3"><p className="text-xs font-bold uppercase tracking-wide text-[#0757a5]">Detalhes do cidadão</p><div className="flex items-center gap-2"><LinhaPesoAltura cidadao={cidadao} /><button onClick={onFechar} aria-label="Fechar detalhes do cidadão" className="rounded-md p-1 text-slate-500 hover:bg-white"><X className="h-4 w-4" /></button></div></div><div className="mt-3 space-y-3"><ResumoClinico cidadao={cidadao} /><ResumoRecenciasPec cidadao={cidadao} /><MedidasEAcompanhamento cidadao={cidadao} /><AcoesConversa telefone={cidadao.telefone} />{prioridade && <div className="rounded-lg border border-amber-200 bg-amber-50 p-3"><p className="flex items-center text-xs font-bold text-amber-900"><span className={`mr-2 h-2.5 w-2.5 rounded-full ${corDaPrioridade(prioridade.nivel).cor}`} title={corDaPrioridade(prioridade.nivel).descricao}><span className="sr-only">{corDaPrioridade(prioridade.nivel).descricao}</span></span>{prioridade.categoria}</p><p className="mt-1 text-xs text-amber-800">{prioridade.detalhe}</p></div>}<button onClick={() => void solicitarAtualizacaoPec(cidadao)} className="w-full rounded-lg border border-[#9ebadf] bg-white px-3 py-2 text-xs font-bold text-[#0757a5] hover:bg-blue-50">Atualizar cidadão no PEC</button><a href="#registro-visita" className="block w-full rounded-lg bg-[#0757a5] px-3 py-2 text-center text-xs font-bold text-white">Registrar uma visita</a></div></div>;
}

export default function Cidadaos() {
  const [localizacao] = useLocation();
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState("todos");
  const [ordenacao, setOrdenacao] = useState<"nome" | "prioridade" | "endereco" | "acompanhamento">("nome");
  const [selecionadoId, setSelecionadoId] = useState<string | null>(null);
  const [dataVisita, setDataVisita] = useState(new Date().toISOString().slice(0, 10));
  const [tipoVisita, setTipoVisita] = useState<TipoVisita>("Domiciliar");
  const [situacaoVisita, setSituacaoVisita] = useState<"concluida" | "ausente">("concluida");
  const [observacoes, setObservacoes] = useState("");

  const cidadaos = useLiveQuery(() => db.cidadaos.orderBy("nome").toArray(), []) ?? [];
  const visitas = useLiveQuery(() => db.visitas.orderBy("criadaEm").reverse().toArray(), []) ?? [];
  const configuracoes = useLiveQuery(() => db.configuracoes.get("configuracoes"), []);
  const microareaAtiva = configuracoes?.microareaAtiva ?? null;
  const cidadaosDaMicroarea = useMemo(() => cidadaos.filter((item) => mesmaMicroarea(item.microarea, microareaAtiva)), [cidadaos, microareaAtiva]);
  const prioridades = useMemo(() => gerarPrioridades(cidadaosDaMicroarea, configuracoes?.regras ?? CONFIGURACOES_PADRAO.regras), [cidadaosDaMicroarea, configuracoes?.regras]);
  const prioridadePorId = useMemo(() => new Map(prioridades.map((item) => [item.cidadaoId, item])), [prioridades]);
  const selecionado = cidadaosDaMicroarea.find((item) => item.id === selecionadoId) ?? null;
  const prioridadeAtual = selecionado ? prioridadePorId.get(selecionado.id) : undefined;

  useEffect(() => {
    const parametros = new URLSearchParams(localizacao.split("?")[1] ?? "");
    const cidadao = parametros.get("cidadao");
    const filtroDaRota = parametros.get("filtro");
    if (cidadao && cidadaos.some((item) => item.id === cidadao)) setSelecionadoId(cidadao);
    if (filtroDaRota) setFiltro(filtroDaRota);
  }, [cidadaos, localizacao]);
  useEffect(() => { void obterConfiguracoes(); }, []);

  const filtrados = cidadaosDaMicroarea.filter((item) => {
    const consulta = busca.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
    const pesquisavel = [item.nome, item.cns, item.cpf, item.endereco, item.microarea, item.fontes.join(" ")].filter(Boolean).join(" ").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    const corresponde = !consulta || pesquisavel.includes(consulta);
    const temPrioridade = prioridadePorId.has(item.id);
    const grupo = filtro === "todos" || (filtro === "prioridades" && temPrioridade) || (filtro === "gestantes" && item.isGestante) || (filtro === "diabetes" && item.isDiabetico) || (filtro === "hipertensao" && item.isHipertenso) || (filtro === "mulheres" && item.isMulher) || (filtro === "criancas" && ehCrianca(item.dataNascimento, item.idadeStr)) || (filtro === "puericultura-pendente" && (idadeEmMeses(item.dataNascimento) ?? Infinity) <= 24 && item.qtdConsultasAte24Meses !== null && item.qtdConsultasAte24Meses < 9) || (filtro === "idosos" && item.isIdoso) || (filtro === "bucal" && item.isSaudeBucal);
    return corresponde && grupo;
  });
  const ordenados = useMemo(() => [...filtrados].sort((a, b) => {
    if (ordenacao === "prioridade") {
      const pesos = { alta: 0, media: 1, atencao: 2, nenhuma: 3 };
      const pesoA = pesos[prioridadePorId.get(a.id)?.nivel ?? "nenhuma"];
      const pesoB = pesos[prioridadePorId.get(b.id)?.nivel ?? "nenhuma"];
      return pesoA - pesoB || a.nome.localeCompare(b.nome, "pt-BR");
    }
    if (ordenacao === "endereco") return (a.endereco ?? "").localeCompare(b.endereco ?? "", "pt-BR") || a.nome.localeCompare(b.nome, "pt-BR");
    if (ordenacao === "acompanhamento") return a.fontes.join(" ").localeCompare(b.fontes.join(" "), "pt-BR") || a.nome.localeCompare(b.nome, "pt-BR");
    return a.nome.localeCompare(b.nome, "pt-BR");
  }), [filtrados, ordenacao, prioridadePorId]);

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
      <div className="grid gap-3 md:grid-cols-[1fr_auto]"><label className="relative block"><Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" /><input value={busca} onChange={(event) => setBusca(event.target.value)} className="h-12 w-full rounded-lg border border-slate-300 bg-white pl-10 pr-4 text-sm outline-none transition focus:border-[#0757a5] focus:ring-2 focus:ring-blue-100" placeholder="Buscar por nome, CNS, CPF, endereço ou situação de saúde" /></label><label className="flex h-12 items-center gap-2 rounded-lg border border-slate-300 px-3 text-sm text-slate-600"><SlidersHorizontal className="h-4 w-4 text-[#0757a5]" /><select value={filtro} onChange={(event) => setFiltro(event.target.value)} className="min-w-[180px] bg-transparent outline-none"><option value="todos">Todos os cidadãos</option><option value="prioridades">Com prioridade</option><option value="gestantes">Gestantes</option><option value="diabetes">Diabetes</option><option value="hipertensao">Hipertensão</option><option value="mulheres">Saúde da mulher</option><option value="criancas">Crianças</option><option value="puericultura-pendente">Puericultura: menos de 9 consultas</option><option value="idosos">Pessoa idosa</option><option value="bucal">Saúde bucal</option></select></label></div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500"><label className="flex items-center gap-2 font-semibold text-slate-600">Ordenar por<select value={ordenacao} onChange={(event) => setOrdenacao(event.target.value as typeof ordenacao)} className="h-8 rounded-md border border-slate-300 bg-white px-2 text-xs font-normal outline-none focus:border-[#0757a5]"><option value="nome">Nome (A–Z)</option><option value="prioridade">Prioridade</option><option value="endereco">Endereço</option><option value="acompanhamento">Acompanhamento</option></select></label><span>{microareaAtiva ? `Filtro mestre: Microárea ${microareaAtiva}` : "Filtro mestre: Todas as microáreas"}</span><span>{filtrados.length} cidadão(ãos) encontrado(s)</span><span>{prioridades.length} prioridade(s) com as regras atuais</span></div>
    </div>
    <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_390px]">
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_3px_13px_rgba(25,54,95,0.04)]"><div className="hidden grid-cols-[1.4fr_1fr_0.9fr_0.8fr] gap-4 border-b border-slate-100 bg-slate-50 px-5 py-3 text-[11px] font-bold uppercase tracking-wide text-slate-500 md:grid"><span>Cidadão</span><span>Endereço</span><span>Acompanhamento</span><span>Prioridade</span></div><div className="divide-y divide-slate-100">{ordenados.map((item) => { const prioridade = prioridadePorId.get(item.id); const recencias = resumoRecenciasEmLinha(item); const visitaDomiciliar = formatarRecenciaPec(item.mesesUltimaVisitaDomiciliar, item.diasUltimaVisitaDomiciliar); return <div key={item.id}><button onClick={() => setSelecionadoId((atual) => atual === item.id ? null : item.id)} className={`grid w-full gap-3 px-5 py-4 text-left transition hover:bg-[#f7fbff] md:grid-cols-[1.4fr_1fr_0.9fr_0.8fr] md:items-center ${selecionadoId === item.id ? "bg-[#edf6ff]" : ""}`}><span className="min-w-0"><span className="flex items-center gap-2"><UserRound className="h-4 w-4 shrink-0 text-[#0757a5]" /><strong className="truncate text-sm text-slate-700">{item.nome}</strong></span><span className="mt-1 block text-xs text-slate-500">CNS: {item.cns ?? "não informado"} · Microárea {item.microarea ?? "—"}</span></span><span className="min-w-0 text-xs text-slate-600"><MapPin className="mr-1 inline h-3.5 w-3.5 text-slate-400" />{item.endereco ?? "Endereço não informado"}</span><span className="min-w-0 text-xs font-semibold text-slate-600"><span className="block truncate">{item.fontes.length ? item.fontes.slice(0, 2).join(" · ") : "Cadastro geral"}</span>{recencias && <span className="mt-1 block truncate text-[11px] font-normal text-slate-500" title={recencias}>{recencias}</span>}</span><span>{prioridade ? <span className="inline-flex items-center gap-2"><span className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${corDaPrioridade(prioridade.nivel).cor}`} title={corDaPrioridade(prioridade.nivel).descricao}><span className="sr-only">{corDaPrioridade(prioridade.nivel).descricao}</span></span><span className="text-[11px] leading-tight text-slate-500">Visita domiciliar PEC:<br /><strong className="font-semibold text-slate-700">{visitaDomiciliar}</strong></span></span> : <span className="text-xs text-slate-400">Sem alerta</span>}</span></button>{selecionadoId === item.id && <DetalheMovel cidadao={item} prioridade={prioridade} onFechar={() => setSelecionadoId(null)} />}</div>})}{!filtrados.length && <div className="px-5 py-16 text-center text-sm text-slate-500">Nenhum cidadão corresponde à busca ou ao filtro selecionado.</div>}</div></section>
      <aside className="min-w-0"><div id="registro-visita" className="sticky top-5 rounded-xl border border-slate-200 bg-white shadow-[0_3px_13px_rgba(25,54,95,0.04)] xl:max-h-[calc(100vh-150px)] xl:overflow-y-auto">{selecionado ? <><div className="flex items-start justify-between border-b border-slate-100 p-5"><div className="min-w-0"><p className="text-xs font-bold uppercase tracking-[0.1em] text-[#0757a5]">Detalhes do cidadão</p><h2 className="mt-1 truncate text-xl font-bold text-[#172b4d]">{selecionado.nome}</h2><p className="mt-1 text-xs text-slate-500">{selecionado.dataNascimento ? `Nascimento: ${formatarData(selecionado.dataNascimento)}` : "Nascimento não informado"}</p><LinhaPesoAltura cidadao={selecionado} /></div><button onClick={() => setSelecionadoId(null)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"><X className="h-5 w-5" /></button></div><div className="space-y-4 p-5"><div className="grid gap-2 text-sm"><p className="flex gap-2 text-slate-600"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#0757a5]" />{selecionado.endereco ?? "Endereço não informado"}</p><AcoesConversa telefone={selecionado.telefone} /></div><div className="flex flex-wrap gap-1.5">{selecionado.fontes.map((fonte) => <span key={fonte} className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-[#0757a5]">{fonte}</span>)}</div><ResumoClinico cidadao={selecionado} /><ResumoRecenciasPec cidadao={selecionado} /><MedidasEAcompanhamento cidadao={selecionado} /><button onClick={() => void solicitarAtualizacaoPec(selecionado)} className="w-full rounded-lg border border-[#9ebadf] bg-[#f7fbff] px-3 py-2.5 text-xs font-bold text-[#0757a5] hover:bg-blue-50">Atualizar cidadão no PEC</button>{prioridadeAtual && <div className="rounded-lg border border-amber-200 bg-amber-50 p-3"><div className="flex flex-wrap gap-1.5"><span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700">{prioridadeAtual.categoria}</span><span className={`h-3 w-3 rounded-full ${corDaPrioridade(prioridadeAtual.nivel).cor}`} title={corDaPrioridade(prioridadeAtual.nivel).descricao}><span className="sr-only">{corDaPrioridade(prioridadeAtual.nivel).descricao}</span></span></div><p className="mt-2 text-xs font-bold text-amber-900">{prioridadeAtual.titulo}</p><p className="mt-1 text-xs leading-relaxed text-amber-800">{prioridadeAtual.detalhe}</p></div>}<div className="border-t border-slate-100 pt-4"><div className="flex items-center gap-2"><CalendarPlus className="h-4 w-4 text-[#0757a5]" /><h3 className="font-bold text-slate-700">Registrar visita</h3></div><div className="mt-3 grid grid-cols-2 gap-2"><input type="date" value={dataVisita} onChange={(event) => setDataVisita(event.target.value)} className="h-10 rounded-lg border border-slate-300 px-2 text-xs outline-none focus:border-[#0757a5]" /><select value={tipoVisita} onChange={(event) => setTipoVisita(event.target.value as TipoVisita)} className="h-10 rounded-lg border border-slate-300 bg-white px-2 text-xs outline-none focus:border-[#0757a5]">{tiposVisita.map((tipo) => <option key={tipo}>{tipo}</option>)}</select></div><div className="mt-2 flex gap-3 text-xs font-semibold text-slate-600"><label className="flex items-center gap-1.5"><input type="radio" checked={situacaoVisita === "concluida"} onChange={() => setSituacaoVisita("concluida")} /> Concluída</label><label className="flex items-center gap-1.5"><input type="radio" checked={situacaoVisita === "ausente"} onChange={() => setSituacaoVisita("ausente")} /> Ausente</label></div><textarea value={observacoes} onChange={(event) => setObservacoes(event.target.value)} className="mt-2 min-h-20 w-full rounded-lg border border-slate-300 p-2 text-xs outline-none focus:border-[#0757a5]" placeholder="Observações da visita (opcional)" /><button onClick={() => void salvarVisita()} className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#0757a5] px-3 py-2.5 text-sm font-bold text-white hover:bg-[#064987]"><ClipboardCheck className="h-4 w-4" /> Salvar visita</button></div><div className="border-t border-slate-100 pt-4"><p className="text-xs font-bold uppercase tracking-wide text-slate-500">Últimos registros</p><div className="mt-2 space-y-2">{ultimasVisitas.map((item) => <div key={item.id} className="rounded-lg bg-slate-50 p-2.5 text-xs"><div className="flex justify-between gap-2"><strong className="text-slate-700">{formatarData(item.data)}</strong><span className={item.situacao === "concluida" ? "text-emerald-700" : "text-amber-700"}>{item.situacao === "concluida" ? "Concluída" : "Ausente"}</span></div><p className="mt-1 text-slate-500">{item.tipo}{item.observacoes ? ` · ${item.observacoes}` : ""}</p></div>)}{!ultimasVisitas.length && <p className="py-2 text-xs text-slate-500">Nenhuma visita registrada neste dispositivo.</p>}</div></div></div></> : <div className="p-8 text-center"><span className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-slate-100 text-slate-400"><UserRound className="h-6 w-6" /></span><h2 className="mt-4 font-bold text-slate-700">Selecione um cidadão</h2><p className="mt-1 text-sm leading-relaxed text-slate-500">Clique em um cadastro para ver dados, prioridades e registrar uma visita.</p></div>}</div></aside>
    </div>
  </section>;
}
