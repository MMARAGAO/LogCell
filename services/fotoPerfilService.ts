import { supabase } from "@/lib/supabaseClient";
import { FotoPerfil } from "@/types";

/**
 * Serviço para gerenciar fotos de perfil
 */
export class FotoPerfilService {
  private static BUCKET_NAME = "fotos_perfil";

  /**
   * Faz upload de uma foto de perfil
   */
  static async uploadFoto(
    usuarioId: string,
    file: File,
  ): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
      // 1. Gera nome único para o arquivo
      const fileExt = file.name.split(".").pop();
      const fileName = `${usuarioId}-${Date.now()}.${fileExt}`;
      const filePath = `${usuarioId}/${fileName}`;

      // 2. Upload do arquivo para o bucket
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        console.error("Erro no upload:", uploadError);

        return { success: false, error: "Erro ao fazer upload da imagem" };
      }

      // 3. Obtém a URL pública da imagem
      const {
        data: { publicUrl },
      } = supabase.storage.from(this.BUCKET_NAME).getPublicUrl(filePath);

      // 4. Salva o registro na tabela fotos_perfil
      const { error: dbError } = await supabase.from("fotos_perfil").insert({
        usuario_id: usuarioId,
        url: publicUrl,
      });

      if (dbError) {
        console.error("Erro ao salvar no banco:", dbError);
        // Tenta deletar a imagem do storage
        await this.deletarArquivo(filePath);

        return {
          success: false,
          error: "Erro ao salvar foto no banco de dados",
        };
      }

      return { success: true, url: publicUrl };
    } catch (error) {
      console.error("Erro inesperado:", error);

      return { success: false, error: "Erro inesperado ao fazer upload" };
    }
  }

  /**
   * Obtém a foto de perfil atual do usuário
   */
  static async getFotoAtual(usuarioId: string): Promise<FotoPerfil | null> {
    const { data, error } = await supabase
      .from("fotos_perfil")
      .select("id, usuario_id, url, criado_em")
      .eq("usuario_id", usuarioId)
      .order("criado_em", { ascending: false })
      .limit(1);

    if (error && error.code !== "PGRST116") {
      // PGRST116 = nenhum resultado encontrado
      console.error("Erro ao buscar foto:", error);

      return null;
    }

    // Retorna o primeiro item do array, ou null se não houver
    return data && Array.isArray(data) && data.length > 0 ? data[0] : null;
  }

  /**
   * Deleta uma foto de perfil
   */
  static async deletarFoto(fotoId: number, usuarioId: string) {
    try {
      // 1. Busca a foto para pegar a URL
      const { data: foto, error: fetchError } = await supabase
        .from("fotos_perfil")
        .select("url")
        .eq("id", fotoId)
        .eq("usuario_id", usuarioId)
        .single();

      if (fetchError || !foto) {
        return { success: false, error: "Foto não encontrada" };
      }

      // 2. Extrai o caminho do arquivo da URL
      const url = new URL(foto.url);
      const pathParts = url.pathname.split(`/${this.BUCKET_NAME}/`);
      const filePath = pathParts[1];

      // 3. Deleta do storage
      await this.deletarArquivo(filePath);

      // 4. Deleta do banco
      const { error: deleteError } = await supabase
        .from("fotos_perfil")
        .delete()
        .eq("id", fotoId)
        .eq("usuario_id", usuarioId);

      if (deleteError) {
        return { success: false, error: "Erro ao deletar foto do banco" };
      }

      return { success: true };
    } catch (error) {
      console.error("Erro ao deletar foto:", error);

      return { success: false, error: "Erro inesperado ao deletar foto" };
    }
  }

  /**
   * Deleta um arquivo do storage
   */
  private static async deletarArquivo(filePath: string) {
    const { error } = await supabase.storage
      .from(this.BUCKET_NAME)
      .remove([filePath]);

    if (error) {
      console.error("Erro ao deletar arquivo:", error);
    }
  }

  /**
   * Lista todas as fotos de um usuário
   */
  static async listarFotos(usuarioId: string) {
    const { data, error } = await supabase
      .from("fotos_perfil")
      .select("*")
      .eq("usuario_id", usuarioId)
      .order("criado_em", { ascending: false });

    if (error) {
      console.error("Erro ao listar fotos:", error);

      return [];
    }

    return data || [];
  }
}
