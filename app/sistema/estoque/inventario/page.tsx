"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import { Input, Textarea } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { Autocomplete, AutocompleteItem } from "@heroui/autocomplete";
import { Tabs, Tab } from "@heroui/tabs";
import { Switch } from "@heroui/switch";
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
  ArrowLeftIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  ClipboardDocumentCheckIcon,
  ClockIcon,
  ArrowDownTrayIcon,
  EyeSlashIcon,
  CubeIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

import { useAuthContext } from "@/contexts/AuthContext";
import { usePermissoes } from "@/hooks/usePermissoes";
import { useLojaFilter } from "@/hooks/useLojaFilter";
import { useToast } from "@/components/Toast";
import { ConfirmModal } from "@/components/ConfirmModal";
import { ProdutoFormModal } from "@/components/estoque";
import { LojasService } from "@/services/lojasService";
import { supabase } from "@/lib/supabaseClient";
import { criarProduto } from "@/services/produtosService";
import {
  buscarProdutosPaginados,
  atualizarQuantidadeEstoque,
} from "@/services/estoqueService";
import { getTodoHistorico } from "@/services/historicoEstoqueService";
import { exportarHistoricoEstoqueParaExcel } from "@/lib/exportarExcel";
import { Loja, Produto, HistoricoEstoqueCompleto } from "@/types";

interface ProdutoAjuste {
  id: string;
  descricao: string;
  marca?: string;
  categoria?: string;
  codigo_fabricante?: string;
  quantidade_minima?: number;
  quantidade_atual: number;
}

const MOTIVOS_AJUSTE = [
  { key: "contagem_fisica", label: "Contagem física" },
  { key: "correcao_erro", label: "Correção de erro" },
  { key: "quebra_perda", label: "Quebra ou perda" },
  { key: "devolucao", label: "Devolução" },
  { key: "outro", label: "Outro" },
];

export default function InventarioPage() {
  const router = useRouter();
  const { usuario: user } = useAuthContext();
  const { temPermissao, loading: loadingPermissoes } = usePermissoes();
  const { lojaIds, podeVerTodasLojas } = useLojaFilter();
  const toast = useToast();

  const [aba, setAba] = useState<"ajuste" | "historico">("ajuste");
  const [lojas, setLojas] = useState<Loja[]>([]);
  const [lojaId, setLojaId] = useState<string>("");

  // ===== Aba: Ajustar Estoque =====
  const [buscaProduto, setBuscaProduto] = useState("");
  const [resultadosBusca, setResultadosBusca] = useState<ProdutoAjuste[]>([]);
  const [buscandoProdutos, setBuscandoProdutos] = useState(false);
  const [itens, setItens] = useState<ProdutoAjuste[]>([]);
  const [alteracoes, setAlteracoes] = useState<Record<string, number>>({});
  const [motivo, setMotivo] = useState<string>("contagem_fisica");
  const [observacao, setObservacao] = useState("");
  const [contagemCega, setContagemCega] = useState(false);
  const [modalNovoProduto, setModalNovoProduto] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [progressoSalvar, setProgressoSalvar] = useState({
    atual: 0,
    total: 0,
  });
  const [confirmSalvarAberto, setConfirmSalvarAberto] = useState(false);

  // ===== Aba: Histórico =====
  const [historico, setHistorico] = useState<HistoricoEstoqueCompleto[]>([]);
  const [loadingHistorico, setLoadingHistorico] = useState(false);
  const [paginaHistorico, setPaginaHistorico] = useState(1);
  const [totalHistorico, setTotalHistorico] = useState(0);
  const historicoPorPagina = 20;
  const [filtroDataInicio, setFiltroDataInicio] = useState("");
  const [filtroDataFim, setFiltroDataFim] = useState("");
  const [filtroProdutoBusca, setFiltroProdutoBusca] = useState("");
  const [filtroProdutoId, setFiltroProdutoId] = useState<string>("");
  const [produtosAutocomplete, setProdutosAutocomplete] = useState<
    { id: string; descricao: string }[]
  >([]);
  const [usuarios, setUsuarios] = useState<{ id: string; nome: string }[]>([]);
  const [filtroUsuarioId, setFiltroUsuarioId] = useState<string>("");
  const [exportando, setExportando] = useState(false);

  // Busca produtos para adicionar à lista de ajuste (debounced)
  useEffect(() => {
    if (!lojaId || buscaProduto.trim().length < 2) {
      setResultadosBusca([]);

      return;
    }

    setBuscandoProdutos(true);
    const t = setTimeout(async () => {
      try {
        const result = await buscarProdutosPaginados({
          busca: buscaProduto,
          ativo: true,
          page: 1,
          pageSize: 15,
        });

        const idLoja = Number(lojaId);
        const encontrados: ProdutoAjuste[] = result.data.map((p: any) => {
          const estoqueLoja = (p.estoques_lojas || []).find(
            (e: any) => e.id_loja === idLoja,
          );

          return {
            id: p.id,
            descricao: p.descricao,
            marca: p.marca,
            categoria: p.categoria || p.grupo,
            codigo_fabricante: p.codigo_fabricante,
            quantidade_minima: p.quantidade_minima,
            quantidade_atual: estoqueLoja?.quantidade ?? 0,
          };
        });

        setResultadosBusca(encontrados);
      } catch (error) {
        console.error("Erro ao buscar produtos:", error);
      } finally {
        setBuscandoProdutos(false);
      }
    }, 350);

    return () => clearTimeout(t);
  }, [buscaProduto, lojaId]);

  // Trocar de loja reinicia a lista de trabalho (quantidades são por loja)
  useEffect(() => {
    setItens([]);
    setAlteracoes({});
  }, [lojaId]);

  useEffect(() => {
    if (paginaHistorico !== 1) setPaginaHistorico(1);
  }, [
    filtroDataInicio,
    filtroDataFim,
    filtroProdutoId,
    filtroUsuarioId,
    lojaId,
  ]);

  // Carregar lojas permitidas para o usuário
  useEffect(() => {
    (async () => {
      try {
        const dados = await LojasService.getLojasAtivas();
        const filtraveis = podeVerTodasLojas
          ? dados
          : dados.filter((l) => lojaIds.includes(l.id));

        setLojas(filtraveis);

        if (filtraveis.length === 1) {
          setLojaId(String(filtraveis[0].id));
        }
      } catch (error) {
        console.error("Erro ao carregar lojas:", error);
      }
    })();
  }, [podeVerTodasLojas, lojaIds]);

  // Carregar usuários (para filtro do histórico)
  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase
          .from("usuarios")
          .select("id, nome")
          .order("nome");

        setUsuarios(data || []);
      } catch (error) {
        console.error("Erro ao carregar usuários:", error);
      }
    })();
  }, []);

  const handleAdicionarProduto = (produtoId: string) => {
    const produto = resultadosBusca.find((p) => p.id === produtoId);

    if (!produto) return;

    setItens((prev) =>
      prev.some((p) => p.id === produtoId) ? prev : [...prev, produto],
    );
    setBuscaProduto("");
    setResultadosBusca([]);
  };

  const handleRemoverItem = (produtoId: string) => {
    setItens((prev) => prev.filter((p) => p.id !== produtoId));
    setAlteracoes((prev) => {
      const novo = { ...prev };

      delete novo[produtoId];

      return novo;
    });
  };

  // Autocomplete de produtos para o filtro do histórico
  useEffect(() => {
    if (filtroProdutoBusca.length < 2) {
      setProdutosAutocomplete([]);

      return;
    }
    const t = setTimeout(async () => {
      try {
        const result = await buscarProdutosPaginados({
          busca: filtroProdutoBusca,
          page: 1,
          pageSize: 15,
        });

        setProdutosAutocomplete(
          result.data.map((p: any) => ({ id: p.id, descricao: p.descricao })),
        );
      } catch (error) {
        console.error("Erro ao buscar produtos:", error);
      }
    }, 350);

    return () => clearTimeout(t);
  }, [filtroProdutoBusca]);

  const carregarHistorico = useCallback(async () => {
    setLoadingHistorico(true);
    try {
      const filtros: Parameters<typeof getTodoHistorico>[0] = {
        id_produto: filtroProdutoId || undefined,
        data_inicio: filtroDataInicio
          ? new Date(filtroDataInicio).toISOString()
          : undefined,
        data_fim: filtroDataFim
          ? new Date(`${filtroDataFim}T23:59:59`).toISOString()
          : undefined,
        usuario_id: filtroUsuarioId || undefined,
      };

      if (lojaId) {
        filtros.id_loja = Number(lojaId);
      } else if (!podeVerTodasLojas && lojaIds.length > 0) {
        filtros.id_lojas = lojaIds;
      }

      const result = await getTodoHistorico(
        filtros,
        paginaHistorico,
        historicoPorPagina,
      );

      setHistorico(result.data);
      setTotalHistorico(result.total);
    } catch (error) {
      console.error("Erro ao carregar histórico:", error);
      toast.error("Erro ao carregar histórico");
    } finally {
      setLoadingHistorico(false);
    }
  }, [
    lojaId,
    filtroProdutoId,
    filtroDataInicio,
    filtroDataFim,
    filtroUsuarioId,
    paginaHistorico,
    podeVerTodasLojas,
    lojaIds,
  ]);

  useEffect(() => {
    if (!loadingPermissoes && aba === "historico") {
      carregarHistorico();
    }
  }, [loadingPermissoes, aba, carregarHistorico]);

  const handleExportarHistorico = async () => {
    setExportando(true);
    try {
      const filtros: Parameters<typeof getTodoHistorico>[0] = {
        id_produto: filtroProdutoId || undefined,
        data_inicio: filtroDataInicio
          ? new Date(filtroDataInicio).toISOString()
          : undefined,
        data_fim: filtroDataFim
          ? new Date(`${filtroDataFim}T23:59:59`).toISOString()
          : undefined,
        usuario_id: filtroUsuarioId || undefined,
      };

      if (lojaId) {
        filtros.id_loja = Number(lojaId);
      } else if (!podeVerTodasLojas && lojaIds.length > 0) {
        filtros.id_lojas = lojaIds;
      }

      const result = await getTodoHistorico(filtros, 1, 5000);

      if (result.data.length === 0) {
        toast.warning("Nenhum registro encontrado com os filtros atuais.");

        return;
      }

      exportarHistoricoEstoqueParaExcel(result.data, "historico_inventario");
      toast.success(`Planilha gerada com ${result.data.length} registro(s)!`);
    } catch (error) {
      console.error("Erro ao exportar histórico:", error);
      toast.error("Erro ao gerar planilha. Tente novamente.");
    } finally {
      setExportando(false);
    }
  };

  const handleAlterarQuantidade = (produtoId: string, valor: string) => {
    if (valor === "") {
      setAlteracoes((prev) => {
        const novo = { ...prev };

        delete novo[produtoId];

        return novo;
      });

      return;
    }

    const numero = Number(valor);

    if (Number.isNaN(numero) || numero < 0) return;

    setAlteracoes((prev) => ({ ...prev, [produtoId]: numero }));
  };

  const itensAlterados = useMemo(() => {
    return itens
      .map((produto) => {
        const novaQuantidade = alteracoes[produto.id];

        if (novaQuantidade === undefined) return null;
        if (novaQuantidade === produto.quantidade_atual) return null;

        return {
          produtoId: produto.id,
          descricao: produto.descricao,
          quantidadeAtual: produto.quantidade_atual,
          quantidadeNova: novaQuantidade,
          diferenca: novaQuantidade - produto.quantidade_atual,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);
  }, [alteracoes, itens]);

  const totalUnidadesDiferenca = itensAlterados.reduce(
    (soma, item) => soma + item.diferenca,
    0,
  );

  const handleAbrirConfirmSalvar = () => {
    if (!lojaId) {
      toast.error("Selecione uma loja para ajustar o estoque");

      return;
    }
    if (itensAlterados.length === 0) {
      toast.warning("Nenhuma alteração para salvar");

      return;
    }
    if (!motivo) {
      toast.error("Selecione o motivo do ajuste");

      return;
    }
    setConfirmSalvarAberto(true);
  };

  const handleSalvarAjustes = async () => {
    if (!user || !lojaId) return;

    setSalvando(true);
    setProgressoSalvar({ atual: 0, total: itensAlterados.length });

    const motivoLabel =
      MOTIVOS_AJUSTE.find((m) => m.key === motivo)?.label || motivo;
    const observacaoCompleta = observacao
      ? `${motivoLabel}: ${observacao}`
      : motivoLabel;

    let sucessos = 0;
    let falhas = 0;

    for (let i = 0; i < itensAlterados.length; i++) {
      const item = itensAlterados[i];

      try {
        await atualizarQuantidadeEstoque(
          item.produtoId,
          Number(lojaId),
          item.quantidadeNova,
          user.id,
          observacaoCompleta,
        );
        sucessos++;
      } catch (error) {
        console.error(`Erro ao ajustar produto ${item.produtoId}:`, error);
        falhas++;
      }
      setProgressoSalvar({ atual: i + 1, total: itensAlterados.length });
    }

    setSalvando(false);
    setConfirmSalvarAberto(false);

    if (sucessos > 0) {
      toast.success(
        `${sucessos} produto(s) ajustado(s) com sucesso!${
          falhas > 0 ? ` (${falhas} falharam)` : ""
        }`,
      );
    } else {
      toast.error("Não foi possível salvar os ajustes. Tente novamente.");
    }

    if (sucessos > 0) {
      setItens([]);
      setAlteracoes({});
    }
    setObservacao("");
  };

  const handleCriarProduto = async (produto: Partial<Produto>) => {
    if (!user) return;
    try {
      const criado = await criarProduto(produto as any, user.id);

      toast.success("Produto criado! Já pode ajustar a quantidade abaixo.");
      setModalNovoProduto(false);
      setItens((prev) =>
        prev.some((p) => p.id === criado.id)
          ? prev
          : [
              ...prev,
              {
                id: criado.id,
                descricao: criado.descricao,
                marca: criado.marca,
                categoria: criado.categoria || criado.grupo,
                codigo_fabricante: criado.codigo_fabricante,
                quantidade_minima: criado.quantidade_minima,
                quantidade_atual: 0,
              },
            ],
      );
    } catch (error: any) {
      console.error("Erro ao criar produto:", error);
      if (error.message?.includes("duplicate")) {
        toast.warning("Já existe um produto com este código!");
      } else {
        toast.error("Erro ao criar produto. Tente novamente.");
      }
    }
  };

  const totalPaginasHistorico = Math.ceil(totalHistorico / historicoPorPagina);
  const lojaSelecionadaNome = lojas.find((l) => String(l.id) === lojaId)?.nome;

  if (loadingPermissoes) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!temPermissao("estoque.ajustar")) {
    return (
      <div className="p-8 text-center">
        <h1 className="mb-4 text-2xl font-bold text-danger">Acesso Negado</h1>
        <p className="text-default-500">
          Você não tem permissão para acessar o inventário.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1400px] p-6">
      {/* Header */}
      <header className="mb-6 flex flex-col gap-1">
        <Button
          className="mb-2 w-fit px-0 text-default-500"
          size="sm"
          startContent={<ArrowLeftIcon className="h-4 w-4" />}
          variant="light"
          onPress={() => router.push("/sistema/estoque")}
        >
          Voltar para Estoque
        </Button>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Inventário
        </h1>
        <p className="text-sm text-default-500">
          Ajuste o estoque em massa, cadastre novos itens e acompanhe o
          histórico de movimentações.
        </p>
      </header>

      {/* Seletor de loja */}
      <Card className="mb-6 shadow-sm">
        <CardBody className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {lojas.length > 1 ? (
            <Select
              aria-label="Loja"
              className="max-w-xs"
              label="Loja"
              placeholder={
                aba === "historico" ? "Todas as lojas" : "Selecione uma loja"
              }
              selectedKeys={lojaId ? [lojaId] : []}
              variant="bordered"
              onSelectionChange={(keys) => {
                const value = Array.from(keys)[0] as string;

                setLojaId(value || "");
              }}
            >
              {[
                ...(aba === "historico" && podeVerTodasLojas
                  ? [<SelectItem key="">Todas as lojas</SelectItem>]
                  : []),
                ...lojas.map((loja) => (
                  <SelectItem key={String(loja.id)}>{loja.nome}</SelectItem>
                )),
              ]}
            </Select>
          ) : (
            <div className="text-sm text-default-600">
              Loja: <span className="font-semibold">{lojaSelecionadaNome}</span>
            </div>
          )}
        </CardBody>
      </Card>

      <Tabs
        classNames={{
          tabList: "gap-6 w-full relative rounded-none p-0",
          cursor: "w-full bg-primary",
          tab: "max-w-fit px-2 h-11",
          tabContent: "group-data-[selected=true]:text-primary",
        }}
        color="primary"
        selectedKey={aba}
        variant="underlined"
        onSelectionChange={(key) => setAba(key as "ajuste" | "historico")}
      >
        {/* ===== ABA: Ajustar Estoque ===== */}
        <Tab
          key="ajuste"
          title={
            <div className="flex items-center gap-2">
              <ClipboardDocumentCheckIcon className="h-5 w-5" />
              <span>Ajustar Estoque</span>
            </div>
          }
        >
          <div className="mt-4 space-y-4">
            {!lojaId ? (
              <div className="rounded-xl border border-default-200/70 bg-content1 py-16 text-center">
                <CubeIcon className="mx-auto mb-3 h-12 w-12 text-default-300" />
                <p className="text-sm font-medium text-foreground">
                  Selecione uma loja para começar
                </p>
                <p className="mt-1 text-xs text-default-500">
                  Os ajustes de estoque são feitos loja a loja.
                </p>
              </div>
            ) : (
              <>
                {/* Busca para adicionar produto + Novo Produto */}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <Autocomplete
                    allowsCustomValue={false}
                    aria-label="Buscar produto para adicionar"
                    className="flex-1"
                    inputValue={buscaProduto}
                    isLoading={buscandoProdutos}
                    items={resultadosBusca.filter(
                      (p) => !itens.some((i) => i.id === p.id),
                    )}
                    placeholder="Buscar produto para adicionar..."
                    startContent={
                      <MagnifyingGlassIcon className="h-4 w-4 text-default-400" />
                    }
                    variant="bordered"
                    onInputChange={setBuscaProduto}
                    onSelectionChange={(key) => {
                      if (key) handleAdicionarProduto(key as string);
                    }}
                  >
                    {(item) => (
                      <AutocompleteItem
                        key={item.id}
                        textValue={item.descricao}
                      >
                        <div className="flex flex-col">
                          <span>{item.descricao}</span>
                          <span className="text-xs text-default-400">
                            {item.marca ? `${item.marca} · ` : ""}Estoque atual:{" "}
                            {item.quantidade_atual}
                          </span>
                        </div>
                      </AutocompleteItem>
                    )}
                  </Autocomplete>
                  <Switch
                    isSelected={contagemCega}
                    size="sm"
                    onValueChange={setContagemCega}
                  >
                    <span className="flex items-center gap-1 text-sm">
                      <EyeSlashIcon className="h-4 w-4" />
                      Contagem cega
                    </span>
                  </Switch>
                  {temPermissao("estoque.criar") && (
                    <Button
                      color="default"
                      startContent={<PlusIcon className="h-4 w-4" />}
                      variant="flat"
                      onPress={() => setModalNovoProduto(true)}
                    >
                      Novo Produto
                    </Button>
                  )}
                </div>

                {/* Lista de trabalho: produtos adicionados para ajuste */}
                {itens.length === 0 ? (
                  <div className="rounded-xl border border-default-200/70 bg-content1 py-16 text-center">
                    <MagnifyingGlassIcon className="mx-auto mb-3 h-12 w-12 text-default-300" />
                    <p className="text-sm font-medium text-foreground">
                      Nenhum produto adicionado ainda
                    </p>
                    <p className="mt-1 text-xs text-default-500">
                      Busque um produto acima e selecione-o para adicionar à
                      lista de ajuste.
                    </p>
                  </div>
                ) : (
                  <Card className="shadow-sm">
                    <CardBody className="p-0">
                      <Table
                        removeWrapper
                        aria-label="Ajuste de estoque em massa"
                        classNames={{
                          th: "bg-default-50 text-default-600 text-xs font-semibold uppercase tracking-wider border-b border-default-200",
                          td: "text-sm border-b border-default-100 py-2",
                        }}
                      >
                        <TableHeader>
                          <TableColumn>PRODUTO</TableColumn>
                          <TableColumn>CATEGORIA</TableColumn>
                          <TableColumn width={140}>
                            {contagemCega ? "ATUAL" : "QTD. ATUAL"}
                          </TableColumn>
                          <TableColumn width={160}>NOVA QTD.</TableColumn>
                          <TableColumn width={100}>DIFERENÇA</TableColumn>
                          <TableColumn width={50}> </TableColumn>
                        </TableHeader>
                        <TableBody emptyContent="Nenhum produto na lista">
                          {itens.map((produto) => {
                            const valorEditado =
                              alteracoes[produto.id] !== undefined
                                ? String(alteracoes[produto.id])
                                : "";
                            const diferenca =
                              alteracoes[produto.id] !== undefined
                                ? alteracoes[produto.id] -
                                  produto.quantidade_atual
                                : 0;

                            return (
                              <TableRow key={produto.id}>
                                <TableCell>
                                  <div className="min-w-0 max-w-[280px]">
                                    <p className="truncate font-medium">
                                      {produto.descricao}
                                    </p>
                                    {produto.marca && (
                                      <p className="text-xs text-default-400">
                                        {produto.marca}
                                      </p>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  {produto.categoria || (
                                    <span className="text-default-300">—</span>
                                  )}
                                </TableCell>
                                <TableCell>
                                  {contagemCega ? (
                                    <span className="text-default-300">
                                      •••
                                    </span>
                                  ) : (
                                    <span className="font-semibold tabular-nums">
                                      {produto.quantidade_atual}
                                    </span>
                                  )}
                                </TableCell>
                                <TableCell>
                                  <Input
                                    className="w-24"
                                    min={0}
                                    placeholder={
                                      contagemCega
                                        ? "Contar"
                                        : String(produto.quantidade_atual)
                                    }
                                    size="sm"
                                    type="number"
                                    value={valorEditado}
                                    variant="bordered"
                                    onValueChange={(v) =>
                                      handleAlterarQuantidade(produto.id, v)
                                    }
                                  />
                                </TableCell>
                                <TableCell>
                                  {alteracoes[produto.id] !== undefined &&
                                  diferenca !== 0 ? (
                                    <Chip
                                      color={
                                        diferenca > 0 ? "success" : "danger"
                                      }
                                      size="sm"
                                      variant="flat"
                                    >
                                      {diferenca > 0 ? "+" : ""}
                                      {diferenca}
                                    </Chip>
                                  ) : (
                                    <span className="text-default-300">—</span>
                                  )}
                                </TableCell>
                                <TableCell>
                                  <Button
                                    isIconOnly
                                    aria-label="Remover da lista"
                                    size="sm"
                                    variant="light"
                                    onPress={() =>
                                      handleRemoverItem(produto.id)
                                    }
                                  >
                                    <XMarkIcon className="h-4 w-4 text-default-400" />
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

                {/* Barra de resumo / salvar */}
                {itensAlterados.length > 0 && (
                  <Card className="sticky bottom-4 shadow-lg">
                    <CardBody className="flex flex-col gap-3">
                      <div className="flex flex-wrap items-center gap-4">
                        <span className="text-sm">
                          <span className="font-semibold">
                            {itensAlterados.length}
                          </span>{" "}
                          produto(s) alterado(s), diferença total de{" "}
                          <span className="font-semibold">
                            {totalUnidadesDiferenca > 0 ? "+" : ""}
                            {totalUnidadesDiferenca}
                          </span>{" "}
                          unidade(s)
                        </span>
                      </div>
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                        <Select
                          aria-label="Motivo do ajuste"
                          className="max-w-xs"
                          label="Motivo do ajuste"
                          selectedKeys={[motivo]}
                          variant="bordered"
                          onSelectionChange={(keys) => {
                            const value = Array.from(keys)[0] as string;

                            setMotivo(value || "");
                          }}
                        >
                          {MOTIVOS_AJUSTE.map((m) => (
                            <SelectItem key={m.key}>{m.label}</SelectItem>
                          ))}
                        </Select>
                        <Textarea
                          className="flex-1"
                          label="Observação (opcional)"
                          minRows={1}
                          value={observacao}
                          variant="bordered"
                          onValueChange={setObservacao}
                        />
                        <Button
                          color="primary"
                          isDisabled={salvando}
                          onPress={handleAbrirConfirmSalvar}
                        >
                          Salvar ajustes
                        </Button>
                      </div>
                    </CardBody>
                  </Card>
                )}
              </>
            )}
          </div>
        </Tab>

        {/* ===== ABA: Histórico ===== */}
        <Tab
          key="historico"
          title={
            <div className="flex items-center gap-2">
              <ClockIcon className="h-5 w-5" />
              <span>Histórico</span>
            </div>
          }
        >
          <div className="mt-4 space-y-4">
            {/* Filtros */}
            <Card className="shadow-sm">
              <CardBody className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
                <Input
                  className="max-w-[160px]"
                  label="Data início"
                  type="date"
                  value={filtroDataInicio}
                  variant="bordered"
                  onValueChange={setFiltroDataInicio}
                />
                <Input
                  className="max-w-[160px]"
                  label="Data fim"
                  type="date"
                  value={filtroDataFim}
                  variant="bordered"
                  onValueChange={setFiltroDataFim}
                />
                <Autocomplete
                  allowsCustomValue={false}
                  aria-label="Filtro de produto"
                  className="max-w-xs"
                  inputValue={filtroProdutoBusca}
                  items={produtosAutocomplete}
                  label="Produto"
                  placeholder="Buscar produto..."
                  variant="bordered"
                  onInputChange={setFiltroProdutoBusca}
                  onSelectionChange={(key) => {
                    setFiltroProdutoId((key as string) || "");
                  }}
                >
                  {(item) => (
                    <AutocompleteItem key={item.id}>
                      {item.descricao}
                    </AutocompleteItem>
                  )}
                </Autocomplete>
                <Select
                  aria-label="Filtro de usuário"
                  className="max-w-xs"
                  label="Usuário"
                  placeholder="Todos"
                  selectedKeys={filtroUsuarioId ? [filtroUsuarioId] : []}
                  variant="bordered"
                  onSelectionChange={(keys) => {
                    const value = Array.from(keys)[0] as string;

                    setFiltroUsuarioId(value || "");
                  }}
                >
                  {[
                    <SelectItem key="">Todos</SelectItem>,
                    ...usuarios.map((u) => (
                      <SelectItem key={u.id}>{u.nome}</SelectItem>
                    )),
                  ]}
                </Select>
                <Button
                  isLoading={exportando}
                  startContent={
                    !exportando && <ArrowDownTrayIcon className="h-4 w-4" />
                  }
                  variant="flat"
                  onPress={handleExportarHistorico}
                >
                  Exportar Excel
                </Button>
              </CardBody>
            </Card>

            {/* Tabela de histórico */}
            <Card className="shadow-sm">
              <CardBody className="p-0 overflow-x-auto">
                <Table
                  removeWrapper
                  aria-label="Histórico de movimentações"
                  classNames={{
                    th: "bg-default-50 text-default-600 text-xs font-semibold uppercase tracking-wider border-b border-default-200",
                    td: "text-sm border-b border-default-100 py-2",
                  }}
                >
                  <TableHeader>
                    <TableColumn>DATA/HORA</TableColumn>
                    <TableColumn>PRODUTO</TableColumn>
                    <TableColumn>LOJA</TableColumn>
                    <TableColumn>USUÁRIO</TableColumn>
                    <TableColumn>ANTERIOR → NOVA</TableColumn>
                    <TableColumn>OBSERVAÇÃO</TableColumn>
                  </TableHeader>
                  <TableBody
                    emptyContent="Nenhuma movimentação encontrada"
                    isLoading={loadingHistorico}
                    items={historico}
                    loadingContent={<Spinner size="sm" />}
                  >
                    {(item) => (
                      <TableRow key={item.id}>
                        <TableCell className="whitespace-nowrap">
                          {new Date(item.criado_em).toLocaleString("pt-BR")}
                        </TableCell>
                        <TableCell>
                          <div className="max-w-[220px]">
                            <p className="truncate font-medium">
                              {item.produto_descricao}
                            </p>
                            {item.produto_marca && (
                              <p className="text-xs text-default-400">
                                {item.produto_marca}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{item.loja_nome || "—"}</TableCell>
                        <TableCell>{item.usuario_nome || "Sistema"}</TableCell>
                        <TableCell>
                          <span className="tabular-nums">
                            {item.quantidade_anterior ?? "—"} →{" "}
                            <span className="font-semibold">
                              {item.quantidade_nova ?? "—"}
                            </span>
                          </span>
                          {typeof item.quantidade_alterada === "number" &&
                            item.quantidade_alterada !== 0 && (
                              <Chip
                                className="ml-2"
                                color={
                                  item.quantidade_alterada > 0
                                    ? "success"
                                    : "danger"
                                }
                                size="sm"
                                variant="flat"
                              >
                                {item.quantidade_alterada > 0 ? "+" : ""}
                                {item.quantidade_alterada}
                              </Chip>
                            )}
                        </TableCell>
                        <TableCell>
                          <span className="max-w-[240px] truncate text-default-500">
                            {item.observacao || item.motivo || "—"}
                          </span>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardBody>
            </Card>

            {totalPaginasHistorico > 1 && (
              <div className="flex justify-center">
                <Pagination
                  showControls
                  color="primary"
                  page={paginaHistorico}
                  total={totalPaginasHistorico}
                  onChange={setPaginaHistorico}
                />
              </div>
            )}
          </div>
        </Tab>
      </Tabs>

      {/* Modal Novo Produto */}
      <ProdutoFormModal
        isOpen={modalNovoProduto}
        produto={null}
        onClose={() => setModalNovoProduto(false)}
        onSubmit={handleCriarProduto}
      />

      {/* Confirmação de salvar ajustes */}
      <ConfirmModal
        cancelText="Cancelar"
        confirmColor="primary"
        confirmText="Confirmar e salvar"
        isLoading={salvando}
        isOpen={confirmSalvarAberto}
        message={
          <div className="space-y-2">
            <p>
              Você está prestes a ajustar{" "}
              <span className="font-semibold">{itensAlterados.length}</span>{" "}
              produto(s) na loja{" "}
              <span className="font-semibold">{lojaSelecionadaNome}</span>, com
              diferença total de{" "}
              <span className="font-semibold">
                {totalUnidadesDiferenca > 0 ? "+" : ""}
                {totalUnidadesDiferenca}
              </span>{" "}
              unidade(s).
            </p>
            {salvando && (
              <p className="text-xs text-default-500">
                Salvando {progressoSalvar.atual} de {progressoSalvar.total}...
              </p>
            )}
          </div>
        }
        title="Confirmar ajuste de estoque"
        onClose={() => !salvando && setConfirmSalvarAberto(false)}
        onConfirm={handleSalvarAjustes}
      />

      {/* Toast */}
      {toast.ToastComponent}
    </div>
  );
}
