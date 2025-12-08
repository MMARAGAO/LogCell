"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Input,
  Select,
  SelectItem,
  Spinner,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@heroui/react";
import {
  ShoppingCart,
  Plus,
  TrendingUp,
  DollarSign,
  Package,
  Users,
  Calendar,
  Search,
  Eye,
  Check,
  Edit,
  X,
  Trash2,
  MoreVertical,
  Grid,
  List,
  Wallet,
  Printer,
} from "lucide-react";
import { NovaVendaModal } from "@/components/vendas/NovaVendaModal";
import { AdicionarPagamentoModal } from "@/components/vendas/AdicionarPagamentoModal";
import { EditarPagamentoVendaModal } from "@/components/vendas/EditarPagamentoVendaModal";
import { DetalhesVendaModal } from "@/components/vendas/DetalhesVendaModal";
import { ConfirmModal } from "@/components/ConfirmModal";
import { InputModal } from "@/components/InputModal";
import { useToast } from "@/components/Toast";
import { VendasService } from "@/services/vendasService";
import { DevolucoesService } from "@/services/devolucoesService";
import { supabase } from "@/lib/supabaseClient";
import { buscarTodosClientesAtivos } from "@/lib/clienteHelpers";
import { useAuth } from "@/contexts/AuthContext";
import { usePermissoes } from "@/hooks/usePermissoes";
import { useLojaFilter } from "@/hooks/useLojaFilter";
import { useRealtime } from "@/hooks/useRealtime";
import { imprimirNotaVenda } from "@/lib/imprimirNotaVenda";
import type {
  VendaCompleta,
  ItemCarrinho,
  PagamentoCarrinho,
} from "@/types/vendas";

interface Estatisticas {
  totalVendas: number;
  vendasHoje: number;
  faturamentoTotal: number;
  faturamentoHoje: number;
  ticketMedio: number;
  produtosVendidos: number;
  creditosAtivos: number;
  totalCreditos: number;
}

interface Cliente {
  id: string;
  nome: string;
  cpf?: string | null;
}

interface Loja {
  id: number;
  nome: string;
}

interface Produto {
  id: string;
  nome: string;
  codigo: string;
  preco_venda: number;
  estoque_disponivel: number;
  categoria?: string;
}

export default function VendasPage() {
  const { usuario } = useAuth();
  const {
    temPermissao,
    loading: loadingPermissoes,
    getDescontoMaximo,
    validarDesconto,
  } = usePermissoes();
  const { aplicarFiltroLoja, podeVerTodasLojas, lojaId } = useLojaFilter();
  const toast = useToast();
  const searchParams = useSearchParams();
  const buscaParam = searchParams.get("busca");

  // Estados principais
  const [vendas, setVendas] = useState<VendaCompleta[]>([]);
  const [estatisticas, setEstatisticas] = useState<Estatisticas>({
    totalVendas: 0,
    vendasHoje: 0,
    faturamentoTotal: 0,
    faturamentoHoje: 0,
    ticketMedio: 0,
    produtosVendidos: 0,
    creditosAtivos: 0,
    totalCreditos: 0,
  });

  // Estados de dados
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [lojas, setLojas] = useState<Loja[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);

  // Estados de UI
  const [modalNovaVendaOpen, setModalNovaVendaOpen] = useState(false);
  const [modalPagamentoOpen, setModalPagamentoOpen] = useState(false);
  const [modalEditarPagamentoOpen, setModalEditarPagamentoOpen] =
    useState(false);
  const [modalDetalhesOpen, setModalDetalhesOpen] = useState(false);
  const [modalCancelarOpen, setModalCancelarOpen] = useState(false);
  const [modalExcluirOpen, setModalExcluirOpen] = useState(false);
  const [modalMotivoOpen, setModalMotivoOpen] = useState(false);
  const [motivoCancelamento, setMotivoCancelamento] = useState("");
  const [vendaSelecionada, setVendaSelecionada] =
    useState<VendaCompleta | null>(null);
  const [vendaParaEditar, setVendaParaEditar] = useState<VendaCompleta | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [filtroStatus, setFiltroStatus] = useState<string>("todas");
  const [filtroLoja, setFiltroLoja] = useState<string>("todas");
  const [busca, setBusca] = useState("");
  const [processando, setProcessando] = useState(false);
  const [visualizacao, setVisualizacao] = useState<"cards" | "tabela">("cards");

  // Preencher busca vinda da URL
  useEffect(() => {
    if (buscaParam) {
      setBusca(buscaParam);
    }
  }, [buscaParam]);

  const formatarMoeda = (valor: number) => {
    return valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const formatarData = (data: string) => {
    // PostgreSQL now() retorna UTC mas timestamp without timezone não indica isso
    // Supabase retorna como '2025-11-14T20:28:04' (que é UTC)
    // Adiciona 'Z' para indicar que é UTC e deixar o JavaScript converter para local
    const dataUTC = data.endsWith("Z") ? data : data + "Z";
    const dataLocal = new Date(dataUTC);

    return dataLocal.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Carrega dados iniciais - AGUARDAR permissões serem carregadas
  useEffect(() => {
    console.log("🔄 [VENDAS useEffect] Executando com:", {
      loadingPermissoes,
      lojaId,
      podeVerTodasLojas,
    });

    // Só carregar quando as permissões já tiverem sido carregadas
    if (!loadingPermissoes) {
      console.log(
        "✅ [VENDAS] Permissões carregadas, iniciando carregamento de dados"
      );
      carregarDados();
    } else {
      console.log("⏳ [VENDAS] Aguardando permissões serem carregadas...");
    }
  }, [loadingPermissoes, lojaId, podeVerTodasLojas]); // Recarregar se mudar a loja

  // 🔔 Realtime: atualizar vendas quando houver mudanças
  useRealtime({
    table: "vendas",
    filter: lojaId && !podeVerTodasLojas ? `loja_id=eq.${lojaId}` : undefined,
    enabled: !loadingPermissoes, // Só ativar após permissões carregarem
    onEvent: (payload) => {
      console.log("🔔 [REALTIME VENDAS] Evento:", payload.eventType, payload);

      if (payload.eventType === "INSERT") {
        toast.success("Nova venda registrada!", {
          description: "A lista de vendas foi atualizada.",
        });
      } else if (payload.eventType === "UPDATE") {
        toast.info("Venda atualizada", {
          description: "Uma venda foi modificada.",
        });
      } else if (payload.eventType === "DELETE") {
        toast.warning("Venda removida", {
          description: "Uma venda foi excluída.",
        });
      }

      // Recarregar vendas para refletir as mudanças
      carregarVendas();
    },
    onSubscribed: () => {
      console.log("✅ [REALTIME VENDAS] Conectado ao Realtime de vendas");
    },
    onError: (error) => {
      console.warn("⚠️ [REALTIME VENDAS] Erro:", error);
    },
  });

  const carregarDados = async () => {
    setLoading(true);
    try {
      await Promise.all([
        carregarVendas(),
        carregarClientes(),
        carregarLojas(),
        carregarProdutos(),
        carregarCreditos(),
      ]);
    } finally {
      setLoading(false);
    }
  };

  const carregarVendas = async () => {
    console.log("📥 Carregando vendas do banco...");
    console.log("🔍 [VENDAS] Debug filtros:", {
      lojaId,
      podeVerTodasLojas,
      "lojaId !== null": lojaId !== null,
      "!podeVerTodasLojas": !podeVerTodasLojas,
    });

    // Aplicar filtro de loja se usuário não tiver acesso a todas
    const filtros: any = {};
    if (lojaId !== null && !podeVerTodasLojas) {
      filtros.loja_id = lojaId;
      console.log(`🏪 Filtrando vendas da loja ${lojaId}`);
    } else {
      console.log("⚠️ NENHUM FILTRO DE LOJA APLICADO!");
    }

    console.log("📤 Filtros que serão enviados:", filtros);
    const dados = await VendasService.listarVendas(filtros);
    console.log("📦 Vendas carregadas:", dados.length, "vendas");

    // Log das lojas das vendas carregadas
    const lojasNasVendas = Array.from(
      new Set(dados.map((v) => `${v.loja?.nome} (ID: ${v.loja_id})`))
    );
    console.log("🏪 Lojas presentes nas vendas:", lojasNasVendas);

    // Log detalhado de TODAS as vendas
    dados.forEach((venda) => {
      const numero = `V${String(venda.numero_venda).padStart(6, "0")}`;
      console.log(
        `📋 ${numero}: status="${venda.status}", cliente=${venda.cliente?.nome}`
      );
    });

    console.log("🔍 Primeira venda:", dados[0]);
    setVendas(dados);
    calcularEstatisticas(dados);
  };

  const calcularEstatisticas = (vendas: VendaCompleta[]) => {
    const hoje = new Date().toISOString().split("T")[0];

    // Total de vendas concluídas
    const vendasConcluidas = vendas.filter((v) => v.status === "concluida");
    const vendasHoje = vendasConcluidas.filter((v) =>
      v.criado_em?.startsWith(hoje)
    );

    // Faturamento = soma dos valores PAGOS excluindo crédito do cliente (não valor_total)
    const faturamentoTotal = vendas.reduce((sum, v) => {
      // Filtrar pagamentos que não sejam crédito do cliente
      const pagamentosReais =
        v.pagamentos?.filter(
          (p: any) => p.tipo_pagamento !== "credito_cliente"
        ) || [];

      const totalPagamentosReais = pagamentosReais.reduce(
        (s: number, p: any) => s + (p.valor || 0),
        0
      );

      return sum + totalPagamentosReais;
    }, 0);

    // Faturamento hoje = soma dos pagamentos feitos hoje (exceto crédito)
    const faturamentoHoje = vendas.reduce((sum, v) => {
      // Verificar se tem pagamentos de hoje que não sejam crédito
      const pagamentosHoje =
        v.pagamentos?.filter(
          (p: any) =>
            p.criado_em?.startsWith(hoje) &&
            p.tipo_pagamento !== "credito_cliente"
        ) || [];

      const totalPagamentosHoje = pagamentosHoje.reduce(
        (s: number, p: any) => s + (p.valor || 0),
        0
      );

      return sum + totalPagamentosHoje;
    }, 0);

    const produtosVendidos = vendasConcluidas.reduce((sum, v) => {
      return (
        sum + (v.itens?.reduce((s: number, i: any) => s + i.quantidade, 0) || 0)
      );
    }, 0);

    setEstatisticas({
      totalVendas: vendasConcluidas.length,
      vendasHoje: vendasHoje.length,
      faturamentoTotal,
      faturamentoHoje,
      ticketMedio:
        vendasConcluidas.length > 0
          ? faturamentoTotal / vendasConcluidas.length
          : 0,
      produtosVendidos,
      creditosAtivos: 0,
      totalCreditos: 0,
    });
  };

  const carregarCreditos = async () => {
    try {
      const { data, error } = await supabase
        .from("creditos_cliente")
        .select("*")
        .gt("saldo", 0);

      if (error) throw error;

      const creditosComSaldo = data || [];
      const totalCreditos = creditosComSaldo.reduce(
        (sum, c) => sum + Number(c.saldo),
        0
      );

      setEstatisticas((prev) => ({
        ...prev,
        creditosAtivos: creditosComSaldo.length,
        totalCreditos,
      }));
    } catch (error) {
      console.error("Erro ao carregar créditos:", error);
    }
  };

  const carregarClientes = async () => {
    try {
      const todosClientes = await buscarTodosClientesAtivos();
      setClientes(todosClientes);
    } catch (error) {
      console.error("Erro ao carregar clientes:", error);
    }
  };

  const carregarLojas = async () => {
    try {
      const { data, error } = await supabase
        .from("lojas")
        .select("id, nome")
        .order("nome");

      if (error) throw error;
      setLojas(data || []);
    } catch (error) {
      console.error("Erro ao carregar lojas:", error);
    }
  };

  const carregarProdutos = async () => {
    try {
      // Buscar todos os produtos com paginação
      let allData: any[] = [];
      let page = 0;
      const pageSize = 1000;
      let hasMore = true;

      while (hasMore) {
        const { data, error } = await supabase
          .from("produtos")
          .select(
            `
            id,
            descricao,
            codigo_fabricante,
            preco_venda,
            categoria
          `
          )
          .eq("ativo", true)
          .range(page * pageSize, (page + 1) * pageSize - 1);

        if (error) throw error;

        allData = [...allData, ...(data || [])];
        page++;
        hasMore = (data?.length || 0) === pageSize;
      }

      // Mapeia para o formato esperado pela interface Produto
      const produtosFormatados = allData.map((p: any) => ({
        id: p.id,
        nome: p.descricao,
        codigo: p.codigo_fabricante,
        preco_venda: p.preco_venda,
        categoria: p.categoria,
        estoque_disponivel: 0, // Será carregado quando a loja for selecionada
      }));

      setProdutos(produtosFormatados);
    } catch (error) {
      console.error("Erro ao carregar produtos:", error);
    }
  };

  // Busca estoque do produto para uma loja específica
  const buscarEstoqueProduto = async (produtoId: string, lojaId: number) => {
    try {
      const { data, error } = await supabase
        .from("estoque_lojas")
        .select("quantidade")
        .eq("id_produto", produtoId)
        .eq("id_loja", lojaId)
        .single();

      if (error) return 0;
      return data?.quantidade || 0;
    } catch (error) {
      return 0;
    }
  };

  // Enriquece produtos com estoque da loja selecionada
  const getProdutosComEstoque = async (lojaId: number | null) => {
    if (!lojaId) return [];

    const produtosComEstoque = await Promise.all(
      produtos.map(async (p: any) => {
        const estoque = await buscarEstoqueProduto(p.id, lojaId);
        return {
          id: p.id,
          nome: p.descricao,
          codigo: p.codigo_fabricante,
          preco_venda: p.preco_venda,
          categoria: p.categoria,
          estoque_disponivel: estoque,
        };
      })
    );

    return produtosComEstoque;
  };

  const handleEditarVenda = async (venda: VendaCompleta) => {
    // Verificar permissão básica de editar
    if (!temPermissao("vendas.editar")) {
      toast.error("Você não tem permissão para editar vendas");
      return;
    }

    // Verificar permissão especial para editar vendas pagas
    if (
      venda.status === "concluida" &&
      venda.saldo_devedor === 0 &&
      !temPermissao("vendas.editar_pagas")
    ) {
      toast.error("Você não tem permissão para editar vendas totalmente pagas");
      return;
    }

    try {
      // Buscar dados completos da venda incluindo itens e pagamentos
      const { data: vendaCompleta, error } = await supabase
        .from("vendas")
        .select(
          `
          *,
          cliente:clientes(id, nome, cpf),
          loja:lojas(id, nome),
          vendedor:usuarios!vendas_vendedor_id_fkey(id, nome),
          itens:itens_venda(
            id,
            produto_id,
            produto_nome,
            produto_codigo,
            quantidade,
            preco_unitario,
            subtotal,
            desconto_tipo,
            desconto_valor,
            devolvido
          ),
          pagamentos:pagamentos_venda(
            id,
            tipo_pagamento,
            valor,
            data_pagamento,
            criado_em
          ),
          descontos:descontos_venda(
            id,
            tipo,
            valor,
            motivo
          )
        `
        )
        .eq("id", venda.id)
        .single();

      if (error) throw error;

      setVendaParaEditar(vendaCompleta as VendaCompleta);
      setModalNovaVendaOpen(true);
    } catch (error: any) {
      console.error("Erro ao buscar venda para edição:", error);
      toast.error("Erro ao carregar dados da venda");
    }
  };

  const handleCriarVenda = async (
    dados: {
      cliente_id: string;
      loja_id: number;
      tipo: "normal" | "fiada";
      data_prevista_pagamento?: string;
      itens: ItemCarrinho[];
      pagamentos: PagamentoCarrinho[];
      desconto: {
        tipo: "valor" | "percentual";
        valor: number;
        motivo: string;
      } | null;
    },
    vendaId?: string
  ) => {
    console.log("🎯 handleCriarVenda chamado:", {
      vendaId,
      modo: vendaId ? "EDIÇÃO" : "CRIAÇÃO",
      qtd_itens: dados.itens.length,
    });

    try {
      // Se vendaId foi fornecido, é uma edição
      if (vendaId) {
        console.log("✏️ Modo EDIÇÃO ativado, chamando editarVendaSeguro...");

        const resultado = await VendasService.editarVendaSeguro(
          vendaId,
          {
            tipo: dados.tipo,
            data_prevista_pagamento: dados.data_prevista_pagamento,
            itens: dados.itens.map((item) => ({
              produto_id: item.produto_id,
              produto_nome: item.produto_nome,
              produto_codigo: item.produto_codigo || "",
              quantidade: item.quantidade,
              preco_unitario: item.preco_unitario,
              subtotal: item.subtotal,
              desconto_tipo: item.desconto?.tipo,
              desconto_valor: item.desconto?.valor,
              valor_desconto: item.desconto?.valor
                ? item.desconto.tipo === "valor"
                  ? item.desconto.valor
                  : (item.subtotal * item.desconto.valor) / 100
                : undefined,
            })),
            pagamentos: dados.pagamentos.map((pag) => ({
              tipo_pagamento: pag.tipo_pagamento,
              valor: pag.valor,
              data_pagamento: pag.data_pagamento,
            })),
            desconto: dados.desconto
              ? {
                  tipo: dados.desconto.tipo,
                  valor: dados.desconto.valor,
                  motivo: dados.desconto.motivo,
                }
              : null,
          },
          usuario?.id || ""
        );

        if (!resultado.success) {
          throw new Error(resultado.error);
        }

        console.log("✅ Venda editada com sucesso, recarregando lista...");
        toast.success("Venda atualizada com sucesso!");
        await carregarVendas();
        console.log("📋 Lista de vendas recarregada!");
        setVendaSelecionada(null);
        return;
      }

      // Senão, é uma nova venda
      // Criar venda
      const resultadoVenda = await VendasService.criarVenda({
        cliente_id: dados.cliente_id,
        loja_id: dados.loja_id,
        vendedor_id: usuario?.id || "",
        tipo: dados.tipo,
        data_prevista_pagamento: dados.data_prevista_pagamento,
      });

      if (!resultadoVenda.success || !resultadoVenda.venda) {
        throw new Error(resultadoVenda.error);
      }

      const novaVendaId = resultadoVenda.venda.id;

      // Adicionar itens
      for (const item of dados.itens) {
        console.log("Item do carrinho:", item);

        const itemParaAdicionar = {
          produto_id: item.produto_id,
          produto_nome: item.produto_nome || "",
          produto_codigo: item.produto_codigo || "",
          quantidade: item.quantidade,
          preco_unitario: item.preco_unitario,
          subtotal: item.subtotal,
          devolvido: 0,
          desconto_tipo: item.desconto?.tipo,
          desconto_valor: item.desconto?.valor,
        };

        console.log("Item para adicionar:", itemParaAdicionar);

        const resultado = await VendasService.adicionarItem(
          novaVendaId,
          itemParaAdicionar
        );

        if (!resultado.success) {
          console.error("Erro ao adicionar item:", resultado.error);
          throw new Error(resultado.error);
        }
      }

      // Adicionar pagamentos
      for (const pag of dados.pagamentos) {
        await VendasService.adicionarPagamento(novaVendaId, {
          tipo_pagamento: pag.tipo_pagamento as any,
          valor: pag.valor,
          data_pagamento: pag.data_pagamento,
          criado_por: usuario?.id,
        });
      }

      // Aplicar desconto
      if (dados.desconto) {
        await VendasService.aplicarDesconto(novaVendaId, {
          tipo: dados.desconto.tipo,
          valor: dados.desconto.valor,
          motivo: dados.desconto.motivo,
          aplicado_por: usuario?.id || "",
        });
      }

      // NÃO finalizar automaticamente - deixar em andamento
      // O estoque já foi baixado pela trigger ao adicionar itens

      toast.success("Venda criada com sucesso!");
      carregarVendas();
    } catch (error: any) {
      console.error("Erro ao criar venda:", error);
      toast.error(`Erro ao criar venda: ${error.message}`);
    }
  };

  const handleFinalizarVenda = async (vendaId: string) => {
    try {
      const resultado = await VendasService.finalizarVenda(
        vendaId,
        usuario?.id || ""
      );

      if (!resultado.success) {
        throw new Error(resultado.error);
      }

      toast.success("Venda finalizada com sucesso!");
      carregarVendas();
    } catch (error: any) {
      console.error("Erro ao finalizar venda:", error);
      toast.error(`Erro ao finalizar venda: ${error.message}`);
    }
  };

  const handleAbrirModalPagamento = (venda: VendaCompleta) => {
    if (!temPermissao("vendas.processar_pagamentos")) {
      toast.error("Você não tem permissão para processar pagamentos");
      return;
    }

    setVendaSelecionada(venda);
    setModalPagamentoOpen(true);
  };

  const handleAbrirModalEditarPagamento = (venda: VendaCompleta) => {
    if (!temPermissao("vendas.processar_pagamentos")) {
      toast.error("Você não tem permissão para editar pagamentos");
      return;
    }

    setVendaSelecionada(venda);
    setModalEditarPagamentoOpen(true);
  };

  const handleAbrirDetalhes = async (venda: VendaCompleta) => {
    // Buscar dados completos da venda
    const vendaCompleta = await VendasService.buscarVendaCompleta(venda.id);
    setVendaSelecionada(vendaCompleta || venda);
    setModalDetalhesOpen(true);
  };

  const handlePagamentoAdicionado = async () => {
    await carregarVendas();
    if (vendaSelecionada) {
      // Atualiza a venda selecionada com dados frescos
      const vendaAtualizada = await VendasService.buscarVendaCompleta(
        vendaSelecionada.id
      );
      if (vendaAtualizada) {
        setVendaSelecionada(vendaAtualizada);
      }
    }
  };

  const handleCancelarVenda = (venda: VendaCompleta) => {
    console.log("🔴 handleCancelarVenda chamado:", {
      id: venda.id,
      numero_venda: venda.numero_venda,
      cliente: venda.cliente?.nome,
      status: venda.status,
      total: venda.valor_total,
    });

    if (!temPermissao("vendas.cancelar")) {
      toast.error("Você não tem permissão para cancelar vendas");
      return;
    }

    console.log("✅ Permissão OK, abrindo modal de motivo");
    setVendaSelecionada(venda);
    setModalMotivoOpen(true);
  };

  const confirmarCancelamento = async (motivo: string) => {
    if (!vendaSelecionada) return;

    setMotivoCancelamento(motivo);
    setModalMotivoOpen(false);
    setModalCancelarOpen(true);
  };

  const executarCancelamento = async () => {
    if (!vendaSelecionada) return;

    setProcessando(true);
    setModalCancelarOpen(false);

    try {
      const resultado = await VendasService.cancelarVenda(
        vendaSelecionada.id,
        usuario?.id || "",
        motivoCancelamento
      );

      if (!resultado.success) {
        throw new Error(resultado.error);
      }

      toast.success("Venda cancelada com sucesso!");
      console.log("🔄 Recarregando vendas após cancelamento...");
      await carregarVendas();
      console.log("✅ Vendas recarregadas. Total:", vendas.length);
    } catch (error: any) {
      console.error("Erro ao cancelar venda:", error);
      toast.error(`Erro ao cancelar venda: ${error.message}`);
    } finally {
      setProcessando(false);
      setVendaSelecionada(null);
      setMotivoCancelamento("");
    }
  };

  const handleExcluirVenda = (venda: VendaCompleta) => {
    if (!temPermissao("vendas.cancelar")) {
      toast.error("Você não tem permissão para excluir vendas");
      return;
    }

    setVendaSelecionada(venda);
    setModalExcluirOpen(true);
  };

  const executarExclusao = async () => {
    if (!vendaSelecionada) return;

    setProcessando(true);
    setModalExcluirOpen(false);

    try {
      const resultado = await VendasService.excluirVenda(
        vendaSelecionada.id,
        usuario?.id || ""
      );

      if (!resultado.success) {
        throw new Error(resultado.error);
      }

      toast.success("Venda excluída com sucesso!");
      await carregarVendas();
    } catch (error: any) {
      console.error("Erro ao excluir venda:", error);
      toast.error(error.message || "Erro ao excluir venda");
    } finally {
      setProcessando(false);
      setVendaSelecionada(null);
    }
  };

  // Função para gerar itens do menu baseado nas permissões
  const getMenuItems = (venda: VendaCompleta) => {
    const items: {
      key: string;
      label: string;
      icon: React.ReactNode;
      onClick: () => void;
      color?: "default" | "warning" | "danger";
    }[] = [];

    // Adicionar Pagamento
    if (
      venda.saldo_devedor > 0 &&
      venda.status !== "cancelada" &&
      temPermissao("vendas.processar_pagamentos")
    ) {
      items.push({
        key: "pagamento",
        label: "Adicionar Pagamento",
        icon: <DollarSign className="w-4 h-4" />,
        onClick: () => handleAbrirModalPagamento(venda),
      });
    }

    // Editar Pagamentos
    if (
      venda.status !== "cancelada" &&
      temPermissao("vendas.processar_pagamentos")
    ) {
      items.push({
        key: "editar_pagamento",
        label: "Editar Pagamentos",
        icon: <Wallet className="w-4 h-4" />,
        onClick: () => handleAbrirModalEditarPagamento(venda),
      });
    }

    // Visualizar
    items.push({
      key: "visualizar",
      label: "Ver Detalhes",
      icon: <Eye className="w-4 h-4" />,
      onClick: () => handleAbrirDetalhes(venda),
    });

    // Imprimir Nota
    if (venda.status === "concluida") {
      items.push({
        key: "imprimir",
        label: "Imprimir Nota",
        icon: <Printer className="w-4 h-4" />,
        onClick: () => imprimirNotaVenda(venda),
      });
    }

    // Editar
    if (venda.status !== "cancelada") {
      // Verificar se é venda totalmente paga
      const vendaTotalmentePaga =
        venda.status === "concluida" && venda.saldo_devedor === 0;

      if (vendaTotalmentePaga) {
        // Precisa de permissão especial para editar vendas pagas
        if (temPermissao("vendas.editar_pagas")) {
          items.push({
            key: "editar",
            label: "Editar",
            icon: <Edit className="w-4 h-4" />,
            onClick: () => handleEditarVenda(venda),
          });
        }
      } else {
        // Vendas não pagas ou parcialmente pagas: apenas editar normal
        if (temPermissao("vendas.editar")) {
          items.push({
            key: "editar",
            label: "Editar",
            icon: <Edit className="w-4 h-4" />,
            onClick: () => handleEditarVenda(venda),
          });
        }
      }
    }

    // Cancelar
    if (temPermissao("vendas.cancelar") && venda.status !== "cancelada") {
      items.push({
        key: "cancelar",
        label: "Cancelar",
        icon: <X className="w-4 h-4" />,
        onClick: () => handleCancelarVenda(venda),
        color: "warning" as const,
      });
    }

    // Excluir
    if (temPermissao("vendas.cancelar")) {
      items.push({
        key: "excluir",
        label: "Excluir",
        icon: <Trash2 className="w-4 h-4" />,
        onClick: () => handleExcluirVenda(venda),
        color: "danger" as const,
      });
    }

    return items;
  };

  const vendasFiltradas = vendas.filter((venda) => {
    // Filtro de permissão: se não tem ver_todas_vendas, só mostra suas próprias vendas
    if (
      !temPermissao("vendas.ver_todas_vendas") &&
      venda.vendedor_id !== usuario?.id
    ) {
      return false;
    }

    const matchStatus =
      filtroStatus === "todas" || venda.status === filtroStatus;
    const matchLoja =
      filtroLoja === "todas" || venda.loja_id === parseInt(filtroLoja);
    const numeroFormatado = `V${String(venda.numero_venda).padStart(6, "0")}`;
    const matchBusca =
      !busca ||
      numeroFormatado?.toLowerCase().includes(busca.toLowerCase()) ||
      venda.cliente?.nome?.toLowerCase().includes(busca.toLowerCase());

    // Log para debug
    if (venda.numero_venda === 6) {
      console.log("🔍 Filtrando V000006:", {
        status: venda.status,
        filtroStatus,
        matchStatus,
        loja_id: venda.loja_id,
        filtroLoja,
        matchLoja,
        matchBusca,
        resultado: matchStatus && matchLoja && matchBusca,
      });
    }

    return matchStatus && matchLoja && matchBusca;
  });

  // Calcular resumo de formas de pagamento das vendas filtradas
  const resumoPagamentos = vendasFiltradas.reduce(
    (acc, venda) => {
      venda.pagamentos?.forEach((pag) => {
        const tipo = pag.tipo_pagamento;
        acc[tipo] = (acc[tipo] || 0) + Number(pag.valor);
      });
      return acc;
    },
    {} as { [key: string]: number }
  );

  // Verificar permissão de visualizar
  if (!loadingPermissoes && !temPermissao("vendas.visualizar")) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold text-danger mb-4">Acesso Negado</h1>
        <p className="text-default-500">
          Você não tem permissão para visualizar vendas.
        </p>
      </div>
    );
  }

  if (loading || loadingPermissoes) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-[1800px] mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Vendas</h1>
          <p className="text-gray-600">
            Gerencie suas vendas e acompanhe o desempenho
          </p>
        </div>
        {temPermissao("vendas.criar") && (
          <Button
            color="primary"
            size="lg"
            startContent={<Plus className="w-5 h-5" />}
            onClick={() => setModalNovaVendaOpen(true)}
          >
            Nova Venda
          </Button>
        )}
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        <Card>
          <CardBody className="flex flex-row items-center gap-3">
            <div className="p-3 bg-primary-100 rounded-lg">
              <ShoppingCart className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total de Vendas</p>
              <p className="text-2xl font-bold">{estatisticas.totalVendas}</p>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="flex flex-row items-center gap-3">
            <div className="p-3 bg-success-100 rounded-lg">
              <Calendar className="w-6 h-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Vendas Hoje</p>
              <p className="text-2xl font-bold">{estatisticas.vendasHoje}</p>
            </div>
          </CardBody>
        </Card>

        {temPermissao("vendas.ver_estatisticas_faturamento") && (
          <>
            <Card>
              <CardBody className="flex flex-row items-center gap-3">
                <div className="p-3 bg-warning-100 rounded-lg">
                  <DollarSign className="w-6 h-6 text-warning" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Faturamento Total</p>
                  <p className="text-xl font-bold">
                    {formatarMoeda(estatisticas.faturamentoTotal)}
                  </p>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardBody className="flex flex-row items-center gap-3">
                <div className="p-3 bg-secondary-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Faturamento Hoje</p>
                  <p className="text-xl font-bold">
                    {formatarMoeda(estatisticas.faturamentoHoje)}
                  </p>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardBody className="flex flex-row items-center gap-3">
                <div className="p-3 bg-danger-100 rounded-lg">
                  <Users className="w-6 h-6 text-danger" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Ticket Médio</p>
                  <p className="text-xl font-bold">
                    {formatarMoeda(estatisticas.ticketMedio)}
                  </p>
                </div>
              </CardBody>
            </Card>
          </>
        )}

        <Card>
          <CardBody className="flex flex-row items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Package className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Produtos Vendidos</p>
              <p className="text-2xl font-bold">
                {estatisticas.produtosVendidos}
              </p>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="flex flex-row items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Wallet className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Créditos Ativos</p>
              <p className="text-xl font-bold">
                {formatarMoeda(estatisticas.totalCreditos)}
              </p>
              <p className="text-xs text-gray-500">
                {estatisticas.creditosAtivos}{" "}
                {estatisticas.creditosAtivos === 1 ? "crédito" : "créditos"}
              </p>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="mb-6">
        <CardBody>
          <div className="flex flex-col md:flex-row gap-4">
            <Input
              placeholder="Buscar por número ou cliente..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              startContent={<Search className="w-4 h-4 text-gray-400" />}
              className="flex-1"
            />
            <Select
              label="Status"
              selectedKeys={[filtroStatus]}
              onChange={(e) => setFiltroStatus(e.target.value)}
              className="w-full md:w-48"
            >
              <SelectItem key="todas">Todas</SelectItem>
              <SelectItem key="em_andamento">Em Andamento</SelectItem>
              <SelectItem key="concluida">Concluídas</SelectItem>
              <SelectItem key="cancelada">Canceladas</SelectItem>
            </Select>
            <Select
              label="Loja"
              selectedKeys={[filtroLoja]}
              onChange={(e) => setFiltroLoja(e.target.value)}
              className="w-full md:w-48"
            >
              {
                [
                  <SelectItem key="todas">Todas as Lojas</SelectItem>,
                  ...lojas.map((loja) => (
                    <SelectItem key={loja.id.toString()}>
                      {loja.nome}
                    </SelectItem>
                  )),
                ] as any
              }
            </Select>

            {/* Botões de visualização */}
            <div className="flex gap-2">
              <Button
                isIconOnly
                variant={visualizacao === "cards" ? "solid" : "flat"}
                color={visualizacao === "cards" ? "primary" : "default"}
                onClick={() => setVisualizacao("cards")}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                isIconOnly
                variant={visualizacao === "tabela" ? "solid" : "flat"}
                color={visualizacao === "tabela" ? "primary" : "default"}
                onClick={() => setVisualizacao("tabela")}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Card de Resumo de Pagamentos */}
      {Object.keys(resumoPagamentos).length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-success" />
              <h3 className="font-bold text-lg">Resumo de Pagamentos</h3>
              <span className="text-sm text-default-500 ml-2">
                ({vendasFiltradas.length}{" "}
                {vendasFiltradas.length === 1 ? "venda" : "vendas"})
              </span>
            </div>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {Object.entries(resumoPagamentos)
                .sort(([, a], [, b]) => b - a)
                .map(([tipo, valor]) => (
                  <div
                    key={tipo}
                    className="bg-default-100 p-4 rounded-lg border border-default-200 hover:border-primary transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">
                        {tipo === "dinheiro"
                          ? "💵"
                          : tipo === "pix"
                            ? "📱"
                            : tipo === "cartao_credito"
                              ? "💳"
                              : tipo === "cartao_debito"
                                ? "💳"
                                : tipo === "transferencia"
                                  ? "🏦"
                                  : tipo === "credito_cliente"
                                    ? "🎁"
                                    : tipo === "boleto"
                                      ? "📄"
                                      : "💰"}
                      </span>
                      <p className="text-xs text-default-600 font-medium uppercase">
                        {tipo.replace("_", " ")}
                      </p>
                    </div>
                    <p className="text-xl font-bold text-success">
                      {formatarMoeda(valor)}
                    </p>
                  </div>
                ))}
              {/* Total Geral */}
              <div className="bg-primary/10 p-4 rounded-lg border-2 border-primary">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">💰</span>
                  <p className="text-xs text-primary font-bold uppercase">
                    Total Geral
                  </p>
                </div>
                <p className="text-xl font-bold text-primary">
                  {formatarMoeda(
                    Object.values(resumoPagamentos).reduce(
                      (sum, val) => sum + val,
                      0
                    )
                  )}
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Lista de Vendas - Cards */}
      {visualizacao === "cards" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {vendasFiltradas.map((venda) => (
            <Card
              key={venda.id}
              className="hover:shadow-lg transition-shadow border border-default-200"
            >
              <CardHeader className="flex justify-between items-start pb-3">
                <div className="space-y-1">
                  <p className="text-lg font-bold text-default-900 dark:text-white">
                    {venda.cliente?.nome || "Cliente"}
                  </p>
                  <p className="text-sm font-semibold text-primary">
                    {`V${String(venda.numero_venda).padStart(6, "0")}`}
                  </p>
                </div>
                <Chip
                  color={
                    venda.status === "concluida"
                      ? "success"
                      : venda.status === "cancelada"
                        ? "danger"
                        : "warning"
                  }
                  size="sm"
                  variant="flat"
                  className="font-semibold"
                >
                  {venda.status === "concluida"
                    ? "Concluída"
                    : venda.status === "cancelada"
                      ? "Cancelada"
                      : "Em Andamento"}
                </Chip>
              </CardHeader>
              <CardBody className="pt-0">
                <div className="space-y-3 mb-4 bg-default-100 dark:bg-default-200/30 rounded-lg p-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-default-700 dark:text-gray-100 font-bold">
                      Loja:
                    </span>
                    <span className="font-bold text-default-900 dark:text-white">
                      {venda.loja?.nome}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-default-700 dark:text-gray-100 font-bold">
                      Vendedor:
                    </span>
                    <span className="font-bold text-default-900 dark:text-white">
                      {venda.vendedor?.nome}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-default-700 dark:text-gray-100 font-bold">
                      Data:
                    </span>
                    <span className="font-bold text-default-900 dark:text-white">
                      {venda.criado_em && formatarData(venda.criado_em)}
                    </span>
                  </div>
                  {venda.tipo === "fiada" && (
                    <div className="pt-2">
                      <Chip
                        color="warning"
                        size="sm"
                        variant="flat"
                        className="font-semibold"
                      >
                        Venda Fiada
                      </Chip>
                    </div>
                  )}
                </div>

                <div className="border-t border-default-300 dark:border-default-500 pt-3 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-default-800 dark:text-gray-100">
                      Total:
                    </span>
                    <span className="font-bold text-xl text-primary">
                      {formatarMoeda(venda.valor_total)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-bold text-default-800 dark:text-gray-100">
                      Pago:
                    </span>
                    <span className="text-success-700 dark:text-green-400 font-bold text-lg">
                      {formatarMoeda(venda.valor_pago)}
                    </span>
                  </div>
                  {venda.saldo_devedor > 0 && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-bold text-default-800 dark:text-gray-100">
                        Saldo:
                      </span>
                      <span className="text-danger-700 dark:text-red-400 font-bold text-lg">
                        {formatarMoeda(venda.saldo_devedor)}
                      </span>
                    </div>
                  )}
                  {(() => {
                    const qtdDevolvida =
                      venda.itens?.reduce(
                        (total, item) => total + (item.devolvido || 0),
                        0
                      ) || 0;
                    const qtdTotal =
                      venda.itens?.reduce(
                        (total, item) => total + item.quantidade,
                        0
                      ) || 0;

                    if (qtdDevolvida > 0) {
                      return (
                        <div className="pt-2 border-t">
                          <Chip
                            color={
                              qtdDevolvida === qtdTotal ? "danger" : "warning"
                            }
                            size="sm"
                            variant="flat"
                            className="w-full"
                          >
                            {qtdDevolvida === qtdTotal
                              ? `Devolução Total (${qtdDevolvida} ${qtdDevolvida === 1 ? "item" : "itens"})`
                              : `Devolução Parcial (${qtdDevolvida}/${qtdTotal} itens)`}
                          </Chip>
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>

                <div className="flex gap-2 mt-4">
                  <Button
                    size="sm"
                    variant="flat"
                    className="flex-1"
                    startContent={<Eye className="w-4 h-4" />}
                    onClick={() => handleAbrirDetalhes(venda)}
                  >
                    Ver Detalhes
                  </Button>

                  <Dropdown>
                    <DropdownTrigger>
                      <Button
                        size="sm"
                        isIconOnly
                        variant="flat"
                        isDisabled={processando}
                      >
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownTrigger>
                    <DropdownMenu aria-label="Ações da venda">
                      {getMenuItems(venda).map((item) => (
                        <DropdownItem
                          key={item.key}
                          startContent={item.icon}
                          onClick={item.onClick}
                          color={item.color}
                        >
                          {item.label}
                        </DropdownItem>
                      ))}
                    </DropdownMenu>
                  </Dropdown>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {/* Lista de Vendas - Tabela */}
      {visualizacao === "tabela" && (
        <Card>
          <CardBody className="p-0">
            <Table aria-label="Tabela de vendas">
              <TableHeader>
                <TableColumn>NÚMERO</TableColumn>
                <TableColumn>CLIENTE</TableColumn>
                <TableColumn>LOJA</TableColumn>
                <TableColumn>DATA</TableColumn>
                <TableColumn>TIPO</TableColumn>
                <TableColumn>STATUS</TableColumn>
                <TableColumn>DEVOLUÇÕES</TableColumn>
                <TableColumn align="end">TOTAL</TableColumn>
                <TableColumn align="end">PAGO</TableColumn>
                <TableColumn>PAGAMENTOS</TableColumn>
                <TableColumn align="end">SALDO</TableColumn>
                <TableColumn align="center">AÇÕES</TableColumn>
              </TableHeader>
              <TableBody>
                {vendasFiltradas.map((venda) => (
                  <TableRow key={venda.id}>
                    <TableCell>
                      <span className="font-bold">
                        V{String(venda.numero_venda).padStart(6, "0")}
                      </span>
                    </TableCell>
                    <TableCell>{venda.cliente?.nome || "Cliente"}</TableCell>
                    <TableCell>{venda.loja?.nome}</TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {venda.criado_em && formatarData(venda.criado_em)}
                      </span>
                    </TableCell>
                    <TableCell>
                      {venda.tipo === "fiada" ? (
                        <Chip color="warning" size="sm" variant="flat">
                          Fiada
                        </Chip>
                      ) : (
                        <Chip color="default" size="sm" variant="flat">
                          Normal
                        </Chip>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        color={
                          venda.status === "concluida"
                            ? "success"
                            : venda.status === "cancelada"
                              ? "danger"
                              : "warning"
                        }
                        size="sm"
                        variant="flat"
                      >
                        {venda.status === "concluida"
                          ? "Concluída"
                          : venda.status === "cancelada"
                            ? "Cancelada"
                            : "Em Andamento"}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      {(() => {
                        const qtdDevolvida =
                          venda.itens?.reduce(
                            (total, item) => total + (item.devolvido || 0),
                            0
                          ) || 0;
                        const qtdTotal =
                          venda.itens?.reduce(
                            (total, item) => total + item.quantidade,
                            0
                          ) || 0;

                        if (qtdDevolvida > 0) {
                          return (
                            <Chip
                              color={
                                qtdDevolvida === qtdTotal ? "danger" : "warning"
                              }
                              size="sm"
                              variant="flat"
                            >
                              {qtdDevolvida === qtdTotal
                                ? "Total"
                                : `${qtdDevolvida}/${qtdTotal}`}
                            </Chip>
                          );
                        }
                        return <span className="text-gray-400">-</span>;
                      })()}
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold">
                        {formatarMoeda(venda.valor_total)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-success font-medium">
                        {formatarMoeda(venda.valor_pago)}
                      </span>
                    </TableCell>
                    <TableCell>
                      {venda.pagamentos && venda.pagamentos.length > 0 ? (
                        <div className="flex flex-col gap-1">
                          {venda.pagamentos.slice(0, 2).map((pag, idx) => (
                            <div
                              key={idx}
                              className="text-xs whitespace-nowrap"
                            >
                              <span className="font-medium">
                                {pag.tipo_pagamento === "dinheiro"
                                  ? "💵"
                                  : pag.tipo_pagamento === "pix"
                                    ? "📱"
                                    : pag.tipo_pagamento === "cartao_credito"
                                      ? "💳"
                                      : pag.tipo_pagamento === "cartao_debito"
                                        ? "💳"
                                        : pag.tipo_pagamento === "transferencia"
                                          ? "🏦"
                                          : pag.tipo_pagamento ===
                                              "credito_cliente"
                                            ? "🎁"
                                            : "💰"}
                              </span>
                              <span className="text-gray-600 ml-1">
                                {formatarMoeda(pag.valor)}
                              </span>
                            </div>
                          ))}
                          {venda.pagamentos.length > 2 && (
                            <span className="text-xs text-gray-500 italic">
                              +{venda.pagamentos.length - 2} mais
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-xs">
                          Sem pagamento
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {venda.saldo_devedor > 0 ? (
                        <span className="text-danger font-medium">
                          {formatarMoeda(venda.saldo_devedor)}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-center gap-2">
                        <Button
                          size="sm"
                          isIconOnly
                          variant="light"
                          onClick={() => handleAbrirDetalhes(venda)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Dropdown>
                          <DropdownTrigger>
                            <Button
                              size="sm"
                              isIconOnly
                              variant="light"
                              isDisabled={processando}
                            >
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownTrigger>
                          <DropdownMenu aria-label="Ações da venda">
                            {getMenuItems(venda).map((item) => (
                              <DropdownItem
                                key={item.key}
                                startContent={item.icon}
                                onClick={item.onClick}
                                color={item.color}
                              >
                                {item.label}
                              </DropdownItem>
                            ))}
                          </DropdownMenu>
                        </Dropdown>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardBody>
        </Card>
      )}

      {vendasFiltradas.length === 0 && (
        <Card>
          <CardBody className="text-center py-12">
            <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">Nenhuma venda encontrada</p>
            <p className="text-sm text-gray-500">
              Clique em "Nova Venda" para começar
            </p>
          </CardBody>
        </Card>
      )}

      {/* Modal Nova Venda */}
      <NovaVendaModal
        isOpen={modalNovaVendaOpen}
        onClose={() => {
          setModalNovaVendaOpen(false);
          setVendaParaEditar(null);
        }}
        onConfirmar={handleCriarVenda}
        clientes={clientes}
        lojas={lojas}
        produtos={produtos}
        creditosDisponiveis={0}
        vendaParaEditar={vendaParaEditar}
        onClienteCriado={carregarClientes}
      />

      {/* Modal Adicionar Pagamento */}
      {vendaSelecionada && (
        <AdicionarPagamentoModal
          isOpen={modalPagamentoOpen}
          onClose={() => {
            setModalPagamentoOpen(false);
            setVendaSelecionada(null);
          }}
          vendaId={vendaSelecionada.id}
          numeroVenda={`V${String(vendaSelecionada.numero_venda).padStart(6, "0")}`}
          clienteId={vendaSelecionada.cliente_id}
          valorTotal={vendaSelecionada.valor_total}
          valorPago={vendaSelecionada.valor_pago}
          saldoDevedor={vendaSelecionada.saldo_devedor}
          statusVenda={vendaSelecionada.status}
          onPagamentoAdicionado={handlePagamentoAdicionado}
        />
      )}

      {/* Modal Editar Pagamento */}
      {vendaSelecionada && (
        <EditarPagamentoVendaModal
          isOpen={modalEditarPagamentoOpen}
          onClose={() => {
            setModalEditarPagamentoOpen(false);
            setVendaSelecionada(null);
          }}
          venda={{
            id: vendaSelecionada.id,
            numero_venda: vendaSelecionada.numero_venda,
          }}
          onPagamentoEditado={handlePagamentoAdicionado}
        />
      )}

      {/* Modal Detalhes da Venda */}
      <DetalhesVendaModal
        isOpen={modalDetalhesOpen}
        onClose={() => {
          setModalDetalhesOpen(false);
          setVendaSelecionada(null);
        }}
        venda={vendaSelecionada}
        onAtualizarVenda={async () => {
          await carregarVendas();
          if (vendaSelecionada) {
            // Atualiza a venda selecionada com dados frescos
            const vendaAtualizada = await VendasService.buscarVendaCompleta(
              vendaSelecionada.id
            );
            if (vendaAtualizada) {
              setVendaSelecionada(vendaAtualizada);
            }
          }
        }}
      />

      {/* Modal de Motivo do Cancelamento */}
      <InputModal
        isOpen={modalMotivoOpen}
        onClose={() => {
          setModalMotivoOpen(false);
          setVendaSelecionada(null);
        }}
        onConfirm={confirmarCancelamento}
        title="Cancelar Venda"
        message={`Por que você está cancelando a venda V${String(vendaSelecionada?.numero_venda || 0).padStart(6, "0")}?`}
        placeholder="Digite o motivo do cancelamento..."
        confirmText="Continuar"
        type="textarea"
        isLoading={processando}
      />

      {/* Modal de Confirmação do Cancelamento */}
      <ConfirmModal
        isOpen={modalCancelarOpen}
        onClose={() => {
          setModalCancelarOpen(false);
          setVendaSelecionada(null);
        }}
        onConfirm={executarCancelamento}
        title="Confirmar Cancelamento"
        message={
          <div className="space-y-2">
            <p>
              Tem certeza que deseja cancelar a venda{" "}
              <strong>
                V{String(vendaSelecionada?.numero_venda || 0).padStart(6, "0")}
              </strong>
              ?
            </p>
            {vendaSelecionada?.devolucoes &&
            vendaSelecionada.devolucoes.length > 0 ? (
              <div className="space-y-2">
                <p className="text-sm text-warning font-semibold">
                  ⚠️ Esta venda possui {vendaSelecionada.devolucoes.length}{" "}
                  devolução(ões) registrada(s).
                </p>
                <p className="text-sm text-default-600">
                  O sistema irá devolver ao estoque apenas os itens que{" "}
                  <strong>não foram devolvidos</strong> nas devoluções
                  anteriores.
                </p>
              </div>
            ) : (
              <p className="text-sm text-warning">
                O estoque dos produtos será devolvido.
              </p>
            )}
          </div>
        }
        confirmText="Sim, cancelar venda"
        confirmColor="warning"
        isLoading={processando}
      />

      {/* Modal de Confirmação da Exclusão */}
      <ConfirmModal
        isOpen={modalExcluirOpen}
        onClose={() => {
          setModalExcluirOpen(false);
          setVendaSelecionada(null);
        }}
        onConfirm={executarExclusao}
        title="Excluir Venda"
        message={
          <div className="space-y-2">
            <p>
              <strong className="text-danger">ATENÇÃO:</strong> Tem certeza que
              deseja EXCLUIR permanentemente a venda{" "}
              <strong>
                V{String(vendaSelecionada?.numero_venda || 0).padStart(6, "0")}
              </strong>
              ?
            </p>
            <p className="text-sm text-danger font-semibold">
              Esta ação não pode ser desfeita e o estoque NÃO será devolvido!
            </p>
          </div>
        }
        confirmText="Sim, excluir permanentemente"
        confirmColor="danger"
        isLoading={processando}
      />

      {toast.ToastComponent}
    </div>
  );
}
