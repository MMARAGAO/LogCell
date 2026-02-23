/**
 * Serviço para gerenciar estoque relacionado a Ordens de Serviço
 */

import { supabase } from "@/lib/supabaseClient";

/*
// FUNÇÃO REMOVIDA: reverterEstoqueOS
// Esta função foi removida porque duplica a funcionalidade da trigger
// devolver_pecas_ao_cancelar_os que já executa automaticamente quando
// uma Ordem de Serviço tem seu status alterado para 'cancelado'.
//
// A trigger é mais confiável porque:
// 1. Executa automaticamente no banco de dados
// 2. Não depende de chamada manual no código
// 3. Garante consistência mesmo em atualizações diretas no banco
//
// Se precisar forçar devolução manual, revise a lógica da trigger.
*/

/**
 * Busca histórico de movimentações de estoque de um produto
 */
export async function buscarHistoricoEstoqueProduto(
  idProduto: string,
  idLoja?: string,
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
      `,
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
      `,
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
