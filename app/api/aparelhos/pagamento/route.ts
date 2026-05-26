import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { aparelhoId, clienteId, lojaId, valorVenda, pagamentos, brindes = [], usuarioId } = body;

    if (!aparelhoId || !clienteId || !lojaId || !usuarioId || !pagamentos?.length) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
    }

    const totalPago = pagamentos.reduce((s: number, p: any) => s + p.valor, 0);

    // Criar venda
    const { data: vendaData, error: vendaError } = await supabaseAdmin
      .from("vendas")
      .insert({
        cliente_id: clienteId,
        loja_id: lojaId,
        vendedor_id: usuarioId,
        status: totalPago >= valorVenda ? "concluida" : "em_andamento",
        tipo: "normal",
        valor_total: valorVenda,
        valor_pago: totalPago,
        saldo_devedor: Math.max(0, valorVenda - totalPago),
      })
      .select("id")
      .single();

    if (vendaError) {
      return NextResponse.json({ error: `Erro ao criar venda: ${vendaError.message}` }, { status: 500 });
    }

    // Criar pagamentos_venda
    const pagamentoInserts = pagamentos.map((pag: any) => ({
      venda_id: vendaData.id,
      tipo_pagamento: pag.tipo_pagamento,
      valor: pag.valor,
      parcelas: pag.parcelas || 1,
      liquido: pag.liquido ?? null,
      taxa_percentual: pag.taxa ?? null,
      data_pagamento: new Date().toISOString().split("T")[0],
      criado_por: usuarioId,
    }));

    const { error: pagError } = await supabaseAdmin
      .from("pagamentos_venda")
      .insert(pagamentoInserts);

    if (pagError) {
      return NextResponse.json({ error: `Erro ao registrar pagamentos: ${pagError.message}` }, { status: 500 });
    }

    // Atualizar aparelho
    const { error: aparelhoError } = await supabaseAdmin
      .from("aparelhos")
      .update({
        venda_id: vendaData.id,
        data_venda: new Date().toISOString(),
        atualizado_por: usuarioId,
        atualizado_em: new Date().toISOString(),
      })
      .eq("id", aparelhoId);

    if (aparelhoError) {
      return NextResponse.json({ error: `Erro ao atualizar aparelho: ${aparelhoError.message}` }, { status: 500 });
    }

    // Registrar brindes
    for (const brinde of brindes) {
      const { error: brindeError } = await supabaseAdmin
        .from("brindes_aparelhos")
        .insert({
          loja_id: lojaId,
          venda_id: vendaData.id,
          descricao: brinde.descricao,
          valor_custo: brinde.valor,
          data_ocorrencia: new Date().toISOString(),
          criado_por: usuarioId,
        });

      if (brindeError) {
        console.error("Erro ao registrar brinde:", brindeError);
      }
    }

    // Histórico
    const descricaoHistorico = `Venda de aparelho ${aparelhoId} com ${pagamentos.length} forma(s) de pagamento${brindes.length > 0 ? ` e ${brindes.length} brinde(s)` : ""}`;
    await supabaseAdmin.from("historico_vendas").insert({
      venda_id: vendaData.id,
      tipo_acao: "criacao",
      descricao: descricaoHistorico,
      usuario_id: usuarioId,
    });

    return NextResponse.json({ success: true, vendaId: vendaData.id });
  } catch (error: any) {
    console.error("Erro ao registrar pagamento:", error);
    return NextResponse.json({ error: error.message || "Erro interno" }, { status: 500 });
  }
}
