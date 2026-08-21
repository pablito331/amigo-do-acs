import { useLiveQuery } from "dexie-react-hooks";
import { CheckCircle2, FileSpreadsheet, Info, Loader2, UploadCloud } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { db } from "@/lib/acs-db";
import { importarArquivos, type ResultadoImportacao } from "@/lib/csv-import";
import { LISTAS_TEMATICAS } from "@/lib/domain";

export default function Importar() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [arquivos, setArquivos] = useState<File[]>([]);
  const [processando, setProcessando] = useState(false);
  const [resultados, setResultados] = useState<ResultadoImportacao[]>([]);
  const historico = useLiveQuery(() => db.importacoes.orderBy("importadaEm").reverse().toArray(), []) ?? [];

  const selecionar = (lista: FileList | null) => {
    const proximos = Array.from(lista ?? []).filter((item) => item.name.toLowerCase().endsWith(".csv"));
    setArquivos(proximos);
    setResultados([]);
  };

  const importar = async () => {
    if (!arquivos.length) return;
    setProcessando(true);
    try {
      const processados = await importarArquivos(arquivos);
      setResultados(processados);
      setArquivos([]);
      toast.success(`${processados.length} lista(s) importada(s) neste dispositivo.`);
    } catch (erro) {
      toast.error(erro instanceof Error ? erro.message : "Não foi possível importar os arquivos selecionados.");
    } finally {
      setProcessando(false);
    }
  };

  const listasRecentes = new Map(historico.map((item) => [item.listaTematica, item]));

  return <section className="mx-auto max-w-[1120px] pb-16 lg:pb-0"><div className="mb-7"><p className="text-xs font-bold uppercase tracking-[0.12em] text-[#0757a5]">Dados locais</p><h1 className="mt-1 text-3xl font-bold tracking-tight text-[#172b4d]">Importar listas do PEC</h1><p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600">Selecione os relatórios CSV exportados no Acompanhamento de Condições de Saúde. Cada importação atualiza somente os campos da respectiva lista temática e preserva o histórico de visitas registrado aqui.</p></div>
    <div className="grid gap-7 lg:grid-cols-[1fr_0.8fr]"><div className="rounded-xl border border-slate-200 bg-white p-5 shadow-[0_3px_13px_rgba(25,54,95,0.04)] sm:p-7"><button onClick={() => inputRef.current?.click()} className="flex min-h-[230px] w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#aac5e6] bg-[#f7fbff] px-6 text-center transition hover:border-[#0757a5] hover:bg-[#f0f7ff]"><span className="grid h-14 w-14 place-items-center rounded-2xl bg-[#dceeff] text-[#0757a5]"><UploadCloud className="h-7 w-7" /></span><span className="mt-4 text-base font-bold text-[#16447b]">Selecione os arquivos CSV</span><span className="mt-1 text-sm text-slate-500">Você pode selecionar vários relatórios temáticos de uma vez.</span></button><input ref={inputRef} type="file" accept=".csv,text/csv" multiple className="hidden" onChange={(event) => selecionar(event.target.files)} />
        {arquivos.length > 0 && <div className="mt-5 rounded-lg border border-slate-200"><div className="flex items-center justify-between border-b border-slate-100 px-4 py-3"><span className="text-sm font-bold text-slate-700">Arquivos selecionados</span><button onClick={() => setArquivos([])} className="text-xs font-bold text-[#0757a5]">Limpar</button></div><div className="divide-y divide-slate-100">{arquivos.map((arquivo) => <div key={`${arquivo.name}-${arquivo.size}`} className="flex items-center gap-3 px-4 py-3"><FileSpreadsheet className="h-5 w-5 text-emerald-600" /><span className="min-w-0 flex-1 truncate text-sm text-slate-600">{arquivo.name}</span><span className="text-xs text-slate-400">{Math.round(arquivo.size / 1024)} KB</span></div>)}</div><div className="p-4"><button disabled={processando} onClick={importar} className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#0757a5] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#064987] disabled:cursor-wait disabled:opacity-70">{processando ? <><Loader2 className="h-4 w-4 animate-spin" /> Consolidando listas...</> : "Importar e atualizar base local"}</button></div></div>}
        {resultados.length > 0 && <div className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 p-4"><div className="flex gap-2 text-emerald-800"><CheckCircle2 className="h-5 w-5 shrink-0" /><div><p className="font-bold">Importação concluída</p><div className="mt-2 space-y-1 text-sm">{resultados.map((item) => <p key={item.arquivo}><strong>{item.listaTematica}:</strong> {item.novos} novo(s), {item.atualizados} atualizado(s) e {item.ignorados} ignorado(s).</p>)}</div></div></div></div>}
      </div><aside className="rounded-xl border border-[#d7e5f5] bg-[#f8fbff] p-5"><div className="flex gap-3"><Info className="h-5 w-5 shrink-0 text-[#0757a5]" /><div><h2 className="font-bold text-[#173d6d]">Como a atualização funciona</h2><p className="mt-2 text-sm leading-relaxed text-slate-600">O sistema identifica a lista e a microárea no próprio cabeçalho do CSV. Os cidadãos são combinados por CPF, CNS ou nome com data de nascimento.</p></div></div><div className="mt-5 space-y-3">{LISTAS_TEMATICAS.map((lista) => { const ultimo = listasRecentes.get(lista); return <div key={lista} className="flex items-center gap-3 rounded-lg border border-white bg-white px-3 py-2.5"><span className={`h-2.5 w-2.5 rounded-full ${ultimo ? "bg-emerald-500" : "bg-slate-300"}`} /><div className="min-w-0"><p className="text-sm font-semibold text-slate-700">{lista}</p><p className="truncate text-xs text-slate-500">{ultimo ? `Importada em ${new Date(ultimo.importadaEm).toLocaleDateString("pt-BR")}` : "Ainda não importada"}</p></div></div> })}</div></aside></div>
    {historico.length > 0 && <div className="mt-7 rounded-xl border border-slate-200 bg-white"><div className="border-b border-slate-100 px-5 py-4"><h2 className="font-bold text-[#172b4d]">Histórico de importações</h2></div><div className="divide-y divide-slate-100">{historico.slice(0, 8).map((item) => <div key={item.id} className="grid gap-1 px-5 py-3 text-sm sm:grid-cols-[1fr_auto_auto]"><span className="font-semibold text-slate-700">{item.listaTematica}</span><span className="text-slate-500">{item.novos + item.atualizados} registro(s) processado(s)</span><span className="text-slate-400">{new Date(item.importadaEm).toLocaleString("pt-BR")}</span></div>)}</div></div>}
  </section>;
}
