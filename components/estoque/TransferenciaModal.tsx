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
import { useState, useEffect, useMemo } from "react";
import { Card, CardBody } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Divider } from "@heroui/divider";
import { Pagination } from "@heroui/pagination";
import { useToast } from "@/components/Toast";
import {
  ArrowRightIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  CurrencyDollarIcon,
  TrashIcon,
  BoltIcon,
  ClockIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  PrinterIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import { Progress } from "@heroui/progress";
import { Produto as ProdutoSistema } from "@/types";
import {
  gerarRelatorioTransferenciaDetalhado,
  gerarRelatorioTransferenciaResumido,
} from "@/lib/exportarTransferencias";

interface Loja {
  id: number;
  nome: string;
}

interface Produto {
  id: string;
  descricao: string;
  marca?: string;
  quantidade_disponivel: number;
  modelos?: string;
  preco_venda?: number;
  estoques_lojas?: Array<{
    id_loja: number;
    loja_nome: string;
    quantidade: number;
  }>;
}

interface TransferenciaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  produto?: ProdutoSistema; // Produto opcional pré-selecionado
}

interface ItemTransferencia {
  id_produto: string;
  produto_descricao: string;
  produto_marca?: string;
  quantidade: number;
  quantidade_disponivel: number;
  preco_venda?: number;
}

interface HistoricoTransferencia {
  id: string;
  id_produto: string;
  quantidade_alterada: number;
  criado_em: string;
  observacao?: string;
  usuario_id: string;
  produto?: {
    descricao: string;
    marca?: string;
  };
}

export default function TransferenciaModal({
  isOpen,
  onClose,
  onSuccess,
  produto,
}: TransferenciaModalProps) {
  const toast = useToast();

  // Buscar lojas e usuário
  const [lojas, setLojas] = useState<Loja[]>([]);
  const [userId, setUserId] = useState<string>("");

  // Estados principais
  const [loading, setLoading] = useState(false);
  const [lojaOrigem, setLojaOrigem] = useState<string>("");
  const [lojaDestino, setLojaDestino] = useState<string>("");
  const [observacao, setObservacao] = useState("");

  // Estados para produtos
  const [produtosDisponiveis, setProdutosDisponiveis] = useState<Produto[]>([]);
  const [produtosFiltrados, setProdutosFiltrados] = useState<Produto[]>([]);
  const [loadingProdutos, setLoadingProdutos] = useState(false);
  const [progressoCarregamento, setProgressoCarregamento] = useState(0);
  const [produtoSelecionado, setProdutoSelecionado] = useState<string>("");
  const [quantidade, setQuantidade] = useState<number>(1);
  const [buscaProduto, setBuscaProduto] = useState<string>("");

  // Estados de paginação
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [paginaAtualLista, setPaginaAtualLista] = useState(1);
  const [paginaAtualHistorico, setPaginaAtualHistorico] = useState(1);
  const ITENS_POR_PAGINA = 12; // 4 colunas x 3 linhas
  const ITENS_POR_PAGINA_LISTA = 9; // 3 colunas x 3 linhas
  const ITENS_POR_PAGINA_HISTORICO = 10;

  // Lista de itens a transferir
  const [itensTransferencia, setItensTransferencia] = useState<
    ItemTransferencia[]
  >([]);

  // Estados para histórico
  const [historicoTransferencias, setHistoricoTransferencias] = useState<
    HistoricoTransferencia[]
  >([]);
  const [loadingHistorico, setLoadingHistorico] = useState(false);
  const [mostrarHistorico, setMostrarHistorico] = useState(false);

  // Carregar lojas e usuário ao abrir modal
  useEffect(() => {
    if (isOpen) {
      carregarLojasEUsuario();
    }
  }, [isOpen]);

  const carregarLojasEUsuario = async () => {
    try {
      const { supabase } = await import("@/lib/supabaseClient");

      // Buscar lojas ativas
      const { data: lojasData, error: lojasError } = await supabase
        .from("lojas")
        .select("id, nome")
        .eq("ativo", true)
        .order("nome");

      if (lojasError) throw lojasError;
      setLojas(lojasData || []);

      // Buscar usuário atual
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    } catch (error) {
      console.error("Erro ao carregar lojas:", error);
      toast.error("Erro ao carregar lojas");
    }
  };

  // Resetar estado ao abrir/fechar modal
  useEffect(() => {
    if (isOpen) {
      setLojaOrigem("");
      setLojaDestino("");
      setObservacao("");
      setProdutoSelecionado("");
      setQuantidade(1);
      setItensTransferencia([]);
      setProdutosDisponiveis([]);
      setProdutosFiltrados([]);
      setBuscaProduto("");
      setPaginaAtual(1);
      setPaginaAtualLista(1);

      // Se produto foi passado, adicionar à lista automaticamente
      if (produto) {
        setProdutoSelecionado(produto.id);
      }
    }
  }, [isOpen, produto]);

  // Carregar produtos quando selecionar loja origem
  useEffect(() => {
    if (lojaOrigem) {
      carregarProdutosLoja(parseInt(lojaOrigem));
      setPaginaAtual(1); // Resetar paginação ao mudar de loja
    } else {
      setProdutosDisponiveis([]);
      setProdutosFiltrados([]);
    }
  }, [lojaOrigem]);

  // Carregar histórico quando ambas as lojas forem selecionadas
  useEffect(() => {
    if (lojaOrigem && lojaDestino && mostrarHistorico) {
      carregarHistorico();
    } else {
      setHistoricoTransferencias([]);
    }
  }, [lojaOrigem, lojaDestino, mostrarHistorico]);

  // Filtrar produtos conforme busca (busca inteligente com palavras separadas)
  useEffect(() => {
    if (buscaProduto.trim() === "") {
      setProdutosFiltrados(produtosDisponiveis);
    } else {
      // Dividir busca em palavras individuais
      const palavras = buscaProduto
        .toLowerCase()
        .split(/\s+/)
        .filter((p) => p.length > 0);

      const filtrados = produtosDisponiveis.filter((produto) => {
        // Concatenar todos os campos pesquisáveis
        const textoBusca = [produto.descricao, produto.marca, produto.modelos]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        // Verificar se TODAS as palavras estão presentes (em qualquer ordem)
        return palavras.every((palavra) => textoBusca.includes(palavra));
      });

      setProdutosFiltrados(filtrados);
    }

    // Resetar para primeira página quando buscar
    setPaginaAtual(1);
  }, [buscaProduto, produtosDisponiveis]);

  // Calcular lojas disponíveis para destino (excluir origem)
  const lojasDestinoDisponiveis = useMemo(() => {
    if (!lojaOrigem) return lojas;
    return lojas.filter((l) => l.id.toString() !== lojaOrigem);
  }, [lojas, lojaOrigem]);

  // Carregar produtos da loja origem
  const carregarProdutosLoja = async (idLoja: number) => {
    setLoadingProdutos(true);
    setProgressoCarregamento(0);
    try {
      const { supabase } = await import("@/lib/supabaseClient");

      let todosProdutos: Produto[] = [];
      let page = 0;
      const pageSize = 1000;
      let hasMore = true;

      // Carregar todos os produtos em lotes
      while (hasMore) {
        const { data, error } = await supabase
          .from("estoque_lojas")
          .select(
            `
            id_produto,
            quantidade,
            produto:produtos!inner(
              descricao, 
              marca, 
              modelos, 
              preco_venda, 
              ativo,
              estoques_lojas:estoque_lojas(
                id_loja,
                quantidade,
                loja:lojas(nome)
              )
            )
          `
          )
          .eq("id_loja", idLoja)
          .eq("produto.ativo", true)
          .gt("quantidade", 0)
          .range(page * pageSize, (page + 1) * pageSize - 1)
          .order("produto(descricao)", { ascending: true });

        if (error) throw error;

        if (data && data.length > 0) {
          const produtosBatch: Produto[] = data.map((item: any) => ({
            id: item.id_produto,
            descricao: item.produto?.descricao || "Sem descrição",
            marca: item.produto?.marca,
            modelos: item.produto?.modelos,
            preco_venda: item.produto?.preco_venda,
            quantidade_disponivel: item.quantidade,
            estoques_lojas:
              item.produto?.estoques_lojas?.map((est: any) => ({
                id_loja: est.id_loja,
                loja_nome: est.loja?.nome || "Sem nome",
                quantidade: est.quantidade,
              })) || [],
          }));

          todosProdutos = [...todosProdutos, ...produtosBatch];

          // Atualizar progresso
          setProgressoCarregamento(todosProdutos.length);

          // Se retornou menos que o tamanho da página, não há mais dados
          hasMore = data.length === pageSize;
          page++;
        } else {
          hasMore = false;
        }
      }

      // Ordenar alfabeticamente após carregar todos
      todosProdutos.sort((a, b) => a.descricao.localeCompare(b.descricao));

      setProdutosDisponiveis(todosProdutos);
      setProdutosFiltrados(todosProdutos);
    } catch (error) {
      console.error("Erro ao carregar produtos:", error);
      toast.error("Erro ao carregar produtos da loja");
      setProdutosDisponiveis([]);
    } finally {
      setLoadingProdutos(false);
    }
  };

  // Carregar histórico de transferências
  const carregarHistorico = async () => {
    if (!lojaOrigem || !lojaDestino) return;

    setLoadingHistorico(true);
    try {
      const { supabase } = await import("@/lib/supabaseClient");

      // Buscar transferências de saída da loja origem para a loja destino
      const { data, error } = await supabase
        .from("historico_estoque")
        .select(
          `
          id,
          id_produto,
          quantidade_alterada,
          criado_em,
          observacao,
          usuario_id,
          produto:produtos(descricao, marca)
        `
        )
        .eq("id_loja", parseInt(lojaOrigem))
        .eq("tipo_movimentacao", "transferencia_saida")
        .ilike(
          "observacao",
          `%${lojas.find((l) => l.id === parseInt(lojaDestino))?.nome}%`
        )
        .order("criado_em", { ascending: false })
        .limit(50); // Limitar a 50 registros mais recentes

      if (error) throw error;

      const historico: HistoricoTransferencia[] = (data || []).map(
        (item: any) => ({
          id: item.id,
          id_produto: item.id_produto,
          quantidade_alterada: Math.abs(item.quantidade_alterada),
          criado_em: item.criado_em,
          observacao: item.observacao,
          usuario_id: item.usuario_id,
          produto: item.produto,
        })
      );

      setHistoricoTransferencias(historico);
      setPaginaAtualHistorico(1); // Resetar para primeira página
    } catch (error) {
      console.error("Erro ao carregar histórico:", error);
      toast.error("Erro ao carregar histórico de transferências");
      setHistoricoTransferencias([]);
    } finally {
      setLoadingHistorico(false);
    }
  };

  // Produto selecionado completo
  const produtoAtual = useMemo(() => {
    return produtosDisponiveis.find((p) => p.id === produtoSelecionado);
  }, [produtosDisponiveis, produtoSelecionado]);

  // Quantidade já adicionada na lista para este produto
  const quantidadeJaAdicionada = useMemo(() => {
    const item = itensTransferencia.find(
      (i) => i.id_produto === produtoSelecionado
    );
    return item ? item.quantidade : 0;
  }, [itensTransferencia, produtoSelecionado]);

  // Quantidade disponível após considerar itens na lista
  const quantidadeDisponivel = useMemo(() => {
    if (!produtoAtual) return 0;
    return produtoAtual.quantidade_disponivel - quantidadeJaAdicionada;
  }, [produtoAtual, quantidadeJaAdicionada]);

  // Validação se pode adicionar
  const podeAdicionar =
    produtoSelecionado && quantidade > 0 && quantidade <= quantidadeDisponivel;

  // Calcular estatísticas da transferência
  const estatisticasTransferencia = useMemo(() => {
    const totalItens = itensTransferencia.length;
    const totalUnidades = itensTransferencia.reduce(
      (acc, item) => acc + item.quantidade,
      0
    );
    const valorTotal = itensTransferencia.reduce(
      (acc, item) => acc + (item.preco_venda || 0) * item.quantidade,
      0
    );

    return { totalItens, totalUnidades, valorTotal };
  }, [itensTransferencia]);

  // Calcular progresso das etapas
  const progressoEtapas = useMemo(() => {
    let etapas = 0;
    let completas = 0;

    // Etapa 1: Lojas selecionadas
    etapas++;
    if (lojaOrigem && lojaDestino) completas++;

    // Etapa 2: Produtos adicionados
    etapas++;
    if (itensTransferencia.length > 0) completas++;

    // Etapa 3: Pronto para transferir
    etapas++;
    if (lojaOrigem && lojaDestino && itensTransferencia.length > 0) completas++;

    return {
      total: etapas,
      completas,
      percentual: Math.round((completas / etapas) * 100),
    };
  }, [lojaOrigem, lojaDestino, itensTransferencia]);

  // Paginação de produtos disponíveis
  const produtosPaginados = useMemo(() => {
    const inicio = (paginaAtual - 1) * ITENS_POR_PAGINA;
    const fim = inicio + ITENS_POR_PAGINA;
    return produtosFiltrados.slice(inicio, fim);
  }, [produtosFiltrados, paginaAtual]);

  const totalPaginasProdutos = useMemo(() => {
    return Math.ceil(produtosFiltrados.length / ITENS_POR_PAGINA);
  }, [produtosFiltrados]);

  // Paginação de itens na lista de transferência
  const itensTransferenciaPaginados = useMemo(() => {
    const inicio = (paginaAtualLista - 1) * ITENS_POR_PAGINA_LISTA;
    const fim = inicio + ITENS_POR_PAGINA_LISTA;
    return itensTransferencia.slice(inicio, fim);
  }, [itensTransferencia, paginaAtualLista]);

  const totalPaginasLista = useMemo(() => {
    return Math.ceil(itensTransferencia.length / ITENS_POR_PAGINA_LISTA);
  }, [itensTransferencia]);

  // Paginação do histórico
  const historicoPaginado = useMemo(() => {
    const inicio = (paginaAtualHistorico - 1) * ITENS_POR_PAGINA_HISTORICO;
    const fim = inicio + ITENS_POR_PAGINA_HISTORICO;
    return historicoTransferencias.slice(inicio, fim);
  }, [historicoTransferencias, paginaAtualHistorico]);

  const totalPaginasHistorico = useMemo(() => {
    return Math.ceil(
      historicoTransferencias.length / ITENS_POR_PAGINA_HISTORICO
    );
  }, [historicoTransferencias]);

  // Adicionar item à lista
  const adicionarItem = () => {
    if (!podeAdicionar || !produtoAtual) return;

    // Verificar se já existe na lista
    const itemExistente = itensTransferencia.find(
      (i) => i.id_produto === produtoSelecionado
    );

    if (itemExistente) {
      // Atualizar quantidade do item existente
      setItensTransferencia((prev) =>
        prev.map((item) =>
          item.id_produto === produtoSelecionado
            ? { ...item, quantidade: item.quantidade + quantidade }
            : item
        )
      );
      toast.success("Quantidade atualizada");
    } else {
      // Adicionar novo item
      const novoItem: ItemTransferencia = {
        id_produto: produtoAtual.id,
        produto_descricao: produtoAtual.descricao,
        produto_marca: produtoAtual.marca,
        quantidade: quantidade,
        quantidade_disponivel: produtoAtual.quantidade_disponivel,
        preco_venda: produtoAtual.preco_venda,
      };
      setItensTransferencia((prev) => [...prev, novoItem]);
      toast.success("Produto adicionado à lista");
    }

    // Resetar seleção
    setProdutoSelecionado("");
    setQuantidade(1);
  };

  // Adicionar todo o estoque disponível do produto selecionado
  const adicionarTudo = () => {
    if (!produtoAtual || quantidadeDisponivel <= 0) return;

    const itemExistente = itensTransferencia.find(
      (i) => i.id_produto === produtoSelecionado
    );

    if (itemExistente) {
      setItensTransferencia((prev) =>
        prev.map((item) =>
          item.id_produto === produtoSelecionado
            ? { ...item, quantidade: item.quantidade + quantidadeDisponivel }
            : item
        )
      );
      toast.success(
        `Todo o estoque adicionado (${quantidadeDisponivel} unidades)`
      );
    } else {
      const novoItem: ItemTransferencia = {
        id_produto: produtoAtual.id,
        produto_descricao: produtoAtual.descricao,
        produto_marca: produtoAtual.marca,
        quantidade: quantidadeDisponivel,
        quantidade_disponivel: produtoAtual.quantidade_disponivel,
        preco_venda: produtoAtual.preco_venda,
      };
      setItensTransferencia((prev) => [...prev, novoItem]);
      toast.success(
        `Todo o estoque adicionado (${quantidadeDisponivel} unidades)`
      );
    }

    setProdutoSelecionado("");
    setQuantidade(1);
  };

  // Limpar toda a lista de transferência
  const limparLista = () => {
    setItensTransferencia([]);
    setProdutoSelecionado("");
    setQuantidade(1);
    setPaginaAtualLista(1);
    toast.info("Lista limpa");
  };

  // Remover item da lista
  const removerItem = (idProduto: string) => {
    setItensTransferencia((prev) =>
      prev.filter((item) => item.id_produto !== idProduto)
    );

    // Se remover o último item da página atual e não for a primeira página, voltar uma página
    if (itensTransferenciaPaginados.length === 1 && paginaAtualLista > 1) {
      setPaginaAtualLista(paginaAtualLista - 1);
    }

    toast.info("Produto removido da lista");
  };

  // Processar transferência (criar como pendente)
  const handleTransferir = async () => {
    // Validações finais
    if (!lojaOrigem || !lojaDestino) {
      toast.error("Selecione a loja de origem e destino");
      return;
    }

    if (lojaOrigem === lojaDestino) {
      toast.error("Loja de origem e destino não podem ser iguais");
      return;
    }

    if (itensTransferencia.length === 0) {
      toast.error("Adicione pelo menos um produto para transferir");
      return;
    }

    setLoading(true);

    try {
      const { supabase } = await import("@/lib/supabaseClient");

      // Verificar estoque disponível antes de criar a transferência
      for (const item of itensTransferencia) {
        const { data: estoqueOrigemData, error: errorOrigem } = await supabase
          .from("estoque_lojas")
          .select("quantidade")
          .eq("id_produto", item.id_produto)
          .eq("id_loja", parseInt(lojaOrigem))
          .single();

        if (errorOrigem || !estoqueOrigemData) {
          throw new Error(
            `Erro ao verificar estoque de ${item.produto_descricao}`
          );
        }

        // Validar se tem estoque suficiente
        if (estoqueOrigemData.quantidade < item.quantidade) {
          throw new Error(
            `Estoque insuficiente para ${item.produto_descricao}. ` +
              `Disponível: ${estoqueOrigemData.quantidade}, ` +
              `Solicitado: ${item.quantidade}`
          );
        }
      }

      // Criar transferência pendente
      const { data: transferencia, error: errorTransferencia } = await supabase
        .from("transferencias")
        .insert({
          loja_origem_id: parseInt(lojaOrigem),
          loja_destino_id: parseInt(lojaDestino),
          status: "pendente",
          observacao: observacao || null,
          usuario_id: userId,
        })
        .select()
        .single();

      if (errorTransferencia || !transferencia) {
        throw new Error("Erro ao criar transferência");
      }

      // Inserir itens da transferência
      const itensParaInserir = itensTransferencia.map((item) => ({
        transferencia_id: transferencia.id,
        produto_id: item.id_produto,
        quantidade: item.quantidade,
      }));

      const { error: errorItens } = await supabase
        .from("transferencias_itens")
        .insert(itensParaInserir);

      if (errorItens) {
        // Remover transferência se falhar ao inserir itens
        await supabase
          .from("transferencias")
          .delete()
          .eq("id", transferencia.id);
        throw new Error("Erro ao adicionar itens à transferência");
      }

      toast.success(
        `Transferência criada com sucesso! ` +
          `${itensTransferencia.length} produto(s) pendente(s) de confirmação.`
      );
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Erro ao processar transferência:", error);
      toast.error(error.message || "Erro ao processar transferência");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="5xl"
      scrollBehavior="outside"
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <ArrowRightIcon className="h-5 w-5 text-primary" />
            <span>Transferência de Produtos Entre Lojas</span>
          </div>
          <span className="text-sm font-normal text-default-500">
            Transfira produtos de uma loja para outra com segurança
          </span>

          {/* Barra de Progresso */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-default-600">
                Progresso da Transferência
              </span>
              <span className="text-xs font-bold text-primary">
                {progressoEtapas.completas} de {progressoEtapas.total} etapas
              </span>
            </div>
            <Progress
              value={progressoEtapas.percentual}
              color={progressoEtapas.percentual === 100 ? "success" : "primary"}
              size="sm"
              className="max-w-full"
            />
            <div className="flex items-center justify-between mt-1 text-xs text-default-400">
              <span>
                {progressoEtapas.percentual === 100
                  ? "✓ Pronto para transferir"
                  : progressoEtapas.percentual >= 66
                    ? "Adicione produtos à lista"
                    : progressoEtapas.percentual >= 33
                      ? "Selecione a loja de destino"
                      : "Selecione as lojas"}
              </span>
              <span>{progressoEtapas.percentual}%</span>
            </div>
          </div>
        </ModalHeader>

        <ModalBody className="gap-4">
          {/* SEÇÃO 1: Seleção de Lojas */}
          <Card className="bg-content2 shadow-md">
            <CardBody className="gap-4 p-6">
              <h3 className="text-base font-semibold text-default-700">
                1. Selecione as Lojas
              </h3>

              <div className="grid grid-cols-2 gap-4">
                {/* Loja Origem */}
                <div>
                  <Select
                    label="Loja de Origem"
                    placeholder="Selecione a loja origem"
                    selectedKeys={lojaOrigem ? [lojaOrigem] : []}
                    onSelectionChange={(keys) => {
                      const selected = Array.from(keys)[0] as string;
                      setLojaOrigem(selected);
                      // Resetar destino se for igual à origem
                      if (selected === lojaDestino) {
                        setLojaDestino("");
                      }
                      // Limpar lista de produtos
                      setItensTransferencia([]);
                      setProdutoSelecionado("");
                    }}
                    isRequired
                    classNames={{
                      trigger: "bg-content1",
                    }}
                  >
                    {lojas && lojas.length > 0 ? (
                      lojas.map((loja) => (
                        <SelectItem key={loja.id.toString()}>
                          {loja.nome}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem key="loading">Carregando...</SelectItem>
                    )}
                  </Select>
                </div>

                {/* Loja Destino */}
                <div>
                  <Select
                    label="Loja de Destino"
                    placeholder="Selecione a loja destino"
                    selectedKeys={lojaDestino ? [lojaDestino] : []}
                    onSelectionChange={(keys) => {
                      const selected = Array.from(keys)[0] as string;
                      setLojaDestino(selected);
                    }}
                    isRequired
                    isDisabled={!lojaOrigem}
                    classNames={{
                      trigger: "bg-content1",
                    }}
                  >
                    {lojasDestinoDisponiveis &&
                    lojasDestinoDisponiveis.length > 0 ? (
                      lojasDestinoDisponiveis.map((loja) => (
                        <SelectItem key={loja.id.toString()}>
                          {loja.nome}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem key="none">
                        Nenhuma loja disponível
                      </SelectItem>
                    )}
                  </Select>
                </div>
              </div>

              {/* Indicador visual de transferência */}
              {lojaOrigem && lojaDestino && (
                <div className="flex items-center justify-center gap-3 py-2">
                  <Chip color="primary" variant="flat" size="sm">
                    {lojas.find((l) => l.id === parseInt(lojaOrigem))?.nome}
                  </Chip>
                  <ArrowRightIcon className="h-5 w-5 text-success" />
                  <Chip color="success" variant="flat" size="sm">
                    {lojas.find((l) => l.id === parseInt(lojaDestino))?.nome}
                  </Chip>
                </div>
              )}
            </CardBody>
          </Card>

          {/* Resumo Financeiro e Estatísticas */}
          {itensTransferencia.length > 0 && (
            <Card className="bg-gradient-to-br from-primary/10 to-success/10 border-2 border-primary/20 shadow-lg">
              <CardBody className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <CurrencyDollarIcon className="h-6 w-6 text-primary" />
                  <h3 className="text-base font-bold text-default-800">
                    Resumo da Transferência
                  </h3>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  {/* Total de Produtos */}
                  <div className="bg-white/50 dark:bg-black/20 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-primary">
                      {estatisticasTransferencia.totalItens}
                    </div>
                    <div className="text-xs text-default-600 mt-1">
                      {estatisticasTransferencia.totalItens === 1
                        ? "Produto"
                        : "Produtos"}
                    </div>
                  </div>

                  {/* Total de Unidades */}
                  <div className="bg-white/50 dark:bg-black/20 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-secondary">
                      {estatisticasTransferencia.totalUnidades}
                    </div>
                    <div className="text-xs text-default-600 mt-1">
                      {estatisticasTransferencia.totalUnidades === 1
                        ? "Unidade"
                        : "Unidades"}
                    </div>
                  </div>

                  {/* Valor Total */}
                  <div className="bg-white/50 dark:bg-black/20 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-success">
                      R${" "}
                      {estatisticasTransferencia.valorTotal.toLocaleString(
                        "pt-BR",
                        {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }
                      )}
                    </div>
                    <div className="text-xs text-default-600 mt-1">
                      Valor Total
                    </div>
                  </div>
                </div>

                {/* Informação adicional */}
                <div className="mt-4 pt-4 border-t border-divider">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-default-600">
                      Valor médio por unidade:
                    </span>
                    <span className="font-semibold text-default-800">
                      R${" "}
                      {estatisticasTransferencia.totalUnidades > 0
                        ? (
                            estatisticasTransferencia.valorTotal /
                            estatisticasTransferencia.totalUnidades
                          ).toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })
                        : "0,00"}
                    </span>
                  </div>
                </div>
              </CardBody>
            </Card>
          )}

          {/* SEÇÃO 2: Adicionar Produtos */}
          {lojaOrigem && lojaDestino && (
            <Card className="bg-content2 shadow-md">
              <CardBody className="gap-4 p-6">
                <h3 className="text-base font-semibold text-default-700">
                  2. Adicione os Produtos para Transferir
                </h3>

                {/* Campo de Busca */}
                <Input
                  label="Buscar Produto"
                  placeholder="Ex: bat i 17, tela samsung, cabo usb..."
                  value={buscaProduto}
                  onValueChange={setBuscaProduto}
                  isClearable
                  onClear={() => setBuscaProduto("")}
                  classNames={{
                    inputWrapper: "bg-content1",
                  }}
                  description={
                    totalPaginasProdutos > 1
                      ? `${produtosFiltrados.length} produto(s) encontrado(s) - Página ${paginaAtual} de ${totalPaginasProdutos}`
                      : `${produtosFiltrados.length} de ${produtosDisponiveis.length} produto(s) encontrado(s)`
                  }
                />

                {/* Lista de Produtos */}
                {loadingProdutos ? (
                  <div className="text-center py-8">
                    <div className="text-default-400 mb-2">
                      Carregando produtos...
                    </div>
                    {progressoCarregamento > 0 && (
                      <div className="text-sm text-primary">
                        {progressoCarregamento} produtos carregados
                      </div>
                    )}
                  </div>
                ) : produtosFiltrados.length === 0 ? (
                  <div className="text-center py-8 text-default-400">
                    {buscaProduto
                      ? "Nenhum produto encontrado"
                      : "Nenhum produto disponível nesta loja"}
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
                      {produtosPaginados.map((produto) => {
                        const jaAdicionado = itensTransferencia.find(
                          (i) => i.id_produto === produto.id
                        );
                        const quantidadeDisponivel =
                          produto.quantidade_disponivel -
                          (jaAdicionado?.quantidade || 0);
                        const estaSelecionado =
                          produtoSelecionado === produto.id;

                        return (
                          <div
                            key={produto.id}
                            className={`
                            p-4 rounded-lg border-2 cursor-pointer transition-all
                            ${
                              estaSelecionado
                                ? "border-primary bg-primary/10"
                                : "border-divider bg-content1 hover:border-primary/50 hover:shadow-md"
                            }
                            ${quantidadeDisponivel <= 0 ? "opacity-50 cursor-not-allowed" : ""}
                          `}
                            onClick={() => {
                              if (quantidadeDisponivel > 0) {
                                setProdutoSelecionado(produto.id);
                                setQuantidade(1);
                              }
                            }}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 space-y-2">
                                {/* Nome do Produto */}
                                <div className="flex items-center gap-2">
                                  <p className="text-sm font-semibold text-default-900">
                                    {produto.descricao}
                                  </p>
                                  {estaSelecionado && (
                                    <CheckCircleIcon className="h-5 w-5 text-primary flex-shrink-0" />
                                  )}
                                </div>

                                {/* Informações Detalhadas */}
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                  {/* Marca */}
                                  {produto.marca && (
                                    <div className="flex items-center gap-1">
                                      <span className="text-default-500">
                                        Marca:
                                      </span>
                                      <span className="font-medium text-default-700">
                                        {produto.marca}
                                      </span>
                                    </div>
                                  )}

                                  {/* Modelos */}
                                  {produto.modelos && (
                                    <div className="flex items-center gap-1">
                                      <span className="text-default-500">
                                        Modelos:
                                      </span>
                                      <span className="font-medium text-default-700">
                                        {produto.modelos}
                                      </span>
                                    </div>
                                  )}

                                  {/* Preço */}
                                  {produto.preco_venda && (
                                    <div className="flex items-center gap-1">
                                      <span className="text-default-500">
                                        Preço:
                                      </span>
                                      <span className="font-medium text-success">
                                        R$ {produto.preco_venda.toFixed(2)}
                                      </span>
                                    </div>
                                  )}

                                  {/* ID (últimos 8 caracteres) */}
                                  <div className="flex items-center gap-1">
                                    <span className="text-default-500">
                                      ID:
                                    </span>
                                    <span className="font-mono text-xs text-default-600">
                                      ...{produto.id.slice(-8)}
                                    </span>
                                  </div>
                                </div>

                                {/* Chips de Status */}
                                <div className="flex items-center gap-2 flex-wrap">
                                  <Chip
                                    size="sm"
                                    variant="flat"
                                    color={
                                      quantidadeDisponivel > 10
                                        ? "success"
                                        : quantidadeDisponivel > 0
                                          ? "warning"
                                          : "danger"
                                    }
                                    startContent={
                                      <span className="text-xs">📦</span>
                                    }
                                  >
                                    Disponível: {quantidadeDisponivel}
                                  </Chip>

                                  {jaAdicionado && (
                                    <Chip
                                      size="sm"
                                      variant="flat"
                                      color="primary"
                                      startContent={
                                        <span className="text-xs">📋</span>
                                      }
                                    >
                                      Na lista: {jaAdicionado.quantidade}
                                    </Chip>
                                  )}

                                  {produto.quantidade_disponivel > 0 && (
                                    <Chip
                                      size="sm"
                                      variant="flat"
                                      color="default"
                                      startContent={
                                        <span className="text-xs">🏪</span>
                                      }
                                    >
                                      Estoque total:{" "}
                                      {produto.quantidade_disponivel}
                                    </Chip>
                                  )}
                                </div>

                                {/* Estoque por Loja */}
                                {produto.estoques_lojas &&
                                  produto.estoques_lojas.length > 0 && (
                                    <div className="pt-2 border-t border-divider">
                                      <div className="text-xs text-default-500 mb-1.5 font-medium">
                                        Estoque por Loja:
                                      </div>
                                      <div className="flex flex-wrap gap-1.5">
                                        {produto.estoques_lojas.map(
                                          (estoque) => (
                                            <div
                                              key={estoque.id_loja}
                                              className="flex items-center gap-1 bg-default-100 dark:bg-default-100/10 rounded-md px-2 py-1"
                                            >
                                              <span className="text-[10px] text-default-600 truncate max-w-[70px]">
                                                {estoque.loja_nome}
                                              </span>
                                              <Chip
                                                size="sm"
                                                variant="flat"
                                                color={
                                                  estoque.quantidade > 0
                                                    ? "primary"
                                                    : "danger"
                                                }
                                                className="h-4 min-w-[30px] text-[10px] px-1"
                                              >
                                                {estoque.quantidade}
                                              </Chip>
                                            </div>
                                          )
                                        )}
                                      </div>
                                    </div>
                                  )}

                                {/* Valor total se selecionado */}
                                {estaSelecionado &&
                                  produto.preco_venda &&
                                  quantidade > 0 && (
                                    <div className="pt-2 border-t border-divider">
                                      <div className="flex items-center justify-between text-sm">
                                        <span className="text-default-600">
                                          Valor da transferência:
                                        </span>
                                        <span className="font-bold text-success">
                                          R${" "}
                                          {(
                                            produto.preco_venda * quantidade
                                          ).toFixed(2)}
                                        </span>
                                      </div>
                                    </div>
                                  )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Paginação de Produtos */}
                    {totalPaginasProdutos > 1 && (
                      <div className="flex justify-center mt-4">
                        <Pagination
                          total={totalPaginasProdutos}
                          page={paginaAtual}
                          onChange={setPaginaAtual}
                          size="lg"
                          showControls
                          className="gap-2"
                          classNames={{
                            cursor: "bg-primary text-white",
                          }}
                        />
                      </div>
                    )}
                  </>
                )}

                {/* Input Quantidade + Botões de Ação */}
                {produtoSelecionado && quantidadeDisponivel > 0 && (
                  <div className="flex gap-3 items-end pt-2 border-t border-divider">
                    <Input
                      type="number"
                      label="Quantidade a Transferir"
                      placeholder="0"
                      value={quantidade.toString()}
                      onValueChange={(value) => {
                        const num = parseInt(value) || 0;
                        setQuantidade(num);
                      }}
                      min={1}
                      max={quantidadeDisponivel}
                      classNames={{
                        inputWrapper: "bg-content1",
                      }}
                    />

                    <Button
                      color="primary"
                      onPress={adicionarItem}
                      isDisabled={!podeAdicionar}
                      size="lg"
                    >
                      Adicionar à Lista
                    </Button>

                    <Button
                      color="secondary"
                      variant="flat"
                      onPress={adicionarTudo}
                      isDisabled={quantidadeDisponivel <= 0}
                      size="lg"
                      startContent={<BoltIcon className="h-5 w-5" />}
                    >
                      Adicionar Tudo
                    </Button>
                  </div>
                )}

                {/* Avisos de validação */}
                {produtoSelecionado && quantidadeDisponivel === 0 && (
                  <div className="flex items-center gap-2 text-warning text-sm">
                    <ExclamationTriangleIcon className="h-4 w-4" />
                    <span>Sem estoque disponível (já adicionado na lista)</span>
                  </div>
                )}

                {produtoSelecionado &&
                  quantidade > quantidadeDisponivel &&
                  quantidadeDisponivel > 0 && (
                    <div className="flex items-center gap-2 text-danger text-sm">
                      <ExclamationTriangleIcon className="h-4 w-4" />
                      <span>
                        Quantidade máxima disponível: {quantidadeDisponivel}
                      </span>
                    </div>
                  )}
              </CardBody>
            </Card>
          )}

          {/* SEÇÃO 3: Lista de Produtos a Transferir */}
          {itensTransferencia.length > 0 && (
            <Card className="bg-content2 shadow-md">
              <CardBody className="gap-3 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h3 className="text-base font-semibold text-default-700">
                      3. Produtos a Transferir
                    </h3>
                    <Chip color="primary" size="sm" variant="flat">
                      {itensTransferencia.length}{" "}
                      {itensTransferencia.length === 1 ? "item" : "itens"}
                    </Chip>
                    {totalPaginasLista > 1 && (
                      <Chip color="secondary" size="sm" variant="flat">
                        Página {paginaAtualLista} de {totalPaginasLista}
                      </Chip>
                    )}
                  </div>
                  <Button
                    color="danger"
                    variant="flat"
                    size="sm"
                    startContent={<TrashIcon className="h-4 w-4" />}
                    onPress={limparLista}
                  >
                    Limpar Lista
                  </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
                  {itensTransferenciaPaginados.map((item) => (
                    <div
                      key={item.id_produto}
                      className="flex flex-col p-4 bg-content1 rounded-lg border border-divider hover:border-primary/50 transition-all"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0 mr-3">
                          <p className="text-sm font-medium text-default-700 truncate">
                            {item.produto_descricao}
                          </p>
                          {item.produto_marca && (
                            <p className="text-xs text-default-400 truncate">
                              {item.produto_marca}
                            </p>
                          )}
                        </div>

                        <Button
                          color="danger"
                          variant="light"
                          size="sm"
                          isIconOnly
                          onPress={() => removerItem(item.id_produto)}
                          className="flex-shrink-0"
                        >
                          ✕
                        </Button>
                      </div>

                      <div className="flex items-center gap-2 mt-auto">
                        <Chip color="primary" variant="flat" size="sm">
                          Qtd: {item.quantidade}
                        </Chip>
                        {item.preco_venda && (
                          <Chip color="success" variant="flat" size="sm">
                            R${" "}
                            {(
                              item.preco_venda * item.quantidade
                            ).toLocaleString("pt-BR", {
                              minimumFractionDigits: 2,
                            })}
                          </Chip>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Paginação da Lista de Transferência */}
                {totalPaginasLista > 1 && (
                  <div className="flex justify-center mt-4 pt-4 border-t border-divider">
                    <Pagination
                      total={totalPaginasLista}
                      page={paginaAtualLista}
                      onChange={setPaginaAtualLista}
                      size="lg"
                      showControls
                      className="gap-2"
                      classNames={{
                        cursor: "bg-primary text-white",
                      }}
                    />
                  </div>
                )}
              </CardBody>
            </Card>
          )}

          {/* SEÇÃO 4: Observação */}
          {itensTransferencia.length > 0 && (
            <Card className="bg-content2 shadow-md">
              <CardBody className="p-6">
                <Textarea
                  label="Observação (Opcional)"
                  placeholder="Adicione uma observação sobre esta transferência..."
                  value={observacao}
                  onValueChange={setObservacao}
                  minRows={2}
                  maxRows={4}
                  classNames={{
                    inputWrapper: "bg-content1",
                  }}
                />
              </CardBody>
            </Card>
          )}

          {/* Histórico de Transferências */}
          {lojaOrigem && lojaDestino && (
            <Card className="bg-content2 shadow-md">
              <CardBody className="p-6">
                <Button
                  fullWidth
                  variant="flat"
                  color={mostrarHistorico ? "primary" : "default"}
                  size="lg"
                  startContent={<ClockIcon className="h-5 w-5" />}
                  endContent={
                    <div className="flex items-center gap-2">
                      {historicoTransferencias.length > 0 && (
                        <Chip size="sm" color="primary" variant="solid">
                          {historicoTransferencias.length}
                        </Chip>
                      )}
                      {mostrarHistorico ? (
                        <ChevronUpIcon className="h-5 w-5" />
                      ) : (
                        <ChevronDownIcon className="h-5 w-5" />
                      )}
                    </div>
                  }
                  onPress={() => {
                    setMostrarHistorico(!mostrarHistorico);
                    if (
                      !mostrarHistorico &&
                      historicoTransferencias.length === 0
                    ) {
                      carregarHistorico();
                    }
                  }}
                >
                  {mostrarHistorico ? "Ocultar" : "Ver"} Histórico de
                  Transferências Entre Estas Lojas
                </Button>

                {mostrarHistorico && (
                  <>
                    {loadingHistorico ? (
                      <div className="text-center py-8 text-default-400">
                        Carregando histórico...
                      </div>
                    ) : historicoTransferencias.length === 0 ? (
                      <div className="text-center py-8 text-default-400">
                        Nenhuma transferência encontrada entre estas lojas
                      </div>
                    ) : (
                      <>
                        <div className="mt-4">
                          <div className="flex items-center justify-between mb-3">
                            <p className="text-sm font-medium text-default-600">
                              Últimas Transferências
                            </p>
                            <Chip size="sm" variant="flat" color="primary">
                              {historicoTransferencias.length} registro(s)
                            </Chip>
                          </div>

                          <div className="space-y-2">
                            {historicoPaginado.map((item) => (
                              <div
                                key={item.id}
                                className="p-4 bg-content1 rounded-lg border border-divider"
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <p className="text-sm font-semibold text-default-800">
                                        {item.produto?.descricao || "Produto"}
                                      </p>
                                      {item.produto?.marca && (
                                        <Chip
                                          size="sm"
                                          variant="flat"
                                          color="default"
                                        >
                                          {item.produto.marca}
                                        </Chip>
                                      )}
                                    </div>

                                    <div className="flex items-center gap-3 flex-wrap text-xs text-default-500">
                                      <span className="flex items-center gap-1">
                                        <ClockIcon className="h-4 w-4" />
                                        {new Date(
                                          item.criado_em
                                        ).toLocaleDateString("pt-BR", {
                                          day: "2-digit",
                                          month: "2-digit",
                                          year: "numeric",
                                          hour: "2-digit",
                                          minute: "2-digit",
                                        })}
                                      </span>
                                    </div>

                                    {item.observacao && (
                                      <p className="text-xs text-default-400 mt-2 italic">
                                        {item.observacao}
                                      </p>
                                    )}
                                  </div>

                                  <Chip
                                    color="primary"
                                    variant="flat"
                                    size="md"
                                  >
                                    {item.quantidade_alterada}{" "}
                                    {item.quantidade_alterada === 1
                                      ? "unidade"
                                      : "unidades"}
                                  </Chip>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Paginação do Histórico */}
                        {totalPaginasHistorico > 1 && (
                          <div className="flex justify-center mt-4 pt-4 border-t border-divider">
                            <Pagination
                              total={totalPaginasHistorico}
                              page={paginaAtualHistorico}
                              onChange={setPaginaAtualHistorico}
                              size="lg"
                              showControls
                              className="gap-2"
                              classNames={{
                                cursor: "bg-primary text-white",
                              }}
                            />
                          </div>
                        )}

                        {/* Contador de registros */}
                        <div className="mt-3 text-center text-xs text-default-400">
                          Mostrando {historicoPaginado.length} de{" "}
                          {historicoTransferencias.length} transferência(s)
                        </div>
                      </>
                    )}
                  </>
                )}
              </CardBody>
            </Card>
          )}

          {/* Avisos finais */}
          {itensTransferencia.length > 0 && (
            <Card className="bg-warning/10 border-2 border-warning/30 shadow-md">
              <CardBody className="gap-2 p-6">
                <div className="flex items-start gap-3">
                  <ExclamationTriangleIcon className="h-6 w-6 text-warning flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-warning-700 dark:text-warning">
                    <p className="font-semibold mb-2 text-base">
                      ⚠️ Sistema de Confirmação:
                    </p>
                    <ul className="list-disc list-inside space-y-1.5">
                      <li>
                        A transferência será criada com status{" "}
                        <strong>PENDENTE</strong>
                      </li>
                      <li>
                        O estoque só será movimentado após a{" "}
                        <strong>CONFIRMAÇÃO</strong>
                      </li>
                      <li>Validamos a disponibilidade antes de criar</li>
                      <li>
                        Você poderá confirmar ou cancelar na tela de gestão de
                        transferências
                      </li>
                      <li>O histórico será registrado após a confirmação</li>
                    </ul>
                  </div>
                </div>
              </CardBody>
            </Card>
          )}
        </ModalBody>

        <ModalFooter className="gap-2">
          <div className="flex items-center gap-2 flex-1">
            {/* Botões de Impressão */}
            {itensTransferencia.length > 0 && lojaOrigem && lojaDestino && (
              <>
                <Button
                  variant="flat"
                  color="secondary"
                  size="lg"
                  startContent={<PrinterIcon className="h-5 w-5" />}
                  onPress={() => {
                    const transferenciaTemp = {
                      id: "preview",
                      loja_origem_nome: lojas.find(
                        (l) => l.id === parseInt(lojaOrigem)
                      )?.nome,
                      loja_destino_nome: lojas.find(
                        (l) => l.id === parseInt(lojaDestino)
                      )?.nome,
                      status: "pendente" as const,
                      criado_em: new Date().toISOString(),
                      usuario_nome: "Pré-visualização",
                      observacao: observacao || undefined,
                      itens: itensTransferencia.map((item) => ({
                        produto_descricao: item.produto_descricao,
                        produto_marca: item.produto_marca,
                        quantidade: item.quantidade,
                      })),
                    };
                    gerarRelatorioTransferenciaDetalhado(transferenciaTemp);
                  }}
                >
                  Detalhado
                </Button>
                <Button
                  variant="flat"
                  color="secondary"
                  size="lg"
                  startContent={<DocumentTextIcon className="h-5 w-5" />}
                  onPress={() => {
                    const transferenciaTemp = {
                      id: "preview",
                      loja_origem_nome: lojas.find(
                        (l) => l.id === parseInt(lojaOrigem)
                      )?.nome,
                      loja_destino_nome: lojas.find(
                        (l) => l.id === parseInt(lojaDestino)
                      )?.nome,
                      status: "pendente" as const,
                      criado_em: new Date().toISOString(),
                      usuario_nome: "Pré-visualização",
                      observacao: observacao || undefined,
                      itens: itensTransferencia.map((item) => ({
                        produto_descricao: item.produto_descricao,
                        produto_marca: item.produto_marca,
                        quantidade: item.quantidade,
                      })),
                    };
                    gerarRelatorioTransferenciaResumido(transferenciaTemp);
                  }}
                >
                  Resumido
                </Button>
              </>
            )}
          </div>

          <Button
            variant="light"
            onPress={onClose}
            isDisabled={loading}
            size="lg"
          >
            Cancelar
          </Button>
          <Button
            color="primary"
            onPress={handleTransferir}
            isLoading={loading}
            size="lg"
            isDisabled={
              !lojaOrigem ||
              !lojaDestino ||
              itensTransferencia.length === 0 ||
              loading
            }
            startContent={!loading && <CheckCircleIcon className="h-5 w-5" />}
          >
            {loading ? "Criando..." : "Criar Transferência Pendente"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
