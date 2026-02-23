import { Card, CardBody } from "@heroui/card";
import { Chip } from "@heroui/chip";
import {
  CubeIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
} from "@heroicons/react/24/outline";

interface EstoqueStatsProps {
  totalProdutos: number;
  produtosAtivos: number;
  produtosEstoqueBaixo: number;
  produtosSemEstoque: number;
}

export default function EstoqueStats({
  totalProdutos,
  produtosAtivos,
  produtosEstoqueBaixo,
  produtosSemEstoque,
}: EstoqueStatsProps) {
  const stats = [
    {
      label: "Total de Produtos",
      value: totalProdutos,
      icon: CubeIcon,
      color: "primary" as const,
      bgColor: "bg-primary/10",
      textColor: "text-primary",
    },
    {
      label: "Produtos Ativos",
      value: produtosAtivos,
      icon: ArrowTrendingUpIcon,
      color: "success" as const,
      bgColor: "bg-success/10",
      textColor: "text-success",
    },
    {
      label: "Estoque Baixo",
      value: produtosEstoqueBaixo,
      icon: ExclamationTriangleIcon,
      color: "warning" as const,
      bgColor: "bg-warning/10",
      textColor: "text-warning",
    },
    {
      label: "Sem Estoque",
      value: produtosSemEstoque,
      icon: ArrowTrendingDownIcon,
      color: "danger" as const,
      bgColor: "bg-danger/10",
      textColor: "text-danger",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;

        return (
          <Card
            key={index}
            className="shadow-sm hover:shadow-md transition-shadow"
          >
            <CardBody className="gap-2">
              <div className="flex items-center justify-between">
                <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                  <Icon className={`w-6 h-6 ${stat.textColor}`} />
                </div>
                <Chip color={stat.color} size="sm" variant="flat">
                  {stat.value}
                </Chip>
              </div>
              <div>
                <p className="text-sm text-default-500">{stat.label}</p>
                <p className={`text-2xl font-bold ${stat.textColor}`}>
                  {stat.value}
                </p>
              </div>
            </CardBody>
          </Card>
        );
      })}
    </div>
  );
}
