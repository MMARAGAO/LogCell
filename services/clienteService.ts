// =====================================================
// SERVICE: CLIENTES
// =====================================================

import { supabase } from "@/lib/supabaseClient";
import { Cliente, ClienteFormData } from "@/types/clientesTecnicos";

/**
 * Buscar todos os clientes
 */
export async function buscarClientes(filtros?: {
  busca?: string;
  ativo?: boolean;
  idLoja?: number;
}) {
  try {
    let query = supabase
      .from("clientes")
      .select(
        `
        *,
        loja:lojas!id_loja(id, nome)
      `
      )
      .order("nome", { ascending: true });

    if (filtros?.ativo !== undefined) {
      query = query.eq("ativo", filtros.ativo);
    }

    if (filtros?.idLoja) {
      query = query.eq("id_loja", filtros.idLoja);
    }

    if (filtros?.busca) {
      query = query.or(
        `nome.ilike.%${filtros.busca}%,telefone.ilike.%${filtros.busca}%,cpf.ilike.%${filtros.busca}%,email.ilike.%${filtros.busca}%`
      );
    }

    const { data, error } = await query;

    if (error) throw error;
    return { data: data as Cliente[], error: null };
  } catch (error: any) {
    console.error("Erro ao buscar clientes:", error);
    return { data: null, error: error.message };
  }
}

/**
 * Buscar cliente por ID
 */
export async function buscarClientePorId(id: string) {
  try {
    const { data, error } = await supabase
      .from("clientes")
      .select(
        `
        *,
        loja:lojas!id_loja(id, nome)
      `
      )
      .eq("id", id)
      .single();

    if (error) throw error;
    return { data: data as Cliente, error: null };
  } catch (error: any) {
    console.error("Erro ao buscar cliente:", error);
    return { data: null, error: error.message };
  }
}

/**
 * Buscar cliente por telefone
 */
export async function buscarClientePorTelefone(telefone: string) {
  try {
    const { data, error } = await supabase
      .from("clientes")
      .select("*")
      .eq("telefone", telefone)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // Nenhum registro encontrado
        return { data: null, error: null };
      }
      throw error;
    }

    return { data: data as Cliente, error: null };
  } catch (error: any) {
    console.error("Erro ao buscar cliente por telefone:", error);
    return { data: null, error: error.message };
  }
}

/**
 * Criar novo cliente
 */
export async function criarCliente(dados: ClienteFormData, userId: string) {
  try {
    const { data, error } = await supabase
      .from("clientes")
      .insert({
        ...dados,
        criado_por: userId,
        atualizado_por: userId,
      })
      .select(
        `
        *,
        loja:lojas!id_loja(id, nome)
      `
      )
      .single();

    if (error) throw error;
    return { data: data as Cliente, error: null };
  } catch (error: any) {
    console.error("Erro ao criar cliente:", error);
    return { data: null, error: error.message };
  }
}

/**
 * Atualizar cliente
 */
export async function atualizarCliente(
  id: string,
  dados: Partial<ClienteFormData>,
  userId: string
) {
  try {
    const { data, error } = await supabase
      .from("clientes")
      .update({
        ...dados,
        atualizado_por: userId,
      })
      .eq("id", id)
      .select(
        `
        *,
        loja:lojas!id_loja(id, nome)
      `
      )
      .single();

    if (error) throw error;
    return { data: data as Cliente, error: null };
  } catch (error: any) {
    console.error("Erro ao atualizar cliente:", error);
    return { data: null, error: error.message };
  }
}

/**
 * Deletar cliente
 */
export async function deletarCliente(id: string) {
  try {
    const { error } = await supabase.from("clientes").delete().eq("id", id);

    if (error) throw error;
    return { error: null };
  } catch (error: any) {
    console.error("Erro ao deletar cliente:", error);
    return { error: error.message };
  }
}

/**
 * Ativar/Desativar cliente
 */
export async function toggleClienteAtivo(
  id: string,
  ativo: boolean,
  userId: string
) {
  try {
    const { data, error } = await supabase
      .from("clientes")
      .update({
        ativo,
        atualizado_por: userId,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return { data: data as Cliente, error: null };
  } catch (error: any) {
    console.error("Erro ao alterar status do cliente:", error);
    return { data: null, error: error.message };
  }
}

/**
 * Buscar histórico de OS do cliente
 */
export async function buscarHistoricoCliente(clienteId: string) {
  try {
    const { data: cliente } = await buscarClientePorId(clienteId);

    if (!cliente) {
      return { data: [], error: "Cliente não encontrado" };
    }

    const { data, error } = await supabase
      .from("ordem_servico")
      .select("*")
      .or(
        `cliente_telefone.eq.${cliente.telefone},cliente_nome.ilike.%${cliente.nome}%`
      )
      .order("data_entrada", { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    console.error("Erro ao buscar histórico do cliente:", error);
    return { data: null, error: error.message };
  }
}
