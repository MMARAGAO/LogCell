import type {
  DashboardAparelhosDados,
  DashboardAparelhosFiltro,
  LinhaCliente,
  LinhaProduto,
  LinhaRanking,
} from "@/types/dashboardAparelhos";

import { supabase } from "@/lib/supabaseClient";
import { BrindesAparelhosService } from "@/services/brindesAparelhosService";

interface AparelhoVendaRow {
  id: string;
  marca: string | null;
  modelo: string | null;
  valor_venda: number | null;
  valor_compra: number | null;
  venda_id: string | null;
  loja_id: number;
}

interface VendaRow {
  id: string;
  vendedor_id: string | null;
  cliente_id: string | null;
  vendedor?:
    | { id: string; nome: string }
    | { id: string; nome: string }[]
    | null;
  cliente?:
    | { id: string; nome: string }
    | { id: string; nome: string }[]
    | null;
}

export class DashboardAparelhosService {
  static async buscarDados(
    filtro: DashboardAparelhosFiltro,
  ): Promise<DashboardAparelhosDados> {
    const inicioISO = `${filtro.data_inicio}T00:00:00`;
    const fimISO = `${filtro.data_fim}T23:59:59`;

    const aparelhos = await this.buscarAparelhosVendidos(
      inicioISO,
      fimISO,
      filtro.loja_id,
    );

    const vendaIds = Array.from(
      new Set(aparelhos.map((ap) => ap.venda_id).filter(Boolean)),
    ) as string[];

    const vendas = await this.buscarVendas(vendaIds);
    const vendaMap = new Map(vendas.map((v) => [v.id, v]));

    let totalVendas = 0;
    let lucroTotal = 0;
    let custoTotalAparelhos = 0;

    const vendedorMap = new Map<string, LinhaRanking>();
    const clienteMap = new Map<string, LinhaCliente>();
    const produtoMap = new Map<string, LinhaProduto>();

    aparelhos.forEach((aparelho) => {
      const valorVenda = Number(aparelho.valor_venda || 0);
      const valorCompra = Number(aparelho.valor_compra || 0);
      const lucro = valorVenda - valorCompra;

      totalVendas += valorVenda;
      lucroTotal += lucro;
      custoTotalAparelhos += valorCompra;

      const venda = aparelho.venda_id ? vendaMap.get(aparelho.venda_id) : null;

      if (venda?.vendedor_id) {
        const vendedor = Array.isArray(venda.vendedor)
          ? venda.vendedor[0]
          : venda.vendedor;
        const nome = vendedor?.nome || "Vendedor";
        const atual = vendedorMap.get(venda.vendedor_id) || {
          id: venda.vendedor_id,
          nome,
          quantidade: 0,
          total_vendas: 0,
          lucro: 0,
          margem: 0,
        };

        atual.quantidade += 1;
        atual.total_vendas += valorVenda;
        atual.lucro += lucro;
        atual.margem =
          atual.total_vendas > 0 ? atual.lucro / atual.total_vendas : 0;
        vendedorMap.set(venda.vendedor_id, atual);
      }

      if (venda?.cliente_id) {
        const cliente = Array.isArray(venda.cliente)
          ? venda.cliente[0]
          : venda.cliente;
        const nome = cliente?.nome || "Cliente";
        const atual = clienteMap.get(venda.cliente_id) || {
          id: venda.cliente_id,
          nome,
          quantidade: 0,
          total_vendas: 0,
        };

        atual.quantidade += 1;
        atual.total_vendas += valorVenda;
        clienteMap.set(venda.cliente_id, atual);
      }

      const nomeProduto =
        `${aparelho.marca || ""} ${aparelho.modelo || ""}`.trim() || "Aparelho";
      const atualProduto = produtoMap.get(nomeProduto) || {
        nome: nomeProduto,
        quantidade: 0,
        total_vendas: 0,
        lucro: 0,
      };

      atualProduto.quantidade += 1;
      atualProduto.total_vendas += valorVenda;
      atualProduto.lucro += lucro;
      produtoMap.set(nomeProduto, atualProduto);
    });

    const vendasPorVendedor = Array.from(vendedorMap.values()).sort(
      (a, b) => b.total_vendas - a.total_vendas,
    );

    const topVendedores = vendasPorVendedor.slice(0, 5);
    const topClientes = Array.from(clienteMap.values())
      .sort((a, b) => b.total_vendas - a.total_vendas)
      .slice(0, 5);
    const topProdutos = Array.from(produtoMap.values())
      .sort((a, b) => b.total_vendas - a.total_vendas)
      .slice(0, 5);

    const custoBrindes = await BrindesAparelhosService.somarBrindesPeriodo({
      dataInicio: filtro.data_inicio,
      dataFim: filtro.data_fim,
      lojaId: filtro.loja_id,
    });

    return {
      total_vendas: totalVendas,
      lucro_total: lucroTotal,
      custo_total_aparelhos: custoTotalAparelhos,
      custo_total_brindes: custoBrindes,
      vendas_por_vendedor: vendasPorVendedor,
      top_vendedores: topVendedores,
      top_clientes: topClientes,
      top_produtos: topProdutos,
    };
  }

  private static async buscarAparelhosVendidos(
    inicioISO: string,
    fimISO: string,
    lojaId?: number,
  ): Promise<AparelhoVendaRow[]> {
    const pageSize = 1000;
    let from = 0;
    let to = pageSize - 1;
    const resultado: AparelhoVendaRow[] = [];

    while (true) {
      let query = supabase
        .from("aparelhos")
        .select(
          "id, marca, modelo, valor_venda, valor_compra, venda_id, loja_id, data_venda",
        )
        .eq("status", "vendido")
        .gte("data_venda", inicioISO)
        .lte("data_venda", fimISO)
        .range(from, to);

      if (lojaId) query = query.eq("loja_id", lojaId);

      const { data, error } = await query;

      if (error) throw error;

      const batch = (data || []) as AparelhoVendaRow[];

      resultado.push(...batch);

      if (batch.length < pageSize) break;
      from += pageSize;
      to += pageSize;
    }

    return resultado;
  }

  private static async buscarVendas(vendaIds: string[]): Promise<VendaRow[]> {
    if (!vendaIds.length) return [];

    const resultado: VendaRow[] = [];
    const batchSize = 50;

    for (let i = 0; i < vendaIds.length; i += batchSize) {
      const batch = vendaIds.slice(i, i + batchSize);
      const { data, error } = await supabase
        .from("vendas")
        .select(
          "id, vendedor_id, cliente_id, vendedor:usuarios!vendas_vendedor_id_fkey(id, nome), cliente:clientes(id, nome)",
        )
        .in("id", batch);

      if (error) throw error;
      resultado.push(...((data || []) as unknown as VendaRow[]));
    }

    return resultado;
  }
}
