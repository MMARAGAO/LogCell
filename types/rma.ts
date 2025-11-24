export type TipoOrigemRMA = "interno_fornecedor" | "cliente";

export type TipoRMA =
  | "defeito_fabrica"
  | "dano_transporte"
  | "produto_errado"
  | "nao_funciona"
  | "arrependimento"
  | "garantia"
  | "outro";

export type StatusRMA =
  | "pendente"
  | "em_analise"
  | "aprovado"
  | "reprovado"
  | "em_transito"
  | "recebido"
  | "concluido"
  | "cancelado";

export interface RMA {
  id: string;
  numero_rma: string;
  tipo_origem: TipoOrigemRMA;
  tipo_rma: TipoRMA;
  status: StatusRMA;

  // Relações
  produto_id: string;
  loja_id: number;
  cliente_id?: string;
  fornecedor_id?: string;
  criado_por: string;

  // Detalhes
  quantidade: number;
  motivo: string;
  observacoes_assistencia?: string;

  // Timestamps
  criado_em: string;
  atualizado_em: string;

  // Relações expandidas
  produtos?: {
    id: string;
    descricao: string;
  };
  lojas?: {
    id: number;
    nome: string;
  };
  clientes?: {
    id: string;
    nome: string;
    telefone?: string;
  };
  fornecedores?: {
    id: string;
    nome: string;
    telefone?: string;
  };
  criado_por_usuario?: {
    id: string;
    nome: string;
  };
}

export interface HistoricoRMA {
  id: string;
  rma_id: string;
  tipo_acao:
    | "criacao"
    | "mudanca_status"
    | "atualizacao"
    | "adicao_foto"
    | "adicao_observacao"
    | "movimentacao_estoque";
  descricao: string;
  dados_anteriores?: Record<string, any>;
  dados_novos?: Record<string, any>;
  criado_por: string;
  criado_em: string;

  // Relações expandidas
  criado_por_usuario?: {
    id: string;
    nome: string;
  };
}

export interface FotoRMA {
  id: string;
  rma_id: string;
  url: string;
  nome_arquivo: string;
  tamanho: number;
  criado_por: string;
  criado_em: string;
}

export interface NovoRMA {
  tipo_origem: TipoOrigemRMA;
  tipo_rma: TipoRMA;
  status: StatusRMA;
  produto_id: string;
  loja_id: number;
  cliente_id?: string;
  fornecedor_id?: string;
  quantidade: number;
  motivo: string;
  observacoes_assistencia?: string;
  fotos?: File[];
}

export interface FiltrosRMA {
  tipo_origem?: TipoOrigemRMA;
  status?: StatusRMA;
  loja_id?: number;
  cliente_id?: string;
  fornecedor_id?: string;
  data_inicio?: string;
  data_fim?: string;
  busca?: string;
}

export const LABELS_TIPO_ORIGEM: Record<TipoOrigemRMA, string> = {
  interno_fornecedor: "RMA Interno/Fornecedor",
  cliente: "RMA de Cliente",
};

export const LABELS_TIPO_RMA: Record<TipoRMA, string> = {
  defeito_fabrica: "Defeito de Fábrica",
  dano_transporte: "Dano no Transporte",
  produto_errado: "Produto Errado",
  nao_funciona: "Não Funciona",
  arrependimento: "Arrependimento",
  garantia: "Garantia",
  outro: "Outro",
};

export const LABELS_STATUS_RMA: Record<StatusRMA, string> = {
  pendente: "Pendente",
  em_analise: "Em Análise",
  aprovado: "Aprovado",
  reprovado: "Reprovado",
  em_transito: "Em Trânsito",
  recebido: "Recebido",
  concluido: "Concluído",
  cancelado: "Cancelado",
};

export const CORES_STATUS_RMA: Record<
  StatusRMA,
  "default" | "primary" | "secondary" | "success" | "warning" | "danger"
> = {
  pendente: "warning",
  em_analise: "primary",
  aprovado: "success",
  reprovado: "danger",
  em_transito: "secondary",
  recebido: "primary",
  concluido: "success",
  cancelado: "default",
};
