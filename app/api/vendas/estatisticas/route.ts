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

    const { data, error } = await supabaseAdmin.rpc("get_vendas_estatisticas", {
      p_loja_id: filtros?.loja_id ?? null,
      p_status: filtros?.status ?? null,
      p_cliente_id: filtros?.cliente_id ?? null,
      p_cliente_nome: filtros?.cliente_nome ?? null,
      p_data_inicio: filtros?.data_inicio ?? null,
      p_data_fim: filtros?.data_fim ?? null,
    });

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Erro ao calcular estatisticas:", error);

    return NextResponse.json(
      { error: error?.message || "Erro interno" },
      { status: 500 },
    );
  }
}
