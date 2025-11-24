"use client";

import { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Select,
  SelectItem,
  Input,
  Divider,
  Card,
  CardBody,
  Chip,
} from "@heroui/react";
import { DollarSign, Plus, Trash2 } from "lucide-react";
import { VendasService } from "@/services/vendasService";
import { useToast } from "@/components/Toast";
import { useAuth } from "@/contexts/AuthContext";

interface AdicionarPagamentoModalProps {
  isOpen: boolean;
  onClose: () => void;
  vendaId: string;
  numeroVenda: string;
  clienteId: string;
  valorTotal: number;
  valorPago: number;
  saldoDevedor: number;
  onPagamentoAdicionado: () => void;
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

export function AdicionarPagamentoModal({
  isOpen,
  onClose,
  vendaId,
  numeroVenda,
  clienteId,
  valorTotal,
  valorPago,
  saldoDevedor,
  onPagamentoAdicionado,
}: AdicionarPagamentoModalProps) {
  const toast = useToast();
  const { usuario } = useAuth();
  const [loading, setLoading] = useState(false);
  const [tipoPagamento, setTipoPagamento] = useState("dinheiro");
  const [valor, setValor] = useState("");
  const [creditoDisponivel, setCreditoDisponivel] = useState<number>(0);
  const [loadingCredito, setLoadingCredito] = useState(false);

  const formatarMoeda = (valor: number) => {
    return valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const buscarCreditoCliente = async () => {
    if (!clienteId) return;

    setLoadingCredito(true);
    try {
      const { data, error } =
        await VendasService.buscarCreditosCliente(clienteId);
      if (!error && data) {
        const saldoTotal = data.reduce(
          (sum: number, c: any) => sum + (c.saldo || 0),
          0
        );
        setCreditoDisponivel(saldoTotal);
      }
    } catch (error) {
      console.error("Erro ao buscar crédito do cliente:", error);
    } finally {
      setLoadingCredito(false);
    }
  };

  // Buscar crédito quando seleciona crédito do cliente
  useEffect(() => {
    if (isOpen && tipoPagamento === "credito_cliente") {
      buscarCreditoCliente();
    }
  }, [isOpen, tipoPagamento]);

  const handleAdicionarPagamento = async () => {
    const valorNumerico = parseFloat(valor);
    if (!valorNumerico || valorNumerico <= 0) {
      toast.error("Informe um valor válido");
      return;
    }

    if (valorNumerico > saldoDevedor) {
      toast.error("Valor maior que o saldo devedor");
      return;
    }

    // Validar crédito disponível se for pagamento com crédito
    if (tipoPagamento === "credito_cliente") {
      if (creditoDisponivel === 0) {
        toast.error("Cliente não possui crédito disponível");
        return;
      }
      if (valorNumerico > creditoDisponivel) {
        toast.error(
          `Crédito insuficiente. Disponível: ${formatarMoeda(creditoDisponivel)}`
        );
        return;
      }
    }

    setLoading(true);
    try {
      const resultado = await VendasService.adicionarPagamento(vendaId, {
        tipo_pagamento: tipoPagamento as any,
        valor: valorNumerico,
        data_pagamento: new Date().toISOString().split("T")[0],
        criado_por: usuario?.id,
      });

      if (resultado.success) {
        toast.success("Pagamento adicionado com sucesso!");
        setValor("");
        setTipoPagamento("dinheiro");
        onPagamentoAdicionado();
      } else {
        toast.error(resultado.error || "Erro ao adicionar pagamento");
      }
    } catch (error) {
      console.error("Erro ao adicionar pagamento:", error);
      toast.error("Erro ao adicionar pagamento");
    } finally {
      setLoading(false);
    }
  };

  const handleFechar = () => {
    setValor("");
    setTipoPagamento("dinheiro");
    onClose();
  };

  const getTipoPagamentoLabel = (tipo: string) => {
    return tiposPagamento.find((t) => t.value === tipo)?.label || tipo;
  };

  return (
    <>
      {toast.ToastComponent}
      <Modal isOpen={isOpen} onClose={handleFechar} size="2xl">
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            <h3 className="text-xl font-bold">Adicionar Pagamento</h3>
            <p className="text-sm text-default-500">Venda: {numeroVenda}</p>
          </ModalHeader>

          <ModalBody className="space-y-4">
            {/* Resumo da Venda */}
            <Card>
              <CardBody>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Valor Total:</span>
                    <span className="font-semibold">
                      {formatarMoeda(valorTotal)}
                    </span>
                  </div>
                  <div className="flex justify-between text-success">
                    <span>Valor Pago:</span>
                    <span className="font-semibold">
                      {formatarMoeda(valorPago)}
                    </span>
                  </div>
                  <Divider />
                  <div className="flex justify-between text-lg">
                    <span className="font-semibold">Saldo Devedor:</span>
                    <span
                      className={`font-bold ${
                        saldoDevedor > 0 ? "text-danger" : "text-success"
                      }`}
                    >
                      {formatarMoeda(saldoDevedor)}
                    </span>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Form de Pagamento */}
            {saldoDevedor > 0 ? (
              <div className="space-y-3">
                <Select
                  label="Tipo de Pagamento"
                  selectedKeys={[tipoPagamento]}
                  onChange={(e) => setTipoPagamento(e.target.value)}
                  isRequired
                >
                  {tiposPagamento.map((tipo) => (
                    <SelectItem key={tipo.value}>{tipo.label}</SelectItem>
                  ))}
                </Select>

                {tipoPagamento === "credito_cliente" && (
                  <Card className="bg-blue-50 dark:bg-blue-900/20">
                    <CardBody>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">
                          Crédito Disponível:
                        </span>
                        <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                          {loadingCredito
                            ? "Carregando..."
                            : formatarMoeda(creditoDisponivel)}
                        </span>
                      </div>
                      {creditoDisponivel === 0 && !loadingCredito && (
                        <p className="text-xs text-warning mt-1">
                          Cliente não possui crédito disponível
                        </p>
                      )}
                    </CardBody>
                  </Card>
                )}

                <Input
                  label="Valor"
                  type="number"
                  step="0.01"
                  value={valor}
                  onChange={(e) => setValor(e.target.value)}
                  placeholder="0,00"
                  startContent={
                    <div className="pointer-events-none flex items-center">
                      <span className="text-default-400 text-small">R$</span>
                    </div>
                  }
                  isRequired
                />

                <Button
                  color="primary"
                  onClick={handleAdicionarPagamento}
                  isLoading={loading}
                  startContent={!loading && <Plus className="w-4 h-4" />}
                  fullWidth
                >
                  Adicionar Pagamento
                </Button>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <DollarSign className="w-8 h-8 text-success" />
                </div>
                <p className="text-lg font-semibold text-success">
                  Venda totalmente paga!
                </p>
                <p className="text-sm text-default-500 mt-1">
                  Todos os pagamentos foram recebidos.
                </p>
              </div>
            )}
          </ModalBody>

          <ModalFooter>
            <Button variant="light" onClick={handleFechar}>
              {saldoDevedor > 0 ? "Fechar" : "OK"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
