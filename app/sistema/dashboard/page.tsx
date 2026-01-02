"use client";

import { useEffect, useMemo, useState } from "react";
import { DashboardService } from "@/services/dashboardService";
import type { DadosDashboard } from "@/types/dashboard";
import { supabase } from "@/lib/supabaseClient";
import { Select, SelectItem } from "@heroui/react";

// Formata número em BRL
const formatarMoeda = (valor: number) =>
	new Intl.NumberFormat("pt-BR", {
		style: "currency",
		currency: "BRL",
	}).format(valor || 0);

export default function DashboardPage() {
	const hojeISO = useMemo(() => new Date().toISOString().split("T")[0], []);
	const [dados, setDados] = useState<DadosDashboard | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// filtros
	const [dataInicio, setDataInicio] = useState<string>("2000-01-01");
	const [dataFim, setDataFim] = useState<string>(hojeISO);
	const [lojaId, setLojaId] = useState<string>("");
	const [lojas, setLojas] = useState<Array<{ id: number; nome: string }>>([]);

	const carregar = async () => {
		try {
			setLoading(true);
			setError(null);
			const data = await DashboardService.buscarDadosDashboard({
				data_inicio: dataInicio || "2000-01-01",
				data_fim: dataFim || hojeISO,
				loja_id: lojaId ? Number(lojaId) : undefined,
			});
			setDados(data);
		} catch (err: any) {
			console.error(err);
			setError("Não foi possível carregar o dashboard.");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		carregar();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// carregar lojas para o select
	useEffect(() => {
		supabase
			.from("lojas")
			.select("id, nome")
			.order("nome")
			.then(({ data, error }) => {
				if (error) {
					console.error("Erro ao buscar lojas:", error);
					return;
				}
				setLojas(data || []);
			});
	}, []);

	return (
		<div className="p-6 space-y-6">
			<header className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
					<p className="text-default-500">
						Pagamentos recebidos sem crédito de cliente
					</p>
				</div>
				<button
					onClick={carregar}
					disabled={loading}
					className="px-4 py-2 rounded-md text-sm font-semibold bg-primary text-white hover:bg-primary/90 disabled:opacity-50"
				>
					{loading ? "Atualizando..." : "Atualizar"}
				</button>
			</header>

			{/* Filtros */}
			<section className="rounded-xl border border-default-200 bg-content1/40 p-4 grid grid-cols-1 md:grid-cols-4 gap-4">
				<div className="flex flex-col gap-1">
					<label className="text-xs font-semibold text-default-600">Data início</label>
					<input
						type="date"
						value={dataInicio}
						onChange={(e) => setDataInicio(e.target.value)}
						className="h-10 rounded-md border border-default-200 px-3 text-sm bg-content1 text-foreground"
					/>
				</div>
				<div className="flex flex-col gap-1">
					<label className="text-xs font-semibold text-default-600">Data fim</label>
					<input
						type="date"
						value={dataFim}
						onChange={(e) => setDataFim(e.target.value)}
						className="h-10 rounded-md border border-default-200 px-3 text-sm bg-content1 text-foreground"
					/>
				</div>
				<div className="flex flex-col gap-1">
					<label className="text-xs font-semibold text-default-600">Loja (opcional)</label>
					<Select
						items={[{ id: "todas", nome: "Todas as lojas" }, ...lojas.map((l) => ({ id: l.id.toString(), nome: l.nome }))]}
						selectedKeys={[lojaId || "todas"]}
						onSelectionChange={(keys) => {
							const value = Array.from(keys)[0] as string;
							setLojaId(value === "todas" ? "" : value);
						}}
						className="h-10"
						disallowEmptySelection
						renderValue={(items) => items[0]?.data?.nome || "Todas as lojas"}
					>
						{(item) => (
							<SelectItem key={item.id}>{item.nome}</SelectItem>
						)}
					</Select>
				</div>
				<div className="flex items-end justify-start gap-2">
					<button
						onClick={carregar}
						disabled={loading}
						className="h-10 px-4 rounded-md text-sm font-semibold bg-primary text-white hover:bg-primary/90 disabled:opacity-50"
					>
						{loading ? "Aplicando..." : "Aplicar filtros"}
					</button>
					<button
						onClick={() => {
							setDataInicio("2000-01-01");
							setDataFim(hojeISO);
							setLojaId("");
							carregar();
						}}
						disabled={loading}
						className="h-10 px-3 rounded-md text-sm font-semibold border border-default-200 text-default-700 hover:bg-default-100 disabled:opacity-50"
					>
						Limpar
					</button>
				</div>
			</section>

			{error && (
				<div className="rounded-md border border-danger/30 bg-danger/5 text-danger px-4 py-3">
					{error}
				</div>
			)}

			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
				<div className="rounded-xl border border-success/20 bg-gradient-to-br from-green-50 to-emerald-50 p-6 shadow-sm">
					<div className="flex items-start justify-between gap-3">
						<div className="space-y-1">
							<p className="text-sm font-medium text-success">
								Pagamentos Recebidos
							</p>
							<p className="text-xs text-default-500">
								Exclui tipo pagamento = credito cliente
							</p>
							<p className="text-3xl font-bold text-foreground mt-2">
								{loading
									? "..."
									: formatarMoeda(
											dados?.metricas_adicionais.pagamentos_sem_credito_cliente ||
												0
										)}
							</p>
						</div>
						<div className="flex h-10 w-10 items-center justify-center rounded-full bg-success/20 text-success font-bold">
							$
						</div>
					</div>
					<p className="mt-4 text-sm text-default-600">
						Soma de todos os pagamentos de vendas recebidos no período padrão, ignorando créditos de cliente.
					</p>
				</div>

				<div className="rounded-xl border border-primary/20 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 shadow-sm">
					<div className="flex items-start justify-between gap-3">
						<div className="space-y-1">
							<p className="text-sm font-medium text-primary">
								Total de Vendas
							</p>
							<p className="text-xs text-default-500">
								Exclui vendas canceladas
							</p>
							<p className="text-3xl font-bold text-foreground mt-2">
								{loading
									? "..."
									: (dados?.metricas_adicionais.total_vendas || 0).toLocaleString(
											"pt-BR"
										)}
							</p>
						</div>
						<div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-primary font-bold text-lg">
							🛒
						</div>
					</div>
					<p className="mt-4 text-sm text-default-600">
						Quantidade total de vendas realizadas no período filtrado.
					</p>
				</div>

				<div className="rounded-xl border border-warning/20 bg-gradient-to-br from-amber-50 to-yellow-50 p-6 shadow-sm">
					<div className="flex items-start justify-between gap-3">
						<div className="space-y-1">
							<p className="text-sm font-medium text-warning">
								Ganho com Vendas
							</p>
							<p className="text-xs text-default-500">
								Lucro (Recebido - Custo)
							</p>
							<p className="text-3xl font-bold text-foreground mt-2">
								{loading
									? "..."
									: formatarMoeda(
											dados?.metricas_adicionais.ganho_total_vendas ||
												0
										)}
							</p>
						</div>
						<div className="flex h-10 w-10 items-center justify-center rounded-full bg-warning/20 text-warning font-bold text-lg">
							💰
						</div>
					</div>
					<p className="mt-4 text-sm text-default-600">
						Lucro real: pagamentos recebidos menos o custo dos produtos das vendas pagas.
					</p>
				</div>

				<div className="rounded-xl border border-secondary/20 bg-gradient-to-br from-purple-50 to-pink-50 p-6 shadow-sm">
					<div className="flex items-start justify-between gap-3">
						<div className="space-y-1">
							<p className="text-sm font-medium text-secondary">
								Ticket Médio
							</p>
							<p className="text-xs text-default-500">
								Valor médio por venda
							</p>
							<p className="text-3xl font-bold text-foreground mt-2">
								{loading
									? "..."
									: formatarMoeda(
											dados?.metricas_adicionais.ticket_medio ||
												0
										)}
							</p>
						</div>
						<div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary/20 text-secondary font-bold text-lg">
							📊
						</div>
					</div>
					<p className="mt-4 text-sm text-default-600">
						Média de valor recebido por venda realizada.
					</p>
				</div>

				<div className="rounded-xl border border-danger/20 bg-gradient-to-br from-red-50 to-rose-50 p-6 shadow-sm">
					<div className="flex items-start justify-between gap-3">
						<div className="space-y-1">
							<p className="text-sm font-medium text-danger">
								Contas Não Pagas
							</p>
							<p className="text-xs text-default-500">
								Valor pendente de recebimento
							</p>
							<p className="text-3xl font-bold text-foreground mt-2">
								{loading
									? "..."
									: formatarMoeda(
											dados?.metricas_adicionais.contas_nao_pagas ||
												0
										)}
							</p>
						</div>
						<div className="flex h-10 w-10 items-center justify-center rounded-full bg-danger/20 text-danger font-bold text-lg">
							⚠️
						</div>
					</div>
					<p className="mt-4 text-sm text-default-600">
						Soma dos valores ainda não recebidos de vendas realizadas.
					</p>
				</div>
			</div>
		</div>
	);
}
