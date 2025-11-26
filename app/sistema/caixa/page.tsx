"use client";

import { useState, useEffect } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
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
  Divider,
  Tabs,
  Tab,
  Select,
  SelectItem,
} from "@heroui/react";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  User,
  Store,
  Lock,
  Unlock,
  Eye,
  ShoppingCart,
  Package,
  Wrench,
  Clock,
  AlertTriangle,
  History,
  Download,
  ExternalLink,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { CaixaService } from "@/services/caixaService";
import { CaixaCompleto, ResumoCaixa, MovimentacaoCaixa } from "@/types/caixa";
import { supabase } from "@/lib/supabaseClient";
import { usePermissoes } from "@/hooks/usePermissoes";
import { toast } from "sonner";

interface LojaComCaixa {
  id: number;
  nome: string;
  caixa?: CaixaCompleto | null;
}

export default function CaixaPage() {
  const { usuario } = useAuth();
  const { temPermissao, loading: loadingPermissoes } = usePermissoes();

  const [lojas, setLojas] = useState<LojaComCaixa[]>([]);
  const [loading, setLoading] = useState(false);
  const [abaAtiva, setAbaAtiva] = useState("caixas");

  // Histórico
  const [historicosCaixa, setHistoricosCaixa] = useState<CaixaCompleto[]>([]);
  const [lojaFiltroHistorico, setLojaFiltroHistorico] =
    useState<string>("todos");
  const [dataInicioHistorico, setDataInicioHistorico] = useState("");
  const [dataFimHistorico, setDataFimHistorico] = useState("");

  // Modais
  const [modalAbrirAberto, setModalAbrirAberto] = useState(false);
  const [modalFecharAberto, setModalFecharAberto] = useState(false);
  const [modalDetalhesAberto, setModalDetalhesAberto] = useState(false);
  const [modalSangriaAberto, setModalSangriaAberto] = useState(false);

  // Loja selecionada para ação
  const [lojaSelecionada, setLojaSelecionada] = useState<LojaComCaixa | null>(
    null
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
    null
  );

  useEffect(() => {
    carregarLojas();
    carregarHistorico();
  }, []);

  useEffect(() => {
    if (abaAtiva === "historico") {
      carregarHistorico();
    }
  }, [abaAtiva, lojaFiltroHistorico, dataInicioHistorico, dataFimHistorico]);

  const carregarLojas = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("lojas")
        .select("id, nome")
        .eq("ativo", true)
        .order("nome");

      if (error) throw error;

      // Para cada loja, buscar caixa aberto
      const lojasComCaixa = await Promise.all(
        (data || []).map(async (loja) => {
          const caixa = await CaixaService.buscarCaixaAberto(loja.id);
          return {
            ...loja,
            caixa,
          };
        })
      );

      setLojas(lojasComCaixa);
    } catch (error) {
      console.error("Erro ao carregar lojas:", error);
    } finally {
      setLoading(false);
    }
  };

  const carregarHistorico = async () => {
    try {
      setLoading(true);

      const filtros: any = {
        status: "fechado",
      };

      if (lojaFiltroHistorico !== "todos") {
        filtros.loja_id = parseInt(lojaFiltroHistorico);
      }

      if (dataInicioHistorico) {
        filtros.data_inicio = dataInicioHistorico;
      }

      if (dataFimHistorico) {
        filtros.data_fim = dataFimHistorico;
      }

      const historicos = await CaixaService.listarCaixas(filtros);
      setHistoricosCaixa(historicos);
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
    if (!usuario || !lojaSelecionada?.caixa || !saldoFinal) return;

    setLoading(true);
    try {
      await CaixaService.fecharCaixa({
        caixa_id: lojaSelecionada.caixa.id,
        saldo_final: parseFloat(saldoFinal),
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
        "Você não tem permissão para visualizar movimentações do caixa"
      );
      return;
    }
    setLoading(true);
    setCaixaDetalhes(caixa);
    setModalDetalhesAberto(true);

    try {
      const [resumoData, movimentacoesData] = await Promise.all([
        CaixaService.buscarResumoCaixa(caixa.id),
        CaixaService.buscarMovimentacoes(caixa.id),
      ]);

      setResumo(resumoData);

      // Os dados já vêm agrupados do service, apenas formatar para exibição
      const movimentacoesFormatadas = movimentacoesData.map((mov: any) => ({
        ...mov,
        valor_total: mov.valor,
      }));

      setMovimentacoes(movimentacoesFormatadas);
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

  const formatarMoeda = (valor: number) => {
    return valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const formatarData = (data: string | null | undefined) => {
    if (!data) return "N/A";
    const d = data.includes("Z") || data.includes("+") ? data : data + "Z";
    return new Date(d).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const calcularDuracao = (dataAbertura: string) => {
    const abertura =
      dataAbertura.includes("Z") || dataAbertura.includes("+")
        ? new Date(dataAbertura)
        : new Date(dataAbertura + "Z");
    const agora = new Date();
    const diff = agora.getTime() - abertura.getTime();
    const horas = Math.floor(diff / (1000 * 60 * 60));
    const minutos = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${horas}h ${minutos}min`;
  };

  const gerarPDFCaixa = () => {
    if (!caixaDetalhes || !resumo) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;

    // Título
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Relatório de Caixa", pageWidth / 2, 20, { align: "center" });

    // Informações do Caixa
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Loja: ${caixaDetalhes.loja?.nome || "N/A"}`, 15, 35);
    doc.text(
      `Aberto por: ${caixaDetalhes.usuario_abertura_info?.nome || "N/A"}`,
      15,
      42
    );
    doc.text(
      `Data Abertura: ${formatarData(caixaDetalhes.data_abertura)}`,
      15,
      49
    );
    if (caixaDetalhes.data_fechamento) {
      doc.text(
        `Data Fechamento: ${formatarData(caixaDetalhes.data_fechamento)}`,
        15,
        56
      );
      doc.text(
        `Fechado por: ${caixaDetalhes.usuario_fechamento_info?.nome || "N/A"}`,
        15,
        63
      );
    }

    // Resumo Financeiro
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Resumo Financeiro", 15, caixaDetalhes.data_fechamento ? 80 : 73);

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    let yPos = caixaDetalhes.data_fechamento ? 88 : 81;
    doc.text(`Saldo Inicial: ${formatarMoeda(resumo.saldo_inicial)}`, 15, yPos);
    yPos += 7;
    doc.text(
      `Total Entradas: ${formatarMoeda(resumo.total_entradas)}`,
      15,
      yPos
    );
    yPos += 7;
    doc.text(`Total Saídas: ${formatarMoeda(resumo.total_saidas)}`, 15, yPos);
    yPos += 7;
    doc.text(
      `Saldo Movimentado: ${formatarMoeda(resumo.total_entradas - resumo.total_saidas)}`,
      15,
      yPos
    );
    yPos += 7;
    doc.text(
      `Saldo Esperado: ${formatarMoeda(resumo.saldo_esperado)}`,
      15,
      yPos
    );

    if (
      caixaDetalhes.saldo_final !== null &&
      caixaDetalhes.saldo_final !== undefined
    ) {
      yPos += 7;
      doc.text(
        `Saldo Final: ${formatarMoeda(caixaDetalhes.saldo_final)}`,
        15,
        yPos
      );
      yPos += 7;
      const diferenca = caixaDetalhes.saldo_final - resumo.saldo_esperado;
      const diferencaColor = diferenca >= 0 ? [34, 197, 94] : [239, 68, 68];
      doc.setTextColor(diferencaColor[0], diferencaColor[1], diferencaColor[2]);
      doc.text(`Diferença: ${formatarMoeda(diferenca)}`, 15, yPos);
      doc.setTextColor(0, 0, 0);
    }

    // Agrupar movimentações por forma de pagamento
    const vendasPorFormaPagamento: {
      [key: string]: { quantidade: number; total: number };
    } = {};
    movimentacoes.forEach((mov) => {
      if (mov.tipo === "venda" && mov.forma_pagamento) {
        const forma = mov.forma_pagamento;
        if (!vendasPorFormaPagamento[forma]) {
          vendasPorFormaPagamento[forma] = { quantidade: 0, total: 0 };
        }
        vendasPorFormaPagamento[forma].quantidade++;
        vendasPorFormaPagamento[forma].total += mov.valor || 0;
      }
    });

    // Detalhamento por Forma de Pagamento
    if (Object.keys(vendasPorFormaPagamento).length > 0) {
      yPos += 15;
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Vendas por Forma de Pagamento", 15, yPos);

      yPos += 8;
      const formasPagamentoData = [
        ["Forma de Pagamento", "Quantidade", "Total"],
        ...Object.entries(vendasPorFormaPagamento).map(([forma, dados]) => [
          forma.toUpperCase(),
          dados.quantidade.toString(),
          formatarMoeda(dados.total),
        ]),
      ];

      autoTable(doc, {
        startY: yPos,
        head: [formasPagamentoData[0]],
        body: formasPagamentoData.slice(1),
        theme: "striped",
        headStyles: { fillColor: [34, 197, 94] },
        margin: { left: 15, right: 15 },
      });

      yPos = (doc as any).lastAutoTable.finalY + 10;
    }

    // Seção de Ordens de Serviço
    const ordensServico = movimentacoes.filter(
      (mov) => mov.tipo === "ordem_servico"
    );
    if (ordensServico.length > 0) {
      yPos += 5;

      // Verificar se precisa de nova página
      if (yPos > 240) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Ordens de Serviço", 15, yPos);

      // Agrupar ordens por forma de pagamento
      const ordensPorFormaPagamento: {
        [key: string]: { quantidade: number; total: number };
      } = {};
      ordensServico.forEach((mov) => {
        const forma = mov.forma_pagamento || "Não informado";
        if (!ordensPorFormaPagamento[forma]) {
          ordensPorFormaPagamento[forma] = { quantidade: 0, total: 0 };
        }
        ordensPorFormaPagamento[forma].quantidade++;
        ordensPorFormaPagamento[forma].total += mov.valor || 0;
      });

      yPos += 8;
      const ordensData = [
        ["Forma de Pagamento", "Quantidade", "Total"],
        ...Object.entries(ordensPorFormaPagamento).map(([forma, dados]) => [
          forma.toUpperCase(),
          dados.quantidade.toString(),
          formatarMoeda(dados.total),
        ]),
        [
          "TOTAL",
          ordensServico.length.toString(),
          formatarMoeda(
            ordensServico.reduce((sum, mov) => sum + (mov.valor || 0), 0)
          ),
        ],
      ];

      autoTable(doc, {
        startY: yPos,
        head: [ordensData[0]],
        body: ordensData.slice(1),
        theme: "striped",
        headStyles: { fillColor: [147, 51, 234] },
        margin: { left: 15, right: 15 },
        footStyles: { fillColor: [120, 40, 200], fontStyle: "bold" },
      });

      yPos = (doc as any).lastAutoTable.finalY + 10;
    }

    // Detalhamento por Tipo
    yPos += 5;
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Detalhamento por Tipo de Movimentação", 15, yPos);

    yPos += 8;
    const detalhamentoData = [
      ["Tipo", "Quantidade", "Total"],
      [
        "Vendas",
        (resumo.vendas?.quantidade || 0).toString(),
        formatarMoeda(resumo.vendas?.total || 0),
      ],
      [
        "Sangrias",
        (resumo.sangrias?.quantidade || 0).toString(),
        formatarMoeda(resumo.sangrias?.total || 0),
      ],
      [
        "Ordens de Serviço",
        (resumo.ordens_servico?.quantidade || 0).toString(),
        formatarMoeda(resumo.ordens_servico?.total || 0),
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

    // Movimentações Detalhadas
    if (movimentacoes.length > 0) {
      const finalY = (doc as any).lastAutoTable.finalY || yPos + 40;

      // Verificar se precisa de nova página
      if (finalY > 250) {
        doc.addPage();
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("Movimentações Detalhadas", 15, 20);

        const movimentacoesData = movimentacoes.map((mov) => {
          const formaPagamento = mov.forma_pagamento
            ? ` (${mov.forma_pagamento.toUpperCase()})`
            : "";
          const tipo =
            mov.tipo.replace("_", " ").toUpperCase() + formaPagamento;

          // Adicionar indicação de crédito e forma de pagamento para devoluções
          let descricao = mov.descricao || "-";
          if (mov.tipo === "devolucao") {
            const creditoInfo = mov.gerou_credito
              ? " [COM CRÉDITO]"
              : " [SEM CRÉDITO]";
            const formaPgto = mov.forma_pagamento
              ? ` (${mov.forma_pagamento.toUpperCase()})`
              : "";
            descricao = descricao + creditoInfo + formaPgto;
          }

          return [
            formatarData(mov.data),
            tipo,
            mov.tipo.includes("entrada") || mov.tipo === "venda"
              ? formatarMoeda(mov.valor || 0)
              : `-${formatarMoeda(mov.valor || 0)}`,
            descricao,
          ];
        });

        autoTable(doc, {
          startY: 25,
          head: [["Data/Hora", "Tipo", "Valor", "Descrição"]],
          body: movimentacoesData,
          theme: "striped",
          headStyles: { fillColor: [59, 130, 246] },
          margin: { left: 15, right: 15 },
          styles: { fontSize: 8 },
        });
      } else {
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("Movimentações Detalhadas", 15, finalY + 10);

        const movimentacoesData = movimentacoes.map((mov) => {
          const formaPagamento = mov.forma_pagamento
            ? ` (${mov.forma_pagamento.toUpperCase()})`
            : "";
          const tipo =
            mov.tipo.replace("_", " ").toUpperCase() + formaPagamento;

          // Adicionar indicação de crédito e forma de pagamento para devoluções
          let descricao = mov.descricao || "-";
          if (mov.tipo === "devolucao") {
            const creditoInfo = mov.gerou_credito
              ? " [COM CRÉDITO]"
              : " [SEM CRÉDITO]";
            const formaPgto = mov.forma_pagamento
              ? ` (${mov.forma_pagamento.toUpperCase()})`
              : "";
            descricao = descricao + creditoInfo + formaPgto;
          }

          return [
            formatarData(mov.data),
            tipo,
            mov.tipo.includes("entrada") || mov.tipo === "venda"
              ? formatarMoeda(mov.valor || 0)
              : `-${formatarMoeda(mov.valor || 0)}`,
            descricao,
          ];
        });

        autoTable(doc, {
          startY: finalY + 15,
          head: [["Data/Hora", "Tipo", "Valor", "Descrição"]],
          body: movimentacoesData,
          theme: "striped",
          headStyles: { fillColor: [59, 130, 246] },
          margin: { left: 15, right: 15 },
          styles: { fontSize: 8 },
        });
      }
    }

    // Rodapé
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text(
        `Página ${i} de ${pageCount} - Gerado em ${new Date().toLocaleString("pt-BR")}`,
        pageWidth / 2,
        doc.internal.pageSize.height - 10,
        { align: "center" }
      );
    }

    // Visualizar PDF em nova aba
    const pdfBlob = doc.output("blob");
    const pdfUrl = URL.createObjectURL(pdfBlob);
    window.open(pdfUrl, "_blank");

    toast.success("PDF aberto em nova aba!");
  };

  // Verificar permissão de visualizar
  if (!loadingPermissoes && !temPermissao("caixa.visualizar")) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold text-danger mb-4">Acesso Negado</h1>
        <p className="text-default-500">
          Você não tem permissão para visualizar o caixa.
        </p>
      </div>
    );
  }

  if (loading || loadingPermissoes) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div>Carregando...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Controle de Caixa</h1>
          <p className="text-default-600">
            Gerencie abertura e fechamento do caixa de cada loja
          </p>
        </div>
        <Button
          color="primary"
          variant="flat"
          onPress={() => {
            if (abaAtiva === "caixas") {
              carregarLojas();
            } else {
              carregarHistorico();
            }
          }}
          isLoading={loading}
        >
          Atualizar
        </Button>
      </div>

      {/* Tabs */}
      <Tabs
        selectedKey={abaAtiva}
        onSelectionChange={(key) => setAbaAtiva(key as string)}
        variant="underlined"
        classNames={{
          tabList: "gap-6",
        }}
      >
        <Tab
          key="caixas"
          title={
            <div className="flex items-center gap-2">
              <Store className="w-4 h-4" />
              <span>Caixas Atuais</span>
            </div>
          }
        >
          {/* Cards das Lojas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {lojas.map((loja) => (
              <Card
                key={loja.id}
                className={loja.caixa ? "border-2 border-success" : ""}
              >
                <CardHeader className={loja.caixa ? "bg-success/10" : ""}>
                  <div className="flex justify-between items-start w-full">
                    <div>
                      <h2 className="text-xl font-bold flex items-center gap-2">
                        <Store className="w-5 h-5" />
                        {loja.nome}
                      </h2>
                    </div>
                    <Chip
                      color={loja.caixa ? "success" : "default"}
                      variant="flat"
                      size="sm"
                    >
                      {loja.caixa ? "ABERTO" : "FECHADO"}
                    </Chip>
                  </div>
                </CardHeader>
                <CardBody>
                  {loja.caixa ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs text-default-500 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Abertura
                          </p>
                          <p className="text-sm font-semibold">
                            {
                              formatarData(loja.caixa.data_abertura).split(
                                ","
                              )[1]
                            }
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-default-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Duração
                          </p>
                          <p className="text-sm font-semibold">
                            {calcularDuracao(loja.caixa.data_abertura)}
                          </p>
                        </div>
                      </div>

                      <div>
                        <p className="text-xs text-default-500 flex items-center gap-1">
                          <User className="w-3 h-3" />
                          Responsável
                        </p>
                        <p className="text-sm font-semibold">
                          {loja.caixa.usuario_abertura_info?.nome}
                        </p>
                      </div>

                      <div className="bg-success/10 p-3 rounded-lg border border-success/20">
                        <p className="text-xs text-default-500">
                          Saldo Inicial
                        </p>
                        <p className="text-2xl font-bold text-success">
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
                            variant="flat"
                            size="sm"
                            startContent={<Eye className="w-4 h-4" />}
                            onPress={() => handleVerDetalhes(loja.caixa!)}
                          >
                            Detalhes
                          </Button>
                        )}
                        <Button
                          color="warning"
                          variant="flat"
                          size="sm"
                          startContent={<TrendingDown className="w-4 h-4" />}
                          onPress={() => handleSangria(loja)}
                        >
                          Sangria
                        </Button>
                        {temPermissao("caixa.fechar") && (
                          <Button
                            color="danger"
                            size="sm"
                            startContent={<Lock className="w-4 h-4" />}
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
                        <Lock className="w-12 h-12 mx-auto text-default-400 mb-2" />
                        <p className="text-default-600 text-sm">
                          Caixa fechado
                        </p>
                        <p className="text-xs text-default-500 mt-1">
                          Abra o caixa para iniciar as operações
                        </p>
                      </div>

                      {temPermissao("caixa.abrir") && (
                        <Button
                          color="success"
                          className="w-full"
                          startContent={<Unlock className="w-4 h-4" />}
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
              <History className="w-4 h-4" />
              <span>Histórico</span>
            </div>
          }
        >
          {/* Filtros */}
          <Card className="mt-6">
            <CardBody>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm text-default-600 mb-2 block">
                    Loja
                  </label>
                  <select
                    className="w-full px-3 py-2 rounded-lg border-2 border-default-200 bg-default-100 hover:border-default-400 focus:border-primary focus:outline-none"
                    value={lojaFiltroHistorico}
                    onChange={(e) => setLojaFiltroHistorico(e.target.value)}
                  >
                    <option value="todos">Todas as lojas</option>
                    {lojas.map((loja) => (
                      <option key={loja.id} value={loja.id.toString()}>
                        {loja.nome}
                      </option>
                    ))}
                  </select>
                </div>

                <Input
                  type="date"
                  label="Data Início"
                  value={dataInicioHistorico}
                  onChange={(e) => setDataInicioHistorico(e.target.value)}
                />

                <Input
                  type="date"
                  label="Data Fim"
                  value={dataFimHistorico}
                  onChange={(e) => setDataFimHistorico(e.target.value)}
                />

                <Button
                  color="primary"
                  onPress={carregarHistorico}
                  isLoading={loading}
                  className="mt-auto"
                >
                  Filtrar
                </Button>
              </div>
            </CardBody>
          </Card>

          {/* Resumo Estatístico */}
          {historicosCaixa.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
              <Card>
                <CardBody className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <Calendar className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-default-500">
                        Total de Caixas
                      </p>
                      <p className="text-xl font-bold">
                        {historicosCaixa.length}
                      </p>
                    </div>
                  </div>
                </CardBody>
              </Card>

              <Card>
                <CardBody className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-success/10 rounded-lg">
                      <TrendingUp className="w-5 h-5 text-success" />
                    </div>
                    <div>
                      <p className="text-xs text-default-500">
                        Saldo Total Inicial
                      </p>
                      <p className="text-xl font-bold text-success">
                        {formatarMoeda(
                          historicosCaixa.reduce(
                            (sum, c) =>
                              sum + parseFloat(c.saldo_inicial.toString()),
                            0
                          )
                        )}
                      </p>
                    </div>
                  </div>
                </CardBody>
              </Card>

              <Card>
                <CardBody className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <DollarSign className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-default-500">
                        Saldo Total Final
                      </p>
                      <p className="text-xl font-bold text-primary">
                        {formatarMoeda(
                          historicosCaixa.reduce(
                            (sum, c) =>
                              sum +
                              parseFloat(c.saldo_final?.toString() || "0"),
                            0
                          )
                        )}
                      </p>
                    </div>
                  </div>
                </CardBody>
              </Card>

              <Card>
                <CardBody className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-warning/10 rounded-lg">
                      <TrendingUp className="w-5 h-5 text-warning" />
                    </div>
                    <div>
                      <p className="text-xs text-default-500">
                        Diferença Total
                      </p>
                      <p className="text-xl font-bold text-warning">
                        {formatarMoeda(
                          historicosCaixa.reduce((sum, c) => {
                            const diferenca = c.saldo_final
                              ? parseFloat(c.saldo_final.toString()) -
                                parseFloat(c.saldo_inicial.toString())
                              : 0;
                            return sum + diferenca;
                          }, 0)
                        )}
                      </p>
                    </div>
                  </div>
                </CardBody>
              </Card>
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
                  <TableColumn>SALDO FINAL</TableColumn>
                  <TableColumn>DIFERENÇA</TableColumn>
                  <TableColumn>AÇÕES</TableColumn>
                </TableHeader>
                <TableBody
                  emptyContent={
                    loading ? "Carregando..." : "Nenhum caixa encontrado"
                  }
                >
                  {historicosCaixa.map((caixa) => {
                    const diferenca = caixa.saldo_final
                      ? parseFloat(caixa.saldo_final.toString()) -
                        parseFloat(caixa.saldo_inicial.toString())
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
                            }
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
                                }
                              )
                            : "-"}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Store className="w-4 h-4 text-default-400" />
                            {caixa.loja?.nome || "-"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-default-400" />
                            {caixa.usuario_abertura_info?.nome || "-"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-default-400" />
                            {caixa.usuario_fechamento_info?.nome || "-"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-success font-semibold">
                            {formatarMoeda(
                              parseFloat(caixa.saldo_inicial.toString())
                            )}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-primary font-semibold">
                            {caixa.saldo_final
                              ? formatarMoeda(
                                  parseFloat(caixa.saldo_final.toString())
                                )
                              : formatarMoeda(0)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Chip
                            color={diferenca >= 0 ? "success" : "danger"}
                            variant="flat"
                            size="sm"
                          >
                            {formatarMoeda(diferenca)}
                          </Chip>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="flat"
                            startContent={<Eye className="w-4 h-4" />}
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
            </CardBody>
          </Card>
        </Tab>
      </Tabs>

      {lojas.length === 0 && !loading && (
        <Card>
          <CardBody className="text-center py-12">
            <Store className="w-16 h-16 mx-auto text-default-400 mb-4" />
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
              <Unlock className="text-success" />
              Abrir Caixa - {lojaSelecionada?.nome}
            </div>
          </ModalHeader>
          <ModalBody>
            <Input
              label="Saldo Inicial (Dinheiro em espécie)"
              placeholder="0,00"
              value={saldoInicial}
              onChange={(e) => setSaldoInicial(e.target.value)}
              type="number"
              step="0.01"
              startContent={<DollarSign className="w-4 h-4" />}
              description="Informe o valor em dinheiro no caixa"
            />
            <Textarea
              label="Observações (opcional)"
              placeholder="Ex: Troco do dia anterior, fundo de caixa..."
              value={observacoesAbertura}
              onChange={(e) => setObservacoesAbertura(e.target.value)}
              maxRows={3}
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={() => setModalAbrirAberto(false)}>
              Cancelar
            </Button>
            <Button
              color="success"
              onPress={handleAbrirCaixa}
              isLoading={loading}
              isDisabled={!saldoInicial}
            >
              Abrir Caixa
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal Fechar Caixa */}
      <Modal
        isOpen={modalFecharAberto}
        onClose={() => setModalFecharAberto(false)}
        size="2xl"
      >
        <ModalContent>
          <ModalHeader>
            <div className="flex items-center gap-2">
              <Lock className="text-danger" />
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

            <Input
              label="Saldo Final (Dinheiro em espécie)"
              placeholder="0,00"
              value={saldoFinal}
              onChange={(e) => setSaldoFinal(e.target.value)}
              type="number"
              step="0.01"
              startContent={<DollarSign className="w-4 h-4" />}
              description="Conte o dinheiro no caixa e informe o valor"
            />
            <Textarea
              label="Observações do Fechamento (opcional)"
              placeholder="Ex: Diferença devido a troco errado..."
              value={observacoesFechamento}
              onChange={(e) => setObservacoesFechamento(e.target.value)}
              maxRows={3}
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={() => setModalFecharAberto(false)}>
              Cancelar
            </Button>
            <Button
              color="danger"
              onPress={handleFecharCaixa}
              isLoading={loading}
              isDisabled={!saldoFinal}
            >
              Fechar Caixa
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal Detalhes */}
      <Modal
        isOpen={modalDetalhesAberto}
        onClose={() => setModalDetalhesAberto(false)}
        size="5xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          <ModalHeader>
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Detalhes do Caixa - {caixaDetalhes?.loja?.nome}
            </div>
          </ModalHeader>
          <ModalBody>
            {resumo && (
              <div className="space-y-6">
                {/* Resumo Geral */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
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
                        {formatarMoeda(resumo.total_entradas)}
                      </p>
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
                          resumo.total_entradas - resumo.total_saidas
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
                        {formatarMoeda(resumo.saldo_esperado)}
                      </p>
                    </CardBody>
                  </Card>
                </div>

                {/* Vendas */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <ShoppingCart className="w-5 h-5" />
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
                        )
                      )}
                    </div>
                  </CardBody>
                </Card>

                {/* Devoluções, Sangrias e OS */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <Package className="w-5 h-5 text-warning" />
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
                        <Package className="w-5 h-5 text-danger" />
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
                        <TrendingDown className="w-5 h-5 text-danger" />
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
                        <AlertTriangle className="w-5 h-5 text-danger" />
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
                        <Wrench className="w-5 h-5" />
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
                </div>

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
                        <TableColumn width="15%" align="end">
                          VALOR TOTAL
                        </TableColumn>
                      </TableHeader>
                      <TableBody>
                        {movimentacoes.map((mov: any, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              <div className="flex gap-1 flex-wrap">
                                <Chip
                                  size="sm"
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
                                    size="sm"
                                    color="warning"
                                    variant="flat"
                                  >
                                    Gerou Crédito
                                  </Chip>
                                )}
                                {mov.tipo === "devolucao" &&
                                  mov.forma_pagamento && (
                                    <Chip
                                      size="sm"
                                      color="primary"
                                      variant="flat"
                                    >
                                      {mov.forma_pagamento === "dinheiro" &&
                                        "💵 Dinheiro"}
                                      {mov.forma_pagamento === "pix" &&
                                        "📱 PIX"}
                                      {mov.forma_pagamento === "debito" &&
                                        "💳 Débito"}
                                      {mov.forma_pagamento === "credito" &&
                                        "💳 Crédito"}
                                      {mov.forma_pagamento === "credito_loja" &&
                                        "🎁 Crédito Loja"}
                                    </Chip>
                                  )}
                                {mov.eh_credito_cliente && (
                                  <Chip
                                    size="sm"
                                    color="secondary"
                                    variant="flat"
                                  >
                                    🎁 Usou Crédito (não soma no caixa)
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
                                    )
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
                                      size="sm"
                                      color="warning"
                                      variant="flat"
                                    >
                                      ⚠️ Não soma no caixa
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
                                  Math.abs(mov.valor_total || mov.valor)
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
            <Button
              color="primary"
              startContent={<ExternalLink className="w-4 h-4" />}
              onPress={gerarPDFCaixa}
            >
              Visualizar PDF
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
              <TrendingDown className="text-warning" />
              Registrar Sangria - {lojaSelecionada?.nome}
            </div>
          </ModalHeader>
          <ModalBody>
            <Input
              label="Valor da Sangria *"
              placeholder="0,00"
              value={valorSangria}
              onChange={(e) => setValorSangria(e.target.value)}
              type="number"
              step="0.01"
              startContent={<DollarSign className="w-4 h-4" />}
              description="Informe o valor retirado do caixa"
            />
            <Textarea
              label="Motivo *"
              placeholder="Ex: Pagamento fornecedor, Despesa, Troco banco..."
              value={motivoSangria}
              onChange={(e) => setMotivoSangria(e.target.value)}
              maxRows={3}
              isRequired
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
              onPress={handleRegistrarSangria}
              isLoading={loading}
              isDisabled={!valorSangria || !motivoSangria}
            >
              Registrar Sangria
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
