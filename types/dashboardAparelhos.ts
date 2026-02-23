export interface DashboardAparelhosFiltro {
  data_inicio: string;
  data_fim: string;
  loja_id?: number;
}

export interface LinhaRanking {
  id?: string;
  nome: string;
  quantidade: number;
  total_vendas: number;
  lucro: number;
  margem: number;
}

export interface LinhaCliente {
  id?: string;
  nome: string;
  quantidade: number;
  total_vendas: number;
}

export interface LinhaProduto {
  nome: string;
  quantidade: number;
  total_vendas: number;
  lucro: number;
}

export interface DashboardAparelhosDados {
  total_vendas: number;
  lucro_total: number;
  custo_total_aparelhos: number;
  custo_total_brindes: number;
  vendas_por_vendedor: LinhaRanking[];
  top_vendedores: LinhaRanking[];
  top_clientes: LinhaCliente[];
  top_produtos: LinhaProduto[];
}
