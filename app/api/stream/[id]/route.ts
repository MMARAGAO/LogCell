import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const { data, error } = await supabaseAdmin
      .from("ordem_servico")
      .select(
        `
        bancada,
        numero_os,
        cliente_nome,
        cliente_telefone,
        equipamento_tipo,
        equipamento_marca,
        equipamento_modelo,
        equipamento_numero_serie,
        status,
        prioridade,
        defeito_reclamado,
        data_entrada,
        previsao_entrega,
        laudo_garantia_dias,
        tecnico_responsavel,
        valor_orcamento
      `,
      )
      .eq("id", id)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: "Ordem de serviço não encontrada" },
        { status: 404 },
      );
    }

    if (!data.bancada) {
      return NextResponse.json(
        { error: "Nenhuma bancada associada a esta OS" },
        { status: 404 },
      );
    }

    // Busca nome do técnico
    let tecnico_nome = null;

    if (data.tecnico_responsavel) {
      const { data: tecnico } = await supabaseAdmin
        .from("tecnicos")
        .select("nome")
        .eq("id", data.tecnico_responsavel)
        .single();

      if (tecnico) {
        tecnico_nome = tecnico.nome;
      }
    }

    return NextResponse.json({
      bancada: data.bancada,
      numero_os: data.numero_os,
      cliente_nome: data.cliente_nome,
      cliente_telefone: data.cliente_telefone,
      equipamento_tipo: data.equipamento_tipo,
      equipamento_marca: data.equipamento_marca,
      equipamento_modelo: data.equipamento_modelo,
      equipamento_numero_serie: data.equipamento_numero_serie,
      status: data.status,
      prioridade: data.prioridade,
      defeito_reclamado: data.defeito_reclamado,
      data_entrada: data.data_entrada,
      previsao_entrega: data.previsao_entrega,
      garantia_dias: data.laudo_garantia_dias,
      valor_orcamento: data.valor_orcamento,
      tecnico_nome,
    });
  } catch (error) {
    console.error("Erro ao buscar dados da stream:", error);

    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}
