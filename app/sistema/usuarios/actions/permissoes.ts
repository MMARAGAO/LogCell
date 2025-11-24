"use server";

import { createServerSupabaseClient } from "@/lib/supabase/action";
import { PermissoesModulos } from "@/types";
import { revalidatePath } from "next/cache";

/**
 * Busca as permissões de um usuário
 */
export async function getPermissoes(usuarioId: string) {
  try {
    console.log("📖 Buscando permissões para usuário:", usuarioId);

    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("permissoes")
      .select("*")
      .eq("usuario_id", usuarioId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // Não encontrado - retorna null
        console.log("ℹ️ Nenhuma permissão customizada encontrada");
        return { success: true, data: null };
      }
      console.error("❌ Erro ao buscar permissões:", error);
      return {
        success: false,
        error: "Erro ao buscar permissões",
      };
    }

    console.log("✅ Permissões carregadas:", JSON.stringify(data, null, 2));
    return { success: true, data };
  } catch (error) {
    console.error("❌ Erro inesperado ao buscar permissões:", error);
    return {
      success: false,
      error: "Erro inesperado ao buscar permissões",
    };
  }
}

/**
 * Salva (cria ou atualiza) permissões de um usuário
 */
export async function salvarPermissoes(
  usuarioId: string,
  dados: {
    permissoes: PermissoesModulos;
    loja_id?: number | null;
    todas_lojas?: boolean;
  }
) {
  try {
    console.log("💾 Salvando permissões:", {
      usuarioId,
      dados: JSON.stringify(dados, null, 2),
    });

    const supabase = await createServerSupabaseClient();

    // Verifica se já existe
    const { data: permissoesExistentes } = await supabase
      .from("permissoes")
      .select("id")
      .eq("usuario_id", usuarioId)
      .single();

    console.log(
      "📋 Permissões existentes?",
      permissoesExistentes ? "SIM" : "NÃO"
    );

    if (permissoesExistentes) {
      // Atualizar
      const dadosUpdate = {
        permissoes: dados.permissoes,
        loja_id: dados.loja_id,
        todas_lojas: dados.todas_lojas,
        atualizado_em: new Date().toISOString(),
      };

      console.log("📝 Dados do UPDATE:", JSON.stringify(dadosUpdate, null, 2));

      const { data: updated, error } = await supabase
        .from("permissoes")
        .update(dadosUpdate)
        .eq("usuario_id", usuarioId)
        .select("*");

      if (error) {
        console.error("❌ Erro ao atualizar permissões:", error);
        console.error("❌ Detalhes do erro:", JSON.stringify(error, null, 2));
        return {
          success: false,
          error: "Erro ao atualizar permissões",
        };
      }

      const permissoesAtualizadas = updated?.[0] || updated;
      console.log(
        "✅ Permissões atualizadas:",
        JSON.stringify(permissoesAtualizadas, null, 2)
      );

      return {
        success: true,
        data: permissoesAtualizadas,
      };
    } else {
      // Criar
      const { data: created, error } = await supabase
        .from("permissoes")
        .insert({
          usuario_id: usuarioId,
          permissoes: dados.permissoes,
          loja_id: dados.loja_id,
          todas_lojas: dados.todas_lojas,
        })
        .select("*");

      if (error) {
        console.error("❌ Erro ao criar permissões:", error);
        return {
          success: false,
          error: "Erro ao criar permissões",
        };
      }

      const permissoesCriadas = created?.[0] || created;
      console.log(
        "✅ Permissões criadas:",
        JSON.stringify(permissoesCriadas, null, 2)
      );

      return {
        success: true,
        data: permissoesCriadas,
      };
    }
  } catch (error) {
    console.error("❌ Erro inesperado ao salvar permissões:", error);
    return {
      success: false,
      error: "Erro inesperado ao salvar permissões",
    };
  }
}

/**
 * Remove todas as permissões de um usuário
 */
export async function removerPermissoes(usuarioId: string) {
  try {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase
      .from("permissoes")
      .delete()
      .eq("usuario_id", usuarioId);

    if (error) {
      console.error("Erro ao remover permissões:", error);
      return {
        success: false,
        error: "Erro ao remover permissões",
      };
    }

    revalidatePath("/sistema/usuarios");
    return { success: true };
  } catch (error) {
    console.error("Erro inesperado ao remover permissões:", error);
    return {
      success: false,
      error: "Erro inesperado ao remover permissões",
    };
  }
}
