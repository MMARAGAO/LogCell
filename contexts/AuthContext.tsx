"use client";

import { createContext, useContext, ReactNode } from "react";

import { useAuth } from "@/hooks/useAuth";
import { Usuario } from "@/types";

interface AuthContextType {
  usuario: Usuario | null;
  loading: boolean;
  error: string | null;
  login: (dados: { email: string; senha: string }) => Promise<any>;
  logout: () => Promise<any>;
  atualizarDados: (dados: Partial<Usuario>) => Promise<any>;
  carregarUsuario: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuthContext deve ser usado dentro de um AuthProvider");
  }

  return context;
}

// Re-exporta useAuth para compatibilidade
export { useAuth } from "@/hooks/useAuth";
