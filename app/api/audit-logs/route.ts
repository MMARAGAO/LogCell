import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function GET(req: NextRequest) {
  try {
    // Obter parâmetros de query
    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "10");
    const tabela = searchParams.get("tabela");
    const dataInicio = searchParams.get("dataInicio");
    const dataFim = searchParams.get("dataFim");
    const busca = searchParams.get("busca");

    // Construir query base
    let query = supabase
      .from("audit_logs_deletions")
      .select("*", { count: "exact" });

    // Aplicar filtros
    if (tabela && tabela !== "todas") {
      query = query.eq("tabela_nome", tabela);
    }

    if (dataInicio) {
      query = query.gte("criado_em", new Date(dataInicio).toISOString());
    }

    if (dataFim) {
      const dataFimAjustada = new Date(dataFim);

      dataFimAjustada.setHours(23, 59, 59, 999);
      query = query.lte("criado_em", dataFimAjustada.toISOString());
    }

    // Busca por texto nos dados apagados
    if (busca) {
      query = query.or(
        `tabela_nome.ilike.%${busca}%,dados_apagados.cd.${JSON.stringify({
          cliente_nome: busca,
          numero_venda: busca,
        }).replace(/"/g, '\\"')}`,
      );
    }

    // Ordenar por data mais recente
    query = query.order("criado_em", { ascending: false });

    // Aplicar paginação
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      console.error("Erro ao buscar audit logs:", error);

      return NextResponse.json(
        { error: "Erro ao buscar logs" },
        { status: 500 },
      );
    }

    // Buscar nomes dos usuários
    const usuariosIds = data
      .map((log: any) => log.apagado_por)
      .filter((id: any) => id !== null);

    const { data: usuarios } = await supabase
      .from("usuarios")
      .select("id, nome")
      .in("id", usuariosIds);

    // Criar mapa de usuário ID -> nome
    const usuariosMap = new Map(
      usuarios?.map((u: any) => [u.id, u.nome]) || [],
    );

    // Formatar dados para resposta
    const logsFormatados = data.map((log: any) => ({
      id: log.id,
      tabela_nome: log.tabela_nome,
      registro_id: log.registro_id,
      dados_apagados: log.dados_apagados,
      apagado_por: log.apagado_por,
      apagado_por_nome: log.apagado_por
        ? usuariosMap.get(log.apagado_por) || "Usuário não encontrado"
        : null,
      criado_em: log.criado_em,
      motivo: log.motivo,
    }));

    return NextResponse.json({
      dados: logsFormatados,
      total: count,
      pagina: page,
      pageSize,
      totalPaginas: Math.ceil((count || 0) / pageSize),
    });
  } catch (error) {
    console.error("Erro na rota de audit logs:", error);

    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}
