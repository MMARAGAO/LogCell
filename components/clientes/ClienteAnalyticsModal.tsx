"use client";

import { useEffect, useState } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody } from "@heroui/modal";
import { Button } from "@heroui/button";
import { Tabs, Tab } from "@heroui/tabs";
import { Chip } from "@heroui/chip";
import { Divider } from "@heroui/divider";
import { Spinner } from "@heroui/spinner";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@heroui/table";
import {
  BarChart3,
  TrendingUp,
  CreditCard,
  Smartphone,
  ShoppingBag,
  Wallet,
  DollarSign,
  AlertTriangle,
  Clock,
  Activity,
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
  ResponsiveContainer,
} from "recharts";

import {
  ClienteAnalytics,
  buscarAnalyticsCliente,
} from "@/services/clienteAnalyticsService";
import type { Cliente } from "@/types/clientesTecnicos";

const CORES = [
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#EC4899",
  "#14B8A6",
  "#F97316",
  "#6366F1",
  "#84CC16",
];

const STATUS_LABEL: Record<string, string> = {
  concluida: "Concluída",
  em_andamento: "Pendente",
  cancelada: "Cancelada",
  devolvida: "Devolvida",
};

const STATUS_COR: Record<string, string> = {
  concluida: "success",
  em_andamento: "warning",
  cancelada: "danger",
  devolvida: "default",
};

function formatarMoeda(valor: number) {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatarData(data: string) {
  return new Date(data).toLocaleDateString("pt-BR");
}

interface ClienteAnalyticsModalProps {
  isOpen: boolean;
  cliente: Cliente;
  onClose: () => void;
}

export function ClienteAnalyticsModal({
  isOpen,
  cliente,
  onClose,
}: ClienteAnalyticsModalProps) {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<ClienteAnalytics | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !cliente.id) return;
    carregar();
  }, [isOpen, cliente.id]);

  async function carregar() {
    setLoading(true);
    setError(null);
    try {
      const data = await buscarAnalyticsCliente(cliente.id);

      setAnalytics(data);
    } catch (err: any) {
      setError(err.message || "Erro ao carregar analytics");
    } finally {
      setLoading(false);
    }
  }

  const r = analytics?.resumo;
  const diasAviso =
    r?.diasDesdeUltimaCompra != null
      ? r.diasDesdeUltimaCompra <= 30
        ? "success"
        : r.diasDesdeUltimaCompra <= 90
          ? "warning"
          : "danger"
      : "default";

  const ultimaCompraLabel = r?.ultimaCompra
    ? `${formatarData(r.ultimaCompra)}`
    : "Nunca comprou";

  return (
    <Modal isOpen={isOpen} scrollBehavior="inside" size="5xl" onClose={onClose}>
      <ModalContent>
        <ModalHeader className="flex items-center gap-3 border-b border-divider">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-lg font-bold">{cliente.nome}</p>
            <p className="text-sm text-default-500">
              {cliente.doc && `Documento: ${cliente.doc}`}
              {cliente.telefone && ` — Tel: ${cliente.telefone}`}
            </p>
          </div>
        </ModalHeader>
        <ModalBody className="py-5">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Spinner label="Carregando analytics..." size="lg" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 text-danger gap-3">
              <AlertTriangle className="w-10 h-10" />
              <p>{error}</p>
              <Button variant="flat" onPress={carregar}>
                Tentar novamente
              </Button>
            </div>
          ) : !analytics ? (
            <div className="flex justify-center items-center py-20 text-default-500">
              Nenhum dado encontrado
            </div>
          ) : (
            <Tabs
              aria-label="Analytics do cliente"
              classNames={{
                tabList: "gap-2",
                tab: "h-10 text-xs",
              }}
            >
              <Tab
                key="resumo"
                title={
                  <div className="flex items-center gap-1.5">
                    <Activity className="w-4 h-4" />
                    <span>Resumo</span>
                  </div>
                }
              >
                <div className="space-y-6 pt-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <KpiCard
                      bg="bg-primary/5"
                      color="text-primary"
                      icon={<ShoppingBag className="w-5 h-5" />}
                      label="Vendas"
                      value={String(r?.totalVendas || 0)}
                    />
                    <KpiCard
                      bg="bg-success/5"
                      color="text-success"
                      icon={<DollarSign className="w-5 h-5" />}
                      label="Total Gasto"
                      value={formatarMoeda(r?.totalGasto || 0)}
                    />
                    <KpiCard
                      bg="bg-secondary/5"
                      color="text-secondary"
                      icon={<BarChart3 className="w-5 h-5" />}
                      label="Ticket Médio"
                      value={formatarMoeda(r?.ticketMedio || 0)}
                    />
                    <KpiCard
                      bg={`bg-${diasAviso}/5`}
                      color={`text-${diasAviso}`}
                      icon={<Clock className="w-5 h-5" />}
                      label="Última Compra"
                      value={ultimaCompraLabel}
                    />
                  </div>

                  {r && r.diasDesdeUltimaCompra != null && (
                    <Chip
                      color={diasAviso as any}
                      startContent={<Clock className="w-3 h-3" />}
                      variant="flat"
                    >
                      {r.diasDesdeUltimaCompra === 0
                        ? "Comprou hoje"
                        : r.diasDesdeUltimaCompra === 1
                          ? "Comprou ontem"
                          : `Última compra há ${r.diasDesdeUltimaCompra} dias`}
                    </Chip>
                  )}

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <MiniCard
                      label="Total Pago"
                      value={formatarMoeda(r?.totalPago || 0)}
                    />
                    <MiniCard
                      color={r?.saldoDevedor ? "text-danger" : "text-success"}
                      label="Saldo Devedor"
                      value={formatarMoeda(r?.saldoDevedor || 0)}
                    />
                    <MiniCard
                      label="Aparelhos"
                      value={String(r?.totalAparelhos || 0)}
                    />
                    <MiniCard
                      label="Serviços (OS)"
                      value={String(r?.totalServicos || 0)}
                    />
                  </div>

                  {analytics.creditos > 0 && (
                    <div className="bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-800 rounded-xl p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Wallet className="w-5 h-5 text-success" />
                          <span className="font-semibold text-success-700 dark:text-success-400">
                            Créditos Disponíveis
                          </span>
                        </div>
                        <span className="text-lg font-bold text-success">
                          {formatarMoeda(analytics.creditos)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </Tab>

              <Tab
                key="evolucao"
                title={
                  <div className="flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4" />
                    <span>Evolução</span>
                  </div>
                }
              >
                <div className="pt-4 space-y-4">
                  <p className="text-sm text-default-500">
                    Gastos mensais do cliente (últimos 12 meses)
                  </p>
                  <div className="h-72">
                    <ResponsiveContainer height="100%" width="100%">
                      <LineChart data={analytics.vendasPorMes}>
                        <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />
                        <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
                        <YAxis
                          tick={{ fontSize: 11 }}
                          tickFormatter={(v) =>
                            v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)
                          }
                        />
                        <Tooltip
                          formatter={(value: any) => [
                            formatarMoeda(Number(value)),
                            "Valor",
                          ]}
                        />
                        <Line
                          dataKey="valor"
                          dot={{ fill: "#3B82F6", r: 4 }}
                          stroke="#3B82F6"
                          strokeWidth={2}
                          type="monotone"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                    {analytics.vendasPorMes.map((item) => (
                      <div
                        key={item.mes}
                        className="text-center p-2 rounded-lg bg-default-50 dark:bg-default-100/10"
                      >
                        <p className="text-[10px] text-default-500 uppercase">
                          {item.mes}
                        </p>
                        <p className="text-xs font-semibold">
                          {formatarMoeda(item.valor)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </Tab>

              <Tab
                key="pagamentos"
                title={
                  <div className="flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4" />
                    <span>Pagamentos</span>
                  </div>
                }
              >
                <div className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                  {analytics.pagamentosPorTipo.length > 0 ? (
                    <>
                      <div className="h-72">
                        <ResponsiveContainer height="100%" width="100%">
                          <PieChart>
                            <Pie
                              cx="50%"
                              cy="50%"
                              data={analytics.pagamentosPorTipo}
                              dataKey="valor"
                              label={({ name, percent }: any) =>
                                `${name} ${((percent || 0) * 100).toFixed(0)}%`
                              }
                              nameKey="tipo"
                              outerRadius={100}
                            >
                              {analytics.pagamentosPorTipo.map((_, i) => (
                                <Cell key={i} fill={CORES[i % CORES.length]} />
                              ))}
                            </Pie>
                            <Tooltip
                              formatter={(value: any) => [
                                formatarMoeda(Number(value)),
                                "Valor",
                              ]}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-semibold mb-3">
                          Detalhamento
                        </p>
                        {analytics.pagamentosPorTipo.map((item, i) => (
                          <div
                            key={item.tipo}
                            className="flex items-center justify-between p-2 rounded-lg bg-default-50 dark:bg-default-100/10"
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{
                                  backgroundColor: CORES[i % CORES.length],
                                }}
                              />
                              <span className="text-sm">{item.tipo}</span>
                            </div>
                            <span className="text-sm font-semibold">
                              {formatarMoeda(item.valor)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="col-span-2 text-center py-10 text-default-500">
                      Nenhum pagamento registrado
                    </div>
                  )}
                </div>
              </Tab>

              <Tab
                key="compras"
                title={
                  <div className="flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4" />
                    <span>Compras</span>
                  </div>
                }
              >
                <div className="pt-4 space-y-6">
                  {analytics.aparelhosComprados.length > 0 ? (
                    <>
                      <p className="text-sm text-default-500">
                        Marcas de aparelhos mais compradas
                      </p>
                      <div className="h-64">
                        <ResponsiveContainer height="100%" width="100%">
                          <BarChart
                            data={analytics.aparelhosComprados}
                            layout="vertical"
                          >
                            <CartesianGrid
                              stroke="#e5e7eb"
                              strokeDasharray="3 3"
                            />
                            <XAxis tick={{ fontSize: 11 }} type="number" />
                            <YAxis
                              dataKey="marca"
                              tick={{ fontSize: 11 }}
                              type="category"
                              width={100}
                            />
                            <Tooltip />
                            <Bar
                              dataKey="quantidade"
                              fill="#3B82F6"
                              radius={[0, 4, 4, 0]}
                            >
                              {analytics.aparelhosComprados.map((_, i) => (
                                <Cell key={i} fill={CORES[i % CORES.length]} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </>
                  ) : (
                    <p className="text-center py-10 text-default-500">
                      Nenhum aparelho comprado
                    </p>
                  )}

                  <Divider />

                  {analytics.servicosRealizados.length > 0 ? (
                    <>
                      <p className="text-sm font-semibold">
                        Serviços Realizados
                      </p>
                      <div className="space-y-1.5 max-h-48 overflow-y-auto">
                        {analytics.servicosRealizados.map((s, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between p-2 rounded-lg bg-default-50 dark:bg-default-100/10 text-sm"
                          >
                            <span className="truncate mr-4">{s.descricao}</span>
                            <Chip size="sm" variant="flat">
                              {s.quantidade}x
                            </Chip>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-default-500">
                      Nenhum serviço realizado
                    </p>
                  )}
                </div>
              </Tab>

              <Tab
                key="vendas"
                title={
                  <div className="flex items-center gap-1.5">
                    <ShoppingBag className="w-4 h-4" />
                    <span>Vendas</span>
                  </div>
                }
              >
                <div className="pt-4">
                  {analytics.vendas.length > 0 ? (
                    <Table aria-label="Vendas do cliente">
                      <TableHeader>
                        <TableColumn>Nº Venda</TableColumn>
                        <TableColumn>Data</TableColumn>
                        <TableColumn>Valor</TableColumn>
                        <TableColumn>Status</TableColumn>
                      </TableHeader>
                      <TableBody>
                        {analytics.vendas.map((v) => (
                          <TableRow key={v.id}>
                            <TableCell>
                              <span className="font-semibold">
                                #{v.numero_venda}
                              </span>
                            </TableCell>
                            <TableCell>{formatarData(v.data)}</TableCell>
                            <TableCell>
                              {formatarMoeda(v.valor_total)}
                            </TableCell>
                            <TableCell>
                              <Chip
                                color={
                                  (STATUS_COR[v.status] as any) || "default"
                                }
                                size="sm"
                                variant="flat"
                              >
                                {STATUS_LABEL[v.status] || v.status}
                              </Chip>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-10 text-default-500">
                      Nenhuma venda encontrada
                    </div>
                  )}
                </div>
              </Tab>
            </Tabs>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

function KpiCard({
  icon,
  label,
  value,
  color,
  bg,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
  bg: string;
}) {
  return (
    <div className={`${bg} rounded-xl p-4 border border-divider`}>
      <div className="flex items-center gap-3">
        <div className={`${color}`}>{icon}</div>
        <div className="min-w-0">
          <p className="text-[10px] font-semibold text-default-500 uppercase tracking-wider">
            {label}
          </p>
          <p className={`text-sm font-bold truncate ${color}`}>{value}</p>
        </div>
      </div>
    </div>
  );
}

function MiniCard({
  label,
  value,
  color = "text-default-700",
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div className="bg-default-50 dark:bg-default-100/10 rounded-xl p-3 border border-divider">
      <p className="text-[10px] font-semibold text-default-500 uppercase tracking-wider">
        {label}
      </p>
      <p className={`text-sm font-bold ${color}`}>{value}</p>
    </div>
  );
}
