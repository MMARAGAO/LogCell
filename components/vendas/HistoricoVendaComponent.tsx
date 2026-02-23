"use client";

import type { HistoricoVenda } from "@/types/vendas";

import { Card, CardBody, CardHeader, Chip, Divider } from "@heroui/react";
import {
  Clock,
  FileText,
  DollarSign,
  Percent,
  RotateCcw,
  CheckCircle,
  Edit2,
} from "lucide-react";

interface HistoricoVendaProps {
  historico: HistoricoVenda[];
}

const tipoAcaoConfig: Record<
  string,
  {
    icon: any;
    color:
      | "primary"
      | "default"
      | "success"
      | "warning"
      | "secondary"
      | "danger";
    label: string;
  }
> = {
  criacao: {
    icon: FileText,
    color: "primary" as const,
    label: "Criação",
  },
  adicao_item: {
    icon: FileText,
    color: "default" as const,
    label: "Item Adicionado",
  },
  adicao_produto: {
    icon: FileText,
    color: "default" as const,
    label: "Item Adicionado",
  },
  remocao_item: {
    icon: FileText,
    color: "default" as const,
    label: "Item Removido",
  },
  remocao_produto: {
    icon: FileText,
    color: "default" as const,
    label: "Item Removido",
  },
  pagamento: {
    icon: DollarSign,
    color: "success" as const,
    label: "Pagamento",
  },
  edicao_pagamento: {
    icon: Edit2,
    color: "warning" as const,
    label: "Edição de Pagamento",
  },
  desconto: {
    icon: Percent,
    color: "secondary" as const,
    label: "Desconto",
  },
  devolucao: {
    icon: RotateCcw,
    color: "warning" as const,
    label: "Devolução",
  },
  finalizacao: {
    icon: CheckCircle,
    color: "success" as const,
    label: "Finalização",
  },
  cancelamento: {
    icon: CheckCircle,
    color: "danger" as const,
    label: "Cancelamento",
  },
};

export function HistoricoVendaComponent({ historico }: HistoricoVendaProps) {
  const formatarData = (data: string) => {
    return new Date(data).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (historico.length === 0) {
    return (
      <Card>
        <CardBody>
          <div className="text-center py-8 text-gray-500">
            <Clock className="w-12 h-12 mx-auto mb-2 text-gray-400" />
            <p>Nenhum histórico disponível</p>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          <h3 className="text-lg font-semibold">Histórico da Venda</h3>
        </div>
      </CardHeader>

      <Divider />

      <CardBody>
        <div className="space-y-4">
          {historico.map((item, index) => {
            const config =
              tipoAcaoConfig[item.tipo_acao] || tipoAcaoConfig.adicao_item;
            const Icon = config.icon;

            return (
              <div key={item.id} className="relative">
                {/* Linha vertical conectando os itens */}
                {index < historico.length - 1 && (
                  <div className="absolute left-4 top-10 bottom-0 w-0.5 bg-default-200" />
                )}

                <div className="flex gap-4">
                  {/* Ícone */}
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-default-100 flex items-center justify-center relative z-10">
                      <Icon className="w-4 h-4 text-default-600" />
                    </div>
                  </div>

                  {/* Conteúdo */}
                  <div className="flex-1 pb-6">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Chip color={config.color} size="sm" variant="flat">
                            {config.label}
                          </Chip>
                          <span className="text-xs text-gray-500">
                            {item.criado_em && formatarData(item.criado_em)}
                          </span>
                        </div>
                        <p className="text-sm">{item.descricao}</p>
                        {item.usuario_nome && (
                          <p className="text-xs text-gray-500 mt-1">
                            Por: {item.usuario_nome}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardBody>
    </Card>
  );
}
