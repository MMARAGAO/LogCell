// =====================================================
// SERVICE: FORNECEDORES
// =====================================================

import { supabase } from "@/lib/supabaseClient";
import {
  Fornecedor,
  FornecedorFormData,
  ProdutoFornecedor,
  ProdutoFornecedorFormData,
} from "@/types/fornecedor";

// =====================================================
// CRUD FORNECEDORES
// =====================================================

/**
 * Buscar todos os fornecedores
 */
export async function buscarFornecedores(apenasAtivos = false) {
  try {
    let query = supabase
      .from("fornecedores")
      .select("*")
      .order("nome", { ascending: true });

    if (apenasAtivos) {
      query = query.eq("ativo", true);
    }

    const { data, error } = await query;

    if (error) throw error;

    return { data: data as Fornecedor[], error: null };
  } catch (error: any) {
    console.error("Erro ao buscar fornecedores:", error);

    return { data: null, error: error.message };
  }
}

/**
 * Buscar fornecedor por ID
 */
export async function buscarFornecedorPorId(id: string) {
  try {
    const { data, error } = await supabase
      .from("fornecedores")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;

    return { data: data as Fornecedor, error: null };
  } catch (error: any) {
    console.error("Erro ao buscar fornecedor:", error);

    return { data: null, error: error.message };
  }
}

/**
 * Criar novo fornecedor
 */
export async function criarFornecedor(fornecedor: FornecedorFormData) {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from("fornecedores")
      .insert({
        ...fornecedor,
        criado_por: user?.id,
        atualizado_por: user?.id,
      })
      .select()
      .single();

    if (error) throw error;

    return { data: data as Fornecedor, error: null };
  } catch (error: any) {
    console.error("Erro ao criar fornecedor:", error);

    return { data: null, error: error.message };
  }
}

/**
 * Atualizar fornecedor
 */
export async function atualizarFornecedor(
  id: string,
  fornecedor: Partial<FornecedorFormData>,
) {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from("fornecedores")
      .update({
        ...fornecedor,
        atualizado_por: user?.id,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return { data: data as Fornecedor, error: null };
  } catch (error: any) {
    console.error("Erro ao atualizar fornecedor:", error);

    return { data: null, error: error.message };
  }
}

/**
 * Deletar fornecedor
 */
export async function deletarFornecedor(id: string) {
  try {
    const { error } = await supabase.from("fornecedores").delete().eq("id", id);

    if (error) throw error;

    return { error: null };
  } catch (error: any) {
    console.error("Erro ao deletar fornecedor:", error);

    return { error: error.message };
  }
}

/**
 * Desativar fornecedor (soft delete)
 */
export async function desativarFornecedor(id: string) {
  return atualizarFornecedor(id, { ativo: false });
}

/**
 * Ativar fornecedor
 */
export async function ativarFornecedor(id: string) {
  return atualizarFornecedor(id, { ativo: true });
}

// =====================================================
// PRODUTOS - FORNECEDORES (RELACIONAMENTO)
// =====================================================

/**
 * Buscar fornecedores de um produto
 */
export async function buscarFornecedoresPorProduto(
  produtoId: string,
  apenasAtivos = false,
) {
  try {
    let query = supabase
      .from("produtos_fornecedores")
      .select(
        `
        *,
        fornecedor:fornecedores(*)
      `,
      )
      .eq("produto_id", produtoId);

    if (apenasAtivos) {
      query = query.eq("ativo", true);
    }

    const { data, error } = await query;

    if (error) throw error;

    return { data: data as ProdutoFornecedor[], error: null };
  } catch (error: any) {
    console.error("Erro ao buscar fornecedores do produto:", error);

    return { data: null, error: error.message };
  }
}

/**
 * Buscar produtos de um fornecedor
 */
export async function buscarProdutosPorFornecedor(
  fornecedorId: string,
  apenasAtivos = false,
) {
  try {
    let query = supabase
      .from("produtos_fornecedores")
      .select(
        `
        *,
        produto:produtos(*)
      `,
      )
      .eq("fornecedor_id", fornecedorId);

    if (apenasAtivos) {
      query = query.eq("ativo", true);
    }

    const { data, error } = await query;

    if (error) throw error;

    return { data, error: null };
  } catch (error: any) {
    console.error("Erro ao buscar produtos do fornecedor:", error);

    return { data: null, error: error.message };
  }
}

/**
 * Associar fornecedor a produto
 */
export async function associarFornecedorProduto(
  dados: ProdutoFornecedorFormData,
) {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from("produtos_fornecedores")
      .insert({
        ...dados,
        criado_por: user?.id,
        atualizado_por: user?.id,
      })
      .select()
      .single();

    if (error) throw error;

    return { data: data as ProdutoFornecedor, error: null };
  } catch (error: any) {
    console.error("Erro ao associar fornecedor ao produto:", error);

    return { data: null, error: error.message };
  }
}

/**
 * Atualizar associação produto-fornecedor
 */
export async function atualizarAssociacaoFornecedor(
  id: string,
  dados: Partial<ProdutoFornecedorFormData>,
) {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from("produtos_fornecedores")
      .update({
        ...dados,
        atualizado_por: user?.id,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return { data: data as ProdutoFornecedor, error: null };
  } catch (error: any) {
    console.error("Erro ao atualizar associação:", error);

    return { data: null, error: error.message };
  }
}

/**
 * Remover associação produto-fornecedor
 */
export async function removerAssociacaoFornecedor(id: string) {
  try {
    const { error } = await supabase
      .from("produtos_fornecedores")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return { error: null };
  } catch (error: any) {
    console.error("Erro ao remover associação:", error);

    return { error: error.message };
  }
}

/**
 * Desativar associação produto-fornecedor
 */
export async function desativarAssociacaoFornecedor(id: string) {
  return atualizarAssociacaoFornecedor(id, { ativo: false });
}

/**
 * Buscar histórico de um fornecedor
 */
export async function buscarHistoricoFornecedor(fornecedorId: string) {
  try {
    const { data, error } = await supabase
      .from("historico_fornecedores")
      .select("*")
      .eq("fornecedor_id", fornecedorId)
      .order("criado_em", { ascending: false });

    if (error) throw error;

    return { data, error: null };
  } catch (error: any) {
    console.error("Erro ao buscar histórico do fornecedor:", error);

    return { data: null, error: error.message };
  }
}
