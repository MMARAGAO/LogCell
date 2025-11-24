import { supabase } from "@/lib/supabaseClient";

export const fotosService = {
  /**
   * Upload de foto para o Supabase Storage
   */
  async uploadFoto(
    bucket: string,
    file: File,
    entidade_id: string
  ): Promise<{ publicUrl: string }> {
    const fileExt = file.name.split(".").pop();
    const fileName = `${entidade_id}_${Date.now()}.${fileExt}`;
    const filePath = `${entidade_id}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file);

    if (uploadError) {
      throw new Error(`Erro ao fazer upload: ${uploadError.message}`);
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(filePath);

    return { publicUrl };
  },

  /**
   * Vincula foto à entidade no banco
   */
  async linkFotoToEntity(
    bucket: string,
    entidade_id: string,
    url: string
  ): Promise<{ id: string }> {
    const { data, error } = await supabase
      .from(`${bucket}_fotos`)
      .insert({
        entidade_id,
        url,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao vincular foto: ${error.message}`);
    }

    return { id: data.id };
  },

  /**
   * Remove foto do storage e do banco
   */
  async removeFoto(
    bucket: string,
    filePath: string,
    id: string
  ): Promise<void> {
    // Remove do storage
    const { error: storageError } = await supabase.storage
      .from(bucket)
      .remove([filePath]);

    if (storageError) {
      throw new Error(`Erro ao remover do storage: ${storageError.message}`);
    }

    // Remove do banco
    const { error: dbError } = await supabase
      .from(`${bucket}_fotos`)
      .delete()
      .eq("id", id);

    if (dbError) {
      throw new Error(`Erro ao remover do banco: ${dbError.message}`);
    }
  },
};
