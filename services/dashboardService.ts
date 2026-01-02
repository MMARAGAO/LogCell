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

		return {
			metricas_adicionais: {
				pagamentos_sem_credito_cliente: pagamentosSemCredito,
				total_vendas: count || 0,
				ganho_total_vendas: lucroVendas,
				ticket_medio: ticketMedio,
				contas_nao_pagas: totalContasNaoPagas,
			},
		};
	}
}
