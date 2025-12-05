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
import { DollarSign, Plus, Trash2, Calendar, Edit2, Percent, CheckCircle } from "lucide-react";
import { VendasService } from "@/services/vendasService";
import { useToast } from "@/components/Toast";
import { useAuth } from "@/contexts/AuthContext";
import { usePermissoes } from "@/hooks/usePermissoes";

interface AdicionarPagamentoModalProps {
  isOpen: boolean;
  onClose: () => void;
  vendaId: string;
  numeroVenda: string;
  clienteId: string;
  valorTotal: number;
  valorPago: number;
  saldoDevedor: number;
  statusVenda?: string;
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
  statusVenda = "em_andamento",
  onPagamentoAdicionado,
}: AdicionarPagamentoModalProps) {
  const toast = useToast();
  const { usuario } = useAuth();
  const { getDescontoMaximo } = usePermissoes();
  const [loading, setLoading] = useState(false);
  const [tipoPagamento, setTipoPagamento] = useState("dinheiro");
  const [valor, setValor] = useState("");
  const [creditoDisponivel, setCreditoDisponivel] = useState<number>(0);
  const [loadingCredito, setLoadingCredito] = useState(false);
  const [pagamentos, setPagamentos] = useState<any[]>([]);
  const [loadingPagamentos, setLoadingPagamentos] = useState(false);
  const [mostrarDesconto, setMostrarDesconto] = useState(false);
  const [tipoDesconto, setTipoDesconto] = useState<"valor" | "percentual">("percentual");
  const [valorDesconto, setValorDesconto] = useState("");
  const [motivoDesconto, setMotivoDesconto] = useState("");
  const [descontoAplicado, setDescontoAplicado] = useState<{tipo: string; valor: number; motivo: string} | null>(null);
  const [loadingDesconto, setLoadingDesconto] = useState(false);
  const [descontoMaximo, setDescontoMaximo] = useState<number>(100);

  // Buscar desconto máximo ao abrir modal
  useEffect(() => {
    const carregarDescontoMaximo = async () => {
      const maxDesconto = await getDescontoMaximo();
      setDescontoMaximo(maxDesconto);
    };
    if (isOpen) {
      carregarDescontoMaximo();
    }
  }, [isOpen]);

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

  const buscarPagamentos = async () => {
    if (!vendaId) return;

    setLoadingPagamentos(true);
    try {
      const { supabase } = await import("@/lib/supabaseClient");
      const { data, error } = await supabase
        .from("pagamentos_venda")
        .select("*")
        .eq("venda_id", vendaId)
        .order("criado_em", { ascending: false });

      if (!error && data) {
        setPagamentos(data);
      }
    } catch (error) {
      console.error("Erro ao buscar pagamentos:", error);
    } finally {
      setLoadingPagamentos(false);
    }
  };

  // Buscar pagamentos ao abrir modal
  useEffect(() => {
    if (isOpen) {
      buscarPagamentos();
    }
  }, [isOpen, vendaId]);

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
        buscarPagamentos(); // Atualizar lista
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
      const maxDescontoReais = (saldoDevedor * descontoMaximo) / 100;
      
      // Limitar ao menor valor entre o saldo devedor e o desconto máximo permitido em R$
      const limiteReal = Math.min(saldoDevedor, maxDescontoReais);
      
      if (numerico > limiteReal) {
        setValorDesconto(limiteReal.toFixed(2));
        return;
      }
    }
    
    setValorDesconto(valor);
  };

  const handleAplicarDesconto = async () => {
    const valor = parseFloat(valorDesconto);
    if (!valor || valor <= 0) {
      toast.error("Informe um valor válido para o desconto");
      return;
    }

    if (!motivoDesconto.trim()) {
      toast.error("Informe o motivo do desconto");
      return;
    }

    setLoadingDesconto(true);
    try {
      const resultado = await VendasService.aplicarDesconto(vendaId, {
        tipo: tipoDesconto,
        valor: valor,
        motivo: motivoDesconto,
        aplicado_por: usuario?.id || "",
      });

      if (resultado.success) {
        toast.success("Desconto aplicado com sucesso!");
        setDescontoAplicado({ tipo: tipoDesconto, valor, motivo: motivoDesconto });
        setValorDesconto("");
        setMotivoDesconto("");
        setMostrarDesconto(false);
        onPagamentoAdicionado(); // Atualizar dados da venda
      } else {
        toast.error(resultado.error || "Erro ao aplicar desconto");
      }
    } catch (error) {
      console.error("Erro ao aplicar desconto:", error);
      toast.error("Erro ao aplicar desconto");
    } finally {
      setLoadingDesconto(false);
    }
  };

  const handleConcluirVenda = async () => {
    if (saldoDevedor > 0) {
      toast.error("Não é possível concluir a venda com saldo devedor pendente");
      return;
    }

    setLoading(true);
    try {
      const resultado = await VendasService.concluirVenda(vendaId, usuario?.id || "");

      if (resultado.success) {
        toast.success("Venda concluída com sucesso!");
        onPagamentoAdicionado();
        handleFechar();
      } else {
        toast.error(resultado.error || "Erro ao concluir venda");
      }
    } catch (error) {
      console.error("Erro ao concluir venda:", error);
      toast.error("Erro ao concluir venda");
    } finally {
      setLoading(false);
    }
  };

  const handleFechar = () => {
    setValor("");
    setTipoPagamento("dinheiro");
    setMostrarDesconto(false);
    setValorDesconto("");
    setMotivoDesconto("");
    setDescontoAplicado(null);
    onClose();
  };

  const getTipoPagamentoLabel = (tipo: string) => {
    return tiposPagamento.find((t) => t.value === tipo)?.label || tipo;
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
    {} as Record<string, any[]>
  );

  const calcularTotalPorTipo = (tipo: string) => {
    return (
      pagamentosAgrupados[tipo]?.reduce(
        (sum: number, p: any) => sum + p.valor,
        0
      ) || 0
    );
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

            {/* Painel de Desconto */}
            {saldoDevedor > 0 && (
              <Card>
                <CardBody className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-semibold flex items-center gap-2">
                      <Percent className="w-4 h-4" />
                      Aplicar Desconto
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
                          onChange={(e) => setTipoDesconto(e.target.value as "valor" | "percentual")}
                          className="max-w-[120px]"
                        >
                          <SelectItem key="percentual">
                            %
                          </SelectItem>
                          <SelectItem key="valor">
                            R$
                          </SelectItem>
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
                              : Math.min(saldoDevedor, (saldoDevedor * descontoMaximo) / 100)
                          }
                          placeholder={
                            tipoDesconto === "percentual"
                              ? `Máx: ${descontoMaximo}%`
                              : `Máx: R$ ${Math.min(
                                  saldoDevedor,
                                  (saldoDevedor * descontoMaximo) / 100
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
                        onClick={handleAplicarDesconto}
                        startContent={<Percent className="w-4 h-4" />}
                        className="w-full"
                        isLoading={loadingDesconto}
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
                            {" - "}{descontoAplicado.motivo}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </CardBody>
              </Card>
            )}

            {/* Lista de Pagamentos Adicionados */}
            {pagamentos.length > 0 && (
              <Card>
                <CardBody>
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">
                      Pagamentos Adicionados
                    </h3>

                    {loadingPagamentos ? (
                      <div className="text-center py-4 text-default-500">
                        Carregando pagamentos...
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {Object.entries(pagamentosAgrupados).map(
                          ([tipo, pagamentosTipo]) => (
                            <div
                              key={tipo}
                              className="border-b border-divider pb-3 last:border-b-0"
                            >
                              <div className="flex justify-between items-center mb-2">
                                <h4 className="font-medium text-sm uppercase text-default-600">
                                  {getTipoPagamentoLabel(tipo)}
                                </h4>
                                <span className="font-semibold text-primary">
                                  R$ {calcularTotalPorTipo(tipo).toFixed(2)}
                                </span>
                              </div>

                              <div className="ml-4 space-y-2">
                                {(pagamentosTipo as any[]).map(
                                  (pagamento: any) => (
                                    <div
                                      key={pagamento.id}
                                      className="flex justify-between items-center text-sm py-1 hover:bg-default-100 px-2 rounded transition-colors"
                                    >
                                      <div className="flex items-center gap-2">
                                        <Calendar className="h-3 w-3 text-default-400" />
                                        <span className="text-default-600">
                                          {new Date(
                                            pagamento.criado_em
                                          ).toLocaleDateString("pt-BR")}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <span className="text-foreground">
                                          R$ {pagamento.valor.toFixed(2)}
                                        </span>
                                      </div>
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    )}
                  </div>
                </CardBody>
              </Card>
            )}

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
            {saldoDevedor <= 0 && statusVenda !== "concluida" && (
              <Button
                color="success"
                onClick={handleConcluirVenda}
                isLoading={loading}
                startContent={!loading && <CheckCircle className="w-4 h-4" />}
              >
                Concluir Venda
              </Button>
            )}
            <Button variant="light" onClick={handleFechar}>
              {saldoDevedor > 0 ? "Fechar" : "OK"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
