"use client";

import { useEffect, useState } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Progress } from "@heroui/progress";
import { Divider } from "@heroui/divider";
import { Spinner } from "@heroui/spinner";
import { Button } from "@heroui/button";
import {
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Target,
  Calendar,
  Clock,
  Award,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";

import { useAuthContext } from "@/contexts/AuthContext";
import { usePermissoes } from "@/hooks/usePermissoes";
import { MetasService } from "@/services/metasService";

const TIMEZONE_DASHBOARD = "America/Sao_Paulo";

const getDateKeyInTimezone = (value: string | Date) => {
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TIMEZONE_DASHBOARD,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value));
};

interface MetricasPessoais {
  vendasHoje: {
    total: number;
    quantidade: number;
    ticket_medio: number;
  };
  vendasMes: {
    total: number;
    quantidade: number;
    ticket_medio: number;
  };
  metaMensal: {
    valor: number;
    progresso: number;
    faltando: number;
  };
  metaDiaria: {
    valor: number;
    progresso: number;
    faltando: number;
  };
  ordensServico: {
    aguardando: number;
    em_andamento: number;
    concluidas_mes: number;
  };
  ultimasVendas: Array<{
    id: string;
    numero_venda: number;
    valor_total: number;
    criado_em: string;
  }>;
  vendasPendentesRecebimentoTotal: number;
  vendasPendentesRecebimento: Array<{
    id: string;
    numero_venda: number;
    saldo_devedor: number;
    data_prevista_pagamento?: string;
    criado_em: string;
    cliente_nome?: string;
    status?: string;
  }>;
  vendasPendentesRecebimentoQuantidade: number;
}

export default function DashboardPessoal() {
  const ITENS_POR_PAGINA_PENDENTES = 10;
  const { usuario } = useAuthContext();
  const { lojaId, perfil } = usePermissoes();
  const [metricas, setMetricas] = useState<MetricasPessoais | null>(null);
  const [loading, setLoading] = useState(true);
  const [metaMensal, setMetaMensal] = useState(10000);
  const [diasUteis, setDiasUteis] = useState(26);
  const [paginaPendentes, setPaginaPendentes] = useState(1);

  useEffect(() => {
    if (usuario) {
      carregarMetricas();
    } else {
      console.warn("⚠️ Usuário não encontrado, aguardando...");
    }
  }, [usuario, lojaId]);

  const carregarMetricas = async () => {
    if (!usuario) return;

    setLoading(true);
    setPaginaPendentes(1);
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );

    try {
      // Carregar metas do usuário
      const metaUsuario = await MetasService.buscarMetaUsuario(
        usuario.id,
        lojaId || undefined,
      );

      let metaMensalAtual = 10000;
      let diasUteisAtual = 26;

      if (metaUsuario) {
        metaMensalAtual = metaUsuario.meta_mensal_vendas;
        diasUteisAtual = metaUsuario.dias_uteis_mes;
        setMetaMensal(metaUsuario.meta_mensal_vendas);
        setDiasUteis(metaUsuario.dias_uteis_mes);
      } else {
        setMetaMensal(10000);
        setDiasUteis(26);
      }
      const hoje = new Date();

      // Início e fim do dia de hoje
      const chaveHoje = getDateKeyInTimezone(hoje);

      // Início e fim do mês atual
      const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
      const fimMes = new Date(
        hoje.getFullYear(),
        hoje.getMonth() + 1,
        0,
        23,
        59,
        59,
      );

      // Buscar pagamentos recebidos (com paginacao para nao truncar)
      const tamanhoPagina = 1000;
      let pagina = 0;
      let pagamentosMes: any[] = [];

      while (true) {
        const inicio = pagina * tamanhoPagina;
        const fim = inicio + tamanhoPagina - 1;

        let queryPagamentos = supabase
          .from("pagamentos_venda")
          .select(
            `
            id,
            venda_id,
            valor,
            data_pagamento,
            criado_em,
            venda:vendas!inner(
              id,
              numero_venda,
              vendedor_id,
              loja_id
            )
          `,
          )
          .eq("venda.vendedor_id", usuario.id)
          .or(
            `and(data_pagamento.gte.${inicioMes.toISOString()},data_pagamento.lte.${fimMes.toISOString()}),and(data_pagamento.is.null,criado_em.gte.${inicioMes.toISOString()},criado_em.lte.${fimMes.toISOString()})`,
          )
          .order("criado_em", { ascending: false })
          .range(inicio, fim);

        if (lojaId) {
          queryPagamentos = queryPagamentos.eq("venda.loja_id", lojaId);
        }

        const { data, error } = await queryPagamentos;

        if (error) {
          throw error;
        }

        const lote = data || [];

        pagamentosMes = [...pagamentosMes, ...lote];

        if (lote.length < tamanhoPagina) {
          break;
        }

        pagina += 1;
      }

      const chaveMesAtual = chaveHoje.slice(0, 7);
      let totalRecebidoHoje = 0;
      let totalRecebidoMes = 0;
      const vendasMesSet = new Set<string>();
      const vendasHojeMap = new Map<
        string,
        {
          id: string;
          numero_venda: number;
          valor_total: number;
          criado_em: string;
        }
      >();

      pagamentosMes.forEach((pagamento) => {
        const dataReferencia = pagamento.data_pagamento || pagamento.criado_em;
        const dataHoraPagamento = pagamento.criado_em || dataReferencia;

        if (!dataReferencia || !pagamento.venda_id) return;

        const chaveData = getDateKeyInTimezone(dataReferencia);
        const valorPagamento = Number(pagamento.valor || 0);
        const vendaId = String(pagamento.venda_id);

        if (chaveData.startsWith(chaveMesAtual)) {
          totalRecebidoMes += valorPagamento;
          vendasMesSet.add(vendaId);
        }

        if (chaveData === chaveHoje) {
          totalRecebidoHoje += valorPagamento;
          const existente = vendasHojeMap.get(vendaId);
          const numeroVenda = Number(pagamento.venda?.numero_venda || 0);

          if (!existente) {
            vendasHojeMap.set(vendaId, {
              id: vendaId,
              numero_venda: numeroVenda,
              valor_total: valorPagamento,
              criado_em: dataHoraPagamento,
            });
          } else {
            const dataExistente = new Date(existente.criado_em).getTime();
            const dataAtual = new Date(dataHoraPagamento).getTime();

            existente.valor_total += valorPagamento;
            if (dataAtual > dataExistente) {
              existente.criado_em = dataHoraPagamento;
            }
          }
        }
      });

      const quantidadeHoje = vendasHojeMap.size;
      const quantidadeMes = vendasMesSet.size;
      const ticketMedio =
        quantidadeHoje > 0 ? totalRecebidoHoje / quantidadeHoje : 0;
      const ticketMedioMes =
        quantidadeMes > 0 ? totalRecebidoMes / quantidadeMes : 0;
      // Calcular meta diária usando os dias úteis configurados
      const metaDiariaValor = metaMensalAtual / diasUteisAtual;

      // Progresso das metas
      const progressoMensal = (totalRecebidoMes / metaMensalAtual) * 100;
      const faltandoMensal = Math.max(0, metaMensalAtual - totalRecebidoMes);
      const progressoDiario = (totalRecebidoHoje / metaDiariaValor) * 100;
      const faltandoDiario = Math.max(0, metaDiariaValor - totalRecebidoHoje);

      // Ordens de serviço (se for técnico)
      let ordensServico = {
        aguardando: 0,
        em_andamento: 0,
        concluidas_mes: 0,
      };

      if (perfil === "tecnico") {
        const { data: osAguardando } = await supabase
          .from("ordem_servico")
          .select("id", { count: "exact", head: true })
          .eq("tecnico_responsavel", usuario.id)
          .eq("status", "aguardando");

        const { data: osAndamento } = await supabase
          .from("ordem_servico")
          .select("id", { count: "exact", head: true })
          .eq("tecnico_responsavel", usuario.id)
          .in("status", ["em_andamento", "em_diagnostico"]);

        const { data: osConcluidas } = await supabase
          .from("ordem_servico")
          .select("id", { count: "exact", head: true })
          .eq("tecnico_responsavel", usuario.id)
          .eq("status", "concluida")
          .gte("data_conclusao", inicioMes.toISOString())
          .lte("data_conclusao", fimMes.toISOString());

        ordensServico = {
          aguardando: osAguardando?.length || 0,
          em_andamento: osAndamento?.length || 0,
          concluidas_mes: osConcluidas?.length || 0,
        };
      }

      // Últimas 5 vendas (por data)
      let queryVendasPendentes = supabase
        .from("vendas")
        .select(
          "id, numero_venda, valor_total, valor_pago, data_prevista_pagamento, criado_em, status, cliente:clientes(nome)",
        )
        .eq("vendedor_id", usuario.id)
        .neq("status", "cancelada")
        .order("data_prevista_pagamento", { ascending: true })
        .order("criado_em", { ascending: false });

      if (lojaId) {
        queryVendasPendentes = queryVendasPendentes.eq("loja_id", lojaId);
      }

      const { data: vendasPendentes, error: erroVendasPendentes } =
        await queryVendasPendentes;

      if (erroVendasPendentes) {
        throw erroVendasPendentes;
      }

      const listaPendentes = (vendasPendentes || [])
        .map((venda: any) => {
          const valorTotal = Number(venda.valor_total || 0);
          const valorPago = Number(venda.valor_pago || 0);
          const saldoDevedor = Math.max(0, valorTotal - valorPago);

          return {
            id: String(venda.id),
            numero_venda: Number(venda.numero_venda || 0),
            saldo_devedor: saldoDevedor,
            data_prevista_pagamento: venda.data_prevista_pagamento || undefined,
            criado_em: venda.criado_em,
            cliente_nome: venda.cliente?.nome || undefined,
            status: venda.status || undefined,
          };
        })
        .filter((venda) => venda.saldo_devedor > 0);

      const totalPendenteReceber = listaPendentes.reduce(
        (acumulado, venda) => acumulado + venda.saldo_devedor,
        0,
      );

      const ultimasVendasArray = Array.from(vendasHojeMap.values())
        .sort((a, b) => {
          const dataA = new Date(a.criado_em).getTime();
          const dataB = new Date(b.criado_em).getTime();

          return dataB - dataA;
        })
        .slice(0, 5);

      setMetricas({
        vendasHoje: {
          total: totalRecebidoHoje,
          quantidade: quantidadeHoje,
          ticket_medio: ticketMedio,
        },
        vendasMes: {
          total: totalRecebidoMes,
          quantidade: quantidadeMes,
          ticket_medio: ticketMedioMes,
        },
        metaMensal: {
          valor: metaMensalAtual,
          progresso: progressoMensal,
          faltando: faltandoMensal,
        },
        metaDiaria: {
          valor: metaDiariaValor,
          progresso: progressoDiario,
          faltando: faltandoDiario,
        },
        ordensServico,
        ultimasVendas: ultimasVendasArray,
        vendasPendentesRecebimentoTotal: totalPendenteReceber,
        vendasPendentesRecebimento: listaPendentes,
        vendasPendentesRecebimentoQuantidade: listaPendentes.length,
      });
    } catch (error) {
      console.error("Erro ao carregar métricas:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spinner label="Carregando seu dashboard..." size="lg" />
      </div>
    );
  }

  if (!metricas) {
    return (
      <Card>
        <CardBody>
          <p className="text-center text-default-500">
            Não foi possível carregar as métricas
          </p>
        </CardBody>
      </Card>
    );
  }

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor);
  };

  const totalPaginasPendentes = Math.max(
    1,
    Math.ceil(
      metricas.vendasPendentesRecebimentoQuantidade /
        ITENS_POR_PAGINA_PENDENTES,
    ),
  );
  const paginaPendentesAtual = Math.min(
    Math.max(paginaPendentes, 1),
    totalPaginasPendentes,
  );
  const inicioPendentes =
    (paginaPendentesAtual - 1) * ITENS_POR_PAGINA_PENDENTES;
  const fimPendentes = inicioPendentes + ITENS_POR_PAGINA_PENDENTES;
  const vendasPendentesPaginadas = metricas.vendasPendentesRecebimento.slice(
    inicioPendentes,
    fimPendentes,
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Cabeçalho */}
      <div className="relative overflow-hidden rounded-2xl bg-primary-600 p-10 text-white shadow-lg">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <h1 className="text-4xl font-bold tracking-tight">
              Olá, {usuario?.nome?.split(" ")[0]}! 👋
            </h1>
          </div>
          <p className="text-white/90 text-lg">
            Aqui está o resumo do seu desempenho hoje
          </p>
          <div className="mt-4">
            <div className="inline-block px-3 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-sm">
              {new Date().toLocaleDateString("pt-BR", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Cards de métricas principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Vendas de Hoje */}
        <div className="animate-in slide-in-from-bottom-4 duration-500 delay-100">
          <Card className="border-none shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 duration-300">
            <CardBody className="gap-3 p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 rounded-xl bg-primary-100 dark:bg-primary-900/30">
                  <ShoppingCart className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                </div>
                <span className="text-sm font-semibold text-default-600 uppercase tracking-wide">
                  Recebido Hoje
                </span>
              </div>
              <div>
                <p className="text-3xl font-bold text-default-900">
                  {formatarMoeda(metricas.vendasHoje.total)}
                </p>
                <p className="text-sm text-default-500 mt-1">
                  {metricas.vendasHoje.quantidade} vendas
                </p>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Ticket Médio */}
        <div className="animate-in slide-in-from-bottom-4 duration-500 delay-200">
          <Card className="border-none shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 duration-300">
            <CardBody className="gap-3 p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 rounded-xl bg-success-100 dark:bg-success-900/30">
                  <DollarSign className="w-5 h-5 text-success-600 dark:text-success-400" />
                </div>
                <span className="text-sm font-semibold text-default-600 uppercase tracking-wide">
                  Ticket Médio
                </span>
              </div>
              <div>
                <p className="text-3xl font-bold text-default-900">
                  {formatarMoeda(metricas.vendasMes.ticket_medio)}
                </p>
                <p className="text-sm text-default-500 mt-1">
                  por venda recebida no mês
                </p>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Vendas do Mês */}
        <div className="animate-in slide-in-from-bottom-4 duration-500 delay-300">
          <Card className="border-none shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 duration-300">
            <CardBody className="gap-3 p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 rounded-xl bg-warning-100 dark:bg-warning-900/30">
                  <TrendingUp className="w-5 h-5 text-warning-600 dark:text-warning-400" />
                </div>
                <span className="text-sm font-semibold text-default-600 uppercase tracking-wide">
                  Recebido no Mês
                </span>
              </div>
              <div>
                <p className="text-3xl font-bold text-default-900">
                  {formatarMoeda(metricas.vendasMes.total)}
                </p>
                <p className="text-sm text-default-500 mt-1">
                  {metricas.vendasMes.quantidade} vendas
                </p>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Meta do Mês */}
        <div className="animate-in slide-in-from-bottom-4 duration-500 delay-400">
          <Card className="border-none shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 duration-300">
            <CardBody className="gap-3 p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 rounded-xl bg-secondary-100 dark:bg-secondary-900/30">
                  <Target className="w-5 h-5 text-secondary-600 dark:text-secondary-400" />
                </div>
                <span className="text-sm font-semibold text-default-600 uppercase tracking-wide">
                  Meta de Recebimento
                </span>
              </div>
              <div>
                <p className="text-3xl font-bold text-default-900">
                  {metricas.metaMensal.progresso.toFixed(0)}%
                </p>
                <p className="text-sm text-default-500 mt-1">
                  Falta {formatarMoeda(metricas.metaMensal.faltando)}
                </p>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Progresso das Metas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in slide-in-from-bottom-4 duration-500 delay-500">
        {/* Meta Diária */}
        <Card className="border-none shadow-md hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex gap-3 pb-3">
            <div className="p-3 rounded-xl bg-primary-100 dark:bg-primary-900/30">
              <Calendar className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div className="flex flex-col">
              <p className="text-lg font-bold">Meta Diária</p>
              <p className="text-sm text-default-500">
                {formatarMoeda(metricas.metaDiaria.valor)} de recebimento por
                dia
              </p>
            </div>
          </CardHeader>
          <Divider />
          <CardBody className="gap-4 pt-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-xs text-default-500 font-semibold uppercase mb-1">
                    Realizado
                  </p>
                  <p className="text-xl font-bold text-default-900">
                    {formatarMoeda(metricas.vendasHoje.total)}
                  </p>
                </div>
                <Chip
                  className="font-bold"
                  color={
                    metricas.metaDiaria.progresso >= 100
                      ? "success"
                      : metricas.metaDiaria.progresso >= 50
                        ? "warning"
                        : "danger"
                  }
                  size="md"
                  variant="flat"
                >
                  {metricas.metaDiaria.progresso.toFixed(1)}%
                </Chip>
              </div>
              <Progress
                aria-label="Progresso da meta diária"
                className="h-2"
                color={
                  metricas.metaDiaria.progresso >= 100
                    ? "success"
                    : metricas.metaDiaria.progresso >= 50
                      ? "warning"
                      : "danger"
                }
                size="md"
                value={Math.min(metricas.metaDiaria.progresso, 100)}
              />
              {metricas.metaDiaria.faltando > 0 ? (
                <p className="text-sm text-default-500">
                  💪 Faltam {formatarMoeda(metricas.metaDiaria.faltando)} para
                  atingir a meta
                </p>
              ) : null}
              {metricas.metaDiaria.progresso >= 100 && (
                <div className="flex items-center gap-2 p-3 bg-success-50 dark:bg-success-900/20 rounded-xl">
                  <Award className="w-5 h-5 text-success-600" />
                  <span className="text-sm font-bold text-success-600">
                    🎉 Meta diária atingida!
                  </span>
                </div>
              )}
            </div>
          </CardBody>
        </Card>

        {/* Meta Mensal */}
        <Card className="border-none shadow-md hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex gap-3 pb-3">
            <div className="p-3 rounded-xl bg-secondary-100 dark:bg-secondary-900/30">
              <Target className="w-6 h-6 text-secondary-600 dark:text-secondary-400" />
            </div>
            <div className="flex flex-col">
              <p className="text-lg font-bold">Meta Mensal</p>
              <p className="text-sm text-default-500">
                {formatarMoeda(metricas.metaMensal.valor)} de recebimento no mês
              </p>
            </div>
          </CardHeader>
          <Divider />
          <CardBody className="gap-4 pt-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-xs text-default-500 font-semibold uppercase mb-1">
                    Realizado
                  </p>
                  <p className="text-xl font-bold text-default-900">
                    {formatarMoeda(metricas.vendasMes.total)}
                  </p>
                </div>
                <Chip
                  className="font-bold"
                  color={
                    metricas.metaMensal.progresso >= 100
                      ? "success"
                      : metricas.metaMensal.progresso >= 70
                        ? "warning"
                        : "danger"
                  }
                  size="md"
                  variant="flat"
                >
                  {metricas.metaMensal.progresso.toFixed(1)}%
                </Chip>
              </div>
              <Progress
                aria-label="Progresso da meta mensal"
                className="h-2"
                color={
                  metricas.metaMensal.progresso >= 100
                    ? "success"
                    : metricas.metaMensal.progresso >= 70
                      ? "warning"
                      : "danger"
                }
                size="md"
                value={Math.min(metricas.metaMensal.progresso, 100)}
              />
              {metricas.metaMensal.faltando > 0 ? (
                <p className="text-sm text-default-500">
                  🎯 Faltam {formatarMoeda(metricas.metaMensal.faltando)} para
                  atingir a meta
                </p>
              ) : null}
              {metricas.metaMensal.progresso >= 100 && (
                <div className="flex items-center gap-2 p-3 bg-success-50 dark:bg-success-900/20 rounded-xl">
                  <Award className="w-5 h-5 text-success-600" />
                  <span className="text-sm font-bold text-success-600">
                    🎉 Meta mensal atingida!
                  </span>
                </div>
              )}
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Ordens de Serviço (se for técnico) */}
      {perfil === "tecnico" && (
        <Card className="border-none shadow-lg">
          <CardHeader className="pb-3">
            <h3 className="text-xl font-bold">📋 Minhas Ordens de Serviço</h3>
          </CardHeader>
          <Divider />
          <CardBody className="pt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-4 p-5 bg-gradient-to-br from-warning-50 to-warning-100 dark:from-warning-900/20 dark:to-warning-800/20 rounded-xl shadow-md hover:shadow-lg transition-shadow">
                <div className="p-3 rounded-xl bg-gradient-to-br from-warning-500 to-warning-600 shadow-md">
                  <Clock className="w-7 h-7 text-white" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-warning-600">
                    {metricas.ordensServico.aguardando}
                  </p>
                  <p className="text-sm font-medium text-default-600">
                    Aguardando
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-5 bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 rounded-xl shadow-md hover:shadow-lg transition-shadow">
                <div className="p-3 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 shadow-md">
                  <AlertCircle className="w-7 h-7 text-white" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-primary-600">
                    {metricas.ordensServico.em_andamento}
                  </p>
                  <p className="text-sm font-medium text-default-600">
                    Em Andamento
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-5 bg-gradient-to-br from-success-50 to-success-100 dark:from-success-900/20 dark:to-success-800/20 rounded-xl shadow-md hover:shadow-lg transition-shadow">
                <div className="p-3 rounded-xl bg-gradient-to-br from-success-500 to-success-600 shadow-md">
                  <CheckCircle className="w-7 h-7 text-white" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-success-600">
                    {metricas.ordensServico.concluidas_mes}
                  </p>
                  <p className="text-sm font-medium text-default-600">
                    Concluídas este mês
                  </p>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Últimas Vendas */}
      <div className="animate-in slide-in-from-bottom-4 duration-500 delay-650">
        <Card className="border-none shadow-md hover:shadow-lg transition-all duration-300">
          <CardHeader className="pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold">Vendas que Faltam Receber</h3>
              <p className="text-sm text-default-500">
                Apenas vendas feitas por voce
              </p>
            </div>
            <Chip color="warning" variant="flat">
              {metricas.vendasPendentesRecebimentoQuantidade} pendente(s)
            </Chip>
          </CardHeader>
          <Divider />
          <CardBody className="pt-4 space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-warning-50 dark:bg-warning-900/20">
              <p className="text-sm font-semibold text-default-600">
                Total pendente de recebimento
              </p>
              <p className="text-xl font-bold text-warning-600">
                {formatarMoeda(metricas.vendasPendentesRecebimentoTotal)}
              </p>
            </div>
            {metricas.vendasPendentesRecebimento.length > 0 ? (
              <div className="space-y-2">
                {metricas.vendasPendentesRecebimentoQuantidade >
                ITENS_POR_PAGINA_PENDENTES ? (
                  <p className="text-xs text-default-500">
                    Mostrando {inicioPendentes + 1} a{" "}
                    {Math.min(
                      fimPendentes,
                      metricas.vendasPendentesRecebimentoQuantidade,
                    )}{" "}
                    de {metricas.vendasPendentesRecebimentoQuantidade}{" "}
                    pendencias.
                  </p>
                ) : null}
                {vendasPendentesPaginadas.map((venda) => (
                  <div
                    key={venda.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-default-50 dark:bg-default-900/10"
                  >
                    <div>
                      <p className="font-semibold text-default-900">
                        Venda #{String(venda.numero_venda).padStart(6, "0")}
                      </p>
                      <p className="text-xs text-default-500">
                        {venda.cliente_nome || "Cliente nao informado"}
                        {venda.data_prevista_pagamento
                          ? ` - Vencimento: ${new Date(venda.data_prevista_pagamento).toLocaleDateString("pt-BR")}`
                          : ""}
                      </p>
                    </div>
                    <p className="font-bold text-warning-600">
                      {formatarMoeda(venda.saldo_devedor)}
                    </p>
                  </div>
                ))}
                {totalPaginasPendentes > 1 ? (
                  <div className="flex items-center justify-end gap-2 pt-2">
                    <Button
                      isDisabled={paginaPendentesAtual <= 1}
                      size="sm"
                      variant="flat"
                      onPress={() =>
                        setPaginaPendentes((prev) => Math.max(1, prev - 1))
                      }
                    >
                      Anterior
                    </Button>
                    <p className="text-xs text-default-500 min-w-[92px] text-center">
                      Pagina {paginaPendentesAtual} de {totalPaginasPendentes}
                    </p>
                    <Button
                      isDisabled={paginaPendentesAtual >= totalPaginasPendentes}
                      size="sm"
                      variant="flat"
                      onPress={() =>
                        setPaginaPendentes((prev) =>
                          Math.min(totalPaginasPendentes, prev + 1),
                        )
                      }
                    >
                      Proxima
                    </Button>
                  </div>
                ) : null}
              </div>
            ) : (
              <p className="text-sm text-default-500">
                Voce nao possui vendas pendentes de recebimento.
              </p>
            )}
          </CardBody>
        </Card>
      </div>

      {metricas.ultimasVendas.length > 0 && (
        <div className="animate-in slide-in-from-bottom-4 duration-500 delay-700">
          <Card className="border-none shadow-md hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="pb-3 flex items-center gap-3">
              <div className="p-3 rounded-xl bg-primary-100 dark:bg-primary-900/30">
                <ShoppingCart className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="text-xl font-bold">
                Últimas Vendas de Hoje (Recebido)
              </h3>
            </CardHeader>
            <Divider />
            <CardBody className="pt-4">
              <div className="space-y-3">
                {metricas.ultimasVendas.map((venda, index) => (
                  <div
                    key={venda.id}
                    className="flex items-center justify-between p-4 bg-default-50 dark:bg-default-900/10 rounded-xl hover:bg-default-100 dark:hover:bg-default-800/20 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-lg bg-primary-100 dark:bg-primary-900/30">
                        <ShoppingCart className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                      </div>
                      <div>
                        <p className="font-bold text-default-900">
                          Venda #{String(venda.numero_venda).padStart(6, "0")}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Clock className="w-3.5 h-3.5 text-default-400" />
                          <p className="text-xs text-default-500">
                            {new Date(venda.criado_em).toLocaleTimeString(
                              "pt-BR",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-success-600">
                        {formatarMoeda(Number(venda.valor_total))}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {/* Botão de Atualizar */}
      <div className="flex justify-center pt-4 animate-in fade-in duration-500 delay-1000">
        <Button
          className="font-semibold"
          color="primary"
          size="lg"
          startContent={<TrendingUp className="w-5 h-5" />}
          variant="shadow"
          onPress={carregarMetricas}
        >
          Atualizar Dados
        </Button>
      </div>
    </div>
  );
}
