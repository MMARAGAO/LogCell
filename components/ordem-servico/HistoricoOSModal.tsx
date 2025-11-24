"use client";

import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  Button,
  Chip,
  Spinner,
} from "@heroui/react";
import {
  History,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  RefreshCw,
} from "lucide-react";
import { useToast } from "@/components/Toast";
import { buscarHistoricoOS } from "@/services/ordemServicoService";
import type { HistoricoOrdemServico } from "@/types/ordemServico";

interface HistoricoOSModalProps {
  isOpen: boolean;
  onClose: () => void;
  idOrdemServico: string;
}

export default function HistoricoOSModal({
  isOpen,
  onClose,
  idOrdemServico,
}: HistoricoOSModalProps) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [historico, setHistorico] = useState<HistoricoOrdemServico[]>([]);

  useEffect(() => {
    if (isOpen) {
      carregarHistorico();
    }
  }, [isOpen, idOrdemServico]);

  const carregarHistorico = async () => {
    setLoading(true);
    const { data, error } = await buscarHistoricoOS(idOrdemServico);
    if (data) {
      setHistorico(data);
    } else if (error) {
      toast.error(error);
    }
    setLoading(false);
  };

  const getIconByTipo = (tipo: string) => {
    // Novos tipos de evento
    if (tipo === "foto_adicionada") return <Plus className="w-4 h-4" />;
    if (tipo === "foto_removida") return <Trash2 className="w-4 h-4" />;
    if (tipo === "peca_adicionada") return <Plus className="w-4 h-4" />;
    if (tipo === "peca_atualizada") return <Edit className="w-4 h-4" />;
    if (tipo === "peca_removida") return <Trash2 className="w-4 h-4" />;
    if (tipo === "laudo_preenchido" || tipo === "laudo_atualizado")
      return <Edit className="w-4 h-4" />;
    if (tipo === "quebra_registrada")
      return <AlertCircle className="w-4 h-4" />;
    if (tipo === "quebra_aprovada") return <CheckCircle className="w-4 h-4" />;
    if (tipo === "quebra_reprovada") return <XCircle className="w-4 h-4" />;

    // Tipos antigos
    switch (tipo) {
      case "criacao":
        return <Plus className="w-4 h-4" />;
      case "edicao":
        return <Edit className="w-4 h-4" />;
      case "exclusao":
        return <Trash2 className="w-4 h-4" />;
      case "mudanca_status":
        return <CheckCircle className="w-4 h-4" />;
      case "adicao_peca":
        return <Plus className="w-4 h-4" />;
      case "remocao_peca":
        return <Trash2 className="w-4 h-4" />;
      case "cancelamento":
        return <XCircle className="w-4 h-4" />;
      default:
        return <History className="w-4 h-4" />;
    }
  };

  const getColorByTipo = (
    tipo: string
  ): "default" | "primary" | "success" | "warning" | "danger" => {
    // Novos tipos de evento
    if (tipo === "foto_adicionada" || tipo === "peca_adicionada")
      return "success";
    if (tipo === "foto_removida" || tipo === "peca_removida") return "warning";
    if (tipo === "peca_atualizada" || tipo === "laudo_atualizado")
      return "primary";
    if (tipo === "laudo_preenchido") return "success";
    if (tipo === "quebra_registrada") return "warning";
    if (tipo === "quebra_aprovada") return "success";
    if (tipo === "quebra_reprovada") return "danger";

    // Tipos antigos
    switch (tipo) {
      case "criacao":
        return "success";
      case "edicao":
        return "primary";
      case "exclusao":
      case "cancelamento":
        return "danger";
      case "mudanca_status":
        return "primary";
      case "adicao_peca":
        return "success";
      case "remocao_peca":
        return "warning";
      default:
        return "default";
    }
  };

  const formatarData = (data: string) => {
    // Garantir que a data seja tratada como UTC se não tiver timezone
    const dataUTC = data.endsWith("Z") ? data : data + "Z";
    return new Date(dataUTC).toLocaleString("pt-BR", {
      timeZone: "America/Sao_Paulo",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const formatarValor = (valor: any): string => {
    if (valor === null || valor === undefined) {
      return "null";
    }

    // Verificar se é uma data ISO (formato: YYYY-MM-DD ou YYYY-MM-DDTHH:MM:SS)
    if (typeof valor === "string") {
      // Regex para detectar datas ISO
      const dataISORegex =
        /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})?)?$/;
      if (dataISORegex.test(valor)) {
        try {
          // Garantir que a data seja tratada como UTC
          const dataUTC =
            valor.endsWith("Z") ||
            valor.includes("+") ||
            (valor.includes("-") && valor.lastIndexOf("-") > 10)
              ? valor
              : valor + "Z";
          const date = new Date(dataUTC);
          if (!isNaN(date.getTime())) {
            return date.toLocaleString("pt-BR", {
              timeZone: "America/Sao_Paulo",
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            });
          }
        } catch (e) {
          // Se falhar, retorna o valor original
        }
      }
    }

    if (typeof valor === "object") {
      return JSON.stringify(valor);
    }

    return String(valor);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="3xl" scrollBehavior="inside">
      <ModalContent>
        <ModalHeader className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5" />
            Histórico da Ordem de Serviço
          </div>
          <Button
            size="sm"
            variant="light"
            isIconOnly
            onPress={carregarHistorico}
            isLoading={loading}
            title="Recarregar histórico"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </ModalHeader>
        <ModalBody>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Spinner size="lg" />
            </div>
          ) : historico.length === 0 ? (
            <div className="text-center py-8 text-default-500">
              <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Nenhum registro de histórico encontrado</p>
            </div>
          ) : (
            <div className="space-y-4 pb-4">
              {historico.map((item, index) => (
                <div key={item.id} className="flex gap-4 relative">
                  {/* Linha de conexão */}
                  {index < historico.length - 1 && (
                    <div className="absolute left-5 top-10 bottom-0 w-px bg-divider" />
                  )}

                  {/* Ícone do evento */}
                  <div className="flex-shrink-0 relative z-10">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center bg-${getColorByTipo(
                        item.tipo_evento
                      )}-100 dark:bg-${getColorByTipo(item.tipo_evento)}-900/30 text-${getColorByTipo(
                        item.tipo_evento
                      )}`}
                    >
                      {getIconByTipo(item.tipo_evento)}
                    </div>
                  </div>

                  {/* Conteúdo do evento */}
                  <div className="flex-1 bg-default-100 rounded-lg p-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1">
                        <Chip
                          size="sm"
                          color={getColorByTipo(item.tipo_evento)}
                          variant="flat"
                          className="mb-2"
                        >
                          {item.tipo_evento.replace(/_/g, " ").toUpperCase()}
                        </Chip>
                        <p className="font-medium text-default-900">
                          {item.descricao}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-default-500">
                        <Clock className="w-3 h-3" />
                        {formatarData(item.criado_em)}
                      </div>
                    </div>

                    {/* Usuário responsável */}
                    {item.criado_por_nome && (
                      <p className="text-sm text-default-600 mt-2">
                        Por:{" "}
                        <span className="font-medium">
                          {item.criado_por_nome}
                        </span>
                      </p>
                    )}

                    {/* Dados alterados */}
                    {item.dados_anteriores &&
                      Object.keys(item.dados_anteriores).length > 0 && (
                        <div className="mt-3 pt-3 border-t border-divider">
                          <p className="text-xs font-semibold text-default-600 mb-2">
                            Dados Anteriores:
                          </p>
                          <div className="space-y-1 text-xs">
                            {Object.entries(item.dados_anteriores).map(
                              ([campo, valor]) => (
                                <div key={campo} className="flex gap-2">
                                  <span className="text-default-500 capitalize">
                                    {campo.replace(/_/g, " ")}:
                                  </span>
                                  <span className="font-medium text-default-900">
                                    {formatarValor(valor)}
                                  </span>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}

                    {/* Dados novos (para criação) */}
                    {item.dados_novos && item.tipo_evento === "criacao" && (
                      <div className="mt-3 pt-3 border-t border-divider">
                        <p className="text-xs font-semibold text-default-600 mb-2">
                          Dados Criados:
                        </p>
                        <div className="text-xs space-y-1">
                          {Object.entries(item.dados_novos)
                            .slice(0, 5)
                            .map(([campo, valor]) => (
                              <div key={campo} className="flex gap-2">
                                <span className="text-default-500 capitalize">
                                  {campo.replace(/_/g, " ")}:
                                </span>
                                <span className="font-medium text-default-900">
                                  {formatarValor(valor)}
                                </span>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
