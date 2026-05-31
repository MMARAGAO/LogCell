"use client";

import type { TransferenciaCompleta } from "@/types";

import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { Select, SelectItem } from "@heroui/select";
import { Input } from "@heroui/input";
import { Divider } from "@heroui/divider";
import { Spinner } from "@heroui/spinner";
import { Pagination } from "@heroui/pagination";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@heroui/table";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";

import {
  ArrowRightIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  FunnelIcon,
  PlusIcon,
  DocumentArrowDownIcon,
  ArrowPathRoundedSquareIcon,
  Squares2X2Icon,
  ListBulletIcon,
  EyeIcon,
  PencilSquareIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

import { useToast } from "@/components/Toast";
import { useAuth } from "@/hooks/useAuth";
import { usePermissoes } from "@/hooks/usePermissoes";
import { useLojaFilter } from "@/hooks/useLojaFilter";
import { ConfirmModal } from "@/components/ConfirmModal";
import { InputModal } from "@/components/InputModal";
import { MetricCard } from "@/components/transferencias/MetricCard";
import { TransferenciaCard } from "@/components/transferencias/TransferenciaCard";
import { DetalhesTransferenciaModal } from "@/components/transferencias/DetalhesTransferenciaModal";
import { ModalAjustarTransferencia } from "@/components/transferencias/ModalAjustarTransferencia";
import { supabase } from "@/lib/supabaseClient";
import {
  buscarTransferencias,
  contarTransferencias,
  confirmarTransferencia,
  confirmarComAjustes,
  analisarDisponibilidade,
  cancelarTransferencia,
} from "@/services/transferenciasService";

interface Loja {
  id: number;
  nome: string;
}

export default function TransferenciasPage() {
  const toast = useToast();
  const { usuario } = useAuth();
  const { temPermissao, loading: loadingPermissoes } = usePermissoes();
  const podeConfirmar = temPermissao("transferencias.confirmar");
  const { lojaId, podeVerTodasLojas } = useLojaFilter();
  const router = useRouter();

  const ITENS_POR_PAGINA = 15;

  const [transferencias, setTransferencias] = useState<TransferenciaCompleta[]>(
    [],
  );
  const [lojas, setLojas] = useState<Loja[]>([]);
  const [loading, setLoading] = useState(true);
  const [processando, setProcessando] = useState<string | null>(null);
  const [pagina, setPagina] = useState(1);
  const [totalRegistros, setTotalRegistros] = useState(0);
  const [estatisticas, setEstatisticas] = useState({
    pendentes: 0,
    confirmadas: 0,
    canceladas: 0,
    total: 0,
  });

  const [filtroStatus, setFiltroStatus] = useState<string>("todas");
  const [filtroLoja, setFiltroLoja] = useState<string>("todas");
  const [filtrosAbertos, setFiltrosAbertos] = useState(false);
  const [visualizacao, setVisualizacao] = useState<"cards" | "tabela">("cards");
  const [termoBusca, setTermoBusca] = useState("");

  const [transferenciaSelecionada, setTransferenciaSelecionada] =
    useState<TransferenciaCompleta | null>(null);

  const [confirmarModal, setConfirmarModal] = useState({
    isOpen: false,
    transferencia: null as TransferenciaCompleta | null,
  });

  const [cancelarModal, setCancelarModal] = useState({
    isOpen: false,
    transferencia: null as TransferenciaCompleta | null,
  });

  const [ajustarModal, setAjustarModal] = useState({
    isOpen: false,
    transferencia: null as TransferenciaCompleta | null,
    itens: [] as Array<any>,
  });

  const carregouInicial = useRef(false);

  useEffect(() => {
    if (loadingPermissoes) return;

    if (!carregouInicial.current) {
      carregouInicial.current = true;
      setLoading(true);
      carregarDados();
    } else {
      carregarTransferencias();
      carregarEstatisticas();
    }
  }, [
    lojaId,
    podeVerTodasLojas,
    filtroStatus,
    filtroLoja,
    pagina,
    termoBusca,
    loadingPermissoes,
  ]);

  const carregarDados = async () => {
    setLoading(true);
    try {
      const { supabase } = await import("@/lib/supabaseClient");

      const { data: lojasData, error: lojasError } = await supabase
        .from("lojas")
        .select("id, nome")
        .eq("ativo", true)
        .order("nome");

      if (lojasError) throw lojasError;
      setLojas(lojasData || []);

      await Promise.all([carregarTransferencias(), carregarEstatisticas()]);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast.error("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  const carregarTransferencias = async () => {
    try {
      const filtros: any = {};

      if (filtroStatus !== "todas") {
        filtros.status = filtroStatus;
      }

      if (filtroLoja !== "todas") {
        const lojaIdFiltro = parseInt(filtroLoja);

        filtros.loja_id = lojaIdFiltro;
      } else if (lojaId !== null && !podeVerTodasLojas) {
        filtros.loja_id = lojaId;
      }

      if (termoBusca.trim()) {
        filtros.busca = termoBusca.trim();
      }

      const { data, total } = await buscarTransferencias(
        filtros,
        pagina,
        ITENS_POR_PAGINA,
      );

      setTransferencias(data);
      setTotalRegistros(total);
    } catch (error: any) {
      console.error("Erro ao buscar transferências:", error);

      const mensagemErro = error?.message || JSON.stringify(error);

      if (
        mensagemErro.includes("relation") &&
        mensagemErro.includes("does not exist")
      ) {
        toast.error(
          "Tabela de transferências não encontrada. Execute o script CRIAR_SISTEMA_TRANSFERENCIAS_COMPLETO.sql no Supabase.",
        );
      } else {
        toast.error(`Erro ao buscar transferências: ${mensagemErro}`);
      }
    }
  };

  const carregarEstatisticas = async () => {
    try {
      const lojaFilter: any = {};

      if (filtroLoja !== "todas") {
        lojaFilter.loja_id = parseInt(filtroLoja);
      } else if (lojaId !== null && !podeVerTodasLojas) {
        lojaFilter.loja_id = lojaId;
      }

      const stats = await contarTransferencias(lojaFilter);

      setEstatisticas({
        pendentes: stats.pendente,
        confirmadas: stats.confirmada,
        canceladas: stats.cancelada,
        total: stats.total,
      });
    } catch (error) {
      console.error("Erro ao carregar estatísticas:", error);
    }
  };

  const handleConfirmar = async (transferencia: TransferenciaCompleta) => {
    if (!usuario) return;
    setConfirmarModal({ isOpen: true, transferencia });
  };

  const confirmarTransferenciaModal = async () => {
    if (!usuario || !confirmarModal.transferencia) return;

    const transferencia = confirmarModal.transferencia;

    setProcessando(transferencia.id);

    const itensComProblema = [];

    for (const item of transferencia.itens) {
      const { data: estoque } = await supabase
        .from("estoque_lojas")
        .select("quantidade")
        .eq("id_produto", item.produto_id)
        .eq("id_loja", transferencia.loja_origem_id)
        .single();

      if (!estoque || estoque.quantidade < item.quantidade) {
        itensComProblema.push({
          produto: item.produto_descricao || "Produto",
          disponivel: estoque?.quantidade || 0,
          necessario: item.quantidade,
        });
      }
    }

    if (itensComProblema.length > 0) {
      setConfirmarModal({ isOpen: false, transferencia: null });

      const analise = await analisarDisponibilidade(transferencia);

      setProcessando(null);
      setAjustarModal({
        isOpen: true,
        transferencia,
        itens: analise.itens,
      });

      return;
    }

    setConfirmarModal({ isOpen: false, transferencia: null });
    setProcessando(transferencia.id);

    try {
      const resultado = await confirmarTransferencia(
        transferencia.id,
        usuario.id,
      );

      if (resultado.success) {
        toast.success("Transferência confirmada com sucesso!");
        await carregarTransferencias();
        setTransferenciaSelecionada(null);
      } else {
        toast.error(resultado.error || "Erro ao confirmar transferência");
      }
    } catch (error: any) {
      console.error("Erro ao confirmar transferência:", error);
      toast.error(error.message || "Erro ao confirmar transferência");
    } finally {
      setProcessando(null);
    }
  };

  const confirmarComAjustesModal = async (
    ajustes: Array<{ item_id: string; nova_quantidade: number }>,
  ) => {
    if (!usuario || !ajustarModal.transferencia) return;

    setAjustarModal({ isOpen: false, transferencia: null, itens: [] });
    setProcessando(ajustarModal.transferencia.id);

    try {
      const resultado = await confirmarComAjustes(
        ajustarModal.transferencia.id,
        usuario.id,
        ajustes,
      );

      if (resultado.success) {
        toast.success("Transferência confirmada com sucesso!");
        await carregarTransferencias();
        setTransferenciaSelecionada(null);
      } else {
        toast.error(resultado.error || "Erro ao confirmar transferência");
      }
    } catch (error: any) {
      console.error("Erro ao confirmar com ajustes:", error);
      toast.error(error.message || "Erro ao confirmar com ajustes");
    } finally {
      setProcessando(null);
    }
  };

  const handleCancelar = async (transferencia: TransferenciaCompleta) => {
    if (!usuario) return;
    setCancelarModal({ isOpen: true, transferencia });
  };

  const handleEditar = (transferencia: TransferenciaCompleta) => {
    if (transferencia.status !== "pendente") {
      toast.error("Só é possível editar transferências pendentes.");

      return;
    }

    if (!temPermissao("transferencias.editar")) {
      toast.error("Você não tem permissão para editar transferências.");

      return;
    }

    router.push(`/sistema/transferencias/nova?id=${transferencia.id}`);
  };

  const cancelarTransferenciaModal = async (motivo: string) => {
    if (!usuario || !cancelarModal.transferencia) return;

    const transferencia = cancelarModal.transferencia;

    setCancelarModal({ isOpen: false, transferencia: null });
    setProcessando(transferencia.id);

    try {
      const resultado = await cancelarTransferencia(
        transferencia.id,
        usuario.id,
        motivo,
      );

      if (resultado.success) {
        toast.success("Transferência cancelada");
        await carregarTransferencias();
        setTransferenciaSelecionada(null);
      } else {
        toast.error(resultado.error || "Erro ao cancelar transferência");
      }
    } catch (error: any) {
      console.error("Erro ao cancelar transferência:", error);
      toast.error(error.message || "Erro ao cancelar transferência");
    } finally {
      setProcessando(null);
    }
  };

  const transferenciasAgrupadas = useMemo(() => {
    const grupos: { [key: string]: TransferenciaCompleta[] } = {};

    transferencias.forEach((t) => {
      if (t.status === "pendente") {
        const data = new Date(t.criado_em).toLocaleDateString("pt-BR");
        const chave = `${t.loja_origem_id}-${t.loja_destino_id}-${data}`;

        if (!grupos[chave]) {
          grupos[chave] = [];
        }
        grupos[chave].push(t);
      }
    });

    return grupos;
  }, [transferencias]);

  const statusChips = [
    { key: "todas", label: "Todas", color: "default" as const },
    { key: "pendente", label: "Pendentes", color: "warning" as const },
    { key: "confirmada", label: "Confirmadas", color: "success" as const },
    { key: "cancelada", label: "Canceladas", color: "danger" as const },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-4 md:p-6 max-w-7xl mx-auto space-y-4 sm:space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary-500/15 text-primary">
            <ArrowPathRoundedSquareIcon className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">
              Gestão de Transferências
            </h1>
            <p className="text-xs sm:text-sm text-default-500 mt-0.5">
              Gerencie transferências de produtos entre lojas
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {temPermissao("transferencias.criar") && (
            <>
              <Button
                isIconOnly
                className="sm:hidden"
                color="primary"
                size="sm"
                startContent={<PlusIcon className="h-5 w-5" />}
                onPress={() => router.push("/sistema/transferencias/nova")}
              />
              <Button
                className="hidden sm:flex"
                color="primary"
                size="sm"
                startContent={<PlusIcon className="h-5 w-5" />}
                onPress={() => router.push("/sistema/transferencias/nova")}
              >
                Nova Transferência
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <MetricCard
          color="primary"
          delay={0}
          icon={<ArrowPathRoundedSquareIcon className="h-5 w-5" />}
          label="Total"
          value={estatisticas.total}
        />
        <MetricCard
          color="warning"
          delay={100}
          icon={<ClockIcon className="h-5 w-5" />}
          label="Pendentes"
          value={estatisticas.pendentes}
        />
        <MetricCard
          color="success"
          delay={200}
          icon={<CheckCircleIcon className="h-5 w-5" />}
          label="Confirmadas"
          value={estatisticas.confirmadas}
        />
        <MetricCard
          color="danger"
          delay={300}
          icon={<XCircleIcon className="h-5 w-5" />}
          label="Canceladas"
          value={estatisticas.canceladas}
        />
      </div>

      {/* Filtros e Busca */}
      <Card shadow="sm">
        <CardBody className="p-4 sm:p-5 space-y-3">
          {/* Linha: Busca + Toggle */}
          <div className="flex items-center gap-2">
            <Input
              isClearable
              className="flex-1"
              placeholder="Pesquisar por loja, observação..."
              size="sm"
              startContent={
                <MagnifyingGlassIcon className="h-4 w-4 text-default-400" />
              }
              value={termoBusca}
              variant="bordered"
              onClear={() => {
                setTermoBusca("");
                setPagina(1);
              }}
              onValueChange={(value) => {
                setTermoBusca(value);
                setPagina(1);
              }}
            />
            <div className="hidden sm:flex items-center gap-1 p-1 rounded-xl bg-default-100 flex-shrink-0">
              <Button
                isIconOnly
                className="h-7 w-7 min-w-0"
                color={visualizacao === "cards" ? "primary" : "default"}
                size="sm"
                variant={visualizacao === "cards" ? "solid" : "light"}
                onPress={() => setVisualizacao("cards")}
              >
                <Squares2X2Icon className="h-3.5 w-3.5" />
              </Button>
              <Button
                isIconOnly
                className="h-7 w-7 min-w-0"
                color={visualizacao === "tabela" ? "primary" : "default"}
                size="sm"
                variant={visualizacao === "tabela" ? "solid" : "light"}
                onPress={() => setVisualizacao("tabela")}
              >
                <ListBulletIcon className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {/* Cabeçalho dos filtros collapsível */}
          <div className="flex items-center gap-2">
            <button
              className="flex items-center gap-1.5 cursor-pointer group"
              onClick={() => setFiltrosAbertos(!filtrosAbertos)}
            >
              <FunnelIcon className="h-4 w-4 text-default-400 group-hover:text-default-600 transition-colors" />
              <span className="text-xs font-semibold text-default-500 uppercase tracking-wider group-hover:text-default-700 transition-colors">
                Filtros Avançados
              </span>
              <svg
                className={`h-3.5 w-3.5 text-default-400 transition-transform duration-200 ${filtrosAbertos ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M19 9l-7 7-7-7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
            </button>
          </div>

          {filtrosAbertos && (
            <div className="space-y-3 pt-1">
              {/* Status */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <span className="text-xs font-semibold text-default-500 uppercase tracking-wider w-16 flex-shrink-0">
                  Status
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {statusChips.map((chip) => (
                    <Chip
                      key={chip.key}
                      classNames={{
                        base: "cursor-pointer transition-all",
                        content: "text-xs font-medium",
                      }}
                      color={filtroStatus === chip.key ? chip.color : "default"}
                      variant={filtroStatus === chip.key ? "solid" : "flat"}
                      onClick={() => {
                        setFiltroStatus(chip.key);
                        setPagina(1);
                      }}
                    >
                      {chip.label}
                    </Chip>
                  ))}
                </div>
              </div>

              {/* Loja */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <span className="text-xs font-semibold text-default-500 uppercase tracking-wider w-16 flex-shrink-0">
                  Loja
                </span>
                <Select
                  aria-label="Filtrar por loja"
                  className="sm:max-w-xs"
                  items={[{ id: "todas", nome: "Todas as Lojas" }, ...lojas]}
                  placeholder="Todas as Lojas"
                  selectedKeys={[filtroLoja]}
                  size="sm"
                  variant="bordered"
                  onSelectionChange={(keys) => {
                    setFiltroLoja(Array.from(keys)[0] as string);
                    setPagina(1);
                  }}
                >
                  {(loja) => (
                    <SelectItem key={String(loja.id)}>{loja.nome}</SelectItem>
                  )}
                </Select>
              </div>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Lista de Transferências */}
      {transferencias.length === 0 ? (
        <Card shadow="sm">
          <CardBody className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-default-100 flex items-center justify-center mx-auto mb-4">
              <ArrowPathRoundedSquareIcon className="h-8 w-8 text-default-300" />
            </div>
            <p className="text-lg font-medium text-default-500">
              Nenhuma transferência encontrada
            </p>
            <p className="text-sm text-default-400 mt-1">
              {filtroStatus !== "todas" || filtroLoja !== "todas"
                ? "Tente alterar os filtros para ver mais resultados"
                : temPermissao("transferencias.criar")
                  ? 'Clique em "Nova Transferência" para começar'
                  : ""}
            </p>
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Agrupamentos */}
          {filtroStatus === "pendente" &&
            Object.keys(transferenciasAgrupadas).length > 0 && (
              <>
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-warning-500/15 text-warning">
                    <ClockIcon className="h-4 w-4" />
                  </div>
                  <h2 className="text-base sm:text-lg font-semibold text-foreground">
                    Transferências Agrupadas
                  </h2>
                  <span className="text-xs text-default-400">
                    (Mesma rota/data)
                  </span>
                </div>
                {Object.entries(transferenciasAgrupadas).map(
                  ([chave, grupo]) => {
                    if (grupo.length <= 1) return null;

                    const primeira = grupo[0];
                    const totalItens = grupo.reduce(
                      (acc, t) => acc + t.itens.length,
                      0,
                    );

                    return (
                      <Card
                        key={chave}
                        className="border-l-4 border-l-warning overflow-hidden"
                        shadow="sm"
                      >
                        <CardHeader className="bg-gradient-to-r from-warning-500/10 to-transparent px-4 sm:px-5 py-3">
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full gap-2">
                            <div className="flex items-center gap-2 sm:gap-3">
                              <Chip
                                classNames={{
                                  content: "font-semibold text-xs",
                                }}
                                color="warning"
                                size="sm"
                                variant="solid"
                              >
                                {grupo.length} transferências
                              </Chip>
                              <div className="flex items-center gap-1.5 text-sm">
                                <span className="font-semibold truncate max-w-[120px]">
                                  {primeira.loja_origem}
                                </span>
                                <ArrowRightIcon className="h-4 w-4 text-warning flex-shrink-0" />
                                <span className="font-semibold truncate max-w-[120px]">
                                  {primeira.loja_destino}
                                </span>
                              </div>
                              <span className="text-xs text-default-500">
                                {new Date(
                                  primeira.criado_em,
                                ).toLocaleDateString("pt-BR")}
                              </span>
                            </div>
                            <Chip
                              classNames={{ content: "text-xs" }}
                              size="sm"
                              variant="flat"
                            >
                              {totalItens} itens no total
                            </Chip>
                          </div>
                        </CardHeader>
                        <CardBody className="p-3 sm:p-4">
                          <div className="grid grid-cols-1 gap-3">
                            {grupo.map((transferencia) => (
                              <TransferenciaCard
                                key={transferencia.id}
                                podeConfirmar={podeConfirmar}
                                podeEditar={temPermissao(
                                  "transferencias.editar",
                                )}
                                processando={processando === transferencia.id}
                                transferencia={transferencia}
                                onCancelar={handleCancelar}
                                onConfirmar={handleConfirmar}
                                onEditar={handleEditar}
                                onVisualizar={setTransferenciaSelecionada}
                              />
                            ))}
                          </div>
                        </CardBody>
                      </Card>
                    );
                  },
                )}
                <Divider className="my-2" />
              </>
            )}

          {/* Todas as Transferências */}
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary-500/15 text-primary">
              <ArrowPathRoundedSquareIcon className="h-4 w-4" />
            </div>
            <h2 className="text-base sm:text-lg font-semibold text-foreground">
              Todas as Transferências
            </h2>
            <span className="text-xs text-default-400">
              ({transferencias.length})
            </span>
          </div>

          {/* Visualização em Cards */}
          {visualizacao === "cards" && (
            <div className="grid grid-cols-1 gap-3">
              {transferencias.map((transferencia) => (
                <TransferenciaCard
                  key={transferencia.id}
                  podeConfirmar={podeConfirmar}
                  podeEditar={temPermissao("transferencias.editar")}
                  processando={processando === transferencia.id}
                  transferencia={transferencia}
                  onCancelar={handleCancelar}
                  onConfirmar={handleConfirmar}
                  onEditar={handleEditar}
                  onVisualizar={setTransferenciaSelecionada}
                />
              ))}
            </div>
          )}

          {/* Visualização em Tabela */}
          {visualizacao === "tabela" && (
            <div className="overflow-x-auto rounded-xl border border-default-200">
              <Table
                removeWrapper
                aria-label="Tabela de transferências"
                classNames={{
                  th: "bg-default-50 text-default-600 text-xs font-semibold uppercase tracking-wider",
                  td: "text-sm",
                }}
              >
                <TableHeader>
                  <TableColumn>STATUS</TableColumn>
                  <TableColumn>ORIGEM</TableColumn>
                  <TableColumn>DESTINO</TableColumn>
                  <TableColumn>ITENS</TableColumn>
                  <TableColumn>RESPONSÁVEL</TableColumn>
                  <TableColumn>DATA</TableColumn>
                  <TableColumn width={120}>AÇÕES</TableColumn>
                </TableHeader>
                <TableBody>
                  {transferencias.map((t) => {
                    const statusConf = {
                      pendente: {
                        color: "warning" as const,
                        icon: ClockIcon,
                      },
                      confirmada: {
                        color: "success" as const,
                        icon: CheckCircleIcon,
                      },
                      cancelada: {
                        color: "danger" as const,
                        icon: XCircleIcon,
                      },
                    };
                    const sc = statusConf[t.status];
                    const SI = sc.icon;

                    return (
                      <TableRow
                        key={t.id}
                        className="transition-colors hover:bg-default-50"
                      >
                        <TableCell>
                          <Chip
                            classNames={{
                              base: "px-2",
                              content: "text-xs font-semibold",
                            }}
                            color={sc.color}
                            size="sm"
                            startContent={<SI className="h-3 w-3" />}
                            variant="flat"
                          >
                            {t.status === "pendente"
                              ? "Pendente"
                              : t.status === "confirmada"
                                ? "Confirmada"
                                : "Cancelada"}
                          </Chip>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium text-sm">
                            {t.loja_origem}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium text-sm">
                            {t.loja_destino}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Chip
                            classNames={{ content: "text-xs" }}
                            size="sm"
                            variant="flat"
                          >
                            {t.itens.length}
                          </Chip>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-default-600">
                            {t.usuario_nome}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs text-default-500 whitespace-nowrap">
                            {new Date(t.criado_em).toLocaleDateString("pt-BR", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                            })}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              isIconOnly
                              size="sm"
                              variant="light"
                              onPress={() => setTransferenciaSelecionada(t)}
                            >
                              <EyeIcon className="h-4 w-4" />
                            </Button>
                            <Dropdown>
                              <DropdownTrigger>
                                <Button isIconOnly size="sm" variant="light">
                                  <DocumentArrowDownIcon className="h-4 w-4" />
                                </Button>
                              </DropdownTrigger>
                              <DropdownMenu aria-label="Relatório">
                                <DropdownItem
                                  key="completo"
                                  description="Completo"
                                  onPress={async () => {
                                    const { gerarRelatorioTransferenciaPDF } =
                                      await import(
                                        "@/lib/exportarTransferencias"
                                      );

                                    gerarRelatorioTransferenciaPDF(t);
                                  }}
                                >
                                  Completo
                                </DropdownItem>
                                <DropdownItem
                                  key="detalhado"
                                  description="Detalhado"
                                  onPress={async () => {
                                    const {
                                      gerarRelatorioTransferenciaDetalhado,
                                    } = await import(
                                      "@/lib/exportarTransferencias"
                                    );

                                    gerarRelatorioTransferenciaDetalhado(t);
                                  }}
                                >
                                  Detalhado
                                </DropdownItem>
                                <DropdownItem
                                  key="resumido"
                                  description="Resumido"
                                  onPress={async () => {
                                    const {
                                      gerarRelatorioTransferenciaResumido,
                                    } = await import(
                                      "@/lib/exportarTransferencias"
                                    );

                                    gerarRelatorioTransferenciaResumido(t);
                                  }}
                                >
                                  Resumido
                                </DropdownItem>
                              </DropdownMenu>
                            </Dropdown>
                            {t.status === "pendente" && (
                              <Dropdown>
                                <DropdownTrigger>
                                  <Button
                                    isIconOnly
                                    color="primary"
                                    isDisabled={processando === t.id}
                                    size="sm"
                                    variant="light"
                                  >
                                    <PencilSquareIcon className="h-4 w-4" />
                                  </Button>
                                </DropdownTrigger>
                                <DropdownMenu
                                  aria-label="Ações"
                                  onAction={(key) => {
                                    if (key === "editar") handleEditar(t);
                                    if (key === "confirmar") handleConfirmar(t);
                                    if (key === "cancelar") handleCancelar(t);
                                  }}
                                >
                                  {temPermissao("transferencias.editar") ? (
                                    <DropdownItem
                                      key="editar"
                                      startContent={
                                        <PencilSquareIcon className="h-4 w-4" />
                                      }
                                    >
                                      Editar
                                    </DropdownItem>
                                  ) : null}
                                  {podeConfirmar ? (
                                    <DropdownItem
                                      key="confirmar"
                                      className="text-success"
                                      color="success"
                                      startContent={
                                        <CheckCircleIcon className="h-4 w-4" />
                                      }
                                    >
                                      Confirmar
                                    </DropdownItem>
                                  ) : null}
                                  <DropdownItem
                                    key="cancelar"
                                    className="text-danger"
                                    color="danger"
                                    startContent={
                                      <XCircleIcon className="h-4 w-4" />
                                    }
                                  >
                                    Cancelar
                                  </DropdownItem>
                                </DropdownMenu>
                              </Dropdown>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      )}

      {/* Paginação */}
      {totalRegistros > ITENS_POR_PAGINA && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <p className="text-xs sm:text-sm text-default-400">
            Mostrando{" "}
            {Math.min((pagina - 1) * ITENS_POR_PAGINA + 1, totalRegistros)}-
            {Math.min(pagina * ITENS_POR_PAGINA, totalRegistros)} de{" "}
            {totalRegistros} registro{totalRegistros > 1 ? "s" : ""}
          </p>
          <Pagination
            showControls
            color="primary"
            page={pagina}
            total={Math.ceil(totalRegistros / ITENS_POR_PAGINA)}
            onChange={setPagina}
          />
        </div>
      )}

      {/* Modal de Detalhes */}
      <DetalhesTransferenciaModal
        isOpen={!!transferenciaSelecionada}
        podeConfirmar={podeConfirmar}
        podeEditar={temPermissao("transferencias.editar")}
        processando={processando === transferenciaSelecionada?.id}
        transferencia={transferenciaSelecionada}
        onCancelar={handleCancelar}
        onClose={() => setTransferenciaSelecionada(null)}
        onConfirmar={handleConfirmar}
        onEditar={handleEditar}
      />

      {/* Modal de Confirmação */}
      <ConfirmModal
        confirmColor="primary"
        confirmText="Confirmar Transferência"
        isLoading={!!processando}
        isOpen={confirmarModal.isOpen}
        message={
          confirmarModal.transferencia
            ? `Confirmar transferência de ${confirmarModal.transferencia.itens.length} produto(s) da ${confirmarModal.transferencia.loja_origem} para ${confirmarModal.transferencia.loja_destino}?\n\nEsta ação irá movimentar o estoque e não poderá ser desfeita.`
            : ""
        }
        title="Confirmar Transferência"
        onClose={() =>
          setConfirmarModal({ isOpen: false, transferencia: null })
        }
        onConfirm={confirmarTransferenciaModal}
      />

      {/* Modal de Ajuste de Quantidades */}
      <ModalAjustarTransferencia
        isOpen={ajustarModal.isOpen}
        itens={ajustarModal.itens}
        processando={!!processando}
        transferencia={
          ajustarModal.transferencia
            ? {
                loja_origem: ajustarModal.transferencia.loja_origem || "",
                loja_destino: ajustarModal.transferencia.loja_destino || "",
              }
            : null
        }
        onClose={() =>
          setAjustarModal({ isOpen: false, transferencia: null, itens: [] })
        }
        onConfirmar={confirmarComAjustesModal}
      />

      {/* Modal de Cancelamento */}
      <InputModal
        isRequired
        confirmText="Cancelar Transferência"
        isOpen={cancelarModal.isOpen}
        message="Digite o motivo do cancelamento:"
        placeholder="Ex: Produto indisponível, erro na solicitação..."
        title="Cancelar Transferência"
        onClose={() => setCancelarModal({ isOpen: false, transferencia: null })}
        onConfirm={cancelarTransferenciaModal}
      />

      {toast.ToastComponent}
    </div>
  );
}
