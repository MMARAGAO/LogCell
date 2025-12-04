import { supabase } from "@/lib/supabaseClient";

/**
 * Buscar todos os clientes ativos com paginação automática
 * Útil para selects/autocompletes que precisam de todos os clientes
 */
export async function buscarTodosClientesAtivos(): Promise<Array<{
  id: string;
  nome: string;
  cpf?: string | null;
}>> {
  try {
    let todosClientes: any[] = [];
    let page = 0;
    const pageSize = 1000;
    let hasMore = true;

    while (hasMore) {
      const start = page * pageSize;
      const end = start + pageSize - 1;

      const { data, error } = await supabase
        .from("clientes")
        .select("id, nome, cpf")
        .eq("ativo", true)
        .order("nome")
        .range(start, end);

      if (error) {
        console.error("Erro ao buscar clientes:", error);
        throw error;
      }

      if (data && data.length > 0) {
        todosClientes = [...todosClientes, ...data];
        hasMore = data.length === pageSize;
        page++;
      } else {
        hasMore = false;
      }
    }

    console.log(`✅ ${todosClientes.length} clientes ativos carregados`);
    return todosClientes;
  } catch (error) {
    console.error("Erro ao carregar clientes:", error);
    return [];
  }
}

/**
 * Buscar clientes com filtro de busca (limitado a resultados relevantes)
 * Útil para autocompletes com busca em tempo real
 */
export async function buscarClientesPorTermo(
  termo: string,
  limite: number = 50
): Promise<Array<{
  id: string;
  nome: string;
  cpf?: string | null;
  telefone?: string | null;
  email?: string | null;
}>> {
  try {
    const searchPattern = `%${termo}%`;
    
    const { data, error } = await supabase
      .from("clientes")
      .select("id, nome, cpf, telefone, email")
      .eq("ativo", true)
      .or(
        `nome.ilike.${searchPattern},cpf.ilike.${searchPattern},telefone.ilike.${searchPattern},email.ilike.${searchPattern}`
      )
      .order("nome")
      .limit(limite);

    if (error) {
      console.error("Erro ao buscar clientes:", error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error("Erro ao buscar clientes por termo:", error);
    return [];
  }
}
