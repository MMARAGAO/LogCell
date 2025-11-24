"use client";

import { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Autocomplete,
  AutocompleteItem,
  Card,
  CardBody,
  Divider,
  Chip,
} from "@heroui/react";
import { RefreshCw, Package, TrendingUp, AlertCircle } from "lucide-react";
import { useToast } from "@/components/Toast";
import { supabase } from "@/lib/supabaseClient";

interface TrocarProdutoModalProps {
  isOpen: boolean;
  onClose: () => void;
  vendaId: string;
  itemVendaId: string;
  produtoAtual: {
    id: string;
    nome: string;
    quantidade: number;
    preco_unitario: number;
  };
  lojaId: number;
  onTrocaRealizada: () => void;
}

interface ProdutoEstoque {
  id: string;
  descricao: string;
  marca?: string;
  categoria?: string;
  preco_venda: number;
  quantidade_disponivel: number;
}

export function TrocarProdutoModal({
  isOpen,
  onClose,
  vendaId,
  itemVendaId,
  produtoAtual,
  lojaId,
  onTrocaRealizada,
}: TrocarProdutoModalProps) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [produtos, setProdutos] = useState<ProdutoEstoque[]>([]);
  const [loadingProdutos, setLoadingProdutos] = useState(false);
  const [produtoNovoId, setProdutoNovoId] = useState<string>("");
  const [produtoNovo, setProdutoNovo] = useState<ProdutoEstoque | null>(null);
  const [quantidadeTroca, setQuantidadeTroca] = useState("1");
  const [busca, setBusca] = useState("");

  useEffect(() => {
    if (isOpen) {
      carregarProdutos();
      setQuantidadeTroca(produtoAtual.quantidade.toString());
    }
  }, [isOpen, lojaId]);

  const carregarProdutos = async () => {
    setLoadingProdutos(true);
    try {
      const { data, error } = await supabase
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
            preco_venda
          )
        `
        )
        .eq("id_loja", lojaId)
        .gt("quantidade", 0);

      if (error) throw error;

      const produtosFormatados: ProdutoEstoque[] = (data || []).map(
        (item: any) => {
          const produto = Array.isArray(item.produtos)
            ? item.produtos[0]
            : item.produtos;
          return {
            id: produto.id,
            descricao: produto.descricao,
            marca: produto.marca,
            categoria: produto.categoria,
            preco_venda: produto.preco_venda || 0,
            quantidade_disponivel: item.quantidade,
          };
        }
      );

      setProdutos(produtosFormatados);
    } catch (error) {
      console.error("Erro ao carregar produtos:", error);
      toast.error("Erro ao carregar produtos");
    } finally {
      setLoadingProdutos(false);
    }
  };

  const handleProdutoSelecionado = (produtoId: string | null) => {
    if (!produtoId) {
      setProdutoNovoId("");
      setProdutoNovo(null);
      return;
    }

    const produto = produtos.find((p) => p.id === produtoId);
    if (produto) {
      setProdutoNovoId(produtoId);
      setProdutoNovo(produto);
    }
  };

  const calcularDiferenca = () => {
    if (!produtoNovo) return 0;
    const qtd = parseInt(quantidadeTroca) || 0;
    const valorAtual = produtoAtual.preco_unitario * qtd;
    const valorNovo = produtoNovo.preco_venda * qtd;
    return valorNovo - valorAtual;
  };

  const realizarTroca = async () => {
    if (!produtoNovo) {
      toast.error("Selecione o produto para troca");
      return;
    }

    const qtd = parseInt(quantidadeTroca);
    if (qtd <= 0 || qtd > produtoAtual.quantidade) {
      toast.error("Quantidade inválida para troca");
      return;
    }

    if (qtd > produtoNovo.quantidade_disponivel) {
      toast.error("Quantidade insuficiente em estoque");
      return;
    }

    setLoading(true);
    try {
      // 1. Devolver o produto antigo ao estoque
      const { error: errorDevolverEstoque } = await supabase.rpc(
        "adicionar_estoque",
        {
          p_id_produto: produtoAtual.id,
          p_id_loja: lojaId,
          p_quantidade: qtd,
        }
      );

      if (errorDevolverEstoque) {
        // Se a função RPC não existir, fazer update direto
        const { data: estoqueAtual } = await supabase
          .from("estoque_lojas")
          .select("quantidade")
          .eq("id_produto", produtoAtual.id)
          .eq("id_loja", lojaId)
          .single();

        if (estoqueAtual) {
          await supabase
            .from("estoque_lojas")
            .update({ quantidade: estoqueAtual.quantidade + qtd })
            .eq("id_produto", produtoAtual.id)
            .eq("id_loja", lojaId);
        }
      }

      // 2. Baixar o novo produto do estoque
      const { error: errorBaixarEstoque } = await supabase.rpc(
        "remover_estoque",
        {
          p_id_produto: produtoNovo.id,
          p_id_loja: lojaId,
          p_quantidade: qtd,
        }
      );

      if (errorBaixarEstoque) {
        // Se a função RPC não existir, fazer update direto
        const { data: estoqueNovo } = await supabase
          .from("estoque_lojas")
          .select("quantidade")
          .eq("id_produto", produtoNovo.id)
          .eq("id_loja", lojaId)
          .single();

        if (estoqueNovo && estoqueNovo.quantidade >= qtd) {
          await supabase
            .from("estoque_lojas")
            .update({ quantidade: estoqueNovo.quantidade - qtd })
            .eq("id_produto", produtoNovo.id)
            .eq("id_loja", lojaId);
        }
      }

      // 3. Atualizar o item da venda
      const { error: errorItem } = await supabase
        .from("itens_venda")
        .update({
          produto_id: produtoNovo.id,
          produto_nome: produtoNovo.descricao,
          produto_codigo: produtoNovo.id.substring(0, 8),
          preco_unitario: produtoNovo.preco_venda,
          subtotal: produtoNovo.preco_venda * qtd,
          quantidade: qtd,
        })
        .eq("id", itemVendaId);

      if (errorItem) throw errorItem;

      // 4. Recalcular total da venda
      const { data: itensVenda } = await supabase
        .from("itens_venda")
        .select("subtotal")
        .eq("venda_id", vendaId);

      if (itensVenda) {
        const novoTotal = itensVenda.reduce(
          (sum, item) => sum + item.subtotal,
          0
        );
        await supabase
          .from("vendas")
          .update({ valor_total: novoTotal })
          .eq("id", vendaId);
      }

      // 5. Obter usuário atual
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // 6. Registrar a troca na tabela trocas_produtos
      const diferenca = calcularDiferenca();
      const { error: errorTroca } = await supabase
        .from("trocas_produtos")
        .insert({
          venda_id: vendaId,
          item_venda_id: itemVendaId,
          produto_antigo_id: produtoAtual.id,
          produto_antigo_nome: produtoAtual.nome,
          produto_antigo_preco: produtoAtual.preco_unitario,
          quantidade_trocada: qtd,
          produto_novo_id: produtoNovo.id,
          produto_novo_nome: produtoNovo.descricao,
          produto_novo_preco: produtoNovo.preco_venda,
          diferenca_valor: diferenca,
          loja_id: lojaId,
          usuario_id: user?.id,
        });

      if (errorTroca) {
        console.error("Erro ao registrar troca:", errorTroca);
        // Não interrompe o processo se falhar apenas o registro
      }

      // 7. Registrar no histórico da venda
      await supabase.from("historico_vendas").insert({
        venda_id: vendaId,
        tipo_acao: "edicao",
        descricao: `Produto trocado: ${produtoAtual.nome} → ${produtoNovo.descricao} (Qtd: ${qtd}${diferenca !== 0 ? `, Diferença: R$ ${Math.abs(diferenca).toFixed(2)}` : ""})`,
      });

      toast.success("Troca realizada com sucesso!");
      onTrocaRealizada();
      handleClose();
    } catch (error: any) {
      console.error("Erro ao realizar troca:", error);
      toast.error(error.message || "Erro ao realizar troca");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setProdutoNovoId("");
    setProdutoNovo(null);
    setQuantidadeTroca("1");
    setBusca("");
    onClose();
  };

  const produtosFiltrados = produtos.filter(
    (p) =>
      p.id !== produtoAtual.id &&
      (p.descricao.toLowerCase().includes(busca.toLowerCase()) ||
        p.marca?.toLowerCase().includes(busca.toLowerCase()) ||
        p.categoria?.toLowerCase().includes(busca.toLowerCase()))
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="2xl"
      scrollBehavior="inside"
    >
      <ModalContent>
        <ModalHeader className="flex items-center gap-2">
          <RefreshCw className="w-5 h-5" />
          Trocar Produto
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            {/* Produto Atual */}
            <Card className="bg-default-100 dark:bg-default-50/10">
              <CardBody className="p-4">
                <p className="text-xs text-default-600 mb-2 font-semibold">
                  PRODUTO ATUAL (será devolvido ao estoque)
                </p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{produtoAtual.nome}</p>
                    <p className="text-sm text-default-600">
                      Qtd: {produtoAtual.quantidade} × R${" "}
                      {produtoAtual.preco_unitario.toFixed(2)} = R${" "}
                      {(
                        produtoAtual.preco_unitario * produtoAtual.quantidade
                      ).toFixed(2)}
                    </p>
                  </div>
                  <Chip color="default" variant="flat">
                    <Package className="w-3 h-3 mr-1" />
                    Atual
                  </Chip>
                </div>
              </CardBody>
            </Card>

            <Divider />

            {/* Quantidade a trocar */}
            <Input
              label="Quantidade a trocar"
              type="number"
              min="1"
              max={produtoAtual.quantidade}
              value={quantidadeTroca}
              onValueChange={setQuantidadeTroca}
              variant="bordered"
              description={`Máximo: ${produtoAtual.quantidade}`}
            />

            {/* Buscar Novo Produto */}
            <Input
              label="Buscar produto"
              placeholder="Digite para filtrar..."
              value={busca}
              onValueChange={setBusca}
              variant="bordered"
              startContent={<Package className="w-4 h-4 text-default-400" />}
            />

            <Autocomplete
              label="Novo Produto"
              placeholder="Selecione o produto para troca"
              selectedKey={produtoNovoId}
              onSelectionChange={(key) =>
                handleProdutoSelecionado(key as string)
              }
              isLoading={loadingProdutos}
              variant="bordered"
              startContent={<TrendingUp className="w-4 h-4" />}
              defaultItems={produtosFiltrados}
              isRequired
            >
              {(produto) => (
                <AutocompleteItem
                  key={produto.id}
                  textValue={`${produto.descricao} ${produto.marca || ""}`}
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{produto.descricao}</span>
                    {produto.marca && (
                      <span className="text-xs text-default-500">
                        {produto.marca}
                        {produto.categoria && ` • ${produto.categoria}`}
                      </span>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-success font-medium">
                        R$ {produto.preco_venda.toFixed(2)}
                      </span>
                      <span className="text-xs text-default-500">
                        Estoque: {produto.quantidade_disponivel}
                      </span>
                    </div>
                  </div>
                </AutocompleteItem>
              )}
            </Autocomplete>

            {/* Resumo da Troca */}
            {produtoNovo && (
              <>
                <Divider />
                <Card
                  className={
                    calcularDiferenca() > 0
                      ? "bg-warning-50 dark:bg-warning-900/20 border-2 border-warning"
                      : calcularDiferenca() < 0
                        ? "bg-success-50 dark:bg-success-900/20 border-2 border-success"
                        : "bg-default-100 dark:bg-default-50/10"
                  }
                >
                  <CardBody className="p-4 space-y-3">
                    <p className="text-xs font-semibold text-default-600">
                      RESUMO DA TROCA
                    </p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-default-600">Valor Atual:</span>
                        <span className="font-medium">
                          R${" "}
                          {(
                            produtoAtual.preco_unitario *
                            parseInt(quantidadeTroca || "0")
                          ).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-default-600">Valor Novo:</span>
                        <span className="font-medium">
                          R${" "}
                          {(
                            produtoNovo.preco_venda *
                            parseInt(quantidadeTroca || "0")
                          ).toFixed(2)}
                        </span>
                      </div>
                      <Divider />
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">Diferença:</span>
                        <div className="flex items-center gap-2">
                          {calcularDiferenca() > 0 ? (
                            <>
                              <AlertCircle className="w-4 h-4 text-warning" />
                              <span className="font-bold text-warning">
                                + R$ {Math.abs(calcularDiferenca()).toFixed(2)}
                              </span>
                              <span className="text-xs text-default-500">
                                (cliente paga)
                              </span>
                            </>
                          ) : calcularDiferenca() < 0 ? (
                            <>
                              <span className="font-bold text-success">
                                - R$ {Math.abs(calcularDiferenca()).toFixed(2)}
                              </span>
                              <span className="text-xs text-default-500">
                                (reembolso)
                              </span>
                            </>
                          ) : (
                            <span className="font-bold text-default-600">
                              Sem diferença
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </>
            )}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onPress={handleClose}>
            Cancelar
          </Button>
          <Button
            color="primary"
            onPress={realizarTroca}
            isLoading={loading}
            isDisabled={!produtoNovo}
            startContent={<RefreshCw className="w-4 h-4" />}
          >
            Realizar Troca
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
