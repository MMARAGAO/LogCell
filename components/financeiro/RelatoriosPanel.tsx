"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  Tab,
  Tabs,
  Select,
  SelectItem,
  Button,
  Spinner,
} from "@heroui/react";
import {
  getLucroLiquidoReal,
  getComparativoMensal,
  getAnaliseGrowth,
  getMargensPorVendedor,
  LucroLiquidoReal,
  ComparativoMensal,
  GrowthAnalysis,
  MargeLucroVendedor,
} from "@/services/financeiroService";
import { useLojaFilter } from "@/hooks/useLojaFilter";
import { useNotificacao } from "@/hooks/useNotificacao";

export default function RelatoriosPanel() {
  const { lojaId } = useLojaFilter();
  const { showNotificacao } = useNotificacao();

  // Estado
  const [mes, setMes] = useState(new Date().getMonth() + 1);
  const [ano, setAno] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);

  // Dados
  const [lucroLiquido, setLucroLiquido] = useState<LucroLiquidoReal | null>(
    null,
  );
  const [comparativos, setComparativos] = useState<ComparativoMensal[]>([]);
  const [crescimento, setCrescimento] = useState<GrowthAnalysis[]>([]);
  const [margens, setMargens] = useState<MargeLucroVendedor[]>([]);

  // Helpers
  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor);
  };

  const formatarPercentual = (valor: number) => `${valor.toFixed(2)}%`;

  const getCorVariacao = (variacao: number) => {
    if (variacao > 0) return "text-red-500"; // Aumento de despesa = ruim
    if (variacao < 0) return "text-green-500"; // Diminuição = bom

    return "text-gray-500";
  };

  const getEmoji = (tipo: string) => {
    const emojiMap: { [key: string]: string } = {
      lucro: "💰",
      despesa: "⚠️",
      folha: "👥",
      impostos: "🏛️",
      custos: "📦",
      outras: "💼",
      crescimento: "📈",
      queda: "📉",
      estavel: "➡️",
    };

    return emojiMap[tipo] || "📊";
  };

  // Carregar todos os dados
  const carregarDados = async () => {
    if (!lojaId) {
      showNotificacao("Selecione uma loja para visualizar relatórios", "error");

      return;
    }

    setLoading(true);
    try {
      const [lucro, comp, cresc, marg] = await Promise.all([
        getLucroLiquidoReal(mes, ano, lojaId),
        getComparativoMensal(lojaId, 6),
        getAnaliseGrowth(lojaId, 6),
        getMargensPorVendedor(mes, ano),
      ]);

      setLucroLiquido(lucro);
      setComparativos(comp);
      setCrescimento(cresc);
      setMargens(marg);

      showNotificacao("Relatórios carregados com sucesso", "success");
    } catch (error) {
      console.error("Erro ao carregar relatórios:", error);
      showNotificacao("Erro ao carregar relatórios", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, [lojaId, mes, ano]);

  if (!lojaId) {
    return (
      <Card className="w-full">
        <CardBody className="text-center py-10">
          <p className="text-gray-500">
            Selecione uma loja para visualizar os relatórios
          </p>
        </CardBody>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="w-full">
        <CardBody className="flex items-center justify-center py-20">
          <Spinner label="Carregando relatórios..." />
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex gap-4 bg-white dark:bg-slate-900 p-4 rounded-lg">
        <div className="w-32">
          <Select
            label="Mês"
            selectedKeys={new Set([mes.toString()])}
            size="sm"
            onSelectionChange={(keys) => {
              const value = (keys as Set<string>).values().next().value;

              if (value) setMes(parseInt(value));
            }}
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => {
              const nomeMes = new Date(2024, m - 1).toLocaleDateString(
                "pt-BR",
                { month: "long" },
              );

              return (
                <SelectItem key={m.toString()} textValue={nomeMes}>
                  {nomeMes}
                </SelectItem>
              );
            })}
          </Select>
        </div>

        <div className="w-32">
          <Select
            label="Ano"
            selectedKeys={new Set([ano.toString()])}
            size="sm"
            onSelectionChange={(keys) => {
              const value = (keys as Set<string>).values().next().value;

              if (value) setAno(parseInt(value));
            }}
          >
            {Array.from({ length: 5 }, (_, i) => ano - i).map((a) => (
              <SelectItem key={a.toString()} textValue={a.toString()}>
                {a}
              </SelectItem>
            ))}
          </Select>
        </div>

        <div className="flex-1 flex items-end">
          <Button
            className="w-full"
            color="primary"
            isLoading={loading}
            onPress={carregarDados}
          >
            🔄 Atualizar
          </Button>
        </div>
      </div>

      {/* Card de Lucro Líquido Real */}
      {lucroLiquido && (
        <Card className="w-full border-l-4 border-l-green-500">
          <CardHeader className="flex gap-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
            <div className="text-3xl">{getEmoji("lucro")}</div>
            <div className="flex flex-col">
              <p className="text-lg font-semibold">Lucro Líquido Real</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Período: {lucroLiquido.periodo}
              </p>
            </div>
          </CardHeader>
          <CardBody className="gap-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Receita */}
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Receita Total
                </p>
                <p className="text-lg font-bold text-blue-600">
                  {formatarMoeda(lucroLiquido.receita_total || 0)}
                </p>
              </div>

              {/* Total Despesas */}
              <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Total Despesas
                </p>
                <p className="text-lg font-bold text-red-600">
                  -{formatarMoeda(lucroLiquido.total_despesas)}
                </p>
              </div>

              {/* Lucro Líquido */}
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg col-span-2">
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Lucro Líquido
                </p>
                <p
                  className={`text-2xl font-bold ${
                    lucroLiquido.lucro_liquido >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {formatarMoeda(lucroLiquido.lucro_liquido)}
                </p>
                <p className="text-xs mt-1">
                  Margem: {formatarPercentual(lucroLiquido.margem_liquida)}
                </p>
              </div>
            </div>

            {/* Breakdown de Despesas */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-4 border-t">
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  👥 Folha
                </p>
                <p className="font-semibold">
                  {formatarMoeda(lucroLiquido.folha_pagamento)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  🏛️ Impostos
                </p>
                <p className="font-semibold">
                  {formatarMoeda(lucroLiquido.impostos)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  📦 Custos
                </p>
                <p className="font-semibold">
                  {formatarMoeda(lucroLiquido.custos_operacionais)}
                </p>
              </div>
              <div className="col-span-3">
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  💼 Outras Despesas
                </p>
                <p className="font-semibold">
                  {formatarMoeda(lucroLiquido.outras_despesas)}
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Abas com Análises */}
      <Tabs
        aria-label="Relatórios Detalhados"
        className="w-full"
        color="primary"
        variant="underlined"
      >
        {/* Tab 1: Comparativo Mensal */}
        <Tab key="comparativo" title="📊 Comparativo Mensal">
          <Card className="w-full">
            <CardBody>
              {comparativos.length > 0 ? (
                <Table
                  isStriped
                  aria-label="Comparativo Mensal"
                  className="w-full"
                  color="primary"
                >
                  <TableHeader>
                    <TableColumn>📅 Período</TableColumn>
                    <TableColumn className="text-right">👥 Folha</TableColumn>
                    <TableColumn className="text-right">
                      🏛️ Impostos
                    </TableColumn>
                    <TableColumn className="text-right">📦 Custos</TableColumn>
                    <TableColumn className="text-right">💳 Contas</TableColumn>
                    <TableColumn className="text-right">💸 Vales</TableColumn>
                    <TableColumn className="text-right">
                      🤑 Retiradas
                    </TableColumn>
                    <TableColumn className="text-right">💰 Total</TableColumn>
                  </TableHeader>
                  <TableBody>
                    {comparativos.map((comp) => (
                      <TableRow key={comp.mes_ano}>
                        <TableCell>{comp.mes_ano}</TableCell>
                        <TableCell className="text-right">
                          {formatarMoeda(comp.folha_pagamento)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatarMoeda(comp.impostos)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatarMoeda(comp.custos)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatarMoeda(comp.contas_despesas)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatarMoeda(comp.vales)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatarMoeda(comp.retiradas)}
                        </TableCell>
                        <TableCell className="text-right font-bold">
                          {formatarMoeda(comp.total_despesas)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  Nenhum dado disponível
                </p>
              )}
            </CardBody>
          </Card>
        </Tab>

        {/* Tab 2: Análise de Crescimento */}
        <Tab key="crescimento" title="📈 Análise de Crescimento">
          <Card className="w-full">
            <CardBody>
              {crescimento.length > 0 ? (
                <div className="space-y-3">
                  {crescimento.map((growth) => {
                    const isGrowth = growth.tendencia === "crescimento";
                    const isStable = growth.tendencia === "estavel";
                    const bgColor = isGrowth
                      ? "bg-red-50 dark:bg-red-900/20"
                      : isStable
                        ? "bg-blue-50 dark:bg-blue-900/20"
                        : "bg-green-50 dark:bg-green-900/20";

                    return (
                      <div
                        key={growth.periodo}
                        className={`${bgColor} p-4 rounded-lg`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-2xl">
                                {getEmoji(growth.tendencia)}
                              </span>
                              <div>
                                <p className="font-semibold">
                                  {growth.periodo}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {growth.tendencia.toUpperCase()}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="text-right">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Período anterior:{" "}
                              {formatarMoeda(growth.valor_anterior)}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Período atual: {formatarMoeda(growth.valor_atual)}
                            </p>
                            <p
                              className={`text-lg font-bold mt-1 ${getCorVariacao(growth.variacao_absoluta)}`}
                            >
                              {growth.variacao_absoluta > 0 ? "+" : ""}
                              {formatarMoeda(growth.variacao_absoluta)} (
                              {growth.variacao_percentual > 0 ? "+" : ""}
                              {formatarPercentual(growth.variacao_percentual)})
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  Nenhum dado disponível
                </p>
              )}
            </CardBody>
          </Card>
        </Tab>

        {/* Tab 3: Margens por Vendedor */}
        <Tab key="vendedores" title="👥 Margens por Vendedor">
          <Card className="w-full">
            <CardBody>
              {margens.length > 0 ? (
                <Table
                  isStriped
                  aria-label="Margens por Vendedor"
                  className="w-full"
                  color="primary"
                >
                  <TableHeader>
                    <TableColumn>Vendedor</TableColumn>
                    <TableColumn className="text-right">Comissões</TableColumn>
                    <TableColumn className="text-right">
                      Bonificações
                    </TableColumn>
                    <TableColumn className="text-right">Descontos</TableColumn>
                    <TableColumn className="text-right">
                      Total Ganhos
                    </TableColumn>
                    <TableColumn className="text-right">
                      Taxa de Custos %
                    </TableColumn>
                  </TableHeader>
                  <TableBody>
                    {margens.map((marg, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{marg.vendedor_nome}</TableCell>
                        <TableCell className="text-right text-green-600">
                          {formatarMoeda(marg.comissoes)}
                        </TableCell>
                        <TableCell className="text-right text-blue-600">
                          {formatarMoeda(marg.bonificacoes)}
                        </TableCell>
                        <TableCell className="text-right text-red-600">
                          -{formatarMoeda(marg.descontos)}
                        </TableCell>
                        <TableCell className="text-right font-bold">
                          {formatarMoeda(marg.valor_ganhos)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatarPercentual(marg.taxa_custos)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  Nenhum dado disponível
                </p>
              )}
            </CardBody>
          </Card>
        </Tab>

        {/* Tab 4: Resumo Executivo */}
        <Tab key="resumo" title="📋 Resumo Executivo">
          <Card className="w-full">
            <CardBody className="space-y-4">
              {lucroLiquido && (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Card de Saúde Financeira */}
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        🎯 Saúde Financeira
                      </p>
                      <div className="space-y-1">
                        <p className="text-xs">
                          Taxa de Despesas:{" "}
                          <span className="font-bold">
                            {formatarPercentual(
                              (lucroLiquido.total_despesas /
                                (lucroLiquido.receita_total || 1)) *
                                100 || 0,
                            )}
                          </span>
                        </p>
                        <p className="text-xs">
                          Maior categoria:{" "}
                          <span className="font-bold">
                            {lucroLiquido.folha_pagamento >
                            lucroLiquido.custos_operacionais
                              ? "Folha"
                              : "Custos"}
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* Card de Tendência */}
                    <div className="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        📊 Tendência
                      </p>
                      <div className="space-y-1">
                        {crescimento.length > 0 && (
                          <>
                            <p className="text-xs">
                              Última variação:{" "}
                              <span
                                className={`font-bold ${getCorVariacao(crescimento[crescimento.length - 1].variacao_absoluta)}`}
                              >
                                {crescimento[crescimento.length - 1]
                                  .variacao_percentual > 0
                                  ? "+"
                                  : ""}
                                {formatarPercentual(
                                  crescimento[crescimento.length - 1]
                                    .variacao_percentual,
                                )}
                              </span>
                            </p>
                            <p className="text-xs">
                              Tendência:{" "}
                              <span className="font-bold">
                                {crescimento[
                                  crescimento.length - 1
                                ].tendencia.toUpperCase()}
                              </span>
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Recomendações */}
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-l-yellow-500 p-4 rounded-lg">
                    <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                      💡 Recomendações
                    </p>
                    <ul className="text-sm space-y-1 text-yellow-700 dark:text-yellow-300">
                      {lucroLiquido.folha_pagamento >
                        lucroLiquido.total_despesas * 0.5 && (
                        <li>
                          • Folha de pagamento representa{" "}
                          {formatarPercentual(
                            (lucroLiquido.folha_pagamento /
                              lucroLiquido.total_despesas) *
                              100,
                          )}{" "}
                          das despesas - considere otimizações
                        </li>
                      )}
                      {lucroLiquido.custos_operacionais >
                        lucroLiquido.total_despesas * 0.3 && (
                        <li>
                          • Custos operacionais estão altos - revise Centro de
                          Custos
                        </li>
                      )}
                      {lucroLiquido.margem_liquida < 10 && (
                        <li>
                          • Margem líquida baixa - aumentar eficiência é
                          prioritário
                        </li>
                      )}
                      {lucroLiquido.margem_liquida >= 20 && (
                        <li>✅ Saúde financeira ótima - continue assim!</li>
                      )}
                    </ul>
                  </div>
                </div>
              )}
            </CardBody>
          </Card>
        </Tab>
      </Tabs>
    </div>
  );
}

// Helper para renderizar TableRow (polyfill caso não exista)
function TableRow({ children, ...props }: any) {
  return <TableCell {...props}>{children}</TableCell>;
}
