import { supabase } from "@/lib/supabaseClient";
import { FotoProduto } from "@/types";

/**
 * Serviço para gerenciamento de fotos de produtos
 */

const BUCKET_NAME = "fotos-produtos";

// Buscar todas as fotos de um produto
export async function getFotosProduto(
  produtoId: string,
): Promise<FotoProduto[]> {
  try {
    const { data, error } = await supabase
      .from("fotos_produtos")
      .select("*")
      .eq("produto_id", produtoId)
      .order("ordem", { ascending: true });

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error("Erro ao buscar fotos do produto:", error);
    throw error;
  }
}

// Buscar foto principal de um produto
export async function getFotoPrincipal(
  produtoId: string,
): Promise<FotoProduto | null> {
  try {
    const { data, error } = await supabase
      .from("fotos_produtos")
      .select("*")
      .eq("produto_id", produtoId)
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
export async function uploadFotoProduto(
  produtoId: string,
  file: File,
  usuarioId: string,
  isPrincipal: boolean = false,
): Promise<FotoProduto> {
  try {
    // Gerar nome único para o arquivo
    const timestamp = Date.now();
    const nomeArquivo = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    const caminhoArquivo = `${produtoId}/${nomeArquivo}`;

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
        .from("fotos_produtos")
        .update({ is_principal: false })
        .eq("produto_id", produtoId);
    }

    // Buscar próxima ordem
    const { data: fotos } = await supabase
      .from("fotos_produtos")
      .select("ordem")
      .eq("produto_id", produtoId)
      .order("ordem", { ascending: false })
      .limit(1);

    const proximaOrdem = fotos && fotos.length > 0 ? fotos[0].ordem + 1 : 0;

    // Salvar registro no banco
    const { data, error } = await supabase
      .from("fotos_produtos")
      .insert({
        produto_id: produtoId,
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
export async function deletarFotoProduto(fotoId: string): Promise<void> {
  try {
    // Buscar informações da foto
    const { data: foto, error: fotoError } = await supabase
      .from("fotos_produtos")
      .select("produto_id, nome_arquivo")
      .eq("id", fotoId)
      .single();

    if (fotoError) throw fotoError;

    const caminhoArquivo = `${foto.produto_id}/${foto.nome_arquivo}`;

    // Deletar do storage
    const { error: storageError } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([caminhoArquivo]);

    if (storageError) throw storageError;

    // Deletar registro do banco
    const { error: dbError } = await supabase
      .from("fotos_produtos")
      .delete()
      .eq("id", fotoId);

    if (dbError) throw dbError;
  } catch (error) {
    console.error("Erro ao deletar foto:", error);
    throw error;
  }
}

// Definir foto como principal
export async function definirFotoPrincipal(
  fotoId: string,
  produtoId: string,
): Promise<void> {
  try {
    // Remover flag de principal de todas as fotos do produto
    await supabase
      .from("fotos_produtos")
      .update({ is_principal: false })
      .eq("produto_id", produtoId);

    // Definir a foto selecionada como principal
    const { error } = await supabase
      .from("fotos_produtos")
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
  produtoId: string,
  fotosOrdenadas: { id: string; ordem: number }[],
): Promise<void> {
  try {
    // Atualizar ordem de cada foto
    const promises = fotosOrdenadas.map(({ id, ordem }) =>
      supabase
        .from("fotos_produtos")
        .update({ ordem })
        .eq("id", id)
        .eq("produto_id", produtoId),
    );

    await Promise.all(promises);
  } catch (error) {
    console.error("Erro ao reordenar fotos:", error);
    throw error;
  }
}

// Deletar todas as fotos de um produto
export async function deletarTodasFotosProduto(
  produtoId: string,
): Promise<void> {
  try {
    // Buscar todas as fotos
    const fotos = await getFotosProduto(produtoId);

    if (fotos.length === 0) return;

    // Deletar arquivos do storage
    const caminhos = fotos.map((foto) => `${produtoId}/${foto.nome_arquivo}`);
    const { error: storageError } = await supabase.storage
      .from(BUCKET_NAME)
      .remove(caminhos);

    if (storageError) throw storageError;

    // Deletar registros do banco
    const { error: dbError } = await supabase
      .from("fotos_produtos")
      .delete()
      .eq("produto_id", produtoId);

    if (dbError) throw dbError;
  } catch (error) {
    console.error("Erro ao deletar todas as fotos:", error);
    throw error;
  }
}

// Upload múltiplo de fotos
export async function uploadMultiplasFotos(
  produtoId: string,
  files: File[],
  usuarioId: string,
): Promise<FotoProduto[]> {
  try {
    const fotosUpload = await Promise.all(
      files.map((file, index) =>
        uploadFotoProduto(produtoId, file, usuarioId, index === 0),
      ),
    );

    return fotosUpload;
  } catch (error) {
    console.error("Erro ao fazer upload múltiplo:", error);
    throw error;
  }
}
