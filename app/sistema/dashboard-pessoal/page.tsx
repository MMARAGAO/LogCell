"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "@heroui/spinner";

import DashboardPessoal from "@/components/dashboard/DashboardPessoal";
import { usePermissoes } from "@/hooks/usePermissoes";
import { getPrimeiraRotaDisponivel } from "@/lib/routeHelper";

export default function DashboardPessoalPage() {
  const { loading, temPermissao, permissoes, isAdmin } = usePermissoes();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!temPermissao("dashboard_pessoal.visualizar")) {
        const primeiraRota = getPrimeiraRotaDisponivel(
          permissoes,
          isAdmin,
          false,
        );

        router.push(primeiraRota);
      }
    }
  }, [loading, temPermissao, router, permissoes, isAdmin]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner label="Carregando..." size="lg" />
      </div>
    );
  }

  if (!temPermissao("dashboard_pessoal.visualizar")) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <DashboardPessoal />
    </div>
  );
}
