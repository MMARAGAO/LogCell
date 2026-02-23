"use server";

import { revalidatePath } from "next/cache";

import { createServerSupabaseClient } from "@/lib/supabase/action";

interface LojaData {
  nome: string;
  cnpj?: string;
  telefone?: string;
  email?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
}

/**
 * Cadastra uma nova loja
 */
export async function cadastrarLoja(dados: LojaData, usuarioId: string) {
  try {
    const supabase = await createServerSupabaseClient();

    // Verificar se CNPJ já existe
    if (dados.cnpj) {
      const { data: lojaExistente, error: cnpjError } = await supabase
        .from("lojas")
        .select("id")
        .eq("cnpj", dados.cnpj)
        .single();

      if (lojaExistente) {
        return {
          success: false,
          error: "CNPJ já cadastrado",
        };
      }
    }

    // Iniciar uma transação para garantir que o set_config e o INSERT aconteçam na mesma conexão
    const { data, error } = await supabase.rpc("inserir_loja_com_usuario", {
      p_nome: dados.nome,
      p_cnpj: dados.cnpj || null,
      p_telefone: dados.telefone || null,
      p_email: dados.email || null,
      p_endereco: dados.endereco || null,
      p_cidade: dados.cidade || null,
      p_estado: dados.estado || null,
      p_cep: dados.cep || null,
      p_usuario_id: usuarioId,
    });

    if (error) {
      console.error("❌ [cadastrarLoja] Erro ao inserir no banco:", error);

      return {
        success: false,
        error: `Erro ao cadastrar loja: ${error.message}`,
      };
    }

    revalidatePath("/sistema/lojas");

    return {
      success: true,
      loja: data,
    };
  } catch (error) {
    console.error("❌ [cadastrarLoja] Erro inesperado:", error);

    return {
      success: false,
      error: `Erro inesperado ao cadastrar loja: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

/**
 * Atualiza uma loja existente
 */
export async function atualizarLoja(
  id: number,
  dados: LojaData,
  usuarioId: string,
) {
  try {
    const supabase = await createServerSupabaseClient();

    // Verificar se CNPJ já existe em outra loja
    if (dados.cnpj) {
      const { data: lojaExistente } = await supabase
        .from("lojas")
        .select("id")
        .eq("cnpj", dados.cnpj)
        .neq("id", id)
        .single();

      if (lojaExistente) {
        return {
          success: false,
          error: "CNPJ já cadastrado em outra loja",
        };
      }
    }

    const { data, error } = await supabase.rpc("atualizar_loja_com_usuario", {
      p_id: id,
      p_nome: dados.nome,
      p_cnpj: dados.cnpj || null,
      p_telefone: dados.telefone || null,
      p_email: dados.email || null,
      p_endereco: dados.endereco || null,
      p_cidade: dados.cidade || null,
      p_estado: dados.estado || null,
      p_cep: dados.cep || null,
      p_usuario_id: usuarioId,
    });

    if (error) {
      console.error("Erro ao atualizar loja:", error);

      return {
        success: false,
        error: "Erro ao atualizar loja",
      };
    }

    // A função RPC retorna um array, pegar o primeiro elemento
    const lojaAtualizada = Array.isArray(data) ? data[0] : data;

    revalidatePath("/sistema/lojas");

    return {
      success: true,
      loja: lojaAtualizada,
    };
  } catch (error) {
    console.error("Erro inesperado:", error);

    return {
      success: false,
      error: "Erro inesperado ao atualizar loja",
    };
  }
}

/**
 * Deleta uma loja (soft delete - desativa)
 */
export async function deletarLoja(id: number, usuarioId: string) {
  try {
    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase.rpc("deletar_loja_com_usuario", {
      p_id: id,
      p_usuario_id: usuarioId,
    });

    if (error) {
      console.error("Erro ao deletar loja:", error);

      return {
        success: false,
        error: "Erro ao deletar loja",
      };
    }

    revalidatePath("/sistema/lojas");

    return { success: true };
  } catch (error) {
    console.error("Erro inesperado:", error);

    return {
      success: false,
      error: "Erro inesperado ao deletar loja",
    };
  }
}

/**
 * Alterna o status ativo/inativo de uma loja
 */
export async function alternarStatusLoja(
  id: number,
  ativo: boolean,
  usuarioId: string,
) {
  try {
    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase.rpc(
      "alternar_status_loja_com_usuario",
      {
        p_id: id,
        p_ativo: ativo,
        p_usuario_id: usuarioId,
      },
    );

    if (error) {
      console.error("Erro ao alterar status da loja:", error);

      return {
        success: false,
        error: "Erro ao alterar status da loja",
      };
    }

    revalidatePath("/sistema/lojas");

    return { success: true };
  } catch (error) {
    console.error("Erro inesperado:", error);

    return {
      success: false,
      error: "Erro inesperado ao alterar status da loja",
    };
  }
}
