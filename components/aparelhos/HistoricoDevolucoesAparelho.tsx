"use client";

import type { DevolucaoAparelho } from "@/types/aparelhos";

import { useEffect, useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  Card,
  CardBody,
  Chip,
  Divider,
  Spinner,
} from "@heroui/react";
import {
  History,
  PackageX,
  ShieldCheck,
  RefreshCcw,
  User,
  Calendar,
} from "lucide-react";

import { DevolucoesAparelhosService } from "@/services/devolucoesAparelhosService";

interface HistoricoDevolucoesAparelhoProps {
  isOpen: boolean;
  aparelhoId: string;
  onClose: () => void;
}

const TIPO_LABEL: Record<string, string> = {
  devolucao: "Devolucao",
  troca: "Troca",
  garantia: "Garantia",
};

export function HistoricoDevolucoesAparelho({
  isOpen,
  aparelhoId,
  onClose,
}: HistoricoDevolucoesAparelhoProps) {
  const [loading, setLoading] = useState(true);
  const [registros, setRegistros] = useState<DevolucaoAparelho[]>([]);

  useEffect(() => {
    if (isOpen) {
      carregarHistorico();
    }
  }, [isOpen, aparelhoId]);

  const carregarHistorico = async () => {
    try {
      setLoading(true);
      const data =
        await DevolucoesAparelhosService.listarDevolucoesAparelho(aparelhoId);

      setRegistros(data || []);
    } catch (error) {
      console.error("Erro ao carregar historico:", error);
      setRegistros([]);
    } finally {
      setLoading(false);
    }
  };

  const formatarData = (data?: string) => {
    if (!data) return "-";

    return new Date(data).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderIcon = (tipo: string) => {
    if (tipo === "garantia") return <ShieldCheck className="w-4 h-4" />;
    if (tipo === "troca") return <RefreshCcw className="w-4 h-4" />;

    return <PackageX className="w-4 h-4" />;
  };

  return (
    <Modal isOpen={isOpen} scrollBehavior="inside" size="3xl" onClose={onClose}>
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-primary" />
            <span>Historico de Devolucoes</span>
          </div>
          <p className="text-sm font-normal text-default-500">
            {registros.length} registro(s)
          </p>
        </ModalHeader>
        <ModalBody>
          {loading ? (
            <div className="flex justify-center py-8">
              <Spinner size="lg" />
            </div>
          ) : registros.length === 0 ? (
            <Card className="bg-default-50">
              <CardBody className="text-center py-8">
                <PackageX className="w-10 h-10 text-default-300 mx-auto mb-3" />
                <p className="text-default-500">Nenhum registro encontrado</p>
              </CardBody>
            </Card>
          ) : (
            <div className="space-y-4">
              {registros.map((registro) => (
                <Card key={registro.id} className="border-l-4 border-l-warning">
                  <CardBody className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-2">
                        <Chip
                          color={
                            registro.tipo === "garantia" ? "success" : "warning"
                          }
                          size="sm"
                          startContent={renderIcon(registro.tipo)}
                          variant="flat"
                        >
                          {TIPO_LABEL[registro.tipo] || registro.tipo}
                        </Chip>
                        <div className="flex items-center gap-2 text-sm text-default-500">
                          <Calendar className="w-4 h-4" />
                          {formatarData(
                            registro.data_ocorrencia || registro.criado_em,
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-default-500">
                        <User className="w-4 h-4" />
                        {registro.usuario?.nome || "Nao informado"}
                      </div>
                    </div>

                    <Divider className="my-3" />

                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-default-500">Motivo: </span>
                        <span className="font-medium">{registro.motivo}</span>
                      </div>
                      {registro.observacoes ? (
                        <div>
                          <span className="text-default-500">Obs: </span>
                          <span>{registro.observacoes}</span>
                        </div>
                      ) : null}
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
