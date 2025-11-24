"use client";

import { Card, CardBody } from "@heroui/card";
import {
  UsersIcon,
  UserPlusIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";

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
  const stats = [
    {
      title: "Total de Usuários",
      value: total,
      icon: UsersIcon,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Usuários Ativos",
      value: ativos,
      icon: CheckCircleIcon,
      color: "text-success",
      bgColor: "bg-success/10",
    },
    {
      title: "Usuários Inativos",
      value: inativos,
      icon: XCircleIcon,
      color: "text-danger",
      bgColor: "bg-danger/10",
    },
    {
      title: "Novos este Mês",
      value: novosEsteMes,
      icon: UserPlusIcon,
      color: "text-secondary",
      bgColor: "bg-secondary/10",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title} className="border border-divider">
            <CardBody>
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-sm text-default-500">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
              </div>
            </CardBody>
          </Card>
        );
      })}
    </div>
  );
}
