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
  igSemanas: string | null;
  qtdConsultasPreNatal: number | null;
  isHipertenso: boolean;
  isDiabetico: boolean;
  dataUltimaHemoglobinaGlicada: string | null;
  dataUltimaConsultaHipertensao: string | null;
  dataUltimaConsultaDiabetes: string | null;
  isIdoso: boolean;
  isCrianca: boolean;
  isSaudeBucal: boolean;
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
  status: "pendente" | "concluida" | "ausente";
  motivo: string;
  visitaId: string | null;
  substituiItemId: string | null;
  atualizadoEm: number;
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
  },
  atualizadoEm: Date.now(),
};

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
