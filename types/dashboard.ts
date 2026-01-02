// Tipos mínimos para o dashboard

export interface MetricasAdicionais {
	pagamentos_sem_credito_cliente: number;
	total_vendas: number;
	ganho_total_vendas: number;
	ticket_medio: number;
	contas_nao_pagas: number;
}

export interface DadosDashboard {
	metricas_adicionais: MetricasAdicionais;
}

export interface FiltroDashboard {
	data_inicio: string;
	data_fim: string;
	loja_id?: number;
}
