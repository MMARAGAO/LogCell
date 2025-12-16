import { supabase } from "@/lib/supabaseClient";
import { FotoAparelho } from "@/types/aparelhos";

/**
 * Serviço para gerenciamento de fotos de aparelhos
 */

const BUCKET_NAME = "fotos-aparelhos";

// Buscar todas as fotos de um aparelho
export async function getFotosAparelho(
  aparelhoId: string
): Promise<FotoAparelho[]> {
  try {
    const { data, error } = await supabase
      .from("fotos_aparelhos")
      .select("*")
      .eq("aparelho_id", aparelhoId)
      .order("ordem", { ascending: true });

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error("Erro ao buscar fotos do aparelho:", error);
    throw error;
  }
}

// Buscar foto principal de um aparelho
export async function getFotoPrincipal(
  aparelhoId: string
): Promise<FotoAparelho | null> {
  try {
    const { data, error } = await supabase
      .from("fotos_aparelhos")
      .select("*")
      .eq("aparelho_id", aparelhoId)
      .eq("is_principal", true)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null; // Não encontrado
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Erro ao buscar foto principal:", error);
    throw error;
  }
}

// Upload de foto
export async function uploadFotoAparelho(
  aparelhoId: string,
  file: File,
  usuarioId: string,
  isPrincipal: boolean = false
): Promise<FotoAparelho> {
  try {
    // Gerar nome único para o arquivo
    const timestamp = Date.now();
    const nomeArquivo = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    const caminhoArquivo = `${aparelhoId}/${nomeArquivo}`;

    // Upload no bucket
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(caminhoArquivo, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) throw uploadError;

    // Buscar URL pública
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(caminhoArquivo);

    // Se for principal, remover o flag das outras fotos
    if (isPrincipal) {
      await supabase
        .from("fotos_aparelhos")
        .update({ is_principal: false })
        .eq("aparelho_id", aparelhoId);
    }

    // Buscar próxima ordem
    const { data: fotos } = await supabase
      .from("fotos_aparelhos")
      .select("ordem")
      .eq("aparelho_id", aparelhoId)
      .order("ordem", { ascending: false })
      .limit(1);

    const proximaOrdem = fotos && fotos.length > 0 ? fotos[0].ordem + 1 : 0;

    // Salvar registro no banco
    const { data, error } = await supabase
      .from("fotos_aparelhos")
      .insert({
        aparelho_id: aparelhoId,
        url: urlData.publicUrl,
        nome_arquivo: nomeArquivo,
        tamanho: file.size,
        ordem: proximaOrdem,
        is_principal: isPrincipal,
        criado_por: usuarioId,
      })
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error("Erro ao fazer upload da foto:", error);
    throw error;
  }
}

// Deletar foto
export async function deletarFotoAparelho(fotoId: string): Promise<void> {
  try {
    // Buscar dados da foto
    const { data: foto, error: fetchError } = await supabase
      .from("fotos_aparelhos")
      .select("*")
      .eq("id", fotoId)
      .single();

    if (fetchError) throw fetchError;
    if (!foto) throw new Error("Foto não encontrada");

    // Deletar arquivo do storage
    const caminhoArquivo = `${foto.aparelho_id}/${foto.nome_arquivo}`;
    const { error: storageError } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([caminhoArquivo]);

    if (storageError) {
      console.error("Erro ao deletar arquivo do storage:", storageError);
      // Continua mesmo com erro no storage para deletar registro do banco
    }

    // Deletar registro do banco
    const { error: deleteError } = await supabase
      .from("fotos_aparelhos")
      .delete()
      .eq("id", fotoId);

    if (deleteError) throw deleteError;
  } catch (error) {
    console.error("Erro ao deletar foto:", error);
    throw error;
  }
}

// Definir foto como principal
export async function definirFotoPrincipal(
  fotoId: string,
  aparelhoId: string
): Promise<void> {
  try {
    // Remover flag principal de todas as fotos do aparelho
    await supabase
      .from("fotos_aparelhos")
      .update({ is_principal: false })
      .eq("aparelho_id", aparelhoId);

    // Definir a foto selecionada como principal
    const { error } = await supabase
      .from("fotos_aparelhos")
      .update({ is_principal: true })
      .eq("id", fotoId);

    if (error) throw error;
  } catch (error) {
    console.error("Erro ao definir foto principal:", error);
    throw error;
  }
}

// Reordenar fotos
export async function reordenarFotos(
  fotosOrdenadas: { id: string; ordem: number }[]
): Promise<void> {
  try {
    // Atualizar ordem de cada foto
    const promises = fotosOrdenadas.map(({ id, ordem }) =>
      supabase.from("fotos_aparelhos").update({ ordem }).eq("id", id)
    );

    await Promise.all(promises);
  } catch (error) {
    console.error("Erro ao reordenar fotos:", error);
    throw error;
  }
}
