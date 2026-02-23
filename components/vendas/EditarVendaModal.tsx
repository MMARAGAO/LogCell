"use client";

import type { VendaCompleta } from "@/types/vendas";

import { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Textarea,
  Card,
  CardBody,
  Divider,
  Chip,
} from "@heroui/react";
import { Plus, Trash2, Minus, Edit2 } from "lucide-react";

interface EditarVendaModalProps {
  isOpen: boolean;
  onClose: () => void;
  venda: VendaCompleta | null;
  produtos: any[];
  onConfirmar: (vendaId: string, dados: EditarVendaDados) => Promise<void>;
}

export interface ItemVendaEditado {
  id?: string;
  produto_id: string;
  produto_nome: string;
  produto_codigo: string;
  quantidade: number;
  preco_unitario: number;
  subtotal: number;
  acao?: "adicionar" | "remover" | "alterar" | "manter";
}

export interface EditarVendaDados {
  observacoes?: string;
  data_prevista_pagamento?: string;
  itens: ItemVendaEditado[];
}

export function EditarVendaModal({
  isOpen,
  onClose,
  venda,
  produtos,
  onConfirmar,
}: EditarVendaModalProps) {
  const [observacoes, setObservacoes] = useState("");
  const [dataPrevista, setDataPrevista] = useState("");
  const [itens, setItens] = useState<ItemVendaEditado[]>([]);
  const [salvando, setSalvando] = useState(false);
  const [produtoSelecionado, setProdutoSelecionado] = useState<any>(null);
  const [quantidade, setQuantidade] = useState(1);
  const [busca, setBusca] = useState("");
  const [estoques, setEstoques] = useState<Record<string, number>>({});
  const [quantidadesOriginais, setQuantidadesOriginais] = useState<
    Record<string, number>
  >({});
  const [paginaAtual, setPaginaAtual] = useState(1);
  const PRODUTOS_POR_PAGINA = 10;
  const [precoEditando, setPrecoEditando] = useState<number | null>(null);
  const [precoTemporario, setPrecoTemporario] = useState<string>("");

  useEffect(() => {
    if (venda && isOpen) {
      setObservacoes(venda.observacoes || "");
      setDataPrevista(
        venda.data_prevista_pagamento
          ? new Date(venda.data_prevista_pagamento).toISOString().split("T")[0]
          : "",
      );

      // Carregar itens existentes
      const itensExistentes: ItemVendaEditado[] =
        venda.itens?.map((item: any) => ({
          id: item.id,
          produto_id: item.produto_id,
          produto_nome: item.produto_nome || "",
          produto_codigo: item.produto_codigo || "",
          quantidade: item.quantidade,
          preco_unitario: item.preco_unitario,
          subtotal: item.subtotal,
          acao: "manter" as const,
        })) || [];

      setItens(itensExistentes);

      // Armazenar quantidades originais para cálculo correto de estoque
      const quantOriginais: Record<string, number> = {};

      itensExistentes.forEach((item) => {
        if (item.id) {
          quantOriginais[item.id] = item.quantidade;
        }
      });
      setQuantidadesOriginais(quantOriginais);

      // Carregar estoques da loja
      carregarEstoques();
    }
  }, [venda, isOpen]);

  const carregarEstoques = async () => {
    if (!venda?.loja_id) return;

    try {
      const { supabase } = await import("@/lib/supabaseClient");
      const { data, error } = await supabase
        .from("estoque_lojas")
        .select("id_produto, quantidade")
        .eq("id_loja", venda.loja_id);

      if (error) throw error;

      const estoquesMap: Record<string, number> = {};

      data?.forEach((item) => {
        estoquesMap[item.id_produto] = item.quantidade;
      });

      setEstoques(estoquesMap);
    } catch (error) {
      console.error("Erro ao carregar estoques:", error);
    }
  };

  const formatarMoeda = (valor: number) => {
    return valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const produtosFiltrados = produtos.filter(
    (p) =>
      p.nome?.toLowerCase().includes(busca.toLowerCase()) ||
      p.codigo?.toLowerCase().includes(busca.toLowerCase()),
  );

  // Produtos paginados
  const produtosPaginados = produtosFiltrados.slice(
    (paginaAtual - 1) * PRODUTOS_POR_PAGINA,
    paginaAtual * PRODUTOS_POR_PAGINA,
  );

  const totalPaginas = Math.ceil(
    produtosFiltrados.length / PRODUTOS_POR_PAGINA,
  );

  const calcularTotal = () => {
    return itens.reduce((sum, item) => {
      if (item.acao !== "remover") {
        return sum + item.subtotal;
      }

      return sum;
    }, 0);
  };

  const getEstoqueDisponivel = (produtoId: string) => {
    const estoqueAtual = estoques[produtoId] || 0;

    // Calcular quanto estava originalmente na venda (usar quantidades ORIGINAIS)
    const quantidadeOriginalNaVenda = itens
      .filter(
        (item) =>
          item.produto_id === produtoId &&
          item.id && // Apenas itens que já existiam
          item.acao !== "remover",
      )
      .reduce((sum, item) => {
        // Usar quantidade original armazenada, não a quantidade atual
        const quantOriginal = item.id ? quantidadesOriginais[item.id] || 0 : 0;

        return sum + quantOriginal;
      }, 0);

    // Calcular quanto já foi adicionado de novos itens ou alterações
    const quantidadeJaUsada = itens
      .filter(
        (item) => item.produto_id === produtoId && item.acao !== "remover",
      )
      .reduce((sum, item) => {
        // Para itens existentes, considerar apenas o que ultrapassou a quantidade original
        if (item.id) {
          const quantOriginal = quantidadesOriginais[item.id] || 0;
          const adicional = Math.max(0, item.quantidade - quantOriginal);

          return sum + adicional;
        }

        // Para novos itens, considerar toda a quantidade
        return sum + item.quantidade;
      }, 0);

    // Estoque disponível = estoque atual + quantidade original - quantidade já usada
    return estoqueAtual + quantidadeOriginalNaVenda - quantidadeJaUsada;
  };

  // Para exibição no item da lista - mostra apenas o estoque real da loja
  const getEstoqueRealLoja = (produtoId: string) => {
    return estoques[produtoId] || 0;
  };

  const adicionarItem = () => {
    if (!produtoSelecionado || quantidade <= 0) return;

    const estoqueDisponivel = getEstoqueDisponivel(produtoSelecionado.id);

    if (quantidade > estoqueDisponivel) {
      alert(
        `Estoque insuficiente! Disponível: ${estoqueDisponivel} unidade(s)`,
      );

      return;
    }

    const subtotal = produtoSelecionado.preco_venda * quantidade;

    const novoItem: ItemVendaEditado = {
      produto_id: produtoSelecionado.id,
      produto_nome: produtoSelecionado.nome,
      produto_codigo: produtoSelecionado.codigo,
      quantidade,
      preco_unitario: produtoSelecionado.preco_venda,
      subtotal,
      acao: "adicionar",
    };

    setItens([...itens, novoItem]);
    setProdutoSelecionado(null);
    setQuantidade(1);
    setBusca("");
  };

  const alterarQuantidade = (index: number, novaQuantidade: number) => {
    if (novaQuantidade <= 0) return;

    const item = itens[index];

    // Calcular o máximo permitido para este item
    const estoqueAtual = estoques[item.produto_id] || 0;

    // Quantidade original deste item específico
    const quantidadeOriginalItem = item.id
      ? quantidadesOriginais[item.id] || 0
      : 0;

    // Calcular quanto já foi usado por OUTROS itens do mesmo produto
    const quantidadeUsadaPorOutros = itens
      .filter(
        (i, idx) =>
          i.produto_id === item.produto_id &&
          idx !== index && // Não contar o item atual
          i.acao !== "remover",
      )
      .reduce((sum, i) => {
        if (i.id) {
          // Para itens existentes, considerar apenas o adicional
          const quantOriginal = quantidadesOriginais[i.id] || 0;
          const adicional = Math.max(0, i.quantidade - quantOriginal);

          return sum + adicional;
        }

        // Para novos itens, considerar toda a quantidade
        return sum + i.quantidade;
      }, 0);

    // Máximo que este item pode ter = estoque atual + sua quantidade original - uso dos outros
    const maximoPermitido =
      estoqueAtual + quantidadeOriginalItem - quantidadeUsadaPorOutros;

    if (novaQuantidade > maximoPermitido) {
      alert(
        `Estoque insuficiente! Máximo permitido: ${maximoPermitido} unidade(s)`,
      );

      return;
    }

    const novosItens = [...itens];

    novosItens[index].quantidade = novaQuantidade;
    novosItens[index].subtotal =
      novosItens[index].preco_unitario * novaQuantidade;

    // Marcar como alterado se for item existente
    if (novosItens[index].id && novosItens[index].acao === "manter") {
      novosItens[index].acao = "alterar";
    }

    setItens(novosItens);
  };

  const alterarPreco = (index: number, novoPreco: number) => {
    if (novoPreco <= 0) {
      alert("O preço deve ser maior que zero");

      return;
    }

    const novosItens = [...itens];

    novosItens[index].preco_unitario = novoPreco;
    novosItens[index].subtotal = novosItens[index].quantidade * novoPreco;

    // Marcar como alterado se for item existente
    if (novosItens[index].id && novosItens[index].acao === "manter") {
      novosItens[index].acao = "alterar";
    }

    setItens(novosItens);
    setPrecoEditando(null);
    setPrecoTemporario("");
  };

  const removerItem = (index: number) => {
    const novosItens = [...itens];

    // Se o item tem ID (já existe no banco), marcar para remoção
    if (novosItens[index].id) {
      novosItens[index].acao = "remover";
    } else {
      // Se é um item novo, remover da lista
      novosItens.splice(index, 1);
    }

    setItens(novosItens);
  };

  const restaurarItem = (index: number) => {
    const novosItens = [...itens];
    const itemOriginal = venda?.itens?.find(
      (i: any) => i.id === novosItens[index].id,
    );

    if (itemOriginal) {
      novosItens[index] = {
        id: itemOriginal.id,
        produto_id: itemOriginal.produto_id,
        produto_nome: itemOriginal.produto_nome || "",
        produto_codigo: itemOriginal.produto_codigo || "",
        quantidade: itemOriginal.quantidade,
        preco_unitario: itemOriginal.preco_unitario,
        subtotal: itemOriginal.subtotal,
        acao: "manter",
      };
      setItens(novosItens);
    }
  };

  const handleSubmit = async () => {
    if (!venda) return;

    // Validar que há pelo menos um item ativo
    const itensAtivos = itens.filter((i) => i.acao !== "remover");

    if (itensAtivos.length === 0) {
      alert("A venda deve ter pelo menos um item!");

      return;
    }

    setSalvando(true);
    try {
      await onConfirmar(venda.id, {
        observacoes: observacoes.trim() || undefined,
        data_prevista_pagamento: dataPrevista || undefined,
        itens,
      });
      onClose();
    } catch (error) {
      console.error("Erro ao editar venda:", error);
    } finally {
      setSalvando(false);
    }
  };

  const handleClose = () => {
    if (!salvando) {
      setObservacoes("");
      setDataPrevista("");
      setItens([]);
      setProdutoSelecionado(null);
      setQuantidade(1);
      setBusca("");
      onClose();
    }
  };

  if (!venda) return null;

  return (
    <Modal
      isOpen={isOpen}
      scrollBehavior="inside"
      size="4xl"
      onClose={handleClose}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <h2 className="text-xl font-bold">
            Editar Venda V{String(venda.numero_venda).padStart(6, "0")}
          </h2>
          <p className="text-sm text-gray-500">
            Cliente: {venda.cliente?.nome}
          </p>
        </ModalHeader>

        <ModalBody className="gap-4">
          {/* Seção: Adicionar Produto */}
          <Card>
            <CardBody>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Adicionar Produto
              </h3>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    disabled={salvando}
                    placeholder="Buscar produto por nome ou código..."
                    value={busca}
                    onChange={(e) => {
                      setBusca(e.target.value);
                      setPaginaAtual(1); // Reset página ao buscar
                    }}
                  />
                  {busca && produtosFiltrados.length > 0 && (
                    <div className="absolute z-50 mt-1 w-full bg-white dark:bg-gray-800 border rounded-lg shadow-lg max-h-96 overflow-auto">
                      {/* Info de resultados */}
                      <div className="sticky top-0 bg-gray-50 dark:bg-gray-900 px-4 py-2 border-b text-sm text-gray-600 dark:text-gray-400 flex justify-between items-center">
                        <span>
                          {produtosFiltrados.length} produto(s) encontrado(s)
                        </span>
                        {totalPaginas > 1 && (
                          <span>
                            Página {paginaAtual} de {totalPaginas}
                          </span>
                        )}
                      </div>

                      {produtosPaginados.map((produto) => {
                        const estoqueDisponivel = getEstoqueDisponivel(
                          produto.id,
                        );

                        return (
                          <button
                            key={produto.id}
                            className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex justify-between items-center"
                            onClick={() => {
                              setProdutoSelecionado(produto);
                              setBusca(produto.nome);
                            }}
                          >
                            <div className="flex-1">
                              <p className="font-medium">{produto.nome}</p>
                              <p className="text-xs text-gray-500">
                                {produto.codigo} • Estoque: {estoqueDisponivel}{" "}
                                {estoqueDisponivel === 1 ? "un" : "uns"}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold">
                                {formatarMoeda(produto.preco_venda)}
                              </p>
                              {estoqueDisponivel === 0 && (
                                <Chip color="danger" size="sm" variant="flat">
                                  Sem estoque
                                </Chip>
                              )}
                              {estoqueDisponivel > 0 &&
                                estoqueDisponivel <= 5 && (
                                  <Chip
                                    color="warning"
                                    size="sm"
                                    variant="flat"
                                  >
                                    Baixo
                                  </Chip>
                                )}
                            </div>
                          </button>
                        );
                      })}

                      {/* Paginação */}
                      {totalPaginas > 1 && (
                        <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-900 px-4 py-2 border-t flex justify-between items-center">
                          <Button
                            isDisabled={paginaAtual === 1}
                            size="sm"
                            variant="flat"
                            onClick={() => setPaginaAtual((p) => p - 1)}
                          >
                            Anterior
                          </Button>
                          <span className="text-sm">
                            {paginaAtual} / {totalPaginas}
                          </span>
                          <Button
                            isDisabled={paginaAtual === totalPaginas}
                            size="sm"
                            variant="flat"
                            onClick={() => setPaginaAtual((p) => p + 1)}
                          >
                            Próxima
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <Input
                    className="w-24"
                    disabled={salvando}
                    max={
                      produtoSelecionado
                        ? getEstoqueDisponivel(produtoSelecionado.id)
                        : undefined
                    }
                    min={1}
                    placeholder="Qtd"
                    type="number"
                    value={String(quantidade)}
                    onChange={(e) => setQuantidade(Number(e.target.value))}
                  />
                  {produtoSelecionado && (
                    <p className="text-xs text-gray-500 text-center">
                      Disp: {getEstoqueDisponivel(produtoSelecionado.id)}
                    </p>
                  )}
                </div>
                <Button
                  color="primary"
                  isDisabled={
                    !produtoSelecionado || quantidade <= 0 || salvando
                  }
                  startContent={<Plus className="w-4 h-4" />}
                  onClick={adicionarItem}
                >
                  Adicionar
                </Button>
              </div>
            </CardBody>
          </Card>

          {/* Seção: Itens da Venda */}
          <Card>
            <CardBody>
              <h3 className="text-lg font-semibold mb-3">Itens da Venda</h3>
              <div className="space-y-2">
                {itens.map((item, index) => (
                  <div
                    key={index}
                    className={`flex items-center gap-3 p-3 rounded-lg ${
                      item.acao === "remover"
                        ? "bg-danger-50 dark:bg-danger-900/20 opacity-50"
                        : item.acao === "adicionar"
                          ? "bg-success-50 dark:bg-success-900/20"
                          : item.acao === "alterar"
                            ? "bg-warning-50 dark:bg-warning-900/20"
                            : "bg-gray-50 dark:bg-gray-800"
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{item.produto_nome}</p>
                        {item.acao === "adicionar" && (
                          <Chip color="success" size="sm" variant="flat">
                            Novo
                          </Chip>
                        )}
                        {item.acao === "alterar" && (
                          <Chip color="warning" size="sm" variant="flat">
                            Alterado
                          </Chip>
                        )}
                        {item.acao === "remover" && (
                          <Chip color="danger" size="sm" variant="flat">
                            Removido
                          </Chip>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">
                        Código: {item.produto_codigo} • Estoque na loja:{" "}
                        {getEstoqueRealLoja(item.produto_id)}
                      </p>
                    </div>

                    {item.acao !== "remover" && (
                      <>
                        <div className="flex items-center gap-2">
                          <Button
                            isIconOnly
                            isDisabled={item.quantidade <= 1 || salvando}
                            size="sm"
                            variant="flat"
                            onClick={() =>
                              alterarQuantidade(index, item.quantidade - 1)
                            }
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <span className="w-12 text-center font-medium">
                            {item.quantidade}
                          </span>
                          <Button
                            isIconOnly
                            isDisabled={salvando}
                            size="sm"
                            variant="flat"
                            onClick={() =>
                              alterarQuantidade(index, item.quantidade + 1)
                            }
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="text-right min-w-[150px]">
                          {precoEditando === index ? (
                            <div className="flex items-center gap-2">
                              <Input
                                className="w-24"
                                min="0.01"
                                size="sm"
                                startContent={
                                  <span className="text-default-400 text-xs">
                                    R$
                                  </span>
                                }
                                step="0.01"
                                type="number"
                                value={precoTemporario}
                                onChange={(e) =>
                                  setPrecoTemporario(e.target.value)
                                }
                              />
                              <Button
                                color="primary"
                                size="sm"
                                onClick={() => {
                                  const novoPreco = parseFloat(precoTemporario);

                                  if (novoPreco > 0) {
                                    alterarPreco(index, novoPreco);
                                  }
                                }}
                              >
                                OK
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 justify-end">
                              <div>
                                <p className="text-sm text-gray-500">
                                  {formatarMoeda(item.preco_unitario)}
                                </p>
                                <p className="font-bold">
                                  {formatarMoeda(item.subtotal)}
                                </p>
                              </div>
                              <Button
                                isIconOnly
                                isDisabled={salvando}
                                size="sm"
                                title="Editar preço"
                                variant="flat"
                                onClick={() => {
                                  setPrecoEditando(index);
                                  setPrecoTemporario(
                                    item.preco_unitario.toString(),
                                  );
                                }}
                              >
                                <Edit2 className="w-3 h-3" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </>
                    )}

                    {item.acao === "remover" ? (
                      <Button
                        color="success"
                        isDisabled={salvando}
                        size="sm"
                        variant="flat"
                        onClick={() => restaurarItem(index)}
                      >
                        Restaurar
                      </Button>
                    ) : (
                      <Button
                        isIconOnly
                        color="danger"
                        isDisabled={salvando}
                        size="sm"
                        variant="flat"
                        onClick={() => removerItem(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}

                {itens.filter((i) => i.acao !== "remover").length === 0 && (
                  <p className="text-center text-gray-500 py-4">
                    Adicione pelo menos um produto à venda
                  </p>
                )}
              </div>

              <Divider className="my-4" />

              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">Total:</span>
                <span className="text-2xl font-bold">
                  {formatarMoeda(calcularTotal())}
                </span>
              </div>
            </CardBody>
          </Card>

          {/* Seção: Informações Adicionais */}
          <div className="space-y-4">
            {venda.tipo === "fiada" && (
              <div>
                <label
                  className="text-sm font-medium mb-2 block"
                  htmlFor="editar-venda-data-prevista"
                >
                  Data Prevista de Pagamento
                </label>
                <Input
                  disabled={salvando}
                  id="editar-venda-data-prevista"
                  placeholder="Selecione a data"
                  type="date"
                  value={dataPrevista}
                  onChange={(e) => setDataPrevista(e.target.value)}
                />
              </div>
            )}

            <div>
              <label
                className="text-sm font-medium mb-2 block"
                htmlFor="editar-venda-observacoes"
              >
                Observações
              </label>
              <Textarea
                disabled={salvando}
                id="editar-venda-observacoes"
                maxRows={6}
                minRows={3}
                placeholder="Adicione observações sobre a venda..."
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
              />
            </div>
          </div>
        </ModalBody>

        <ModalFooter>
          <Button
            color="danger"
            disabled={salvando}
            variant="flat"
            onPress={handleClose}
          >
            Cancelar
          </Button>
          <Button
            color="primary"
            disabled={
              salvando || itens.filter((i) => i.acao !== "remover").length === 0
            }
            isLoading={salvando}
            onPress={handleSubmit}
          >
            Salvar Alterações
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
