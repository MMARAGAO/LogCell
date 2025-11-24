"use client";

import { useState } from "react";
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
}: PagamentosPanelProps) {
  const [tipoPagamento, setTipoPagamento] = useState("dinheiro");
  const [valor, setValor] = useState("");
  const [dataPagamento, setDataPagamento] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [editandoIndex, setEditandoIndex] = useState<number | null>(null);
  const [modalSeletorProdutoOpen, setModalSeletorProdutoOpen] = useState(false);

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

  return (
    <div className="space-y-4">
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
            Desconto Geral
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
