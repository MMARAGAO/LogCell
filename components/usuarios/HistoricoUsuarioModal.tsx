"use client";

import { useEffect, useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Button } from "@heroui/button";
import { Spinner } from "@heroui/spinner";
import { Chip } from "@heroui/chip";
import {
  ClockIcon,
  UserIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";

import { Usuario } from "@/types";
import {
  HistoricoUsuariosService,
  HistoricoUsuario,
} from "@/services/historicoUsuariosService";

interface HistoricoUsuarioModalProps {
  isOpen: boolean;
  onClose: () => void;
  usuario: Usuario;
}

export function HistoricoUsuarioModal({
  isOpen,
  onClose,
  usuario,
}: HistoricoUsuarioModalProps) {
  const [historico, setHistorico] = useState<HistoricoUsuario[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && usuario) {
      carregarHistorico();
    }
  }, [isOpen, usuario]);

  const carregarHistorico = async () => {
    try {
      setLoading(true);
      const data = await HistoricoUsuariosService.getHistoricoUsuario(
        usuario.id,
      );

      setHistorico(data);
    } catch (error) {
      console.error("Erro ao carregar histórico:", error);
    } finally {
      setLoading(false);
    }
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

  return (
    <Modal
      classNames={{
        base: "bg-background",
        backdrop: "bg-black/50",
      }}
      isOpen={isOpen}
      scrollBehavior="inside"
      size="3xl"
      onClose={onClose}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <h2 className="text-xl font-bold">Histórico de Alterações</h2>
          <p className="text-sm text-default-500">
            Usuário: {usuario.nome} ({usuario.email})
          </p>
        </ModalHeader>

        <ModalBody>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Spinner label="Carregando histórico..." size="lg" />
            </div>
          ) : historico.length === 0 ? (
            <div className="text-center py-8 text-default-400">
              <ClockIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Nenhuma alteração registrada para este usuário.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {historico.map((item) => (
                <div
                  key={item.id}
                  className="border border-default-200 rounded-lg p-4 hover:border-default-300 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Chip
                        color={HistoricoUsuariosService.getCorOperacao(
                          item.tipo_operacao,
                        )}
                        size="sm"
                        variant="flat"
                      >
                        {HistoricoUsuariosService.formatarOperacao(
                          item.tipo_operacao,
                        )}
                      </Chip>
                      <span className="font-semibold text-default-700">
                        {HistoricoUsuariosService.formatarNomeCampo(
                          item.campo_alterado,
                        )}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-default-400">
                      <ClockIcon className="w-4 h-4" />
                      {formatarData(item.data_alteracao)}
                    </div>
                  </div>

                  {item.tipo_operacao === "UPDATE" &&
                    item.valor_anterior &&
                    item.valor_novo && (
                      <div className="flex items-center gap-3 pl-2">
                        <div className="flex-1 bg-danger-50 dark:bg-danger-900/20 rounded-md p-2 border border-danger-200 dark:border-danger-800">
                          <p className="text-xs text-danger-600 dark:text-danger-400 font-medium mb-1">
                            Valor Anterior
                          </p>
                          <p className="text-sm text-default-700 break-words">
                            {item.valor_anterior}
                          </p>
                        </div>

                        <ArrowRightIcon className="w-5 h-5 text-default-400 flex-shrink-0" />

                        <div className="flex-1 bg-success-50 dark:bg-success-900/20 rounded-md p-2 border border-success-200 dark:border-success-800">
                          <p className="text-xs text-success-600 dark:text-success-400 font-medium mb-1">
                            Valor Novo
                          </p>
                          <p className="text-sm text-default-700 break-words">
                            {item.valor_novo}
                          </p>
                        </div>
                      </div>
                    )}

                  {(item.tipo_operacao === "INSERT" ||
                    item.tipo_operacao === "DELETE") && (
                    <div className="pl-2">
                      <p className="text-sm text-default-600">
                        {item.valor_novo || item.valor_anterior}
                      </p>
                    </div>
                  )}

                  {item.usuario_alterou && (
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-default-100">
                      <UserIcon className="w-4 h-4 text-default-400" />
                      <span className="text-xs text-default-500">
                        Alterado por:{" "}
                        <span className="font-medium text-default-700">
                          {item.usuario_alterou.nome}
                        </span>
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </ModalBody>

        <ModalFooter>
          <Button color="primary" variant="light" onPress={onClose}>
            Fechar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
