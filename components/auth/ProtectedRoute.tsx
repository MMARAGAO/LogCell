"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "@heroui/spinner";

import { useAuthContext } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, loading } = useAuthContext();
  const router = useRouter();
  const [shouldRender, setShouldRender] = useState(false);
  const redirectedRef = useRef(false);

  useEffect(() => {
    // Só executa se não estiver carregando
    if (loading) return;

    // Se não autenticado e ainda não redirecionou
    if (!isAuthenticated && !redirectedRef.current) {
      redirectedRef.current = true;
      router.push("/auth");

      return;
    }

    // Se autenticado, permitir renderização
    if (isAuthenticated) {
      setShouldRender(true);
    }
  }, [isAuthenticated, loading, router]);

  // Mostra loading apenas se estiver carregando E ainda não renderizou
  if (loading && !shouldRender) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner label="Carregando..." size="lg" />
      </div>
    );
  }

  // Se não está autenticado, não renderiza nada (vai redirecionar)
  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
