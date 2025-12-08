"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useAuthContext } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";

interface PermissoesRealtimeContextType {
  versaoPermissoes: number;
  forceUpdate: () => void;
}

const PermissoesRealtimeContext = createContext<PermissoesRealtimeContextType>({
  versaoPermissoes: 0,
  forceUpdate: () => {},
});

export function PermissoesRealtimeProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { usuario } = useAuthContext();
  const [versaoPermissoes, setVersaoPermissoes] = useState(0);

  useEffect(() => {
    if (!usuario?.id) return;

    console.log(
      "🔄 [PERMISSÕES REALTIME] Configurando para usuário:",
      usuario.id
    );

    // Canal Realtime para mudanças nas permissões
    const channel = supabase
      .channel("permissoes-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "permissoes",
          filter: `usuario_id=eq.${usuario.id}`,
        },
        (payload) => {
          console.log(
            "🔔 [PERMISSÕES REALTIME] Evento recebido:",
            payload.eventType
          );

          // Incrementar versão para forçar re-render
          setVersaoPermissoes((v) => {
            const novaVersao = v + 1;
            console.log("✅ [PERMISSÕES REALTIME] Nova versão:", novaVersao);
            return novaVersao;
          });

          // Notificar usuário
          if (payload.eventType === "UPDATE") {
            const newData = payload.new as any;
            toast.success("Permissões atualizadas!", {
              description: newData.todas_lojas
                ? "Agora você tem acesso a todas as lojas"
                : newData.loja_id
                  ? `Acesso alterado para loja ${newData.loja_id}`
                  : "Suas permissões foram modificadas",
              duration: 3000,
            });
          } else if (payload.eventType === "INSERT") {
            toast.success("Novas permissões atribuídas!");
          } else if (payload.eventType === "DELETE") {
            toast.info("Permissões removidas", {
              description: "Usando permissões padrão do perfil",
            });
          }
        }
      )
      .subscribe((status, err) => {
        console.log("📡 [PERMISSÕES REALTIME] Status:", status);

        if (status === "SUBSCRIBED") {
          console.log("✅ [PERMISSÕES REALTIME] Conectado!");
        } else if (status === "CHANNEL_ERROR") {
          console.error("❌ [PERMISSÕES REALTIME] Erro no canal:", err);
          // Tentar reconectar após 3 segundos
          setTimeout(() => {
            console.log("🔄 [PERMISSÕES REALTIME] Tentando reconectar...");
            channel.subscribe();
          }, 3000);
        } else if (status === "TIMED_OUT") {
          console.warn("⏱️ [PERMISSÕES REALTIME] Timeout na conexão");
        } else if (status === "CLOSED") {
          console.log("🔒 [PERMISSÕES REALTIME] Canal fechado");
        }
      });

    return () => {
      console.log("🔌 [PERMISSÕES REALTIME] Desconectando");
      supabase.removeChannel(channel);
    };
  }, [usuario?.id]);

  const forceUpdate = () => {
    setVersaoPermissoes((v) => v + 1);
  };

  return (
    <PermissoesRealtimeContext.Provider
      value={{ versaoPermissoes, forceUpdate }}
    >
      {children}
    </PermissoesRealtimeContext.Provider>
  );
}

export function usePermissoesRealtime() {
  return useContext(PermissoesRealtimeContext);
}
