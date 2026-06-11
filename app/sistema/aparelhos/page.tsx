"use client";

import { useState, useEffect } from "react";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { Chip } from "@heroui/chip";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@heroui/table";
import { Pagination } from "@heroui/pagination";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
} from "@heroui/drawer";
import { Badge } from "@heroui/badge";
import { Skeleton } from "@heroui/skeleton";
import {
  DevicePhoneMobileIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  EllipsisVerticalIcon,
  PencilIcon,
  TrashIcon,
  FunnelIcon,
  Squares2X2Icon,
  TableCellsIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ShoppingBagIcon,
  CameraIcon,
  SparklesIcon,
  FireIcon,
  TagIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import {
  DollarSign,
  ShoppingBag,
  TrendingUp,
  Wallet,
  Box,
  Coins,
  Gauge,
  PiggyBank,
  CreditCard,
  Info,
} from "lucide-react";

import { PermissionGuard } from "@/components/PermissionGuard";
import { useAuthContext } from "@/contexts/AuthContext";
import { usePermissoes } from "@/hooks/usePermissoes";
import { useToast } from "@/components/Toast";
import { ConfirmModal } from "@/components/ConfirmModal";
import { formatarMoeda, formatarData } from "@/lib/formatters";
import { Aparelho, FiltrosAparelhos, FotoAparelho } from "@/types/aparelhos";
import {
  getAparelhos,
  deletarAparelho,
  atualizarStatusAparelho,
} from "@/services/aparelhosService";
import { getFotosAparelho } from "@/services/fotosAparelhosService";
import { AparelhoFormModal } from "@/components/aparelhos/AparelhoFormModal";
import { RecebimentoAparelhoModal } from "@/components/aparelhos/RecebimentoAparelhoModal";
import { VendaAparelhoModal } from "@/components/aparelhos/VendaAparelhoModal";
import { DetalhesAparelhoModal } from "@/components/aparelhos/DetalhesAparelhoModal";
import { ModalDevolucaoAparelho } from "@/components/aparelhos/ModalDevolucaoAparelho";
import { HistoricoDevolucoesAparelho } from "@/components/aparelhos/HistoricoDevolucoesAparelho";
import { BarcodeScanner } from "@/components/BarcodeScanner";
import {
  AparelhosDashboardService,
  KpisAparelhos,
} from "@/services/aparelhosDashboardService";
import { supabase } from "@/lib/supabaseClient";

interface Loja {
  id: number;
  nome: string;
}

const ESTADOS = [
  { value: "novo", label: "Novo" },
  { value: "seminovo", label: "Seminovo" },
  { value: "usado", label: "Usado" },
  { value: "recondicionado", label: "Recondicionado" },
];

const STATUS = [
  { value: "disponivel", label: "Disponível", color: "success" },
  { value: "vendido", label: "Vendido", color: "default" },
  { value: "com_pagamento", label: "Com pagamento", color: "success" },
  { value: "reservado", label: "Reservado", color: "warning" },
  { value: "defeito", label: "Defeito", color: "danger" },
  { value: "transferido", label: "Transferido", color: "primary" },
];

const MARCAS = [
  "Apple",
  "Samsung",
  "Motorola",
  "Xiaomi",
  "LG",
  "Multilaser",
  "Positivo",
  "Asus",
  "Nokia",
  "Huawei",
  "Sony",
  "Google",
  "OnePlus",
  "Realme",
  "Outro",
];

const ARMAZENAMENTOS = [
  "8GB",
  "16GB",
  "32GB",
  "64GB",
  "128GB",
  "256GB",
  "512GB",
  "1TB",
];

const CONDICOES = [
  { value: "perfeito", label: "Perfeito" },
  { value: "bom", label: "Bom" },
  { value: "regular", label: "Regular" },
  { value: "ruim", label: "Ruim" },
];

export default function AparelhosPage() {
  const { usuario } = useAuthContext();
  const { showToast } = useToast();
  const {
    temPermissao,
    lojaId,
    todasLojas,
    loading: loadingPermissoes,
  } = usePermissoes();

  const [aparelhos, setAparelhos] = useState<Aparelho[]>([]);
  const [fotosAparelhos, setFotosAparelhos] = useState<
    Record<string, FotoAparelho[]>
  >({});
  const [fotoAtualIndex, setFotoAtualIndex] = useState<Record<string, number>>(
    {},
  );
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(false);
  const [busca, setBusca] = useState("");
  const [buscaDebounced, setBuscaDebounced] = useState("");
  const [filtros, setFiltros] = useState<FiltrosAparelhos>({});
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [totalRegistros, setTotalRegistros] = useState(0);
  const [visualizacao, setVisualizacao] = useState<"tabela" | "cards">("cards");
  const itensPorPagina = 20;

  // KPIs
  const [kpis, setKpis] = useState<KpisAparelhos>({
    vendasHoje: 0,
    recebimentosHoje: 0,
    aReceber: 0,
    vendasMes: 0,
    disponiveis: 0,
    valorVendidoMes: 0,
    ticketMedioMes: 0,
    lucroEstimadoMes: 0,
  });
  const [loadingKpis, setLoadingKpis] = useState(false);

  // Modals
  const [modalFormAberto, setModalFormAberto] = useState(false);
  const [aparelhoParaEditar, setAparelhoParaEditar] = useState<
    Aparelho | undefined
  >(undefined);
  const [modalDeleteAberto, setModalDeleteAberto] = useState(false);
  const [aparelhoParaDeletar, setAparelhoParaDeletar] = useState<
    Aparelho | undefined
  >(undefined);
  const [modalRecebimentoAberto, setModalRecebimentoAberto] = useState(false);
  const [aparelhoParaReceber, setAparelhoParaReceber] = useState<
    Aparelho | undefined
  >(undefined);
  const [modalVendaAberto, setModalVendaAberto] = useState(false);
  const [aparelhoParaVender, setAparelhoParaVender] = useState<
    Aparelho | undefined
  >(undefined);
  const [modalDevolucaoAberto, setModalDevolucaoAberto] = useState(false);
  const [aparelhoParaDevolucao, setAparelhoParaDevolucao] = useState<
    Aparelho | undefined
  >(undefined);
  const [modalHistoricoAberto, setModalHistoricoAberto] = useState(false);
  const [aparelhoParaHistorico, setAparelhoParaHistorico] = useState<
    Aparelho | undefined
  >(undefined);
  const [scannerAberto, setScannerAberto] = useState(false);
  const [filtrosAbertos, setFiltrosAbertos] = useState(false);
  const [lojas, setLojas] = useState<Loja[]>([]);
  const [vendasInfo, setVendasInfo] = useState<
    Record<string, { valor_pago: number }>
  >({});
  const [modalDetalhesAberto, setModalDetalhesAberto] = useState(false);
  const [aparelhoParaDetalhes, setAparelhoParaDetalhes] = useState<
    Aparelho | undefined
  >(undefined);

  // Permissões
  const podeVisualizar = temPermissao("aparelhos.visualizar");
  const podeCriar = temPermissao("aparelhos.criar");
  const podeEditar = temPermissao("aparelhos.editar");
  const podeDeletar = temPermissao("aparelhos.deletar");
  const podeAlterarStatus = temPermissao("aparelhos.alterar_status");
  const podeReceber = temPermissao("aparelhos.receber");
  const podeVender = temPermissao("aparelhos.vender");
  const podeGerenciarFotos = temPermissao("aparelhos.gerenciar_fotos");
  const podeVerRelatorios = temPermissao("aparelhos.ver_relatorios");
  const podeVerDashboard = temPermissao("aparelhos.ver_dashboard");
  const podeRegistrarDevolucao = temPermissao("devolucoes.criar");
  const podeVerHistoricoDevolucao = temPermissao("devolucoes.visualizar");
  const lojaIdFinal = todasLojas ? null : lojaId;

  useEffect(() => {
    const carregarLojas = async () => {
      if (!todasLojas) return;
      try {
        const { data, error } = await supabase
          .from("lojas")
          .select("id, nome")
          .order("nome");

        if (error) throw error;
        setLojas(data || []);
      } catch (error) {
        console.error("Erro ao carregar lojas:", error);
        setLojas([]);
      }
    };

    carregarLojas();
  }, [todasLojas]);

  // Debounce da busca: ao digitar (ou ao escanear IMEI), aguarda 400ms,
  // volta para a primeira página e dispara o recarregamento.
  useEffect(() => {
    const timer = setTimeout(() => {
      setBuscaDebounced(busca);
      setPaginaAtual(1);
    }, 400);

    return () => clearTimeout(timer);
  }, [busca]);

  // Carregar aparelhos e produtos
  useEffect(() => {
    if (podeVisualizar) {
      carregarDados();
    }
  }, [lojaIdFinal, podeVisualizar, filtros, paginaAtual, buscaDebounced]);

  useEffect(() => {
    if (podeVisualizar && podeVerDashboard) {
      carregarKpis();
    }
  }, [lojaIdFinal, podeVisualizar, podeVerDashboard]);

  async function carregarKpis() {
    try {
      setLoadingKpis(true);
      const k = await AparelhosDashboardService.getKpis({
        loja_id: lojaIdFinal || undefined,
      });

      setKpis(k);
    } finally {
      setLoadingKpis(false);
    }
  }

  async function carregarDados() {
    try {
      setLoading(true);
      setErro(false);

      const filtrosComLoja: FiltrosAparelhos = {
        ...filtros,
        busca: buscaDebounced || undefined,
        loja_id: lojaIdFinal || undefined,
        status: filtros.status === "com_pagamento" ? undefined : filtros.status,
        page: paginaAtual,
        pageSize: itensPorPagina,
      };

      const { data: aparelhosData, count } = await getAparelhos(filtrosComLoja);

      setAparelhos(aparelhosData);
      setTotalRegistros(count);

      // Buscar pagamentos dinamicamente (soma agregada)
      const vendasIds = aparelhosData
        .filter((a) => a.status === "vendido" && a.venda_id)
        .map((a) => a.venda_id) as string[];

      const vendasMap: Record<string, { valor_pago: number }> = {};

      if (vendasIds.length > 0) {
        try {
          const { data: pagamentosDb } = await supabase
            .from("pagamentos_venda")
            .select("venda_id, valor, liquido")
            .in("venda_id", vendasIds);

          pagamentosDb?.forEach((p: any) => {
            if (!vendasMap[p.venda_id])
              vendasMap[p.venda_id] = { valor_pago: 0 };
            vendasMap[p.venda_id].valor_pago += p.liquido ?? p.valor;
          });
        } catch (err) {
          console.error("Erro ao carregar pagamentos:", err);
        }
      }

      setVendasInfo(vendasMap);

      // Carregar fotos dos aparelhos da página atual
      const fotosMap: Record<string, FotoAparelho[]> = {};
      const indexMap: Record<string, number> = {};

      await Promise.all(
        aparelhosData.map(async (aparelho) => {
          try {
            const fotos = await getFotosAparelho(aparelho.id);

            fotosMap[aparelho.id] = fotos;
            indexMap[aparelho.id] = 0;
          } catch (error) {
            console.error(
              `Erro ao carregar fotos do aparelho ${aparelho.id}:`,
              error,
            );
            fotosMap[aparelho.id] = [];
            indexMap[aparelho.id] = 0;
          }
        }),
      );

      setFotosAparelhos(fotosMap);
      setFotoAtualIndex(indexMap);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      setErro(true);
      showToast("Erro ao carregar aparelhos", "error");
    } finally {
      setLoading(false);
    }
  }

  // Navegar entre fotos do carrossel
  const proximaFoto = (aparelhoId: string) => {
    const fotos = fotosAparelhos[aparelhoId] || [];

    if (fotos.length === 0) return;

    setFotoAtualIndex((prev) => ({
      ...prev,
      [aparelhoId]: (prev[aparelhoId] + 1) % fotos.length,
    }));
  };

  const fotoAnterior = (aparelhoId: string) => {
    const fotos = fotosAparelhos[aparelhoId] || [];

    if (fotos.length === 0) return;

    setFotoAtualIndex((prev) => ({
      ...prev,
      [aparelhoId]:
        prev[aparelhoId] === 0 ? fotos.length - 1 : prev[aparelhoId] - 1,
    }));
  };

  // Paginação server-side
  const totalPaginas = Math.ceil(totalRegistros / itensPorPagina);

  // Handlers
  const handleAbrirFormNovo = () => {
    setAparelhoParaEditar(undefined);
    setModalFormAberto(true);
  };

  const handleAbrirFormEditar = (aparelho: Aparelho) => {
    setAparelhoParaEditar(aparelho);
    setModalFormAberto(true);
  };

  const handleFecharForm = async (sucesso?: boolean) => {
    setModalFormAberto(false);
    setAparelhoParaEditar(undefined);
    if (sucesso) {
      await carregarDados();
    }
  };

  const handleAbrirConfirmDelete = (aparelho: Aparelho) => {
    setAparelhoParaDeletar(aparelho);
    setModalDeleteAberto(true);
  };

  const handleDeletar = async () => {
    if (!aparelhoParaDeletar || !usuario) return;

    try {
      await deletarAparelho(aparelhoParaDeletar.id);
      showToast("Aparelho deletado com sucesso", "success");
      setModalDeleteAberto(false);
      setAparelhoParaDeletar(undefined);
      await carregarDados();
    } catch (error: any) {
      console.error("Erro ao deletar aparelho:", error);
      showToast(error.message || "Erro ao deletar aparelho", "error");
    }
  };

  const handleAcaoCard = async (key: string, aparelho: Aparelho) => {
    if (key === "editar") {
      handleAbrirFormEditar(aparelho);

      return;
    }
    if (key === "gerenciar_pagamentos") {
      setAparelhoParaReceber(aparelho);
      setModalRecebimentoAberto(true);

      return;
    }
    if (key === "deletar") {
      handleAbrirConfirmDelete(aparelho);

      return;
    }
    if (key === "vender") {
      if (!podeVender) {
        showToast("Você não tem permissão para vender aparelhos", "warning");

        return;
      }
      setAparelhoParaVender(aparelho);
      setModalVendaAberto(true);

      return;
    }
    if (key === "receber_pagamento") {
      if (!podeReceber) {
        showToast(
          "Você não tem permissão para receber pagamento de aparelhos",
          "warning",
        );

        return;
      }
      setAparelhoParaReceber(aparelho);
      setModalRecebimentoAberto(true);

      return;
    }
    if (key === "detalhes") {
      setAparelhoParaDetalhes(aparelho);
      setModalDetalhesAberto(true);

      return;
    }
    if (key === "registrar_devolucao") {
      setAparelhoParaDevolucao(aparelho);
      setModalDevolucaoAberto(true);

      return;
    }
    if (key === "historico_devolucoes") {
      setAparelhoParaHistorico(aparelho);
      setModalHistoricoAberto(true);

      return;
    }
    if (key.startsWith("status:")) {
      const novoStatus = key.split(":")[1];

      await handleAtualizarStatus(aparelho.id, novoStatus);

      return;
    }
  };

  const handleAtualizarStatus = async (
    aparelhoId: string,
    novoStatus: string,
  ) => {
    if (!usuario) return;

    try {
      await atualizarStatusAparelho(aparelhoId, novoStatus as any, usuario.id);
      showToast("Status atualizado com sucesso", "success");
      await carregarDados();
    } catch (error: any) {
      console.error("Erro ao atualizar status:", error);
      showToast(error.message || "Erro ao atualizar status", "error");
    }
  };

  const getStatusChipColor = (status: string) => {
    const statusObj = STATUS.find((s) => s.value === status);

    return statusObj?.color || "default";
  };

  const getEstadoLabel = (estado: string) => {
    const estadoObj = ESTADOS.find((e) => e.value === estado);

    return estadoObj?.label || estado;
  };

  const removerFiltro = (campo: keyof FiltrosAparelhos) => {
    setFiltros((prev) => ({ ...prev, [campo]: undefined }));
    setPaginaAtual(1);
  };

  const limparTudo = () => {
    setFiltros({});
    setBusca("");
    setPaginaAtual(1);
  };

  // Filtros ativos exibidos como chips removíveis (busca e ordenação não contam)
  const chipsFiltros: { key: keyof FiltrosAparelhos; label: string }[] = [];

  if (filtros.estado)
    chipsFiltros.push({
      key: "estado",
      label: `Estado: ${getEstadoLabel(filtros.estado)}`,
    });
  if (filtros.status)
    chipsFiltros.push({
      key: "status",
      label: `Status: ${STATUS.find((s) => s.value === filtros.status)?.label || filtros.status}`,
    });
  if (filtros.marca)
    chipsFiltros.push({ key: "marca", label: `Marca: ${filtros.marca}` });
  if (filtros.armazenamento)
    chipsFiltros.push({
      key: "armazenamento",
      label: filtros.armazenamento,
    });
  if (filtros.condicao)
    chipsFiltros.push({
      key: "condicao",
      label: `Condição: ${CONDICOES.find((c) => c.value === filtros.condicao)?.label || filtros.condicao}`,
    });
  if (filtros.data_entrada_inicio)
    chipsFiltros.push({
      key: "data_entrada_inicio",
      label: `De: ${filtros.data_entrada_inicio}`,
    });
  if (filtros.data_entrada_fim)
    chipsFiltros.push({
      key: "data_entrada_fim",
      label: `Até: ${filtros.data_entrada_fim}`,
    });

  const temFiltrosAtivos = chipsFiltros.length > 0 || busca.trim().length > 0;

  // Visibilidade responsiva por coluna (alinha skeleton com cabeçalho/células)
  const colClassesTabela = [
    "",
    "hidden md:table-cell",
    "hidden lg:table-cell",
    "hidden xl:table-cell",
    "hidden lg:table-cell",
    "hidden md:table-cell",
    "",
    "",
    "hidden md:table-cell",
    "",
  ];

  return (
    <PermissionGuard
      fallbackMessage="Você não tem permissão para visualizar aparelhos."
      loading={loadingPermissoes}
      permission={podeVisualizar}
    >
      <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-800 p-5">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <DevicePhoneMobileIcon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  Aparelhos
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Gerencie o cadastro de aparelhos individuais
                </p>
              </div>
            </div>
            <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
              {podeCriar && (
                <Button
                  className="font-medium text-sm rounded-xl"
                  color="primary"
                  startContent={<PlusIcon className="w-4 h-4" />}
                  onPress={handleAbrirFormNovo}
                >
                  Novo Aparelho
                </Button>
              )}
              <Button
                className="font-medium text-sm rounded-xl"
                startContent={<CreditCard className="w-4 h-4" />}
                variant="flat"
                onPress={() =>
                  (window.location.href = "/sistema/configuracoes/taxas-cartao")
                }
              >
                Taxas de Cartão
              </Button>
            </div>
          </div>

          {/* KPIs */}
          {podeVerDashboard && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-gray-100 dark:border-zinc-800">
              <KpiCard
                bg="bg-primary/5"
                color="text-primary"
                icon={<ShoppingBag className="w-4 h-4" />}
                iconBg="bg-primary/10"
                label="Vendas (Hoje)"
                value={kpis.vendasHoje.toString()}
              />
              <KpiCard
                bg="bg-emerald-50 dark:bg-emerald-900/20"
                color="text-emerald-600 dark:text-emerald-400"
                icon={<Wallet className="w-4 h-4" />}
                iconBg="bg-emerald-100 dark:bg-emerald-900/40"
                label="Recebimentos (Hoje)"
                value={formatarMoeda(kpis.recebimentosHoje)}
              />
              <KpiCard
                bg="bg-orange-50 dark:bg-orange-900/20"
                color="text-orange-600 dark:text-orange-400"
                icon={<DollarSign className="w-4 h-4" />}
                iconBg="bg-orange-100 dark:bg-orange-900/40"
                label="A Receber"
                value={formatarMoeda(kpis.aReceber)}
              />
              <KpiCard
                bg="bg-indigo-50 dark:bg-indigo-900/20"
                color="text-indigo-600 dark:text-indigo-400"
                icon={<TrendingUp className="w-4 h-4" />}
                iconBg="bg-indigo-100 dark:bg-indigo-900/40"
                label="Vendas (Mês)"
                value={kpis.vendasMes.toString()}
              />
              <KpiCard
                bg="bg-gray-50 dark:bg-zinc-800"
                color="text-gray-600 dark:text-gray-300"
                icon={<Box className="w-4 h-4" />}
                iconBg="bg-gray-100 dark:bg-zinc-700"
                label="Disponíveis"
                value={kpis.disponiveis.toString()}
              />
              <KpiCard
                bg="bg-amber-50 dark:bg-amber-900/20"
                color="text-amber-600 dark:text-amber-400"
                icon={<Coins className="w-4 h-4" />}
                iconBg="bg-amber-100 dark:bg-amber-900/40"
                label="Vendido (Mês)"
                value={formatarMoeda(kpis.valorVendidoMes)}
              />
              <KpiCard
                bg="bg-purple-50 dark:bg-purple-900/20"
                color="text-purple-600 dark:text-purple-400"
                icon={<Gauge className="w-4 h-4" />}
                iconBg="bg-purple-100 dark:bg-purple-900/40"
                label="Ticket Médio"
                value={formatarMoeda(kpis.ticketMedioMes)}
              />
              <KpiCard
                bg="bg-emerald-50 dark:bg-emerald-900/20"
                color="text-emerald-600 dark:text-emerald-400"
                icon={<PiggyBank className="w-4 h-4" />}
                iconBg="bg-emerald-100 dark:bg-emerald-900/40"
                label="Lucro Est. (Mês)"
                value={formatarMoeda(kpis.lucroEstimadoMes)}
              />
            </div>
          )}
        </div>

        {/* Filtros e Busca */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-800 p-4">
          <div className="flex flex-col gap-3">
            {/* Busca + ações */}
            <div className="flex gap-2">
              <Input
                className="flex-1"
                classNames={{
                  input: "text-sm",
                  inputWrapper:
                    "bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700",
                }}
                placeholder="Buscar por marca, modelo, IMEI, número de série..."
                startContent={
                  <MagnifyingGlassIcon className="w-4 h-4 text-gray-400" />
                }
                value={busca}
                variant="bordered"
                onValueChange={setBusca}
              />
              <Button
                isIconOnly
                aria-label="Escanear IMEI"
                className="rounded-xl"
                color="primary"
                title="Escanear IMEI"
                variant="flat"
                onPress={() => setScannerAberto(true)}
              >
                <CameraIcon className="w-5 h-5" />
              </Button>
              <Badge
                color="primary"
                content={chipsFiltros.length}
                isInvisible={chipsFiltros.length === 0}
                size="sm"
              >
                <Button
                  className="rounded-xl"
                  startContent={<FunnelIcon className="w-4 h-4" />}
                  variant="flat"
                  onPress={() => setFiltrosAbertos(true)}
                >
                  Filtros
                </Button>
              </Badge>
            </div>

            {/* Chips de filtros ativos */}
            {chipsFiltros.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                {chipsFiltros.map((chip) => (
                  <Chip
                    key={chip.key}
                    size="sm"
                    variant="flat"
                    onClose={() => removerFiltro(chip.key)}
                  >
                    {chip.label}
                  </Chip>
                ))}
                <Button
                  className="h-7 px-2 text-xs text-gray-500"
                  size="sm"
                  variant="light"
                  onPress={limparTudo}
                >
                  Limpar tudo
                </Button>
              </div>
            )}

            {/* Contagem + Toggle de Visualização */}
            <div className="flex justify-between items-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {totalRegistros} aparelho(s) encontrado(s)
              </p>
              <div className="flex gap-1 bg-gray-100 dark:bg-zinc-800 rounded-xl p-1">
                <Button
                  isIconOnly
                  aria-label="Visualização em cards"
                  className="rounded-lg"
                  color={visualizacao === "cards" ? "primary" : "default"}
                  size="sm"
                  variant={visualizacao === "cards" ? "solid" : "light"}
                  onPress={() => setVisualizacao("cards")}
                >
                  <Squares2X2Icon className="w-4 h-4" />
                </Button>
                <Button
                  isIconOnly
                  aria-label="Visualização em tabela"
                  className="rounded-lg"
                  color={visualizacao === "tabela" ? "primary" : "default"}
                  size="sm"
                  variant={visualizacao === "tabela" ? "solid" : "light"}
                  onPress={() => setVisualizacao("tabela")}
                >
                  <TableCellsIcon className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Drawer de Filtros Avançados */}
        <Drawer
          isOpen={filtrosAbertos}
          size="sm"
          onOpenChange={setFiltrosAbertos}
        >
          <DrawerContent>
            <DrawerHeader className="flex flex-col gap-1">Filtros</DrawerHeader>
            <DrawerBody className="gap-4">
              <Select
                label="Estado"
                placeholder="Todos"
                selectedKeys={filtros.estado ? [filtros.estado] : []}
                variant="bordered"
                onSelectionChange={(keys) => {
                  const value = Array.from(keys)[0] as string;

                  setFiltros((prev) => ({
                    ...prev,
                    estado: (value || undefined) as any,
                  }));
                  setPaginaAtual(1);
                }}
              >
                {ESTADOS.map((estado) => (
                  <SelectItem key={estado.value}>{estado.label}</SelectItem>
                ))}
              </Select>
              <Select
                label="Status"
                placeholder="Todos"
                selectedKeys={filtros.status ? [filtros.status] : []}
                variant="bordered"
                onSelectionChange={(keys) => {
                  const value = Array.from(keys)[0] as string;

                  setFiltros((prev) => ({
                    ...prev,
                    status: (value || undefined) as any,
                  }));
                  setPaginaAtual(1);
                }}
              >
                {STATUS.map((status) => (
                  <SelectItem key={status.value}>{status.label}</SelectItem>
                ))}
              </Select>
              <Select
                label="Marca"
                placeholder="Todas"
                selectedKeys={filtros.marca ? [filtros.marca] : []}
                variant="bordered"
                onSelectionChange={(keys) => {
                  const value = Array.from(keys)[0] as string;

                  setFiltros((prev) => ({
                    ...prev,
                    marca: value || undefined,
                  }));
                  setPaginaAtual(1);
                }}
              >
                {MARCAS.map((marca) => (
                  <SelectItem key={marca}>{marca}</SelectItem>
                ))}
              </Select>
              <Select
                label="Armazenamento"
                placeholder="Todos"
                selectedKeys={
                  filtros.armazenamento ? [filtros.armazenamento] : []
                }
                variant="bordered"
                onSelectionChange={(keys) => {
                  const value = Array.from(keys)[0] as string;

                  setFiltros((prev) => ({
                    ...prev,
                    armazenamento: value || undefined,
                  }));
                  setPaginaAtual(1);
                }}
              >
                {ARMAZENAMENTOS.map((arm) => (
                  <SelectItem key={arm}>{arm}</SelectItem>
                ))}
              </Select>
              <Select
                label="Condição"
                placeholder="Todas"
                selectedKeys={filtros.condicao ? [filtros.condicao] : []}
                variant="bordered"
                onSelectionChange={(keys) => {
                  const value = Array.from(keys)[0] as string;

                  setFiltros((prev) => ({
                    ...prev,
                    condicao: (value || undefined) as any,
                  }));
                  setPaginaAtual(1);
                }}
              >
                {CONDICOES.map((c) => (
                  <SelectItem key={c.value}>{c.label}</SelectItem>
                ))}
              </Select>
              <Input
                label="Data de entrada (início)"
                labelPlacement="outside"
                placeholder=" "
                type="date"
                value={filtros.data_entrada_inicio || ""}
                variant="bordered"
                onValueChange={(value) => {
                  setFiltros((prev) => ({
                    ...prev,
                    data_entrada_inicio: value || undefined,
                  }));
                  setPaginaAtual(1);
                }}
              />
              <Input
                label="Data de entrada (fim)"
                labelPlacement="outside"
                placeholder=" "
                type="date"
                value={filtros.data_entrada_fim || ""}
                variant="bordered"
                onValueChange={(value) => {
                  setFiltros((prev) => ({
                    ...prev,
                    data_entrada_fim: value || undefined,
                  }));
                  setPaginaAtual(1);
                }}
              />
              <Select
                label="Ordenar por"
                selectedKeys={
                  filtros.order_by ? [filtros.order_by] : ["criado_em"]
                }
                variant="bordered"
                onSelectionChange={(keys) => {
                  const value = Array.from(keys)[0] as string;

                  setFiltros((prev) => ({
                    ...prev,
                    order_by: value || undefined,
                  }));
                  setPaginaAtual(1);
                }}
              >
                <SelectItem key="criado_em">Data de Criação</SelectItem>
                <SelectItem key="atualizado_em">Última Modificação</SelectItem>
                <SelectItem key="data_entrada">Data de Entrada</SelectItem>
                <SelectItem key="data_venda">Data da Venda</SelectItem>
                <SelectItem key="valor_venda">Valor</SelectItem>
              </Select>
            </DrawerBody>
            <DrawerFooter>
              <Button variant="flat" onPress={limparTudo}>
                Limpar tudo
              </Button>
              <Button color="primary" onPress={() => setFiltrosAbertos(false)}>
                Ver resultados
              </Button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>

        {/* Visualização em Cards ou Tabela */}
        {erro ? (
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-800 p-12 text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center mb-3">
              <ExclamationTriangleIcon className="w-6 h-6 text-rose-500" />
            </div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Não foi possível carregar os aparelhos
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Verifique sua conexão e tente novamente.
            </p>
            <Button
              className="mt-4"
              size="sm"
              startContent={<ArrowPathIcon className="w-4 h-4" />}
              variant="flat"
              onPress={() => carregarDados()}
            >
              Tentar novamente
            </Button>
          </div>
        ) : visualizacao === "cards" ? (
          /* Cards Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-800 h-80 animate-pulse p-5"
                >
                  <div className="h-40 bg-gray-200 dark:bg-zinc-700 rounded-xl mb-4" />
                  <div className="h-4 bg-gray-200 dark:bg-zinc-700 rounded w-3/4 mb-2" />
                  <div className="h-4 bg-gray-200 dark:bg-zinc-700 rounded w-1/2" />
                </div>
              ))
            ) : aparelhos.length === 0 ? (
              <div className="col-span-full">
                <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-800 p-12 text-center">
                  <DevicePhoneMobileIcon className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    {temFiltrosAtivos
                      ? "Nenhum resultado para os filtros"
                      : "Nenhum aparelho cadastrado"}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {temFiltrosAtivos
                      ? "Tente ajustar a busca ou limpar os filtros."
                      : podeCriar
                        ? "Comece cadastrando o primeiro aparelho."
                        : "Ainda não há aparelhos para exibir."}
                  </p>
                  <div className="mt-4">
                    {temFiltrosAtivos ? (
                      <Button size="sm" variant="flat" onPress={limparTudo}>
                        Limpar filtros
                      </Button>
                    ) : podeCriar ? (
                      <Button
                        color="primary"
                        size="sm"
                        startContent={<PlusIcon className="w-4 h-4" />}
                        onPress={handleAbrirFormNovo}
                      >
                        Novo Aparelho
                      </Button>
                    ) : null}
                  </div>
                </div>
              </div>
            ) : (
              aparelhos.map((aparelho) => {
                const fotos = fotosAparelhos[aparelho.id] || [];
                const fotoIndex = fotoAtualIndex[aparelho.id] || 0;
                const fotoAtual = fotos[fotoIndex];

                return (
                  <div
                    key={aparelho.id}
                    className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700 transition-colors relative overflow-hidden flex flex-col"
                  >
                    {/* Foto / carrossel */}
                    <div className="relative h-44 bg-gray-100 dark:bg-zinc-800 overflow-hidden group">
                      {fotos.length > 0 ? (
                        <>
                          <img
                            alt={`${aparelho.marca} ${aparelho.modelo}`}
                            className="w-full h-full object-cover"
                            src={fotoAtual?.url}
                          />

                          {/* Badges de Catálogo (pílulas neutras com ícone colorido) */}
                          <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
                            {aparelho.promocao && (
                              <span className="inline-flex items-center gap-1 rounded-md bg-black/70 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white backdrop-blur-sm">
                                <TagIcon className="w-3 h-3 text-rose-400" />
                                Promoção
                              </span>
                            )}
                            {aparelho.novidade && (
                              <span className="inline-flex items-center gap-1 rounded-md bg-black/70 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white backdrop-blur-sm">
                                <SparklesIcon className="w-3 h-3 text-emerald-400" />
                                Novo
                              </span>
                            )}
                            {aparelho.destaque && (
                              <span className="inline-flex items-center gap-1 rounded-md bg-black/70 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white backdrop-blur-sm">
                                <FireIcon className="w-3 h-3 text-amber-400" />
                                Destaque
                              </span>
                            )}
                          </div>

                          {/* Navegação do carrossel */}
                          {fotos.length > 1 && (
                            <>
                              <button
                                aria-label="Foto anterior"
                                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  fotoAnterior(aparelho.id);
                                }}
                              >
                                <ChevronLeftIcon className="w-5 h-5" />
                              </button>
                              <button
                                aria-label="Próxima foto"
                                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  proximaFoto(aparelho.id);
                                }}
                              >
                                <ChevronRightIcon className="w-5 h-5" />
                              </button>

                              {/* Indicadores */}
                              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                                {fotos.map((_, index) => (
                                  <div
                                    key={index}
                                    className={`w-1.5 h-1.5 rounded-full transition-all ${
                                      index === fotoIndex
                                        ? "bg-white w-4"
                                        : "bg-white/50"
                                    }`}
                                  />
                                ))}
                              </div>
                            </>
                          )}

                          {/* Badge de quantidade de fotos */}
                          {fotos.length > 1 && (
                            <div className="absolute top-10 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                              {fotoIndex + 1}/{fotos.length}
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <DevicePhoneMobileIcon className="w-14 h-14 text-gray-300 dark:text-zinc-600" />
                        </div>
                      )}
                    </div>

                    {/* Conteúdo */}
                    <div className="flex flex-col gap-3 p-4 flex-1">
                      {/* Título + menu de ações */}
                      <div className="flex justify-between items-start gap-2">
                        <div className="min-w-0">
                          <h3 className="font-semibold text-base text-gray-900 dark:text-white truncate">
                            {aparelho.modelo}
                          </h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {aparelho.marca}
                          </p>
                        </div>
                        <Dropdown>
                          <DropdownTrigger>
                            <Button
                              isIconOnly
                              aria-label="Ações do aparelho"
                              className="-mr-1 -mt-1 text-gray-400"
                              size="sm"
                              variant="light"
                            >
                              <EllipsisVerticalIcon className="w-5 h-5" />
                            </Button>
                          </DropdownTrigger>
                          <DropdownMenu
                            aria-label="Ações do aparelho"
                            onAction={(key) =>
                              handleAcaoCard(key as string, aparelho)
                            }
                          >
                            {podeEditar ? (
                              <DropdownItem
                                key="editar"
                                startContent={
                                  <PencilIcon className="w-4 h-4" />
                                }
                              >
                                Editar
                              </DropdownItem>
                            ) : null}
                            <DropdownItem
                              key="gerenciar_pagamentos"
                              startContent={<DollarSign className="w-4 h-4" />}
                            >
                              Gerenciar Pagamentos
                            </DropdownItem>
                            <DropdownItem
                              key="detalhes"
                              startContent={<Info className="w-4 h-4" />}
                            >
                              Detalhes
                            </DropdownItem>
                            {podeDeletar && aparelho.status !== "vendido" ? (
                              <DropdownItem
                                key="deletar"
                                className="text-danger"
                                color="danger"
                                startContent={<TrashIcon className="w-4 h-4" />}
                              >
                                Deletar
                              </DropdownItem>
                            ) : null}
                          </DropdownMenu>
                        </Dropdown>
                      </div>

                      {/* Preço + status */}
                      <div className="flex items-end justify-between gap-2">
                        <div className="min-w-0">
                          {aparelho.valor_venda ? (
                            <p className="text-xl font-semibold text-gray-900 dark:text-white">
                              {formatarMoeda(aparelho.valor_venda)}
                            </p>
                          ) : (
                            <p className="text-sm text-gray-400">Sem preço</p>
                          )}
                          {aparelho.valor_compra && (
                            <p className="text-[11px] text-gray-500 dark:text-gray-400">
                              Custo {formatarMoeda(aparelho.valor_compra)}
                            </p>
                          )}
                        </div>
                        <Chip
                          color={getStatusChipColor(aparelho.status) as any}
                          size="sm"
                          variant="flat"
                        >
                          {STATUS.find((s) => s.value === aparelho.status)
                            ?.label || aparelho.status}
                        </Chip>
                      </div>

                      {/* Linha única de metadados */}
                      <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
                        <span>{getEstadoLabel(aparelho.estado)}</span>
                        {aparelho.armazenamento && (
                          <>
                            <span className="text-gray-300 dark:text-zinc-600">
                              ·
                            </span>
                            <span>{aparelho.armazenamento}</span>
                          </>
                        )}
                        {aparelho.memoria_ram && (
                          <>
                            <span className="text-gray-300 dark:text-zinc-600">
                              ·
                            </span>
                            <span>{aparelho.memoria_ram} RAM</span>
                          </>
                        )}
                        {aparelho.cor && (
                          <>
                            <span className="text-gray-300 dark:text-zinc-600">
                              ·
                            </span>
                            <span>{aparelho.cor}</span>
                          </>
                        )}
                        {aparelho.saude_bateria !== null &&
                          aparelho.saude_bateria !== undefined && (
                            <>
                              <span className="text-gray-300 dark:text-zinc-600">
                                ·
                              </span>
                              <span
                                className={
                                  aparelho.saude_bateria >= 80
                                    ? ""
                                    : aparelho.saude_bateria >= 60
                                      ? "text-amber-600 dark:text-amber-400"
                                      : "text-rose-600 dark:text-rose-400"
                                }
                              >
                                {aparelho.saude_bateria}% bateria
                              </span>
                            </>
                          )}
                      </div>

                      {/* IMEI */}
                      {aparelho.imei && (
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 font-mono truncate">
                          IMEI {aparelho.imei}
                        </p>
                      )}

                      {/* Pago / Saldo quando vendido */}
                      {aparelho.status === "vendido" &&
                        aparelho.venda_id &&
                        vendasInfo[aparelho.venda_id] && (
                          <div className="flex gap-3 text-[11px] text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-zinc-800 pt-2">
                            <span>
                              Pago{" "}
                              <strong className="text-gray-700 dark:text-gray-200">
                                {formatarMoeda(
                                  vendasInfo[aparelho.venda_id].valor_pago,
                                )}
                              </strong>
                            </span>
                            {(() => {
                              const saldo =
                                (aparelho.valor_venda || 0) -
                                vendasInfo[aparelho.venda_id].valor_pago;

                              return saldo > 0 ? (
                                <span>
                                  Saldo{" "}
                                  <strong className="text-amber-600 dark:text-amber-400">
                                    {formatarMoeda(saldo)}
                                  </strong>
                                </span>
                              ) : null;
                            })()}
                          </div>
                        )}

                      {/* Ação primária */}
                      <div className="mt-auto pt-1">
                        {podeVender && aparelho.status === "disponivel" ? (
                          <Button
                            className="w-full font-medium"
                            color="primary"
                            size="sm"
                            startContent={
                              <ShoppingBagIcon className="w-4 h-4" />
                            }
                            onPress={() => handleAcaoCard("vender", aparelho)}
                          >
                            Vender
                          </Button>
                        ) : (
                          <Button
                            className="w-full"
                            size="sm"
                            startContent={<Info className="w-4 h-4" />}
                            variant="flat"
                            onPress={() => handleAcaoCard("detalhes", aparelho)}
                          >
                            Detalhes
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        ) : (
          /* Tabela de Aparelhos */
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-800 overflow-hidden">
            <div className="overflow-x-auto">
              <Table
                aria-label="Tabela de aparelhos"
                bottomContent={
                  totalPaginas > 1 ? (
                    <div className="flex w-full justify-center py-4">
                      <Pagination
                        showControls
                        color="primary"
                        page={paginaAtual}
                        total={totalPaginas}
                        onChange={setPaginaAtual}
                      />
                    </div>
                  ) : null
                }
                classNames={{
                  wrapper: "border-none shadow-none bg-transparent",
                  th: "bg-gray-50 dark:bg-zinc-800/50 text-gray-400 dark:text-gray-500 text-[10px] font-semibold uppercase tracking-wider",
                  td: "text-sm text-gray-600 dark:text-gray-300",
                  tr: "border-b border-gray-100 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800/30",
                }}
              >
                <TableHeader>
                  <TableColumn>MARCA/MODELO</TableColumn>
                  <TableColumn className="hidden md:table-cell">
                    ARMAZENAMENTO
                  </TableColumn>
                  <TableColumn className="hidden lg:table-cell">
                    IMEI
                  </TableColumn>
                  <TableColumn className="hidden xl:table-cell">
                    COR
                  </TableColumn>
                  <TableColumn className="hidden lg:table-cell">
                    BATERIA
                  </TableColumn>
                  <TableColumn className="hidden md:table-cell">
                    ESTADO
                  </TableColumn>
                  <TableColumn>STATUS</TableColumn>
                  <TableColumn>VALOR VENDA</TableColumn>
                  <TableColumn className="hidden md:table-cell">
                    DATA ENTRADA
                  </TableColumn>
                  <TableColumn>AÇÕES</TableColumn>
                </TableHeader>
                <TableBody
                  emptyContent={
                    <div className="py-6 text-center">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                        {temFiltrosAtivos
                          ? "Nenhum resultado para os filtros"
                          : "Nenhum aparelho cadastrado"}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {temFiltrosAtivos
                          ? "Tente ajustar a busca ou limpar os filtros."
                          : "Cadastre o primeiro aparelho para começar."}
                      </p>
                    </div>
                  }
                >
                  {loading
                    ? Array.from({ length: 8 }).map((_, i) => (
                        <TableRow key={`sk-${i}`}>
                          {colClassesTabela.map((cls, c) => (
                            <TableCell key={c} className={cls}>
                              <Skeleton className="h-4 w-full rounded-md" />
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    : aparelhos.map((aparelho) => (
                        <TableRow key={aparelho.id}>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-2">
                                <p className="font-medium">{aparelho.modelo}</p>
                                {aparelho.promocao && (
                                  <Chip color="danger" size="sm" variant="flat">
                                    Promoção
                                  </Chip>
                                )}
                                {aparelho.novidade && (
                                  <Chip
                                    color="success"
                                    size="sm"
                                    variant="flat"
                                  >
                                    Novo
                                  </Chip>
                                )}
                                {aparelho.destaque && (
                                  <Chip
                                    color="warning"
                                    size="sm"
                                    variant="flat"
                                  >
                                    Destaque
                                  </Chip>
                                )}
                              </div>
                              <p className="text-xs text-default-500">
                                {aparelho.marca}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <div className="flex flex-col gap-1">
                              {aparelho.armazenamento && (
                                <span className="text-sm">
                                  {aparelho.armazenamento}
                                </span>
                              )}
                              {aparelho.memoria_ram && (
                                <span className="text-xs text-default-500">
                                  RAM: {aparelho.memoria_ram}
                                </span>
                              )}
                              {!aparelho.armazenamento &&
                                !aparelho.memoria_ram &&
                                "-"}
                            </div>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <code className="text-xs bg-default-100 px-2 py-1 rounded">
                              {aparelho.imei || "-"}
                            </code>
                          </TableCell>
                          <TableCell className="hidden xl:table-cell">
                            {aparelho.cor || "-"}
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            {aparelho.saude_bateria !== null &&
                            aparelho.saude_bateria !== undefined ? (
                              <Chip
                                color={
                                  aparelho.saude_bateria >= 90
                                    ? "success"
                                    : aparelho.saude_bateria >= 70
                                      ? "warning"
                                      : "danger"
                                }
                                size="sm"
                                variant="flat"
                              >
                                {aparelho.saude_bateria}%
                              </Chip>
                            ) : (
                              "-"
                            )}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <Chip size="sm" variant="flat">
                              {getEstadoLabel(aparelho.estado)}
                            </Chip>
                          </TableCell>
                          <TableCell>
                            <Dropdown>
                              <DropdownTrigger>
                                <Chip
                                  className="cursor-pointer"
                                  color={
                                    getStatusChipColor(aparelho.status) as any
                                  }
                                  size="sm"
                                  variant="flat"
                                >
                                  {STATUS.find(
                                    (s) => s.value === aparelho.status,
                                  )?.label || aparelho.status}
                                </Chip>
                              </DropdownTrigger>
                              <DropdownMenu
                                aria-label="Alterar status"
                                onAction={(key) =>
                                  handleAtualizarStatus(
                                    aparelho.id,
                                    key as string,
                                  )
                                }
                              >
                                {STATUS.filter(
                                  (status) => status.value !== "vendido",
                                ).map((status) => (
                                  <DropdownItem key={status.value}>
                                    {status.label}
                                  </DropdownItem>
                                ))}
                              </DropdownMenu>
                            </Dropdown>
                          </TableCell>
                          <TableCell>
                            <div>
                              <span>
                                {aparelho.valor_venda
                                  ? formatarMoeda(aparelho.valor_venda)
                                  : "-"}
                              </span>
                              {aparelho.status === "vendido" &&
                                aparelho.venda_id &&
                                vendasInfo[aparelho.venda_id] && (
                                  <div className="text-[11px] text-default-500 mt-0.5 leading-tight">
                                    <span>
                                      Pago:{" "}
                                      <strong className="text-success">
                                        {formatarMoeda(
                                          vendasInfo[aparelho.venda_id]
                                            .valor_pago,
                                        )}
                                      </strong>
                                    </span>
                                    {(() => {
                                      const saldo =
                                        (aparelho.valor_venda || 0) -
                                        vendasInfo[aparelho.venda_id]
                                          .valor_pago;

                                      return saldo > 0 ? (
                                        <span>
                                          {" "}
                                          | Saldo:{" "}
                                          <strong className="text-warning">
                                            {formatarMoeda(saldo)}
                                          </strong>
                                        </span>
                                      ) : null;
                                    })()}
                                  </div>
                                )}
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {formatarData(aparelho.data_entrada)}
                          </TableCell>
                          <TableCell>
                            <Dropdown>
                              <DropdownTrigger>
                                <Button
                                  isIconOnly
                                  aria-label="Ações"
                                  size="sm"
                                  variant="light"
                                >
                                  <EllipsisVerticalIcon className="w-5 h-5" />
                                </Button>
                              </DropdownTrigger>
                              <DropdownMenu
                                aria-label="Ações do aparelho"
                                onAction={(key) =>
                                  handleAcaoCard(key as string, aparelho)
                                }
                              >
                                {podeEditar ? (
                                  <DropdownItem
                                    key="editar"
                                    startContent={
                                      <PencilIcon className="w-4 h-4" />
                                    }
                                  >
                                    Editar
                                  </DropdownItem>
                                ) : null}
                                <DropdownItem
                                  key="gerenciar_pagamentos"
                                  startContent={
                                    <DollarSign className="w-4 h-4" />
                                  }
                                >
                                  Gerenciar Pagamentos
                                </DropdownItem>
                                <DropdownItem
                                  key="detalhes"
                                  startContent={<Info className="w-4 h-4" />}
                                >
                                  Detalhes
                                </DropdownItem>
                                {podeDeletar &&
                                aparelho.status !== "vendido" ? (
                                  <DropdownItem
                                    key="deletar"
                                    className="text-danger"
                                    color="danger"
                                    startContent={
                                      <TrashIcon className="w-4 h-4" />
                                    }
                                  >
                                    Deletar
                                  </DropdownItem>
                                ) : null}
                              </DropdownMenu>
                            </Dropdown>
                          </TableCell>
                        </TableRow>
                      ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* Paginação (apenas em cards, tabela já tem no bottomContent) */}
        {visualizacao === "cards" && totalPaginas > 1 && (
          <div className="flex justify-center">
            <Pagination
              showControls
              page={paginaAtual}
              total={totalPaginas}
              onChange={setPaginaAtual}
            />
          </div>
        )}

        {/* Modals */}
        {modalFormAberto && (
          <AparelhoFormModal
            aparelho={aparelhoParaEditar}
            lojaId={lojaIdFinal || undefined}
            lojas={lojas}
            onClose={handleFecharForm}
          />
        )}

        {modalDeleteAberto && aparelhoParaDeletar && (
          <ConfirmModal
            confirmColor="danger"
            confirmText="Deletar"
            isOpen={modalDeleteAberto}
            message={`Tem certeza que deseja deletar o aparelho ${aparelhoParaDeletar.marca} ${aparelhoParaDeletar.modelo} - ${aparelhoParaDeletar.imei || aparelhoParaDeletar.numero_serie}?`}
            title="Confirmar Exclusão"
            onClose={() => {
              setModalDeleteAberto(false);
              setAparelhoParaDeletar(undefined);
            }}
            onConfirm={handleDeletar}
          />
        )}

        {modalRecebimentoAberto && aparelhoParaReceber && (
          <RecebimentoAparelhoModal
            aparelho={aparelhoParaReceber}
            isOpen={modalRecebimentoAberto}
            lojaId={lojaIdFinal || undefined}
            onClose={async (sucesso) => {
              setModalRecebimentoAberto(false);
              setAparelhoParaReceber(undefined);
              if (sucesso) {
                await carregarDados();
                await carregarKpis();
              }
            }}
          />
        )}

        {modalVendaAberto && aparelhoParaVender && (
          <VendaAparelhoModal
            aparelho={aparelhoParaVender}
            isOpen={modalVendaAberto}
            lojaId={lojaIdFinal || 1}
            onClose={async (sucesso) => {
              setModalVendaAberto(false);
              setAparelhoParaVender(undefined);
              if (sucesso) {
                await carregarDados();
                await carregarKpis();
              }
            }}
          />
        )}

        {modalDevolucaoAberto && aparelhoParaDevolucao && (
          <ModalDevolucaoAparelho
            aparelho={aparelhoParaDevolucao}
            isOpen={modalDevolucaoAberto}
            lojaId={lojaIdFinal || 1}
            onClose={() => {
              setModalDevolucaoAberto(false);
              setAparelhoParaDevolucao(undefined);
            }}
            onSuccess={async () => {
              setModalDevolucaoAberto(false);
              setAparelhoParaDevolucao(undefined);
              await carregarDados();
              await carregarKpis();
            }}
          />
        )}

        {modalHistoricoAberto && aparelhoParaHistorico && (
          <HistoricoDevolucoesAparelho
            aparelhoId={aparelhoParaHistorico.id}
            isOpen={modalHistoricoAberto}
            onClose={() => {
              setModalHistoricoAberto(false);
              setAparelhoParaHistorico(undefined);
            }}
          />
        )}

        {modalDetalhesAberto && aparelhoParaDetalhes && (
          <DetalhesAparelhoModal
            aparelho={aparelhoParaDetalhes}
            isOpen={modalDetalhesAberto}
            onClose={() => {
              setModalDetalhesAberto(false);
              setAparelhoParaDetalhes(undefined);
            }}
          />
        )}

        <BarcodeScanner
          isOpen={scannerAberto}
          title="Escanear IMEI do Aparelho"
          onClose={() => setScannerAberto(false)}
          onScan={(imei) => {
            setBusca(imei);
            setScannerAberto(false);
          }}
        />
      </div>
    </PermissionGuard>
  );
}

function KpiCard({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  // Props de cor mantidas por compatibilidade, porém ignoradas (visual sóbrio)
  color?: string;
  bg?: string;
  iconBg?: string;
}) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-zinc-800/40 border border-gray-200 dark:border-zinc-800">
      <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300 shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
          {value}
        </p>
        <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider truncate">
          {label}
        </p>
      </div>
    </div>
  );
}
