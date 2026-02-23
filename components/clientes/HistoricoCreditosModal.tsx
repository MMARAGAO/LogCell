"use client";

import type { CreditoCliente } from "@/types/vendas";

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
  Accordion,
  AccordionItem,
} from "@heroui/react";
import { useState, useEffect } from "react";
import { History, TrendingUp, TrendingDown, Wallet, Clock } from "lucide-react";

interface HistoricoCreditosModalProps {
  isOpen: boolean;
  onClose: () => void;
  clienteId: string;
  clienteNome: string;
}

export function HistoricoCreditosModal({
  isOpen,
  onClose,
  clienteId,
  clienteNome,
}: HistoricoCreditosModalProps) {
  const [loading, setLoading] = useState(false);
  const [creditos, setCreditos] = useState<CreditoCliente[]>([]);
  const [mostrarTodos, setMostrarTodos] = useState(false);

  const formatarMoeda = (valor: number) => {
    return valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const formatarData = (data: string) => {
    return new Date(data).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  useEffect(() => {
    if (isOpen) {
      carregarHistorico();
    } else {
      // Reseta para mostrar apenas 5 quando fecha o modal
      setMostrarTodos(false);
    }
  }, [isOpen, clienteId]);

  const carregarHistorico = async () => {
    setLoading(true);
    try {
      const { supabase } = await import("@/lib/supabaseClient");
      const { data, error } = await supabase
        .from("creditos_cliente")
        .select(
          `
          *,
          usuario:usuarios!creditos_cliente_gerado_por_fkey(nome)
        `,
        )
        .eq("cliente_id", clienteId)
        .order("criado_em", { ascending: false });

      if (error) throw error;
      setCreditos(data || []);
    } catch (error) {
      console.error("Erro ao carregar histórico:", error);
    } finally {
      setLoading(false);
    }
  };

  const calcularTotais = () => {
    const totalGerado = creditos
      .filter((c) => c.tipo === "adicao" || !c.tipo) // Considera registros sem tipo como adição (compatibilidade)
      .reduce((sum, c) => sum + c.valor_total, 0);

    const totalRetirado = creditos
      .filter((c) => c.tipo === "retirada")
      .reduce((sum, c) => sum + c.valor_total, 0);

    const saldoAtual = creditos.reduce((sum, c) => sum + c.saldo, 0);

    return { totalGerado, totalRetirado, saldoAtual };
  };

  const { totalGerado, totalRetirado, saldoAtual } = calcularTotais();

  // Mostra apenas os 5 últimos por padrão
  const creditosExibidos = mostrarTodos ? creditos : creditos.slice(0, 5);
  const temMais = creditos.length > 5;

  return (
    <Modal isOpen={isOpen} scrollBehavior="inside" size="3xl" onClose={onClose}>
      <ModalContent>
        <ModalHeader className="flex items-center gap-2">
          <History className="w-5 h-5 text-primary" />
          <span>Histórico de Créditos</span>
        </ModalHeader>

        <ModalBody>
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Spinner size="lg" />
            </div>
          ) : (
            <div className="space-y-4">
              {/* Informações do Cliente */}
              <Card className="bg-default-100">
                <CardBody>
                  <p className="text-sm text-default-600 mb-1">Cliente</p>
                  <p className="font-semibold text-lg mb-4">{clienteNome}</p>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-default-600 mb-1">
                        Total Gerado
                      </p>
                      <p className="font-bold text-primary">
                        {formatarMoeda(totalGerado)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-default-600 mb-1">
                        Total Retirado
                      </p>
                      <p className="font-bold text-danger">
                        {formatarMoeda(totalRetirado)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-default-600 mb-1">
                        Saldo Atual
                      </p>
                      <p className="font-bold text-success">
                        {formatarMoeda(saldoAtual)}
                      </p>
                    </div>
                  </div>
                </CardBody>
              </Card>

              <Divider />

              {/* Lista de Movimentações em Accordion */}
              {creditos.length === 0 ? (
                <Card>
                  <CardBody className="text-center py-12">
                    <Wallet className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">
                      Nenhum histórico de créditos
                    </p>
                  </CardBody>
                </Card>
              ) : (
                <Accordion selectionMode="multiple" variant="splitted">
                  {creditosExibidos.map((credito) => {
                    const ehRetirada = credito.tipo === "retirada";
                    const valorAbsoluto = Math.abs(credito.valor_total);

                    return (
                      <AccordionItem
                        key={credito.id}
                        aria-label={`Crédito ${ehRetirada ? "retirado" : "adicionado"}`}
                        title={
                          <div className="flex items-center justify-between w-full pr-4">
                            <div className="flex items-center gap-3">
                              <div
                                className={`p-2 rounded-lg ${
                                  ehRetirada
                                    ? "bg-danger-100"
                                    : credito.saldo > 0
                                      ? "bg-success-100"
                                      : "bg-default-100"
                                }`}
                              >
                                {ehRetirada ? (
                                  <TrendingDown className="w-4 h-4 text-danger" />
                                ) : (
                                  <TrendingUp className="w-4 h-4 text-success" />
                                )}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="font-semibold text-sm">
                                    {ehRetirada
                                      ? "Crédito Retirado"
                                      : credito.saldo > 0
                                        ? "Crédito Adicionado"
                                        : "Crédito Utilizado"}
                                  </p>
                                  {!ehRetirada && (
                                    <Chip
                                      color={
                                        credito.saldo > 0
                                          ? "success"
                                          : "default"
                                      }
                                      size="sm"
                                      variant="flat"
                                    >
                                      {credito.saldo > 0
                                        ? "Disponível"
                                        : "Utilizado"}
                                    </Chip>
                                  )}
                                </div>
                                {credito.criado_em && (
                                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                    <Clock className="w-3 h-3" />
                                    {formatarData(credito.criado_em)}
                                  </p>
                                )}
                              </div>
                            </div>
                            <p
                              className={`font-bold text-lg ${
                                ehRetirada ? "text-danger" : "text-success"
                              }`}
                            >
                              {formatarMoeda(valorAbsoluto)}
                            </p>
                          </div>
                        }
                      >
                        <div className="px-4 pb-4 space-y-3">
                          {/* Valores */}
                          <div className="grid grid-cols-3 gap-4 mb-3">
                            <div>
                              <p className="text-xs text-gray-600 mb-1">
                                {ehRetirada ? "Valor Retirado" : "Valor Total"}
                              </p>
                              <p
                                className={`font-semibold text-sm ${
                                  ehRetirada ? "text-danger" : "text-success"
                                }`}
                              >
                                {formatarMoeda(valorAbsoluto)}
                              </p>
                            </div>
                            {!ehRetirada && (
                              <>
                                <div>
                                  <p className="text-xs text-gray-600 mb-1">
                                    Utilizado
                                  </p>
                                  <p className="font-semibold text-sm text-warning">
                                    {formatarMoeda(credito.valor_utilizado)}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-600 mb-1">
                                    Saldo
                                  </p>
                                  <p className="font-semibold text-sm text-success">
                                    {formatarMoeda(credito.saldo)}
                                  </p>
                                </div>
                              </>
                            )}
                          </div>

                          {/* Motivo e Origem */}
                          {credito.motivo && (
                            <div className="bg-default-50 p-2 rounded text-xs">
                              <p className="text-gray-600 mb-1">
                                <strong>Motivo:</strong>
                              </p>
                              <p className="text-gray-700">{credito.motivo}</p>
                            </div>
                          )}

                          {credito.venda_origem_id && (
                            <div className="mt-2 text-xs text-gray-600">
                              <span>
                                Origem: Venda #
                                {credito.venda_origem_id.slice(0, 8)}
                              </span>
                            </div>
                          )}

                          {credito.devolucao_id && (
                            <div className="mt-2 text-xs text-gray-600">
                              <span>
                                Devolução: #{credito.devolucao_id.slice(0, 8)}
                              </span>
                            </div>
                          )}

                          {credito.usuario && (
                            <div className="mt-2 text-xs text-gray-600">
                              <span>Gerado por: {credito.usuario.nome}</span>
                            </div>
                          )}
                        </div>
                      </AccordionItem>
                    );
                  })}
                </Accordion>
              )}

              {/* Botão Ver Mais / Ver Menos */}
              {temMais && (
                <div className="flex justify-center pt-4">
                  <Button
                    color="primary"
                    size="sm"
                    variant="flat"
                    onPress={() => setMostrarTodos(!mostrarTodos)}
                  >
                    {mostrarTodos
                      ? "Ver menos"
                      : `Ver mais (${creditos.length - 5} ${creditos.length - 5 === 1 ? "registro" : "registros"})`}
                  </Button>
                </div>
              )}
            </div>
          )}
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
