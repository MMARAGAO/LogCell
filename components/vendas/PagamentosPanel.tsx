"use client";

import React, { useState } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Select,
  SelectItem,
  Input,
  Divider,
  Chip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/react";
import {
  Plus,
  DollarSign,
  Calendar,
  Edit2,
  Trash2,
  Percent,
  Tag,
} from "lucide-react";
import type { PagamentoCarrinho, ItemCarrinho } from "@/types/vendas";
import { usePermissoes } from "@/hooks/usePermissoes";

interface PagamentosPanelProps {
  pagamentos: PagamentoCarrinho[];
  onAdicionarPagamento: (pagamento: PagamentoCarrinho) => void;
  onRemoverPagamento: (index: number) => void;
  onEditarPagamento: (index: number, pagamento: PagamentoCarrinho) => void;
  valorTotal: number;
  valorPago: number;
  saldoDevedor: number;
  creditosDisponiveis?: number;
  subtotalItens?: number;
  descontosItens?: number;
  descontoGeral?: number;
  itens?: ItemCarrinho[];
  onAplicarDescontoGeral?: () => void;
  onAplicarDescontoItem?: (produtoId: string) => void;
  onAplicarDescontoRapido?: (
    tipo: "valor" | "percentual",
    valor: number,
    motivo: string,
  ) => void;
  descontoAplicado?: {
    tipo: "valor" | "percentual";
    valor: number;
    motivo: string;
  } | null;
}

const tiposPagamento = [
  { value: "dinheiro", label: "Dinheiro" },
  { value: "pix", label: "PIX" },
  { value: "cartao_credito", label: "Cartão de Crédito" },
  { value: "cartao_debito", label: "Cartão de Débito" },
  { value: "transferencia", label: "Transferência" },
  { value: "boleto", label: "Boleto" },
  { value: "credito_cliente", label: "Crédito do Cliente" },
];

export function PagamentosPanel({
  pagamentos,
  onAdicionarPagamento,
  onRemoverPagamento,
  onEditarPagamento,
  valorTotal,
  valorPago,
  saldoDevedor,
  creditosDisponiveis = 0,
  subtotalItens = 0,
  descontosItens = 0,
  descontoGeral = 0,
  itens = [],
  onAplicarDescontoGeral,
  onAplicarDescontoItem,
  onAplicarDescontoRapido,
  descontoAplicado,
}: PagamentosPanelProps) {
  const { getDescontoMaximo } = usePermissoes();
  const [tipoPagamento, setTipoPagamento] = useState("dinheiro");
  const [valor, setValor] = useState("");
  const [dataPagamento, setDataPagamento] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [editandoIndex, setEditandoIndex] = useState<number | null>(null);
  const [modalSeletorProdutoOpen, setModalSeletorProdutoOpen] = useState(false);
  const [mostrarDesconto, setMostrarDesconto] = useState(false);
  const [tipoDesconto, setTipoDesconto] = useState<"valor" | "percentual">(
    "percentual",
  );
  const [valorDesconto, setValorDesconto] = useState("");
  const [motivoDesconto, setMotivoDesconto] = useState("");
  const [descontoMaximo, setDescontoMaximo] = useState<number>(100);

  // Buscar desconto máximo ao montar componente
  React.useEffect(() => {
    const carregarDescontoMaximo = async () => {
      const maxDesconto = await getDescontoMaximo();
      setDescontoMaximo(maxDesconto);
    };
    carregarDescontoMaximo();
  }, []);

  const formatarMoeda = (valor: number) => {
    return valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const handleAdicionarPagamento = () => {
    const valorNumerico = parseFloat(valor);
    if (!valorNumerico || valorNumerico <= 0) {
      return;
    }

    // Valida crédito do cliente
    if (
      tipoPagamento === "credito_cliente" &&
      valorNumerico > creditosDisponiveis
    ) {
      alert("Valor maior que créditos disponíveis");
      return;
    }

    const novoPagamento: PagamentoCarrinho = {
      tipo_pagamento: tipoPagamento,
      valor: valorNumerico,
      data_pagamento: dataPagamento,
    };

    if (editandoIndex !== null) {
      onEditarPagamento(editandoIndex, novoPagamento);
      setEditandoIndex(null);
    } else {
      onAdicionarPagamento(novoPagamento);
    }

    // Limpa form
    setValor("");
    setTipoPagamento("dinheiro");
    setDataPagamento(new Date().toISOString().split("T")[0]);
  };

  const handleEditarClick = (index: number) => {
    const pagamento = pagamentos[index];
    setTipoPagamento(pagamento.tipo_pagamento);
    setValor(pagamento.valor.toString());
    setDataPagamento(pagamento.data_pagamento);
    setEditandoIndex(index);
  };

  const getTipoPagamentoLabel = (tipo: string) => {
    return tiposPagamento.find((t) => t.value === tipo)?.label || tipo;
  };

  const handleSelecionarProdutoDesconto = (produtoId: string) => {
    if (onAplicarDescontoItem) {
      onAplicarDescontoItem(produtoId);
      setModalSeletorProdutoOpen(false);
    }
  };

  const handleValorDescontoChange = (valor: string) => {
    const numerico = parseFloat(valor);

    if (tipoDesconto === "percentual") {
      // Se for percentual, limitar ao desconto máximo
      if (numerico > descontoMaximo) {
        setValorDesconto(descontoMaximo.toString());
        return;
      }

      // Limitar a 100% se for percentual
      if (numerico > 100) {
        setValorDesconto("100");
        return;
      }
    } else {
      // Se for valor em R$, calcular o máximo baseado no percentual permitido
      const baseCalculo = subtotalItens - descontosItens;
      const maxDescontoReais = (baseCalculo * descontoMaximo) / 100;

      // Limitar ao menor valor entre o subtotal e o desconto máximo permitido em R$
      const limiteReal = Math.min(baseCalculo, maxDescontoReais);

      if (numerico > limiteReal) {
        setValorDesconto(limiteReal.toFixed(2));
        return;
      }
    }

    setValorDesconto(valor);
  };

  const handleAplicarDescontoRapido = () => {
    const valor = parseFloat(valorDesconto);
    if (!valor || valor <= 0) {
      alert("Informe um valor válido para o desconto");
      return;
    }

    if (!motivoDesconto.trim()) {
      alert("Informe o motivo do desconto");
      return;
    }

    if (onAplicarDescontoRapido) {
      onAplicarDescontoRapido(tipoDesconto, valor, motivoDesconto);
      setValorDesconto("");
      setMotivoDesconto("");
      setMostrarDesconto(false);
    }
  };

  // Agrupar pagamentos por tipo
  const pagamentosAgrupados = pagamentos.reduce(
    (acc, pagamento) => {
      const tipo = pagamento.tipo_pagamento;
      if (!acc[tipo]) {
        acc[tipo] = [];
      }
      acc[tipo].push(pagamento);
      return acc;
    },
    {} as Record<string, PagamentoCarrinho[]>,
  );

  const calcularTotalPorTipo = (tipo: string) => {
    return pagamentosAgrupados[tipo]?.reduce((sum, p) => sum + p.valor, 0) || 0;
  };

  return (
    <div className="space-y-4">
      {/* Desconto Rápido */}
      {onAplicarDescontoRapido && (
        <Card>
          <CardBody className="p-3">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <Percent className="w-4 h-4" />
                Desconto Rápido
              </h4>
              <Button
                size="sm"
                variant="light"
                onClick={() => setMostrarDesconto(!mostrarDesconto)}
              >
                {mostrarDesconto ? "Ocultar" : "Mostrar"}
              </Button>
            </div>

            {mostrarDesconto && (
              <div className="space-y-2 mt-3">
                <div className="flex gap-2">
                  <Select
                    label="Tipo"
                    size="sm"
                    selectedKeys={[tipoDesconto]}
                    onChange={(e) =>
                      setTipoDesconto(e.target.value as "valor" | "percentual")
                    }
                    className="max-w-[120px]"
                  >
                    <SelectItem key="percentual">%</SelectItem>
                    <SelectItem key="valor">R$</SelectItem>
                  </Select>
                  <Input
                    type="number"
                    label="Valor"
                    size="sm"
                    value={valorDesconto}
                    onChange={(e) => handleValorDescontoChange(e.target.value)}
                    max={
                      tipoDesconto === "percentual"
                        ? descontoMaximo
                        : Math.min(
                            subtotalItens - descontosItens,
                            ((subtotalItens - descontosItens) *
                              descontoMaximo) /
                              100,
                          )
                    }
                    placeholder={
                      tipoDesconto === "percentual"
                        ? `Máx: ${descontoMaximo}%`
                        : `Máx: R$ ${Math.min(
                            subtotalItens - descontosItens,
                            ((subtotalItens - descontosItens) *
                              descontoMaximo) /
                              100,
                          ).toFixed(2)}`
                    }
                    startContent={
                      tipoDesconto === "valor" ? (
                        <span className="text-default-400 text-sm">R$</span>
                      ) : (
                        <span className="text-default-400 text-sm">%</span>
                      )
                    }
                    className="flex-1"
                  />
                </div>
                <Input
                  label="Motivo"
                  size="sm"
                  value={motivoDesconto}
                  onChange={(e) => setMotivoDesconto(e.target.value)}
                  placeholder="Ex: Promoção, Cliente especial..."
                />
                <Button
                  color="primary"
                  size="sm"
                  onClick={handleAplicarDescontoRapido}
                  startContent={<Percent className="w-4 h-4" />}
                  className="w-full"
                >
                  Aplicar Desconto
                </Button>

                {descontoAplicado && (
                  <div className="p-2 bg-success-50 dark:bg-success-900/20 rounded-lg">
                    <p className="text-xs text-success-700 dark:text-success-300">
                      <strong>Desconto aplicado:</strong>{" "}
                      {descontoAplicado.tipo === "percentual"
                        ? `${descontoAplicado.valor}%`
                        : formatarMoeda(descontoAplicado.valor)}
                      {" - "}
                      {descontoAplicado.motivo}
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardBody>
        </Card>
      )}

      {/* Botões de Desconto */}
      <div className="flex gap-2">
        {onAplicarDescontoGeral && (
          <Button
            color="secondary"
            variant="flat"
            startContent={<Percent className="w-4 h-4" />}
            onClick={onAplicarDescontoGeral}
            className="flex-1"
          >
            Desconto Avançado
          </Button>
        )}
        {onAplicarDescontoItem && itens.length > 0 && (
          <Button
            color="secondary"
            variant="flat"
            startContent={<Tag className="w-4 h-4" />}
            onClick={() => setModalSeletorProdutoOpen(true)}
            className="flex-1"
          >
            Desconto por Item
          </Button>
        )}
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-2">
          <div className="flex justify-between items-center w-full">
            <h3 className="text-lg font-semibold">Resumo</h3>
            <DollarSign className="w-5 h-5 text-success" />
          </div>
          <div className="w-full space-y-1 text-sm">
            {(subtotalItens > 0 || descontosItens > 0 || descontoGeral > 0) && (
              <>
                <div className="flex justify-between text-xs text-default-500">
                  <span>Subtotal:</span>
                  <span>{formatarMoeda(subtotalItens)}</span>
                </div>
                {descontosItens > 0 && (
                  <div className="flex justify-between text-xs text-warning">
                    <span>Desc. itens:</span>
                    <span>- {formatarMoeda(descontosItens)}</span>
                  </div>
                )}
                {descontoGeral > 0 && (
                  <div className="flex justify-between text-xs text-success">
                    <span>Desc. geral:</span>
                    <span>- {formatarMoeda(descontoGeral)}</span>
                  </div>
                )}
                <Divider className="my-1" />
              </>
            )}
            <div className="flex justify-between">
              <span>Total:</span>
              <span className="font-semibold">{formatarMoeda(valorTotal)}</span>
            </div>
            {creditosDisponiveis > 0 && (
              <div className="flex justify-between text-primary">
                <span>Créditos disponíveis:</span>
                <span className="font-semibold">
                  {formatarMoeda(creditosDisponiveis)}
                </span>
              </div>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Lista de Pagamentos Adicionados */}
      {pagamentos.length > 0 && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Pagamentos Adicionados</h3>
          </CardHeader>
          <CardBody className="gap-3">
            {Object.entries(pagamentosAgrupados).map(
              ([tipo, pagamentosTipo]) => (
                <div key={tipo} className="space-y-2">
                  {/* Cabeçalho do Tipo */}
                  <div className="flex items-center justify-between p-2 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-primary" />
                      <span className="font-semibold text-primary">
                        {getTipoPagamentoLabel(tipo)}
                      </span>
                    </div>
                    <span className="font-bold text-primary">
                      {formatarMoeda(calcularTotalPorTipo(tipo))}
                    </span>
                  </div>

                  {/* Lista de Pagamentos deste Tipo */}
                  {pagamentosTipo.map((pagamento, idx) => {
                    const indexGlobal = pagamentos.findIndex(
                      (p) =>
                        p.tipo_pagamento === pagamento.tipo_pagamento &&
                        p.valor === pagamento.valor &&
                        p.data_pagamento === pagamento.data_pagamento,
                    );
                    return (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 ml-6 rounded-lg bg-default-100 hover:bg-default-200 transition-colors"
                      >
                        <div className="flex items-center gap-2 text-sm text-default-600">
                          <Calendar className="w-3 h-3" />
                          <span>
                            {new Date(
                              pagamento.data_pagamento,
                            ).toLocaleDateString("pt-BR")}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-success">
                            {formatarMoeda(pagamento.valor)}
                          </span>
                          <div className="flex gap-1">
                            <Button
                              isIconOnly
                              size="sm"
                              variant="light"
                              color="primary"
                              onClick={() => handleEditarClick(indexGlobal)}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              isIconOnly
                              size="sm"
                              variant="light"
                              color="danger"
                              onClick={() => onRemoverPagamento(indexGlobal)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ),
            )}

            <Divider className="my-2" />

            <div className="flex justify-between items-center p-3 bg-success-50 dark:bg-success-900/20 rounded-lg">
              <span className="font-semibold">Total Pago:</span>
              <span className="text-xl font-bold text-success">
                {formatarMoeda(valorPago)}
              </span>
            </div>

            {saldoDevedor > 0 && (
              <div className="flex justify-between items-center p-3 bg-danger-50 dark:bg-danger-900/20 rounded-lg">
                <span className="font-semibold">Saldo Devedor:</span>
                <span className="text-xl font-bold text-danger">
                  {formatarMoeda(saldoDevedor)}
                </span>
              </div>
            )}

            {saldoDevedor < 0 && (
              <div className="flex justify-between items-center p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                <span className="font-semibold">Troco:</span>
                <span className="text-xl font-bold text-primary">
                  {formatarMoeda(Math.abs(saldoDevedor))}
                </span>
              </div>
            )}
          </CardBody>
        </Card>
      )}

      {/* Adicionar Novo Pagamento */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">
            {editandoIndex !== null
              ? "Editar Pagamento"
              : "Adicionar Pagamento"}
          </h3>
        </CardHeader>
        <CardBody className="gap-3">
          <Select
            label="Tipo de Pagamento"
            selectedKeys={[tipoPagamento]}
            onChange={(e) => setTipoPagamento(e.target.value)}
          >
            {tiposPagamento.map((tipo) => (
              <SelectItem key={tipo.value}>{tipo.label}</SelectItem>
            ))}
          </Select>

          <Input
            type="number"
            label="Valor"
            placeholder="0,00"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            startContent={<DollarSign className="w-4 h-4 text-default-400" />}
          />

          <Input
            type="date"
            label="Data do Pagamento"
            value={dataPagamento}
            onChange={(e) => setDataPagamento(e.target.value)}
            startContent={<Calendar className="w-4 h-4 text-default-400" />}
          />

          <Button
            color="success"
            startContent={<Plus className="w-4 h-4" />}
            onClick={handleAdicionarPagamento}
            className="w-full"
          >
            {editandoIndex !== null
              ? "Salvar Alterações"
              : "Adicionar Pagamento"}
          </Button>

          {editandoIndex !== null && (
            <Button
              variant="light"
              onClick={() => {
                setEditandoIndex(null);
                setValor("");
                setTipoPagamento("dinheiro");
                setDataPagamento(new Date().toISOString().split("T")[0]);
              }}
              className="w-full"
            >
              Cancelar Edição
            </Button>
          )}
        </CardBody>
      </Card>

      {/* Modal Seletor de Produto */}
      <Modal
        isOpen={modalSeletorProdutoOpen}
        onClose={() => setModalSeletorProdutoOpen(false)}
        size="md"
      >
        <ModalContent>
          <ModalHeader>Selecionar Produto para Desconto</ModalHeader>
          <ModalBody>
            <div className="space-y-2">
              {itens.map((item) => (
                <Button
                  key={item.produto_id}
                  variant="flat"
                  className="w-full justify-start h-auto py-3"
                  onClick={() =>
                    handleSelecionarProdutoDesconto(item.produto_id)
                  }
                >
                  <div className="flex flex-col items-start gap-1 w-full">
                    <div className="flex justify-between w-full">
                      <span className="font-semibold">{item.produto_nome}</span>
                      {item.desconto && (
                        <Chip size="sm" color="warning" variant="flat">
                          Com desconto
                        </Chip>
                      )}
                    </div>
                    <div className="flex justify-between w-full text-sm text-default-500">
                      <span>Qtd: {item.quantidade}</span>
                      <span>{formatarMoeda(item.subtotal)}</span>
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="light"
              onClick={() => setModalSeletorProdutoOpen(false)}
            >
              Cancelar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
