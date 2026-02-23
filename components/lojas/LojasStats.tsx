"use client";

import { Card, CardBody } from "@heroui/card";
import {
  BuildingStorefrontIcon,
  CheckCircleIcon,
  XCircleIcon,
  PlusCircleIcon,
} from "@heroicons/react/24/outline";

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
  const stats = [
    {
      label: "Total de Lojas",
      value: total,
      icon: BuildingStorefrontIcon,
      color: "text-primary",
      bgColor: "bg-primary-50",
    },
    {
      label: "Lojas Ativas",
      value: ativas,
      icon: CheckCircleIcon,
      color: "text-success",
      bgColor: "bg-success-50",
    },
    {
      label: "Lojas Inativas",
      value: inativas,
      icon: XCircleIcon,
      color: "text-danger",
      bgColor: "bg-danger-50",
    },
    {
      label: "Novas Este Mês",
      value: novasEsteMes,
      icon: PlusCircleIcon,
      color: "text-secondary",
      bgColor: "bg-secondary-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <Card key={stat.label}>
            <CardBody className="flex flex-row items-center gap-4">
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <Icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm text-default-500">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            </CardBody>
          </Card>
        );
      })}
    </div>
  );
}
