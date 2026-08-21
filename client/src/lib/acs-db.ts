import Dexie, { type Table } from "dexie";
import { CONFIGURACOES_PADRAO, type Cidadao, type ConfiguracoesLocais, type Importacao, type ItemRotinaVisita, type LembreteAgenda, type RotinaVisitas, type TarefaAtualizacaoPec, type Visita } from "./domain";

export class AmigoAcsDb extends Dexie {
  cidadaos!: Table<Cidadao, string>;
  visitas!: Table<Visita, string>;
  importacoes!: Table<Importacao, string>;
  configuracoes!: Table<ConfiguracoesLocais, string>;
  rotinas!: Table<RotinaVisitas, string>;
  itensRotina!: Table<ItemRotinaVisita, string>;
  lembretes!: Table<LembreteAgenda, string>;
  tarefasPec!: Table<TarefaAtualizacaoPec, string>;

  constructor() {
    super("amigo-do-acs");
    this.version(1).stores({
      cidadaos: "id,&chave,nome,cpf,cns,microarea,*fontes,atualizadoEm",
      visitas: "id,cidadaoId,data,criadaEm",
      importacoes: "id,listaTematica,microarea,importadaEm",
      configuracoes: "chave",
    });
    this.version(2).stores({
      cidadaos: "id,&chave,nome,cpf,cns,microarea,*fontes,atualizadoEm",
      visitas: "id,cidadaoId,data,criadaEm",
      importacoes: "id,listaTematica,microarea,importadaEm",
      configuracoes: "chave",
      rotinas: "id,data,microarea,criadaEm",
      itensRotina: "id,rotinaId,cidadaoId,status,ordem",
    });
    this.version(3).stores({
      cidadaos: "id,&chave,nome,cpf,cns,microarea,*fontes,atualizadoEm",
      visitas: "id,cidadaoId,data,criadaEm",
      importacoes: "id,listaTematica,microarea,importadaEm",
      configuracoes: "chave",
      rotinas: "id,data,microarea,criadaEm",
      itensRotina: "id,rotinaId,cidadaoId,status,ordem",
      lembretes: "id,data,microarea,concluido,criadoEm",
    });
    this.version(4).stores({
      cidadaos: "id,&chave,nome,cpf,cns,microarea,*fontes,atualizadoEm",
      visitas: "id,cidadaoId,data,criadaEm",
      importacoes: "id,listaTematica,microarea,importadaEm",
      configuracoes: "chave",
      rotinas: "id,data,microarea,criadaEm",
      itensRotina: "id,rotinaId,cidadaoId,status,ordem",
      lembretes: "id,data,microarea,concluido,criadoEm",
      tarefasPec: "id,cidadaoId,concluida,criadaEm",
    });
  }
}

export const db = new AmigoAcsDb();

export async function obterConfiguracoes(): Promise<ConfiguracoesLocais> {
  const existentes = await db.configuracoes.get("configuracoes");
  if (existentes) return existentes;
  const iniciais = { ...CONFIGURACOES_PADRAO, atualizadoEm: Date.now() };
  await db.configuracoes.put(iniciais);
  return iniciais;
}

export async function salvarConfiguracoes(dados: Omit<ConfiguracoesLocais, "chave" | "atualizadoEm">) {
  await db.configuracoes.put({ chave: "configuracoes", ...dados, microareaAtiva: dados.microareaAtiva?.trim() || null, atualizadoEm: Date.now() });
}

export async function registrarVisita(visita: Omit<Visita, "id" | "criadaEm">) {
  const id = crypto.randomUUID();
  await db.visitas.add({ ...visita, id, criadaEm: Date.now() });
  return id;
}
