"use client";

import { useState, useEffect, useCallback } from "react";
import { AuthService } from "@/services/authService";
import { Usuario, LoginData } from "@/types";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { getPrimeiraRotaDisponivel } from "@/lib/routeHelper";
import type { Permissao, PerfilUsuario } from "@/types/permissoes";
import { PERMISSOES_POR_PERFIL } from "@/types/permissoes";

/**
 * Hook personalizado para gerenciar autenticação
 * SIMPLIFICADO - O middleware gerencia a sessão
 */
export function useAuth() {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Carrega o usuário uma única vez ao montar
  useEffect(() => {
    let cancelled = false;

    const loadUser = async () => {
      try {
        // Verifica sessão (middleware já gerencia isso)
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (cancelled) return;

        if (user) {
          const usuarioAtual = await AuthService.getUsuarioAtual();
          if (!cancelled) {
            setUsuario(usuarioAtual);
          }
        }
      } catch (err) {
        console.error("Erro ao carregar usuário:", err);
        if (!cancelled) {
          setUsuario(null);
          // Se houver erro de autenticação, fazer logout
          if (err && typeof err === 'object' && 'message' in err) {
            const errorMessage = (err as any).message;
            if (errorMessage?.includes('JWT') || errorMessage?.includes('session') || errorMessage?.includes('auth')) {
              console.warn("⚠️ Sessão inválida detectada, fazendo logout...");
              await supabase.auth.signOut();
            }
          }
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadUser();

    // Limpa quando desmontar
    return () => {
      cancelled = true;
    };
  }, []);

  /**
   * Faz login do usuário
   */
  const login = useCallback(
    async (dados: LoginData) => {
      try {
        setLoading(true);
        setError(null);
        const { usuario } = await AuthService.login(dados);

        if (!usuario) {
          throw new Error("Erro ao obter dados do usuário");
        }

        setUsuario(usuario);

        // Obter permissões do usuário para determinar primeira rota
        let permissoes: Permissao[] = [];
        let isAdmin = false;

        try {
          // Verificar se é admin
          const emailsAdmin = ["admin@logcell.com", "matheusmoxil@gmail.com"];
          isAdmin =
            !!usuario.email &&
            emailsAdmin.includes(usuario.email.toLowerCase());

          if (!isAdmin) {
            // Buscar permissões customizadas do banco
            const { data: permissoesData } = await supabase
              .from("permissoes")
              .select("permissoes")
              .eq("usuario_id", usuario.id)
              .maybeSingle();

            if (permissoesData?.permissoes) {
              // Converter objeto JSONB para array
              const permissoesObj = permissoesData.permissoes;
              if (Array.isArray(permissoesObj)) {
                permissoes = permissoesObj;
              } else {
                for (const [modulo, acoes] of Object.entries(permissoesObj)) {
                  if (typeof acoes === "object" && acoes !== null) {
                    for (const [acao, valor] of Object.entries(
                      acoes as Record<string, boolean>
                    )) {
                      if (valor === true) {
                        permissoes.push(`${modulo}.${acao}` as Permissao);
                      }
                    }
                  }
                }
              }
            } else {
              // Usar permissões padrão do perfil
              const perfil: PerfilUsuario =
                usuario.tipo_usuario === "tecnico" ? "tecnico" : "vendedor";
              permissoes = PERMISSOES_POR_PERFIL[perfil] || [];
            }
          }
        } catch (err) {
          console.warn(
            "Erro ao buscar permissões, usando dashboard como padrão:",
            err
          );
        }

        // Redirecionar para primeira rota disponível
        const primeiraRota = getPrimeiraRotaDisponivel(permissoes, isAdmin);
        router.push(primeiraRota);
        return { success: true };
      } catch (err: any) {
        let mensagemErro = "Erro ao fazer login";

        if (err.message === "Invalid login credentials") {
          mensagemErro = "Email ou senha incorretos";
        } else if (err.message.includes("inativo")) {
          mensagemErro =
            "Sua conta está inativa. Entre em contato com o administrador do sistema.";
        } else if (err.message) {
          mensagemErro = err.message;
        }

        setError(mensagemErro);
        return { success: false, error: mensagemErro };
      } finally {
        setLoading(false);
      }
    },
    [router]
  );

  /**
   * Faz logout do usuário
   */
  const logout = useCallback(async () => {
    try {
      setLoading(true);
      await AuthService.logout();
      setUsuario(null);
      router.push("/auth"); // Redireciona para login
      return { success: true };
    } catch (err: any) {
      setError("Erro ao fazer logout");
      return { success: false, error: "Erro ao fazer logout" };
    } finally {
      setLoading(false);
    }
  }, [router]);

  /**
   * Atualiza os dados do usuário
   */
  const atualizarDados = useCallback(
    async (dados: Partial<Usuario>) => {
      if (!usuario) return { success: false, error: "Usuário não autenticado" };

      try {
        setLoading(true);
        const usuarioAtualizado = await AuthService.atualizarUsuario(
          usuario.id,
          dados
        );
        setUsuario(usuarioAtualizado);
        return { success: true, usuario: usuarioAtualizado };
      } catch (err: any) {
        setError("Erro ao atualizar dados");
        return { success: false, error: "Erro ao atualizar dados" };
      } finally {
        setLoading(false);
      }
    },
    [usuario]
  );

  /**
   * Recarrega os dados do usuário atual
   */
  const carregarUsuario = useCallback(async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const usuarioAtual = await AuthService.getUsuarioAtual();
        setUsuario(usuarioAtual);
      }
    } catch (err) {
      console.error("Erro ao recarregar usuário:", err);
    }
  }, []);

  /**
   * Verifica se a sessão está válida e redireciona para login se expirada
   * @returns true se a sessão é válida, false se está expirada
   */
  const verificarSessao = useCallback(async (): Promise<boolean> => {
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error || !session) {
        console.error("❌ Sessão expirada ou inválida");
        await supabase.auth.signOut();
        router.push("/auth");
        return false;
      }

      return true;
    } catch (err) {
      console.error("Erro ao verificar sessão:", err);
      await supabase.auth.signOut();
      router.push("/auth");
      return false;
    }
  }, [router]);

  return {
    usuario,
    loading,
    error,
    login,
    logout,
    atualizarDados,
    carregarUsuario,
    verificarSessao,
    isAuthenticated: !!usuario,
  };
}
