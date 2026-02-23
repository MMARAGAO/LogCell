"use client";

import { useEffect, useRef } from "react";

import { logger } from "@/lib/logger";

/**
 * Componente de Debug para Notificações
 * Monitora reconexões e loops do sistema de notificações
 */
export function NotificacoesDebug() {
  const mountCountRef = useRef(0);
  const lastLogRef = useRef<number>(0);

  useEffect(() => {
    mountCountRef.current++;
    const mountId = mountCountRef.current;
    const agora = Date.now();
    const tempoDesdeUltimoLog = agora - lastLogRef.current;

    logger.log(
      `🔔 [NotificacoesDebug #${mountId}] Sistema de notificações montado`,
    );

    if (lastLogRef.current > 0 && tempoDesdeUltimoLog < 5000) {
      logger.warn(
        `⚠️ [NotificacoesDebug] ATENÇÃO: Remontagem rápida detectada (${tempoDesdeUltimoLog}ms desde último mount)`,
      );
    }

    lastLogRef.current = agora;

    return () => {
      logger.log(`🔕 [NotificacoesDebug #${mountId}] Sistema desmontado`);
    };
  }, []);

  return null;
}
