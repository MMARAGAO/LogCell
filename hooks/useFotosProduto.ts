import { useState, useEffect } from "react";

import { getFotosProduto } from "@/services/fotosProdutosService";

/**
 * Hook para buscar fotos de um produto
 */
export function useFotosProduto(produtoId: string | null | undefined) {
  const [fotos, setFotos] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!produtoId) {
      setFotos([]);

      return;
    }

    let mounted = true;

    const carregarFotos = async () => {
      setLoading(true);
      try {
        const fotosData = await getFotosProduto(produtoId);

        if (mounted) {
          // Ordenar: foto principal primeiro, depois por data
          const sorted = fotosData.sort((a, b) => {
            if (a.is_principal && !b.is_principal) return -1;
            if (!a.is_principal && b.is_principal) return 1;

            return (
              new Date(b.criado_em).getTime() - new Date(a.criado_em).getTime()
            );
          });

          setFotos(sorted.map((f) => f.url));
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
  }, [produtoId]);

  return { fotos, loading };
}
