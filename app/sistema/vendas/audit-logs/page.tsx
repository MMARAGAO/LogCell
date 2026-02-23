"use client";

import { useState, useEffect } from "react";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Input,
  Spinner,
  Select,
  SelectItem,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Pagination,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/react";
import { ChevronLeft, Search, Download, Eye } from "lucide-react";
import { useRouter } from "next/navigation";

import { useToast } from "@/components/Toast";

interface AuditLog {
  id: string;
  tabela_nome: string;
  registro_id: string;
  dados_apagados: Record<string, any>;
  apagado_por: string | null;
  apagado_por_nome: string | null;
  criado_em: string;
  motivo: string | null;
}

interface ApiResponse {
  dados: AuditLog[];
  total: number;
  pagina: number;
  pageSize: number;
  totalPaginas: number;
}

const TABELAS_VENDAS = [
  { key: "todas", label: "Todas as Tabelas" },
  { key: "vendas", label: "Vendas" },
  { key: "itens_venda", label: "Itens de Venda" },
  { key: "pagamentos_venda", label: "Pagamentos de Venda" },
  { key: "devolucoes_venda", label: "Devoluções" },
  { key: "trocas_produtos", label: "Trocas de Produtos" },
  { key: "descontos_venda", label: "Descontos" },
  { key: "itens_devolucao", label: "Itens Devolvidos" },
];

export default function AuditLogsPage() {
  const router = useRouter();
  const toast = useToast();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Filtros
  const [busca, setBusca] = useState("");
  const [tabelaFiltro, setTabelaFiltro] = useState("todas");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");

  // Modal de detalhes
  const [logSelecionado, setLogSelecionado] = useState<AuditLog | null>(null);

  const carregarLogs = async (page: number = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        tabela: tabelaFiltro,
        ...(busca && { busca }),
        ...(dataInicio && { dataInicio }),
        ...(dataFim && { dataFim }),
      });

      const response = await fetch(`/api/audit-logs?${params}`);

      if (!response.ok) {
        throw new Error("Erro ao carregar logs");
      }

      const data: ApiResponse = await response.json();

      setLogs(data.dados);
      setTotal(data.total);
      setCurrentPage(page);
    } catch (error: any) {
      toast.error(error.message || "Erro ao carregar logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarLogs(1);
  }, [tabelaFiltro, busca, dataInicio, dataFim]);

  const handleExportarCSV = () => {
    try {
      // Preparar dados para CSV
      const csvContent = [
        [
          "Tabela",
          "ID do Registro",
          "Data da Deleção",
          "Deletado Por",
          "Dados",
        ],
        ...logs.map((log) => [
          log.tabela_nome,
          log.registro_id || "N/A",
          new Date(log.criado_em).toLocaleString("pt-BR"),
          log.apagado_por_nome || "Desconhecido",
          JSON.stringify(log.dados_apagados),
        ]),
      ]
        .map((row) =>
          row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","),
        )
        .join("\n");

      // Criar blob e download
      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");

      a.href = url;
      a.download = `audit-logs-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("Logs exportados com sucesso!");
    } catch (error) {
      toast.error("Erro ao exportar logs");
    }
  };

  const formatarData = (data: string) => {
    return new Date(data).toLocaleString("pt-BR");
  };

  const formatarDadosApagados = (
    tabela: string,
    dados: Record<string, any>,
  ) => {
    // Campos que não devem ser exibidos
    const camposIgnorados = [
      "id",
      "criado_em",
      "atualizado_em",
      "criado_por",
      "atualizado_por",
    ];

    // Mapear nomes de campos para nomes amigáveis
    const nomesAmigaveis: Record<string, string> = {
      // Vendas
      numero_venda: "Número da Venda",
      cliente_id: "Cliente ID",
      vendedor_id: "Vendedor ID",
      loja_id: "Loja ID",
      status: "Status",
      tipo: "Tipo",
      valor_total: "Valor Total",
      valor_pago: "Valor Pago",
      valor_desconto: "Valor Desconto",
      saldo_devedor: "Saldo Devedor",
      data_prevista_pagamento: "Data Prevista",

      // Itens de venda
      produto_nome: "Produto",
      produto_codigo: "Código",
      quantidade: "Quantidade",
      preco_unitario: "Preço Unitário",
      subtotal: "Subtotal",
      devolvido: "Quantidade Devolvida",
      desconto_tipo: "Tipo de Desconto",
      desconto_valor: "Valor do Desconto",

      // Pagamentos
      tipo_pagamento: "Forma de Pagamento",
      valor: "Valor",
      data_pagamento: "Data do Pagamento",

      // Outros
      venda_id: "Venda ID",
      motivo: "Motivo",
      observacoes: "Observações",
    };

    // Formatar valores
    const formatarValor = (chave: string, valor: any): string => {
      if (valor === null || valor === undefined) return "-";

      // Valores monetários
      if (
        [
          "valor_total",
          "valor_pago",
          "valor_desconto",
          "saldo_devedor",
          "preco_unitario",
          "subtotal",
          "valor",
        ].includes(chave)
      ) {
        return new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
        }).format(Number(valor));
      }

      // Datas
      if (
        chave.includes("data_") &&
        typeof valor === "string" &&
        valor.includes("-")
      ) {
        return new Date(valor).toLocaleDateString("pt-BR");
      }

      // Booleanos
      if (typeof valor === "boolean") {
        return valor ? "Sim" : "Não";
      }

      // Status e tipos
      const traducoes: Record<string, string> = {
        em_andamento: "Em Andamento",
        concluida: "Concluída",
        cancelada: "Cancelada",
        normal: "Normal",
        fiada: "Fiada",
        dinheiro: "Dinheiro",
        pix: "PIX",
        cartao_credito: "Cartão de Crédito",
        cartao_debito: "Cartão de Débito",
        transferencia: "Transferência",
        credito_cliente: "Crédito do Cliente",
      };

      if (typeof valor === "string" && traducoes[valor]) {
        return traducoes[valor];
      }

      return String(valor);
    };

    // Filtrar e formatar campos
    const camposFiltrados = Object.entries(dados)
      .filter(([chave]) => !camposIgnorados.includes(chave))
      .filter(
        ([_, valor]) => valor !== null && valor !== undefined && valor !== "",
      )
      .map(([chave, valor]) => ({
        nome: nomesAmigaveis[chave] || chave,
        valor: formatarValor(chave, valor),
      }));

    return camposFiltrados;
  };

  const obterNomeDado = (chave: string, valor: any): string => {
    if (valor === null || valor === undefined) return "N/A";
    if (typeof valor === "object") return JSON.stringify(valor);

    return String(valor);
  };

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button isIconOnly variant="light" onClick={() => router.back()}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Logs de Deleção</h1>
            <p className="text-default-500">
              Auditoria de registros deletados nas vendas
            </p>
          </div>
        </div>
        <Button
          color="primary"
          isDisabled={logs.length === 0}
          startContent={<Download className="w-4 h-4" />}
          onClick={handleExportarCSV}
        >
          Exportar CSV
        </Button>
      </div>

      {/* Filtros */}
      <Card className="mb-6">
        <CardBody>
          <div className="flex flex-col gap-4">
            {/* Primeira linha - Busca e Tabela */}
            <div className="flex flex-col md:flex-row gap-4">
              <Input
                className="flex-1"
                placeholder="Buscar por número, cliente ou ID..."
                startContent={<Search className="w-4 h-4 text-gray-400" />}
                value={busca}
                onChange={(e) => {
                  setBusca(e.target.value);
                  setCurrentPage(1);
                }}
              />
              <Select
                className="w-full md:w-64"
                label="Tabela"
                selectedKeys={[tabelaFiltro]}
                onChange={(e) => {
                  setTabelaFiltro(e.target.value);
                  setCurrentPage(1);
                }}
              >
                {TABELAS_VENDAS.map((tabela) => (
                  <SelectItem key={tabela.key}>{tabela.label}</SelectItem>
                ))}
              </Select>
            </div>

            {/* Segunda linha - Filtro de datas */}
            <div className="flex flex-col md:flex-row gap-4">
              <Input
                className="w-full md:w-56"
                label="Data Inicial"
                type="date"
                value={dataInicio}
                onChange={(e) => {
                  setDataInicio(e.target.value);
                  setCurrentPage(1);
                }}
              />
              <Input
                className="w-full md:w-56"
                label="Data Final"
                type="date"
                value={dataFim}
                onChange={(e) => {
                  setDataFim(e.target.value);
                  setCurrentPage(1);
                }}
              />
              <div className="flex items-end">
                <Button
                  className="w-full md:w-auto"
                  color="default"
                  variant="flat"
                  onClick={() => {
                    setBusca("");
                    setTabelaFiltro("todas");
                    setDataInicio("");
                    setDataFim("");
                    setCurrentPage(1);
                  }}
                >
                  Limpar Filtros
                </Button>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Tabela de Logs */}
      <Card>
        <CardHeader className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Total de registros: {total}</h3>
          <div className="flex items-center gap-2">
            <span className="text-sm text-default-500">
              Mostrando {(currentPage - 1) * pageSize + 1} a{" "}
              {Math.min(currentPage * pageSize, total)} de {total}
            </span>
          </div>
        </CardHeader>
        <CardBody>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Spinner size="lg" />
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-default-500">Nenhum log encontrado</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table
                  removeWrapper
                  aria-label="Tabela de logs de deleção"
                  className="min-h-96"
                >
                  <TableHeader>
                    <TableColumn>TABELA</TableColumn>
                    <TableColumn>ID DO REGISTRO</TableColumn>
                    <TableColumn>DATA DA DELEÇÃO</TableColumn>
                    <TableColumn>DELETADO POR</TableColumn>
                    <TableColumn>AÇÕES</TableColumn>
                  </TableHeader>
                  <TableBody>
                    {logs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-semibold">
                          <span className="px-3 py-1 bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 rounded-full text-sm">
                            {log.tabela_nome}
                          </span>
                        </TableCell>
                        <TableCell>
                          <code className="text-xs bg-default-100 dark:bg-default-50 px-2 py-1 rounded text-foreground">
                            {log.registro_id
                              ? log.registro_id.slice(0, 12) + "..."
                              : "N/A"}
                          </code>
                        </TableCell>
                        <TableCell className="text-sm text-foreground">
                          {formatarData(log.criado_em)}
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-foreground font-medium">
                            {log.apagado_por_nome || "Desconhecido"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            onClick={() => {
                              setLogSelecionado(log);
                              onOpen();
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Paginação */}
              <div className="flex justify-center mt-6">
                <Pagination
                  isCompact
                  showControls
                  showShadow
                  color="primary"
                  page={currentPage}
                  total={Math.ceil(total / pageSize)}
                  onChange={(page) => carregarLogs(page)}
                />
              </div>
            </>
          )}
        </CardBody>
      </Card>

      {/* Modal de Detalhes */}
      <Modal isOpen={isOpen} size="lg" onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <h3>Detalhes da Deleção</h3>
                <p className="text-sm text-default-500 font-normal">
                  Tabela: {logSelecionado?.tabela_nome}
                </p>
              </ModalHeader>
              <ModalBody>
                {logSelecionado && (
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        ID do Registro:
                      </p>
                      <code className="block mt-1 p-2 bg-default-100 rounded text-xs overflow-auto text-foreground">
                        {logSelecionado.registro_id || "N/A"}
                      </code>
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        Data da Deleção:
                      </p>
                      <p className="mt-1 text-foreground">
                        {formatarData(logSelecionado.criado_em)}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        Deletado Por:
                      </p>
                      <p className="mt-1 font-medium text-foreground">
                        {logSelecionado.apagado_por_nome || "Desconhecido"}
                      </p>
                      {logSelecionado.apagado_por && (
                        <code className="block mt-1 text-xs text-default-500">
                          ID: {logSelecionado.apagado_por}
                        </code>
                      )}
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        Dados Apagados:
                      </p>
                      <div className="mt-2 space-y-2">
                        {formatarDadosApagados(
                          logSelecionado.tabela_nome,
                          logSelecionado.dados_apagados,
                        ).map((campo, index) => (
                          <div
                            key={index}
                            className="flex justify-between p-2 bg-default-100 rounded"
                          >
                            <span className="text-sm font-medium text-foreground">
                              {campo.nome}:
                            </span>
                            <span className="text-sm text-foreground">
                              {campo.valor}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Botão para ver JSON completo */}
                      <details className="mt-3">
                        <summary className="cursor-pointer text-xs text-default-500 hover:text-default-700">
                          Ver dados técnicos (JSON)
                        </summary>
                        <div className="mt-2 p-3 bg-default-100 rounded max-h-64 overflow-auto">
                          <pre className="text-xs font-mono text-foreground">
                            {JSON.stringify(
                              logSelecionado.dados_apagados,
                              null,
                              2,
                            )}
                          </pre>
                        </div>
                      </details>
                    </div>

                    {logSelecionado.motivo && (
                      <div>
                        <label className="text-sm font-semibold text-foreground">
                          Motivo:
                        </label>
                        <p className="mt-1 text-foreground">
                          {logSelecionado.motivo}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </ModalBody>
              <ModalFooter>
                <Button color="default" onPress={onClose}>
                  Fechar
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
