import { supabase } from "@/lib/supabaseClient";
import { BrindesAparelhosService } from "@/services/brindesAparelhosService";

interface CriarPagamentoAparelhoParams {
  aparelhoId: string;
  clienteId: string;
  lojaId: number;
  valorVenda: number;
  pagamentos: {
    tipo_pagamento: string;
    valor: number;
    parcelas?: number;
  }[];
  brindes?: {
    descricao: string;
    valor: number;
  }[];
  usuarioId: string;
}

export async function criarPagamentoAparelho(
  params: CriarPagamentoAparelhoParams,
) {
  const { aparelhoId, clienteId, lojaId, valorVenda, pagamentos, brindes = [], usuarioId } = params;

  const totalPago = pagamentos.reduce((sum, p) => sum + p.valor, 0);

  // Criar venda
  const { data: vendaData, error: vendaError } = await supabase
    .from("vendas")
    .insert({
      cliente_id: clienteId,
      loja_id: 1, // Ajuste conforme necessário
      vendedor_id: usuarioId,
      status: totalPago >= valorVenda ? "concluida" : "em_andamento",
      tipo: "normal",
      valor_total: valorVenda,
      valor_pago: totalPago,
      saldo_devedor: valorVenda - totalPago,
    })
    .select()
    .single();

  if (vendaError) {
    throw new Error(`Erro ao criar venda: ${vendaError.message}`);
  }

  // Criar pagamentos_venda
  const pagamentoInserts = pagamentos.map((pag) => ({
    venda_id: vendaData.id,
    tipo_pagamento: pag.tipo_pagamento,
    valor: pag.valor,
    parcelas: pag.parcelas || 1,
    data_pagamento: new Date().toISOString().split("T")[0],
    criado_por: usuarioId,
  }));

  const { error: pagError } = await supabase
    .from("pagamentos_venda")
    .insert(pagamentoInserts);

  if (pagError) {
    throw new Error(`Erro ao registrar pagamentos: ${pagError.message}`);
  }

  // Atualizar aparelho: vincular à venda e marcar como vendido
  const { error: aparelhoError } = await supabase
    .from("aparelhos")
    .update({
      venda_id: vendaData.id,
      status: "vendido",
      data_venda: new Date().toISOString(),
      atualizado_por: usuarioId,
      atualizado_em: new Date().toISOString(),
    })
    .eq("id", aparelhoId);

  if (aparelhoError) {
    throw new Error(`Erro ao atualizar aparelho: ${aparelhoError.message}`);
  }

  // Registrar brindes
  for (const brinde of brindes) {
    try {
      await BrindesAparelhosService.registrarBrinde({
        loja_id: lojaId,
        venda_id: vendaData.id,
        descricao: brinde.descricao,
        valor_custo: brinde.valor,
        usuario_id: usuarioId,
      });
    } catch (error) {
      console.error("Erro ao registrar brinde:", error);
    }
  }

  // Registrar no histórico
  const descricaoHistorico = `Venda de aparelho ${aparelhoId} com ${pagamentos.length} forma(s) de pagamento${brindes.length > 0 ? ` e ${brindes.length} brinde(s)` : ""}`;
  const { error: historicoError } = await supabase
    .from("historico_vendas")
    .insert({
      venda_id: vendaData.id,
      tipo_acao: "criacao",
      descricao: descricaoHistorico,
      usuario_id: usuarioId,
    });

  if (historicoError) {
    console.error("Erro ao registrar histórico:", historicoError);
  }

  return vendaData;
}
