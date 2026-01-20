import { supabase } from "@/lib/supabaseClient";
import type { DadosDashboard, FiltroDashboard } from "@/types/dashboard";

export class DashboardService {
	static async buscarDadosDashboard(
		filtro: FiltroDashboard
	): Promise<DadosDashboard> {
		const { data_inicio, data_fim, loja_id } = filtro;

		// Garantir período com hora para não perder movimentações no final do dia
		const inicioISO = `${data_inicio}T00:00:00`;
		const fimISO = `${data_fim}T23:59:59`;

		console.log("🚀 [DASHBOARD] Iniciando busca otimizada com RPC...");

		try {
			// Executar todas as funções RPC em paralelo
			const [metricasVendas, metricasOS, osPorTipo, metricasAdicionais] = await Promise.all([
				supabase.rpc('calcular_metricas_vendas', {
					p_data_inicio: inicioISO,
					p_data_fim: fimISO,
					p_loja_id: loja_id || null
				}),
				supabase.rpc('calcular_metricas_os', {
					p_data_inicio: inicioISO,
					p_data_fim: fimISO,
					p_loja_id: loja_id || null
				}),
				supabase.rpc('calcular_os_por_tipo_cliente', {
					p_data_inicio: inicioISO,
					p_data_fim: fimISO,
					p_loja_id: loja_id || null
				}),
				supabase.rpc('calcular_metricas_adicionais', {
					p_data_inicio: inicioISO,
					p_data_fim: fimISO,
					p_loja_id: loja_id || null
				})
			]);

			if (metricasVendas.error) {
				console.error("❌ [DASHBOARD] Erro ao buscar métricas de vendas:", metricasVendas.error);
				throw metricasVendas.error;
			}

			if (metricasOS.error) {
				console.error("❌ [DASHBOARD] Erro ao buscar métricas de OS:", metricasOS.error);
				throw metricasOS.error;
			}

			if (osPorTipo.error) {
				console.error("❌ [DASHBOARD] Erro ao buscar OS por tipo:", osPorTipo.error);
				throw osPorTipo.error;
			}

			if (metricasAdicionais.error) {
				console.error("❌ [DASHBOARD] Erro ao buscar métricas adicionais:", metricasAdicionais.error);
				throw metricasAdicionais.error;
			}

			const vendas = metricasVendas.data || {};
			const os = metricasOS.data || {};
			const porTipo = osPorTipo.data || {};
			const adicionais = metricasAdicionais.data || {};

			console.log("✅ [DASHBOARD] Dados carregados com sucesso!");

			return {
				metricas_adicionais: {
					pagamentos_sem_credito_cliente: Number(vendas.pagamentos_sem_credito || 0),
					pagamentos_os_recebidos: Number(adicionais.pagamentos_os || 0),
					total_vendas: Number(vendas.total_vendas || 0),
					ganho_total_vendas: Number(vendas.lucro_vendas || 0),
					ticket_medio: Number(vendas.ticket_medio || 0),
					contas_nao_pagas: Number(vendas.contas_nao_pagas || 0),
					total_os: Number(os.total_os || 0),
					os_entregues: Number(os.os_entregues || 0),
					os_pendentes: Number(os.os_pendentes || 0),
					os_pagas_nao_entregues: Number(os.os_pagas_nao_entregues || 0),
					os_processadas: Number(os.os_processadas || 0),
					faturamento_os_processadas: Number(os.faturamento_processadas || 0),
					ganho_os_processadas: Number(os.ganho_processadas || 0),
					faturamento_os: Number(os.faturamento_processadas || 0),
					ganho_os: Number(os.ganho_processadas || 0),
					total_transferencias: Number(adicionais.total_transferencias || 0),
					transferencias_pendentes: Number(adicionais.transferencias_pendentes || 0),
					total_quebras: Number(adicionais.total_quebras || 0),
					quantidade_quebras: Number(adicionais.quantidade_quebras || 0),
					total_creditos_cliente: Number(adicionais.total_creditos_cliente || 0),
					os_lojista_pagas: Number(porTipo.lojista?.quantidade || 0),
					os_lojista_faturamento: Number(porTipo.lojista?.faturamento || 0),
					os_lojista_lucro: Number(porTipo.lojista?.lucro || 0),
					os_consumidor_final_pagas: Number(porTipo.consumidor_final?.quantidade || 0),
					os_consumidor_final_faturamento: Number(porTipo.consumidor_final?.faturamento || 0),
					os_consumidor_final_lucro: Number(porTipo.consumidor_final?.lucro || 0),
					os_sem_tipo_pagas: Number(porTipo.sem_tipo?.quantidade || 0),
					os_sem_tipo_faturamento: Number(porTipo.sem_tipo?.faturamento || 0),
					os_sem_tipo_lucro: Number(porTipo.sem_tipo?.lucro || 0),
					devolucoes_com_credito_quantidade: Number(adicionais.devolucoes_com_credito_quantidade || 0),
					devolucoes_com_credito_total: Number(adicionais.devolucoes_com_credito_total || 0),
					devolucoes_sem_credito_quantidade: Number(adicionais.devolucoes_sem_credito_quantidade || 0),
					devolucoes_sem_credito_total: Number(adicionais.devolucoes_sem_credito_total || 0),
				},
			};
		} catch (error) {
			console.error("❌ [DASHBOARD] Erro crítico ao buscar dados:", error);
			// Fallback para código antigo se RPC falhar
			console.log("⚠️ [DASHBOARD] Tentando fallback com queries antigas...");
			return this.buscarDadosDashboardLegacy(filtro);
		}
	}

	// Método legacy como fallback
	static async buscarDadosDashboardLegacy(
		filtro: FiltroDashboard
	): Promise<DadosDashboard> {
		const { data_inicio, data_fim, loja_id } = filtro;

		// Garantir período com hora para não perder movimentações no final do dia
		const inicioISO = `${data_inicio}T00:00:00`;
		const fimISO = `${data_fim}T23:59:59`;

		// Buscar total de pagamentos de vendas (servidor faz o SUM para evitar limite de 1000 linhas)
		// Paginado para evitar limite de 1000 linhas e sem usar agregação (política bloqueando aggregate)
		const pageSize = 1000;
		let from = 0;
		let to = pageSize - 1;
		let pagamentosSemCredito = 0;

		while (true) {
			let query = supabase
				.from("pagamentos_venda")
				.select(
					"valor, tipo_pagamento, venda:vendas!pagamentos_venda_venda_id_fkey(loja_id)"
				)
				.gte("data_pagamento", inicioISO)
				.lte("data_pagamento", fimISO)
				.neq("tipo_pagamento", "credito_cliente")
				.range(from, to);

			if (loja_id) {
				query = query.eq("venda.loja_id", loja_id);
			}

			const { data, error } = await query;

			if (error) {
				console.error("❌ [DASHBOARD] Erro ao buscar pagamentos:", error);
				break;
			}

			const batch = data || [];
			batch.forEach((p: any) => {
				// Salvaguarda adicional de loja
				if (loja_id && p.venda?.loja_id !== loja_id) return;
				pagamentosSemCredito += Number(p.valor || 0);
			});

			if (batch.length < pageSize) {
				break;
			}

			from += pageSize;
			to += pageSize;
		}

		// Buscar quantidade total de vendas
		let queryVendas = supabase
			.from("vendas")
			.select("id", { count: "exact", head: true })
			.gte("criado_em", inicioISO)
			.lte("criado_em", fimISO)
			.neq("status", "cancelado");

		if (loja_id) {
			queryVendas = queryVendas.eq("loja_id", loja_id);
		}

		const { count, error: erroVendas } = await queryVendas;

		if (erroVendas) {
			console.error("❌ [DASHBOARD] Erro ao buscar vendas:", erroVendas);
		}

		// Buscar custo dos produtos vendidos baseado nos pagamentos recebidos
		// Precisamos pegar as vendas que tiveram pagamentos no período
		let fromPagamentos = 0;
		let toPagamentos = pageSize - 1;
		let custoTotalVendas = 0;
		const vendasProcessadas = new Set<string>();

		while (true) {
			let queryPagamentosVendas = supabase
				.from("pagamentos_venda")
				.select("venda_id, venda:vendas!pagamentos_venda_venda_id_fkey(loja_id)")
				.gte("data_pagamento", inicioISO)
				.lte("data_pagamento", fimISO)
				.neq("tipo_pagamento", "credito_cliente")
				.range(fromPagamentos, toPagamentos);

			if (loja_id) {
				queryPagamentosVendas = queryPagamentosVendas.eq("venda.loja_id", loja_id);
			}

			const { data: pagamentosData, error: erroPagamentos } = await queryPagamentosVendas;

			if (erroPagamentos) {
				console.error("❌ [DASHBOARD] Erro ao buscar vendas dos pagamentos:", erroPagamentos);
				break;
			}

			const batchPagamentos = pagamentosData || [];
			
			// Coletar IDs únicos de vendas
			const vendasIds: string[] = [];
			batchPagamentos.forEach((p: any) => {
				if (p.venda_id && !vendasProcessadas.has(p.venda_id)) {
					if (!loja_id || p.venda?.loja_id === loja_id) {
						vendasIds.push(p.venda_id);
						vendasProcessadas.add(p.venda_id);
					}
				}
			});

			// Buscar itens dessas vendas para calcular custo
			if (vendasIds.length > 0) {
				const { data: itensData, error: erroItens } = await supabase
					.from("itens_venda")
					.select("quantidade, produto:produtos!itens_venda_produto_id_fkey(preco_compra)")
					.in("venda_id", vendasIds);

				if (!erroItens && itensData) {
					itensData.forEach((item: any) => {
						const precoCompra = Number(item.produto?.preco_compra || 0);
						const quantidade = Number(item.quantidade || 0);
						custoTotalVendas += precoCompra * quantidade;
					});
				}
			}

			if (batchPagamentos.length < pageSize) {
				break;
			}

			fromPagamentos += pageSize;
			toPagamentos += pageSize;
		}

		// Lucro = Pagamentos Recebidos - Custo dos Produtos Vendidos
		const lucroVendas = pagamentosSemCredito - custoTotalVendas;

		// Calcular ticket médio
		const ticketMedio = count && count > 0 ? pagamentosSemCredito / count : 0;

		// Buscar contas não pagas (vendas onde valor_pago < valor_total)
		let fromContasNaoPagas = 0;
		let toContasNaoPagas = pageSize - 1;
		let totalContasNaoPagas = 0;

		while (true) {
			let queryContasNaoPagas = supabase
				.from("vendas")
				.select("valor_total, valor_pago")
				.gte("criado_em", inicioISO)
				.lte("criado_em", fimISO)
				.neq("status", "cancelado")
				.range(fromContasNaoPagas, toContasNaoPagas);

			if (loja_id) {
				queryContasNaoPagas = queryContasNaoPagas.eq("loja_id", loja_id);
			}

			const { data: contasData, error: erroContas } = await queryContasNaoPagas;

			if (erroContas) {
				console.error("❌ [DASHBOARD] Erro ao buscar contas não pagas:", erroContas);
				break;
			}

			const batchContas = contasData || [];
			batchContas.forEach((v: any) => {
				const valorTotal = Number(v.valor_total || 0);
				const valorPago = Number(v.valor_pago || 0);
				if (valorPago < valorTotal) {
					totalContasNaoPagas += (valorTotal - valorPago);
				}
			});

			if (batchContas.length < pageSize) {
				break;
			}

			fromContasNaoPagas += pageSize;
			toContasNaoPagas += pageSize;
		}

	// Buscar métricas de Ordem de Serviço
	let fromPagamentosOS = 0;
	let toPagamentosOS = pageSize - 1;
	let pagamentosOSRecebidos = 0;

	while (true) {
		let queryPagamentosOS = supabase
			.from("ordem_servico_pagamentos")
			.select(
				"valor, os:ordem_servico!ordem_servico_pagamentos_id_ordem_servico_fkey(id_loja)"
			)
			.gte("data_pagamento", inicioISO)
			.lte("data_pagamento", fimISO)
			.range(fromPagamentosOS, toPagamentosOS);

		const { data: pagamentosOSData, error: erroPagamentosOS } = await queryPagamentosOS;

		if (erroPagamentosOS) {
			console.error("❌ [DASHBOARD] Erro ao buscar pagamentos de OS:", erroPagamentosOS);
			break;
		}

		const batchPagamentosOS = pagamentosOSData || [];
		batchPagamentosOS.forEach((p: any) => {
			if (loja_id && p.os?.id_loja !== loja_id) return;
			pagamentosOSRecebidos += Number(p.valor || 0);
		});

		if (batchPagamentosOS.length < pageSize) {
			break;
		}

		fromPagamentosOS += pageSize;
		toPagamentosOS += pageSize;
	}

	let queryTotalOS = supabase
		.from("ordem_servico")
		.select("id", { count: "exact", head: true })
		.gte("criado_em", inicioISO)
		.lte("criado_em", fimISO)
		.neq("status", "cancelado");

	if (loja_id) {
		queryTotalOS = queryTotalOS.eq("id_loja", loja_id);
	}

	const { count: totalOS, error: erroTotalOS } = await queryTotalOS;

	if (erroTotalOS) {
		console.error("❌ [DASHBOARD] Erro ao buscar total de OS:", erroTotalOS);
	}

	// Buscar OS entregues
	let queryOSEntregues = supabase
		.from("ordem_servico")
		.select("id", { count: "exact", head: true })
		.eq("status", "entregue")
		.gte("criado_em", inicioISO)
		.lte("criado_em", fimISO);

	if (loja_id) {
		queryOSEntregues = queryOSEntregues.eq("id_loja", loja_id);
	}

	const { count: osEntregues, error: erroOSEntregues } = await queryOSEntregues;

	if (erroOSEntregues) {
		console.error("❌ [DASHBOARD] Erro ao buscar OS entregues:", erroOSEntregues);
	}

	// Buscar faturamento e custo de OS
	let fromOS = 0;
	let toOS = pageSize - 1;
	let faturamentoOS = 0;
	let custoOS = 0;

	while (true) {
		let queryOS = supabase
			.from("ordem_servico")
			.select("id, valor_pago, valor_orcamento")
			.eq("status", "entregue")
			.gt("valor_pago", 0)
			.gte("criado_em", inicioISO)
			.lte("criado_em", fimISO)
			.range(fromOS, toOS);

		if (loja_id) {
			queryOS = queryOS.eq("id_loja", loja_id);
		}

		const { data: osData, error: erroOS } = await queryOS;

		if (erroOS) {
			console.error("❌ [DASHBOARD] Erro ao buscar faturamento de OS:", erroOS);
			break;
		}

		const batchOS = osData || [];

		// Somar faturamento (usar valor_pago, fallback para valor_orcamento)
		batchOS.forEach((os: any) => {
			const valorFaturado = Number(os.valor_pago || os.valor_orcamento || 0);
			faturamentoOS += valorFaturado;
		});

		// Buscar peças dessas OS para calcular custo usando preco_compra
		if (batchOS.length > 0) {
			const osIds = batchOS.map((os: any) => os.id);

			const { data: pecasData, error: erroPecas } = await supabase
				.from("ordem_servico_pecas")
				.select("quantidade, produto:produtos!ordem_servico_pecas_id_produto_fkey(preco_compra)")
				.in("id_ordem_servico", osIds);

			if (!erroPecas && pecasData) {
				pecasData.forEach((peca: any) => {
					const precoCompra = Number(peca.produto?.preco_compra || 0);
					const quantidade = Number(peca.quantidade || 0);
					custoOS += precoCompra * quantidade;
				});
			}
		}

		if (batchOS.length < pageSize) {
			break;
		}

		fromOS += pageSize;
		toOS += pageSize;
	}
	const ganhoOS = faturamentoOS - custoOS;
		// Buscar faturamento de OS processadas (pagas não entregues + entregues)
	let fromOSProcessadas = 0;
	let toOSProcessadas = pageSize - 1;
	let faturamentoOSProcessadas = 0;

	while (true) {
		let queryOSProcessadas = supabase
			.from("ordem_servico")
			.select("valor_pago")
			.or(`valor_pago.gt.0,status.eq.entregue`)
			.neq("status", "cancelado")
			.gte("criado_em", inicioISO)
			.lte("criado_em", fimISO)
			.range(fromOSProcessadas, toOSProcessadas);

		if (loja_id) {
			queryOSProcessadas = queryOSProcessadas.eq("id_loja", loja_id);
		}

		const { data: osProcessadasData, error: erroOSProcessadas } = await queryOSProcessadas;

		if (erroOSProcessadas) {
			console.error("❌ [DASHBOARD] Erro ao buscar faturamento de OS processadas:", erroOSProcessadas);
			break;
		}

		const batchOSProcessadas = osProcessadasData || [];
		batchOSProcessadas.forEach((os: any) => {
			faturamentoOSProcessadas += Number(os.valor_pago || 0);
		});

		if (batchOSProcessadas.length < pageSize) {
			break;
		}

		fromOSProcessadas += pageSize;
		toOSProcessadas += pageSize;
	}

	// Buscar faturamento de OS processadas usando pagamentos reais (não valor_pago)
	let fromOSPagtos = 0;
	let toOSPagtos = pageSize - 1;
	faturamentoOSProcessadas = 0;
	const osProcessadasIds: string[] = [];

	while (true) {
		let queryOSPagtos = supabase
			.from("ordem_servico_pagamentos")
			.select(
				"valor, id_ordem_servico, os:ordem_servico!ordem_servico_pagamentos_id_ordem_servico_fkey(id_loja)"
			)
			.gte("data_pagamento", inicioISO)
			.lte("data_pagamento", fimISO)
			.range(fromOSPagtos, toOSPagtos);

		const { data: osPagtosData, error: erroOSPagtos } = await queryOSPagtos;

		if (erroOSPagtos) {
			console.error("❌ [DASHBOARD] Erro ao buscar pagamentos de OS processadas:", erroOSPagtos);
			break;
		}

		const batchOSPagtos = osPagtosData || [];
		batchOSPagtos.forEach((p: any) => {
			if (loja_id && p.os?.id_loja !== loja_id) return;
			faturamentoOSProcessadas += Number(p.valor || 0);
			if (!osProcessadasIds.includes(p.id_ordem_servico)) {
				osProcessadasIds.push(p.id_ordem_servico);
			}
		});

		if (batchOSPagtos.length < pageSize) {
			break;
		}

		fromOSPagtos += pageSize;
		toOSPagtos += pageSize;
	}

	// Buscar peças dessas OS para calcular custo
		let custOSProcessadas = 0;
	if (osProcessadasIds.length > 0) {
		const { data: pecasProcessadasData, error: erroPecasProcessadas } = await supabase
			.from("ordem_servico_pecas")
			.select("quantidade, produto:produtos!ordem_servico_pecas_id_produto_fkey(preco_compra)")
			.in("id_ordem_servico", osProcessadasIds);

		if (!erroPecasProcessadas && pecasProcessadasData) {
			pecasProcessadasData.forEach((peca: any) => {
				const precoCompra = Number(peca.produto?.preco_compra || 0);
				const quantidade = Number(peca.quantidade || 0);
				custOSProcessadas += precoCompra * quantidade;
			});
		}
	}

	const ganhoOSProcessadas = faturamentoOSProcessadas - custOSProcessadas;
	let queryOSPendentes = supabase
		.from("ordem_servico")
		.select("id", { count: "exact", head: true })
		.not("status", "eq", "entregue")
		.neq("status", "cancelado")
		.or("valor_pago.is.null,valor_pago.eq.0")
		.gte("criado_em", inicioISO)
		.lte("criado_em", fimISO);

	if (loja_id) {
		queryOSPendentes = queryOSPendentes.eq("id_loja", loja_id);
	}

	const { count: osPendentes, error: erroOSPendentes } = await queryOSPendentes;

	if (erroOSPendentes) {
		console.error("❌ [DASHBOARD] Erro ao buscar OS pendentes:", erroOSPendentes);
	}

	// Buscar OS pagas mas não entregues (valor_pago > 0 e status != entregue/cancelado)
	let queryOSPagaNaoEntregue = supabase
		.from("ordem_servico")
		.select("id", { count: "exact", head: true })
		.gt("valor_pago", 0)
		.not("status", "eq", "entregue")
		.neq("status", "cancelado")
		.gte("criado_em", inicioISO)
		.lte("criado_em", fimISO);

	if (loja_id) {
		queryOSPagaNaoEntregue = queryOSPagaNaoEntregue.eq("id_loja", loja_id);
	}

	const { count: osPagasNaoEntregues, error: erroOSPagaNaoEntregue } = await queryOSPagaNaoEntregue;

	if (erroOSPagaNaoEntregue) {
		console.error("❌ [DASHBOARD] Erro ao buscar OS pagas não entregues:", erroOSPagaNaoEntregue);
	}

	// Calcular OS processadas (pagas não entregues + entregues)
	const osProcessadas = (osPagasNaoEntregues || 0) + (osEntregues || 0);

	// Buscar total de transferências
	let queryTotalTransferencias = supabase
		.from("transferencias")
		.select("id", { count: "exact", head: true })
		.gte("criado_em", inicioISO)
		.lte("criado_em", fimISO);

	if (loja_id) {
		// Buscar onde a loja seja origem ou destino
		queryTotalTransferencias = queryTotalTransferencias.or(
			`loja_origem_id.eq.${loja_id},loja_destino_id.eq.${loja_id}`
		);
	}

	const { count: totalTransferencias, error: erroTotalTransferencias } = await queryTotalTransferencias;

	if (erroTotalTransferencias) {
		console.error("❌ [DASHBOARD] Erro ao buscar total de transferências:", erroTotalTransferencias);
	}

	// Buscar transferências pendentes
	let queryTransferenciasPendentes = supabase
		.from("transferencias")
		.select("id", { count: "exact", head: true })
		.eq("status", "pendente")
		.gte("criado_em", inicioISO)
		.lte("criado_em", fimISO);

	if (loja_id) {
		queryTransferenciasPendentes = queryTransferenciasPendentes.or(
			`loja_origem_id.eq.${loja_id},loja_destino_id.eq.${loja_id}`
		);
	}

	const { count: transferenciasPendentes, error: erroTransferenciasPendentes } = await queryTransferenciasPendentes;

	if (erroTransferenciasPendentes) {
		console.error("❌ [DASHBOARD] Erro ao buscar transferências pendentes:", erroTransferenciasPendentes);
	}

	// Buscar total em quebra de peças
	let fromQuebras = 0;
	let toQuebras = pageSize - 1;
	let totalQuebras = 0;
	let quantidadeQuebras = 0;

	while (true) {
		let queryQuebras = supabase
			.from("quebra_pecas")
			.select("valor_total")
			.gte("criado_em", inicioISO)
			.lte("criado_em", fimISO)
			.range(fromQuebras, toQuebras);

		if (loja_id) {
			queryQuebras = queryQuebras.eq("id_loja", loja_id);
		}

		const { data: quebrasData, error: erroQuebras } = await queryQuebras;

		if (erroQuebras) {
			console.error("❌ [DASHBOARD] Erro ao buscar quebra de peças:", erroQuebras);
			break;
		}

		const batchQuebras = quebrasData || [];
		quantidadeQuebras += batchQuebras.length;
		batchQuebras.forEach((q: any) => {
			totalQuebras += Number(q.valor_total || 0);
		});

		if (batchQuebras.length < pageSize) {
			break;
		}

		fromQuebras += pageSize;
		toQuebras += pageSize;
	}

	// Buscar total de crédito de cliente (saldo disponível)
	let fromCreditos = 0;
	let toCreditos = pageSize - 1;
	let totalCreditosCliente = 0;

	while (true) {
		let queryCreditos = supabase
			.from("creditos_cliente")
			.select("saldo, cliente:clientes!creditos_cliente_cliente_id_fkey(id_loja)")
			.gte("criado_em", inicioISO)
			.lte("criado_em", fimISO)
			.range(fromCreditos, toCreditos);

		const { data: creditosData, error: erroCreditos } = await queryCreditos;

		if (erroCreditos) {
			console.error("❌ [DASHBOARD] Erro ao buscar crédito de cliente:", erroCreditos);
			break;
		}

		const batchCreditos = creditosData || [];
		batchCreditos.forEach((c: any) => {
			// Se filtrar por loja, validar que a loja do cliente corresponde
			if (!loja_id || c.cliente?.id_loja === loja_id) {
				totalCreditosCliente += Number(c.saldo || 0);
			}
		});

		if (batchCreditos.length < pageSize) {
			break;
		}

		fromCreditos += pageSize;
		toCreditos += pageSize;
	}

	// Buscar devoluções (com crédito e sem crédito)
	let fromDevolucoes = 0;
	let toDevolucoes = pageSize - 1;
	let devolucoesComCreditoQuantidade = 0;
	let devolucoesComCreditoTotal = 0;
	let devolucoessemCreditoQuantidade = 0;
	let devolucoesemCreditoTotal = 0;

	while (true) {
		let queryDevolucoes = supabase
			.from("devolucoes_venda")
			.select("tipo, valor_total, venda:vendas!devolucoes_venda_venda_id_fkey(loja_id)")
			.gte("criado_em", inicioISO)
			.lte("criado_em", fimISO)
			.range(fromDevolucoes, toDevolucoes);

		const { data: devolucoesData, error: erroDevolucoes } = await queryDevolucoes;

		if (erroDevolucoes) {
			console.error("❌ [DASHBOARD] Erro ao buscar devoluções:", erroDevolucoes);
			break;
		}

		const batchDevolucoes = devolucoesData || [];
		batchDevolucoes.forEach((d: any) => {
			if (loja_id && d.venda?.loja_id !== loja_id) return;

			const valor = Number(d.valor_total || 0);
			if (d.tipo === "com_credito") {
				devolucoesComCreditoQuantidade += 1;
				devolucoesComCreditoTotal += valor;
			} else {
				devolucoessemCreditoQuantidade += 1;
				devolucoesemCreditoTotal += valor;
			}
		});

		if (batchDevolucoes.length < pageSize) {
			break;
		}

		fromDevolucoes += pageSize;
		toDevolucoes += pageSize;
	}

	// Buscar OS pagas por tipo de cliente (lojista e consumidor final)
	// Considerar apenas OS processadas (entregues ou pagas não entregues)
	let osLojistaCount = 0;
	let osConsumidorFinalCount = 0;
	let osSemTipoCount = 0;
	let osLojistaFaturamento = 0;
	let osConsumidorFinalFaturamento = 0;
	let osSemTipoFaturamento = 0;
	let osLojistaLucro = 0;
	let osConsumidorFinalLucro = 0;
	let osSemTipoLucro = 0;
	const osLojistaIds: string[] = [];
	const osConsumidorFinalIds: string[] = [];
	const osSemTipoIds: string[] = [];

	// Query payments from ordem_servico_pagamentos (same logic as "Ganho OS Processadas")
	let fromOSPagtosPorTipo = 0;
	let toOSPagtosPorTipo = pageSize - 1;

	while (true) {
		let queryOSPagtosPorTipo = supabase
			.from("ordem_servico_pagamentos")
			.select(
				"valor, id_ordem_servico, os:ordem_servico!ordem_servico_pagamentos_id_ordem_servico_fkey(id_loja, tipo_cliente)"
			)
			.gte("data_pagamento", inicioISO)
			.lte("data_pagamento", fimISO)
			.range(fromOSPagtosPorTipo, toOSPagtosPorTipo);

		const { data: osPagtosPorTipoData, error: erroOSPagtosPorTipo } = await queryOSPagtosPorTipo;

		if (erroOSPagtosPorTipo) {
			console.error("❌ [DASHBOARD] Erro ao buscar pagamentos por tipo:", erroOSPagtosPorTipo);
			break;
		}

		const batchOSPagtosPorTipo = osPagtosPorTipoData || [];
		batchOSPagtosPorTipo.forEach((p: any) => {
			if (loja_id && p.os?.id_loja !== loja_id) return;

			const valor = Number(p.valor || 0);
			const tipo = p.os?.tipo_cliente || "sem_tipo";

			if (tipo === "lojista") {
				osLojistaFaturamento += valor;
				if (!osLojistaIds.includes(p.id_ordem_servico)) {
					osLojistaIds.push(p.id_ordem_servico);
					osLojistaCount++;
				}
			} else if (tipo === "consumidor_final") {
				osConsumidorFinalFaturamento += valor;
				if (!osConsumidorFinalIds.includes(p.id_ordem_servico)) {
					osConsumidorFinalIds.push(p.id_ordem_servico);
					osConsumidorFinalCount++;
				}
			} else {
				osSemTipoFaturamento += valor;
				if (!osSemTipoIds.includes(p.id_ordem_servico)) {
					osSemTipoIds.push(p.id_ordem_servico);
					osSemTipoCount++;
				}
			}
		});

		if (batchOSPagtosPorTipo.length < pageSize) {
			break;
		}

		fromOSPagtosPorTipo += pageSize;
		toOSPagtosPorTipo += pageSize;
	}

	// Calculate costs for all OS types
	const allOSIds = [...osLojistaIds, ...osConsumidorFinalIds, ...osSemTipoIds];

	if (allOSIds.length > 0) {
		const { data: pecasPorTipoData, error: erroPecasPorTipo } = await supabase
			.from("ordem_servico_pecas")
			.select(
				"quantidade, id_ordem_servico, produto:produtos!ordem_servico_pecas_id_produto_fkey(preco_compra), os:ordem_servico!ordem_servico_pecas_id_ordem_servico_fkey(tipo_cliente)"
			)
			.in("id_ordem_servico", allOSIds);

		if (!erroPecasPorTipo && pecasPorTipoData) {
			pecasPorTipoData.forEach((peca: any) => {
				const precoCompra = Number(peca.produto?.preco_compra || 0);
				const quantidade = Number(peca.quantidade || 0);
				const custo = precoCompra * quantidade;
				const tipo = peca.os?.tipo_cliente || "sem_tipo";

				if (tipo === "lojista") {
					osLojistaLucro += custo;
				} else if (tipo === "consumidor_final") {
					osConsumidorFinalLucro += custo;
				} else {
					osSemTipoLucro += custo;
				}
			});
		}
	}

		// Calculate final profit (revenue - cost)
		osLojistaLucro = osLojistaFaturamento - osLojistaLucro;
		osConsumidorFinalLucro = osConsumidorFinalFaturamento - osConsumidorFinalLucro;
		osSemTipoLucro = osSemTipoFaturamento - osSemTipoLucro;

		return {
			metricas_adicionais: {
				pagamentos_sem_credito_cliente: pagamentosSemCredito,
				pagamentos_os_recebidos: pagamentosOSRecebidos,
				total_vendas: count || 0,
				ganho_total_vendas: lucroVendas,
				ticket_medio: ticketMedio,
				contas_nao_pagas: totalContasNaoPagas,
				total_os: totalOS || 0,
				os_entregues: osEntregues || 0,
				os_pendentes: osPendentes || 0,
				os_pagas_nao_entregues: osPagasNaoEntregues || 0,
				os_processadas: osProcessadas,
				faturamento_os_processadas: faturamentoOSProcessadas,
				ganho_os_processadas: ganhoOSProcessadas,
				faturamento_os: faturamentoOS,
				ganho_os: ganhoOS,
				total_transferencias: totalTransferencias || 0,
				transferencias_pendentes: transferenciasPendentes || 0,
				total_quebras: totalQuebras,
				quantidade_quebras: quantidadeQuebras,
				total_creditos_cliente: totalCreditosCliente,
				os_lojista_pagas: osLojistaCount,
				os_consumidor_final_pagas: osConsumidorFinalCount,
				os_lojista_faturamento: osLojistaFaturamento,
				os_lojista_lucro: osLojistaLucro,
				os_consumidor_final_faturamento: osConsumidorFinalFaturamento,
				os_consumidor_final_lucro: osConsumidorFinalLucro,
				os_sem_tipo_pagas: osSemTipoCount,
				os_sem_tipo_faturamento: osSemTipoFaturamento,
				os_sem_tipo_lucro: osSemTipoLucro,
				devolucoes_com_credito_quantidade: devolucoesComCreditoQuantidade,
				devolucoes_com_credito_total: devolucoesComCreditoTotal,
				devolucoes_sem_credito_quantidade: devolucoessemCreditoQuantidade,
				devolucoes_sem_credito_total: devolucoesemCreditoTotal,
			},
		};
	}
}