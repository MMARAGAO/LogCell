import type {
  DadosDashboard,
  DesempenhoTecnico,
  FiltroDashboard,
  MetricasProdutos,
  MetricasAcessorios,
  MetricasAparelhos,
  ResumoCaixa,
} from "@/types/dashboard";

import { supabase } from "@/lib/supabaseClient";

export class DashboardService {
  private static cacheProdutosVendidos: {
    filtro: string;
    dados: Array<{
      produto_id: string;
      descricao: string;
      quantidade: number;
      valor_vendido: number;
      custo_total: number;
      origem: string;
    }>;
  } | null = null;

  private static async getProdutosVendidosCached(
    filtro: FiltroDashboard,
  ): Promise<
    Array<{
      produto_id: string;
      descricao: string;
      quantidade: number;
      valor_vendido: number;
      custo_total: number;
      origem: string;
    }>
  > {
    const chave = JSON.stringify(filtro);

    if (
      this.cacheProdutosVendidos &&
      this.cacheProdutosVendidos.filtro === chave
    ) {
      return this.cacheProdutosVendidos.dados;
    }

    const dados = await this.buscarProdutosVendidosRPC(filtro);

    this.cacheProdutosVendidos = { filtro: chave, dados };

    return dados;
  }

  private static normalizarTexto(texto?: string | null): string {
    return (texto || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  }

  private static async buscarVendaIdsComPagamentosNoPeriodo(
    filtro: FiltroDashboard,
  ): Promise<string[]> {
    const { data_inicio, data_fim, loja_id } = filtro;
    const inicioISO = `${data_inicio}T00:00:00`;
    const fimISO = `${data_fim}T23:59:59`;
    const vendaIds = new Set<string>();

    let query = supabase
      .from("pagamentos_venda")
      .select(
        "venda_id, venda:vendas!pagamentos_venda_venda_id_fkey(loja_id, status)",
      )
      .gte("data_pagamento", inicioISO)
      .lte("data_pagamento", fimISO)
      .neq("tipo_pagamento", "credito_cliente")
      .neq("venda.status", "cancelada")
      .neq("venda.status", "devolvida");

    if (loja_id) {
      query = query.eq("venda.loja_id", loja_id);
    }

    query = query.limit(2000);

    const { data, error } = await query;

    if (error) {
      console.error("Erro ao buscar vendas com pagamentos no período:", error);

      return [];
    }

    const batch = (data || []).filter((pag: any) => {
      if (!loja_id) return true;

      return pag.venda?.loja_id === loja_id;
    });

    batch.forEach((pagamento: any) => {
      if (pagamento.venda_id) {
        vendaIds.add(String(pagamento.venda_id));
      }
    });

    return Array.from(vendaIds);
  }

  private static async listarProdutosVendidosAgrupados(
    filtro: FiltroDashboard,
  ): Promise<
    Array<{
      produto_id: string;
      descricao: string;
      quantidade: number;
      receita: number;
      valor_vendido: number;
      valor_recebido: number;
      lucro: number;
      origem: string;
    }>
  > {
    const { data_inicio, data_fim, loja_id } = filtro;
    const inicioISO = `${data_inicio}T00:00:00`;
    const fimISO = `${data_fim}T23:59:59`;
    const agrupado: Record<
      string,
      {
        produto_id: string;
        descricao: string;
        quantidade: number;
        receita: number;
        valor_vendido: number;
        valor_recebido: number;
        lucro: number;
        origens: Set<string>;
      }
    > = {};
    let queryItensVenda = supabase
      .from("itens_venda")
      .select(
        "produto_id, quantidade, devolvido, subtotal, criado_em, produto:produtos!itens_venda_produto_id_fkey(descricao, preco_compra), venda:vendas!inner(loja_id, status, valor_total, valor_pago)",
      )
      .gte("criado_em", inicioISO)
      .lte("criado_em", fimISO)
      .neq("venda.status", "cancelada")
      .neq("venda.status", "devolvida")
      .limit(2000);

    if (loja_id) {
      queryItensVenda = queryItensVenda.eq("venda.loja_id", loja_id);
    }

    const { data, error } = await queryItensVenda;

    if (error) {
      console.error("Erro na query de produtos vendidos por venda:", error);
      throw error;
    }

    const batch = (data || []).filter((item: any) => {
      if (!loja_id) return true;

      return item.venda?.loja_id === loja_id;
    });

    batch.forEach((item: any) => {
      const produtoId = item.produto_id;

      if (!produtoId) {
        return;
      }

      if (!agrupado[produtoId]) {
        agrupado[produtoId] = {
          produto_id: String(produtoId),
          descricao: (item.produto as any)?.descricao || "Produto desconhecido",
          quantidade: 0,
          receita: 0,
          valor_vendido: 0,
          valor_recebido: 0,
          lucro: 0,
          origens: new Set<string>(),
        };
      }

      const quantidadeOriginal = Number(item.quantidade || 0);
      const quantidadeVendida =
        quantidadeOriginal - Number(item.devolvido || 0);
      const fatorItem =
        quantidadeOriginal > 0
          ? Math.max(0, quantidadeVendida) / quantidadeOriginal
          : 0;
      const valorVendidoItem = Number(item.subtotal || 0) * fatorItem;
      const valorTotalVenda = Number(item.venda?.valor_total || 0);
      const valorPagoVenda = Number(item.venda?.valor_pago || 0);
      const percentualRecebido =
        valorTotalVenda > 0
          ? Math.max(0, Math.min(valorPagoVenda / valorTotalVenda, 1))
          : 0;
      const valorRecebidoItem = valorVendidoItem * percentualRecebido;
      const custoUnitario = Number(item.produto?.preco_compra || 0);
      const custoTotalItem = custoUnitario * Math.max(0, quantidadeVendida);

      agrupado[produtoId].quantidade += Math.max(0, quantidadeVendida);
      agrupado[produtoId].receita += valorVendidoItem;
      agrupado[produtoId].valor_vendido += valorVendidoItem;
      agrupado[produtoId].valor_recebido += valorRecebidoItem;
      agrupado[produtoId].lucro += valorRecebidoItem - custoTotalItem;
      agrupado[produtoId].origens.add("Venda");
    });

    let queryPecasOS = supabase
      .from("ordem_servico_pecas")
      .select(
        "id_produto, descricao_peca, quantidade, valor_custo, valor_total, criado_em, produto:produtos!ordem_servico_pecas_id_produto_fkey(descricao, preco_compra), os:ordem_servico!inner(id_loja, status, valor_orcamento, valor_pago)",
      )
      .gte("criado_em", inicioISO)
      .lte("criado_em", fimISO)
      .neq("os.status", "cancelado")
      .limit(2000);

    if (loja_id) {
      queryPecasOS = queryPecasOS.eq("os.id_loja", loja_id);
    }

    const { data: dataPecas, error: errorPecas } = await queryPecasOS;

    if (errorPecas) {
      console.error("Erro na query de produtos vendidos por OS:", errorPecas);
      throw errorPecas;
    }

    const batchPecas = (dataPecas || []).filter((peca: any) => {
      if (!loja_id) return true;

      return peca.os?.id_loja === loja_id;
    });

    batchPecas.forEach((peca: any) => {
      const produtoId =
        peca.id_produto != null
          ? String(peca.id_produto)
          : `os-avulso:${peca.descricao_peca || "sem-descricao"}`;

      if (!agrupado[produtoId]) {
        agrupado[produtoId] = {
          produto_id: produtoId,
          descricao:
            peca.produto?.descricao ||
            peca.descricao_peca ||
            "Produto desconhecido",
          quantidade: 0,
          receita: 0,
          valor_vendido: 0,
          valor_recebido: 0,
          lucro: 0,
          origens: new Set<string>(),
        };
      }

      const quantidadePeca = Number(peca.quantidade || 0);
      const valorVendidoPeca = Number(peca.valor_total || 0);
      const valorBaseOS = Number(
        peca.os?.valor_orcamento || valorVendidoPeca || 0,
      );
      const valorPagoOS = Number(peca.os?.valor_pago || 0);
      const percentualRecebidoOS =
        valorBaseOS > 0
          ? Math.max(0, Math.min(valorPagoOS / valorBaseOS, 1))
          : 0;
      const valorRecebidoPeca = valorVendidoPeca * percentualRecebidoOS;
      const custoUnitarioPeca =
        peca.id_produto != null
          ? Number(peca.produto?.preco_compra || 0)
          : quantidadePeca > 0
            ? Number(peca.valor_custo || 0) / quantidadePeca
            : 0;
      const custoTotalPeca =
        peca.id_produto != null
          ? custoUnitarioPeca * quantidadePeca
          : Number(peca.valor_custo || 0);

      agrupado[produtoId].quantidade += quantidadePeca;
      agrupado[produtoId].receita += valorVendidoPeca;
      agrupado[produtoId].valor_vendido += valorVendidoPeca;
      agrupado[produtoId].valor_recebido += valorRecebidoPeca;
      agrupado[produtoId].lucro += valorRecebidoPeca - custoTotalPeca;
      agrupado[produtoId].origens.add("OS");
    });

    return Object.values(agrupado)
      .map(({ origens, ...produto }) => ({
        ...produto,
        receita: Math.round(produto.receita * 100) / 100,
        valor_vendido: Math.round(produto.valor_vendido * 100) / 100,
        valor_recebido: Math.round(produto.valor_recebido * 100) / 100,
        lucro: Math.round(produto.lucro * 100) / 100,
        origem: Array.from(origens).sort().join(" + "),
      }))
      .sort((a, b) => b.quantidade - a.quantidade);
  }

  static async buscarContasNaoPagasAcumuladas(
    data_inicio?: string,
    data_fim?: string,
    loja_id?: number,
  ): Promise<number> {
    try {
      const { data, error } = await supabase.rpc(
        "calcular_total_contas_nao_pagas",
        {
          p_data_inicio: data_inicio
            ? `${data_inicio}T00:00:00`
            : "2000-01-01T00:00:00",
          p_data_fim: data_fim
            ? `${data_fim}T23:59:59`
            : new Date().toISOString().split("T")[0] + "T23:59:59",
          p_loja_id: loja_id || null,
        },
      );

      if (error) {
        console.error(
          "❌ [DASHBOARD] Erro ao buscar contas não pagas acumuladas:",
          error,
        );

        return 0;
      }

      return Number(data || 0);
    } catch (error) {
      console.error(
        "❌ [DASHBOARD] Erro crítico ao buscar contas não pagas acumuladas:",
        error,
      );

      return 0;
    }
  }

  static async buscarMetricasProdutos(
    filtro: FiltroDashboard,
  ): Promise<MetricasProdutos> {
    try {
      const { data, error } = await supabase.rpc("calcular_metricas_produtos", {
        p_data_inicio: `${filtro.data_inicio}T00:00:00`,
        p_data_fim: `${filtro.data_fim}T23:59:59`,
        p_loja_id: filtro.loja_id || null,
      });

      if (error) throw error;

      const row = Array.isArray(data) ? data[0] : data;

      return {
        total_vendas: Number(row?.total_vendas || 0),
        pagamentos: Number(row?.pagamentos || 0),
        lucro: Number(row?.lucro || 0),
        ticket_medio: Number(row?.ticket_medio || 0),
        contas_nao_pagas: Number(row?.contas_nao_pagas || 0),
      };
    } catch (error) {
      console.error(
        "❌ [DASHBOARD] Erro ao buscar métricas de produtos:",
        error,
      );

      return {
        total_vendas: 0,
        pagamentos: 0,
        lucro: 0,
        ticket_medio: 0,
        contas_nao_pagas: 0,
      };
    }
  }

  static async buscarMetricasAcessorios(
    filtro: FiltroDashboard,
  ): Promise<MetricasAcessorios> {
    try {
      const { data, error } = await supabase.rpc(
        "calcular_metricas_acessorios",
        {
          p_data_inicio: `${filtro.data_inicio}T00:00:00`,
          p_data_fim: `${filtro.data_fim}T23:59:59`,
          p_loja_id: filtro.loja_id || null,
        },
      );

      if (error) throw error;

      const row = Array.isArray(data) ? data[0] : data;

      return {
        total_vendas: Number(row?.total_vendas || 0),
        pagamentos: Number(row?.pagamentos || 0),
        lucro: Number(row?.lucro || 0),
        ticket_medio: Number(row?.ticket_medio || 0),
      };
    } catch (error) {
      console.error(
        "❌ [DASHBOARD] Erro ao buscar métricas de acessórios:",
        error,
      );

      return {
        total_vendas: 0,
        pagamentos: 0,
        lucro: 0,
        ticket_medio: 0,
      };
    }
  }

  static async buscarMetricasAparelhos(
    filtro: FiltroDashboard,
  ): Promise<MetricasAparelhos> {
    try {
      const { data, error } = await supabase.rpc(
        "calcular_metricas_aparelhos",
        {
          p_data_inicio: `${filtro.data_inicio}T00:00:00`,
          p_data_fim: `${filtro.data_fim}T23:59:59`,
          p_loja_id: filtro.loja_id || null,
        },
      );

      if (error) throw error;

      const row = Array.isArray(data) ? data[0] : data;

      return {
        quantidade: Number(row?.quantidade || 0),
        pagamentos: Number(row?.pagamentos || 0),
        lucro: Number(row?.lucro || 0),
        ticket_medio: Number(row?.ticket_medio || 0),
      };
    } catch (error) {
      console.error(
        "❌ [DASHBOARD] Erro ao buscar métricas de aparelhos:",
        error,
      );

      return {
        quantidade: 0,
        pagamentos: 0,
        lucro: 0,
        ticket_medio: 0,
      };
    }
  }

  static async buscarResumoCaixa(
    filtro: FiltroDashboard,
  ): Promise<ResumoCaixa> {
    try {
      const { data, error } = await supabase.rpc("calcular_resumo_caixa", {
        p_data_inicio: `${filtro.data_inicio}T00:00:00`,
        p_data_fim: `${filtro.data_fim}T23:59:59`,
        p_loja_id: filtro.loja_id || null,
      });

      if (error) throw error;

      const row = Array.isArray(data) ? data[0] : data;

      return {
        total_vendas: Number(row?.total_vendas || 0),
        total_os: Number(row?.total_os || 0),
        total_entradas: Number(row?.total_entradas || 0),
        total_devolucoes: Number(row?.total_devolucoes || 0),
        total_sangrias: Number(row?.total_sangrias || 0),
        total_saidas: Number(row?.total_saidas || 0),
        saldo_final: Number(row?.saldo_final || 0),
      };
    } catch (error) {
      console.error("❌ [DASHBOARD] Erro ao buscar resumo caixa:", error);

      return {
        total_vendas: 0,
        total_os: 0,
        total_entradas: 0,
        total_devolucoes: 0,
        total_sangrias: 0,
        total_saidas: 0,
        saldo_final: 0,
      };
    }
  }

  private static async buscarComposicaoVendasRPC(
    filtro: FiltroDashboard,
  ): Promise<{
    total: number;
    produtos: number;
    acessorios: number;
    aparelhos: number;
    lucro_produtos: number;
    lucro_acessorios: number;
    lucro_aparelhos: number;
    lucro_total: number;
  }> {
    try {
      const { data, error } = await supabase.rpc("calcular_composicao_vendas", {
        p_data_inicio: `${filtro.data_inicio}T00:00:00`,
        p_data_fim: `${filtro.data_fim}T23:59:59`,
        p_loja_id: filtro.loja_id || null,
      });

      if (error) throw error;

      const row = Array.isArray(data) ? data[0] : data;

      return {
        total: Number(row?.total || 0),
        produtos: Number(row?.produtos || 0),
        acessorios: Number(row?.acessorios || 0),
        aparelhos: Number(row?.aparelhos || 0),
        lucro_produtos: Number(row?.lucro_produtos || 0),
        lucro_acessorios: Number(row?.lucro_acessorios || 0),
        lucro_aparelhos: Number(row?.lucro_aparelhos || 0),
        lucro_total: Number(row?.lucro_total || 0),
      };
    } catch (error) {
      console.error("❌ [DASHBOARD] Erro ao buscar composição via RPC:", error);

      return this.calcularComposicaoVendas(filtro);
    }
  }

  private static async buscarComposicaoOSRPC(
    inicioISO: string,
    fimISO: string,
    loja_id?: number,
  ): Promise<{
    total_os: number;
    os_pendentes: number;
    os_entregues: number;
    os_pagas_nao_entregues: number;
    os_processadas: number;
    faturamento_os_processadas: number;
    ganho_os_processadas: number;
    por_tipo: Array<{
      tipo_cliente: string;
      quantidade: number;
      faturamento: number;
      lucro: number;
    }>;
  }> {
    try {
      const jsonData = await supabase.rpc("calcular_composicao_os", {
        p_data_inicio: inicioISO.split("T")[0],
        p_data_fim: fimISO.split("T")[0],
        p_loja_id: loja_id || null,
      });

      if (jsonData.error) throw jsonData.error;

      const row = Array.isArray(jsonData.data)
        ? jsonData.data[0]
        : jsonData.data;

      return {
        total_os: Number(row?.total_os || 0),
        os_pendentes: Number(row?.os_pendentes || 0),
        os_entregues: Number(row?.os_entregues || 0),
        os_pagas_nao_entregues: Number(row?.os_pagas_nao_entregues || 0),
        os_processadas: Number(row?.os_processadas || 0),
        faturamento_os_processadas: Number(row?.faturamento_processadas || 0),
        ganho_os_processadas: Number(row?.ganho_processadas || 0),
        por_tipo: (row?.por_tipo_json || []) as Array<{
          tipo_cliente: string;
          quantidade: number;
          faturamento: number;
          lucro: number;
        }>,
      };
    } catch (error) {
      console.error("❌ [DASHBOARD] Erro ao buscar OS via RPC:", error);

      return this.calcularMetricasOSProcessadasCorrigidas(
        inicioISO,
        fimISO,
        loja_id,
      );
    }
  }

  private static async buscarProdutosVendidosRPC(
    filtro: FiltroDashboard,
  ): Promise<
    Array<{
      produto_id: string;
      descricao: string;
      quantidade: number;
      valor_vendido: number;
      custo_total: number;
      origem: string;
    }>
  > {
    try {
      const { data, error } = await supabase.rpc("listar_produtos_vendidos", {
        p_data_inicio: `${filtro.data_inicio}T00:00:00`,
        p_data_fim: `${filtro.data_fim}T23:59:59`,
        p_loja_id: filtro.loja_id || null,
      });

      if (error) throw error;

      const row = Array.isArray(data) ? data[0] : data;
      const lista: Array<{
        produto_id: string;
        descricao: string;
        quantidade: number;
        valor_vendido: number;
        custo_total: number;
        origem: string;
      }> = row?.dados || [];

      return lista.map((p) => ({
        produto_id: String(p.produto_id || ""),
        descricao: String(p.descricao || "Produto"),
        quantidade: Number(p.quantidade || 0),
        valor_vendido: Number(p.valor_vendido || 0),
        custo_total: Number(p.custo_total || 0),
        origem: String(p.origem || "Venda"),
      }));
    } catch (error) {
      console.error("❌ [DASHBOARD] Erro ao buscar produtos via RPC:", error);

      const produtos = await this.listarProdutosVendidosAgrupados(filtro);

      return produtos.map((p) => ({
        produto_id: p.produto_id,
        descricao: p.descricao,
        quantidade: p.quantidade,
        valor_vendido: p.valor_vendido,
        custo_total: p.valor_recebido - p.lucro,
        origem: p.origem,
      }));
    }
  }

  /**
   * Particiona RECEITA e LUCRO de vendas (pagamentos sem crédito de cliente,
   * por data_pagamento) entre produtos, acessórios e aparelhos.
   *
   * RECEITA: rateio exaustivo do pagamento de cada venda proporcional ao valor
   * de cada categoria → a soma fecha exatamente com o total de pagamentos.
   *
   * LUCRO (regra de negócio, mesma base temporal = data_pagamento):
   *  - Produtos  = receita − custo dos produtos (preço de compra), proporcional
   *                ao recebido (cobertura = pago / base da venda);
   *  - Acessórios= receita − custo dos acessórios, idem;
   *  - Aparelhos = receita − valor_compra − brindes − taxas de pagamento.
   *
   * Garante, por construção, que
   *   Faturamento Total = Produtos + Acessórios + Aparelhos (+ OS) e
   *   Lucro Total       = Lucro Produtos + Acessórios + Aparelhos (+ OS).
   * Paginação manual (sem o teto de 1000 linhas do PostgREST).
   */
  private static async calcularComposicaoVendas(
    filtro: FiltroDashboard,
  ): Promise<{
    total: number;
    produtos: number;
    acessorios: number;
    aparelhos: number;
    lucro_produtos: number;
    lucro_acessorios: number;
    lucro_aparelhos: number;
    lucro_total: number;
  }> {
    const { data_inicio, data_fim, loja_id } = filtro;
    const inicioISO = `${data_inicio}T00:00:00`;
    const fimISO = `${data_fim}T23:59:59`;

    // 1) Pagamentos de vendas (sem crédito de cliente) no período, paginados.
    //    Captura liquido/tipo_pagamento para calcular as taxas de cartão.
    const pagamentos: any[] = [];

    for (let from = 0; ; from += 1000) {
      let queryPag = supabase
        .from("pagamentos_venda")
        .select(
          "venda_id, valor, liquido, tipo_pagamento, venda:vendas!pagamentos_venda_venda_id_fkey(loja_id)",
        )
        .gte("data_pagamento", inicioISO)
        .lte("data_pagamento", fimISO)
        .neq("tipo_pagamento", "credito_cliente")
        .range(from, from + 999);

      if (loja_id) {
        queryPag = queryPag.eq("venda.loja_id", loja_id);
      }

      const { data: pagPagina, error: erroPag } = await queryPag;

      if (erroPag) {
        console.error(
          "❌ [DASHBOARD] Erro ao buscar pagamentos de vendas (composição):",
          erroPag,
        );
        break;
      }

      const validos = (pagPagina || []).filter(
        (p: any) => !loja_id || p.venda?.loja_id === loja_id,
      );

      pagamentos.push(...validos);

      if (!pagPagina || pagPagina.length < 1000) break;
    }

    const pagoPorVenda = new Map<string, number>();
    const taxasPorVenda = new Map<string, number>();

    pagamentos.forEach((p: any) => {
      if (!p.venda_id) return;
      pagoPorVenda.set(
        p.venda_id,
        (pagoPorVenda.get(p.venda_id) || 0) + Number(p.valor || 0),
      );
      // Taxa de cartão = valor − líquido (somente cartões)
      if (
        p.tipo_pagamento === "cartao_credito" ||
        p.tipo_pagamento === "cartao_debito"
      ) {
        const taxa = Number(p.valor || 0) - Number(p.liquido || 0);

        if (taxa > 0) {
          taxasPorVenda.set(
            p.venda_id,
            (taxasPorVenda.get(p.venda_id) || 0) + taxa,
          );
        }
      }
    });

    const vendaIds = Array.from(pagoPorVenda.keys());

    // 2) Base de cada venda: valor (receita) e custo de cada categoria
    const base = new Map<
      string,
      {
        prod: number;
        ace: number;
        apa: number;
        custoProd: number;
        custoAce: number;
        custoApa: number;
      }
    >();

    vendaIds.forEach((id) =>
      base.set(id, {
        prod: 0,
        ace: 0,
        apa: 0,
        custoProd: 0,
        custoAce: 0,
        custoApa: 0,
      }),
    );

    const batchSize = 50;

    for (let i = 0; i < vendaIds.length; i += batchSize) {
      const batchIds = vendaIds.slice(i, i + batchSize);

      const { data: itens } = await supabase
        .from("itens_venda")
        .select(
          "venda_id, subtotal, quantidade, produto:produtos!itens_venda_produto_id_fkey(is_acessorio, preco_compra)",
        )
        .in("venda_id", batchIds);

      (itens || []).forEach((it: any) => {
        const v = base.get(it.venda_id);

        if (!v) return;
        const sub = Number(it.subtotal || 0);
        const custo =
          Number(it.produto?.preco_compra || 0) * Number(it.quantidade || 0);

        if (it.produto?.is_acessorio) {
          v.ace += sub;
          v.custoAce += custo;
        } else {
          v.prod += sub;
          v.custoProd += custo;
        }
      });

      const { data: aps } = await supabase
        .from("aparelhos")
        .select("venda_id, valor_venda, valor_compra")
        .in("venda_id", batchIds)
        .eq("status", "vendido");

      (aps || []).forEach((a: any) => {
        const v = base.get(a.venda_id);

        if (!v) return;
        v.apa += Number(a.valor_venda || 0);
        v.custoApa += Number(a.valor_compra || 0);
      });

      // Brindes vinculados (custo de aparelhos)
      const { data: brindes } = await supabase
        .from("brindes_aparelhos")
        .select("venda_id, valor_custo")
        .in("venda_id", batchIds);

      (brindes || []).forEach((b: any) => {
        const v = base.get(b.venda_id);

        if (v) v.custoApa += Number(b.valor_custo || 0);
      });
    }

    // 3) Rateio exaustivo + lucro por categoria
    let produtos = 0;
    let acessorios = 0;
    let aparelhos = 0;
    let lucroProdutos = 0;
    let lucroAcessorios = 0;
    let lucroAparelhos = 0;

    vendaIds.forEach((id) => {
      const pago = pagoPorVenda.get(id) || 0;
      const v = base.get(id);

      if (!v) return;
      const totalBase = v.prod + v.ace + v.apa;

      if (totalBase <= 0) {
        // Venda sem itens/aparelho identificáveis: receita em produtos (raro)
        produtos += pago;
        lucroProdutos += pago;

        return;
      }

      // Cobertura = fração paga da venda. Receita e custo são reconhecidos
      // proporcionalmente ao recebido (mesma base data_pagamento).
      const cobertura = pago / totalBase;
      const taxa = taxasPorVenda.get(id) || 0;

      const receitaProd = v.prod * cobertura;
      const receitaAce = v.ace * cobertura;
      const receitaApa = v.apa * cobertura;

      produtos += receitaProd;
      acessorios += receitaAce;
      aparelhos += receitaApa;

      lucroProdutos += receitaProd - v.custoProd * cobertura;
      lucroAcessorios += receitaAce - v.custoAce * cobertura;
      // Aparelhos: deduz custo (compra + brindes) proporcional e a taxa de
      // cartão (já apurada sobre o pagamento recebido, não reescalonada).
      lucroAparelhos += receitaApa - v.custoApa * cobertura - taxa;
    });

    return {
      total: produtos + acessorios + aparelhos,
      produtos,
      acessorios,
      aparelhos,
      lucro_produtos: lucroProdutos,
      lucro_acessorios: lucroAcessorios,
      lucro_aparelhos: lucroAparelhos,
      lucro_total: lucroProdutos + lucroAcessorios + lucroAparelhos,
    };
  }

  private static async calcularMetricasOSProcessadasCorrigidas(
    inicioISO: string,
    fimISO: string,
    loja_id?: number,
  ): Promise<{
    total_os: number;
    os_pendentes: number;
    os_entregues: number;
    os_pagas_nao_entregues: number;
    os_processadas: number;
    faturamento_os_processadas: number;
    ganho_os_processadas: number;
    por_tipo: Array<{
      tipo_cliente: string;
      quantidade: number;
      faturamento: number;
      lucro: number;
    }>;
  }> {
    let totalOS = 0;
    let osPendentes = 0;

    // Total de OS criadas no período (contagem agregada — não sofre teto de linhas)
    let queryTotalOS = supabase
      .from("ordem_servico")
      .select("id", { count: "exact", head: true })
      .gte("criado_em", inicioISO)
      .lte("criado_em", fimISO)
      .neq("status", "cancelado");

    if (loja_id) {
      queryTotalOS = queryTotalOS.eq("id_loja", loja_id);
    }

    const { count: totalOSCount, error: erroTotalOS } = await queryTotalOS;

    if (!erroTotalOS) {
      totalOS = totalOSCount || 0;
    }

    // OS pendentes (aguardando / em_andamento)
    let queryOSPendentes = supabase
      .from("ordem_servico")
      .select("id", { count: "exact", head: true })
      .in("status", ["aguardando", "em_andamento"])
      .neq("status", "cancelado")
      .gte("criado_em", inicioISO)
      .lte("criado_em", fimISO);

    if (loja_id) {
      queryOSPendentes = queryOSPendentes.eq("id_loja", loja_id);
    }

    const { count: osPendentesCount, error: erroOSPendentes } =
      await queryOSPendentes;

    if (!erroOSPendentes) {
      osPendentes = osPendentesCount || 0;
    }

    // ===== DATASET FINANCEIRO ÚNICO =====
    // Fonte oficial: ledger ordem_servico_pagamentos, referência temporal
    // = data_pagamento. Paginação manual para não sofrer o teto de 1000 linhas
    // do PostgREST. Todos os KPIs financeiros de OS (faturamento, ganho,
    // processadas, aguardando entrega, por tipo) derivam DESTE conjunto.
    const inicioData = inicioISO.split("T")[0];
    const fimData = fimISO.split("T")[0];
    const pagamentos: any[] = [];

    for (let from = 0; ; from += 1000) {
      let queryPag = supabase
        .from("ordem_servico_pagamentos")
        .select(
          "valor, id_ordem_servico, ordem_servico!inner(status, id_loja, tipo_cliente)",
        )
        .gte("data_pagamento", inicioData)
        .lte("data_pagamento", fimData)
        .range(from, from + 999);

      if (loja_id) {
        queryPag = queryPag.eq("ordem_servico.id_loja", loja_id);
      }

      const { data: pagPagina, error: erroPag } = await queryPag;

      if (erroPag) {
        console.error(
          "❌ [DASHBOARD] Erro ao buscar ledger de pagamentos de OS:",
          erroPag,
        );
        break;
      }

      pagamentos.push(...(pagPagina || []));

      if (!pagPagina || pagPagina.length < 1000) break;
    }

    // Faturamento total = soma dos pagamentos do período
    const faturamentoOSProcessadas = pagamentos.reduce(
      (soma, p) => soma + Number(p.valor || 0),
      0,
    );

    // OS distintas pagas no período (com status e tipo de cliente)
    const statusPorOS = new Map<string, string>();
    const tipoPorOS = new Map<string, string>();

    pagamentos.forEach((p: any) => {
      if (!p.id_ordem_servico) return;
      statusPorOS.set(p.id_ordem_servico, p.ordem_servico?.status || "");
      tipoPorOS.set(
        p.id_ordem_servico,
        p.ordem_servico?.tipo_cliente || "sem_tipo",
      );
    });

    const osIds = Array.from(statusPorOS.keys());

    // Contagens (mesmo conjunto): entregues vs aguardando entrega
    let osEntregues = 0;
    let osPagasNaoEntregues = 0;

    osIds.forEach((id) => {
      if (statusPorOS.get(id) === "entregue") osEntregues += 1;
      else osPagasNaoEntregues += 1;
    });

    // Faturamento e quantidade por tipo de cliente (mesmo conjunto)
    const fatPorTipo = new Map<string, number>();
    const qtdPorTipo = new Map<string, number>();

    pagamentos.forEach((p: any) => {
      const tipo = p.ordem_servico?.tipo_cliente || "sem_tipo";

      fatPorTipo.set(tipo, (fatPorTipo.get(tipo) || 0) + Number(p.valor || 0));
    });
    osIds.forEach((id) => {
      const tipo = tipoPorOS.get(id) || "sem_tipo";

      qtdPorTipo.set(tipo, (qtdPorTipo.get(tipo) || 0) + 1);
    });

    // Custo das peças das OS pagas no período (paginado por lotes de 50)
    const batchSize = 50;
    let custoOSProcessadas = 0;
    const custoPorTipo = new Map<string, number>();

    for (let i = 0; i < osIds.length; i += batchSize) {
      const batchIds = osIds.slice(i, i + batchSize);

      const { data: pecasData, error: erroPecas } = await supabase
        .from("ordem_servico_pecas")
        .select(
          "id_ordem_servico, quantidade, produto:produtos!ordem_servico_pecas_id_produto_fkey(preco_compra)",
        )
        .in("id_ordem_servico", batchIds);

      if (erroPecas) {
        console.error(
          "❌ [DASHBOARD] Erro ao buscar custo de peças de OS:",
          erroPecas,
        );
        continue;
      }

      (pecasData || []).forEach((peca: any) => {
        const precoCompra = Number(peca.produto?.preco_compra || 0);
        const quantidade = Number(peca.quantidade || 0);
        const custo = precoCompra * quantidade;

        custoOSProcessadas += custo;
        const tipo = tipoPorOS.get(peca.id_ordem_servico) || "sem_tipo";

        custoPorTipo.set(tipo, (custoPorTipo.get(tipo) || 0) + custo);
      });
    }

    const tipos = new Set<string>([
      ...Array.from(fatPorTipo.keys()),
      ...Array.from(qtdPorTipo.keys()),
    ]);
    const por_tipo = Array.from(tipos).map((tipo) => ({
      tipo_cliente: tipo,
      quantidade: qtdPorTipo.get(tipo) || 0,
      faturamento: fatPorTipo.get(tipo) || 0,
      lucro: (fatPorTipo.get(tipo) || 0) - (custoPorTipo.get(tipo) || 0),
    }));

    return {
      total_os: totalOS,
      os_pendentes: osPendentes,
      os_entregues: osEntregues,
      os_pagas_nao_entregues: osPagasNaoEntregues,
      os_processadas: osEntregues + osPagasNaoEntregues,
      faturamento_os_processadas: faturamentoOSProcessadas,
      ganho_os_processadas: faturamentoOSProcessadas - custoOSProcessadas,
      por_tipo,
    };
  }

  static async buscarDadosDashboard(
    filtro: FiltroDashboard,
  ): Promise<DadosDashboard> {
    const { data_inicio, data_fim, loja_id } = filtro;

    const inicioISO = `${data_inicio}T00:00:00`;
    const fimISO = `${data_fim}T23:59:59`;

    try {
      const { data, error } = await supabase.rpc(
        "calcular_dashboard_completo",
        {
          p_data_inicio: inicioISO,
          p_data_fim: fimISO,
          p_loja_id: loja_id || null,
        },
      );

      if (error) throw error;

      const d = Array.isArray(data) ? data[0] : data;

      if (!d) throw new Error("RPC retornou vazio");

      const v = d.vendas || {};
      const c = d.composicao || {};
      const osD = d.os || {};
      const ad = d.adicionais || {};
      const rc = d.resumo_caixa || {};
      const porTipo = osD.por_tipo || [];
      const contasNP = d.contas_nao_pagas || 0;

      const metricasProdutos: MetricasProdutos = {
        total_vendas: Number(v.total_vendas || 0),
        pagamentos: Number(c.produtos || 0),
        lucro: Number(c.lucro_produtos || 0),
        ticket_medio: Number(v.ticket_medio || 0),
        contas_nao_pagas: Number(contasNP || 0),
      };

      const metricasAcessorios: MetricasAcessorios = {
        total_vendas: 0,
        pagamentos: Number(c.acessorios || 0),
        lucro: Number(c.lucro_acessorios || 0),
        ticket_medio: 0,
      };

      const metricasAparelhos: MetricasAparelhos = {
        quantidade: 0,
        pagamentos: Number(c.aparelhos || 0),
        lucro: Number(c.lucro_aparelhos || 0),
        ticket_medio: 0,
      };

      try {
        const metricasExtra = await this.buscarMetricasAparelhos(filtro);

        metricasAparelhos.quantidade = metricasExtra.quantidade;
        metricasAparelhos.ticket_medio = metricasExtra.ticket_medio;
      } catch {
        // mantém valores default
      }

      return {
        metricas_adicionais: {
          pagamentos_sem_credito_cliente: Number(v.pagamentos_sem_credito || 0),
          pagamentos_os_recebidos: Number(ad.pagamentos_os || 0),
          total_vendas: Number(v.total_vendas || 0),
          ganho_total_vendas: Number(c.lucro_total || 0),
          ticket_medio: Number(v.ticket_medio || 0),
          contas_nao_pagas: Number(contasNP || 0),
          total_os: Number(osD.total_os || 0),
          os_entregues: Number(osD.os_entregues || 0),
          os_pendentes: Number(osD.os_pendentes || 0),
          os_pagas_nao_entregues: Number(osD.os_pagas_nao_entregues || 0),
          os_processadas: Number(osD.os_processadas || 0),
          faturamento_os_processadas: Number(osD.faturamento || 0),
          ganho_os_processadas: Number(osD.ganho || 0),
          faturamento_os: Number(osD.faturamento || 0),
          ganho_os: Number(osD.ganho || 0),
          total_transferencias: Number(ad.total_transferencias || 0),
          transferencias_pendentes: Number(ad.transferencias_pendentes || 0),
          total_quebras: Number(ad.total_quebras || 0),
          quantidade_quebras: Number(ad.quantidade_quebras || 0),
          total_creditos_cliente: Number(ad.total_creditos_cliente || 0),
          os_lojista_pagas: Number(
            porTipo.find((p: any) => p.tipo_cliente === "lojista")
              ?.quantidade || 0,
          ),
          os_lojista_faturamento: Number(
            porTipo.find((p: any) => p.tipo_cliente === "lojista")
              ?.faturamento || 0,
          ),
          os_lojista_lucro: Number(
            porTipo.find((p: any) => p.tipo_cliente === "lojista")?.lucro || 0,
          ),
          os_consumidor_final_pagas: Number(
            porTipo.find((p: any) => p.tipo_cliente === "consumidor_final")
              ?.quantidade || 0,
          ),
          os_consumidor_final_faturamento: Number(
            porTipo.find((p: any) => p.tipo_cliente === "consumidor_final")
              ?.faturamento || 0,
          ),
          os_consumidor_final_lucro: Number(
            porTipo.find((p: any) => p.tipo_cliente === "consumidor_final")
              ?.lucro || 0,
          ),
          os_sem_tipo_pagas: Number(
            porTipo.find((p: any) => p.tipo_cliente === "sem_tipo")
              ?.quantidade || 0,
          ),
          os_sem_tipo_faturamento: Number(
            porTipo.find((p: any) => p.tipo_cliente === "sem_tipo")
              ?.faturamento || 0,
          ),
          os_sem_tipo_lucro: Number(
            porTipo.find((p: any) => p.tipo_cliente === "sem_tipo")?.lucro || 0,
          ),
          devolucoes_com_credito_quantidade: Number(
            ad.devolucoes_com_credito_quantidade || 0,
          ),
          devolucoes_com_credito_total: Number(ad.devolucoes_com_credito || 0),
          devolucoes_sem_credito_quantidade: Number(
            ad.devolucoes_sem_credito_quantidade || 0,
          ),
          devolucoes_sem_credito_total: Number(ad.devolucoes_sem_credito || 0),
        },
        metricas_produtos: metricasProdutos,
        metricas_acessorios: metricasAcessorios,
        metricas_aparelhos: metricasAparelhos,
        resumo_caixa: {
          total_vendas: Number(rc.total_vendas || 0),
          total_os: Number(rc.total_os || 0),
          total_entradas: Number(rc.total_entradas || 0),
          total_devolucoes: Number(rc.total_devolucoes || 0),
          total_sangrias: Number(rc.total_sangrias || 0),
          total_saidas: Number(rc.total_saidas || 0),
          saldo_final: Number(rc.saldo_final || 0),
        },
      };
    } catch (error) {
      console.error("❌ [DASHBOARD] Erro crítico ao buscar dados:", error);
      console.log("⚠️ [DASHBOARD] Tentando fallback com queries antigas...");

      return this.buscarDadosDashboardLegacy(filtro);
    }
  }

  // Método legacy como fallback
  static async buscarDadosDashboardLegacy(
    filtro: FiltroDashboard,
  ): Promise<DadosDashboard> {
    const { data_inicio, data_fim, loja_id } = filtro;

    // Garantir período com hora para não perder movimentações no final do dia
    const inicioISO = `${data_inicio}T00:00:00`;
    const fimISO = `${data_fim}T23:59:59`;

    // Buscar total de pagamentos de vendas
    let pagamentosSemCredito = 0;

    let query = supabase
      .from("pagamentos_venda")
      .select(
        "valor, tipo_pagamento, venda:vendas!pagamentos_venda_venda_id_fkey(loja_id)",
      )
      .gte("data_pagamento", inicioISO)
      .lte("data_pagamento", fimISO)
      .neq("tipo_pagamento", "credito_cliente")
      .limit(2000);

    if (loja_id) {
      query = query.eq("venda.loja_id", loja_id);
    }

    const { data, error } = await query;

    if (error) {
      console.error("❌ [DASHBOARD] Erro ao buscar pagamentos:", error);
    } else {
      const batch = data || [];

      batch.forEach((p: any) => {
        // Salvaguarda adicional de loja
        if (loja_id && p.venda?.loja_id !== loja_id) return;
        pagamentosSemCredito += Number(p.valor || 0);
      });
    }

    // Buscar quantidade total de vendas
    let queryVendas = supabase
      .from("vendas")
      .select("id", { count: "exact", head: true })
      .gte("criado_em", inicioISO)
      .lte("criado_em", fimISO)
      .not("status", "in", '("cancelada","devolvida")');

    if (loja_id) {
      queryVendas = queryVendas.eq("loja_id", loja_id);
    }

    const { count, error: erroVendas } = await queryVendas;

    if (erroVendas) {
      console.error("❌ [DASHBOARD] Erro ao buscar vendas:", erroVendas);
    }

    // Buscar custo dos produtos vendidos baseado nos pagamentos recebidos
    // Precisamos pegar as vendas que tiveram pagamentos no período
    let custoTotalVendas = 0;
    const vendasProcessadas = new Set<string>();

    let queryPagamentosVendas = supabase
      .from("pagamentos_venda")
      .select("venda_id, venda:vendas!pagamentos_venda_venda_id_fkey(loja_id)")
      .gte("data_pagamento", inicioISO)
      .lte("data_pagamento", fimISO)
      .neq("tipo_pagamento", "credito_cliente")
      .limit(2000);

    if (loja_id) {
      queryPagamentosVendas = queryPagamentosVendas.eq(
        "venda.loja_id",
        loja_id,
      );
    }

    const { data: pagamentosData, error: erroPagamentos } =
      await queryPagamentosVendas;

    if (erroPagamentos) {
      console.error(
        "❌ [DASHBOARD] Erro ao buscar vendas dos pagamentos:",
        erroPagamentos,
      );
    } else {
      const batchPagamentos = pagamentosData || [];

      // Coletar IDs únicos de vendas
      const vendasIds: string[] = [];

      batchPagamentos.forEach((p: any) => {
        if (p.venda_id && !vendasProcessadas.has(p.venda_id)) {
          if (!loja_id || p.venda?.loja_id === loja_id) {
            vendasIds.push(p.venda_id);
            vendasProcessadas.add(p.venda_id);
          }
        }
      });

      // Buscar itens dessas vendas para calcular custo
      if (vendasIds.length > 0) {
        const batchSize = 50;

        // Processar em batches para evitar URL muito longa
        for (let i = 0; i < vendasIds.length; i += batchSize) {
          const batch = vendasIds.slice(i, i + batchSize);
          const { data: itensData, error: erroItens } = await supabase
            .from("itens_venda")
            .select(
              "quantidade, produto:produtos!itens_venda_produto_id_fkey(preco_compra)",
            )
            .in("venda_id", batch);

          if (!erroItens && itensData) {
            itensData.forEach((item: any) => {
              const precoCompra = Number(item.produto?.preco_compra || 0);
              const quantidade = Number(item.quantidade || 0);

              custoTotalVendas += precoCompra * quantidade;
            });
          }
        }
      }
    }

    // Lucro = Pagamentos Recebidos - Custo dos Produtos Vendidos
    const lucroVendas = pagamentosSemCredito - custoTotalVendas;

    // Calcular ticket médio
    const ticketMedio = count && count > 0 ? pagamentosSemCredito / count : 0;

    // Buscar contas não pagas (vendas onde valor_pago < valor_total)
    let totalContasNaoPagas = 0;

    try {
      const { data, error } = await supabase.rpc(
        "calcular_total_contas_nao_pagas",
        {
          p_data_inicio: inicioISO,
          p_data_fim: fimISO,
          p_loja_id: loja_id || null,
        },
      );

      if (error) {
        console.error("❌ [DASHBOARD] Erro ao buscar contas não pagas:", error);
      } else {
        totalContasNaoPagas = Number(data || 0);
      }
    } catch (error) {
      console.error(
        "❌ [DASHBOARD] Erro crítico ao buscar contas não pagas:",
        error,
      );
    }

    // Buscar métricas de Ordem de Serviço
    let pagamentosOSRecebidos = 0;

    let queryPagamentosOS = supabase
      .from("ordem_servico_pagamentos")
      .select(
        "valor, os:ordem_servico!ordem_servico_pagamentos_id_ordem_servico_fkey(id_loja)",
      )
      .gte("data_pagamento", inicioISO)
      .lte("data_pagamento", fimISO)
      .limit(2000);

    const { data: pagamentosOSData, error: erroPagamentosOS } =
      await queryPagamentosOS;

    if (erroPagamentosOS) {
      console.error(
        "❌ [DASHBOARD] Erro ao buscar pagamentos de OS:",
        erroPagamentosOS,
      );
    } else {
      const batchPagamentosOS = pagamentosOSData || [];

      batchPagamentosOS.forEach((p: any) => {
        if (loja_id && p.os?.id_loja !== loja_id) return;
        pagamentosOSRecebidos += Number(p.valor || 0);
      });
    }

    let queryTotalOS = supabase
      .from("ordem_servico")
      .select("id", { count: "exact", head: true })
      .gte("criado_em", inicioISO)
      .lte("criado_em", fimISO)
      .neq("status", "cancelado");

    if (loja_id) {
      queryTotalOS = queryTotalOS.eq("id_loja", loja_id);
    }

    const { count: totalOS, error: erroTotalOS } = await queryTotalOS;

    if (erroTotalOS) {
      console.error("❌ [DASHBOARD] Erro ao buscar total de OS:", erroTotalOS);
    }

    // Buscar OS entregues
    let queryOSEntregues = supabase
      .from("ordem_servico")
      .select("id", { count: "exact", head: true })
      .eq("status", "entregue")
      .gte("criado_em", inicioISO)
      .lte("criado_em", fimISO);

    if (loja_id) {
      queryOSEntregues = queryOSEntregues.eq("id_loja", loja_id);
    }

    const { count: osEntregues, error: erroOSEntregues } =
      await queryOSEntregues;

    if (erroOSEntregues) {
      console.error(
        "❌ [DASHBOARD] Erro ao buscar OS entregues:",
        erroOSEntregues,
      );
    }

    // Buscar faturamento e custo de OS
    let faturamentoOS = 0;
    let custoOS = 0;

    let queryOS = supabase
      .from("ordem_servico")
      .select("id, valor_pago, valor_orcamento")
      .eq("status", "entregue")
      .gt("valor_pago", 0)
      .gte("criado_em", inicioISO)
      .lte("criado_em", fimISO)
      .limit(2000);

    if (loja_id) {
      queryOS = queryOS.eq("id_loja", loja_id);
    }

    const { data: osData, error: erroOS } = await queryOS;

    if (erroOS) {
      console.error("❌ [DASHBOARD] Erro ao buscar faturamento de OS:", erroOS);
    } else {
      const batchOS = osData || [];

      // Somar faturamento (usar valor_pago, fallback para valor_orcamento)
      batchOS.forEach((os: any) => {
        const valorFaturado = Number(os.valor_pago || os.valor_orcamento || 0);

        faturamentoOS += valorFaturado;
      });

      // Buscar peças dessas OS para calcular custo usando preco_compra
      if (batchOS.length > 0) {
        const osIds = batchOS.map((os: any) => os.id);
        const batchSize = 50;

        // Processar em batches para evitar URL muito longa
        for (let i = 0; i < osIds.length; i += batchSize) {
          const batch = osIds.slice(i, i + batchSize);
          const { data: pecasData, error: erroPecas } = await supabase
            .from("ordem_servico_pecas")
            .select(
              "quantidade, produto:produtos!ordem_servico_pecas_id_produto_fkey(preco_compra)",
            )
            .in("id_ordem_servico", batch);

          if (!erroPecas && pecasData) {
            pecasData.forEach((peca: any) => {
              const precoCompra = Number(peca.produto?.preco_compra || 0);
              const quantidade = Number(peca.quantidade || 0);

              custoOS += precoCompra * quantidade;
            });
          }
        }
      }
    }
    const ganhoOS = faturamentoOS - custoOS;
    // Buscar faturamento de OS processadas (pagas não entregues + entregues)
    let faturamentoOSProcessadas = 0;

    let queryOSProcessadas = supabase
      .from("ordem_servico")
      .select("valor_pago")
      .or(`valor_pago.gt.0,status.eq.entregue`)
      .neq("status", "cancelado")
      .gte("criado_em", inicioISO)
      .lte("criado_em", fimISO)
      .limit(2000);

    if (loja_id) {
      queryOSProcessadas = queryOSProcessadas.eq("id_loja", loja_id);
    }

    const { data: osProcessadasData, error: erroOSProcessadas } =
      await queryOSProcessadas;

    if (erroOSProcessadas) {
      console.error(
        "❌ [DASHBOARD] Erro ao buscar faturamento de OS processadas:",
        erroOSProcessadas,
      );
    } else {
      const batchOSProcessadas = osProcessadasData || [];

      batchOSProcessadas.forEach((os: any) => {
        faturamentoOSProcessadas += Number(os.valor_pago || 0);
      });
    }

    // Buscar faturamento de OS processadas usando pagamentos reais (não valor_pago)
    faturamentoOSProcessadas = 0;
    const osProcessadasIds: string[] = [];

    let queryOSPagtos = supabase
      .from("ordem_servico_pagamentos")
      .select(
        "valor, id_ordem_servico, os:ordem_servico!ordem_servico_pagamentos_id_ordem_servico_fkey(id_loja)",
      )
      .gte("data_pagamento", inicioISO)
      .lte("data_pagamento", fimISO)
      .limit(2000);

    const { data: osPagtosData, error: erroOSPagtos } = await queryOSPagtos;

    if (erroOSPagtos) {
      console.error(
        "❌ [DASHBOARD] Erro ao buscar pagamentos de OS processadas:",
        erroOSPagtos,
      );
    } else {
      const batchOSPagtos = osPagtosData || [];

      batchOSPagtos.forEach((p: any) => {
        if (loja_id && p.os?.id_loja !== loja_id) return;
        faturamentoOSProcessadas += Number(p.valor || 0);
        if (!osProcessadasIds.includes(p.id_ordem_servico)) {
          osProcessadasIds.push(p.id_ordem_servico);
        }
      });
    }

    // Buscar peças dessas OS para calcular custo
    let custOSProcessadas = 0;

    if (osProcessadasIds.length > 0) {
      const batchSize = 50;

      // Processar em batches para evitar URL muito longa
      for (let i = 0; i < osProcessadasIds.length; i += batchSize) {
        const batch = osProcessadasIds.slice(i, i + batchSize);
        const { data: pecasProcessadasData, error: erroPecasProcessadas } =
          await supabase
            .from("ordem_servico_pecas")
            .select(
              "quantidade, produto:produtos!ordem_servico_pecas_id_produto_fkey(preco_compra)",
            )
            .in("id_ordem_servico", batch);

        if (!erroPecasProcessadas && pecasProcessadasData) {
          pecasProcessadasData.forEach((peca: any) => {
            const precoCompra = Number(peca.produto?.preco_compra || 0);
            const quantidade = Number(peca.quantidade || 0);

            custOSProcessadas += precoCompra * quantidade;
          });
        }
      }
    }

    const ganhoOSProcessadas = faturamentoOSProcessadas - custOSProcessadas;
    let queryOSPendentes = supabase
      .from("ordem_servico")
      .select("id", { count: "exact", head: true })
      .not("status", "eq", "entregue")
      .neq("status", "cancelado")
      .or("valor_pago.is.null,valor_pago.eq.0")
      .gte("criado_em", inicioISO)
      .lte("criado_em", fimISO);

    if (loja_id) {
      queryOSPendentes = queryOSPendentes.eq("id_loja", loja_id);
    }

    const { count: osPendentes, error: erroOSPendentes } =
      await queryOSPendentes;

    if (erroOSPendentes) {
      console.error(
        "❌ [DASHBOARD] Erro ao buscar OS pendentes:",
        erroOSPendentes,
      );
    }

    // Buscar OS pagas mas não entregues (valor_pago > 0 e status != entregue/cancelado)
    let queryOSPagaNaoEntregue = supabase
      .from("ordem_servico")
      .select("id", { count: "exact", head: true })
      .gt("valor_pago", 0)
      .not("status", "eq", "entregue")
      .neq("status", "cancelado")
      .gte("criado_em", inicioISO)
      .lte("criado_em", fimISO);

    if (loja_id) {
      queryOSPagaNaoEntregue = queryOSPagaNaoEntregue.eq("id_loja", loja_id);
    }

    const { count: osPagasNaoEntregues, error: erroOSPagaNaoEntregue } =
      await queryOSPagaNaoEntregue;

    if (erroOSPagaNaoEntregue) {
      console.error(
        "❌ [DASHBOARD] Erro ao buscar OS pagas não entregues:",
        erroOSPagaNaoEntregue,
      );
    }

    // Calcular OS processadas (pagas não entregues + entregues)
    const osProcessadas = (osPagasNaoEntregues || 0) + (osEntregues || 0);

    // Buscar total de transferências
    let queryTotalTransferencias = supabase
      .from("transferencias")
      .select("id", { count: "exact", head: true })
      .gte("criado_em", inicioISO)
      .lte("criado_em", fimISO);

    if (loja_id) {
      // Buscar onde a loja seja origem ou destino
      queryTotalTransferencias = queryTotalTransferencias.or(
        `loja_origem_id.eq.${loja_id},loja_destino_id.eq.${loja_id}`,
      );
    }

    const { count: totalTransferencias, error: erroTotalTransferencias } =
      await queryTotalTransferencias;

    if (erroTotalTransferencias) {
      console.error(
        "❌ [DASHBOARD] Erro ao buscar total de transferências:",
        erroTotalTransferencias,
      );
    }

    // Buscar transferências pendentes
    let queryTransferenciasPendentes = supabase
      .from("transferencias")
      .select("id", { count: "exact", head: true })
      .eq("status", "pendente")
      .gte("criado_em", inicioISO)
      .lte("criado_em", fimISO);

    if (loja_id) {
      queryTransferenciasPendentes = queryTransferenciasPendentes.or(
        `loja_origem_id.eq.${loja_id},loja_destino_id.eq.${loja_id}`,
      );
    }

    const {
      count: transferenciasPendentes,
      error: erroTransferenciasPendentes,
    } = await queryTransferenciasPendentes;

    if (erroTransferenciasPendentes) {
      console.error(
        "❌ [DASHBOARD] Erro ao buscar transferências pendentes:",
        erroTransferenciasPendentes,
      );
    }

    // Buscar total em quebra de peças
    let totalQuebras = 0;
    let quantidadeQuebras = 0;

    let queryQuebras = supabase
      .from("quebra_pecas")
      .select("valor_total")
      .gte("criado_em", inicioISO)
      .lte("criado_em", fimISO)
      .limit(2000);

    if (loja_id) {
      queryQuebras = queryQuebras.eq("id_loja", loja_id);
    }

    const { data: quebrasData, error: erroQuebras } = await queryQuebras;

    if (erroQuebras) {
      console.error(
        "❌ [DASHBOARD] Erro ao buscar quebra de peças:",
        erroQuebras,
      );
    } else {
      const batchQuebras = quebrasData || [];

      quantidadeQuebras += batchQuebras.length;
      batchQuebras.forEach((q: any) => {
        totalQuebras += Number(q.valor_total || 0);
      });
    }

    // Buscar total de crédito de cliente (saldo disponível)
    let totalCreditosCliente = 0;

    let queryCreditos = supabase
      .from("creditos_cliente")
      .select(
        "saldo, cliente:clientes!creditos_cliente_cliente_id_fkey(id_loja)",
      )
      .gte("criado_em", inicioISO)
      .lte("criado_em", fimISO)
      .limit(2000);

    const { data: creditosData, error: erroCreditos } = await queryCreditos;

    if (erroCreditos) {
      console.error(
        "❌ [DASHBOARD] Erro ao buscar crédito de cliente:",
        erroCreditos,
      );
    } else {
      const batchCreditos = creditosData || [];

      batchCreditos.forEach((c: any) => {
        // Se filtrar por loja, validar que a loja do cliente corresponde
        if (!loja_id || c.cliente?.id_loja === loja_id) {
          totalCreditosCliente += Number(c.saldo || 0);
        }
      });
    }

    // Buscar devoluções (com crédito e sem crédito)
    let devolucoesComCreditoQuantidade = 0;
    let devolucoesComCreditoTotal = 0;
    let devolucoessemCreditoQuantidade = 0;
    let devolucoesemCreditoTotal = 0;

    let queryDevolucoes = supabase
      .from("devolucoes_venda")
      .select(
        "tipo, valor_total, venda:vendas!devolucoes_venda_venda_id_fkey(loja_id)",
      )
      .gte("criado_em", inicioISO)
      .lte("criado_em", fimISO)
      .limit(2000);

    const { data: devolucoesData, error: erroDevolucoes } =
      await queryDevolucoes;

    if (erroDevolucoes) {
      console.error(
        "❌ [DASHBOARD] Erro ao buscar devoluções:",
        erroDevolucoes,
      );
    } else {
      const batchDevolucoes = devolucoesData || [];

      batchDevolucoes.forEach((d: any) => {
        if (loja_id && d.venda?.loja_id !== loja_id) return;

        const valor = Number(d.valor_total || 0);

        if (d.tipo === "com_credito") {
          devolucoesComCreditoQuantidade += 1;
          devolucoesComCreditoTotal += valor;
        } else {
          devolucoessemCreditoQuantidade += 1;
          devolucoesemCreditoTotal += valor;
        }
      });
    }

    // Buscar OS pagas por tipo de cliente (lojista e consumidor final)
    // Considerar apenas OS processadas (entregues ou pagas não entregues)
    let osLojistaCount = 0;
    let osConsumidorFinalCount = 0;
    let osSemTipoCount = 0;
    let osLojistaFaturamento = 0;
    let osConsumidorFinalFaturamento = 0;
    let osSemTipoFaturamento = 0;
    let osLojistaLucro = 0;
    let osConsumidorFinalLucro = 0;
    let osSemTipoLucro = 0;
    const osLojistaIds: string[] = [];
    const osConsumidorFinalIds: string[] = [];
    const osSemTipoIds: string[] = [];

    // Query payments from ordem_servico_pagamentos (same logic as "Ganho OS Processadas")

    let queryOSPagtosPorTipo = supabase
      .from("ordem_servico_pagamentos")
      .select(
        "valor, id_ordem_servico, os:ordem_servico!ordem_servico_pagamentos_id_ordem_servico_fkey(id_loja, tipo_cliente)",
      )
      .gte("data_pagamento", inicioISO)
      .lte("data_pagamento", fimISO)
      .limit(2000);

    const { data: osPagtosPorTipoData, error: erroOSPagtosPorTipo } =
      await queryOSPagtosPorTipo;

    if (erroOSPagtosPorTipo) {
      console.error(
        "❌ [DASHBOARD] Erro ao buscar pagamentos por tipo:",
        erroOSPagtosPorTipo,
      );
    } else {
      const batchOSPagtosPorTipo = osPagtosPorTipoData || [];

      batchOSPagtosPorTipo.forEach((p: any) => {
        if (loja_id && p.os?.id_loja !== loja_id) return;

        const valor = Number(p.valor || 0);
        const tipo = p.os?.tipo_cliente || "sem_tipo";

        if (tipo === "lojista") {
          osLojistaFaturamento += valor;
          if (!osLojistaIds.includes(p.id_ordem_servico)) {
            osLojistaIds.push(p.id_ordem_servico);
            osLojistaCount++;
          }
        } else if (tipo === "consumidor_final") {
          osConsumidorFinalFaturamento += valor;
          if (!osConsumidorFinalIds.includes(p.id_ordem_servico)) {
            osConsumidorFinalIds.push(p.id_ordem_servico);
            osConsumidorFinalCount++;
          }
        } else {
          osSemTipoFaturamento += valor;
          if (!osSemTipoIds.includes(p.id_ordem_servico)) {
            osSemTipoIds.push(p.id_ordem_servico);
            osSemTipoCount++;
          }
        }
      });
    }

    // Calculate costs for all OS types
    const allOSIds = [
      ...osLojistaIds,
      ...osConsumidorFinalIds,
      ...osSemTipoIds,
    ];

    if (allOSIds.length > 0) {
      const batchSize = 50;

      // Processar em batches para evitar URL muito longa
      for (let i = 0; i < allOSIds.length; i += batchSize) {
        const batch = allOSIds.slice(i, i + batchSize);
        const { data: pecasPorTipoData, error: erroPecasPorTipo } =
          await supabase
            .from("ordem_servico_pecas")
            .select(
              "quantidade, id_ordem_servico, produto:produtos!ordem_servico_pecas_id_produto_fkey(preco_compra), os:ordem_servico!ordem_servico_pecas_id_ordem_servico_fkey(tipo_cliente)",
            )
            .in("id_ordem_servico", batch);

        if (!erroPecasPorTipo && pecasPorTipoData) {
          pecasPorTipoData.forEach((peca: any) => {
            const precoCompra = Number(peca.produto?.preco_compra || 0);
            const quantidade = Number(peca.quantidade || 0);
            const custo = precoCompra * quantidade;
            const tipo = peca.os?.tipo_cliente || "sem_tipo";

            if (tipo === "lojista") {
              osLojistaLucro += custo;
            } else if (tipo === "consumidor_final") {
              osConsumidorFinalLucro += custo;
            } else {
              osSemTipoLucro += custo;
            }
          });
        }
      }
    }

    // Calculate final profit (revenue - cost)
    osLojistaLucro = osLojistaFaturamento - osLojistaLucro;
    osConsumidorFinalLucro =
      osConsumidorFinalFaturamento - osConsumidorFinalLucro;
    osSemTipoLucro = osSemTipoFaturamento - osSemTipoLucro;
    const metricasOSCorrigidas =
      await this.calcularMetricasOSProcessadasCorrigidas(
        inicioISO,
        fimISO,
        loja_id,
      );

    return {
      metricas_adicionais: {
        pagamentos_sem_credito_cliente: pagamentosSemCredito,
        pagamentos_os_recebidos: pagamentosOSRecebidos,
        total_vendas: count || 0,
        ganho_total_vendas: lucroVendas,
        ticket_medio: ticketMedio,
        contas_nao_pagas: totalContasNaoPagas,
        total_os: totalOS || 0,
        os_entregues: metricasOSCorrigidas.os_entregues || 0,
        os_pendentes: osPendentes || 0,
        os_pagas_nao_entregues:
          metricasOSCorrigidas.os_pagas_nao_entregues || 0,
        os_processadas: metricasOSCorrigidas.os_processadas || 0,
        faturamento_os_processadas:
          metricasOSCorrigidas.faturamento_os_processadas || 0,
        ganho_os_processadas: metricasOSCorrigidas.ganho_os_processadas || 0,
        faturamento_os: metricasOSCorrigidas.faturamento_os_processadas || 0,
        ganho_os: metricasOSCorrigidas.ganho_os_processadas || 0,
        total_transferencias: totalTransferencias || 0,
        transferencias_pendentes: transferenciasPendentes || 0,
        total_quebras: totalQuebras,
        quantidade_quebras: quantidadeQuebras,
        total_creditos_cliente: totalCreditosCliente,
        os_lojista_pagas: osLojistaCount,
        os_consumidor_final_pagas: osConsumidorFinalCount,
        os_lojista_faturamento: osLojistaFaturamento,
        os_lojista_lucro: osLojistaLucro,
        os_consumidor_final_faturamento: osConsumidorFinalFaturamento,
        os_consumidor_final_lucro: osConsumidorFinalLucro,
        os_sem_tipo_pagas: osSemTipoCount,
        os_sem_tipo_faturamento: osSemTipoFaturamento,
        os_sem_tipo_lucro: osSemTipoLucro,
        devolucoes_com_credito_quantidade: devolucoesComCreditoQuantidade,
        devolucoes_com_credito_total: devolucoesComCreditoTotal,
        devolucoes_sem_credito_quantidade: devolucoessemCreditoQuantidade,
        devolucoes_sem_credito_total: devolucoesemCreditoTotal,
      },
    };
  }

  // ==================== FUNÇÕES PARA GRÁFICOS ====================

  private static cacheDashboardCompleto: {
    filtro: string;
    dados: any;
  } | null = null;

  private static async getDashboardCompleto(
    filtro: FiltroDashboard,
  ): Promise<any> {
    const chave = JSON.stringify(filtro);

    if (
      this.cacheDashboardCompleto &&
      this.cacheDashboardCompleto.filtro === chave
    ) {
      return this.cacheDashboardCompleto.dados;
    }

    const { data_inicio, data_fim, loja_id } = filtro;
    const { data, error } = await supabase.rpc("calcular_dashboard_completo", {
      p_data_inicio: `${data_inicio}T00:00:00`,
      p_data_fim: `${data_fim}T23:59:59`,
      p_loja_id: loja_id || null,
    });

    if (error) throw error;

    const result = Array.isArray(data) ? data[0] : data;

    this.cacheDashboardCompleto = { filtro: chave, dados: result };

    return result;
  }

  /**
   * Busca evolução diária de vendas e receita para gráfico de linha
   */
  static async buscarEvolucaoVendas(filtro: FiltroDashboard): Promise<
    Array<{
      data: string;
      vendas: number;
      receita: number;
    }>
  > {
    try {
      const { data, error } = await supabase.rpc("calcular_evolucao_vendas", {
        p_data_inicio: `${filtro.data_inicio}T00:00:00`,
        p_data_fim: `${filtro.data_fim}T23:59:59`,
        p_loja_id: filtro.loja_id || null,
      });

      if (error) throw error;

      return (data || []).map((item: any) => ({
        data: String(item.data_venda || ""),
        vendas: Number(item.total_vendas || 0),
        receita: Number(item.receita || 0),
      }));
    } catch (error) {
      console.error("Erro ao buscar evolução de vendas:", error);

      return [];
    }
  }

  /**
   * Busca top 10 produtos mais vendidos
   */
  static async buscarTop10Produtos(filtro: FiltroDashboard): Promise<
    Array<{
      produto_id: string;
      descricao: string;
      quantidade: number;
      receita: number;
    }>
  > {
    try {
      const produtos = await this.getProdutosVendidosCached(filtro);

      return produtos
        .sort((a, b) => b.quantidade - a.quantidade)
        .slice(0, 10)
        .map((p) => ({
          produto_id: p.produto_id,
          descricao: p.descricao,
          quantidade: p.quantidade,
          receita: p.valor_vendido,
        }));
    } catch (error) {
      console.error("Erro ao buscar top 10 produtos:", error);

      return [];
    }
  }

  static async buscarBottom10Produtos(filtro: FiltroDashboard): Promise<
    Array<{
      produto_id: string;
      descricao: string;
      quantidade: number;
      receita: number;
    }>
  > {
    try {
      const produtos = await this.getProdutosVendidosCached(filtro);

      return produtos
        .filter((p) => p.quantidade > 0)
        .sort((a, b) => a.quantidade - b.quantidade)
        .slice(0, 10)
        .map((p) => ({
          produto_id: p.produto_id,
          descricao: p.descricao,
          quantidade: p.quantidade,
          receita: p.valor_vendido,
        }));
    } catch (error) {
      console.error("Erro ao buscar bottom 10 produtos:", error);

      return [];
    }
  }

  static async buscarProdutosVendidosPeriodo(
    filtro: FiltroDashboard,
    busca = "",
    page = 1,
    pageSize = 10,
  ): Promise<{
    rows: Array<{
      produto_id: string;
      descricao: string;
      quantidade: number;
      valor_vendido: number;
      valor_recebido: number;
      lucro: number;
      origem: string;
    }>;
    total: number;
    quantidade_total: number;
  }> {
    try {
      const produtos = await this.getProdutosVendidosCached(filtro);
      const buscaNormalizada = this.normalizarTexto(busca);
      const filtrados = buscaNormalizada
        ? produtos.filter((produto) =>
            this.normalizarTexto(produto.descricao).includes(buscaNormalizada),
          )
        : produtos;
      const from = Math.max(0, (page - 1) * pageSize);
      const to = from + pageSize;

      return {
        rows: filtrados.slice(from, to).map((produto) => ({
          produto_id: produto.produto_id,
          descricao: produto.descricao,
          quantidade: produto.quantidade,
          valor_vendido: produto.valor_vendido,
          valor_recebido: produto.valor_vendido,
          lucro: produto.valor_vendido - produto.custo_total,
          origem: produto.origem,
        })),
        total: filtrados.length,
        quantidade_total: filtrados.reduce(
          (acc, produto) => acc + Number(produto.quantidade || 0),
          0,
        ),
      };
    } catch (error) {
      console.error("Erro ao buscar produtos vendidos no periodo:", error);

      return {
        rows: [],
        total: 0,
        quantidade_total: 0,
      };
    }
  }

  /**
   * Busca top 10 clientes com mais vendas
   */
  static async buscarTop10Clientes(filtro: FiltroDashboard): Promise<
    Array<{
      cliente_id: string;
      cliente_nome: string;
      total_vendas: number;
      receita_total: number;
    }>
  > {
    try {
      const { data, error } = await supabase.rpc("calcular_top_clientes", {
        p_data_inicio: `${filtro.data_inicio}T00:00:00`,
        p_data_fim: `${filtro.data_fim}T23:59:59`,
        p_loja_id: filtro.loja_id || null,
      });

      if (error) throw error;

      return (data || [])
        .filter((c: any) => Number(c.receita_total) > 0)
        .slice(0, 10)
        .map((c: any) => ({
          cliente_id: String(c.cliente_id || ""),
          cliente_nome: String(c.cliente_nome || "Cliente desconhecido"),
          total_vendas: Number(c.total_vendas || 0),
          receita_total: Number(c.receita_total || 0),
        }));
    } catch (error) {
      console.error("Erro ao buscar top 10 clientes:", error);

      return [];
    }
  }

  /**
   * Busca top 10 vendedores com mais vendas
   */
  static async buscarVendedoresRanking(filtro: FiltroDashboard): Promise<
    Array<{
      vendedor_id: string;
      vendedor_nome: string;
      total_vendas: number;
      total_os: number;
      receita_vendas: number;
      receita_aparelhos: number;
      receita_os: number;
      receita_total: number;
      lucro_vendas: number;
      lucro_aparelhos: number;
      lucro_os: number;
      lucro_total: number;
    }>
  > {
    const { data_inicio, data_fim, loja_id } = filtro;

    try {
      const { data, error } = await supabase.rpc(
        "calcular_metricas_vendedores",
        {
          p_data_inicio: `${data_inicio}T00:00:00`,
          p_data_fim: `${data_fim}T23:59:59`,
          p_loja_id: loja_id || null,
        },
      );

      if (error) throw error;

      return (data || [])
        .filter((v: any) => Number(v.receita_total) > 0)
        .map((v: any) => ({
          vendedor_id: String(v.vendedor_id || ""),
          vendedor_nome: String(v.vendedor_nome || "Vendedor desconhecido"),
          total_vendas: Number(v.total_vendas || 0),
          total_os: Number(v.total_os || 0),
          receita_vendas: Number(v.receita_vendas || 0),
          receita_aparelhos: Number(v.receita_aparelhos || 0),
          receita_os: Number(v.receita_os || 0),
          receita_total: Number(v.receita_total || 0),
          lucro_vendas: Number(v.lucro_vendas || 0),
          lucro_aparelhos: Number(v.lucro_aparelhos || 0),
          lucro_os: Number(v.lucro_os || 0),
          lucro_total: Number(v.lucro_total || 0),
        }));
    } catch (error) {
      console.error("Erro ao buscar top 10 vendedores:", error);

      return [];
    }
  }

  /**
   * Ranking de faturamento por loja no período (sempre todas as lojas,
   * ignora filtro.loja_id). Faturamento = pagamentos de vendas (sem crédito de
   * cliente) + pagamentos de OS, ambos por data_pagamento. Versão leve: poucas
   * queries paginadas, sem RPC dedicada.
   */
  static async buscarRankingLojas(
    filtro: FiltroDashboard,
  ): Promise<Array<{ loja_id: number; nome: string; faturamento: number }>> {
    const inicioISO = `${filtro.data_inicio}T00:00:00`;
    const fimISO = `${filtro.data_fim}T23:59:59`;

    const pageAll = async (build: () => any): Promise<any[]> => {
      const out: any[] = [];

      for (let from = 0; ; from += 1000) {
        const { data, error } = await build().range(from, from + 999);

        if (error) {
          console.error("Erro ranking lojas:", error);
          break;
        }
        out.push(...(data || []));
        if (!data || data.length < 1000) break;
      }

      return out;
    };

    try {
      const porLoja = new Map<number, number>();

      // Faturamento de vendas
      const pagVendas = await pageAll(() =>
        supabase
          .from("pagamentos_venda")
          .select("valor, venda:vendas!pagamentos_venda_venda_id_fkey(loja_id)")
          .gte("data_pagamento", inicioISO)
          .lte("data_pagamento", fimISO)
          .neq("tipo_pagamento", "credito_cliente"),
      );

      pagVendas.forEach((p: any) => {
        const id = p.venda?.loja_id;

        if (id == null) return;
        porLoja.set(id, (porLoja.get(id) || 0) + Number(p.valor || 0));
      });

      // Faturamento de OS
      const pagOS = await pageAll(() =>
        supabase
          .from("ordem_servico_pagamentos")
          .select("valor, ordem_servico!inner(id_loja)")
          .gte("data_pagamento", inicioISO)
          .lte("data_pagamento", fimISO),
      );

      pagOS.forEach((p: any) => {
        const id = p.ordem_servico?.id_loja;

        if (id == null) return;
        porLoja.set(id, (porLoja.get(id) || 0) + Number(p.valor || 0));
      });

      const { data: lojas } = await supabase.from("lojas").select("id, nome");

      const nomePorLoja = new Map<number, string>(
        (lojas || []).map((l: any) => [l.id, l.nome]),
      );

      return Array.from(porLoja.entries())
        .map(([loja_id, faturamento]) => ({
          loja_id,
          nome: nomePorLoja.get(loja_id) || `Loja ${loja_id}`,
          faturamento,
        }))
        .sort((a, b) => b.faturamento - a.faturamento);
    } catch (error) {
      console.error("Erro ao buscar ranking de lojas:", error);

      return [];
    }
  }

  static async buscarMetricasLojasRPC(filtro: FiltroDashboard): Promise<
    Array<{
      loja_id: number;
      nome: string;
      total_vendas: number;
      total_os: number;
      receita_vendas: number;
      receita_acessorios: number;
      receita_aparelhos: number;
      receita_os: number;
      receita_total: number;
      lucro_vendas: number;
      lucro_acessorios: number;
      lucro_aparelhos: number;
      lucro_os: number;
      lucro_total: number;
    }>
  > {
    try {
      const { data, error } = await supabase.rpc("calcular_metricas_lojas", {
        p_data_inicio: `${filtro.data_inicio}T00:00:00`,
        p_data_fim: `${filtro.data_fim}T23:59:59`,
      });

      if (error) throw error;

      return (Array.isArray(data) ? data : []).map((l: any) => ({
        loja_id: Number(l.loja_id || 0),
        nome: String(l.nome || ""),
        total_vendas: Number(l.total_vendas || 0),
        total_os: Number(l.total_os || 0),
        receita_vendas: Number(l.receita_vendas || 0),
        receita_acessorios: Number(l.receita_acessorios || 0),
        receita_aparelhos: Number(l.receita_aparelhos || 0),
        receita_os: Number(l.receita_os || 0),
        receita_total: Number(l.receita_total || 0),
        lucro_vendas: Number(l.lucro_vendas || 0),
        lucro_acessorios: Number(l.lucro_acessorios || 0),
        lucro_aparelhos: Number(l.lucro_aparelhos || 0),
        lucro_os: Number(l.lucro_os || 0),
        lucro_total: Number(l.lucro_total || 0),
      }));
    } catch (error) {
      console.error("❌ [DASHBOARD] Erro ao buscar métricas de lojas:", error);

      const lojasSimples = await this.buscarRankingLojas(filtro);

      return lojasSimples.map((l) => ({
        loja_id: l.loja_id,
        nome: l.nome,
        total_vendas: 0,
        total_os: 0,
        receita_vendas: l.faturamento,
        receita_acessorios: 0,
        receita_aparelhos: 0,
        receita_os: 0,
        receita_total: l.faturamento,
        lucro_vendas: 0,
        lucro_acessorios: 0,
        lucro_aparelhos: 0,
        lucro_os: 0,
        lucro_total: 0,
      }));
    }
  }

  static async buscarDesempenhoTecnicos(
    filtro: FiltroDashboard,
  ): Promise<DesempenhoTecnico[]> {
    const { data_inicio, data_fim, loja_id } = filtro;
    const inicioISO = `${data_inicio}T00:00:00`;
    const fimISO = `${data_fim}T23:59:59`;

    try {
      let q = supabase
        .from("ordem_servico")
        .select("tecnico_responsavel, status, valor_orcamento, valor_pago")
        .not("tecnico_responsavel", "is", null)
        .neq("status", "cancelado")
        .gte("criado_em", inicioISO)
        .lte("criado_em", fimISO)
        .limit(5000);

      if (loja_id) {
        q = q.eq("id_loja", loja_id);
      }

      const { data: osData, error } = await q;

      if (error) throw error;

      if (!osData || osData.length === 0) return [];

      // Agrupar por tecnico_responsavel
      const agrupado = new Map<
        string,
        {
          total_os: number;
          os_concluidas: number;
          os_andamento: number;
          os_aguardando: number;
          valor_orcado: number;
          valor_pago: number;
        }
      >();

      for (const os of osData) {
        const tecId = os.tecnico_responsavel;

        if (!tecId) continue;

        const grupo = agrupado.get(tecId) || {
          total_os: 0,
          os_concluidas: 0,
          os_andamento: 0,
          os_aguardando: 0,
          valor_orcado: 0,
          valor_pago: 0,
        };

        grupo.total_os += 1;
        grupo.valor_orcado += Number(os.valor_orcamento || 0);
        grupo.valor_pago += Number(os.valor_pago || 0);

        if (os.status === "concluido" || os.status === "entregue") {
          grupo.os_concluidas += 1;
        } else if (os.status === "em_andamento" || os.status === "aprovado") {
          grupo.os_andamento += 1;
        } else if (
          os.status === "aguardando" ||
          os.status === "aguardando_peca" ||
          os.status === "em_diagnostico"
        ) {
          grupo.os_aguardando += 1;
        }

        agrupado.set(tecId, grupo);
      }

      // Buscar nomes dos usuarios
      const userIds = Array.from(agrupado.keys());
      const { data: usuariosData } = await supabase
        .from("usuarios")
        .select("id, nome")
        .in("id", userIds);

      const nomeMap = new Map<string, string>();

      if (usuariosData) {
        for (const u of usuariosData) {
          nomeMap.set(u.id, u.nome);
        }
      }

      const resultado: DesempenhoTecnico[] = Array.from(agrupado.entries()).map(
        ([usuario_id, dados]) => ({
          usuario_id,
          usuario_nome: nomeMap.get(usuario_id) || "Técnico",
          ...dados,
        }),
      );

      return resultado.sort((a, b) => b.os_concluidas - a.os_concluidas);
    } catch (error) {
      console.error(
        "❌ [DASHBOARD] Erro ao buscar desempenho de técnicos:",
        error,
      );

      return [];
    }
  }

  static async buscarDetalheCard(
    cardKey: string,
    filtro: FiltroDashboard,
    page: number = 1,
    pageSize: number = 10,
  ): Promise<{
    colunas: Array<{ key: string; label: string }>;
    rows: Array<Record<string, string>>;
    total: number;
  }> {
    const { data_inicio, data_fim, loja_id } = filtro;
    const inicioISO = `${data_inicio}T00:00:00`;
    const fimISO = `${data_fim}T23:59:59`;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    const lojaNum = loja_id || undefined;

    const formatBRL = (v: number) =>
      new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(v || 0);

    try {
      switch (cardKey) {
        case "faturamento":
        case "lucro":
        case "ticket": {
          let q = supabase
            .from("vendas")
            .select(
              "numero_venda, criado_em, status, valor_total, valor_pago",
              { count: "exact" },
            )
            .gte("criado_em", inicioISO)
            .lte("criado_em", fimISO)
            .not("status", "in", '("cancelada","devolvida")')
            .range(from, to)
            .order("criado_em", { ascending: false });

          if (lojaNum) q = q.eq("loja_id", lojaNum);

          const { data, count, error } = await q;

          if (error) throw error;

          return {
            colunas: [
              { key: "venda", label: "Venda" },
              { key: "data", label: "Data" },
              { key: "status", label: "Status" },
              { key: "total", label: "Valor Total" },
              { key: "pago", label: "Valor Pago" },
            ],
            rows: (data || []).map((r: any) => ({
              venda: `V${String(r.numero_venda || 0).padStart(6, "0")}`,
              data: r.criado_em
                ? new Date(r.criado_em).toLocaleString("pt-BR")
                : "-",
              status: r.status || "-",
              total: formatBRL(Number(r.valor_total || 0)),
              pago: formatBRL(Number(r.valor_pago || 0)),
            })),
            total: count || 0,
          };
        }

        case "produtos": {
          const res = await this.buscarProdutosVendidosPeriodo(
            filtro,
            "",
            page,
            pageSize,
          );

          return {
            colunas: [
              { key: "produto", label: "Produto" },
              { key: "origem", label: "Origem" },
              { key: "qtd", label: "Quantidade" },
              { key: "valor", label: "Valor" },
              { key: "lucro", label: "Lucro" },
            ],
            rows: res.rows.map((r) => ({
              produto: r.descricao,
              origem: r.origem || "-",
              qtd: `${r.quantidade} un`,
              valor: formatBRL(r.valor_vendido),
              lucro: formatBRL(r.lucro),
            })),
            total: res.total,
          };
        }

        case "acessorios": {
          let q = supabase
            .from("itens_venda")
            .select(
              "quantidade, subtotal, produto:produtos!itens_venda_produto_id_fkey(descricao), venda:vendas!inner(numero_venda)",
              { count: "exact" },
            )
            .gte("criado_em", inicioISO)
            .lte("criado_em", fimISO)
            .not("venda.status", "in", '("cancelada","devolvida")')
            .eq("produto.is_acessorio", true)
            .range(from, to)
            .order("criado_em", { ascending: false });

          if (lojaNum) q = q.eq("venda.loja_id", lojaNum);

          const { data, count, error } = await q;

          if (error) throw error;

          return {
            colunas: [
              { key: "venda", label: "Venda" },
              { key: "produto", label: "Acessório" },
              { key: "qtd", label: "Qtd" },
              { key: "valor", label: "Valor" },
            ],
            rows: (data || []).map((r: any) => ({
              venda: `V${String(r.venda?.numero_venda || 0).padStart(6, "0")}`,
              produto: r.produto?.descricao || "-",
              qtd: `${Number(r.quantidade || 0)} un`,
              valor: formatBRL(Number(r.subtotal || 0)),
            })),
            total: count || 0,
          };
        }

        case "aparelhos":
        case "aparelhos_vendidos": {
          let q = supabase
            .from("aparelhos")
            .select(
              "marca, modelo, valor_venda, valor_compra, data_venda, venda:vendas!inner(numero_venda)",
              { count: "exact" },
            )
            .eq("status", "vendido")
            .not("venda_id", "is", null)
            .gte("data_venda", data_inicio)
            .lte("data_venda", data_fim)
            .range(from, to)
            .order("data_venda", { ascending: false });

          if (lojaNum) q = q.eq("loja_id", lojaNum);

          const { data, count, error } = await q;

          if (error) throw error;

          return {
            colunas: [
              { key: "venda", label: "Venda" },
              { key: "aparelho", label: "Aparelho" },
              { key: "data", label: "Data Venda" },
              { key: "valor", label: "Valor Venda" },
              { key: "custo", label: "Valor Compra" },
            ],
            rows: (data || []).map((r: any) => ({
              venda: `V${String(r.venda?.numero_venda || 0).padStart(6, "0")}`,
              aparelho: `${r.marca || ""} ${r.modelo || ""}`.trim() || "-",
              data: r.data_venda
                ? new Date(r.data_venda).toLocaleDateString("pt-BR")
                : "-",
              valor: formatBRL(Number(r.valor_venda || 0)),
              custo: formatBRL(Number(r.valor_compra || 0)),
            })),
            total: count || 0,
          };
        }

        case "os":
        case "os_operacional": {
          let q = supabase
            .from("ordem_servico")
            .select(
              "numero_os, criado_em, status, tipo_cliente, valor_orcamento, valor_pago",
              { count: "exact" },
            )
            .neq("status", "cancelado")
            .gte("criado_em", inicioISO)
            .lte("criado_em", fimISO)
            .range(from, to)
            .order("criado_em", { ascending: false });

          if (lojaNum) q = q.eq("id_loja", lojaNum);

          const { data, count, error } = await q;

          if (error) throw error;

          return {
            colunas: [
              { key: "os", label: "OS" },
              { key: "data", label: "Data" },
              { key: "status", label: "Status" },
              { key: "tipo", label: "Tipo" },
              { key: "orcado", label: "Orçado" },
              { key: "pago", label: "Pago" },
            ],
            rows: (data || []).map((r: any) => ({
              os: r.numero_os ? `OS ${r.numero_os}` : r.id?.slice(0, 8),
              data: r.criado_em
                ? new Date(r.criado_em).toLocaleString("pt-BR")
                : "-",
              status: r.status || "-",
              tipo: r.tipo_cliente || "-",
              orcado: formatBRL(Number(r.valor_orcamento || 0)),
              pago: formatBRL(Number(r.valor_pago || 0)),
            })),
            total: count || 0,
          };
        }

        case "os_aguardando": {
          let q = supabase
            .from("ordem_servico")
            .select("numero_os, criado_em, cliente_nome, valor_pago", {
              count: "exact",
            })
            .gt("valor_pago", 0)
            .neq("status", "entregue")
            .neq("status", "cancelado")
            .gte("criado_em", inicioISO)
            .lte("criado_em", fimISO)
            .range(from, to)
            .order("criado_em", { ascending: false });

          if (lojaNum) q = q.eq("id_loja", lojaNum);

          const { data, count, error } = await q;

          if (error) throw error;

          return {
            colunas: [
              { key: "os", label: "OS" },
              { key: "cliente", label: "Cliente" },
              { key: "data", label: "Data" },
              { key: "pago", label: "Valor Pago" },
            ],
            rows: (data || []).map((r: any) => ({
              os: r.numero_os ? `OS ${r.numero_os}` : r.id?.slice(0, 8),
              cliente: r.cliente_nome || "-",
              data: r.criado_em
                ? new Date(r.criado_em).toLocaleString("pt-BR")
                : "-",
              pago: formatBRL(Number(r.valor_pago || 0)),
            })),
            total: count || 0,
          };
        }

        case "contas_receber": {
          const pageAll = async (build: () => any): Promise<any[]> => {
            const out: any[] = [];

            for (let from2 = 0; ; from2 += 1000) {
              const { data, error } = await build().range(from2, from2 + 999);

              if (error) break;
              out.push(...(data || []));
              if (!data || data.length < 1000) break;
            }

            return out;
          };

          const vendas = await pageAll(() =>
            supabase
              .from("vendas")
              .select(
                "numero_venda, criado_em, status, valor_total, valor_pago, saldo_devedor, cliente:clientes(nome)",
              )
              .gte("criado_em", inicioISO)
              .lte("criado_em", fimISO)
              .not("status", "in", '("cancelada","devolvida")')
              .order("criado_em", { ascending: false }),
          );

          const pendentes = vendas.filter((v: any) => {
            const saldo = Number(
              v.saldo_devedor || v.valor_total - v.valor_pago || 0,
            );

            return saldo > 0;
          });

          const paginado = pendentes.slice(from, to + 1);

          return {
            colunas: [
              { key: "venda", label: "Venda" },
              { key: "cliente", label: "Cliente" },
              { key: "data", label: "Data" },
              { key: "total", label: "Total" },
              { key: "pago", label: "Pago" },
              { key: "saldo", label: "Saldo" },
            ],
            rows: paginado.map((v: any) => ({
              venda: `V${String(v.numero_venda || 0).padStart(6, "0")}`,
              cliente: v.cliente?.nome || "-",
              data: v.criado_em
                ? new Date(v.criado_em).toLocaleString("pt-BR")
                : "-",
              total: formatBRL(Number(v.valor_total || 0)),
              pago: formatBRL(Number(v.valor_pago || 0)),
              saldo: formatBRL(
                Number(v.saldo_devedor || v.valor_total - v.valor_pago || 0),
              ),
            })),
            total: pendentes.length,
          };
        }

        case "caixa_atual": {
          let q = supabase
            .from("caixas")
            .select(
              "data_abertura, data_fechamento, saldo_inicial, saldo_final, status, loja:lojas(nome)",
            )
            .order("data_abertura", { ascending: false })
            .range(from, to);

          const { data, error } = await q;

          if (error) throw error;

          return {
            colunas: [
              { key: "loja", label: "Loja" },
              { key: "abertura", label: "Abertura" },
              { key: "fechamento", label: "Fechamento" },
              { key: "inicial", label: "Saldo Inicial" },
              { key: "final", label: "Saldo Final" },
              { key: "status", label: "Status" },
            ],
            rows: (data || []).map((r: any) => ({
              loja: r.loja?.nome || "-",
              abertura: r.data_abertura
                ? new Date(r.data_abertura).toLocaleString("pt-BR")
                : "-",
              fechamento: r.data_fechamento
                ? new Date(r.data_fechamento).toLocaleString("pt-BR")
                : "-",
              inicial: formatBRL(Number(r.saldo_inicial || 0)),
              final: formatBRL(Number(r.saldo_final || 0)),
              status: r.status || "-",
            })),
            total: data?.length || 0,
          };
        }

        case "estoque_critico": {
          let q = supabase
            .from("estoque_lojas")
            .select(
              "quantidade, produto:produtos(descricao, quantidade_minima), loja:lojas(nome)",
              { count: "exact" },
            )
            .order("quantidade", { ascending: true })
            .limit(2000);

          if (lojaNum) q = q.eq("id_loja", lojaNum);

          const { data, error } = await q;

          if (error) throw error;

          const abaixo = (data || []).filter(
            (e: any) =>
              Number(e.produto?.quantidade_minima || 0) > 0 &&
              Number(e.quantidade) <= Number(e.produto?.quantidade_minima),
          );

          const paginado2 = abaixo.slice(from, to + 1);

          return {
            colunas: [
              { key: "produto", label: "Produto" },
              { key: "loja", label: "Loja" },
              { key: "qtd", label: "Estoque" },
              { key: "minimo", label: "Mínimo" },
            ],
            rows: paginado2.map((e: any) => ({
              produto: e.produto?.descricao || "-",
              loja: e.loja?.nome || "-",
              qtd: `${Number(e.quantidade || 0)} un`,
              minimo: `${Number(e.produto?.quantidade_minima || 0)} un`,
            })),
            total: abaixo.length,
          };
        }

        case "contas_vencidas": {
          const hojeStr = new Date().toISOString().split("T")[0];

          // Poucos registros (contas vencidas): busca tudo, ordena e pagina
          // em memória para a contagem e a paginação ficarem corretas.
          const [ql, qf, qi] = await Promise.all([
            supabase
              .from("contas_lojas")
              .select("descricao, valor, data_vencimento, loja:lojas(nome)")
              .lt("data_vencimento", hojeStr)
              .is("data_pagamento", null),
            supabase
              .from("contas_fornecedores")
              .select(
                "descricao, valor, data_vencimento, fornecedor:fornecedores(nome)",
              )
              .lt("data_vencimento", hojeStr)
              .is("data_pagamento", null),
            supabase
              .from("impostos_contas")
              .select("descricao, valor, data_vencimento")
              .lt("data_vencimento", hojeStr)
              .is("data_pagamento", null),
          ]);

          const todas = [
            ...(ql.data || []).map((r: any) => ({
              descricao: r.descricao || "Conta",
              valor: r.valor,
              vencimento: r.data_vencimento,
              origem: r.loja?.nome || "Loja",
              tipo: "Loja",
            })),
            ...(qf.data || []).map((r: any) => ({
              descricao: r.descricao || "Fornecedor",
              valor: r.valor,
              vencimento: r.data_vencimento,
              origem: r.fornecedor?.nome || "Fornecedor",
              tipo: "Fornecedor",
            })),
            ...(qi.data || []).map((r: any) => ({
              descricao: r.descricao || "Imposto",
              valor: r.valor,
              vencimento: r.data_vencimento,
              origem: "-",
              tipo: "Imposto",
            })),
          ].sort((a, b) =>
            String(a.vencimento || "").localeCompare(
              String(b.vencimento || ""),
            ),
          );

          const total = todas.length;
          const paginado = todas.slice(from, from + pageSize);

          return {
            colunas: [
              { key: "tipo", label: "Tipo" },
              { key: "descricao", label: "Descrição" },
              { key: "origem", label: "Origem" },
              { key: "valor", label: "Valor" },
              { key: "vencimento", label: "Vencimento" },
            ],
            rows: paginado.map((r: any) => ({
              tipo: r.tipo,
              descricao: r.descricao,
              origem: r.origem,
              valor: formatBRL(Number(r.valor || 0)),
              vencimento: r.vencimento
                ? new Date(r.vencimento + "T00:00:00").toLocaleDateString(
                    "pt-BR",
                  )
                : "-",
            })),
            total,
          };
        }

        case "quebras": {
          let q = supabase
            .from("quebra_pecas")
            .select(
              "produto_descricao, quantidade, valor_total, motivo, responsavel, criado_em, aprovado, produto:produtos!quebra_pecas_id_produto_fkey(descricao)",
              { count: "exact" },
            )
            .gte("criado_em", inicioISO)
            .lte("criado_em", fimISO)
            .range(from, to)
            .order("criado_em", { ascending: false });

          if (lojaNum) q = q.eq("id_loja", lojaNum);

          const { data, count, error } = await q;

          if (error) throw error;

          return {
            colunas: [
              { key: "produto", label: "Produto" },
              { key: "qtd", label: "Qtd" },
              { key: "valor", label: "Valor Total" },
              { key: "motivo", label: "Motivo" },
              { key: "responsavel", label: "Responsável" },
              { key: "data", label: "Data" },
              { key: "status", label: "Status" },
            ],
            rows: (data || []).map((r: any) => ({
              produto: r.produto?.descricao || r.produto_descricao || "-",
              qtd: `${Number(r.quantidade || 0)} un`,
              valor: formatBRL(Number(r.valor_total || 0)),
              motivo: r.motivo || "-",
              responsavel: r.responsavel || "-",
              data: r.criado_em
                ? new Date(r.criado_em).toLocaleDateString("pt-BR")
                : "-",
              status: r.aprovado ? "Aprovado" : "Pendente",
            })),
            total: count || 0,
          };
        }

        case "devolucoes": {
          let q = supabase
            .from("devolucoes_venda")
            .select(
              "id, tipo, valor_total, motivo, criado_em, forma_pagamento, venda:vendas!inner(numero_venda, loja_id, cliente:clientes(nome))",
              { count: "exact" },
            )
            .gte("criado_em", inicioISO)
            .lte("criado_em", fimISO)
            .range(from, to)
            .order("criado_em", { ascending: false });

          if (lojaNum) q = q.eq("venda.loja_id", lojaNum);

          const { data, count, error } = await q;

          if (error) throw error;

          return {
            colunas: [
              { key: "id", label: "Devolução" },
              { key: "venda", label: "Venda" },
              { key: "cliente", label: "Cliente" },
              { key: "tipo", label: "Tipo" },
              { key: "valor", label: "Valor" },
              { key: "motivo", label: "Motivo" },
              { key: "data", label: "Data" },
            ],
            rows: (data || []).map((r: any) => ({
              id: r.id?.slice(0, 8) || "-",
              venda: `V${String(r.venda?.numero_venda || 0).padStart(6, "0")}`,
              cliente: r.venda?.cliente?.nome || "-",
              tipo: r.tipo === "com_credito" ? "Com crédito" : "Sem crédito",
              valor: formatBRL(Number(r.valor_total || 0)),
              motivo: r.motivo || "-",
              data: r.criado_em
                ? new Date(r.criado_em).toLocaleString("pt-BR")
                : "-",
            })),
            total: count || 0,
          };
        }

        default:
          return { colunas: [], rows: [], total: 0 };
      }
    } catch (error) {
      console.error(
        `❌ [DASHBOARD] Erro ao buscar detalhe "${cardKey}":`,
        error,
      );

      return { colunas: [], rows: [], total: 0 };
    }
  }

  static async buscarContasVencidas(): Promise<{
    total: number;
    valorTotal: number;
  }> {
    try {
      const hoje = new Date().toISOString().split("T")[0];

      const queries = await Promise.all([
        supabase
          .from("contas_lojas")
          .select("valor", { count: "exact", head: true })
          .lt("data_vencimento", hoje)
          .is("data_pagamento", null),
        supabase
          .from("contas_fornecedores")
          .select("valor", { count: "exact", head: true })
          .lt("data_vencimento", hoje)
          .is("data_pagamento", null),
        supabase
          .from("impostos_contas")
          .select("valor", { count: "exact", head: true })
          .lt("data_vencimento", hoje)
          .is("data_pagamento", null),
      ]);

      let total = 0;
      let valorTotal = 0;

      for (const q of queries) {
        if (q.error) continue;
        total += q.count || 0;
      }

      // Buscar valores totais (head:true não retorna dados, então precisamos de uma segunda query)
      if (total > 0) {
        const [vl, vf, vi] = await Promise.all([
          supabase
            .from("contas_lojas")
            .select("valor")
            .lt("data_vencimento", hoje)
            .is("data_pagamento", null),
          supabase
            .from("contas_fornecedores")
            .select("valor")
            .lt("data_vencimento", hoje)
            .is("data_pagamento", null),
          supabase
            .from("impostos_contas")
            .select("valor")
            .lt("data_vencimento", hoje)
            .is("data_pagamento", null),
        ]);

        for (const d of [
          ...(vl.data || []),
          ...(vf.data || []),
          ...(vi.data || []),
        ]) {
          valorTotal += Number(d.valor || 0);
        }
      }

      return { total, valorTotal };
    } catch (error) {
      console.error("❌ [DASHBOARD] Erro ao buscar contas vencidas:", error);

      return { total: 0, valorTotal: 0 };
    }
  }
}
