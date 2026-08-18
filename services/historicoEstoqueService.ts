import { supabase } from "@/lib/supabaseClient";
import { HistoricoEstoqueCompleto } from "@/types";

/**
 * Serviço para gerenciamento de histórico de movimentações de estoque
 */

// Buscar histórico de um produto (com paginação)
export async function getHistoricoProduto(
  produtoId: string,
  page: number = 0,
  pageSize: number = 50,
): Promise<{
  data: HistoricoEstoqueCompleto[];
  hasMore: boolean;
  total: number;
}> {
  try {
    const from = page * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await supabase
      .from("historico_estoque")
      .select(
        `
        *,
        produto:produtos(descricao, marca),
        loja:lojas(nome)
      `,
        { count: "exact" },
      )
      .eq("id_produto", produtoId)
      .order("criado_em", { ascending: false })
      .range(from, to);

    if (error) throw error;

    const historico = data || [];

    // Buscar nomes dos usuários
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

    // Buscar solicitantes das transferências
    const transferIds: string[] = [];
    const transferIdRegex = /Transferencia #([a-f0-9-]+)/i;

    for (const item of historico) {
      if (
        item.tipo_movimentacao?.includes("transferencia") &&
        item.observacao
      ) {
        const match = item.observacao.match(transferIdRegex);

        if (match?.[1]) {
          transferIds.push(match[1]);
        }
      }
    }

    let criadoPorMap: Record<string, string> = {};

    if (transferIds.length > 0) {
      const { data: transfers } = await supabase
        .from("transferencias")
        .select("id, usuario_id")
        .in(
          "id",
          transferIds.filter((id, i, arr) => arr.indexOf(id) === i),
        );

      if (transfers) {
        const criadoPorIds = transfers
          .map((t) => t.usuario_id)
          .filter((id, i, arr) => id && arr.indexOf(id) === i) as string[];

        if (criadoPorIds.length > 0) {
          const { data: users } = await supabase
            .from("usuarios")
            .select("id, nome")
            .in("id", criadoPorIds);

          if (users) {
            const userMap = Object.fromEntries(
              users.map((u) => [u.id, u.nome]),
            );

            criadoPorMap = Object.fromEntries(
              transfers.map((t) => [t.id, userMap[t.usuario_id] || "Sistema"]),
            );
          }
        }
      }
    }

    // Buscar contexto de trocas de produto (venda com substituição de item) que
    // envolvem este produto, como produto novo (saiu com o cliente) ou produto
    // antigo devolvido. A tabela trocas_produtos guarda a venda e o cliente de
    // cada troca; casamos com a linha do histórico pelo instante mais próximo,
    // já que não existe FK direta entre historico_estoque e trocas_produtos.
    const temTroca = historico.some(
      (item) =>
        item.motivo === "Troca de produto - Venda" ||
        item.motivo === "Devolução por troca - Venda",
    );

    let trocas: any[] = [];

    if (temTroca) {
      const { data: trocasData } = await supabase
        .from("trocas_produtos")
        .select(
          `
          criado_em,
          produto_antigo_id,
          produto_antigo_nome,
          produto_novo_id,
          produto_novo_nome,
          venda:vendas(numero_venda, cliente:clientes(nome))
        `,
        )
        .or(
          `produto_novo_id.eq.${produtoId},produto_antigo_id.eq.${produtoId}`,
        );

      trocas = trocasData || [];
    }

    const encontrarTroca = (criadoEm: string) => {
      const alvo = new Date(criadoEm).getTime();
      let melhor: any = null;
      let menorDiff = Infinity;

      for (const t of trocas) {
        const diff = Math.abs(new Date(t.criado_em).getTime() - alvo);

        if (diff < menorDiff && diff <= 120_000) {
          menorDiff = diff;
          melhor = t;
        }
      }

      return melhor;
    };

    // Combinar dados
    const dataFormatada = historico.map((item: any) => {
      const transferId = item.observacao?.match(transferIdRegex)?.[1];

      let produtoTrocaNome: string | undefined;
      let produtoTrocaDirecao: "entrada" | "saida" | undefined;
      let vendaTrocaNumero: number | undefined;
      let vendaTrocaCliente: string | undefined;

      if (item.motivo === "Troca de produto - Venda") {
        const troca = encontrarTroca(item.criado_em);

        if (troca) {
          produtoTrocaNome = troca.produto_antigo_nome;
          produtoTrocaDirecao = "entrada";
          vendaTrocaNumero = troca.venda?.numero_venda;
          vendaTrocaCliente = troca.venda?.cliente?.nome;
        }
      } else if (item.motivo === "Devolução por troca - Venda") {
        const troca = encontrarTroca(item.criado_em);

        if (troca) {
          produtoTrocaNome = troca.produto_novo_nome;
          produtoTrocaDirecao = "saida";
          vendaTrocaNumero = troca.venda?.numero_venda;
          vendaTrocaCliente = troca.venda?.cliente?.nome;
        }
      }

      return {
        ...item,
        produto_descricao: item.produto?.descricao || "",
        produto_marca: item.produto?.marca || "",
        loja_nome: item.loja?.nome || "",
        usuario_nome: item.usuario_id
          ? usuariosMap[item.usuario_id] || "Sistema"
          : "Sistema",
        usuario_origem_nome:
          transferId && criadoPorMap[transferId]
            ? criadoPorMap[transferId]
            : undefined,
        produto_troca_nome: produtoTrocaNome,
        produto_troca_direcao: produtoTrocaDirecao,
        venda_troca_numero: vendaTrocaNumero,
        venda_troca_cliente: vendaTrocaCliente,
      };
    });

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
    id_lojas?: number[];
    usuario_id?: string;
    data_inicio?: string;
    data_fim?: string;
    tipo_movimentacao?: string;
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
    } else if (filtros?.id_lojas && filtros.id_lojas.length > 0) {
      query = query.in("id_loja", filtros.id_lojas);
    }

    if (filtros?.usuario_id) {
      query = query.eq("usuario_id", filtros.usuario_id);
    }

    if (filtros?.data_inicio) {
      query = query.gte("criado_em", filtros.data_inicio);
    }

    if (filtros?.data_fim) {
      query = query.lte("criado_em", filtros.data_fim);
    }

    if (filtros?.tipo_movimentacao) {
      query = query.eq("tipo_movimentacao", filtros.tipo_movimentacao);
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

export interface PerdaEstoque {
  id_produto: string;
  produto_descricao: string;
  produto_marca?: string;
  id_loja: number | null;
  loja_nome: string | null;
  // Campos legados mantidos para compatibilidade: representam redução bruta.
  unidades_perdidas: number;
  valor_perdido: number;
  qtd_ajustes: number;
  ultima_ocorrencia: string;
  unidades_reducao_bruta: number;
  valor_reducao_bruta: number;
  unidades_compensadas: number;
  valor_compensado: number;
  unidades_divergencia_liquida: number;
  valor_divergencia_liquida: number;
  unidades_perda_confirmada: number;
  valor_perda_confirmada: number;
  qtd_ajustes_reducao: number;
  qtd_ajustes_aumento: number;
  classificacao_pendente: boolean;
  unidades_entradas: number;
  valor_entradas: number;
  valor_saldo_liquido: number;
}

// Balanço do inventário: separa reduções, entradas e o saldo líquido em valor.
// Campos antigos permanecem na função do banco para compatibilidade. Ver
// scripts/relatorio_perdas_estoque.sql para a função no banco.
export async function getRelatorioPerdas(filtros?: {
  dataInicio?: string;
  dataFim?: string;
  lojaIds?: number[];
}): Promise<PerdaEstoque[]> {
  try {
    const parametros = {
      p_data_inicio: filtros?.dataInicio || null,
      p_data_fim: filtros?.dataFim || null,
      p_loja_ids:
        filtros?.lojaIds && filtros.lojaIds.length > 0 ? filtros.lojaIds : null,
    };
    const tamanhoLote = 1000;
    const registros: Record<string, unknown>[] = [];

    for (let pagina = 0; pagina < 100; pagina++) {
      const inicio = pagina * tamanhoLote;
      const { data, error } = await supabase
        .rpc("relatorio_perdas_estoque", parametros)
        .range(inicio, inicio + tamanhoLote - 1);

      if (error) throw error;

      const lote = (data || []) as Record<string, unknown>[];

      registros.push(...lote);

      if (lote.length < tamanhoLote) break;

      if (pagina === 99) {
        throw new Error("O balanço excedeu o limite seguro de paginação.");
      }
    }

    return registros.map((item) => ({
      ...item,
      unidades_reducao_bruta: Number(item.unidades_reducao_bruta ?? 0),
      valor_reducao_bruta: Number(item.valor_reducao_bruta ?? 0),
      unidades_entradas: Number(item.unidades_entradas ?? 0),
      valor_entradas: Number(item.valor_entradas ?? 0),
      valor_saldo_liquido: Number(
        item.valor_saldo_liquido ??
          -Number(item.valor_reducao_bruta ?? item.valor_perdido ?? 0),
      ),
      qtd_ajustes_reducao: Number(item.qtd_ajustes_reducao ?? 0),
      qtd_ajustes_aumento: Number(item.qtd_ajustes_aumento ?? 0),
    })) as PerdaEstoque[];
  } catch (error) {
    console.error("Erro ao buscar balanço do inventário:", error);
    throw error;
  }
}
