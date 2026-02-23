import { useState, useEffect } from "react";

import { FotoPerfilService } from "@/services/fotoPerfilService";
import { useAuthContext } from "@/contexts/AuthContext";

/**
 * Hook para gerenciar a foto de perfil do usuário
 * @param usuarioId - ID do usuário (opcional, usa o usuário logado se não fornecido)
 */
export function useFotoPerfil(usuarioId?: string) {
  const { usuario } = useAuthContext();
  const [fotoUrl, setFotoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Usa o usuarioId fornecido ou o do usuário logado
  const targetUserId = usuarioId || usuario?.id;

  useEffect(() => {
    if (targetUserId) {
      carregarFoto();
    } else {
      setFotoUrl(null);
      setLoading(false);
    }
  }, [targetUserId]);

  const carregarFoto = async () => {
    if (!targetUserId) return;

    try {
      setLoading(true);
      const foto = await FotoPerfilService.getFotoAtual(targetUserId);

      setFotoUrl(foto?.url || null);
    } catch (error) {
      console.error("Erro ao carregar foto de perfil:", error);
      setFotoUrl(null);
    } finally {
      setLoading(false);
    }
  };

  const atualizarFoto = async (file: File) => {
    if (!targetUserId)
      return { success: false, error: "Usuário não autenticado" };

    const result = await FotoPerfilService.uploadFoto(targetUserId, file);

    if (result.success && result.url) {
      setFotoUrl(result.url);
    }

    return result;
  };

  const removerFoto = async () => {
    if (!targetUserId)
      return { success: false, error: "Usuário não autenticado" };

    // Buscar a foto atual para pegar o ID
    const fotoAtual = await FotoPerfilService.getFotoAtual(targetUserId);

    if (!fotoAtual) {
      return { success: false, error: "Nenhuma foto encontrada" };
    }

    const result = await FotoPerfilService.deletarFoto(
      fotoAtual.id,
      targetUserId,
    );

    if (result.success) {
      setFotoUrl(null);
    }

    return result;
  };

  return {
    fotoUrl,
    loading,
    carregarFoto,
    atualizarFoto,
    removerFoto,
  };
}
