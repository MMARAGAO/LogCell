"use client";

import type { TransferenciaCompleta } from "@/types";
import { Card, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
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
  EyeIcon,
  DocumentArrowDownIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/outline";
import {
  gerarRelatorioTransferenciaPDF,
  gerarRelatorioTransferenciaDetalhado,
  gerarRelatorioTransferenciaResumido,
} from "@/lib/exportarTransferencias";

interface TransferenciaCardProps {
  transferencia: TransferenciaCompleta;
  processando: boolean;
  podeConfirmar: boolean;
  podeEditar: boolean;
  onConfirmar: (t: TransferenciaCompleta) => void;
  onCancelar: (t: TransferenciaCompleta) => void;
  onEditar: (t: TransferenciaCompleta) => void;
  onVisualizar: (t: TransferenciaCompleta) => void;
}

const statusConfig = {
  pendente: {
    color: "warning" as const,
    label: "Pendente",
    icon: ClockIcon,
    borderColor: "border-l-warning",
  },
  confirmada: {
    color: "success" as const,
    label: "Confirmada",
    icon: CheckCircleIcon,
    borderColor: "border-l-success",
  },
  cancelada: {
    color: "danger" as const,
    label: "Cancelada",
    icon: XCircleIcon,
    borderColor: "border-l-danger",
  },
};

export function TransferenciaCard({
  transferencia,
  processando,
  podeConfirmar,
  podeEditar,
  onConfirmar,
  onCancelar,
  onEditar,
  onVisualizar,
}: TransferenciaCardProps) {
  const config = statusConfig[transferencia.status];
  const StatusIcon = config.icon;

  return (
    <Card
      className={`border-l-4 ${config.borderColor} transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 animate-fade-in`}
      shadow="sm"
    >
      <CardBody className="p-4 sm:p-5">
        <div className="flex flex-col lg:flex-row items-start justify-between gap-4">
          <div className="flex-1 space-y-3 w-full min-w-0">
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <Chip
                classNames={{
                  base: "px-2.5",
                  content: "font-semibold text-xs tracking-wide",
                }}
                color={config.color}
                size="sm"
                startContent={<StatusIcon className="h-3.5 w-3.5" />}
                variant="flat"
              >
                {config.label}
              </Chip>

              <div className="flex items-center gap-1.5 text-sm sm:text-base min-w-0">
                <span className="font-semibold text-foreground truncate max-w-[130px] sm:max-w-[200px]">
                  {transferencia.loja_origem}
                </span>
                <ArrowRightIcon className="h-4 w-4 text-primary flex-shrink-0" />
                <span className="font-semibold text-foreground truncate max-w-[130px] sm:max-w-[200px]">
                  {transferencia.loja_destino}
                </span>
              </div>

              <Chip
                classNames={{ content: "text-xs" }}
                size="sm"
                variant="flat"
              >
                {transferencia.itens.length}
                {transferencia.itens.length === 1 ? " item" : " itens"}
              </Chip>
            </div>

            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs sm:text-sm text-default-500">
              <span>
                <span className="font-medium text-foreground">Saída:</span>{" "}
                {transferencia.usuario_nome}
                <span className="mx-1.5 text-default-300">•</span>
                {new Date(transferencia.criado_em).toLocaleString("pt-BR", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>

              {transferencia.status === "pendente" && (
                <span className="inline-flex items-center gap-1 text-warning font-medium">
                  <ClockIcon className="h-3.5 w-3.5" />
                  Aguardando confirmação
                </span>
              )}

              {transferencia.confirmado_em && (
                <span>
                  <span className="font-medium text-foreground">
                    Confirmação:
                  </span>{" "}
                  {transferencia.confirmado_por_nome}
                  <span className="mx-1.5 text-default-300">•</span>
                  {new Date(transferencia.confirmado_em).toLocaleString(
                    "pt-BR",
                    {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    },
                  )}
                </span>
              )}

              {transferencia.cancelado_em && (
                <span>
                  <span className="font-medium text-foreground">
                    Cancelamento:
                  </span>{" "}
                  {transferencia.cancelado_por_nome}
                  {transferencia.motivo_cancelamento &&
                    ` - ${transferencia.motivo_cancelamento}`}
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-1.5">
              {transferencia.itens.slice(0, 4).map((item) => (
                <Chip
                  key={item.id}
                  classNames={{
                    base: "max-w-[180px]",
                    content: "truncate text-xs",
                  }}
                  color="primary"
                  size="sm"
                  variant="flat"
                >
                  <span className="truncate">
                    {item.produto_descricao}
                    {item.produto_marca && ` (${item.produto_marca})`}
                  </span>
                  <span className="ml-1 font-semibold">
                    {item.quantidade}un
                  </span>
                </Chip>
              ))}
              {transferencia.itens.length > 4 && (
                <Chip
                  classNames={{ content: "text-xs" }}
                  size="sm"
                  variant="flat"
                >
                  +{transferencia.itens.length - 4} mais
                </Chip>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 w-full lg:w-auto lg:flex-shrink-0">
            <Button
              isIconOnly
              className="hidden sm:inline-flex"
              color="default"
              size="sm"
              variant="light"
              onPress={() => onVisualizar(transferencia)}
            >
              <EyeIcon className="h-4 w-4" />
            </Button>
            <Button
              className="sm:hidden flex-1"
              color="default"
              size="sm"
              startContent={<EyeIcon className="h-4 w-4" />}
              variant="flat"
              onPress={() => onVisualizar(transferencia)}
            >
              Detalhes
            </Button>

            <Dropdown>
              <DropdownTrigger>
                <Button
                  isIconOnly
                  className="hidden sm:inline-flex"
                  color="success"
                  size="sm"
                  variant="light"
                >
                  <DocumentArrowDownIcon className="h-4 w-4" />
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
              <Dropdown>
                <DropdownTrigger>
                  <Button
                    className="flex-1 lg:flex-initial"
                    color="primary"
                    isDisabled={processando}
                    size="sm"
                    variant="flat"
                  >
                    Ações
                  </Button>
                </DropdownTrigger>
                <DropdownMenu
                  aria-label="Ações da transferência"
                  disabledKeys={[]}
                  onAction={(key) => {
                    if (key === "editar") onEditar(transferencia);
                    if (key === "confirmar") onConfirmar(transferencia);
                    if (key === "cancelar") onCancelar(transferencia);
                  }}
                >
                  {podeEditar ? (
                    <DropdownItem
                      key="editar"
                      startContent={<PencilSquareIcon className="h-4 w-4" />}
                    >
                      Editar
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
                    Cancelar
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            )}
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
