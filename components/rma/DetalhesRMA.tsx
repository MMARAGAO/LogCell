"use client";

import React, { useState, useEffect } from "react";
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
  Select,
  SelectItem,
  Image,
} from "@heroui/react";
import {
  Package,
  Store,
  User,
  Calendar,
  FileText,
  History,
  Camera,
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock,
  Truck,
  PackageCheck,
  Ban,
  Trash2,
  PackagePlus,
} from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";
import { rmaService } from "@/services/rmaService";
import {
  RMA,
  HistoricoRMA,
  FotoRMA,
  StatusRMA,
  LABELS_TIPO_ORIGEM,
  LABELS_TIPO_RMA,
  LABELS_STATUS_RMA,
  CORES_STATUS_RMA,
} from "@/types/rma";

interface DetalhesRMAProps {
  isOpen: boolean;
  onClose: () => void;
  rmaId: string;
  onAtualizar?: () => void;
}

const ICONES_STATUS: Record<StatusRMA, any> = {
  pendente: Clock,
  em_analise: FileText,
  aprovado: CheckCircle,
  reprovado: XCircle,
  em_transito: Truck,
  recebido: PackageCheck,
  concluido: CheckCircle,
  cancelado: Ban,
};

const CORES_TIPO_ACAO: Record<string, string> = {
  criacao: "text-primary",
  mudanca_status: "text-warning",
  atualizacao: "text-secondary",
  adicao_foto: "text-success",
  adicao_observacao: "text-primary",
  movimentacao_estoque: "text-danger",
};

export default function DetalhesRMA({
  isOpen,
  onClose,
  rmaId,
  onAtualizar,
}: DetalhesRMAProps) {
  const { usuario } = useAuth();
  const [rma, setRma] = useState<RMA | null>(null);
  const [historico, setHistorico] = useState<HistoricoRMA[]>([]);
  const [fotos, setFotos] = useState<FotoRMA[]>([]);
  const [loading, setLoading] = useState(true);
  const [atualizandoStatus, setAtualizandoStatus] = useState(false);
  const [novoStatus, setNovoStatus] = useState<StatusRMA | "">("");
  const [cancelando, setCancelando] = useState(false);
  const [deletando, setDeletando] = useState(false);
  const [devolvendo, setDevolvendo] = useState(false);
  const [mostrarModalDevolucao, setMostrarModalDevolucao] = useState(false);
  const [statusPendente, setStatusPendente] = useState<StatusRMA | null>(null);

  useEffect(() => {
    if (isOpen && rmaId) {
      carregarDados();
    }
  }, [isOpen, rmaId]);

  const carregarDados = async () => {
    setLoading(true);
    try {
      const [rmaData, historicoData, fotosData] = await Promise.all([
        rmaService.buscarRMAPorId(rmaId),
        rmaService.buscarHistorico(rmaId),
        rmaService.buscarFotos(rmaId),
      ]);

      setRma(rmaData);
      setHistorico(historicoData);
      setFotos(fotosData);
      setNovoStatus(rmaData?.status || "");
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAtualizarStatus = async () => {
    if (!novoStatus || !usuario || novoStatus === rma?.status) return;

    // Se o novo status for "concluido", mostrar modal de confirmação
    if (novoStatus === "concluido") {
      setStatusPendente(novoStatus);
      setMostrarModalDevolucao(true);

      return;
    }

    // Para outros status, atualizar diretamente
    await atualizarStatusComDevolucao(novoStatus, false);
  };

  const atualizarStatusComDevolucao = async (
    status: StatusRMA,
    devolver: boolean,
  ) => {
    setAtualizandoStatus(true);
    try {
      await rmaService.atualizarStatus(rmaId, status, usuario!.id, devolver);
      await carregarDados();
      if (onAtualizar) onAtualizar();
      setNovoStatus(""); // Limpar seleção
      setMostrarModalDevolucao(false);
      setStatusPendente(null);
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      alert("Erro ao atualizar status. Tente novamente.");
    } finally {
      setAtualizandoStatus(false);
    }
  };

  const handleConfirmarDevolucao = (devolver: boolean) => {
    if (statusPendente) {
      atualizarStatusComDevolucao(statusPendente, devolver);
    }
  };

  const handleCancelarRMA = async () => {
    if (!usuario || !rma) return;

    if (
      !confirm(
        "Tem certeza que deseja cancelar este RMA? O produto será devolvido ao estoque.",
      )
    ) {
      return;
    }

    setCancelando(true);
    try {
      await rmaService.cancelarRMA(rmaId, usuario.id);
      await carregarDados();
      if (onAtualizar) onAtualizar();
    } catch (error) {
      console.error("Erro ao cancelar RMA:", error);
      alert("Erro ao cancelar RMA. Tente novamente.");
    } finally {
      setCancelando(false);
    }
  };

  const handleDeletarRMA = async () => {
    if (!usuario || !rma) return;

    if (
      !confirm(
        "Tem certeza que deseja deletar este RMA? Esta ação não pode ser desfeita.",
      )
    ) {
      return;
    }

    setDeletando(true);
    try {
      await rmaService.deletarRMA(rmaId);
      if (onAtualizar) onAtualizar();
      onClose();
    } catch (error) {
      console.error("Erro ao deletar RMA:", error);
      alert("Erro ao deletar RMA. Tente novamente.");
    } finally {
      setDeletando(false);
    }
  };

  const handleDevolverAoEstoque = async () => {
    if (!usuario || !rma) return;

    const motivo = prompt(
      "Informe o motivo da devolução ao estoque (opcional):",
      "Produto reparado/analisado",
    );

    if (motivo === null) return; // Usuário cancelou

    setDevolvendo(true);
    try {
      await rmaService.devolverAoEstoque(rmaId, usuario.id, motivo);
      await carregarDados();
      if (onAtualizar) onAtualizar();
      alert("Produto devolvido ao estoque com sucesso!");
    } catch (error: any) {
      console.error("Erro ao devolver ao estoque:", error);
      alert(error.message || "Erro ao devolver ao estoque. Tente novamente.");
    } finally {
      setDevolvendo(false);
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

  if (loading) {
    return (
      <Modal isOpen={isOpen} size="4xl" onClose={onClose}>
        <ModalContent>
          <ModalBody className="py-8">
            <div className="text-center">Carregando...</div>
          </ModalBody>
        </ModalContent>
      </Modal>
    );
  }

  if (!rma) {
    return (
      <Modal isOpen={isOpen} size="4xl" onClose={onClose}>
        <ModalContent>
          <ModalBody className="py-8">
            <div className="text-center text-danger">RMA não encontrado</div>
          </ModalBody>
        </ModalContent>
      </Modal>
    );
  }

  const IconeStatus = ICONES_STATUS[rma.status];

  return (
    <>
      <Modal
        isOpen={isOpen}
        scrollBehavior="inside"
        size="4xl"
        onClose={onClose}
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">RMA #{rma.numero_rma}</h2>
              <Chip
                color={CORES_STATUS_RMA[rma.status]}
                startContent={<IconeStatus className="w-4 h-4" />}
                variant="flat"
              >
                {LABELS_STATUS_RMA[rma.status]}
              </Chip>
            </div>
          </ModalHeader>

          <ModalBody>
            <div className="space-y-6">
              {/* Informações Principais */}
              <Card>
                <CardBody className="space-y-4">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Informações Principais
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-default-600">Tipo de Origem</p>
                      <p className="font-medium">
                        {LABELS_TIPO_ORIGEM[rma.tipo_origem]}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-default-600">Tipo de RMA</p>
                      <p className="font-medium">
                        {LABELS_TIPO_RMA[rma.tipo_rma]}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-default-600 flex items-center gap-1">
                        <Package className="w-4 h-4" />
                        Produto
                      </p>
                      <p className="font-medium">{rma.produtos?.descricao}</p>
                    </div>

                    <div>
                      <p className="text-sm text-default-600">Quantidade</p>
                      <p className="font-medium">{rma.quantidade} unidade(s)</p>
                    </div>

                    <div>
                      <p className="text-sm text-default-600 flex items-center gap-1">
                        <Store className="w-4 h-4" />
                        Loja
                      </p>
                      <p className="font-medium">{rma.lojas?.nome}</p>
                    </div>

                    {rma.clientes && (
                      <div>
                        <p className="text-sm text-default-600 flex items-center gap-1">
                          <User className="w-4 h-4" />
                          Cliente
                        </p>
                        <p className="font-medium">{rma.clientes.nome}</p>
                        {rma.clientes.telefone && (
                          <p className="text-sm text-default-500">
                            {rma.clientes.telefone}
                          </p>
                        )}
                      </div>
                    )}

                    {rma.fornecedores && (
                      <div>
                        <p className="text-sm text-default-600 flex items-center gap-1">
                          <Truck className="w-4 h-4" />
                          Fornecedor
                        </p>
                        <p className="font-medium">{rma.fornecedores.nome}</p>
                        {rma.fornecedores.telefone && (
                          <p className="text-sm text-default-500">
                            {rma.fornecedores.telefone}
                          </p>
                        )}
                      </div>
                    )}

                    <div>
                      <p className="text-sm text-default-600 flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Criado em
                      </p>
                      <p className="font-medium">
                        {formatarData(rma.criado_em)}
                      </p>
                    </div>
                  </div>

                  <Divider />

                  <div>
                    <p className="text-sm text-default-600 mb-2">Motivo</p>
                    <p className="text-sm bg-default-100 p-3 rounded-lg text-default-700">
                      {rma.motivo}
                    </p>
                  </div>

                  {rma.observacoes_assistencia && (
                    <div>
                      <p className="text-sm text-default-600 mb-2">
                        Observações da Assistência
                      </p>
                      <p className="text-sm bg-default-100 p-3 rounded-lg text-default-700">
                        {rma.observacoes_assistencia}
                      </p>
                    </div>
                  )}
                </CardBody>
              </Card>

              {/* Atualizar Status */}
              <Card>
                <CardBody className="space-y-4">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Atualizar Status
                  </h3>

                  <div className="flex gap-3">
                    <Select
                      className="flex-1"
                      label="Novo Status"
                      selectedKeys={novoStatus ? [novoStatus] : []}
                      onChange={(e) =>
                        setNovoStatus(e.target.value as StatusRMA)
                      }
                    >
                      {Object.entries(LABELS_STATUS_RMA).map(
                        ([valor, label]) => (
                          <SelectItem key={valor}>{label}</SelectItem>
                        ),
                      )}
                    </Select>

                    <Button
                      color="primary"
                      isDisabled={novoStatus === rma.status || !novoStatus}
                      isLoading={atualizandoStatus}
                      onPress={handleAtualizarStatus}
                    >
                      Atualizar
                    </Button>
                  </div>
                </CardBody>
              </Card>

              {/* Fotos */}
              {fotos.length > 0 && (
                <Card>
                  <CardBody className="space-y-4">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      <Camera className="w-5 h-5" />
                      Fotos ({fotos.length})
                    </h3>

                    <div className="grid grid-cols-3 gap-4">
                      {fotos.map((foto) => (
                        <div key={foto.id} className="relative aspect-square">
                          <Image
                            alt={foto.nome_arquivo}
                            className="rounded-lg object-cover w-full h-full"
                            src={foto.url}
                          />
                        </div>
                      ))}
                    </div>
                  </CardBody>
                </Card>
              )}

              {/* Histórico */}
              <Card>
                <CardBody className="space-y-4">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <History className="w-5 h-5" />
                    Histórico de Movimentações
                  </h3>

                  <div className="space-y-3">
                    {historico.map((item, index) => (
                      <div key={item.id}>
                        <div className="flex gap-3">
                          <div className="flex flex-col items-center">
                            <div
                              className={`w-2 h-2 rounded-full ${
                                index === 0 ? "bg-primary" : "bg-gray-300"
                              }`}
                            />
                            {index < historico.length - 1 && (
                              <div className="w-0.5 h-full bg-gray-200 flex-1 my-1" />
                            )}
                          </div>

                          <div className="flex-1 pb-4">
                            <div className="flex items-start justify-between mb-1">
                              <p
                                className={`font-medium ${
                                  CORES_TIPO_ACAO[item.tipo_acao] ||
                                  "text-default-700"
                                }`}
                              >
                                {item.descricao}
                              </p>
                              <p className="text-xs text-default-500">
                                {formatarData(item.criado_em)}
                              </p>
                            </div>

                            {/* Exibir mudanças de status de forma visual */}
                            {item.tipo_acao === "mudanca_status" && (
                              <div className="mt-2 flex items-center gap-2 text-xs">
                                {typeof item.dados_anteriores === "string" && (
                                  <>
                                    <Chip
                                      color="default"
                                      size="sm"
                                      variant="flat"
                                    >
                                      {LABELS_STATUS_RMA[
                                        item.dados_anteriores as StatusRMA
                                      ] || item.dados_anteriores}
                                    </Chip>
                                    <span className="text-default-500">→</span>
                                  </>
                                )}
                                {typeof item.dados_novos === "string" && (
                                  <Chip
                                    color={
                                      CORES_STATUS_RMA[
                                        item.dados_novos as StatusRMA
                                      ] || "default"
                                    }
                                    size="sm"
                                    variant="flat"
                                  >
                                    {LABELS_STATUS_RMA[
                                      item.dados_novos as StatusRMA
                                    ] || item.dados_novos}
                                  </Chip>
                                )}
                              </div>
                            )}

                            {/* Para criação, mostrar apenas descrição sem dados */}
                            {item.tipo_acao === "criacao" && (
                              <div className="mt-1">
                                <Chip color="success" size="sm" variant="flat">
                                  RMA Criado
                                </Chip>
                              </div>
                            )}

                            {/* Para outros tipos de ação, mostrar dados relevantes */}
                            {!["criacao", "mudanca_status"].includes(
                              item.tipo_acao,
                            ) &&
                              item.dados_novos && (
                                <div className="mt-2 space-y-1">
                                  {typeof item.dados_novos === "object" &&
                                  item.dados_novos !== null ? (
                                    <div className="text-xs bg-default-100 p-2 rounded space-y-1">
                                      {Object.entries(item.dados_novos)
                                        .map(([key, value]) => {
                                          // Filtrar campos técnicos
                                          if (
                                            [
                                              "id",
                                              "criado_por",
                                              "criado_em",
                                              "atualizado_em",
                                              "atualizado_por",
                                              "rma_id",
                                            ].includes(key)
                                          ) {
                                            return null;
                                          }

                                          // Formatar valores
                                          let displayValue = value;

                                          if (
                                            value === null ||
                                            value === undefined
                                          ) {
                                            return null;
                                          }
                                          if (typeof value === "object") {
                                            displayValue =
                                              (value as any).nome ||
                                              (value as any).descricao ||
                                              JSON.stringify(value);
                                          }

                                          return (
                                            <div
                                              key={key}
                                              className="flex gap-2"
                                            >
                                              <span className="font-medium text-default-600 capitalize">
                                                {key.replace(/_/g, " ")}:
                                              </span>
                                              <span className="text-default-700">
                                                {String(displayValue)}
                                              </span>
                                            </div>
                                          );
                                        })
                                        .filter(Boolean)}
                                    </div>
                                  ) : typeof item.dados_novos === "string" ? (
                                    <p className="text-xs text-default-600 bg-default-100 p-2 rounded">
                                      {item.dados_novos}
                                    </p>
                                  ) : null}
                                </div>
                              )}
                          </div>
                        </div>
                      </div>
                    ))}

                    {historico.length === 0 && (
                      <p className="text-sm text-default-500 text-center py-4">
                        Nenhum histórico registrado.
                      </p>
                    )}
                  </div>
                </CardBody>
              </Card>
            </div>
          </ModalBody>

          <ModalFooter>
            <div className="flex gap-2 w-full justify-between">
              <div className="flex gap-2">
                {rma.status !== "cancelado" && (
                  <>
                    <Button
                      color="success"
                      isDisabled={cancelando || deletando || devolvendo}
                      isLoading={devolvendo}
                      startContent={<PackagePlus size={18} />}
                      variant="flat"
                      onPress={handleDevolverAoEstoque}
                    >
                      Devolver ao Estoque
                    </Button>
                    <Button
                      color="danger"
                      isDisabled={cancelando || deletando || devolvendo}
                      isLoading={cancelando}
                      startContent={<Ban size={18} />}
                      variant="flat"
                      onPress={handleCancelarRMA}
                    >
                      Cancelar RMA
                    </Button>
                  </>
                )}
                {rma.status === "cancelado" && (
                  <Button
                    color="danger"
                    isDisabled={cancelando || deletando || devolvendo}
                    isLoading={deletando}
                    startContent={<Trash2 size={18} />}
                    variant="solid"
                    onPress={handleDeletarRMA}
                  >
                    Deletar RMA
                  </Button>
                )}
              </div>
              <Button variant="flat" onPress={onClose}>
                Fechar
              </Button>
            </div>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal de Confirmação de Devolução ao Estoque */}
      {mostrarModalDevolucao && (
        <Modal
          isOpen={mostrarModalDevolucao}
          size="md"
          onClose={() => {
            setMostrarModalDevolucao(false);
            setStatusPendente(null);
            setNovoStatus("");
          }}
        >
          <ModalContent>
            <ModalHeader className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <PackagePlus className="w-5 h-5 text-success" />
                <span>Concluir RMA</span>
              </div>
            </ModalHeader>
            <ModalBody>
              <div className="space-y-4">
                <p className="text-default-700">
                  O RMA será marcado como <strong>concluído</strong>.
                </p>
                <div className="bg-default-100 p-4 rounded-lg">
                  <p className="text-sm font-medium text-default-800 mb-2">
                    Deseja devolver o produto ao estoque?
                  </p>
                  <p className="text-xs text-default-600">
                    Se o produto foi reparado ou analisado e está em boas
                    condições, você pode devolvê-lo ao estoque agora.
                  </p>
                </div>
                {rma && (
                  <div className="border-l-3 border-primary pl-3">
                    <p className="text-xs text-default-500">Produto</p>
                    <p className="text-sm font-medium">
                      {rma.produtos?.descricao}
                    </p>
                    <p className="text-xs text-default-600 mt-1">
                      Quantidade: {rma.quantidade} unidade(s)
                    </p>
                  </div>
                )}
              </div>
            </ModalBody>
            <ModalFooter>
              <Button
                isDisabled={atualizandoStatus}
                variant="flat"
                onPress={() => {
                  setMostrarModalDevolucao(false);
                  setStatusPendente(null);
                  setNovoStatus("");
                }}
              >
                Cancelar
              </Button>
              <Button
                color="default"
                isLoading={atualizandoStatus}
                variant="flat"
                onPress={() => handleConfirmarDevolucao(false)}
              >
                Não Devolver
              </Button>
              <Button
                color="success"
                isLoading={atualizandoStatus}
                startContent={!atualizandoStatus && <PackagePlus size={18} />}
                onPress={() => handleConfirmarDevolucao(true)}
              >
                Sim, Devolver ao Estoque
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </>
  );
}
