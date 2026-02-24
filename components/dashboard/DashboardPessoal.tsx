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
}

export default function DashboardPessoal() {
  const { usuario } = useAuthContext();
  const { lojaId, perfil } = usePermissoes();
  const [metricas, setMetricas] = useState<MetricasPessoais | null>(null);
  const [loading, setLoading] = useState(true);
  const [metaMensal, setMetaMensal] = useState(10000);
  const [diasUteis, setDiasUteis] = useState(26);

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
      const inicioHoje = new Date(
        hoje.getFullYear(),
        hoje.getMonth(),
        hoje.getDate(),
      );
      const fimHoje = new Date(
        hoje.getFullYear(),
        hoje.getMonth(),
        hoje.getDate(),
        23,
        59,
        59,
      );

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

      // Buscar vendas do vendedor no mês
      let queryVendasMes = supabase
        .from("vendas")
        .select(`
          id,
          numero_venda,
          valor_total,
          criado_em,
          finalizado_em,
          status
        `)
        .eq("vendedor_id", usuario.id)
        .gte("criado_em", inicioMes.toISOString())
        .lte("criado_em", fimMes.toISOString())
        .in("status", ["concluida", "devolvida"]);

      if (lojaId) {
        queryVendasMes = queryVendasMes.eq("loja_id", lojaId);
      }

      const { data: vendasMes, error: erroVendasMes } = await queryVendasMes;

      if (erroVendasMes) {
        throw erroVendasMes;
      }

      // Buscar itens de todas as vendas (em lotes)
      const vendaIds = vendasMes?.map(v => v.id) || [];
      let itensVendas: any[] = [];

      if (vendaIds.length > 0) {
        const batchSize = 100; // 100 vendas por vez
        
        for (let i = 0; i < vendaIds.length; i += batchSize) {
          const batch = vendaIds.slice(i, i + batchSize);
          
          const { data: itens, error: erroItens } = await supabase
            .from("itens_venda")
            .select(`
              id,
              venda_id,
              produto_id,
              quantidade,
              preco_unitario,
              subtotal
            `)
            .in("venda_id", batch);

          if (!erroItens && itens) {
            itensVendas.push(...itens);
          }
        }
      }

      // Buscar produtos para calcular lucro (em lotes para evitar URL muito longa)
      const produtoIds = Array.from(new Set(itensVendas.map(i => i.produto_id)));
      let produtos: Map<string, any> = new Map();

      if (produtoIds.length > 0) {
        const batchSize = 50; // Buscar 50 produtos por vez
        
        for (let i = 0; i < produtoIds.length; i += batchSize) {
          const batch = produtoIds.slice(i, i + batchSize);
          
          const { data: produtosData, error: erroProdutos } = await supabase
            .from("produtos")
            .select("id, preco_compra, preco_venda")
            .in("id", batch);

          if (!erroProdutos && produtosData) {
            produtosData.forEach(p => produtos.set(p.id, p));
          }
        }
      }

      // Calcular lucros
      let lucroTotalMes = 0;
      let lucroTotalHoje = 0;
      let vendasHoje: any[] = [];

      vendasMes?.forEach(venda => {
        const itensVenda = itensVendas.filter(i => i.venda_id === venda.id);
        let lucroVenda = 0;

        itensVenda.forEach(item => {
          const produto = produtos.get(item.produto_id);
          if (produto) {
            const precoCompra = Number(produto.preco_compra || 0);
            const precoVenda = Number(item.preco_unitario || 0);
            const quantidade = Number(item.quantidade || 0);
            const lucroItem = (precoVenda - precoCompra) * quantidade;
            lucroVenda += lucroItem;
          }
        });

        lucroTotalMes += lucroVenda;

        // Verificar se a venda foi hoje
        const dataVenda = new Date(venda.criado_em);
        if (dataVenda >= inicioHoje && dataVenda <= fimHoje) {
          lucroTotalHoje += lucroVenda;
          vendasHoje.push(venda);
        }
      });

      const quantidadeHoje = vendasHoje.length;
      const quantidadeMes = vendasMes?.length || 0;
      const ticketMedio = quantidadeHoje > 0 ? lucroTotalHoje / quantidadeHoje : 0;
      const ticketMedioMes = quantidadeMes > 0 ? lucroTotalMes / quantidadeMes : 0;

      // Calcular meta diária usando os dias úteis configurados
      const metaDiariaValor = metaMensalAtual / diasUteisAtual;

      // Progresso das metas
      const progressoMensal = (lucroTotalMes / metaMensalAtual) * 100;
      const faltandoMensal = Math.max(0, metaMensalAtual - lucroTotalMes);
      const progressoDiario = (lucroTotalHoje / metaDiariaValor) * 100;
      const faltandoDiario = Math.max(0, metaDiariaValor - lucroTotalHoje);

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
      const ultimasVendasArray = vendasHoje
        .sort((a, b) => {
          const dataA = new Date(a.criado_em).getTime();
          const dataB = new Date(b.criado_em).getTime();
          return dataB - dataA;
        })
        .slice(0, 5)
        .map((venda) => {
          // Calcular lucro individual da venda
          const itensVenda = itensVendas.filter(i => i.venda_id === venda.id);
          let lucroVenda = 0;

          itensVenda.forEach(item => {
            const produto = produtos.get(item.produto_id);
            if (produto) {
              const precoCompra = Number(produto.preco_compra || 0);
              const precoVenda = Number(item.preco_unitario || 0);
              const quantidade = Number(item.quantidade || 0);
              lucroVenda += (precoVenda - precoCompra) * quantidade;
            }
          });

          return {
            id: venda.id,
            numero_venda: Number(venda.numero_venda || 0),
            valor_total: lucroVenda,
            criado_em: venda.criado_em,
          };
        });

      setMetricas({
        vendasHoje: {
          total: lucroTotalHoje,
          quantidade: quantidadeHoje,
          ticket_medio: ticketMedio,
        },
        vendasMes: {
          total: lucroTotalMes,
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
                  Lucro Hoje
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
                  Lucro Médio
                </span>
              </div>
              <div>
                <p className="text-3xl font-bold text-default-900">
                  {formatarMoeda(metricas.vendasMes.ticket_medio)}
                </p>
                <p className="text-sm text-default-500 mt-1">por venda (média do mês)</p>
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
                  Lucro do Mês
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
                  Meta de Lucro
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
                {formatarMoeda(metricas.metaDiaria.valor)} de lucro por dia
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
                {formatarMoeda(metricas.metaMensal.valor)} de lucro no mês
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
      {metricas.ultimasVendas.length > 0 && (
        <div className="animate-in slide-in-from-bottom-4 duration-500 delay-700">
          <Card className="border-none shadow-md hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="pb-3 flex items-center gap-3">
              <div className="p-3 rounded-xl bg-primary-100 dark:bg-primary-900/30">
                <ShoppingCart className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="text-xl font-bold">
                Últimas Vendas de Hoje (Lucro)
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
