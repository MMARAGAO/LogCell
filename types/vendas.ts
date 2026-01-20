// Tipos relacionados a Vendas

export interface Venda {
  id: string;
  numero_venda: number; // Número sequencial da venda (inteiro)
  cliente_id: string;
  loja_id: number;
  vendedor_id: string;
  status: "em_andamento" | "concluida" | "cancelada" | "devolvida";
  tipo: "normal" | "fiada";
  data_prevista_pagamento?: string; // Para vendas fiadas
  valor_total: number;
  valor_pago: number;
  valor_desconto: number;
  saldo_devedor: number;
  observacoes?: string; // Observações da venda
  criado_em: string;
  criado_por: string;
  atualizado_em?: string;
  atualizado_por?: string;
  finalizado_em?: string;
  finalizado_por?: string;
}

export interface ItemVenda {
  id?: string;
  venda_id: string;
  produto_id: string;
  produto_nome?: string;
  produto_codigo?: string;
  quantidade: number;
  preco_unitario: number;
  subtotal: number;
  devolvido: number; // Quantidade devolvida
  desconto_tipo?: "valor" | "percentual";
  desconto_valor?: number;
  valor_desconto?: number; // Valor calculado do desconto em R$
  criado_em?: string;
  produto?: {
    nome: string;
    codigo: string;
  };
}

export interface PagamentoVenda {
  id?: string;
  venda_id: string;
  tipo_pagamento:
    | "dinheiro"
    | "pix"
    | "cartao_credito"
    | "cartao_debito"
    | "transferencia"
    | "boleto"
    | "credito_cliente";
  valor: number;
  data_pagamento: string;
  observacao?: string;
  criado_em?: string;
  criado_por?: string;
  editado?: boolean;
  editado_em?: string;
  editado_por?: string;
}

export interface DescontoVenda {
  id?: string;
  venda_id: string;
  tipo: "valor" | "percentual";
  valor: number;
  motivo?: string;
  aplicado_por: string;
  criado_em?: string;
}

export interface DevolucaoVenda {
  id?: string;
  venda_id: string;
  tipo: "com_credito" | "sem_credito";
  valor_total: number;
  forma_pagamento?: string;
  motivo: string;
  realizado_por: string;
  criado_em?: string;
  credito_gerado_id?: string; // Para rastrear o crédito gerado
}

export interface ItemDevolucao {
  id?: string;
  devolucao_id: string;
  item_venda_id: string;
  quantidade: number;
  motivo?: string;
  criado_em?: string;
}

export interface CreditoCliente {
  id?: string;
  cliente_id: string;
  venda_origem_id?: string;
  devolucao_id?: string;
  ordem_servico_id?: string; // Para créditos gerados de devoluções de OS
  tipo?: "adicao" | "retirada";
  valor_total: number;
  valor_utilizado: number;
  saldo: number;
  motivo?: string;
  gerado_por?: string;
  criado_em?: string;
  usuario?: {
    nome: string;
  };
}

export interface HistoricoVenda {
  id?: string;
  venda_id: string;
  tipo_acao:
    | "criacao"
    | "adicao_produto"
    | "remocao_produto"
    | "pagamento"
    | "edicao_pagamento"
    | "desconto"
    | "devolucao"
    | "finalizacao"
    | "cancelamento"
    | "edicao"
    | "exclusao"
    | "adicao_item"
    | "remocao_item";
  descricao: string;
  dados_antes?: any;
  dados_depois?: any;
  usuario_id: string;
  usuario_nome?: string;
  criado_em?: string;
}

// Tipos auxiliares para a interface
export interface ItemCarrinho {
  produto_id: string;
  produto_nome: string;
  produto_codigo?: string;
  quantidade: number;
  preco_unitario: number;
  subtotal: number;
  estoque_disponivel?: number;
  desconto?: {
    tipo: "valor" | "percentual";
    valor: number;
  };
}

export interface PagamentoCarrinho {
  tipo_pagamento: string;
  valor: number;
  data_pagamento: string;
  observacao?: string;
}

export interface VendaCompleta extends Venda {
  cliente?: {
    id: string;
    nome: string;
    doc?: string;
    telefone?: string;
  };
  loja?: {
    id: number;
    nome: string;
  };
  vendedor?: {
    id: string;
    nome: string;
  };
  itens?: (ItemVenda & {
    produto?: {
      nome: string;
      codigo?: string;
    };
  })[];
  pagamentos?: PagamentoVenda[];
  descontos?: DescontoVenda[];
  devolucoes?: (DevolucaoVenda & {
    itens?: ItemDevolucao[];
  })[];
  historico?: HistoricoVenda[];
}
