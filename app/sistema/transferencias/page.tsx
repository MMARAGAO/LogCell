"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { Select, SelectItem } from "@heroui/select";
import { Divider } from "@heroui/divider";
import { Spinner } from "@heroui/spinner";
import { useDisclosure } from "@heroui/modal";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";
import { useToast } from "@/components/Toast";
import { useAuth } from "@/hooks/useAuth";
import { usePermissoes } from "@/hooks/usePermissoes";
import TransferenciaModal from "@/components/estoque/TransferenciaModal";
import { ConfirmModal } from "@/components/ConfirmModal";
import { InputModal } from "@/components/InputModal";
import type { TransferenciaCompleta } from "@/types";
import {
  ArrowRightIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  EyeIcon,
  FunnelIcon,
  PlusIcon,
  DocumentArrowDownIcon,
} from "@heroicons/react/24/outline";
import {
  buscarTransferencias,
  confirmarTransferencia,
  cancelarTransferencia,
} from "@/services/transferenciasService";
import {
  exportarTransferenciasParaExcel,
  gerarRelatorioTransferenciaPDF,
  gerarRelatorioTransferenciaDetalhado,
  gerarRelatorioTransferenciaResumido,
} from "@/lib/exportarTransferencias";

interface Loja {
  id: number;
  nome: string;
}

export default function TransferenciasPage() {
  const toast = useToast();
  const { usuario } = useAuth();
  const { temPermissao } = usePermissoes();

  const {
    isOpen: isTransferenciaOpen,
    onOpen: onTransferenciaOpen,
    onClose: onTransferenciaClose,
  } = useDisclosure();

  const [transferencias, setTransferencias] = useState<TransferenciaCompleta[]>(
    []
  );
  const [lojas, setLojas] = useState<Loja[]>([]);
  const [loading, setLoading] = useState(true);
  const [processando, setProcessando] = useState<string | null>(null);

  // Filtros
  const [filtroStatus, setFiltroStatus] = useState<string>("todas");
  const [filtroLoja, setFiltroLoja] = useState<string>("todas");

  // Transferência selecionada para visualização
  const [transferenciaSelecionada, setTransferenciaSelecionada] =
    useState<TransferenciaCompleta | null>(null);

  // Estados dos modais de confirmação
  const [confirmarModal, setConfirmarModal] = useState({
    isOpen: false,
    transferencia: null as TransferenciaCompleta | null,
  });

  const [cancelarModal, setCancelarModal] = useState({
    isOpen: false,
    transferencia: null as TransferenciaCompleta | null,
  });

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    setLoading(true);
    try {
      const { supabase } = await import("@/lib/supabaseClient");

      // Buscar lojas
      const { data: lojasData, error: lojasError } = await supabase
        .from("lojas")
        .select("id, nome")
        .eq("ativo", true)
        .order("nome");

      if (lojasError) throw lojasError;
      setLojas(lojasData || []);

      // Buscar transferências
      await carregarTransferencias();
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast.error("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  const carregarTransferencias = async () => {
    try {
      const filtros: any = {};

      if (filtroStatus !== "todas") {
        filtros.status = filtroStatus;
      }

      if (filtroLoja !== "todas") {
        const lojaId = parseInt(filtroLoja);
        filtros.lojaId = lojaId;
      }

      const resultado = await buscarTransferencias(filtros);
      setTransferencias(resultado);
    } catch (error: any) {
      console.error("Erro ao buscar transferências:", error);

      // Verificar se é erro de tabela não encontrada
      const mensagemErro = error?.message || JSON.stringify(error);
      if (
        mensagemErro.includes("relation") &&
        mensagemErro.includes("does not exist")
      ) {
        toast.error(
          "Tabela de transferências não encontrada. Execute o script CRIAR_SISTEMA_TRANSFERENCIAS_COMPLETO.sql no Supabase."
        );
      } else {
        toast.error(`Erro ao buscar transferências: ${mensagemErro}`);
      }
    }
  };

  // Recarregar ao mudar filtros
  useEffect(() => {
    if (!loading) {
      carregarTransferencias();
    }
  }, [filtroStatus, filtroLoja]);

  const handleConfirmar = async (transferencia: TransferenciaCompleta) => {
    if (!usuario) return;
    setConfirmarModal({ isOpen: true, transferencia });
  };

  const confirmarTransferenciaModal = async () => {
    if (!usuario || !confirmarModal.transferencia) return;

    const transferencia = confirmarModal.transferencia;
    setConfirmarModal({ isOpen: false, transferencia: null });
    setProcessando(transferencia.id);

    try {
      const resultado = await confirmarTransferencia(
        transferencia.id,
        usuario.id
      );

      if (resultado.success) {
        toast.success("Transferência confirmada com sucesso!");
        await carregarTransferencias();
        setTransferenciaSelecionada(null);
      } else {
        toast.error(resultado.error || "Erro ao confirmar transferência");
      }
    } catch (error: any) {
      console.error("Erro ao confirmar transferência:", error);
      toast.error(error.message || "Erro ao confirmar transferência");
    } finally {
      setProcessando(null);
    }
  };

  const handleCancelar = async (transferencia: TransferenciaCompleta) => {
    if (!usuario) return;
    setCancelarModal({ isOpen: true, transferencia });
  };

  const cancelarTransferenciaModal = async (motivo: string) => {
    if (!usuario || !cancelarModal.transferencia) return;

    const transferencia = cancelarModal.transferencia;
    setCancelarModal({ isOpen: false, transferencia: null });
    setProcessando(transferencia.id);

    try {
      const resultado = await cancelarTransferencia(
        transferencia.id,
        usuario.id,
        motivo
      );

      if (resultado.success) {
        toast.success("Transferência cancelada");
        await carregarTransferencias();
        setTransferenciaSelecionada(null);
      } else {
        toast.error(resultado.error || "Erro ao cancelar transferência");
      }
    } catch (error: any) {
      console.error("Erro ao cancelar transferência:", error);
      toast.error(error.message || "Erro ao cancelar transferência");
    } finally {
      setProcessando(null);
    }
  };

  const transferenciasAgrupadas = useMemo(() => {
    // Agrupar transferências pendentes por origem/destino/data
    const grupos: { [key: string]: TransferenciaCompleta[] } = {};

    transferencias.forEach((t) => {
      if (t.status === "pendente") {
        const data = new Date(t.criado_em).toLocaleDateString("pt-BR");
        const chave = `${t.loja_origem_id}-${t.loja_destino_id}-${data}`;

        if (!grupos[chave]) {
          grupos[chave] = [];
        }
        grupos[chave].push(t);
      }
    });

    return grupos;
  }, [transferencias]);

  const estatisticas = useMemo(() => {
    const pendentes = transferencias.filter(
      (t) => t.status === "pendente"
    ).length;
    const confirmadas = transferencias.filter(
      (t) => t.status === "confirmada"
    ).length;
    const canceladas = transferencias.filter(
      (t) => t.status === "cancelada"
    ).length;

    return { pendentes, confirmadas, canceladas, total: transferencias.length };
  }, [transferencias]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestão de Transferências</h1>
          <p className="text-default-500 mt-1">
            Confirme ou cancele transferências entre lojas
          </p>
        </div>

        <div className="flex gap-2">
          {/* Botão Exportar Excel */}
          <Button
            color="success"
            variant="flat"
            startContent={<DocumentArrowDownIcon className="h-5 w-5" />}
            onPress={() =>
              exportarTransferenciasParaExcel(transferencias, "transferencias")
            }
            isDisabled={transferencias.length === 0}
          >
            Exportar Excel
          </Button>

          {temPermissao("transferencias.criar") && (
            <Button
              color="primary"
              size="lg"
              startContent={<PlusIcon className="h-5 w-5" />}
              onPress={onTransferenciaOpen}
            >
              Nova Transferência
            </Button>
          )}
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardBody className="text-center">
            <div className="text-3xl font-bold text-default-900">
              {estatisticas.total}
            </div>
            <div className="text-sm text-default-500">Total</div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center">
            <div className="text-3xl font-bold text-warning">
              {estatisticas.pendentes}
            </div>
            <div className="text-sm text-default-500">Pendentes</div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center">
            <div className="text-3xl font-bold text-success">
              {estatisticas.confirmadas}
            </div>
            <div className="text-sm text-default-500">Confirmadas</div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center">
            <div className="text-3xl font-bold text-danger">
              {estatisticas.canceladas}
            </div>
            <div className="text-sm text-default-500">Canceladas</div>
          </CardBody>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardBody>
          <div className="flex items-center gap-2 mb-4">
            <FunnelIcon className="h-5 w-5" />
            <span className="font-semibold">Filtros</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Status"
              selectedKeys={[filtroStatus]}
              onSelectionChange={(keys) =>
                setFiltroStatus(Array.from(keys)[0] as string)
              }
            >
              <SelectItem key="todas">Todas</SelectItem>
              <SelectItem key="pendente">Pendentes</SelectItem>
              <SelectItem key="confirmada">Confirmadas</SelectItem>
              <SelectItem key="cancelada">Canceladas</SelectItem>
            </Select>

            <Select
              label="Loja"
              selectedKeys={[filtroLoja]}
              onSelectionChange={(keys) =>
                setFiltroLoja(Array.from(keys)[0] as string)
              }
              items={[{ id: "todas", nome: "Todas as Lojas" }, ...lojas]}
            >
              {(loja) => (
                <SelectItem key={String(loja.id)}>{loja.nome}</SelectItem>
              )}
            </Select>
          </div>
        </CardBody>
      </Card>

      {/* Lista de Transferências */}
      {transferencias.length === 0 ? (
        <Card>
          <CardBody className="text-center py-12">
            <p className="text-default-400">Nenhuma transferência encontrada</p>
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Agrupamentos de Transferências Pendentes */}
          {filtroStatus === "pendente" &&
            Object.keys(transferenciasAgrupadas).length > 0 && (
              <>
                <h2 className="text-xl font-semibold">
                  Transferências Agrupadas (Mesmo Dia/Rota)
                </h2>
                {Object.entries(transferenciasAgrupadas).map(
                  ([chave, grupo]) => {
                    if (grupo.length <= 1) return null;

                    const primeira = grupo[0];
                    const totalItens = grupo.reduce(
                      (acc, t) => acc + t.itens.length,
                      0
                    );

                    return (
                      <Card key={chave} className="border-2 border-warning">
                        <CardHeader className="bg-warning/10">
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-3">
                              <Chip color="warning" variant="solid">
                                {grupo.length} transferências
                              </Chip>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold">
                                  {primeira.loja_origem}
                                </span>
                                <ArrowRightIcon className="h-5 w-5" />
                                <span className="font-semibold">
                                  {primeira.loja_destino}
                                </span>
                              </div>
                              <span className="text-sm text-default-500">
                                {new Date(
                                  primeira.criado_em
                                ).toLocaleDateString("pt-BR")}
                              </span>
                            </div>
                            <Chip size="sm">{totalItens} itens no total</Chip>
                          </div>
                        </CardHeader>
                        <CardBody>
                          <div className="grid grid-cols-1 gap-2">
                            {grupo.map((transferencia) => (
                              <TransferenciaCard
                                key={transferencia.id}
                                transferencia={transferencia}
                                processando={processando === transferencia.id}
                                onConfirmar={handleConfirmar}
                                onCancelar={handleCancelar}
                                onVisualizar={setTransferenciaSelecionada}
                              />
                            ))}
                          </div>
                        </CardBody>
                      </Card>
                    );
                  }
                )}
                <Divider className="my-4" />
              </>
            )}

          {/* Todas as Transferências */}
          <h2 className="text-xl font-semibold">Todas as Transferências</h2>
          <div className="grid grid-cols-1 gap-4">
            {transferencias.map((transferencia) => (
              <TransferenciaCard
                key={transferencia.id}
                transferencia={transferencia}
                processando={processando === transferencia.id}
                onConfirmar={handleConfirmar}
                onCancelar={handleCancelar}
                onVisualizar={setTransferenciaSelecionada}
              />
            ))}
          </div>
        </div>
      )}

      {/* Modal de Detalhes */}
      {transferenciaSelecionada && (
        <DetalhesTransferenciaModal
          transferencia={transferenciaSelecionada}
          onClose={() => setTransferenciaSelecionada(null)}
          onConfirmar={handleConfirmar}
          onCancelar={handleCancelar}
          processando={processando === transferenciaSelecionada.id}
        />
      )}

      {/* Modal de Nova Transferência */}
      <TransferenciaModal
        isOpen={isTransferenciaOpen}
        onClose={onTransferenciaClose}
        onSuccess={() => {
          carregarTransferencias();
          toast.success("Transferência criada com sucesso!");
        }}
      />

      {/* Modal de Confirmação */}
      <ConfirmModal
        isOpen={confirmarModal.isOpen}
        onClose={() =>
          setConfirmarModal({ isOpen: false, transferencia: null })
        }
        title="Confirmar Transferência"
        message={
          confirmarModal.transferencia
            ? `Confirmar transferência de ${confirmarModal.transferencia.itens.length} produto(s) da ${confirmarModal.transferencia.loja_origem} para ${confirmarModal.transferencia.loja_destino}?\n\nEsta ação irá movimentar o estoque e não poderá ser desfeita.`
            : ""
        }
        confirmText="Confirmar Transferência"
        confirmColor="primary"
        onConfirm={confirmarTransferenciaModal}
      />

      {/* Modal de Cancelamento */}
      <InputModal
        isOpen={cancelarModal.isOpen}
        onClose={() => setCancelarModal({ isOpen: false, transferencia: null })}
        title="Cancelar Transferência"
        message="Digite o motivo do cancelamento:"
        placeholder="Ex: Produto indisponível, erro na solicitação..."
        confirmText="Cancelar Transferência"
        onConfirm={cancelarTransferenciaModal}
        isRequired
      />

      {toast.ToastComponent}
    </div>
  );
}

// Componente de Card de Transferência
function TransferenciaCard({
  transferencia,
  processando,
  onConfirmar,
  onCancelar,
  onVisualizar,
}: {
  transferencia: TransferenciaCompleta;
  processando: boolean;
  onConfirmar: (t: TransferenciaCompleta) => void;
  onCancelar: (t: TransferenciaCompleta) => void;
  onVisualizar: (t: TransferenciaCompleta) => void;
}) {
  const statusConfig = {
    pendente: { color: "warning" as const, label: "Pendente", icon: ClockIcon },
    confirmada: {
      color: "success" as const,
      label: "Confirmada",
      icon: CheckCircleIcon,
    },
    cancelada: {
      color: "danger" as const,
      label: "Cancelada",
      icon: XCircleIcon,
    },
  };

  const config = statusConfig[transferencia.status];
  const StatusIcon = config.icon;

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardBody>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-3">
            {/* Cabeçalho */}
            <div className="flex items-center gap-3 flex-wrap">
              <Chip
                color={config.color}
                variant="flat"
                startContent={<StatusIcon className="h-4 w-4" />}
              >
                {config.label}
              </Chip>
              <div className="flex items-center gap-2">
                <span className="font-semibold">
                  {transferencia.loja_origem}
                </span>
                <ArrowRightIcon className="h-5 w-5 text-default-400" />
                <span className="font-semibold">
                  {transferencia.loja_destino}
                </span>
              </div>
              <Chip size="sm" variant="flat">
                {transferencia.itens.length}{" "}
                {transferencia.itens.length === 1 ? "item" : "itens"}
              </Chip>
            </div>

            {/* Informações */}
            <div className="text-sm text-default-500 space-y-1">
              <div>Criado por: {transferencia.usuario_nome}</div>
              <div>
                Data:{" "}
                {new Date(transferencia.criado_em + "Z").toLocaleString(
                  "pt-BR",
                  {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  }
                )}
              </div>
              {transferencia.observacao && (
                <div className="text-xs italic">
                  Obs: {transferencia.observacao}
                </div>
              )}
              {transferencia.confirmado_em && (
                <div className="text-success">
                  Confirmado em:{" "}
                  {new Date(transferencia.confirmado_em + "Z").toLocaleString(
                    "pt-BR",
                    {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  )}
                  {transferencia.confirmado_por_nome &&
                    ` por ${transferencia.confirmado_por_nome}`}
                </div>
              )}
              {transferencia.cancelado_em && (
                <div className="text-danger">
                  Cancelado em:{" "}
                  {new Date(transferencia.cancelado_em + "Z").toLocaleString(
                    "pt-BR",
                    {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  )}
                  {transferencia.cancelado_por_nome &&
                    ` por ${transferencia.cancelado_por_nome}`}
                  {transferencia.motivo_cancelamento &&
                    ` - ${transferencia.motivo_cancelamento}`}
                </div>
              )}
            </div>

            {/* Produtos */}
            <div className="flex flex-wrap gap-2">
              {transferencia.itens.slice(0, 3).map((item) => (
                <Chip key={item.id} size="sm" variant="flat" color="primary">
                  {item.produto_descricao}{" "}
                  {item.produto_marca && `(${item.produto_marca})`} -{" "}
                  {item.quantidade}un
                </Chip>
              ))}
              {transferencia.itens.length > 3 && (
                <Chip size="sm" variant="flat" color="default">
                  +{transferencia.itens.length - 3} mais
                </Chip>
              )}
            </div>
          </div>

          {/* Ações */}
          <div className="flex flex-col gap-2">
            <Button
              size="sm"
              variant="flat"
              color="default"
              startContent={<EyeIcon className="h-4 w-4" />}
              onPress={() => onVisualizar(transferencia)}
            >
              Detalhes
            </Button>

            <Dropdown>
              <DropdownTrigger>
                <Button
                  size="sm"
                  variant="flat"
                  color="success"
                  startContent={<DocumentArrowDownIcon className="h-4 w-4" />}
                >
                  Relatório
                </Button>
              </DropdownTrigger>
              <DropdownMenu aria-label="Opções de relatório">
                <DropdownItem
                  key="completo"
                  description="Relatório original completo"
                  startContent={<DocumentArrowDownIcon className="h-4 w-4" />}
                  onPress={() => gerarRelatorioTransferenciaPDF(transferencia)}
                >
                  Completo
                </DropdownItem>
                <DropdownItem
                  key="detalhado"
                  description="Com todas as informações e códigos"
                  startContent={<DocumentArrowDownIcon className="h-4 w-4" />}
                  onPress={() =>
                    gerarRelatorioTransferenciaDetalhado(transferencia)
                  }
                >
                  Detalhado
                </DropdownItem>
                <DropdownItem
                  key="resumido"
                  description="Versão compacta para impressão"
                  startContent={<DocumentArrowDownIcon className="h-4 w-4" />}
                  onPress={() =>
                    gerarRelatorioTransferenciaResumido(transferencia)
                  }
                >
                  Resumido
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
            {transferencia.status === "pendente" && (
              <>
                <Button
                  size="sm"
                  color="success"
                  startContent={<CheckCircleIcon className="h-4 w-4" />}
                  onPress={() => onConfirmar(transferencia)}
                  isLoading={processando}
                  isDisabled={processando}
                >
                  Confirmar
                </Button>
                <Button
                  size="sm"
                  color="danger"
                  variant="flat"
                  startContent={<XCircleIcon className="h-4 w-4" />}
                  onPress={() => onCancelar(transferencia)}
                  isLoading={processando}
                  isDisabled={processando}
                >
                  Cancelar
                </Button>
              </>
            )}
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

// Modal de Detalhes
function DetalhesTransferenciaModal({
  transferencia,
  onClose,
  onConfirmar,
  onCancelar,
  processando,
}: {
  transferencia: TransferenciaCompleta;
  onClose: () => void;
  onConfirmar: (t: TransferenciaCompleta) => void;
  onCancelar: (t: TransferenciaCompleta) => void;
  processando: boolean;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <Card
        className="max-w-3xl w-full m-4"
        onClick={(e) => e.stopPropagation()}
      >
        <CardHeader className="flex justify-between">
          <h3 className="text-xl font-bold">Detalhes da Transferência</h3>
          <Button size="sm" variant="light" onPress={onClose}>
            ✕
          </Button>
        </CardHeader>
        <CardBody className="space-y-4">
          {/* Informações Gerais */}
          <div>
            <h4 className="font-semibold mb-2">Informações Gerais</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-default-500">Status:</span>{" "}
                <Chip
                  size="sm"
                  color={
                    transferencia.status === "pendente"
                      ? "warning"
                      : transferencia.status === "confirmada"
                        ? "success"
                        : "danger"
                  }
                >
                  {transferencia.status}
                </Chip>
              </div>
              <div>
                <span className="text-default-500">Criado por:</span>{" "}
                {transferencia.usuario_nome}
              </div>
              <div>
                <span className="text-default-500">Origem:</span>{" "}
                {transferencia.loja_origem}
              </div>
              <div>
                <span className="text-default-500">Destino:</span>{" "}
                {transferencia.loja_destino}
              </div>
              <div>
                <span className="text-default-500">Data:</span>{" "}
                {new Date(transferencia.criado_em + "Z").toLocaleString(
                  "pt-BR",
                  {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  }
                )}
              </div>
            </div>
          </div>

          <Divider />

          {/* Produtos */}
          <div>
            <h4 className="font-semibold mb-2">
              Produtos ({transferencia.itens.length})
            </h4>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {transferencia.itens.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 bg-default-100 rounded-lg"
                >
                  <div>
                    <div className="font-medium">{item.produto_descricao}</div>
                    {item.produto_marca && (
                      <div className="text-sm text-default-500">
                        {item.produto_marca}
                      </div>
                    )}
                  </div>
                  <Chip color="primary">{item.quantidade} un</Chip>
                </div>
              ))}
            </div>
          </div>

          {transferencia.observacao && (
            <>
              <Divider />
              <div>
                <h4 className="font-semibold mb-2">Observação</h4>
                <p className="text-sm text-default-600">
                  {transferencia.observacao}
                </p>
              </div>
            </>
          )}

          {/* Ações */}
          <Divider />
          <div className="flex gap-2 justify-end">
            <Dropdown>
              <DropdownTrigger>
                <Button
                  color="success"
                  variant="flat"
                  startContent={<DocumentArrowDownIcon className="h-5 w-5" />}
                >
                  Baixar Relatório
                </Button>
              </DropdownTrigger>
              <DropdownMenu aria-label="Opções de relatório">
                <DropdownItem
                  key="completo"
                  description="Relatório original completo"
                  startContent={<DocumentArrowDownIcon className="h-4 w-4" />}
                  onPress={() => gerarRelatorioTransferenciaPDF(transferencia)}
                >
                  Completo
                </DropdownItem>
                <DropdownItem
                  key="detalhado"
                  description="Com todas as informações e códigos"
                  startContent={<DocumentArrowDownIcon className="h-4 w-4" />}
                  onPress={() =>
                    gerarRelatorioTransferenciaDetalhado(transferencia)
                  }
                >
                  Detalhado
                </DropdownItem>
                <DropdownItem
                  key="resumido"
                  description="Versão compacta para impressão"
                  startContent={<DocumentArrowDownIcon className="h-4 w-4" />}
                  onPress={() =>
                    gerarRelatorioTransferenciaResumido(transferencia)
                  }
                >
                  Resumido
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
            {transferencia.status === "pendente" && (
              <>
                <Button
                  color="danger"
                  variant="flat"
                  onPress={() => {
                    onCancelar(transferencia);
                    onClose();
                  }}
                  isLoading={processando}
                  startContent={<XCircleIcon className="h-5 w-5" />}
                >
                  Cancelar Transferência
                </Button>
                <Button
                  color="success"
                  onPress={() => {
                    onConfirmar(transferencia);
                    onClose();
                  }}
                  isLoading={processando}
                  startContent={<CheckCircleIcon className="h-5 w-5" />}
                >
                  Confirmar Transferência
                </Button>
              </>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
