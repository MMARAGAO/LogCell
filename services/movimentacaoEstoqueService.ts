import { supabase } from "@/lib/supabaseClient";

export interface MovimentacaoEstoqueParams {
  produtoId: string;
  lojaId: number;
  quantidadeDelta: number;
  tipoMovimentacao: string;
  usuarioId: string;
  motivo?: string | null;
  observacao?: string | null;
  ordemServicoId?: string | null;
}

/**
 * Atualiza o estoque e grava o histórico na mesma transação do banco.
 * quantidadeDelta deve ser negativa para saída e positiva para entrada.
 */
export async function movimentarEstoqueComHistorico(
  params: MovimentacaoEstoqueParams,
): Promise<void> {
  if (
    !Number.isInteger(params.quantidadeDelta) ||
    params.quantidadeDelta === 0
  ) {
    throw new Error(
      "A quantidade da movimentação deve ser um inteiro diferente de zero",
    );
  }

  const { error } = await supabase.rpc("movimentar_estoque_com_historico", {
    p_produto_id: params.produtoId,
    p_loja_id: params.lojaId,
    p_quantidade_delta: params.quantidadeDelta,
    p_tipo_movimentacao: params.tipoMovimentacao,
    p_usuario_id: params.usuarioId,
    p_motivo: params.motivo ?? null,
    p_observacao: params.observacao ?? null,
    p_id_ordem_servico: params.ordemServicoId ?? null,
  });

  if (error) {
    if (
      error.code === "23514" ||
      error.message?.includes("Estoque insuficiente")
    ) {
      throw new Error(error.message);
    }

    throw error;
  }
}
