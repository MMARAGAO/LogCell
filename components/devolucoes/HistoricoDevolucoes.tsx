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
  Chip,
  Divider,
  Spinner,
} from "@heroui/react";
import { History, PackageX, User, Calendar, CreditCard } from "lucide-react";

import { supabase } from "@/lib/supabaseClient";
import { DevolucaoVenda } from "@/types/vendas";

interface HistoricoDevolucoesProp {
  isOpen: boolean;
  onClose: () => void;
  vendaId: string;
}

interface DevolucaoDetalhada extends DevolucaoVenda {
  realizado_por_usuario?: {
    id: string;
    nome: string;
  };
  itens?: Array<{
    id: string;
    quantidade: number;
    motivo?: string;
    item_venda?: {
      produto_nome: string;
      produto_codigo: string;
      preco_unitario: number;
    };
  }>;
  credito?: {
    id: string;
    valor_total: number;
    saldo: number;
  };
}

export function HistoricoDevolucoes({
  isOpen,
  onClose,
  vendaId,
}: HistoricoDevolucoesProp) {
  const [devolucoes, setDevolucoes] = useState<DevolucaoDetalhada[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      carregarHistorico();
    }
  }, [isOpen, vendaId]);

  const carregarHistorico = async () => {
    try {
      setLoading(true);

      // Buscar devoluções
      const { data: devolucoesData, error: erroDevs } = await supabase
        .from("devolucoes_venda")
        .select(
          `
          *,
          realizado_por_usuario:usuarios!devolucoes_venda_realizado_por_fkey(id, nome),
          itens:itens_devolucao(
            *,
            item_venda:itens_venda(produto_nome, produto_codigo, preco_unitario)
          )
        `,
        )
        .eq("venda_id", vendaId)
        .order("criado_em", { ascending: false });

      if (erroDevs) throw erroDevs;

      // Buscar créditos separadamente para cada devolução
      const devolucoesComCreditos = await Promise.all(
        (devolucoesData || []).map(async (devolucao) => {
          if (devolucao.tipo === "com_credito") {
            const { data: credito } = await supabase
              .from("creditos_cliente")
              .select("id, valor_total, saldo, valor_utilizado")
              .eq("devolucao_id", devolucao.id)
              .maybeSingle();

            return { ...devolucao, credito };
          }

          return devolucao;
        }),
      );

      console.log("📦 Devoluções carregadas:", devolucoesComCreditos);
      console.log(
        "💰 Detalhes dos créditos:",
        devolucoesComCreditos.map((d) => ({
          devolucao_id: d.id,
          valor_total_devolucao: d.valor_total,
          credito: d.credito,
          tipo: d.tipo,
        })),
      );

      setDevolucoes(devolucoesComCreditos || []);
    } catch (error) {
      console.error("Erro ao carregar histórico de devoluções:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatarData = (data: string) => {
    const dataObj = new Date(data);

    return dataObj.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatarMoeda = (valor?: number | null) => {
    if (valor === undefined || valor === null) return "R$ 0,00";

    return Number(valor).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };
  const totalDevolvido = devolucoes.reduce(
    (total, devolucao) => total + Number(devolucao.valor_total || 0),
    0,
  );
  const devolucoesComCredito = devolucoes.filter(
    (devolucao) => devolucao.tipo === "com_credito",
  ).length;

  if (loading) {
    return (
      <Modal isOpen={isOpen} size="4xl" onClose={onClose}>
        <ModalContent>
          <ModalBody className="py-8">
            <div className="flex justify-center">
              <Spinner size="lg" />
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} scrollBehavior="inside" size="4xl" onClose={onClose}>
      <ModalContent className="overflow-hidden border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.12)] dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-[0_22px_58px_rgba(0,0,0,0.4)]">
        <ModalHeader className="border-b border-slate-200 bg-[linear-gradient(180deg,_#ffffff_0%,_#f8fafc_100%)] px-6 py-5 dark:border-zinc-800 dark:bg-[linear-gradient(180deg,_#18181b_0%,_#111827_100%)]">
          <div className="flex w-full flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
                <History className="h-5 w-5" />
              </div>
              <div>
                <span className="block text-lg font-semibold text-slate-900 dark:text-zinc-100">
                  Histórico de Devoluções
                </span>
                <p className="text-sm font-normal text-slate-500 dark:text-zinc-400">
                  {devolucoes.length} devolução(ões) registrada(s)
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Card className="border border-slate-200 bg-white shadow-none dark:border-zinc-700 dark:bg-zinc-900/70">
                <CardBody className="gap-1 p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-zinc-400">
                    Registros
                  </p>
                  <p className="text-xl font-semibold text-slate-900 dark:text-zinc-100">
                    {devolucoes.length}
                  </p>
                </CardBody>
              </Card>
              <Card className="border border-slate-200 bg-white shadow-none dark:border-zinc-700 dark:bg-zinc-900/70">
                <CardBody className="gap-1 p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-zinc-400">
                    Com Crédito
                  </p>
                  <p className="text-xl font-semibold text-slate-900 dark:text-zinc-100">
                    {devolucoesComCredito}
                  </p>
                </CardBody>
              </Card>
              <Card className="border border-slate-200 bg-white shadow-none dark:border-zinc-700 dark:bg-zinc-900/70">
                <CardBody className="gap-1 p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-zinc-400">
                    Valor Acumulado
                  </p>
                  <p className="text-xl font-semibold text-slate-900 dark:text-zinc-100">
                    {formatarMoeda(totalDevolvido)}
                  </p>
                </CardBody>
              </Card>
            </div>
          </div>
        </ModalHeader>

        <ModalBody className="bg-slate-50/60 px-6 py-6 dark:bg-zinc-950/60">
          {devolucoes.length === 0 ? (
            <Card className="rounded-[24px] border border-slate-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
              <CardBody className="py-12 text-center">
                <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100 text-slate-400 dark:bg-zinc-800 dark:text-zinc-500">
                  <PackageX className="h-7 w-7" />
                </div>
                <p className="text-sm font-medium text-slate-700 dark:text-zinc-200">
                  Nenhuma devolução registrada para esta venda
                </p>
              </CardBody>
            </Card>
          ) : (
            <div className="space-y-4">
              {devolucoes.map((devolucao, index) => (
                <Card
                  key={devolucao.id}
                  className="rounded-[24px] border border-slate-200 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.05)] dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-[0_12px_28px_rgba(0,0,0,0.26)]"
                >
                  <CardBody className="p-5">
                    <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Chip
                            classNames={{
                              base: "border border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/35 dark:text-rose-300",
                            }}
                            size="sm"
                            startContent={<PackageX className="h-3 w-3" />}
                            variant="flat"
                          >
                            Devolução #{index + 1}
                          </Chip>
                          {devolucao.tipo === "com_credito" ? (
                            <Chip
                              classNames={{
                                base: "border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/35 dark:text-emerald-300",
                              }}
                              size="sm"
                              startContent={<CreditCard className="h-3 w-3" />}
                              variant="flat"
                            >
                              Com Crédito
                            </Chip>
                          ) : (
                            <Chip
                              classNames={{
                                base: "border border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/35 dark:text-amber-300",
                              }}
                              size="sm"
                              variant="flat"
                            >
                              Sem Crédito
                            </Chip>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-zinc-400">
                          <Calendar className="h-4 w-4 dark:text-zinc-500" />
                          {formatarData(devolucao.criado_em!)}
                        </div>
                      </div>
                      <div className="rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-3 text-right dark:border-zinc-700 dark:bg-zinc-800/80">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-zinc-400">
                          Valor Devolvido
                        </p>
                        <p className="text-2xl font-semibold text-slate-900 dark:text-zinc-100">
                          {formatarMoeda(devolucao.valor_total)}
                        </p>
                      </div>
                    </div>

                    <Divider className="my-3 bg-slate-200 dark:bg-zinc-800" />

                    <div className="grid gap-5 lg:grid-cols-[220px_minmax(0,1fr)]">
                      <div className="space-y-3">
                        <div className="flex items-start gap-2">
                          <User className="mt-0.5 h-4 w-4 text-slate-400 dark:text-zinc-500" />
                          <div>
                            <p className="text-xs text-slate-500 dark:text-zinc-400">
                              Processado por
                            </p>
                            <p className="text-sm font-medium text-slate-900 dark:text-zinc-100">
                              {devolucao.realizado_por_usuario?.nome ||
                                "Não informado"}
                            </p>
                          </div>
                        </div>

                        {devolucao.forma_pagamento && (
                          <div className="flex items-start gap-2">
                            <CreditCard className="mt-0.5 h-4 w-4 text-slate-400 dark:text-zinc-500" />
                            <div>
                              <p className="text-xs text-slate-500 dark:text-zinc-400">
                                Forma de Pagamento
                              </p>
                              <p className="text-sm font-medium text-slate-900 dark:text-zinc-100">
                                {devolucao.forma_pagamento === "dinheiro" &&
                                  "Dinheiro"}
                                {devolucao.forma_pagamento === "pix" && "PIX"}
                                {devolucao.forma_pagamento === "debito" &&
                                  "Cartão de Débito"}
                                {devolucao.forma_pagamento === "credito" &&
                                  "Cartão de Crédito"}
                                {devolucao.forma_pagamento === "credito_loja" &&
                                  "Crédito na Loja"}
                              </p>
                            </div>
                          </div>
                        )}

                        {devolucao.credito && (
                          <Card className="rounded-[20px] border border-emerald-200 bg-emerald-50 shadow-none dark:border-emerald-900/60 dark:bg-emerald-950/35">
                            <CardBody className="p-3">
                              <div className="mb-2 flex items-center gap-2">
                                <CreditCard className="h-4 w-4 text-emerald-600 dark:text-emerald-300" />
                                <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-200">
                                  Crédito Gerado
                                </p>
                              </div>
                              <div className="space-y-2 text-sm">
                                <div className="flex items-center justify-between">
                                  <span className="text-emerald-700/80 dark:text-emerald-200/80">
                                    Valor Total
                                  </span>
                                  <span className="font-semibold text-emerald-800 dark:text-emerald-100">
                                    {formatarMoeda(
                                      devolucao.credito?.valor_total,
                                    )}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-emerald-700/80 dark:text-emerald-200/80">
                                    Saldo Disponível
                                  </span>
                                  <span className="font-semibold text-emerald-800 dark:text-emerald-100">
                                    {formatarMoeda(devolucao.credito?.saldo)}
                                  </span>
                                </div>
                              </div>
                            </CardBody>
                          </Card>
                        )}
                      </div>

                      <div className="space-y-4">
                        <div>
                          <p className="mb-1 text-xs text-slate-500 dark:text-zinc-400">
                            Motivo
                          </p>
                          <Card className="rounded-[20px] border border-slate-200 bg-slate-50 shadow-none dark:border-zinc-700 dark:bg-zinc-800/80">
                            <CardBody className="p-3">
                              <p className="text-sm text-slate-700 dark:text-zinc-200">
                                {devolucao.motivo}
                              </p>
                            </CardBody>
                          </Card>
                        </div>

                        <div>
                          <p className="mb-2 text-xs text-slate-500 dark:text-zinc-400">
                            Itens Devolvidos ({devolucao.itens?.length || 0})
                          </p>
                          <div className="space-y-2">
                            {devolucao.itens?.map((item) => (
                              <Card
                                key={item.id}
                                className="rounded-[18px] border border-slate-200 bg-white shadow-none dark:border-zinc-700 dark:bg-zinc-900/80"
                              >
                                <CardBody className="p-3">
                                  <div className="flex items-center justify-between gap-3">
                                    <div className="flex-1">
                                      <p className="text-sm font-medium text-slate-900 dark:text-zinc-100">
                                        {item.item_venda?.produto_nome ||
                                          "Produto"}
                                      </p>
                                      {item.item_venda?.produto_codigo && (
                                        <p className="text-xs text-slate-500 dark:text-zinc-400">
                                          Cód: {item.item_venda.produto_codigo}
                                        </p>
                                      )}
                                    </div>
                                    <div className="text-right">
                                      <p className="text-sm font-semibold text-slate-800 dark:text-zinc-200">
                                        {item.quantidade}x{" "}
                                        {item.item_venda?.preco_unitario
                                          ? formatarMoeda(
                                              item.item_venda.preco_unitario,
                                            )
                                          : "-"}
                                      </p>
                                      <p className="text-xs text-rose-600 dark:text-rose-300">
                                        {item.item_venda?.preco_unitario
                                          ? formatarMoeda(
                                              item.quantidade *
                                                item.item_venda.preco_unitario,
                                            )
                                          : "-"}
                                      </p>
                                    </div>
                                  </div>
                                </CardBody>
                              </Card>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          )}
        </ModalBody>

        <ModalFooter className="border-t border-slate-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900">
          <Button
            className="rounded-xl border border-slate-200 bg-white text-slate-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
            variant="flat"
            onPress={onClose}
          >
            Fechar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
