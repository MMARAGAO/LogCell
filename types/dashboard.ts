// Types para o Dashboard

export interface MetricasPrincipais {
  faturamento_total: number;
  faturamento_periodo_anterior: number;
  variacao_faturamento: number;

  total_vendas: number;
  vendas_periodo_anterior: number;
  variacao_vendas: number;

  ticket_medio: number;
  ticket_medio_periodo_anterior: number;
  variacao_ticket_medio: number;

  os_abertas: number;
  os_concluidas: number;
  os_atrasadas: number;

  produtos_estoque_baixo: number;
  produtos_estoque_zerado: number;

  novos_clientes: number;

  caixas_abertos: number;

  vendas_fiadas: number;
  vendas_fiadas_periodo_anterior: number;
  variacao_vendas_fiadas: number;
  valor_vendas_fiadas: number;
  valor_vendas_fiadas_periodo_anterior: number;

  // Ganhos reais (pagamentos recebidos)
  ganho_vendas: number;
  ganho_vendas_periodo_anterior: number;
  variacao_ganho_vendas: number;
  ganho_os: number;
  ganho_os_periodo_anterior: number;
  variacao_ganho_os: number;
}

export interface VendasPorDia {
  data: string;
  valor: number;
  quantidade: number;
}

export interface ProdutoMaisVendido {
  produto_id: string;
  produto_nome: string;
  quantidade: number;
  valor_total: number;
}

export interface FormaPagamentoDistribuicao {
  forma: string;
  valor: number;
  quantidade: number;
  percentual: number;
}

export interface StatusOSDistribuicao {
  status: string;
  quantidade: number;
  valor_total: number;
}

export interface ProdutoEstoqueBaixo {
  id: string;
  descricao: string;
  loja: string;
  quantidade_atual: number;
  quantidade_minima: number;
}

export interface OSAtrasada {
  id: string;
  numero_os: number;
  cliente_nome: string;
  previsao_entrega: string;
  dias_atraso: number;
  status: string;
}

export interface CaixaAberto {
  id: string;
  loja_nome: string;
  usuario_nome: string;
  data_abertura: string;
  saldo_inicial: number;
  horas_aberto: number;
}

export interface ContaReceber {
  venda_id: string;
  numero_venda: number;
  cliente_nome: string;
  data_venda: string;
  valor_total: number;
  valor_pago: number;
  saldo_devedor: number;
  dias_atraso: number;
}

export interface TopCliente {
  cliente_id: string;
  cliente_nome: string;
  total_compras: number;
  quantidade_vendas: number;
  ticket_medio: number;
}

export interface TopVendedor {
  vendedor_id: string;
  vendedor_nome: string;
  total_vendas: number;
  quantidade_vendas: number;
  ticket_medio: number;
  total_faturamento: number;
}

export interface OSTecnico {
  tecnico_id: string;
  tecnico_nome: string;
  os_concluidas: number;
  os_em_andamento: number;
  tempo_medio_conclusao: number;
  valor_total_os: number;
}

export interface PecaMaisUsada {
  produto_id: string;
  produto_nome: string;
  quantidade_usada: number;
  valor_total: number;
  quantidade_os: number;
}

export interface GiroEstoque {
  produto_id: string;
  produto_nome: string;
  quantidade_vendida: number;
  estoque_medio: number;
  giro: number;
}

export interface FaturamentoMensal {
  mes: string;
  faturamento_vendas: number;
  faturamento_os: number;
  total: number;
}

export interface RMAAberta {
  id: string;
  numero_rma: string;
  produto_nome: string;
  fornecedor_nome: string;
  quantidade: number;
  status: string;
  dias_aberta: number;
}

export interface QuebraPeca {
  id: string;
  produto_descricao: string;
  quantidade: number;
  valor_total: number;
  tipo_ocorrencia: string;
  motivo: string;
  responsavel: string;
  aprovado: boolean;
  criado_em: string;
  dias_pendente: number;
}

export interface VendaFiada {
  id: string;
  numero_venda: string;
  cliente_nome: string;
  vendedor_nome: string;
  loja_nome: string;
  valor_total: number;
  valor_pago: number;
  valor_pendente: number;
  criado_em: string;
  finalizado_em: string | null;
  dias_em_aberto: number;
  status_pagamento: "em_dia" | "atrasado" | "muito_atrasado";
}

export interface DadosDashboard {
  metricas: MetricasPrincipais;
  vendas_por_dia: VendasPorDia[];
  top_produtos: ProdutoMaisVendido[];
  formas_pagamento: FormaPagamentoDistribuicao[];
  status_os: StatusOSDistribuicao[];
  contas_receber: ContaReceber[];
  top_clientes: TopCliente[];
  top_vendedores: TopVendedor[];
  os_tecnicos: OSTecnico[];
  pecas_mais_usadas: PecaMaisUsada[];
  giro_estoque: GiroEstoque[];
  faturamento_mensal: FaturamentoMensal[];
  vendas_fiadas_detalhadas: VendaFiada[];
  alertas: {
    produtos_estoque_baixo: ProdutoEstoqueBaixo[];
    os_atrasadas: OSAtrasada[];
    caixas_abertos: CaixaAberto[];
    rmas_abertas: RMAAberta[];
    quebras_pendentes: QuebraPeca[];
  };
  metricas_adicionais: {
    contas_receber_total: number;
    contas_receber_qtd: number;
    creditos_cliente_total: number;
    taxa_conversao_os: number;
    tempo_medio_reparo_dias: number;
    sangrias_total: number;
    produtos_inativos: number;
    valor_medio_os: number;
    quebras_total_valor: number;
    quebras_total_quantidade: number;
    quebras_pendentes_aprovacao: number;
    // Novas métricas
    transferencias_pendentes: number;
    valor_transferencias_pendentes: number;
    devolucoes_mes: number;
    valor_devolucoes_mes: number;
    movimentacoes_caixa_dia: number;
    valor_movimentacoes_caixa_dia: number;
  };
}

export interface FiltroDashboard {
  data_inicio: string;
  data_fim: string;
  loja_id?: number;
}
