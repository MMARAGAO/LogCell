import { supabase } from "@/lib/supabaseClient";
import { HistoricoEstoqueCompleto } from "@/types";

/**
 * Serviço para gerenciamento de histórico de movimentações de estoque
 */

// Buscar histórico de um produto
export async function getHistoricoProduto(
  produtoId: string,
  limit: number = 50,
): Promise<HistoricoEstoqueCompleto[]> {
  try {
    // Query 1: Buscar histórico
    const { data, error } = await supabase
      .from("historico_estoque")
      .select(
        `
        *,
        produto:produtos(descricao, marca),
        loja:lojas(nome)
      `,
      )
      .eq("id_produto", produtoId)
      .order("criado_em", { ascending: false })
      .limit(limit);

    if (error) throw error;

    const historico = data || [];

    // Query 2: Buscar nomes dos usuários
    const usuarioIds = Array.from(
      new Set(historico.map((h) => h.usuario_id).filter(Boolean)),
    );

    let usuariosMap: Record<string, string> = {};

    if (usuarioIds.length > 0) {
      const { data: usuariosData } = await supabase
        .from("usuarios")
        .select("id, nome")
        .in("id", usuarioIds);

      if (usuariosData) {
        usuariosMap = usuariosData.reduce(
          (acc, u) => ({ ...acc, [u.id]: u.nome }),
          {},
        );
      }
    }

    // Combinar dados
    return historico.map((item: any) => ({
      ...item,
      produto_descricao: item.produto?.descricao || "",
      produto_marca: item.produto?.marca || "",
      loja_nome: item.loja?.nome || "",
      usuario_nome: item.usuario_id
        ? usuariosMap[item.usuario_id] || "Sistema"
        : "Sistema",
    }));
  } catch (error) {
    console.error("Erro ao buscar histórico do produto:", error);
    throw error;
  }
}

// Buscar histórico de uma loja
export async function getHistoricoLoja(
  lojaId: number,
  limit: number = 50,
): Promise<HistoricoEstoqueCompleto[]> {
  try {
    // Query 1: Buscar histórico
    const { data, error } = await supabase
      .from("historico_estoque")
      .select(
        `
        *,
        produto:produtos(descricao, marca),
        loja:lojas(nome)
      `,
      )
      .eq("id_loja", lojaId)
      .order("criado_em", { ascending: false })
      .limit(limit);

    if (error) throw error;

    const historico = data || [];

    // Query 2: Buscar nomes dos usuários
    const usuarioIds = Array.from(
      new Set(historico.map((h) => h.usuario_id).filter(Boolean)),
    );

    let usuariosMap: Record<string, string> = {};

    if (usuarioIds.length > 0) {
      const { data: usuariosData } = await supabase
        .from("usuarios")
        .select("id, nome")
        .in("id", usuarioIds);

      if (usuariosData) {
        usuariosMap = usuariosData.reduce(
          (acc, u) => ({ ...acc, [u.id]: u.nome }),
          {},
        );
      }
    }

    // Combinar dados
    return historico.map((item: any) => ({
      ...item,
      produto_descricao: item.produto?.descricao || "",
      produto_marca: item.produto?.marca || "",
      loja_nome: item.loja?.nome || "",
      usuario_nome: item.usuario_id
        ? usuariosMap[item.usuario_id] || "Sistema"
        : "Sistema",
    }));
  } catch (error) {
    console.error("Erro ao buscar histórico da loja:", error);
    throw error;
  }
}

// Buscar todo o histórico (com filtros e paginação)
export async function getTodoHistorico(
  filtros?: {
    id_produto?: string;
    id_loja?: number;
    data_inicio?: string;
    data_fim?: string;
  },
  page: number = 1,
  limit: number = 50,
): Promise<{ data: HistoricoEstoqueCompleto[]; total: number }> {
  try {
    let query = supabase.from("historico_estoque").select(
      `
        *,
        produto:produtos(descricao, marca),
        loja:lojas(nome)
      `,
      { count: "exact" },
    );

    // Filtros
    if (filtros?.id_produto) {
      query = query.eq("id_produto", filtros.id_produto);
    }

    if (filtros?.id_loja) {
      query = query.eq("id_loja", filtros.id_loja);
    }

    if (filtros?.data_inicio) {
      query = query.gte("criado_em", filtros.data_inicio);
    }

    if (filtros?.data_fim) {
      query = query.lte("criado_em", filtros.data_fim);
    }

    // Paginação
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await query
      .order("criado_em", { ascending: false })
      .range(from, to);

    if (error) throw error;

    const historico = data || [];

    // Query 2: Buscar nomes dos usuários
    const usuarioIds = Array.from(
      new Set(historico.map((h: any) => h.usuario_id).filter(Boolean)),
    );

    let usuariosMap: Record<string, string> = {};

    if (usuarioIds.length > 0) {
      const { data: usuariosData } = await supabase
        .from("usuarios")
        .select("id, nome")
        .in("id", usuarioIds);

      if (usuariosData) {
        usuariosMap = usuariosData.reduce(
          (acc, u) => ({ ...acc, [u.id]: u.nome }),
          {},
        );
      }
    }

    // Combinar dados
    const historicoCompleto = historico.map((item: any) => ({
      ...item,
      produto_descricao: item.produto?.descricao || "",
      produto_marca: item.produto?.marca || "",
      loja_nome: item.loja?.nome || "",
      usuario_nome: item.usuario_id
        ? usuariosMap[item.usuario_id] || "Sistema"
        : "Sistema",
    }));

    return {
      data: historicoCompleto,
      total: count || 0,
    };
  } catch (error) {
    console.error("Erro ao buscar histórico:", error);
    throw error;
  }
}

// Buscar histórico de produto em uma loja específica
export async function getHistoricoProdutoLoja(
  produtoId: string,
  lojaId: number,
  limit: number = 50,
): Promise<HistoricoEstoqueCompleto[]> {
  try {
    // Query 1: Buscar histórico
    const { data, error } = await supabase
      .from("historico_estoque")
      .select(
        `
        *,
        produto:produtos(descricao, marca),
        loja:lojas(nome)
      `,
      )
      .eq("id_produto", produtoId)
      .eq("id_loja", lojaId)
      .order("criado_em", { ascending: false })
      .limit(limit);

    if (error) throw error;

    const historico = data || [];

    // Query 2: Buscar nomes dos usuários
    const usuarioIds = Array.from(
      new Set(historico.map((h) => h.usuario_id).filter(Boolean)),
    );

    let usuariosMap: Record<string, string> = {};

    if (usuarioIds.length > 0) {
      const { data: usuariosData } = await supabase
        .from("usuarios")
        .select("id, nome")
        .in("id", usuarioIds);

      if (usuariosData) {
        usuariosMap = usuariosData.reduce(
          (acc, u) => ({ ...acc, [u.id]: u.nome }),
          {},
        );
      }
    }

    // Combinar dados
    return historico.map((item: any) => ({
      ...item,
      produto_descricao: item.produto?.descricao || "",
      produto_marca: item.produto?.marca || "",
      loja_nome: item.loja?.nome || "",
      usuario_nome: item.usuario_id
        ? usuariosMap[item.usuario_id] || "Sistema"
        : "Sistema",
    }));
  } catch (error) {
    console.error("Erro ao buscar histórico:", error);
    throw error;
  }
}

// Buscar movimentações recentes (últimas 24h)
export async function getMovimentacoesRecentes(
  limit: number = 20,
): Promise<HistoricoEstoqueCompleto[]> {
  try {
    const dataLimite = new Date();

    dataLimite.setHours(dataLimite.getHours() - 24);

    const { data, error } = await supabase
      .from("historico_estoque")
      .select(
        `
        *,
        produto:produtos(descricao, marca),
        loja:lojas(nome)
      `,
      )
      .gte("criado_em", dataLimite.toISOString())
      .order("criado_em", { ascending: false })
      .limit(limit);

    if (error) throw error;

    return (data || []).map((item: any) => ({
      ...item,
      produto_descricao: item.produto?.descricao || "",
      produto_marca: item.produto?.marca || "",
      loja_nome: item.loja?.nome || "",
      usuario_nome: "Sistema",
    }));
  } catch (error) {
    console.error("Erro ao buscar movimentações recentes:", error);
    throw error;
  }
}

// Buscar estatísticas de movimentações
export async function getEstatisticasMovimentacoes(
  periodo: "hoje" | "semana" | "mes" = "hoje",
) {
  try {
    const hoje = new Date();
    let dataInicio: Date;

    switch (periodo) {
      case "hoje":
        dataInicio = new Date(hoje.setHours(0, 0, 0, 0));
        break;
      case "semana":
        dataInicio = new Date();
        dataInicio.setDate(dataInicio.getDate() - 7);
        break;
      case "mes":
        dataInicio = new Date();
        dataInicio.setMonth(dataInicio.getMonth() - 1);
        break;
    }

    const { data, error } = await supabase
      .from("historico_estoque")
      .select("quantidade_alterada, quantidade_nova")
      .gte("criado_em", dataInicio.toISOString());

    if (error) throw error;

    const stats = {
      aumentos: 0,
      diminuicoes: 0,
      ajustes: 0,
      total_movimentacoes: data?.length || 0,
    };

    data?.forEach((item) => {
      if (item.quantidade_alterada && item.quantidade_alterada > 0) {
        stats.aumentos++;
      } else if (item.quantidade_alterada && item.quantidade_alterada < 0) {
        stats.diminuicoes++;
      } else {
        stats.ajustes++;
      }
    });

    return stats;
  } catch (error) {
    console.error("Erro ao buscar estatísticas:", error);
    throw error;
  }
}
