"use client";

import { Spinner } from "@heroui/spinner";

import DashboardPessoal from "@/components/dashboard/DashboardPessoal";
import { usePermissoes } from "@/hooks/usePermissoes";

export default function DashboardPessoalPage() {
  const { loading } = usePermissoes();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner label="Carregando..." size="lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <DashboardPessoal />
    </div>
  );
}
