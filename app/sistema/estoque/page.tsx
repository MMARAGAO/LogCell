"use client";

import { useState, useEffect } from "react";
import { Card, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { Autocomplete, AutocompleteItem } from "@heroui/autocomplete";
import { Chip } from "@heroui/chip";
import { Divider } from "@heroui/divider";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@heroui/table";
import { Pagination } from "@heroui/pagination";
import { Tabs, Tab } from "@heroui/tabs";
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
  TruckIcon,
  DocumentArrowDownIcon,
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
  getProdutos,
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
  getProdutosComEstoque,
} from "@/services/estoqueService";
import { getHistoricoProduto } from "@/services/historicoEstoqueService";
import {
  getFotosProduto,
  uploadFotoProduto,
  deletarFotoProduto,
  definirFotoPrincipal,
} from "@/services/fotosProdutosService";
import { LojasService } from "@/services/lojasService";
import MiniCarrossel from "@/components/MiniCarrossel";
import { useFotosProduto } from "@/hooks/useFotosProduto";
import { formatarMoeda, formatarPorcentagem } from "@/lib/formatters";
import { exportarEstoqueParaExcel } from "@/lib/exportarExcel";
import { gerarRelatorioProdutoPDF } from "@/lib/exportarPDF";

// Componente auxiliar para o card de produto com fotos
function ProdutoCard({
  produto,
  onAbrirEstoque,
  onAbrirHistoricoProduto,
  onAbrirHistoricoEstoque,
  onAbrirFotos,
  onAbrirFornecedores,
  onAbrirTransferencia,
  onEditar,
  onClonar,
  onDeletar,
  onToggleAtivo,
  onBaixarRelatorio,
  canEdit,
  canDelete,
  canAdjust,
  temVerPrecoCusto,
}: {
  produto: any;
  onAbrirEstoque: (produto: any) => void;
  onAbrirHistoricoProduto: (produto: any) => void;
  onAbrirHistoricoEstoque: (produto: any) => void;
  onAbrirFotos: (produto: any) => void;
  onAbrirFornecedores: (produto: any) => void;
  onAbrirTransferencia: (produto: any) => void;
  onEditar: (produto: any) => void;
  onClonar: (produto: any) => void;
  onDeletar: (produto: any) => void;
  onToggleAtivo: (produto: any) => void;
  onBaixarRelatorio: (produto: any) => void;
  canEdit: boolean;
  canDelete: boolean;
  canAdjust: boolean;
  temVerPrecoCusto: boolean;
}) {
  const { fotos, loading: loadingFotos } = useFotosProduto(produto.id);

  const getMenuItems = () => {
    const items = [];

    // Editar
    if (canEdit) {
      items.push(
        <DropdownItem
          key="editar"
          startContent={<PencilIcon className="w-4 h-4" />}
          onPress={() => onEditar(produto)}
        >
          Editar Produto
        </DropdownItem>,
      );
    }

    // Clonar (sempre disponível)
    items.push(
      <DropdownItem
        key="clonar"
        color="secondary"
        startContent={<DocumentDuplicateIcon className="w-4 h-4" />}
        onPress={() => onClonar(produto)}
      >
        Clonar Produto
      </DropdownItem>,
    );

    // Baixar Relatório (sempre disponível)
    items.push(
      <DropdownItem
        key="relatorio"
        color="success"
        startContent={<DocumentArrowDownIcon className="w-4 h-4" />}
        onPress={() => onBaixarRelatorio(produto)}
      >
        Baixar Relatório PDF
      </DropdownItem>,
    );

    // Históricos (sempre disponível)
    items.push(
      <DropdownItem
        key="historico-produto"
        startContent={<ClockIcon className="w-4 h-4" />}
        onPress={() => onAbrirHistoricoProduto(produto)}
      >
        Histórico do Produto
      </DropdownItem>,
      <DropdownItem
        key="historico-estoque"
        startContent={<ArrowPathIcon className="w-4 h-4" />}
        onPress={() => onAbrirHistoricoEstoque(produto)}
      >
        Histórico de Movimentações
      </DropdownItem>,
    );

    // Fornecedores (sempre disponível)
    items.push(
      <DropdownItem
        key="fornecedores"
        color="secondary"
        startContent={<TruckIcon className="w-4 h-4" />}
        onPress={() => onAbrirFornecedores(produto)}
      >
        Gerenciar Fornecedores
      </DropdownItem>,
    );

    // Transferir entre lojas
    items.push(
      <DropdownItem
        key="transferir"
        color="primary"
        startContent={<ArrowPathIcon className="w-4 h-4" />}
        onPress={() => onAbrirTransferencia(produto)}
      >
        Transferir entre Lojas
      </DropdownItem>,
    );

    // Toggle Ativo (apenas com permissão de editar)
    if (canEdit) {
      items.push(
        <DropdownItem
          key="toggle-ativo"
          color={produto.ativo ? "warning" : "success"}
          startContent={<ArrowPathIcon className="w-4 h-4" />}
          onPress={() => onToggleAtivo(produto)}
        >
          {produto.ativo ? "Desativar Produto" : "Ativar Produto"}
        </DropdownItem>,
      );
    }

    // Deletar
    if (canDelete) {
      items.push(
        <DropdownItem
          key="deletar"
          className="text-danger"
          color="danger"
          startContent={<TrashIcon className="w-4 h-4" />}
          onPress={() => onDeletar(produto)}
        >
          Excluir Produto
        </DropdownItem>,
      );
    }

    return items;
  };

  return (
    <Card className="shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
      {/* Carrossel de Fotos - Reduzido */}
      <div className="relative">
        {loadingFotos ? (
          <div className="bg-default-100 flex items-center justify-center h-48">
            <div className="text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2" />
              <p className="text-xs text-default-400">Carregando...</p>
            </div>
          </div>
        ) : (
          <div className="h-48 overflow-hidden">
            <MiniCarrossel
              alt={produto.descricao}
              aspectRatio="video"
              images={fotos}
              showControls={fotos.length > 1}
            />
          </div>
        )}

        {/* Badge de Status */}
        <div className="absolute top-2 left-2 z-20">
          <Chip
            color={produto.ativo ? "success" : "danger"}
            size="sm"
            variant="shadow"
          >
            {produto.ativo ? "Ativo" : "Inativo"}
          </Chip>
        </div>

        {/* Estoque Total - Badge no canto superior direito */}
        <div className="absolute top-2 right-2 z-20">
          <Chip
            className="font-bold"
            color={
              (produto.total_estoque || 0) > (produto.quantidade_minima || 0)
                ? "primary"
                : "danger"
            }
            size="md"
            variant="shadow"
          >
            {produto.total_estoque || 0} un
          </Chip>
        </div>
      </div>

      {/* Informações do Produto - Compacto */}
      <CardBody className="p-3">
        {/* Título e ID */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1">
            <h3 className="font-bold text-base text-default-900 line-clamp-2">
              {produto.descricao}
            </h3>
            <p className="text-xs text-default-400 font-mono mt-1">
              #{produto.id.slice(0, 8)}
            </p>
          </div>
        </div>

        {/* Grid de Informações Compacto */}
        <div className="grid grid-cols-2 gap-x-3 gap-y-1 mb-2 text-xs">
          {produto.marca && (
            <>
              <span className="text-default-500 font-medium">Marca:</span>
              <span className="text-default-700 truncate">{produto.marca}</span>
            </>
          )}
          {produto.categoria && (
            <>
              <span className="text-default-500 font-medium">Categoria:</span>
              <span className="text-default-700 truncate">
                {produto.categoria}
              </span>
            </>
          )}
          {produto.codigo_fabricante && (
            <>
              <span className="text-default-500 font-medium">Código:</span>
              <span className="text-default-700 font-mono truncate">
                {produto.codigo_fabricante}
              </span>
            </>
          )}
        </div>

        {/* Preços - Linha Única */}
        <div className="flex gap-2 mb-2">
          {temVerPrecoCusto && produto.preco_compra && (
            <div className="flex-1 bg-warning-50 dark:bg-warning-900/20 rounded-md p-2">
              <p className="text-[10px] text-warning-600 dark:text-warning-400 font-medium">
                Compra
              </p>
              <p className="text-sm font-bold text-warning-700 dark:text-warning-300">
                {formatarMoeda(produto.preco_compra)}
              </p>
            </div>
          )}
          {produto.preco_venda && (
            <div className="flex-1 bg-success-50 dark:bg-success-900/20 rounded-md p-2">
              <p className="text-[10px] text-success-600 dark:text-success-400 font-medium">
                Venda
              </p>
              <p className="text-sm font-bold text-success-700 dark:text-success-300">
                {formatarMoeda(produto.preco_venda)}
              </p>
            </div>
          )}
          {temVerPrecoCusto && produto.preco_compra && produto.preco_venda && (
            <div className="flex items-center justify-center bg-primary-50 dark:bg-primary-900/20 rounded-md px-2">
              <Chip
                color={
                  ((produto.preco_venda - produto.preco_compra) /
                    produto.preco_compra) *
                    100 >
                  30
                    ? "success"
                    : ((produto.preco_venda - produto.preco_compra) /
                          produto.preco_compra) *
                          100 >
                        15
                      ? "warning"
                      : "danger"
                }
                size="sm"
                variant="flat"
              >
                {formatarPorcentagem(
                  ((produto.preco_venda - produto.preco_compra) /
                    produto.preco_compra) *
                    100,
                  0,
                )}
              </Chip>
            </div>
          )}
        </div>

        {/* Estoque por Loja - Compacto */}
        {produto.estoques_lojas && produto.estoques_lojas.length > 0 && (
          <div className="border-t border-default-200 pt-2">
            <div className="flex flex-wrap gap-1">
              {produto.estoques_lojas.map((estoque: any) => (
                <div
                  key={estoque.id_loja}
                  className="flex items-center gap-1 bg-default-100 dark:bg-default-100/10 rounded px-2 py-0.5"
                >
                  <span className="text-[10px] text-default-600 truncate max-w-[60px]">
                    {estoque.loja_nome}
                  </span>
                  <Chip
                    className="h-4 min-w-[30px] text-[10px]"
                    color={estoque.quantidade > 0 ? "primary" : "danger"}
                    size="sm"
                    variant="flat"
                  >
                    {estoque.quantidade}
                  </Chip>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardBody>

      {/* Footer com Ações - Compacto */}
      <Divider />
      <CardBody className="p-2 bg-default-50/50 dark:bg-default-100/5">
        <div className="flex gap-1.5">
          {/* Botão Principal */}
          <Button
            className="flex-1 font-semibold"
            color="primary"
            size="sm"
            startContent={<BuildingStorefrontIcon className="w-4 h-4" />}
            variant="solid"
            onPress={() => onAbrirEstoque(produto)}
          >
            Estoque
          </Button>

          {/* Botão Fotos */}
          <Button
            isIconOnly
            color="default"
            size="sm"
            variant="flat"
            onPress={() => onAbrirFotos(produto)}
          >
            <PhotoIcon className="w-4 h-4" />
          </Button>

          {/* Dropdown */}
          <Dropdown>
            <DropdownTrigger>
              <Button isIconOnly size="sm" variant="flat">
                <EllipsisVerticalIcon className="w-4 h-4" />
              </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="Ações do produto">
              {getMenuItems()}
            </DropdownMenu>
          </Dropdown>
        </div>
      </CardBody>
    </Card>
  );
}

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

  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [produtosComEstoque, setProdutosComEstoque] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [statusFiltro, setStatusFiltro] = useState<
    "todos" | "ativos" | "inativos"
  >("ativos");
  const [marcaFiltro, setMarcaFiltro] = useState<string>("todos");
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>("todos");
  const [estoqueFiltro, setEstoqueFiltro] = useState<string>("todos");

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
      carregarDados();
      carregarLojas();
      carregarProdutosComEstoque();
    }
  }, [loadingPermissoes, lojaId, podeVerTodasLojas]);

  const carregarProdutosComEstoque = async () => {
    setLoading(true);
    try {
      let dados = await getProdutosComEstoque();

      // Filtrar produtos por loja se usuário não tiver acesso a todas
      if (lojaId !== null && !podeVerTodasLojas) {
        console.log(`🏪 Filtrando estoque da loja ${lojaId}`);
        dados = dados.map((produto) => {
          // Manter apenas o estoque da loja do usuário
          const estoquesFiltrados =
            produto.estoques?.filter((e: any) => e.id_loja === lojaId) || [];

          return {
            ...produto,
            estoques: estoquesFiltrados,
            estoque_total: estoquesFiltrados.reduce(
              (sum: number, e: any) => sum + (e.quantidade || 0),
              0,
            ),
          };
        });
      }

      setProdutosComEstoque(dados);
    } catch (error) {
      console.error("Erro ao carregar produtos com estoque:", error);
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
    }
  };

  const carregarProdutos = async () => {
    setLoading(true);
    try {
      const filtros: any = {
        busca: busca || undefined,
      };

      if (statusFiltro === "ativos") {
        filtros.ativo = true;
      } else if (statusFiltro === "inativos") {
        filtros.ativo = false;
      }

      const dados = await getProdutos(filtros);

      setProdutos(dados);
    } catch (error) {
      console.error("Erro ao carregar produtos:", error);
    } finally {
      setLoading(false);
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
      await carregarProdutosComEstoque();
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
        carregarProdutosComEstoque(),
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
          await carregarProdutosComEstoque();
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
          await carregarProdutosComEstoque();
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
      await carregarProdutosComEstoque();
      toast.success("Estoque atualizado com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar estoque:", error);
      toast.error("Erro ao atualizar estoque.");
    }
  };

  const abrirModalEstoque = async (produto: Produto) => {
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
    setProdutoSelecionado(produto);
    setModalFornecedores(true);
  };

  const abrirModalTransferencia = (produto: Produto) => {
    setProdutoSelecionado(produto);
    setModalTransferencia(true);
  };

  const abrirModalEditar = (produto: Produto) => {
    setProdutoSelecionado(produto);
    setModalProduto(true);
  };

  const handleClonarProduto = (produto: Produto) => {
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

  // Filtrar produtos com estoque
  const produtosFiltrados = produtosComEstoque.filter((produto) => {
    // Filtro de busca com suporte a texto quebrado
    if (busca) {
      const buscaLower = busca.toLowerCase().trim();

      // Dividir a busca em palavras (ex: "i 16 max" -> ["i", "16", "max"])
      const palavrasBusca = buscaLower.split(/\s+/).filter((p) => p.length > 0);

      // Concatenar todos os campos pesquisáveis em uma string
      const textoPesquisavel = [
        produto.descricao || "",
        produto.marca || "",
        produto.modelos || "",
      ]
        .join(" ")
        .toLowerCase();

      // Verificar se TODAS as palavras da busca aparecem no texto
      // (não precisa estar em ordem ou consecutivas)
      const todasPalavrasEncontradas = palavrasBusca.every((palavra) =>
        textoPesquisavel.includes(palavra),
      );

      if (!todasPalavrasEncontradas) return false;
    }

    // Filtro de status
    if (statusFiltro === "ativos" && !produto.ativo) return false;
    if (statusFiltro === "inativos" && produto.ativo) return false;

    // Filtro de marca
    if (marcaFiltro !== "todos" && produto.marca !== marcaFiltro) return false;

    // Filtro de categoria
    if (categoriaFiltro !== "todos" && produto.categoria !== categoriaFiltro)
      return false;

    // Filtro de estoque
    if (
      estoqueFiltro === "baixo" &&
      produto.quantidade_total >= produto.quantidade_minima
    )
      return false;
    if (estoqueFiltro === "sem" && produto.quantidade_total > 0) return false;
    if (
      estoqueFiltro === "adequado" &&
      produto.quantidade_total < produto.quantidade_minima
    )
      return false;

    return true;
  });

  // Extrair listas únicas para os filtros
  const marcasUnicas = Array.from(
    new Set(produtosComEstoque.map((p) => p.marca).filter(Boolean)),
  ).sort();
  const categoriasUnicas = Array.from(
    new Set(produtosComEstoque.map((p) => p.categoria).filter(Boolean)),
  ).sort();

  // Transformar em formato esperado pelo Autocomplete
  const marcasItems = [
    { key: "todos", label: "Todas as Marcas" },
    ...marcasUnicas.map((marca) => ({ key: marca, label: marca })),
  ];

  const categoriasItems = [
    { key: "todos", label: "Todas as Categorias" },
    ...categoriasUnicas.map((categoria) => ({
      key: categoria,
      label: categoria,
    })),
  ];

  // Paginação
  const totalPaginas = Math.ceil(produtosFiltrados.length / itensPorPagina);
  const produtosPaginados = produtosFiltrados.slice(
    (paginaAtual - 1) * itensPorPagina,
    paginaAtual * itensPorPagina,
  );

  // Resetar página ao filtrar
  useEffect(() => {
    setPaginaAtual(1);
  }, [busca, statusFiltro, marcaFiltro, categoriaFiltro, estoqueFiltro]);

  // Verificar permissão de visualizar
  if (!loadingPermissoes && !temPermissao("estoque.visualizar")) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold text-danger mb-4">Acesso Negado</h1>
        <p className="text-default-500">
          Você não tem permissão para visualizar o estoque.
        </p>
      </div>
    );
  }

  if (loading || loadingPermissoes) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div>Carregando...</div>
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
          {/* Linha 1: Cards Financeiros Principais */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: TOTAL DE ITENS EM ESTOQUE - DESTAQUE */}
            <Card className="shadow-md hover:shadow-xl transition-shadow border-2 border-primary/20">
              <CardBody className="flex flex-col items-center justify-center gap-2 py-4">
                <div className="p-3 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl">
                  <CubeIcon className="w-8 h-8 text-primary" />
                </div>
                <div className="text-center">
                  <p className="text-xs text-default-500 uppercase tracking-wide font-semibold">
                    Total de Itens
                  </p>
                  <p className="text-4xl font-black text-primary mt-1">
                    {statsFinanceiras.quantidadeTotal.toLocaleString("pt-BR")}
                  </p>
                  <p className="text-xs text-default-400 mt-1">
                    unidades em estoque
                  </p>
                </div>
              </CardBody>
            </Card>

            {/* Card 2: Total em Estoque (Valor de Venda) */}
            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <CardBody className="flex flex-row items-center gap-4">
                <div className="p-3 bg-success/10 rounded-xl">
                  <CurrencyDollarIcon className="w-6 h-6 text-success" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-default-500">Valor em Estoque</p>
                  <p className="text-2xl font-bold text-success">
                    {formatarMoeda(statsFinanceiras.valorEstoqueVenda)}
                  </p>
                  <p className="text-xs text-default-400 mt-1">
                    valor de venda
                  </p>
                </div>
              </CardBody>
            </Card>

            {/* Card 3: Custo do Estoque */}
            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <CardBody className="flex flex-row items-center gap-4">
                <div className="p-3 bg-warning/10 rounded-xl">
                  <ShoppingCartIcon className="w-6 h-6 text-warning" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-default-500">Custo do Estoque</p>
                  <p className="text-2xl font-bold text-warning">
                    {formatarMoeda(statsFinanceiras.valorEstoqueCompra)}
                  </p>
                  <p className="text-xs text-default-400 mt-1">
                    Margem: {formatarPorcentagem(statsFinanceiras.margemLucro)}
                  </p>
                </div>
              </CardBody>
            </Card>

            {/* Card 4: Produtos Ativos */}
            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <CardBody className="flex flex-row items-center gap-4">
                <div className="p-3 bg-secondary/10 rounded-xl">
                  <ChartBarIcon className="w-6 h-6 text-secondary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-default-500">Produtos Ativos</p>
                  <p className="text-2xl font-bold text-secondary">
                    {stats.ativos}
                  </p>
                  <p className="text-xs text-default-400 mt-1">
                    Total: {stats.total} produtos
                  </p>
                </div>
              </CardBody>
            </Card>

            {/* Card 5: Alertas */}
            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <CardBody className="flex flex-row items-center gap-4">
                <div className="p-3 bg-danger/10 rounded-xl">
                  <ExclamationTriangleIcon className="w-6 h-6 text-danger" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-default-500">Alertas</p>
                  <p className="text-2xl font-bold text-danger">
                    {statsFinanceiras.produtosSemEstoque}
                  </p>
                  <p className="text-xs text-default-400 mt-1">
                    {statsFinanceiras.produtosEstoqueBaixo} em estoque baixo
                  </p>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Linha 2: Cards de Valor Total */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Card: Valor Total de Venda */}
            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <CardBody>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-sm text-default-500">
                      Valor Total de Venda
                    </p>
                    <p className="text-xs text-default-400">
                      Soma de todos os preços de venda
                    </p>
                  </div>
                  <div className="p-2 bg-success/10 rounded-lg">
                    <CurrencyDollarIcon className="w-5 h-5 text-success" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-success">
                  {formatarMoeda(statsFinanceiras.valorTotalVenda)}
                </p>
              </CardBody>
            </Card>

            {/* Card: Valor Total de Compra */}
            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <CardBody>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-sm text-default-500">
                      Valor Total de Compra
                    </p>
                    <p className="text-xs text-default-400">
                      Soma de todos os preços de compra
                    </p>
                  </div>
                  <div className="p-2 bg-warning/10 rounded-lg">
                    <ShoppingCartIcon className="w-5 h-5 text-warning" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-warning">
                  {formatarMoeda(statsFinanceiras.valorTotalCompra)}
                </p>
              </CardBody>
            </Card>
          </div>
        </div>
      )}

      {/* Filtros e Ações */}
      <Card className="shadow-sm mb-6">
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            {/* Busca */}
            <Input
              className="lg:col-span-2"
              placeholder="Buscar produtos..."
              startContent={
                <MagnifyingGlassIcon className="w-5 h-5 text-default-400" />
              }
              value={busca}
              variant="bordered"
              onValueChange={setBusca}
            />

            {/* Marca */}
            <Autocomplete
              allowsCustomValue={false}
              aria-label="Filtro de marca"
              items={marcasItems}
              placeholder="Marca"
              selectedKey={marcaFiltro}
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
              placeholder="Estoque"
              selectedKeys={[estoqueFiltro]}
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
              placeholder="Status"
              selectedKeys={[statusFiltro]}
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

          {/* Segunda linha: Botões de ação */}
          <div className="flex flex-wrap items-center justify-between gap-4 mt-4">
            <div className="flex items-center gap-4 flex-wrap">
              <span className="text-sm font-medium text-default-700">
                {produtosFiltrados.length} produto(s) encontrado(s)
              </span>

              {/* Botão Limpar Filtros */}
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

            <div className="flex gap-2">
              {/* Botão Exportar Excel */}
              <Button
                color="success"
                isDisabled={produtosFiltrados.length === 0}
                startContent={<DocumentArrowDownIcon className="w-5 h-5" />}
                variant="flat"
                onPress={() =>
                  exportarEstoqueParaExcel(produtosFiltrados, "estoque")
                }
              >
                Exportar Excel
              </Button>

              {/* Botão Novo Produto */}
              {temPermissao("estoque.criar") && (
                <Button
                  color="primary"
                  startContent={<PlusIcon className="w-5 h-5" />}
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

          {/* Tabs de Visualização */}
          <div className="mt-4">
            <Tabs
              color="primary"
              selectedKey={visualizacao}
              onSelectionChange={(key) =>
                setVisualizacao(key as "tabela" | "cards")
              }
            >
              <Tab key="cards" title="Cards" />
              <Tab key="tabela" title="Tabela" />
            </Tabs>
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
          ) : produtosPaginados.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-default-400">Nenhum produto encontrado</p>
            </div>
          ) : (
            produtosPaginados.map((produto) => (
              <ProdutoCard
                key={produto.id}
                canAdjust={temPermissao("estoque.ajustar")}
                canDelete={temPermissao("estoque.deletar")}
                canEdit={temPermissao("estoque.editar")}
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
          <CardBody className="p-0">
            <Table
              removeWrapper
              aria-label="Tabela de produtos"
              classNames={{
                th: "bg-default-100 text-default-700",
              }}
            >
              <TableHeader>
                <TableColumn>PRODUTO</TableColumn>
                <TableColumn>MARCA</TableColumn>
                <TableColumn>MODELOS</TableColumn>
                <TableColumn>PREÇO COMPRA</TableColumn>
                <TableColumn>PREÇO VENDA</TableColumn>
                <TableColumn>ESTOQUE TOTAL</TableColumn>
                <TableColumn>LOJAS</TableColumn>
                <TableColumn>STATUS</TableColumn>
                <TableColumn width={50}>AÇÕES</TableColumn>
              </TableHeader>
              <TableBody
                emptyContent="Nenhum produto encontrado"
                isLoading={loading}
                items={produtosPaginados}
                loadingContent="Carregando..."
              >
                {(produto) => (
                  <TableRow key={produto.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{produto.descricao}</p>
                        <p className="text-xs text-default-400 font-mono mt-1">
                          #{produto.id.slice(0, 8)}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {produto.marca ? (
                        <span>{produto.marca}</span>
                      ) : (
                        <span className="text-default-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {produto.modelos ? (
                        <span className="text-sm">{produto.modelos}</span>
                      ) : (
                        <span className="text-default-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {temPermissao("estoque.ver_preco_custo") ? (
                        produto.preco_compra ? (
                          <span className="font-medium text-warning-700">
                            {formatarMoeda(produto.preco_compra)}
                          </span>
                        ) : (
                          <span className="text-default-400">-</span>
                        )
                      ) : (
                        <span className="text-default-400">***</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {produto.preco_venda ? (
                        <span className="font-medium">
                          {formatarMoeda(produto.preco_venda)}
                        </span>
                      ) : (
                        <span className="text-default-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        color={produto.total_estoque > 0 ? "primary" : "danger"}
                        size="sm"
                        variant="flat"
                      >
                        {produto.total_estoque} un
                      </Chip>
                    </TableCell>
                    <TableCell>
                      {produto.estoques_lojas &&
                      produto.estoques_lojas.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {produto.estoques_lojas.map((estoque: any) => (
                            <Chip
                              key={estoque.id_loja}
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
                        <DropdownMenu aria-label="Ações do produto">
                          <DropdownItem
                            key="estoque"
                            startContent={
                              <BuildingStorefrontIcon className="w-4 h-4" />
                            }
                            onPress={() => abrirModalEstoque(produto)}
                          >
                            Movimentar Estoque
                          </DropdownItem>
                          <DropdownItem
                            key="historico-produto"
                            startContent={<ClockIcon className="w-4 h-4" />}
                            onPress={() => {
                              setProdutoSelecionado(produto);
                              setModalHistoricoProduto(true);
                            }}
                          >
                            Histórico do Produto
                          </DropdownItem>
                          <DropdownItem
                            key="historico-estoque"
                            startContent={<ClockIcon className="w-4 h-4" />}
                            onPress={() => abrirModalHistorico(produto)}
                          >
                            Histórico de Estoque
                          </DropdownItem>
                          <DropdownItem
                            key="fotos"
                            startContent={<PhotoIcon className="w-4 h-4" />}
                            onPress={() => abrirModalFotos(produto)}
                          >
                            Gerenciar Fotos
                          </DropdownItem>
                          <DropdownItem
                            key="editar"
                            startContent={<PencilIcon className="w-4 h-4" />}
                            onPress={() => abrirModalEditar(produto)}
                          >
                            Editar
                          </DropdownItem>
                          <DropdownItem
                            key="clonar"
                            color="secondary"
                            startContent={
                              <DocumentDuplicateIcon className="w-4 h-4" />
                            }
                            onPress={() => handleClonarProduto(produto)}
                          >
                            Clonar Produto
                          </DropdownItem>
                          <DropdownItem
                            key="toggle"
                            startContent={<ArrowPathIcon className="w-4 h-4" />}
                            onPress={() => handleToggleAtivo(produto)}
                          >
                            {produto.ativo ? "Desativar" : "Ativar"}
                          </DropdownItem>
                          <DropdownItem
                            key="deletar"
                            className="text-danger"
                            color="danger"
                            startContent={<TrashIcon className="w-4 h-4" />}
                            onPress={() => handleDeletar(produto)}
                          >
                            Excluir
                          </DropdownItem>
                        </DropdownMenu>
                      </Dropdown>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardBody>
        </Card>
      )}

      {/* Paginação */}
      {totalPaginas > 1 && (
        <div className="flex flex-col items-center gap-4 mb-6">
          <div className="flex items-center gap-4">
            <p className="text-sm text-default-500">
              Mostrando {(paginaAtual - 1) * itensPorPagina + 1} a{" "}
              {Math.min(paginaAtual * itensPorPagina, produtosFiltrados.length)}{" "}
              de {produtosFiltrados.length} produto(s)
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
            onLoadHistorico={getHistoricoProduto}
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
