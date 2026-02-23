// Tipos relacionados a Taxas de Cartão

export type TipoProdutoTaxa = "aparelho" | "acessorio" | "servico" | "todos";
export type FormaPagamentoTaxa = "cartao_credito" | "cartao_debito";

export interface TaxaCartao {
  id: string;
  loja_id?: number | null;
  tipo_produto: TipoProdutoTaxa;
  forma_pagamento: FormaPagamentoTaxa;
  parcelas_min: number;
  parcelas_max: number;
  taxa_percentual: number;
  ativo: boolean;
  criado_por?: string | null;
  criado_em: string;
  atualizado_em?: string | null;
  atualizado_por?: string | null;
}

export interface TaxaCartaoFormData {
  loja_id?: number | null;
  tipo_produto: TipoProdutoTaxa;
  forma_pagamento: FormaPagamentoTaxa;
  parcelas_min: number;
  parcelas_max: number;
  taxa_percentual: number;
  ativo?: boolean;
}

export interface SimulacaoTaxa {
  valor_bruto: number;
  valor_custo?: number; // Valor de compra do produto
  tipo_produto: TipoProdutoTaxa;
  forma_pagamento: FormaPagamentoTaxa;
  parcelas: number;
  taxa_aplicada?: TaxaCartao;
}

export interface ResultadoSimulacaoTaxa {
  valor_bruto: number;
  valor_custo: number;
  taxa_percentual: number;
  valor_taxa: number;
  valor_liquido: number;
  lucro_sem_taxa: number;
  lucro_com_taxa: number;
  margem_lucro_sem_taxa_percentual: number;
  margem_lucro_com_taxa_percentual: number;
  forma_pagamento: FormaPagamentoTaxa;
  parcelas: number;
  tipo_produto: TipoProdutoTaxa;
}

export interface FiltrosTaxaCartao {
  loja_id?: number;
  tipo_produto?: TipoProdutoTaxa;
  forma_pagamento?: FormaPagamentoTaxa;
  ativo?: boolean;
}
