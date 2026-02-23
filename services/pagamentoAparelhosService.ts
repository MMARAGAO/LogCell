import { supabase } from "@/lib/supabaseClient";

interface CriarPagamentoAparelhoParams {
  aparelhoId: string;
  clienteId: string;
  valorVenda: number;
  pagamentos: {
    tipo_pagamento: string;
    valor: number;
  }[];
  usuarioId: string;
}

export async function criarPagamentoAparelho(
  params: CriarPagamentoAparelhoParams,
) {
  const { aparelhoId, clienteId, valorVenda, pagamentos, usuarioId } = params;

  // Validar que não ultrapassa o valor
  const totalPago = pagamentos.reduce((sum, p) => sum + p.valor, 0);

  if (totalPago > valorVenda) {
    throw new Error(
      "Total de pagamentos não pode ultrapassar o valor da venda",
    );
  }

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

  // Registrar no histórico
  const { error: historicoError } = await supabase
    .from("historico_vendas")
    .insert({
      venda_id: vendaData.id,
      tipo_acao: "criacao",
      descricao: `Venda de aparelho ${aparelhoId} com ${pagamentos.length} forma(s) de pagamento`,
      usuario_id: usuarioId,
    });

  if (historicoError) {
    console.error("Erro ao registrar histórico:", historicoError);
  }

  return vendaData;
}
