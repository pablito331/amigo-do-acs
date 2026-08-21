import { db, registrarVisita } from "./acs-db";
import { gerarPrioridades } from "./priority";
import type { Cidadao, ItemRotinaVisita, RegrasPrioridade, RotinaVisitas } from "./domain";
import { mesmaMicroarea } from "./microarea";

function hojeLocal() {
  const data = new Date();
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

function candidatosOrdenados(cidadaos: Cidadao[], regras: RegrasPrioridade, microarea: string | null, usados: Set<string>) {
  const filtrados = cidadaos.filter((item) => mesmaMicroarea(item.microarea, microarea) && !usados.has(item.id));
  const prioridades = gerarPrioridades(filtrados, regras);
  const porId = new Map(filtrados.map((item) => [item.id, item]));
  const priorizados = prioridades.map((item) => ({ cidadao: porId.get(item.cidadaoId), motivo: item.categoria })).filter((item): item is { cidadao: Cidadao; motivo: string } => Boolean(item.cidadao));
  const idsPriorizados = new Set(priorizados.map((item) => item.cidadao.id));
  const complementares = filtrados.filter((item) => !idsPriorizados.has(item.id)).sort((a, b) => a.nome.localeCompare(b.nome)).map((cidadao) => ({ cidadao, motivo: "Acompanhamento programado" }));
  return [...priorizados, ...complementares];
}

export async function criarRotina(meta: number, cidadaos: Cidadao[], regras: RegrasPrioridade, microarea: string | null) {
  const data = hojeLocal();
  const existente = (await db.rotinas.where("data").equals(data).toArray()).find((item) => mesmaMicroarea(item.microarea, microarea));
  if (existente) return existente;
  const rotina: RotinaVisitas = { id: crypto.randomUUID(), data, microarea, meta, criadaEm: Date.now() };
  const selecionados = candidatosOrdenados(cidadaos, regras, microarea, new Set()).slice(0, meta);
  const itens: ItemRotinaVisita[] = selecionados.map((item, indice) => ({ id: crypto.randomUUID(), rotinaId: rotina.id, cidadaoId: item.cidadao.id, ordem: indice + 1, status: "pendente", motivo: item.motivo, visitaId: null, substituiItemId: null, atualizadoEm: Date.now() }));
  await db.transaction("rw", db.rotinas, db.itensRotina, async () => { await db.rotinas.add(rotina); await db.itensRotina.bulkAdd(itens); });
  return rotina;
}

export async function concluirItemRotina(item: ItemRotinaVisita, observacoes: string | null = null) {
  const visitaId = await registrarVisita({ cidadaoId: item.cidadaoId, data: hojeLocal(), tipo: "Domiciliar", situacao: "concluida", observacoes: observacoes ?? "Visita concluída na rotina diária." });
  await db.itensRotina.update(item.id, { status: "concluida", visitaId, atualizadoEm: Date.now() });
}

export async function registrarAusenciaERepor(item: ItemRotinaVisita, rotina: RotinaVisitas, cidadaos: Cidadao[], regras: RegrasPrioridade, observacoes: string | null = null) {
  const visitaId = await registrarVisita({ cidadaoId: item.cidadaoId, data: hojeLocal(), tipo: "Busca ativa", situacao: "ausente", observacoes: observacoes ?? "Cidadão ausente na rotina diária." });
  await db.itensRotina.update(item.id, { status: "ausente", visitaId, atualizadoEm: Date.now() });

  const itens = await db.itensRotina.where("rotinaId").equals(rotina.id).toArray();
  const usados = new Set(itens.map((registro) => registro.cidadaoId));
  const proximo = candidatosOrdenados(cidadaos, regras, rotina.microarea, usados)[0];
  if (!proximo) return false;
  await db.itensRotina.add({ id: crypto.randomUUID(), rotinaId: rotina.id, cidadaoId: proximo.cidadao.id, ordem: Math.max(...itens.map((registro) => registro.ordem), 0) + 1, status: "pendente", motivo: proximo.motivo, visitaId: null, substituiItemId: item.id, atualizadoEm: Date.now() });
  return true;
}

export async function apagarRotinaDoDia(rotinaId: string) {
  await db.transaction("rw", db.rotinas, db.itensRotina, async () => { await db.itensRotina.where("rotinaId").equals(rotinaId).delete(); await db.rotinas.delete(rotinaId); });
}
