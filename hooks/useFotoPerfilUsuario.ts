import { useState, useEffect } from "react";

import { supabase } from "@/lib/supabaseClient";

// Cache global para evitar múltiplas requisições
const fotoCache = new Map<string, string | null>();
const loadingCache = new Set<string>();

/**
 * Hook para buscar foto de perfil de qualquer usuário (somente leitura)
 * Usa cache para evitar múltiplas requisições
 */
export function useFotoPerfilUsuario(usuarioId: string | undefined) {
  const [fotoUrl, setFotoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!usuarioId) {
      setFotoUrl(null);
      setLoading(false);

      return;
    }

    // Verifica se já está no cache
    if (fotoCache.has(usuarioId)) {
      setFotoUrl(fotoCache.get(usuarioId) || null);
      setLoading(false);

      return;
    }

    // Evita múltiplas requisições simultâneas para o mesmo usuário
    if (loadingCache.has(usuarioId)) {
      // Aguarda um pouco e verifica o cache novamente
      const checkInterval = setInterval(() => {
        if (fotoCache.has(usuarioId)) {
          setFotoUrl(fotoCache.get(usuarioId) || null);
          setLoading(false);
          clearInterval(checkInterval);
        }
      }, 100);

      return () => clearInterval(checkInterval);
    }

    // Marca como carregando
    loadingCache.add(usuarioId);

    // Busca a foto
    const buscarFoto = async () => {
      try {
        setLoading(true);

        const { data, error } = await supabase
          .from("fotos_perfil")
          .select("url")
          .eq("usuario_id", usuarioId)
          .order("criado_em", { ascending: false })
          .limit(1);

        // Se não houver erro e houver dados, usa a primeira foto
        let url: string | null = null;

        if (!error && data && Array.isArray(data) && data.length > 0) {
          url = data[0].url;
        } else if (error && error.code !== "PGRST116") {
          // PGRST116 = nenhum resultado encontrado (não é um erro real)
          console.error("Erro ao buscar foto:", error);
        }

        // Armazena no cache
        fotoCache.set(usuarioId, url);
        setFotoUrl(url);
      } catch (error) {
        console.error("Erro ao buscar foto:", error);
        fotoCache.set(usuarioId, null);
        setFotoUrl(null);
      } finally {
        setLoading(false);
        loadingCache.delete(usuarioId);
      }
    };

    buscarFoto();
  }, [usuarioId]);

  return { fotoUrl, loading };
}

/**
 * Limpa o cache de um usuário específico (útil após upload)
 */
export function limparCacheFoto(usuarioId: string) {
  fotoCache.delete(usuarioId);
}

/**
 * Limpa todo o cache de fotos
 */
export function limparTodoCacheFotos() {
  fotoCache.clear();
}
