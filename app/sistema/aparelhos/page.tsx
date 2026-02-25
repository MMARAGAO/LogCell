"use client";

import { useState, useEffect } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
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
import { Spinner } from "@heroui/spinner";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";
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
  CheckCircleIcon,
  ClockIcon,
  ShoppingBagIcon,
  ExclamationTriangleIcon,
  ArrowRightIcon,
  CameraIcon,
  SparklesIcon,
  FireIcon,
  TagIcon,
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
  PackageX,
  History,
} from "lucide-react";

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
  { value: "reservado", label: "Reservado", color: "warning" },
  { value: "defeito", label: "Defeito", color: "danger" },
  { value: "transferido", label: "Transferido", color: "primary" },
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
  const [busca, setBusca] = useState("");
  const [filtros, setFiltros] = useState<FiltrosAparelhos>({});
  const [paginaAtual, setPaginaAtual] = useState(1);
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
  const [lojas, setLojas] = useState<Loja[]>([]);
  const [loadingLojas, setLoadingLojas] = useState(false);
  const [lojaSelecionada, setLojaSelecionada] = useState<string>("");

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
  const lojaIdFinal = todasLojas
    ? lojaSelecionada
      ? Number(lojaSelecionada)
      : null
    : lojaId;
  const lojaNomeSelecionada =
    lojas.find((loja) => loja.id === lojaIdFinal)?.nome ||
    (lojaIdFinal ? `Loja ${lojaIdFinal}` : "");

  useEffect(() => {
    const carregarLojas = async () => {
      if (!todasLojas) return;
      setLoadingLojas(true);
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
      } finally {
        setLoadingLojas(false);
      }
    };

    carregarLojas();
  }, [todasLojas]);

  useEffect(() => {
    if (!todasLojas) return;
    if (lojaSelecionada) return;
    if (!lojas.length) return;

    const lojaSalva = localStorage.getItem("aparelhos.lojaSelecionada");

    if (lojaSalva && lojas.some((loja) => loja.id.toString() === lojaSalva)) {
      setLojaSelecionada(lojaSalva);

      return;
    }

    if (lojas.length === 1) {
      setLojaSelecionada(lojas[0].id.toString());
    }
  }, [todasLojas, lojas, lojaSelecionada]);

  useEffect(() => {
    if (!todasLojas) return;
    if (!lojaSelecionada) return;
    localStorage.setItem("aparelhos.lojaSelecionada", lojaSelecionada);
  }, [todasLojas, lojaSelecionada]);

  useEffect(() => {
    if (!loadingPermissoes && !todasLojas && lojaId) {
      setLojaSelecionada(lojaId.toString());
    }
  }, [loadingPermissoes, todasLojas, lojaId]);

  // Carregar aparelhos e produtos
  useEffect(() => {
    if (podeVisualizar) {
      carregarDados();
    }
  }, [lojaIdFinal, podeVisualizar, filtros]);

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

      const filtrosComLoja: FiltrosAparelhos = {
        ...filtros,
        loja_id: lojaIdFinal || undefined,
      };

      const aparelhosData = await getAparelhos(filtrosComLoja);

      setAparelhos(aparelhosData);

      // Carregar fotos de todos os aparelhos
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

  // Filtrar aparelhos
  const aparelhosFiltrados = aparelhos.filter((aparelho) => {
    if (busca) {
      const buscaLower = busca.toLowerCase();

      return (
        aparelho.marca?.toLowerCase().includes(buscaLower) ||
        aparelho.modelo?.toLowerCase().includes(buscaLower) ||
        aparelho.imei?.toLowerCase().includes(buscaLower) ||
        aparelho.numero_serie?.toLowerCase().includes(buscaLower) ||
        aparelho.cor?.toLowerCase().includes(buscaLower)
      );
    }

    return true;
  });

  // Paginação
  const totalPaginas = Math.ceil(aparelhosFiltrados.length / itensPorPagina);
  const aparelhosPaginados = aparelhosFiltrados.slice(
    (paginaAtual - 1) * itensPorPagina,
    paginaAtual * itensPorPagina,
  );

  // Handlers
  const handleAbrirFormNovo = () => {
    if (todasLojas && !lojaIdFinal) {
      showToast("Selecione uma loja antes de cadastrar", "warning");

      return;
    }
    setAparelhoParaEditar(undefined);
    setModalFormAberto(true);
  };

  const handleAbrirFormEditar = (aparelho: Aparelho) => {
    if (todasLojas && !lojaIdFinal) {
      showToast("Selecione uma loja antes de editar", "warning");

      return;
    }
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
    if (key === "deletar") {
      handleAbrirConfirmDelete(aparelho);

      return;
    }
    if (key === "vender") {
      if (todasLojas && !lojaIdFinal) {
        showToast("Selecione uma loja antes de vender", "warning");

        return;
      }
      setAparelhoParaVender(aparelho);
      setModalVendaAberto(true);

      return;
    }
    if (key === "receber_pagamento") {
      setAparelhoParaReceber(aparelho);
      setModalRecebimentoAberto(true);

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

  if (!podeVisualizar) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="p-6">
          <CardBody>
            <p className="text-danger">
              Você não tem permissão para visualizar aparelhos.
            </p>
          </CardBody>
        </Card>
      </div>
    );
  }

  if (loadingPermissoes) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <DevicePhoneMobileIcon className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Aparelhos</h1>
            <p className="text-sm text-default-500">
              Gerencie o cadastro de aparelhos individuais
            </p>
          </div>
        </div>
        <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
          {todasLojas ? (
            <Select
              className="w-full md:w-56"
              isDisabled={loadingLojas}
              label="Loja"
              placeholder={
                loadingLojas ? "Carregando lojas..." : "Selecione uma loja"
              }
              selectedKeys={lojaSelecionada ? [lojaSelecionada] : []}
              onChange={(e) => setLojaSelecionada(e.target.value)}
            >
              {lojas.map((loja) => (
                <SelectItem key={loja.id.toString()}>{loja.nome}</SelectItem>
              ))}
            </Select>
          ) : null}
          <Button
            color="primary"
            startContent={<TrendingUp className="w-5 h-5" />}
            variant="flat"
            onPress={() =>
              (window.location.href = "/sistema/dashboard-aparelhos")
            }
          >
            Dashboard
          </Button>
          <Button
            color="secondary"
            startContent={<DollarSign className="w-5 h-5" />}
            variant="flat"
            onPress={() => (window.location.href = "/sistema/caixa-aparelhos")}
          >
            Caixa de Aparelhos
          </Button>
          {podeCriar && (
            <Button
              color="primary"
              startContent={<PlusIcon className="w-5 h-5" />}
              onPress={handleAbrirFormNovo}
            >
              Novo Aparelho
            </Button>
          )}
        </div>
      </div>

      {/* KPIs - Linha 1 */}
      {podeVerDashboard && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex gap-3 items-center">
                <ShoppingBag className="w-5 h-5 text-primary" />
                <div className="flex flex-col">
                  <p className="text-small text-default-500">
                    Vendas de Aparelhos (Hoje)
                  </p>
                  <h3 className="text-2xl font-bold">{kpis.vendasHoje}</h3>
                </div>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="flex gap-3 items-center">
                <Wallet className="w-5 h-5 text-success" />
                <div className="flex flex-col">
                  <p className="text-small text-default-500">
                    Recebimentos (Hoje)
                  </p>
                  <h3 className="text-2xl font-bold">
                    {formatarMoeda(kpis.recebimentosHoje)}
                  </h3>
                </div>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="flex gap-3 items-center">
                <DollarSign className="w-5 h-5 text-warning" />
                <div className="flex flex-col">
                  <p className="text-small text-default-500">A Receber</p>
                  <h3 className="text-2xl font-bold">
                    {formatarMoeda(kpis.aReceber)}
                  </h3>
                </div>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="flex gap-3 items-center">
                <TrendingUp className="w-5 h-5 text-secondary" />
                <div className="flex flex-col">
                  <p className="text-small text-default-500">Vendas (Mês)</p>
                  <h3 className="text-2xl font-bold">{kpis.vendasMes}</h3>
                </div>
              </CardHeader>
            </Card>
          </div>

          {/* KPIs - Linha 2 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex gap-3 items-center">
                <Box className="w-5 h-5 text-default-700" />
                <div className="flex flex-col">
                  <p className="text-small text-default-500">
                    Aparelhos Disponíveis
                  </p>
                  <h3 className="text-2xl font-bold">{kpis.disponiveis}</h3>
                </div>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="flex gap-3 items-center">
                <Coins className="w-5 h-5 text-amber-600" />
                <div className="flex flex-col">
                  <p className="text-small text-default-500">
                    Valor Vendido (Mês)
                  </p>
                  <h3 className="text-2xl font-bold">
                    {formatarMoeda(kpis.valorVendidoMes)}
                  </h3>
                </div>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="flex gap-3 items-center">
                <Gauge className="w-5 h-5 text-purple-600" />
                <div className="flex flex-col">
                  <p className="text-small text-default-500">
                    Ticket Médio (Mês)
                  </p>
                  <h3 className="text-2xl font-bold">
                    {formatarMoeda(kpis.ticketMedioMes)}
                  </h3>
                </div>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="flex gap-3 items-center">
                <PiggyBank className="w-5 h-5 text-emerald-600" />
                <div className="flex flex-col">
                  <p className="text-small text-default-500">
                    Lucro Estimado (Mês)
                  </p>
                  <h3 className="text-2xl font-bold">
                    {formatarMoeda(kpis.lucroEstimadoMes)}
                  </h3>
                </div>
              </CardHeader>
            </Card>
          </div>
        </>
      )}

      {/* Filtros e Busca */}
      <Card>
        <CardBody>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex gap-2 flex-1">
                <Input
                  className="flex-1"
                  placeholder="Buscar por marca, modelo, IMEI, número de série..."
                  startContent={<MagnifyingGlassIcon className="w-4 h-4" />}
                  value={busca}
                  onValueChange={setBusca}
                />
                <Button
                  isIconOnly
                  color="primary"
                  title="Escanear IMEI"
                  variant="flat"
                  onPress={() => setScannerAberto(true)}
                >
                  <CameraIcon className="w-5 h-5" />
                </Button>
              </div>
              <Select
                className="w-full md:w-60"
                placeholder="Filtrar por estado"
                selectedKeys={filtros.estado ? [filtros.estado] : []}
                startContent={<FunnelIcon className="w-4 h-4" />}
                onSelectionChange={(keys) => {
                  const value = Array.from(keys)[0] as string;

                  setFiltros((prev) => ({
                    ...prev,
                    estado: (value || undefined) as any,
                  }));
                }}
              >
                {ESTADOS.map((estado) => (
                  <SelectItem key={estado.value}>{estado.label}</SelectItem>
                ))}
              </Select>
              <Select
                className="w-full md:w-60"
                placeholder="Filtrar por status"
                selectedKeys={filtros.status ? [filtros.status] : []}
                startContent={<FunnelIcon className="w-4 h-4" />}
                onSelectionChange={(keys) => {
                  const value = Array.from(keys)[0] as string;

                  setFiltros((prev) => ({
                    ...prev,
                    status: (value || undefined) as any,
                  }));
                }}
              >
                {STATUS.map((status) => (
                  <SelectItem key={status.value}>{status.label}</SelectItem>
                ))}
              </Select>

              {/* Filtros de Catálogo */}
              <div className="flex gap-2">
                <Button
                  color="danger"
                  size="sm"
                  startContent={<TagIcon className="w-4 h-4" />}
                  variant={filtros.promocao ? "solid" : "bordered"}
                  onPress={() =>
                    setFiltros((prev) => ({
                      ...prev,
                      promocao: filtros.promocao ? undefined : true,
                    }))
                  }
                >
                  Promoção
                </Button>
                <Button
                  color="success"
                  size="sm"
                  startContent={<SparklesIcon className="w-4 h-4" />}
                  variant={filtros.novidade ? "solid" : "bordered"}
                  onPress={() =>
                    setFiltros((prev) => ({
                      ...prev,
                      novidade: filtros.novidade ? undefined : true,
                    }))
                  }
                >
                  Novidade
                </Button>
                <Button
                  color="warning"
                  size="sm"
                  startContent={<FireIcon className="w-4 h-4" />}
                  variant={filtros.destaque ? "solid" : "bordered"}
                  onPress={() =>
                    setFiltros((prev) => ({
                      ...prev,
                      destaque: filtros.destaque ? undefined : true,
                    }))
                  }
                >
                  Destaque
                </Button>
              </div>

              {(filtros.estado ||
                filtros.status ||
                filtros.promocao ||
                filtros.novidade ||
                filtros.destaque) && (
                <Button
                  color="default"
                  variant="flat"
                  onPress={() => {
                    setFiltros({});
                    setBusca("");
                  }}
                >
                  Limpar Filtros
                </Button>
              )}
            </div>

            {/* Toggle de Visualização */}
            <div className="flex justify-between items-center">
              <p className="text-sm text-default-500">
                {aparelhosFiltrados.length} aparelho(s) encontrado(s)
              </p>
              <div className="flex gap-1 bg-default-100 rounded-lg p-1">
                <Button
                  isIconOnly
                  color={visualizacao === "cards" ? "primary" : "default"}
                  size="sm"
                  variant={visualizacao === "cards" ? "solid" : "light"}
                  onPress={() => setVisualizacao("cards")}
                >
                  <Squares2X2Icon className="w-4 h-4" />
                </Button>
                <Button
                  isIconOnly
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
        </CardBody>
      </Card>

      {/* Visualização em Cards ou Tabela */}
      {visualizacao === "cards" ? (
        /* Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="h-80">
                <CardBody className="animate-pulse">
                  <div className="h-40 bg-default-200 rounded-lg mb-4" />
                  <div className="h-4 bg-default-200 rounded mb-2" />
                  <div className="h-4 bg-default-200 rounded w-2/3" />
                </CardBody>
              </Card>
            ))
          ) : aparelhosPaginados.length === 0 ? (
            <div className="col-span-full">
              <Card>
                <CardBody className="text-center py-12">
                  <DevicePhoneMobileIcon className="w-12 h-12 mx-auto text-default-400 mb-2" />
                  <p className="text-default-500">Nenhum aparelho encontrado</p>
                </CardBody>
              </Card>
            </div>
          ) : (
            aparelhosPaginados.map((aparelho) => {
              const fotos = fotosAparelhos[aparelho.id] || [];
              const fotoIndex = fotoAtualIndex[aparelho.id] || 0;
              const fotoAtual = fotos[fotoIndex];

              return (
                <Card
                  key={aparelho.id}
                  className="hover:shadow-lg transition-shadow relative"
                >
                  <CardBody className="p-0">
                    {/* Carrossel de Fotos */}
                    <div className="relative h-48 bg-gradient-to-br from-primary-100 to-primary-50 overflow-hidden group">
                      {fotos.length > 0 ? (
                        <>
                          <img
                            alt={`${aparelho.marca} ${aparelho.modelo}`}
                            className="w-full h-full object-cover"
                            src={fotoAtual?.url}
                          />

                          {/* Badges de Catálogo */}
                          <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
                            {aparelho.promocao && (
                              <Chip
                                className="font-semibold"
                                color="danger"
                                size="sm"
                                startContent={<TagIcon className="w-3 h-3" />}
                                variant="solid"
                              >
                                PROMOÇÃO
                              </Chip>
                            )}
                            {aparelho.novidade && (
                              <Chip
                                className="font-semibold"
                                color="success"
                                size="sm"
                                startContent={
                                  <SparklesIcon className="w-3 h-3" />
                                }
                                variant="solid"
                              >
                                NOVO
                              </Chip>
                            )}
                            {aparelho.destaque && (
                              <Chip
                                className="font-semibold"
                                color="warning"
                                size="sm"
                                startContent={<FireIcon className="w-3 h-3" />}
                                variant="solid"
                              >
                                DESTAQUE
                              </Chip>
                            )}
                          </div>

                          {/* Navegação do carrossel */}
                          {fotos.length > 1 && (
                            <>
                              <button
                                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  fotoAnterior(aparelho.id);
                                }}
                              >
                                <ChevronLeftIcon className="w-5 h-5" />
                              </button>
                              <button
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
                          <DevicePhoneMobileIcon className="w-20 h-20 text-primary-300" />
                        </div>
                      )}
                    </div>

                    {/* Conteúdo */}

                    {/* Marca e Modelo */}
                    <div className="flex flex-col space-y-2 px-4 py-4">
                      <div>
                        <div className="flex justify-between items-start">
                          <h3 className="font-bold text-lg truncate">
                            {aparelho.marca}
                          </h3>
                          {/* Ações do Card */}
                          <div className="">
                            <Dropdown>
                              <DropdownTrigger>
                                <Button isIconOnly size="sm" variant="light">
                                  <EllipsisVerticalIcon className="w-5 h-5" />
                                </Button>
                              </DropdownTrigger>
                              <DropdownMenu
                                aria-label="Ações do aparelho"
                                onAction={(key) =>
                                  handleAcaoCard(key as string, aparelho)
                                }
                              >
                                <DropdownItem
                                  key="editar"
                                  startContent={
                                    <PencilIcon className="w-4 h-4" />
                                  }
                                >
                                  Editar
                                </DropdownItem>
                                {aparelho.status === "disponivel" ? (
                                  <DropdownItem
                                    key="vender"
                                    className="text-success"
                                    color="success"
                                    isDisabled={todasLojas && !lojaIdFinal}
                                    startContent={
                                      <ShoppingBagIcon className="w-4 h-4" />
                                    }
                                    onPress={() =>
                                      handleAcaoCard("vender", aparelho)
                                    }
                                  >
                                    Vender Aparelho
                                  </DropdownItem>
                                ) : null}
                                {podeRegistrarDevolucao &&
                                aparelho.status === "vendido" ? (
                                  <DropdownItem
                                    key="registrar_devolucao"
                                    startContent={
                                      <PackageX className="w-4 h-4" />
                                    }
                                  >
                                    Registrar Devolucao / Troca / Garantia
                                  </DropdownItem>
                                ) : null}
                                {podeVerHistoricoDevolucao ? (
                                  <DropdownItem
                                    key="historico_devolucoes"
                                    startContent={
                                      <History className="w-4 h-4" />
                                    }
                                  >
                                    Historico de Devolucoes
                                  </DropdownItem>
                                ) : null}
                                <DropdownItem
                                  key="deletar"
                                  className="text-danger"
                                  color="danger"
                                  isDisabled={aparelho.status === "vendido"}
                                  startContent={
                                    <TrashIcon className="w-4 h-4" />
                                  }
                                >
                                  Deletar
                                </DropdownItem>
                                <DropdownItem
                                  key="status:disponivel"
                                  isDisabled={aparelho.status === "disponivel"}
                                  startContent={
                                    <CheckCircleIcon className="w-4 h-4" />
                                  }
                                >
                                  Marcar como Disponível
                                </DropdownItem>
                                <DropdownItem
                                  key="status:reservado"
                                  isDisabled={aparelho.status === "reservado"}
                                  startContent={
                                    <ClockIcon className="w-4 h-4" />
                                  }
                                >
                                  Marcar como Reservado
                                </DropdownItem>
                                <DropdownItem
                                  key="status:defeito"
                                  isDisabled={aparelho.status === "defeito"}
                                  startContent={
                                    <ExclamationTriangleIcon className="w-4 h-4" />
                                  }
                                >
                                  Marcar como Defeito
                                </DropdownItem>
                                <DropdownItem
                                  key="status:transferido"
                                  isDisabled={aparelho.status === "transferido"}
                                  startContent={
                                    <ArrowRightIcon className="w-4 h-4" />
                                  }
                                >
                                  Marcar como Transferido
                                </DropdownItem>
                                {aparelho.status === "vendido" ? (
                                  <DropdownItem
                                    key="receber_pagamento"
                                    color="success"
                                    startContent={
                                      <DollarSign className="w-4 h-4" />
                                    }
                                  >
                                    Receber Pagamento
                                  </DropdownItem>
                                ) : null}
                              </DropdownMenu>
                            </Dropdown>
                          </div>
                        </div>
                        <div className="">
                          <p className="text-sm text-default-600 truncate">
                            {aparelho.modelo}
                          </p>
                        </div>
                      </div>

                      {/* Armazenamento e RAM */}
                      {(aparelho.armazenamento || aparelho.memoria_ram) && (
                        <div className="flex gap-2 text-xs">
                          {aparelho.armazenamento && (
                            <Chip color="primary" size="sm" variant="flat">
                              {aparelho.armazenamento}
                            </Chip>
                          )}
                          {aparelho.memoria_ram && (
                            <Chip color="secondary" size="sm" variant="flat">
                              {aparelho.memoria_ram}
                            </Chip>
                          )}
                        </div>
                      )}

                      {/* Cor */}
                      {aparelho.cor && (
                        <p className="text-sm text-default-500">
                          <span className="font-medium">Cor:</span>{" "}
                          {aparelho.cor}
                        </p>
                      )}

                      {/* Estado e Status */}
                      <div className="flex gap-2">
                        <Chip size="sm" variant="flat">
                          {getEstadoLabel(aparelho.estado)}
                        </Chip>
                        <Chip
                          color={getStatusChipColor(aparelho.status) as any}
                          size="sm"
                          variant="flat"
                        >
                          {
                            STATUS.find((s) => s.value === aparelho.status)
                              ?.label
                          }
                        </Chip>
                      </div>

                      {/* IMEI */}
                      {aparelho.imei && (
                        <p className="text-xs text-default-400 font-mono truncate">
                          IMEI: {aparelho.imei}
                        </p>
                      )}

                      {/* Saúde da Bateria */}
                      {aparelho.saude_bateria !== null &&
                        aparelho.saude_bateria !== undefined && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-default-500">
                              Bateria:
                            </span>
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
                          </div>
                        )}

                      {/* Valores */}
                      <div className="pt-2 border-t border-default-200">
                        {aparelho.valor_venda && (
                          <p className="text-lg font-bold text-success">
                            {formatarMoeda(aparelho.valor_venda)}
                          </p>
                        )}
                        {aparelho.valor_compra && (
                          <p className="text-xs text-default-400">
                            Compra: {formatarMoeda(aparelho.valor_compra)}
                          </p>
                        )}
                      </div>

                      {/* Ações */}
                      <div className="flex gap-2 pt-2">
                        {podeEditar && (
                          <Button
                            className="flex-1"
                            color="primary"
                            size="sm"
                            startContent={<PencilIcon className="w-4 h-4" />}
                            variant="flat"
                            onPress={() => handleAbrirFormEditar(aparelho)}
                          >
                            Editar
                          </Button>
                        )}
                        {podeDeletar && aparelho.status !== "vendido" && (
                          <Button
                            isIconOnly
                            color="danger"
                            size="sm"
                            variant="flat"
                            onPress={() => handleAbrirConfirmDelete(aparelho)}
                          >
                            <TrashIcon className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardBody>
                </Card>
              );
            })
          )}
        </div>
      ) : (
        /* Tabela de Aparelhos */
        <Card>
          <CardBody>
            <Table
              aria-label="Tabela de aparelhos"
              bottomContent={
                totalPaginas > 1 ? (
                  <div className="flex w-full justify-center">
                    <Pagination
                      showControls
                      page={paginaAtual}
                      total={totalPaginas}
                      onChange={setPaginaAtual}
                    />
                  </div>
                ) : null
              }
            >
              <TableHeader>
                <TableColumn>MARCA/MODELO</TableColumn>
                <TableColumn>ARMAZENAMENTO</TableColumn>
                <TableColumn>IMEI</TableColumn>
                <TableColumn>COR</TableColumn>
                <TableColumn>BATERIA</TableColumn>
                <TableColumn>ESTADO</TableColumn>
                <TableColumn>STATUS</TableColumn>
                <TableColumn>VALOR VENDA</TableColumn>
                <TableColumn>DATA ENTRADA</TableColumn>
                <TableColumn>AÇÕES</TableColumn>
              </TableHeader>
              <TableBody
                emptyContent="Nenhum aparelho encontrado"
                isLoading={loading}
              >
                {aparelhosPaginados.map((aparelho) => (
                  <TableRow key={aparelho.id}>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{aparelho.marca}</p>
                          {aparelho.promocao && (
                            <Chip color="danger" size="sm" variant="flat">
                              Promoção
                            </Chip>
                          )}
                          {aparelho.novidade && (
                            <Chip color="success" size="sm" variant="flat">
                              Novo
                            </Chip>
                          )}
                          {aparelho.destaque && (
                            <Chip color="warning" size="sm" variant="flat">
                              Destaque
                            </Chip>
                          )}
                        </div>
                        <p className="text-xs text-default-500">
                          {aparelho.modelo}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
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
                    <TableCell>
                      <code className="text-xs bg-default-100 px-2 py-1 rounded">
                        {aparelho.imei || "-"}
                      </code>
                    </TableCell>
                    <TableCell>{aparelho.cor || "-"}</TableCell>
                    <TableCell>
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
                    <TableCell>
                      <Chip size="sm" variant="flat">
                        {getEstadoLabel(aparelho.estado)}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <Dropdown>
                        <DropdownTrigger>
                          <Chip
                            className="cursor-pointer"
                            color={getStatusChipColor(aparelho.status) as any}
                            size="sm"
                            variant="flat"
                          >
                            {STATUS.find((s) => s.value === aparelho.status)
                              ?.label || aparelho.status}
                          </Chip>
                        </DropdownTrigger>
                        <DropdownMenu
                          aria-label="Alterar status"
                          onAction={(key) =>
                            handleAtualizarStatus(aparelho.id, key as string)
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
                      {aparelho.valor_venda
                        ? formatarMoeda(aparelho.valor_venda)
                        : "-"}
                    </TableCell>
                    <TableCell>{formatarData(aparelho.data_entrada)}</TableCell>
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
                              startContent={<PencilIcon className="w-4 h-4" />}
                            >
                              Editar
                            </DropdownItem>
                          ) : null}
                          {aparelho.status === "disponivel" ? (
                            <DropdownItem
                              key="vender"
                              className="text-success"
                              color="success"
                              isDisabled={todasLojas && !lojaIdFinal}
                              startContent={
                                <ShoppingBagIcon className="w-4 h-4" />
                              }
                              onPress={() => handleAcaoCard("vender", aparelho)}
                            >
                              Vender Aparelho
                            </DropdownItem>
                          ) : null}
                          {podeRegistrarDevolucao &&
                          aparelho.status === "vendido" ? (
                            <DropdownItem
                              key="registrar_devolucao"
                              startContent={<PackageX className="w-4 h-4" />}
                            >
                              Registrar Devolucao / Troca / Garantia
                            </DropdownItem>
                          ) : null}
                          {podeVerHistoricoDevolucao ? (
                            <DropdownItem
                              key="historico_devolucoes"
                              startContent={<History className="w-4 h-4" />}
                            >
                              Historico de Devolucoes
                            </DropdownItem>
                          ) : null}
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
                          <DropdownItem
                            key="status:disponivel"
                            isDisabled={aparelho.status === "disponivel"}
                            startContent={
                              <CheckCircleIcon className="w-4 h-4" />
                            }
                          >
                            Marcar como Disponivel
                          </DropdownItem>
                          <DropdownItem
                            key="status:reservado"
                            isDisabled={aparelho.status === "reservado"}
                            startContent={<ClockIcon className="w-4 h-4" />}
                          >
                            Marcar como Reservado
                          </DropdownItem>
                          <DropdownItem
                            key="status:defeito"
                            isDisabled={aparelho.status === "defeito"}
                            startContent={
                              <ExclamationTriangleIcon className="w-4 h-4" />
                            }
                          >
                            Marcar como Defeito
                          </DropdownItem>
                          <DropdownItem
                            key="status:transferido"
                            isDisabled={aparelho.status === "transferido"}
                            startContent={
                              <ArrowRightIcon className="w-4 h-4" />
                            }
                          >
                            Marcar como Transferido
                          </DropdownItem>
                          {aparelho.status === "vendido" ? (
                            <DropdownItem
                              key="receber_pagamento"
                              color="success"
                              startContent={<DollarSign className="w-4 h-4" />}
                            >
                              Receber Pagamento
                            </DropdownItem>
                          ) : null}
                        </DropdownMenu>
                      </Dropdown>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardBody>
        </Card>
      )}

      {/* Paginação */}
      {totalPaginas > 1 && (
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
          lojaId={lojaIdFinal || 1}
          lojaNome={lojaNomeSelecionada}
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
          lojaNome={lojaNomeSelecionada}
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
          lojaNome={lojaNomeSelecionada}
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
  );
}
