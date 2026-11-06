export const LISTAS_TEMATICAS = [
  "Geral",
  "Gestação e puerpério",
  "Pessoa idosa",
  "Desenvolvimento infantil",
  "Diabetes",
  "Hipertensão",
  "Saúde da mulher",
  "Saúde bucal",
] as const;

export type ListaTematica = (typeof LISTAS_TEMATICAS)[number];

export type TipoVisita = "Domiciliar" | "Busca ativa" | "Acompanhamento" | "Atualização cadastral";

export interface Cidadao {
  id: string;
  chave: string;
  nome: string;
  dataNascimento: string | null;
  idadeStr: string | null;
  sexo: string | null;
  racaCor?: string | null;
  cpf: string | null;
  cns: string | null;
  microarea: string | null;
  telefone: string | null;
  endereco: string | null;
  diasUltimoAtendimentoMedico: number | null;
  mesesUltimoAtendimentoMedico: number | null;
  diasUltimoAtendimentoEnfermagem: number | null;
  mesesUltimoAtendimentoEnfermagem: number | null;
  diasUltimoAtendimentoOdontologico: number | null;
  mesesUltimoAtendimentoOdontologico: number | null;
  mesesUltimaVisitaDomiciliar: number | null;
  diasUltimaVisitaDomiciliar: number | null;
  pesoKg: number | null;
  alturaCm: number | null;
  dataUltimaMedicaoPesoAltura: string | null;
  beneficiarioBolsaFamilia: string | null;
  vigenciaBolsaFamilia: string | null;
  registrosPesoAltura12Meses: string | null;
  ultimaMedicaoPressao: string | null;
  dataUltimaMedicaoPressao: string | null;
  isMulher: boolean;
  examePreventivoUltimaAvaliacao: string | null;
  isGestante: boolean;
  /** Data da última menstruação, informada no relatório de gestação do PEC. */
  dataDum?: string | null;
  igSemanas: string | null;
  qtdConsultasPreNatal: number | null;
  isHipertenso: boolean;
  isDiabetico: boolean;
  dataUltimaHemoglobinaGlicada: string | null;
  dataUltimaConsultaHipertensao: string | null;
  dataUltimaConsultaDiabetes: string | null;
  isIdoso: boolean;
  isCrianca: boolean;
  qtdConsultasAte24Meses: number | null;
  dataPrimeiraConsultaInfantil: string | null;
  qtdMedicoesPesoAlturaAte24Meses: number | null;
  isSaudeBucal: boolean;
  dppDum?: string | null;
  igEcografiaSemanas?: string | null;
  dppEcografia?: string | null;
  qtdConsultasAte12Semanas?: number | null;
  dataUltimaConsultaGestacao?: string | null;
  qtdConsultasOdontologicasGestacao?: number | null;
  vacinaDtpa?: string | null;
  qtdRegistrosAlturaUterina?: number | null;
  qtdRegistrosPressaoGestacao?: number | null;
  qtdRegistrosPesoAlturaGestacao?: number | null;
  examesGestacao?: Record<string, string | null>;
  qtdVisitasPrenatal?: number | null;
  qtdVisitasPuerperio?: number | null;
  qtdConsultasPuerperio?: number | null;
  dataUltimaConsultaPuerperio?: string | null;
  qtdConsultasDiabetes?: number | null;
  valorUltimaHemoglobinaGlicada?: string | null;
  avaliacaoPesDiabetes?: string | null;
  qtdVisitasDiabetes?: number | null;
  ultimasVisitasDiabetes?: string | null;
  qtdConsultasHipertensao?: number | null;
  qtdMedicoesPressaoHipertensao?: number | null;
  qtdVisitasHipertensao?: number | null;
  ultimasVisitasHipertensao?: string | null;
  dataUltimaConsultaSaudeMulher?: string | null;
  avaliacaoHiv?: string | null;
  avaliacaoSifilis?: string | null;
  avaliacaoHepatiteB?: string | null;
  avaliacaoHepatiteC?: string | null;
  dataUltimaSolicitacaoPreventivo?: string | null;
  detalhesUltimaAvaliacaoPreventivo?: string | null;
  rastreioCancerMama?: string | null;
  vacinaHpv?: string | null;
  idadePrimeiraConsultaInfantil?: string | null;
  vacinasInfantis?: string | null;
  ultimaSuplementacaoVitaminaA?: string | null;
  idadeUltimaSuplementacaoVitaminaA?: string | null;
  dosesVitaminaA6a11?: number | null;
  dosesVitaminaA12a23?: number | null;
  dosesVitaminaA24a59?: number | null;
  qtdVisitasAte24Meses?: number | null;
  primeiraVisitaAte24Meses?: string | null;
  segundaVisitaAte24Meses?: string | null;
  vacinaInfluenzaIdoso?: string | null;
  ivcfRisco?: string | null;
  ivcfRegistradoEm?: string | null;
  ivcfDimensoesAlteradas?: string | null;
  qtdVisitasIdoso?: number | null;
  ultimasVisitasIdoso?: string | null;
  dataPrimeiraConsultaBucal?: string | null;
  tratamentoOdontologicoConcluido?: string | null;
  ultimoTratamentoRestaurador?: string | null;
  escovacaoSupervisionada?: string | null;
  exodontiasPermanentes?: string | null;
  procedimentosOdontologicosPreventivos?: string | null;
  fontes: ListaTematica[];
  atualizadoEm: number;
}

export interface Visita {
  id: string;
  cidadaoId: string;
  data: string;
  tipo: TipoVisita;
  situacao: "concluida" | "ausente";
  observacoes: string | null;
  criadaEm: number;
}

export interface RotinaVisitas {
  id: string;
  data: string;
  microarea: string | null;
  meta: number;
  criadaEm: number;
}

export interface ItemRotinaVisita {
  id: string;
  rotinaId: string;
  cidadaoId: string;
  ordem: number;
  status: "pendente" | "em_atendimento" | "concluida" | "ausente";
  motivo: string;
  visitaId: string | null;
  substituiItemId: string | null;
  anotacoes: string | null;
  iniciadoEm: number | null;
  atualizadoEm: number;
}

export interface LembreteAgenda {
  id: string;
  data: string;
  microarea: string | null;
  texto: string;
  concluido: boolean;
  criadoEm: number;
  atualizadoEm: number;
}

export interface TarefaAtualizacaoPec {
  id: string;
  cidadaoId: string;
  motivo: string;
  concluida: boolean;
  criadaEm: number;
  concluidaEm: number | null;
}

export interface Importacao {
  id: string;
  arquivo: string;
  listaTematica: ListaTematica;
  microarea: string | null;
  importadaEm: number;
  totalLinhas: number;
  atualizados: number;
  novos: number;
  ignorados: number;
}

export interface RegrasPrioridade {
  mesesVisitaAtrasada: number;
  mesesPreventivo: number;
  mesesDiabetes: number;
  mesesHipertensao: number;
  mesesIdosoAtendimento: number;
  mesesSaudeBucal: number;
  metaConsultasPuericultura: number;
  diasAcompanhamentoAntropometrico: number;
  categoriasAtivas: {
    visitaDomiciliar: boolean;
    saudeMulher: boolean;
    diabetes: boolean;
    hipertensao: boolean;
    gestacao: boolean;
    puericultura: boolean;
    antropometriaInfantil: boolean;
    pessoaIdosa: boolean;
    saudeBucal: boolean;
  };
}

export interface ConfiguracoesLocais {
  chave: "configuracoes";
  nomeDispositivo: string;
  microareaAtiva: string | null;
  regras: RegrasPrioridade;
  atualizadoEm: number;
}

export const CONFIGURACOES_PADRAO: ConfiguracoesLocais = {
  chave: "configuracoes",
  nomeDispositivo: "Meu dispositivo ACS",
  microareaAtiva: null,
  regras: {
    mesesVisitaAtrasada: 2,
    mesesPreventivo: 36,
    mesesDiabetes: 6,
    mesesHipertensao: 6,
    mesesIdosoAtendimento: 6,
    mesesSaudeBucal: 12,
    metaConsultasPuericultura: 9,
    diasAcompanhamentoAntropometrico: 60,
    categoriasAtivas: {
      visitaDomiciliar: true,
      saudeMulher: true,
      diabetes: true,
      hipertensao: true,
      gestacao: true,
      puericultura: true,
      antropometriaInfantil: true,
      pessoaIdosa: true,
      saudeBucal: true,
    },
  },
  atualizadoEm: Date.now(),
};

export function normalizarRegrasPrioridade(regras: Partial<RegrasPrioridade> | null | undefined): RegrasPrioridade {
  const padrao = CONFIGURACOES_PADRAO.regras;
  return {
    ...padrao,
    ...regras,
    categoriasAtivas: { ...padrao.categoriasAtivas, ...(regras?.categoriasAtivas ?? {}) },
  };
}

export type NivelPrioridade = "alta" | "media" | "atencao";

export interface Prioridade {
  id: string;
  cidadaoId: string;
  nivel: NivelPrioridade;
  categoria: string;
  titulo: string;
  detalhe: string;
  referencia: string | null;
}

export interface IndicadorLocal {
  id: string;
  nome: string;
  descricao: string;
  numerador: number;
  denominador: number;
  percentual: number | null;
  meta: number;
  situacao: "adequado" | "atencao" | "critico" | "sem-base";
}
