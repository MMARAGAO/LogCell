import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type Filtros = {
  loja_id?: number;
  status?: string;
  cliente_id?: string;
  cliente_nome?: string;
  data_inicio?: string;
  data_fim?: string;
};

export async function POST(request: Request) {
  try {
    const filtros: Filtros = await request.json();

    let query = supabaseAdmin
      .from("vendas")
      .select(
        `
        id,
        status,
        criado_em,
        valor_total,
        valor_pago,
        pagamentos:pagamentos_venda(id, valor, tipo_pagamento, criado_em),
        itens:itens_venda(id, quantidade)
      `,
        { count: "exact" },
      )
      .limit(100000);

    if (filtros?.loja_id) {
      query = query.eq("loja_id", filtros.loja_id);
    }
    if (filtros?.status) {
      query = query.eq("status", filtros.status);
    }
    if (filtros?.cliente_id) {
      query = query.eq("cliente_id", filtros.cliente_id);
    }
    if (filtros?.data_inicio) {
      query = query.gte("criado_em", filtros.data_inicio);
    }
    if (filtros?.data_fim) {
      const dataFim = new Date(filtros.data_fim);

      dataFim.setDate(dataFim.getDate() + 1);
      const diaSeguinte = dataFim.toISOString().split("T")[0];

      query = query.lt("criado_em", diaSeguinte);
    }

    if (filtros?.cliente_nome) {
      const { data: clientes } = await supabaseAdmin
        .from("clientes")
        .select("id")
        .ilike("nome", `%${filtros.cliente_nome}%`);

      if (clientes && clientes.length > 0) {
        query = query.in(
          "cliente_id",
          clientes.map((c) => c.id),
        );
      } else {
        return NextResponse.json({
          totalVendas: 0,
          vendasHoje: 0,
          faturamentoTotal: 0,
          faturamentoHoje: 0,
          ticketMedio: 0,
          produtosVendidos: 0,
          totalCount: 0,
        });
      }
    }

    const { data, error, count } = await query;

    if (error) throw error;

    const vendas = (data || []) as any[];
    const hoje = new Date().toISOString().split("T")[0];

    const vendasConcluidas = vendas.filter(
      (v: any) => v.status === "concluida",
    );
    const vendasHoje = vendasConcluidas.filter((v: any) =>
      v.criado_em?.startsWith(hoje),
    );

    const faturamentoTotal = vendas.reduce((sum: number, v: any) => {
      const pagamentosReais =
        v.pagamentos?.filter(
          (p: any) => p.tipo_pagamento !== "credito_cliente",
        ) || [];

      return (
        sum +
        pagamentosReais.reduce((s: number, p: any) => s + (p.valor || 0), 0)
      );
    }, 0);

    const faturamentoHoje = vendas.reduce((sum: number, v: any) => {
      const pagamentosHoje =
        v.pagamentos?.filter(
          (p: any) =>
            p.criado_em?.startsWith(hoje) &&
            p.tipo_pagamento !== "credito_cliente",
        ) || [];

      return (
        sum +
        pagamentosHoje.reduce((s: number, p: any) => s + (p.valor || 0), 0)
      );
    }, 0);

    const produtosVendidos = vendasConcluidas.reduce((sum: number, v: any) => {
      return (
        sum + (v.itens?.reduce((s: number, i: any) => s + i.quantidade, 0) || 0)
      );
    }, 0);

    const ticketMedio =
      vendasConcluidas.length > 0
        ? faturamentoTotal / vendasConcluidas.length
        : 0;

    return NextResponse.json({
      totalVendas: vendasConcluidas.length,
      vendasHoje: vendasHoje.length,
      faturamentoTotal,
      faturamentoHoje,
      ticketMedio,
      produtosVendidos,
      totalCount: count || vendas.length,
    });
  } catch (error: any) {
    console.error("Erro ao calcular estatisticas:", error);

    return NextResponse.json(
      { error: error?.message || "Erro interno" },
      { status: 500 },
    );
  }
}
