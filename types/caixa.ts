// Types para o sistema de Caixa

export interface Caixa {
  id: string;
  loja_id: number;
  usuario_abertura: string;
  usuario_fechamento?: string;
  data_abertura: string;
  data_fechamento?: string;
  saldo_inicial: number;
  saldo_final?: number;
  status: "aberto" | "fechado";
  observacoes_abertura?: string;
  observacoes_fechamento?: string;
  criado_em?: string;
  atualizado_em?: string;
}

export interface CaixaCompleto extends Caixa {
  loja?: {
    id: number;
    nome: string;
  };
  usuario_abertura_info?: {
    id: string;
    nome: string;
  };
  usuario_fechamento_info?: {
    id: string;
    nome: string;
  };
}

export interface MovimentacaoCaixa {
  tipo:
    | "venda"
    | "devolucao"
    | "ordem_servico"
    | "sangria"
    | "suprimento"
    | "quebra";
  descricao: string;
  valor: number;
  data: string;
  referencia_id?: string;
  forma_pagamento?: string;
  gerou_credito?: boolean;
  usou_credito?: boolean;
  pagamentos?: Array<{
    tipo_pagamento: string;
    valor: number;
  }>;
}

export interface Sangria {
  id: string;
  caixa_id: string;
  valor: number;
  motivo: string;
  realizado_por: string;
  criado_em: string;
  usuario?: {
    id: string;
    nome: string;
  };
}

export interface ResumoCaixa {
  vendas: {
    quantidade: number;
    total: number;
    por_forma_pagamento: {
      [key: string]: number;
    };
  };
  devolucoes: {
    quantidade: number;
    total: number;
  };
  devolucoes_com_credito: {
    quantidade: number;
    total: number;
  };
  devolucoes_sem_credito: {
    quantidade: number;
    total: number;
  };
  ordens_servico: {
    quantidade: number;
    total: number;
  };
  sangrias: {
    quantidade: number;
    total: number;
  };
  quebras: {
    quantidade: number;
    total: number;
  };
  saldo_inicial: number;
  total_entradas: number;
  total_saidas: number;
  saldo_esperado: number;
  saldo_informado?: number;
  diferenca?: number;
}

export interface AbrirCaixaParams {
  loja_id: number;
  saldo_inicial: number;
  observacoes_abertura?: string;
  usuario_id: string;
}

export interface FecharCaixaParams {
  caixa_id: string;
  saldo_final: number;
  observacoes_fechamento?: string;
  usuario_id: string;
}
