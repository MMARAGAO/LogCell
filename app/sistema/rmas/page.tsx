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
} from "@heroui/react";
import {
  Plus,
  Search,
  Eye,
  Package,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  Filter,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { rmaService } from "@/services/rmaService";
import FormularioRMA from "@/components/rma/FormularioRMA";
import DetalhesRMA from "@/components/rma/DetalhesRMA";
import { usePermissoes } from "@/hooks/usePermissoes";
import {
  RMA,
  FiltrosRMA,
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
      const { supabase } = await import("@/lib/supabaseClient");

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
        { count: "exact" }
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
      const { supabase } = await import("@/lib/supabaseClient");

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
      const { supabase } = await import("@/lib/supabaseClient");
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
    return new Date(data + "Z").toLocaleString("pt-BR", {
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

  // Verificar permissão de visualizar
  if (!loadingPermissoes && !temPermissao("rma.visualizar")) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold text-danger mb-4">Acesso Negado</h1>
        <p className="text-default-500">
          Você não tem permissão para visualizar RMAs.
        </p>
      </div>
    );
  }

  if (loading || loadingPermissoes) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">RMAs</h1>
          <p className="text-gray-600">
            Gerencie as solicitações de retorno de mercadoria
          </p>
        </div>
        {temPermissao("rma.criar") && (
          <Button
            color="primary"
            startContent={<Plus className="w-4 h-4" />}
            onPress={() => setModalNovoRMA(true)}
          >
            Novo RMA
          </Button>
        )}
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardBody className="flex flex-row items-center gap-3">
            <div className="p-3 bg-primary-100 rounded-lg">
              <Package className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total de RMAs</p>
              <p className="text-2xl font-bold">{estatisticas.total}</p>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="flex flex-row items-center gap-3">
            <div className="p-3 bg-warning-100 rounded-lg">
              <Clock className="w-6 h-6 text-warning" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Pendentes</p>
              <p className="text-2xl font-bold">{estatisticas.pendentes}</p>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="flex flex-row items-center gap-3">
            <div className="p-3 bg-secondary-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-secondary" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Em Análise</p>
              <p className="text-2xl font-bold">{estatisticas.emAnalise}</p>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="flex flex-row items-center gap-3">
            <div className="p-3 bg-success-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Aprovados</p>
              <p className="text-2xl font-bold">{estatisticas.aprovados}</p>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="flex flex-row items-center gap-3">
            <div className="p-3 bg-success-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Concluídos</p>
              <p className="text-2xl font-bold">{estatisticas.concluidos}</p>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardBody>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 space-y-2">
              <Input
                placeholder="Ex: rma cliente produto (busca inteligente)"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                startContent={<Search className="w-4 h-4 text-gray-400" />}
                isClearable
                onClear={() => setBusca("")}
                description="Digite palavras-chave separadas por espaço"
              />
              {totalRegistros > 0 && (
                <p className="text-xs text-default-500">
                  {totalRegistros} registro{totalRegistros !== 1 ? "s" : ""}{" "}
                  encontrado{totalRegistros !== 1 ? "s" : ""}
                </p>
              )}
            </div>

            <Select
              placeholder="Tipo de Origem"
              selectedKeys={filtroTipoOrigem ? [filtroTipoOrigem] : []}
              onChange={(e) => setFiltroTipoOrigem(e.target.value)}
              className="w-full md:w-64"
            >
              {Object.entries(LABELS_TIPO_ORIGEM).map(([valor, label]) => (
                <SelectItem key={valor}>{label}</SelectItem>
              ))}
            </Select>

            <Select
              placeholder="Status"
              selectedKeys={filtroStatus ? [filtroStatus] : []}
              onChange={(e) => setFiltroStatus(e.target.value)}
              className="w-full md:w-64"
            >
              {Object.entries(LABELS_STATUS_RMA).map(([valor, label]) => (
                <SelectItem key={valor}>{label}</SelectItem>
              ))}
            </Select>

            {(busca || filtroTipoOrigem || filtroStatus) && (
              <Button variant="flat" onPress={limparFiltros}>
                Limpar
              </Button>
            )}
          </div>
        </CardBody>
      </Card>

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
                        <p className="text-xs text-gray-500">
                          {LABELS_TIPO_RMA[rma.tipo_rma]}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{rma.lojas?.nome}</p>
                        {rma.clientes && (
                          <p className="text-xs text-gray-500">
                            {rma.clientes.nome}
                          </p>
                        )}
                        {rma.fornecedores && (
                          <p className="text-xs text-gray-500">
                            {rma.fornecedores.nome}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{rma.quantidade}</TableCell>
                    <TableCell>
                      <Chip
                        color={CORES_STATUS_RMA[rma.status]}
                        variant="flat"
                        size="sm"
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
                total={totalPaginas}
                page={paginaAtual}
                onChange={handleMudarPagina}
                size="sm"
                showControls
                color="primary"
                classNames={{
                  cursor: "bg-primary text-white",
                }}
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
          onClose={() => {
            setModalDetalhes(false);
            setRmaIdSelecionado("");
          }}
          rmaId={rmaIdSelecionado}
          onAtualizar={carregarDados}
        />
      )}
    </div>
  );
}
