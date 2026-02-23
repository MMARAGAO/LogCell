"use client";

import { useEffect } from "react";

export function ReloadDetector() {
  useEffect(() => {
    console.log("🔄 [ReloadDetector] Componente montado");

    let reloadCount = 0;

    // Detectar quando o componente está sendo montado/desmontado repetidamente
    const checkInterval = setInterval(() => {
      reloadCount++;
      if (reloadCount % 10 === 0) {
        console.warn(
          `⚠️ [ReloadDetector] Componente ativo há ${reloadCount} segundos`,
        );
      }
    }, 1000);

    // Detectar navegação
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      console.log("🌐 [ReloadDetector] Página sendo recarregada/fechada");
    };

    // Detectar mudanças de visibilidade
    const handleVisibilityChange = () => {
      console.log(
        "👁️ [ReloadDetector] Visibilidade:",
        document.hidden ? "Oculta" : "Visível",
      );
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Monitorar hot reload do Next.js
    if (typeof window !== "undefined" && (window as any).module?.hot) {
      console.log("🔥 [ReloadDetector] Hot Module Replacement ativo");
    }

    return () => {
      console.log(
        "❌ [ReloadDetector] Componente desmontado após",
        reloadCount,
        "segundos",
      );
      clearInterval(checkInterval);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    console.log(
      "🔍 [ReloadDetector] useEffect disparado - pode indicar re-renderização",
    );
  });

  return null;
}
