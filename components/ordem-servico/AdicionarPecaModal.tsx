"use client";

import React, { useState, useEffect } from "react";
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
} from "@heroui/react";
import { PackagePlus, Package, Store, ShoppingBag } from "lucide-react";
import { useToast } from "@/components/Toast";
import { adicionarPecaOS } from "@/services/ordemServicoService";
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
  const [lojas, setLojas] = useState<Array<{ id: number; nome: string }>>([]);

  const [tipoPeca, setTipoPeca] = useState<"estoque" | "avulso">("estoque");
  const [idLojaPeca, setIdLojaPeca] = useState<number | null>(idLoja);
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
    if (isOpen) {
      carregarLojas();
      if (tipoPeca === "estoque" && idLojaPeca) {
        carregarProdutosEstoque(idLojaPeca);
      }
    }
  }, [isOpen, tipoPeca, idLojaPeca]);

  const carregarLojas = async () => {
    try {
      const { LojasService } = await import("@/services/lojasService");
      const data = await LojasService.getLojasAtivas();
      setLojas(data.map((loja) => ({ id: loja.id, nome: loja.nome })));
    } catch (error) {
      console.error("Erro ao carregar lojas:", error);
      setLojas([]);
    }
  };

  const carregarProdutosEstoque = async (lojaId: number) => {
    setLoadingProdutos(true);
    try {
      const { supabase } = await import("@/lib/supabaseClient");

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
            preco_compra,
            preco_venda
          ),
          lojas:id_loja (
            id,
            nome
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

      setProdutosEstoque(produtosFormatados);
    } catch (error) {
      console.error("Erro ao carregar produtos:", error);
      toast.showToast("Erro ao carregar produtos do estoque", "error");
      setProdutosEstoque([]);
    } finally {
      setLoadingProdutos(false);
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

  const handleSubmit = async () => {
    if (!usuario) {
      toast.showToast("Usuário não autenticado", "error");
      return;
    }

    if (tipoPeca === "estoque") {
      if (!idLojaPeca) {
        toast.showToast("Selecione uma loja", "error");
        return;
      }
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
      id_loja: tipoPeca === "estoque" ? idLojaPeca! : idLoja,
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

    const { error } = await adicionarPecaOS(formData, usuario.id);

    if (error) {
      toast.showToast(error, "error");
    } else {
      toast.showToast(
        tipoPeca === "estoque"
          ? "Produto adicionado e estoque reservado"
          : "Produto avulso adicionado",
        "success"
      );
      limparCampos();
      onSuccess?.();
      onClose();
    }

    setLoading(false);
  };

  const limparCampos = () => {
    setIdProdutoSelecionado(null);
    setProdutoSelecionado(null);
    setQuantidadePeca("1");
    setDescricaoPecaAvulsa("");
    setValorCustoAvulso("");
    setValorVendaAvulso("");
    setQuantidadeAvulsa("1");
    setValorCustoEstoque("");
    setValorVendaEstoque("");
  };

  const handleClose = () => {
    limparCampos();
    onClose();
  };

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
      size="2xl"
      scrollBehavior="inside"
    >
      <ModalContent>
        <ModalHeader className="flex items-center gap-2">
          <PackagePlus className="w-5 h-5" />
          Adicionar Peça/Produto
        </ModalHeader>
        <ModalBody>
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
                <p className="text-sm font-semibold mb-1">Peça do Estoque</p>
                <p className="text-xs text-default-500">
                  Selecione de qual loja e qual produto será utilizado
                </p>
              </div>

              <Select
                label="Loja"
                placeholder="Selecione a loja"
                selectedKeys={idLojaPeca ? [idLojaPeca.toString()] : []}
                onSelectionChange={(keys) => {
                  const lojaId = parseInt(Array.from(keys)[0] as string);
                  setIdLojaPeca(lojaId);
                  carregarProdutosEstoque(lojaId);
                  setIdProdutoSelecionado(null);
                  setProdutoSelecionado(null);
                }}
                isRequired
                variant="bordered"
                startContent={<Store className="w-4 h-4" />}
              >
                {lojas.map((loja) => (
                  <SelectItem key={loja.id.toString()}>{loja.nome}</SelectItem>
                ))}
              </Select>

              <Autocomplete
                label="Produto"
                placeholder={
                  idLojaPeca
                    ? "Buscar produto no estoque"
                    : "Selecione uma loja primeiro"
                }
                selectedKey={idProdutoSelecionado}
                onSelectionChange={(key) =>
                  handleProdutoSelecionado(key as string)
                }
                isLoading={loadingProdutos}
                isRequired
                variant="bordered"
                startContent={<Package className="w-4 h-4" />}
                allowsCustomValue={false}
                defaultItems={produtosEstoque}
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
                      <span className="text-xs text-success">
                        Disponível: {produto.quantidade} un.
                      </span>
                    </div>
                  </AutocompleteItem>
                )}
              </Autocomplete>

              {produtoSelecionado && (
                <>
                  <div className="p-3 bg-default-100 dark:bg-default-50/10 rounded-lg space-y-2">
                    <p className="text-xs font-semibold text-default-600 mb-2">
                      Valores do Produto (editáveis para esta OS)
                    </p>
                    <div className="flex justify-between text-sm">
                      <span className="text-default-600">
                        Valor Padrão Custo:
                      </span>
                      <span className="font-medium text-default-500">
                        R$ {produtoSelecionado.preco_compra.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-default-600">
                        Valor Padrão Venda:
                      </span>
                      <span className="font-medium text-default-500">
                        R$ {produtoSelecionado.preco_venda.toFixed(2)}
                      </span>
                    </div>
                    <Divider />
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-default-600">
                        Estoque Disponível:
                      </span>
                      <Chip size="sm" color="success" variant="flat">
                        {produtoSelecionado.quantidade} un.
                      </Chip>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="Valor Custo para esta OS"
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
                      color="primary"
                    />

                    <Input
                      label="Valor Venda para esta OS"
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
                    />
                  </div>
                </>
              )}

              <Input
                label="Quantidade"
                type="number"
                min="1"
                step="1"
                value={quantidadePeca}
                onChange={(e) => setQuantidadePeca(e.target.value)}
                isRequired
                variant="bordered"
              />
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
            startContent={!loading && <PackagePlus className="w-4 h-4" />}
          >
            Adicionar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
