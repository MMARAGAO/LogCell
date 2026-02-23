"use client";

import { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Select,
  SelectItem,
  Card,
  CardBody,
  Chip,
  Divider,
} from "@heroui/react";
import { DollarSign, Trash2, CreditCard } from "lucide-react";

import { useToast } from "@/components/Toast";
import { OrdemServico } from "@/types/ordemServico";

interface PagamentoOSModalProps {
  isOpen: boolean;
  onClose: () => void;
  os: OrdemServico | null;
  onPagamentoRealizado?: () => void;
}

interface Pagamento {
  id?: string;
  data_pagamento: string;
  valor: number;
  forma_pagamento: string;
  observacao?: string;
}

export default function PagamentoOSModal({
  isOpen,
  onClose,
  os,
  onPagamentoRealizado,
}: PagamentoOSModalProps) {
  const toast = useToast();

  const [pagamentos, setPagamentos] = useState<Pagamento[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingPagamentos, setLoadingPagamentos] = useState(false);

  // Campos do novo pagamento
  const [dataPagamento, setDataPagamento] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [valorPagamento, setValorPagamento] = useState("");
  const [formaPagamento, setFormaPagamento] = useState("dinheiro");
  const [observacaoPagamento, setObservacaoPagamento] = useState("");

  // Campos de desconto
  const [valorDesconto, setValorDesconto] = useState("");
  const [motivoDesconto, setMotivoDesconto] = useState("");
  const [aplicandoDesconto, setAplicandoDesconto] = useState(false);

  // Crédito do cliente
  const [creditoDisponivel, setCreditoDisponivel] = useState(0);
  const [loadingCredito, setLoadingCredito] = useState(false);

  useEffect(() => {
    if (isOpen && os) {
      carregarPagamentos();
      carregarCreditoCliente();
      // Carregar desconto atual da OS
      setValorDesconto(os.valor_desconto?.toString() || "0");
    }
  }, [isOpen, os]);

  const carregarCreditoCliente = async () => {
    if (!os?.cliente_nome) {
      setCreditoDisponivel(0);

      return;
    }

    setLoadingCredito(true);
    try {
      const { supabase } = await import("@/lib/supabaseClient");

      // Primeiro, buscar cliente pelo nome
      const { data: cliente, error: erroCliente } = await supabase
        .from("clientes")
        .select("id")
        .eq("nome", os.cliente_nome)
        .single();

      if (erroCliente || !cliente) {
        setCreditoDisponivel(0);

        return;
      }

      // Buscar créditos disponíveis do cliente
      const { data: creditos, error } = await supabase
        .from("creditos_cliente")
        .select("saldo")
        .eq("cliente_id", cliente.id)
        .gt("saldo", 0);

      if (error) throw error;

      const total = creditos?.reduce((sum, c) => sum + Number(c.saldo), 0) || 0;

      setCreditoDisponivel(total);
    } catch (error: any) {
      console.error("Erro ao carregar crédito do cliente:", error);
      setCreditoDisponivel(0);
    } finally {
      setLoadingCredito(false);
    }
  };

  const carregarPagamentos = async () => {
    if (!os) return;

    setLoadingPagamentos(true);
    try {
      const { supabase } = await import("@/lib/supabaseClient");

      const { data, error } = await supabase
        .from("ordem_servico_pagamentos")
        .select("*")
        .eq("id_ordem_servico", os.id)
        .order("data_pagamento", { ascending: false });

      if (error) throw error;

      setPagamentos(data || []);
    } catch (error: any) {
      console.error("Erro ao carregar pagamentos:", error);
      toast.error("Erro ao carregar pagamentos");
    } finally {
      setLoadingPagamentos(false);
    }
  };

  const calcularValorTotal = () => {
    const valorBase = os?.valor_orcamento || os?.valor_total || 0;
    const desconto = parseFloat(valorDesconto) || 0;

    return valorBase - desconto;
  };

  const calcularTotalPago = () => {
    return pagamentos.reduce((total, pag) => total + pag.valor, 0);
  };

  const calcularSaldoRestante = () => {
    return calcularValorTotal() - calcularTotalPago();
  };

  const aplicarDesconto = async () => {
    if (!os) return;

    const desconto = parseFloat(valorDesconto) || 0;

    if (desconto < 0) {
      toast.error("O desconto não pode ser negativo");

      return;
    }

    const valorBase = os.valor_orcamento || os.valor_total || 0;

    if (desconto > valorBase) {
      toast.error("O desconto não pode ser maior que o valor da OS");

      return;
    }

    if (desconto > 0 && !motivoDesconto.trim()) {
      toast.error("Informe o motivo do desconto");

      return;
    }

    setAplicandoDesconto(true);
    try {
      const { supabase } = await import("@/lib/supabaseClient");
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const novoValorTotal = valorBase - desconto;

      // Atualizar desconto e valor total na OS
      const { error } = await supabase
        .from("ordem_servico")
        .update({
          valor_desconto: desconto,
          valor_total: novoValorTotal,
          atualizado_por: user?.id,
          atualizado_em: new Date().toISOString(),
        })
        .eq("id", os.id);

      if (error) throw error;

      // Registrar no histórico se houver motivo
      if (motivoDesconto.trim()) {
        await supabase.from("historico_ordem_servico").insert({
          id_ordem_servico: os.id,
          tipo_evento: "atualizacao_valores",
          descricao: `Desconto aplicado: R$ ${desconto.toFixed(2)}. Motivo: ${motivoDesconto}`,
          criado_por: user?.id,
        });
      }

      toast.success("Desconto aplicado com sucesso!");
      setMotivoDesconto("");
      onPagamentoRealizado?.();
    } catch (error: any) {
      console.error("Erro ao aplicar desconto:", error);
      toast.error(error.message || "Erro ao aplicar desconto");
    } finally {
      setAplicandoDesconto(false);
    }
  };

  const adicionarPagamento = async () => {
    if (!os) return;

    const valor = parseFloat(valorPagamento);

    if (!valor || valor <= 0) {
      toast.error("Informe um valor válido para o pagamento");

      return;
    }

    if (!dataPagamento) {
      toast.error("Informe a data do pagamento");

      return;
    }

    // Validar crédito disponível se for pagamento com crédito do cliente
    if (formaPagamento === "credito_cliente") {
      if (creditoDisponivel <= 0) {
        toast.error("Cliente não possui crédito disponível");

        return;
      }

      if (valor > creditoDisponivel) {
        toast.error(
          `Crédito insuficiente. Disponível: R$ ${creditoDisponivel.toFixed(2)}`,
        );

        return;
      }
    }

    const saldoRestante = calcularSaldoRestante();

    if (valor > saldoRestante) {
      const confirmar = confirm(
        `O valor informado (R$ ${valor.toFixed(2)}) é maior que o saldo restante (R$ ${saldoRestante.toFixed(2)}). Deseja continuar?`,
      );

      if (!confirmar) return;
    }

    setLoading(true);
    try {
      const { supabase } = await import("@/lib/supabaseClient");
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // Se for crédito do cliente, dar baixa nos créditos (FIFO)
      if (formaPagamento === "credito_cliente") {
        // Buscar cliente pelo nome
        const { data: cliente, error: erroCliente } = await supabase
          .from("clientes")
          .select("id")
          .eq("nome", os.cliente_nome)
          .single();

        if (erroCliente || !cliente) {
          throw new Error("Cliente não encontrado para aplicar crédito");
        }

        const { data: creditos, error: erroCreditos } = await supabase
          .from("creditos_cliente")
          .select("*")
          .eq("cliente_id", cliente.id)
          .gt("saldo", 0)
          .order("criado_em", { ascending: true }); // FIFO

        if (erroCreditos) throw erroCreditos;

        if (!creditos || creditos.length === 0) {
          throw new Error("Cliente não possui crédito disponível");
        }

        // Dar baixa nos créditos
        let valorRestante = valor;

        for (const credito of creditos) {
          if (valorRestante <= 0) break;

          const saldoCredito = Number(credito.saldo);
          const valorUtilizar = Math.min(valorRestante, saldoCredito);

          const { error: erroUpdate } = await supabase
            .from("creditos_cliente")
            .update({
              valor_utilizado: Number(credito.valor_utilizado) + valorUtilizar,
              saldo: saldoCredito - valorUtilizar,
            })
            .eq("id", credito.id);

          if (erroUpdate) throw erroUpdate;

          valorRestante -= valorUtilizar;
        }
      }

      // Inserir pagamento
      const { error: errorPag } = await supabase
        .from("ordem_servico_pagamentos")
        .insert({
          id_ordem_servico: os.id,
          data_pagamento: dataPagamento,
          valor,
          forma_pagamento: formaPagamento,
          observacao: observacaoPagamento || null,
          criado_por: user?.id,
        });

      if (errorPag) throw errorPag;

      // Atualizar valor_pago na ordem de serviço
      const novoTotalPago = calcularTotalPago() + valor;
      const { error: errorOS } = await supabase
        .from("ordem_servico")
        .update({
          valor_pago: novoTotalPago,
          atualizado_por: user?.id,
          atualizado_em: new Date().toISOString(),
        })
        .eq("id", os.id);

      if (errorOS) throw errorOS;

      toast.success("Pagamento registrado com sucesso!");

      // Recarregar pagamentos e crédito
      await carregarPagamentos();
      await carregarCreditoCliente();

      // Limpar campos
      setValorPagamento("");
      setObservacaoPagamento("");
      setDataPagamento(new Date().toISOString().split("T")[0]);

      onPagamentoRealizado?.();
    } catch (error: any) {
      console.error("Erro ao registrar pagamento:", error);
      toast.error(error.message || "Erro ao registrar pagamento");
    } finally {
      setLoading(false);
    }
  };

  const removerPagamento = async (pagamento: Pagamento) => {
    if (!os || !pagamento.id) return;

    const confirmar = confirm(
      `Deseja realmente remover este pagamento de R$ ${pagamento.valor.toFixed(2)}?`,
    );

    if (!confirmar) return;

    setLoading(true);
    try {
      const { supabase } = await import("@/lib/supabaseClient");
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // Remover pagamento
      const { error: errorPag } = await supabase
        .from("ordem_servico_pagamentos")
        .delete()
        .eq("id", pagamento.id);

      if (errorPag) throw errorPag;

      // Atualizar valor_pago na ordem de serviço
      const novoTotalPago = calcularTotalPago() - pagamento.valor;
      const { error: errorOS } = await supabase
        .from("ordem_servico")
        .update({
          valor_pago: novoTotalPago,
          atualizado_por: user?.id,
          atualizado_em: new Date().toISOString(),
        })
        .eq("id", os.id);

      if (errorOS) throw errorOS;

      toast.success("Pagamento removido com sucesso!");

      // Recarregar pagamentos
      await carregarPagamentos();

      onPagamentoRealizado?.();
    } catch (error: any) {
      console.error("Erro ao remover pagamento:", error);
      toast.error(error.message || "Erro ao remover pagamento");
    } finally {
      setLoading(false);
    }
  };

  const formatarFormaPagamento = (forma: string) => {
    const formas: Record<string, string> = {
      dinheiro: "Dinheiro",
      cartao_credito: "Cartão de Crédito",
      cartao_debito: "Cartão de Débito",
      pix: "PIX",
      transferencia: "Transferência",
      cheque: "Cheque",
      credito_cliente: "Crédito do Cliente",
    };

    return formas[forma] || forma;
  };

  if (!os) return null;

  return (
    <Modal isOpen={isOpen} scrollBehavior="inside" size="3xl" onClose={onClose}>
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            <span>Pagamentos - OS #{os.numero_os}</span>
          </div>
          <p className="text-sm font-normal text-default-500">
            {os.cliente_nome}
          </p>
        </ModalHeader>

        <ModalBody>
          <div className="space-y-4">
            {/* Resumo Financeiro */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-default-100 dark:bg-default-50/10">
                <CardBody className="p-4">
                  <p className="text-xs text-default-600 mb-1">
                    Valor Original
                  </p>
                  <p className="text-xl font-bold text-default-700">
                    R${" "}
                    {(os?.valor_orcamento || os?.valor_total || 0).toFixed(2)}
                  </p>
                </CardBody>
              </Card>

              <Card className="bg-danger-50 dark:bg-danger-900/20">
                <CardBody className="p-4">
                  <p className="text-xs text-default-600 mb-1">Desconto</p>
                  <p className="text-xl font-bold text-danger">
                    - R$ {(parseFloat(valorDesconto) || 0).toFixed(2)}
                  </p>
                </CardBody>
              </Card>

              <Card className="bg-success-50 dark:bg-success-900/20">
                <CardBody className="p-4">
                  <p className="text-xs text-default-600 mb-1">Total Pago</p>
                  <p className="text-xl font-bold text-success">
                    R$ {calcularTotalPago().toFixed(2)}
                  </p>
                </CardBody>
              </Card>

              <Card
                className={
                  calcularSaldoRestante() > 0
                    ? "bg-danger-50 dark:bg-danger-900/20"
                    : "bg-primary-50 dark:bg-primary-900/20"
                }
              >
                <CardBody className="p-4">
                  <p className="text-xs text-default-600 mb-1">
                    Saldo Restante
                  </p>
                  <p
                    className={`text-xl font-bold ${
                      calcularSaldoRestante() > 0
                        ? "text-danger"
                        : "text-primary"
                    }`}
                  >
                    R$ {calcularSaldoRestante().toFixed(2)}
                  </p>
                </CardBody>
              </Card>
            </div>

            {/* Crédito Disponível do Cliente */}
            {creditoDisponivel > 0 && (
              <Card className="bg-primary-50 dark:bg-primary-900/20 border-2 border-primary-200 dark:border-primary-800">
                <CardBody className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-primary" />
                      <span className="font-semibold text-primary">
                        Crédito Disponível do Cliente
                      </span>
                    </div>
                    <div className="text-right">
                      {loadingCredito ? (
                        <p className="text-sm text-default-500">
                          Carregando...
                        </p>
                      ) : (
                        <p className="text-2xl font-bold text-primary">
                          R$ {creditoDisponivel.toFixed(2)}
                        </p>
                      )}
                    </div>
                  </div>
                  {creditoDisponivel > 0 && (
                    <p className="text-xs text-default-600 mt-2">
                      Este crédito pode ser usado para pagar esta OS
                    </p>
                  )}
                </CardBody>
              </Card>
            )}

            <Divider />

            {/* Aplicar Desconto */}
            <Card className="border-2 border-danger-200 dark:border-danger-800">
              <CardBody className="p-4">
                <h4 className="font-semibold mb-3 flex items-center gap-2 text-danger">
                  <DollarSign className="w-4 h-4" />
                  Aplicar Desconto
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    description="Valor a ser descontado do total"
                    label="Valor do Desconto"
                    placeholder="0.00"
                    startContent={<span className="text-default-400">R$</span>}
                    type="number"
                    value={valorDesconto}
                    variant="bordered"
                    onValueChange={setValorDesconto}
                  />

                  <Input
                    description="Obrigatório para descontos"
                    label="Motivo do Desconto"
                    placeholder="Ex: Cliente fidelizado, promoção..."
                    value={motivoDesconto}
                    variant="bordered"
                    onValueChange={setMotivoDesconto}
                  />
                </div>
                <div className="mt-3 flex justify-end">
                  <Button
                    color="danger"
                    isDisabled={
                      !valorDesconto || parseFloat(valorDesconto) <= 0
                    }
                    isLoading={aplicandoDesconto}
                    variant="flat"
                    onPress={aplicarDesconto}
                  >
                    Aplicar Desconto
                  </Button>
                </div>
              </CardBody>
            </Card>

            <Divider />

            {/* Adicionar Novo Pagamento */}
            <Card>
              <CardBody className="p-4">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Adicionar Novo Pagamento
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                  <Input
                    label="Data do Pagamento"
                    type="date"
                    value={dataPagamento}
                    variant="bordered"
                    onValueChange={setDataPagamento}
                  />

                  <Input
                    label="Valor"
                    placeholder="0.00"
                    startContent={<span className="text-default-400">R$</span>}
                    type="number"
                    value={valorPagamento}
                    variant="bordered"
                    onValueChange={setValorPagamento}
                  />

                  <Select
                    description={
                      formaPagamento === "credito_cliente"
                        ? `Saldo disponível: R$ ${creditoDisponivel.toFixed(2)}`
                        : undefined
                    }
                    label="Forma de Pagamento"
                    selectedKeys={[formaPagamento]}
                    variant="bordered"
                    onSelectionChange={(keys) =>
                      setFormaPagamento(Array.from(keys)[0] as string)
                    }
                  >
                    <SelectItem key="dinheiro">Dinheiro</SelectItem>
                    <SelectItem key="cartao_credito">
                      Cartão de Crédito
                    </SelectItem>
                    <SelectItem key="cartao_debito">
                      Cartão de Débito
                    </SelectItem>
                    <SelectItem key="pix">PIX</SelectItem>
                    <SelectItem key="transferencia">Transferência</SelectItem>
                    <SelectItem key="cheque">Cheque</SelectItem>
                    <SelectItem
                      key="credito_cliente"
                      isDisabled={creditoDisponivel <= 0}
                    >
                      Crédito do Cliente
                      {creditoDisponivel > 0 &&
                        ` (R$ ${creditoDisponivel.toFixed(2)})`}
                    </SelectItem>
                  </Select>

                  <Input
                    label="Observação (opcional)"
                    placeholder="Ex: Parcela 1/3"
                    value={observacaoPagamento}
                    variant="bordered"
                    onValueChange={setObservacaoPagamento}
                  />
                </div>

                <Button
                  className="w-full"
                  color="primary"
                  isLoading={loading}
                  onPress={adicionarPagamento}
                >
                  Adicionar Pagamento
                </Button>
              </CardBody>
            </Card>

            {/* Lista de Pagamentos */}
            {loadingPagamentos ? (
              <div className="text-center py-8">
                <p className="text-default-500">Carregando pagamentos...</p>
              </div>
            ) : pagamentos.length > 0 ? (
              <Card>
                <CardBody className="p-4">
                  <h4 className="font-semibold mb-3">
                    Pagamentos Registrados ({pagamentos.length})
                  </h4>
                  <div className="space-y-3">
                    {pagamentos.map((pag) => (
                      <div
                        key={pag.id}
                        className="flex items-center justify-between p-3 bg-default-100 dark:bg-default-50/10 rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-success">
                              R$ {pag.valor.toFixed(2)}
                            </span>
                            <Chip color="primary" size="sm" variant="flat">
                              {formatarFormaPagamento(pag.forma_pagamento)}
                            </Chip>
                          </div>
                          <p className="text-xs text-default-600">
                            {new Date(pag.data_pagamento).toLocaleDateString(
                              "pt-BR",
                            )}
                            {pag.observacao && ` - ${pag.observacao}`}
                          </p>
                        </div>
                        <Button
                          isIconOnly
                          color="danger"
                          isDisabled={loading}
                          size="sm"
                          variant="light"
                          onPress={() => removerPagamento(pag)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
            ) : (
              <Card>
                <CardBody className="p-8 text-center">
                  <CreditCard className="w-12 h-12 mx-auto mb-3 text-default-300" />
                  <p className="text-default-500">
                    Nenhum pagamento registrado ainda
                  </p>
                </CardBody>
              </Card>
            )}
          </div>
        </ModalBody>

        <ModalFooter>
          <Button variant="light" onPress={onClose}>
            Fechar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
