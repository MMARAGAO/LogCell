"use client";

import { useState, useEffect } from "react";
import { useAuthContext } from "@/contexts/AuthContext";
import DashboardTecnico from "@/components/dashboard/DashboardTecnico";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Select,
  SelectItem,
  Chip,
  Spinner,
  Input,
} from "@heroui/react";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Wrench,
  AlertTriangle,
  Package,
  Users,
  Calendar,
  Clock,
  Filter,
  ChevronDown,
  ChevronUp,
  Building2,
  CalendarDays,
  Check,
  X,
  Wallet,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { DashboardService } from "@/services/dashboardService";
import type { DadosDashboard } from "@/types/dashboard";
import { usePermissoes } from "@/hooks/usePermissoes";
import { useLojaFilter } from "@/hooks/useLojaFilter";
import { supabase } from "@/lib/supabaseClient";

const CORES_GRAFICOS = [
  "#3b82f6", // blue
  "#10b981", // green
  "#f59e0b", // amber
  "#ef4444", // red
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#14b8a6", // teal
  "#f97316", // orange
];

export default function DashboardPage() {
  const { usuario } = useAuthContext();
  const {
    temPermissao,
    temAlgumaPermissao,
    loading: loadingPermissoes,
  } = usePermissoes();
  const { lojaId, podeVerTodasLojas } = useLojaFilter();
  const [loading, setLoading] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [dados, setDados] = useState<DadosDashboard | null>(null);
  const [lojas, setLojas] = useState<Array<{ id: number; nome: string }>>([]);
  const [filtroLoja, setFiltroLoja] = useState<string>("todas");
  const [filtroDataInicio, setFiltroDataInicio] = useState<string>("");
  const [filtroDataFim, setFiltroDataFim] = useState<string>("");
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  // Estados temporários para os filtros (antes de aplicar)
  const [filtroLojaTemp, setFiltroLojaTemp] = useState<string>("todas");
  const [filtroDataInicioTemp, setFiltroDataInicioTemp] = useState<string>("");
  const [filtroDataFimTemp, setFiltroDataFimTemp] = useState<string>("");

  // Funções auxiliares (devem vir antes do useEffect)
  const carregarDados = async (isInitialLoad = false) => {
    try {
      if (isInitialLoad) {
        setLoading(true);
      } else {
        setAtualizando(true);
      }

      // Usar filtros personalizados se definidos, senão buscar desde o início (sem limite)
      // Atualizado: busca desde 2000-01-01 para mostrar todos os dados históricos
      let dataInicio: string;
      let dataFim: string;

      if (filtroDataInicio && filtroDataFim) {
        // Validar se as datas são válidas
        const testeInicio = new Date(filtroDataInicio);
        const testeFim = new Date(filtroDataFim);

        if (isNaN(testeInicio.getTime()) || isNaN(testeFim.getTime())) {
          // Se datas inválidas, usar valores padrão
          const hoje = new Date();
          dataFim = hoje.toISOString().split("T")[0];
          dataInicio = "2000-01-01";
        } else {
          // Se filtros manuais estão definidos e são válidos, usar eles
          dataInicio = filtroDataInicio;
          dataFim = filtroDataFim;
        }
      } else {
        // Senão, buscar desde o início (2000-01-01) até hoje
        const hoje = new Date();
        dataFim = hoje.toISOString().split("T")[0];
        dataInicio = "2000-01-01"; // Data bem antiga para pegar tudo desde o início
      }

      // Adicionar filtro de loja se selecionado
      const lojaIdFiltro =
        filtroLoja !== "todas" ? parseInt(filtroLoja) : undefined;

      const dadosDashboard = await DashboardService.buscarDadosDashboard({
        data_inicio: dataInicio,
        data_fim: dataFim,
        loja_id: lojaIdFiltro,
      });

      setDados(dadosDashboard);
    } catch (error) {
      console.error("Erro ao carregar dashboard:", error);
    } finally {
      if (isInitialLoad) {
        setLoading(false);
      } else {
        setAtualizando(false);
      }
    }
  };

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor);
  };

  const formatarPercentual = (valor: number) => {
    return `${valor >= 0 ? "+" : ""}${valor.toFixed(1)}%`;
  };

  // Componente de Tooltip customizado para os gráficos
  const CustomTooltip = ({ active, payload, label, formatter }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-content1 border border-divider rounded-lg shadow-lg p-3">
          {label && (
            <p className="text-sm font-semibold text-foreground mb-2">
              {formatter?.labelFormatter
                ? formatter.labelFormatter(label)
                : label}
            </p>
          )}
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-default-600">{entry.name}:</span>
              <span className="font-semibold text-foreground">
                {formatter?.valueFormatter
                  ? formatter.valueFormatter(entry.value, entry.name)
                  : entry.value}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  // Verificar permissões (deve vir depois das funções mas antes do useEffect)
  const podeVerVendas = temAlgumaPermissao([
    "vendas.visualizar",
    "dashboard.visualizar",
  ]);
  const podeVerOS = temAlgumaPermissao([
    "os.visualizar",
    "dashboard.visualizar",
  ]);
  const podeVerEstoque = temAlgumaPermissao([
    "estoque.visualizar",
    "dashboard.visualizar",
  ]);

  // Carregar lojas disponíveis
  useEffect(() => {
    async function buscarLojas() {
      try {
        // Buscar lojas sem filtro de ativa primeiro
        let query = supabase.from("lojas").select("id, nome").order("nome");

        const { data, error } = await query;

        if (error) {
          console.error("Erro ao buscar lojas:", error);
          console.log("🏪 [Dashboard] Tentando buscar lojas sem filtro...");

          // Tentar sem filtro de ativa
          const { data: dataAll, error: errorAll } = await supabase
            .from("lojas")
            .select("id, nome")
            .order("nome");

          if (errorAll) {
            console.error("Erro ao buscar todas as lojas:", errorAll);
            return;
          }

          console.log("🏪 [Dashboard] Lojas carregadas (todas):", dataAll);
          setLojas(dataAll || []);
          return;
        }

        console.log("🏪 [Dashboard] Lojas carregadas:", data);
        setLojas(data || []);
      } catch (error) {
        console.error("Erro ao buscar lojas (catch):", error);
      }
    }

    buscarLojas();
  }, []);

  // Carregamento inicial
  useEffect(() => {
    carregarDados(true);
  }, []);

  // Recarregamento quando filtros mudam
  useEffect(() => {
    if (!loading) {
      carregarDados(false);
    }
  }, [filtroLoja, filtroDataInicio, filtroDataFim]);

  // Se for técnico, mostrar dashboard simplificado
  if (usuario?.tipo_usuario === "tecnico") {
    return <DashboardTecnico />;
  }

  // Verificar permissão de visualizar dashboard
  if (!loadingPermissoes && !temPermissao("dashboard.visualizar")) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold text-danger mb-4">Acesso Negado</h1>
        <p className="text-default-500">
          Você não tem permissão para visualizar o dashboard.
        </p>
      </div>
    );
  }

  if (loading || loadingPermissoes) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!dados) {
    return (
      <div className="flex items-center justify-center h-96">
        <p>Erro ao carregar dados do dashboard</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overlay de loading quando está atualizando */}
      {atualizando && (
        <div className="fixed inset-0 bg-background/60 backdrop-blur-sm z-50 flex items-center justify-center">
          <Card className="border-none shadow-xl">
            <CardBody className="p-6 flex flex-col items-center gap-3">
              <Spinner size="lg" color="primary" />
              <p className="text-foreground font-medium">
                Atualizando dados...
              </p>
            </CardBody>
          </Card>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-default-500">Visão geral do negócio</p>
        </div>
        <Button
          size="sm"
          variant="flat"
          startContent={<Filter className="w-4 h-4" />}
          endContent={
            mostrarFiltros ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )
          }
          onPress={() => setMostrarFiltros(!mostrarFiltros)}
        >
          {mostrarFiltros ? "Ocultar Filtros" : "Mostrar Filtros"}
        </Button>
      </div>

      {/* Filtros Avançados (Retrátil) */}
      {mostrarFiltros && (
        <Card className="border-none shadow-md bg-gradient-to-br from-content1 to-content2">
          <CardBody className="p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Filter className="w-5 h-5 text-primary" />
                Filtros Avançados
              </h3>
              <p className="text-sm text-default-500 mt-1">
                Configure os filtros e clique em "Aplicar" para atualizar os
                dados
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              <Select
                label="Loja"
                placeholder="Selecione uma loja"
                selectedKeys={[filtroLojaTemp]}
                onSelectionChange={(keys) => {
                  const selected = Array.from(keys)[0] as string;
                  setFiltroLojaTemp(selected);
                }}
                size="md"
                variant="bordered"
                startContent={
                  <Building2 className="w-4 h-4 text-default-400" />
                }
                classNames={{
                  trigger: "h-12 hover:border-primary transition-colors",
                  label: "text-default-700 font-medium",
                }}
                items={[{ id: 0, nome: "Todas as Lojas" }, ...lojas]}
              >
                {(loja) => (
                  <SelectItem
                    key={loja.id === 0 ? "todas" : loja.id.toString()}
                  >
                    {loja.nome}
                  </SelectItem>
                )}
              </Select>

              <Input
                type="date"
                label="Data Início"
                placeholder="Selecione a data"
                value={filtroDataInicioTemp}
                onChange={(e) => setFiltroDataInicioTemp(e.target.value)}
                size="md"
                variant="bordered"
                startContent={<Calendar className="w-4 h-4 text-default-400" />}
                classNames={{
                  input: "text-sm",
                  inputWrapper: "h-12 hover:border-primary transition-colors",
                  label: "text-default-700 font-medium",
                }}
              />

              <Input
                type="date"
                label="Data Fim"
                placeholder="Selecione a data"
                value={filtroDataFimTemp}
                onChange={(e) => setFiltroDataFimTemp(e.target.value)}
                size="md"
                variant="bordered"
                startContent={
                  <CalendarDays className="w-4 h-4 text-default-400" />
                }
                classNames={{
                  input: "text-sm",
                  inputWrapper: "h-12 hover:border-primary transition-colors",
                  label: "text-default-700 font-medium",
                }}
              />
            </div>

            <div className="flex flex-wrap gap-3 pt-2 border-t border-divider">
              <Button
                size="md"
                color="primary"
                variant="shadow"
                startContent={<Check className="w-4 h-4" />}
                onPress={() => {
                  setFiltroLoja(filtroLojaTemp);
                  setFiltroDataInicio(filtroDataInicioTemp);
                  setFiltroDataFim(filtroDataFimTemp);
                }}
                className="flex-1 sm:flex-initial font-semibold min-w-[160px]"
              >
                Aplicar Filtros
              </Button>
              <Button
                size="md"
                variant="flat"
                color="default"
                startContent={<X className="w-4 h-4" />}
                onPress={() => {
                  setFiltroLojaTemp("todas");
                  setFiltroDataInicioTemp("");
                  setFiltroDataFimTemp("");
                  setFiltroLoja("todas");
                  setFiltroDataInicio("");
                  setFiltroDataFim("");
                }}
                className="flex-1 sm:flex-initial min-w-[140px]"
              >
                Limpar Filtros
              </Button>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Cards de Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Faturamento */}
        {podeVerVendas && (
          <Card className="border-none shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
            <CardBody className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-success/10 rounded-xl">
                    <DollarSign className="w-6 h-6 text-success" />
                  </div>
                  <div>
                    <p className="text-sm text-default-500 font-medium">
                      Faturamento
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      {formatarMoeda(dados.metricas.faturamento_total)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                {dados.metricas.variacao_faturamento >= 0 ? (
                  <TrendingUp className="w-4 h-4 text-success" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-danger" />
                )}
                <span
                  className={`text-sm font-semibold ${
                    dados.metricas.variacao_faturamento >= 0
                      ? "text-success"
                      : "text-danger"
                  }`}
                >
                  {formatarPercentual(dados.metricas.variacao_faturamento)}
                </span>
                <span className="text-sm text-default-500">
                  vs período anterior
                </span>
              </div>
            </CardBody>
          </Card>
        )}

        {/* Vendas */}
        {podeVerVendas && (
          <Card className="border-none shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
            <CardBody className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-primary/10 rounded-xl">
                    <ShoppingCart className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-default-500 font-medium">
                      Vendas
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      {dados.metricas.total_vendas}
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                {dados.metricas.variacao_vendas >= 0 ? (
                  <TrendingUp className="w-4 h-4 text-success" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-danger" />
                )}
                <span
                  className={`text-sm font-semibold ${
                    dados.metricas.variacao_vendas >= 0
                      ? "text-success"
                      : "text-danger"
                  }`}
                >
                  {formatarPercentual(dados.metricas.variacao_vendas)}
                </span>
                <span className="text-sm text-default-500">
                  vs período anterior
                </span>
              </div>
            </CardBody>
          </Card>
        )}

        {/* Ticket Médio */}
        {podeVerVendas && (
          <Card className="border-none shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
            <CardBody className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-warning/10 rounded-xl">
                    <DollarSign className="w-6 h-6 text-warning" />
                  </div>
                  <div>
                    <p className="text-sm text-default-500 font-medium">
                      Ticket Médio
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      {formatarMoeda(dados.metricas.ticket_medio)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                {dados.metricas.variacao_ticket_medio >= 0 ? (
                  <TrendingUp className="w-4 h-4 text-success" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-danger" />
                )}
                <span
                  className={`text-sm font-semibold ${
                    dados.metricas.variacao_ticket_medio >= 0
                      ? "text-success"
                      : "text-danger"
                  }`}
                >
                  {formatarPercentual(dados.metricas.variacao_ticket_medio)}
                </span>
                <span className="text-sm text-default-500">
                  vs período anterior
                </span>
              </div>
            </CardBody>
          </Card>
        )}

        {/* Ordens de Serviço */}
        {podeVerOS && (
          <Card className="border-none shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
            <CardBody className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-secondary/10 rounded-xl">
                    <Wrench className="w-6 h-6 text-secondary" />
                  </div>
                  <div>
                    <p className="text-sm text-default-500 font-medium">
                      Ordens de Serviço
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      {dados.metricas.os_abertas}
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <span className="text-sm text-success font-semibold">
                  {dados.metricas.os_concluidas}
                </span>
                <span className="text-sm text-default-500">concluídas</span>
                {dados.metricas.os_atrasadas > 0 && (
                  <>
                    <span className="text-sm text-danger font-semibold">
                      {dados.metricas.os_atrasadas}
                    </span>
                    <span className="text-sm text-default-500">atrasadas</span>
                  </>
                )}
              </div>
            </CardBody>
          </Card>
        )}
      </div>

      {/* Novos Cards de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Vendas Fiadas */}
        {podeVerVendas && (
          <Card className="border-none shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
            <CardBody className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-danger/10 rounded-xl">
                    <AlertTriangle className="w-6 h-6 text-danger" />
                  </div>
                  <div>
                    <p className="text-sm text-default-500 font-medium">
                      Vendas Fiadas
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      {dados.metricas.vendas_fiadas || 0}
                    </p>
                    <p className="text-sm font-semibold text-danger mt-1">
                      {formatarMoeda(dados.metricas.valor_vendas_fiadas || 0)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                {(dados.metricas.variacao_vendas_fiadas || 0) >= 0 ? (
                  <TrendingUp className="w-4 h-4 text-danger" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-success" />
                )}
                <span
                  className={`text-sm font-semibold ${
                    (dados.metricas.variacao_vendas_fiadas || 0) >= 0
                      ? "text-danger"
                      : "text-success"
                  }`}
                >
                  {formatarPercentual(
                    dados.metricas.variacao_vendas_fiadas || 0
                  )}
                </span>
                <span className="text-sm text-default-500">
                  vs período anterior
                </span>
              </div>
            </CardBody>
          </Card>
        )}

        {/* Ganho com Vendas */}
        {podeVerVendas && (
          <Card className="border-none shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
            <CardBody className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-success/10 rounded-xl">
                    <Wallet className="w-6 h-6 text-success" />
                  </div>
                  <div>
                    <p className="text-sm text-default-500 font-medium">
                      Ganho com Vendas
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      {formatarMoeda(dados.metricas.ganho_vendas || 0)}
                    </p>
                    <p className="text-xs text-default-400 mt-1">
                      Recebido no período
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                {(dados.metricas.variacao_ganho_vendas || 0) >= 0 ? (
                  <TrendingUp className="w-4 h-4 text-success" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-danger" />
                )}
                <span
                  className={`text-sm font-semibold ${
                    (dados.metricas.variacao_ganho_vendas || 0) >= 0
                      ? "text-success"
                      : "text-danger"
                  }`}
                >
                  {formatarPercentual(
                    dados.metricas.variacao_ganho_vendas || 0
                  )}
                </span>
                <span className="text-sm text-default-500">
                  vs período anterior
                </span>
              </div>
            </CardBody>
          </Card>
        )}

        {/* Ganho com OS */}
        {podeVerOS && (
          <Card className="border-none shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
            <CardBody className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-secondary/10 rounded-xl">
                    <Wallet className="w-6 h-6 text-secondary" />
                  </div>
                  <div>
                    <p className="text-sm text-default-500 font-medium">
                      Ganho com OS
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      {formatarMoeda(dados.metricas.ganho_os || 0)}
                    </p>
                    <p className="text-xs text-default-400 mt-1">
                      Recebido no período
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                {(dados.metricas.variacao_ganho_os || 0) >= 0 ? (
                  <TrendingUp className="w-4 h-4 text-success" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-danger" />
                )}
                <span
                  className={`text-sm font-semibold ${
                    (dados.metricas.variacao_ganho_os || 0) >= 0
                      ? "text-success"
                      : "text-danger"
                  }`}
                >
                  {formatarPercentual(dados.metricas.variacao_ganho_os || 0)}
                </span>
                <span className="text-sm text-default-500">
                  vs período anterior
                </span>
              </div>
            </CardBody>
          </Card>
        )}

        {/* Faturamento de Vendas */}
        {podeVerVendas && (
          <Card className="border-none shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
            <CardBody className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-primary/10 rounded-xl">
                    <ShoppingCart className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-default-500 font-medium">
                      Faturamento Vendas
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      {formatarMoeda(dados.metricas.faturamento_vendas || 0)}
                    </p>
                    <p className="text-xs text-default-400 mt-1">
                      Valor total vendido
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                {(dados.metricas.variacao_faturamento_vendas || 0) >= 0 ? (
                  <TrendingUp className="w-4 h-4 text-success" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-danger" />
                )}
                <span
                  className={`text-sm font-semibold ${
                    (dados.metricas.variacao_faturamento_vendas || 0) >= 0
                      ? "text-success"
                      : "text-danger"
                  }`}
                >
                  {formatarPercentual(
                    dados.metricas.variacao_faturamento_vendas || 0
                  )}
                </span>
                <span className="text-sm text-default-500">
                  vs período anterior
                </span>
              </div>
            </CardBody>
          </Card>
        )}

        {/* Faturamento de OS */}
        {podeVerOS && (
          <Card className="border-none shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
            <CardBody className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-secondary/10 rounded-xl">
                    <Wrench className="w-6 h-6 text-secondary" />
                  </div>
                  <div>
                    <p className="text-sm text-default-500 font-medium">
                      Faturamento OS
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      {formatarMoeda(dados.metricas.faturamento_os || 0)}
                    </p>
                    <p className="text-xs text-default-400 mt-1">
                      Valor total faturado
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                {(dados.metricas.variacao_faturamento_os || 0) >= 0 ? (
                  <TrendingUp className="w-4 h-4 text-success" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-danger" />
                )}
                <span
                  className={`text-sm font-semibold ${
                    (dados.metricas.variacao_faturamento_os || 0) >= 0
                      ? "text-success"
                      : "text-danger"
                  }`}
                >
                  {formatarPercentual(
                    dados.metricas.variacao_faturamento_os || 0
                  )}
                </span>
                <span className="text-sm text-default-500">
                  vs período anterior
                </span>
              </div>
            </CardBody>
          </Card>
        )}

        {/* Lucro de Vendas */}
        {podeVerVendas && (
          <Card className="border-none shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
            <CardBody className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-success/10 rounded-xl">
                    <TrendingUp className="w-6 h-6 text-success" />
                  </div>
                  <div>
                    <p className="text-sm text-default-500 font-medium">
                      Lucro de Vendas
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      {formatarMoeda(dados.metricas.lucro_vendas || 0)}
                    </p>
                    <p className="text-xs text-default-400 mt-1">
                      Receita - Custo
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                {(dados.metricas.variacao_lucro_vendas || 0) >= 0 ? (
                  <TrendingUp className="w-4 h-4 text-success" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-danger" />
                )}
                <span
                  className={`text-sm font-semibold ${
                    (dados.metricas.variacao_lucro_vendas || 0) >= 0
                      ? "text-success"
                      : "text-danger"
                  }`}
                >
                  {formatarPercentual(
                    dados.metricas.variacao_lucro_vendas || 0
                  )}
                </span>
                <span className="text-sm text-default-500">
                  vs período anterior
                </span>
              </div>
            </CardBody>
          </Card>
        )}

        {/* Lucro de OS */}
        {podeVerOS && (
          <Card className="border-none shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
            <CardBody className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-success/10 rounded-xl">
                    <TrendingUp className="w-6 h-6 text-success" />
                  </div>
                  <div>
                    <p className="text-sm text-default-500 font-medium">
                      Lucro de OS
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      {formatarMoeda(dados.metricas.lucro_os || 0)}
                    </p>
                    <p className="text-xs text-default-400 mt-1">
                      Receita - Custo peças
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                {(dados.metricas.variacao_lucro_os || 0) >= 0 ? (
                  <TrendingUp className="w-4 h-4 text-success" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-danger" />
                )}
                <span
                  className={`text-sm font-semibold ${
                    (dados.metricas.variacao_lucro_os || 0) >= 0
                      ? "text-success"
                      : "text-danger"
                  }`}
                >
                  {formatarPercentual(dados.metricas.variacao_lucro_os || 0)}
                </span>
                <span className="text-sm text-default-500">
                  vs período anterior
                </span>
              </div>
            </CardBody>
          </Card>
        )}
      </div>

      {/* Contas a Receber */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-none shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
          <CardBody className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-warning/10 rounded-xl">
                  <Clock className="w-6 h-6 text-warning" />
                </div>
                <div>
                  <p className="text-sm text-default-500 font-medium">
                    Contas a Receber
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {formatarMoeda(
                      dados.metricas_adicionais.contas_receber_total
                    )}
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <span className="text-sm text-default-500">
                {dados.metricas_adicionais.contas_receber_qtd} vendas pendentes
              </span>
            </div>
          </CardBody>
        </Card>

        {/* Transferências Pendentes */}
        <Card className="border-none shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
          <CardBody className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-secondary/10 rounded-xl">
                  <Package className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <p className="text-sm text-default-500 font-medium">
                    Transferências Pendentes
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {dados.metricas_adicionais.transferencias_pendentes}
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <span className="text-sm text-default-500">
                Aguardando confirmação
              </span>
            </div>
          </CardBody>
        </Card>

        {/* Devoluções do Mês */}
        <Card className="border-none shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
          <CardBody className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-danger/10 rounded-xl">
                  <AlertTriangle className="w-6 h-6 text-danger" />
                </div>
                <div>
                  <p className="text-sm text-default-500 font-medium">
                    Devoluções no Período
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {dados.metricas_adicionais.devolucoes_mes}
                  </p>
                  <p className="text-sm font-semibold text-danger mt-1">
                    {formatarMoeda(
                      dados.metricas_adicionais.valor_devolucoes_mes
                    )}
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <span className="text-sm text-default-500">Total devolvido</span>
            </div>
          </CardBody>
        </Card>

        {/* Todas as Sangrias */}
        <Card className="border-none shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
          <CardBody className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-success/10 rounded-xl">
                  <DollarSign className="w-6 h-6 text-success" />
                </div>
                <div>
                  <p className="text-sm text-default-500 font-medium">
                    Todas as Sangrias
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {dados.metricas_adicionais.movimentacoes_caixa_dia}
                  </p>
                  <p className="text-sm font-semibold text-success mt-1">
                    {formatarMoeda(
                      dados.metricas_adicionais.valor_movimentacoes_caixa_dia
                    )}
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <span className="text-sm text-default-500">
                Retiradas de caixa no período
              </span>
            </div>
          </CardBody>
        </Card>

        {/* Créditos de Clientes */}
        <Card className="border-none shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
          <CardBody className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-xl">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-default-500 font-medium">
                    Créditos Clientes
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {formatarMoeda(
                      dados.metricas_adicionais.creditos_cliente_total
                    )}
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <span className="text-sm text-default-500">
                Crédito disponível
              </span>
            </div>
          </CardBody>
        </Card>

        {/* Taxa de Conversão OS */}
        <Card className="border-none shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
          <CardBody className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-success/10 rounded-xl">
                  <Wrench className="w-6 h-6 text-success" />
                </div>
                <div>
                  <p className="text-sm text-default-500 font-medium">
                    Taxa Conversão OS
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {dados.metricas_adicionais.taxa_conversao_os.toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <span className="text-sm text-default-500">
                OS aprovadas/total
              </span>
            </div>
          </CardBody>
        </Card>

        {/* Tempo Médio de Reparo */}
        <Card className="border-none shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
          <CardBody className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-secondary/10 rounded-xl">
                  <Calendar className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <p className="text-sm text-default-500 font-medium">
                    Tempo Médio Reparo
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {dados.metricas_adicionais.tempo_medio_reparo_dias.toFixed(
                      1
                    )}{" "}
                    dias
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <span className="text-sm text-default-500">
                Entrada até conclusão
              </span>
            </div>
          </CardBody>
        </Card>

        {/* Quebras de Peças - Valor Total */}
        <Card className="border-none shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
          <CardBody className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-danger/10 rounded-xl">
                  <AlertTriangle className="w-6 h-6 text-danger" />
                </div>
                <div>
                  <p className="text-sm text-default-500 font-medium">
                    Quebras de Peças
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {formatarMoeda(
                      dados.metricas_adicionais.quebras_total_valor
                    )}
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-4 flex justify-between text-sm">
              <span className="text-default-500">
                {dados.metricas_adicionais.quebras_total_quantidade} peças
                quebradas
              </span>
              {dados.metricas_adicionais.quebras_pendentes_aprovacao > 0 && (
                <span className="text-warning font-medium">
                  {dados.metricas_adicionais.quebras_pendentes_aprovacao}{" "}
                  pendentes
                </span>
              )}
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Evolução de Vendas */}
        <Card className="col-span-1 lg:col-span-2 border-none shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.01]">
          <CardHeader className="pb-4">
            <h3 className="font-bold text-lg text-foreground">
              Evolução de Vendas
            </h3>
          </CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dados.vendas_por_dia}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="data"
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return `${date.getDate()}/${date.getMonth() + 1}`;
                  }}
                />
                <YAxis />
                <Tooltip
                  content={
                    <CustomTooltip
                      formatter={{
                        valueFormatter: (value: number, name: string) => {
                          if (name === "Quantidade") return value;
                          return formatarMoeda(value);
                        },
                        labelFormatter: (label: string) =>
                          new Date(label).toLocaleDateString("pt-BR"),
                      }}
                    />
                  }
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="valor"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="Faturamento"
                />
                <Line
                  type="monotone"
                  dataKey="quantidade"
                  stroke="#10b981"
                  strokeWidth={2}
                  name="Quantidade"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        {/* Top Produtos */}
        <Card className="border-none shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
          <CardHeader className="pb-4">
            <h3 className="font-bold text-lg text-foreground">
              Top 5 Produtos Mais Vendidos
            </h3>
          </CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dados.top_produtos.slice(0, 5)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="produto_nome" hide />
                <YAxis />
                <Tooltip
                  content={
                    <CustomTooltip
                      formatter={{
                        valueFormatter: (value: number) => `${value} unidades`,
                      }}
                    />
                  }
                />
                <Bar dataKey="quantidade" name="Quantidade">
                  {dados.top_produtos.slice(0, 5).map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={CORES_GRAFICOS[index % CORES_GRAFICOS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            {/* Legenda Customizada */}
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              {dados.top_produtos.slice(0, 5).map((produto, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded"
                    style={{
                      backgroundColor:
                        CORES_GRAFICOS[index % CORES_GRAFICOS.length],
                    }}
                  />
                  <span className="text-sm text-foreground">
                    {produto.produto_nome}
                  </span>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* Formas de Pagamento */}
        <Card className="border-none shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
          <CardHeader className="pb-4">
            <h3 className="font-bold text-lg text-foreground">
              Formas de Pagamento
            </h3>
          </CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={dados.formas_pagamento as any}
                  dataKey="valor"
                  nameKey="forma"
                  cx="50%"
                  cy="50%"
                  outerRadius={120}
                  label={(entry: any) =>
                    entry.percentual >= 5
                      ? `${entry.percentual.toFixed(0)}%`
                      : ""
                  }
                  labelLine={false}
                >
                  {dados.formas_pagamento.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={CORES_GRAFICOS[index % CORES_GRAFICOS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  content={
                    <CustomTooltip
                      formatter={{
                        valueFormatter: (value: number) => formatarMoeda(value),
                      }}
                    />
                  }
                />
                <Legend
                  formatter={(value: string, entry: any) =>
                    `${entry.payload.forma}: ${entry.payload.percentual?.toFixed(1) || 0}%`
                  }
                />
              </PieChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
      </div>

      {/* Novos Gráficos Analíticos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Faturamento Mensal */}
        <Card className="col-span-1 lg:col-span-2 border-none shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.01]">
          <CardHeader className="pb-4">
            <h3 className="font-bold text-lg text-foreground">
              Faturamento Mensal (Últimos 6 Meses)
            </h3>
          </CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dados.faturamento_mensal}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="mes"
                  tickFormatter={(value) => {
                    const [ano, mes] = value.split("-");
                    const meses = [
                      "Jan",
                      "Fev",
                      "Mar",
                      "Abr",
                      "Mai",
                      "Jun",
                      "Jul",
                      "Ago",
                      "Set",
                      "Out",
                      "Nov",
                      "Dez",
                    ];
                    return meses[parseInt(mes) - 1];
                  }}
                />
                <YAxis tickFormatter={(value) => formatarMoeda(value)} />
                <Tooltip
                  content={
                    <CustomTooltip
                      formatter={{
                        valueFormatter: (value: number) => formatarMoeda(value),
                        labelFormatter: (label: string) => {
                          const [ano, mes] = label.split("-");
                          const meses = [
                            "Janeiro",
                            "Fevereiro",
                            "Março",
                            "Abril",
                            "Maio",
                            "Junho",
                            "Julho",
                            "Agosto",
                            "Setembro",
                            "Outubro",
                            "Novembro",
                            "Dezembro",
                          ];
                          return `${meses[parseInt(mes) - 1]} ${ano}`;
                        },
                      }}
                    />
                  }
                />
                <Legend />
                <Bar
                  dataKey="faturamento_vendas"
                  fill="#3b82f6"
                  name="Vendas"
                  stackId="a"
                />
                <Bar
                  dataKey="faturamento_os"
                  fill="#10b981"
                  name="Ordens de Serviço"
                  stackId="a"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        {/* Top Clientes */}
        <Card className="border-none shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
          <CardHeader className="pb-4">
            <h3 className="font-bold text-lg text-foreground">
              Top 10 Clientes
            </h3>
          </CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dados.top_clientes} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  type="number"
                  tickFormatter={(value) => formatarMoeda(value)}
                />
                <YAxis
                  type="category"
                  dataKey="cliente_nome"
                  width={100}
                  style={{ fontSize: 12 }}
                />
                <Tooltip
                  content={
                    <CustomTooltip
                      formatter={{
                        valueFormatter: (value: number, name: string) => {
                          if (name === "Total Compras")
                            return formatarMoeda(value);
                          return value;
                        },
                      }}
                    />
                  }
                />
                <Bar
                  dataKey="total_compras"
                  fill="#3b82f6"
                  name="Total Compras"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        {/* Top 10 Vendedores */}
        <Card className="border-none shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
          <CardHeader className="pb-4">
            <h3 className="font-bold text-lg text-foreground">
              Top 10 Vendedores
            </h3>
          </CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dados.top_vendedores} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis
                  dataKey="vendedor_nome"
                  type="category"
                  width={100}
                  style={{ fontSize: 12 }}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  formatter={(value: number) => formatarMoeda(value)}
                />
                <Legend />
                <Bar
                  dataKey="total_faturamento"
                  fill="#8b5cf6"
                  name="Faturamento Total"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        {/* OS por Técnico */}
        <Card className="border-none shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
          <CardHeader className="pb-4">
            <h3 className="font-bold text-lg text-foreground">
              Desempenho por Técnico
            </h3>
          </CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dados.os_tecnicos}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="tecnico_nome" style={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="os_concluidas" fill="#10b981" name="Concluídas" />
                <Bar
                  dataKey="os_em_andamento"
                  fill="#f59e0b"
                  name="Em Andamento"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        {/* Peças Mais Usadas */}
        <Card className="border-none shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
          <CardHeader className="pb-4">
            <h3 className="font-bold text-lg text-foreground">
              Peças Mais Usadas em OS
            </h3>
          </CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dados.pecas_mais_usadas} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis
                  type="category"
                  dataKey="produto_nome"
                  width={120}
                  style={{ fontSize: 11 }}
                />
                <Tooltip
                  content={
                    <CustomTooltip
                      formatter={{
                        valueFormatter: (value: number, name: string) => {
                          if (name === "Quantidade") return `${value} unidades`;
                          if (name === "Valor") return formatarMoeda(value);
                          return value;
                        },
                      }}
                    />
                  }
                />
                <Legend />
                <Bar
                  dataKey="quantidade_usada"
                  fill="#8b5cf6"
                  name="Quantidade"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        {/* Giro de Estoque */}
        <Card className="border-none shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
          <CardHeader className="pb-4">
            <h3 className="font-bold text-lg text-foreground">
              Giro de Estoque (Top 10)
            </h3>
          </CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dados.giro_estoque}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="produto_nome"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  style={{ fontSize: 10 }}
                />
                <YAxis />
                <Tooltip
                  content={
                    <CustomTooltip
                      formatter={{
                        valueFormatter: (value: number, name: string) => {
                          if (name === "Giro") return `${value}x`;
                          return value;
                        },
                      }}
                    />
                  }
                />
                <Legend />
                <Bar dataKey="giro" fill="#14b8a6" name="Giro" />
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
      </div>

      {/* Alertas e Avisos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Produtos com Estoque Baixo */}
        <Card className="border-none shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
          <CardHeader className="flex items-center gap-2 pb-3">
            <Package className="w-5 h-5 text-warning" />
            <h3 className="font-bold text-foreground">Estoque Baixo</h3>
            <Chip size="sm" color="warning" variant="flat">
              {dados.metricas.produtos_estoque_baixo}
            </Chip>
          </CardHeader>
          <CardBody className="p-0">
            {dados.alertas.produtos_estoque_baixo.length > 0 ? (
              <div className="divide-y divide-divider">
                {dados.alertas.produtos_estoque_baixo.map((produto, index) => (
                  <div
                    key={`${produto.id}-${produto.loja}-${index}`}
                    className="p-4"
                  >
                    <p className="font-semibold text-sm">{produto.descricao}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-default-500">
                        {produto.loja}
                      </span>
                      <Chip
                        size="sm"
                        color={
                          produto.quantidade_atual === 0 ? "danger" : "warning"
                        }
                      >
                        {produto.quantidade_atual} un.
                      </Chip>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-default-500">
                <p className="text-sm">Nenhum produto em falta</p>
              </div>
            )}
          </CardBody>
        </Card>

        {/* OS Atrasadas */}
        <Card className="border-none shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
          <CardHeader className="flex items-center gap-2 pb-3">
            <Clock className="w-5 h-5 text-danger" />
            <h3 className="font-bold text-foreground">OS Atrasadas</h3>
            <Chip size="sm" color="danger" variant="flat">
              {dados.metricas.os_atrasadas}
            </Chip>
          </CardHeader>
          <CardBody className="p-0">
            {dados.alertas.os_atrasadas.length > 0 ? (
              <div className="divide-y divide-divider">
                {dados.alertas.os_atrasadas.map((os) => (
                  <div key={os.id} className="p-4">
                    <p className="font-semibold text-sm">OS #{os.numero_os}</p>
                    <p className="text-xs text-default-500 mt-1">
                      {os.cliente_nome}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Chip size="sm" color="danger">
                        {os.dias_atraso} dias
                      </Chip>
                      <Chip size="sm" variant="flat">
                        {os.status}
                      </Chip>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-default-500">
                <p className="text-sm">Nenhuma OS atrasada</p>
              </div>
            )}
          </CardBody>
        </Card>

        {/* Caixas Abertos */}
        <Card className="border-none shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
          <CardHeader className="flex items-center gap-2 pb-3">
            <DollarSign className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-foreground">Caixas Abertos</h3>
            <Chip size="sm" color="primary" variant="flat">
              {dados.metricas.caixas_abertos}
            </Chip>
          </CardHeader>
          <CardBody className="p-0">
            {dados.alertas.caixas_abertos.length > 0 ? (
              <div className="divide-y divide-divider">
                {dados.alertas.caixas_abertos.map((caixa) => (
                  <div key={caixa.id} className="p-4">
                    <p className="font-semibold text-sm">{caixa.loja_nome}</p>
                    <p className="text-xs text-default-500 mt-1">
                      {caixa.usuario_nome}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-default-500">
                        {caixa.horas_aberto}h aberto
                      </span>
                      <span className="text-xs font-semibold">
                        {formatarMoeda(caixa.saldo_inicial)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-default-500">
                <p className="text-sm">Nenhum caixa aberto</p>
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Novos Alertas */}
      {temPermissao("dashboard.visualizar") && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* RMAs Abertas */}
          <Card className="border-none shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
            <CardHeader className="flex items-center gap-2 pb-3">
              <Package className="w-5 h-5 text-warning" />
              <h3 className="font-bold text-foreground">RMAs Abertas</h3>
              <Chip size="sm" color="warning" variant="flat">
                {dados.alertas.rmas_abertas.length}
              </Chip>
            </CardHeader>
            <CardBody className="p-0">
              {dados.alertas.rmas_abertas.length > 0 ? (
                <div className="divide-y divide-divider max-h-64 overflow-y-auto">
                  {dados.alertas.rmas_abertas.map((rma) => (
                    <div key={rma.id} className="p-4">
                      <p className="font-semibold text-sm">{rma.numero_rma}</p>
                      <p className="text-xs text-default-500 mt-1">
                        {rma.produto_nome}
                      </p>
                      <p className="text-xs text-default-500">
                        {rma.fornecedor_nome}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Chip size="sm" color="warning">
                          {rma.dias_aberta} dias
                        </Chip>
                        <Chip size="sm" variant="flat">
                          {rma.status}
                        </Chip>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-default-500">
                  <p className="text-sm">Nenhuma RMA aberta</p>
                </div>
              )}
            </CardBody>
          </Card>

          {/* Contas a Receber com Atraso */}
          <Card className="border-none shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
            <CardHeader className="flex items-center gap-2 pb-3">
              <AlertTriangle className="w-5 h-5 text-danger" />
              <h3 className="font-bold text-foreground">Contas em Atraso</h3>
              <Chip size="sm" color="danger" variant="flat">
                {dados.contas_receber.filter((c) => c.dias_atraso > 0).length}
              </Chip>
            </CardHeader>
            <CardBody className="p-0">
              {dados.contas_receber.filter((c) => c.dias_atraso > 0).length >
              0 ? (
                <div className="divide-y divide-divider max-h-64 overflow-y-auto">
                  {dados.contas_receber
                    .filter((c) => c.dias_atraso > 0)
                    .slice(0, 5)
                    .map((conta) => (
                      <div key={conta.venda_id} className="p-4">
                        <p className="font-semibold text-sm">
                          Venda #{conta.numero_venda}
                        </p>
                        <p className="text-xs text-default-500 mt-1">
                          {conta.cliente_nome}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <Chip size="sm" color="danger">
                            {conta.dias_atraso} dias
                          </Chip>
                          <span className="text-xs font-semibold text-danger">
                            {formatarMoeda(conta.saldo_devedor)}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="p-4 text-center text-default-500">
                  <p className="text-sm">Nenhuma conta em atraso</p>
                </div>
              )}
            </CardBody>
          </Card>

          {/* Vendas Fiadas Detalhadas */}
          {podeVerVendas &&
            dados.vendas_fiadas_detalhadas &&
            dados.vendas_fiadas_detalhadas.length > 0 && (
              <Card className="border-none shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02] lg:col-span-3">
                <CardHeader className="flex items-center gap-2 pb-3">
                  <AlertTriangle className="w-5 h-5 text-danger" />
                  <h3 className="font-bold text-foreground">
                    Vendas Fiadas Detalhadas
                  </h3>
                  <Chip size="sm" color="danger" variant="flat">
                    {dados.vendas_fiadas_detalhadas.length}
                  </Chip>
                </CardHeader>
                <CardBody className="p-0">
                  <div className="divide-y divide-divider max-h-64 overflow-y-auto">
                    {dados.vendas_fiadas_detalhadas
                      .sort((a, b) => b.dias_em_aberto - a.dias_em_aberto)
                      .map((venda) => (
                        <div
                          key={venda.id}
                          className="p-4 hover:bg-default-50 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <p className="font-semibold text-foreground">
                                  Venda #{venda.numero_venda}
                                </p>
                                <Chip
                                  size="sm"
                                  color={
                                    venda.status_pagamento === "muito_atrasado"
                                      ? "danger"
                                      : venda.status_pagamento === "atrasado"
                                        ? "warning"
                                        : "success"
                                  }
                                  variant="flat"
                                >
                                  {venda.dias_em_aberto} dias em aberto
                                </Chip>
                              </div>

                              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                <div>
                                  <p className="text-default-500">Cliente</p>
                                  <p className="font-medium text-foreground">
                                    {venda.cliente_nome}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-default-500">Vendedor</p>
                                  <p className="font-medium text-foreground">
                                    {venda.vendedor_nome}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-default-500">Loja</p>
                                  <p className="font-medium text-foreground">
                                    {venda.loja_nome}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-default-500">
                                    Data da Venda
                                  </p>
                                  <p className="font-medium text-foreground">
                                    {new Date(
                                      venda.criado_em
                                    ).toLocaleDateString("pt-BR")}
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div className="text-right">
                              <div className="mb-2">
                                <p className="text-xs text-default-500">
                                  Valor Total
                                </p>
                                <p className="text-lg font-bold text-foreground">
                                  {formatarMoeda(venda.valor_total)}
                                </p>
                              </div>
                              <div className="mb-2">
                                <p className="text-xs text-default-500">
                                  Valor Pago
                                </p>
                                <p className="text-sm font-semibold text-success">
                                  {formatarMoeda(venda.valor_pago)}
                                </p>
                              </div>
                              <div className="mb-3">
                                <p className="text-xs text-default-500">
                                  Pendente
                                </p>
                                <p className="text-sm font-semibold text-danger">
                                  {formatarMoeda(venda.valor_pendente)}
                                </p>
                              </div>

                              <Button
                                size="sm"
                                color="primary"
                                variant="flat"
                                onClick={() =>
                                  (window.location.href = `/sistema/vendas?numero=${venda.numero_venda}`)
                                }
                              >
                                Ver Detalhes
                              </Button>
                            </div>
                          </div>

                          {/* Barra de progresso de pagamento */}
                          <div className="mt-3">
                            <div className="flex items-center justify-between text-xs text-default-500 mb-1">
                              <span>Progresso de Pagamento</span>
                              <span>
                                {(
                                  (venda.valor_pago / venda.valor_total) *
                                  100
                                ).toFixed(1)}
                                %
                              </span>
                            </div>
                            <div className="w-full bg-default-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full transition-all ${
                                  venda.status_pagamento === "muito_atrasado"
                                    ? "bg-danger"
                                    : venda.status_pagamento === "atrasado"
                                      ? "bg-warning"
                                      : "bg-success"
                                }`}
                                style={{
                                  width: `${(venda.valor_pago / venda.valor_total) * 100}%`,
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardBody>
              </Card>
            )}

          {/* Produtos Inativos */}
          <Card className="border-none shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
            <CardHeader className="flex items-center gap-2 pb-3">
              <Package className="w-5 h-5 text-default-400" />
              <h3 className="font-bold text-foreground">Produtos Inativos</h3>
              <Chip size="sm" color="default" variant="flat">
                {dados.metricas_adicionais.produtos_inativos}
              </Chip>
            </CardHeader>
            <CardBody className="p-4">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-default-500">
                    Total de produtos desativados
                  </span>
                  <span className="text-lg font-bold">
                    {dados.metricas_adicionais.produtos_inativos}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-default-500">
                    Valor médio por OS
                  </span>
                  <span className="text-sm font-semibold">
                    {formatarMoeda(dados.metricas_adicionais.valor_medio_os)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-default-500">
                    Sangrias no período
                  </span>
                  <span className="text-sm font-semibold text-danger">
                    {formatarMoeda(dados.metricas_adicionais.sangrias_total)}
                  </span>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Quebras Pendentes de Aprovação */}
          {dados.alertas.quebras_pendentes.length > 0 && (
            <Card className="border-none shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
              <CardHeader className="flex items-center gap-2 pb-3">
                <AlertTriangle className="w-5 h-5 text-warning" />
                <h3 className="font-bold text-foreground">Quebras Pendentes</h3>
                <Chip size="sm" color="warning" variant="flat">
                  {dados.alertas.quebras_pendentes.length}
                </Chip>
              </CardHeader>
              <CardBody className="p-4">
                <div className="divide-y divide-divider max-h-64 overflow-y-auto">
                  {dados.alertas.quebras_pendentes.map((quebra) => (
                    <div key={quebra.id} className="p-4">
                      <p className="font-semibold text-sm">
                        {quebra.produto_descricao}
                      </p>
                      <p className="text-xs text-default-500 mt-1">
                        {quebra.tipo_ocorrencia} - {quebra.motivo}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2">
                          <Chip size="sm" color="warning">
                            {quebra.quantidade}x
                          </Chip>
                          <span className="text-xs text-default-500">
                            {quebra.responsavel}
                          </span>
                        </div>
                        <span className="text-xs font-semibold text-danger">
                          {formatarMoeda(quebra.valor_total)}
                        </span>
                      </div>
                      <p className="text-xs text-warning mt-2">
                        Pendente há {quebra.dias_pendente} dias
                      </p>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          )}
        </div>
      )}

      {/* Estatísticas Adicionais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-none shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
          <CardBody className="p-6 flex items-center gap-4">
            <div className="p-3 bg-success/10 rounded-xl">
              <Users className="w-6 h-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-default-500 font-medium">
                Novos Clientes
              </p>
              <p className="text-2xl font-bold text-foreground">
                {dados.metricas.novos_clientes}
              </p>
            </div>
          </CardBody>
        </Card>

        <Card className="border-none shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
          <CardBody className="p-6 flex items-center gap-4">
            <div className="p-3 bg-danger/10 rounded-xl">
              <Package className="w-6 h-6 text-danger" />
            </div>
            <div>
              <p className="text-sm text-default-500 font-medium">
                Produtos Zerados
              </p>
              <p className="text-2xl font-bold text-foreground">
                {dados.metricas.produtos_estoque_zerado}
              </p>
            </div>
          </CardBody>
        </Card>

        <Card className="border-none shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
          <CardBody className="p-6 flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-xl">
              <Wrench className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-default-500 font-medium">
                OS Concluídas
              </p>
              <p className="text-2xl font-bold text-foreground">
                {dados.metricas.os_concluidas}
              </p>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
