"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Select, SelectItem } from "@heroui/select";
import { Input, Textarea } from "@heroui/input";
import { Chip } from "@heroui/chip";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@heroui/table";
import { useToast } from "@/components/Toast";
import { useAuth } from "@/hooks/useAuth";
import {
  MagnifyingGlassIcon,
  ArrowRightIcon,
  TrashIcon,
  XMarkIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";
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
  quantidade_transferir?: number;
  loja_destino_id: number;
  estoque_origem: number;
  estoques_todas_lojas: EstoqueLoja[];
}

export default function NovaTransferenciaPage() {
  const router = useRouter();
  const toast = useToast();
  const { verificarSessao, usuario } = useAuth();

  const [lojas, setLojas] = useState<Loja[]>([]);
  const [lojaOrigemId, setLojaOrigemId] = useState<string>("");
  const [lojaDestinoPadrao, setLojaDestinoPadrao] = useState<string>("");
  const [buscaProduto, setBuscaProduto] = useState("");
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loadingProdutos, setLoadingProdutos] = useState(false);
  const [totalProdutosLoja, setTotalProdutosLoja] = useState<number>(0);
  const [paginaProdutos, setPaginaProdutos] = useState(1);
  const produtosPorPagina = 10;
  const [itensTransferencia, setItensTransferencia] = useState<
    ItemTransferencia[]
  >([]);
  const [observacao, setObservacao] = useState("");
  const [loading, setLoading] = useState(false);

  // Carregar lojas ao montar
  useEffect(() => {
    carregarLojas();
  }, []);

  // Buscar produtos quando mudar loja origem ou busca
  useEffect(() => {
    if (lojaOrigemId && buscaProduto.length > 0) {
      buscarProdutos();
    } else {
      setProdutos([]);
    }
  }, [lojaOrigemId, buscaProduto]);

  // Buscar total de produtos na loja quando mudar loja origem
  useEffect(() => {
    if (lojaOrigemId) {
      buscarTotalProdutosLoja();
    } else {
      setTotalProdutosLoja(0);
    }
  }, [lojaOrigemId]);

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
      // Separar os termos de busca por espaços
      const termosBusca = buscaProduto.trim().split(/\s+/);

      // Construir a query
      let query = supabase
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
        `
        )
        .eq("ativo", true);

      // Aplicar filtro para cada termo (busca dinâmica)
      termosBusca.forEach((termo) => {
        if (termo.length > 0) {
          query = query.ilike("descricao", `%${termo}%`);
        }
      });

      const { data, error } = await query.limit(20);

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
            (e: EstoqueLoja) => e.id_loja === parseInt(lojaOrigemId)
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

  const buscarTotalProdutosLoja = async () => {
    if (!lojaOrigemId) return;

    try {
      let allProdutos: any[] = [];
      let page = 0;
      const pageSize = 1000;
      let hasMore = true;

      // Buscar em lotes de 1000 registros
      while (hasMore) {
        const { data, error } = await supabase
          .from("estoque_lojas")
          .select("id_produto")
          .eq("id_loja", parseInt(lojaOrigemId))
          .gt("quantidade", 0)
          .range(page * pageSize, (page + 1) * pageSize - 1);

        if (error) throw error;

        if (data && data.length > 0) {
          allProdutos = [...allProdutos, ...data];
          hasMore = data.length === pageSize;
          page++;
        } else {
          hasMore = false;
        }
      }

      // Contar produtos únicos
      const produtosUnicos = new Set(
        allProdutos.map((item) => item.id_produto)
      );
      setTotalProdutosLoja(produtosUnicos.size);
    } catch (error) {
      console.error("Erro ao buscar total de produtos:", error);
      setTotalProdutosLoja(0);
    }
  };

  const adicionarProduto = (produto: Produto) => {
    const estoqueOrigem = produto.estoques_lojas.find(
      (e) => e.id_loja === parseInt(lojaOrigemId)
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
      quantidade_transferir: undefined,
      loja_destino_id: lojaDestinoPadrao ? parseInt(lojaDestinoPadrao) : 0,
      estoque_origem: estoqueOrigem.quantidade,
      estoques_todas_lojas: produto.estoques_lojas,
    };

    setItensTransferencia([...itensTransferencia, novoItem]);
    toast.success("Produto adicionado à transferência");
  };

  const removerItem = (produtoId: string) => {
    setItensTransferencia(
      itensTransferencia.filter((i) => i.produto_id !== produtoId)
    );
    toast.info("Produto removido");
  };

  const atualizarQuantidade = (produtoId: string, quantidade?: number) => {
    setItensTransferencia(
      itensTransferencia.map((item) =>
        item.produto_id === produtoId
          ? { ...item, quantidade_transferir: quantidade }
          : item
      )
    );
  };

  const atualizarLojaDestino = (produtoId: string, lojaDestinoId: number) => {
    setItensTransferencia(
      itensTransferencia.map((item) =>
        item.produto_id === produtoId
          ? { ...item, loja_destino_id: lojaDestinoId }
          : item
      )
    );
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

    const itensSemDestino = itensTransferencia.filter(
      (i) => !i.loja_destino_id
    );
    if (itensSemDestino.length > 0) {
      toast.error(
        `${itensSemDestino.length} produto(s) sem loja de destino definida`
      );
      return;
    }

    const itensComQuantidadeInvalida = itensTransferencia.filter(
      (i) =>
        !i.quantidade_transferir ||
        i.quantidade_transferir <= 0 ||
        i.quantidade_transferir > i.estoque_origem
    );
    if (itensComQuantidadeInvalida.length > 0) {
      toast.error("Verifique as quantidades dos produtos");
      return;
    }

    const itensOrigemDestinoIgual = itensTransferencia.filter(
      (i) => i.loja_destino_id === parseInt(lojaOrigemId)
    );
    if (itensOrigemDestinoIgual.length > 0) {
      toast.error("Loja de origem e destino não podem ser iguais");
      return;
    }

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

        const itensParaInserir = itens.map((item) => ({
          transferencia_id: transferencia.id,
          produto_id: item.produto_id,
          quantidade: item.quantidade_transferir,
        }));

        const { error: errorItens } = await supabase
          .from("transferencias_itens")
          .insert(itensParaInserir);

        if (errorItens) {
          await supabase
            .from("transferencias")
            .delete()
            .eq("id", transferencia.id);
          throw new Error("Erro ao adicionar itens");
        }

        totalTransferenciasCriadas++;
      }

      toast.success(
        `${totalTransferenciasCriadas} transferência(s) criada(s) com sucesso!`
      );
      router.push("/sistema/transferencias");
    } catch (error: any) {
      console.error("Erro ao criar transferência:", error);
      toast.error(error.message || "Erro ao criar transferência");
    } finally {
      setLoading(false);
    }
  };

  const lojaOrigemNome = useMemo(() => {
    return lojas.find((l) => l.id === parseInt(lojaOrigemId))?.nome || "";
  }, [lojas, lojaOrigemId]);

  return (
    <div className="container mx-auto max-w-7xl px-6 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              isIconOnly
              variant="light"
              onPress={() => router.push("/sistema/transferencias")}
              isDisabled={loading}
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <ArrowRightIcon className="h-6 w-6 text-primary" />
                Nova Transferência de Produtos
              </h1>
              <p className="text-default-500 text-sm mt-1">
                Selecione a loja de origem e adicione produtos para transferir
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Layout em Coluna Única */}
      <div className="space-y-6">
        {/* Loja de Origem e Destino Padrão */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">1. Selecione as Lojas</h3>
          </CardHeader>
          <CardBody className="space-y-4">
            <Select
              label="Loja de Origem"
              placeholder="Escolha a loja de origem"
              selectedKeys={lojaOrigemId ? [lojaOrigemId] : []}
              onSelectionChange={(keys) => {
                const selected = Array.from(keys)[0] as string;
                setLojaOrigemId(selected);
                setItensTransferencia([]);
                // Resetar loja destino padrão se for a mesma
                if (lojaDestinoPadrao === selected) {
                  setLojaDestinoPadrao("");
                }
              }}
              isRequired
              isDisabled={loading}
              size="lg"
            >
              {lojas.map((loja) => (
                <SelectItem key={loja.id.toString()}>{loja.nome}</SelectItem>
              ))}
            </Select>

            {lojaOrigemId && (
              <Select
                label="Loja de Destino Padrão (opcional)"
                placeholder="Selecione uma loja de destino padrão"
                description="Os produtos adicionados terão esta loja como destino inicial"
                selectedKeys={lojaDestinoPadrao ? [lojaDestinoPadrao] : []}
                onSelectionChange={(keys) => {
                  const selected = Array.from(keys)[0] as string;
                  setLojaDestinoPadrao(selected);
                }}
                isDisabled={loading}
                size="lg"
              >
                {lojas
                  .filter((l) => l.id !== parseInt(lojaOrigemId))
                  .map((loja) => (
                    <SelectItem key={loja.id.toString()}>
                      {loja.nome}
                    </SelectItem>
                  ))}
              </Select>
            )}
          </CardBody>
        </Card>

        {/* Busca de Produtos */}
        {lojaOrigemId && (
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-1">
                <h3 className="text-lg font-semibold">
                  2. Buscar e Adicionar Produtos
                </h3>
                <p className="text-sm text-default-500">
                  {totalProdutosLoja > 0
                    ? `${totalProdutosLoja} produto${totalProdutosLoja > 1 ? "s" : ""} disponível${totalProdutosLoja > 1 ? "is" : ""} nesta loja`
                    : "Carregando produtos disponíveis..."}
                </p>
              </div>
            </CardHeader>
            <CardBody className="space-y-3">
              <Input
                placeholder="Digite o nome do produto para buscar..."
                value={buscaProduto}
                onValueChange={setBuscaProduto}
                startContent={<MagnifyingGlassIcon className="h-5 w-5" />}
                isDisabled={loading}
                isClearable
                onClear={() => {
                  setBuscaProduto("");
                  setProdutos([]);
                }}
                size="lg"
              />

              {loadingProdutos && (
                <div className="text-center text-sm text-default-500 py-4">
                  Buscando produtos...
                </div>
              )}

              {produtos.length > 0 &&
                (() => {
                  const totalPaginas = Math.ceil(
                    produtos.length / produtosPorPagina
                  );
                  const indiceInicio = (paginaProdutos - 1) * produtosPorPagina;
                  const indiceFim = indiceInicio + produtosPorPagina;
                  const produtosPaginados = produtos.slice(
                    indiceInicio,
                    indiceFim
                  );

                  return (
                    <div className="space-y-3">
                      <Table aria-label="Tabela de produtos encontrados">
                        <TableHeader>
                          <TableColumn>PRODUTO</TableColumn>
                          <TableColumn>MARCA</TableColumn>
                          <TableColumn>CÓDIGO</TableColumn>
                          <TableColumn>ESTOQUE ORIGEM</TableColumn>
                          <TableColumn>OUTRAS LOJAS</TableColumn>
                          <TableColumn>AÇÃO</TableColumn>
                        </TableHeader>
                        <TableBody>
                          {produtosPaginados.map((produto) => {
                            const estoqueOrigem = produto.estoques_lojas.find(
                              (e) => e.id_loja === parseInt(lojaOrigemId)
                            );
                            const outrasLojas = produto.estoques_lojas.filter(
                              (e) => e.id_loja !== parseInt(lojaOrigemId)
                            );
                            const jaAdicionado = itensTransferencia.some(
                              (i) => i.produto_id === produto.id
                            );
                            return (
                              <TableRow key={produto.id}>
                                <TableCell>{produto.descricao}</TableCell>
                                <TableCell>{produto.marca || "-"}</TableCell>
                                <TableCell>
                                  {produto.codigo_fabricante || "-"}
                                </TableCell>
                                <TableCell>
                                  <Chip
                                    color="primary"
                                    variant="flat"
                                    size="sm"
                                  >
                                    {estoqueOrigem?.quantidade || 0}
                                  </Chip>
                                </TableCell>
                                <TableCell>
                                  <div className="flex flex-wrap gap-1">
                                    {outrasLojas.length > 0 ? (
                                      outrasLojas.map((estoque) => (
                                        <Chip
                                          key={estoque.id_loja}
                                          size="sm"
                                          variant="flat"
                                          color={
                                            estoque.quantidade > 0
                                              ? "success"
                                              : "default"
                                          }
                                        >
                                          {estoque.loja_nome}:{" "}
                                          {estoque.quantidade}
                                        </Chip>
                                      ))
                                    ) : (
                                      <span className="text-xs text-default-400">
                                        -
                                      </span>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  {jaAdicionado ? (
                                    <Button
                                      size="sm"
                                      color="danger"
                                      variant="flat"
                                      onPress={() => removerItem(produto.id)}
                                    >
                                      Remover
                                    </Button>
                                  ) : (
                                    <Button
                                      size="sm"
                                      color="primary"
                                      onPress={() => adicionarProduto(produto)}
                                    >
                                      Adicionar
                                    </Button>
                                  )}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>

                      {totalPaginas > 1 && (
                        <div className="flex justify-center items-center gap-2">
                          <Button
                            size="sm"
                            variant="flat"
                            isDisabled={paginaProdutos === 1}
                            onPress={() =>
                              setPaginaProdutos(paginaProdutos - 1)
                            }
                          >
                            Anterior
                          </Button>
                          <span className="text-sm text-default-500">
                            Página {paginaProdutos} de {totalPaginas}
                          </span>
                          <Button
                            size="sm"
                            variant="flat"
                            isDisabled={paginaProdutos === totalPaginas}
                            onPress={() =>
                              setPaginaProdutos(paginaProdutos + 1)
                            }
                          >
                            Próxima
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })()}

              {!loadingProdutos &&
                produtos.length === 0 &&
                buscaProduto.length > 0 && (
                  <div className="text-center text-sm text-default-500 py-4">
                    Nenhum produto encontrado com estoque em {lojaOrigemNome}
                  </div>
                )}

              {buscaProduto.length === 0 && (
                <div className="text-center text-sm text-default-500 py-4">
                  Digite o nome do produto para começar a busca
                </div>
              )}
            </CardBody>
          </Card>
        )}

        {/* Tabela de Itens */}
        {itensTransferencia.length > 0 && (
          <>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between w-full">
                  <h3 className="text-lg font-semibold">
                    3. Produtos a Transferir ({itensTransferencia.length})
                  </h3>
                </div>
              </CardHeader>
              <CardBody>
                <div className="overflow-x-auto">
                  <Table aria-label="Itens da transferência">
                    <TableHeader>
                      <TableColumn>PRODUTO</TableColumn>
                      <TableColumn>ESTOQUE ORIGEM</TableColumn>
                      <TableColumn>QUANTIDADE</TableColumn>
                      <TableColumn>LOJA DESTINO</TableColumn>
                      <TableColumn>ESTOQUE DESTINO ATUAL</TableColumn>
                      <TableColumn>ESTOQUE APÓS</TableColumn>
                      <TableColumn width={50}>AÇÕES</TableColumn>
                    </TableHeader>
                    <TableBody>
                      {[...itensTransferencia].reverse().map((item) => {
                        const estoqueDestino = item.estoques_todas_lojas.find(
                          (e) => e.id_loja === item.loja_destino_id
                        );
                        const estoqueDestinoAtual =
                          estoqueDestino?.quantidade || 0;
                        const estoqueDestinoApos =
                          estoqueDestinoAtual +
                          (item.quantidade_transferir || 0);

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
                              <Chip color="default" variant="flat" size="sm">
                                {item.estoque_origem}
                              </Chip>
                            </TableCell>
                            <TableCell>
                              <Input
                                type="text"
                                inputMode="numeric"
                                value={
                                  item.quantidade_transferir !== undefined
                                    ? item.quantidade_transferir.toString()
                                    : ""
                                }
                                onValueChange={(value) => {
                                  // Remove caracteres não numéricos
                                  const numericValue = value.replace(
                                    /[^0-9]/g,
                                    ""
                                  );

                                  if (numericValue === "") {
                                    atualizarQuantidade(
                                      item.produto_id,
                                      undefined
                                    );
                                    return;
                                  }

                                  const quantidade = parseInt(numericValue);

                                  // Limita ao estoque máximo disponível
                                  if (quantidade > item.estoque_origem) {
                                    atualizarQuantidade(
                                      item.produto_id,
                                      item.estoque_origem
                                    );
                                  } else {
                                    atualizarQuantidade(
                                      item.produto_id,
                                      quantidade
                                    );
                                  }
                                }}
                                size="sm"
                                className="w-24"
                                isDisabled={loading}
                                placeholder="Qtd"
                              />
                            </TableCell>
                            <TableCell>
                              <Select
                                placeholder="Selecione o destino"
                                selectedKeys={
                                  item.loja_destino_id
                                    ? [item.loja_destino_id.toString()]
                                    : []
                                }
                                onSelectionChange={(keys) => {
                                  const selected = Array.from(
                                    keys
                                  )[0] as string;
                                  atualizarLojaDestino(
                                    item.produto_id,
                                    parseInt(selected)
                                  );
                                }}
                                size="sm"
                                className="min-w-[180px]"
                                isDisabled={loading}
                              >
                                {lojas
                                  .filter(
                                    (l) => l.id !== parseInt(lojaOrigemId)
                                  )
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
                                  estoqueDestinoAtual > 0
                                    ? "default"
                                    : "warning"
                                }
                                variant="flat"
                                size="sm"
                              >
                                {estoqueDestinoAtual}
                              </Chip>
                            </TableCell>
                            <TableCell>
                              <Chip color="success" variant="flat" size="sm">
                                {Number.isFinite(estoqueDestinoApos)
                                  ? estoqueDestinoApos
                                  : ""}
                              </Chip>
                            </TableCell>
                            <TableCell>
                              <Button
                                isIconOnly
                                size="sm"
                                color="danger"
                                variant="light"
                                onPress={() => removerItem(item.produto_id)}
                                isDisabled={loading}
                              >
                                <TrashIcon className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">
                  4. Observação (Opcional)
                </h3>
              </CardHeader>
              <CardBody>
                <Textarea
                  placeholder="Adicione uma observação sobre esta transferência..."
                  value={observacao}
                  onValueChange={setObservacao}
                  maxLength={500}
                  isDisabled={loading}
                  minRows={3}
                />
              </CardBody>
            </Card>

            <div className="flex justify-end gap-3">
              <Button
                color="danger"
                variant="light"
                size="lg"
                onPress={() => router.push("/sistema/transferencias")}
                isDisabled={loading}
                startContent={<XMarkIcon className="h-5 w-5" />}
              >
                Cancelar
              </Button>
              <Button
                color="primary"
                size="lg"
                onPress={handleCriarTransferencia}
                isLoading={loading}
                startContent={
                  !loading && <CheckCircleIcon className="h-5 w-5" />
                }
              >
                Criar Transferência
              </Button>
            </div>
          </>
        )}

        {/* Estado Vazio */}
        {!lojaOrigemId && (
          <Card>
            <CardBody className="py-20">
              <div className="text-center text-default-500">
                <ArrowRightIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">
                  Selecione uma loja de origem para começar
                </p>
              </div>
            </CardBody>
          </Card>
        )}

        {lojaOrigemId && itensTransferencia.length === 0 && (
          <Card>
            <CardBody className="py-20">
              <div className="text-center text-default-500">
                <MagnifyingGlassIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">
                  Busque e adicione produtos para continuar
                </p>
                <p className="text-sm mt-2">
                  Use a barra de pesquisa acima para encontrar produtos
                </p>
              </div>
            </CardBody>
          </Card>
        )}
      </div>
    </div>
  );
}
