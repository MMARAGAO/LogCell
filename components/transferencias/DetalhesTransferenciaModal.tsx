"use client";

import type { TransferenciaCompleta } from "@/types";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { Divider } from "@heroui/divider";
import { Tabs, Tab } from "@heroui/tabs";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";
import {
  ArrowRightIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  DocumentArrowDownIcon,
  PencilSquareIcon,
  InformationCircleIcon,
  CubeIcon,
} from "@heroicons/react/24/outline";
import {
  gerarRelatorioTransferenciaPDF,
  gerarRelatorioTransferenciaDetalhado,
  gerarRelatorioTransferenciaResumido,
} from "@/lib/exportarTransferencias";

interface DetalhesTransferenciaModalProps {
  isOpen: boolean;
  transferencia: TransferenciaCompleta | null;
  onClose: () => void;
  onConfirmar: (t: TransferenciaCompleta) => void;
  onCancelar: (t: TransferenciaCompleta) => void;
  onEditar: (t: TransferenciaCompleta) => void;
  podeConfirmar: boolean;
  podeEditar: boolean;
  processando: boolean;
}

const statusConfig = {
  pendente: {
    color: "warning" as const,
    label: "Pendente",
    icon: ClockIcon,
    bg: "bg-warning-500/15",
    dot: "bg-warning-500",
    border: "border-warning-500/30",
  },
  confirmada: {
    color: "success" as const,
    label: "Confirmada",
    icon: CheckCircleIcon,
    bg: "bg-success-500/15",
    dot: "bg-success-500",
    border: "border-success-500/30",
  },
  cancelada: {
    color: "danger" as const,
    label: "Cancelada",
    icon: XCircleIcon,
    bg: "bg-danger-500/15",
    dot: "bg-danger-500",
    border: "border-danger-500/30",
  },
};

export function DetalhesTransferenciaModal({
  isOpen,
  transferencia,
  onClose,
  onConfirmar,
  onCancelar,
  onEditar,
  podeConfirmar,
  podeEditar,
  processando,
}: DetalhesTransferenciaModalProps) {
  if (!transferencia) return null;

  const config = statusConfig[transferencia.status];

  return (
    <Modal
      isOpen={isOpen}
      placement="center"
      scrollBehavior="inside"
      size="3xl"
      onClose={onClose}
    >
      <ModalContent>
        {(onModalClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary-500/15 text-primary">
                    <ArrowRightIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">
                      Detalhes da Transferência
                    </h3>
                    <p className="text-xs text-default-500">
                      #{transferencia.id.slice(0, 8).toUpperCase()}
                    </p>
                  </div>
                </div>
                <Chip
                  classNames={{ content: "font-semibold text-xs" }}
                  color={config.color}
                  size="sm"
                  startContent={
                    config.icon && <config.icon className="h-3.5 w-3.5" />
                  }
                  variant="flat"
                >
                  {config.label}
                </Chip>
              </div>
            </ModalHeader>

            <ModalBody className="py-4">
              <Tabs
                aria-label="Detalhes da transferência"
                classNames={{
                  tabList: "gap-6",
                  cursor: "w-full",
                  tab: "max-w-fit px-2 h-10",
                  tabContent: "group-data-[selected=true]:text-primary",
                }}
                color="primary"
                variant="underlined"
              >
                <Tab
                  key="info"
                  title={
                    <div className="flex items-center gap-2">
                      <InformationCircleIcon className="h-4 w-4" />
                      <span>Informações</span>
                    </div>
                  }
                >
                  <div className="space-y-5 pt-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-xs text-default-400 uppercase tracking-wider font-medium">
                          Origem
                        </p>
                        <p className="font-semibold text-foreground">
                          {transferencia.loja_origem}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-default-400 uppercase tracking-wider font-medium">
                          Destino
                        </p>
                        <p className="font-semibold text-foreground">
                          {transferencia.loja_destino}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-default-400 uppercase tracking-wider font-medium">
                          Autorizado por
                        </p>
                        <p className="font-medium text-foreground">
                          {transferencia.usuario_nome}
                        </p>
                        <p className="text-xs text-default-500">
                          {new Date(transferencia.criado_em).toLocaleString(
                            "pt-BR",
                            {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-default-400 uppercase tracking-wider font-medium">
                          Total de Itens
                        </p>
                        <p className="text-2xl font-bold text-primary">
                          {transferencia.itens.length}
                        </p>
                      </div>
                    </div>

                    {transferencia.confirmado_em && (
                      <>
                        <Divider />
                        <div className="space-y-1">
                          <p className="text-xs text-default-400 uppercase tracking-wider font-medium">
                            Confirmado por
                          </p>
                          <p className="font-medium text-foreground">
                            {transferencia.confirmado_por_nome}
                          </p>
                          <p className="text-xs text-default-500">
                            {new Date(
                              transferencia.confirmado_em,
                            ).toLocaleString("pt-BR", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </>
                    )}

                    {transferencia.cancelado_em && (
                      <>
                        <Divider />
                        <div className="space-y-1">
                          <p className="text-xs text-default-400 uppercase tracking-wider font-medium">
                            Cancelado por
                          </p>
                          <p className="font-medium text-foreground">
                            {transferencia.cancelado_por_nome}
                          </p>
                          <p className="text-xs text-default-500">
                            {new Date(
                              transferencia.cancelado_em,
                            ).toLocaleString("pt-BR", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                          {transferencia.motivo_cancelamento && (
                            <p className="text-sm text-danger mt-1 italic">
                              Motivo: {transferencia.motivo_cancelamento}
                            </p>
                          )}
                        </div>
                      </>
                    )}

                    {transferencia.observacao && (
                      <>
                        <Divider />
                        <div className="space-y-1">
                          <p className="text-xs text-default-400 uppercase tracking-wider font-medium">
                            Observação
                          </p>
                          <p className="text-sm text-default-600 bg-default-50 p-3 rounded-lg">
                            {transferencia.observacao}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </Tab>

                <Tab
                  key="timeline"
                  title={
                    <div className="flex items-center gap-2">
                      <ClockIcon className="h-4 w-4" />
                      <span>Timeline</span>
                    </div>
                  }
                >
                  <div className="space-y-0 pt-2">
                    <div className="relative pl-10">
                      <div className="absolute left-[17px] top-0 bottom-0 w-0.5 bg-default-200" />

                      <TimelineEvent
                        icon={ArrowRightIcon}
                        iconBg="bg-primary-500"
                        time={new Date(transferencia.criado_em).toLocaleString(
                          "pt-BR",
                          {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          },
                        )}
                        title="Saída Autorizada"
                      >
                        <p className="text-sm text-default-600">
                          <span className="font-medium text-foreground">
                            {transferencia.usuario_nome}
                          </span>{" "}
                          autorizou a saída de{" "}
                          <span className="font-semibold text-foreground">
                            {transferencia.itens.length}
                            {transferencia.itens.length === 1
                              ? " item"
                              : " itens"}
                          </span>{" "}
                          de{" "}
                          <span className="font-medium text-foreground">
                            {transferencia.loja_origem}
                          </span>{" "}
                          para{" "}
                          <span className="font-medium text-foreground">
                            {transferencia.loja_destino}
                          </span>
                        </p>
                      </TimelineEvent>

                      <TimelineEvent
                        isLast
                        icon={
                          transferencia.status === "confirmada"
                            ? CheckCircleIcon
                            : transferencia.status === "cancelada"
                              ? XCircleIcon
                              : ClockIcon
                        }
                        iconBg={
                          transferencia.status === "confirmada"
                            ? "bg-success-500"
                            : transferencia.status === "cancelada"
                              ? "bg-danger-500"
                              : "bg-warning-500"
                        }
                        time={
                          transferencia.confirmado_em
                            ? new Date(
                                transferencia.confirmado_em,
                              ).toLocaleString("pt-BR", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : transferencia.cancelado_em
                              ? new Date(
                                  transferencia.cancelado_em,
                                ).toLocaleString("pt-BR", {
                                  day: "2-digit",
                                  month: "2-digit",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : undefined
                        }
                        title={
                          transferencia.status === "confirmada"
                            ? "Recebimento Confirmado"
                            : transferencia.status === "pendente"
                              ? "Aguardando Confirmação"
                              : "Transferência Cancelada"
                        }
                      >
                        {transferencia.status === "confirmada" && (
                          <p className="text-sm text-default-600">
                            <span className="font-medium text-foreground">
                              {transferencia.confirmado_por_nome}
                            </span>{" "}
                            confirmou o recebimento dos itens em{" "}
                            <span className="font-medium text-foreground">
                              {transferencia.loja_destino}
                            </span>
                          </p>
                        )}
                        {transferencia.status === "pendente" && (
                          <p className="text-sm text-warning bg-warning-500/15 p-3 rounded-lg border border-warning-500/30">
                            <ClockIcon className="h-4 w-4 inline mr-1" />
                            Aguardando confirmação de recebimento em{" "}
                            <span className="font-medium">
                              {transferencia.loja_destino}
                            </span>
                          </p>
                        )}
                        {transferencia.status === "cancelada" && (
                          <div>
                            <p className="text-sm text-default-600">
                              <span className="font-medium text-foreground">
                                {transferencia.cancelado_por_nome}
                              </span>{" "}
                              cancelou a transferência
                            </p>
                            {transferencia.motivo_cancelamento && (
                              <p className="text-xs text-danger mt-1 italic">
                                Motivo: {transferencia.motivo_cancelamento}
                              </p>
                            )}
                          </div>
                        )}
                      </TimelineEvent>
                    </div>
                  </div>
                </Tab>

                <Tab
                  key="produtos"
                  title={
                    <div className="flex items-center gap-2">
                      <CubeIcon className="h-4 w-4" />
                      <span>Produtos ({transferencia.itens.length})</span>
                    </div>
                  }
                >
                  <div className="space-y-2 pt-2">
                    {transferencia.itens.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-3 sm:p-4 rounded-xl bg-default-50 hover:bg-default-100 transition-colors border border-default-200"
                      >
                        <div className="flex-1 min-w-0 mr-4">
                          <p className="font-medium text-sm sm:text-base text-foreground truncate">
                            {item.produto_descricao}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            {item.produto_marca && (
                              <span className="text-xs text-default-500">
                                {item.produto_marca}
                              </span>
                            )}
                            {item.produto_codigo && (
                              <span className="text-xs text-default-400 font-mono">
                                #{item.produto_codigo}
                              </span>
                            )}
                          </div>
                        </div>
                        <Chip
                          classNames={{
                            base: "px-3",
                            content: "font-semibold",
                          }}
                          color="primary"
                          size="sm"
                          variant="flat"
                        >
                          {item.quantidade} un
                        </Chip>
                      </div>
                    ))}

                    {transferencia.itens.length === 0 && (
                      <div className="text-center py-8 text-default-400">
                        Nenhum item encontrado
                      </div>
                    )}
                  </div>
                </Tab>
              </Tabs>
            </ModalBody>

            <ModalFooter className="border-t flex-col sm:flex-row gap-2">
              <div className="flex-1" />
              <Dropdown>
                <DropdownTrigger>
                  <Button
                    color="success"
                    size="sm"
                    startContent={<DocumentArrowDownIcon className="h-4 w-4" />}
                    variant="flat"
                  >
                    Baixar Relatório
                  </Button>
                </DropdownTrigger>
                <DropdownMenu aria-label="Opções de relatório">
                  <DropdownItem
                    key="completo"
                    description="Relatório original completo"
                    startContent={<DocumentArrowDownIcon className="h-4 w-4" />}
                    onPress={() =>
                      gerarRelatorioTransferenciaPDF(transferencia)
                    }
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
                <Dropdown>
                  <DropdownTrigger>
                    <Button color="primary" isDisabled={processando} size="sm">
                      Ações
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu
                    aria-label="Ações da transferência"
                    onAction={(key) => {
                      if (key === "editar") {
                        onEditar(transferencia);
                        onModalClose();
                      }
                      if (key === "confirmar") {
                        onConfirmar(transferencia);
                        onModalClose();
                      }
                      if (key === "cancelar") {
                        onCancelar(transferencia);
                        onModalClose();
                      }
                    }}
                  >
                    {podeEditar ? (
                      <DropdownItem
                        key="editar"
                        startContent={<PencilSquareIcon className="h-4 w-4" />}
                      >
                        Editar Transferência
                      </DropdownItem>
                    ) : null}
                    {podeConfirmar ? (
                      <DropdownItem
                        key="confirmar"
                        className="text-success"
                        color="success"
                        startContent={<CheckCircleIcon className="h-4 w-4" />}
                      >
                        Confirmar Recebimento
                      </DropdownItem>
                    ) : null}
                    <DropdownItem
                      key="cancelar"
                      className="text-danger"
                      color="danger"
                      startContent={<XCircleIcon className="h-4 w-4" />}
                    >
                      Cancelar Transferência
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              )}

              <Button
                color="default"
                size="sm"
                variant="light"
                onPress={onModalClose}
              >
                Fechar
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}

function TimelineEvent({
  icon: Icon,
  iconBg,
  title,
  time,
  children,
  isLast = false,
}: {
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  title: string;
  time?: string;
  children: React.ReactNode;
  isLast?: boolean;
}) {
  return (
    <div className="relative pb-6">
      <div
        className={`absolute left-[-26px] w-9 h-9 rounded-full ${iconBg} flex items-center justify-center text-white shadow-sm ring-4 ring-background`}
      >
        <Icon className="h-4 w-4" />
      </div>
      <div className="pt-0.5">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-semibold text-sm text-foreground">{title}</p>
          {time && <span className="text-xs text-default-400">{time}</span>}
        </div>
        <div className="mt-1.5">{children}</div>
      </div>
    </div>
  );
}
