// =====================================================
// TYPES: ORDEM DE SERVIÇO
// =====================================================

export type StatusOS =
  | "aguardando"
  | "aprovado"
  | "em_diagnostico"
  | "em_andamento"
  | "aguardando_peca"
  | "concluido"
  | "entregue"
  | "devolvida"
  | "cancelado"
  | "garantia";

export type PrioridadeOS = "baixa" | "normal" | "alta" | "urgente";

export type TipoEventoOS =
  | "criacao"
  | "mudanca_status"
  | "adicao_peca"
  | "remocao_peca"
  | "atualizacao_valores"
  | "observacao"
  | "conclusao"
  | "devolucao"
  | "cancelamento"
  | "lancamento_caixa";

export type TipoAnexoOS =
  | "foto_entrada"
  | "foto_servico"
  | "foto_entrega"
  | "documento";

export type TipoProdutoOS = "estoque" | "avulso";

export type StatusCaixaOS = "pendente" | "confirmado" | "cancelado";

// =====================================================
// INTERFACE: Ordem de Serviço
// =====================================================
export interface OrdemServico {
  id: string;
  numero_os: number;

  // Dados do Cliente
  cliente_nome: string;
  cliente_telefone?: string;
  cliente_email?: string;
  cliente_cpf_cnpj?: string;
  cliente_endereco?: string;
  tipo_cliente?: "lojista" | "consumidor_final"; // Tipo de cliente

  // Dados do Equipamento
  equipamento_tipo: string;
  equipamento_marca?: string;
  equipamento_modelo?: string;
  equipamento_numero_serie?: string;
  equipamento_senha?: string;

  // Problema/Defeito
  defeito_reclamado: string;
  estado_equipamento?: string;
  acessorios_entregues?: string;

  // Serviço
  diagnostico?: string;
  servico_realizado?: string;
  observacoes_tecnicas?: string;

  // Laudo Técnico
  laudo_diagnostico?: string;
  laudo_causa?: string;
  laudo_procedimentos?: string;
  laudo_recomendacoes?: string;
  laudo_garantia_dias?: number;
  laudo_condicao_final?: string;
  tipo_garantia?: string; // Tipo de garantia: servico_geral, troca_vidro, troca_tampa, venda_aparelho
  dias_garantia?: number; // Dias de garantia customizados

  // Valores
  valor_orcamento?: number;
  valor_servico?: number;
  valor_desconto?: number;
  valor_total?: number;
  valor_pago?: number;

  // Múltiplos aparelhos (novo)
  permite_multiplos_aparelhos?: boolean;
  total_geral_multiplos?: number;

  // Prazos e Datas
  data_entrada: string;
  previsao_entrega?: string;
  data_inicio_servico?: string;
  data_conclusao?: string;
  data_entrega_cliente?: string;

  // Status
  status: StatusOS;
  prioridade: PrioridadeOS;

  // Loja e Responsáveis
  id_loja: number;
  tecnico_responsavel?: string;

  // Auditoria
  criado_em: string;
  atualizado_em: string;
  criado_por?: string;
  atualizado_por?: string;

  // Joins (populados em queries)
  loja?: {
    id: number;
    nome: string;
  };
  tecnico?: {
    id: string;
    nome: string;
  };
  pecas?: OrdemServicoPeca[];
  historico?: HistoricoOrdemServico[];
  anexos?: OrdemServicoAnexo[];
  pagamentos?: Array<{
    id: string;
    valor: number;
    forma_pagamento: string;
    criado_em: string;
  }>;
  caixa?: Array<{
    id: string;
    status_caixa: StatusCaixaOS;
  }>;
  aparelhos?: OrdemServicoAparelho[]; // Múltiplos aparelhos
}

// =====================================================
// INTERFACE: Aparelho da Ordem de Serviço (múltiplos aparelhos por OS)
// =====================================================
export interface OrdemServicoAparelho {
  id: string;
  id_ordem_servico: string;
  id_loja: number;

  // Identificação
  sequencia: number; // 1, 2, 3...
  equipamento_tipo: string;
  equipamento_marca?: string;
  equipamento_modelo?: string;
  equipamento_numero_serie?: string;
  equipamento_imei?: string;
  equipamento_senha?: string;

  // Problemas
  defeito_reclamado: string;
  estado_equipamento?: string;
  acessorios_entregues?: string;

  // Diagnóstico
  diagnostico?: string;

  // Valores específicos deste aparelho
  valor_orcamento?: number;
  valor_desconto?: number;
  valor_total?: number;
  valor_pago?: number;

  // Laudo técnico
  servico_realizado?: string;
  laudo_diagnostico?: string;
  laudo_causa?: string;
  laudo_procedimentos?: string;
  laudo_recomendacoes?: string;
  laudo_garantia_dias?: number;
  laudo_condicao_final?: string;
  observacoes_tecnicas?: string;

  // Status
  status: "ativo" | "removido";

  criado_em: string;
  atualizado_em: string;
  criado_por?: string;
  atualizado_por?: string;
}

// =====================================================
// INTERFACE: Peça da Ordem de Serviço
// =====================================================
export interface OrdemServicoPeca {
  id: string;
  id_ordem_servico: string;
  id_produto?: string; // Opcional para produtos avulsos
  id_loja: number;

  tipo_produto: TipoProdutoOS; // 'estoque' ou 'avulso'
  descricao_peca: string; // Descrição manual para avulso

  quantidade: number;
  valor_custo: number; // Preço de compra
  valor_venda: number; // Valor cobrado do cliente
  valor_total: number;

  estoque_reservado: boolean;
  estoque_baixado: boolean;
  data_reserva_estoque?: string;
  data_baixa_estoque?: string;

  observacao?: string;

  criado_em: string;
  criado_por?: string;

  // Join com produto (apenas para tipo 'estoque')
  produto?: {
    id: string;
    descricao: string;
    marca?: string;
    categoria?: string;
    preco_venda?: number;
    preco_compra?: number;
  };
}

// =====================================================
// INTERFACE: Histórico da Ordem de Serviço
// =====================================================
export interface HistoricoOrdemServico {
  id: string;
  id_ordem_servico: string;

  tipo_evento: TipoEventoOS;
  status_anterior?: StatusOS;
  status_novo?: StatusOS;

  descricao: string;
  dados_anteriores?: any;
  dados_novos?: any;

  criado_em: string;
  criado_por?: string;
  criado_por_nome?: string;
}

// =====================================================
// INTERFACE: Anexo da Ordem de Serviço
// =====================================================
export interface OrdemServicoAnexo {
  id: string;
  id_ordem_servico: string;

  tipo: TipoAnexoOS;
  descricao?: string;
  url_arquivo: string;
  nome_arquivo?: string;
  tamanho_arquivo?: number;

  criado_em: string;
  criado_por?: string;
}

// =====================================================
// INTERFACE: Lançamento no Caixa
// =====================================================
export interface OrdemServicoCaixa {
  id: string;
  id_ordem_servico: string;
  id_loja: number;

  valor_total: number;
  valor_pecas: number;
  valor_servico: number;
  valor_desconto: number;

  forma_pagamento?: string;
  parcelas: number;

  status_caixa: StatusCaixaOS;
  data_confirmacao?: string;

  observacoes?: string;

  criado_em: string;
  criado_por?: string;
  confirmado_por?: string;

  // Join
  ordem_servico?: OrdemServico;
}

// =====================================================
// INTERFACE: Form Data para criar/editar OS
// =====================================================
export interface OrdemServicoFormData {
  // Dados do Cliente
  cliente_nome: string;
  cliente_telefone?: string;
  cliente_email?: string;
  cliente_cpf_cnpj?: string;
  cliente_endereco?: string;
  tipo_cliente?: "lojista" | "consumidor_final"; // Tipo de cliente

  // Dados do Equipamento
  equipamento_tipo: string;
  equipamento_marca?: string;
  equipamento_modelo?: string;
  equipamento_numero_serie?: string;
  equipamento_senha?: string;

  // Problema/Defeito
  defeito_reclamado: string;
  estado_equipamento?: string;
  acessorios_entregues?: string;

  // Serviço
  diagnostico?: string;
  servico_realizado?: string;
  observacoes_tecnicas?: string;
  tipo_garantia?: string; // Tipo de garantia aplicada

  // Valores
  valor_orcamento?: number;
  valor_desconto?: number;
  valor_total?: number;
  valor_pago?: number;

  // Prazos
  previsao_entrega?: string;
  data_inicio_servico?: string;
  data_conclusao?: string;

  // Status
  status?: StatusOS;
  prioridade?: PrioridadeOS;

  // Loja e Responsável (id_loja agora é opcional - cada peça tem sua própria loja)
  id_loja?: number;
  tecnico_responsavel?: string;
}

// =====================================================
// INTERFACE: Form Data para adicionar peça
// =====================================================
export interface OrdemServicoPecaFormData {
  id_ordem_servico: string;
  tipo_produto: TipoProdutoOS;

  // Para produtos do estoque
  id_produto?: string;
  id_loja: number;
  quantidade: number;

  // Para produtos avulsos
  descricao_peca?: string; // Obrigatório se tipo_produto = 'avulso'
  valor_custo: number; // Preço de compra/custo
  valor_venda: number; // Preço cobrado do cliente

  observacao?: string;
}

// =====================================================
// INTERFACE: Estatísticas de OS
// =====================================================
export interface EstatisticasOS {
  total_os: number;
  aguardando: number;
  em_andamento: number;
  concluido: number;
  entregue: number;
  devolvida?: number;
  cancelado: number;
  valor_total_mes: number;
  valor_recebido_mes: number;
}

// =====================================================
// CONSTANTS: Labels e Cores
// =====================================================
export const STATUS_OS_LABELS: Record<StatusOS, string> = {
  aguardando: "Aguardando",
  aprovado: "Aprovado",
  em_diagnostico: "Em Diagnóstico",
  em_andamento: "Em Andamento",
  aguardando_peca: "Aguardando Peça",
  concluido: "Concluído",
  entregue: "Entregue",
  devolvida: "Devolvida",
  cancelado: "Cancelado",
  garantia: "Garantia",
};

export const STATUS_OS_COLORS: Record<
  StatusOS,
  "default" | "primary" | "secondary" | "success" | "warning" | "danger"
> = {
  aguardando: "warning",
  aprovado: "primary",
  em_diagnostico: "primary",
  em_andamento: "secondary",
  aguardando_peca: "warning",
  concluido: "success",
  entregue: "success",
  devolvida: "warning",
  cancelado: "danger",
  garantia: "secondary",
};

export const PRIORIDADE_OS_LABELS: Record<PrioridadeOS, string> = {
  baixa: "Baixa",
  normal: "Normal",
  alta: "Alta",
  urgente: "Urgente",
};

export const PRIORIDADE_OS_COLORS: Record<
  PrioridadeOS,
  "default" | "primary" | "success" | "warning" | "danger"
> = {
  baixa: "default",
  normal: "primary",
  alta: "warning",
  urgente: "danger",
};
