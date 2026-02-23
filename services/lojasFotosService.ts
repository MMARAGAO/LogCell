import type { LojaFoto } from "@/types";

import { supabase } from "@/lib/supabaseClient";

export class LojasFotosService {
  private static readonly BUCKET_NAME = "lojas_fotos";

  /**
   * Buscar todas as fotos de uma loja (ordenadas)
   */
  static async getFotosPorLoja(lojaId: number): Promise<LojaFoto[]> {
    try {
      const { data, error } = await supabase.rpc("obter_fotos_loja", {
        p_loja_id: lojaId,
      });

      if (error) {
        // Se a função não existir, fazer query normal
        if (error.code === "42883") {
          const { data: fotosData, error: fotosError } = await supabase
            .from("lojas_fotos")
            .select("*")
            .eq("loja_id", lojaId)
            .order("ordem", { ascending: true })
            .order("criado_em", { ascending: true });

          if (fotosError) throw fotosError;

          return fotosData || [];
        }
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error("Erro ao buscar fotos da loja:", error);

      return [];
    }
  }

  /**
   * Buscar foto principal de uma loja
   */
  static async getFotoPrincipal(lojaId: number): Promise<LojaFoto | null> {
    try {
      const { data, error } = await supabase
        .from("lojas_fotos")
        .select("*")
        .eq("loja_id", lojaId)
        .eq("is_principal", true)
        .single();

      if (error) {
        if (error.code === "PGRST116") return null; // Nenhum registro encontrado
        throw error;
      }

      return data;
    } catch (error) {
      console.error("Erro ao buscar foto principal:", error);

      return null;
    }
  }

  /**
   * Upload de uma foto para o Storage
   */
  static async uploadFoto(
    lojaId: number,
    file: File,
  ): Promise<{ url: string; error?: string }> {
    try {
      // Validar tipo de arquivo
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif",
      ];

      if (!allowedTypes.includes(file.type)) {
        return {
          url: "",
          error: "Tipo de arquivo não permitido. Use JPG, PNG, WebP ou GIF.",
        };
      }

      // Validar tamanho (5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (file.size > maxSize) {
        return { url: "", error: "Arquivo muito grande. Tamanho máximo: 5MB." };
      }

      // Gerar nome único para o arquivo
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(7);
      const extension = file.name.split(".").pop();
      const fileName = `loja-${lojaId}-${timestamp}-${randomString}.${extension}`;
      const filePath = `${lojaId}/${fileName}`;

      // Upload para o Storage
      const { error: uploadError } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        console.error("Erro no upload:", uploadError);

        return { url: "", error: "Erro ao fazer upload da imagem." };
      }

      // Obter URL pública
      const { data: urlData } = supabase.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(filePath);

      return { url: urlData.publicUrl };
    } catch (error) {
      console.error("Erro ao fazer upload:", error);

      return { url: "", error: "Erro inesperado ao fazer upload." };
    }
  }

  /**
   * Deletar foto do Storage
   */
  static async deletarFotoStorage(url: string): Promise<boolean> {
    try {
      // Extrair o caminho do arquivo da URL
      const urlParts = url.split(`/${this.BUCKET_NAME}/`);

      if (urlParts.length < 2) return false;

      const filePath = urlParts[1];

      const { error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .remove([filePath]);

      if (error) {
        console.error("Erro ao deletar arquivo:", error);

        return false;
      }

      return true;
    } catch (error) {
      console.error("Erro ao deletar foto do storage:", error);

      return false;
    }
  }

  /**
   * Obter URL pública de um arquivo
   */
  static getPublicUrl(filePath: string): string {
    const { data } = supabase.storage
      .from(this.BUCKET_NAME)
      .getPublicUrl(filePath);

    return data.publicUrl;
  }
}
