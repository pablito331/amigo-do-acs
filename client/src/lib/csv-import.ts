import Papa from "papaparse";
import { db } from "./acs-db";
import { LISTAS_TEMATICAS, type Cidadao, type Importacao, type ListaTematica } from "./domain";

type LinhaCsv = Record<string, string | undefined>;

export type ResultadoImportacao = Pick<Importacao, "listaTematica" | "microarea" | "totalLinhas" | "atualizados" | "novos" | "ignorados"> & {
  arquivo: string;
};

export function normalizarTextoCsv(valor: string | undefined): string | null {
  const limpo = valor?.replace(/^\uFEFF/, "").trim();
  return !limpo || limpo === "-" ? null : limpo;
}

export function numeroCsv(valor: string | undefined): number | null {
  const limpo = normalizarTextoCsv(valor);
  if (!limpo) return null;
  const normalizado = limpo.replace(/[^0-9,.-]/g, "").replace(",", ".");
  const resultado = Number(normalizado);
  return Number.isFinite(resultado) ? resultado : null;
}

export function alturaEmCentimetros(valor: string | undefined): number | null {
  const medida = numeroCsv(valor);
  if (medida === null || medida <= 0) return null;
  return medida <= 3 ? Math.round(medida * 100) : Math.round(medida);
}

export function normalizarIdentificador(valor: string | null): string | null {
  const digitos = valor?.replace(/\D/g, "") ?? "";
  return digitos.length ? digitos : null;
}

export function chaveImportacaoCidadao(linha: LinhaCsv): string | null {
  const cpf = normalizarIdentificador(normalizarTextoCsv(linha["CPF"]));
  if (cpf) return `cpf:${cpf}`;
  const cns = normalizarIdentificador(normalizarTextoCsv(linha["CNS"]));
  if (cns) return `cns:${cns}`;
  const nome = normalizarTextoCsv(linha["Nome"]);
  const nascimento = normalizarTextoCsv(linha["Data de nascimento"]);
  if (!nome || !nascimento) return null;
  return `nome:${nome.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/\s+/g, " ")}|${nascimento}`;
}

function endereco(linha: LinhaCsv): string | null {
  const partes = [linha["Rua"], linha["Número"], linha["Complemento"], linha["Bairro"]].map(normalizarTextoCsv).filter(Boolean);
  return partes.length ? partes.join(", ") : null;
}

function listaNoArquivo(texto: string): ListaTematica | null {
  const linha = texto.split(/\r?\n/).find((item) => item.startsWith("Lista temática;"));
  const valor = linha?.split(";").slice(1).join(";").trim() ?? "";
  return (LISTAS_TEMATICAS as readonly string[]).includes(valor) ? (valor as ListaTematica) : null;
}

function microareaNoArquivo(texto: string): string | null {
  const linha = texto.split(/\r?\n/).find((item) => item.startsWith("Microárea(s);"));
  return normalizarTextoCsv(linha?.split(";").slice(1).join(";"));
}

function dadosAposCabecalho(texto: string): string {
  const inicio = texto.search(/(^|\n)Nome;/);
  if (inicio < 0) throw new Error("Não foi localizado o cabeçalho 'Nome' no CSV. Exporte o relatório analítico do PEC/e-SUS.");
  return texto.slice(texto.indexOf("Nome;", inicio));
}

function valoresBase(linha: LinhaCsv): Partial<Cidadao> {
  return {
    nome: normalizarTextoCsv(linha["Nome"]) ?? "Cidadão sem nome",
    dataNascimento: normalizarTextoCsv(linha["Data de nascimento"]),
    idadeStr: normalizarTextoCsv(linha["Idade"]),
    sexo: normalizarTextoCsv(linha["Sexo"]),
    cpf: normalizarIdentificador(normalizarTextoCsv(linha["CPF"])),
    cns: normalizarIdentificador(normalizarTextoCsv(linha["CNS"])),
    microarea: normalizarTextoCsv(linha["Microárea"]),
    telefone: normalizarTextoCsv(linha["Telefone de contato"]) ?? normalizarTextoCsv(linha["Telefone celular"]) ?? normalizarTextoCsv(linha["Telefone residencial"]),
    endereco: endereco(linha),
    diasUltimoAtendimentoMedico: numeroCsv(linha["Dias desde o último atendimento médico"]),
    mesesUltimoAtendimentoMedico: numeroCsv(linha["Meses desde o último atendimento médico"]),
    diasUltimoAtendimentoEnfermagem: numeroCsv(linha["Dias desde o último atendimento de enfermagem"]),
    mesesUltimoAtendimentoEnfermagem: numeroCsv(linha["Meses desde o último atendimento de enfermagem"]),
    diasUltimoAtendimentoOdontologico: numeroCsv(linha["Dias desde o último atendimento odontológico"]),
    mesesUltimoAtendimentoOdontologico: numeroCsv(linha["Meses desde o último atendimento odontológico"]),
    mesesUltimaVisitaDomiciliar: numeroCsv(linha["Meses desde a última visita domiciliar"]),
    diasUltimaVisitaDomiciliar: numeroCsv(linha["Dias desde a última visita domiciliar"]),
    pesoKg: numeroCsv(linha["Última medição de peso"]),
    alturaCm: alturaEmCentimetros(linha["Última medição de altura"]),
    dataUltimaMedicaoPesoAltura: normalizarTextoCsv(linha["Data da última medição de peso e altura"]),
    beneficiarioBolsaFamilia: normalizarTextoCsv(linha["Beneficiário do programa Bolsa Família"]),
    vigenciaBolsaFamilia: normalizarTextoCsv(linha["Vigência do programa Bolsa Família"]),
    registrosPesoAltura12Meses: normalizarTextoCsv(linha["Registros de peso e altura simultâneos nos últimos 12 meses"]),
    ultimaMedicaoPressao: normalizarTextoCsv(linha["Última medição de pressão arterial"]),
    dataUltimaMedicaoPressao: normalizarTextoCsv(linha["Data da última medição de pressão arterial"]),
  };
}

function limparCamposDaLista(cidadao: Cidadao, lista: ListaTematica): Cidadao {
  const copia = { ...cidadao, fontes: cidadao.fontes.filter((fonte) => fonte !== lista) };
  if (lista === "Gestação e puerpério") Object.assign(copia, { isGestante: false, igSemanas: null, qtdConsultasPreNatal: null });
  if (lista === "Diabetes") Object.assign(copia, { isDiabetico: false, dataUltimaHemoglobinaGlicada: null, dataUltimaConsultaDiabetes: null });
  if (lista === "Hipertensão") Object.assign(copia, { isHipertenso: false, dataUltimaConsultaHipertensao: null });
  if (lista === "Saúde da mulher") Object.assign(copia, { isMulher: false, examePreventivoUltimaAvaliacao: null });
  if (lista === "Pessoa idosa") copia.isIdoso = false;
  if (lista === "Desenvolvimento infantil") copia.isCrianca = false;
  if (lista === "Saúde bucal") copia.isSaudeBucal = false;
  return copia;
}

function aplicarLista(base: Cidadao, linha: LinhaCsv, lista: ListaTematica): Cidadao {
  const fontes = Array.from(new Set([...base.fontes, lista])) as ListaTematica[];
  const proximo: Cidadao = { ...base, ...valoresBase(linha), fontes, atualizadoEm: Date.now() };
  if (lista === "Gestação e puerpério") {
    proximo.isGestante = true;
    proximo.igSemanas = normalizarTextoCsv(linha["IG (ecografia obstétrica) (semanas)"]) ?? normalizarTextoCsv(linha["IG (DUM) (semanas)"]);
    proximo.qtdConsultasPreNatal = numeroCsv(linha["Quantidade de atendimentos no pré-natal"]);
  }
  if (lista === "Diabetes") {
    proximo.isDiabetico = true;
    proximo.dataUltimaHemoglobinaGlicada = normalizarTextoCsv(linha["Data da última solicitação de hemoglobina glicada"]) ?? normalizarTextoCsv(linha["Data da última avaliação de hemoglobina glicada"]);
    proximo.dataUltimaConsultaDiabetes = normalizarTextoCsv(linha["Data da última consulta"]);
  }
  if (lista === "Hipertensão") {
    proximo.isHipertenso = true;
    proximo.dataUltimaConsultaHipertensao = normalizarTextoCsv(linha["Data da última consulta"]);
  }
  if (lista === "Saúde da mulher") {
    proximo.isMulher = true;
    proximo.examePreventivoUltimaAvaliacao = normalizarTextoCsv(linha["Exame de rastreamento de câncer de colo de útero data última avaliação"]) ?? normalizarTextoCsv(linha["Exame de rastreamento de câncer de colo de útero última avaliação"]);
  }
  if (lista === "Pessoa idosa") proximo.isIdoso = true;
  if (lista === "Desenvolvimento infantil") proximo.isCrianca = true;
  if (lista === "Saúde bucal") proximo.isSaudeBucal = true;
  return proximo;
}

function cidadaoNovo(chave: string): Cidadao {
  return {
    id: crypto.randomUUID(), chave, nome: "Cidadão sem nome", dataNascimento: null, idadeStr: null, sexo: null, cpf: null, cns: null, microarea: null, telefone: null, endereco: null,
    diasUltimoAtendimentoMedico: null, mesesUltimoAtendimentoMedico: null, diasUltimoAtendimentoEnfermagem: null, mesesUltimoAtendimentoEnfermagem: null, diasUltimoAtendimentoOdontologico: null, mesesUltimoAtendimentoOdontologico: null, mesesUltimaVisitaDomiciliar: null, diasUltimaVisitaDomiciliar: null, pesoKg: null, alturaCm: null, dataUltimaMedicaoPesoAltura: null, beneficiarioBolsaFamilia: null, vigenciaBolsaFamilia: null, registrosPesoAltura12Meses: null, ultimaMedicaoPressao: null, dataUltimaMedicaoPressao: null,
    isMulher: false, examePreventivoUltimaAvaliacao: null, isGestante: false, igSemanas: null, qtdConsultasPreNatal: null,
    isHipertenso: false, isDiabetico: false, dataUltimaHemoglobinaGlicada: null, dataUltimaConsultaHipertensao: null, dataUltimaConsultaDiabetes: null,
    isIdoso: false, isCrianca: false, isSaudeBucal: false, fontes: [], atualizadoEm: Date.now(),
  };
}

async function lerTextoCsv(arquivo: File): Promise<string> {
  const buffer = await arquivo.arrayBuffer();
  return new TextDecoder("iso-8859-1").decode(buffer).replace(/^\uFEFF/, "");
}

export async function importarArquivo(arquivo: File): Promise<ResultadoImportacao> {
  const texto = await lerTextoCsv(arquivo);
  const listaTematica = listaNoArquivo(texto);
  if (!listaTematica) throw new Error("A lista temática não foi identificada. Importe um CSV exportado do relatório Acompanhamento de Condições de Saúde do PEC.");
  const microarea = microareaNoArquivo(texto);
  const parseado = Papa.parse<LinhaCsv>(dadosAposCabecalho(texto), { header: true, delimiter: ";", skipEmptyLines: "greedy" });
  if (parseado.errors.length) throw new Error(`O arquivo possui um problema de leitura: ${parseado.errors[0]?.message ?? "erro desconhecido"}`);

  let novos = 0;
  let atualizados = 0;
  let ignorados = 0;
  const importados = new Set<string>();

  await db.transaction("rw", db.cidadaos, db.importacoes, async () => {
    const existentesDaLista = (await db.cidadaos.toArray()).filter((item) => item.fontes.includes(listaTematica));
    const porChave = new Map((await db.cidadaos.toArray()).map((item) => [item.chave, item]));

    for (const linha of parseado.data) {
      const chave = chaveImportacaoCidadao(linha);
      if (!chave) {
        ignorados += 1;
        continue;
      }
      importados.add(chave);
      const existente = porChave.get(chave);
      const consolidado = aplicarLista(existente ?? cidadaoNovo(chave), linha, listaTematica);
      if (existente) atualizados += 1;
      else novos += 1;
      porChave.set(chave, consolidado);
      await db.cidadaos.put(consolidado);
    }

    for (const cidadao of existentesDaLista) {
      if (!importados.has(cidadao.chave)) await db.cidadaos.put({ ...limparCamposDaLista(cidadao, listaTematica), atualizadoEm: Date.now() });
    }

    await db.importacoes.add({ id: crypto.randomUUID(), arquivo: arquivo.name, listaTematica, microarea, importadaEm: Date.now(), totalLinhas: parseado.data.length, atualizados, novos, ignorados });
  });

  return { arquivo: arquivo.name, listaTematica, microarea, totalLinhas: parseado.data.length, atualizados, novos, ignorados };
}

export async function importarArquivos(arquivos: File[]): Promise<ResultadoImportacao[]> {
  const resultados: ResultadoImportacao[] = [];
  for (const arquivo of arquivos) resultados.push(await importarArquivo(arquivo));
  return resultados;
}
