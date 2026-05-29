import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type TrocaPayload = {
  modelo: string;
  imei: string;
  condicao: string;
  bateria: string;
  cor: string;
  armazenamento: string;
  valor: number;
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { vendaId, usuarioId, trocas } = body as {
      vendaId?: string;
      usuarioId?: string;
      trocas?: TrocaPayload[];
    };

    if (!vendaId || !usuarioId || !Array.isArray(trocas)) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
    }

    const { data: venda, error: errVenda } = await supabaseAdmin
      .from("vendas")
      .select("id, numero_venda, loja_id, valor_total")
      .eq("id", vendaId)
      .single();

    if (errVenda || !venda) {
      return NextResponse.json(
        { error: errVenda?.message || "Venda não encontrada" },
        { status: 404 },
      );
    }

    // Deletar pagamentos de troca antigos
    const { error: errDeletePagamentos } = await supabaseAdmin
      .from("pagamentos_venda")
      .delete()
      .eq("venda_id", vendaId)
      .eq("tipo_pagamento", "troca_aparelho");

    if (errDeletePagamentos) {
      return NextResponse.json(
        {
          error: `Erro ao deletar pagamentos de troca: ${errDeletePagamentos.message}`,
        },
        { status: 500 },
      );
    }

    // Inserir novos pagamentos de troca
    for (const troca of trocas) {
      if (troca.valor > 0) {
        const { error: errInsertPagamento } = await supabaseAdmin
          .from("pagamentos_venda")
          .insert({
            venda_id: vendaId,
            tipo_pagamento: "troca_aparelho",
            valor: troca.valor,
            liquido: null,
            data_pagamento: new Date().toISOString().split("T")[0],
            criado_por: usuarioId,
            observacao: JSON.stringify({
              modelo: troca.modelo || null,
              imei: troca.imei || null,
              cor: troca.cor || null,
              armazenamento: troca.armazenamento || null,
              condicao: troca.condicao || null,
            }),
          });

        if (errInsertPagamento) {
          return NextResponse.json(
            {
              error: `Erro ao inserir pagamento de troca: ${errInsertPagamento.message}`,
            },
            { status: 500 },
          );
        }
      }
    }

    // Recalcular total pago e atualizar venda
    const { data: pagamentos } = await supabaseAdmin
      .from("pagamentos_venda")
      .select("valor, liquido")
      .eq("venda_id", vendaId);

    const novoTotalPago =
      pagamentos?.reduce((sum, pagamento) => {
        return sum + Number(pagamento.liquido ?? pagamento.valor ?? 0);
      }, 0) || 0;

    const { error: errUpdateVenda } = await supabaseAdmin
      .from("vendas")
      .update({
        valor_pago: novoTotalPago,
        saldo_devedor: Math.max(
          0,
          Number(venda.valor_total || 0) - novoTotalPago,
        ),
        status:
          novoTotalPago >= Number(venda.valor_total || 0)
            ? "concluida"
            : "em_andamento",
      })
      .eq("id", vendaId);

    if (errUpdateVenda) {
      return NextResponse.json(
        { error: `Erro ao atualizar venda: ${errUpdateVenda.message}` },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      totalTrocas: trocas.length,
      valorPago: novoTotalPago,
    });
  } catch (error: any) {
    console.error("Erro ao sincronizar trocas da venda:", error);

    return NextResponse.json(
      { error: error?.message || "Erro interno ao sincronizar trocas" },
      { status: 500 },
    );
  }
}
