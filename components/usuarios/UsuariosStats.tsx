"use client";

import {
  UsersIcon,
  UserPlusIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";

import { MetricCard } from "@/components/dashboard/executive/MetricCard";

interface UsuariosStatsProps {
  total: number;
  ativos: number;
  inativos: number;
  novosEsteMes: number;
}

export function UsuariosStats({
  total,
  ativos,
  inativos,
  novosEsteMes,
}: UsuariosStatsProps) {
  return (
    <div className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      <MetricCard
        icon={<UsersIcon className="h-5 w-5" />}
        label="Total de Usuários"
        value={total}
      />
      <MetricCard
        icon={<CheckCircleIcon className="h-5 w-5" />}
        label="Usuários Ativos"
        value={ativos}
      />
      <MetricCard
        emphasis={inativos > 0}
        icon={<XCircleIcon className="h-5 w-5" />}
        label="Usuários Inativos"
        tone="danger"
        value={inativos}
      />
      <MetricCard
        icon={<UserPlusIcon className="h-5 w-5" />}
        label="Novos este Mês"
        value={novosEsteMes}
      />
    </div>
  );
}
