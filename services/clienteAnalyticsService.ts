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
    primeiraCompra: string | null;
    diasRelacionamento: number | null;
    totalAparelhos: number;
    totalServicos: number;
    totalServicosValor: number;
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
  vendedorPreferidoNome: string | null;
  lojaPreferidaNome: string | null;
  produtoFavorito: string | null;
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

  // 1. Buscar vendas do cliente com pagamentos e aparelhos aninhados
  const { data: vendas, error: errVendas } = await supabase
    .from("vendas")
    .select(
      `
      id, numero_venda, valor_total, valor_pago, saldo_devedor, status, criado_em, loja_id, vendedor_id,
      pagamentos_venda!pagamentos_venda_venda_id_fkey (
        tipo_pagamento,
        valor
      ),
      aparelhos!aparelhos_venda_id_fkey (
        marca
      ),
      itens_venda!itens_venda_venda_id_fkey (
        produto_nome,
        quantidade
      )
    `,
    )
    .eq("cliente_id", clienteId)
    .neq("status", "cancelada")
    .order("criado_em", { ascending: false });

  if (errVendas) throw errVendas;

  const vendasValidas = vendas || [];
  const totalVendas = vendasValidas.length;
  const totalGasto = vendasValidas.reduce(
    (s, v) => s + (v.valor_total || 0),
    0,
  );
  const totalPago = vendasValidas.reduce((s, v) => s + (v.valor_pago || 0), 0);
  const saldoDevedor = vendasValidas.reduce(
    (s, v) => s + (v.saldo_devedor || 0),
    0,
  );
  const ticketMedio = totalVendas > 0 ? totalGasto / totalVendas : 0;

  const ultimaVenda = vendasValidas.length > 0 ? vendasValidas[0] : null;
  const ultimaCompra = ultimaVenda ? ultimaVenda.criado_em : null;
  const diasDesdeUltimaCompra = ultimaCompra
    ? Math.floor(
        (now.getTime() - new Date(ultimaCompra).getTime()) /
          (1000 * 60 * 60 * 24),
      )
    : null;

  const primeiraVenda =
    vendasValidas.length > 0 ? vendasValidas[vendasValidas.length - 1] : null;
  const primeiraCompra = primeiraVenda ? primeiraVenda.criado_em : null;
  const diasRelacionamento = primeiraCompra
    ? Math.floor(
        (now.getTime() - new Date(primeiraCompra).getTime()) /
          (1000 * 60 * 60 * 24),
      )
    : null;

  // Vendedor preferido (moda)
  const vendedorCount: Record<string, number> = {};

  for (const v of vendasValidas) {
    if (v.vendedor_id) {
      vendedorCount[v.vendedor_id] = (vendedorCount[v.vendedor_id] || 0) + 1;
    }
  }
  const topVendedorId =
    Object.entries(vendedorCount).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

  // Loja preferida (moda)
  const lojaCount: Record<number, number> = {};

  for (const v of vendasValidas) {
    if (v.loja_id) {
      lojaCount[v.loja_id] = (lojaCount[v.loja_id] || 0) + 1;
    }
  }
  const topLojaId = Object.entries(lojaCount).sort(
    (a, b) => b[1] - a[1],
  )[0]?.[0]
    ? Number(Object.entries(lojaCount).sort((a, b) => b[1] - a[1])[0][0])
    : null;

  // 2. Vendas por mês (últimos 12 meses)
  const vendasPorMes: Record<string, number> = {};
  const meses: { mes: string; valor: number }[] = [];

  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleDateString("pt-BR", {
      month: "short",
      year: "2-digit",
    });

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

  const vendasPorMesArray = Object.entries(vendasPorMes).map(
    ([_, valor], i) => ({
      mes: meses[i]?.mes || "",
      valor,
    }),
  );

  // 3. Formas de pagamento + 4. Aparelhos comprados (extraídos do JOIN)
  let pagamentosPorTipo: { tipo: string; valor: number }[] = [];

  const agrupadoPag: Record<string, number> = {};
  const marcas: Record<string, number> = {};

  for (const venda of vendasValidas) {
    const pags = venda.pagamentos_venda;

    if (Array.isArray(pags)) {
      for (const p of pags) {
        const label =
          TIPO_PAGAMENTO_LABEL[p.tipo_pagamento] || p.tipo_pagamento;

        agrupadoPag[label] = (agrupadoPag[label] || 0) + (p.valor || 0);
      }
    }
    const apars = venda.aparelhos;

    if (Array.isArray(apars)) {
      for (const a of apars) {
        if (a.marca) {
          marcas[a.marca] = (marcas[a.marca] || 0) + 1;
        }
      }
    }
  }
  pagamentosPorTipo = Object.entries(agrupadoPag).map(([tipo, valor]) => ({
    tipo,
    valor,
  }));
  const aparelhosComprados = Object.entries(marcas)
    .map(([marca, quantidade]) => ({ marca, quantidade }))
    .sort((a, b) => b.quantidade - a.quantidade)
    .slice(0, 10);

  // 5. Serviços realizados (ordem_servico)
  let totalServicos = 0;
  let totalServicosValor = 0;
  let servicosRealizados: { descricao: string; quantidade: number }[] = [];

  try {
    const { data: cliente } = await supabase
      .from("clientes")
      .select("nome, telefone")
      .eq("id", clienteId)
      .single();

    if (cliente) {
      const filtros: string[] = [];

      if (cliente.telefone)
        filtros.push(`cliente_telefone.eq.${cliente.telefone}`);
      if (cliente.nome) filtros.push(`cliente_nome.ilike.%${cliente.nome}%`);

      if (filtros.length > 0) {
        const { data: servicos } = await supabase
          .from("ordem_servico")
          .select("status, valor_total, servico_realizar")
          .or(filtros.join(","))
          .limit(10000);

        totalServicos = servicos?.length || 0;
        totalServicosValor = (servicos || []).reduce(
          (s, os) => s + (os.valor_total || 0),
          0,
        );

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

  // 7. Nomes do vendedor e loja preferidos
  let vendedorPreferidoNome: string | null = null;
  let lojaPreferidaNome: string | null = null;

  if (topVendedorId) {
    const { data: user } = await supabase
      .from("usuarios")
      .select("nome")
      .eq("id", topVendedorId)
      .single();

    vendedorPreferidoNome = user?.nome || null;
  }

  if (topLojaId) {
    const { data: loja } = await supabase
      .from("lojas")
      .select("nome")
      .eq("id", topLojaId)
      .maybeSingle();

    lojaPreferidaNome = loja?.nome || null;
  }

  // 8. Produto favorito (extraído do JOIN)
  let produtoFavorito: string | null = null;
  const itemCount: Record<string, number> = {};

  for (const venda of vendasValidas) {
    const itens = venda.itens_venda;

    if (Array.isArray(itens)) {
      for (const item of itens) {
        const nome = item.produto_nome || "Sem nome";

        itemCount[nome] = (itemCount[nome] || 0) + (item.quantidade || 1);
      }
    }
  }
  const top = Object.entries(itemCount).sort((a, b) => b[1] - a[1])[0];

  produtoFavorito = top ? `${top[0]} (${top[1]}x)` : null;

  // 9. Vendas para listagem
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
      primeiraCompra,
      diasRelacionamento,
      totalAparelhos: aparelhosComprados.reduce((s, a) => s + a.quantidade, 0),
      totalServicos,
      totalServicosValor,
    },
    vendasPorMes: vendasPorMesArray,
    pagamentosPorTipo,
    aparelhosComprados,
    servicosRealizados,
    vendas: vendasList,
    creditos,
    vendedorPreferidoNome,
    lojaPreferidaNome,
    produtoFavorito,
  };
}
