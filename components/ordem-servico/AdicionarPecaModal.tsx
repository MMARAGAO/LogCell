"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Select,
  SelectItem,
  Autocomplete,
  AutocompleteItem,
  Divider,
  Chip,
  Card,
  CardBody,
  CardFooter,
  Pagination,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@heroui/react";
import {
  PackagePlus,
  Package,
  Store,
  ShoppingBag,
  Search,
  Tag,
  Box,
  TrendingUp,
  Edit,
  Trash2,
} from "lucide-react";
import { useToast } from "@/components/Toast";
import {
  adicionarPecaOS,
  removerPecaOS,
  substituirPecaOS,
} from "@/services/ordemServicoService";
import { useAuth } from "@/hooks/useAuth";

interface AdicionarPecaModalProps {
  isOpen: boolean;
  onClose: () => void;
  idOrdemServico: string;
  idLoja: number;
  onSuccess?: () => void;
}

interface ProdutoEstoque {
  id: string;
  descricao: string;
  marca?: string;
  categoria?: string;
  preco_compra: number;
  preco_venda: number;
  quantidade: number;
  loja_id: number;
  loja_nome: string;
}

interface PecaOS {
  id: string;
  id_produto?: string | null;
  id_loja?: number | null;
  tipo_produto: "estoque" | "avulso";
  descricao_peca?: string | null;
  quantidade: number;
  valor_custo: number;
  valor_venda: number;
  produtos?: {
    descricao: string;
    marca?: string;
    categoria?: string;
  } | null;
}

export default function AdicionarPecaModal({
  isOpen,
  onClose,
  idOrdemServico,
  idLoja,
  onSuccess,
}: AdicionarPecaModalProps) {
  const { usuario } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [produtosEstoque, setProdutosEstoque] = useState<ProdutoEstoque[]>([]);
  const [loadingProdutos, setLoadingProdutos] = useState(false);
  const [buscaProduto, setBuscaProduto] = useState("");

  const [pecas, setPecas] = useState<PecaOS[]>([]);
  const [loadingPecas, setLoadingPecas] = useState(false);
  const [pecaEditando, setPecaEditando] = useState<PecaOS | null>(null);

  // Paginação
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [totalProdutos, setTotalProdutos] = useState(0);
  const itensPorPagina = 10;

  const [tipoPeca, setTipoPeca] = useState<"estoque" | "avulso">("estoque");
  const [idProdutoSelecionado, setIdProdutoSelecionado] = useState<
    string | null
  >(null);
  const [produtoSelecionado, setProdutoSelecionado] =
    useState<ProdutoEstoque | null>(null);
  const [quantidadePeca, setQuantidadePeca] = useState<string>("1");
  const [descricaoPecaAvulsa, setDescricaoPecaAvulsa] = useState("");
  const [valorCustoAvulso, setValorCustoAvulso] = useState<string>("");
  const [valorVendaAvulso, setValorVendaAvulso] = useState<string>("");
  const [quantidadeAvulsa, setQuantidadeAvulsa] = useState<string>("1");

  // Estados para valores editáveis do produto de estoque
  const [valorCustoEstoque, setValorCustoEstoque] = useState<string>("");
  const [valorVendaEstoque, setValorVendaEstoque] = useState<string>("");

  useEffect(() => {
    if (isOpen && tipoPeca === "estoque") {
      setPaginaAtual(1);
      carregarProdutosEstoque(idLoja, 1, "");
    }
  }, [isOpen, tipoPeca, idLoja]);

  useEffect(() => {
    if (isOpen && tipoPeca === "estoque") {
      const timeoutId = setTimeout(() => {
        setPaginaAtual(1);
        carregarProdutosEstoque(idLoja, 1, buscaProduto);
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [buscaProduto]);

  useEffect(() => {
    if (isOpen) {
      carregarPecasOS();
    } else {
      setPecaEditando(null);
    }
  }, [isOpen]);

  const carregarProdutosEstoque = async (
    lojaId: number,
    pagina: number = 1,
    termoBusca: string = ""
  ) => {
    setLoadingProdutos(true);
    try {
      const { supabase } = await import("@/lib/supabaseClient");

      // Se houver busca, buscar mais produtos para filtrar no cliente
      // Caso contrário, usar paginação normal
      const limiteBusca = termoBusca.trim() ? 1000 : itensPorPagina;
      const inicioBusca = termoBusca.trim() ? 0 : (pagina - 1) * itensPorPagina;
      const fimBusca = termoBusca.trim() ? limiteBusca - 1 : inicioBusca + itensPorPagina - 1;

      // Construir query principal do estoque
      const { data, error, count } = await supabase
        .from("estoque_lojas")
        .select(
          `
          id,
          quantidade,
          produtos:id_produto (
            id,
            descricao,
            marca,
            categoria,
            preco_compra,
            preco_venda
          ),
          lojas:id_loja (
            id,
            nome
          )
        `,
          { count: "exact" }
        )
        .eq("id_loja", lojaId)
        .gt("quantidade", 0)
        .range(inicioBusca, fimBusca);

      if (error) throw error;

      // Formatar produtos
      let produtosFormatados: ProdutoEstoque[] = (data || []).map(
        (item: any) => {
          const produto = Array.isArray(item.produtos)
            ? item.produtos[0]
            : item.produtos;
          const loja = Array.isArray(item.lojas) ? item.lojas[0] : item.lojas;

          return {
            id: produto.id,
            descricao: produto.descricao,
            marca: produto.marca,
            categoria: produto.categoria,
            preco_compra: produto.preco_compra || 0,
            preco_venda: produto.preco_venda || 0,
            quantidade: item.quantidade,
            loja_id: loja.id,
            loja_nome: loja.nome,
          };
        }
      );

      // Se houver busca, filtrar no cliente
      if (termoBusca.trim()) {
        // Separar termos de busca e converter para lowercase
        const termos = termoBusca
          .toLowerCase()
          .split(/\s+/)
          .filter((t) => t.length > 0);

        // Filtrar produtos onde TODOS os termos apareçam em algum lugar
        const produtosFiltrados = produtosFormatados.filter((p) => {
          const textoCompleto = `${p.descricao || ""} ${p.marca || ""} ${p.categoria || ""}`.toLowerCase();
          
          // Verificar se todos os termos estão presentes no texto completo
          return termos.every((termo) => textoCompleto.includes(termo));
        });

        // Aplicar paginação local
        const inicio = (pagina - 1) * itensPorPagina;
        const fim = inicio + itensPorPagina;
        
        setTotalProdutos(produtosFiltrados.length);
        setProdutosEstoque(produtosFiltrados.slice(inicio, fim));
      } else {
        setTotalProdutos(count || 0);
        setProdutosEstoque(produtosFormatados);
      }
    } catch (error) {
      console.error("Erro ao carregar produtos:", error);
      toast.showToast("Erro ao carregar produtos do estoque", "error");
      setProdutosEstoque([]);
    } finally {
      setLoadingProdutos(false);
    }
  };

  const carregarPecasOS = async () => {
    setLoadingPecas(true);
    try {
      const { supabase } = await import("@/lib/supabaseClient");
      const { data, error } = await supabase
        .from("ordem_servico_pecas")
        .select(
          `
          id,
          id_produto,
          id_loja,
          tipo_produto,
          descricao_peca,
          quantidade,
          valor_custo,
          valor_venda,
          produtos:id_produto(descricao, marca, categoria)
        `
        )
        .eq("id_ordem_servico", idOrdemServico)
        .order("criado_em", { ascending: false });

      if (error) throw error;

      const formatadas: PecaOS[] = (data || []).map((item: any) => ({
        ...item,
        produtos: Array.isArray(item.produtos)
          ? item.produtos[0]
          : item.produtos,
      }));

      setPecas(formatadas);
    } catch (error) {
      console.error("Erro ao carregar peças da OS:", error);
      toast.showToast("Erro ao carregar peças da OS", "error");
      setPecas([]);
    } finally {
      setLoadingPecas(false);
    }
  };

  const handleProdutoSelecionado = (produtoId: string | null) => {
    if (!produtoId) {
      setIdProdutoSelecionado(null);
      setProdutoSelecionado(null);
      setValorCustoEstoque("");
      setValorVendaEstoque("");
      return;
    }

    const produto = produtosEstoque.find((p) => p.id === produtoId);
    if (produto) {
      setIdProdutoSelecionado(produtoId);
      setProdutoSelecionado(produto);
      // Preencher com os valores padrão do produto, mas permitir edição
      setValorCustoEstoque(produto.preco_compra.toFixed(2));
      setValorVendaEstoque(produto.preco_venda.toFixed(2));
    }
  };

  const iniciarEdicao = (peca: PecaOS) => {
    setPecaEditando(peca);
    setTipoPeca(peca.tipo_produto);

    if (peca.tipo_produto === "estoque") {
      setIdProdutoSelecionado(peca.id_produto || null);
      setQuantidadePeca(String(peca.quantidade));
      setValorCustoEstoque(peca.valor_custo?.toFixed(2) || "");
      setValorVendaEstoque(peca.valor_venda?.toFixed(2) || "");
    } else {
      setDescricaoPecaAvulsa(peca.descricao_peca || "");
      setValorCustoAvulso(peca.valor_custo?.toFixed(2) || "");
      setValorVendaAvulso(peca.valor_venda?.toFixed(2) || "");
      setQuantidadeAvulsa(String(peca.quantidade));
    }
  };

  const handleRemoverPeca = async (peca: PecaOS) => {
    if (!usuario) {
      toast.showToast("Usuário não autenticado", "error");
      return;
    }

    const nomePeca =
      peca.tipo_produto === "estoque"
        ? peca.produtos?.descricao || ""
        : peca.descricao_peca || "";

    const confirmar = window.confirm(`Remover a peça "${nomePeca}" desta OS?`);

    if (!confirmar) return;

    const { error } = await removerPecaOS(peca.id, usuario.id);

    if (error) {
      toast.showToast(error, "error");
    } else {
      toast.showToast("Peça removida com sucesso", "success");
      await carregarPecasOS();
      onSuccess?.();
    }
  };

  const handleSubmit = async () => {
    if (!usuario) {
      toast.showToast("Usuário não autenticado", "error");
      return;
    }

    if (tipoPeca === "estoque") {
      if (!idProdutoSelecionado) {
        toast.showToast("Selecione um produto do estoque", "error");
        return;
      }
      if (!quantidadePeca || parseFloat(quantidadePeca) <= 0) {
        toast.showToast("Quantidade deve ser maior que zero", "error");
        return;
      }
    } else {
      if (!descricaoPecaAvulsa.trim()) {
        toast.showToast("Descrição da peça é obrigatória", "error");
        return;
      }
      if (!valorVendaAvulso || parseFloat(valorVendaAvulso) <= 0) {
        toast.showToast("Valor de venda deve ser maior que zero", "error");
        return;
      }
      if (!quantidadeAvulsa || parseFloat(quantidadeAvulsa) <= 0) {
        toast.showToast("Quantidade deve ser maior que zero", "error");
        return;
      }
    }

    setLoading(true);

    const formData = {
      id_ordem_servico: idOrdemServico,
      id_loja: idLoja,
      tipo_produto: tipoPeca,
      quantidade:
        tipoPeca === "estoque"
          ? parseFloat(quantidadePeca)
          : parseFloat(quantidadeAvulsa),
      valor_custo:
        tipoPeca === "estoque"
          ? parseFloat(valorCustoEstoque) || 0
          : valorCustoAvulso
            ? parseFloat(valorCustoAvulso)
            : 0,
      valor_venda:
        tipoPeca === "estoque"
          ? parseFloat(valorVendaEstoque) || 0
          : parseFloat(valorVendaAvulso),
      ...(tipoPeca === "estoque"
        ? { id_produto: idProdutoSelecionado || undefined }
        : { descricao_peca: descricaoPecaAvulsa }),
    };

    const isEdicao = !!pecaEditando;

    const { error } = isEdicao
      ? await substituirPecaOS(pecaEditando.id, formData as any, usuario.id)
      : await adicionarPecaOS(formData as any, usuario.id);

    if (error) {
      toast.showToast(error, "error");
    } else {
      toast.showToast(
        isEdicao
          ? "Peça substituída com sucesso"
          : tipoPeca === "estoque"
            ? "Produto adicionado e estoque reservado"
            : "Produto avulso adicionado",
        "success"
      );
      setPecaEditando(null);
      limparCampos();
      await carregarPecasOS();
      onSuccess?.();
    }

    setLoading(false);
  };

  const limparCampos = () => {
    setIdProdutoSelecionado(null);
    setProdutoSelecionado(null);
    setPecaEditando(null);
    setQuantidadePeca("1");
    setDescricaoPecaAvulsa("");
    setValorCustoAvulso("");
    setValorVendaAvulso("");
    setQuantidadeAvulsa("1");
    setValorCustoEstoque("");
    setValorVendaEstoque("");
    setBuscaProduto("");
    setPaginaAtual(1);
  };

  const handleClose = () => {
    limparCampos();
    onClose();
  };

  const handleMudarPagina = (novaPagina: number) => {
    setPaginaAtual(novaPagina);
    carregarProdutosEstoque(idLoja, novaPagina, buscaProduto);
  };

  const totalPaginas = Math.ceil(totalProdutos / itensPorPagina);

  const calcularTotal = () => {
    if (tipoPeca === "estoque" && valorVendaEstoque) {
      return parseFloat(valorVendaEstoque) * parseFloat(quantidadePeca || "0");
    } else if (tipoPeca === "avulso" && valorVendaAvulso) {
      return parseFloat(valorVendaAvulso) * parseFloat(quantidadeAvulsa || "0");
    }
    return 0;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="5xl"
      scrollBehavior="inside"
      classNames={{
        base: "max-h-[90vh]",
        body: "gap-4",
      }}
    >
      <ModalContent>
        <ModalHeader className="flex items-center gap-2">
          <PackagePlus className="w-5 h-5" />
          Adicionar Peça/Produto
        </ModalHeader>
        <ModalBody>
          <div className="space-y-3 mb-2">
            <div className="flex items-center justify-between">
              <h4 className="text-base font-semibold">Peças já vinculadas</h4>
              <Chip size="sm" color="primary" variant="flat">
                {loadingPecas ? "Carregando" : `${pecas.length} peça(s)`}
              </Chip>
            </div>

            {loadingPecas ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : pecas.length === 0 ? (
              <div className="text-sm text-default-500 bg-default-100 dark:bg-default-50/10 p-3 rounded-lg">
                Nenhuma peça vinculada ainda.
              </div>
            ) : (
              <Table aria-label="Peças da OS" removeWrapper>
                <TableHeader>
                  <TableColumn>Descrição</TableColumn>
                  <TableColumn>Tipo</TableColumn>
                  <TableColumn align="center">Qtd</TableColumn>
                  <TableColumn align="end">Venda</TableColumn>
                  <TableColumn align="end">Total</TableColumn>
                  <TableColumn align="center">Ações</TableColumn>
                </TableHeader>
                <TableBody>
                  {pecas.map((peca) => {
                    const descricao =
                      peca.tipo_produto === "estoque"
                        ? peca.produtos?.descricao || "Produto do estoque"
                        : peca.descricao_peca || "Peça avulsa";
                    return (
                      <TableRow key={peca.id}>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium text-sm line-clamp-2">
                              {descricao}
                            </span>
                            {peca.tipo_produto === "estoque" &&
                              peca.produtos?.marca && (
                                <span className="text-xs text-default-400">
                                  {peca.produtos.marca}
                                </span>
                              )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Chip
                            size="sm"
                            color={
                              peca.tipo_produto === "estoque"
                                ? "success"
                                : "warning"
                            }
                            variant="flat"
                          >
                            {peca.tipo_produto === "estoque"
                              ? "Estoque"
                              : "Avulsa"}
                          </Chip>
                        </TableCell>
                        <TableCell>
                          <div className="text-center font-medium">
                            {peca.quantidade}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-right text-sm">
                            R$ {peca.valor_venda.toFixed(2)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-right font-semibold">
                            R$ {(peca.valor_venda * peca.quantidade).toFixed(2)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              size="sm"
                              variant="flat"
                              color="secondary"
                              startContent={<Edit className="w-4 h-4" />}
                              onPress={() => iniciarEdicao(peca)}
                            >
                              Substituir
                            </Button>
                            <Button
                              size="sm"
                              variant="light"
                              color="danger"
                              startContent={<Trash2 className="w-4 h-4" />}
                              onPress={() => handleRemoverPeca(peca)}
                            >
                              Remover
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </div>

          <Select
            label="Tipo de Peça"
            placeholder="Selecione o tipo"
            selectedKeys={[tipoPeca]}
            onSelectionChange={(keys) => {
              const tipo = Array.from(keys)[0] as "estoque" | "avulso";
              setTipoPeca(tipo);
              limparCampos();
            }}
            variant="bordered"
            isRequired
            description="Escolha se vai usar peça do seu estoque ou se foi comprada externamente"
          >
            <SelectItem
              key="estoque"
              startContent={<Store className="w-4 h-4" />}
            >
              Das Minhas Lojas (Estoque)
            </SelectItem>
            <SelectItem
              key="avulso"
              startContent={<ShoppingBag className="w-4 h-4" />}
            >
              Compra Externa (Avulsa)
            </SelectItem>
          </Select>

          <Divider />

          {tipoPeca === "estoque" ? (
            <>
              <div className="bg-primary-50 dark:bg-primary-900/20 p-3 rounded-lg">
                <p className="text-sm font-semibold mb-1">
                  Peça do Estoque da OS
                </p>
                <p className="text-xs text-default-500">
                  Os produtos mostrados são do estoque da loja desta OS
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Input
                    placeholder="Ex: bat ip 11 (busca: bateria iphone 11)"
                    value={buscaProduto}
                    onChange={(e) => setBuscaProduto(e.target.value)}
                    startContent={
                      <Search className="w-4 h-4 text-default-400" />
                    }
                    isClearable
                    onClear={() => setBuscaProduto("")}
                    variant="bordered"
                    size="lg"
                    className="flex-1"
                    classNames={{
                      input: "text-sm",
                    }}
                    description="Digite palavras-chave separadas por espaço para busca inteligente"
                  />
                  {totalProdutos > 0 && (
                    <Chip
                      size="sm"
                      variant="flat"
                      color="primary"
                      className="ml-3"
                    >
                      {totalProdutos} produto{totalProdutos !== 1 ? "s" : ""}
                    </Chip>
                  )}
                </div>

                {loadingProdutos ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : produtosEstoque.length === 0 ? (
                  <div className="text-center py-8 text-default-500">
                    <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">
                      {buscaProduto
                        ? "Nenhum produto encontrado com esse termo"
                        : "Nenhum produto disponível no estoque"}
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2">
                      {produtosEstoque.map((produto) => (
                        <Card
                          key={produto.id}
                          isPressable
                          isHoverable
                          onPress={() => handleProdutoSelecionado(produto.id)}
                          className={`${
                            idProdutoSelecionado === produto.id
                              ? "border-2 border-primary bg-primary-50 dark:bg-primary-900/20"
                              : "border border-default-200 hover:border-primary-300"
                          } transition-all`}
                        >
                          <CardBody className="p-3 gap-2">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-sm line-clamp-2 mb-1">
                                  {produto.descricao}
                                </h4>
                                {(produto.marca || produto.categoria) && (
                                  <div className="flex flex-wrap gap-1 mb-2">
                                    {produto.marca && (
                                      <Chip
                                        size="sm"
                                        variant="flat"
                                        color="default"
                                        startContent={
                                          <Tag className="w-3 h-3" />
                                        }
                                      >
                                        {produto.marca}
                                      </Chip>
                                    )}
                                    {produto.categoria && (
                                      <Chip
                                        size="sm"
                                        variant="flat"
                                        color="secondary"
                                        startContent={
                                          <Box className="w-3 h-3" />
                                        }
                                      >
                                        {produto.categoria}
                                      </Chip>
                                    )}
                                  </div>
                                )}
                              </div>
                              <Chip
                                size="sm"
                                color={
                                  produto.quantidade > 10
                                    ? "success"
                                    : produto.quantidade > 5
                                      ? "warning"
                                      : "danger"
                                }
                                variant="flat"
                              >
                                {produto.quantidade} un.
                              </Chip>
                            </div>

                            <Divider />

                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div className="flex flex-col gap-1">
                                <span className="text-default-500">Custo</span>
                                <span className="font-semibold text-default-700">
                                  R$ {produto.preco_compra.toFixed(2)}
                                </span>
                              </div>
                              <div className="flex flex-col gap-1">
                                <span className="text-default-500">Venda</span>
                                <span className="font-semibold text-success">
                                  R$ {produto.preco_venda.toFixed(2)}
                                </span>
                              </div>
                            </div>

                            {produto.preco_venda > produto.preco_compra && (
                              <div className="flex items-center gap-1 text-xs text-success">
                                <TrendingUp className="w-3 h-3" />
                                <span>
                                  Margem:{" "}
                                  {(
                                    ((produto.preco_venda -
                                      produto.preco_compra) /
                                      produto.preco_compra) *
                                    100
                                  ).toFixed(1)}
                                  %
                                </span>
                              </div>
                            )}
                          </CardBody>
                          {idProdutoSelecionado === produto.id && (
                            <CardFooter className="bg-primary-100 dark:bg-primary-900/30 py-2 px-3">
                              <p className="text-xs font-medium text-primary">
                                ✓ Produto Selecionado
                              </p>
                            </CardFooter>
                          )}
                        </Card>
                      ))}
                    </div>

                    {totalPaginas > 1 && (
                      <div className="flex justify-center items-center gap-2 pt-2">
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
                  </>
                )}
              </div>

              {produtoSelecionado && (
                <>
                  <Divider className="my-2" />

                  <div className="bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 p-4 rounded-lg">
                    <h3 className="text-sm font-bold mb-3 text-primary">
                      Configurações do Produto Selecionado
                    </h3>

                    <div className="grid grid-cols-3 gap-3 mb-4">
                      <div className="bg-white dark:bg-default-100/50 p-3 rounded-lg">
                        <p className="text-xs text-default-500 mb-1">
                          Custo Padrão
                        </p>
                        <p className="font-bold text-default-700">
                          R$ {produtoSelecionado.preco_compra.toFixed(2)}
                        </p>
                      </div>
                      <div className="bg-white dark:bg-default-100/50 p-3 rounded-lg">
                        <p className="text-xs text-default-500 mb-1">
                          Venda Padrão
                        </p>
                        <p className="font-bold text-success">
                          R$ {produtoSelecionado.preco_venda.toFixed(2)}
                        </p>
                      </div>
                      <div className="bg-white dark:bg-default-100/50 p-3 rounded-lg">
                        <p className="text-xs text-default-500 mb-1">
                          Disponível
                        </p>
                        <p className="font-bold text-primary">
                          {produtoSelecionado.quantidade} un.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <Input
                        label="Valor Custo (OS)"
                        type="number"
                        min="0"
                        step="0.01"
                        value={valorCustoEstoque}
                        onChange={(e) => setValorCustoEstoque(e.target.value)}
                        startContent={
                          <span className="text-default-400 text-sm">R$</span>
                        }
                        variant="bordered"
                        description="Ajuste se necessário"
                        size="sm"
                      />

                      <Input
                        label="Valor Venda (OS)"
                        type="number"
                        min="0"
                        step="0.01"
                        value={valorVendaEstoque}
                        onChange={(e) => setValorVendaEstoque(e.target.value)}
                        isRequired
                        startContent={
                          <span className="text-default-400 text-sm">R$</span>
                        }
                        variant="bordered"
                        description="Ajuste se necessário"
                        color="success"
                        size="sm"
                      />

                      <Input
                        label="Quantidade"
                        type="number"
                        min="1"
                        max={produtoSelecionado.quantidade}
                        step="1"
                        value={quantidadePeca}
                        onChange={(e) => setQuantidadePeca(e.target.value)}
                        isRequired
                        variant="bordered"
                        size="sm"
                        description={`Máx: ${produtoSelecionado.quantidade}`}
                      />
                    </div>
                  </div>
                </>
              )}
            </>
          ) : (
            <>
              <div className="bg-warning-50 dark:bg-warning-900/20 p-3 rounded-lg">
                <p className="text-sm font-semibold mb-1">
                  Peça Externa (Avulsa)
                </p>
                <p className="text-xs text-default-500">
                  Informe os dados da peça comprada externamente
                </p>
              </div>

              <Input
                label="Descrição da Peça/Produto"
                placeholder="Ex: Bateria genérica 3000mAh"
                value={descricaoPecaAvulsa}
                onChange={(e) => setDescricaoPecaAvulsa(e.target.value)}
                isRequired
                variant="bordered"
              />

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Valor Custo"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={valorCustoAvulso}
                  onChange={(e) => setValorCustoAvulso(e.target.value)}
                  startContent={
                    <span className="text-default-400 text-sm">R$</span>
                  }
                  variant="bordered"
                  description="Opcional"
                />

                <Input
                  label="Valor Venda"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={valorVendaAvulso}
                  onChange={(e) => setValorVendaAvulso(e.target.value)}
                  startContent={
                    <span className="text-default-400 text-sm">R$</span>
                  }
                  isRequired
                  variant="bordered"
                />
              </div>

              <Input
                label="Quantidade"
                type="number"
                min="1"
                step="1"
                value={quantidadeAvulsa}
                onChange={(e) => setQuantidadeAvulsa(e.target.value)}
                isRequired
                variant="bordered"
              />
            </>
          )}

          {calcularTotal() > 0 && (
            <div className="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-default-600">
                  Total:
                </span>
                <span className="text-xl font-bold text-primary">
                  R$ {calcularTotal().toFixed(2)}
                </span>
              </div>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="flat" onPress={handleClose}>
            Cancelar
          </Button>
          <Button
            color="primary"
            onPress={handleSubmit}
            isLoading={loading}
            startContent={
              !loading &&
              (pecaEditando ? (
                <Edit className="w-4 h-4" />
              ) : (
                <PackagePlus className="w-4 h-4" />
              ))
            }
          >
            {pecaEditando ? "Substituir peça" : "Adicionar"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
