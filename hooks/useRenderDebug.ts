"use client";

import { useEffect, useRef } from "react";

/**
 * Hook de debug para detectar renderizações excessivas
 * Use em componentes suspeitos de causar loops
 */
export function useRenderDebug(componentName: string) {
  const renderCount = useRef(0);
  const lastRenderTime = useRef(Date.now());

  useEffect(() => {
    renderCount.current++;
    const now = Date.now();
    const timeSinceLastRender = now - lastRenderTime.current;

    console.log(
      `🔄 [${componentName}] Render #${renderCount.current} (${timeSinceLastRender}ms desde último render)`,
    );

    if (timeSinceLastRender < 100 && renderCount.current > 5) {
      console.error(
        `🚨 [${componentName}] POSSÍVEL LOOP DETECTADO! ${renderCount.current} renders em poucos milissegundos`,
      );
    }

    lastRenderTime.current = now;
  });

  return renderCount.current;
}
