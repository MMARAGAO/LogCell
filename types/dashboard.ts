// Tipos mínimos para o dashboard

export interface MetricasAdicionais {
  pagamentos_sem_credito_cliente: number;
  total_vendas: number;
  ganho_total_vendas: number;
  ticket_medio: number;
  contas_nao_pagas: number;
  pagamentos_os_recebidos: number;
  total_os: number;
  os_entregues: number;
  os_pendentes: number;
  os_processadas: number;
  os_pagas_nao_entregues: number;
  faturamento_os_processadas: number;
  ganho_os_processadas: number;
  faturamento_os: number;
  ganho_os: number;
  total_transferencias: number;
  transferencias_pendentes: number;
  total_quebras: number;
  quantidade_quebras: number;
  total_creditos_cliente: number;
  os_lojista_pagas: number;
  os_consumidor_final_pagas: number;
  os_lojista_faturamento: number;
  os_lojista_lucro: number;
  os_consumidor_final_faturamento: number;
  os_consumidor_final_lucro: number;
  os_sem_tipo_pagas: number;
  os_sem_tipo_faturamento: number;
  os_sem_tipo_lucro: number;
  devolucoes_com_credito_quantidade: number;
  devolucoes_com_credito_total: number;
  devolucoes_sem_credito_quantidade: number;
  devolucoes_sem_credito_total: number;
}

export interface DadosDashboard {
  metricas_adicionais: MetricasAdicionais;
}

export interface FiltroDashboard {
  data_inicio: string;
  data_fim: string;
  loja_id?: number;
}
