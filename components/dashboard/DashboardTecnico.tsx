"use client";

import type { OrdemServico } from "@/types/ordemServico";

import { useEffect, useState } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Chip } from "@heroui/chip";
import {
  ClipboardDocumentListIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { createBrowserClient } from "@supabase/ssr";

import { useAuthContext } from "@/contexts/AuthContext";

interface DashboardStats {
  total: number;
  concluidas: number;
  emAndamento: number;
  aguardandoPecas: number;
}

export default function DashboardTecnico() {
  const { usuario } = useAuthContext();
  const [stats, setStats] = useState<DashboardStats>({
    total: 0,
    concluidas: 0,
    emAndamento: 0,
    aguardandoPecas: 0,
  });
  const [ordensRecentes, setOrdensRecentes] = useState<OrdemServico[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (usuario) {
      carregarDados();
    }
  }, [usuario]);

  const carregarDados = async () => {
    if (!usuario) return;

    setLoading(true);
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );

    try {
      // Buscar todas as OS do técnico
      const { data: ordens, error } = await supabase
        .from("ordem_servico")
        .select("*")
        .eq("tecnico_responsavel", usuario.id)
        .order("criado_em", { ascending: false });

      if (error) throw error;

      // Calcular estatísticas
      const total = ordens?.length || 0;
      const concluidas =
        ordens?.filter((os: any) => os.status === "concluida").length || 0;
      const emAndamento =
        ordens?.filter(
          (os: any) =>
            os.status === "em_andamento" || os.status === "em_diagnostico",
        ).length || 0;
      const aguardandoPecas =
        ordens?.filter((os: any) => os.status === "aguardando_pecas").length ||
        0;

      setStats({
        total,
        concluidas,
        emAndamento,
        aguardandoPecas,
      });

      // Pegar as 5 ordens mais recentes que não estão concluídas
      setOrdensRecentes(
        (ordens?.filter((os: any) => os.status !== "concluida").slice(0, 5) ||
          []) as OrdemServico[],
      );
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "Total de OS",
      value: stats.total,
      icon: ClipboardDocumentListIcon,
      color: "primary" as const,
      bgColor: "bg-primary/10",
    },
    {
      title: "Concluídas",
      value: stats.concluidas,
      icon: CheckCircleIcon,
      color: "success" as const,
      bgColor: "bg-success/10",
    },
    {
      title: "Em Andamento",
      value: stats.emAndamento,
      icon: ClockIcon,
      color: "warning" as const,
      bgColor: "bg-warning/10",
    },
    {
      title: "Aguardando Peças",
      value: stats.aguardandoPecas,
      icon: ExclamationTriangleIcon,
      color: "danger" as const,
      bgColor: "bg-danger/10",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "aguardando":
        return "default";
      case "em_diagnostico":
        return "primary";
      case "em_andamento":
        return "warning";
      case "aguardando_pecas":
        return "danger";
      case "concluida":
        return "success";
      case "cancelada":
        return "danger";
      default:
        return "default";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "aguardando":
        return "Aguardando";
      case "em_diagnostico":
        return "Em Diagnóstico";
      case "em_andamento":
        return "Em Andamento";
      case "aguardando_pecas":
        return "Aguardando Peças";
      case "concluida":
        return "Concluída";
      case "cancelada":
        return "Cancelada";
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-default-500">Carregando dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">
          Bem-vindo, {usuario?.nome?.split(" ")[0]}! 👋
        </h1>
        <p className="text-default-500 mt-1">
          Aqui está um resumo das suas ordens de serviço
        </p>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;

          return (
            <Card key={card.title} className="border-none shadow-md">
              <CardBody className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-default-500 mb-1">
                      {card.title}
                    </p>
                    <p className="text-3xl font-bold">{card.value}</p>
                  </div>
                  <div className={`p-3 rounded-xl ${card.bgColor}`}>
                    <Icon className={`w-6 h-6 text-${card.color}`} />
                  </div>
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>

      {/* Ordens Recentes */}
      <Card className="border-none shadow-md">
        <CardHeader className="flex justify-between items-center px-6 py-4">
          <div>
            <h2 className="text-xl font-bold">Ordens Pendentes</h2>
            <p className="text-sm text-default-500">
              Suas ordens que precisam de atenção
            </p>
          </div>
        </CardHeader>
        <CardBody className="px-6 pb-6">
          {ordensRecentes.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircleIcon className="w-16 h-16 mx-auto text-success mb-4" />
              <p className="text-default-500">
                Parabéns! Você não tem ordens pendentes no momento.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {ordensRecentes.map((ordem) => (
                <div
                  key={ordem.id}
                  className="p-4 rounded-xl bg-default-50 hover:bg-default-100 transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">OS #{ordem.id}</span>
                      <Chip
                        color={getStatusColor(ordem.status)}
                        size="sm"
                        variant="flat"
                      >
                        {getStatusLabel(ordem.status)}
                      </Chip>
                    </div>
                    <span className="text-xs text-default-500">
                      {new Date(ordem.criado_em).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                  {ordem.defeito_reclamado && (
                    <p className="text-sm text-default-600 line-clamp-2">
                      {ordem.defeito_reclamado}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Dica do Dia */}
      <Card className="border-none shadow-md bg-gradient-to-br from-primary/10 to-primary/5">
        <CardBody className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-primary/20 rounded-xl shrink-0">
              <ExclamationTriangleIcon className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-bold mb-1">💡 Dica do Dia</h3>
              <p className="text-sm text-default-600">
                Lembre-se de atualizar o status das suas ordens regularmente
                para manter a equipe informada sobre o progresso dos serviços!
              </p>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
