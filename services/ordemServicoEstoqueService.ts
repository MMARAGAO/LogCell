/**
 * Serviço para gerenciar estoque relacionado a Ordens de Serviço
 */

import { supabase } from "@/lib/supabaseClient";

/**
 * Reverte o estoque quando uma OS é cancelada
 */
export async function reverterEstoqueOS(idOrdemServico: string) {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Buscar todas as peças da OS
    const { data: pecas, error: errorPecas } = await supabase
      .from("ordem_servico_pecas")
      .select(
        `
        id,
        id_produto,
        id_loja,
        tipo_produto,
        descricao_peca,
        quantidade
      `
      )
      .eq("id_ordem_servico", idOrdemServico);

    if (errorPecas) {
      console.error("Erro ao buscar peças:", errorPecas);
      return { success: false, error: errorPecas };
    }

    if (!pecas || pecas.length === 0) {
      return { success: true, message: "Nenhuma peça para reverter" };
    }

    // Buscar número da OS para o histórico
    const { data: os } = await supabase
      .from("ordem_servico")
      .select("numero_os")
      .eq("id", idOrdemServico)
      .single();

    // Reverter cada peça do estoque
    for (const peca of pecas) {
      if (peca.tipo_produto === "estoque" && peca.id_produto && peca.id_loja) {
        // Buscar estoque atual
        const { data: estoqueAtual } = await supabase
          .from("estoque_lojas")
          .select("quantidade")
          .eq("id_produto", peca.id_produto)
          .eq("id_loja", peca.id_loja)
          .single();

        if (estoqueAtual) {
          const quantidadeAnterior = estoqueAtual.quantidade;
          const novaQuantidade = quantidadeAnterior + peca.quantidade;

          // Devolver ao estoque
          await supabase
            .from("estoque_lojas")
            .update({
              quantidade: novaQuantidade,
              atualizado_por: user?.id,
            })
            .eq("id_produto", peca.id_produto)
            .eq("id_loja", peca.id_loja);

          // Registrar histórico de devolução
          await supabase.from("historico_estoque").insert({
            id_produto: peca.id_produto,
            id_loja: peca.id_loja,
            id_ordem_servico: idOrdemServico,
            tipo_movimentacao: "devolucao",
            quantidade: peca.quantidade, // Positivo para entrada
            quantidade_anterior: quantidadeAnterior,
            quantidade_nova: novaQuantidade,
            motivo: `Devolução - OS #${os?.numero_os} cancelada`,
            observacoes: peca.descricao_peca,
            criado_por: user?.id,
          });
        }
      }
    }

    return { success: true, message: "Estoque revertido com sucesso" };
  } catch (error) {
    console.error("Erro ao reverter estoque:", error);
    return { success: false, error };
  }
}

/**
 * Busca histórico de movimentações de estoque de um produto
 */
export async function buscarHistoricoEstoqueProduto(
  idProduto: string,
  idLoja?: string
) {
  try {
    let query = supabase
      .from("historico_estoque")
      .select(
        `
        id,
        tipo_movimentacao,
        quantidade,
        quantidade_anterior,
        quantidade_nova,
        motivo,
        observacoes,
        criado_em,
        id_ordem_servico,
        ordem_servico:id_ordem_servico (
          numero_os,
          cliente_nome
        ),
        lojas:id_loja (
          nome
        )
      `
      )
      .eq("id_produto", idProduto)
      .order("criado_em", { ascending: false });

    if (idLoja) {
      query = query.eq("id_loja", idLoja);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Erro ao buscar histórico:", error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error("Erro ao buscar histórico:", error);
    return { data: null, error };
  }
}

/**
 * Busca todas as peças utilizadas em uma OS
 */
export async function buscarPecasOS(idOrdemServico: string) {
  try {
    const { data, error } = await supabase
      .from("ordem_servico_pecas")
      .select(
        `
        id,
        tipo_produto,
        descricao_peca,
        quantidade,
        valor_custo,
        valor_venda,
        criado_em,
        produtos:id_produto (
          descricao,
          marca,
          categoria
        ),
        lojas:id_loja (
          nome
        )
      `
      )
      .eq("id_ordem_servico", idOrdemServico)
      .order("criado_em", { ascending: true });

    if (error) {
      console.error("Erro ao buscar peças da OS:", error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error("Erro ao buscar peças da OS:", error);
    return { data: null, error };
  }
}
