import {
  ArchiveRestore,
  BarChart3,
  CalendarDays,
  ChevronRight,
  CloudOff,
  FileUp,
  Filter,
  HeartPulse,
  Settings2,
  UsersRound,
} from "lucide-react";
import { useLiveQuery } from "dexie-react-hooks";
import { type ReactNode, useEffect, useMemo } from "react";
import { useLocation } from "wouter";
import { db, obterConfiguracoes, salvarConfiguracoes } from "@/lib/acs-db";
import type { Cidadao } from "@/lib/domain";

const navegacao = [
  { caminho: "/", rotulo: "Painel", descricao: "Visão da microárea", icone: BarChart3 },
  { caminho: "/cidadaos", rotulo: "Cidadãos", descricao: "Cadastros e visitas", icone: UsersRound },
  { caminho: "/rotina", rotulo: "Rotina", descricao: "Visitas do dia", icone: CalendarDays },
  { caminho: "/importar", rotulo: "Importar listas", descricao: "CSV do PEC", icone: FileUp },
  { caminho: "/backup", rotulo: "Backup", descricao: "Proteção local", icone: ArchiveRestore },
  { caminho: "/ajustes", rotulo: "Ajustes", descricao: "Dispositivo e regras", icone: Settings2 },
];

function tituloDaRota(caminho: string) {
  return navegacao.find((item) => item.caminho === caminho)?.rotulo ?? "Amigo do ACS";
}

export default function AppShell({ children }: { children: ReactNode }) {
  const [localizacao, navegar] = useLocation();
  const titulo = tituloDaRota(localizacao);
  const configuracoes = useLiveQuery(() => db.configuracoes.get("configuracoes"), []);
  const cidadaos = (useLiveQuery(() => db.cidadaos.toArray(), []) ?? []) as Cidadao[];
  const microareas = useMemo<string[]>(() => Array.from(new Set<string>(cidadaos.map((item) => item.microarea).filter((item): item is string => typeof item === "string" && item.length > 0))).sort((a, b) => a.localeCompare(b, "pt-BR", { numeric: true })), [cidadaos]);

  useEffect(() => {
    void obterConfiguracoes();
  }, []);

  const alterarMicroarea = async (valor: string) => {
    const atual = configuracoes ?? await obterConfiguracoes();
    await salvarConfiguracoes({ nomeDispositivo: atual.nomeDispositivo, microareaAtiva: valor || null, regras: atual.regras });
  };

  return (
    <div className="min-h-screen bg-[#f4f6fa] text-[#1d2939]">
      <div className="h-1.5 bg-[#f28c28]" />
      <header className="bg-[#082b59] text-white">
        <div className="mx-auto flex h-9 max-w-[1600px] items-center justify-between px-4 text-[11px] font-semibold tracking-[0.08em] sm:px-6">
          <span className="opacity-90">AMIGO DO ACS</span>
          <div className="flex items-center gap-2 text-blue-100">
            <CloudOff className="h-3.5 w-3.5" />
            <span>DADOS ARMAZENADOS NESTE DISPOSITIVO</span>
          </div>
        </div>
        <div className="border-t border-white/10 bg-[#0757a5]">
          <div className="mx-auto flex h-[76px] max-w-[1600px] items-center justify-between px-4 sm:px-6">
            <button onClick={() => navegar("/")} className="flex items-center gap-3 text-left" aria-label="Ir para o painel">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-white/12 shadow-inner ring-1 ring-white/20">
                <HeartPulse className="h-6 w-6 text-white" strokeWidth={2.2} />
              </span>
              <span>
                <span className="block text-lg font-bold tracking-tight">Amigo do ACS</span>
                <span className="block text-xs text-blue-100">Apoio local para a Atenção Primária</span>
              </span>
            </button>
            <div className="hidden text-right text-xs text-blue-100 sm:block">
              <p className="font-semibold text-white">Modo local e offline</p>
              <p>Importe as listas do PEC neste dispositivo</p>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1600px]">
        <aside className="sticky top-0 hidden h-[calc(100vh-113px)] w-[250px] shrink-0 border-r border-[#d9e2ef] bg-white lg:block">
          <nav className="px-3 py-5" aria-label="Navegação principal">
            <p className="px-3 pb-3 text-[10px] font-bold uppercase tracking-[0.13em] text-slate-500">Área de trabalho</p>
            <div className="space-y-1">
              {navegacao.map((item) => {
                const ativo = localizacao === item.caminho;
                const Icone = item.icone;
                return (
                  <button
                    key={item.caminho}
                    onClick={() => navegar(item.caminho)}
                    className={`group relative flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition-colors ${ativo ? "bg-[#eaf3ff] text-[#0757a5]" : "text-slate-600 hover:bg-slate-50 hover:text-[#0757a5]"}`}
                  >
                    {ativo && <span className="absolute -left-3 h-8 w-1 rounded-r-full bg-[#f28c28]" />}
                    <Icone className="h-5 w-5 shrink-0" strokeWidth={ativo ? 2.25 : 1.8} />
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold">{item.rotulo}</span>
                      <span className="block text-xs text-slate-500">{item.descricao}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </nav>
          <div className="absolute inset-x-0 bottom-0 border-t border-slate-100 p-4">
            <div className="rounded-xl bg-[#f6f9fd] p-3">
              <p className="text-xs font-bold text-slate-700">Uso individual</p>
              <p className="mt-1 text-[11px] leading-relaxed text-slate-500">Faça backup regularmente para proteger os dados deste navegador.</p>
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <div className="border-b border-[#d9e2ef] bg-white">
            <div className="flex min-h-14 flex-wrap items-center justify-between gap-3 px-4 py-2 sm:px-7">
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium text-[#0757a5]">Início</span>
                <ChevronRight className="h-4 w-4 text-slate-400" />
                <span className="font-semibold text-slate-700">{titulo}</span>
              </div>
              <div className="flex flex-wrap items-center justify-end gap-3"><label className="flex items-center gap-2 rounded-lg border border-[#bdd2eb] bg-[#f7fbff] px-2.5 py-1.5 text-xs font-semibold text-[#0757a5]"><Filter className="h-3.5 w-3.5" /><span className="hidden sm:inline">Microárea mestre</span><select aria-label="Filtro mestre de microárea" value={configuracoes?.microareaAtiva ?? ""} onChange={(event) => void alterarMicroarea(event.target.value)} className="max-w-32 bg-transparent text-xs font-bold outline-none"><option value="">Todas</option>{microareas.map((microarea) => <option key={microarea} value={microarea}>Microárea {microarea}</option>)}</select></label><div className="flex items-center gap-2 text-xs font-medium text-emerald-700"><span className="h-2 w-2 rounded-full bg-emerald-500" />Pronto para trabalhar offline</div></div>
            </div>
          </div>
          <div className="px-4 py-6 sm:px-7 sm:py-8">{children}</div>
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-slate-200 bg-white/95 px-2 py-1.5 backdrop-blur lg:hidden" aria-label="Navegação móvel">
        {navegacao.map((item) => {
          const Icone = item.icone;
          const ativo = localizacao === item.caminho;
          return (
            <button key={item.caminho} onClick={() => navegar(item.caminho)} className={`flex min-w-0 flex-1 flex-col items-center gap-1 rounded-lg py-1.5 text-[10px] font-semibold ${ativo ? "text-[#0757a5]" : "text-slate-500"}`}>
              <Icone className="h-5 w-5" />
              <span className="truncate">{item.rotulo}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
