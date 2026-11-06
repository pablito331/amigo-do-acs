import "fake-indexeddb/auto";
import { describe, expect, it } from "vitest";
import { db, registrarVisita } from "./acs-db";
import { alturaEmCentimetros, chaveImportacaoCidadao, importarArquivo, normalizarIdentificador, normalizarTextoCsv, numeroCsv } from "./csv-import";
import { encontrarPossiveisDuplicidades } from "./duplicates";

function arquivoCsvPec(texto: string, nome: string): File {
  return new File([new Uint8Array(Array.from(texto, (caractere) => caractere.charCodeAt(0)))], nome, { type: "text/csv" });
}

describe("normalização dos CSVs do PEC", () => {
  it("converte hífen e valores vazios em null", () => {
    expect(normalizarTextoCsv("-")).toBeNull();
    expect(normalizarTextoCsv("  ")).toBeNull();
    expect(normalizarTextoCsv("  Maria  ")).toBe("Maria");
  });

  it("remove caracteres de CPF e CNS antes de formar a chave", () => {
    expect(normalizarIdentificador("123.456.789-00")).toBe("12345678900");
    expect(chaveImportacaoCidadao({ CPF: "123.456.789-00", CNS: "999", Nome: "Maria", "Data de nascimento": "01/01/1990" })).toBe("cpf:12345678900");
  });

  it("usa nome e data de nascimento quando CPF e CNS estão ausentes", () => {
    expect(chaveImportacaoCidadao({ CPF: "-", CNS: "-", Nome: "  Ana Júlia ", "Data de nascimento": "02/03/2010" })).toBe("nome:ana julia|02/03/2010");
  });

  it("normaliza peso e converte altura informada em metros ou centímetros", () => {
    expect(numeroCsv("12,4 kg")).toBe(12.4);
    expect(alturaEmCentimetros("1,08 m")).toBe(108);
    expect(alturaEmCentimetros("108 cm")).toBe(108);
  });

  it("preserva visitas locais quando uma nova importação atualiza o mesmo cidadão", async () => {
    await Promise.all([db.cidadaos.clear(), db.visitas.clear(), db.importacoes.clear()]);
    const cabecalho = "Nome;Data de nascimento;CPF;CNS;Microárea;Rua;Número;Bairro;Última medição de peso;Última medição de altura;Data da última medição de peso e altura";
    const primeiraCarga = `Lista temática;Geral\nMicroárea(s);06\n${cabecalho}\nAna da Silva;01/01/2018;123.456.789-00;-;06;Rua das Flores;10;Centro;18,2;108;20/08/2026`;
    await importarArquivo(arquivoCsvPec(primeiraCarga, "geral.csv"));
    const ana = await db.cidadaos.where("cpf").equals("12345678900").first();
    expect(ana).toBeDefined();
    await registrarVisita({ cidadaoId: ana!.id, data: "2026-08-21", tipo: "Domiciliar", situacao: "concluida", observacoes: "Visita local" });

    const segundaCarga = `Lista temática;Geral\nMicroárea(s);06\n${cabecalho}\nAna da Silva;01/01/2018;123.456.789-00;-;06;Rua das Flores;10;Centro;19,1;109;21/08/2026`;
    await importarArquivo(arquivoCsvPec(segundaCarga, "geral-atualizado.csv"));

    const atualizada = await db.cidadaos.where("cpf").equals("12345678900").first();
    expect(atualizada?.pesoKg).toBe(19.1);
    expect(await db.visitas.where("cidadaoId").equals(ana!.id).count()).toBe(1);
  });

  it("consolida consultas de puericultura até 24 meses apenas pela lista de desenvolvimento infantil", async () => {
    await Promise.all([db.cidadaos.clear(), db.importacoes.clear()]);
    const cabecalho = "Nome;Data de nascimento;CPF;CNS;Microárea;Rua;Número;Bairro;Data da primeira consulta;Quantidade de consultas até 24 meses;Quantidade de medições de peso/altura simultâneas até 24 meses";
    const carga = `Lista temática;Desenvolvimento infantil\nMicroárea(s);06\n${cabecalho}\nJoão da Silva;01/09/2025;123.456.789-00;-;06;Rua A;1;Centro;15/10/2025;8;7`;

    await importarArquivo(arquivoCsvPec(carga, "desenvolvimento-infantil.csv"));

    const joao = await db.cidadaos.where("cpf").equals("12345678900").first();
    expect(joao).toMatchObject({
      isCrianca: true,
      dataPrimeiraConsultaInfantil: "15/10/2025",
      qtdConsultasAte24Meses: 8,
      qtdMedicoesPesoAlturaAte24Meses: 7,
    });
  });

  it("importa e exibe a DUM do relatório de gestação", async () => {
    await Promise.all([db.cidadaos.clear(), db.importacoes.clear()]);
    const cabecalho = "Nome;Data de nascimento;CPF;CNS;Microárea;DUM;IG (DUM) (semanas);Quantidade de atendimentos no pré-natal";
    const carga = `Lista temática;Gestação e puerpério\nMicroárea(s);06\n${cabecalho}\nMaria da Silva;01/01/1995;123.456.789-00;-;06;01/09/2026;9 semanas e 3 dias;1`;

    await importarArquivo(arquivoCsvPec(carga, "gestacao.csv"));

    const maria = await db.cidadaos.where("cpf").equals("12345678900").first();
    expect(maria).toMatchObject({ isGestante: true, dataDum: "01/09/2026", igSemanas: "9 semanas e 3 dias", qtdConsultasPreNatal: 1 });
  });

  it("sinaliza no rastreador dois registros PEC com mesmo nome e nascimento, mesmo com CPF diferente", async () => {
    await Promise.all([db.cidadaos.clear(), db.importacoes.clear()]);
    const cabecalho = "Nome;Data de nascimento;CPF;CNS;Microárea;Rua;Número;Bairro";
    const carga = `Lista temática;Geral\nMicroárea(s);06\n${cabecalho}\nMARIA DA SILVA;1/2/2013;111.111.111-11;-;06;Rua A;1;Centro\nMaria da Silva;01/02/2013;222.222.222-22;-;06;Rua B;2;Centro`;
    await importarArquivo(arquivoCsvPec(carga, "geral-com-duplicidade.csv"));
    const grupos = encontrarPossiveisDuplicidades(await db.cidadaos.toArray());
    expect(grupos).toHaveLength(1);
    expect(grupos[0]?.criterio).toBe("Nome e nascimento");
    expect(grupos[0]?.cidadaos).toHaveLength(2);
  });
});
