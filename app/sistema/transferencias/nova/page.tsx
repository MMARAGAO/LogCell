"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Select, SelectItem } from "@heroui/select";
import { Input, Textarea } from "@heroui/input";
import { Chip } from "@heroui/chip";
import { Tooltip } from "@heroui/tooltip";
import { Progress } from "@heroui/progress";
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
  ArrowLeftIcon,
  BuildingStorefrontIcon,
  CubeIcon,
  DocumentTextIcon,
  ClipboardDocumentCheckIcon,
} from "@heroicons/react/24/outline";
import { MinusIcon, PlusIcon } from "@heroicons/react/24/solid";

import { useToast } from "@/components/Toast";
import { useAuth } from "@/hooks/useAuth";
import { usePermissoes } from "@/hooks/usePermissoes";
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

const STEPS = [
  { key: "lojas", label: "Lojas", icon: BuildingStorefrontIcon },
  { key: "produtos", label: "Produtos", icon: CubeIcon },
  { key: "revisao", label: "Revisão", icon: DocumentTextIcon },
  { key: "confirmar", label: "Confirmar", icon: ClipboardDocumentCheckIcon },
];

export default function NovaTransferenciaPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();
  const { verificarSessao, usuario } = useAuth();
  const { temAcessoLoja } = usePermissoes();

  const transferenciaId = searchParams.get("id");
  const editando = Boolean(transferenciaId);

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

  const passoAtual = useMemo(() => {
    if (!lojaOrigemId) return 0;
    if (itensTransferencia.length === 0) return 1;

    return 2;
  }, [lojaOrigemId, itensTransferencia]);

  useEffect(() => {
    carregarLojas();
  }, []);

  useEffect(() => {
    if (transferenciaId) {
      carregarTransferenciaParaEdicao(transferenciaId);
    }
  }, [transferenciaId]);

  // Busca com debounce para evitar re-renders a cada tecla
  useEffect(() => {
    if (lojaOrigemId && buscaProduto.length > 0) {
      const timer = setTimeout(() => buscarProdutos(), 300);

      return () => clearTimeout(timer);
    } else {
      setProdutos([]);
    }
  }, [lojaOrigemId, buscaProduto]);

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
      const termosBusca = buscaProduto.trim().split(/\s+/);

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
        `,
        )
        .eq("ativo", true);

      termosBusca.forEach((termo) => {
        if (termo.length > 0) {
          query = query.ilike("descricao", `%${termo}%`);
        }
      });

      const { data, error } = await query.limit(20);

      if (error) throw error;

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

  const buscarTotalProdutosLoja = async () => {
    if (!lojaOrigemId) return;

    try {
      let allProdutos: any[] = [];
      let page = 0;
      const pageSize = 1000;
      let hasMore = true;

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

      const produtosUnicos = new Set(
        allProdutos.map((item) => item.id_produto),
      );

      setTotalProdutosLoja(produtosUnicos.size);
    } catch (error) {
      console.error("Erro ao buscar total de produtos:", error);
      setTotalProdutosLoja(0);
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

    if (itensTransferencia.some((i) => i.produto_id === produto.id)) {
      toast.error("Produto já adicionado");

      return;
    }

    const destinoPadraoId = lojaDestinoPadrao ? parseInt(lojaDestinoPadrao) : 0;
    const novoItem: ItemTransferencia = {
      produto_id: produto.id,
      produto_descricao: produto.descricao,
      produto_marca: produto.marca,
      produto_codigo: produto.codigo_fabricante,
      quantidade_transferir: undefined,
      loja_destino_id: destinoPadraoId,
      estoque_origem: estoqueOrigem.quantidade,
      estoques_todas_lojas: produto.estoques_lojas,
    };

    setItensTransferencia([...itensTransferencia, novoItem]);
    toast.success("Produto adicionado à transferência");
  };

  const removerItem = (produtoId: string) => {
    setItensTransferencia(
      itensTransferencia.filter((i) => i.produto_id !== produtoId),
    );
    toast.info("Produto removido");
  };

  const atualizarQuantidade = (produtoId: string, quantidade?: number) => {
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

  const carregarTransferenciaParaEdicao = async (id: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("transferencias")
        .select(
          `
          id,
          loja_origem_id,
          loja_destino_id,
          status,
          observacao,
          itens:transferencias_itens(
            id,
            produto_id,
            quantidade,
            produto:produtos(
              descricao,
              codigo_fabricante,
              marca,
              estoque_lojas(
                id_loja,
                quantidade,
                lojas:id_loja(nome)
              )
            )
          )
        `,
        )
        .eq("id", id)
        .single();

      if (error || !data) {
        throw new Error("Transferência não encontrada");
      }

      if (data.status !== "pendente") {
        toast.error("Só é possível editar transferências pendentes.");
        router.push("/sistema/transferencias");

        return;
      }

      setLojaOrigemId(String(data.loja_origem_id));
      setLojaDestinoPadrao(String(data.loja_destino_id));
      setObservacao(data.observacao || "");

      const itensFormatados: ItemTransferencia[] = (data.itens || []).map(
        (item: any) => {
          const estoques_todas_lojas: EstoqueLoja[] =
            item.produto?.estoque_lojas?.map((e: any) => ({
              id_loja: e.id_loja,
              loja_nome: e.lojas?.nome || "",
              quantidade: e.quantidade || 0,
            })) || [];

          const estoqueOrigem =
            estoques_todas_lojas.find((e) => e.id_loja === data.loja_origem_id)
              ?.quantidade || 0;

          return {
            produto_id: item.produto_id,
            produto_descricao: item.produto?.descricao || "Produto",
            produto_marca: item.produto?.marca,
            produto_codigo: item.produto?.codigo_fabricante,
            quantidade_transferir: item.quantidade,
            loja_destino_id: data.loja_destino_id,
            estoque_origem: estoqueOrigem,
            estoques_todas_lojas,
          };
        },
      );

      setItensTransferencia(itensFormatados);
    } catch (error: any) {
      console.error("Erro ao carregar transferência:", error);
      toast.error(error.message || "Erro ao carregar transferência");
      router.push("/sistema/transferencias");
    } finally {
      setLoading(false);
    }
  };

  const errosValidacao = useMemo(() => {
    const erros: string[] = [];

    if (!lojaOrigemId) {
      erros.push("Selecione a loja de origem");
    }

    if (itensTransferencia.length === 0) {
      erros.push("Adicione pelo menos um produto");
    }

    const itensSemDestino = itensTransferencia.filter(
      (i) => !i.loja_destino_id || i.loja_destino_id === 0,
    );

    if (itensSemDestino.length > 0) {
      erros.push(
        `${itensSemDestino.length} produto(s) sem loja de destino definida`,
      );
    }

    const itensComQuantidadeInvalida = itensTransferencia.filter(
      (i) =>
        !i.quantidade_transferir ||
        i.quantidade_transferir <= 0 ||
        i.quantidade_transferir > i.estoque_origem,
    );

    if (itensComQuantidadeInvalida.length > 0) {
      erros.push("Verifique as quantidades dos produtos");
    }

    const itensOrigemDestinoIgual = itensTransferencia.filter(
      (i) => i.loja_destino_id === parseInt(lojaOrigemId || "0"),
    );

    if (itensOrigemDestinoIgual.length > 0) {
      erros.push("Loja de origem e destino não podem ser iguais");
    }

    if (editando) {
      const destinosUnicos = new Set(
        itensTransferencia
          .map((i) => i.loja_destino_id)
          .filter((id) => id && id > 0),
      );

      if (destinosUnicos.size > 1) {
        erros.push("Todos os itens devem ter a mesma loja de destino");
      }
    }

    return erros;
  }, [lojaOrigemId, itensTransferencia, editando]);

  const handleCriarTransferencia = async () => {
    const sessaoValida = await verificarSessao();

    if (!sessaoValida || !usuario?.id) {
      return;
    }

    setLoading(true);
    try {
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
        `${totalTransferenciasCriadas} transferência(s) criada(s) com sucesso!`,
      );
      router.push("/sistema/transferencias");
    } catch (error: any) {
      console.error("Erro ao criar transferência:", error);
      toast.error(error.message || "Erro ao criar transferência");
    } finally {
      setLoading(false);
    }
  };

  const handleAtualizarTransferencia = async () => {
    if (!transferenciaId) return;

    const sessaoValida = await verificarSessao();

    if (!sessaoValida || !usuario?.id) {
      return;
    }

    setLoading(true);
    try {
      const destinosUnicos = Array.from(
        new Set(
          itensTransferencia
            .map((i) => i.loja_destino_id)
            .filter((id) => id && id > 0),
        ),
      );

      const destinoId = destinosUnicos[0];

      if (!destinoId) {
        throw new Error("Selecione a loja de destino");
      }

      const { data: transferenciaAtualizada, error: errorTransferencia } =
        await supabase
          .from("transferencias")
          .update({
            loja_destino_id: destinoId,
            observacao: observacao || null,
          })
          .eq("id", transferenciaId)
          .eq("status", "pendente")
          .select("id")
          .single();

      if (errorTransferencia || !transferenciaAtualizada) {
        throw new Error("Erro ao atualizar transferência");
      }

      const { error: errorDelete } = await supabase
        .from("transferencias_itens")
        .delete()
        .eq("transferencia_id", transferenciaId);

      if (errorDelete) {
        throw new Error("Erro ao atualizar itens da transferência");
      }

      const itensParaInserir = itensTransferencia.map((item) => ({
        transferencia_id: transferenciaId,
        produto_id: item.produto_id,
        quantidade: item.quantidade_transferir,
      }));

      const { error: errorItens } = await supabase
        .from("transferencias_itens")
        .insert(itensParaInserir);

      if (errorItens) {
        throw new Error("Erro ao atualizar itens da transferência");
      }

      toast.success("Transferência atualizada com sucesso!");
      router.push("/sistema/transferencias");
    } catch (error: any) {
      console.error("Erro ao atualizar transferência:", error);
      toast.error(error.message || "Erro ao atualizar transferência");
    } finally {
      setLoading(false);
    }
  };

  const lojaOrigemNome = useMemo(() => {
    return lojas.find((l) => l.id === parseInt(lojaOrigemId))?.nome || "";
  }, [lojas, lojaOrigemId]);

  const totalItens = itensTransferencia.length;
  const totalQuantidade = itensTransferencia.reduce(
    (acc, item) => acc + (item.quantidade_transferir || 0),
    0,
  );

  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <Button
            isIconOnly
            isDisabled={loading}
            variant="light"
            onPress={() => router.push("/sistema/transferencias")}
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-default-100 text-default-500">
              <ArrowRightIcon className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                {editando ? "Editar Transferência" : "Nova Transferência"}
              </h1>
              <p className="text-xs sm:text-sm text-default-500 mt-0.5">
                {editando
                  ? "Ajuste os itens antes da confirmação"
                  : "Transfira produtos entre lojas de forma organizada"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stepper */}
      <Card className="mb-6" shadow="sm">
        <CardBody className="p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            {STEPS.map((step, index) => {
              const StepIcon = step.icon;
              const isActive = index === passoAtual;
              const isCompleted = index < passoAtual;
              const isPending = index > passoAtual;

              return (
                <div
                  key={step.key}
                  className="flex flex-col items-center flex-1"
                >
                  <div
                    className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isActive
                        ? "bg-primary text-white ring-4 ring-primary/15"
                        : isCompleted
                          ? "bg-success text-white"
                          : "bg-default-100 text-default-400"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircleIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                    ) : (
                      <StepIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                    )}
                  </div>
                  <span
                    className={`text-[10px] sm:text-xs mt-1.5 font-medium text-center ${
                      isActive
                        ? "text-primary"
                        : isCompleted
                          ? "text-success"
                          : "text-default-400"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
          <Progress
            aria-label="Progresso"
            color={passoAtual >= STEPS.length - 1 ? "success" : "primary"}
            size="sm"
            value={(passoAtual / (STEPS.length - 1)) * 100}
          />
          <p className="text-xs text-default-400 mt-2 text-center">
            Passo {passoAtual + 1} de {STEPS.length}
            {passoAtual === 0 && " — Selecione a loja de origem"}
            {passoAtual === 1 && " — Adicione produtos à transferência"}
            {passoAtual >= 2 && " — Revise e confirme"}
          </p>
        </CardBody>
      </Card>

      <div className="space-y-6">
        {/* Passo 1: Lojas */}
        <Card
          className={passoAtual >= 0 ? "opacity-100" : "opacity-50"}
          shadow="sm"
        >
          <CardHeader className="flex items-center gap-2 px-4 sm:px-5 pt-4 sm:pt-5 pb-0">
            <span className="w-6 h-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center">
              1
            </span>
            <h3 className="text-base sm:text-lg font-semibold text-foreground">
              Selecione as Lojas
            </h3>
            {lojaOrigemId && (
              <CheckCircleIcon className="h-4 w-4 text-success ml-auto" />
            )}
          </CardHeader>
          <CardBody className="space-y-4 p-4 sm:p-5">
            <Select
              isRequired
              isDisabled={loading || editando}
              label="Loja de Origem"
              placeholder="Escolha a loja de origem"
              selectedKeys={lojaOrigemId ? [lojaOrigemId] : []}
              size="lg"
              variant="bordered"
              onSelectionChange={(keys) => {
                const selected = Array.from(keys)[0] as string;

                setLojaOrigemId(selected);
                setItensTransferencia([]);
                if (lojaDestinoPadrao === selected) {
                  setLojaDestinoPadrao("");
                }
              }}
            >
              {/* Origem: só as lojas do usuário (admin vê todas via temAcessoLoja) */}
              {lojas
                .filter((loja) => temAcessoLoja(loja.id))
                .map((loja) => (
                  <SelectItem key={loja.id.toString()}>{loja.nome}</SelectItem>
                ))}
            </Select>

            <div style={{ display: lojaOrigemId ? "" : "none" }}>
              <Select
                description="Os produtos adicionados terão esta loja como destino inicial"
                isDisabled={loading}
                label="Loja de Destino Padrão (opcional)"
                placeholder="Selecione uma loja de destino padrão"
                selectedKeys={lojaDestinoPadrao ? [lojaDestinoPadrao] : []}
                size="lg"
                variant="bordered"
                onSelectionChange={(keys) => {
                  const selected = Array.from(keys)[0] as string;

                  setLojaDestinoPadrao(selected);
                  if (editando) {
                    setItensTransferencia((itens) =>
                      itens.map((item) => ({
                        ...item,
                        loja_destino_id: selected ? parseInt(selected) : 0,
                      })),
                    );
                  }
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
            </div>

            {/* Resumo das lojas selecionadas */}
            {lojaOrigemId && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-default-100 border border-default-200/70">
                <div className="p-2 rounded-lg bg-default-200 text-default-500">
                  <BuildingStorefrontIcon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-default-500 uppercase tracking-wider font-medium">
                    Origem
                  </p>
                  <p className="font-semibold text-foreground truncate">
                    {lojaOrigemNome}
                  </p>
                </div>
                <ArrowRightIcon className="h-5 w-5 text-default-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-default-500 uppercase tracking-wider font-medium">
                    Destino {lojaDestinoPadrao ? "" : "(por item)"}
                  </p>
                  <p className="font-semibold text-foreground truncate">
                    {lojaDestinoPadrao
                      ? lojas.find((l) => l.id === parseInt(lojaDestinoPadrao))
                          ?.nome || "Selecionar"
                      : "Definir por produto"}
                  </p>
                </div>
              </div>
            )}
          </CardBody>
        </Card>

        {/* Passo 2: Produtos */}
        <div style={{ display: lojaOrigemId ? "" : "none" }}>
          <Card shadow="sm">
            <CardHeader className="flex items-center gap-2 px-4 sm:px-5 pt-4 sm:pt-5 pb-0">
              <span
                className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${
                  itensTransferencia.length > 0
                    ? "bg-success text-white"
                    : "bg-primary text-white"
                }`}
              >
                {itensTransferencia.length > 0 ? (
                  <CheckCircleIcon className="h-3.5 w-3.5" />
                ) : (
                  "2"
                )}
              </span>
              <h3 className="text-base sm:text-lg font-semibold text-foreground">
                Buscar e Adicionar Produtos
              </h3>
              {totalProdutosLoja > 0 && (
                <Chip
                  classNames={{ content: "text-xs" }}
                  size="sm"
                  variant="flat"
                >
                  {totalProdutosLoja} disponíveis
                </Chip>
              )}
            </CardHeader>
            <CardBody className="space-y-4 p-4 sm:p-5">
              <Input
                isClearable
                isDisabled={loading}
                placeholder="Digite o nome do produto para buscar..."
                size="lg"
                startContent={
                  <MagnifyingGlassIcon className="h-5 w-5 text-default-400" />
                }
                value={buscaProduto}
                variant="bordered"
                onClear={() => {
                  setBuscaProduto("");
                  setProdutos([]);
                }}
                onValueChange={setBuscaProduto}
              />

              {loadingProdutos && (
                <div className="flex items-center justify-center gap-2 py-6">
                  <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
                  <span className="text-sm text-default-500">
                    Buscando produtos...
                  </span>
                </div>
              )}

              {produtos.length > 0 &&
                (() => {
                  const totalPaginas = Math.ceil(
                    produtos.length / produtosPorPagina,
                  );
                  const indiceInicio = (paginaProdutos - 1) * produtosPorPagina;
                  const indiceFim = indiceInicio + produtosPorPagina;
                  const produtosPaginados = produtos.slice(
                    indiceInicio,
                    indiceFim,
                  );

                  return (
                    <div className="space-y-3">
                      <div className="overflow-x-auto rounded-xl border border-default-200">
                        <Table
                          removeWrapper
                          aria-label="Tabela de produtos encontrados"
                          classNames={{
                            th: "bg-default-50 text-default-600 text-xs font-semibold uppercase tracking-wider",
                            td: "text-sm",
                          }}
                        >
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
                                (e) => e.id_loja === parseInt(lojaOrigemId),
                              );
                              const outrasLojas = produto.estoques_lojas.filter(
                                (e) => e.id_loja !== parseInt(lojaOrigemId),
                              );
                              const jaAdicionado = itensTransferencia.some(
                                (i) => i.produto_id === produto.id,
                              );

                              return (
                                <TableRow
                                  key={produto.id}
                                  className={`transition-colors ${
                                    jaAdicionado
                                      ? "bg-success-500/15"
                                      : "hover:bg-default-50"
                                  }`}
                                >
                                  <TableCell>
                                    <span className="font-medium">
                                      {produto.descricao}
                                    </span>
                                  </TableCell>
                                  <TableCell className="text-default-500">
                                    {produto.marca || "-"}
                                  </TableCell>
                                  <TableCell>
                                    {produto.codigo_fabricante ? (
                                      <Chip
                                        classNames={{
                                          content: "text-xs font-mono",
                                        }}
                                        size="sm"
                                        variant="flat"
                                      >
                                        {produto.codigo_fabricante}
                                      </Chip>
                                    ) : (
                                      "-"
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    <Chip
                                      color="primary"
                                      size="sm"
                                      variant="flat"
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
                                            classNames={{
                                              content: "text-xs",
                                            }}
                                            color={
                                              estoque.quantidade > 0
                                                ? "success"
                                                : "default"
                                            }
                                            size="sm"
                                            variant="flat"
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
                                        color="danger"
                                        size="sm"
                                        variant="flat"
                                        onPress={() => removerItem(produto.id)}
                                      >
                                        Remover
                                      </Button>
                                    ) : (
                                      <Button
                                        color="primary"
                                        size="sm"
                                        onPress={() =>
                                          adicionarProduto(produto)
                                        }
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
                      </div>

                      {totalPaginas > 1 && (
                        <div className="flex justify-center items-center gap-3">
                          <Button
                            isDisabled={paginaProdutos === 1}
                            size="sm"
                            variant="flat"
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
                            isDisabled={paginaProdutos === totalPaginas}
                            size="sm"
                            variant="flat"
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
                  <div className="text-center py-8">
                    <div className="w-12 h-12 rounded-full bg-default-100 flex items-center justify-center mx-auto mb-3">
                      <MagnifyingGlassIcon className="h-6 w-6 text-default-300" />
                    </div>
                    <p className="text-sm font-medium text-default-500">
                      Nenhum produto encontrado em {lojaOrigemNome}
                    </p>
                  </div>
                )}

              {buscaProduto.length === 0 && (
                <div className="text-center py-8">
                  <div className="w-12 h-12 rounded-full bg-default-100 flex items-center justify-center mx-auto mb-3">
                    <CubeIcon className="h-6 w-6 text-default-300" />
                  </div>
                  <p className="text-sm font-medium text-default-500">
                    Digite o nome do produto para começar a busca
                  </p>
                  <p className="text-xs text-default-400 mt-1">
                    Serão exibidos apenas produtos com estoque em{" "}
                    {lojaOrigemNome}
                  </p>
                </div>
              )}

              {/* Itens adicionados — mini resumo */}
              {itensTransferencia.length > 0 && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-success-500/15 border border-success-500/30">
                  <CheckCircleIcon className="h-5 w-5 text-success flex-shrink-0" />
                  <span className="text-sm text-default-700">
                    <strong>{itensTransferencia.length}</strong> produto
                    {itensTransferencia.length > 1 ? "s" : ""} adicionado
                    {itensTransferencia.length > 1 ? "s" : ""}
                    {totalQuantidade > 0 &&
                      ` (${totalQuantidade} unidades no total)`}
                  </span>
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Passo 3: Tabela de Itens + Observação */}
        <div style={{ display: itensTransferencia.length > 0 ? "" : "none" }}>
          <div>
            <Card shadow="sm">
              <CardHeader className="flex items-center gap-2 px-4 sm:px-5 pt-4 sm:pt-5 pb-0">
                <span className="w-6 h-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center">
                  3
                </span>
                <h3 className="text-base sm:text-lg font-semibold text-foreground">
                  Revisão dos Itens
                </h3>
                <Chip
                  classNames={{ content: "text-xs" }}
                  size="sm"
                  variant="flat"
                >
                  {itensTransferencia.length}{" "}
                  {itensTransferencia.length === 1 ? "item" : "itens"}
                </Chip>
              </CardHeader>
              <CardBody className="p-4 sm:p-5">
                <div className="overflow-x-auto rounded-xl border border-default-200">
                  <Table
                    removeWrapper
                    aria-label="Itens da transferência"
                    classNames={{
                      th: "bg-default-50 text-default-600 text-xs font-semibold uppercase tracking-wider",
                      td: "text-sm",
                    }}
                  >
                    <TableHeader>
                      <TableColumn>PRODUTO</TableColumn>
                      <TableColumn>ESTOQUE</TableColumn>
                      <TableColumn>QUANTIDADE</TableColumn>
                      <TableColumn>LOJA DESTINO</TableColumn>
                      <TableColumn>ESTOQUE DESTINO</TableColumn>
                      <TableColumn>APÓS RECEBER</TableColumn>
                      <TableColumn width={50}>{""}</TableColumn>
                    </TableHeader>
                    <TableBody>
                      {[...itensTransferencia].reverse().map((item) => {
                        const estoqueDestino = item.estoques_todas_lojas.find(
                          (e) => e.id_loja === item.loja_destino_id,
                        );
                        const estoqueDestinoAtual =
                          estoqueDestino?.quantidade || 0;
                        const estoqueDestinoApos =
                          estoqueDestinoAtual +
                          (item.quantidade_transferir || 0);
                        const acabouEstoque =
                          item.quantidade_transferir !== undefined &&
                          item.quantidade_transferir > item.estoque_origem;

                        return (
                          <TableRow
                            key={item.produto_id}
                            className={`transition-colors hover:bg-default-50 ${
                              acabouEstoque ? "bg-danger-500/15" : ""
                            }`}
                          >
                            <TableCell>
                              <div className="min-w-0">
                                <p className="font-medium text-sm truncate max-w-[200px]">
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
                              <Chip
                                color={
                                  item.estoque_origem <= 5
                                    ? "danger"
                                    : "default"
                                }
                                size="sm"
                                variant="flat"
                              >
                                {item.estoque_origem}
                              </Chip>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Button
                                  isIconOnly
                                  className="h-7 w-7 min-w-0"
                                  isDisabled={
                                    loading ||
                                    !item.quantidade_transferir ||
                                    item.quantidade_transferir <= 1
                                  }
                                  size="sm"
                                  variant="flat"
                                  onPress={() => {
                                    const qtd = item.quantidade_transferir || 0;

                                    atualizarQuantidade(
                                      item.produto_id,
                                      Math.max(0, qtd - 1),
                                    );
                                  }}
                                >
                                  <MinusIcon className="h-3 w-3" />
                                </Button>
                                <Input
                                  className="w-16"
                                  inputMode="numeric"
                                  isDisabled={loading}
                                  placeholder="Qtd"
                                  size="sm"
                                  type="text"
                                  value={
                                    item.quantidade_transferir !== undefined
                                      ? item.quantidade_transferir.toString()
                                      : ""
                                  }
                                  onValueChange={(value) => {
                                    const numericValue = value.replace(
                                      /[^0-9]/g,
                                      "",
                                    );

                                    if (numericValue === "") {
                                      atualizarQuantidade(
                                        item.produto_id,
                                        undefined,
                                      );

                                      return;
                                    }

                                    const quantidade = parseInt(numericValue);

                                    if (quantidade > item.estoque_origem) {
                                      atualizarQuantidade(
                                        item.produto_id,
                                        item.estoque_origem,
                                      );
                                    } else {
                                      atualizarQuantidade(
                                        item.produto_id,
                                        quantidade,
                                      );
                                    }
                                  }}
                                />
                                <Button
                                  isIconOnly
                                  className="h-7 w-7 min-w-0"
                                  isDisabled={
                                    loading ||
                                    (item.quantidade_transferir || 0) >=
                                      item.estoque_origem
                                  }
                                  size="sm"
                                  variant="flat"
                                  onPress={() => {
                                    const qtd = item.quantidade_transferir || 0;

                                    atualizarQuantidade(
                                      item.produto_id,
                                      Math.min(item.estoque_origem, qtd + 1),
                                    );
                                  }}
                                >
                                  <PlusIcon className="h-3 w-3" />
                                </Button>
                              </div>
                              {item.quantidade_transferir !== undefined &&
                                item.quantidade_transferir > 0 && (
                                  <div className="w-full mt-1">
                                    <Progress
                                      aria-label="Estoque utilizado"
                                      color={
                                        item.quantidade_transferir /
                                          item.estoque_origem >
                                        0.8
                                          ? "warning"
                                          : "primary"
                                      }
                                      size="sm"
                                      value={
                                        (item.quantidade_transferir /
                                          item.estoque_origem) *
                                        100
                                      }
                                    />
                                  </div>
                                )}
                            </TableCell>
                            <TableCell>
                              <Select
                                className="min-w-[150px]"
                                isDisabled={loading || editando}
                                placeholder="Destino"
                                selectedKeys={
                                  item.loja_destino_id
                                    ? [item.loja_destino_id.toString()]
                                    : []
                                }
                                size="sm"
                                variant="bordered"
                                onSelectionChange={(keys) => {
                                  const selected = Array.from(
                                    keys,
                                  )[0] as string;

                                  atualizarLojaDestino(
                                    item.produto_id,
                                    parseInt(selected),
                                  );
                                }}
                              >
                                {lojas
                                  .filter(
                                    (l) => l.id !== parseInt(lojaOrigemId),
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
                                size="sm"
                                variant="flat"
                              >
                                {estoqueDestinoAtual}
                              </Chip>
                            </TableCell>
                            <TableCell>
                              <Chip color="success" size="sm" variant="flat">
                                {Number.isFinite(estoqueDestinoApos)
                                  ? estoqueDestinoApos
                                  : ""}
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
                </div>
              </CardBody>
            </Card>

            {/* Observação */}
            <Card shadow="sm">
              <CardHeader className="flex items-center gap-2 px-4 sm:px-5 pt-4 sm:pt-5 pb-0">
                <span className="w-6 h-6 rounded-full bg-default-200 text-default-500 text-xs font-bold flex items-center justify-center">
                  4
                </span>
                <h3 className="text-base sm:text-lg font-semibold text-foreground">
                  Observação
                </h3>
                <span className="text-xs text-default-400">(opcional)</span>
              </CardHeader>
              <CardBody className="p-4 sm:p-5">
                <Textarea
                  isDisabled={loading}
                  maxLength={500}
                  minRows={3}
                  placeholder="Adicione uma observação sobre esta transferência..."
                  value={observacao}
                  variant="bordered"
                  onValueChange={setObservacao}
                />
              </CardBody>
            </Card>

            {/* Erros de validação inline */}
            {errosValidacao.length > 0 && (
              <div className="p-3 sm:p-4 rounded-xl bg-danger-500/15 border border-danger-500/30">
                <p className="text-sm font-medium text-danger mb-2">
                  Corrija os seguintes itens antes de continuar:
                </p>
                <ul className="space-y-1">
                  {errosValidacao.map((erro, index) => (
                    <li
                      key={index}
                      className="text-sm text-danger-500 flex items-start gap-2"
                    >
                      <span className="mt-0.5">•</span>
                      <span>{erro}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Ações finais */}
            <div className="flex flex-col sm:flex-row justify-end gap-3">
              <Button
                color="danger"
                isDisabled={loading}
                size="lg"
                startContent={<XMarkIcon className="h-5 w-5" />}
                variant="light"
                onPress={() => router.push("/sistema/transferencias")}
              >
                Cancelar
              </Button>
              <Tooltip
                showArrow
                content={
                  <div className="px-1 py-2 max-w-xs">
                    <div className="text-small font-bold mb-1">
                      Requisitos pendentes:
                    </div>
                    <ul className="text-tiny space-y-1">
                      {errosValidacao.map((erro, index) => (
                        <li key={index}>• {erro}</li>
                      ))}
                    </ul>
                  </div>
                }
                isDisabled={errosValidacao.length === 0 || loading}
                placement="top"
              >
                <div>
                  <Button
                    color="primary"
                    isDisabled={loading || errosValidacao.length > 0}
                    isLoading={loading}
                    size="lg"
                    startContent={
                      !loading && <CheckCircleIcon className="h-5 w-5" />
                    }
                    onPress={
                      editando
                        ? handleAtualizarTransferencia
                        : handleCriarTransferencia
                    }
                  >
                    {editando ? "Salvar Alterações" : "Criar Transferência"}
                  </Button>
                </div>
              </Tooltip>
            </div>
          </div>
        </div>

        {/* Empty State Inicial */}
        {!lojaOrigemId && (
          <Card shadow="sm">
            <CardBody className="py-16 sm:py-20">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary-500/15 flex items-center justify-center mx-auto mb-4">
                  <BuildingStorefrontIcon className="h-8 w-8 text-primary-300" />
                </div>
                <p className="text-lg font-medium text-default-500">
                  Selecione uma loja de origem para começar
                </p>
                <p className="text-sm text-default-400 mt-1">
                  Escolha a loja que irá enviar os produtos
                </p>
              </div>
            </CardBody>
          </Card>
        )}

        {lojaOrigemId && itensTransferencia.length === 0 && (
          <Card shadow="sm">
            <CardBody className="py-16 sm:py-20">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-default-100 flex items-center justify-center mx-auto mb-4">
                  <CubeIcon className="h-8 w-8 text-default-300" />
                </div>
                <p className="text-lg font-medium text-default-500">
                  Busque e adicione produtos para continuar
                </p>
                <p className="text-sm text-default-400 mt-1">
                  Use a barra de pesquisa acima para encontrar produtos com
                  estoque em {lojaOrigemNome}
                </p>
              </div>
            </CardBody>
          </Card>
        )}
      </div>
    </div>
  );
}
