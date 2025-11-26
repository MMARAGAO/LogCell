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
        `
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
        })
      );

      console.log("📦 Devoluções carregadas:", devolucoesComCreditos);
      console.log(
        "💰 Detalhes dos créditos:",
        devolucoesComCreditos.map((d) => ({
          devolucao_id: d.id,
          valor_total_devolucao: d.valor_total,
          credito: d.credito,
          tipo: d.tipo,
        }))
      );

      setDevolucoes(devolucoesComCreditos || []);
    } catch (error) {
      console.error("Erro ao carregar histórico de devoluções:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatarData = (data: string) => {
    // O banco retorna timestamp sem timezone, adicionar 'Z' para tratar como UTC
    const dataComTimezone =
      data.includes("Z") || data.includes("+") ? data : data + "Z";
    const dataObj = new Date(dataComTimezone);

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

  if (loading) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} size="4xl">
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
    <Modal isOpen={isOpen} onClose={onClose} size="4xl" scrollBehavior="inside">
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-primary" />
            <span>Histórico de Devoluções</span>
          </div>
          <p className="text-sm font-normal text-default-500">
            {devolucoes.length} devolução(ões) registrada(s)
          </p>
        </ModalHeader>

        <ModalBody>
          {devolucoes.length === 0 ? (
            <Card className="bg-default-50">
              <CardBody className="text-center py-12">
                <PackageX className="w-16 h-16 text-default-300 mx-auto mb-3" />
                <p className="text-default-500">
                  Nenhuma devolução registrada para esta venda
                </p>
              </CardBody>
            </Card>
          ) : (
            <div className="space-y-4">
              {devolucoes.map((devolucao, index) => (
                <Card key={devolucao.id} className="border-l-4 border-l-danger">
                  <CardBody className="p-4">
                    {/* Cabeçalho da Devolução */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Chip
                            color="danger"
                            variant="flat"
                            size="sm"
                            startContent={<PackageX className="w-3 h-3" />}
                          >
                            Devolução #{index + 1}
                          </Chip>
                          {devolucao.tipo === "com_credito" ? (
                            <Chip
                              color="success"
                              variant="flat"
                              size="sm"
                              startContent={<CreditCard className="w-3 h-3" />}
                            >
                              Com Crédito
                            </Chip>
                          ) : (
                            <Chip color="warning" variant="flat" size="sm">
                              Sem Crédito
                            </Chip>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-default-500">
                          <Calendar className="w-4 h-4" />
                          {formatarData(devolucao.criado_em!)}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-default-500">
                          Valor Devolvido
                        </p>
                        <p className="text-xl font-bold text-danger">
                          {formatarMoeda(devolucao.valor_total)}
                        </p>
                      </div>
                    </div>

                    <Divider className="my-3" />

                    {/* Detalhes */}
                    <div className="space-y-3">
                      {/* Realizado por */}
                      <div className="flex items-start gap-2">
                        <User className="w-4 h-4 text-default-400 mt-0.5" />
                        <div>
                          <p className="text-xs text-default-500">
                            Processado por
                          </p>
                          <p className="text-sm font-medium">
                            {devolucao.realizado_por_usuario?.nome ||
                              "Não informado"}
                          </p>
                        </div>
                      </div>

                      {/* Forma de Pagamento */}
                      {devolucao.forma_pagamento && (
                        <div className="flex items-start gap-2">
                          <CreditCard className="w-4 h-4 text-default-400 mt-0.5" />
                          <div>
                            <p className="text-xs text-default-500">
                              Forma de Pagamento
                            </p>
                            <p className="text-sm font-medium">
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

                      {/* Motivo */}
                      <div>
                        <p className="text-xs text-default-500 mb-1">Motivo</p>
                        <Card className="bg-default-100">
                          <CardBody className="p-3">
                            <p className="text-sm">{devolucao.motivo}</p>
                          </CardBody>
                        </Card>
                      </div>

                      {/* Itens Devolvidos */}
                      <div>
                        <p className="text-xs text-default-500 mb-2">
                          Itens Devolvidos ({devolucao.itens?.length || 0})
                        </p>
                        <div className="space-y-2">
                          {devolucao.itens?.map((item) => (
                            <Card key={item.id} className="bg-default-50">
                              <CardBody className="p-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex-1">
                                    <p className="text-sm font-medium">
                                      {item.item_venda?.produto_nome ||
                                        "Produto"}
                                    </p>
                                    {item.item_venda?.produto_codigo && (
                                      <p className="text-xs text-default-500">
                                        Cód: {item.item_venda.produto_codigo}
                                      </p>
                                    )}
                                  </div>
                                  <div className="text-right">
                                    <p className="text-sm font-semibold">
                                      {item.quantidade}x{" "}
                                      {item.item_venda?.preco_unitario
                                        ? formatarMoeda(
                                            item.item_venda.preco_unitario
                                          )
                                        : "-"}
                                    </p>
                                    <p className="text-xs text-danger">
                                      {item.item_venda?.preco_unitario
                                        ? formatarMoeda(
                                            item.quantidade *
                                              item.item_venda.preco_unitario
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

                      {/* Crédito Gerado */}
                      {devolucao.credito && (
                        <Card className="bg-success-50 border border-success">
                          <CardBody className="p-3">
                            <div className="flex items-center gap-2 mb-2">
                              <CreditCard className="w-4 h-4 text-success" />
                              <p className="text-sm font-semibold text-success">
                                Crédito Gerado
                              </p>
                            </div>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div>
                                <p className="text-xs text-default-600">
                                  Valor Total
                                </p>
                                <p className="font-semibold">
                                  {formatarMoeda(
                                    devolucao.credito?.valor_total
                                  )}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-default-600">
                                  Saldo Disponível
                                </p>
                                <p className="font-semibold text-success">
                                  {formatarMoeda(devolucao.credito?.saldo)}
                                </p>
                              </div>
                            </div>
                          </CardBody>
                        </Card>
                      )}
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          )}
        </ModalBody>

        <ModalFooter>
          <Button variant="flat" onPress={onClose}>
            Fechar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
