"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Chip } from "@heroui/chip";
import { Divider } from "@heroui/divider";
import { Checkbox } from "@heroui/checkbox";
import { Spinner } from "@heroui/spinner";
import {
  Pagination,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@heroui/react";
import {
  Search,
  FileSpreadsheet,
  User,
  AlertCircle,
  CheckSquare,
  Square,
  Info,
  Eye,
  ArrowLeft,
} from "lucide-react";

import { buscarClientes } from "@/services/clienteService";
import { buscarAnalyticsCliente } from "@/services/clienteAnalyticsService";
import { exportarAnalyticsClientes } from "@/services/clienteExportService";
import { useToast } from "@/components/Toast";
import { supabase } from "@/lib/supabaseClient";
import type { Cliente } from "@/types/clientesTecnicos";
import type { ClienteAnalytics } from "@/services/clienteAnalyticsService";

const ITENS_POR_PAGINA = 50;
const MAX_EXPORTAR = 100;
const ITENS_PREVIA_POR_PAGINA = 20;

interface ExportarAnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Etapa = "selecao" | "previa";

function formatarMoeda(valor: number) {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatarData(data: string | null) {
  if (!data) return "—";

  return new Date(data).toLocaleDateString("pt-BR");
}

export function ExportarAnalyticsModal({
  isOpen,
  onClose,
}: ExportarAnalyticsModalProps) {
  const toast = useToast();
  const buscaRef = useRef<NodeJS.Timeout>();

  const [etapa, setEtapa] = useState<Etapa>("selecao");
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(false);
  const [exportando, setExportando] = useState(false);
  const [carregandoPrevia, setCarregandoPrevia] = useState(false);
  const [busca, setBusca] = useState("");
  const [buscaDebounce, setBuscaDebounce] = useState("");
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalClientes, setTotalClientes] = useState(0);
  const [selecionados, setSelecionados] = useState<Set<string>>(new Set());

  // Dados da prévia
  const [dadosPrevia, setDadosPrevia] = useState<
    (ClienteAnalytics & { cliente: Cliente; lojaNome: string })[]
  >([]);
  const [paginaPrevia, setPaginaPrevia] = useState(1);

  // Debounce da busca
  useEffect(() => {
    if (buscaRef.current) clearTimeout(buscaRef.current);
    buscaRef.current = setTimeout(() => {
      setBuscaDebounce(busca);
      setPagina(1);
    }, 400);

    return () => {
      if (buscaRef.current) clearTimeout(buscaRef.current);
    };
  }, [busca]);

  const carregarClientes = useCallback(async () => {
    setLoading(true);
    try {
      const { data, count, totalPages } = await buscarClientes({
        busca: buscaDebounce || undefined,
        page: pagina,
        pageSize: ITENS_POR_PAGINA,
      });

      setClientes(data || []);
      setTotalClientes(count || 0);
      setTotalPaginas(totalPages || 1);
    } catch {
      toast.error("Erro ao carregar clientes");
      setClientes([]);
    } finally {
      setLoading(false);
    }
  }, [buscaDebounce, pagina]);

  useEffect(() => {
    if (isOpen && etapa === "selecao") {
      carregarClientes();
    }
  }, [isOpen, etapa, carregarClientes]);

  useEffect(() => {
    if (isOpen) {
      setEtapa("selecao");
      setSelecionados(new Set());
      setPagina(1);
      setBusca("");
      setBuscaDebounce("");
      setDadosPrevia([]);
    }
  }, [isOpen]);

  const toggleCliente = (id: string) => {
    setSelecionados((prev) => {
      const next = new Set(prev);

      if (next.has(id)) next.delete(id);
      else next.add(id);

      return next;
    });
  };

  const selecionarPagina = () => {
    setSelecionados((prev) => {
      const next = new Set(prev);

      for (const c of clientes) next.add(c.id);

      return next;
    });
  };

  const limparSelecao = () => {
    setSelecionados(new Set());
  };

  const todosDaPaginaSelecionados =
    clientes.length > 0 && clientes.every((c) => selecionados.has(c.id));

  const handleMudarPagina = (novaPagina: number) => {
    setPagina(novaPagina);
  };

  const handleVisualizar = async () => {
    if (selecionados.size === 0) return;
    setCarregandoPrevia(true);
    try {
      const ids = Array.from(selecionados);

      const [{ data: clientesData }, { data: lojasData }] = await Promise.all([
        supabase
          .from("clientes")
          .select(
            "id, nome, telefone, doc, ativo, criado_em, atualizado_em, id_loja, logradouro, numero, complemento, bairro, cidade, estado, cep, email, telefone_secundario, data_nascimento, observacoes, criado_por, atualizado_por",
          )
          .in("id", ids),
        supabase.from("lojas").select("id, nome"),
      ]);

      const lojasMap = new Map(
        (lojasData || []).map((l: any) => [l.id, l.nome]),
      );

      const clientesMap = new Map(
        (clientesData || []).map((c: Cliente) => [c.id, c]),
      );

      const results = await Promise.all(
        ids.map(async (id) => {
          const cliente = clientesMap.get(id);

          try {
            const analytics = await buscarAnalyticsCliente(id);

            return {
              ...analytics,
              cliente: cliente!,
              lojaNome: lojasMap.get(cliente?.id_loja || 0) || "—",
            };
          } catch {
            return null;
          }
        }),
      );

      setDadosPrevia(
        results.filter(Boolean) as (ClienteAnalytics & {
          cliente: Cliente;
          lojaNome: string;
        })[],
      );
      setPaginaPrevia(1);
      setEtapa("previa");
    } catch (err: any) {
      console.error("Erro ao carregar prévia:", err);
      toast.error("Erro ao carregar dados da prévia");
    } finally {
      setCarregandoPrevia(false);
    }
  };

  const handleExportar = async () => {
    if (dadosPrevia.length === 0) return;
    setExportando(true);
    try {
      const selecionadosLista = dadosPrevia.map((d) => d.cliente);
      const blob = await exportarAnalyticsClientes(selecionadosLista);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");

      a.href = url;
      a.download = `analytics-clientes-${new Date().toISOString().split("T")[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Planilha exportada com sucesso!");
      onClose();
    } catch (err: any) {
      console.error("Erro ao exportar:", err);
      toast.error(err.message || "Erro ao exportar planilha");
    } finally {
      setExportando(false);
    }
  };

  const limiteAtingido = selecionados.size >= MAX_EXPORTAR;
  const totalPaginasPrevia = Math.ceil(
    dadosPrevia.length / ITENS_PREVIA_POR_PAGINA,
  );
  const dadosPaginados = dadosPrevia.slice(
    (paginaPrevia - 1) * ITENS_PREVIA_POR_PAGINA,
    paginaPrevia * ITENS_PREVIA_POR_PAGINA,
  );

  return (
    <Modal
      isOpen={isOpen}
      scrollBehavior="inside"
      size={etapa === "previa" ? "5xl" : "2xl"}
      onClose={onClose}
    >
      <ModalContent>
        <ModalHeader className="flex items-center gap-3 border-b border-divider">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <FileSpreadsheet className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-lg font-bold">
              {etapa === "previa" ? "Prévia dos Dados" : "Exportar Analytics"}
            </p>
            <p className="text-sm text-default-500">
              {etapa === "previa"
                ? `${dadosPrevia.length} cliente${dadosPrevia.length !== 1 ? "s" : ""} selecionado${dadosPrevia.length !== 1 ? "s" : ""}`
                : "Selecione os clientes para exportar os dados analíticos"}
            </p>
          </div>
        </ModalHeader>

        {etapa === "selecao" ? (
          <>
            <ModalBody className="py-4 gap-4">
              <Input
                isClearable
                placeholder="Buscar cliente por nome, telefone ou CPF..."
                startContent={<Search className="w-4 h-4 text-default-400" />}
                value={busca}
                variant="bordered"
                onChange={(e) => setBusca(e.target.value)}
                onClear={() => setBusca("")}
              />

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  {todosDaPaginaSelecionados ? (
                    <Button
                      size="sm"
                      startContent={<Square className="w-4 h-4" />}
                      variant="flat"
                      onPress={limparSelecao}
                    >
                      Limpar página
                    </Button>
                  ) : (
                    <Button
                      isDisabled={limiteAtingido}
                      size="sm"
                      startContent={<CheckSquare className="w-4 h-4" />}
                      variant="flat"
                      onPress={selecionarPagina}
                    >
                      Selecionar página
                    </Button>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {limiteAtingido && (
                    <Chip
                      color="warning"
                      size="sm"
                      startContent={<Info className="w-3 h-3" />}
                      variant="flat"
                    >
                      Máx {MAX_EXPORTAR}
                    </Chip>
                  )}
                  <Chip color="primary" size="sm" variant="flat">
                    {selecionados.size} selecionado
                    {selecionados.size !== 1 ? "s" : ""}
                  </Chip>
                </div>
              </div>

              <Divider />

              {loading ? (
                <div className="flex justify-center py-8">
                  <Spinner label="Carregando clientes..." />
                </div>
              ) : clientes.length === 0 ? (
                <div className="text-center py-8 text-default-500">
                  <User className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p>Nenhum cliente encontrado</p>
                </div>
              ) : (
                <>
                  <div className="space-y-1 max-h-80 overflow-y-auto">
                    {clientes.map((cliente) => {
                      const selected = selecionados.has(cliente.id);

                      return (
                        <div
                          key={cliente.id}
                          className={`flex items-center gap-3 p-2.5 rounded-xl border cursor-pointer transition-colors ${
                            selected
                              ? "bg-primary/5 border-primary/30"
                              : "border-divider hover:bg-default-50"
                          }`}
                          onClick={() => toggleCliente(cliente.id)}
                        >
                          <Checkbox
                            isDisabled={!selected && limiteAtingido}
                            isSelected={selected}
                            onValueChange={() => toggleCliente(cliente.id)}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {cliente.nome}
                            </p>
                            {cliente.telefone && (
                              <p className="text-xs text-default-500">
                                {cliente.telefone}
                              </p>
                            )}
                          </div>
                          <Chip
                            color={cliente.ativo ? "success" : "danger"}
                            size="sm"
                            variant="flat"
                          >
                            {cliente.ativo ? "Ativo" : "Inativo"}
                          </Chip>
                        </div>
                      );
                    })}
                  </div>

                  {totalPaginas > 1 && (
                    <div className="flex flex-col items-center gap-2 pt-1">
                      <Pagination
                        showControls
                        color="primary"
                        page={pagina}
                        size="sm"
                        total={totalPaginas}
                        onChange={handleMudarPagina}
                      />
                      <p className="text-[11px] text-default-400">
                        Mostrando {(pagina - 1) * ITENS_POR_PAGINA + 1}-
                        {Math.min(pagina * ITENS_POR_PAGINA, totalClientes)} de{" "}
                        {totalClientes} cliente
                        {totalClientes !== 1 ? "s" : ""}
                      </p>
                    </div>
                  )}
                </>
              )}
            </ModalBody>
            <ModalFooter className="border-t border-divider flex-col items-stretch gap-2">
              {selecionados.size > MAX_EXPORTAR && (
                <div className="flex items-center gap-2 text-xs text-warning bg-warning-50 dark:bg-warning-900/20 p-2 rounded-lg">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>
                    Selecione no máximo {MAX_EXPORTAR} clientes por exportação
                    (remova {selecionados.size - MAX_EXPORTAR})
                  </span>
                </div>
              )}
              <div className="flex justify-end gap-2">
                <Button variant="flat" onPress={onClose}>
                  Cancelar
                </Button>
                <Button
                  color="primary"
                  isDisabled={
                    selecionados.size === 0 || selecionados.size > MAX_EXPORTAR
                  }
                  isLoading={carregandoPrevia}
                  startContent={
                    !carregandoPrevia && <Eye className="w-4 h-4" />
                  }
                  onPress={handleVisualizar}
                >
                  {carregandoPrevia
                    ? "Carregando..."
                    : `Visualizar ${selecionados.size} cliente${selecionados.size !== 1 ? "s" : ""}`}
                </Button>
              </div>
            </ModalFooter>
          </>
        ) : (
          <>
            <ModalBody className="py-4 gap-4">
              {carregandoPrevia ? (
                <div className="flex justify-center py-8">
                  <Spinner label="Carregando dados..." />
                </div>
              ) : dadosPaginados.length === 0 ? (
                <div className="text-center py-8 text-default-500">
                  Nenhum dado carregado
                </div>
              ) : (
                <div className="overflow-x-auto max-h-96 overflow-y-auto">
                  <Table removeWrapper aria-label="Prévia dos dados">
                    <TableHeader>
                      <TableColumn>Cliente</TableColumn>
                      <TableColumn>Telefone</TableColumn>
                      <TableColumn>Status</TableColumn>
                      <TableColumn>Loja</TableColumn>
                      <TableColumn>Cliente Desde</TableColumn>
                      <TableColumn>Vendas</TableColumn>
                      <TableColumn>Total Gasto</TableColumn>
                      <TableColumn>Total Pago</TableColumn>
                      <TableColumn>Saldo Devedor</TableColumn>
                      <TableColumn>Ticket Médio</TableColumn>
                      <TableColumn>Lucro Est</TableColumn>
                      <TableColumn>1ª Compra</TableColumn>
                      <TableColumn>Relação</TableColumn>
                      <TableColumn>Freq</TableColumn>
                      <TableColumn>Última</TableColumn>
                      <TableColumn>Inativo</TableColumn>
                      <TableColumn>Churn</TableColumn>
                      <TableColumn>Segmento</TableColumn>
                      <TableColumn>Aparelhos</TableColumn>
                      <TableColumn>Serviços</TableColumn>
                      <TableColumn>Valor Serv</TableColumn>
                      <TableColumn>Produto Favorito</TableColumn>
                      <TableColumn>Vendedor</TableColumn>
                      <TableColumn>Loja Pref</TableColumn>
                      <TableColumn>Créditos</TableColumn>
                      <TableColumn>PIX</TableColumn>
                      <TableColumn>Dinheiro</TableColumn>
                      <TableColumn>Cartão Créd</TableColumn>
                      <TableColumn>Cartão Déb</TableColumn>
                      <TableColumn>Transf</TableColumn>
                      <TableColumn>Boleto</TableColumn>
                      <TableColumn>Cred Cliente</TableColumn>
                      <TableColumn>Troca</TableColumn>
                    </TableHeader>
                    <TableBody>
                      {dadosPaginados.map((item: any) => {
                        const pagMap: Record<string, number> = {};

                        for (const p of item.pagamentosPorTipo || []) {
                          pagMap[p.tipo] = p.valor;
                        }

                        return (
                          <TableRow key={item.cliente.id}>
                            <TableCell className="whitespace-nowrap font-medium">
                              {item.cliente.nome}
                            </TableCell>
                            <TableCell className="whitespace-nowrap text-xs">
                              {item.cliente.telefone || "—"}
                            </TableCell>
                            <TableCell>
                              {item.cliente.ativo ? "Ativo" : "Inativo"}
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                              {item.lojaNome}
                            </TableCell>
                            <TableCell className="whitespace-nowrap text-xs">
                              {item.cliente.criado_em
                                ? formatarData(item.cliente.criado_em)
                                : "—"}
                            </TableCell>
                            <TableCell className="text-center font-semibold">
                              {item.resumo.totalVendas}
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                              {formatarMoeda(item.resumo.totalGasto)}
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                              {formatarMoeda(item.resumo.totalPago)}
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                              {formatarMoeda(item.resumo.saldoDevedor)}
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                              {formatarMoeda(item.resumo.ticketMedio)}
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                              {formatarMoeda(
                                item.resumo.totalPago -
                                  item.resumo.totalServicosValor,
                              )}
                            </TableCell>
                            <TableCell className="whitespace-nowrap text-xs">
                              {formatarData(item.resumo.primeiraCompra)}
                            </TableCell>
                            <TableCell className="text-center">
                              {item.resumo.diasRelacionamento ?? "—"}
                            </TableCell>
                            <TableCell className="text-center">
                              {item.resumo.totalVendas > 1 &&
                              item.resumo.diasRelacionamento
                                ? Math.round(
                                    item.resumo.diasRelacionamento /
                                      (item.resumo.totalVendas - 1),
                                  )
                                : "—"}
                            </TableCell>
                            <TableCell className="whitespace-nowrap text-xs">
                              {formatarData(item.resumo.ultimaCompra)}
                            </TableCell>
                            <TableCell className="text-center">
                              {item.resumo.diasDesdeUltimaCompra ?? "—"}
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                              {item.resumo.diasDesdeUltimaCompra == null
                                ? "⚪"
                                : item.resumo.diasDesdeUltimaCompra > 90
                                  ? "🔴 Alto"
                                  : item.resumo.diasDesdeUltimaCompra > 30
                                    ? "🟡 Médio"
                                    : "🟢 Baixo"}
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                              {item.resumo.totalVendas === 0
                                ? "🆕 Sem compras"
                                : item.resumo.totalGasto >= 20000
                                  ? "🏆 VIP"
                                  : (item.resumo.totalVendas >= 5 ||
                                        item.resumo.totalAparelhos >= 5) &&
                                      (item.resumo.diasDesdeUltimaCompra ==
                                        null ||
                                        item.resumo.diasDesdeUltimaCompra < 60)
                                    ? "💎 Fiel"
                                    : item.resumo.diasDesdeUltimaCompra !=
                                          null &&
                                        item.resumo.diasDesdeUltimaCompra >= 90
                                      ? "💤 Perdido"
                                      : item.resumo.totalVendas === 1 &&
                                          item.resumo.diasRelacionamento !=
                                            null &&
                                          item.resumo.diasRelacionamento < 30
                                        ? "🆕 Novo"
                                        : "👋 Regular"}
                            </TableCell>
                            <TableCell className="text-center">
                              {item.resumo.totalAparelhos}
                            </TableCell>
                            <TableCell className="text-center">
                              {item.resumo.totalServicos}
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                              {formatarMoeda(item.resumo.totalServicosValor)}
                            </TableCell>
                            <TableCell
                              className="max-w-[180px] truncate"
                              title={item.produtoFavorito || ""}
                            >
                              {item.produtoFavorito || "—"}
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                              {item.vendedorPreferidoNome || "—"}
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                              {item.lojaPreferidaNome || "—"}
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                              {item.creditos > 0
                                ? formatarMoeda(item.creditos)
                                : "—"}
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                              {pagMap["PIX"]
                                ? formatarMoeda(pagMap["PIX"])
                                : "—"}
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                              {pagMap["Dinheiro"]
                                ? formatarMoeda(pagMap["Dinheiro"])
                                : "—"}
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                              {pagMap["Cartão de Crédito"]
                                ? formatarMoeda(pagMap["Cartão de Crédito"])
                                : "—"}
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                              {pagMap["Cartão de Débito"]
                                ? formatarMoeda(pagMap["Cartão de Débito"])
                                : "—"}
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                              {pagMap["Transferência"]
                                ? formatarMoeda(pagMap["Transferência"])
                                : "—"}
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                              {pagMap["Boleto"]
                                ? formatarMoeda(pagMap["Boleto"])
                                : "—"}
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                              {pagMap["Crédito Cliente"]
                                ? formatarMoeda(pagMap["Crédito Cliente"])
                                : "—"}
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                              {pagMap["Troca"]
                                ? formatarMoeda(pagMap["Troca"])
                                : "—"}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}

              {totalPaginasPrevia > 1 && (
                <div className="flex flex-col items-center gap-2 pt-1">
                  <Pagination
                    showControls
                    color="primary"
                    page={paginaPrevia}
                    size="sm"
                    total={totalPaginasPrevia}
                    onChange={setPaginaPrevia}
                  />
                  <p className="text-[11px] text-default-400">
                    Mostrando {(paginaPrevia - 1) * ITENS_PREVIA_POR_PAGINA + 1}
                    -
                    {Math.min(
                      paginaPrevia * ITENS_PREVIA_POR_PAGINA,
                      dadosPrevia.length,
                    )}{" "}
                    de {dadosPrevia.length} cliente
                    {dadosPrevia.length !== 1 ? "s" : ""}
                  </p>
                </div>
              )}
            </ModalBody>
            <ModalFooter className="border-t border-divider">
              <Button
                startContent={<ArrowLeft className="w-4 h-4" />}
                variant="flat"
                onPress={() => setEtapa("selecao")}
              >
                Voltar
              </Button>
              <Button
                color="primary"
                isDisabled={dadosPrevia.length === 0}
                isLoading={exportando}
                startContent={
                  !exportando && <FileSpreadsheet className="w-4 h-4" />
                }
                onPress={handleExportar}
              >
                {exportando
                  ? "Exportando..."
                  : `Baixar Excel (${dadosPrevia.length})`}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
