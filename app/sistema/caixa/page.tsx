"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Textarea,
  Chip,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Tabs,
  Tab,
  Badge,
  Select,
  SelectItem,
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
} from "@heroui/react";
import { Pagination } from "@heroui/pagination";
import { Spinner } from "@heroui/spinner";
import {
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CalendarIcon,
  UserIcon,
  BuildingStorefrontIcon,
  LockClosedIcon,
  LockOpenIcon,
  EyeIcon,
  ShoppingCartIcon,
  CubeIcon,
  WrenchScrewdriverIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  BanknotesIcon,
  DevicePhoneMobileIcon,
  CreditCardIcon,
  GiftIcon,
  QuestionMarkCircleIcon,
  ArrowPathIcon,
  FunnelIcon,
} from "@heroicons/react/24/outline";
import { toast } from "sonner";

import { useAuth } from "@/contexts/AuthContext";
import { CaixaService } from "@/services/caixaService";
import { CaixaCompleto, ResumoCaixa, MovimentacaoCaixa } from "@/types/caixa";
import { supabase } from "@/lib/supabaseClient";
import { usePermissoes } from "@/hooks/usePermissoes";
import { useLojaFilter } from "@/hooks/useLojaFilter";
import { aplicarEscopoLoja } from "@/lib/lojaScope";
import { MetricCard } from "@/components/dashboard/executive/MetricCard";

const ITENS_POR_PAGINA_HISTORICO = 10;

interface LojaComCaixa {
  id: number;
  nome: string;
  caixa?: CaixaCompleto | null;
}

export default function CaixaPage() {
  const { usuario } = useAuth();
  const { temPermissao, loading: loadingPermissoes } = usePermissoes();
  const { lojaIds, podeVerTodasLojas } = useLojaFilter();

  const [lojas, setLojas] = useState<LojaComCaixa[]>([]);
  const [loading, setLoading] = useState(false);
  const [abaAtiva, setAbaAtiva] = useState("caixas");

  // Histórico
  const [historicosCaixa, setHistoricosCaixa] = useState<CaixaCompleto[]>([]);
  const [lojaFiltroHistorico, setLojaFiltroHistorico] =
    useState<string>("todos");
  const [dataInicioHistorico, setDataInicioHistorico] = useState("");
  const [dataFimHistorico, setDataFimHistorico] = useState("");
  const [filtrosHistoricoAbertos, setFiltrosHistoricoAbertos] = useState(false);
  const [paginaHistorico, setPaginaHistorico] = useState(1);
  const [totalHistoricos, setTotalHistoricos] = useState(0);
  const [resumoHistorico, setResumoHistorico] = useState({
    totalCaixas: 0,
    totalSaldoInicial: 0,
    totalSaldoFinal: 0,
  });

  // Modais
  const [modalAbrirAberto, setModalAbrirAberto] = useState(false);
  const [modalFecharAberto, setModalFecharAberto] = useState(false);
  const [modalDetalhesAberto, setModalDetalhesAberto] = useState(false);
  const [modalSangriaAberto, setModalSangriaAberto] = useState(false);

  // Loja selecionada para ação
  const [lojaSelecionada, setLojaSelecionada] = useState<LojaComCaixa | null>(
    null,
  );

  // Dados dos modais
  const [saldoInicial, setSaldoInicial] = useState("");
  const [observacoesAbertura, setObservacoesAbertura] = useState("");
  const [saldoFinal, setSaldoFinal] = useState("");
  const [observacoesFechamento, setObservacoesFechamento] = useState("");
  const [valorSangria, setValorSangria] = useState("");
  const [motivoSangria, setMotivoSangria] = useState("");

  // Detalhes do caixa
  const [resumo, setResumo] = useState<ResumoCaixa | null>(null);
  const [movimentacoes, setMovimentacoes] = useState<MovimentacaoCaixa[]>([]);
  const [caixaDetalhes, setCaixaDetalhes] = useState<CaixaCompleto | null>(
    null,
  );
  const [vendasDetalhadas, setVendasDetalhadas] = useState<any>({});

  // Aguardar permissões serem carregadas antes de carregar dados
  useEffect(() => {
    if (!loadingPermissoes) {
      carregarLojas();
      carregarHistorico();
    }
  }, [loadingPermissoes, lojaIds, podeVerTodasLojas]);

  useEffect(() => {
    if (abaAtiva === "historico") {
      carregarHistorico(1, true);
    }
  }, [abaAtiva, lojaFiltroHistorico, dataInicioHistorico, dataFimHistorico]);

  useEffect(() => {
    if (abaAtiva === "historico") {
      carregarHistorico(paginaHistorico, false);
    }
  }, [paginaHistorico]);

  const totalPaginasHistorico = useMemo(() => {
    return Math.max(1, Math.ceil(totalHistoricos / ITENS_POR_PAGINA_HISTORICO));
  }, [totalHistoricos]);

  const historicosPaginados = useMemo(() => {
    return historicosCaixa;
  }, [historicosCaixa]);

  useEffect(() => {
    if (paginaHistorico > totalPaginasHistorico) {
      setPaginaHistorico(totalPaginasHistorico);
    }
  }, [paginaHistorico, totalPaginasHistorico]);

  const carregarLojas = async () => {
    try {
      setLoading(true);

      let query = supabase
        .from("lojas")
        .select("id, nome")
        .eq("ativo", true)
        .order("nome");

      // Aplicar filtro de loja se usuário não tiver acesso a todas
      if (lojaIds.length > 0 && !podeVerTodasLojas) {
        query = aplicarEscopoLoja(query, "id", lojaIds);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Para cada loja, buscar caixa aberto
      const lojasComCaixa = await Promise.all(
        (data || []).map(async (loja) => {
          const caixa = await CaixaService.buscarCaixaAberto(loja.id);

          return {
            ...loja,
            caixa,
          };
        }),
      );

      setLojas(lojasComCaixa);
    } catch (error) {
      console.error("Erro ao carregar lojas:", error);
    } finally {
      setLoading(false);
    }
  };

  const carregarHistorico = async (
    page: number = 1,
    showLoading: boolean = true,
  ) => {
    try {
      if (showLoading) setLoading(true);

      const filtros: any = {
        status: "fechado",
        page,
        pageSize: ITENS_POR_PAGINA_HISTORICO,
      };

      if (lojaFiltroHistorico !== "todos") {
        filtros.loja_id = parseInt(lojaFiltroHistorico);
      } else if (lojaIds.length > 0 && !podeVerTodasLojas) {
        filtros.loja_id = lojaIds.length === 1 ? lojaIds[0] : lojaIds;
      }

      if (dataInicioHistorico) {
        filtros.data_inicio = dataInicioHistorico;
      }

      if (dataFimHistorico) {
        filtros.data_fim = dataFimHistorico;
      }

      const filtrosResumo: any = {};

      if (filtros.loja_id) filtrosResumo.loja_id = filtros.loja_id;
      if (filtros.data_inicio) filtrosResumo.data_inicio = filtros.data_inicio;
      if (filtros.data_fim) filtrosResumo.data_fim = filtros.data_fim;

      const [paginatedResult, resumo] = await Promise.all([
        CaixaService.listarCaixas(filtros),
        CaixaService.buscarResumoHistorico(filtrosResumo),
      ]);

      const { data: historicos, count } = paginatedResult;

      setTotalHistoricos(count);
      setResumoHistorico(resumo);

      if (historicos.length > 0) {
        const { saldos, aparelhosPorCaixa } =
          await CaixaService.buscarSaldosEsperados(historicos);

        const podeVerAparelhos = temPermissao("caixa.ver_aparelhos");

        const historicosComSaldo = historicos.map((caixa) => {
          const saldoBase = saldos.get(caixa.id) || 0;
          const aparelhosValor = aparelhosPorCaixa.get(caixa.id) || 0;

          return {
            ...caixa,
            saldo_esperado: podeVerAparelhos
              ? saldoBase
              : saldoBase - aparelhosValor,
          };
        }) as CaixaCompleto[];

        setHistoricosCaixa(historicosComSaldo);
      } else {
        setHistoricosCaixa([]);
      }
    } catch (error) {
      console.error("Erro ao carregar histórico:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAbrirModal = (loja: LojaComCaixa) => {
    if (!temPermissao("caixa.abrir")) {
      toast.error("Você não tem permissão para abrir caixa");

      return;
    }
    setLojaSelecionada(loja);
    setSaldoInicial("");
    setObservacoesAbertura("");
    setModalAbrirAberto(true);
  };

  const handleFecharModal = (loja: LojaComCaixa) => {
    if (!temPermissao("caixa.fechar")) {
      toast.error("Você não tem permissão para fechar caixa");

      return;
    }
    setLojaSelecionada(loja);
    setSaldoFinal("");
    setObservacoesFechamento("");
    setModalFecharAberto(true);
  };

  const handleAbrirCaixa = async () => {
    if (!usuario || !lojaSelecionada || !saldoInicial) return;

    setLoading(true);
    try {
      await CaixaService.abrirCaixa({
        loja_id: lojaSelecionada.id,
        saldo_inicial: parseFloat(saldoInicial),
        observacoes_abertura: observacoesAbertura,
        usuario_id: usuario.id,
      });

      setModalAbrirAberto(false);
      await carregarLojas();
    } catch (error: any) {
      alert(error.message || "Erro ao abrir caixa");
    } finally {
      setLoading(false);
    }
  };

  const handleFecharCaixa = async () => {
    if (!usuario || !lojaSelecionada?.caixa) return;

    setLoading(true);
    try {
      await CaixaService.fecharCaixa({
        caixa_id: lojaSelecionada.caixa.id,
        saldo_final: 0,
        observacoes_fechamento: observacoesFechamento,
        usuario_id: usuario.id,
      });

      setModalFecharAberto(false);
      await carregarLojas();
    } catch (error: any) {
      alert(error.message || "Erro ao fechar caixa");
    } finally {
      setLoading(false);
    }
  };

  const handleVerDetalhes = async (caixa: CaixaCompleto) => {
    if (!temPermissao("caixa.visualizar_movimentacoes")) {
      toast.error(
        "Você não tem permissão para visualizar movimentações do caixa",
      );

      return;
    }
    setLoading(true);
    setCaixaDetalhes(caixa);
    setModalDetalhesAberto(true);

    try {
      const [resumoData, movimentacoesData, vendasDetalhadasData] =
        await Promise.all([
          CaixaService.buscarResumoCaixa(caixa.id),
          CaixaService.buscarMovimentacoes(caixa.id),
          CaixaService.buscarVendasDetalhadasPorPagamento(caixa.id),
        ]);

      setResumo(resumoData);

      // Os dados já vêm agrupados do service, apenas formatar para exibição
      const movimentacoesFormatadas = movimentacoesData.map((mov: any) => ({
        ...mov,
        valor_total: mov.valor,
      }));

      setMovimentacoes(movimentacoesFormatadas);
      setVendasDetalhadas(vendasDetalhadasData);
    } catch (error) {
      console.error("Erro ao carregar detalhes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSangria = (loja: LojaComCaixa) => {
    setLojaSelecionada(loja);
    setValorSangria("");
    setMotivoSangria("");
    setModalSangriaAberto(true);
  };

  const handleRegistrarSangria = async () => {
    if (!usuario || !lojaSelecionada?.caixa || !valorSangria || !motivoSangria)
      return;

    setLoading(true);
    try {
      await CaixaService.registrarSangria({
        caixa_id: lojaSelecionada.caixa.id,
        valor: parseFloat(valorSangria),
        motivo: motivoSangria,
        usuario_id: usuario.id,
      });

      setModalSangriaAberto(false);
      await carregarLojas();
      alert("Sangria registrada com sucesso!");
    } catch (error: any) {
      alert(error.message || "Erro ao registrar sangria");
    } finally {
      setLoading(false);
    }
  };

  const formatarMoeda = (valor: number | null | undefined) => {
    const numerico = Number(valor || 0);

    if (Number.isNaN(numerico)) return "R$ 0,00";

    return numerico.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const formatarData = (data: string | null | undefined) => {
    if (!data) return "N/A";

    return new Date(data).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const calcularDuracao = (dataAbertura: string) => {
    const abertura = new Date(dataAbertura);
    const agora = new Date();
    const diff = agora.getTime() - abertura.getTime();
    const horas = Math.floor(diff / (1000 * 60 * 60));
    const minutos = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return `${horas}h ${minutos}min`;
  };

  const gerarPDFCaixa = async (
    tipoRelatorio: "completo" | "aparelhos" | "outros" = "completo",
  ) => {
    if (!caixaDetalhes || !resumo) return;

    const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
      import("jspdf/dist/jspdf.es.min.js"),
      import("jspdf-autotable"),
    ]);
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;

    // Buscar detalhes das devoluções com itens
    let devolucoesDetalhadas: any[] = [];

    if (
      resumo.devolucoes.quantidade > 0 ||
      resumo.devolucoes_sem_credito.quantidade > 0
    ) {
      try {
        const dataAbertura = caixaDetalhes.data_abertura;
        const dataFechamento =
          caixaDetalhes.data_fechamento || new Date().toISOString();

        const { data: devolucoes } = await supabase
          .from("devolucoes_venda")
          .select(
            `
            id,
            venda_id,
            valor_total,
            criado_em,
            tipo,
            forma_pagamento,
            motivo,
            venda:vendas!devolucoes_venda_venda_id_fkey(
              id,
              numero_venda,
              loja_id,
              cliente:clientes(nome),
              itens:itens_venda(
                id,
                produto_nome,
                quantidade,
                devolvido,
                preco_unitario
              )
            ),
            itens:itens_devolucao(
              quantidade,
              item_venda_id
            )
          `,
          )
          .gte("criado_em", dataAbertura)
          .lte("criado_em", dataFechamento);

        if (devolucoes) {
          // Filtrar apenas devoluções da loja do caixa
          devolucoesDetalhadas = devolucoes.filter(
            (d: any) => d.venda?.loja_id === caixaDetalhes.loja_id,
          );
        }
      } catch (error) {
        console.error("Erro ao buscar detalhes das devoluções:", error);
      }
    }

    // Buscar IDs das vendas que possuem aparelhos
    let vendasComAparelhos = new Set<string>();

    if (tipoRelatorio !== "completo") {
      try {
        const vendaIds = movimentacoes
          .filter((m) => m.tipo === "venda")
          .map((m) => m.referencia_id)
          .filter(Boolean);

        if (vendaIds.length > 0) {
          const { data: aparelhos } = await supabase
            .from("aparelhos")
            .select("venda_id")
            .in("venda_id", vendaIds);

          vendasComAparelhos = new Set(
            (aparelhos || []).map((a: any) => a.venda_id),
          );
        }
      } catch (error) {
        console.error("Erro ao buscar vendas com aparelhos:", error);
      }
    }

    // Título
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    const titulo =
      tipoRelatorio === "aparelhos"
        ? "Relatório de Caixa - Venda de Aparelhos"
        : tipoRelatorio === "outros"
          ? "Relatório de Caixa - Demais Vendas"
          : "Relatório de Caixa";

    doc.text(titulo, pageWidth / 2, 20, { align: "center" });

    // Informações do Caixa
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const lojaTexto = `Loja: ${caixaDetalhes.loja?.nome || "N/A"}`;

    doc.text(lojaTexto, 15, 35, { maxWidth: pageWidth - 30 });

    const abertoTexto = `Aberto por: ${caixaDetalhes.usuario_abertura_info?.nome || "N/A"}`;

    doc.text(abertoTexto, 15, 42, { maxWidth: pageWidth - 30 });

    doc.text(
      `Data Abertura: ${formatarData(caixaDetalhes.data_abertura)}`,
      15,
      49,
    );
    if (caixaDetalhes.data_fechamento) {
      doc.text(
        `Data Fechamento: ${formatarData(caixaDetalhes.data_fechamento)}`,
        15,
        56,
      );
      const fechadoTexto = `Fechado por: ${caixaDetalhes.usuario_fechamento_info?.nome || "N/A"}`;

      doc.text(fechadoTexto, 15, 63, { maxWidth: pageWidth - 30 });
    }

    // Resumo Financeiro (só no relatório completo)
    let yPos: number;

    if (tipoRelatorio === "completo") {
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text(
        "Resumo Financeiro",
        15,
        caixaDetalhes.data_fechamento ? 80 : 73,
      );

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      yPos = caixaDetalhes.data_fechamento ? 88 : 81;

      doc.text(
        `Saldo Inicial: ${formatarMoeda(resumo.saldo_inicial)}`,
        15,
        yPos,
      );
      yPos += 7;
      doc.text(
        `Total Entradas: ${formatarMoeda(resumo.total_entradas)}`,
        15,
        yPos,
      );
      yPos += 7;
      doc.text(`Total Saídas: ${formatarMoeda(resumo.total_saidas)}`, 15, yPos);
      yPos += 7;
      doc.text(
        `Saldo Movimentado: ${formatarMoeda(resumo.total_entradas - resumo.total_saidas)}`,
        15,
        yPos,
      );
      yPos += 7;
      doc.text(
        `Saldo Esperado: ${formatarMoeda(resumo.saldo_esperado)}`,
        15,
        yPos,
      );

      // Total Geral do Caixa
      yPos += 10;
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setFillColor(59, 130, 246);
      doc.rect(15, yPos - 5, pageWidth - 30, 10, "F");
      doc.setTextColor(255, 255, 255);
      const totalGeral =
        resumo.saldo_inicial + resumo.total_entradas - resumo.total_saidas;

      doc.text(
        `TOTAL GERAL DO CAIXA: ${formatarMoeda(totalGeral)}`,
        pageWidth / 2,
        yPos,
        { align: "center" },
      );
      doc.setTextColor(0, 0, 0);
      yPos += 12;

      if (
        caixaDetalhes.saldo_final !== null &&
        caixaDetalhes.saldo_final !== undefined
      ) {
        yPos += 7;
        doc.text(
          `Saldo Final: ${formatarMoeda(caixaDetalhes.saldo_final)}`,
          15,
          yPos,
        );
        yPos += 7;
        const diferenca = caixaDetalhes.saldo_final - resumo.saldo_esperado;
        const diferencaColor = diferenca >= 0 ? [34, 197, 94] : [239, 68, 68];

        doc.setTextColor(
          diferencaColor[0],
          diferencaColor[1],
          diferencaColor[2],
        );
        doc.text(`Diferença: ${formatarMoeda(diferenca)}`, 15, yPos);
        doc.setTextColor(0, 0, 0);
      }

      // Verificar se precisa de nova página
      if (yPos > 245) {
        doc.addPage();
        yPos = 20;
      }
    } else {
      yPos = 75;
    }

    // ===== VENDAS =====
    let vendas = movimentacoes.filter((mov) => mov.tipo === "venda");

    if (tipoRelatorio === "aparelhos") {
      vendas = vendas.filter(
        (mov) => mov.referencia_id && vendasComAparelhos.has(mov.referencia_id),
      );
    } else if (tipoRelatorio === "outros") {
      vendas = vendas.filter(
        (mov) =>
          !mov.referencia_id || !vendasComAparelhos.has(mov.referencia_id),
      );
    }

    const vendasPorFormaPagamento: {
      [key: string]: Array<{
        cliente: string;
        valor: number;
        numero: string;
        data: string;
      }>;
    } = {};

    vendas.forEach((mov) => {
      // Pular vendas devolvidas SEM CRÉDITO no mesmo dia
      // Vendas devolvidas COM CRÉDITO não saem do caixa (crédito permanece na empresa)
      const temDevolucaoSemCredito = movimentacoes.some(
        (m) =>
          m.tipo === "devolucao" &&
          m.referencia_id === mov.referencia_id &&
          !m.gerou_credito &&
          new Date(m.data).toDateString() === new Date(mov.data).toDateString(),
      );

      if (temDevolucaoSemCredito) return;

      const forma = mov.forma_pagamento || "nao_informado";

      if (!vendasPorFormaPagamento[forma]) {
        vendasPorFormaPagamento[forma] = [];
      }

      // Extrair número da venda e cliente da descrição
      const match = mov.descricao.match(/Venda #(\d+)/);
      const numeroVenda = match ? match[1] : "N/A";
      const clienteMatch = mov.descricao.match(/- (.+)$/);
      const cliente = clienteMatch ? clienteMatch[1] : "Cliente";

      // Formatar data e hora
      const dataHora = new Date(mov.data).toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });

      vendasPorFormaPagamento[forma].push({
        cliente,
        valor: mov.valor || 0,
        numero: numeroVenda,
        data: dataHora,
      });
    });

    if (vendas.length > 0) {
      // Verificar se precisa de nova página antes da seção
      if (yPos > 245) {
        doc.addPage();
        yPos = 20;
      }

      yPos += 10;
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.setFillColor(34, 197, 94);
      doc.rect(15, yPos - 5, pageWidth - 30, 9, "F");
      doc.setTextColor(255, 255, 255);
      doc.text("VENDAS", pageWidth / 2, yPos, { align: "center" });
      doc.setTextColor(0, 0, 0);
      yPos += 13;

      // Formas de pagamento das vendas
      const formasOrdenadas = [
        "pix",
        "dinheiro",
        "cartao_debito",
        "cartao_credito",
        "troca_aparelho",
        "credito_cliente",
        "transferencia",
        "boleto",
        "nao_informado",
      ];
      const nomesFormas: any = {
        pix: "PIX",
        dinheiro: "Dinheiro",
        cartao_debito: "Cartão de Débito",
        cartao_credito: "Cartão de Crédito",
        troca_aparelho: "Troca de Aparelho",
        credito_cliente: "Crédito do Cliente",
        transferencia: "Transferência",
        boleto: "Boleto",
        nao_informado: "Não Informado",
      };

      formasOrdenadas.forEach((forma) => {
        const vendas = vendasPorFormaPagamento[forma] || [];
        const total = vendas.reduce((sum, v) => sum + v.valor, 0);

        if (total === 0) return;

        // Verificar se precisa de nova página para o subtítulo
        if (yPos > 260) {
          doc.addPage();
          yPos = 20;
        }

        yPos += 2;
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.setFillColor(220, 252, 231); // Verde claro
        doc.rect(18, yPos - 4, pageWidth - 36, 6, "F");
        doc.setTextColor(0, 0, 0);
        doc.text(`${nomesFormas[forma]} - ${formatarMoeda(total)}`, 22, yPos);
        yPos += 8;

        // Lista de clientes
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        vendas.forEach((venda) => {
          if (yPos > 272) {
            doc.addPage();
            yPos = 20;
          }
          // Limitar tamanho do nome do cliente
          const nomeCliente =
            venda.cliente.length > 40
              ? venda.cliente.substring(0, 37) + "..."
              : venda.cliente;

          doc.text(
            `${venda.data} - #${venda.numero} - ${nomeCliente}`,
            25,
            yPos,
            {
              maxWidth: pageWidth - 60,
            },
          );
          doc.text(formatarMoeda(venda.valor), pageWidth - 20, yPos, {
            align: "right",
          });
          yPos += 4.5;
        });

        yPos += 4;
      });

      if (yPos > 262) {
        doc.addPage();
        yPos = 20;
      }

      yPos += 3;
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setFillColor(34, 197, 94);
      doc.setTextColor(34, 197, 94);
      doc.text(
        `Total de Vendas: ${formatarMoeda(vendas.reduce((sum, v) => sum + (v.valor || 0), 0))}`,
        20,
        yPos,
      );
      doc.setTextColor(0, 0, 0);
      yPos += 12;
    }

    // ===== VENDAS COM CRÉDITO DO CLIENTE =====
    const vendasComCredito = vendasPorFormaPagamento["credito_cliente"] || [];

    if (vendasComCredito.length > 0) {
      if (yPos > 245) {
        doc.addPage();
        yPos = 20;
      }

      yPos += 10;
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.setFillColor(59, 130, 246);
      doc.rect(15, yPos - 5, pageWidth - 30, 9, "F");
      doc.setTextColor(255, 255, 255);
      doc.text("VENDAS COM CRÉDITO DO CLIENTE", pageWidth / 2, yPos, {
        align: "center",
      });
      doc.setTextColor(0, 0, 0);
      yPos += 13;

      // Não entra dinheiro no caixa - apenas para registro
      yPos += 2;
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setFillColor(219, 234, 254); // Azul claro
      doc.rect(18, yPos - 4, pageWidth - 36, 6, "F");
      doc.setTextColor(0, 0, 0);
      const totalCredito = vendasComCredito.reduce(
        (sum, v) => sum + v.valor,
        0,
      );

      doc.text(`Crédito do Cliente - ${formatarMoeda(totalCredito)}`, 22, yPos);
      yPos += 8;

      // Lista de vendas com crédito
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      vendasComCredito.forEach((venda) => {
        if (yPos > 272) {
          doc.addPage();
          yPos = 20;
        }
        const nomeCliente =
          venda.cliente.length > 40
            ? venda.cliente.substring(0, 37) + "..."
            : venda.cliente;

        doc.text(
          `${venda.data} - #${venda.numero} - ${nomeCliente}`,
          25,
          yPos,
          {
            maxWidth: pageWidth - 60,
          },
        );
        doc.text(formatarMoeda(venda.valor), pageWidth - 20, yPos, {
          align: "right",
        });
        yPos += 4.5;
      });

      yPos += 4;
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setFillColor(59, 130, 246);
      doc.setTextColor(59, 130, 246);
      doc.text(`Total com Crédito: ${formatarMoeda(totalCredito)}`, 20, yPos);
      doc.setTextColor(0, 0, 0);
      yPos += 12;
    }
    // OS aparece no completo e demais vendas
    if (tipoRelatorio !== "aparelhos") {
      const ordensServico = movimentacoes.filter(
        // Filtrar apenas ordens de serviço válidas (com número e valor definidos)
        (mov) => {
          if (mov.tipo === "ordem_servico") {
            console.log("DEBUG OS IDDDDDDDDDDDDDDDDDDDDDDS:", {
              mov_id_loja: mov.id_loja,
              caixa_loja_id: caixaDetalhes.loja?.id,
              mov,
            });
          }

          return (
            mov.tipo === "ordem_servico" &&
            mov.descricao &&
            mov.descricao.split(" - ")[0] !== "" &&
            mov.valor !== undefined &&
            mov.valor !== null &&
            mov.valor > 0 &&
            String(mov.id_loja) === String(caixaDetalhes.loja?.id)
          );
        },
      );
      const osPorFormaPagamento: {
        [key: string]: Array<{
          cliente: string;
          valor: number;
          numero: string;
          data: string;
        }>;
      } = {};

      // Processar OS e seus pagamentos
      ordensServico.forEach((mov) => {
        // Extrair número da OS e cliente da descrição
        const descricaoParts = mov.descricao.split(" - ");
        const numeroOS = descricaoParts[0] || "";
        const cliente = descricaoParts[1] || "Cliente não informado";

        // Ignorar OS sem número ou valor
        if (
          !numeroOS ||
          mov.valor === undefined ||
          mov.valor === null ||
          mov.valor <= 0
        )
          return;

        // Formatar data e hora
        const dataHora = new Date(mov.data).toLocaleString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        });

        if (mov.pagamentos && mov.pagamentos.length > 0) {
          mov.pagamentos.forEach((pag: any) => {
            const forma = pag.tipo_pagamento || "nao_informado";

            if (!osPorFormaPagamento[forma]) {
              osPorFormaPagamento[forma] = [];
            }
            // Ignorar pagamentos sem valor
            if (pag.valor === undefined || pag.valor === null || pag.valor <= 0)
              return;
            osPorFormaPagamento[forma].push({
              cliente,
              valor: pag.valor,
              numero: numeroOS,
              data: dataHora,
            });
          });
        } else {
          const forma = mov.forma_pagamento || "nao_informado";

          if (!osPorFormaPagamento[forma]) {
            osPorFormaPagamento[forma] = [];
          }
          osPorFormaPagamento[forma].push({
            cliente,
            valor: mov.valor,
            numero: numeroOS,
            data: dataHora,
          });
        }
      });

      // Só renderizar a seção se houver pelo menos uma OS válida
      const totalOSValidas = Object.values(osPorFormaPagamento).flat().length;

      if (totalOSValidas > 0) {
        // Verificar se precisa de nova página antes da seção
        if (yPos > 245) {
          doc.addPage();
          yPos = 20;
        }

        yPos += 10;
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.setFillColor(147, 51, 234);
        doc.rect(15, yPos - 5, pageWidth - 30, 9, "F");
        doc.setTextColor(255, 255, 255);
        doc.text("ORDENS DE SERVIÇO", pageWidth / 2, yPos, { align: "center" });
        doc.setTextColor(0, 0, 0);
        yPos += 13;

        // Formas de pagamento das OS
        const formasOrdenadas = [
          "dinheiro",
          "pix",
          "cartao_credito",
          "cartao_debito",
          "transferencia",
          "cheque",
        ];
        const nomesFormas: any = {
          dinheiro: "Dinheiro",
          pix: "PIX",
          cartao_credito: "Cartão de Crédito",
          cartao_debito: "Cartão de Débito",
          transferencia: "Transferência",
          cheque: "Cheque",
        };

        formasOrdenadas.forEach((forma) => {
          const ordens = osPorFormaPagamento[forma] || [];
          const total = ordens.reduce((sum, o) => sum + o.valor, 0);

          if (total === 0) return;

          // Verificar se precisa de nova página para o subtítulo
          if (yPos > 260) {
            doc.addPage();
            yPos = 20;
          }

          yPos += 2;
          doc.setFontSize(10);
          doc.setFont("helvetica", "bold");
          doc.setFillColor(233, 213, 255); // Roxo claro
          doc.rect(18, yPos - 4, pageWidth - 36, 6, "F");
          doc.setTextColor(0, 0, 0);
          doc.text(`${nomesFormas[forma]} - ${formatarMoeda(total)}`, 22, yPos);
          yPos += 8;

          // Lista de clientes
          doc.setFontSize(8);
          doc.setFont("helvetica", "normal");
          ordens.forEach((ordem) => {
            if (yPos > 272) {
              doc.addPage();
              yPos = 20;
            }
            // Limitar tamanho do nome do cliente
            const nomeCliente =
              ordem.cliente.length > 40
                ? ordem.cliente.substring(0, 37) + "..."
                : ordem.cliente;

            doc.text(
              `${ordem.data} - ${ordem.numero} - ${nomeCliente}`,
              25,
              yPos,
              {
                maxWidth: pageWidth - 60,
              },
            );
            doc.text(formatarMoeda(ordem.valor), pageWidth - 20, yPos, {
              align: "right",
            });
            yPos += 4.5;
          });

          yPos += 4;
        });

        if (yPos > 262) {
          doc.addPage();
          yPos = 20;
        }

        yPos += 3;
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(147, 51, 234);
        doc.text(
          `Total de OS: ${ordensServico.length} - ${formatarMoeda(ordensServico.reduce((sum, v) => sum + (v.valor || 0), 0))}`,
          20,
          yPos,
        );
        doc.setTextColor(0, 0, 0);
        yPos += 12;
      }
    }
    // Demais detalhamentos (Tipo, Devoluções, Sangrias, Quebras) só no completo
    if (tipoRelatorio === "completo") {
      // Detalhamento por Tipo
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }

      yPos += 10;
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Resumo por Tipo", 15, yPos);

      yPos += 8;
      const detalhamentoData = [
        ["Tipo", "Quantidade", "Total"],
        [
          "Vendas",
          (resumo.vendas?.quantidade || 0).toString(),
          formatarMoeda(resumo.vendas?.total || 0),
        ],
        [
          "Ordens de Serviço",
          (resumo.ordens_servico?.quantidade || 0).toString(),
          formatarMoeda(resumo.ordens_servico?.total || 0),
        ],
        [
          "Sangrias",
          (resumo.sangrias?.quantidade || 0).toString(),
          formatarMoeda(resumo.sangrias?.total || 0),
        ],
        [
          "Quebras",
          (resumo.quebras?.quantidade || 0).toString(),
          formatarMoeda(resumo.quebras?.total || 0),
        ],
      ];

      autoTable(doc, {
        startY: yPos,
        head: [detalhamentoData[0]],
        body: detalhamentoData.slice(1),
        theme: "striped",
        headStyles: { fillColor: [59, 130, 246] },
        margin: { left: 15, right: 15 },
      });

      yPos = (doc as any).lastAutoTable.finalY;

      // Detalhamento de Devoluções
      if (
        (resumo.devolucoes.quantidade > 0 ||
          resumo.devolucoes_sem_credito.quantidade > 0) &&
        devolucoesDetalhadas.length > 0
      ) {
        if (yPos > 245) {
          doc.addPage();
          yPos = 20;
        } else {
          yPos += 15;
        }

        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("Detalhamento de Devoluções", 15, yPos);
        yPos += 5;

        // Para cada devolução, mostrar cabeçalho e itens
        devolucoesDetalhadas.forEach((dev, index) => {
          if (yPos > 260) {
            doc.addPage();
            yPos = 20;
          }

          yPos += 8;

          // Cabeçalho da devolução
          doc.setFontSize(11);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(239, 68, 68);
          doc.text(
            `Devolução ${index + 1}: Venda #${dev.venda?.numero_venda} - ${dev.venda?.cliente?.nome || "Cliente"}`,
            15,
            yPos,
          );
          doc.setTextColor(0, 0, 0);
          yPos += 5;

          doc.setFontSize(9);
          doc.setFont("helvetica", "normal");
          doc.text(
            `Data: ${formatarData(dev.criado_em)} | Tipo: ${dev.tipo === "com_credito" ? "Com Crédito" : "Sem Crédito"} | Forma: ${dev.forma_pagamento || "N/A"} | Total: ${formatarMoeda(dev.valor_total)}`,
            15,
            yPos,
          );
          yPos += 5;

          if (dev.motivo) {
            doc.setFont("helvetica", "italic");
            doc.setTextColor(100, 100, 100);
            doc.text(`Motivo: ${dev.motivo}`, 15, yPos);
            doc.setTextColor(0, 0, 0);
            yPos += 5;
          }

          yPos += 2;

          // Criar mapa de itens devolvidos
          const itensDevolvidos = new Map();

          dev.itens?.forEach((item: any) => {
            itensDevolvidos.set(item.item_venda_id, item.quantidade);
          });

          // Tabela de todos os itens da venda
          if (dev.venda?.itens && dev.venda.itens.length > 0) {
            const itensData = [
              [
                "Produto",
                "Qtd Original",
                "Qtd Devolvida",
                "Qtd Restante",
                "Valor Unit.",
                "Status",
              ],
              ...dev.venda.itens.map((item: any) => {
                const qtdDevolvidaNestaDevolucao =
                  itensDevolvidos.get(item.id) || 0;
                const qtdRestante = item.quantidade - item.devolvido;
                const status =
                  item.devolvido === item.quantidade
                    ? "Devolvido Total"
                    : item.devolvido > 0
                      ? "Parcial"
                      : "Nao Devolvido";

                return [
                  item.produto_nome || "N/A",
                  item.quantidade.toString(),
                  qtdDevolvidaNestaDevolucao > 0
                    ? qtdDevolvidaNestaDevolucao.toString()
                    : "-",
                  qtdRestante.toString(),
                  formatarMoeda(item.preco_unitario || 0),
                  status,
                ];
              }),
            ];

            autoTable(doc, {
              startY: yPos,
              head: [itensData[0]],
              body: itensData.slice(1),
              theme: "striped",
              headStyles: { fillColor: [239, 68, 68], fontSize: 8 },
              bodyStyles: { fontSize: 7 },
              margin: { left: 20, right: 15 },
              columnStyles: {
                0: { cellWidth: 60 },
                1: { cellWidth: 20, halign: "center" },
                2: { cellWidth: 20, halign: "center" },
                3: { cellWidth: 20, halign: "center" },
                4: { cellWidth: 25, halign: "right" },
                5: { cellWidth: 35, halign: "center" },
              },
              didParseCell: function (data: any) {
                // Colorir células de status
                if (data.column.index === 5 && data.section === "body") {
                  if (data.cell.raw.includes("Devolvido Total")) {
                    data.cell.styles.textColor = [220, 38, 38]; // vermelho
                  } else if (data.cell.raw.includes("Parcial")) {
                    data.cell.styles.textColor = [245, 158, 11]; // laranja
                  } else if (data.cell.raw.includes("Nao Devolvido")) {
                    data.cell.styles.textColor = [34, 197, 94]; // verde
                  }
                }
              },
            });

            yPos = (doc as any).lastAutoTable.finalY + 5;
          } else {
            yPos += 3;
          }
        });
      }

      // Detalhamento de Sangrias (Manual) e Reembolsos
      const sangriasTodas = movimentacoes.filter(
        (mov) => mov.tipo === "sangria",
      );
      const sangriasManual = sangriasTodas.filter((mov) => !mov.eh_reembolso);
      const reembolsos = sangriasTodas.filter((mov) => mov.eh_reembolso);

      // ===== SANGRIAS MANUAIS =====
      if (sangriasManual.length > 0) {
        if (yPos > 245) {
          doc.addPage();
          yPos = 20;
        } else {
          yPos += 15;
        }

        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.setFillColor(245, 158, 11);
        doc.rect(15, yPos - 5, pageWidth - 30, 9, "F");
        doc.setTextColor(255, 255, 255);
        doc.text(
          "SANGRIAS MANUAIS (Retirada de Dinheiro)",
          pageWidth / 2,
          yPos,
          {
            align: "center",
          },
        );
        doc.setTextColor(0, 0, 0);
        yPos += 10;

        const sangriasData = [
          ["Data/Hora", "Motivo", "Valor", "Responsável"],
          ...sangriasManual.map((sangria) => [
            formatarData(sangria.data),
            sangria.descricao.replace("Sangria Manual - ", ""),
            formatarMoeda(Math.abs(sangria.valor)),
            sangria.usuario_responsavel || "N/A",
          ]),
        ];

        autoTable(doc, {
          startY: yPos,
          head: [sangriasData[0]],
          body: sangriasData.slice(1),
          theme: "striped",
          headStyles: { fillColor: [245, 158, 11] },
          margin: { left: 15, right: 15 },
          columnStyles: {
            0: { cellWidth: 40 },
            1: { cellWidth: 60 },
            2: { cellWidth: 30, halign: "right" },
            3: { cellWidth: 30 },
          },
        });

        yPos = (doc as any).lastAutoTable.finalY;
      }

      // ===== REEMBOLSOS =====
      if (reembolsos.length > 0) {
        if (yPos > 245) {
          doc.addPage();
          yPos = 20;
        } else {
          yPos += 15;
        }

        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.setFillColor(239, 68, 68);
        doc.rect(15, yPos - 5, pageWidth - 30, 9, "F");
        doc.setTextColor(255, 255, 255);
        doc.text("REEMBOLSOS DE VENDAS", pageWidth / 2, yPos, {
          align: "center",
        });
        doc.setTextColor(0, 0, 0);
        yPos += 10;

        const reembolsosData = [
          ["Data/Hora", "Venda", "Cliente", "Valor Reembolsado"],
          ...reembolsos.map((reembolso) => {
            // Extrair número da venda da descrição
            const match = reembolso.descricao.match(/Venda #(\d+)/);
            const numeroVenda = match ? match[1] : "N/A";
            const clienteMatch = reembolso.descricao.match(/- (.+)$/);
            const cliente = clienteMatch ? clienteMatch[1] : "Cliente";

            return [
              formatarData(reembolso.data),
              `#${numeroVenda}`,
              cliente,
              formatarMoeda(Math.abs(reembolso.valor)),
            ];
          }),
        ];

        autoTable(doc, {
          startY: yPos,
          head: [reembolsosData[0]],
          body: reembolsosData.slice(1),
          theme: "striped",
          headStyles: { fillColor: [239, 68, 68] },
          margin: { left: 15, right: 15 },
          columnStyles: {
            0: { cellWidth: 40 },
            1: { cellWidth: 30, halign: "center" },
            2: { cellWidth: 60 },
            3: { cellWidth: 30, halign: "right" },
          },
        });

        yPos = (doc as any).lastAutoTable.finalY;
      }

      // ===== REEMBOLSOS DE ORDEM DE SERVIÇO =====
      const reembolsosOS = resumo.devolu_os_reembolso?.lista || [];

      if (reembolsosOS && reembolsosOS.length > 0) {
        if (yPos > 245) {
          doc.addPage();
          yPos = 20;
        } else {
          yPos += 15;
        }

        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.setFillColor(220, 38, 38);
        doc.rect(15, yPos - 5, pageWidth - 30, 9, "F");
        doc.setTextColor(255, 255, 255);
        doc.text("REEMBOLSOS DE ORDEM DE SERVIÇO", pageWidth / 2, yPos, {
          align: "center",
        });
        doc.setTextColor(0, 0, 0);
        yPos += 10;

        const reembolsosOSData = [
          ["Data/Hora", "OS", "Cliente", "Valor Reembolsado"],
          ...reembolsosOS.map((dev: any) => [
            formatarData(dev.criado_em),
            `#${dev.ordem_servico?.numero_os || "N/A"}`,
            dev.ordem_servico?.cliente_nome || "Cliente",
            formatarMoeda(dev.valor_total),
          ]),
        ];

        autoTable(doc, {
          startY: yPos,
          head: [reembolsosOSData[0]],
          body: reembolsosOSData.slice(1),
          theme: "striped",
          headStyles: { fillColor: [220, 38, 38] },
          margin: { left: 15, right: 15 },
          columnStyles: {
            0: { cellWidth: 40 },
            1: { cellWidth: 30, halign: "center" },
            2: { cellWidth: 60 },
            3: { cellWidth: 30, halign: "right" },
          },
        });

        yPos = (doc as any).lastAutoTable.finalY;
      }
    }

    // Rodapé
    const pageCount = doc.getNumberOfPages();

    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);

      // Logo (caso exista)
      try {
        const logoImg = new Image();

        logoImg.src = "/logo.png";
        // Adicionar logo no rodapé (esquerda)
        doc.addImage(
          logoImg,
          "PNG",
          15,
          doc.internal.pageSize.height - 20,
          15,
          15,
        );
      } catch (error) {
        console.log("Logo não encontrado");
      }

      // Texto do rodapé (centro)
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text(
        `Página ${i} de ${pageCount} - Gerado em ${new Date().toLocaleString("pt-BR")}`,
        pageWidth / 2,
        doc.internal.pageSize.height - 10,
        { align: "center" },
      );
    }

    // Visualizar PDF em nova aba
    const pdfBlob = doc.output("blob");
    const pdfUrl = URL.createObjectURL(pdfBlob);

    window.open(pdfUrl, "_blank");

    toast.success("PDF aberto em nova aba!");
  };

  // Verificar loading primeiro
  // Chips de filtros ativos do Histórico
  const chipsHistorico: { key: string; label: string; onRemove: () => void }[] =
    [];

  if (lojaFiltroHistorico !== "todos") {
    const lojaNome =
      lojas.find((l) => String(l.id) === lojaFiltroHistorico)?.nome ||
      lojaFiltroHistorico;

    chipsHistorico.push({
      key: "loja",
      label: `Loja: ${lojaNome}`,
      onRemove: () => setLojaFiltroHistorico("todos"),
    });
  }

  if (dataInicioHistorico || dataFimHistorico) {
    chipsHistorico.push({
      key: "periodo",
      label: `Período: ${dataInicioHistorico || "…"} → ${dataFimHistorico || "…"}`,
      onRemove: () => {
        setDataInicioHistorico("");
        setDataFimHistorico("");
      },
    });
  }

  const limparHistorico = () => {
    setLojaFiltroHistorico("todos");
    setDataInicioHistorico("");
    setDataFimHistorico("");
  };

  if (loading || loadingPermissoes) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  // Verificar permissão de visualizar
  if (!temPermissao("caixa.visualizar")) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold text-danger mb-4">Acesso Negado</h1>
        <p className="text-default-500">
          Você não tem permissão para visualizar o caixa.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1600px] p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Controle de Caixa
          </h1>
          <p className="text-sm text-default-500">
            Gerencie abertura e fechamento do caixa de cada loja
          </p>
        </div>
        <div className="flex flex-row gap-2 w-full sm:w-auto justify-start sm:justify-end">
          <Button
            isIconOnly
            className="sm:hidden"
            color="primary"
            isLoading={loading}
            size="lg"
            variant="flat"
            onPress={() => {
              if (abaAtiva === "caixas") {
                carregarLojas();
              } else {
                carregarHistorico();
              }
            }}
          >
            <ArrowPathIcon className="w-5 h-5" />
          </Button>
          <Button
            className="hidden sm:flex"
            color="primary"
            isLoading={loading}
            size="lg"
            startContent={<ArrowPathIcon className="w-5 h-5" />}
            variant="flat"
            onPress={() => {
              if (abaAtiva === "caixas") {
                carregarLojas();
              } else {
                carregarHistorico();
              }
            }}
          >
            Atualizar
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        classNames={{
          tabList: "gap-6",
        }}
        selectedKey={abaAtiva}
        variant="underlined"
        onSelectionChange={(key) => setAbaAtiva(key as string)}
      >
        <Tab
          key="caixas"
          title={
            <div className="flex items-center gap-2">
              <BuildingStorefrontIcon className="w-4 h-4" />
              <span>Caixas Atuais</span>
            </div>
          }
        >
          {/* Cards das Lojas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {lojas.map((loja) => (
              <Card
                key={loja.id}
                className="border border-default-200/70"
                shadow="sm"
              >
                <CardHeader>
                  <div className="flex justify-between items-center w-full">
                    <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
                      <BuildingStorefrontIcon className="w-4 h-4 text-default-500" />
                      {loja.nome}
                    </h2>
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-default-600">
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          loja.caixa ? "bg-emerald-500" : "bg-default-400"
                        }`}
                      />
                      {loja.caixa ? "Aberto" : "Fechado"}
                    </span>
                  </div>
                </CardHeader>
                <CardBody>
                  {loja.caixa ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs text-default-500 flex items-center gap-1">
                            <CalendarIcon className="w-3 h-3" />
                            Abertura
                          </p>
                          <p className="text-sm font-semibold">
                            {
                              formatarData(loja.caixa.data_abertura).split(
                                ",",
                              )[1]
                            }
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-default-500 flex items-center gap-1">
                            <ClockIcon className="w-3 h-3" />
                            Duração
                          </p>
                          <p className="text-sm font-semibold">
                            {calcularDuracao(loja.caixa.data_abertura)}
                          </p>
                        </div>
                      </div>

                      <div>
                        <p className="text-xs text-default-500 flex items-center gap-1">
                          <UserIcon className="w-3 h-3" />
                          Responsável
                        </p>
                        <p className="text-sm font-semibold">
                          {loja.caixa.usuario_abertura_info?.nome}
                        </p>
                      </div>

                      <div className="rounded-lg border border-default-200 bg-default-50 p-3 dark:border-default-100/20 dark:bg-default-100/5">
                        <p className="text-xs text-default-500">
                          Saldo Inicial
                        </p>
                        <p className="text-2xl font-bold tabular-nums text-foreground">
                          {formatarMoeda(loja.caixa.saldo_inicial)}
                        </p>
                      </div>

                      {loja.caixa.observacoes_abertura && (
                        <div className="text-xs bg-default-100 p-2 rounded border border-default-200">
                          <p className="font-semibold mb-1 text-default-700">
                            Observações:
                          </p>
                          <p className="text-default-600">
                            {loja.caixa.observacoes_abertura}
                          </p>
                        </div>
                      )}

                      <div className="grid grid-cols-3 gap-2">
                        {temPermissao("caixa.visualizar_movimentacoes") && (
                          <Button
                            color="primary"
                            size="sm"
                            startContent={<EyeIcon className="w-4 h-4" />}
                            variant="flat"
                            onPress={() => handleVerDetalhes(loja.caixa!)}
                          >
                            Detalhes
                          </Button>
                        )}
                        <Button
                          color="warning"
                          size="sm"
                          startContent={
                            <ArrowTrendingDownIcon className="w-4 h-4" />
                          }
                          variant="flat"
                          onPress={() => handleSangria(loja)}
                        >
                          Sangria
                        </Button>
                        {temPermissao("caixa.fechar") && (
                          <Button
                            color="danger"
                            size="sm"
                            startContent={
                              <LockClosedIcon className="w-4 h-4" />
                            }
                            variant="flat"
                            onPress={() => handleFecharModal(loja)}
                          >
                            Fechar
                          </Button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="text-center py-6">
                        <LockClosedIcon className="w-12 h-12 mx-auto text-default-400 mb-2" />
                        <p className="text-default-600 text-sm">
                          Caixa fechado
                        </p>
                        <p className="text-xs text-default-500 mt-1">
                          Abra o caixa para iniciar as operações
                        </p>
                      </div>

                      {temPermissao("caixa.abrir") && (
                        <Button
                          className="w-full"
                          color="success"
                          startContent={<LockOpenIcon className="w-4 h-4" />}
                          onPress={() => handleAbrirModal(loja)}
                        >
                          Abrir Caixa
                        </Button>
                      )}
                    </div>
                  )}
                </CardBody>
              </Card>
            ))}
          </div>
        </Tab>

        <Tab
          key="historico"
          title={
            <div className="flex items-center gap-2">
              <ClockIcon className="w-4 h-4" />
              <span>Histórico</span>
            </div>
          }
        >
          {/* Barra de filtros */}
          <div className="mt-6 rounded-xl border border-default-200/70 bg-content1 p-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm text-default-500 tabular-nums">
                {resumoHistorico.totalCaixas.toLocaleString("pt-BR")} caixa(s)
              </span>
              <Badge
                color="primary"
                content={chipsHistorico.length}
                isInvisible={chipsHistorico.length === 0}
                size="sm"
              >
                <Button
                  radius="md"
                  size="md"
                  startContent={<FunnelIcon className="h-4 w-4" />}
                  variant="flat"
                  onPress={() => setFiltrosHistoricoAbertos(true)}
                >
                  Filtros
                </Button>
              </Badge>
            </div>

            {/* Chips de filtros ativos */}
            {chipsHistorico.length > 0 && (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {chipsHistorico.map((chip) => (
                  <Chip
                    key={chip.key}
                    size="sm"
                    variant="flat"
                    onClose={chip.onRemove}
                  >
                    {chip.label}
                  </Chip>
                ))}
                <Button
                  className="h-7 px-2 text-xs text-default-500"
                  size="sm"
                  variant="light"
                  onPress={limparHistorico}
                >
                  Limpar tudo
                </Button>
              </div>
            )}
          </div>

          {/* Drawer de Filtros (mesmo padrão das demais telas) */}
          <Drawer
            isOpen={filtrosHistoricoAbertos}
            size="sm"
            onOpenChange={setFiltrosHistoricoAbertos}
          >
            <DrawerContent>
              <DrawerHeader className="flex flex-col gap-1">
                Filtros
              </DrawerHeader>
              <DrawerBody className="gap-4">
                <Select
                  items={[
                    { id: "todos", nome: "Todas as lojas" },
                    ...lojas.map((l) => ({
                      id: l.id.toString(),
                      nome: l.nome,
                    })),
                  ]}
                  label="Loja"
                  selectedKeys={[lojaFiltroHistorico]}
                  variant="bordered"
                  onSelectionChange={(keys) =>
                    setLojaFiltroHistorico(
                      (Array.from(keys)[0] as string) || "todos",
                    )
                  }
                >
                  {(loja) => <SelectItem key={loja.id}>{loja.nome}</SelectItem>}
                </Select>

                <Input
                  label="Data Início"
                  type="date"
                  value={dataInicioHistorico}
                  variant="bordered"
                  onChange={(e) => setDataInicioHistorico(e.target.value)}
                />

                <Input
                  label="Data Fim"
                  type="date"
                  value={dataFimHistorico}
                  variant="bordered"
                  onChange={(e) => setDataFimHistorico(e.target.value)}
                />
              </DrawerBody>
              <DrawerFooter>
                <Button variant="flat" onPress={limparHistorico}>
                  Limpar tudo
                </Button>
                <Button
                  color="primary"
                  onPress={() => setFiltrosHistoricoAbertos(false)}
                >
                  Ver resultados
                </Button>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>

          {/* Resumo Estatístico */}
          {resumoHistorico.totalCaixas > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
              <MetricCard
                icon={<CalendarIcon className="h-5 w-5" />}
                label="Total de Caixas"
                value={resumoHistorico.totalCaixas.toLocaleString("pt-BR")}
              />
              <MetricCard
                icon={<ArrowTrendingUpIcon className="h-5 w-5" />}
                label="Saldo Total Inicial"
                value={formatarMoeda(resumoHistorico.totalSaldoInicial)}
              />
              <MetricCard
                icon={<CurrencyDollarIcon className="h-5 w-5" />}
                label="Saldo Total Final"
                value={formatarMoeda(resumoHistorico.totalSaldoFinal)}
              />
              {(() => {
                const diferenca =
                  resumoHistorico.totalSaldoFinal -
                  resumoHistorico.totalSaldoInicial;

                return (
                  <MetricCard
                    emphasis={diferenca !== 0}
                    icon={<ArrowTrendingUpIcon className="h-5 w-5" />}
                    label="Diferença Total"
                    tone={diferenca < 0 ? "danger" : "success"}
                    value={formatarMoeda(diferenca)}
                  />
                );
              })()}
            </div>
          )}

          {/* Tabela de Histórico */}
          <Card className="mt-6">
            <CardBody>
              <Table aria-label="Histórico de caixas">
                <TableHeader>
                  <TableColumn>DATA ABERTURA</TableColumn>
                  <TableColumn>DATA FECHAMENTO</TableColumn>
                  <TableColumn>LOJA</TableColumn>
                  <TableColumn>USUÁRIO ABERTURA</TableColumn>
                  <TableColumn>USUÁRIO FECHAMENTO</TableColumn>
                  <TableColumn>SALDO INICIAL</TableColumn>
                  <TableColumn>SALDO ESPERADO</TableColumn>
                  <TableColumn>AÇÕES</TableColumn>
                </TableHeader>
                <TableBody
                  emptyContent={
                    loading ? "Carregando..." : "Nenhum caixa encontrado"
                  }
                >
                  {historicosPaginados.map((caixa) => {
                    const saldoEsperado =
                      caixa.saldo_esperado !== undefined &&
                      caixa.saldo_esperado !== null
                        ? Number(caixa.saldo_esperado)
                        : 0;

                    return (
                      <TableRow key={caixa.id}>
                        <TableCell>
                          {new Date(caixa.data_abertura).toLocaleString(
                            "pt-BR",
                            {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}
                        </TableCell>
                        <TableCell>
                          {caixa.data_fechamento
                            ? new Date(caixa.data_fechamento).toLocaleString(
                                "pt-BR",
                                {
                                  day: "2-digit",
                                  month: "2-digit",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                },
                              )
                            : "-"}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <BuildingStorefrontIcon className="w-4 h-4 text-default-400" />
                            {caixa.loja?.nome || "-"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <UserIcon className="w-4 h-4 text-default-400" />
                            {caixa.usuario_abertura_info?.nome || "-"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <UserIcon className="w-4 h-4 text-default-400" />
                            {caixa.usuario_fechamento_info?.nome || "-"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium tabular-nums text-default-600">
                            {formatarMoeda(
                              parseFloat(caixa.saldo_inicial.toString()),
                            )}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="font-semibold tabular-nums text-foreground">
                            {formatarMoeda(saldoEsperado)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            startContent={<EyeIcon className="w-4 h-4" />}
                            variant="flat"
                            onPress={() => handleVerDetalhes(caixa)}
                          >
                            Detalhes
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              {historicosCaixa.length > 0 && totalPaginasHistorico > 1 && (
                <div className="flex justify-center mt-4">
                  <Pagination
                    showControls
                    color="primary"
                    page={paginaHistorico}
                    total={totalPaginasHistorico}
                    onChange={setPaginaHistorico}
                  />
                </div>
              )}
            </CardBody>
          </Card>
        </Tab>
      </Tabs>

      {lojas.length === 0 && !loading && (
        <Card>
          <CardBody className="text-center py-12">
            <BuildingStorefrontIcon className="w-16 h-16 mx-auto text-default-400 mb-4" />
            <p className="text-default-600">Nenhuma loja cadastrada</p>
          </CardBody>
        </Card>
      )}

      {/* Modal Abrir Caixa */}
      <Modal
        isOpen={modalAbrirAberto}
        onClose={() => setModalAbrirAberto(false)}
      >
        <ModalContent>
          <ModalHeader>
            <div className="flex items-center gap-2">
              <LockOpenIcon className="text-success" />
              Abrir Caixa - {lojaSelecionada?.nome}
            </div>
          </ModalHeader>
          <ModalBody>
            <Input
              description="Informe o valor em dinheiro no caixa"
              label="Saldo Inicial (Dinheiro em espécie)"
              placeholder="0,00"
              startContent={<CurrencyDollarIcon className="w-4 h-4" />}
              step="0.01"
              type="number"
              value={saldoInicial}
              onChange={(e) => setSaldoInicial(e.target.value)}
            />
            <Textarea
              label="Observações (opcional)"
              maxRows={3}
              placeholder="Ex: Troco do dia anterior, fundo de caixa..."
              value={observacoesAbertura}
              onChange={(e) => setObservacoesAbertura(e.target.value)}
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={() => setModalAbrirAberto(false)}>
              Cancelar
            </Button>
            <Button
              color="success"
              isDisabled={!saldoInicial}
              isLoading={loading}
              onPress={handleAbrirCaixa}
            >
              Abrir Caixa
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal Fechar Caixa */}
      <Modal
        isOpen={modalFecharAberto}
        size="2xl"
        onClose={() => setModalFecharAberto(false)}
      >
        <ModalContent>
          <ModalHeader>
            <div className="flex items-center gap-2">
              <LockClosedIcon className="text-danger" />
              Fechar Caixa - {lojaSelecionada?.nome}
            </div>
          </ModalHeader>
          <ModalBody>
            {lojaSelecionada?.caixa && (
              <div className="bg-default-100 p-4 rounded-lg mb-4 border border-default-200">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-default-600">Saldo Inicial</p>
                    <p className="font-bold text-lg">
                      {formatarMoeda(lojaSelecionada.caixa.saldo_inicial)}
                    </p>
                  </div>
                  <div>
                    <p className="text-default-600">Aberto em</p>
                    <p className="font-semibold">
                      {formatarData(lojaSelecionada.caixa.data_abertura)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <Textarea
              label="Observações do Fechamento (opcional)"
              maxRows={3}
              placeholder="Ex: Diferença devido a troco errado..."
              value={observacoesFechamento}
              onChange={(e) => setObservacoesFechamento(e.target.value)}
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={() => setModalFecharAberto(false)}>
              Cancelar
            </Button>
            <Button
              color="danger"
              isLoading={loading}
              onPress={handleFecharCaixa}
            >
              Fechar Caixa
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal Detalhes */}
      <Modal
        isOpen={modalDetalhesAberto}
        scrollBehavior="inside"
        size="5xl"
        onClose={() => setModalDetalhesAberto(false)}
      >
        <ModalContent>
          <ModalHeader>
            <div className="flex items-center gap-2">
              <EyeIcon className="w-5 h-5" />
              Detalhes do Caixa - {caixaDetalhes?.loja?.nome}
            </div>
          </ModalHeader>
          <ModalBody>
            {resumo && (
              <div className="space-y-6">
                {/* Resumo Geral */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {(() => {
                    const temPermAparelhos = temPermissao(
                      "caixa.ver_aparelhos",
                    );
                    const aparelhosTotal = resumo.vendas_aparelhos?.total || 0;
                    const entradasExibir = temPermAparelhos
                      ? resumo.total_entradas
                      : resumo.total_entradas - aparelhosTotal;
                    const saldoEsperadoExibir = temPermAparelhos
                      ? resumo.saldo_esperado
                      : resumo.saldo_esperado - aparelhosTotal;

                    return (
                      <>
                        <Card>
                          <CardBody>
                            <p className="text-xs text-default-500 mb-1">
                              Saldo Inicial
                            </p>
                            <p className="text-xl font-bold">
                              {formatarMoeda(resumo.saldo_inicial)}
                            </p>
                          </CardBody>
                        </Card>
                        <Card className="bg-success/10 border border-success/20">
                          <CardBody>
                            <p className="text-xs text-default-500 mb-1">
                              Total Entradas
                            </p>
                            <p className="text-xl font-bold text-success">
                              {formatarMoeda(entradasExibir)}
                            </p>
                            <div className="flex flex-col gap-0.5 mt-1.5 text-[11px] leading-tight">
                              <span className="text-default-500">
                                Vendas:{" "}
                                <strong className="text-success/80">
                                  {formatarMoeda(resumo.vendas.total)}
                                </strong>
                                {resumo.vendas_acessorios?.total > 0 && (
                                  <>
                                    {" "}
                                    · Acessórios:{" "}
                                    <strong className="text-success/80">
                                      {formatarMoeda(
                                        resumo.vendas_acessorios.total,
                                      )}
                                    </strong>
                                  </>
                                )}
                                {resumo.vendas_aparelhos.quantidade > 0 &&
                                  temPermAparelhos && (
                                    <>
                                      {" "}
                                      · Aparelhos:{" "}
                                      <strong className="text-success/80">
                                        {formatarMoeda(
                                          resumo.vendas_aparelhos.total,
                                        )}
                                      </strong>
                                    </>
                                  )}
                              </span>
                              <span className="text-default-500">
                                OS:{" "}
                                <strong className="text-success/80">
                                  {formatarMoeda(resumo.ordens_servico.total)}
                                </strong>
                              </span>
                            </div>
                          </CardBody>
                        </Card>
                        <Card className="bg-danger/10 border border-danger/20">
                          <CardBody>
                            <p className="text-xs text-default-500 mb-1">
                              Total Saídas
                            </p>
                            <p className="text-xl font-bold text-danger">
                              {formatarMoeda(resumo.total_saidas)}
                            </p>
                          </CardBody>
                        </Card>
                        <Card className="bg-secondary/10 border border-secondary/20">
                          <CardBody>
                            <p className="text-xs text-default-500 mb-1">
                              Saldo Movimentado
                            </p>
                            <p className="text-xl font-bold text-secondary">
                              {formatarMoeda(
                                entradasExibir - resumo.total_saidas,
                              )}
                            </p>
                          </CardBody>
                        </Card>
                        <Card className="bg-primary/10 border border-primary/20">
                          <CardBody>
                            <p className="text-xs text-default-500 mb-1">
                              Saldo Esperado
                            </p>
                            <p className="text-xl font-bold text-primary">
                              {formatarMoeda(saldoEsperadoExibir)}
                            </p>
                          </CardBody>
                        </Card>

                        {/* Total Geral do Caixa */}
                        <Card className="col-span-2 border border-default-200 bg-default-50 dark:border-default-100/20 dark:bg-default-100/5">
                          <CardBody>
                            <div className="flex items-center gap-2 mb-1">
                              <CurrencyDollarIcon className="w-5 h-5 text-default-500" />
                              <p className="text-sm text-default-700 font-semibold">
                                TOTAL GERAL DO CAIXA
                              </p>
                            </div>
                            <p className="text-2xl font-bold tabular-nums text-foreground">
                              {formatarMoeda(
                                resumo.saldo_inicial +
                                  entradasExibir -
                                  resumo.total_saidas,
                              )}
                            </p>
                            <p className="text-xs text-default-500 mt-1">
                              Saldo Inicial + Entradas - Saídas
                            </p>
                          </CardBody>
                        </Card>
                      </>
                    );
                  })()}
                </div>

                {/* Vendas */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <ShoppingCartIcon className="w-5 h-5" />
                      <span className="font-bold">
                        Vendas ({resumo.vendas.quantidade})
                      </span>
                      <span className="text-success font-bold ml-auto">
                        {formatarMoeda(resumo.vendas.total)}
                      </span>
                    </div>
                  </CardHeader>
                  <CardBody>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {Object.entries(resumo.vendas.por_forma_pagamento).map(
                        ([forma, valor]) => (
                          <div
                            key={forma}
                            className="bg-default-100 p-3 rounded border border-default-200"
                          >
                            <p className="text-xs text-default-600 capitalize">
                              {forma.replace("_", " ")}
                            </p>
                            <p className="font-bold">
                              {formatarMoeda(valor as number)}
                            </p>
                          </div>
                        ),
                      )}
                    </div>
                  </CardBody>
                </Card>

                {/* Vendas de Aparelhos */}
                {resumo.vendas_aparelhos.quantidade > 0 &&
                  temPermissao("caixa.ver_aparelhos") && (
                    <Card className="border-primary/30">
                      <CardHeader>
                        <div className="flex items-center gap-2">
                          <DevicePhoneMobileIcon className="w-5 h-5 text-primary" />
                          <span className="font-bold">
                            Vendas de Aparelhos (
                            {resumo.vendas_aparelhos.quantidade})
                          </span>
                          <span className="text-success font-bold ml-auto">
                            {formatarMoeda(resumo.vendas_aparelhos.total)}
                          </span>
                        </div>
                      </CardHeader>
                      <CardBody>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {Object.entries(
                            resumo.vendas_aparelhos.por_forma_pagamento,
                          ).map(([forma, valor]) => (
                            <div
                              key={forma}
                              className="bg-primary/5 p-3 rounded border border-primary/20"
                            >
                              <p className="text-xs text-default-600 capitalize">
                                {forma.replace("_", " ")}
                              </p>
                              <p className="font-bold">
                                {formatarMoeda(valor as number)}
                              </p>
                            </div>
                          ))}
                        </div>
                      </CardBody>
                    </Card>
                  )}

                {/* Vendas de Acessórios */}
                {resumo.vendas_acessorios?.total > 0 && (
                  <Card className="border-warning/30">
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <CubeIcon className="w-5 h-5 text-warning" />
                        <span className="font-bold">
                          Vendas de Acessórios (
                          {resumo.vendas_acessorios.quantidade})
                        </span>
                        <span className="text-success font-bold ml-auto">
                          {formatarMoeda(resumo.vendas_acessorios.total)}
                        </span>
                      </div>
                    </CardHeader>
                  </Card>
                )}

                {/* Ordens de Serviço */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <WrenchScrewdriverIcon className="w-5 h-5" />
                      <span className="font-bold">
                        Ordens de Serviço ({resumo.ordens_servico.quantidade})
                      </span>
                      <span className="text-success font-bold ml-auto">
                        {formatarMoeda(resumo.ordens_servico.total)}
                      </span>
                    </div>
                  </CardHeader>
                  <CardBody>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {Object.entries(
                        resumo.ordens_servico.por_forma_pagamento,
                      ).map(([forma, valor]) => (
                        <div
                          key={forma}
                          className="bg-default-100 p-3 rounded border border-default-200"
                        >
                          <p className="text-xs text-default-600 capitalize">
                            {forma.replace("_", " ")}
                          </p>
                          <p className="font-bold">
                            {formatarMoeda(valor as number)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardBody>
                </Card>

                {/* Devoluções, Sangrias e OS */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <CubeIcon className="w-5 h-5 text-warning" />
                        <span className="font-bold">
                          Devoluções c/ Crédito (
                          {resumo.devolucoes_com_credito.quantidade})
                        </span>
                      </div>
                    </CardHeader>
                    <CardBody>
                      <p className="text-2xl font-bold text-warning">
                        {formatarMoeda(resumo.devolucoes_com_credito.total)}
                      </p>
                    </CardBody>
                  </Card>

                  <Card>
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <CubeIcon className="w-5 h-5 text-danger" />
                        <span className="font-bold">
                          Devoluções s/ Crédito (
                          {resumo.devolucoes_sem_credito.quantidade})
                        </span>
                      </div>
                    </CardHeader>
                    <CardBody>
                      <p className="text-2xl font-bold text-danger">
                        {formatarMoeda(resumo.devolucoes_sem_credito.total)}
                      </p>
                    </CardBody>
                  </Card>

                  <Card className="bg-danger/10 border border-danger/20">
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <ArrowTrendingDownIcon className="w-5 h-5 text-danger" />
                        <span className="font-bold">
                          Sangrias ({resumo.sangrias.quantidade})
                        </span>
                      </div>
                    </CardHeader>
                    <CardBody>
                      <p className="text-2xl font-bold text-danger">
                        {formatarMoeda(resumo.sangrias.total)}
                      </p>
                    </CardBody>
                  </Card>

                  <Card className="bg-danger/10 border border-danger/20">
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <ExclamationTriangleIcon className="w-5 h-5 text-danger" />
                        <span className="font-bold">
                          Quebras ({resumo.quebras.quantidade})
                        </span>
                      </div>
                    </CardHeader>
                    <CardBody>
                      <p className="text-2xl font-bold text-danger">
                        {formatarMoeda(resumo.quebras.total)}
                      </p>
                    </CardBody>
                  </Card>

                  <Card>
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <WrenchScrewdriverIcon className="w-5 h-5" />
                        <span className="font-bold">
                          Ordens de Serviço ({resumo.ordens_servico.quantidade})
                        </span>
                      </div>
                    </CardHeader>
                    <CardBody>
                      <p className="text-2xl font-bold text-success">
                        {formatarMoeda(resumo.ordens_servico.total)}
                      </p>
                    </CardBody>
                  </Card>

                  <Card className="bg-primary/10 border border-primary/20">
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <GiftIcon className="w-5 h-5 text-primary" />
                        <span className="font-bold">Crédito do Cliente</span>
                      </div>
                    </CardHeader>
                    <CardBody>
                      <div>
                        <p className="text-xs text-default-600 mb-2">
                          Vendas com Crédito do Cliente
                        </p>
                        <p className="text-2xl font-bold text-primary">
                          {(() => {
                            const credito = vendasDetalhadas["credito_cliente"];
                            const total = credito?.total || 0;

                            return formatarMoeda(total);
                          })()}
                        </p>
                        <p className="text-xs text-default-500 mt-1">
                          {(() => {
                            const vendas =
                              vendasDetalhadas["credito_cliente"]?.vendas || [];

                            return vendas.length;
                          })()}{" "}
                          {(() => {
                            const vendas =
                              vendasDetalhadas["credito_cliente"]?.vendas || [];

                            return vendas.length === 1 ? "venda" : "vendas";
                          })()}
                        </p>
                      </div>
                    </CardBody>
                  </Card>

                  {/* Devoluções de OS com Reembolso */}
                  {resumo.devolu_os_reembolso &&
                    resumo.devolu_os_reembolso.quantidade > 0 && (
                      <Card className="bg-danger/10 border border-danger/20">
                        <CardHeader>
                          <div className="flex items-center gap-2">
                            <ArrowPathIcon className="w-5 h-5 text-danger" />
                            <span className="font-bold">
                              OS Reembolso (
                              {resumo.devolu_os_reembolso.quantidade})
                            </span>
                          </div>
                        </CardHeader>
                        <CardBody>
                          <p className="text-2xl font-bold text-danger">
                            {formatarMoeda(resumo.devolu_os_reembolso.total)}
                          </p>
                        </CardBody>
                      </Card>
                    )}

                  {/* Devoluções de OS com Crédito */}
                  {resumo.devolu_os_credito &&
                    resumo.devolu_os_credito.quantidade > 0 && (
                      <Card className="bg-warning/10 border border-warning/20">
                        <CardHeader>
                          <div className="flex items-center gap-2">
                            <GiftIcon className="w-5 h-5 text-warning" />
                            <span className="font-bold">
                              OS Crédito ({resumo.devolu_os_credito.quantidade})
                            </span>
                          </div>
                        </CardHeader>
                        <CardBody>
                          <p className="text-2xl font-bold text-warning">
                            {formatarMoeda(resumo.devolu_os_credito.total)}
                          </p>
                        </CardBody>
                      </Card>
                    )}
                </div>

                {/* Nova seção: Vendas Detalhadas por Forma de Pagamento */}
                {Object.keys(vendasDetalhadas).length > 0 && (
                  <Card className="border border-default-200/70 dark:border-default-100/20">
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <ShoppingCartIcon className="w-5 h-5 text-default-500" />
                        <span className="font-bold text-lg">
                          Vendas Detalhadas por Forma de Pagamento
                        </span>
                      </div>
                    </CardHeader>
                    <CardBody>
                      <Tabs aria-label="Formas de pagamento" color="primary">
                        {Object.entries(vendasDetalhadas).map(
                          ([formaPagamento, dados]: [string, any]) => {
                            const nomesFormasPagamento: {
                              [key: string]: { label: string; icon: any };
                            } = {
                              dinheiro: {
                                label: "DINHEIRO",
                                icon: BanknotesIcon,
                              },
                              pix: {
                                label: "PIX",
                                icon: DevicePhoneMobileIcon,
                              },
                              credito: {
                                label: "CRÉDITO",
                                icon: CreditCardIcon,
                              },
                              debito: { label: "DÉBITO", icon: CreditCardIcon },
                              credito_cliente: {
                                label: "CRÉDITO CLIENTE",
                                icon: GiftIcon,
                              },
                              nao_informado: {
                                label: "NÃO INFORMADO",
                                icon: QuestionMarkCircleIcon,
                              },
                            };

                            return (
                              <Tab
                                key={formaPagamento}
                                title={
                                  <div className="flex items-center gap-2">
                                    {nomesFormasPagamento[formaPagamento] ? (
                                      <>
                                        {React.createElement(
                                          nomesFormasPagamento[formaPagamento]
                                            .icon,
                                          { className: "w-4 h-4" },
                                        )}
                                        <span>
                                          {
                                            nomesFormasPagamento[formaPagamento]
                                              .label
                                          }
                                        </span>
                                      </>
                                    ) : (
                                      <span>
                                        {formaPagamento.toUpperCase()}
                                      </span>
                                    )}
                                    <Chip color="success" size="sm">
                                      {formatarMoeda(dados.total)}
                                    </Chip>
                                  </div>
                                }
                              >
                                <Card className="mt-4">
                                  <CardBody>
                                    <div className="mb-4 flex justify-between items-center">
                                      <p className="text-sm text-default-600">
                                        Total de {dados.vendas.length} venda(s)
                                      </p>
                                      <p className="text-xl font-bold text-success">
                                        {formatarMoeda(dados.total)}
                                      </p>
                                    </div>
                                    <Table aria-label="Vendas detalhadas">
                                      <TableHeader>
                                        <TableColumn>HORA</TableColumn>
                                        <TableColumn>VENDA</TableColumn>
                                        <TableColumn>CLIENTE</TableColumn>
                                        <TableColumn align="end">
                                          VALOR
                                        </TableColumn>
                                      </TableHeader>
                                      <TableBody>
                                        {dados.vendas.map(
                                          (venda: any, idx: number) => (
                                            <TableRow key={idx}>
                                              <TableCell>
                                                <span className="text-sm font-mono">
                                                  {venda.hora}
                                                </span>
                                              </TableCell>
                                              <TableCell>
                                                <Chip
                                                  color="primary"
                                                  size="sm"
                                                  variant="flat"
                                                >
                                                  #{venda.numero_venda}
                                                </Chip>
                                              </TableCell>
                                              <TableCell>
                                                <div>
                                                  <p className="text-sm font-medium">
                                                    {venda.cliente_nome}
                                                  </p>
                                                  {venda.cliente_cpf && (
                                                    <p className="text-xs text-default-400">
                                                      {venda.cliente_cpf}
                                                    </p>
                                                  )}
                                                </div>
                                              </TableCell>
                                              <TableCell>
                                                <span className="font-semibold text-success">
                                                  {formatarMoeda(
                                                    venda.valor_pago,
                                                  )}
                                                </span>
                                              </TableCell>
                                            </TableRow>
                                          ),
                                        )}
                                      </TableBody>
                                    </Table>
                                  </CardBody>
                                </Card>
                              </Tab>
                            );
                          },
                        )}
                      </Tabs>
                    </CardBody>
                  </Card>
                )}

                {/* Ordens de Serviço Devolvidas com Crédito */}
                {resumo.os_devolvidas_com_credito &&
                  resumo.os_devolvidas_com_credito.quantidade > 0 && (
                    <Card className="border border-default-200/70 dark:border-default-100/20">
                      <CardHeader>
                        <div className="flex items-center gap-2">
                          <WrenchScrewdriverIcon className="w-5 h-5 text-default-500" />
                          <span className="font-bold text-lg">
                            OS Devolvidas com Crédito (
                            {resumo.os_devolvidas_com_credito.quantidade})
                          </span>
                          <span className="text-warning font-bold ml-auto">
                            {formatarMoeda(
                              resumo.os_devolvidas_com_credito.total,
                            )}
                          </span>
                        </div>
                      </CardHeader>
                      <CardBody>
                        <Table aria-label="OS devolvidas com crédito">
                          <TableHeader>
                            <TableColumn>DATA</TableColumn>
                            <TableColumn>OS</TableColumn>
                            <TableColumn>CLIENTE</TableColumn>
                            <TableColumn align="end">VALOR</TableColumn>
                          </TableHeader>
                          <TableBody>
                            {(
                              resumo.os_devolvidas_com_credito?.lista || []
                            ).map((os: any, idx: number) => (
                              <TableRow key={idx}>
                                <TableCell>
                                  <span className="text-sm font-mono">
                                    {formatarData(os.criado_em)}
                                  </span>
                                </TableCell>
                                <TableCell>
                                  <Chip
                                    color="warning"
                                    size="sm"
                                    variant="flat"
                                  >
                                    #{os.numero_os}
                                  </Chip>
                                </TableCell>
                                <TableCell>
                                  <span className="text-sm font-medium">
                                    {os.cliente_nome}
                                  </span>
                                </TableCell>
                                <TableCell>
                                  <span className="font-semibold text-warning">
                                    {formatarMoeda(os.valor_total)}
                                  </span>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardBody>
                    </Card>
                  )}

                {/* Movimentações */}
                <Card>
                  <CardHeader>
                    <h3 className="font-bold">Movimentações Detalhadas</h3>
                  </CardHeader>
                  <CardBody>
                    <Table aria-label="Movimentações" className="min-w-full">
                      <TableHeader>
                        <TableColumn width="15%">TIPO</TableColumn>
                        <TableColumn width="30%">DESCRIÇÃO</TableColumn>
                        <TableColumn width="40%">PAGAMENTOS</TableColumn>
                        <TableColumn align="end" width="15%">
                          VALOR TOTAL
                        </TableColumn>
                      </TableHeader>
                      <TableBody>
                        {movimentacoes.map((mov: any, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              <div className="flex gap-1 flex-wrap">
                                <Chip
                                  color={
                                    mov.tipo === "venda"
                                      ? "success"
                                      : mov.tipo === "devolucao"
                                        ? "danger"
                                        : mov.tipo === "sangria"
                                          ? "warning"
                                          : mov.tipo === "quebra"
                                            ? "danger"
                                            : "primary"
                                  }
                                  size="sm"
                                  variant="flat"
                                >
                                  {mov.tipo === "venda"
                                    ? "Venda"
                                    : mov.tipo === "devolucao"
                                      ? "Devolução"
                                      : mov.tipo === "sangria"
                                        ? "Sangria"
                                        : mov.tipo === "quebra"
                                          ? "Quebra"
                                          : "OS"}
                                </Chip>
                                {mov.gerou_credito && (
                                  <Chip
                                    color="warning"
                                    size="sm"
                                    variant="flat"
                                  >
                                    Gerou Crédito
                                  </Chip>
                                )}
                                {mov.tipo === "devolucao" &&
                                  mov.forma_pagamento && (
                                    <Chip
                                      color="primary"
                                      size="sm"
                                      startContent={
                                        mov.forma_pagamento === "dinheiro" ? (
                                          <BanknotesIcon className="w-3 h-3" />
                                        ) : mov.forma_pagamento === "pix" ? (
                                          <DevicePhoneMobileIcon className="w-3 h-3" />
                                        ) : mov.forma_pagamento === "debito" ? (
                                          <CreditCardIcon className="w-3 h-3" />
                                        ) : mov.forma_pagamento ===
                                          "credito" ? (
                                          <CreditCardIcon className="w-3 h-3" />
                                        ) : mov.forma_pagamento ===
                                          "credito_loja" ? (
                                          <GiftIcon className="w-3 h-3" />
                                        ) : undefined
                                      }
                                      variant="flat"
                                    >
                                      {mov.forma_pagamento === "dinheiro" &&
                                        "Dinheiro"}
                                      {mov.forma_pagamento === "pix" && "PIX"}
                                      {mov.forma_pagamento === "debito" &&
                                        "Débito"}
                                      {mov.forma_pagamento === "credito" &&
                                        "Crédito"}
                                      {mov.forma_pagamento === "credito_loja" &&
                                        "Crédito Loja"}
                                    </Chip>
                                  )}
                                {mov.eh_credito_cliente && (
                                  <Chip
                                    color="secondary"
                                    size="sm"
                                    startContent={
                                      <GiftIcon className="w-3 h-3" />
                                    }
                                    variant="flat"
                                  >
                                    Usou Crédito (não soma no caixa)
                                  </Chip>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="text-sm">{mov.descricao}</p>
                                <p className="text-xs text-default-500">
                                  {formatarData(mov.data)}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              {mov.pagamentos ? (
                                <div className="flex flex-wrap gap-1">
                                  {mov.pagamentos.map(
                                    (pag: any, idx: number) => (
                                      <Chip key={idx} size="sm" variant="flat">
                                        <span className="capitalize">
                                          {(
                                            pag.tipo_pagamento || pag.forma
                                          )?.replace("_", " ")}
                                          : {formatarMoeda(pag.valor)}
                                        </span>
                                      </Chip>
                                    ),
                                  )}
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <span className="text-sm capitalize">
                                    {mov.forma_pagamento?.replace("_", " ") ||
                                      "-"}
                                  </span>
                                  {mov.eh_credito_cliente && (
                                    <Chip
                                      color="warning"
                                      size="sm"
                                      startContent={
                                        <ExclamationTriangleIcon className="w-3 h-3" />
                                      }
                                      variant="flat"
                                    >
                                      Não soma no caixa
                                    </Chip>
                                  )}
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              <span
                                className={`font-semibold ${
                                  mov.gerou_credito
                                    ? "text-warning"
                                    : mov.tipo === "sangria" ||
                                        mov.tipo === "quebra"
                                      ? "text-danger"
                                      : (mov.valor_total || mov.valor) >= 0
                                        ? "text-success"
                                        : "text-danger"
                                }`}
                              >
                                {formatarMoeda(
                                  Math.abs(mov.valor_total || mov.valor),
                                )}
                              </span>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardBody>
                </Card>

                {/* Diferença (se caixa fechado) */}
                {resumo.diferenca !== undefined && (
                  <Card
                    className={
                      resumo.diferenca === 0
                        ? "bg-success/10 border-2 border-success"
                        : "bg-warning/10 border-2 border-warning"
                    }
                  >
                    <CardBody>
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm text-default-600">
                            Saldo Informado
                          </p>
                          <p className="text-2xl font-bold">
                            {formatarMoeda(resumo.saldo_informado || 0)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-default-600">Diferença</p>
                          <p
                            className={`text-2xl font-bold ${
                              resumo.diferenca === 0
                                ? "text-success"
                                : resumo.diferenca! > 0
                                  ? "text-success"
                                  : "text-danger"
                            }`}
                          >
                            {resumo.diferenca! >= 0 ? "+" : ""}
                            {formatarMoeda(resumo.diferenca)}
                          </p>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                )}
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            {temPermissao("caixa.ver_aparelhos") && (
              <Button
                color="success"
                startContent={<DevicePhoneMobileIcon className="w-4 h-4" />}
                onPress={() => gerarPDFCaixa("aparelhos")}
              >
                Relatório Aparelhos
              </Button>
            )}
            <Button
              color="primary"
              startContent={<ShoppingCartIcon className="w-4 h-4" />}
              onPress={() => gerarPDFCaixa("outros")}
            >
              Relatório Demais Vendas
            </Button>
            <Button onPress={() => setModalDetalhesAberto(false)}>
              Fechar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal Sangria */}
      <Modal
        isOpen={modalSangriaAberto}
        onClose={() => setModalSangriaAberto(false)}
      >
        <ModalContent>
          <ModalHeader>
            <div className="flex items-center gap-2">
              <ArrowTrendingDownIcon className="text-warning" />
              Registrar Sangria - {lojaSelecionada?.nome}
            </div>
          </ModalHeader>
          <ModalBody>
            <Input
              description="Informe o valor retirado do caixa"
              label="Valor da Sangria *"
              placeholder="0,00"
              startContent={<CurrencyDollarIcon className="w-4 h-4" />}
              step="0.01"
              type="number"
              value={valorSangria}
              onChange={(e) => setValorSangria(e.target.value)}
            />
            <Textarea
              isRequired
              label="Motivo *"
              maxRows={3}
              placeholder="Ex: Pagamento fornecedor, Despesa, Troco banco..."
              value={motivoSangria}
              onChange={(e) => setMotivoSangria(e.target.value)}
            />
          </ModalBody>
          <ModalFooter>
            <Button
              variant="light"
              onPress={() => setModalSangriaAberto(false)}
            >
              Cancelar
            </Button>
            <Button
              color="warning"
              isDisabled={!valorSangria || !motivoSangria}
              isLoading={loading}
              onPress={handleRegistrarSangria}
            >
              Registrar Sangria
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
