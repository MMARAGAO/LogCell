import { supabase } from "@/lib/supabaseClient";

export interface ClienteAnalytics {
  resumo: {
    totalVendas: number;
    totalGasto: number;
    totalPago: number;
    saldoDevedor: number;
    ticketMedio: number;
    ultimaCompra: string | null;
    diasDesdeUltimaCompra: number | null;
    totalAparelhos: number;
    totalServicos: number;
  };
  vendasPorMes: { mes: string; valor: number }[];
  pagamentosPorTipo: { tipo: string; valor: number }[];
  aparelhosComprados: { marca: string; quantidade: number }[];
  servicosRealizados: { descricao: string; quantidade: number }[];
  vendas: {
    id: string;
    numero_venda: number;
    data: string;
    valor_total: number;
    status: string;
  }[];
  creditos: number;
}

const TIPO_PAGAMENTO_LABEL: Record<string, string> = {
  dinheiro: "Dinheiro",
  pix: "PIX",
  cartao_credito: "Cartão de Crédito",
  cartao_debito: "Cartão de Débito",
  transferencia: "Transferência",
  boleto: "Boleto",
  credito_cliente: "Crédito Cliente",
  troca_aparelho: "Troca",
};

export async function buscarAnalyticsCliente(
  clienteId: string,
): Promise<ClienteAnalytics> {
  const now = new Date();

  // 1. Buscar vendas do cliente
  const { data: vendas, error: errVendas } = await supabase
    .from("vendas")
    .select("id, numero_venda, valor_total, valor_pago, saldo_devedor, status, criado_em")
    .eq("cliente_id", clienteId)
    .neq("status", "cancelada")
    .order("criado_em", { ascending: false });

  if (errVendas) throw errVendas;

  const vendasValidas = vendas || [];
  const totalVendas = vendasValidas.length;
  const totalGasto = vendasValidas.reduce((s, v) => s + (v.valor_total || 0), 0);
  const totalPago = vendasValidas.reduce((s, v) => s + (v.valor_pago || 0), 0);
  const saldoDevedor = vendasValidas.reduce((s, v) => s + (v.saldo_devedor || 0), 0);
  const ticketMedio = totalVendas > 0 ? totalGasto / totalVendas : 0;

  const ultimaVenda = vendasValidas.length > 0 ? vendasValidas[0] : null;
  const ultimaCompra = ultimaVenda ? ultimaVenda.criado_em : null;
  const diasDesdeUltimaCompra = ultimaCompra
    ? Math.floor((now.getTime() - new Date(ultimaCompra).getTime()) / (1000 * 60 * 60 * 24))
    : null;

  // 2. Vendas por mês (últimos 12 meses)
  const vendasPorMes: Record<string, number> = {};
  const meses: { mes: string; valor: number }[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" });
    vendasPorMes[key] = 0;
    meses.push({ mes: label, valor: 0 });
  }

  for (const venda of vendasValidas) {
    const d = new Date(venda.criado_em);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (vendasPorMes[key] !== undefined) {
      vendasPorMes[key] += venda.valor_total || 0;
    }
  }

  const vendasPorMesArray = Object.entries(vendasPorMes).map(([_, valor], i) => ({
    mes: meses[i]?.mes || "",
    valor,
  }));

  // 3. Formas de pagamento (via join com vendas)
  const vendaIds = vendasValidas.map((v) => v.id);
  let pagamentosPorTipo: { tipo: string; valor: number }[] = [];

  try {
    const { data: pagamentos, error: errPag } = await supabase
      .from("pagamentos_venda")
      .select("tipo_pagamento, valor, venda:vendas!pagamentos_venda_venda_id_fkey(cliente_id, status)")
      .eq("venda.cliente_id", clienteId)
      .neq("venda.status", "cancelada");

    if (errPag) {
      console.error("[Analytics] Erro ao buscar pagamentos:", errPag);
    }

    const agrupado: Record<string, number> = {};
    for (const p of pagamentos || []) {
      const label = TIPO_PAGAMENTO_LABEL[p.tipo_pagamento] || p.tipo_pagamento;
      agrupado[label] = (agrupado[label] || 0) + (p.valor || 0);
    }
    pagamentosPorTipo = Object.entries(agrupado).map(([tipo, valor]) => ({
      tipo,
      valor,
    }));
  } catch (err) {
    console.error("[Analytics] Exceção ao buscar pagamentos:", err);
  }

  // 4. Aparelhos comprados (marcas)
  const { data: aparelhos } = await supabase
    .from("aparelhos")
    .select("marca, venda_id")
    .not("marca", "is", null)
    .eq("status", "vendido")
    .in("venda_id", vendaIds.length > 0 ? vendaIds : [""])
    .limit(10000);

  const marcas: Record<string, number> = {};
  for (const a of aparelhos || []) {
    if (a.marca) {
      marcas[a.marca] = (marcas[a.marca] || 0) + 1;
    }
  }
  const aparelhosComprados = Object.entries(marcas)
    .map(([marca, quantidade]) => ({ marca, quantidade }))
    .sort((a, b) => b.quantidade - a.quantidade)
    .slice(0, 10);

  // 5. Serviços realizados (ordem_servico)
  let totalServicos = 0;
  let servicosRealizados: { descricao: string; quantidade: number }[] = [];

  try {
    const { data: cliente } = await supabase
      .from("clientes")
      .select("nome, telefone")
      .eq("id", clienteId)
      .single();

    if (cliente) {
      const filtros: string[] = [];
      if (cliente.telefone) filtros.push(`cliente_telefone.eq.${cliente.telefone}`);
      if (cliente.nome) filtros.push(`cliente_nome.ilike.%${cliente.nome}%`);

      if (filtros.length > 0) {
        const { data: servicos } = await supabase
          .from("ordem_servico")
          .select("status, valor_total, servico_realizar")
          .or(filtros.join(","))
          .limit(10000);

        totalServicos = servicos?.length || 0;

        const servicosAgg: Record<string, number> = {};
        for (const s of servicos || []) {
          if (s.servico_realizar) {
            const desc = s.servico_realizar.substring(0, 60);
            servicosAgg[desc] = (servicosAgg[desc] || 0) + 1;
          }
        }
        servicosRealizados = Object.entries(servicosAgg)
          .map(([descricao, quantidade]) => ({ descricao, quantidade }))
          .sort((a, b) => b.quantidade - a.quantidade)
          .slice(0, 10);
      }
    }
  } catch {
    // ordem_servico search may fail silently
  }

  // 6. Créditos
  let creditos = 0;
  const { data: creditosData } = await supabase
    .from("creditos_cliente")
    .select("saldo")
    .eq("cliente_id", clienteId)
    .gt("saldo", 0);

  creditos = (creditosData || []).reduce((s, c) => s + (c.saldo || 0), 0);

  // 7. Vendas para listagem
  const vendasList = vendasValidas.map((v) => ({
    id: v.id,
    numero_venda: v.numero_venda,
    data: v.criado_em,
    valor_total: v.valor_total,
    status: v.status,
  }));

  return {
    resumo: {
      totalVendas,
      totalGasto,
      totalPago,
      saldoDevedor,
      ticketMedio,
      ultimaCompra,
      diasDesdeUltimaCompra,
      totalAparelhos: aparelhosComprados.reduce((s, a) => s + a.quantidade, 0),
      totalServicos,
    },
    vendasPorMes: vendasPorMesArray,
    pagamentosPorTipo,
    aparelhosComprados,
    servicosRealizados,
    vendas: vendasList,
    creditos,
  };
}
