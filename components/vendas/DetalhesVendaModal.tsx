"use client";

import { useState } from "react";
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
} from "@heroui/react";
import {
  X,
  Package,
  DollarSign,
  Calendar,
  User,
  Store,
  Clock,
  Edit,
  ShoppingCart,
  Trash2,
  FileText,
  Wallet,
  CreditCard,
  Banknote,
  Building2,
  Receipt,
  RefreshCw,
} from "lucide-react";
import type { VendaCompleta } from "@/types/vendas";
import { TrocarProdutoModal } from "./TrocarProdutoModal";

interface DetalhesVendaModalProps {
  isOpen: boolean;
  onClose: () => void;
  venda: VendaCompleta | null;
  onAtualizarVenda?: () => void;
}

export function DetalhesVendaModal({
  isOpen,
  onClose,
  venda,
  onAtualizarVenda,
}: DetalhesVendaModalProps) {
  const [trocaModalOpen, setTrocaModalOpen] = useState(false);
  const [itemSelecionado, setItemSelecionado] = useState<any>(null);

  if (!venda) return null;

  const formatarMoeda = (valor: number) => {
    return valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const formatarData = (data: string) => {
    // PostgreSQL now() retorna UTC mas timestamp without timezone não indica isso
    // Supabase retorna como '2025-11-14T20:28:04' (que é UTC)
    // Adiciona 'Z' para indicar que é UTC e deixar o JavaScript converter para local
    const dataUTC = data.endsWith("Z") ? data : data + "Z";
    const dataLocal = new Date(dataUTC);

    return dataLocal.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "concluida":
        return "success";
      case "cancelada":
        return "danger";
      case "em_andamento":
        return "warning";
      default:
        return "default";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "concluida":
        return "Concluída";
      case "cancelada":
        return "Cancelada";
      case "em_andamento":
        return "Em Andamento";
      default:
        return status;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="3xl"
      scrollBehavior="outside"
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <div className="flex items-center justify-between p-2">
            <h2 className="text-2xl font-bold">
              Venda V{String(venda.numero_venda).padStart(6, "0")}
            </h2>
            <Chip color={getStatusColor(venda.status)} size="lg">
              {getStatusLabel(venda.status)}
            </Chip>
          </div>
        </ModalHeader>

        <ModalBody>
          {/* Informações Gerais */}
          <Card>
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-3">Informações Gerais</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Cliente</p>
                    <p className="font-medium">{venda.cliente?.nome}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Store className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Loja</p>
                    <p className="font-medium">{venda.loja?.nome}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Vendedor</p>
                    <p className="font-medium">{venda.vendedor?.nome}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Data</p>
                    <p className="font-medium">
                      {venda.criado_em && formatarData(venda.criado_em)}
                    </p>
                  </div>
                </div>
                {venda.tipo === "fiada" && (
                  <div className="col-span-2">
                    <Chip color="warning" variant="flat">
                      Venda Fiada
                    </Chip>
                    {venda.data_prevista_pagamento && (
                      <p className="text-sm text-gray-500 mt-1">
                        Previsão de pagamento:{" "}
                        {new Date(
                          venda.data_prevista_pagamento
                        ).toLocaleDateString("pt-BR")}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Itens da Venda */}
          <Card className="mt-4">
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Package className="w-5 h-5" />
                Itens da Venda
              </h3>
              <div className="space-y-2">
                {venda.itens && venda.itens.length > 0 ? (
                  venda.itens.map((item: any, index: number) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg gap-3"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{item.produto_nome}</p>
                        <p className="text-sm text-gray-500">
                          Código: {item.produto_codigo}
                        </p>
                        {item.desconto_valor && item.desconto_valor > 0 && (
                          <Chip size="sm" color="warning" variant="flat">
                            Desconto:{" "}
                            {item.desconto_tipo === "porcentagem"
                              ? `${item.desconto_valor}%`
                              : formatarMoeda(item.desconto_valor)}
                          </Chip>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">
                          {item.quantidade}x{" "}
                          {formatarMoeda(item.preco_unitario)}
                        </p>
                        <p className="font-bold">
                          {formatarMoeda(item.subtotal)}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        color="primary"
                        variant="flat"
                        isIconOnly
                        onPress={() => {
                          setItemSelecionado(item);
                          setTrocaModalOpen(true);
                        }}
                        title="Trocar produto"
                        isDisabled={venda.status !== "concluida"}
                      >
                        <RefreshCw className="w-4 h-4" />
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    Nenhum item nesta venda
                  </p>
                )}
              </div>
            </div>
          </Card>

          {/* Resumo Financeiro */}
          <Card className="mt-4">
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Resumo Financeiro
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">
                    {formatarMoeda(
                      venda.valor_total +
                        (venda.valor_desconto || 0) -
                        (venda.valor_desconto || 0)
                    )}
                  </span>
                </div>
                {venda.valor_desconto > 0 && (
                  <div className="flex justify-between items-center text-warning">
                    <span>Desconto</span>
                    <span>- {formatarMoeda(venda.valor_desconto)}</span>
                  </div>
                )}
                <Divider />
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Total</span>
                  <span className="text-2xl font-bold">
                    {formatarMoeda(venda.valor_total)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-success">
                  <span>Valor Pago</span>
                  <span className="font-bold">
                    {formatarMoeda(venda.valor_pago)}
                  </span>
                </div>
                {venda.saldo_devedor > 0 && (
                  <div className="flex justify-between items-center text-danger">
                    <span className="font-semibold">Saldo Devedor</span>
                    <span className="text-xl font-bold">
                      {formatarMoeda(venda.saldo_devedor)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Pagamentos */}
          {venda.pagamentos && venda.pagamentos.length > 0 && (
            <Card className="mt-4">
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Pagamentos
                </h3>
                <div className="space-y-2">
                  {venda.pagamentos.map((pagamento: any, index: number) => {
                    const getTipoPagamentoLabel = (tipo: string) => {
                      const tipos: Record<string, string> = {
                        dinheiro: "Dinheiro",
                        pix: "PIX",
                        cartao_credito: "Cartão de Crédito",
                        cartao_debito: "Cartão de Débito",
                        transferencia: "Transferência",
                        boleto: "Boleto",
                        credito_cliente: "Crédito do Cliente",
                      };
                      return tipos[tipo] || tipo;
                    };

                    const getIconeTipoPagamento = (tipo: string) => {
                      switch (tipo) {
                        case "pix":
                          return (
                            <DollarSign className="w-5 h-5 text-primary" />
                          );
                        case "dinheiro":
                          return <Banknote className="w-5 h-5 text-success" />;
                        case "cartao_credito":
                          return (
                            <CreditCard className="w-5 h-5 text-warning" />
                          );
                        case "cartao_debito":
                          return (
                            <CreditCard className="w-5 h-5 text-secondary" />
                          );
                        case "credito_cliente":
                          return <Wallet className="w-5 h-5 text-blue-500" />;
                        case "transferencia":
                          return (
                            <Building2 className="w-5 h-5 text-purple-500" />
                          );
                        case "boleto":
                          return (
                            <Receipt className="w-5 h-5 text-orange-500" />
                          );
                        default:
                          return <DollarSign className="w-5 h-5" />;
                      }
                    };

                    return (
                      <div
                        key={index}
                        className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0">
                            {getIconeTipoPagamento(pagamento.tipo_pagamento)}
                          </div>
                          <div>
                            <p className="font-medium">
                              {getTipoPagamentoLabel(pagamento.tipo_pagamento)}
                            </p>
                            <p className="text-sm text-gray-500">
                              {pagamento.criado_em &&
                                formatarData(pagamento.criado_em)}
                            </p>
                            {pagamento.criado_por_usuario && (
                              <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                                <User className="w-3 h-3" />
                                {pagamento.criado_por_usuario.nome}
                              </p>
                            )}
                          </div>
                        </div>
                        <p className="font-bold text-success">
                          {formatarMoeda(pagamento.valor)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>
          )}

          {/* Observações */}
          {venda.observacoes && (
            <Card className="mt-4">
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-2">Observações</h3>
                <p className="text-gray-600">{venda.observacoes}</p>
              </div>
            </Card>
          )}

          {/* Histórico */}
          {venda.historico && venda.historico.length > 0 && (
            <Card className="mt-4">
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Histórico da Venda
                </h3>
                <div className="space-y-3">
                  {venda.historico
                    .sort(
                      (a: any, b: any) =>
                        new Date(b.criado_em || 0).getTime() -
                        new Date(a.criado_em || 0).getTime()
                    )
                    .map((evento: any, index: number) => {
                      const getIconeTipoAcao = (tipo: string) => {
                        switch (tipo) {
                          case "criacao":
                            return <ShoppingCart className="w-4 h-4" />;
                          case "edicao":
                            return <Edit className="w-4 h-4" />;
                          case "adicao_item":
                          case "adicao_produto":
                            return <Package className="w-4 h-4 text-success" />;
                          case "remocao_item":
                          case "remocao_produto":
                            return <Trash2 className="w-4 h-4 text-danger" />;
                          case "pagamento":
                          case "edicao_pagamento":
                            return (
                              <DollarSign className="w-4 h-4 text-success" />
                            );
                          case "finalizacao":
                            return (
                              <FileText className="w-4 h-4 text-success" />
                            );
                          case "cancelamento":
                            return <X className="w-4 h-4 text-danger" />;
                          case "devolucao":
                            return <Trash2 className="w-4 h-4 text-warning" />;
                          case "desconto":
                            return (
                              <DollarSign className="w-4 h-4 text-warning" />
                            );
                          default:
                            return <Clock className="w-4 h-4" />;
                        }
                      };

                      const getCorTipoAcao = (tipo: string) => {
                        switch (tipo) {
                          case "criacao":
                            return "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800";
                          case "edicao":
                            return "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800";
                          case "adicao_item":
                          case "adicao_produto":
                          case "pagamento":
                          case "finalizacao":
                            return "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800";
                          case "remocao_item":
                          case "remocao_produto":
                          case "cancelamento":
                            return "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800";
                          case "devolucao":
                          case "desconto":
                          case "edicao_pagamento":
                            return "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800";
                          default:
                            return "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700";
                        }
                      };

                      return (
                        <div
                          key={evento.id || index}
                          className={`p-3 rounded-lg border ${getCorTipoAcao(evento.tipo_acao)}`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="mt-1">
                              {getIconeTipoAcao(evento.tipo_acao)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm">
                                {evento.descricao}
                              </p>
                              <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-gray-500">
                                <span className="flex items-center gap-1">
                                  <User className="w-3 h-3" />
                                  {evento.usuario?.nome || "Sistema"}
                                </span>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {evento.criado_em &&
                                    formatarData(evento.criado_em)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </Card>
          )}
        </ModalBody>

        <ModalFooter>
          <Button color="default" variant="flat" onPress={onClose}>
            Fechar
          </Button>
        </ModalFooter>
      </ModalContent>

      {/* Modal de Troca */}
      {itemSelecionado && (
        <TrocarProdutoModal
          isOpen={trocaModalOpen}
          onClose={() => {
            setTrocaModalOpen(false);
            setItemSelecionado(null);
          }}
          vendaId={venda.id}
          itemVendaId={itemSelecionado.id}
          produtoAtual={{
            id: itemSelecionado.produto_id,
            nome: itemSelecionado.produto_nome,
            quantidade: itemSelecionado.quantidade,
            preco_unitario: itemSelecionado.preco_unitario,
          }}
          lojaId={venda.loja_id}
          onTrocaRealizada={() => {
            onAtualizarVenda?.();
            onClose();
          }}
        />
      )}
    </Modal>
  );
}
