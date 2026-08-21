import "fake-indexeddb/auto";
import { beforeEach, describe, expect, it } from "vitest";
import { db } from "./acs-db";
import { concluirTarefaAtualizacaoPec, criarTarefaAtualizacaoPec } from "./routine";

describe("tarefas de atualização no PEC", () => {
  beforeEach(async () => { await db.tarefasPec.clear(); });
  it("cria uma tarefa com motivo e permite concluí-la", async () => {
    const tarefa = await criarTarefaAtualizacaoPec("cidadao-1", "Atualizar telefone e endereço após a visita");
    expect(tarefa).toMatchObject({ cidadaoId: "cidadao-1", concluida: false });
    await concluirTarefaAtualizacaoPec(tarefa!.id);
    expect((await db.tarefasPec.get(tarefa!.id))?.concluida).toBe(true);
  });
});
