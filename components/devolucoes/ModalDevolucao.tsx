"use client";

import { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Card,
  CardBody,
  Input,
  Textarea,
  Divider,
  Chip,
  Radio,
  RadioGroup,
} from "@heroui/react";
import {
  PackageX,
  AlertCircle,
  CheckCircle2,
  CreditCard,
  Wallet,
  Banknote,
  Smartphone,
} from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/contexts/AuthContext";
import { VendasService } from "@/services/vendasService";
import { VendaCompleta } from "@/types/vendas";
import { usePermissoes } from "@/hooks/usePermissoes";

interface ModalDevolucaoProps {
  isOpen: boolean;
  onClose: () => void;
  venda: VendaCompleta;
  onSuccess: () => void;
}

interface ItemDevolucao {
  item_venda_id: string;
  produto_id: string;
  produto_nome: string;
  quantidade_original: number;
  quantidade_devolvida: number;
  quantidade_devolver: number;
  preco_unitario: number;
  subtotal: number;
  desconto_unitario: number; // Desconto por unidade
}

export function ModalDevolucao({
  isOpen,
  onClose,
  venda,
  onSuccess,
}: ModalDevolucaoProps) {
  const { usuario } = useAuth();
  const { temPermissao } = usePermissoes();
  const [itensDevolucao, setItensDevolucao] = useState<ItemDevolucao[]>([]);
  const [tipoReembolso, setTipoReembolso] = useState<"credito" | "sem_credito">(
    "credito",
  );
  const [formaPagamento, setFormaPagamento] = useState<string>("dinheiro");
  const [motivo, setMotivo] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (isOpen && venda.itens) {
      // Inicializar itens disponíveis para devolução
      const itens = venda.itens
        .filter((item) => item.quantidade > (item.devolvido || 0))
        .map((item) => {
          // Debug: verificar se o id está presente
          if (!item.id) {
            console.error("❌ Item sem ID:", item);
          }

          return {
            item_venda_id: item.id!,
            produto_id: item.produto_id,
            produto_nome: item.produto?.nome || item.produto_nome || "Produto",
            quantidade_original: item.quantidade,
            quantidade_devolvida: item.devolvido || 0,
            quantidade_devolver: 0,
            preco_unitario: item.preco_unitario,
            subtotal: 0,
            desconto_unitario: item.valor_desconto
              ? item.valor_desconto / item.quantidade
              : 0, // Desconto por unidade
          };
        });

      console.log("🔍 Itens para devolução:", itens);
      setItensDevolucao(itens);
      setTipoReembolso("credito");
      setFormaPagamento("dinheiro");
      setMotivo("");
      setErro("");
    }
  }, [isOpen, venda]);

  const handleQuantidadeChange = (index: number, valor: string) => {
    const novaQuantidade = parseInt(valor) || 0;
    const item = itensDevolucao[index];
    const maxQuantidade = item.quantidade_original - item.quantidade_devolvida;

    if (novaQuantidade < 0) return;
    if (novaQuantidade > maxQuantidade) return;

    const novosItens = [...itensDevolucao];

    novosItens[index].quantidade_devolver = novaQuantidade;
    novosItens[index].subtotal = novaQuantidade * item.preco_unitario;
    setItensDevolucao(novosItens);
  };

  const calcularTotal = () => {
    const subtotalItens = itensDevolucao.reduce(
      (total, item) => total + item.subtotal,
      0,
    );

    if (subtotalItens === 0) return 0;

    let totalComDesconto = subtotalItens;

    if (venda.valor_desconto > 0 && venda.valor_total > 0) {
      const subtotalOriginal = venda.valor_total + venda.valor_desconto;
      const percentualDesconto = venda.valor_desconto / subtotalOriginal;
      const descontoProporcional = subtotalItens * percentualDesconto;
      totalComDesconto = subtotalItens - descontoProporcional;
    }

    return totalComDesconto;
  };

  const validarDevolucao = (): boolean => {
    const itensParaDevolver = itensDevolucao.filter(
      (item) => item.quantidade_devolver > 0,
    );

    if (itensParaDevolver.length === 0) {
      setErro("Selecione ao menos um item para devolver");

      return false;
    }

    if (!motivo.trim()) {
      setErro("Informe o motivo da devolução");

      return false;
    }

    if (!formaPagamento) {
      setErro("Selecione a forma de pagamento");

      return false;
    }

    setErro("");

    return true;
  };

  const handleProcessar = async () => {
    if (!validarDevolucao() || !usuario) return;

    setLoading(true);
    try {
      const itensParaDevolver = itensDevolucao
        .filter((item) => item.quantidade_devolver > 0)
        .map((item) => ({
          item_venda_id: item.item_venda_id,
          produto_id: item.produto_id,
          quantidade: item.quantidade_devolver,
          preco_unitario: item.preco_unitario,
        }));

      console.log("📦 Itens para devolver:", itensParaDevolver);
      console.log(
        "📦 Primeiro item - item_venda_id:",
        itensParaDevolver[0]?.item_venda_id,
        "tipo:",
        typeof itensParaDevolver[0]?.item_venda_id,
      );

      const resultado = await VendasService.processarDevolucao({
        venda_id: venda.id,
        itens: itensParaDevolver,
        gerar_credito: tipoReembolso === "credito",
        forma_pagamento:
          tipoReembolso === "credito" ? "credito_loja" : formaPagamento,
        motivo: motivo.trim(),
        usuario_id: usuario.id,
      });

      if (!resultado.success) {
        throw new Error(resultado.error);
      }

      onSuccess();
    } catch (error: any) {
      console.error("Erro ao processar devolução:", error);
      setErro(error.message || "Erro ao processar devolução");
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
  const subtotalItens = itensDevolucao.reduce(
    (total, item) => total + item.subtotal,
    0,
  );
  const totalComDesconto = calcularTotal();
  const descontoAplicado = subtotalItens - totalComDesconto;
  const itensSelecionados = itensDevolucao.filter(
    (item) => item.quantidade_devolver > 0,
  );

  return (
    <Modal isOpen={isOpen} scrollBehavior="inside" size="4xl" onClose={onClose}>
      <ModalContent className="overflow-hidden border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.14)] dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-[0_24px_64px_rgba(0,0,0,0.42)]">
        <ModalHeader className="border-b border-slate-200 bg-[linear-gradient(180deg,_#ffffff_0%,_#f8fafc_100%)] px-6 py-5 dark:border-zinc-800 dark:bg-[linear-gradient(180deg,_#18181b_0%,_#111827_100%)]">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300">
                <PackageX className="h-5 w-5" />
              </div>
              <div>
                <span className="block text-lg font-semibold text-slate-900 dark:text-zinc-100">
                  Processar Devolução
                </span>
                <p className="text-sm font-normal text-slate-500 dark:text-zinc-400">
                  Venda #{venda.numero_venda} -{" "}
                  {venda.cliente?.nome || "Cliente não informado"}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <Card className="border border-slate-200 bg-white shadow-none dark:border-zinc-700 dark:bg-zinc-900/70">
                <CardBody className="gap-1 p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-zinc-400">
                    Cliente
                  </p>
                  <p className="truncate text-sm font-medium text-slate-900 dark:text-zinc-100">
                    {venda.cliente?.nome || "Nao informado"}
                  </p>
                </CardBody>
              </Card>
              <Card className="border border-slate-200 bg-white shadow-none dark:border-zinc-700 dark:bg-zinc-900/70">
                <CardBody className="gap-1 p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-zinc-400">
                    Valor da Venda
                  </p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                    {formatarMoeda(venda.valor_total)}
                  </p>
                </CardBody>
              </Card>
              <Card className="border border-slate-200 bg-white shadow-none dark:border-zinc-700 dark:bg-zinc-900/70">
                <CardBody className="gap-1 p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-zinc-400">
                    Data
                  </p>
                  <p className="text-sm font-medium text-slate-900 dark:text-zinc-100">
                    {new Date(venda.criado_em).toLocaleDateString("pt-BR")}
                  </p>
                </CardBody>
              </Card>
              <Card className="border border-slate-200 bg-white shadow-none dark:border-zinc-700 dark:bg-zinc-900/70">
                <CardBody className="gap-1 p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-zinc-400">
                    Loja
                  </p>
                  <p className="truncate text-sm font-medium text-slate-900 dark:text-zinc-100">
                    {venda.loja?.nome || "Nao informada"}
                  </p>
                </CardBody>
              </Card>
            </div>
          </div>
        </ModalHeader>

        <ModalBody className="bg-slate-50/60 px-6 py-6 dark:bg-zinc-950/60">
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
            <div className="space-y-6">
              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                      Itens elegíveis para devolução
                    </p>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">
                      Selecione as quantidades que devem retornar.
                    </p>
                  </div>
                  <Chip
                    classNames={{
                      base: "border border-slate-200 bg-white text-slate-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200",
                    }}
                    size="sm"
                    variant="flat"
                  >
                    {itensSelecionados.length} item(ns) selecionado(s)
                  </Chip>
                </div>

                <div className="space-y-3">
                  {itensDevolucao.map((item, index) => {
                    const maxQuantidade =
                      item.quantidade_original - item.quantidade_devolvida;

                    return (
                      <Card
                        key={item.item_venda_id}
                        className="rounded-[22px] border border-slate-200 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.04)] dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-[0_10px_24px_rgba(0,0,0,0.25)]"
                      >
                        <CardBody className="p-4">
                          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                                {item.produto_nome}
                              </p>
                              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-zinc-400">
                                <span className="font-medium text-slate-600 dark:text-zinc-300">
                                  Qtd. Original: {item.quantidade_original}
                                </span>
                                {item.quantidade_devolvida > 0 && (
                                  <Chip
                                    classNames={{
                                      base: "border border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/35 dark:text-amber-300",
                                    }}
                                    size="sm"
                                    variant="flat"
                                  >
                                    Já devolvido: {item.quantidade_devolvida}
                                  </Chip>
                                )}
                                <span>Disponível: {maxQuantidade}</span>
                                <span>
                                  Preço: {formatarMoeda(item.preco_unitario)}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-end gap-3">
                              <Input
                                className="w-32"
                                classNames={{
                                  inputWrapper:
                                    "rounded-2xl border border-slate-200 bg-slate-50 dark:border-zinc-700 dark:bg-zinc-800/80",
                                  input: "text-slate-800 dark:text-zinc-100",
                                  label: "text-slate-600 dark:text-zinc-400",
                                }}
                                label="Qtd. Devolver"
                                max={maxQuantidade}
                                min={0}
                                size="sm"
                                type="number"
                                value={item.quantidade_devolver.toString()}
                                onChange={(e) =>
                                  handleQuantidadeChange(index, e.target.value)
                                }
                              />

                              {item.quantidade_devolver > 0 && (
                                <div className="min-w-28 rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-right dark:border-rose-900/60 dark:bg-rose-950/35">
                                  <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-rose-500 dark:text-rose-300">
                                    Subtotal
                                  </p>
                                  <p className="text-sm font-semibold text-rose-700 dark:text-rose-200">
                                    {formatarMoeda(item.subtotal)}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardBody>
                      </Card>
                    );
                  })}
                </div>
              </section>

              <section className="space-y-4">
                <Card className="rounded-[24px] border border-slate-200 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.04)] dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-[0_10px_24px_rgba(0,0,0,0.25)]">
                  <CardBody className="space-y-4 p-5">
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                        Politica de restituição
                      </p>
                      <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">
                        Defina como o financeiro deve tratar a devolução.
                      </p>
                    </div>
                    <Divider className="bg-slate-200 dark:bg-zinc-800" />
                    <p className="text-sm font-semibold text-slate-700 dark:text-zinc-200">
                      Como deseja processar o reembolso?
                    </p>
                    <RadioGroup
                      value={tipoReembolso}
                      onValueChange={(value) => {
                        if (
                          value === "credito" &&
                          !temPermissao("devolucoes.processar_creditos")
                        ) {
                          toast.error(
                            "Você não tem permissão para gerar créditos",
                          );

                          return;
                        }
                        setTipoReembolso(value as "credito" | "sem_credito");
                      }}
                    >
                      <Radio
                        description="O cliente receberá crédito para usar em futuras compras"
                        isDisabled={
                          !temPermissao("devolucoes.processar_creditos")
                        }
                        value="credito"
                      >
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4" />
                          <span>Gerar crédito para o cliente</span>
                        </div>
                      </Radio>
                      <Radio
                        description="Reembolso direto ao cliente (dinheiro, PIX, etc)"
                        value="sem_credito"
                      >
                        <div className="flex items-center gap-2">
                          <Wallet className="h-4 w-4" />
                          <span>Reembolso manual</span>
                        </div>
                      </Radio>
                    </RadioGroup>

                    {tipoReembolso === "sem_credito" && (
                      <div className="space-y-3 pt-2">
                        <Divider className="bg-slate-200 dark:bg-zinc-800" />
                        <p className="text-sm font-semibold text-slate-700 dark:text-zinc-200">
                          Forma de pagamento do reembolso:
                        </p>
                        <RadioGroup
                          orientation="horizontal"
                          value={formaPagamento}
                          onValueChange={setFormaPagamento}
                        >
                          <Radio value="dinheiro">
                            <div className="flex items-center gap-1">
                              <Banknote className="h-4 w-4" />
                              <span className="text-sm">Dinheiro</span>
                            </div>
                          </Radio>
                          <Radio value="pix">
                            <div className="flex items-center gap-1">
                              <Smartphone className="h-4 w-4" />
                              <span className="text-sm">PIX</span>
                            </div>
                          </Radio>
                          <Radio value="debito">
                            <div className="flex items-center gap-1">
                              <CreditCard className="h-4 w-4" />
                              <span className="text-sm">Cartão Débito</span>
                            </div>
                          </Radio>
                          <Radio value="credito">
                            <div className="flex items-center gap-1">
                              <CreditCard className="h-4 w-4" />
                              <span className="text-sm">Cartão Crédito</span>
                            </div>
                          </Radio>
                        </RadioGroup>
                      </div>
                    )}
                  </CardBody>
                </Card>

                <Textarea
                  isRequired
                  classNames={{
                    inputWrapper:
                      "rounded-[24px] border border-slate-200 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.04)] dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-[0_10px_24px_rgba(0,0,0,0.25)]",
                    label: "text-slate-700 font-medium dark:text-zinc-200",
                    input: "text-slate-800 dark:text-zinc-100",
                    description: "text-slate-500 dark:text-zinc-400",
                  }}
                  description="Descreva o motivo da devolução"
                  label="Motivo da Devolução"
                  minRows={4}
                  placeholder="Ex: Produto com defeito, insatisfação do cliente, divergência operacional..."
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                />

                {erro && (
                  <Card className="rounded-[22px] border border-rose-200 bg-rose-50 dark:border-rose-900/60 dark:bg-rose-950/35">
                    <CardBody className="p-3">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-rose-600 dark:text-rose-300" />
                        <p className="text-sm text-rose-700 dark:text-rose-200">
                          {erro}
                        </p>
                      </div>
                    </CardBody>
                  </Card>
                )}
              </section>
            </div>

            <aside className="space-y-4 xl:sticky xl:top-0">
              <Card className="rounded-[24px] border border-slate-200 bg-white shadow-[0_10px_28px_rgba(15,23,42,0.06)] dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-[0_14px_30px_rgba(0,0,0,0.28)]">
                <CardBody className="space-y-4 p-5">
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                      Resumo financeiro
                    </p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">
                      Valor final estimado para esta devolução.
                    </p>
                  </div>
                  <Divider className="bg-slate-200 dark:bg-zinc-800" />
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500 dark:text-zinc-400">
                        Subtotal dos itens
                      </span>
                      <span className="font-medium text-slate-800 dark:text-zinc-200">
                        {formatarMoeda(subtotalItens)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500 dark:text-zinc-400">
                        Descontos rateados
                      </span>
                      <span className="font-medium text-emerald-600 dark:text-emerald-300">
                        - {formatarMoeda(descontoAplicado)}
                      </span>
                    </div>
                  </div>
                  <div className="rounded-[22px] border border-rose-200 bg-[linear-gradient(180deg,_#fff1f2_0%,_#ffe4e6_100%)] p-4 dark:border-rose-900/60 dark:bg-[linear-gradient(180deg,_rgba(76,5,25,0.5)_0%,_rgba(63,10,18,0.55)_100%)]">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-rose-500 dark:text-rose-300">
                      Total da Devolução
                    </p>
                    <p className="mt-2 text-3xl font-semibold tracking-tight text-rose-700 dark:text-rose-100">
                      {formatarMoeda(totalComDesconto)}
                    </p>
                    <p className="mt-2 text-xs text-rose-600 dark:text-rose-200/90">
                      {tipoReembolso === "credito"
                        ? "Será gerado crédito para uso futuro."
                        : "Será necessário reembolso manual ao cliente."}
                    </p>
                  </div>
                  <div className="rounded-[20px] border border-slate-200 bg-slate-50 p-4 dark:border-zinc-700 dark:bg-zinc-800/80">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-zinc-400">
                      Itens Selecionados
                    </p>
                    <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-zinc-100">
                      {itensSelecionados.length}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">
                      Registros com quantidade maior que zero
                    </p>
                  </div>
                </CardBody>
              </Card>
            </aside>
          </div>
        </ModalBody>

        <ModalFooter className="border-t border-slate-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900">
          <Button
            className="rounded-xl border border-slate-200 bg-white text-slate-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
            isDisabled={loading}
            variant="flat"
            onPress={onClose}
          >
            Cancelar
          </Button>
          <Button
            className="rounded-xl bg-slate-900 font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
            isLoading={loading}
            startContent={!loading && <CheckCircle2 className="h-4 w-4" />}
            onPress={handleProcessar}
          >
            {loading ? "Processando..." : "Processar Devolução"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
