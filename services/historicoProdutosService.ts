import { supabase } from "@/lib/supabaseClient";

export interface HistoricoProduto {
  id: string;
  produto_id: string;
  usuario_id?: string;
  campo: string; // Nome do campo que foi alterado
  valor_antigo?: string;
  valor_novo?: string;
  data_alteracao: string;
  usuario_nome?: string; // Nome do usuário que fez a alteração
}

/**
 * Buscar histórico de alterações de um produto (com paginação)
 * (alterações em campos como descrição, preço, marca, etc)
 */
export async function getHistoricoProduto(
  produtoId: string,
  page: number = 0,
  pageSize: number = 50,
): Promise<{ data: HistoricoProduto[]; hasMore: boolean; total: number }> {
  try {
    const from = page * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await supabase
      .from("historico_produtos")
      .select("*", { count: "exact" })
      .eq("produto_id", produtoId)
      .order("data_alteracao", { ascending: false })
      .range(from, to);

    if (error) throw error;

    // Buscar nomes dos usuários separadamente
    const historico = data || [];
    const usuarioIds = Array.from(
      new Set(historico.map((h) => h.usuario_id).filter(Boolean)),
    );

    let usuarios: Record<string, string> = {};

    if (usuarioIds.length > 0) {
      const { data: usuariosData } = await supabase
        .from("usuarios")
        .select("id, nome")
        .in("id", usuarioIds);

      if (usuariosData) {
        usuarios = Object.fromEntries(usuariosData.map((u) => [u.id, u.nome]));
      }
    }

    const dataFormatada = historico.map((item: any) => ({
      ...item,
      usuario_nome: item.usuario_id
        ? usuarios[item.usuario_id] || "Sistema"
        : "Sistema",
    }));

    return {
      data: dataFormatada,
      hasMore: from + pageSize < (count ?? 0),
      total: count ?? 0,
    };
  } catch (error) {
    console.error("Erro ao buscar histórico do produto:", error);
    throw error;
  }
}

/**
 * Buscar últimas alterações em produtos
 */
export async function getUltimasAlteracoes(
  limit: number = 20,
): Promise<HistoricoProduto[]> {
  try {
    const { data, error } = await supabase
      .from("historico_produtos")
      .select("*")
      .order("data_alteracao", { ascending: false })
      .limit(limit);

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error("Erro ao buscar últimas alterações:", error);
    throw error;
  }
}
