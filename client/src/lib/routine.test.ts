import "fake-indexeddb/auto";
import { beforeEach, describe, expect, it } from "vitest";
import { db } from "./acs-db";
import { CONFIGURACOES_PADRAO, type Cidadao } from "./domain";
import { adicionarCidadaoNaAgenda, adicionarLembrete, alternarLembrete, apagarLembrete, concluirItemRotina, criarRotina, iniciarAtendimento, salvarAnotacoesAtendimento } from "./routine";

const cidadao = (id: string): Cidadao => ({
  id, chave: id, nome: "Pessoa da Agenda", dataNascimento: "01/01/1980", idadeStr: "46", sexo: "Masculino", cpf: null, cns: null, microarea: "06", telefone: null, endereco: "Rua da Agenda", diasUltimoAtendimentoMedico: null, mesesUltimoAtendimentoMedico: null, diasUltimoAtendimentoEnfermagem: null, mesesUltimoAtendimentoEnfermagem: null, diasUltimoAtendimentoOdontologico: null, mesesUltimoAtendimentoOdontologico: null, mesesUltimaVisitaDomiciliar: 3, diasUltimaVisitaDomiciliar: 0, pesoKg: null, alturaCm: null, dataUltimaMedicaoPesoAltura: null, beneficiarioBolsaFamilia: null, vigenciaBolsaFamilia: null, registrosPesoAltura12Meses: null, ultimaMedicaoPressao: null, dataUltimaMedicaoPressao: null, isMulher: false, examePreventivoUltimaAvaliacao: null, isGestante: false, igSemanas: null, qtdConsultasPreNatal: null, isHipertenso: false, isDiabetico: false, dataUltimaHemoglobinaGlicada: null, dataUltimaConsultaHipertensao: null, dataUltimaConsultaDiabetes: null, isIdoso: false, isCrianca: false, isSaudeBucal: false, fontes: ["Geral"], atualizadoEm: 0,
});

describe("agenda local de visitas", () => {
  beforeEach(async () => { await Promise.all([db.cidadaos.clear(), db.visitas.clear(), db.rotinas.clear(), db.itensRotina.clear(), db.lembretes.clear()]); });

  it("abre a visita, preserva anotações e só então registra a conclusão na data agendada", async () => {
    const pessoa = cidadao("pessoa");
    await db.cidadaos.add(pessoa);
    const rotina = await criarRotina(1, [pessoa], CONFIGURACOES_PADRAO.regras, "06", "2026-08-25");
    const item = (await db.itensRotina.where("rotinaId").equals(rotina.id).first())!;
    await iniciarAtendimento(item);
    const emAtendimento = (await db.itensRotina.get(item.id))!;
    expect(emAtendimento.status).toBe("em_atendimento");
    await salvarAnotacoesAtendimento(emAtendimento, "Família orientada sobre retorno.");
    const anotado = (await db.itensRotina.get(item.id))!;
    await concluirItemRotina(anotado, "2026-08-25");
    expect((await db.itensRotina.get(item.id))?.status).toBe("concluida");
    const visita = await db.visitas.where("cidadaoId").equals("pessoa").first();
    expect(visita).toMatchObject({ data: "2026-08-25", situacao: "concluida", observacoes: "Família orientada sobre retorno." });
  });

  it("cria, conclui e remove lembretes na data selecionada", async () => {
    const lembrete = await adicionarLembrete("2026-08-25", "06", "Levar formulário atualizado");
    expect(lembrete?.texto).toBe("Levar formulário atualizado");
    await alternarLembrete(lembrete!.id, true);
    expect((await db.lembretes.get(lembrete!.id))?.concluido).toBe(true);
    await apagarLembrete(lembrete!.id);
    expect(await db.lembretes.get(lembrete!.id)).toBeUndefined();
  });

  it("cria a agenda apenas com os cidadãos selecionados manualmente", async () => {
    const primeiro = cidadao("primeiro");
    const segundo = { ...cidadao("segundo"), nome: "Segunda pessoa" };
    await db.cidadaos.bulkAdd([primeiro, segundo]);
    const rotina = await criarRotina(2, [primeiro, segundo], CONFIGURACOES_PADRAO.regras, "06", "2026-08-26", ["segundo"]);
    const itens = await db.itensRotina.where("rotinaId").equals(rotina.id).toArray();
    expect(itens).toHaveLength(1);
    expect(itens[0]?.cidadaoId).toBe("segundo");
  });

  it("inclui um cidadão na data escolhida e não o repete quando a inclusão é refeita", async () => {
    const pessoa = cidadao("manual");
    await db.cidadaos.add(pessoa);
    const primeira = await adicionarCidadaoNaAgenda(pessoa.id, 10, [pessoa], CONFIGURACOES_PADRAO.regras, "06", "2026-08-28");
    const segunda = await adicionarCidadaoNaAgenda(pessoa.id, 10, [pessoa], CONFIGURACOES_PADRAO.regras, "06", "2026-08-28");
    const itens = await db.itensRotina.where("rotinaId").equals(primeira.rotina.id).toArray();

    expect(primeira.adicionada).toBe(true);
    expect(segunda.adicionada).toBe(false);
    expect(itens).toHaveLength(1);
    expect(itens[0]).toMatchObject({ cidadaoId: pessoa.id, motivo: "Visita domiciliar" });
  });

  it("consolida múltiplas condições do mesmo cidadão em uma única visita", async () => {
    const multipla = { ...cidadao("multipla"), isHipertenso: true, isDiabetico: true, mesesUltimaVisitaDomiciliar: 4 };
    await db.cidadaos.add(multipla);
    const rotina = await criarRotina(5, [multipla], CONFIGURACOES_PADRAO.regras, "06", "2026-08-27");
    const itens = await db.itensRotina.where("rotinaId").equals(rotina.id).toArray();
    expect(itens).toHaveLength(1);
    expect(itens[0]?.motivo).toContain("Hipertensão");
    expect(itens[0]?.motivo).toContain("Diabetes");
  });
});
