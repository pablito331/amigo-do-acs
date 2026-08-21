import { useLiveQuery } from "dexie-react-hooks";
import { AlertTriangle, ArrowRight, CalendarCheck2, HomeIcon, UsersRound } from "lucide-react";
import { useLocation } from "wouter";
import { useEffect, useMemo, useState } from "react";
import { db, obterConfiguracoes } from "@/lib/acs-db";
import { calcularPainel } from "@/lib/metrics";
import { mesmaMicroarea } from "@/lib/microarea";
import { CONFIGURACOES_PADRAO } from "@/lib/domain";

const situacaoEstilo = {
  adequado: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  atencao: "bg-amber-50 text-amber-700 ring-amber-200",
  critico: "bg-red-50 text-red-700 ring-red-200",
  "sem-base": "bg-slate-100 text-slate-600 ring-slate-200",
};

export default function Home() {
  const [_, navegar] = useLocation();
  const [periodoVisitas, setPeriodoVisitas] = useState<"semana" | "mes">("mes");
  const cidadaos = useLiveQuery(() => db.cidadaos.toArray(), []) ?? [];
  const visitas = useLiveQuery(() => db.visitas.toArray(), []) ?? [];
  const configuracoes = useLiveQuery(() => db.configuracoes.get("configuracoes"), []);
  const microareaAtiva = configuracoes?.microareaAtiva ?? null;
  const cidadaosDaMicroarea = useMemo(() => cidadaos.filter((item) => mesmaMicroarea(item.microarea, microareaAtiva)), [cidadaos, microareaAtiva]);
  const dados = calcularPainel(cidadaos, visitas, configuracoes?.regras ?? CONFIGURACOES_PADRAO.regras, microareaAtiva);
  const visitasNoPeriodo = periodoVisitas === "semana" ? dados.visitasNaSemana : dados.visitasNoMes;
  useEffect(() => { void obterConfiguracoes(); }, []);

  const cards = [
    { rotulo: "Cidadãos na base", valor: cidadaosDaMicroarea.length, descricao: microareaAtiva ? `registros da microárea ${microareaAtiva}` : "registros disponíveis localmente", icone: UsersRound, tom: "blue" },
    { rotulo: "Domicílios estimados", valor: dados.domicilios, descricao: "endereços distintos na base", icone: HomeIcon, tom: "teal" },
    { rotulo: `Visitas na ${periodoVisitas}`, valor: visitasNoPeriodo, descricao: "registradas neste dispositivo", icone: CalendarCheck2, tom: "orange" },
    { rotulo: "Prioridades abertas", valor: dados.prioridades.length, descricao: "situações para acompanhamento", icone: AlertTriangle, tom: "red" },
  ];

  if (!cidadaos.length) {
    return (
      <section className="mx-auto max-w-5xl">
        <div className="overflow-hidden rounded-2xl border border-[#cddcf0] bg-white shadow-[0_14px_38px_rgba(31,66,135,0.08)]">
          <div className="grid gap-8 bg-[linear-gradient(115deg,#eef6ff_0%,#ffffff_60%)] p-7 sm:grid-cols-[1.1fr_0.9fr] sm:p-10">
            <div>
              <span className="inline-flex rounded-full bg-[#dceeff] px-3 py-1 text-xs font-bold text-[#0757a5]">Primeiro acesso neste dispositivo</span>
              <h1 className="mt-5 text-3xl font-bold tracking-tight text-[#12335f] sm:text-4xl">Comece importando as listas da sua microárea.</h1>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-600">O Amigo do ACS funciona a partir dos CSVs exportados pelo PEC. Depois de importar, as buscas, os indicadores, as visitas e as prioridades permanecem disponíveis sem internet.</p>
              <div className="mt-7 flex flex-wrap gap-3">
                <button onClick={() => navegar("/importar")} className="inline-flex items-center gap-2 rounded-lg bg-[#0757a5] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#064987] active:scale-[0.98]">
                  Importar listas do PEC <ArrowRight className="h-4 w-4" />
                </button>
                <button onClick={() => navegar("/backup")} className="rounded-lg border border-[#9ebadf] bg-white px-5 py-3 text-sm font-bold text-[#0757a5] transition hover:bg-blue-50 active:scale-[0.98]">Restaurar backup</button>
              </div>
            </div>
            <div className="self-center rounded-xl border border-blue-100 bg-white p-5 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#0757a5]">Fluxo local</p>
              <ol className="mt-4 space-y-4">
                {["Exporte as listas temáticas no PEC para a microárea desejada.", "Selecione os CSVs nesta tela e confirme a importação.", "Trabalhe offline e faça backups regulares do dispositivo."].map((item, indice) => (
                  <li key={item} className="flex gap-3 text-sm leading-relaxed text-slate-600"><span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#eaf3ff] text-xs font-bold text-[#0757a5]">{indice + 1}</span>{item}</li>
                ))}
              </ol>
            </div>
          </div>
          <div className="border-t border-slate-100 bg-slate-50 px-7 py-4 text-xs text-slate-500">Os dados ficam somente neste navegador. Proteja o aparelho e mantenha cópias de backup em local seguro.</div>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-[1280px] pb-16 lg:pb-0">
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#0757a5]">Microárea {configuracoes?.microareaAtiva ?? "local"}</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-[#172b4d]">Painel de acompanhamento</h1>
          <p className="mt-1 text-sm text-slate-500">Resumo calculado exclusivamente a partir das listas e registros deste dispositivo.</p>
        </div>
        <button onClick={() => navegar("/importar")} className="rounded-lg border border-[#9ebadf] bg-white px-4 py-2.5 text-sm font-bold text-[#0757a5] transition hover:bg-blue-50 active:scale-[0.98]">Atualizar listas</button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icone = card.icone;
          return <article key={card.rotulo} className="rounded-xl border border-slate-200 bg-white p-5 shadow-[0_3px_13px_rgba(25,54,95,0.04)]"><div className="flex items-start justify-between"><p className="text-sm font-semibold text-slate-600">{card.rotulo}</p><span className={`grid h-9 w-9 place-items-center rounded-lg icon-${card.tom}`}><Icone className="h-4.5 w-4.5" /></span></div><p className="mt-4 text-3xl font-bold tracking-tight text-[#172b4d]">{card.valor}</p><p className="mt-1 text-xs text-slate-500">{card.descricao}</p></article>;
        })}
      </div>

      <section className="mt-7 rounded-xl border border-slate-200 bg-white shadow-[0_3px_13px_rgba(25,54,95,0.04)]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4"><div><h2 className="font-bold text-[#172b4d]">Visitas da microárea</h2><p className="mt-0.5 text-xs text-slate-500">Leitura local e recência informada pelo último CSV PEC.</p></div><div className="flex items-center gap-3"><label className="text-xs font-semibold text-slate-600">Período <select value={periodoVisitas} onChange={(event) => setPeriodoVisitas(event.target.value as "semana" | "mes")} className="ml-1 rounded-md border border-slate-300 bg-white px-2 py-1 text-xs outline-none focus:border-[#0757a5]"><option value="semana">Semana</option><option value="mes">Mês</option></select></label><button onClick={() => navegar("/rotina")} className="text-xs font-bold text-[#0757a5] hover:underline">Abrir rotina</button></div></div>
        <div className="grid divide-y divide-slate-100 sm:grid-cols-2 sm:divide-x sm:divide-y-0 xl:grid-cols-4">
          <div className="p-5"><p className="text-xs font-bold uppercase tracking-wide text-[#0757a5]">Amigo do ACS · {periodoVisitas}</p><p className="mt-2 text-2xl font-bold text-slate-800">{visitasNoPeriodo}</p><p className="mt-1 text-xs text-slate-500">visita(s) salva(s) no período selecionado</p></div>
          <div className="p-5"><p className="text-xs font-bold uppercase tracking-wide text-[#0757a5]">Amigo do ACS · total do mês</p><p className="mt-2 text-2xl font-bold text-slate-800">{dados.visitasNoMes}</p><p className="mt-1 text-xs text-slate-500">visita(s) salva(s) no mês atual</p></div>
          <div className="p-5"><p className="text-xs font-bold uppercase tracking-wide text-emerald-700">PEC · até 30 dias</p><p className="mt-2 text-2xl font-bold text-emerald-800">{dados.pecVisitaRecente}</p><p className="mt-1 text-xs text-slate-500">cadastro(s) com recência de visita em dia no CSV</p></div>
          <div className="p-5"><p className="text-xs font-bold uppercase tracking-wide text-amber-700">PEC · busca ativa</p><p className="mt-2 text-2xl font-bold text-amber-800">{dados.pecVisitaAtrasada}</p><p className="mt-1 text-xs text-slate-500">cadastro(s) com visita atrasada pela regra local</p></div>
        </div>
        <p className="border-t border-slate-100 px-5 py-3 text-[11px] leading-relaxed text-slate-500">Os números do Amigo do ACS vêm das visitas registradas neste dispositivo. O PEC informa dias ou meses desde a última visita, e não substitui o histórico detalhado de visitas locais.</p>
      </section>

      <div className="mt-7 grid gap-7 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-xl border border-slate-200 bg-white shadow-[0_3px_13px_rgba(25,54,95,0.04)]">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4"><div><h2 className="font-bold text-[#172b4d]">Indicadores de acompanhamento</h2><p className="mt-0.5 text-xs text-slate-500">Referências operacionais locais, não apuração oficial.</p></div><button onClick={() => navegar("/ajustes")} className="text-xs font-bold text-[#0757a5] hover:underline">Ajustar regras</button></div>
          <div className="divide-y divide-slate-100">
            {dados.indicadores.map((item) => { const filtros: Record<string, string> = { gestacao: "gestantes", diabetes: "diabetes", hipertensao: "hipertensao", mulher: "mulheres", crianca: "criancas", idoso: "idosos", bucal: "bucal" }; return <button key={item.id} onClick={() => navegar(`/cidadaos?filtro=${filtros[item.id] ?? "todos"}`)} className="flex w-full items-center gap-4 px-5 py-4 text-left transition hover:bg-slate-50"><div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-3"><p className="truncate text-sm font-semibold text-slate-700">{item.nome}</p><span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ${situacaoEstilo[item.situacao]}`}>{item.percentual === null ? "sem base" : `${item.percentual}%`}</span></div><p className="mt-1 truncate text-xs text-slate-500">{item.descricao} Meta local: ≥ {item.meta}%.</p><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-[#0e70bd]" style={{ width: `${item.percentual ?? 0}%` }} /></div></div><span className="text-sm font-bold text-slate-700">{item.numerador}<span className="font-normal text-slate-400">/{item.denominador}</span></span></button> })}
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white shadow-[0_3px_13px_rgba(25,54,95,0.04)]">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4"><div><h2 className="font-bold text-[#172b4d]">Prioridades para visita</h2><p className="mt-0.5 text-xs text-slate-500">Ordenadas pelas regras locais configuradas.</p></div><button onClick={() => navegar("/cidadaos")} className="text-xs font-bold text-[#0757a5] hover:underline">Ver lista</button></div>
          <div className="divide-y divide-slate-100">
            {dados.prioridades.slice(0, 5).map((prioridade) => { const corPrioridade = prioridade.nivel === "alta" ? "bg-red-500" : prioridade.nivel === "media" ? "bg-amber-500" : "bg-blue-500"; const descricaoPrioridade = prioridade.nivel === "alta" ? "Prioridade alta" : prioridade.nivel === "media" ? "Prioridade intermediária" : "Prioridade de acompanhamento"; return <button key={prioridade.id} onClick={() => navegar(`/cidadaos?cidadao=${prioridade.cidadaoId}`)} className="flex w-full items-start gap-3 px-5 py-4 text-left transition hover:bg-slate-50"><span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${prioridade.nivel === "alta" ? "bg-red-500" : prioridade.nivel === "media" ? "bg-amber-500" : "bg-blue-500"}`} /><span className="min-w-0 flex-1"><span className="flex flex-wrap items-center gap-1.5"><span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">{prioridade.categoria}</span><span className={`h-2.5 w-2.5 rounded-full ${corPrioridade}`} title={descricaoPrioridade}><span className="sr-only">{descricaoPrioridade}</span></span></span><span className="mt-1 block truncate text-sm font-semibold text-slate-700">{prioridade.titulo}</span><span className="mt-1 block text-xs leading-relaxed text-slate-500">{prioridade.detalhe}</span></span></button> })}
            {!dados.prioridades.length && <div className="px-5 py-12 text-center text-sm text-slate-500">Nenhuma prioridade identificada com as regras atuais.</div>}
          </div>
        </section>
      </div>
    </section>
  );
}
