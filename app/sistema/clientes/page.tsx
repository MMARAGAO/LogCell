"use client";

import type { Cliente } from "@/types/clientesTecnicos";

import { useState, useEffect, useMemo } from "react";
import {
  Button,
  Input,
  Card,
  CardBody,
  Spinner,
  Pagination,
  Select,
  SelectItem,
  Chip,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Badge,
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
} from "@heroui/react";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/modal";
import {
  PlusIcon as Plus,
  MagnifyingGlassIcon as Search,
  UsersIcon as Users,
  UserPlusIcon as UserCheck,
  UserMinusIcon as UserX,
  Squares2X2Icon as LayoutGrid,
  Bars3Icon as List,
  FunnelIcon as Filter,
  ArrowDownTrayIcon as Download,
  BarsArrowUpIcon as SortAsc,
  BarsArrowDownIcon as SortDesc,
  EllipsisVerticalIcon as MoreVertical,
  PencilSquareIcon as Edit,
  TrashIcon as Trash2,
  CurrencyDollarIcon as DollarSign,
  ClockIcon as Clock,
  PhoneIcon as Phone,
  EnvelopeIcon as Mail,
  MapPinIcon as MapPin,
  ChartBarIcon as BarChart3,
  TableCellsIcon as FileSpreadsheet,
} from "@heroicons/react/24/outline";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/Toast";
import { ConfirmModal } from "@/components/ConfirmModal";
import { usePermissoes } from "@/hooks/usePermissoes";
import { Permissao } from "@/components/Permissao";
import {
  ClienteFormModal,
  ClienteCard,
  GerenciarCreditosModal,
  ClienteAnalyticsModal,
  ExportarAnalyticsModal,
} from "@/components/clientes";
import {
  buscarClientes,
  deletarCliente,
  toggleClienteAtivo,
} from "@/services/clienteService";
import { formatarTelefone, formatarCPF } from "@/lib/formatters";
import { abrirPreviewPDF } from "@/lib/pdfPreview";

// Hook para debounce
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function ClientesPage() {
  const { usuario } = useAuth();
  const toast = useToast();
  const { temPermissao, loading: loadingPermissoes } = usePermissoes();
  const searchParams = useSearchParams();
  const buscaParam = searchParams.get("busca");

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [clienteEditando, setClienteEditando] = useState<Cliente | undefined>();
  const [modalAnalyticsOpen, setModalAnalyticsOpen] = useState(false);
  const [clienteAnalytics, setClienteAnalytics] = useState<Cliente | null>(
    null,
  );
  const [modalExportOpen, setModalExportOpen] = useState(false);

  // Paginação
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalClientes, setTotalClientes] = useState(0);
  const [pageSize] = useState(50);

  // Estado para créditos
  const [creditosPorCliente, setCreditosPorCliente] = useState<
    Record<string, number>
  >({});
  const [modalCreditosOpen, setModalCreditosOpen] = useState(false);
  const [clienteCreditos, setClienteCreditos] = useState<{
    id: string;
    nome: string;
    saldo: number;
  } | null>(null);

  // Estado para modal de confirmação de exclusão
  const [modalDeleteOpen, setModalDeleteOpen] = useState(false);
  const [clienteParaDeletar, setClienteParaDeletar] = useState<Cliente | null>(
    null,
  );
  const [modalRelatorioOpen, setModalRelatorioOpen] = useState(false);
  const [clienteRelatorio, setClienteRelatorio] = useState<Cliente | null>(
    null,
  );
  const [gerandoRelatorio, setGerandoRelatorio] = useState(false);
  const primeiroDiaMesStr = () =>
    `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}-01`;
  const hojeStr = () => {
    const d = new Date();

    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };
  const [dataInicioRel, setDataInicioRel] =
    useState<string>(primeiroDiaMesStr());
  const [dataFimRel, setDataFimRel] = useState<string>(hojeStr());

  const [busca, setBusca] = useState("");
  const [filtroAtivo, setFiltroAtivo] = useState<boolean | undefined>(
    undefined,
  );

  // Debounce da busca (500ms)
  const buscaDebounced = useDebounce(busca, 500);

  const [stats, setStats] = useState({
    total: 0,
    ativos: 0,
    inativos: 0,
  });

  // Visualização e ordenação
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [sortBy, setSortBy] = useState<"nome" | "criado_em" | "ultima_compra">(
    "nome",
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [filtrosAbertos, setFiltrosAbertos] = useState(false);

  // Preencher busca vinda da URL
  useEffect(() => {
    if (buscaParam) {
      setBusca(buscaParam);
    }
  }, [buscaParam]);

  useEffect(() => {
    carregarClientes();
    carregarCreditos();
  }, [filtroAtivo, page, buscaDebounced]);

  const carregarClientes = async () => {
    setLoading(true);

    const {
      data,
      error,
      count,
      totalPages: total,
    } = await buscarClientes({
      ativo: filtroAtivo,
      busca: buscaDebounced || undefined,
      page,
      pageSize,
    });

    if (data) {
      setClientes(data);
      setTotalClientes(count);
      setTotalPages(total);

      // Calcular estatísticas totais (precisamos buscar sem filtro para stats corretas)
      if (!filtroAtivo && !busca) {
        calcularEstatisticas(count);
      }
    } else if (error) {
      toast.error(error);
    }

    setLoading(false);
  };

  const calcularEstatisticas = (total: number) => {
    // Para estatísticas completas, fazer queries separadas
    Promise.all([
      buscarClientes({ ativo: true, page: 1, pageSize: 1 }),
      buscarClientes({ ativo: false, page: 1, pageSize: 1 }),
    ]).then(([ativos, inativos]) => {
      setStats({
        total: total,
        ativos: ativos.count,
        inativos: inativos.count,
      });
    });
  };

  const carregarCreditos = async () => {
    try {
      const { supabase } = await import("@/lib/supabaseClient");
      const { data, error } = await supabase
        .from("creditos_cliente")
        .select("cliente_id, saldo")
        .gt("saldo", 0);

      if (error) throw error;

      // Agrupa créditos por cliente
      const creditosMap: Record<string, number> = {};

      (data || []).forEach((credito: any) => {
        if (!creditosMap[credito.cliente_id]) {
          creditosMap[credito.cliente_id] = 0;
        }
        creditosMap[credito.cliente_id] += credito.saldo;
      });

      setCreditosPorCliente(creditosMap);
    } catch (error) {
      console.error("Erro ao carregar créditos:", error);
    }
  };

  const handleNovoCliente = () => {
    if (!temPermissao("clientes.criar")) {
      toast.error("Você não tem permissão para criar clientes");

      return;
    }
    setClienteEditando(undefined);
    setModalOpen(true);
  };

  const handleEditarCliente = (cliente: Cliente) => {
    if (!temPermissao("clientes.editar")) {
      toast.error("Você não tem permissão para editar clientes");

      return;
    }
    setClienteEditando(cliente);
    setModalOpen(true);
  };

  const handleDeletarCliente = (cliente: Cliente) => {
    if (!temPermissao("clientes.deletar")) {
      toast.error("Você não tem permissão para excluir clientes");

      return;
    }
    setClienteParaDeletar(cliente);
    setModalDeleteOpen(true);
  };

  const confirmarDeletarCliente = async () => {
    if (!clienteParaDeletar) return;

    const { error } = await deletarCliente(clienteParaDeletar.id);

    if (error) {
      toast.error(error);
      setModalDeleteOpen(false);
      setClienteParaDeletar(null);

      return;
    }

    toast.success("Cliente excluído com sucesso!");
    setModalDeleteOpen(false);
    setClienteParaDeletar(null);
    carregarClientes();
  };

  const handleToggleAtivo = async (cliente: Cliente) => {
    if (!usuario) return;

    const { error } = await toggleClienteAtivo(
      cliente.id,
      !cliente.ativo,
      usuario.id,
    );

    if (error) {
      toast.error(error);

      return;
    }

    toast.success(
      cliente.ativo
        ? "Cliente desativado com sucesso!"
        : "Cliente ativado com sucesso!",
    );
    carregarClientes();
  };

  const handleVerHistorico = (cliente: Cliente) => {
    // TODO: Implementar modal de histórico
    toast.info("Funcionalidade em desenvolvimento");
  };

  const handleGerenciarCreditos = (cliente: Cliente) => {
    if (!temPermissao("clientes.processar_creditos")) {
      toast.error("Você não tem permissão para processar créditos");

      return;
    }
    setClienteCreditos({
      id: cliente.id,
      nome: cliente.nome,
      saldo: creditosPorCliente[cliente.id] || 0,
    });
    setModalCreditosOpen(true);
  };

  const handleAbrirAnalytics = (cliente: Cliente) => {
    setClienteAnalytics(cliente);
    setModalAnalyticsOpen(true);
  };

  const handleAbrirRelatorioCompras = (cliente: Cliente) => {
    setClienteRelatorio(cliente);
    setDataInicioRel(primeiroDiaMesStr());
    setDataFimRel(hojeStr());
    setModalRelatorioOpen(true);
  };

  const formatarDataBR = (iso: string): string => {
    const [y, m, d] = iso.split("-");

    return `${d}/${m}/${y}`;
  };

  const formatarMoeda = (valor: number): string => {
    return valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const handleGerarRelatorioCompras = async () => {
    if (!clienteRelatorio) return;
    if (!dataInicioRel || !dataFimRel) {
      toast.error("Selecione um período válido");

      return;
    }

    setGerandoRelatorio(true);

    try {
      const { supabase } = await import("@/lib/supabaseClient");

      const [ai, am, ad] = dataInicioRel.split("-").map(Number);
      const [fy, fm, fd] = dataFimRel.split("-").map(Number);
      const dataInicioIso = new Date(ai, am - 1, ad, 0, 0, 0, 0).toISOString();
      const dataFimIso = new Date(
        fy,
        fm - 1,
        fd,
        23,
        59,
        59,
        999,
      ).toISOString();

      const { data, error } = await supabase
        .from("vendas")
        .select(
          `
          id,
          numero_venda,
          criado_em,
          status,
          valor_total,
          valor_pago,
          saldo_devedor,
          loja:lojas(nome),
          itens:itens_venda(
            quantidade,
            preco_unitario,
            subtotal,
            produto:produtos(descricao, codigo_fabricante)
          )
        `,
        )
        .eq("cliente_id", clienteRelatorio.id)
        .neq("status", "cancelada")
        .gte("criado_em", dataInicioIso)
        .lte("criado_em", dataFimIso)
        .order("criado_em", { ascending: true });

      if (error) throw error;

      const vendas = data || [];
      const linhas: Array<Array<string | number>> = [];
      let totalVendas = 0;
      let totalPago = 0;
      let totalRestante = 0;
      let totalItens = 0;

      vendas.forEach((venda: any) => {
        totalVendas += Number(venda.valor_total || 0);
        totalPago += Number(venda.valor_pago || 0);
        totalRestante += Number(venda.saldo_devedor || 0);

        const itens = venda.itens || [];

        if (itens.length === 0) {
          linhas.push([
            new Date(venda.criado_em).toLocaleDateString("pt-BR"),
            `V${String(venda.numero_venda).padStart(6, "0")}`,
            venda.loja?.nome || "-",
            "Sem itens",
            "-",
            "-",
            formatarMoeda(Number(venda.valor_total || 0)),
            venda.status || "-",
          ]);

          return;
        }

        itens.forEach((item: any) => {
          const quantidade = Number(item.quantidade || 0);

          totalItens += quantidade;

          linhas.push([
            new Date(venda.criado_em).toLocaleDateString("pt-BR"),
            `V${String(venda.numero_venda).padStart(6, "0")}`,
            venda.loja?.nome || "-",
            item.produto?.descricao || item.produto?.codigo_fabricante || "-",
            quantidade,
            formatarMoeda(Number(item.preco_unitario || 0)),
            formatarMoeda(Number(item.subtotal || 0)),
            venda.status || "-",
          ]);
        });
      });

      const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
        import("jspdf/dist/jspdf.es.min.js"),
        import("jspdf-autotable"),
      ]);
      const doc = new jsPDF({ orientation: "landscape" });

      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("Relatorio de Compras por Cliente", 14, 16);
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.text(`Cliente: ${clienteRelatorio.nome}`, 14, 24);
      doc.text(
        `Periodo: ${formatarDataBR(dataInicioRel)} ate ${formatarDataBR(dataFimRel)}`,
        14,
        30,
      );
      doc.text(`Gerado em: ${new Date().toLocaleString("pt-BR")}`, 14, 36);

      if (linhas.length === 0) {
        doc.setFontSize(12);
        doc.text(
          "Nenhuma compra encontrada para o periodo selecionado.",
          14,
          50,
        );
      } else {
        autoTable(doc, {
          startY: 44,
          head: [
            [
              "Data",
              "Venda",
              "Loja",
              "Produto",
              "Qtd",
              "Preco Unit.",
              "Subtotal",
              "Status",
            ],
          ],
          body: linhas,
          theme: "grid",
          styles: { fontSize: 8, cellPadding: 2 },
          headStyles: { fillColor: [41, 98, 255] },
        });

        const finalY = (doc as any).lastAutoTable?.finalY || 44;

        autoTable(doc, {
          startY: finalY + 8,
          head: [["Resumo", "Valor"]],
          body: [
            ["Total de vendas no periodo", formatarMoeda(totalVendas)],
            ["Total pago", formatarMoeda(totalPago)],
            ["Total em aberto", formatarMoeda(totalRestante)],
            ["Quantidade total de itens", String(totalItens)],
            ["Quantidade de vendas", String(vendas.length)],
          ],
          theme: "striped",
          styles: { fontSize: 9, cellPadding: 2.5 },
          headStyles: { fillColor: [46, 125, 50] },
          margin: { left: 14, right: 120 },
        });
      }

      abrirPreviewPDF(
        doc,
        `relatorio_compras_${clienteRelatorio.nome.replace(/\s+/g, "_")}.pdf`,
      );
      toast.success("Relatorio gerado com sucesso!");
      setModalRelatorioOpen(false);
    } catch (error: any) {
      console.error("Erro ao gerar relatorio de compras:", error);
      toast.error(error?.message || "Erro ao gerar relatorio");
    } finally {
      setGerandoRelatorio(false);
    }
  };

  // Resetar para página 1 quando mudar busca ou filtro
  useEffect(() => {
    setPage(1);
  }, [buscaDebounced, filtroAtivo]);

  // Ordenar clientes
  const clientesOrdenados = useMemo(() => {
    const sorted = [...clientes].sort((a, b) => {
      let compareValue = 0;

      switch (sortBy) {
        case "nome":
          compareValue = a.nome.localeCompare(b.nome);
          break;
        case "criado_em":
          compareValue =
            new Date(a.criado_em || 0).getTime() -
            new Date(b.criado_em || 0).getTime();
          break;
        case "ultima_compra":
          // Ordenar por última compra (se tiver esse campo)
          compareValue = 0; // Implementar quando tiver o campo
          break;
      }

      return sortOrder === "asc" ? compareValue : -compareValue;
    });

    return sorted;
  }, [clientes, sortBy, sortOrder]);

  // Verificar estados de loading primeiro
  if (!usuario || loadingPermissoes) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <Spinner size="lg" />
      </div>
    );
  }

  // Verificar se tem permissão para visualizar clientes
  if (!temPermissao("clientes.visualizar")) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <Card>
          <CardBody className="text-center py-12">
            <Users className="w-16 h-16 mx-auto mb-4 text-danger" />
            <h3 className="text-xl font-semibold mb-2">Acesso Negado</h3>
            <p className="text-default-500">
              Você não tem permissão para visualizar clientes
            </p>
          </CardBody>
        </Card>
      </div>
    );
  }

  const SORT_BY_LABELS: Record<string, string> = {
    nome: "Nome",
    criado_em: "Data de Cadastro",
    ultima_compra: "Última Compra",
  };

  const limparFiltros = () => {
    setSortBy("nome");
    setSortOrder("asc");
  };

  // Chips de filtros ativos (busca tem campo próprio; status fica nos cards)
  const chipsFiltros: { key: string; label: string; onRemove: () => void }[] =
    [];

  if (sortBy !== "nome" || sortOrder !== "asc") {
    chipsFiltros.push({
      key: "ordenacao",
      label: `Ordem: ${SORT_BY_LABELS[sortBy]} (${sortOrder === "asc" ? "Crescente" : "Decrescente"})`,
      onRemove: limparFiltros,
    });
  }

  return (
    <div className="mx-auto max-w-[1600px] space-y-6 p-6">
      {toast.ToastComponent}
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Clientes
          </h1>
          <p className="text-sm text-default-500">
            Gerencie o cadastro de clientes
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Permissao permissao="clientes.visualizar">
            <Button
              size="lg"
              startContent={<FileSpreadsheet className="h-4 w-4" />}
              variant="flat"
              onPress={() => setModalExportOpen(true)}
            >
              Exportar Analytics
            </Button>
          </Permissao>
          <Permissao permissao="clientes.criar">
            <Button
              color="primary"
              size="lg"
              startContent={<Plus className="h-4 w-4" />}
              onPress={handleNovoCliente}
            >
              Novo Cliente
            </Button>
          </Permissao>
        </div>
      </div>

      {/* Cards de Estatísticas (clicáveis = filtro por status) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <Card
          isPressable
          className={`border shadow-sm ${filtroAtivo === undefined ? "border-primary ring-1 ring-primary" : "border-default-200/70"}`}
          onPress={() => setFiltroAtivo(undefined)}
        >
          <CardBody className="flex flex-row items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-default-100 text-default-500">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-default-500">Total</p>
              <p className="text-2xl font-bold tabular-nums text-foreground">
                {stats.total}
              </p>
            </div>
          </CardBody>
        </Card>

        <Card
          isPressable
          className={`border shadow-sm ${filtroAtivo === true ? "border-primary ring-1 ring-primary" : "border-default-200/70"}`}
          onPress={() => setFiltroAtivo(true)}
        >
          <CardBody className="flex flex-row items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-default-100 text-default-500">
              <UserCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-default-500">Ativos</p>
              <p className="text-2xl font-bold tabular-nums text-foreground">
                {stats.ativos}
              </p>
            </div>
          </CardBody>
        </Card>

        <Card
          isPressable
          className={`border shadow-sm ${filtroAtivo === false ? "border-primary ring-1 ring-primary" : "border-default-200/70"}`}
          onPress={() => setFiltroAtivo(false)}
        >
          <CardBody className="flex flex-row items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-default-100 text-default-500">
              <UserX className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-default-500">Inativos</p>
              <p className="text-2xl font-bold tabular-nums text-foreground">
                {stats.inativos}
              </p>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Busca e Filtros */}
      <div className="rounded-xl border border-default-200/70 bg-content1 p-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Input
            isClearable
            className="flex-1"
            placeholder="Buscar por nome, telefone, CPF ou email..."
            radius="md"
            size="md"
            startContent={<Search className="h-4 w-4 text-default-400" />}
            type="search"
            value={busca}
            variant="bordered"
            onClear={() => setBusca("")}
            onValueChange={setBusca}
          />
          <div className="flex items-center justify-between gap-2 sm:justify-end">
            <div className="flex items-center gap-1 rounded-lg bg-default-100 p-1">
              <Button
                isIconOnly
                className="h-7 w-7 min-w-0"
                color={viewMode === "cards" ? "primary" : "default"}
                size="sm"
                variant={viewMode === "cards" ? "solid" : "light"}
                onPress={() => setViewMode("cards")}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                isIconOnly
                className="h-7 w-7 min-w-0"
                color={viewMode === "table" ? "primary" : "default"}
                size="sm"
                variant={viewMode === "table" ? "solid" : "light"}
                onPress={() => setViewMode("table")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
            <Badge
              color="primary"
              content={chipsFiltros.length}
              isInvisible={chipsFiltros.length === 0}
              size="sm"
            >
              <Button
                radius="md"
                size="md"
                startContent={<Filter className="h-4 w-4" />}
                variant="flat"
                onPress={() => setFiltrosAbertos(true)}
              >
                Filtros
              </Button>
            </Badge>
          </div>
        </div>

        {/* Chips de filtros ativos */}
        {chipsFiltros.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {chipsFiltros.map((chip) => (
              <Chip
                key={chip.key}
                size="sm"
                variant="flat"
                onClose={chip.onRemove}
              >
                {chip.label}
              </Chip>
            ))}
            <Button
              className="h-7 px-2 text-xs text-default-500"
              size="sm"
              variant="light"
              onPress={limparFiltros}
            >
              Limpar tudo
            </Button>
          </div>
        )}

        {/* Contagem */}
        <div className="mt-2 flex items-center">
          <span className="ml-auto text-xs text-default-500 tabular-nums">
            {busca !== buscaDebounced
              ? "Aguardando digitação..."
              : totalClientes > 0
                ? `${totalClientes} cliente${totalClientes !== 1 ? "s" : ""}`
                : ""}
          </span>
        </div>
      </div>

      {/* Drawer de Filtros (mesmo padrão das demais telas) */}
      <Drawer
        isOpen={filtrosAbertos}
        size="sm"
        onOpenChange={setFiltrosAbertos}
      >
        <DrawerContent>
          <DrawerHeader className="flex flex-col gap-1">Filtros</DrawerHeader>
          <DrawerBody className="gap-4">
            <Select
              label="Ordenar por"
              selectedKeys={[sortBy]}
              variant="bordered"
              onChange={(e) =>
                setSortBy(
                  e.target.value as "nome" | "criado_em" | "ultima_compra",
                )
              }
            >
              <SelectItem key="nome">Nome</SelectItem>
              <SelectItem key="criado_em">Data de Cadastro</SelectItem>
              <SelectItem key="ultima_compra">Última Compra</SelectItem>
            </Select>

            <Select
              label="Ordem"
              selectedKeys={[sortOrder]}
              variant="bordered"
              onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
            >
              <SelectItem
                key="asc"
                startContent={<SortAsc className="h-4 w-4" />}
              >
                Crescente
              </SelectItem>
              <SelectItem
                key="desc"
                startContent={<SortDesc className="h-4 w-4" />}
              >
                Decrescente
              </SelectItem>
            </Select>

            <Button
              className="mt-2"
              startContent={<Download className="h-4 w-4" />}
              variant="flat"
              onPress={() => {
                toast.success("Funcionalidade em desenvolvimento");
              }}
            >
              Exportar Lista
            </Button>
          </DrawerBody>
          <DrawerFooter>
            <Button variant="flat" onPress={limparFiltros}>
              Limpar tudo
            </Button>
            <Button color="primary" onPress={() => setFiltrosAbertos(false)}>
              Ver resultados
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* Lista de Clientes */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Spinner size="lg" />
        </div>
      ) : clientes.length === 0 ? (
        <Card>
          <CardBody className="text-center py-12">
            <Users className="w-16 h-16 mx-auto mb-4 text-default-300" />
            <h3 className="text-xl font-semibold mb-2">
              {totalClientes === 0
                ? "Nenhum cliente cadastrado"
                : "Nenhum cliente encontrado"}
            </h3>
            <p className="text-default-500 mb-6">
              {totalClientes === 0
                ? "Cadastre seu primeiro cliente clicando no botão acima"
                : "Tente ajustar os filtros de busca"}
            </p>
            {totalClientes === 0 && (
              <Permissao permissao="clientes.criar">
                <Button
                  color="primary"
                  startContent={<Plus className="w-4 h-4" />}
                  onPress={handleNovoCliente}
                >
                  Novo Cliente
                </Button>
              </Permissao>
            )}
          </CardBody>
        </Card>
      ) : (
        <>
          {viewMode === "cards" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {clientesOrdenados.map((cliente) => (
                <ClienteCard
                  key={cliente.id}
                  cliente={cliente}
                  creditosDisponiveis={creditosPorCliente[cliente.id] || 0}
                  onAnalytics={handleAbrirAnalytics}
                  onDeletar={handleDeletarCliente}
                  onEditar={handleEditarCliente}
                  onGerenciarCreditos={handleGerenciarCreditos}
                  onRelatorioCompras={handleAbrirRelatorioCompras}
                  onToggleAtivo={handleToggleAtivo}
                  onVerHistorico={handleVerHistorico}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardBody className="p-0">
                <Table
                  aria-label="Tabela de clientes"
                  classNames={{
                    wrapper: "shadow-none",
                  }}
                >
                  <TableHeader>
                    <TableColumn>CLIENTE</TableColumn>
                    <TableColumn>CONTATO</TableColumn>
                    <TableColumn>ENDEREÇO</TableColumn>
                    <TableColumn>STATUS</TableColumn>
                    <TableColumn>CRÉDITOS</TableColumn>
                    <TableColumn align="center">AÇÕES</TableColumn>
                  </TableHeader>
                  <TableBody>
                    {clientesOrdenados.map((cliente) => (
                      <TableRow key={cliente.id}>
                        <TableCell>
                          <div className="flex flex-col">
                            <p className="font-semibold">{cliente.nome}</p>
                            {cliente.doc && (
                              <p className="text-sm text-default-500">
                                CPF: {formatarCPF(cliente.doc)}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            {cliente.telefone && (
                              <div className="flex items-center gap-1 text-sm">
                                <Phone className="w-3 h-3 text-default-400" />
                                <span>
                                  {formatarTelefone(cliente.telefone)}
                                </span>
                              </div>
                            )}
                            {cliente.email && (
                              <div className="flex items-center gap-1 text-sm">
                                <Mail className="w-3 h-3 text-default-400" />
                                <span className="truncate max-w-[200px]">
                                  {cliente.email}
                                </span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-start gap-1 text-sm max-w-[250px]">
                            <MapPin className="w-3 h-3 text-default-400 mt-0.5 flex-shrink-0" />
                            <span className="line-clamp-2">
                              {(cliente.logradouro &&
                                `${cliente.logradouro}${cliente.numero ? `, ${cliente.numero}` : ""}${cliente.complemento ? ` - ${cliente.complemento}` : ""}`) ||
                                "-"}
                              {cliente.cidade && `, ${cliente.cidade}`}
                              {cliente.estado && ` - ${cliente.estado}`}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Chip
                            color={cliente.ativo ? "success" : "danger"}
                            size="sm"
                            variant="flat"
                          >
                            {cliente.ativo ? "Ativo" : "Inativo"}
                          </Chip>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-3 h-3 text-success" />
                            <span className="text-sm font-semibold text-success">
                              {creditosPorCliente[cliente.id] || 0}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-center">
                            <Dropdown>
                              <DropdownTrigger>
                                <Button isIconOnly size="sm" variant="light">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownTrigger>
                              <DropdownMenu aria-label="Ações do cliente">
                                <DropdownItem
                                  key="edit"
                                  startContent={<Edit className="w-4 h-4" />}
                                  onPress={() => handleEditarCliente(cliente)}
                                >
                                  Editar
                                </DropdownItem>
                                <DropdownItem
                                  key="credits"
                                  startContent={
                                    <DollarSign className="w-4 h-4" />
                                  }
                                  onPress={() =>
                                    handleGerenciarCreditos(cliente)
                                  }
                                >
                                  Gerenciar Créditos
                                </DropdownItem>
                                <DropdownItem
                                  key="history"
                                  startContent={<Clock className="w-4 h-4" />}
                                  onPress={() => handleVerHistorico(cliente)}
                                >
                                  Ver Histórico
                                </DropdownItem>
                                <DropdownItem
                                  key="analytics"
                                  startContent={
                                    <BarChart3 className="w-4 h-4" />
                                  }
                                  onPress={() => handleAbrirAnalytics(cliente)}
                                >
                                  Analytics
                                </DropdownItem>
                                <DropdownItem
                                  key="report_purchases"
                                  startContent={
                                    <Download className="w-4 h-4" />
                                  }
                                  onPress={() =>
                                    handleAbrirRelatorioCompras(cliente)
                                  }
                                >
                                  Relatorio de Compras (PDF)
                                </DropdownItem>
                                <DropdownItem
                                  key="toggle"
                                  onPress={() => handleToggleAtivo(cliente)}
                                >
                                  {cliente.ativo ? "Desativar" : "Ativar"}
                                </DropdownItem>
                                <DropdownItem
                                  key="delete"
                                  className="text-danger"
                                  color="danger"
                                  startContent={<Trash2 className="w-4 h-4" />}
                                  onPress={() => handleDeletarCliente(cliente)}
                                >
                                  Excluir
                                </DropdownItem>
                              </DropdownMenu>
                            </Dropdown>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardBody>
            </Card>
          )}

          {/* Paginação */}
          {totalPages > 1 && (
            <div className="flex flex-col items-center gap-4 mt-6">
              <Pagination
                showControls
                color="primary"
                page={page}
                size="lg"
                total={totalPages}
                onChange={setPage}
              />
              <p className="text-sm text-default-500">
                Mostrando{" "}
                <span className="font-semibold">
                  {(page - 1) * pageSize + 1}
                </span>
                {" - "}
                <span className="font-semibold">
                  {Math.min(page * pageSize, totalClientes)}
                </span>
                {" de "}
                <span className="font-semibold">{totalClientes}</span> clientes
                {(buscaDebounced || filtroAtivo !== undefined) && (
                  <span className="text-primary"> (filtrados)</span>
                )}
              </p>
            </div>
          )}
        </>
      )}

      {/* Modal de Criar/Editar Cliente */}
      <ClienteFormModal
        cliente={clienteEditando}
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setClienteEditando(undefined);
        }}
        onSuccess={carregarClientes}
      />

      {/* Modal de Gerenciar Créditos */}
      {clienteCreditos && (
        <GerenciarCreditosModal
          clienteId={clienteCreditos.id}
          clienteNome={clienteCreditos.nome}
          isOpen={modalCreditosOpen}
          saldoAtual={clienteCreditos.saldo}
          onClose={() => {
            setModalCreditosOpen(false);
            setClienteCreditos(null);
          }}
          onSuccess={() => {
            carregarCreditos();
            carregarClientes();
          }}
        />
      )}

      {/* Modal de Analytics */}
      {clienteAnalytics && (
        <ClienteAnalyticsModal
          cliente={clienteAnalytics}
          isOpen={modalAnalyticsOpen}
          onClose={() => {
            setModalAnalyticsOpen(false);
            setClienteAnalytics(null);
          }}
        />
      )}

      {/* Modal de Confirmação de Exclusão */}
      <Modal
        isOpen={modalRelatorioOpen}
        onClose={() => {
          if (gerandoRelatorio) return;
          setModalRelatorioOpen(false);
          setClienteRelatorio(null);
        }}
      >
        <ModalContent>
          <ModalHeader>Relatorio de Compras do Cliente</ModalHeader>
          <ModalBody className="gap-4">
            <p className="text-sm text-default-600">
              Cliente: <strong>{clienteRelatorio?.nome || "-"}</strong>
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Data início"
                type="date"
                value={dataInicioRel}
                variant="bordered"
                onChange={(e) => setDataInicioRel(e.target.value)}
              />
              <Input
                label="Data fim"
                type="date"
                value={dataFimRel}
                variant="bordered"
                onChange={(e) => setDataFimRel(e.target.value)}
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="light"
              onPress={() => {
                setModalRelatorioOpen(false);
                setClienteRelatorio(null);
              }}
            >
              Cancelar
            </Button>
            <Button
              color="primary"
              isLoading={gerandoRelatorio}
              startContent={<Download className="w-4 h-4" />}
              onPress={handleGerarRelatorioCompras}
            >
              Gerar PDF
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <ExportarAnalyticsModal
        isOpen={modalExportOpen}
        onClose={() => setModalExportOpen(false)}
      />

      <ConfirmModal
        cancelText="Cancelar"
        confirmColor="danger"
        confirmText="Excluir"
        isOpen={modalDeleteOpen}
        message={
          clienteParaDeletar ? (
            <p>
              Deseja realmente excluir o cliente{" "}
              <strong>{clienteParaDeletar.nome}</strong>?
              <br />
              <br />
              Esta ação não poderá ser desfeita.
            </p>
          ) : (
            ""
          )
        }
        title="Excluir Cliente"
        onClose={() => {
          setModalDeleteOpen(false);
          setClienteParaDeletar(null);
        }}
        onConfirm={confirmarDeletarCliente}
      />
    </div>
  );
}
