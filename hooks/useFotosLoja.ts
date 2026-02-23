import type { LojaFoto } from "@/types";

import { useState, useEffect } from "react";

import { LojasFotosService } from "@/services/lojasFotosService";

/**
 * Hook para buscar fotos de uma loja
 */
export function useFotosLoja(lojaId: number | null | undefined) {
  const [fotos, setFotos] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!lojaId) {
      setFotos([]);

      return;
    }

    let mounted = true;

    const carregarFotos = async () => {
      setLoading(true);
      try {
        const fotosData = await LojasFotosService.getFotosPorLoja(lojaId);

        if (mounted) {
          // Ordenar: foto principal primeiro, depois por data
          const sorted = fotosData.sort((a: LojaFoto, b: LojaFoto) => {
            if (a.is_principal && !b.is_principal) return -1;
            if (!a.is_principal && b.is_principal) return 1;

            return (
              new Date(b.criado_em).getTime() - new Date(a.criado_em).getTime()
            );
          });

          setFotos(sorted.map((f: LojaFoto) => f.url));
        }
      } catch (error) {
        console.error("Erro ao carregar fotos:", error);
        if (mounted) setFotos([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    carregarFotos();

    return () => {
      mounted = false;
    };
  }, [lojaId]);

  return { fotos, loading };
}
