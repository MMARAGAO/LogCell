"use server";

import { createServerSupabaseClient } from "@/lib/supabase/action";
import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

/**
 * Atualiza os dados do perfil do usuário
 */
export async function atualizarMeuPerfil(
  usuarioId: string,
  dados: {
    nome?: string;
    telefone?: string;
    cpf?: string;
  }
) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("usuarios")
      .update({
        ...dados,
        atualizado_em: new Date().toISOString(),
      })
      .eq("id", usuarioId)
      .select()
      .single();

    if (error) {
      console.error("Erro ao atualizar perfil:", error);
      return {
        success: false,
        error: "Erro ao atualizar perfil",
      };
    }

    revalidatePath("/sistema/perfil");
    return {
      success: true,
      usuario: data,
    };
  } catch (error) {
    console.error("Erro inesperado:", error);
    return {
      success: false,
      error: "Erro inesperado ao atualizar perfil",
    };
  }
}

/**
 * Altera a senha do usuário
 * Recebe o access token do cliente para autenticar a operação
 */
export async function alterarSenha(novaSenha: string, accessToken: string) {
  try {
    // Cria cliente com o token do usuário
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      }
    );

    const { error } = await supabase.auth.updateUser({
      password: novaSenha,
    });

    if (error) {
      console.error("Erro ao alterar senha:", error);
      return {
        success: false,
        error: error.message || "Erro ao alterar senha",
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error("Erro inesperado:", error);
    return {
      success: false,
      error: "Erro inesperado ao alterar senha",
    };
  }
}
