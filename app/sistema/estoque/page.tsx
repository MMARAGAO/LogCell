"use client";

import { useState, useEffect } from "react";
import { Card, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { Autocomplete, AutocompleteItem } from "@heroui/autocomplete";
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
import { useSearchParams } from "next/navigation";
import {
  CubeIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  EllipsisVerticalIcon,
  PencilIcon,
  TrashIcon,
  ArrowPathIcon,
  PhotoIcon,
  ClockIcon,
  BuildingStorefrontIcon,
  CurrencyDollarIcon,
  ShoppingCartIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  DocumentDuplicateIcon,
} from "@heroicons/react/24/outline";

import { useAuthContext } from "@/contexts/AuthContext";
import { usePermissoes } from "@/hooks/usePermissoes";
import { useLojaFilter } from "@/hooks/useLojaFilter";
import {
  ProdutoFormModal,
  EstoqueLojaModal,
  HistoricoEstoqueModal,
  HistoricoProdutoModal,
  GerenciarFotosProdutoModal,
  GerenciarFornecedoresProdutoModal,
  TransferenciaModal,
} from "@/components/estoque";
import { ConfirmModal } from "@/components/ConfirmModal";
import { useToast } from "@/components/Toast";
import { Produto } from "@/types";
import {
  criarProduto,
  atualizarProduto,
  deletarProduto,
  toggleAtivoProduto,
  getEstatisticasProdutos,
  getEstatisticasFinanceiras,
} from "@/services/produtosService";
import {
  getEstoqueProduto,
  atualizarQuantidadeEstoque,
  buscarProdutosPaginados,
  getFiltrosProdutos,
} from "@/services/estoqueService";
import {
  getFotosProduto,
  uploadFotoProduto,
  deletarFotoProduto,
  definirFotoPrincipal,
} from "@/services/fotosProdutosService";
import { LojasService } from "@/services/lojasService";
import { formatarMoeda } from "@/lib/formatters";
import { gerarRelatorioProdutoPDF } from "@/lib/exportarPDF";

import { MetricCard } from "@/components/transferencias/MetricCard";
import { ProdutoCard } from "@/components/estoque/ProdutoCard";

export default function EstoquePage() {
  const { usuario: user } = useAuthContext();
  const {
    temPermissao,
    loading: loadingPermissoes,
    permissoes,
  } = usePermissoes();
  const { filtrarPorLoja, podeVerTodasLojas, lojaId } = useLojaFilter();
  const toast = useToast();
  const searchParams = useSearchParams();
  const buscaParam = searchParams.get("busca");

  // Log de debug para permissões
  useEffect(() => {
    console.log("🔐 [ESTOQUE] Permissões carregadas:", {
      loading: loadingPermissoes,
      permissoes: permissoes,
      temEstoqueCriar: temPermissao("estoque.criar"),
    });
  }, [loadingPermissoes, permissoes]);

  const [produtos, setProdutos] = useState<any[]>([]);
  const [totalRegistros, setTotalRegistros] = useState(0);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [statusFiltro, setStatusFiltro] = useState<
    "todos" | "ativos" | "inativos"
  >("ativos");
  const [marcaFiltro, setMarcaFiltro] = useState<string>("todos");
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>("todos");
  const [estoqueFiltro, setEstoqueFiltro] = useState<string>("todos");
  const [marcasDisponiveis, setMarcasDisponiveis] = useState<string[]>([]);
  const [categoriasDisponiveis, setCategoriasDisponiveis] = useState<string[]>(
    [],
  );

  // Preencher busca vinda da URL
  useEffect(() => {
    if (buscaParam) {
      setBusca(buscaParam);
    }
  }, [buscaParam]);

  const [stats, setStats] = useState({
    total: 0,
    ativos: 0,
    inativos: 0,
  });
  const [statsFinanceiras, setStatsFinanceiras] = useState({
    valorTotalCompra: 0,
    valorTotalVenda: 0,
    valorEstoqueCompra: 0,
    valorEstoqueVenda: 0,
    margemLucro: 0,
    quantidadeTotal: 0,
    produtosEstoqueBaixo: 0,
    produtosSemEstoque: 0,
  });
  const [visualizacao, setVisualizacao] = useState<"tabela" | "cards">("cards");
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 12;

  // Modals
  const [modalProduto, setModalProduto] = useState(false);
  const [modalEstoque, setModalEstoque] = useState(false);
  const [modalHistorico, setModalHistorico] = useState(false);
  const [modalHistoricoProduto, setModalHistoricoProduto] = useState(false);
  const [modalFotos, setModalFotos] = useState(false);
  const [modalFornecedores, setModalFornecedores] = useState(false);
  const [modalTransferencia, setModalTransferencia] = useState(false);
  const [produtoSelecionado, setProdutoSelecionado] = useState<Produto | null>(
    null,
  );
  const [estoquesLoja, setEstoquesLoja] = useState<any[]>([]);

  // Confirm Modal
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
    confirmColor: "danger" as "danger" | "warning" | "primary",
  });

  // Lojas
  const [lojas, setLojas] = useState<any[]>([]);

  // Aguardar permissões serem carregadas antes de carregar dados
  useEffect(() => {
    if (!loadingPermissoes) {
      carregarProdutos();
      carregarDados();
      carregarLojas();
      carregarFiltros();
    }
  }, [loadingPermissoes, lojaId, podeVerTodasLojas]);

  // Re-carregar quando filtros mudarem
  useEffect(() => {
    if (!loadingPermissoes) {
      carregarProdutos();
    }
  }, [
    busca,
    statusFiltro,
    marcaFiltro,
    categoriaFiltro,
    estoqueFiltro,
    paginaAtual,
  ]);

  const carregarProdutos = async () => {
    try {
      const ativo =
        statusFiltro === "ativos"
          ? true
          : statusFiltro === "inativos"
            ? false
            : undefined;

      const result = await buscarProdutosPaginados({
        busca: busca || undefined,
        ativo,
        marca: marcaFiltro !== "todos" ? marcaFiltro : undefined,
        categoria: categoriaFiltro !== "todos" ? categoriaFiltro : undefined,
        page: paginaAtual,
        pageSize: itensPorPagina,
      });

      let dados = result.data;

      // Filtrar por loja se usuário não tiver acesso a todas
      const podeVerOutrasLojas =
        podeVerTodasLojas || temPermissao("estoque.ver_estoque_outras_lojas");

      if (lojaId !== null && !podeVerOutrasLojas) {
        dados = dados.map((produto: any) => {
          const estoquesFiltrados =
            produto.estoques_lojas?.filter((e: any) => e.id_loja === lojaId) ||
            [];

          return {
            ...produto,
            estoques_lojas: estoquesFiltrados,
            total_estoque: estoquesFiltrados.reduce(
              (sum: number, e: any) => sum + (e.quantidade || 0),
              0,
            ),
          };
        });
      }

      // Aplicar filtro de nível de estoque (client-side, após ter os dados)
      if (estoqueFiltro === "baixo") {
        dados = dados.filter(
          (p: any) =>
            p.total_estoque > 0 && p.total_estoque < (p.quantidade_minima || 5),
        );
      } else if (estoqueFiltro === "sem") {
        dados = dados.filter((p: any) => p.total_estoque === 0);
      } else if (estoqueFiltro === "adequado") {
        dados = dados.filter(
          (p: any) => p.total_estoque >= (p.quantidade_minima || 5),
        );
      }

      setProdutos(dados);
      setTotalRegistros(result.total);
    } catch (error) {
      console.error("Erro ao carregar produtos:", error);
      toast.error("Erro ao carregar produtos");
    } finally {
      setLoading(false);
    }
  };

  const carregarDados = async () => {
    try {
      const [statsData, statsFinanceirasData] = await Promise.all([
        getEstatisticasProdutos(),
        getEstatisticasFinanceiras(),
      ]);

      setStats(statsData);
      setStatsFinanceiras(statsFinanceirasData);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast.error("Erro ao carregar dados");
    }
  };

  const carregarFiltros = async () => {
    try {
      const filtros = await getFiltrosProdutos();

      setMarcasDisponiveis(filtros.marcas);
      setCategoriasDisponiveis(filtros.categorias);
    } catch (error) {
      console.error("Erro ao carregar filtros:", error);
    }
  };

  const carregarLojas = async () => {
    try {
      const dados = await LojasService.getLojasAtivas();

      setLojas(dados);
    } catch (error) {
      console.error("Erro ao carregar lojas:", error);
    }
  };

  const handleCriarProduto = async (produto: Partial<Produto>) => {
    if (!user) return;
    try {
      await criarProduto(produto as any, user.id);
      await carregarProdutos();
      await carregarDados();
      toast.success("Produto criado com sucesso!");
    } catch (error: any) {
      console.error("Erro ao criar produto:", error);
      if (error.message?.includes("duplicate")) {
        toast.warning("Já existe um produto com este código!");
      } else {
        toast.error("Erro ao criar produto. Tente novamente.");
      }
    }
  };

  const handleEditarProduto = async (produto: Partial<Produto>) => {
    if (!temPermissao("estoque.editar")) {
      toast.error("Você não tem permissão para editar produtos");

      return;
    }

    if (!produtoSelecionado || !user) return;
    try {
      const resultado = await atualizarProduto(
        produtoSelecionado.id,
        produto,
        user.id,
      );

      // Recarregar dados
      await Promise.all([
        carregarProdutos(),
        carregarDados(),
        carregarProdutos(),
      ]);

      toast.success("Produto atualizado com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar produto:", error);
      toast.error("Erro ao atualizar produto. Tente novamente.");
    }
  };

  const handleDeletar = async (produto: Produto) => {
    if (!temPermissao("estoque.deletar")) {
      toast.error("Você não tem permissão para deletar produtos");

      return;
    }

    setConfirmModal({
      isOpen: true,
      title: "Excluir Produto",
      message: `Tem certeza que deseja excluir o produto "${produto.descricao}"? Esta ação não pode ser desfeita.`,
      confirmColor: "danger",
      onConfirm: async () => {
        try {
          await deletarProduto(produto.id);
          await carregarProdutos();
          await carregarDados();
          await carregarProdutos();
          toast.success("Produto excluído com sucesso!");
        } catch (error) {
          console.error("Erro ao excluir produto:", error);
          toast.error(
            "Erro ao excluir produto. Pode haver estoque ou movimentações vinculadas.",
          );
        } finally {
          setConfirmModal({ ...confirmModal, isOpen: false });
        }
      },
    });
  };

  const handleToggleAtivo = async (produto: Produto) => {
    if (!temPermissao("estoque.editar")) {
      toast.error("Você não tem permissão para alterar o status do produto");

      return;
    }
    if (!user) return;

    const acao = produto.ativo ? "desativar" : "ativar";

    setConfirmModal({
      isOpen: true,
      title: `${produto.ativo ? "Desativar" : "Ativar"} Produto`,
      message: `Tem certeza que deseja ${acao} o produto "${produto.descricao}"?`,
      confirmColor: produto.ativo ? "warning" : "primary",
      onConfirm: async () => {
        try {
          await toggleAtivoProduto(produto.id, !produto.ativo, user.id);
          await carregarProdutos();
          await carregarDados();
          await carregarProdutos();
          toast.success(
            `Produto ${produto.ativo ? "desativado" : "ativado"} com sucesso!`,
          );
        } catch (error) {
          console.error("Erro ao alterar status:", error);
          toast.error("Erro ao alterar status do produto.");
        } finally {
          setConfirmModal({ ...confirmModal, isOpen: false });
        }
      },
    });
  };

  const handleMovimentarEstoque = async (data: {
    id_loja: number;
    quantidade: number;
    observacao?: string;
  }) => {
    if (!temPermissao("estoque.ajustar")) {
      toast.error("Você não tem permissão para ajustar o estoque");

      return;
    }

    if (!user || !produtoSelecionado) return;
    try {
      await atualizarQuantidadeEstoque(
        produtoSelecionado.id,
        data.id_loja,
        data.quantidade,
        user.id,
        data.observacao,
      );
      await carregarProdutos();
      await carregarProdutos();
      toast.success("Estoque atualizado com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar estoque:", error);
      toast.error("Erro ao atualizar estoque.");
    }
  };

  const abrirModalEstoque = async (produto: Produto) => {
    if (!temPermissao("estoque.ajustar")) {
      toast.error("Você não tem permissão para movimentar estoque");

      return;
    }
    setProdutoSelecionado(produto);
    // Carregar estoques do produto
    try {
      const estoques = await getEstoqueProduto(produto.id);

      setEstoquesLoja(estoques);
    } catch (error) {
      console.error("Erro ao carregar estoques:", error);
      setEstoquesLoja([]);
    }
    setModalEstoque(true);
  };

  const abrirModalHistorico = (produto: Produto) => {
    setProdutoSelecionado(produto);
    setModalHistorico(true);
  };

  const abrirModalFotos = (produto: Produto) => {
    setProdutoSelecionado(produto);
    setModalFotos(true);
  };

  const abrirModalFornecedores = (produto: Produto) => {
    if (!temPermissao("fornecedores.visualizar")) {
      toast.error("Você não tem permissão para gerenciar fornecedores");

      return;
    }
    setProdutoSelecionado(produto);
    setModalFornecedores(true);
  };

  const abrirModalTransferencia = (produto: Produto) => {
    if (!temPermissao("estoque.transferir")) {
      toast.error("Você não tem permissão para transferir produtos");

      return;
    }
    setProdutoSelecionado(produto);
    setModalTransferencia(true);
  };

  const abrirModalEditar = (produto: Produto) => {
    setProdutoSelecionado(produto);
    setModalProduto(true);
  };

  const handleClonarProduto = (produto: Produto) => {
    if (!temPermissao("estoque.criar")) {
      toast.error("Você não tem permissão para clonar produtos");

      return;
    }
    // Cria um "novo" produto baseado no existente
    // Remove ID e timestamps para criar um novo registro
    const produtoClonado: Partial<Produto> = {
      descricao: `${produto.descricao} (Cópia)`,
      grupo: produto.grupo,
      categoria: produto.categoria,
      codigo_fabricante: produto.codigo_fabricante,
      modelos: produto.modelos,
      marca: produto.marca,
      preco_compra: produto.preco_compra,
      preco_venda: produto.preco_venda,
      quantidade_minima: produto.quantidade_minima,
      ativo: produto.ativo,
    };

    // Define o produto como null para indicar que é um novo produto
    // mas pré-preenche os dados
    setProdutoSelecionado(produtoClonado as any);
    setModalProduto(true);
  };

  // Preparar items para os Autocomplete de filtros
  const marcasItems = [
    { key: "todos", label: "Todas as Marcas" },
    ...marcasDisponiveis.map((marca) => ({ key: marca, label: marca })),
  ];

  const categoriasItems = [
    { key: "todos", label: "Todas as Categorias" },
    ...categoriasDisponiveis.map((categoria) => ({
      key: categoria,
      label: categoria,
    })),
  ];

  // Paginação (usando total do servidor)
  const totalPaginas = Math.ceil(totalRegistros / itensPorPagina);

  // Resetar página ao filtrar
  useEffect(() => {
    if (paginaAtual !== 1) setPaginaAtual(1);
  }, [busca, statusFiltro, marcaFiltro, categoriaFiltro, estoqueFiltro]);

  // Verificar loading primeiro
  if (loading || loadingPermissoes) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  // Verificar permissão de visualizar
  if (!temPermissao("estoque.visualizar")) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold text-danger mb-4">Acesso Negado</h1>
        <p className="text-default-500">
          Você não tem permissão para visualizar o estoque.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-8xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-primary/10 rounded-xl">
            <CubeIcon className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Estoque</h1>
            <p className="text-default-500 mt-1">
              Gerencie seus produtos e controle de estoque
            </p>
          </div>
        </div>
      </div>

      {/* Estatísticas */}
      {temPermissao("estoque.ver_estatisticas") && (
        <div className="mb-6 space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
            <MetricCard
              color="primary"
              icon={<CubeIcon className="h-5 w-5" />}
              label="Total de Itens"
              value={statsFinanceiras.quantidadeTotal.toLocaleString("pt-BR")}
            />
            <MetricCard
              color="success"
              icon={<CurrencyDollarIcon className="h-5 w-5" />}
              label="Valor em Estoque"
              value={formatarMoeda(statsFinanceiras.valorEstoqueVenda)}
            />
            <MetricCard
              color="warning"
              icon={<ShoppingCartIcon className="h-5 w-5" />}
              label="Custo do Estoque"
              value={formatarMoeda(statsFinanceiras.valorEstoqueCompra)}
            />
            <MetricCard
              color="primary"
              icon={<ChartBarIcon className="h-5 w-5" />}
              label="Produtos Ativos"
              value={stats.ativos}
            />
            <MetricCard
              color="danger"
              icon={<ExclamationTriangleIcon className="h-5 w-5" />}
              label="Alertas (sem estoque)"
              value={statsFinanceiras.produtosSemEstoque}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            <MetricCard
              color="success"
              icon={<CurrencyDollarIcon className="h-5 w-5" />}
              label="Valor Total de Venda"
              value={formatarMoeda(statsFinanceiras.valorTotalVenda)}
            />
            <MetricCard
              color="warning"
              icon={<ShoppingCartIcon className="h-5 w-5" />}
              label="Valor Total de Compra"
              value={formatarMoeda(statsFinanceiras.valorTotalCompra)}
            />
          </div>
        </div>
      )}

      {/* Filtros e Ações */}
      <Card className="shadow-sm mb-6">
        <CardBody className="p-4 sm:p-5 space-y-4">
          {/* Busca + Toggle */}
          <div className="flex items-center gap-2">
            <Input
              className="flex-1"
              placeholder="Buscar produtos..."
              size="sm"
              startContent={
                <MagnifyingGlassIcon className="h-4 w-4 text-default-400" />
              }
              value={busca}
              variant="bordered"
              onValueChange={setBusca}
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
                <svg
                  className="h-3.5 w-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                  />
                </svg>
              </Button>
              <Button
                isIconOnly
                className="h-7 w-7 min-w-0"
                color={visualizacao === "tabela" ? "primary" : "default"}
                size="sm"
                variant={visualizacao === "tabela" ? "solid" : "light"}
                onPress={() => setVisualizacao("tabela")}
              >
                <svg
                  className="h-3.5 w-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M4 6h16M4 10h16M4 14h16M4 18h16"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                  />
                </svg>
              </Button>
            </div>
          </div>

          {/* Filtros */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Marca */}
            <Autocomplete
              allowsCustomValue={false}
              aria-label="Filtro de marca"
              items={marcasItems}
              placeholder="Marca"
              selectedKey={marcaFiltro}
              size="sm"
              variant="bordered"
              onSelectionChange={(key) => {
                setMarcaFiltro((key as string) || "todos");
              }}
            >
              {(item) => (
                <AutocompleteItem key={item.key}>{item.label}</AutocompleteItem>
              )}
            </Autocomplete>

            {/* Categoria */}
            <Autocomplete
              allowsCustomValue={false}
              aria-label="Filtro de categoria"
              items={categoriasItems}
              placeholder="Categoria"
              selectedKey={categoriaFiltro}
              size="sm"
              variant="bordered"
              onSelectionChange={(key) => {
                setCategoriaFiltro((key as string) || "todos");
              }}
            >
              {(item) => (
                <AutocompleteItem key={item.key}>{item.label}</AutocompleteItem>
              )}
            </Autocomplete>

            {/* Estoque */}
            <Select
              aria-label="Filtro de nível de estoque"
              placeholder="Nível de Estoque"
              selectedKeys={[estoqueFiltro]}
              size="sm"
              variant="bordered"
              onSelectionChange={(keys) => {
                const value = Array.from(keys)[0] as string;

                setEstoqueFiltro(value);
              }}
            >
              <SelectItem key="todos">Todos os Estoques</SelectItem>
              <SelectItem key="baixo">Estoque Baixo</SelectItem>
              <SelectItem key="sem">Sem Estoque</SelectItem>
              <SelectItem key="adequado">Estoque Adequado</SelectItem>
            </Select>

            {/* Status */}
            <Select
              aria-label="Filtro de status do produto"
              placeholder="Status do Produto"
              selectedKeys={[statusFiltro]}
              size="sm"
              variant="bordered"
              onSelectionChange={(keys) => {
                const value = Array.from(keys)[0] as
                  | "todos"
                  | "ativos"
                  | "inativos";

                setStatusFiltro(value);
              }}
            >
              <SelectItem key="ativos">Ativos</SelectItem>
              <SelectItem key="inativos">Inativos</SelectItem>
              <SelectItem key="todos">Todos</SelectItem>
            </Select>
          </div>

          {/* Linha de ações */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-sm font-medium text-default-600">
                {totalRegistros} produto(s) encontrado(s)
              </span>

              {(busca ||
                marcaFiltro !== "todos" ||
                categoriaFiltro !== "todos" ||
                estoqueFiltro !== "todos" ||
                statusFiltro !== "ativos") && (
                <Button
                  color="warning"
                  size="sm"
                  variant="flat"
                  onPress={() => {
                    setBusca("");
                    setMarcaFiltro("todos");
                    setCategoriaFiltro("todos");
                    setEstoqueFiltro("todos");
                    setStatusFiltro("ativos");
                  }}
                >
                  Limpar Filtros
                </Button>
              )}
            </div>

            <div className="flex items-center gap-2">
              {temPermissao("estoque.criar") && (
                <Button
                  color="primary"
                  size="sm"
                  startContent={<PlusIcon className="h-4 w-4" />}
                  onPress={() => {
                    setProdutoSelecionado(null);
                    setModalProduto(true);
                  }}
                >
                  Novo Produto
                </Button>
              )}
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Visualização em Cards */}
      {visualizacao === "cards" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {loading ? (
            <div className="col-span-full text-center py-12">
              <p className="text-default-400">Carregando...</p>
            </div>
          ) : produtos.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-default-400">Nenhum produto encontrado</p>
            </div>
          ) : (
            produtos.map((produto) => (
              <ProdutoCard
                key={produto.id}
                canAdjust={temPermissao("estoque.ajustar")}
                canClonar={temPermissao("estoque.criar")}
                canDelete={temPermissao("estoque.deletar")}
                canEdit={temPermissao("estoque.editar")}
                canFornecedores={temPermissao("fornecedores.visualizar")}
                canHistoricoEstoque={temPermissao("estoque.visualizar")}
                canHistoricoProduto={temPermissao("estoque.visualizar")}
                canRelatorio={temPermissao("relatorios.visualizar")}
                canTransferir={temPermissao("estoque.transferir")}
                produto={produto}
                temVerPrecoCusto={temPermissao("estoque.ver_preco_custo")}
                onAbrirEstoque={abrirModalEstoque}
                onAbrirFornecedores={abrirModalFornecedores}
                onAbrirFotos={abrirModalFotos}
                onAbrirHistoricoEstoque={abrirModalHistorico}
                onAbrirHistoricoProduto={(p) => {
                  setProdutoSelecionado(p);
                  setModalHistoricoProduto(true);
                }}
                onAbrirTransferencia={abrirModalTransferencia}
                onBaixarRelatorio={gerarRelatorioProdutoPDF}
                onClonar={handleClonarProduto}
                onDeletar={handleDeletar}
                onEditar={abrirModalEditar}
                onToggleAtivo={handleToggleAtivo}
              />
            ))
          )}
        </div>
      )}

      {/* Visualização em Tabela */}
      {visualizacao === "tabela" && (
        <Card className="shadow-sm mb-6">
          <CardBody className="p-0 overflow-x-auto">
            <div className="rounded-xl border border-default-200">
              <Table
                removeWrapper
                aria-label="Tabela de produtos"
                classNames={{
                  th: "bg-default-50 text-default-600 text-xs font-semibold uppercase tracking-wider",
                  td: "text-sm",
                }}
              >
                <TableHeader>
                  <TableColumn>PRODUTO</TableColumn>
                  <TableColumn>MARCA</TableColumn>
                  <TableColumn>CATEGORIA</TableColumn>
                  <TableColumn>PREÇO VENDA</TableColumn>
                  <TableColumn>ESTOQUE</TableColumn>
                  <TableColumn>LOJAS</TableColumn>
                  <TableColumn>STATUS</TableColumn>
                  <TableColumn width={60}>AÇÕES</TableColumn>
                </TableHeader>
                <TableBody
                  emptyContent="Nenhum produto encontrado"
                  isLoading={loading}
                  items={produtos}
                  loadingContent="Carregando..."
                >
                  {(produto) => (
                    <TableRow
                      key={produto.id}
                      className="transition-colors hover:bg-default-50"
                    >
                      <TableCell>
                        <div className="min-w-0 max-w-[280px]">
                          <p className="font-medium text-sm">
                            {produto.descricao}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            {produto.codigo_fabricante ? (
                              <span className="text-xs text-default-400 font-mono">
                                {produto.codigo_fabricante}
                              </span>
                            ) : (
                              <span className="text-xs text-default-400 font-mono">
                                #{produto.id.slice(0, 8)}
                              </span>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {produto.marca ? (
                          <div>
                            <p className="text-sm font-medium">
                              {produto.marca}
                            </p>
                            {produto.modelos && (
                              <p className="text-xs text-default-400 mt-0.5">
                                {produto.modelos}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-default-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {produto.categoria ? (
                          <Chip
                            classNames={{ content: "text-xs" }}
                            color="primary"
                            size="sm"
                            variant="flat"
                          >
                            {produto.categoria}
                          </Chip>
                        ) : produto.grupo ? (
                          <Chip
                            classNames={{ content: "text-xs" }}
                            color="secondary"
                            size="sm"
                            variant="flat"
                          >
                            {produto.grupo}
                          </Chip>
                        ) : (
                          <span className="text-default-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {produto.preco_venda ? (
                          <span className="font-medium text-foreground">
                            {formatarMoeda(produto.preco_venda)}
                          </span>
                        ) : (
                          <span className="text-default-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip
                          classNames={{ content: "text-xs font-semibold" }}
                          color={
                            produto.total_estoque > 0 ? "primary" : "danger"
                          }
                          size="sm"
                          variant="flat"
                        >
                          {produto.total_estoque} un
                        </Chip>
                      </TableCell>
                      <TableCell>
                        {produto.estoques_lojas &&
                        produto.estoques_lojas.length > 0 ? (
                          <div className="flex flex-wrap gap-1 max-w-[200px]">
                            {produto.estoques_lojas.map((estoque: any) => (
                              <Chip
                                key={estoque.id_loja}
                                classNames={{ content: "text-xs" }}
                                color={
                                  estoque.quantidade > 0 ? "success" : "danger"
                                }
                                size="sm"
                                variant="dot"
                              >
                                {estoque.loja_nome}: {estoque.quantidade}
                              </Chip>
                            ))}
                          </div>
                        ) : (
                          <span className="text-default-400 text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip
                          classNames={{ content: "text-xs font-semibold" }}
                          color={produto.ativo ? "success" : "danger"}
                          size="sm"
                          variant="flat"
                        >
                          {produto.ativo ? "Ativo" : "Inativo"}
                        </Chip>
                      </TableCell>
                      <TableCell>
                        <Dropdown>
                          <DropdownTrigger>
                            <Button isIconOnly size="sm" variant="light">
                              <EllipsisVerticalIcon className="w-5 h-5" />
                            </Button>
                          </DropdownTrigger>
                          <DropdownMenu
                            aria-label="Ações do produto"
                            onAction={(key) => {
                              switch (key) {
                                case "estoque":
                                  abrirModalEstoque(produto);
                                  break;
                                case "historico-produto":
                                  setProdutoSelecionado(produto);
                                  setModalHistoricoProduto(true);
                                  break;
                                case "historico-estoque":
                                  abrirModalHistorico(produto);
                                  break;
                                case "fotos":
                                  abrirModalFotos(produto);
                                  break;
                                case "editar":
                                  abrirModalEditar(produto);
                                  break;
                                case "clonar":
                                  handleClonarProduto(produto);
                                  break;
                                case "toggle":
                                  handleToggleAtivo(produto);
                                  break;
                                case "deletar":
                                  handleDeletar(produto);
                                  break;
                              }
                            }}
                          >
                            {temPermissao("estoque.ajustar") ? (
                              <DropdownItem
                                key="estoque"
                                startContent={
                                  <BuildingStorefrontIcon className="w-4 h-4" />
                                }
                              >
                                Movimentar Estoque
                              </DropdownItem>
                            ) : null}
                            {temPermissao("estoque.visualizar") ? (
                              <DropdownItem
                                key="historico-produto"
                                startContent={<ClockIcon className="w-4 h-4" />}
                              >
                                Histórico do Produto
                              </DropdownItem>
                            ) : null}
                            {temPermissao("estoque.visualizar") ? (
                              <DropdownItem
                                key="historico-estoque"
                                startContent={<ClockIcon className="w-4 h-4" />}
                              >
                                Histórico de Estoque
                              </DropdownItem>
                            ) : null}
                            <DropdownItem
                              key="fotos"
                              startContent={<PhotoIcon className="w-4 h-4" />}
                            >
                              Gerenciar Fotos
                            </DropdownItem>
                            {temPermissao("estoque.editar") ? (
                              <DropdownItem
                                key="editar"
                                startContent={
                                  <PencilIcon className="w-4 h-4" />
                                }
                              >
                                Editar
                              </DropdownItem>
                            ) : null}
                            {temPermissao("estoque.criar") ? (
                              <DropdownItem
                                key="clonar"
                                color="secondary"
                                startContent={
                                  <DocumentDuplicateIcon className="w-4 h-4" />
                                }
                              >
                                Clonar Produto
                              </DropdownItem>
                            ) : null}
                            {temPermissao("estoque.editar") ? (
                              <DropdownItem
                                key="toggle"
                                startContent={
                                  <ArrowPathIcon className="w-4 h-4" />
                                }
                              >
                                {produto.ativo ? "Desativar" : "Ativar"}
                              </DropdownItem>
                            ) : null}
                            {temPermissao("estoque.deletar") ? (
                              <DropdownItem
                                key="deletar"
                                className="text-danger"
                                color="danger"
                                startContent={<TrashIcon className="w-4 h-4" />}
                              >
                                Excluir
                              </DropdownItem>
                            ) : null}
                          </DropdownMenu>
                        </Dropdown>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Paginação */}
      {totalPaginas > 1 && (
        <div className="flex flex-col items-center gap-4 mb-6">
          <div className="flex items-center gap-4">
            <p className="text-sm text-default-500">
              Mostrando {(paginaAtual - 1) * itensPorPagina + 1} a{" "}
              {Math.min(paginaAtual * itensPorPagina, produtos.length)} de{" "}
              {produtos.length} produto(s)
            </p>
          </div>
          <Pagination
            showControls
            color="primary"
            page={paginaAtual}
            size="lg"
            total={totalPaginas}
            onChange={setPaginaAtual}
          />
        </div>
      )}

      {/* Modals */}
      <ProdutoFormModal
        isOpen={modalProduto}
        produto={produtoSelecionado}
        onClose={() => {
          setModalProduto(false);
          setProdutoSelecionado(null);
        }}
        onSubmit={
          produtoSelecionado?.id ? handleEditarProduto : handleCriarProduto
        }
      />

      {produtoSelecionado && (
        <>
          <EstoqueLojaModal
            estoques={estoquesLoja}
            isOpen={modalEstoque}
            lojas={lojas}
            produtoId={produtoSelecionado.id}
            produtoNome={produtoSelecionado.descricao}
            onClose={() => {
              setModalEstoque(false);
              setProdutoSelecionado(null);
              setEstoquesLoja([]);
            }}
            onSubmit={handleMovimentarEstoque}
          />

          <HistoricoEstoqueModal
            isOpen={modalHistorico}
            produtoId={produtoSelecionado.id}
            produtoNome={produtoSelecionado.descricao}
            onClose={() => {
              setModalHistorico(false);
              setProdutoSelecionado(null);
            }}
          />

          <HistoricoProdutoModal
            isOpen={modalHistoricoProduto}
            produtoId={produtoSelecionado?.id || ""}
            produtoNome={produtoSelecionado?.descricao || ""}
            onClose={() => {
              setModalHistoricoProduto(false);
              setProdutoSelecionado(null);
            }}
          />

          <GerenciarFotosProdutoModal
            isOpen={modalFotos}
            produtoId={produtoSelecionado.id}
            produtoNome={produtoSelecionado.descricao}
            onClose={() => {
              setModalFotos(false);
              setProdutoSelecionado(null);
            }}
            onDeleteFoto={deletarFotoProduto}
            onLoadFotos={getFotosProduto}
            onSetPrincipal={(fotoId: string) =>
              definirFotoPrincipal(fotoId, produtoSelecionado.id)
            }
            onUploadFoto={async (file: File, isPrincipal: boolean) => {
              if (!user) return;
              await uploadFotoProduto(
                produtoSelecionado.id,
                file,
                user.id,
                isPrincipal,
              );
            }}
          />
        </>
      )}

      {/* Modal Gerenciar Fornecedores */}
      {produtoSelecionado && (
        <GerenciarFornecedoresProdutoModal
          isOpen={modalFornecedores}
          produto={produtoSelecionado}
          onClose={() => {
            setModalFornecedores(false);
            setProdutoSelecionado(null);
          }}
        />
      )}

      {/* Modal Transferência entre Lojas */}
      {produtoSelecionado && (
        <TransferenciaModal
          isOpen={modalTransferencia}
          produto={produtoSelecionado}
          onClose={() => {
            setModalTransferencia(false);
            setProdutoSelecionado(null);
          }}
          onSuccess={() => {
            carregarProdutos();
            setModalTransferencia(false);
            setProdutoSelecionado(null);
          }}
        />
      )}

      {/* Confirm Modal */}
      <ConfirmModal
        cancelText="Cancelar"
        confirmColor={confirmModal.confirmColor}
        confirmText="Confirmar"
        isOpen={confirmModal.isOpen}
        message={confirmModal.message}
        title={confirmModal.title}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmModal.onConfirm}
      />

      {/* Toast Component */}
      {toast.ToastComponent}
    </div>
  );
}
