"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { useAuthContext } from "./AuthContext";
import {
  configuracoesService,
  ConfiguracoesUsuario,
} from "@/services/configuracoesService";

interface ConfiguracoesContextType {
  configuracoes: ConfiguracoesUsuario | null;
  carregando: boolean;
  atualizarConfiguracoes: (
    novasConfiguracoes: Partial<ConfiguracoesUsuario>
  ) => Promise<void>;
  resetarConfiguracoes: () => Promise<void>;
  aplicarTema: () => void;
}

const ConfiguracoesContext = createContext<
  ConfiguracoesContextType | undefined
>(undefined);

export function ConfiguracoesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { usuario } = useAuthContext();
  const { theme: nextTheme } = useTheme();
  const [configuracoes, setConfiguracoes] =
    useState<ConfiguracoesUsuario | null>(null);
  const [carregando, setCarregando] = useState(true);

  // Função para aplicar tema (definida antes dos useEffects)
  const aplicarTema = React.useCallback(() => {
    if (!configuracoes) return;

    const root = document.documentElement;
    const isDark = root.classList.contains("dark");

    // Remove apenas os temas de cor, NÃO remove dark/light
    root.classList.remove(
      "purple",
      "purple-dark",
      "green",
      "green-dark",
      "orange",
      "orange-dark",
      "theme-default",
      "theme-purple",
      "theme-green",
      "theme-orange"
    );

    // Determina o tema HeroUI correto
    let temaHeroUI: string;

    if (configuracoes.tema === "default") {
      // Tema default: usa light/dark do next-themes (já aplicado)
      temaHeroUI = isDark ? "dark" : "light";
    } else {
      // Temas personalizados: adiciona sufixo -dark quando necessário
      temaHeroUI = isDark ? `${configuracoes.tema}-dark` : configuracoes.tema;

      // Adiciona a classe do tema HeroUI personalizado
      root.classList.add(temaHeroUI);
    }

    // Adiciona classe auxiliar para tracking (opcional)
    root.classList.add(`theme-${configuracoes.tema}`);

    // Define data-theme para compatibilidade
    root.setAttribute("data-theme", temaHeroUI);

    console.log("🎨 Tema aplicado:", {
      tema: configuracoes.tema,
      isDark,
      temaHeroUI,
      classes: root.className,
    });
  }, [configuracoes]);

  // Função para carregar configurações
  const carregarConfiguracoes = React.useCallback(async () => {
    if (!usuario?.id) return;

    try {
      setCarregando(true);
      const data = await configuracoesService.getConfiguracoes(usuario.id);

      setConfiguracoes(data);
    } catch (error) {
      console.error("Erro ao carregar configurações:", error);
    } finally {
      setCarregando(false);
    }
  }, [usuario?.id]);

  // Carregar configurações quando o usuário logar
  useEffect(() => {
    if (usuario?.id) {
      carregarConfiguracoes();
    } else {
      setConfiguracoes(null);
      setCarregando(false);
    }
    // Remover carregarConfiguracoes das dependências para evitar loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usuario?.id]);

  // Aplicar tema de cores SEMPRE que mudar
  useEffect(() => {
    if (configuracoes) {
      aplicarTema();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [configuracoes?.tema]); // Reage apenas quando o tema muda

  // Reaplicar tema quando modo dark/light mudar
  useEffect(() => {
    if (configuracoes && nextTheme) {
      // Pequeno delay para garantir que next-themes terminou de atualizar
      const timer = setTimeout(() => {
        aplicarTema();
      }, 50);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nextTheme]); // Reage quando dark/light mode muda

  // NÃO sincronizar dark/light mode - deixar next-themes gerenciar
  // O Context só carrega, não aplica mais o tema dark/light

  const atualizarConfiguracoes = async (
    novasConfiguracoes: Partial<ConfiguracoesUsuario>
  ) => {
    if (!usuario?.id || !configuracoes) {
      console.warn(
        "⚠️ Não é possível atualizar: usuário ou configurações não carregadas"
      );
      return;
    }

    try {
      const configuracoesAtualizadas = {
        ...configuracoes,
        ...novasConfiguracoes,
        usuario_id: usuario.id,
      };

      const data = await configuracoesService.salvarConfiguracoes(
        configuracoesAtualizadas
      );

      // Atualiza o estado local com as configurações salvas
      // IMPORTANTE: Não resetar flags de sincronização
      setConfiguracoes(data);
    } catch (error) {
      console.error("❌ Erro ao atualizar configurações:", error);
      throw error;
    }
  };

  const resetarConfiguracoes = async () => {
    if (!usuario?.id) return;

    try {
      const data = await configuracoesService.resetarConfiguracoes(usuario.id);
      setConfiguracoes(data);
    } catch (error) {
      console.error("Erro ao resetar configurações:", error);
      throw error;
    }
  };

  return (
    <ConfiguracoesContext.Provider
      value={{
        configuracoes,
        carregando,
        atualizarConfiguracoes,
        resetarConfiguracoes,
        aplicarTema,
      }}
    >
      {children}
    </ConfiguracoesContext.Provider>
  );
}

export function useConfiguracoes() {
  const context = useContext(ConfiguracoesContext);
  if (context === undefined) {
    throw new Error(
      "useConfiguracoes deve ser usado dentro de ConfiguracoesProvider"
    );
  }
  return context;
}
