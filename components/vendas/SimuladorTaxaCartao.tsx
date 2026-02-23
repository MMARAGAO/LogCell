"use client";

import type {
  ResultadoSimulacaoTaxa,
  TipoProdutoTaxa,
  FormaPagamentoTaxa,
} from "@/types/taxasCartao";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Select,
  SelectItem,
  Divider,
} from "@heroui/react";
import {
  Calculator,
  CreditCard,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Percent,
  AlertCircle,
} from "lucide-react";

import { simularTaxaCartao } from "@/services/taxasCartaoService";

interface SimuladorTaxaCartaoProps {
  valorVenda: number;
  valorCusto?: number;
  tipoProdutoPadrao?: TipoProdutoTaxa;
  onSimulacaoChange?: (resultado: ResultadoSimulacaoTaxa | null) => void;
  mostrarDetalhes?: boolean;
}

const TIPOS_PRODUTO = [
  { value: "aparelho", label: "Aparelho" },
  { value: "acessorio", label: "Acessório" },
  { value: "servico", label: "Serviço" },
  { value: "todos", label: "Todos" },
];

const FORMAS_PAGAMENTO = [
  { value: "cartao_credito", label: "Cartão de Crédito" },
  { value: "cartao_debito", label: "Cartão de Débito" },
];

const OPCOES_PARCELAS = [
  { value: 1, label: "À vista" },
  { value: 2, label: "2x" },
  { value: 3, label: "3x" },
  { value: 4, label: "4x" },
  { value: 5, label: "5x" },
  { value: 6, label: "6x" },
  { value: 7, label: "7x" },
  { value: 8, label: "8x" },
  { value: 9, label: "9x" },
  { value: 10, label: "10x" },
  { value: 11, label: "11x" },
  { value: 12, label: "12x" },
];

export function SimuladorTaxaCartao({
  valorVenda,
  valorCusto = 0,
  tipoProdutoPadrao = "todos",
  onSimulacaoChange,
  mostrarDetalhes = true,
}: SimuladorTaxaCartaoProps) {
  const [tipoProduto, setTipoProduto] =
    useState<TipoProdutoTaxa>(tipoProdutoPadrao);
  const [formaPagamento, setFormaPagamento] =
    useState<FormaPagamentoTaxa>("cartao_credito");
  const [parcelas, setParcelas] = useState(1);
  const [resultado, setResultado] = useState<ResultadoSimulacaoTaxa | null>(
    null,
  );
  const [loading, setLoading] = useState(false);

  const formatarMoeda = (valor: number) => {
    return valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const formatarPercentual = (valor: number) => {
    return `${valor.toFixed(2)}%`;
  };

  useEffect(() => {
    realizarSimulacao();
  }, [valorVenda, valorCusto, tipoProduto, formaPagamento, parcelas]);

  const realizarSimulacao = async () => {
    if (valorVenda <= 0) {
      setResultado(null);
      if (onSimulacaoChange) onSimulacaoChange(null);

      return;
    }

    try {
      setLoading(true);
      const simulacao = await simularTaxaCartao({
        valor_bruto: valorVenda,
        valor_custo: valorCusto,
        tipo_produto: tipoProduto,
        forma_pagamento: formaPagamento,
        parcelas,
      });

      setResultado(simulacao);
      if (onSimulacaoChange) onSimulacaoChange(simulacao);
    } catch (error) {
      console.error("Erro ao simular taxa:", error);
      setResultado(null);
      if (onSimulacaoChange) onSimulacaoChange(null);
    } finally {
      setLoading(false);
    }
  };

  if (valorVenda <= 0) {
    return (
      <Card className="border-2 border-dashed border-default-300">
        <CardBody className="text-center py-8">
          <Calculator className="w-12 h-12 mx-auto text-default-400 mb-2" />
          <p className="text-default-500">
            Adicione produtos para simular a taxa do cartão
          </p>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-primary">
      <CardHeader className="flex gap-3 items-center bg-primary/10">
        <Calculator className="w-5 h-5 text-primary" />
        <div className="flex flex-col flex-1">
          <p className="text-md font-semibold">Simulador de Taxa de Cartão</p>
          <p className="text-small text-default-500">
            Veja o impacto da taxa no lucro da venda
          </p>
        </div>
      </CardHeader>
      <CardBody className="gap-4">
        {/* Seletores */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Select
            label="Tipo de Produto"
            selectedKeys={[tipoProduto]}
            size="sm"
            variant="bordered"
            onChange={(e) => setTipoProduto(e.target.value as TipoProdutoTaxa)}
          >
            {TIPOS_PRODUTO.map((tipo) => (
              <SelectItem key={tipo.value}>{tipo.label}</SelectItem>
            ))}
          </Select>

          <Select
            label="Forma de Pagamento"
            selectedKeys={[formaPagamento]}
            size="sm"
            startContent={<CreditCard className="w-4 h-4" />}
            variant="bordered"
            onChange={(e) =>
              setFormaPagamento(e.target.value as FormaPagamentoTaxa)
            }
          >
            {FORMAS_PAGAMENTO.map((forma) => (
              <SelectItem key={forma.value}>{forma.label}</SelectItem>
            ))}
          </Select>

          <Select
            isDisabled={formaPagamento === "cartao_debito"}
            label="Parcelas"
            selectedKeys={[parcelas.toString()]}
            size="sm"
            variant="bordered"
            onChange={(e) => setParcelas(parseInt(e.target.value))}
          >
            {OPCOES_PARCELAS.map((opcao) => (
              <SelectItem key={opcao.value.toString()}>
                {opcao.label}
              </SelectItem>
            ))}
          </Select>
        </div>

        {resultado && (
          <>
            <Divider />

            {/* Resumo Rápido */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-primary/10 p-3 rounded-lg">
                <p className="text-xs text-default-600 mb-1">Valor Bruto</p>
                <p className="text-lg font-bold text-primary">
                  {formatarMoeda(resultado.valor_bruto)}
                </p>
              </div>

              <div className="bg-danger/10 p-3 rounded-lg">
                <p className="text-xs text-default-600 mb-1 flex items-center gap-1">
                  Taxa ({formatarPercentual(resultado.taxa_percentual)})
                </p>
                <p className="text-lg font-bold text-danger">
                  - {formatarMoeda(resultado.valor_taxa)}
                </p>
              </div>

              <div className="bg-success/10 p-3 rounded-lg">
                <p className="text-xs text-default-600 mb-1">Valor Líquido</p>
                <p className="text-lg font-bold text-success">
                  {formatarMoeda(resultado.valor_liquido)}
                </p>
              </div>

              <div className="bg-warning/10 p-3 rounded-lg">
                <p className="text-xs text-default-600 mb-1">Lucro c/ Taxa</p>
                <p
                  className={`text-lg font-bold ${
                    resultado.lucro_com_taxa > 0
                      ? "text-success"
                      : "text-danger"
                  }`}
                >
                  {formatarMoeda(resultado.lucro_com_taxa)}
                </p>
              </div>
            </div>

            {mostrarDetalhes && (
              <>
                <Divider />

                {/* Detalhes Completos */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-default-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-default-600" />
                      <span className="text-sm font-medium">
                        Valor de Custo
                      </span>
                    </div>
                    <span className="text-sm font-bold">
                      {formatarMoeda(resultado.valor_custo)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-default-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-success" />
                      <span className="text-sm font-medium">
                        Lucro SEM Taxa
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-success">
                        {formatarMoeda(resultado.lucro_sem_taxa)}
                      </p>
                      <p className="text-xs text-default-500">
                        Margem:{" "}
                        {formatarPercentual(
                          resultado.margem_lucro_sem_taxa_percentual,
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-warning/10 rounded-lg border-2 border-warning">
                    <div className="flex items-center gap-2">
                      <TrendingDown className="w-4 h-4 text-warning" />
                      <span className="text-sm font-medium">
                        Lucro COM Taxa
                      </span>
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-sm font-bold ${
                          resultado.lucro_com_taxa > 0
                            ? "text-success"
                            : "text-danger"
                        }`}
                      >
                        {formatarMoeda(resultado.lucro_com_taxa)}
                      </p>
                      <p className="text-xs text-default-500">
                        Margem:{" "}
                        {formatarPercentual(
                          resultado.margem_lucro_com_taxa_percentual,
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Comparação de Lucro */}
                  <div className="flex justify-between items-center p-3 bg-danger/10 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Percent className="w-4 h-4 text-danger" />
                      <span className="text-sm font-medium">
                        Redução no Lucro
                      </span>
                    </div>
                    <span className="text-sm font-bold text-danger">
                      - {formatarMoeda(resultado.valor_taxa)} (
                      {formatarPercentual(resultado.taxa_percentual)})
                    </span>
                  </div>

                  {/* Alerta se o lucro com taxa for negativo ou muito baixo */}
                  {resultado.lucro_com_taxa <= 0 && (
                    <div className="flex items-start gap-2 p-3 bg-danger/20 border-2 border-danger rounded-lg">
                      <AlertCircle className="w-5 h-5 text-danger flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-danger">
                          Atenção: Lucro Negativo!
                        </p>
                        <p className="text-xs text-danger/80 mt-1">
                          Com esta taxa, você terá prejuízo nesta venda.
                          Considere negociar outra forma de pagamento ou ajustar
                          o valor.
                        </p>
                      </div>
                    </div>
                  )}

                  {resultado.lucro_com_taxa > 0 &&
                    resultado.margem_lucro_com_taxa_percentual < 10 && (
                      <div className="flex items-start gap-2 p-3 bg-warning/20 border-2 border-warning rounded-lg">
                        <AlertCircle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-warning">
                            Margem de Lucro Baixa
                          </p>
                          <p className="text-xs text-warning/80 mt-1">
                            A margem de lucro com esta taxa está abaixo de 10%.
                            Avalie se compensa este pagamento.
                          </p>
                        </div>
                      </div>
                    )}
                </div>
              </>
            )}

            {/* Informações da parcela */}
            {parcelas > 1 && (
              <div className="bg-primary/5 p-3 rounded-lg border border-primary/20">
                <p className="text-sm text-center">
                  <span className="font-semibold">Valor por parcela:</span>{" "}
                  {formatarMoeda(resultado.valor_bruto / parcelas)} x {parcelas}
                </p>
              </div>
            )}
          </>
        )}
      </CardBody>
    </Card>
  );
}
