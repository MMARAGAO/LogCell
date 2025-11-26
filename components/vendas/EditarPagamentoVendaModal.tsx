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
import {
  CreditCard,
  Wallet,
  Banknote,
  DollarSign,
  Edit2,
  Trash2,
  Check,
  X,
  Calendar,
} from "lucide-react";
import { useToast } from "@/components/Toast";
import { supabase } from "@/lib/supabaseClient";

interface PagamentoVenda {
  id: string;
  tipo_pagamento: string;
  valor: number;
  data_pagamento: string;
}

interface EditarPagamentoVendaModalProps {
  isOpen: boolean;
  onClose: () => void;
  venda: {
    id: string;
    numero_venda: number;
  };
  onPagamentoEditado: () => void;
}

export function EditarPagamentoVendaModal({
  isOpen,
  onClose,
  venda,
  onPagamentoEditado,
}: EditarPagamentoVendaModalProps) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [pagamentos, setPagamentos] = useState<PagamentoVenda[]>([]);
  const [editando, setEditando] = useState<string | null>(null);
  const [novoPagamento, setNovoPagamento] = useState<{
    tipo_pagamento: string;
    valor: string;
  }>({ tipo_pagamento: "", valor: "" });

  const tiposPagamento = [
    {
      key: "dinheiro",
      label: "Dinheiro",
      icon: Banknote,
      color: "success" as const,
    },
    { key: "pix", label: "PIX", icon: DollarSign, color: "secondary" as const },
    {
      key: "cartao_credito",
      label: "Cartão de Crédito",
      icon: CreditCard,
      color: "primary" as const,
    },
    {
      key: "cartao_debito",
      label: "Cartão de Débito",
      icon: CreditCard,
      color: "warning" as const,
    },
    {
      key: "transferencia",
      label: "Transferência",
      icon: Wallet,
      color: "default" as const,
    },
    { key: "boleto", label: "Boleto", icon: Wallet, color: "default" as const },
    {
      key: "credito_cliente",
      label: "Crédito do Cliente",
      icon: Wallet,
      color: "danger" as const,
    },
  ];

  useEffect(() => {
    if (isOpen) {
      carregarPagamentos();
    }
  }, [isOpen, venda.id]);

  const carregarPagamentos = async () => {
    try {
      const { data, error } = await supabase
        .from("pagamentos_venda")
        .select("*")
        .eq("venda_id", venda.id)
        .order("criado_em", { ascending: true });

      if (error) throw error;
      setPagamentos(data || []);
    } catch (error) {
      console.error("Erro ao carregar pagamentos:", error);
      toast.error("Erro ao carregar pagamentos");
    }
  };

  const handleEditar = (pagamento: PagamentoVenda) => {
    setEditando(pagamento.id);
    setNovoPagamento({
      tipo_pagamento: pagamento.tipo_pagamento,
      valor: pagamento.valor.toString(),
    });
  };

  const handleCancelar = () => {
    setEditando(null);
    setNovoPagamento({ tipo_pagamento: "", valor: "" });
  };

  const handleSalvar = async (pagamentoId: string) => {
    if (!novoPagamento.tipo_pagamento || !novoPagamento.valor) {
      toast.error("Preencha todos os campos");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from("pagamentos_venda")
        .update({
          tipo_pagamento: novoPagamento.tipo_pagamento,
          valor: parseFloat(novoPagamento.valor),
          editado: true,
          editado_em: new Date().toISOString(),
        })
        .eq("id", pagamentoId);

      if (error) throw error;

      // Registrar no histórico
      await supabase.from("historico_vendas").insert({
        venda_id: venda.id,
        tipo_acao: "edicao_pagamento",
        descricao: `Pagamento editado: ${novoPagamento.tipo_pagamento} - R$ ${parseFloat(
          novoPagamento.valor
        ).toFixed(2)}`,
      });

      toast.success("Pagamento atualizado com sucesso!");
      setEditando(null);
      setNovoPagamento({ tipo_pagamento: "", valor: "" });
      carregarPagamentos();
      onPagamentoEditado();
    } catch (error: any) {
      console.error("Erro ao atualizar pagamento:", error);
      toast.error(error.message || "Erro ao atualizar pagamento");
    } finally {
      setLoading(false);
    }
  };

  const handleExcluir = async (pagamentoId: string) => {
    if (!confirm("Tem certeza que deseja excluir este pagamento?")) return;

    setLoading(true);
    try {
      const pagamento = pagamentos.find((p) => p.id === pagamentoId);

      const { error } = await supabase
        .from("pagamentos_venda")
        .delete()
        .eq("id", pagamentoId);

      if (error) throw error;

      // Registrar no histórico
      await supabase.from("historico_vendas").insert({
        venda_id: venda.id,
        tipo_acao: "exclusao",
        descricao: `Pagamento excluído: ${pagamento?.tipo_pagamento} - R$ ${pagamento?.valor.toFixed(
          2
        )}`,
      });

      toast.success("Pagamento excluído com sucesso!");
      carregarPagamentos();
      onPagamentoEditado();
    } catch (error: any) {
      console.error("Erro ao excluir pagamento:", error);
      toast.error(error.message || "Erro ao excluir pagamento");
    } finally {
      setLoading(false);
    }
  };

  const formatarMoeda = (valor: number) => {
    return valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const getTipoPagamentoLabel = (tipo: string) => {
    return tiposPagamento.find((t) => t.key === tipo)?.label || tipo;
  };

  const getTipoPagamentoIcon = (tipo: string) => {
    const tipoPag = tiposPagamento.find((t) => t.key === tipo);
    const Icon = tipoPag?.icon || Wallet;
    return <Icon className="w-5 h-5" />;
  };

  const getTipoPagamentoColor = (tipo: string) => {
    return tiposPagamento.find((t) => t.key === tipo)?.color || "default";
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="3xl" scrollBehavior="inside">
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-primary" />
            <span>Gerenciar Pagamentos</span>
          </div>
          <p className="text-sm font-normal text-default-500">
            Venda #{String(venda.numero_venda).padStart(6, "0")}
          </p>
        </ModalHeader>
        <ModalBody className="gap-4">
          {pagamentos.length === 0 ? (
            <Card>
              <CardBody className="text-center py-12">
                <Wallet className="w-16 h-16 text-default-300 mx-auto mb-4" />
                <p className="text-default-500 font-medium">
                  Nenhum pagamento encontrado
                </p>
                <p className="text-sm text-default-400 mt-1">
                  Adicione um pagamento através do menu de ações da venda
                </p>
              </CardBody>
            </Card>
          ) : (
            <>
              <div className="space-y-3">
                {pagamentos.map((pagamento, index) => (
                  <Card
                    key={pagamento.id}
                    className={
                      editando === pagamento.id ? "border-2 border-primary" : ""
                    }
                  >
                    <CardBody className="p-4">
                      {editando === pagamento.id ? (
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Edit2 className="w-4 h-4 text-primary" />
                            <span className="text-sm font-medium text-primary">
                              Editando pagamento
                            </span>
                          </div>

                          <Select
                            label="Forma de Pagamento"
                            placeholder="Selecione a forma de pagamento"
                            selectedKeys={[novoPagamento.tipo_pagamento]}
                            onChange={(e) =>
                              setNovoPagamento({
                                ...novoPagamento,
                                tipo_pagamento: e.target.value,
                              })
                            }
                            classNames={{
                              label: "font-medium",
                            }}
                          >
                            {tiposPagamento.map((tipo) => {
                              const Icon = tipo.icon;
                              return (
                                <SelectItem
                                  key={tipo.key}
                                  startContent={<Icon className="w-4 h-4" />}
                                >
                                  {tipo.label}
                                </SelectItem>
                              );
                            })}
                          </Select>

                          <Input
                            type="number"
                            label="Valor do Pagamento"
                            placeholder="0,00"
                            value={novoPagamento.valor}
                            onChange={(e) =>
                              setNovoPagamento({
                                ...novoPagamento,
                                valor: e.target.value,
                              })
                            }
                            startContent={
                              <div className="pointer-events-none flex items-center">
                                <span className="text-default-400 text-small font-medium">
                                  R$
                                </span>
                              </div>
                            }
                            classNames={{
                              label: "font-medium",
                            }}
                          />

                          <div className="flex gap-2 justify-end">
                            <Button
                              color="default"
                              variant="flat"
                              onPress={handleCancelar}
                              isDisabled={loading}
                              startContent={<X className="w-4 h-4" />}
                            >
                              Cancelar
                            </Button>
                            <Button
                              color="primary"
                              onPress={() => handleSalvar(pagamento.id)}
                              isLoading={loading}
                              startContent={
                                !loading && <Check className="w-4 h-4" />
                              }
                            >
                              Salvar Alterações
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-4 flex-1">
                            <div
                              className={`p-3 rounded-lg bg-${getTipoPagamentoColor(pagamento.tipo_pagamento)}-100 dark:bg-${getTipoPagamentoColor(pagamento.tipo_pagamento)}-900/20`}
                            >
                              {getTipoPagamentoIcon(pagamento.tipo_pagamento)}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <p className="font-semibold text-base">
                                  {getTipoPagamentoLabel(
                                    pagamento.tipo_pagamento
                                  )}
                                </p>
                                <Chip
                                  size="sm"
                                  variant="flat"
                                  color={getTipoPagamentoColor(
                                    pagamento.tipo_pagamento
                                  )}
                                >
                                  #{index + 1}
                                </Chip>
                              </div>
                              <div className="flex items-center gap-3 mt-1">
                                <p className="text-2xl font-bold text-success">
                                  {formatarMoeda(pagamento.valor)}
                                </p>
                                <div className="flex items-center gap-1 text-xs text-default-400">
                                  <Calendar className="w-3 h-3" />
                                  {new Date(
                                    pagamento.data_pagamento
                                  ).toLocaleDateString("pt-BR", {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                  })}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="flat"
                              color="warning"
                              isIconOnly
                              onPress={() => handleEditar(pagamento)}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="flat"
                              color="danger"
                              isIconOnly
                              onPress={() => handleExcluir(pagamento.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardBody>
                  </Card>
                ))}
              </div>

              <Divider />

              <Card className="bg-gradient-to-r from-success-50 to-success-100 dark:from-success-900/20 dark:to-success-800/20">
                <CardBody className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-success" />
                      <span className="font-semibold text-success">
                        Total Pago
                      </span>
                    </div>
                    <p className="text-3xl font-bold text-success">
                      {formatarMoeda(
                        pagamentos.reduce((sum, p) => sum + p.valor, 0)
                      )}
                    </p>
                  </div>
                  <p className="text-xs text-success-600 dark:text-success-400 mt-1">
                    {pagamentos.length}{" "}
                    {pagamentos.length === 1
                      ? "pagamento registrado"
                      : "pagamentos registrados"}
                  </p>
                </CardBody>
              </Card>
            </>
          )}
        </ModalBody>
        <ModalFooter>
          <Button
            variant="light"
            onPress={onClose}
            startContent={<X className="w-4 h-4" />}
          >
            Fechar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
