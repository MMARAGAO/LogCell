"use client";

import { useState } from "react";
import { Chip, Tooltip } from "@heroui/react";
import {
  Check,
  Clock,
  Wrench,
  Package,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { StatusOS } from "@/types/ordemServico";

interface StatusProgressBarProps {
  currentStatus: StatusOS;
  onStatusChange: (newStatus: StatusOS) => void;
  isUpdating?: boolean;
  disabled?: boolean;
}

const STATUS_FLOW = [
  { key: "aguardando", label: "Aguardando", icon: Clock, color: "default" },
  { key: "aprovado", label: "Aprovado", icon: Check, color: "primary" },
  {
    key: "em_andamento",
    label: "Em Andamento",
    icon: Wrench,
    color: "warning",
  },
  {
    key: "aguardando_peca",
    label: "Aguard. Peça",
    icon: Package,
    color: "warning",
  },
  { key: "concluido", label: "Concluído", icon: CheckCircle, color: "success" },
  { key: "entregue", label: "Entregue", icon: CheckCircle, color: "success" },
] as const;

export default function StatusProgressBar({
  currentStatus,
  onStatusChange,
  isUpdating = false,
  disabled = false,
}: StatusProgressBarProps) {
  const currentIndex = STATUS_FLOW.findIndex((s) => s.key === currentStatus);
  const isCanceled = currentStatus === "cancelado";

  const getStatusColor = (status: string, index: number) => {
    if (isCanceled) return "text-default-300";
    if (index < currentIndex) return "text-success";
    if (index === currentIndex) return "text-primary";
    return "text-default-300";
  };

  const getLineColor = (index: number) => {
    if (isCanceled) return "bg-default-200";
    if (index < currentIndex) return "bg-success";
    return "bg-default-200";
  };

  const handleStatusClick = (statusKey: string) => {
    if (disabled || isUpdating || isCanceled) return;
    onStatusChange(statusKey as StatusOS);
  };

  if (isCanceled) {
    return (
      <div className="flex items-center justify-center p-4 bg-danger-50 dark:bg-danger-900/20 rounded-lg">
        <XCircle className="w-5 h-5 text-danger mr-2" />
        <span className="font-semibold text-danger">OS Cancelada</span>
      </div>
    );
  }

  return (
    <div className="w-full py-4">
      <div className="flex items-center justify-between relative">
        {/* Linha de progresso */}
        <div className="absolute top-5 left-0 right-0 h-1 bg-default-200 -z-10">
          <div
            className="h-full bg-success transition-all duration-300"
            style={{
              width: `${(currentIndex / (STATUS_FLOW.length - 1)) * 100}%`,
            }}
          />
        </div>

        {/* Status items */}
        {STATUS_FLOW.map((status, index) => {
          const Icon = status.icon;
          const isActive = index === currentIndex;
          const isCompleted = index < currentIndex;
          const isClickable =
            !disabled && !isUpdating && index <= currentIndex + 1;

          return (
            <Tooltip
              key={status.key}
              content={
                isClickable
                  ? `Mudar para: ${status.label}`
                  : isCompleted
                    ? "Concluído"
                    : "Bloqueado"
              }
            >
              <div
                className={`flex flex-col items-center cursor-pointer transition-all ${
                  isClickable ? "hover:scale-110" : "cursor-not-allowed"
                }`}
                onClick={() => isClickable && handleStatusClick(status.key)}
              >
                {/* Círculo do status */}
                <div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center
                    transition-all duration-300 border-2
                    ${
                      isActive
                        ? "bg-primary border-primary shadow-lg scale-110"
                        : isCompleted
                          ? "bg-success border-success"
                          : "bg-default-100 border-default-300"
                    }
                    ${isClickable && !isActive ? "hover:scale-125 hover:shadow-md" : ""}
                  `}
                >
                  <Icon
                    className={`w-5 h-5 ${
                      isActive || isCompleted
                        ? "text-white"
                        : "text-default-400"
                    }`}
                  />
                </div>

                {/* Label */}
                <span
                  className={`
                    text-xs mt-2 text-center max-w-[60px] font-medium
                    ${
                      isActive
                        ? "text-primary"
                        : isCompleted
                          ? "text-success"
                          : "text-default-400"
                    }
                  `}
                >
                  {status.label}
                </span>
              </div>
            </Tooltip>
          );
        })}
      </div>

      {/* Mensagem de ajuda */}
      {!disabled && !isUpdating && (
        <p className="text-xs text-center text-default-400 mt-4">
          Clique no próximo status para avançar a ordem de serviço
        </p>
      )}
    </div>
  );
}
