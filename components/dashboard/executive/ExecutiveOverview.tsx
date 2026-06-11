"use client";

import type { DadosDashboard, DesempenhoTecnico } from "@/types/dashboard";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CurrencyDollarIcon,
  BanknotesIcon,
  WrenchScrewdriverIcon,
  ChartBarIcon,
  CalendarDaysIcon,
  CalendarIcon,
  ClockIcon,
  ArchiveBoxXMarkIcon,
  TruckIcon,
  CubeIcon,
  TagIcon,
  DevicePhoneMobileIcon,
  UsersIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CalculatorIcon,
  ExclamationTriangleIcon,
  ArrowUturnLeftIcon,
} from "@heroicons/react/24/outline";

import { formatarMoeda } from "@/lib/formatters";
import { DashboardService } from "@/services/dashboardService";
import { MetasService } from "@/services/metasService";
import { getProdutosBaixoEstoque } from "@/services/estoqueService";
import { CaixaService } from "@/services/caixaService";

import { KpiHeroCard } from "./KpiHeroCard";
import { MetaProgress } from "./MetaProgress";
import { SellerRanking } from "./SellerRanking";
import { LojaRanking } from "./LojaRanking";
import { InsightBanner, type Insight } from "./InsightBanner";
import { ComparativoCard } from "./ComparativoCard";
import { MetricCard } from "./MetricCard";
import { CategoryCard } from "./CategoryCard";
import { EvolucaoChart } from "./EvolucaoChart";
import { Tabs, Tab } from "@heroui/react";

import { DrillDownModal } from "./DrillDownModal";
import { TecnicoRanking } from "./TecnicoRanking";

interface Seller {
  vendedor_id: string;
  vendedor_nome: string;
  total_vendas: number;
  total_os: number;
  receita_vendas: number;
  receita_aparelhos: number;
  receita_os: number;
  receita_total: number;
  lucro_vendas: number;
  lucro_aparelhos: number;
  lucro_os: number;
  lucro_total: number;
}

interface TopCliente {
  cliente_id: string;
  cliente_nome: string;
  total_vendas: number;
  receita_total: number;
}

interface TopProduto {
  produto_id: string;
  descricao: string;
  quantidade: number;
  receita: number;
}

interface ExecutiveOverviewProps {
  dados: DadosDashboard | null;
  /** Dados do período imediatamente anterior, para os deltas. */
  dadosAnterior: DadosDashboard | null;
  loading: boolean;
  lojaId: string;
  /** Período ativo (para o drill-down de detalhe). */
  dataInicio: string;
  dataFim: string;
  /** Sinal de recarga: muda a cada "Atualizar"/troca de filtro no dashboard. */
  refreshKey: number;
  /** Série diária de receita (sparkline do faturamento). */
  evolucaoReceita: number[];
  /** Série diária completa (gráfico de evolução). */
  evolucao?: Array<{ data: string; vendas: number; receita: number }>;
  vendedores: Seller[];
  top10Clientes?: TopCliente[];
  top10Produtos?: TopProduto[];
  bottom10Produtos?: TopProduto[];
  /** Ranking de faturamento por loja (exibido quando há mais de uma loja). */
  rankingLojas?: Array<{
    loja_id: number;
    nome: string;
    total_vendas: number;
    total_os: number;
    receita_vendas: number;
    receita_acessorios: number;
    receita_aparelhos: number;
    receita_os: number;
    receita_total: number;
    lucro_vendas: number;
    lucro_acessorios: number;
    lucro_aparelhos: number;
    lucro_os: number;
    lucro_total: number;
  }>;
  /** Desempenho dos técnicos no período. */
  desempenhoTecnicos?: DesempenhoTecnico[];
}

const num = (v: number | undefined | null) => Number(v || 0);

/** Faturamento recebido no período: vendas (sem crédito) + OS processadas. */
function getFaturamento(d: DadosDashboard | null): number {
  if (!d) return 0;

  return (
    num(d.metricas_adicionais?.pagamentos_sem_credito_cliente) +
    num(d.metricas_adicionais?.faturamento_os)
  );
}

/** Lucro estimado: ganho em vendas + ganho em OS. */
function getLucro(d: DadosDashboard | null): number {
  if (!d) return 0;

  return (
    num(d.metricas_adicionais?.ganho_total_vendas) +
    num(d.metricas_adicionais?.ganho_os)
  );
}

function delta(atual: number, anterior: number): number | null {
  if (!anterior || anterior === 0) return null;

  return ((atual - anterior) / anterior) * 100;
}

const DRILL_TITULOS: Record<string, string> = {
  faturamento: "Faturamento Total — Vendas no Período",
  lucro: "Lucro Total — Vendas no Período",
  ticket: "Ticket Médio — Vendas no Período",
  produtos: "Produtos Vendidos",
  acessorios: "Acessórios Vendidos",
  aparelhos: "Aparelhos Vendidos",
  aparelhos_vendidos: "Aparelhos Vendidos no Período",
  os: "Ordens de Serviço",
  contas_receber: "Contas a Receber — Vendas Pendentes",
  contas_vencidas: "Contas Vencidas — Em Atraso",
  caixa_atual: "Caixas — Resumo dos Caixas no Período",
  os_operacional: "Ordens de Serviço — Período",
  os_aguardando: "OS Aguardando Entrega",
  estoque_critico: "Estoque Crítico — Abaixo do Mínimo",
  quebras: "Quebras de Peças no Período",
  devolucoes: "Devoluções no Período",
};

export function ExecutiveOverview({
  dados,
  dadosAnterior,
  loading,
  lojaId,
  dataInicio,
  dataFim,
  refreshKey,
  evolucaoReceita,
  evolucao = [],
  vendedores,
  top10Clientes = [],
  top10Produtos = [],
  bottom10Produtos = [],
  rankingLojas = [],
  desempenhoTecnicos = [],
}: ExecutiveOverviewProps) {
  const router = useRouter();
  const [detalheOpen, setDetalheOpen] = useState(false);
  const [detalheKey, setDetalheKey] = useState("");
  const [detalheColunas, setDetalheColunas] = useState<
    Array<{ key: string; label: string }>
  >([]);
  const [detalheRows, setDetalheRows] = useState<Array<Record<string, string>>>(
    [],
  );
  const [detalheTotal, setDetalheTotal] = useState(0);
  const [detalhePage, setDetalhePage] = useState(1);
  const [detalheLoading, setDetalheLoading] = useState(false);
  const [tabAtiva, setTabAtiva] = useState("geral");
  const pageSize = 10;

  const abrirDetalhe = async (cardKey: string, page = 1) => {
    setDetalheKey(cardKey);
    setDetalhePage(page);
    setDetalheLoading(true);
    setDetalheOpen(true);

    const filtro = {
      data_inicio: dataInicio,
      data_fim: dataFim,
      loja_id: lojaId ? Number(lojaId) : undefined,
    };

    const result = await DashboardService.buscarDetalheCard(
      cardKey,
      filtro,
      page,
      pageSize,
    );

    setDetalheColunas(result.colunas);
    setDetalheRows(result.rows);
    setDetalheTotal(result.total);
    setDetalheLoading(false);
  };

  const [meta, setMeta] = useState({ meta_vendas: 0, meta_os: 0 });
  const [faturamentoMes, setFaturamentoMes] = useState(0);
  const [faturamentoMesAnterior, setFaturamentoMesAnterior] = useState(0);
  const [faturamentoHoje, setFaturamentoHoje] = useState(0);
  const [faturamentoOntem, setFaturamentoOntem] = useState(0);
  const [baixoEstoque, setBaixoEstoque] = useState(0);
  const [contasVencidas, setContasVencidas] = useState({
    total: 0,
    valorTotal: 0,
  });
  const [caixaAtual, setCaixaAtual] = useState({ saldo: 0, caixasAbertos: 0 });
  const [auxLoading, setAuxLoading] = useState(true);

  // Fração do mês decorrida (para o indicador de ritmo da meta)
  const fracaoMes = useMemo(() => {
    const hoje = new Date();
    const diasNoMes = new Date(
      hoje.getFullYear(),
      hoje.getMonth() + 1,
      0,
    ).getDate();

    return hoje.getDate() / diasNoMes;
  }, []);

  // Dados auxiliares: meta consolidada, faturamento do mês corrente e baixo estoque.
  // A meta é mensal, então o realizado usa sempre o mês corrente (independe do filtro).
  useEffect(() => {
    let ativo = true;

    const carregarAux = async () => {
      setAuxLoading(true);
      try {
        const hoje = new Date();
        const iso = (d: Date) => d.toISOString().split("T")[0];
        const ontem = new Date(hoje.getTime() - 86400000);
        const inicioMes = iso(new Date(hoje.getFullYear(), hoje.getMonth(), 1));
        const fimHoje = iso(hoje);
        const inicioMesAnterior = iso(
          new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1),
        );
        const fimMesAnterior = iso(
          new Date(hoje.getFullYear(), hoje.getMonth(), 0),
        );
        const lojaNum = lojaId ? Number(lojaId) : undefined;

        const range = (data_inicio: string, data_fim: string) =>
          DashboardService.buscarDadosDashboard({
            data_inicio,
            data_fim,
            loja_id: lojaNum,
          }).catch(() => null);

        const [
          metaConsolidada,
          dadosMes,
          dadosMesAnterior,
          dadosHoje,
          dadosOntem,
          estoque,
          caixa,
          contasVencidasData,
        ] = await Promise.all([
          MetasService.buscarMetaConsolidada(lojaNum).catch(() => ({
            meta_vendas: 0,
            meta_os: 0,
            total_metas: 0,
          })),
          range(inicioMes, fimHoje),
          range(inicioMesAnterior, fimMesAnterior),
          range(fimHoje, fimHoje),
          range(iso(ontem), iso(ontem)),
          getProdutosBaixoEstoque(lojaNum).catch(() => ({
            itens: [],
            total: 0,
          })),
          CaixaService.buscarSaldoCaixaAtual(lojaNum).catch(() => ({
            saldo: 0,
            caixasAbertos: 0,
          })),
          DashboardService.buscarContasVencidas(),
        ]);

        if (!ativo) return;

        setMeta({
          meta_vendas: metaConsolidada.meta_vendas,
          meta_os: metaConsolidada.meta_os,
        });
        setFaturamentoMes(getFaturamento(dadosMes));
        setFaturamentoMesAnterior(getFaturamento(dadosMesAnterior));
        setFaturamentoHoje(getFaturamento(dadosHoje));
        setFaturamentoOntem(getFaturamento(dadosOntem));
        setBaixoEstoque(estoque.total);
        setCaixaAtual(caixa);
        setContasVencidas(contasVencidasData);
      } finally {
        if (ativo) setAuxLoading(false);
      }
    };

    carregarAux();

    return () => {
      ativo = false;
    };
  }, [lojaId, refreshKey]);

  const faturamento = getFaturamento(dados);
  const lucro = getLucro(dados);
  const ticket = num(dados?.metricas_adicionais?.ticket_medio);
  const totalOS = num(dados?.metricas_adicionais?.total_os);
  const osConcluidas = num(dados?.metricas_adicionais?.os_processadas);
  const osAbertas = num(dados?.metricas_adicionais?.os_pendentes);

  const dFaturamento = delta(faturamento, getFaturamento(dadosAnterior));
  const dLucro = delta(lucro, getLucro(dadosAnterior));
  const dTicket = delta(
    ticket,
    num(dadosAnterior?.metricas_adicionais?.ticket_medio),
  );

  // Comparativos fixos (independentes do filtro de período)
  const dHojeOntem = delta(faturamentoHoje, faturamentoOntem);
  const dMesMesAnterior = delta(faturamentoMes, faturamentoMesAnterior);

  // Backlog operacional (todos seguem o filtro ativo via `dados`)
  const aguardandoEntrega = num(
    dados?.metricas_adicionais?.os_pagas_nao_entregues,
  );
  const contasReceber = num(dados?.metricas_adicionais?.contas_nao_pagas);
  const dContasReceber = delta(
    contasReceber,
    num(dadosAnterior?.metricas_adicionais?.contas_nao_pagas),
  );

  // Composição da operação por linha de negócio (mesmas RPCs do dashboard antigo)
  const categorias = [
    {
      key: "produtos",
      nome: "Produtos",
      icon: <CubeIcon className="h-5 w-5" />,
      receita: num(dados?.metricas_produtos?.pagamentos),
      lucro: num(dados?.metricas_produtos?.lucro),
      receitaAnterior: num(dadosAnterior?.metricas_produtos?.pagamentos),
    },
    {
      key: "acessorios",
      nome: "Acessórios",
      icon: <TagIcon className="h-5 w-5" />,
      receita: num(dados?.metricas_acessorios?.pagamentos),
      lucro: num(dados?.metricas_acessorios?.lucro),
      receitaAnterior: num(dadosAnterior?.metricas_acessorios?.pagamentos),
    },
    {
      key: "aparelhos",
      nome: "Aparelhos",
      icon: <DevicePhoneMobileIcon className="h-5 w-5" />,
      receita: num(dados?.metricas_aparelhos?.pagamentos),
      lucro: num(dados?.metricas_aparelhos?.lucro),
      receitaAnterior: num(dadosAnterior?.metricas_aparelhos?.pagamentos),
    },
    {
      key: "os",
      nome: "Ordens de Serviço",
      icon: <WrenchScrewdriverIcon className="h-5 w-5" />,
      receita: num(dados?.metricas_adicionais?.faturamento_os),
      lucro: num(dados?.metricas_adicionais?.ganho_os),
      receitaAnterior: num(dadosAnterior?.metricas_adicionais?.faturamento_os),
    },
  ];

  // ---- Insights automáticos (derivados de dados reais) ----
  const insights = useMemo<Insight[]>(() => {
    const list: Insight[] = [];

    if (dFaturamento !== null && Math.abs(dFaturamento) >= 1) {
      const subiu = dFaturamento > 0;

      list.push({
        id: "fat-trend",
        tone: subiu ? "opportunity" : "warning",
        text: `Faturamento ${subiu ? "+" : ""}${dFaturamento.toFixed(
          0,
        )}% vs. período anterior`,
      });
    }

    if (aguardandoEntrega > 0) {
      list.push({
        id: "os-entrega",
        tone: "warning",
        text: `${aguardandoEntrega} OS paga(s) aguardando entrega`,
        onClick: () => router.push("/sistema/ordem-servico"),
      });
    }

    if (baixoEstoque > 0) {
      list.push({
        id: "estoque",
        tone: "alert",
        text: `${baixoEstoque} produto(s) com estoque baixo`,
        onClick: () => router.push("/sistema/estoque"),
      });
    }

    return list;
  }, [dFaturamento, aguardandoEntrega, baixoEstoque, router]);

  const qtdAparelhosVendidos = num(dados?.metricas_aparelhos?.quantidade);
  const receitaAparelhos = num(dados?.metricas_aparelhos?.pagamentos);
  const qtdQuebras = num(dados?.metricas_adicionais?.quantidade_quebras);
  const totalQuebras = num(dados?.metricas_adicionais?.total_quebras);
  const devolucoesComCreditoQtd = num(
    dados?.metricas_adicionais?.devolucoes_com_credito_quantidade,
  );
  const devolucoesComCreditoTotal = num(
    dados?.metricas_adicionais?.devolucoes_com_credito_total,
  );
  const devolucoesSemCreditoQtd = num(
    dados?.metricas_adicionais?.devolucoes_sem_credito_quantidade,
  );
  const devolucoesSemCreditoTotal = num(
    dados?.metricas_adicionais?.devolucoes_sem_credito_total,
  );
  const totalDevolucoes = devolucoesComCreditoTotal + devolucoesSemCreditoTotal;
  const totalDevolucoesQtd = devolucoesComCreditoQtd + devolucoesSemCreditoQtd;

  const osConcluidasTecnicos = desempenhoTecnicos.reduce(
    (acc, t) => acc + t.os_concluidas,
    0,
  );
  const valorPagoTecnicos = desempenhoTecnicos.reduce(
    (acc, t) => acc + t.valor_pago,
    0,
  );

  return (
    <section className="space-y-4">
      <Tabs
        aria-label="Dashboard tabs"
        selectedKey={tabAtiva}
        onSelectionChange={(key) => setTabAtiva(key as string)}
      >
        <Tab key="geral" title="Visão Geral">
          <div className="space-y-4 pt-4">
            {/* Banner de insights */}
            <InsightBanner
              insights={insights}
              loading={loading || auxLoading}
            />

            {/* Hero KPIs */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <KpiHeroCard
                deltaPercent={dFaturamento}
                hint="Todas as vendas (sem crédito de cliente) + OS processadas no período."
                icon={<CurrencyDollarIcon className="h-5 w-5" />}
                label="Faturamento Total"
                loading={loading}
                trend={evolucaoReceita}
                value={formatarMoeda(faturamento)}
                onClick={() => abrirDetalhe("faturamento")}
              />
              <KpiHeroCard
                deltaPercent={dLucro}
                hint="Ganho em todas as vendas + ganho em OS processadas."
                icon={<BanknotesIcon className="h-5 w-5" />}
                label="Lucro Total"
                loading={loading}
                value={formatarMoeda(lucro)}
                onClick={() => abrirDetalhe("lucro")}
              />
              <KpiHeroCard
                deltaPercent={dTicket}
                hint="Valor médio por venda considerando todas as linhas de negócio."
                icon={<ChartBarIcon className="h-5 w-5" />}
                label="Ticket Médio Geral"
                loading={loading}
                value={formatarMoeda(ticket)}
              />
              <KpiHeroCard
                invertDelta
                deltaPercent={dContasReceber}
                hint="Pagamentos pendentes de recebimento no período/loja selecionados."
                icon={<ClockIcon className="h-5 w-5" />}
                label="Contas a Receber"
                loading={loading}
                value={formatarMoeda(contasReceber)}
                onClick={() => abrirDetalhe("contas_receber")}
              />
            </div>

            {/* Composição da Operação — linhas de negócio separadas */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-default-600">
                  Composição da Operação
                </h3>
                <span className="text-xs text-default-400">
                  Receita e lucro por linha de negócio no período
                </span>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {categorias.map((c) => (
                  <CategoryCard
                    key={c.key}
                    deltaReceita={delta(c.receita, c.receitaAnterior)}
                    icon={c.icon}
                    loading={loading}
                    lucro={c.lucro}
                    nome={c.nome}
                    receita={c.receita}
                    onClick={() => abrirDetalhe(c.key)}
                  />
                ))}
              </div>
            </div>

            {/* Comparativos de período */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <ComparativoCard
                atualLabel="Hoje"
                atualValue={formatarMoeda(faturamentoHoje)}
                badge="não segue filtro"
                deltaPercent={dHojeOntem}
                icon={<CalendarDaysIcon className="h-5 w-5" />}
                label="Faturamento — Hoje × Ontem"
                loading={auxLoading}
                refLabel="Ontem"
                refValue={formatarMoeda(faturamentoOntem)}
              />
              <ComparativoCard
                atualLabel="Mês atual"
                atualValue={formatarMoeda(faturamentoMes)}
                badge="não segue filtro"
                deltaPercent={dMesMesAnterior}
                icon={<CalendarIcon className="h-5 w-5" />}
                label="Faturamento — Mês × Mês anterior"
                loading={auxLoading}
                refLabel="Mês anterior"
                refValue={formatarMoeda(faturamentoMesAnterior)}
              />
            </div>

            {/* Zona principal: evolução (8 col) + meta do mês (4 col) */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
              <div className="lg:col-span-8">
                <EvolucaoChart evolucao={evolucao} loading={loading} />
              </div>
              <div className="lg:col-span-4">
                <MetaProgress
                  fracaoMesDecorrida={fracaoMes}
                  loading={auxLoading}
                  meta={meta.meta_vendas}
                  realizado={faturamentoMes}
                />
              </div>
            </div>

            {/* Cards operacionais */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <MetricCard
                footnote={
                  caixaAtual.caixasAbertos > 0
                    ? `${caixaAtual.caixasAbertos} caixa(s) aberto(s)`
                    : "Nenhum caixa aberto"
                }
                hint="Saldo esperado dos caixas abertos no momento (não segue o período)."
                icon={<CalculatorIcon className="h-5 w-5" />}
                label="Caixa atual"
                loading={auxLoading}
                tone="success"
                value={
                  caixaAtual.caixasAbertos > 0
                    ? formatarMoeda(caixaAtual.saldo)
                    : "—"
                }
                onClick={() => abrirDetalhe("caixa_atual")}
              />
              <MetricCard
                footnote={`${osAbertas} abertas · ${osConcluidas} concluídas`}
                hint="Total de OS no período (abertas e concluídas)."
                icon={<WrenchScrewdriverIcon className="h-5 w-5" />}
                label="Ordens de serviço"
                loading={loading}
                tone="primary"
                value={totalOS.toLocaleString("pt-BR")}
                onClick={() => abrirDetalhe("os_operacional")}
              />
              <MetricCard
                emphasis={aguardandoEntrega > 0}
                footnote="Pagas, pendentes de entrega ao cliente"
                icon={<TruckIcon className="h-5 w-5" />}
                label="OS aguardando entrega"
                loading={loading}
                tone="warning"
                value={aguardandoEntrega.toLocaleString("pt-BR")}
                onClick={() => abrirDetalhe("os_aguardando")}
              />
              <MetricCard
                emphasis={baixoEstoque > 0}
                footnote="Itens no/abaixo do estoque mínimo"
                icon={<ArchiveBoxXMarkIcon className="h-5 w-5" />}
                label="Estoque crítico"
                loading={auxLoading}
                tone="danger"
                value={baixoEstoque.toLocaleString("pt-BR")}
                onClick={() => abrirDetalhe("estoque_critico")}
              />
              <MetricCard
                emphasis={contasVencidas.total > 0}
                footnote={`${contasVencidas.total} conta(s) em atraso`}
                icon={<ExclamationTriangleIcon className="h-5 w-5" />}
                label="Contas Vencidas"
                loading={auxLoading}
                tone="danger"
                value={formatarMoeda(contasVencidas.valorTotal)}
                onClick={() => abrirDetalhe("contas_vencidas")}
              />
            </div>

            {/* Cards de métricas secundárias: Aparelhos Vendidos, Quebras, Devoluções */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <MetricCard
                footnote={`Receita: ${formatarMoeda(receitaAparelhos)}`}
                hint="Quantidade de aparelhos vendidos no período."
                icon={<DevicePhoneMobileIcon className="h-5 w-5" />}
                label="Aparelhos Vendidos"
                loading={loading}
                tone="primary"
                value={`${qtdAparelhosVendidos} un`}
                onClick={() => abrirDetalhe("aparelhos_vendidos")}
              />
              <MetricCard
                emphasis={qtdQuebras > 0}
                footnote={
                  qtdQuebras > 0
                    ? `Total: ${formatarMoeda(totalQuebras)}`
                    : "Nenhuma quebra registrada"
                }
                hint="Quebras de peças registradas no período."
                icon={<ExclamationTriangleIcon className="h-5 w-5" />}
                label="Quebras"
                loading={loading}
                tone="danger"
                value={`${qtdQuebras} quebra(s)`}
                onClick={() => abrirDetalhe("quebras")}
              />
              <MetricCard
                emphasis={totalDevolucoesQtd > 0}
                footnote={
                  totalDevolucoesQtd > 0
                    ? `${devolucoesComCreditoQtd} com crédito · ${devolucoesSemCreditoQtd} sem crédito`
                    : "Nenhuma devolução"
                }
                hint="Devoluções de vendas no período."
                icon={<ArrowUturnLeftIcon className="h-5 w-5" />}
                label="Devoluções"
                loading={loading}
                tone="warning"
                value={formatarMoeda(totalDevolucoes)}
                onClick={() => abrirDetalhe("devolucoes")}
              />
            </div>

            <div
              className={`grid grid-cols-1 gap-4 ${
                !lojaId && rankingLojas.length > 1 ? "lg:grid-cols-2" : ""
              }`}
            >
              <SellerRanking loading={loading} vendedores={vendedores} />
              {!lojaId && rankingLojas.length > 1 && (
                <LojaRanking loading={loading} lojas={rankingLojas} />
              )}
            </div>

            {/* Top 10 Clientes + Top 10 Produtos + Menos Vendidos */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <div className="flex h-full flex-col rounded-xl border border-default-200/70 bg-content1 p-5 shadow-sm">
                <div className="flex items-center gap-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-default-100 text-default-500">
                    <UsersIcon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-default-500">
                      Top 10 Clientes
                    </p>
                    <p className="text-sm text-default-400">
                      Clientes com maior faturamento
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-1 flex-col gap-2">
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <div
                        key={i}
                        className="h-7 w-full animate-pulse rounded-lg bg-default-100"
                      />
                    ))
                  ) : top10Clientes.length === 0 ? (
                    <p className="text-sm text-default-400">
                      Nenhum cliente no período.
                    </p>
                  ) : (
                    top10Clientes.map((c, i) => (
                      <div
                        key={c.cliente_id}
                        className="flex items-center gap-2"
                      >
                        <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded text-xs font-bold text-default-500">
                          {i + 1}
                        </span>
                        <span className="min-w-0 flex-1 truncate text-sm text-foreground">
                          {c.cliente_nome}
                        </span>
                        <span className="flex-shrink-0 text-right text-sm font-semibold tabular-nums text-default-600">
                          {formatarMoeda(c.receita_total)}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="flex h-full flex-col rounded-xl border border-default-200/70 bg-content1 p-5 shadow-sm">
                <div className="flex items-center gap-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-default-100 text-default-500">
                    <ArrowTrendingUpIcon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-default-500">
                      Top 10 Produtos
                    </p>
                    <p className="text-sm text-default-400">
                      Produtos mais vendidos por quantidade
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-1 flex-col gap-2">
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <div
                        key={i}
                        className="h-7 w-full animate-pulse rounded-lg bg-default-100"
                      />
                    ))
                  ) : top10Produtos.length === 0 ? (
                    <p className="text-sm text-default-400">
                      Nenhum produto no período.
                    </p>
                  ) : (
                    top10Produtos.map((p, i) => (
                      <div
                        key={p.produto_id}
                        className="flex items-center gap-2"
                      >
                        <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded text-xs font-bold text-default-500">
                          {i + 1}
                        </span>
                        <span className="min-w-0 flex-1 truncate text-sm text-foreground">
                          {p.descricao}
                        </span>
                        <span className="flex-shrink-0 text-right text-sm font-semibold tabular-nums text-default-600">
                          {p.quantidade} un
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="flex h-full flex-col rounded-xl border border-default-200/70 bg-content1 p-5 shadow-sm">
                <div className="flex items-center gap-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-default-100 text-default-500">
                    <ArrowTrendingDownIcon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-default-500">
                      Menos Vendidos
                    </p>
                    <p className="text-sm text-default-400">
                      Produtos com menor saída
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-1 flex-col gap-2">
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <div
                        key={i}
                        className="h-7 w-full animate-pulse rounded-lg bg-default-100"
                      />
                    ))
                  ) : bottom10Produtos.length === 0 ? (
                    <p className="text-sm text-default-400">
                      Nenhum produto no período.
                    </p>
                  ) : (
                    bottom10Produtos.map((p, i) => (
                      <div
                        key={p.produto_id}
                        className="flex items-center gap-2"
                      >
                        <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded text-xs font-bold text-default-500">
                          {i + 1}
                        </span>
                        <span className="min-w-0 flex-1 truncate text-sm text-foreground">
                          {p.descricao}
                        </span>
                        <span className="flex-shrink-0 text-right text-sm font-semibold tabular-nums text-default-600">
                          {p.quantidade} un
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </Tab>

        <Tab key="tecnicos" title="Técnicos">
          <div className="space-y-4 pt-4">
            {/* Resumo Técnicos */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <MetricCard
                footnote="Técnicos com OS no período"
                icon={<WrenchScrewdriverIcon className="h-5 w-5" />}
                label="Técnicos Ativos"
                loading={loading}
                tone="primary"
                value={`${desempenhoTecnicos.length}`}
              />
              <MetricCard
                footnote="OS concluídas no período"
                icon={<ChartBarIcon className="h-5 w-5" />}
                label="OS Concluídas"
                loading={loading}
                tone="success"
                value={`${osConcluidasTecnicos}`}
              />
              <MetricCard
                footnote="Valor total pago em OS"
                icon={<CurrencyDollarIcon className="h-5 w-5" />}
                label="Valor Faturado"
                loading={loading}
                tone="primary"
                value={formatarMoeda(valorPagoTecnicos)}
              />
            </div>

            <TecnicoRanking loading={loading} tecnicos={desempenhoTecnicos} />
          </div>
        </Tab>
      </Tabs>

      <DrillDownModal
        colunas={detalheColunas}
        isOpen={detalheOpen}
        loading={detalheLoading}
        page={detalhePage}
        pageSize={pageSize}
        rows={detalheRows}
        titulo={DRILL_TITULOS[detalheKey] || "Detalhamento"}
        total={detalheTotal}
        onClose={() => setDetalheOpen(false)}
        onPageChange={(p) => abrirDetalhe(detalheKey, p)}
      />
    </section>
  );
}
