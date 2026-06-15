"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  Button,
  Input,
  Select,
  SelectItem,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Spinner,
  Tooltip,
  Pagination,
  Badge,
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
} from "@heroui/react";
import {
  PlusIcon as Plus,
  MagnifyingGlassIcon as Search,
  EyeIcon as Eye,
  CubeIcon as Package,
  ArrowTrendingUpIcon as TrendingUp,
  ClockIcon as Clock,
  CheckCircleIcon as CheckCircle,
  CheckBadgeIcon,
  FunnelIcon,
} from "@heroicons/react/24/outline";

import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/contexts/AuthContext";
import FormularioRMA from "@/components/rma/FormularioRMA";
import DetalhesRMA from "@/components/rma/DetalhesRMA";
import { MetricCard } from "@/components/dashboard/executive/MetricCard";
import { usePermissoes } from "@/hooks/usePermissoes";
import {
  RMA,
  LABELS_TIPO_ORIGEM,
  LABELS_TIPO_RMA,
  LABELS_STATUS_RMA,
  CORES_STATUS_RMA,
} from "@/types/rma";

interface Estatisticas {
  total: number;
  pendentes: number;
  emAnalise: number;
  aprovados: number;
  concluidos: number;
}

export default function RMAsPage() {
  const { usuario } = useAuth();
  const { temPermissao, loading: loadingPermissoes } = usePermissoes();

  const [rmas, setRmas] = useState<RMA[]>([]);
  const [rmasFiltrados, setRmasFiltrados] = useState<RMA[]>([]);
  const [estatisticas, setEstatisticas] = useState<Estatisticas>({
    total: 0,
    pendentes: 0,
    emAnalise: 0,
    aprovados: 0,
    concluidos: 0,
  });
  const [loading, setLoading] = useState(true);

  // Paginação
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [totalRegistros, setTotalRegistros] = useState(0);
  const itensPorPagina = 10;

  // Modais
  const [modalNovoRMA, setModalNovoRMA] = useState(false);
  const [modalDetalhes, setModalDetalhes] = useState(false);
  const [rmaIdSelecionado, setRmaIdSelecionado] = useState<string>("");

  // Filtros
  const [busca, setBusca] = useState("");
  const [filtroTipoOrigem, setFiltroTipoOrigem] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("");
  const [filtrosAbertos, setFiltrosAbertos] = useState(false);

  // Opções para selects
  const [lojas, setLojas] = useState<{ id: number; nome: string }[]>([]);

  useEffect(() => {
    carregarLojas();
  }, []);

  useEffect(() => {
    carregarDados();
  }, [paginaAtual, filtroTipoOrigem, filtroStatus]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setPaginaAtual(1);
      carregarDados();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [busca]);

  const carregarDados = async () => {
    setLoading(true);
    try {
      // Construir query base
      let query = supabase.from("rmas").select(
        `
          *,
          produtos (
            id,
            descricao,
            marca,
            categoria
          ),
          clientes (
            id,
            nome
          ),
          fornecedores (
            id,
            nome
          ),
          lojas (
            id,
            nome
          )
        `,
        { count: "exact" },
      );

      // Filtro de busca dinâmica
      if (busca.trim()) {
        const termos = busca
          .toLowerCase()
          .split(" ")
          .filter((t) => t.length > 0);

        // Buscar em múltiplos campos
        const condicoes = termos
          .map((termo) => {
            return `numero_rma.ilike.%${termo}%,motivo.ilike.%${termo}%`;
          })
          .join(",");

        query = query.or(condicoes);
      }

      // Filtro de tipo de origem
      if (filtroTipoOrigem) {
        query = query.eq("tipo_origem", filtroTipoOrigem);
      }

      // Filtro de status
      if (filtroStatus) {
        query = query.eq("status", filtroStatus);
      }

      // Aplicar paginação
      const inicio = (paginaAtual - 1) * itensPorPagina;
      const fim = inicio + itensPorPagina - 1;

      query = query.range(inicio, fim).order("criado_em", { ascending: false });

      const { data, error, count } = await query;

      if (error) throw error;

      setRmas(data || []);
      setRmasFiltrados(data || []);
      setTotalRegistros(count || 0);

      // Carregar estatísticas separadamente (sem paginação)
      await carregarEstatisticas();
    } catch (error) {
      console.error("Erro ao carregar RMAs:", error);
      setRmas([]);
      setRmasFiltrados([]);
    } finally {
      setLoading(false);
    }
  };

  const carregarEstatisticas = async () => {
    try {
      let queryStats = supabase
        .from("rmas")
        .select("status", { count: "exact" });

      // Aplicar mesmos filtros (exceto paginação)
      if (filtroTipoOrigem) {
        queryStats = queryStats.eq("tipo_origem", filtroTipoOrigem);
      }

      if (filtroStatus) {
        queryStats = queryStats.eq("status", filtroStatus);
      }

      const { data } = await queryStats;

      if (data) {
        setEstatisticas({
          total: data.length,
          pendentes: data.filter((r) => r.status === "pendente").length,
          emAnalise: data.filter((r) => r.status === "em_analise").length,
          aprovados: data.filter((r) => r.status === "aprovado").length,
          concluidos: data.filter((r) => r.status === "concluido").length,
        });
      }
    } catch (error) {
      console.error("Erro ao carregar estatísticas:", error);
    }
  };

  const carregarLojas = async () => {
    try {
      const { data } = await supabase
        .from("lojas")
        .select("id, nome")
        .order("nome");

      setLojas(data || []);
    } catch (error) {
      console.error("Erro ao carregar lojas:", error);
    }
  };

  const handleMudarPagina = (novaPagina: number) => {
    setPaginaAtual(novaPagina);
  };

  const totalPaginas = Math.ceil(totalRegistros / itensPorPagina);

  const handleVerDetalhes = (rmaId: string) => {
    setRmaIdSelecionado(rmaId);
    setModalDetalhes(true);
  };

  const formatarData = (data: string) => {
    return new Date(data).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const limparFiltros = () => {
    setBusca("");
    setFiltroTipoOrigem("");
    setFiltroStatus("");
    setPaginaAtual(1);
  };

  // Chips de filtros ativos (busca tem campo próprio)
  const chipsFiltros: { key: string; label: string; onRemove: () => void }[] =
    [];

  if (filtroTipoOrigem) {
    chipsFiltros.push({
      key: "origem",
      label: `Origem: ${LABELS_TIPO_ORIGEM[filtroTipoOrigem as keyof typeof LABELS_TIPO_ORIGEM] || filtroTipoOrigem}`,
      onRemove: () => setFiltroTipoOrigem(""),
    });
  }

  if (filtroStatus) {
    chipsFiltros.push({
      key: "status",
      label: `Status: ${LABELS_STATUS_RMA[filtroStatus as keyof typeof LABELS_STATUS_RMA] || filtroStatus}`,
      onRemove: () => setFiltroStatus(""),
    });
  }

  // Verificar permissão de visualizar
  // Verificar loading primeiro
  if (loading || loadingPermissoes) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!temPermissao("rma.visualizar")) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold text-danger mb-4">Acesso Negado</h1>
        <p className="text-default-500">
          Você não tem permissão para visualizar RMAs.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1600px] space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            RMAs
          </h1>
          <p className="text-sm text-default-500">
            Gerencie as solicitações de retorno de mercadoria
          </p>
        </div>
        {temPermissao("rma.criar") && (
          <Button
            color="primary"
            startContent={<Plus className="h-4 w-4" />}
            onPress={() => setModalNovoRMA(true)}
          >
            Novo RMA
          </Button>
        )}
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4">
        <MetricCard
          icon={<Package className="h-5 w-5" />}
          label="Total de RMAs"
          value={estatisticas.total}
        />
        <MetricCard
          emphasis={estatisticas.pendentes > 0}
          icon={<Clock className="h-5 w-5" />}
          label="Pendentes"
          tone="warning"
          value={estatisticas.pendentes}
        />
        <MetricCard
          icon={<TrendingUp className="h-5 w-5" />}
          label="Em Análise"
          value={estatisticas.emAnalise}
        />
        <MetricCard
          icon={<CheckCircle className="h-5 w-5" />}
          label="Aprovados"
          value={estatisticas.aprovados}
        />
        <MetricCard
          icon={<CheckBadgeIcon className="h-5 w-5" />}
          label="Concluídos"
          value={estatisticas.concluidos}
        />
      </div>

      {/* Barra de busca e filtros */}
      <div className="rounded-xl border border-default-200/70 bg-content1 p-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Input
            isClearable
            className="flex-1"
            placeholder="Buscar por número, motivo..."
            radius="md"
            size="md"
            startContent={<Search className="h-4 w-4 text-default-400" />}
            value={busca}
            variant="bordered"
            onClear={() => setBusca("")}
            onValueChange={setBusca}
          />
          <Badge
            color="primary"
            content={chipsFiltros.length}
            isInvisible={chipsFiltros.length === 0}
            size="sm"
          >
            <Button
              radius="md"
              size="md"
              startContent={<FunnelIcon className="h-4 w-4" />}
              variant="flat"
              onPress={() => setFiltrosAbertos(true)}
            >
              Filtros
            </Button>
          </Badge>
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
        {totalRegistros > 0 && (
          <div className="mt-2 flex items-center">
            <span className="ml-auto text-xs text-default-500 tabular-nums">
              {totalRegistros} registro{totalRegistros !== 1 ? "s" : ""}
            </span>
          </div>
        )}
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
              label="Tipo de Origem"
              placeholder="Todas as origens"
              selectedKeys={filtroTipoOrigem ? [filtroTipoOrigem] : []}
              variant="bordered"
              onChange={(e) => setFiltroTipoOrigem(e.target.value)}
            >
              {Object.entries(LABELS_TIPO_ORIGEM).map(([valor, label]) => (
                <SelectItem key={valor}>{label}</SelectItem>
              ))}
            </Select>

            <Select
              label="Status"
              placeholder="Todos os status"
              selectedKeys={filtroStatus ? [filtroStatus] : []}
              variant="bordered"
              onChange={(e) => setFiltroStatus(e.target.value)}
            >
              {Object.entries(LABELS_STATUS_RMA).map(([valor, label]) => (
                <SelectItem key={valor}>{label}</SelectItem>
              ))}
            </Select>
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

      {/* Tabela */}
      <Card>
        <CardBody>
          {loading ? (
            <div className="flex justify-center py-8">
              <Spinner size="lg" />
            </div>
          ) : (
            <Table aria-label="Tabela de RMAs">
              <TableHeader>
                <TableColumn>NÚMERO</TableColumn>
                <TableColumn>TIPO</TableColumn>
                <TableColumn>PRODUTO</TableColumn>
                <TableColumn>ORIGEM</TableColumn>
                <TableColumn>QUANTIDADE</TableColumn>
                <TableColumn>STATUS</TableColumn>
                <TableColumn>DATA</TableColumn>
                <TableColumn>AÇÕES</TableColumn>
              </TableHeader>
              <TableBody emptyContent="Nenhum RMA encontrado">
                {rmasFiltrados.map((rma) => (
                  <TableRow key={rma.id}>
                    <TableCell>
                      <span className="font-medium">{rma.numero_rma}</span>
                    </TableCell>
                    <TableCell>
                      <Chip size="sm" variant="flat">
                        {LABELS_TIPO_ORIGEM[rma.tipo_origem]}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{rma.produtos?.descricao}</p>
                        <p className="text-xs text-default-500">
                          {LABELS_TIPO_RMA[rma.tipo_rma]}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{rma.lojas?.nome}</p>
                        {rma.clientes && (
                          <p className="text-xs text-default-500">
                            {rma.clientes.nome}
                          </p>
                        )}
                        {rma.fornecedores && (
                          <p className="text-xs text-default-500">
                            {rma.fornecedores.nome}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{rma.quantidade}</TableCell>
                    <TableCell>
                      <Chip
                        color={CORES_STATUS_RMA[rma.status]}
                        size="sm"
                        variant="flat"
                      >
                        {LABELS_STATUS_RMA[rma.status]}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {formatarData(rma.criado_em)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Tooltip content="Ver detalhes">
                        <Button
                          isIconOnly
                          size="sm"
                          variant="light"
                          onPress={() => handleVerDetalhes(rma.id)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {totalPaginas > 1 && (
            <div className="flex justify-center items-center gap-2 pt-4">
              <Pagination
                showControls
                classNames={{
                  cursor: "bg-primary text-white",
                }}
                color="primary"
                page={paginaAtual}
                size="sm"
                total={totalPaginas}
                onChange={handleMudarPagina}
              />
            </div>
          )}
        </CardBody>
      </Card>

      {/* Modais */}
      <FormularioRMA
        isOpen={modalNovoRMA}
        onClose={() => setModalNovoRMA(false)}
        onSuccess={carregarDados}
      />

      {rmaIdSelecionado && (
        <DetalhesRMA
          isOpen={modalDetalhes}
          rmaId={rmaIdSelecionado}
          onAtualizar={carregarDados}
          onClose={() => {
            setModalDetalhes(false);
            setRmaIdSelecionado("");
          }}
        />
      )}
    </div>
  );
}
