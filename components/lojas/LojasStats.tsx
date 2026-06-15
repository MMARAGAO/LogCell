"use client";

import {
  BuildingStorefrontIcon,
  CheckCircleIcon,
  XCircleIcon,
  PlusCircleIcon,
} from "@heroicons/react/24/outline";

import { MetricCard } from "@/components/dashboard/executive/MetricCard";

interface LojasStatsProps {
  total: number;
  ativas: number;
  inativas: number;
  novasEsteMes: number;
}

export function LojasStats({
  total,
  ativas,
  inativas,
  novasEsteMes,
}: LojasStatsProps) {
  return (
    <div className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      <MetricCard
        icon={<BuildingStorefrontIcon className="h-5 w-5" />}
        label="Total de Lojas"
        value={total}
      />
      <MetricCard
        icon={<CheckCircleIcon className="h-5 w-5" />}
        label="Lojas Ativas"
        value={ativas}
      />
      <MetricCard
        emphasis={inativas > 0}
        icon={<XCircleIcon className="h-5 w-5" />}
        label="Lojas Inativas"
        tone="danger"
        value={inativas}
      />
      <MetricCard
        icon={<PlusCircleIcon className="h-5 w-5" />}
        label="Novas Este Mês"
        value={novasEsteMes}
      />
    </div>
  );
}
