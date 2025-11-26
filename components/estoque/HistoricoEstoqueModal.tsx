import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { Spinner } from "@heroui/spinner";
import { useState, useEffect } from "react";
import { HistoricoEstoqueCompleto } from "@/types";
import {
  ArrowUpCircleIcon,
  ArrowDownCircleIcon,
} from "@heroicons/react/24/outline";

interface HistoricoEstoqueModalProps {
  isOpen: boolean;
  onClose: () => void;
  produtoId: string;
  produtoNome: string;
  onLoadHistorico: (produtoId: string) => Promise<HistoricoEstoqueCompleto[]>;
}

export default function HistoricoEstoqueModal({
  isOpen,
  onClose,
  produtoId,
  produtoNome,
  onLoadHistorico,
}: HistoricoEstoqueModalProps) {
  const [historico, setHistorico] = useState<HistoricoEstoqueCompleto[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && produtoId) {
      carregarHistorico();
    }
  }, [isOpen, produtoId]);

  const carregarHistorico = async () => {
    setLoading(true);
    try {
      const dados = await onLoadHistorico(produtoId);
      setHistorico(dados);
    } catch (error) {
      console.error("Erro ao carregar histórico:", error);
    } finally {
      setLoading(false);
    }
  };

  const getIconeAlteracao = (item: HistoricoEstoqueCompleto) => {
    if (
      item.quantidade_anterior === undefined ||
      item.quantidade_nova === undefined
    )
      return null;
    const alteracao = item.quantidade_nova - item.quantidade_anterior;
    if (alteracao > 0) {
      return <ArrowUpCircleIcon className="w-5 h-5 text-success" />;
    } else if (alteracao < 0) {
      return <ArrowDownCircleIcon className="w-5 h-5 text-danger" />;
    }
    return null;
  };

  const getCorAlteracao = (
    item: HistoricoEstoqueCompleto
  ): "success" | "danger" | "default" => {
    if (
      item.quantidade_anterior === undefined ||
      item.quantidade_nova === undefined
    )
      return "default";
    const alteracao = item.quantidade_nova - item.quantidade_anterior;
    if (alteracao > 0) return "success";
    if (alteracao < 0) return "danger";
    return "default";
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

  const getTipoMovimentacao = (tipo?: string) => {
    const tipos: Record<
      string,
      {
        label: string;
        color: "success" | "danger" | "warning" | "primary" | "default";
      }
    > = {
      venda: { label: "Venda", color: "danger" },
      devolucao_venda: { label: "Devolução", color: "success" },
      entrada: { label: "Entrada", color: "success" },
      ajuste: { label: "Ajuste", color: "warning" },
      transferencia_saida: { label: "Transferência (Saída)", color: "danger" },
      transferencia_entrada: {
        label: "Transferência (Entrada)",
        color: "success",
      },
      ordem_servico: { label: "Ordem de Serviço", color: "primary" },
      quebra: { label: "Quebra", color: "danger" },
    };
    return (
      tipos[tipo || "ajuste"] || { label: tipo || "Ajuste", color: "default" }
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="3xl" scrollBehavior="inside">
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <span>Histórico de Alterações</span>
          <span className="text-sm text-default-500 font-normal">
            {produtoNome}
          </span>
        </ModalHeader>
        <ModalBody>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Spinner size="lg" />
            </div>
          ) : historico.length > 0 ? (
            <div className="space-y-3">
              {historico.map((item) => (
                <div
                  key={item.id}
                  className="p-4 border border-default-200 rounded-lg hover:bg-default-50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    {/* Ícone e Informações */}
                    <div className="flex items-center gap-3 flex-1">
                      {getIconeAlteracao(item)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          {/* Tipo de Movimentação */}
                          {item.tipo_movimentacao &&
                            (() => {
                              const tipo = getTipoMovimentacao(
                                item.tipo_movimentacao
                              );
                              return (
                                <Chip
                                  color={tipo.color}
                                  variant="flat"
                                  size="sm"
                                  className="font-semibold"
                                >
                                  {tipo.label}
                                </Chip>
                              );
                            })()}

                          {/* Alteração de Quantidade */}
                          {item.quantidade_anterior !== undefined &&
                            item.quantidade_nova !== undefined &&
                            (() => {
                              const alteracao =
                                item.quantidade_nova - item.quantidade_anterior;
                              return alteracao !== 0 ? (
                                <Chip
                                  color={getCorAlteracao(item)}
                                  variant="flat"
                                  size="sm"
                                >
                                  {alteracao > 0 ? "+" : ""}
                                  {alteracao}
                                </Chip>
                              ) : null;
                            })()}

                          {/* Data */}
                          <span className="text-sm text-default-500">
                            {formatarData(item.criado_em)}
                          </span>
                        </div>

                        {/* Loja */}
                        {item.loja_nome && (
                          <p className="text-sm mt-1">
                            <span className="font-semibold">Loja:</span>{" "}
                            {item.loja_nome}
                          </p>
                        )}

                        {/* Antes e Depois */}
                        {item.quantidade_anterior !== undefined &&
                          item.quantidade_nova !== undefined && (
                            <p className="text-sm mt-1">
                              <span className="font-semibold">Mudança:</span>{" "}
                              <span className="text-danger">
                                {item.quantidade_anterior}
                              </span>{" "}
                              →{" "}
                              <span className="text-success">
                                {item.quantidade_nova}
                              </span>
                            </p>
                          )}

                        {/* Motivo */}
                        {item.motivo && (
                          <p className="text-sm text-default-600 mt-1">
                            <span className="font-semibold">Motivo:</span>{" "}
                            {item.motivo}
                          </p>
                        )}

                        {/* Observação */}
                        {item.observacao && (
                          <p className="text-sm text-default-500 mt-1 italic">
                            "{item.observacao}"
                          </p>
                        )}

                        {/* Usuário */}
                        {item.usuario_nome && (
                          <p className="text-xs text-default-400 mt-2">
                            Por: {item.usuario_nome}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-default-500">
              <p>Nenhuma alteração registrada para este produto.</p>
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
