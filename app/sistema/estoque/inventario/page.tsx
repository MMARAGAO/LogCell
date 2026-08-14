"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import { Input, Textarea } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { Autocomplete, AutocompleteItem } from "@heroui/autocomplete";
import { Tabs, Tab } from "@heroui/tabs";
import { Switch } from "@heroui/switch";
import { Checkbox } from "@heroui/checkbox";
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
  // Marca itens trazidos por uma busca (não criados manualmente), para saber
  // quais somem quando uma nova busca é feita (ver handleBuscarProdutos).
  origemBusca?: boolean;
}

const MOTIVOS_AJUSTE = [
  { key: "contagem_fisica", label: "Contagem física" },
  { key: "correcao_erro", label: "Correção de erro" },
  { key: "quebra_perda", label: "Quebra ou perda" },
  { key: "devolucao", label: "Devolução" },
  { key: "outro", label: "Outro" },
];

function normalizarTexto(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

// Pontua o quão relevante um produto é para os termos buscados, para que
// resultados mais "óbvios" (nome começa com o termo, termos em sequência)
// apareçam antes de matches fracos (termo só aparece na marca, por exemplo).
function calcularRelevancia(produto: ProdutoAjuste, termos: string[]): number {
  const desc = normalizarTexto(produto.descricao);
  const fraseCompleta = termos.join(" ");
  let score = 0;

  if (desc === fraseCompleta) score += 1000;
  else if (desc.startsWith(fraseCompleta)) score += 500;
  else if (desc.includes(fraseCompleta)) score += 250;

  termos.forEach((termo, idx) => {
    const pos = desc.indexOf(termo);

    if (pos === -1) {
      // Não achou o termo na descrição — deve ter batido só na marca ou nos
      // modelos, então penaliza bastante para ir para o fim da lista.
      score -= 200;

      return;
    }

    score += 50;
    if (idx === 0 && pos === 0) score += 100; // primeiro termo logo no início
    score -= pos * 0.2; // aparecer mais cedo na descrição é melhor
  });

  return score;
}

// Rascunho da lista de ajuste em andamento, salvo no navegador para
// sobreviver a um refresh/fechamento acidental da aba.
const RASCUNHO_STORAGE_KEY = "logcell_inventario_rascunho_v1";
const RASCUNHO_VALIDADE_MS = 7 * 24 * 60 * 60 * 1000; // 7 dias

interface RascunhoAjuste {
  lojaId: string;
  itens: ProdutoAjuste[];
  alteracoes: Record<string, number>;
  motivo: string;
  observacao: string;
  contagemCega: boolean;
  atualizadoEm: number;
}

function carregarRascunho(): RascunhoAjuste | null {
  if (typeof window === "undefined") return null;
  try {
    const bruto = window.localStorage.getItem(RASCUNHO_STORAGE_KEY);

    if (!bruto) return null;

    const rascunho = JSON.parse(bruto) as RascunhoAjuste;

    if (Date.now() - rascunho.atualizadoEm > RASCUNHO_VALIDADE_MS) {
      window.localStorage.removeItem(RASCUNHO_STORAGE_KEY);

      return null;
    }

    return rascunho;
  } catch {
    return null;
  }
}

function salvarRascunho(rascunho: RascunhoAjuste) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(RASCUNHO_STORAGE_KEY, JSON.stringify(rascunho));
  } catch {
    // Silencioso: localStorage indisponível (modo privado, quota etc.) não
    // deve quebrar o fluxo de ajuste, só perde a proteção contra refresh.
  }
}

function limparRascunho() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(RASCUNHO_STORAGE_KEY);
  } catch {
    // Idem: falha ao limpar não é crítica.
  }
}

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
  const [totalResultadosBusca, setTotalResultadosBusca] = useState(0);
  const [buscandoProdutos, setBuscandoProdutos] = useState(false);
  // Controle de paginação da busca atual, para o botão "Carregar mais".
  const [ultimaBusca, setUltimaBusca] = useState("");
  const [paginaBusca, setPaginaBusca] = useState(1);
  const [carregadosBusca, setCarregadosBusca] = useState(0);
  const [carregandoMais, setCarregandoMais] = useState(false);
  const [itens, setItens] = useState<ProdutoAjuste[]>([]);
  const [alteracoes, setAlteracoes] = useState<Record<string, number>>({});
  // IDs retornados pela busca mais recente. Um produto já alterado some da
  // tabela de edição (mas continua contando para a conferência) até que a
  // loja mude, a lista seja limpa, ou ele seja buscado de novo pelo nome.
  const [buscaAtualIds, setBuscaAtualIds] = useState<Set<string>>(new Set());
  const [motivo, setMotivo] = useState<string>("contagem_fisica");
  const [observacao, setObservacao] = useState("");
  const [contagemCega, setContagemCega] = useState(false);
  const [modalNovoProduto, setModalNovoProduto] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [progressoSalvar, setProgressoSalvar] = useState({
    atual: 0,
    total: 0,
  });
  const [mostrarRevisao, setMostrarRevisao] = useState(false);
  const [selecionadosRevisao, setSelecionadosRevisao] = useState<Set<string>>(
    new Set(),
  );
  const restaurandoRascunhoRef = useRef(false);

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
  const [totalProdutosAutocomplete, setTotalProdutosAutocomplete] = useState(0);
  const [usuarios, setUsuarios] = useState<{ id: string; nome: string }[]>([]);
  const [filtroUsuarioId, setFiltroUsuarioId] = useState<string>("");
  const [exportando, setExportando] = useState(false);

  // Trocar de loja reinicia a lista de trabalho (quantidades são por loja).
  // Pulado uma vez quando a troca vem da restauração de um rascunho salvo.
  useEffect(() => {
    if (restaurandoRascunhoRef.current) {
      restaurandoRascunhoRef.current = false;

      return;
    }
    setItens([]);
    setAlteracoes({});
    setBuscaAtualIds(new Set());
    setUltimaBusca("");
    setPaginaBusca(1);
    setCarregadosBusca(0);
  }, [lojaId]);

  // Salva a lista de trabalho no navegador a cada mudança, para sobreviver a
  // um refresh/fechamento acidental da aba. Limpa o rascunho quando a lista
  // fica vazia (após salvar, limpar ou remover todos os itens).
  useEffect(() => {
    if (!lojaId) return;

    if (itens.length === 0) {
      limparRascunho();

      return;
    }

    salvarRascunho({
      lojaId,
      itens,
      alteracoes,
      motivo,
      observacao,
      contagemCega,
      atualizadoEm: Date.now(),
    });
  }, [lojaId, itens, alteracoes, motivo, observacao, contagemCega]);

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

        const rascunho = carregarRascunho();
        const lojaDoRascunhoValida =
          rascunho && filtraveis.some((l) => String(l.id) === rascunho.lojaId);

        if (lojaDoRascunhoValida && rascunho) {
          restaurandoRascunhoRef.current = true;
          setLojaId(rascunho.lojaId);
          setItens(rascunho.itens);
          setAlteracoes(rascunho.alteracoes);
          setMotivo(rascunho.motivo);
          setObservacao(rascunho.observacao);
          setContagemCega(rascunho.contagemCega);

          const qtdAlterados = rascunho.itens.filter((produto) => {
            const novaQuantidade = rascunho.alteracoes[produto.id];

            return (
              novaQuantidade !== undefined &&
              novaQuantidade !== produto.quantidade_atual
            );
          }).length;

          toast.info(
            qtdAlterados > 0
              ? `Recuperamos ${qtdAlterados} produto(s) com quantidade alterada de uma lista não salva (${rascunho.itens.length} produto(s) na lista de trabalho).`
              : `Recuperamos sua lista de trabalho com ${rascunho.itens.length} produto(s) (nenhum com quantidade alterada ainda).`,
          );
        } else if (filtraveis.length === 1) {
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

  // Busca uma página de produtos e já devolve mapeado para ProdutoAjuste,
  // ordenado por relevância ao termo buscado. Usado tanto pela busca nova
  // quanto pelo "Carregar mais" (mesma busca, próxima página).
  const buscarPaginaProdutos = async (termo: string, pagina: number) => {
    const result = await buscarProdutosPaginados({
      busca: termo,
      ativo: true,
      page: pagina,
      pageSize: 200,
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
        origemBusca: true,
      };
    });

    const termos = normalizarTexto(termo)
      .split(/\s+/)
      .filter((t) => t.length > 0);

    encontrados.sort(
      (a, b) => calcularRelevancia(b, termos) - calcularRelevancia(a, termos),
    );

    return { encontrados, total: result.total };
  };

  const handleBuscarProdutos = async () => {
    if (!lojaId) return;

    const termo = buscaProduto.trim();

    if (termo.length < 2) {
      toast.warning("Digite pelo menos 2 caracteres para buscar");

      return;
    }

    setBuscandoProdutos(true);
    try {
      const { encontrados, total } = await buscarPaginaProdutos(termo, 1);

      if (encontrados.length === 0) {
        toast.warning("Nenhum produto encontrado para essa busca");
      }

      // Uma nova busca substitui os resultados da busca anterior — só ficam
      // na lista os itens que vieram dela e já tiveram a quantidade alterada
      // (senão perderia o trabalho feito), além de itens adicionados
      // manualmente (Novo Produto), que nunca são removidos por uma busca.
      setItens((prev) => {
        const manter = prev.filter((p) => {
          const foiEditado =
            alteracoes[p.id] !== undefined &&
            alteracoes[p.id] !== p.quantidade_atual;

          return foiEditado || !p.origemBusca;
        });
        const idsManter = new Set(manter.map((p) => p.id));
        const novos = encontrados.filter((p) => !idsManter.has(p.id));

        return [...manter, ...novos];
      });
      setBuscaAtualIds(new Set(encontrados.map((p) => p.id)));
      setTotalResultadosBusca(total);
      setUltimaBusca(termo);
      setPaginaBusca(1);
      setCarregadosBusca(encontrados.length);
      setBuscaProduto("");
    } catch (error) {
      console.error("Erro ao buscar produtos:", error);
      toast.error("Erro ao buscar produtos");
    } finally {
      setBuscandoProdutos(false);
    }
  };

  const handleCarregarMaisResultados = async () => {
    if (!ultimaBusca) return;

    setCarregandoMais(true);
    try {
      const proximaPagina = paginaBusca + 1;
      const { encontrados, total } = await buscarPaginaProdutos(
        ultimaBusca,
        proximaPagina,
      );

      setItens((prev) => {
        const idsExistentes = new Set(prev.map((p) => p.id));
        const novos = encontrados.filter((p) => !idsExistentes.has(p.id));

        return [...prev, ...novos];
      });
      setBuscaAtualIds((prev) => {
        const novo = new Set(prev);

        encontrados.forEach((p) => novo.add(p.id));

        return novo;
      });
      setTotalResultadosBusca(total);
      setPaginaBusca(proximaPagina);
      setCarregadosBusca((prev) => prev + encontrados.length);
    } catch (error) {
      console.error("Erro ao carregar mais produtos:", error);
      toast.error("Erro ao carregar mais produtos");
    } finally {
      setCarregandoMais(false);
    }
  };

  const handleLimparLista = () => {
    setItens([]);
    setAlteracoes({});
    setTotalResultadosBusca(0);
    setBuscaAtualIds(new Set());
    setUltimaBusca("");
    setPaginaBusca(1);
    setCarregadosBusca(0);
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
      setTotalProdutosAutocomplete(0);

      return;
    }
    const t = setTimeout(async () => {
      try {
        const result = await buscarProdutosPaginados({
          busca: filtroProdutoBusca,
          page: 1,
          pageSize: 50,
        });

        setProdutosAutocomplete(
          result.data.map((p: any) => ({ id: p.id, descricao: p.descricao })),
        );
        setTotalProdutosAutocomplete(result.total);
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

  // Itens exibidos na tabela de edição: escondemos os que já foram alterados
  // (eles continuam contando para a conferência) para não poluir a tela,
  // exceto os que fazem parte da busca mais recente — se você procurar o
  // nome de um produto já alterado de novo, ele reaparece para reedição.
  const itensVisiveis = useMemo(() => {
    return itens.filter((produto) => {
      const foiEditado =
        alteracoes[produto.id] !== undefined &&
        alteracoes[produto.id] !== produto.quantidade_atual;

      return !foiEditado || buscaAtualIds.has(produto.id);
    });
  }, [itens, alteracoes, buscaAtualIds]);

  const totalUnidadesDiferenca = itensAlterados.reduce(
    (soma, item) => soma + item.diferenca,
    0,
  );

  // Sai da revisão automaticamente se não sobrar nada para revisar (ex: usuário
  // limpou os selecionados ou desfez as alterações restantes).
  useEffect(() => {
    if (mostrarRevisao && itensAlterados.length === 0) {
      setMostrarRevisao(false);
    }
  }, [mostrarRevisao, itensAlterados.length]);

  const handleAbrirRevisao = () => {
    if (!temPermissao("estoque.ajustar")) {
      toast.error("Você não tem permissão para ajustar o estoque");

      return;
    }
    if (!lojaId) {
      toast.error("Selecione uma loja para ajustar o estoque");

      return;
    }
    if (itensAlterados.length === 0) {
      toast.warning("Nenhuma alteração para salvar");

      return;
    }
    setSelecionadosRevisao(new Set(itensAlterados.map((i) => i.produtoId)));
    setMostrarRevisao(true);
  };

  const handleToggleSelecionadoRevisao = (produtoId: string) => {
    setSelecionadosRevisao((prev) => {
      const novo = new Set(prev);

      if (novo.has(produtoId)) novo.delete(produtoId);
      else novo.add(produtoId);

      return novo;
    });
  };

  const handleToggleTodosRevisao = (marcar: boolean) => {
    setSelecionadosRevisao(
      marcar ? new Set(itensAlterados.map((i) => i.produtoId)) : new Set(),
    );
  };

  const handleLimparSelecionadosRevisao = () => {
    selecionadosRevisao.forEach((id) => handleRemoverItem(id));
    setSelecionadosRevisao(new Set());
  };

  const handleSalvarAjustes = async () => {
    if (!user || !lojaId) return;

    if (!motivo) {
      toast.error("Selecione o motivo do ajuste");

      return;
    }

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
      setBuscaAtualIds(new Set());
      setUltimaBusca("");
      setPaginaBusca(1);
      setCarregadosBusca(0);
      setSelecionadosRevisao(new Set());
      setMostrarRevisao(false);
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

  if (!temPermissao("estoque.inventario")) {
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
            ) : mostrarRevisao ? (
              <>
                {/* Tela de conferência: só os produtos com quantidade alterada */}
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">
                      Conferência de ajustes
                    </h2>
                    <p className="text-sm text-default-500">
                      Revise os {itensAlterados.length} produto(s) alterado(s)
                      na loja{" "}
                      <span className="font-medium">{lojaSelecionadaNome}</span>{" "}
                      antes de salvar.
                    </p>
                  </div>
                  <Button
                    isDisabled={salvando}
                    startContent={<ArrowLeftIcon className="h-4 w-4" />}
                    variant="light"
                    onPress={() => setMostrarRevisao(false)}
                  >
                    Voltar e editar
                  </Button>
                </div>

                <div className="flex items-center justify-between px-1">
                  <Checkbox
                    isIndeterminate={
                      selecionadosRevisao.size > 0 &&
                      selecionadosRevisao.size < itensAlterados.length
                    }
                    isSelected={
                      selecionadosRevisao.size === itensAlterados.length &&
                      itensAlterados.length > 0
                    }
                    size="sm"
                    onValueChange={handleToggleTodosRevisao}
                  >
                    <span className="text-xs text-default-500">
                      {selecionadosRevisao.size} de {itensAlterados.length}{" "}
                      selecionado(s)
                    </span>
                  </Checkbox>
                  <Button
                    className="h-7 px-2 text-xs text-danger"
                    isDisabled={selecionadosRevisao.size === 0 || salvando}
                    size="sm"
                    variant="light"
                    onPress={handleLimparSelecionadosRevisao}
                  >
                    Limpar selecionados
                  </Button>
                </div>

                <Card className="shadow-sm">
                  <CardBody className="p-0">
                    <Table
                      removeWrapper
                      aria-label="Conferência de ajustes de estoque"
                      classNames={{
                        th: "bg-default-50 text-default-600 text-xs font-semibold uppercase tracking-wider border-b border-default-200",
                        td: "text-sm border-b border-default-100 py-2",
                      }}
                    >
                      <TableHeader>
                        <TableColumn width={40}> </TableColumn>
                        <TableColumn>PRODUTO</TableColumn>
                        <TableColumn width={100}>ATUAL</TableColumn>
                        <TableColumn width={160}>NOVA QTD.</TableColumn>
                        <TableColumn width={100}>DIFERENÇA</TableColumn>
                        <TableColumn width={50}> </TableColumn>
                      </TableHeader>
                      <TableBody emptyContent="Nenhum produto para revisar">
                        {itensAlterados.map((item) => (
                          <TableRow key={item.produtoId}>
                            <TableCell>
                              <Checkbox
                                isSelected={selecionadosRevisao.has(
                                  item.produtoId,
                                )}
                                size="sm"
                                onValueChange={() =>
                                  handleToggleSelecionadoRevisao(item.produtoId)
                                }
                              />
                            </TableCell>
                            <TableCell>
                              <p className="min-w-[240px] font-medium">
                                {item.descricao}
                              </p>
                            </TableCell>
                            <TableCell>
                              <span className="font-semibold tabular-nums">
                                {item.quantidadeAtual}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Input
                                className="w-24"
                                min={0}
                                size="sm"
                                type="number"
                                value={String(item.quantidadeNova)}
                                variant="bordered"
                                onValueChange={(v) =>
                                  handleAlterarQuantidade(item.produtoId, v)
                                }
                              />
                            </TableCell>
                            <TableCell>
                              <Chip
                                color={
                                  item.diferenca > 0 ? "success" : "danger"
                                }
                                size="sm"
                                variant="flat"
                              >
                                {item.diferenca > 0 ? "+" : ""}
                                {item.diferenca}
                              </Chip>
                            </TableCell>
                            <TableCell>
                              <Button
                                isIconOnly
                                aria-label="Remover da lista"
                                size="sm"
                                variant="light"
                                onPress={() =>
                                  handleRemoverItem(item.produtoId)
                                }
                              >
                                <XMarkIcon className="h-4 w-4 text-default-400" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardBody>
                </Card>

                <Card className="sticky bottom-4 z-20 bg-content1 shadow-lg">
                  <CardBody className="flex flex-col gap-3">
                    <div className="flex flex-wrap items-center gap-4">
                      <span className="text-sm">
                        <span className="font-semibold">
                          {itensAlterados.length}
                        </span>{" "}
                        produto(s), diferença total de{" "}
                        <span className="font-semibold">
                          {totalUnidadesDiferenca > 0 ? "+" : ""}
                          {totalUnidadesDiferenca}
                        </span>{" "}
                        unidade(s)
                      </span>
                      {salvando && (
                        <span className="text-xs text-default-500">
                          Salvando {progressoSalvar.atual} de{" "}
                          {progressoSalvar.total}...
                        </span>
                      )}
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
                        isDisabled={itensAlterados.length === 0}
                        isLoading={salvando}
                        onPress={handleSalvarAjustes}
                      >
                        Salvar ajustes
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              </>
            ) : (
              <>
                {/* Busca para adicionar produto + Novo Produto */}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
                  <div className="flex-1">
                    <div className="flex gap-2">
                      <Input
                        aria-label="Buscar produto"
                        className="flex-1"
                        placeholder="Buscar produto (ex: bateria foxconn)... pressione Enter"
                        startContent={
                          <MagnifyingGlassIcon className="h-4 w-4 text-default-400" />
                        }
                        value={buscaProduto}
                        variant="bordered"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleBuscarProdutos();
                        }}
                        onValueChange={setBuscaProduto}
                      />
                      <Button
                        color="primary"
                        isLoading={buscandoProdutos}
                        variant="flat"
                        onPress={handleBuscarProdutos}
                      >
                        Pesquisar
                      </Button>
                    </div>
                  </div>
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
                {itensVisiveis.length === 0 ? (
                  <div className="rounded-xl border border-default-200/70 bg-content1 py-16 text-center">
                    <MagnifyingGlassIcon className="mx-auto mb-3 h-12 w-12 text-default-300" />
                    <p className="text-sm font-medium text-foreground">
                      {itens.length === 0
                        ? "Nenhum produto adicionado ainda"
                        : "Todos os produtos buscados já foram ajustados"}
                    </p>
                    <p className="mt-1 text-xs text-default-500">
                      {itens.length === 0
                        ? "Busque um produto acima e pressione Enter — todos os resultados aparecem na tabela abaixo, prontos para editar."
                        : "Eles saíram da tabela para não poluir a tela. Veja a lista de conferência abaixo, ou busque o nome de um deles de novo para reeditar."}
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between px-1">
                      <span className="text-xs text-default-500">
                        {itensVisiveis.length} produto(s) na lista
                      </span>
                      <Button
                        className="h-7 px-2 text-xs text-default-500"
                        size="sm"
                        variant="light"
                        onPress={handleLimparLista}
                      >
                        Limpar lista
                      </Button>
                    </div>
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
                            {itensVisiveis.map((produto) => {
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
                                    <div className="min-w-[240px]">
                                      <p className="font-medium">
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
                                      <span className="text-default-300">
                                        —
                                      </span>
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
                                      <span className="text-default-300">
                                        —
                                      </span>
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
                  </>
                )}

                {/* Carregar mais resultados da busca atual */}
                {ultimaBusca && carregadosBusca < totalResultadosBusca && (
                  <div className="flex flex-col items-center gap-2 py-2">
                    <p className="text-xs text-default-500">
                      Mostrando {carregadosBusca} de {totalResultadosBusca}{" "}
                      produtos encontrados para &quot;{ultimaBusca}&quot;.
                    </p>
                    <Button
                      isLoading={carregandoMais}
                      size="sm"
                      variant="flat"
                      onPress={handleCarregarMaisResultados}
                    >
                      Carregar mais{" "}
                      {Math.min(200, totalResultadosBusca - carregadosBusca)}
                    </Button>
                  </div>
                )}

                {/* Barra de resumo / ir para conferência */}
                {itensAlterados.length > 0 && (
                  <Card className="sticky bottom-4 z-20 bg-content1 shadow-lg">
                    <CardBody className="flex flex-row flex-wrap items-center justify-between gap-3">
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
                      <Button color="primary" onPress={handleAbrirRevisao}>
                        Ver lista para conferência
                      </Button>
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
                <div className="max-w-xs">
                  <Autocomplete
                    allowsCustomValue={false}
                    aria-label="Filtro de produto"
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
                  {totalProdutosAutocomplete > produtosAutocomplete.length && (
                    <p className="mt-1 px-1 text-xs text-warning-600">
                      Mostrando {produtosAutocomplete.length} de{" "}
                      {totalProdutosAutocomplete} resultados. Refine a busca.
                    </p>
                  )}
                </div>
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
                          <div className="min-w-[220px]">
                            <p className="font-medium">
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

      {/* Toast */}
      {toast.ToastComponent}
    </div>
  );
}
