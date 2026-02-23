"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Button } from "@heroui/button";
import { Select, SelectItem } from "@heroui/select";
import { Input, Textarea } from "@heroui/input";
import { Card, CardBody } from "@heroui/card";
import { Chip } from "@heroui/chip";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@heroui/table";
import {
  MagnifyingGlassIcon,
  ArrowRightIcon,
  TrashIcon,
  XMarkIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

import { useToast } from "@/components/Toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabaseClient";

interface Loja {
  id: number;
  nome: string;
}

interface EstoqueLoja {
  id_loja: number;
  loja_nome: string;
  quantidade: number;
}

interface Produto {
  id: string;
  descricao: string;
  marca?: string;
  codigo_fabricante?: string;
  estoques_lojas: EstoqueLoja[];
}

interface ItemTransferencia {
  produto_id: string;
  produto_descricao: string;
  produto_marca?: string;
  produto_codigo?: string;
  quantidade_transferir: number;
  loja_destino_id: number;
  estoque_origem: number;
  estoques_todas_lojas: EstoqueLoja[];
}

interface NovaTransferenciaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function NovaTransferenciaModal({
  isOpen,
  onClose,
  onSuccess,
}: NovaTransferenciaModalProps) {
  const toast = useToast();
  const { verificarSessao, usuario } = useAuth();

  const [lojas, setLojas] = useState<Loja[]>([]);
  const [lojaOrigemId, setLojaOrigemId] = useState<string>("");
  const [buscaProduto, setBuscaProduto] = useState("");
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loadingProdutos, setLoadingProdutos] = useState(false);
  const [itensTransferencia, setItensTransferencia] = useState<
    ItemTransferencia[]
  >([]);
  const [observacao, setObservacao] = useState("");
  const [loading, setLoading] = useState(false);

  // Carregar lojas ao abrir modal
  useEffect(() => {
    if (isOpen) {
      carregarLojas();
      resetarEstado();
    }
  }, [isOpen]);

  // Buscar produtos quando mudar loja origem ou busca
  useEffect(() => {
    if (lojaOrigemId && buscaProduto.length >= 2) {
      buscarProdutos();
    } else {
      setProdutos([]);
    }
  }, [lojaOrigemId, buscaProduto]);

  const carregarLojas = async () => {
    try {
      const { data, error } = await supabase
        .from("lojas")
        .select("id, nome")
        .eq("ativo", true)
        .order("nome");

      if (error) throw error;
      setLojas(data || []);
    } catch (error) {
      console.error("Erro ao carregar lojas:", error);
      toast.error("Erro ao carregar lojas");
    }
  };

  const buscarProdutos = async () => {
    if (!lojaOrigemId) return;

    setLoadingProdutos(true);
    try {
      const { data, error } = await supabase
        .from("produtos")
        .select(
          `
          id,
          descricao,
          marca,
          codigo_fabricante,
          estoque_lojas:estoque_lojas(
            id_loja,
            quantidade,
            lojas:id_loja(nome)
          )
        `,
        )
        .ilike("descricao", `%${buscaProduto}%`)
        .eq("ativo", true)
        .limit(20);

      if (error) throw error;

      // Formatar dados e filtrar produtos com estoque na loja origem
      const produtosFormatados = (data || [])
        .map((p: any) => ({
          id: p.id,
          descricao: p.descricao,
          marca: p.marca,
          codigo_fabricante: p.codigo_fabricante,
          estoques_lojas: (p.estoque_lojas || []).map((e: any) => ({
            id_loja: e.id_loja,
            loja_nome: e.lojas?.nome || "",
            quantidade: e.quantidade || 0,
          })),
        }))
        .filter((p) => {
          const estoqueOrigem = p.estoques_lojas.find(
            (e: EstoqueLoja) => e.id_loja === parseInt(lojaOrigemId),
          );

          return estoqueOrigem && estoqueOrigem.quantidade > 0;
        });

      setProdutos(produtosFormatados);
    } catch (error) {
      console.error("Erro ao buscar produtos:", error);
      toast.error("Erro ao buscar produtos");
    } finally {
      setLoadingProdutos(false);
    }
  };

  const adicionarProduto = (produto: Produto) => {
    const estoqueOrigem = produto.estoques_lojas.find(
      (e) => e.id_loja === parseInt(lojaOrigemId),
    );

    if (!estoqueOrigem || estoqueOrigem.quantidade <= 0) {
      toast.error("Produto sem estoque na loja de origem");

      return;
    }

    // Verificar se produto já foi adicionado
    if (itensTransferencia.some((i) => i.produto_id === produto.id)) {
      toast.error("Produto já adicionado");

      return;
    }

    const novoItem: ItemTransferencia = {
      produto_id: produto.id,
      produto_descricao: produto.descricao,
      produto_marca: produto.marca,
      produto_codigo: produto.codigo_fabricante,
      quantidade_transferir: 1,
      loja_destino_id: 0, // Será selecionado na tabela
      estoque_origem: estoqueOrigem.quantidade,
      estoques_todas_lojas: produto.estoques_lojas,
    };

    setItensTransferencia([...itensTransferencia, novoItem]);
    toast.success("Produto adicionado à transferência");
    setBuscaProduto("");
    setProdutos([]);
  };

  const removerItem = (produtoId: string) => {
    setItensTransferencia(
      itensTransferencia.filter((i) => i.produto_id !== produtoId),
    );
    toast.info("Produto removido");
  };

  const atualizarQuantidade = (produtoId: string, quantidade: number) => {
    setItensTransferencia(
      itensTransferencia.map((item) =>
        item.produto_id === produtoId
          ? { ...item, quantidade_transferir: quantidade }
          : item,
      ),
    );
  };

  const atualizarLojaDestino = (produtoId: string, lojaDestinoId: number) => {
    setItensTransferencia(
      itensTransferencia.map((item) =>
        item.produto_id === produtoId
          ? { ...item, loja_destino_id: lojaDestinoId }
          : item,
      ),
    );
  };

  const resetarEstado = () => {
    setLojaOrigemId("");
    setBuscaProduto("");
    setProdutos([]);
    setItensTransferencia([]);
    setObservacao("");
  };

  const handleCriarTransferencia = async () => {
    // Validações
    if (!lojaOrigemId) {
      toast.error("Selecione a loja de origem");

      return;
    }

    if (itensTransferencia.length === 0) {
      toast.error("Adicione pelo menos um produto");

      return;
    }

    // Validar se todos têm quantidade e destino
    const itensSemDestino = itensTransferencia.filter(
      (i) => !i.loja_destino_id,
    );

    if (itensSemDestino.length > 0) {
      toast.error(
        `${itensSemDestino.length} produto(s) sem loja de destino definida`,
      );

      return;
    }

    const itensComQuantidadeInvalida = itensTransferencia.filter(
      (i) =>
        i.quantidade_transferir <= 0 ||
        i.quantidade_transferir > i.estoque_origem,
    );

    if (itensComQuantidadeInvalida.length > 0) {
      toast.error("Verifique as quantidades dos produtos");

      return;
    }

    // Validar se origem = destino
    const itensOrigemDestinoIgual = itensTransferencia.filter(
      (i) => i.loja_destino_id === parseInt(lojaOrigemId),
    );

    if (itensOrigemDestinoIgual.length > 0) {
      toast.error("Loja de origem e destino não podem ser iguais");

      return;
    }

    // Verificar sessão
    const sessaoValida = await verificarSessao();

    if (!sessaoValida || !usuario?.id) {
      return;
    }

    setLoading(true);
    try {
      // Agrupar itens por loja destino
      const itensPorDestino: Record<number, ItemTransferencia[]> = {};

      itensTransferencia.forEach((item) => {
        if (!itensPorDestino[item.loja_destino_id]) {
          itensPorDestino[item.loja_destino_id] = [];
        }
        itensPorDestino[item.loja_destino_id].push(item);
      });

      let totalTransferenciasCriadas = 0;

      // Criar uma transferência para cada loja destino
      for (const [lojaDestinoId, itens] of Object.entries(itensPorDestino)) {
        const { data: transferencia, error: errorTransferencia } =
          await supabase
            .from("transferencias")
            .insert({
              loja_origem_id: parseInt(lojaOrigemId),
              loja_destino_id: parseInt(lojaDestinoId),
              status: "pendente",
              observacao: observacao || null,
              usuario_id: usuario.id,
            })
            .select()
            .single();

        if (errorTransferencia || !transferencia) {
          throw new Error("Erro ao criar transferência");
        }

        // Inserir itens
        const itensParaInserir = itens.map((item) => ({
          transferencia_id: transferencia.id,
          produto_id: item.produto_id,
          quantidade: item.quantidade_transferir,
        }));

        const { error: errorItens } = await supabase
          .from("transferencias_itens")
          .insert(itensParaInserir);

        if (errorItens) {
          // Rollback: remover transferência
          await supabase
            .from("transferencias")
            .delete()
            .eq("id", transferencia.id);
          throw new Error("Erro ao adicionar itens");
        }

        totalTransferenciasCriadas++;
      }

      toast.success(
        `${totalTransferenciasCriadas} transferência(s) criada(s) com sucesso!`,
      );
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Erro ao criar transferência:", error);
      toast.error(error.message || "Erro ao criar transferência");
    } finally {
      setLoading(false);
    }
  };

  const calcularEstoqueAposTransferencia = (item: ItemTransferencia) => {
    return item.estoque_origem - item.quantidade_transferir;
  };

  const lojaOrigemNome = useMemo(() => {
    return lojas.find((l) => l.id === parseInt(lojaOrigemId))?.nome || "";
  }, [lojas, lojaOrigemId]);

  return (
    <Modal isOpen={isOpen} scrollBehavior="inside" size="5xl" onClose={onClose}>
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <ArrowRightIcon className="h-5 w-5 text-primary" />
            <span>Nova Transferência de Produtos</span>
          </div>
          <span className="text-sm font-normal text-default-500">
            Selecione a loja de origem e adicione produtos para transferir
          </span>
        </ModalHeader>

        <ModalBody>
          {/* Seleção de Loja de Origem */}
          <Card className="mb-4">
            <CardBody>
              <Select
                isRequired
                isDisabled={loading}
                label="Loja de Origem"
                placeholder="Selecione a loja de origem"
                selectedKeys={lojaOrigemId ? [lojaOrigemId] : []}
                onSelectionChange={(keys) => {
                  const selected = Array.from(keys)[0] as string;

                  setLojaOrigemId(selected);
                  setItensTransferencia([]); // Limpar itens ao trocar loja
                }}
              >
                {lojas.map((loja) => (
                  <SelectItem key={loja.id.toString()}>{loja.nome}</SelectItem>
                ))}
              </Select>
            </CardBody>
          </Card>

          {/* Busca de Produtos */}
          {lojaOrigemId && (
            <Card className="mb-4">
              <CardBody>
                <div className="flex items-center gap-2">
                  <Input
                    isClearable
                    isDisabled={loading}
                    placeholder="Pesquisar produtos (mínimo 2 caracteres)..."
                    startContent={<MagnifyingGlassIcon className="h-4 w-4" />}
                    value={buscaProduto}
                    onClear={() => {
                      setBuscaProduto("");
                      setProdutos([]);
                    }}
                    onValueChange={setBuscaProduto}
                  />
                </div>

                {/* Resultados da Busca */}
                {loadingProdutos && (
                  <div className="mt-2 text-center text-sm text-default-500">
                    Buscando produtos...
                  </div>
                )}

                {produtos.length > 0 && (
                  <div className="mt-2 max-h-60 overflow-y-auto space-y-1">
                    {produtos.map((produto) => {
                      const estoqueOrigem = produto.estoques_lojas.find(
                        (e) => e.id_loja === parseInt(lojaOrigemId),
                      );

                      return (
                        <Card
                          key={produto.id}
                          isPressable
                          className="cursor-pointer hover:bg-default-100"
                          onPress={() => adicionarProduto(produto)}
                        >
                          <CardBody className="py-2">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium">
                                  {produto.descricao}
                                </p>
                                <p className="text-xs text-default-500">
                                  {produto.marca && `${produto.marca} • `}
                                  {produto.codigo_fabricante &&
                                    `Cód: ${produto.codigo_fabricante}`}
                                </p>
                              </div>
                              <Chip color="primary" size="sm" variant="flat">
                                Estoque: {estoqueOrigem?.quantidade || 0}
                              </Chip>
                            </div>
                          </CardBody>
                        </Card>
                      );
                    })}
                  </div>
                )}

                {!loadingProdutos &&
                  produtos.length === 0 &&
                  buscaProduto.length >= 2 && (
                    <div className="mt-2 text-center text-sm text-default-500">
                      Nenhum produto encontrado com estoque em {lojaOrigemNome}
                    </div>
                  )}
              </CardBody>
            </Card>
          )}

          {/* Tabela de Itens da Transferência */}
          {itensTransferencia.length > 0 && (
            <Card>
              <CardBody>
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-lg font-semibold">
                    Produtos a Transferir ({itensTransferencia.length})
                  </h3>
                </div>

                <Table aria-label="Itens da transferência">
                  <TableHeader>
                    <TableColumn>PRODUTO</TableColumn>
                    <TableColumn>ESTOQUE ORIGEM</TableColumn>
                    <TableColumn>QUANTIDADE</TableColumn>
                    <TableColumn>LOJA DESTINO</TableColumn>
                    <TableColumn>ESTOQUE DESTINO ATUAL</TableColumn>
                    <TableColumn>ESTOQUE APÓS</TableColumn>
                    <TableColumn>AÇÕES</TableColumn>
                  </TableHeader>
                  <TableBody>
                    {itensTransferencia.map((item) => {
                      const estoqueDestino = item.estoques_todas_lojas.find(
                        (e) => e.id_loja === item.loja_destino_id,
                      );
                      const estoqueDestinoAtual =
                        estoqueDestino?.quantidade || 0;
                      const estoqueDestinoApos =
                        estoqueDestinoAtual + item.quantidade_transferir;

                      return (
                        <TableRow key={item.produto_id}>
                          <TableCell>
                            <div>
                              <p className="font-medium text-sm">
                                {item.produto_descricao}
                              </p>
                              <p className="text-xs text-default-500">
                                {item.produto_marca &&
                                  `${item.produto_marca} • `}
                                {item.produto_codigo}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Chip color="default" size="sm" variant="flat">
                              {item.estoque_origem}
                            </Chip>
                          </TableCell>
                          <TableCell>
                            <Input
                              className="w-20"
                              isDisabled={loading}
                              max={item.estoque_origem}
                              min={1}
                              size="sm"
                              type="number"
                              value={item.quantidade_transferir.toString()}
                              onValueChange={(value) =>
                                atualizarQuantidade(
                                  item.produto_id,
                                  parseInt(value) || 1,
                                )
                              }
                            />
                          </TableCell>
                          <TableCell>
                            <Select
                              className="w-40"
                              isDisabled={loading}
                              placeholder="Destino"
                              selectedKeys={
                                item.loja_destino_id
                                  ? [item.loja_destino_id.toString()]
                                  : []
                              }
                              size="sm"
                              onSelectionChange={(keys) => {
                                const selected = Array.from(keys)[0] as string;

                                atualizarLojaDestino(
                                  item.produto_id,
                                  parseInt(selected),
                                );
                              }}
                            >
                              {lojas
                                .filter((l) => l.id !== parseInt(lojaOrigemId))
                                .map((loja) => (
                                  <SelectItem key={loja.id.toString()}>
                                    {loja.nome}
                                  </SelectItem>
                                ))}
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Chip
                              color={
                                estoqueDestinoAtual > 0 ? "default" : "warning"
                              }
                              size="sm"
                              variant="flat"
                            >
                              {estoqueDestinoAtual}
                            </Chip>
                          </TableCell>
                          <TableCell>
                            <Chip color="success" size="sm" variant="flat">
                              {estoqueDestinoApos}
                            </Chip>
                          </TableCell>
                          <TableCell>
                            <Button
                              isIconOnly
                              color="danger"
                              isDisabled={loading}
                              size="sm"
                              variant="light"
                              onPress={() => removerItem(item.produto_id)}
                            >
                              <TrashIcon className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardBody>
            </Card>
          )}

          {/* Observação */}
          {itensTransferencia.length > 0 && (
            <Textarea
              isDisabled={loading}
              label="Observação (opcional)"
              maxLength={500}
              placeholder="Adicione uma observação sobre esta transferência..."
              value={observacao}
              onValueChange={setObservacao}
            />
          )}
        </ModalBody>

        <ModalFooter>
          <Button
            color="danger"
            isDisabled={loading}
            startContent={<XMarkIcon className="h-4 w-4" />}
            variant="light"
            onPress={onClose}
          >
            Cancelar
          </Button>
          <Button
            color="primary"
            isDisabled={itensTransferencia.length === 0}
            isLoading={loading}
            startContent={!loading && <CheckCircleIcon className="h-4 w-4" />}
            onPress={handleCriarTransferencia}
          >
            Criar Transferência
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
