"use server";

import { revalidatePath } from "next/cache";

import { createServerSupabaseClient } from "@/lib/supabase/action";

/**
 * Cadastrar uma foto no banco de dados (após upload)
 */
export async function cadastrarFoto(dados: {
  loja_id: number;
  url: string;
  legenda?: string;
  ordem?: number;
  is_principal?: boolean;
}) {
  try {
    const supabase = await createServerSupabaseClient();

    // Se for foto principal, desmarcar outras
    if (dados.is_principal) {
      await supabase
        .from("lojas_fotos")
        .update({ is_principal: false })
        .eq("loja_id", dados.loja_id);
    }

    const { data: foto, error } = await supabase
      .from("lojas_fotos")
      .insert({
        loja_id: dados.loja_id,
        url: dados.url,
        legenda: dados.legenda || null,
        ordem: dados.ordem || 0,
        is_principal: dados.is_principal || false,
      })
      .select()
      .single();

    if (error) {
      console.error("Erro ao cadastrar foto:", error);

      return { success: false, error: error.message };
    }

    revalidatePath("/sistema/lojas");

    return { success: true, foto };
  } catch (error) {
    console.error("Erro ao cadastrar foto:", error);

    return { success: false, error: "Erro inesperado ao cadastrar foto" };
  }
}

/**
 * Atualizar dados de uma foto
 */
export async function atualizarFoto(
  id: number,
  dados: {
    legenda?: string;
    ordem?: number;
    is_principal?: boolean;
  },
) {
  try {
    const supabase = await createServerSupabaseClient();

    // Se estiver definindo como principal, desmarcar outras
    if (dados.is_principal) {
      // Primeiro, obter o loja_id da foto
      const { data: fotoAtual } = await supabase
        .from("lojas_fotos")
        .select("loja_id")
        .eq("id", id)
        .single();

      if (fotoAtual) {
        await supabase
          .from("lojas_fotos")
          .update({ is_principal: false })
          .eq("loja_id", fotoAtual.loja_id);
      }
    }

    const { data: foto, error } = await supabase
      .from("lojas_fotos")
      .update(dados)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Erro ao atualizar foto:", error);

      return { success: false, error: error.message };
    }

    revalidatePath("/sistema/lojas");

    return { success: true, foto };
  } catch (error) {
    console.error("Erro ao atualizar foto:", error);

    return { success: false, error: "Erro inesperado ao atualizar foto" };
  }
}

/**
 * Deletar uma foto
 */
export async function deletarFoto(id: number) {
  try {
    const supabase = await createServerSupabaseClient();

    const { error } = await supabase.from("lojas_fotos").delete().eq("id", id);

    if (error) {
      console.error("Erro ao deletar foto:", error);

      return { success: false, error: error.message };
    }

    revalidatePath("/sistema/lojas");

    return { success: true };
  } catch (error) {
    console.error("Erro ao deletar foto:", error);

    return { success: false, error: "Erro inesperado ao deletar foto" };
  }
}

/**
 * Definir foto como principal
 */
export async function definirFotoPrincipal(id: number) {
  try {
    const supabase = await createServerSupabaseClient();

    const { error } = await supabase.rpc("definir_foto_principal", {
      p_foto_id: id,
    });

    if (error) {
      // Se a função não existir, fazer manualmente
      if (error.code === "42883") {
        const { data: fotoAtual } = await supabase
          .from("lojas_fotos")
          .select("loja_id")
          .eq("id", id)
          .single();

        if (!fotoAtual) {
          return { success: false, error: "Foto não encontrada" };
        }

        // Desmarcar todas
        await supabase
          .from("lojas_fotos")
          .update({ is_principal: false })
          .eq("loja_id", fotoAtual.loja_id);

        // Marcar a selecionada
        await supabase
          .from("lojas_fotos")
          .update({ is_principal: true })
          .eq("id", id);

        revalidatePath("/sistema/lojas");

        return { success: true };
      }

      console.error("Erro ao definir foto principal:", error);

      return { success: false, error: error.message };
    }

    revalidatePath("/sistema/lojas");

    return { success: true };
  } catch (error) {
    console.error("Erro ao definir foto principal:", error);

    return {
      success: false,
      error: "Erro inesperado ao definir foto principal",
    };
  }
}

/**
 * Reordenar fotos
 */
export async function reordenarFotos(fotos: { id: number; ordem: number }[]) {
  try {
    const supabase = await createServerSupabaseClient();

    // Atualizar ordem de cada foto
    for (const foto of fotos) {
      await supabase
        .from("lojas_fotos")
        .update({ ordem: foto.ordem })
        .eq("id", foto.id);
    }

    revalidatePath("/sistema/lojas");

    return { success: true };
  } catch (error) {
    console.error("Erro ao reordenar fotos:", error);

    return { success: false, error: "Erro inesperado ao reordenar fotos" };
  }
}
