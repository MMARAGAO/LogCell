import { supabase } from "@/lib/supabaseClient";

export interface KpisAparelhos {
  vendasHoje: number;
  recebimentosHoje: number;
  aReceber: number;
  vendasMes: number;
  disponiveis: number;
  valorVendidoMes: number;
  ticketMedioMes: number;
  lucroEstimadoMes: number;
}

export class AparelhosDashboardService {
  static async getKpis(params: { loja_id?: number; data?: Date } = {}): Promise<KpisAparelhos> {
    const hoje = params.data ? new Date(params.data) : new Date();
    const inicioHoje = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
    const fimHoje = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate(), 23, 59, 59);

    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0, 23, 59, 59);

    let vendasHoje = 0;
    let recebimentosHoje = 0;
    let aReceber = 0;
    let vendasMes = 0;
    let disponiveis = 0;
    let valorVendidoMes = 0;
    let ticketMedioMes = 0;
    let lucroEstimadoMes = 0;

    // Vendas de aparelhos hoje (baseado em aparelhos.status='vendido' e data_venda)
    {
      let query = supabase
        .from("aparelhos")
        .select("id, data_venda, loja_id")
        .eq("status", "vendido")
        .gte("data_venda", inicioHoje.toISOString())
        .lte("data_venda", fimHoje.toISOString());

      if (params.loja_id) query = query.eq("loja_id", params.loja_id);

      const { data } = await query;
      vendasHoje = (data || []).length;
    }

    // Recebimentos hoje (pagamentos vinculados a vendas que têm aparelhos)
    {
      let query = supabase
        .from("pagamentos_venda")
        .select("valor, venda_id, venda:vendas!pagamentos_venda_venda_id_fkey(loja_id)")
        .gte("data_pagamento", inicioHoje.toISOString())
        .lte("data_pagamento", fimHoje.toISOString());

      if (params.loja_id) query = query.eq("venda.loja_id", params.loja_id);

      const { data } = await query;
      const vendaIds = Array.from(new Set((data || []).map((p: any) => p.venda_id)));

      let relacionados = 0;
      if (vendaIds.length > 0) {
        const { data: aparelhos } = await supabase
          .from("aparelhos")
          .select("venda_id")
          .in("venda_id", vendaIds);
        const setVendasAparelhos = new Set((aparelhos || []).map((a: any) => a.venda_id));
        (data || []).forEach((p: any) => {
          if (setVendasAparelhos.has(p.venda_id)) relacionados += Number(p.valor || 0);
        });
      }
      recebimentosHoje = relacionados;
    }

    // A receber (saldo_devedor) em vendas que possuem aparelhos
    {
      let queryVendas = supabase
        .from("vendas")
        .select("id, saldo_devedor, loja_id")
        .gt("saldo_devedor", 0);

      if (params.loja_id) queryVendas = queryVendas.eq("loja_id", params.loja_id);

      const { data: vendas } = await queryVendas;
      const vendaIds = (vendas || []).map((v) => v.id);
      if (vendaIds.length > 0) {
        const { data: aparelhos } = await supabase
          .from("aparelhos")
          .select("venda_id")
          .in("venda_id", vendaIds);
        const setVendasAparelhos = new Set((aparelhos || []).map((a: any) => a.venda_id));
        aReceber = (vendas || []).reduce((sum, v: any) => {
          if (setVendasAparelhos.has(v.id)) return sum + Number(v.saldo_devedor || 0);
          return sum;
        }, 0);
      }
    }

    // Vendas no mês (quantidade) + valores e lucro estimado (valor_venda - valor_compra)
    {
      const pageSize = 1000;
      let from = 0;
      let to = pageSize - 1;
      let totalQtd = 0;
      let totalValor = 0;
      let totalLucro = 0;

      while (true) {
        let query = supabase
          .from("aparelhos")
          .select("id, valor_venda, valor_compra, loja_id")
          .eq("status", "vendido")
          .gte("data_venda", inicioMes.toISOString())
          .lte("data_venda", fimMes.toISOString())
          .range(from, to);

        if (params.loja_id) query = query.eq("loja_id", params.loja_id);

        const { data } = await query;
        const batch = data || [];
        totalQtd += batch.length;
        batch.forEach((a: any) => {
          const vv = Number(a.valor_venda || 0);
          const vc = Number(a.valor_compra || 0);
          totalValor += vv;
          totalLucro += vv - vc;
        });

        if (batch.length < pageSize) break;
        from += pageSize;
        to += pageSize;
      }

      vendasMes = totalQtd;
      valorVendidoMes = totalValor;
      ticketMedioMes = totalQtd > 0 ? totalValor / totalQtd : 0;
      lucroEstimadoMes = totalLucro;
    }

    // Aparelhos disponíveis no estoque
    {
      const pageSize = 1000;
      let from = 0;
      let to = pageSize - 1;
      let totalDisp = 0;

      while (true) {
        let query = supabase
          .from("aparelhos")
          .select("id, loja_id")
          .eq("status", "disponivel")
          .range(from, to);

        if (params.loja_id) query = query.eq("loja_id", params.loja_id);

        const { data } = await query;
        const batch = data || [];
        totalDisp += batch.length;
        if (batch.length < pageSize) break;
        from += pageSize;
        to += pageSize;
      }

      disponiveis = totalDisp;
    }

    return { vendasHoje, recebimentosHoje, aReceber, vendasMes, disponiveis, valorVendidoMes, ticketMedioMes, lucroEstimadoMes };
  }

  static async getUltimasVendasAparelhos(loja_id?: number, limit: number = 10) {
    let query = supabase
      .from("aparelhos")
      .select("id, marca, modelo, valor_venda, data_venda, venda_id, loja_id")
      .eq("status", "vendido")
      .order("data_venda", { ascending: false })
      .limit(limit);

    if (loja_id) query = query.eq("loja_id", loja_id);

    const { data } = await query;
    return data || [];
  }

  static async getRecebimentosPendentes(loja_id?: number, limit: number = 10) {
    // Vendas com saldo_devedor > 0 que estão relacionadas com aparelhos
    let queryVendas = supabase
      .from("vendas")
      .select("id, numero_venda, cliente_id, valor_total, valor_pago, saldo_devedor, loja_id")
      .gt("saldo_devedor", 0)
      .order("criado_em", { ascending: false })
      .limit(200);

    if (loja_id) queryVendas = queryVendas.eq("loja_id", loja_id);

    const { data: vendas } = await queryVendas;
    const vendaIds = (vendas || []).map((v) => v.id);

    if (vendaIds.length === 0) return [];

    const { data: aparelhos } = await supabase
      .from("aparelhos")
      .select("venda_id")
      .in("venda_id", vendaIds);

    const setVendasAparelhos = new Set((aparelhos || []).map((a: any) => a.venda_id));

    const pendentes = (vendas || [])
      .filter((v: any) => setVendasAparelhos.has(v.id))
      .slice(0, limit);

    return pendentes;
  }
}
