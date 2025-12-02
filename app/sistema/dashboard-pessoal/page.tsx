"use client";

import DashboardPessoal from "@/components/dashboard/DashboardPessoal";
import { usePermissoes } from "@/hooks/usePermissoes";
import { Spinner } from "@heroui/spinner";

export default function DashboardPessoalPage() {
  const { loading } = usePermissoes();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="lg" label="Carregando..." />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <DashboardPessoal />
    </div>
  );
}
