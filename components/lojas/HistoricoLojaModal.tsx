"use client";

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Chip,
  Spinner,
} from "@heroui/react";
import { XMarkIcon, ClockIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { HistoricoLojasService } from "@/services/historicoLojasService";
import type { HistoricoLojaComUsuario, Loja } from "@/types";

interface HistoricoLojaModalProps {
  isOpen: boolean;
  onClose: () => void;
  lojaId: number;
  lojaNome: string;
}

export function HistoricoLojaModal({
  isOpen,
  onClose,
  lojaId,
  lojaNome,
}: HistoricoLojaModalProps) {
  const [historico, setHistorico] = useState<HistoricoLojaComUsuario[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      carregarHistorico();
    }
  }, [isOpen, lojaId]);

  async function carregarHistorico() {
    setLoading(true);
    try {
      const data = await HistoricoLojasService.getHistoricoPorLoja(lojaId);
      setHistorico(data);
    } catch (error) {
      console.error("Erro ao carregar histórico:", error);
    } finally {
      setLoading(false);
    }
  }

  function renderizarAlteracao(item: HistoricoLojaComUsuario) {
    const { operacao, dados_antigos, dados_novos, campos_modificados } = item;

    if (operacao === "INSERT") {
      return (
        <div className="text-sm text-gray-600">
          <p className="font-medium text-green-600 mb-2">✓ Loja criada</p>
          {dados_novos && (
            <div className="bg-green-50 p-3 rounded-lg space-y-1">
              <p>
                <span className="font-medium">Nome:</span> {dados_novos.nome}
              </p>
              {dados_novos.cnpj && (
                <p>
                  <span className="font-medium">CNPJ:</span> {dados_novos.cnpj}
                </p>
              )}
              {dados_novos.cidade && (
                <p>
                  <span className="font-medium">Cidade:</span>{" "}
                  {dados_novos.cidade}/{dados_novos.estado}
                </p>
              )}
            </div>
          )}
        </div>
      );
    }

    if (operacao === "DELETE") {
      return (
        <div className="text-sm text-gray-600">
          <p className="font-medium text-red-600 mb-2">✗ Loja excluída</p>
        </div>
      );
    }

    if (
      operacao === "UPDATE" &&
      campos_modificados &&
      campos_modificados.length > 0
    ) {
      return (
        <div className="text-sm space-y-3">
          <p className="font-medium text-orange-600 mb-2">
            ↻ Campos alterados:
          </p>
          {campos_modificados.map((campo) => {
            const valorAntigo = dados_antigos?.[campo as keyof Loja];
            const valorNovo = dados_novos?.[campo as keyof Loja];

            return (
              <div key={campo} className="bg-orange-50 p-3 rounded-lg">
                <p className="font-medium text-gray-700 mb-1">
                  {HistoricoLojasService.formatarCampo(campo)}
                </p>
                <div className="flex items-center gap-2 text-gray-600">
                  <span className="text-red-600 line-through">
                    {HistoricoLojasService.formatarValor(campo, valorAntigo)}
                  </span>
                  <span>→</span>
                  <span className="text-green-600 font-medium">
                    {HistoricoLojasService.formatarValor(campo, valorNovo)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    return null;
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="3xl" scrollBehavior="inside">
      <ModalContent>
        <ModalHeader className="flex items-center gap-2">
          <ClockIcon className="w-5 h-5" />
          <div>
            <p className="text-lg">Histórico de Alterações</p>
            <p className="text-sm font-normal text-gray-500">{lojaNome}</p>
          </div>
        </ModalHeader>

        <ModalBody>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Spinner label="Carregando histórico..." />
            </div>
          ) : historico.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <ClockIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>Nenhuma alteração registrada</p>
            </div>
          ) : (
            <div className="space-y-4">
              {historico.map((item) => (
                <div
                  key={item.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  {/* Cabeçalho */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Chip
                        color={HistoricoLojasService.getCorOperacao(
                          item.operacao
                        )}
                        variant="flat"
                        size="sm"
                      >
                        {HistoricoLojasService.formatarOperacao(item.operacao)}
                      </Chip>
                      <span className="text-sm text-gray-600">
                        {new Date(item.criado_em).toLocaleString("pt-BR")}
                      </span>
                    </div>
                  </div>

                  {/* Alterações */}
                  {renderizarAlteracao(item)}

                  {/* Rodapé - Usuário */}
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-500">
                      Realizado por:{" "}
                      <span className="font-medium text-gray-700">
                        {item.usuario_nome || "Sistema"}
                      </span>
                      {item.usuario_email && ` (${item.usuario_email})`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ModalBody>

        <ModalFooter>
          <Button
            color="danger"
            variant="light"
            onPress={onClose}
            startContent={<XMarkIcon className="w-4 h-4" />}
          >
            Fechar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
