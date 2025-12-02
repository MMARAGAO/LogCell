"use client";

import { useEffect, useRef, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { RealtimeChannel, RealtimePostgresChangesPayload } from "@supabase/supabase-js";

/**
 * Tipo de evento que pode ser monitorado
 */
export type RealtimeEvent = "*" | "INSERT" | "UPDATE" | "DELETE";

/**
 * Configuração do hook useRealtime
 */
export interface UseRealtimeConfig {
  /**
   * Nome da tabela a ser monitorada
   */
  table: string;

  /**
   * Schema do banco (padrão: 'public')
   */
  schema?: string;

  /**
   * Eventos a serem monitorados
   * @default "*" (todos os eventos)
   */
  event?: RealtimeEvent;

  /**
   * Filtro para limitar quais registros monitorar
   * Exemplo: "loja_id=eq.4" ou "usuario_id=eq.${usuarioId}"
   */
  filter?: string;

  /**
   * Callback chamado quando evento ocorre
   */
  onEvent: (payload: any) => void;

  /**
   * Callback chamado quando canal é inscrito com sucesso
   */
  onSubscribed?: () => void;

  /**
   * Callback chamado quando há erro no canal
   */
  onError?: (error: string) => void;

  /**
   * Se deve conectar automaticamente (padrão: true)
   */
  enabled?: boolean;

  /**
   * Nome único do canal (opcional, será gerado automaticamente se não fornecido)
   */
  channelName?: string;

  /**
   * Se deve exibir logs no console (padrão: true em dev)
   */
  debug?: boolean;
}

/**
 * Hook para monitorar mudanças em tempo real em uma tabela do Supabase
 * 
 * @example
 * ```tsx
 * // Monitorar vendas da loja 4
 * useRealtime({
 *   table: 'vendas',
 *   filter: 'loja_id=eq.4',
 *   onEvent: (payload) => {
 *     console.log('Nova venda:', payload);
 *     recarregarVendas();
 *   }
 * });
 * ```
 * 
 * @example
 * ```tsx
 * // Monitorar apenas INSERTs em notificações do usuário
 * useRealtime({
 *   table: 'notificacoes_usuarios',
 *   event: 'INSERT',
 *   filter: `usuario_id=eq.${usuarioId}`,
 *   onEvent: (payload) => {
 *     toast.info('Nova notificação!');
 *   }
 * });
 * ```
 */
export function useRealtime(config: UseRealtimeConfig) {
  const {
    table,
    schema = "public",
    event = "*",
    filter,
    onEvent,
    onSubscribed,
    onError,
    enabled = true,
    channelName,
    debug = process.env.NODE_ENV === "development",
  } = config;

  const channelRef = useRef<RealtimeChannel | null>(null);
  const onEventRef = useRef(onEvent);
  const onSubscribedRef = useRef(onSubscribed);
  const onErrorRef = useRef(onError);

  // Atualizar refs quando callbacks mudarem
  useEffect(() => {
    onEventRef.current = onEvent;
    onSubscribedRef.current = onSubscribed;
    onErrorRef.current = onError;
  }, [onEvent, onSubscribed, onError]);

  const log = useCallback(
    (message: string, ...args: any[]) => {
      if (debug) {
        console.log(`🔔 [REALTIME:${table}]`, message, ...args);
      }
    },
    [debug, table]
  );

  useEffect(() => {
    if (!enabled) {
      log("Realtime desabilitado");
      return;
    }

    // Nome único do canal
    const channel = channelName || `realtime_${table}_${filter || "all"}`;
    
    log("Conectando...", { event, filter });

    // Criar canal
    const realtimeChannel = supabase
      .channel(channel)
      .on(
        "postgres_changes" as any,
        {
          event,
          table,
          ...(filter && { filter }),
        } as any,
        (payload: RealtimePostgresChangesPayload<any>) => {
          log("Evento recebido:", payload.eventType, payload);
          onEventRef.current?.(payload);
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          log("✅ Inscrito com sucesso");
          onSubscribedRef.current?.();
        } else if (status === "CHANNEL_ERROR") {
          const errorMsg = "Erro ao conectar. Verifique se Realtime está habilitado no Supabase.";
          log("❌", errorMsg);
          onErrorRef.current?.(errorMsg);
        } else if (status === "TIMED_OUT") {
          const errorMsg = "Timeout ao conectar";
          log("⏱️", errorMsg);
          onErrorRef.current?.(errorMsg);
        } else if (status === "CLOSED") {
          log("🔌 Canal fechado");
        } else {
          log("Status:", status);
        }
      });

    channelRef.current = realtimeChannel;

    // Cleanup
    return () => {
      log("Desconectando...");
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [enabled, table, schema, event, filter, channelName, log]);

  return {
    channel: channelRef.current,
    disconnect: () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    },
  };
}

/**
 * Hook para monitorar mudanças em MÚLTIPLAS tabelas ao mesmo tempo
 * 
 * @example
 * ```tsx
 * useRealtimeMultiple([
 *   {
 *     table: 'vendas',
 *     filter: 'loja_id=eq.4',
 *     onEvent: recarregarVendas,
 *   },
 *   {
 *     table: 'transferencias',
 *     filter: 'loja_origem=eq.4',
 *     onEvent: recarregarTransferencias,
 *   }
 * ]);
 * ```
 */
export function useRealtimeMultiple(configs: UseRealtimeConfig[]) {
  const channels = configs.map((config) => useRealtime(config));

  return {
    channels,
    disconnectAll: () => {
      channels.forEach((ch) => ch.disconnect());
    },
  };
}
