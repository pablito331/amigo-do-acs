import { useLiveQuery } from "dexie-react-hooks";
import { AlertTriangle, Download, FileUp, HardDriveDownload, ShieldCheck } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { db } from "@/lib/acs-db";
import { exportarBackupLocal, restaurarBackupLocal } from "@/lib/backup";

export default function Backup() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [restaurando, setRestaurando] = useState(false);
  const [senha, setSenha] = useState("");
  const resumo = useLiveQuery(async () => ({ cidadaos: await db.cidadaos.count(), visitas: await db.visitas.count(), importacoes: await db.importacoes.count() }), []) ?? { cidadaos: 0, visitas: 0, importacoes: 0 };

  const restaurar = async (arquivo: File | undefined) => {
    if (!arquivo) return;
    if (!window.confirm("A restauração substituirá os dados atuais deste navegador. Confirma que deseja continuar?")) return;
    setRestaurando(true);
    try {
      await restaurarBackupLocal(arquivo, senha || undefined);
      toast.success("Backup restaurado neste dispositivo.");
    } catch (erro) {
      toast.error(erro instanceof Error ? erro.message : "Não foi possível restaurar o backup.");
    } finally {
      setRestaurando(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return <section className="mx-auto max-w-[1040px] pb-16 lg:pb-0"><div className="mb-7"><p className="text-xs font-bold uppercase tracking-[0.12em] text-[#0757a5]">Proteção local</p><h1 className="mt-1 text-3xl font-bold tracking-tight text-[#172b4d]">Backup e restauração</h1><p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600">Os dados do Amigo do ACS ficam neste navegador. Crie cópias periódicas e guarde-as em local seguro, especialmente antes de trocar de aparelho ou limpar o navegador.</p></div>
    <div className="grid gap-5 sm:grid-cols-3"><article className="rounded-xl border border-slate-200 bg-white p-5"><p className="text-xs font-bold uppercase tracking-[0.1em] text-slate-500">Cidadãos</p><p className="mt-2 text-3xl font-bold text-[#172b4d]">{resumo.cidadaos}</p></article><article className="rounded-xl border border-slate-200 bg-white p-5"><p className="text-xs font-bold uppercase tracking-[0.1em] text-slate-500">Visitas</p><p className="mt-2 text-3xl font-bold text-[#172b4d]">{resumo.visitas}</p></article><article className="rounded-xl border border-slate-200 bg-white p-5"><p className="text-xs font-bold uppercase tracking-[0.1em] text-slate-500">Importações</p><p className="mt-2 text-3xl font-bold text-[#172b4d]">{resumo.importacoes}</p></article></div>
    <div className="mt-7 grid gap-7 md:grid-cols-2"><article className="rounded-xl border border-[#cde1f8] bg-[linear-gradient(145deg,#f4f9ff,#ffffff)] p-6 shadow-[0_3px_13px_rgba(25,54,95,0.04)]"><span className="grid h-12 w-12 place-items-center rounded-xl bg-[#dceeff] text-[#0757a5]"><HardDriveDownload className="h-6 w-6" /></span><h2 className="mt-5 text-xl font-bold text-[#173d6d]">Criar backup</h2><p className="mt-2 text-sm leading-relaxed text-slate-600">Use uma senha para proteger a cópia da base de cidadãos, visitas, importações e ajustes deste dispositivo.</p><input value={senha} onChange={(event) => setSenha(event.target.value)} type="password" className="mt-4 h-11 w-full rounded-lg border border-[#aac5e6] bg-white px-3 text-sm outline-none focus:border-[#0757a5] focus:ring-2 focus:ring-blue-100" placeholder="Senha para backup protegido" /><button onClick={() => void exportarBackupLocal(senha || undefined)} className="mt-3 inline-flex items-center gap-2 rounded-lg bg-[#0757a5] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#064987] active:scale-[0.98]"><Download className="h-4 w-4" /> {senha ? "Baixar backup protegido" : "Baixar backup local"}</button></article>
      <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-[0_3px_13px_rgba(25,54,95,0.04)]"><span className="grid h-12 w-12 place-items-center rounded-xl bg-slate-100 text-slate-700"><FileUp className="h-6 w-6" /></span><h2 className="mt-5 text-xl font-bold text-[#172b4d]">Restaurar backup</h2><p className="mt-2 text-sm leading-relaxed text-slate-600">Recupere uma cópia criada anteriormente. Esta ação substitui a base local atual. Para arquivo protegido, informe a mesma senha ao lado.</p><input value={senha} onChange={(event) => setSenha(event.target.value)} type="password" className="mt-4 h-11 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-[#0757a5] focus:ring-2 focus:ring-blue-100" placeholder="Senha do backup, se houver" /><input ref={inputRef} type="file" accept="application/json,.json" className="hidden" onChange={(event) => void restaurar(event.target.files?.[0])} /><button disabled={restaurando} onClick={() => inputRef.current?.click()} className="mt-3 inline-flex items-center gap-2 rounded-lg border border-[#9ebadf] px-4 py-2.5 text-sm font-bold text-[#0757a5] transition hover:bg-blue-50 disabled:opacity-60"><FileUp className="h-4 w-4" /> {restaurando ? "Restaurando..." : "Selecionar arquivo"}</button></article></div>
    <div className="mt-7 rounded-xl border border-amber-200 bg-amber-50 p-5"><div className="flex gap-3"><AlertTriangle className="h-5 w-5 shrink-0 text-amber-700" /><div><p className="font-bold text-amber-900">Atenção à confidencialidade</p><p className="mt-1 text-sm leading-relaxed text-amber-800">O backup contém informações de saúde. Não o envie por aplicativos de mensagem ou e-mail sem a proteção e a autorização adequadas. Guarde-o conforme as orientações locais da sua equipe.</p></div></div></div>
    <div className="mt-5 flex items-center gap-2 text-xs text-slate-500"><ShieldCheck className="h-4 w-4 text-emerald-600" /> Nenhum dado desta versão é enviado automaticamente para um servidor.</div>
  </section>;
}
