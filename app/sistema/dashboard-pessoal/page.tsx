"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "@heroui/spinner";

import DashboardPessoal from "@/components/dashboard/DashboardPessoal";
import { usePermissoes } from "@/hooks/usePermissoes";

export default function DashboardPessoalPage() {
  const { loading, temPermissao, perfil } = usePermissoes();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      // Bloquear acesso de técnicos
      if (perfil === "tecnico" || !temPermissao("dashboard_pessoal.visualizar")) {
        router.push("/sistema/ordem-servico/tecnico");
      }
    }
  }, [loading, perfil, temPermissao, router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner label="Carregando..." size="lg" />
      </div>
    );
  }

  // Não renderizar nada para técnicos (já está redirecionando)
  if (perfil === "tecnico" || !temPermissao("dashboard_pessoal.visualizar")) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <DashboardPessoal />
    </div>
  );
}
