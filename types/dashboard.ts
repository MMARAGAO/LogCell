// Tipos mínimos para o dashboard

export interface MetricasAdicionais {
	pagamentos_sem_credito_cliente: number;
	total_vendas: number;
	ganho_total_vendas: number;
	ticket_medio: number;
	contas_nao_pagas: number;
	total_os: number;
	os_entregues: number;
	faturamento_os: number;
	ganho_os: number;
	total_transferencias: number;
	transferencias_pendentes: number;
	total_quebras: number;
	quantidade_quebras: number;
	total_creditos_cliente: number;
}

export interface DadosDashboard {
	metricas_adicionais: MetricasAdicionais;
}

export interface FiltroDashboard {
	data_inicio: string;
	data_fim: string;
	loja_id?: number;
}
