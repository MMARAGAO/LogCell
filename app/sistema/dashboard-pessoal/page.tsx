"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "@heroui/spinner";

import DashboardPessoal from "@/components/dashboard/DashboardPessoal";
import { usePermissoes } from "@/hooks/usePermissoes";
import { getPrimeiraRotaDisponivel } from "@/lib/routeHelper";

export default function DashboardPessoalPage() {
  const { loading, temPermissao, perfil, permissoes, isAdmin } =
    usePermissoes();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (perfil === "tecnico") {
        router.push("/sistema/ordem-servico/tecnico");

        return;
      }

      if (!temPermissao("dashboard_pessoal.visualizar")) {
        const primeiraRota = getPrimeiraRotaDisponivel(
          permissoes,
          isAdmin,
          false,
        );

        router.push(primeiraRota);
      }
    }
  }, [loading, perfil, temPermissao, router, permissoes, isAdmin]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner label="Carregando..." size="lg" />
      </div>
    );
  }

  if (perfil === "tecnico" || !temPermissao("dashboard_pessoal.visualizar")) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <DashboardPessoal />
    </div>
  );
}
