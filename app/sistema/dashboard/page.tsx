"use client";

import type { DadosDashboard } from "@/types/dashboard";

import { useEffect, useMemo, useState } from "react";
import { Select, SelectItem } from "@heroui/react";
import { useTheme } from "next-themes";
import {
  FaDollarSign,
  FaShoppingCart,
  FaMoneyBillWave,
  FaChartBar,
  FaExclamationTriangle,
  FaTools,
  FaCheckCircle,
  FaMoneyBill,
  FaGem,
  FaBox,
  FaHourglass,
  FaHeartBroken,
  FaCreditCard,
  FaUserTie,
  FaQuestion,
  FaChartLine,
  FaTrophy,
  FaUsers,
  FaBriefcase,
} from "react-icons/fa";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend as ChartLegend,
  Filler,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { Line } from "react-chartjs-2";

import { supabase } from "@/lib/supabaseClient";
import { DashboardService } from "@/services/dashboardService";
import { usePermissoes } from "@/hooks/usePermissoes";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  ChartTooltip,
  ChartLegend,
  Filler,
  ChartDataLabels,
);

// Formata número em BRL
const formatarMoeda = (valor: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor || 0);

const CORES_GRAFICOS = [
  "#3B82F6", // azul
  "#10B981", // verde
  "#F59E0B", // amarelo
  "#EF4444", // vermelho
  "#8B5CF6", // roxo
  "#EC4899", // rosa
  "#14B8A6", // teal
  "#F97316", // laranja
  "#06B6D4", // cyan
  "#6366F1", // índigo
];

export default function DashboardPage() {
  const { theme } = useTheme();
  const hojeISO = useMemo(() => new Date().toISOString().split("T")[0], []);

  // Calcular primeiro dia do mês atual
  const primeiroDiaDoMes = useMemo(() => {
    const hoje = new Date();

    return new Date(hoje.getFullYear(), hoje.getMonth(), 1)
      .toISOString()
      .split("T")[0];
  }, []);

  const [dados, setDados] = useState<DadosDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { temPermissao, loading: permissoesLoading } = usePermissoes();

  // filtros - começar do primeiro dia do mês
  const [dataInicio, setDataInicio] = useState<string>(primeiroDiaDoMes);
  const [dataFim, setDataFim] = useState<string>(hojeISO);
  const [lojaId, setLojaId] = useState<string>("");
  const [lojas, setLojas] = useState<Array<{ id: number; nome: string }>>([]);

  // Dados dos gráficos
  const [evolucaoVendas, setEvolucaoVendas] = useState<any[]>([]);
  const [top10Produtos, setTop10Produtos] = useState<any[]>([]);
  const [top10Clientes, setTop10Clientes] = useState<any[]>([]);
  const [top10Vendedores, setTop10Vendedores] = useState<any[]>([]);
  const [loadingGraficos, setLoadingGraficos] = useState(false);

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

      // Carregar dados dos gráficos
      await carregarGraficos();
    } catch (err: any) {
      console.error(err);
      setError("Não foi possível carregar o dashboard.");
    } finally {
      setLoading(false);
    }
  };

  const carregarGraficos = async () => {
    try {
      setLoadingGraficos(true);
      const filtro = {
        data_inicio: dataInicio || "2000-01-01",
        data_fim: dataFim || hojeISO,
        loja_id: lojaId ? Number(lojaId) : undefined,
      };

      const [evolucao, produtos, clientes, vendedores] = await Promise.all([
        DashboardService.buscarEvolucaoVendas(filtro),
        DashboardService.buscarTop10Produtos(filtro),
        DashboardService.buscarTop10Clientes(filtro),
        DashboardService.buscarTop10Vendedores(filtro),
      ]);

      console.log("📊 Dados dos Gráficos Carregados:");
      console.log("Evolução de Vendas:", evolucao);
      console.log("Top 10 Produtos:", produtos);
      console.log("Top 10 Clientes:", clientes);
      console.log("Top 10 Vendedores:", vendedores);

      setEvolucaoVendas(evolucao);
      setTop10Produtos(produtos);
      setTop10Clientes(clientes);
      setTop10Vendedores(vendedores);
    } catch (err) {
      console.error("Erro ao carregar gráficos:", err);
    } finally {
      setLoadingGraficos(false);
    }
  };

  useEffect(() => {
    // Carregar dados apenas se tiver permissão
    if (!permissoesLoading && temPermissao("dashboard.visualizar")) {
      carregar();
    }
  }, [permissoesLoading]);

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
      {permissoesLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-2">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
            <p className="text-default-500">Carregando...</p>
          </div>
        </div>
      ) : !temPermissao("dashboard.visualizar") ? (
        <div className="rounded-xl border border-danger/30 bg-danger/5 text-danger px-6 py-4 flex items-center gap-3">
          <FaExclamationTriangle className="text-lg flex-shrink-0" />
          <div>
            <h3 className="font-semibold">Acesso Negado</h3>
            <p className="text-sm">
              Você não tem permissão para acessar o dashboard. Contacte um
              administrador para solicitar acesso.
            </p>
          </div>
        </div>
      ) : (
        <>
          <header className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
              <p className="text-default-500">
                Pagamentos recebidos sem crédito de cliente
              </p>
            </div>
            <button
              className="px-4 py-2 rounded-md text-sm font-semibold bg-primary text-white hover:bg-primary/90 disabled:opacity-50"
              disabled={loading}
              onClick={carregar}
            >
              {loading ? "Atualizando..." : "Atualizar"}
            </button>
          </header>

          {/* Filtros */}
          <section className="rounded-xl border border-default-200 bg-content1/40 p-4 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex flex-col gap-1">
              <label
                className="text-xs font-semibold text-default-600"
                htmlFor="dashboard-data-inicio"
              >
                Data início
              </label>
              <input
                className="h-10 rounded-md border border-default-200 px-3 text-sm bg-content1 text-foreground"
                id="dashboard-data-inicio"
                type="date"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label
                className="text-xs font-semibold text-default-600"
                htmlFor="dashboard-data-fim"
              >
                Data fim
              </label>
              <input
                className="h-10 rounded-md border border-default-200 px-3 text-sm bg-content1 text-foreground"
                id="dashboard-data-fim"
                type="date"
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-xs font-semibold text-default-600">
                Loja (opcional)
              </p>
              <Select
                disallowEmptySelection
                className="h-10"
                items={[
                  { id: "todas", nome: "Todas as lojas" },
                  ...lojas.map((l) => ({ id: l.id.toString(), nome: l.nome })),
                ]}
                renderValue={(items) =>
                  items[0]?.data?.nome || "Todas as lojas"
                }
                selectedKeys={[lojaId || "todas"]}
                onSelectionChange={(keys) => {
                  const value = Array.from(keys)[0] as string;

                  setLojaId(value === "todas" ? "" : value);
                }}
              >
                {(item) => <SelectItem key={item.id}>{item.nome}</SelectItem>}
              </Select>
            </div>
            <div className="flex items-end justify-start gap-2">
              <button
                className="h-10 px-4 rounded-md text-sm font-semibold bg-primary text-white hover:bg-primary/90 disabled:opacity-50"
                disabled={loading}
                onClick={carregar}
              >
                {loading ? "Aplicando..." : "Aplicar filtros"}
              </button>
              <button
                className="h-10 px-3 rounded-md text-sm font-semibold border border-default-200 text-default-700 hover:bg-default-100 disabled:opacity-50"
                disabled={loading}
                onClick={() => {
                  setDataInicio("2000-01-01");
                  setDataFim(hojeISO);
                  setLojaId("");
                  carregar();
                }}
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

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">Vendas</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="rounded-xl border border-emerald-200 dark:border-emerald-800 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-900 p-6 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-success dark:text-green-400">
                      Pagamentos Recebidos
                    </p>
                    <p className="text-xs text-default-500 dark:text-white">
                      Exclui tipo pagamento = credito cliente
                    </p>
                    <p className="text-3xl font-bold text-foreground mt-2">
                      {loading
                        ? "..."
                        : formatarMoeda(
                            dados?.metricas_adicionais
                              .pagamentos_sem_credito_cliente || 0,
                          )}
                    </p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success/20 text-success text-lg">
                    <FaDollarSign />
                  </div>
                </div>
                <p className="mt-4 text-sm text-default-600">
                  Soma de todos os pagamentos de vendas recebidos no período
                  padrão, ignorando créditos de cliente.
                </p>
              </div>

              <div className="rounded-xl border border-indigo-200 dark:border-indigo-800 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-900 p-6 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-primary dark:text-blue-400">
                      Total de Vendas
                    </p>
                    <p className="text-xs text-default-500 dark:text-white">
                      Exclui vendas canceladas
                    </p>
                    <p className="text-3xl font-bold text-foreground mt-2">
                      {loading
                        ? "..."
                        : (
                            dados?.metricas_adicionais.total_vendas || 0
                          ).toLocaleString("pt-BR")}
                    </p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-primary text-lg">
                    <FaShoppingCart />
                  </div>
                </div>
                <p className="mt-4 text-sm text-default-600">
                  Quantidade total de vendas realizadas no período filtrado.
                </p>
              </div>

              <div className="rounded-xl border border-yellow-200 dark:border-orange-800 bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950 dark:to-orange-900 p-6 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-warning dark:text-amber-400">
                      Ganho com Vendas
                    </p>
                    <p className="text-xs text-default-500 dark:text-white">
                      Lucro (Recebido - Custo)
                    </p>
                    <p className="text-3xl font-bold text-foreground mt-2">
                      {loading
                        ? "..."
                        : formatarMoeda(
                            dados?.metricas_adicionais.ganho_total_vendas || 0,
                          )}
                    </p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-warning/20 text-warning text-lg">
                    <FaMoneyBillWave />
                  </div>
                </div>
                <p className="mt-4 text-sm text-default-600">
                  Lucro real: pagamentos recebidos menos o custo dos produtos
                  das vendas pagas.
                </p>
              </div>

              <div className="rounded-xl border border-pink-200 dark:border-pink-800 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-900 p-6 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-secondary dark:text-purple-400">
                      Ticket Médio
                    </p>
                    <p className="text-xs text-default-500 dark:text-white">
                      Valor médio por venda
                    </p>
                    <p className="text-3xl font-bold text-foreground mt-2">
                      {loading
                        ? "..."
                        : formatarMoeda(
                            dados?.metricas_adicionais.ticket_medio || 0,
                          )}
                    </p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary/20 text-secondary text-lg">
                    <FaChartBar />
                  </div>
                </div>
                <p className="mt-4 text-sm text-default-600">
                  Média de valor recebido por venda realizada.
                </p>
              </div>

              <div className="rounded-xl border border-rose-200 dark:border-rose-800 bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950 dark:to-rose-900 p-6 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-danger dark:text-red-400">
                      Contas Não Pagas
                    </p>
                    <p className="text-xs text-default-500 dark:text-white">
                      Valor pendente de recebimento
                    </p>
                    <p className="text-3xl font-bold text-foreground mt-2">
                      {loading
                        ? "..."
                        : formatarMoeda(
                            dados?.metricas_adicionais.contas_nao_pagas || 0,
                          )}
                    </p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-danger/20 text-danger text-lg">
                    <FaExclamationTriangle />
                  </div>
                </div>
                <p className="mt-4 text-sm text-default-600">
                  Soma dos valores ainda não recebidos de vendas realizadas.
                </p>
              </div>
            </div>
          </section>

          {/* Cards de Ordem de Serviço */}
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">
              Ordens de Serviço
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="rounded-xl border border-emerald-200 dark:border-emerald-800 bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-950 dark:to-emerald-900 p-6 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-teal-700 dark:text-teal-400">
                      Faturamento OS Processadas
                    </p>
                    <p className="text-xs text-default-500 dark:text-white">
                      Pagas não entregues + Entregues
                    </p>
                    <p className="text-3xl font-bold text-foreground mt-2">
                      {loading
                        ? "..."
                        : formatarMoeda(
                            dados?.metricas_adicionais
                              .faturamento_os_processadas || 0,
                          )}
                    </p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-500/20 text-teal-700 text-lg">
                    <FaMoneyBill />
                  </div>
                </div>
                <p className="mt-4 text-sm text-default-600">
                  Valor total faturado em OS processadas.
                </p>
              </div>
              <div className="rounded-xl border border-sky-200 dark:border-sky-800 bg-gradient-to-br from-cyan-50 to-sky-50 dark:from-cyan-950 dark:to-sky-900 p-6 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-info dark:text-cyan-400">
                      Total de OS
                    </p>
                    <p className="text-xs text-default-500 dark:text-white">
                      Ordem de serviço
                    </p>
                    <p className="text-3xl font-bold text-foreground mt-2">
                      {loading
                        ? "..."
                        : (
                            dados?.metricas_adicionais.total_os || 0
                          ).toLocaleString("pt-BR")}
                    </p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-info/20 text-info text-lg">
                    <FaTools />
                  </div>
                </div>
                <p className="mt-4 text-sm text-default-600">
                  Quantidade total de ordens de serviço criadas.
                </p>
              </div>

              <div className="rounded-xl border border-yellow-200 dark:border-orange-800 bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950 dark:to-orange-900 p-6 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-warning dark:text-amber-400">
                      Aguardando Entrega
                    </p>
                    <p className="text-xs text-default-500 dark:text-white">
                      Já recebeu pagamento, falta entregar
                    </p>
                    <p className="text-3xl font-bold text-foreground mt-2">
                      {loading
                        ? "..."
                        : (
                            dados?.metricas_adicionais.os_pagas_nao_entregues ||
                            0
                          ).toLocaleString("pt-BR")}
                    </p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-warning/20 text-warning text-lg">
                    <FaMoneyBillWave />
                  </div>
                </div>
                <p className="mt-4 text-sm text-default-600">
                  Pagas mas ainda não entregues; priorize a entrega/baixa do
                  status.
                </p>
              </div>

              <div className="rounded-xl border border-rose-200 dark:border-rose-800 bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950 dark:to-rose-900 p-6 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-danger dark:text-red-400">
                      Aguardando Pagamento
                    </p>
                    <p className="text-xs text-default-500 dark:text-white">
                      Serviço pronto, aguardando cliente pagar
                    </p>
                    <p className="text-3xl font-bold text-foreground mt-2">
                      {loading
                        ? "..."
                        : (
                            dados?.metricas_adicionais.os_pendentes || 0
                          ).toLocaleString("pt-BR")}
                    </p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-danger/20 text-danger text-lg">
                    <FaHourglass />
                  </div>
                </div>
                <p className="mt-4 text-sm text-default-600">
                  Total de OS que aguardam conclusão ou entrega.
                </p>
              </div>

              <div className="rounded-xl border border-green-200 dark:border-green-800 bg-gradient-to-br from-lime-50 to-green-50 dark:from-lime-950 dark:to-green-900 p-6 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-lime-700 dark:text-lime-400">
                      Ganho OS Processadas
                    </p>
                    <p className="text-xs text-default-500 dark:text-white">
                      Lucro (Faturamento - Custo)
                    </p>
                    <p className="text-3xl font-bold text-foreground mt-2">
                      {loading
                        ? "..."
                        : formatarMoeda(
                            dados?.metricas_adicionais.ganho_os_processadas ||
                              0,
                          )}
                    </p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-lime-500/20 text-lime-700 text-lg">
                    <FaGem />
                  </div>
                </div>
                <p className="mt-4 text-sm text-default-600">
                  Lucro real em OS processadas: faturamento menos o custo das
                  peças.
                </p>
              </div>

              <div className="rounded-xl border border-cyan-200 dark:border-cyan-800 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-900 p-6 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-blue-700 dark:text-blue-400">
                      OS Processadas
                    </p>
                    <p className="text-xs text-default-500 dark:text-white">
                      Pagas não entregues + Entregues
                    </p>
                    <p className="text-3xl font-bold text-foreground mt-2">
                      {loading
                        ? "..."
                        : (
                            dados?.metricas_adicionais.os_processadas || 0
                          ).toLocaleString("pt-BR")}
                    </p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/20 text-blue-700 text-lg">
                    <FaCheckCircle />
                  </div>
                </div>
                <p className="mt-4 text-sm text-default-600">
                  Total de OS que foram pagas (não entregues) ou já entregues.
                </p>
              </div>
            </div>
          </section>

          {/* Cards de OS por Tipo de Cliente */}
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">
              OS por Tipo de Cliente (Pagas)
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-xl border border-purple-200 dark:border-purple-800 bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950 dark:to-purple-900 p-6 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-violet-700 dark:text-violet-400">
                      OS para Lojista
                    </p>
                    <p className="text-xs text-default-500 dark:text-white">
                      Ordens de serviço pagas
                    </p>
                    <div className="space-y-3 mt-2">
                      <div>
                        <p className="text-xs text-default-500">Quantidade</p>
                        <p className="text-2xl font-bold text-foreground">
                          {loading
                            ? "..."
                            : (
                                dados?.metricas_adicionais.os_lojista_pagas || 0
                              ).toLocaleString("pt-BR")}
                        </p>
                      </div>
                      <div className="border-t border-violet-200 dark:border-violet-800 pt-3">
                        <p className="text-xs text-default-500 mb-1">
                          Valor Recebido
                        </p>
                        <p className="text-xl font-bold text-violet-700">
                          {loading
                            ? "..."
                            : formatarMoeda(
                                dados?.metricas_adicionais
                                  .os_lojista_faturamento || 0,
                              )}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-default-500 mb-1">Lucro</p>
                        <p className="text-xl font-bold text-lime-600">
                          {loading
                            ? "..."
                            : formatarMoeda(
                                dados?.metricas_adicionais.os_lojista_lucro ||
                                  0,
                              )}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-500/20 text-violet-700 text-lg flex-shrink-0">
                    <FaShoppingCart />
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950 dark:to-amber-900 p-6 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-orange-700 dark:text-orange-400">
                      OS para Cliente Final
                    </p>
                    <p className="text-xs text-default-500 dark:text-white">
                      Ordens de serviço pagas
                    </p>
                    <div className="space-y-3 mt-2">
                      <div>
                        <p className="text-xs text-default-500">Quantidade</p>
                        <p className="text-2xl font-bold text-foreground">
                          {loading
                            ? "..."
                            : (
                                dados?.metricas_adicionais
                                  .os_consumidor_final_pagas || 0
                              ).toLocaleString("pt-BR")}
                        </p>
                      </div>
                      <div className="border-t border-orange-200 dark:border-orange-800 pt-3">
                        <p className="text-xs text-default-500 mb-1">
                          Valor Recebido
                        </p>
                        <p className="text-xl font-bold text-orange-700">
                          {loading
                            ? "..."
                            : formatarMoeda(
                                dados?.metricas_adicionais
                                  .os_consumidor_final_faturamento || 0,
                              )}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-default-500 mb-1">Lucro</p>
                        <p className="text-xl font-bold text-lime-600">
                          {loading
                            ? "..."
                            : formatarMoeda(
                                dados?.metricas_adicionais
                                  .os_consumidor_final_lucro || 0,
                              )}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500/20 text-orange-700 text-lg flex-shrink-0">
                    <FaUserTie />
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-950 dark:to-gray-900 p-6 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-400">
                      OS Sem Tipo Definido
                    </p>
                    <p className="text-xs text-default-500 dark:text-white">
                      Ordens de serviço pagas
                    </p>
                    <div className="space-y-3 mt-2">
                      <div>
                        <p className="text-xs text-default-500">Quantidade</p>
                        <p className="text-2xl font-bold text-foreground">
                          {loading
                            ? "..."
                            : (
                                dados?.metricas_adicionais.os_sem_tipo_pagas ||
                                0
                              ).toLocaleString("pt-BR")}
                        </p>
                      </div>
                      <div className="border-t border-slate-200 dark:border-slate-800 pt-3">
                        <p className="text-xs text-default-500 mb-1">
                          Valor Recebido
                        </p>
                        <p className="text-xl font-bold text-slate-700">
                          {loading
                            ? "..."
                            : formatarMoeda(
                                dados?.metricas_adicionais
                                  .os_sem_tipo_faturamento || 0,
                              )}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-default-500 mb-1">Lucro</p>
                        <p className="text-xl font-bold text-lime-600">
                          {loading
                            ? "..."
                            : formatarMoeda(
                                dados?.metricas_adicionais.os_sem_tipo_lucro ||
                                  0,
                              )}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-500/20 text-slate-700 text-lg flex-shrink-0">
                    <FaQuestion />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Cards de Transferências */}
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">
              Transferências
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-xl border border-blue-200 dark:border-blue-800 bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950 dark:to-blue-900 p-6 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-cyan-700 dark:text-cyan-400">
                      Total de Transferências
                    </p>
                    <p className="text-xs text-default-500 dark:text-white">
                      Transferências realizadas
                    </p>
                    <p className="text-3xl font-bold text-foreground mt-2">
                      {loading
                        ? "..."
                        : (
                            dados?.metricas_adicionais.total_transferencias || 0
                          ).toLocaleString("pt-BR")}
                    </p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-700 text-lg">
                    <FaBox />
                  </div>
                </div>
                <p className="mt-4 text-sm text-default-600">
                  Quantidade total de transferências entre lojas no período.
                </p>
              </div>

              <div className="rounded-xl border border-yellow-200 dark:border-yellow-800 bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-950 dark:to-yellow-900 p-6 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-orange-700 dark:text-orange-400">
                      Transferências Pendentes
                    </p>
                    <p className="text-xs text-default-500 dark:text-white">
                      Status pendente
                    </p>
                    <p className="text-3xl font-bold text-foreground mt-2">
                      {loading
                        ? "..."
                        : (
                            dados?.metricas_adicionais
                              .transferencias_pendentes || 0
                          ).toLocaleString("pt-BR")}
                    </p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500/20 text-orange-700 text-lg">
                    <FaHourglass />
                  </div>
                </div>
                <p className="mt-4 text-sm text-default-600">
                  Total de transferências aguardando confirmação.
                </p>
              </div>
            </div>
          </section>

          {/* Cards de Quebra de Peças, Crédito, Devoluções */}
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">
              Quebras, Créditos e Devoluções
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="rounded-xl border border-rose-200 dark:border-rose-800 bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950 dark:to-rose-900 p-6 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-red-700 dark:text-red-400">
                      Total em Quebra de Peças
                    </p>
                    <p className="text-xs text-default-500 dark:text-white">
                      Perdas registradas
                    </p>
                    <div className="space-y-2 mt-2">
                      <p className="text-3xl font-bold text-foreground">
                        {loading
                          ? "..."
                          : formatarMoeda(
                              dados?.metricas_adicionais.total_quebras || 0,
                            )}
                      </p>
                      <p className="text-sm font-semibold text-red-600">
                        {loading
                          ? "..."
                          : `${dados?.metricas_adicionais.quantidade_quebras || 0} quebras`}
                      </p>
                    </div>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/20 text-red-700 text-lg">
                    <FaHeartBroken />
                  </div>
                </div>
                <p className="mt-4 text-sm text-default-600">
                  Soma do valor total de peças quebradas registradas.
                </p>
              </div>

              <div className="rounded-xl border border-purple-200 dark:border-purple-800 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-900 p-6 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-indigo-700 dark:text-indigo-400">
                      Total Crédito de Cliente
                    </p>
                    <p className="text-xs text-default-500 dark:text-white">
                      Saldo disponível
                    </p>
                    <p className="text-3xl font-bold text-foreground mt-2">
                      {loading
                        ? "..."
                        : formatarMoeda(
                            dados?.metricas_adicionais.total_creditos_cliente ||
                              0,
                          )}
                    </p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-700 text-lg">
                    <FaCreditCard />
                  </div>
                </div>
                <p className="mt-4 text-sm text-default-600">
                  Saldo total de créditos disponíveis dos clientes.
                </p>
              </div>

              <div className="rounded-xl border border-yellow-200 dark:border-yellow-800 bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950 dark:to-yellow-900 p-6 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
                      Devoluções c/ Crédito
                    </p>
                    <p className="text-xs text-default-500 dark:text-white">
                      Cliente recebe crédito
                    </p>
                    <div className="space-y-2 mt-2">
                      <p className="text-3xl font-bold text-foreground">
                        {loading
                          ? "..."
                          : formatarMoeda(
                              dados?.metricas_adicionais
                                .devolucoes_com_credito_total || 0,
                            )}
                      </p>
                      <p className="text-sm font-semibold text-amber-600">
                        {loading
                          ? "..."
                          : `${dados?.metricas_adicionais.devolucoes_com_credito_quantidade || 0} devoluções`}
                      </p>
                    </div>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/20 text-amber-700 text-lg">
                    <FaBox />
                  </div>
                </div>
                <p className="mt-4 text-sm text-default-600">
                  Devoluções processadas como crédito para o cliente.
                </p>
              </div>

              <div className="rounded-xl border border-rose-200 dark:border-rose-800 bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-950 dark:to-rose-900 p-6 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-pink-700 dark:text-pink-400">
                      Devoluções s/ Crédito
                    </p>
                    <p className="text-xs text-default-500 dark:text-white">
                      Reembolsos diretos
                    </p>
                    <div className="space-y-2 mt-2">
                      <p className="text-3xl font-bold text-foreground">
                        {loading
                          ? "..."
                          : formatarMoeda(
                              dados?.metricas_adicionais
                                .devolucoes_sem_credito_total || 0,
                            )}
                      </p>
                      <p className="text-sm font-semibold text-pink-600">
                        {loading
                          ? "..."
                          : `${dados?.metricas_adicionais.devolucoes_sem_credito_quantidade || 0} devoluções`}
                      </p>
                    </div>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-pink-500/20 text-pink-700 text-lg">
                    <FaMoneyBill />
                  </div>
                </div>
                <p className="mt-4 text-sm text-default-600">
                  Devoluções reembolsadas diretamente ao cliente.
                </p>
              </div>
            </div>
          </section>

          {/* SEÇÃO DE GRÁFICOS */}
          {!loading && (
            <section className="space-y-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded" />
                <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Análises Detalhadas
                </h2>
              </div>

              {/* Gráfico de Evolução de Vendas e Receita */}
              <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2.5 bg-blue-500/20 rounded-lg">
                    <FaChartLine className="text-2xl text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">
                      Evolução de Vendas e Receita
                    </h3>
                    <p className="text-sm text-default-500">
                      Visualize o crescimento diário das vendas e faturamento
                    </p>
                  </div>
                </div>
                {loadingGraficos ? (
                  <div className="h-96 flex items-center justify-center">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-b-blue-500 mx-auto mb-3" />
                      <p className="text-default-500">Carregando gráfico...</p>
                    </div>
                  </div>
                ) : evolucaoVendas.length > 0 ? (
                  <div className="h-[420px]">
                    <Line
                      data={{
                        labels: evolucaoVendas.map((item) => {
                          const [ano, mes, dia] = item.data.split("-");

                          return `${dia}/${mes}`;
                        }),
                        datasets: [
                          {
                            label: "Vendas",
                            data: evolucaoVendas.map((item) => item.vendas),
                            borderColor:
                              theme === "dark" ? "#60A5FA" : "#3B82F6",
                            backgroundColor:
                              theme === "dark"
                                ? "rgba(96, 165, 250, 0.1)"
                                : "rgba(59, 130, 246, 0.08)",
                            borderWidth: 2.5,
                            tension: 0.4,
                            fill: true,
                            pointRadius: 4,
                            pointHoverRadius: 6,
                            pointBackgroundColor:
                              theme === "dark" ? "#60A5FA" : "#3B82F6",
                            pointBorderColor:
                              theme === "dark" ? "#60A5FA" : "#3B82F6",
                            pointBorderWidth: 0,
                            pointHoverBackgroundColor:
                              theme === "dark" ? "#93C5FD" : "#2563EB",
                            pointHoverBorderColor:
                              theme === "dark" ? "#93C5FD" : "#2563EB",
                            pointHoverBorderWidth: 0,
                            yAxisID: "y",
                          },
                          {
                            label: "Receita (R$)",
                            data: evolucaoVendas.map((item) => item.receita),
                            borderColor:
                              theme === "dark" ? "#34D399" : "#10B981",
                            backgroundColor:
                              theme === "dark"
                                ? "rgba(52, 211, 153, 0.1)"
                                : "rgba(16, 185, 129, 0.08)",
                            borderWidth: 2.5,
                            tension: 0.4,
                            fill: true,
                            pointRadius: 4,
                            pointHoverRadius: 6,
                            pointBackgroundColor:
                              theme === "dark" ? "#34D399" : "#10B981",
                            pointBorderColor:
                              theme === "dark" ? "#34D399" : "#10B981",
                            pointBorderWidth: 0,
                            pointHoverBackgroundColor:
                              theme === "dark" ? "#6EE7B7" : "#059669",
                            pointHoverBorderColor:
                              theme === "dark" ? "#6EE7B7" : "#059669",
                            pointHoverBorderWidth: 0,
                            yAxisID: "y1",
                          },
                        ],
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        interaction: {
                          mode: "index",
                          intersect: false,
                        },
                        plugins: {
                          legend: {
                            display: true,
                            position: "top",
                            labels: {
                              usePointStyle: true,
                              padding: 20,
                              font: { size: 15, weight: 600 },
                              color: theme === "dark" ? "#f3f4f6" : "#1f2937",
                            },
                          },
                          tooltip: {
                            backgroundColor:
                              theme === "dark" ? "#0f172a" : "#111827",
                            titleColor: "#f9fafb",
                            bodyColor: "#f3f4f6",
                            borderColor:
                              theme === "dark" ? "#475569" : "#4b5563",
                            borderWidth: 1,
                            padding: 16,
                            titleFont: { size: 15, weight: "bold" },
                            bodyFont: { size: 14 },
                            displayColors: true,
                            boxWidth: 12,
                            boxHeight: 12,
                            callbacks: {
                              label: (context) => {
                                const label = context.dataset.label || "";
                                const value = context.parsed.y;

                                if (label.includes("Receita")) {
                                  return `${label}: ${formatarMoeda(value ?? 0)}`;
                                }

                                return `${label}: ${value ?? 0}`;
                              },
                            },
                          },
                        },
                        scales: {
                          y: {
                            type: "linear",
                            display: true,
                            position: "left",
                            grid: {
                              color: theme === "dark" ? "#334155" : "#d1d5db",
                              lineWidth: 1,
                            },
                            ticks: {
                              font: { size: 13, weight: 500 },
                              color: theme === "dark" ? "#cbd5e1" : "#4b5563",
                              padding: 8,
                            },
                            title: {
                              display: true,
                              text: "Vendas",
                              color: theme === "dark" ? "#60A5FA" : "#2563EB",
                              font: { size: 14, weight: "bold" },
                              padding: { top: 10, bottom: 10 },
                            },
                          },
                          y1: {
                            type: "linear",
                            display: true,
                            position: "right",
                            grid: { drawOnChartArea: false },
                            ticks: {
                              font: { size: 13, weight: 500 },
                              color: theme === "dark" ? "#cbd5e1" : "#4b5563",
                              padding: 8,
                            },
                            title: {
                              display: true,
                              text: "Receita (R$)",
                              color: theme === "dark" ? "#34D399" : "#059669",
                              font: { size: 14, weight: "bold" },
                              padding: { top: 10, bottom: 10 },
                            },
                          },
                          x: {
                            grid: { display: false },
                            ticks: {
                              font: { size: 13, weight: 500 },
                              color: theme === "dark" ? "#cbd5e1" : "#4b5563",
                              padding: 8,
                            },
                          },
                        },
                      }}
                    />
                  </div>
                ) : (
                  <div className="h-96 flex flex-col items-center justify-center text-default-500">
                    <span className="text-4xl mb-3">📭</span>
                    <p>Nenhum dado disponível para o período</p>
                  </div>
                )}
              </div>

              {/* Grid de Gráficos */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Top 10 Produtos */}
                <div className="rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950 p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2.5 bg-amber-500/20 rounded-lg">
                      <FaTrophy className="text-2xl text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-foreground">
                        Top 10 Produtos
                      </h3>
                      <p className="text-sm text-default-500">
                        Produtos mais vendidos
                      </p>
                    </div>
                  </div>
                  {loadingGraficos ? (
                    <div className="h-96 flex items-center justify-center">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-200 border-b-amber-500 mx-auto mb-3" />
                        <p className="text-default-500">Carregando...</p>
                      </div>
                    </div>
                  ) : top10Produtos.length > 0 ? (
                    <div className="space-y-3">
                      {top10Produtos.map((produto, index) => (
                        <div
                          key={produto.produto_id}
                          className="flex items-center gap-3"
                        >
                          <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-bold text-amber-700">
                              #{index + 1}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <p
                                className="text-sm font-semibold text-foreground truncate"
                                title={produto.descricao}
                              >
                                {produto.descricao}
                              </p>
                              <span className="text-sm font-bold text-amber-600 ml-2">
                                {produto.quantidade.toLocaleString("pt-BR")} un
                              </span>
                            </div>
                            <div className="relative h-8 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                              <div
                                className="absolute inset-y-0 left-0 bg-gradient-to-r from-amber-400 to-orange-500 rounded-lg transition-all duration-500"
                                style={{
                                  width: `${Math.min((produto.quantidade / top10Produtos[0].quantidade) * 100, 100)}%`,
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="h-96 flex flex-col items-center justify-center text-default-500">
                      <span className="text-4xl mb-3">📭</span>
                      <p>Nenhum dado disponível</p>
                    </div>
                  )}
                </div>

                {/* Top 5 Clientes */}
                <div className="rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2.5 bg-green-500/20 rounded-lg">
                      <FaUsers className="text-2xl text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-foreground">
                        Top 10 Clientes
                      </h3>
                      <p className="text-sm text-default-500">
                        Clientes com maior faturamento
                      </p>
                    </div>
                  </div>
                  {loadingGraficos ? (
                    <div className="h-96 flex items-center justify-center">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-200 border-b-green-500 mx-auto mb-3" />
                        <p className="text-default-500">Carregando...</p>
                      </div>
                    </div>
                  ) : top10Clientes.length > 0 ? (
                    <div className="space-y-3">
                      {top10Clientes.map((cliente, index) => (
                        <div
                          key={cliente.cliente_id}
                          className="flex items-center gap-3"
                        >
                          <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-bold text-green-700">
                              #{index + 1}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <p
                                className="text-sm font-semibold text-foreground truncate"
                                title={cliente.cliente_nome}
                              >
                                {cliente.cliente_nome}
                              </p>
                              <div className="flex items-center gap-2 ml-2">
                                <span className="text-xs font-medium text-green-500">
                                  {cliente.total_vendas} vendas
                                </span>
                                <span className="text-sm font-bold text-green-600">
                                  {formatarMoeda(cliente.receita_total)}
                                </span>
                              </div>
                            </div>
                            <div className="relative h-8 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                              <div
                                className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-400 to-emerald-500 rounded-lg transition-all duration-500"
                                style={{
                                  width: `${Math.min((cliente.receita_total / top10Clientes[0].receita_total) * 100, 100)}%`,
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="h-96 flex flex-col items-center justify-center text-default-500">
                      <span className="text-4xl mb-3">📭</span>
                      <p>Nenhum dado disponível</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Top 10 Vendedores */}
              <div className="rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2.5 bg-purple-500/20 rounded-lg">
                    <FaBriefcase className="text-2xl text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">
                      Top 10 Vendedores
                    </h3>
                    <p className="text-sm text-default-500">
                      Vendedores com melhor performance
                    </p>
                  </div>
                </div>
                {loadingGraficos ? (
                  <div className="h-96 flex items-center justify-center">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-b-purple-500 mx-auto mb-3" />
                      <p className="text-default-500">Carregando...</p>
                    </div>
                  </div>
                ) : top10Vendedores.length > 0 ? (
                  <div className="space-y-3">
                    {top10Vendedores.map((vendedor, index) => (
                      <div
                        key={vendedor.vendedor_id}
                        className="flex items-center gap-3"
                      >
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                            <span className="text-xs font-bold text-purple-700">
                              #{index + 1}
                            </span>
                          </div>
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                            {vendedor.vendedor_nome
                              .split(" ")
                              .slice(0, 2)
                              .map((n: string) => n[0])
                              .join("")
                              .toUpperCase()}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p
                              className="text-sm font-semibold text-foreground truncate"
                              title={vendedor.vendedor_nome}
                            >
                              {vendedor.vendedor_nome}
                            </p>
                            <div className="flex items-center gap-2 ml-2">
                              <span className="text-xs font-medium text-purple-500">
                                {vendedor.total_vendas} vendas
                              </span>
                              <span className="text-sm font-bold text-purple-600">
                                {formatarMoeda(vendedor.receita_total)}
                              </span>
                            </div>
                          </div>
                          <div className="relative h-8 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                            <div
                              className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-400 to-pink-500 rounded-lg transition-all duration-500"
                              style={{
                                width: `${Math.min((vendedor.receita_total / top10Vendedores[0].receita_total) * 100, 100)}%`,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-96 flex flex-col items-center justify-center text-default-500">
                    <span className="text-4xl mb-3">📭</span>
                    <p>Nenhum dado disponível</p>
                  </div>
                )}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
