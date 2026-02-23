"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

import { supabase } from "@/lib/supabaseClient";

/**
 * Componente para verificar sessão em todas as páginas
 * Redireciona para login se a sessão estiver expirada
 */
export function SessionGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Não verificar sessão em páginas de autenticação
    const isAuthPage = pathname?.startsWith("/auth");

    if (isAuthPage) {
      return;
    }

    // Verificar sessão inicial
    const checkSession = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error || !session) {
        console.warn("⚠️ Sessão inválida ou expirada, redirecionando...");
        router.push("/auth");
      }
    };

    checkSession();

    // Listener para mudanças na autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      // Se logout ou sessão expirada, redirecionar
      if (event === "SIGNED_OUT" || (!session && event === "TOKEN_REFRESHED")) {
        console.warn("⚠️ Sessão expirada (evento: " + event + ")");
        const isAuthPage = window.location.pathname.startsWith("/auth");

        if (!isAuthPage) {
          router.push("/auth");
        }
      }

      // Se o token foi renovado com sucesso, logar
      if (event === "TOKEN_REFRESHED" && session) {
        console.log("✅ Token renovado automaticamente");
      }
    });

    // Cleanup
    return () => {
      subscription.unsubscribe();
    };
  }, [pathname, router]);

  return <>{children}</>;
}
