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
    new Date().toISOString().split("T")[0]
  );
  const [valorPagamento, setValorPagamento] = useState("");
  const [formaPagamento, setFormaPagamento] = useState("dinheiro");
  const [observacaoPagamento, setObservacaoPagamento] = useState("");

  // Campos de desconto
  const [valorDesconto, setValorDesconto] = useState("");
  const [motivoDesconto, setMotivoDesconto] = useState("");
  const [aplicandoDesconto, setAplicandoDesconto] = useState(false);

  useEffect(() => {
    if (isOpen && os) {
      carregarPagamentos();
      // Carregar desconto atual da OS
      setValorDesconto(os.valor_desconto?.toString() || "0");
    }
  }, [isOpen, os]);

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

    const saldoRestante = calcularSaldoRestante();
    if (valor > saldoRestante) {
      const confirmar = confirm(
        `O valor informado (R$ ${valor.toFixed(2)}) é maior que o saldo restante (R$ ${saldoRestante.toFixed(2)}). Deseja continuar?`
      );
      if (!confirmar) return;
    }

    setLoading(true);
    try {
      const { supabase } = await import("@/lib/supabaseClient");
      const {
        data: { user },
      } = await supabase.auth.getUser();

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

      // Recarregar pagamentos
      await carregarPagamentos();

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
      `Deseja realmente remover este pagamento de R$ ${pagamento.valor.toFixed(2)}?`
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
    };
    return formas[forma] || forma;
  };

  if (!os) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="3xl" scrollBehavior="inside">
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
                    ? "bg-warning-50 dark:bg-warning-900/20"
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
                        ? "text-warning"
                        : "text-primary"
                    }`}
                  >
                    R$ {calcularSaldoRestante().toFixed(2)}
                  </p>
                </CardBody>
              </Card>
            </div>

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
                    label="Valor do Desconto"
                    type="number"
                    placeholder="0.00"
                    value={valorDesconto}
                    onValueChange={setValorDesconto}
                    variant="bordered"
                    startContent={<span className="text-default-400">R$</span>}
                    description="Valor a ser descontado do total"
                  />

                  <Input
                    label="Motivo do Desconto"
                    placeholder="Ex: Cliente fidelizado, promoção..."
                    value={motivoDesconto}
                    onValueChange={setMotivoDesconto}
                    variant="bordered"
                    description="Obrigatório para descontos"
                  />
                </div>
                <div className="mt-3 flex justify-end">
                  <Button
                    color="danger"
                    variant="flat"
                    onPress={aplicarDesconto}
                    isLoading={aplicandoDesconto}
                    isDisabled={
                      !valorDesconto || parseFloat(valorDesconto) <= 0
                    }
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
                    onValueChange={setDataPagamento}
                    variant="bordered"
                  />

                  <Input
                    label="Valor"
                    type="number"
                    placeholder="0.00"
                    value={valorPagamento}
                    onValueChange={setValorPagamento}
                    variant="bordered"
                    startContent={<span className="text-default-400">R$</span>}
                  />

                  <Select
                    label="Forma de Pagamento"
                    selectedKeys={[formaPagamento]}
                    onSelectionChange={(keys) =>
                      setFormaPagamento(Array.from(keys)[0] as string)
                    }
                    variant="bordered"
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
                  </Select>

                  <Input
                    label="Observação (opcional)"
                    placeholder="Ex: Parcela 1/3"
                    value={observacaoPagamento}
                    onValueChange={setObservacaoPagamento}
                    variant="bordered"
                  />
                </div>

                <Button
                  color="primary"
                  onPress={adicionarPagamento}
                  isLoading={loading}
                  className="w-full"
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
                            <Chip size="sm" variant="flat" color="primary">
                              {formatarFormaPagamento(pag.forma_pagamento)}
                            </Chip>
                          </div>
                          <p className="text-xs text-default-600">
                            {new Date(pag.data_pagamento).toLocaleDateString(
                              "pt-BR"
                            )}
                            {pag.observacao && ` - ${pag.observacao}`}
                          </p>
                        </div>
                        <Button
                          isIconOnly
                          size="sm"
                          color="danger"
                          variant="light"
                          onPress={() => removerPagamento(pag)}
                          isDisabled={loading}
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
