import { supabase } from "@/lib/supabaseClient";
import type { DadosDashboard, FiltroDashboard } from "@/types/dashboard";

export class DashboardService {
  static async buscarDadosDashboard(
    filtro: FiltroDashboard
  ): Promise<DadosDashboard> {
    try {
      console.log("🚀 [DASHBOARD] Iniciando busca de dados:", filtro);
      const { data_inicio, data_fim, loja_id } = filtro;

      // Calcular período anterior para comparação
      const inicio = new Date(data_inicio);
      const fim = new Date(data_fim);
      
      // Validar se as datas são válidas
      if (isNaN(inicio.getTime()) || isNaN(fim.getTime())) {
        throw new Error("Datas inválidas fornecidas");
      }
      
      const diasPeriodo = Math.ceil(
        (fim.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24)
      );
      const inicioAnterior = new Date(inicio);
      inicioAnterior.setDate(inicioAnterior.getDate() - diasPeriodo);
      const fimAnterior = new Date(inicio);
      fimAnterior.setDate(fimAnterior.getDate() - 1);

      // Buscar métricas em paralelo
      const [
        metricasAtual,
        metricasAnterior,
        vendasPorDia,
        topProdutos,
        formasPagamento,
        statusOS,
        produtosEstoqueBaixo,
        osAtrasadas,
        caixasAbertos,
        contasReceber,
        topClientes,
        topVendedores,
        osTecnicos,
        pecasMaisUsadas,
        giroEstoque,
        faturamentoMensal,
        rmasAbertas,
        quebrasPendentes,
        metricasAdicionais,
      ] = await Promise.all([
        this.buscarMetricasPeriodo(data_inicio, data_fim, loja_id),
        this.buscarMetricasPeriodo(
          inicioAnterior.toISOString().split("T")[0],
          fimAnterior.toISOString().split("T")[0],
          loja_id
        ),
        this.buscarVendasPorDia(data_inicio, data_fim, loja_id),
        this.buscarTopProdutos(data_inicio, data_fim, loja_id),
        this.buscarFormasPagamento(data_inicio, data_fim, loja_id),
        this.buscarStatusOS(data_inicio, data_fim, loja_id),
        this.buscarProdutosEstoqueBaixo(loja_id),
        this.buscarOSAtrasadas(loja_id),
        this.buscarCaixasAbertos(loja_id),
        this.buscarContasReceber(loja_id),
        this.buscarTopClientes(data_inicio, data_fim, loja_id),
        this.buscarTopVendedores(data_inicio, data_fim, loja_id),
        this.buscarOSTecnicos(data_inicio, data_fim, loja_id),
        this.buscarPecasMaisUsadas(data_inicio, data_fim, loja_id),
        this.buscarGiroEstoque(data_inicio, data_fim, loja_id),
        this.buscarFaturamentoMensal(loja_id),
        this.buscarRMAsAbertas(loja_id),
        this.buscarQuebrasPendentes(loja_id),
        this.buscarMetricasAdicionais(data_inicio, data_fim, loja_id),
      ]);

      // Calcular variações
      const variacaoFaturamento =
        metricasAnterior.faturamento > 0
          ? ((metricasAtual.faturamento - metricasAnterior.faturamento) /
              metricasAnterior.faturamento) *
            100
          : 0;

      const variacaoFaturamentoVendas =
        metricasAnterior.faturamento > 0
          ? ((metricasAtual.faturamento - metricasAnterior.faturamento) /
              metricasAnterior.faturamento) *
            100
          : 0;

      const variacaoFaturamentoOS =
        metricasAnterior.faturamento_os > 0
          ? ((metricasAtual.faturamento_os - metricasAnterior.faturamento_os) /
              metricasAnterior.faturamento_os) *
            100
          : metricasAtual.faturamento_os > 0
            ? 100
            : 0;

      const variacaoVendas =
        metricasAnterior.vendas > 0
          ? ((metricasAtual.vendas - metricasAnterior.vendas) /
              metricasAnterior.vendas) *
            100
          : 0;

      const ticketMedio =
        metricasAtual.vendas > 0
          ? metricasAtual.faturamento / metricasAtual.vendas
          : 0;
      const ticketMedioAnterior =
        metricasAnterior.vendas > 0
          ? metricasAnterior.faturamento / metricasAnterior.vendas
          : 0;
      const variacaoTicketMedio =
        ticketMedioAnterior > 0
          ? ((ticketMedio - ticketMedioAnterior) / ticketMedioAnterior) * 100
          : 0;

      // Calcular variação de vendas fiadas
      const variacaoVendasFiadas =
        metricasAnterior.vendas_fiadas > 0
          ? ((metricasAtual.vendas_fiadas - metricasAnterior.vendas_fiadas) /
              metricasAnterior.vendas_fiadas) *
            100
          : metricasAtual.vendas_fiadas > 0
            ? 100
            : 0;

      // Calcular variação de ganhos
      const variacaoGanhoVendas =
        metricasAnterior.ganho_vendas > 0
          ? ((metricasAtual.ganho_vendas - metricasAnterior.ganho_vendas) /
              metricasAnterior.ganho_vendas) *
            100
          : metricasAtual.ganho_vendas > 0
            ? 100
            : 0;

      const variacaoGanhoOS =
        metricasAnterior.ganho_os > 0
          ? ((metricasAtual.ganho_os - metricasAnterior.ganho_os) /
              metricasAnterior.ganho_os) *
            100
          : metricasAtual.ganho_os > 0
            ? 100
            : 0;

      // Calcular variação de lucro
      const variacaoLucroVendas =
        metricasAnterior.lucro_vendas > 0
          ? ((metricasAtual.lucro_vendas - metricasAnterior.lucro_vendas) /
              metricasAnterior.lucro_vendas) *
            100
          : metricasAtual.lucro_vendas > 0
            ? 100
            : 0;

      const variacaoLucroOS =
        metricasAnterior.lucro_os > 0
          ? ((metricasAtual.lucro_os - metricasAnterior.lucro_os) /
              metricasAnterior.lucro_os) *
            100
          : metricasAtual.lucro_os > 0
            ? 100
            : 0;

      console.log("✅ [DASHBOARD] Dados compilados com sucesso!");
      console.log("📊 [DASHBOARD] Resumo das métricas:", {
        faturamentoVendas: metricasAtual.faturamento,
        faturamentoOS: metricasAtual.faturamento_os,
        vendas: metricasAtual.vendas,
        ticketMedio,
        osAbertas: metricasAtual.os_abertas,
        osConcluidas: metricasAtual.os_concluidas,
        vendasFiadas: metricasAtual.vendas_fiadas,
        novosClientes: metricasAtual.novos_clientes,
        ganhoVendas: metricasAtual.ganho_vendas,
        ganhoOS: metricasAtual.ganho_os,
      });

      return {
        metricas: {
          faturamento_total: metricasAtual.faturamento + metricasAtual.faturamento_os,
          faturamento_periodo_anterior: metricasAnterior.faturamento + metricasAnterior.faturamento_os,
          variacao_faturamento: variacaoFaturamento,

          faturamento_vendas: metricasAtual.faturamento,
          faturamento_vendas_periodo_anterior: metricasAnterior.faturamento,
          variacao_faturamento_vendas: variacaoFaturamentoVendas,

          faturamento_os: metricasAtual.faturamento_os || 0,
          faturamento_os_periodo_anterior: metricasAnterior.faturamento_os || 0,
          variacao_faturamento_os: variacaoFaturamentoOS,

          total_vendas: metricasAtual.vendas,
          vendas_periodo_anterior: metricasAnterior.vendas,
          variacao_vendas: variacaoVendas,

          ticket_medio: ticketMedio,
          ticket_medio_periodo_anterior: ticketMedioAnterior,
          variacao_ticket_medio: variacaoTicketMedio,

          os_abertas: metricasAtual.os_abertas,
          os_concluidas: metricasAtual.os_concluidas,
          os_atrasadas: osAtrasadas.length,

          produtos_estoque_baixo: produtosEstoqueBaixo.filter(
            (p) => p.quantidade_atual > 0
          ).length,
          produtos_estoque_zerado: produtosEstoqueBaixo.filter(
            (p) => p.quantidade_atual === 0
          ).length,

          novos_clientes: metricasAtual.novos_clientes,

          vendas_fiadas: metricasAtual.vendas_fiadas,
          vendas_fiadas_periodo_anterior: metricasAnterior.vendas_fiadas,
          variacao_vendas_fiadas: variacaoVendasFiadas,
          valor_vendas_fiadas: metricasAtual.valor_vendas_fiadas || 0,
          valor_vendas_fiadas_periodo_anterior:
            metricasAnterior.valor_vendas_fiadas || 0,

          ganho_vendas: metricasAtual.ganho_vendas || 0,
          ganho_vendas_periodo_anterior: metricasAnterior.ganho_vendas || 0,
          variacao_ganho_vendas: variacaoGanhoVendas,
          ganho_os: metricasAtual.ganho_os || 0,
          ganho_os_periodo_anterior: metricasAnterior.ganho_os || 0,
          variacao_ganho_os: variacaoGanhoOS,

          lucro_vendas: metricasAtual.lucro_vendas || 0,
          lucro_vendas_periodo_anterior: metricasAnterior.lucro_vendas || 0,
          variacao_lucro_vendas: variacaoLucroVendas,
          lucro_os: metricasAtual.lucro_os || 0,
          lucro_os_periodo_anterior: metricasAnterior.lucro_os || 0,
          variacao_lucro_os: variacaoLucroOS,

          caixas_abertos: caixasAbertos.length,
        },
        vendas_por_dia: vendasPorDia,
        top_produtos: topProdutos,
        formas_pagamento: formasPagamento,
        status_os: statusOS,
        contas_receber: contasReceber.slice(0, 10),
        top_clientes: topClientes,
        top_vendedores: topVendedores,
        os_tecnicos: osTecnicos,
        pecas_mais_usadas: pecasMaisUsadas,
        giro_estoque: giroEstoque,
        faturamento_mensal: faturamentoMensal,
        vendas_fiadas_detalhadas: metricasAtual.vendas_fiadas_detalhadas || [],
        metricas_adicionais: metricasAdicionais,
        alertas: {
          produtos_estoque_baixo: produtosEstoqueBaixo.slice(0, 10),
          os_atrasadas: osAtrasadas.slice(0, 10),
          caixas_abertos: caixasAbertos,
          rmas_abertas: rmasAbertas,
          quebras_pendentes: quebrasPendentes.slice(0, 10),
        },
      };
    } catch (error) {
      console.error("Erro ao buscar dados do dashboard:", error);
      throw error;
    }
  }

  private static async buscarMetricasPeriodo(
    dataInicio: string,
    dataFim: string,
    lojaId?: number
  ) {
    console.log("📊 [MÉTRICAS] Buscando métricas do período:", {
      dataInicio,
      dataFim,
      lojaId,
    });


    // Buscar total exato de vendas no período (sem limite de 1000)
    let queryVendasCount = supabase
      .from("vendas")
      .select("id", { count: "exact", head: true })
      .eq("status", "concluida");
    if (lojaId) {
      queryVendasCount = queryVendasCount.eq("loja_id", lojaId);
    }
    // Filtro de data (usando finalizado_em se existir, senão criado_em)
    // Como não é possível filtrar condicional direto, filtra por ambos os campos
    queryVendasCount = queryVendasCount.gte("criado_em", dataInicio).lte("criado_em", dataFim);

    const { count: totalVendasCount, error: vendasCountError } = await queryVendasCount;
    if (vendasCountError) {
      console.error("❌ [MÉTRICAS] Erro ao contar vendas:", vendasCountError);
    } else {
      console.log("✅ [MÉTRICAS] Total de vendas concluídas (exato):", totalVendasCount || 0);
    }

    // Buscar vendas detalhadas para cálculo de faturamento (ainda limitado a 1000 por padrão)
    let queryVendas = supabase
      .from("vendas")
      .select("id, valor_total, criado_em, finalizado_em, loja_id")
      .eq("status", "concluida");
    if (lojaId) {
      queryVendas = queryVendas.eq("loja_id", lojaId);
    }
    queryVendas = queryVendas.gte("criado_em", dataInicio).lte("criado_em", dataFim);
    const { data: todasVendas, error: vendasError } = await queryVendas;
    if (vendasError) {
      console.error("❌ [MÉTRICAS] Erro ao buscar vendas:", vendasError);
    } else {
      console.log("✅ [MÉTRICAS] Vendas detalhadas para faturamento:", todasVendas?.length || 0);
    }
    // Filtrar por data usando finalizado_em com fallback para criado_em (comparação apenas da parte de data)
    const vendas = todasVendas?.filter((v) => {
      const dataVendaCompleta = v.finalizado_em ? v.finalizado_em : v.criado_em;
      const dataVenda = dataVendaCompleta.split('T')[0];
      return dataVenda >= dataInicio && dataVenda <= dataFim;
    });
    const faturamento = vendas?.reduce((sum, v) => sum + Number(v.valor_total), 0) || 0;
    const totalVendas = totalVendasCount || vendas?.length || 0;
    console.log("💰 [MÉTRICAS] Faturamento Vendas:", faturamento, "Total vendas:", totalVendas);

    // OS concluídas no período para calcular faturamento
    let queryOSPeriodo = supabase
      .from("ordem_servico")
      .select("id, numero_os, status, valor_total, data_conclusao, criado_em, id_loja");

    if (lojaId) {
      queryOSPeriodo = queryOSPeriodo.eq("id_loja", lojaId);
    }

    const { data: todasOS, error: osErroCompleto } = await queryOSPeriodo;

    if (osErroCompleto) {
      console.error("❌ [MÉTRICAS] Erro ao buscar OS para faturamento:", osErroCompleto);
    }

    // Filtrar OS concluídas no período
    const osConcluídasPeriodo = todasOS?.filter((o) => {
      if (o.status !== "entregue" && o.status !== "concluido") return false;
      const dataOS = o.data_conclusao ? o.data_conclusao.split('T')[0] : o.criado_em.split('T')[0];
      return dataOS >= dataInicio && dataOS <= dataFim;
    });

    // Calcular faturamento de OS
    // Se valor_total existe, usar ele; senão buscar soma das peças
    let faturamentoOS = 0;
    const osIds = osConcluídasPeriodo?.map(o => o.id) || [];
    
    if (osIds.length > 0) {
      // Buscar peças para calcular receita
      const { data: pecasOSFat } = await supabase
        .from("ordem_servico_pecas")
        .select("valor_venda, quantidade, id_ordem_servico")
        .in("id_ordem_servico", osIds);

      const receitaPorOS = new Map<string, number>();
      pecasOSFat?.forEach((peca) => {
        const receita = Number(peca.valor_venda || 0) * Number(peca.quantidade || 0);
        const atual = receitaPorOS.get(peca.id_ordem_servico) || 0;
        receitaPorOS.set(peca.id_ordem_servico, atual + receita);
      });

      faturamentoOS = osConcluídasPeriodo?.reduce((sum, o) => {
        // Se valor_total existe e > 0, usar ele, senão usar soma das peças
        const receita = o.valor_total && Number(o.valor_total) > 0
          ? Number(o.valor_total)
          : (receitaPorOS.get(o.id) || 0);
        return sum + receita;
      }, 0) || 0;
    }

    console.log(
      "🔧 [MÉTRICAS] Faturamento OS:",
      faturamentoOS,
      "OS concluídas no período:",
      osConcluídasPeriodo?.length || 0
    );

    // OS abertas e concluídas (TOTAL GERAL, não por período)
    let queryOS = supabase
      .from("ordem_servico")
      .select("status, id_loja");

    if (lojaId) {
      queryOS = queryOS.eq("id_loja", lojaId);
    }

    const { data: os, error: osError } = await queryOS;

    if (osError) {
      console.error("❌ [MÉTRICAS] Erro ao buscar OS:", osError);
    } else {
      console.log("✅ [MÉTRICAS] Total de OS encontradas:", os?.length || 0);
    }

    const osAbertas =
      os?.filter((o) => 
        o.status !== "entregue" && 
        o.status !== "cancelado"
      ).length || 0;
    const osConcluidas = os?.filter((o) => o.status === "entregue").length || 0;

    console.log(
      "🔧 [MÉTRICAS] OS abertas:",
      osAbertas,
      "OS concluídas:",
      osConcluidas
    );

    // Novos clientes
    let queryClientes = supabase
      .from("clientes")
      .select("id, id_loja")
      .gte("criado_em", dataInicio)
      .lte("criado_em", dataFim);

    if (lojaId) {
      queryClientes = queryClientes.eq("id_loja", lojaId);
    }

    const { data: clientes, error: clientesError } = await queryClientes;

    if (clientesError) {
      console.error(
        "❌ [MÉTRICAS] Erro ao buscar novos clientes:",
        clientesError
      );
    } else {
      console.log("✅ [MÉTRICAS] Novos clientes:", clientes?.length || 0);
    }

    const novosClientes = clientes?.length || 0;

    // Vendas fiadas
    let queryVendasFiadas = supabase
      .from("vendas")
      .select(
        "id, loja_id, criado_em, finalizado_em, tipo, status, numero_venda"
      )
      .eq("tipo", "fiada")
      .neq("status", "cancelada");

    if (lojaId) {
      queryVendasFiadas = queryVendasFiadas.eq("loja_id", lojaId);
    }

    const { data: todasVendasFiadas, error: errorFiadas } =
      await queryVendasFiadas;

    if (errorFiadas) {
      console.error("❌ [MÉTRICAS] Erro ao buscar vendas fiadas:", errorFiadas);
    } else {
      console.log(
        "✅ [MÉTRICAS] Total de vendas fiadas:",
        todasVendasFiadas?.length || 0
      );
    }

    // Filtrar por data de criação (extraindo apenas YYYY-MM-DD para comparação correta)
    const vendasFiadas =
      todasVendasFiadas?.filter((v) => {
        // Extrair apenas a parte da data (YYYY-MM-DD) para comparação
        const dataCriacao = v.criado_em.split('T')[0];
        return dataCriacao >= dataInicio && dataCriacao <= dataFim;
      }) || [];

    const totalVendasFiadas = vendasFiadas.length;

    console.log("💳 [VENDAS FIADAS] Filtradas no período:", totalVendasFiadas);

    // Inicializar array vazio para detalhes
    let vendasFiadasComDetalhes: any[] = [];
    let valorTotalVendasFiadas = 0;

    // Só buscar detalhes se houver vendas fiadas
    if (vendasFiadas.length > 0) {
      // Buscar detalhes completos das vendas fiadas para o card detalhado
      const { data: vendasFiadasDetalhadas, error: errorDetalhes } =
        await supabase
          .from("vendas")
          .select(
            `
          id,
          numero_venda,
          valor_total,
          criado_em,
          finalizado_em,
          cliente_id,
          vendedor_id,
          loja_id
        `
          )
          .in(
            "id",
            vendasFiadas.map((v) => v.id)
          );

      if (errorDetalhes) {
        console.error(
          "Erro ao buscar detalhes das vendas fiadas:",
          errorDetalhes
        );
      }

      // Buscar dados relacionados separadamente para evitar erros de join
      const clienteIds =
        vendasFiadasDetalhadas?.map((v) => v.cliente_id).filter(Boolean) || [];
      const vendedorIds =
        vendasFiadasDetalhadas?.map((v) => v.vendedor_id).filter(Boolean) || [];
      const lojaIds =
        vendasFiadasDetalhadas?.map((v) => v.loja_id).filter(Boolean) || [];

      const [{ data: clientes }, { data: vendedores }, { data: lojas }] =
        await Promise.all([
          supabase.from("clientes").select("id, nome").in("id", clienteIds),
          supabase.from("usuarios").select("id, nome").in("id", vendedorIds),
          supabase.from("lojas").select("id, nome").in("id", lojaIds),
        ]);

      // Buscar pagamentos de cada venda fiada
      const vendasIds = vendasFiadas.map((v) => v.id);
      const { data: pagamentos } = await supabase
        .from("pagamentos_venda")
        .select("venda_id, valor")
        .in("venda_id", vendasIds);

      // Calcular totais e detalhes
      vendasFiadasComDetalhes =
        vendasFiadasDetalhadas?.map((v) => {
          const cliente = clientes?.find((c) => c.id === v.cliente_id);
          const vendedor = vendedores?.find((u) => u.id === v.vendedor_id);
          const loja = lojas?.find((l) => l.id === v.loja_id);

          const valorPago =
            pagamentos
              ?.filter((p) => p.venda_id === v.id)
              .reduce((sum, p) => sum + Number(p.valor), 0) || 0;
          const valorPendente = v.valor_total - valorPago;
          const diasEmAberto = Math.floor(
            (new Date().getTime() - new Date(v.criado_em).getTime()) /
              (1000 * 60 * 60 * 24)
          );

          let statusPagamento: "em_dia" | "atrasado" | "muito_atrasado" =
            "em_dia";
          if (diasEmAberto > 60) {
            statusPagamento = "muito_atrasado";
          } else if (diasEmAberto > 30) {
            statusPagamento = "atrasado";
          }

          return {
            id: v.id,
            numero_venda: v.numero_venda,
            cliente_nome: cliente?.nome || "Cliente não identificado",
            vendedor_nome: vendedor?.nome || "Vendedor não identificado",
            loja_nome: loja?.nome || "Loja não identificada",
            valor_total: v.valor_total,
            valor_pago: valorPago,
            valor_pendente: valorPendente,
            criado_em: v.criado_em,
            finalizado_em: v.finalizado_em,
            dias_em_aberto: diasEmAberto,
            status_pagamento: statusPagamento,
          };
        }) || [];

      // Somar o valor PENDENTE (saldo devedor real), não o valor_total
      valorTotalVendasFiadas = vendasFiadasComDetalhes.reduce(
        (sum, v) => sum + Number(v.valor_pendente || 0),
        0
      );

      console.log("💳 [VENDAS FIADAS] Detalhadas encontradas:", vendasFiadasComDetalhes.length);
      console.log("💳 [VENDAS FIADAS] Valor total calculado:", valorTotalVendasFiadas);
    } else {
      console.log("💳 [VENDAS FIADAS] Nenhuma venda fiada no período");
    }

    // Buscar ganhos reais com vendas (DINHEIRO RECEBIDO no período)
    // Pagamentos que foram RECEBIDOS no período, independente de quando a venda foi feita
    // Excluir credito_cliente pois não representa entrada real de dinheiro
    let queryPagamentosVendas = supabase
      .from("pagamentos_venda")
      .select("valor, data_pagamento, tipo_pagamento, venda:vendas!pagamentos_venda_venda_id_fkey(loja_id)")
      .gte("data_pagamento", dataInicio)
      .lte("data_pagamento", dataFim)
      .neq("tipo_pagamento", "credito_cliente");

    const { data: pagamentosVendas, error: errorPagVendas } = await queryPagamentosVendas;

    console.log("💰 [GANHO VENDAS] Pagamentos no período:", pagamentosVendas?.length);
    console.log("💰 [GANHO VENDAS] Erro:", errorPagVendas);

    // Filtrar por loja se necessário
    const pagamentosVendasFiltrados = pagamentosVendas?.filter((p: any) => {
      return !lojaId || p.venda?.loja_id === lojaId;
    });

    const ganhoVendas = pagamentosVendasFiltrados?.reduce(
      (sum, p) => sum + Number(p.valor),
      0
    ) || 0;

    console.log("💵 [GANHO VENDAS] Total calculado:", ganhoVendas);

    // Buscar ganhos reais com OS (DINHEIRO RECEBIDO no período)
    // Pagamentos que foram RECEBIDOS no período, independente de quando a OS foi criada
    let queryPagamentosOS = supabase
      .from("ordem_servico_pagamentos")
      .select("valor, data_pagamento, ordem_servico:ordem_servico!ordem_servico_pagamentos_id_ordem_servico_fkey(id_loja)")
      .gte("data_pagamento", dataInicio)
      .lte("data_pagamento", dataFim);

    const { data: pagamentosOS, error: errorPagOS } = await queryPagamentosOS;

    console.log("🔧 [GANHO OS] Pagamentos no período:", pagamentosOS?.length);
    console.log("🔧 [GANHO OS] Erro:", errorPagOS);

    // Filtrar por loja se necessário
    const pagamentosOSFiltrados = pagamentosOS?.filter((p: any) => {
      return !lojaId || p.ordem_servico?.id_loja === lojaId;
    });

    const ganhoOS = pagamentosOSFiltrados?.reduce(
      (sum, p) => sum + Number(p.valor),
      0
    ) || 0;

    console.log("💵 [GANHO OS] Total calculado:", ganhoOS);

    // Calcular LUCRO das vendas (Receita - Custo)
    // Buscar itens das vendas concluídas no período
    const vendasIds = vendas?.map(v => v.id) || [];
    let lucroVendas = 0;

    if (vendasIds.length > 0) {
      const { data: itensVenda } = await supabase
        .from("itens_venda")
        .select("produto_id, quantidade, preco_unitario")
        .in("venda_id", vendasIds);

      if (itensVenda && itensVenda.length > 0) {
        const produtoIds = Array.from(new Set(itensVenda.map(i => i.produto_id)));
        const { data: produtos } = await supabase
          .from("produtos")
          .select("id, preco_compra")
          .in("id", produtoIds);

        const produtosMap = new Map(produtos?.map(p => [p.id, p.preco_compra]) || []);

        lucroVendas = itensVenda.reduce((sum, item) => {
          const precoCompra = produtosMap.get(item.produto_id) || 0;
          const receita = Number(item.preco_unitario) * item.quantidade;
          const custo = Number(precoCompra) * item.quantidade;
          return sum + (receita - custo);
        }, 0);
      }
    }

    console.log("💰 [LUCRO VENDAS] Total calculado:", lucroVendas);

    // Calcular LUCRO das OS
    // Lucro = Receita Total - Custo das Peças
    // Se valor_total está preenchido, usar ele como receita
    // Senão, usar a soma do valor_venda das peças
    const osIdsLucro = osConcluídasPeriodo?.map(o => o.id) || [];
    let lucroOS = 0;

    if (osIdsLucro.length > 0) {
      // Buscar peças utilizadas nas OS
      const { data: pecasOS } = await supabase
        .from("ordem_servico_pecas")
        .select("valor_custo, valor_venda, quantidade, id_ordem_servico")
        .in("id_ordem_servico", osIdsLucro);

      // Calcular custo e receita das peças por OS
      const dadosPorOS = new Map<string, { custoPecas: number; receitaPecas: number }>();
      
      pecasOS?.forEach((peca) => {
        const custo = Number(peca.valor_custo || 0) * Number(peca.quantidade || 0);
        const receita = Number(peca.valor_venda || 0) * Number(peca.quantidade || 0);
        
        const atual = dadosPorOS.get(peca.id_ordem_servico) || { custoPecas: 0, receitaPecas: 0 };
        dadosPorOS.set(peca.id_ordem_servico, {
          custoPecas: atual.custoPecas + custo,
          receitaPecas: atual.receitaPecas + receita
        });
      });

      // Calcular lucro total
      lucroOS = osConcluídasPeriodo?.reduce((sum, os) => {
        const dados = dadosPorOS.get(os.id) || { custoPecas: 0, receitaPecas: 0 };
        
        // Se valor_total existe e é maior que 0, usar ele como receita
        // Senão, usar a soma do valor_venda das peças
        const receitaTotal = os.valor_total && Number(os.valor_total) > 0 
          ? Number(os.valor_total) 
          : dados.receitaPecas;
        
        const lucroOS = receitaTotal - dados.custoPecas;
        
        console.log(`🔧 [LUCRO OS] OS ${os.id}:`, {
          numero: os.numero_os,
          valorTotal: os.valor_total,
          receitaPecas: dados.receitaPecas,
          receitaUsada: receitaTotal,
          custoPecas: dados.custoPecas,
          lucro: lucroOS
        });
        
        return sum + lucroOS;
      }, 0) || 0;

      const custoTotal = Array.from(dadosPorOS.values()).reduce((sum, val) => sum + val.custoPecas, 0);
      const receitaTotal = Array.from(dadosPorOS.values()).reduce((sum, val) => sum + val.receitaPecas, 0);

      console.log("🔧 [LUCRO OS] Total peças - Custo:", custoTotal, "Receita:", receitaTotal);
      console.log("🔧 [LUCRO OS] Quantidade de OS:", osConcluídasPeriodo?.length);
      console.log("🔧 [LUCRO OS] Quantidade de peças:", pecasOS?.length);
    }

    console.log("🔧 [LUCRO OS] Total calculado:", lucroOS);

    return {
      faturamento,
      faturamento_os: faturamentoOS,
      vendas: totalVendas,
      os_abertas: osAbertas,
      os_concluidas: osConcluidas,
      novos_clientes: novosClientes,
      vendas_fiadas: totalVendasFiadas,
      valor_vendas_fiadas: valorTotalVendasFiadas,
      vendas_fiadas_detalhadas: vendasFiadasComDetalhes,
      ganho_vendas: ganhoVendas,
      ganho_os: ganhoOS,
      lucro_vendas: lucroVendas,
      lucro_os: lucroOS,
    };
  }

  private static async buscarVendasPorDia(
    dataInicio: string,
    dataFim: string,
    lojaId?: number
  ) {
    let queryVendasDias = supabase
      .from("vendas")
      .select("valor_total, finalizado_em, criado_em, loja_id")
      .order("criado_em", { ascending: true });

    if (lojaId) {
      queryVendasDias = queryVendasDias.eq("loja_id", lojaId);
    }

    const { data: todasVendas } = await queryVendasDias;

    if (!todasVendas || todasVendas.length === 0) {
      return [];
    }

    // Filtrar por data usando finalizado_em ou criado_em
    const vendas = todasVendas.filter((v) => {
      const dataVenda = v.finalizado_em || v.criado_em;
      return dataVenda >= dataInicio && dataVenda <= dataFim;
    });

    // Agrupar por dia
    const vendasPorDia: {
      [key: string]: { valor: number; quantidade: number };
    } = {};

    vendas?.forEach((venda) => {
      const dataVenda = venda.finalizado_em || venda.criado_em;
      const data = dataVenda.split("T")[0];
      if (!vendasPorDia[data]) {
        vendasPorDia[data] = { valor: 0, quantidade: 0 };
      }
      vendasPorDia[data].valor += Number(venda.valor_total);
      vendasPorDia[data].quantidade += 1;
    });

    return Object.entries(vendasPorDia).map(([data, info]) => ({
      data,
      valor: info.valor,
      quantidade: info.quantidade,
    }));
  }

  private static async buscarTopProdutos(
    dataInicio: string,
    dataFim: string,
    lojaId?: number
  ) {
    let query = supabase
      .from("itens_venda")
      .select(
        `
        produto_id,
        produto_nome,
        quantidade,
        subtotal,
        venda:vendas!itens_venda_venda_id_fkey(
          status,
          finalizado_em,
          criado_em,
          loja_id
        )
      `
      );

    if (lojaId) {
      query = query.eq("venda.loja_id", lojaId);
    }

    const { data: todosItens } = await query;

    // Filtrar por data
    const itens = todosItens?.filter((item: any) => {
      if (!item.venda) return false;
      const dataVenda = item.venda.finalizado_em || item.venda.criado_em;
      return dataVenda >= dataInicio && dataVenda <= dataFim;
    });

    // Agrupar por produto
    const produtosMap: {
      [key: string]: { nome: string; quantidade: number; valor: number };
    } = {};

    itens?.forEach((item: any) => {
      const id = item.produto_id;
      if (!produtosMap[id]) {
        produtosMap[id] = {
          nome: item.produto_nome,
          quantidade: 0,
          valor: 0,
        };
      }
      produtosMap[id].quantidade += item.quantidade;
      produtosMap[id].valor += Number(item.subtotal);
    });

    return Object.entries(produtosMap)
      .map(([id, info]) => ({
        produto_id: id,
        produto_nome: info.nome,
        quantidade: info.quantidade,
        valor_total: info.valor,
      }))
      .sort((a, b) => b.quantidade - a.quantidade)
      .slice(0, 10);
  }

  private static async buscarFormasPagamento(
    dataInicio: string,
    dataFim: string,
    lojaId?: number
  ) {
    let query = supabase
      .from("pagamentos_venda")
      .select(
        `
        tipo_pagamento,
        valor,
        venda:vendas!pagamentos_venda_venda_id_fkey(
          status,
          finalizado_em,
          criado_em,
          loja_id
        )
      `
      )
      .neq("tipo_pagamento", "credito_cliente");

    if (lojaId) {
      query = query.eq("venda.loja_id", lojaId);
    }

    const { data: todosPagamentos } = await query;

    // Filtrar por data
    const pagamentos = todosPagamentos?.filter((pag: any) => {
      if (!pag.venda) return false;
      const dataVenda = pag.venda.finalizado_em || pag.venda.criado_em;
      return dataVenda >= dataInicio && dataVenda <= dataFim;
    });

    // Agrupar por forma de pagamento
    const formasMap: { [key: string]: { valor: number; quantidade: number } } =
      {};

    pagamentos?.forEach((pag: any) => {
      const forma = pag.tipo_pagamento;
      if (!formasMap[forma]) {
        formasMap[forma] = { valor: 0, quantidade: 0 };
      }
      formasMap[forma].valor += Number(pag.valor);
      formasMap[forma].quantidade += 1;
    });

    const total = Object.values(formasMap).reduce((sum, f) => sum + f.valor, 0);

    return Object.entries(formasMap).map(([forma, info]) => ({
      forma: forma.replace("_", " ").toUpperCase(),
      valor: info.valor,
      quantidade: info.quantidade,
      percentual: total > 0 ? (info.valor / total) * 100 : 0,
    }));
  }

  private static async buscarStatusOS(
    dataInicio: string,
    dataFim: string,
    lojaId?: number
  ) {
    let query = supabase
      .from("ordem_servico")
      .select("status, valor_total, id_loja")
      .gte("criado_em", dataInicio)
      .lte("criado_em", dataFim);

    if (lojaId) {
      query = query.eq("id_loja", lojaId);
    }

    const { data: os } = await query;

    // Agrupar por status
    const statusMap: { [key: string]: { quantidade: number; valor: number } } =
      {};

    os?.forEach((ordem) => {
      const status = ordem.status;
      if (!statusMap[status]) {
        statusMap[status] = { quantidade: 0, valor: 0 };
      }
      statusMap[status].quantidade += 1;
      statusMap[status].valor += Number(ordem.valor_total || 0);
    });

    return Object.entries(statusMap).map(([status, info]) => ({
      status: status.toUpperCase(),
      quantidade: info.quantidade,
      valor_total: info.valor,
    }));
  }

  private static async buscarProdutosEstoqueBaixo(lojaId?: number) {
    let query = supabase.from("estoque_lojas").select(
      `
        id,
        quantidade,
        id_loja,
        produto:produtos!estoque_lojas_id_produto_fkey(
          id,
          descricao,
          quantidade_minima,
          ativo
        ),
        loja:lojas!estoque_lojas_id_loja_fkey(
          nome
        )
      `
    );

    if (lojaId) {
      query = query.eq("id_loja", lojaId);
    }

    const { data: estoques } = await query;

    return (
      estoques
        ?.filter(
          (e: any) =>
            e.produto &&
            e.produto.ativo === true &&
            e.quantidade <= (e.produto.quantidade_minima || 0)
        )
        .map((e: any) => ({
          id: e.produto.id,
          descricao: e.produto.descricao,
          loja: e.loja?.nome || "N/A",
          quantidade_atual: e.quantidade,
          quantidade_minima: e.produto.quantidade_minima || 0,
        }))
        .sort((a, b) => a.quantidade_atual - b.quantidade_atual) || []
    );
  }

  private static async buscarOSAtrasadas(lojaId?: number) {
    const hoje = new Date();
    const hojeISO = hoje.toISOString();

    console.log("📅 [OS ATRASADAS] Debug de datas:");
    console.log("  - Data atual (hoje):", hoje);
    console.log("  - Data atual ISO:", hojeISO);
    console.log(
      "  - Data atual formatada (BR):",
      hoje.toLocaleDateString("pt-BR")
    );
    console.log("  - Timestamp atual:", Date.now());

    let query = supabase
      .from("ordem_servico")
      .select("id, numero_os, cliente_nome, previsao_entrega, status, id_loja")
      .lt("previsao_entrega", hojeISO)
      .neq("status", "entregue")
      .neq("status", "cancelado");

    if (lojaId) {
      query = query.eq("id_loja", lojaId);
    }

    const { data: os } = await query;

    console.log(`  - Total de OS atrasadas encontradas: ${os?.length || 0}`);

    return (
      os?.map((ordem) => {
        const previsao = new Date(ordem.previsao_entrega);
        const diasAtraso = Math.ceil(
          (Date.now() - previsao.getTime()) / (1000 * 60 * 60 * 24)
        );

        console.log(`  - OS #${ordem.numero_os}:`);
        console.log(`    * Previsão entrega (raw): ${ordem.previsao_entrega}`);
        console.log(`    * Previsão entrega (Date): ${previsao}`);
        console.log(
          `    * Previsão entrega (BR): ${previsao.toLocaleDateString("pt-BR")}`
        );
        console.log(`    * Timestamp previsão: ${previsao.getTime()}`);
        console.log(
          `    * Diferença em ms: ${Date.now() - previsao.getTime()}`
        );
        console.log(`    * Dias de atraso calculado: ${diasAtraso}`);
        console.log(`    * Status: ${ordem.status}`);

        return {
          id: ordem.id,
          numero_os: ordem.numero_os,
          cliente_nome: ordem.cliente_nome,
          previsao_entrega: ordem.previsao_entrega,
          dias_atraso: diasAtraso,
          status: ordem.status,
        };
      }) || []
    );
  }

  private static async buscarCaixasAbertos(lojaId?: number) {
    let query = supabase
      .from("caixas")
      .select(
        `
        id,
        data_abertura,
        saldo_inicial,
        loja:lojas!caixas_loja_id_fkey(nome),
        usuario:usuarios!caixas_usuario_abertura_fkey(nome)
      `
      )
      .eq("status", "aberto");

    if (lojaId) {
      query = query.eq("loja_id", lojaId);
    }

    const { data: caixas } = await query;

    return (
      caixas?.map((caixa: any) => {
        const abertura = new Date(caixa.data_abertura);
        const horasAberto =
          (Date.now() - abertura.getTime()) / (1000 * 60 * 60);

        return {
          id: caixa.id,
          loja_nome: caixa.loja?.nome || "N/A",
          usuario_nome: caixa.usuario?.nome || "N/A",
          data_abertura: caixa.data_abertura,
          saldo_inicial: Number(caixa.saldo_inicial),
          horas_aberto: Math.round(horasAberto * 10) / 10,
        };
      }) || []
    );
  }

  // ========== NOVOS MÉTODOS ==========

  private static async buscarContasReceber(lojaId?: number) {
    // filtro de loja aplicado via parâmetro
    let query = supabase
      .from("vendas")
      .select(
        `
        id,
        numero_venda,
        criado_em,
        valor_total,
        valor_pago,
        saldo_devedor,
        data_prevista_pagamento,
        cliente:clientes!vendas_cliente_id_fkey(nome)
      `
      )
      .eq("tipo", "fiada")
      .neq("status", "cancelada")
      .gt("saldo_devedor", 0)
      .order("data_prevista_pagamento", { ascending: true });

    if (lojaId) {
      query = query.eq("loja_id", lojaId);
    }

    const { data: vendas, error: contasError } = await query;

    if (contasError) {
      console.error(
        "❌ [DASHBOARD] Erro ao buscar contas a receber:",
        contasError
      );
      return [];
    }

    // métricas calculadas serão agregadas na camada superior

    return (
      vendas?.map((venda: any) => {
        const hoje = new Date();
        const previsao = new Date(
          venda.data_prevista_pagamento || venda.criado_em
        );
        const diasAtraso = Math.floor(
          (hoje.getTime() - previsao.getTime()) / (1000 * 60 * 60 * 24)
        );

        return {
          venda_id: venda.id,
          numero_venda: venda.numero_venda,
          cliente_nome: venda.cliente?.nome || "N/A",
          data_venda: venda.criado_em,
          valor_total: Number(venda.valor_total),
          valor_pago: Number(venda.valor_pago),
          saldo_devedor: Number(venda.saldo_devedor),
          dias_atraso: diasAtraso > 0 ? diasAtraso : 0,
        };
      }) || []
    );
  }

  private static async buscarTopClientes(
    dataInicio: string,
    dataFim: string,
    lojaId?: number
  ) {
    let query = supabase
      .from("vendas")
      .select(
        `
        cliente_id,
        valor_total,
        finalizado_em,
        criado_em,
        loja_id,
        cliente:clientes!vendas_cliente_id_fkey(nome)
      `
      );

    if (lojaId) {
      query = query.eq("loja_id", lojaId);
    }

    const { data: todasVendas } = await query;

    // Filtrar por data
    const vendas = todasVendas?.filter((v: any) => {
      const dataVenda = v.finalizado_em || v.criado_em;
      return dataVenda >= dataInicio && dataVenda <= dataFim;
    });

    // Agrupar por cliente
    const clientesMap: {
      [key: string]: {
        nome: string;
        total: number;
        quantidade: number;
      };
    } = {};

    vendas?.forEach((venda: any) => {
      const id = venda.cliente_id;
      if (!clientesMap[id]) {
        clientesMap[id] = {
          nome: venda.cliente?.nome || "N/A",
          total: 0,
          quantidade: 0,
        };
      }
      clientesMap[id].total += Number(venda.valor_total);
      clientesMap[id].quantidade += 1;
    });

    return Object.entries(clientesMap)
      .map(([id, info]) => ({
        cliente_id: id,
        cliente_nome: info.nome,
        total_compras: info.total,
        quantidade_vendas: info.quantidade,
        ticket_medio: info.total / info.quantidade,
      }))
      .sort((a, b) => b.total_compras - a.total_compras)
      .slice(0, 10);
  }

  private static async buscarTopVendedores(
    dataInicio: string,
    dataFim: string,
    lojaId?: number
  ) {
    let query = supabase
      .from("vendas")
      .select(
        `
        vendedor_id,
        valor_total,
        finalizado_em,
        criado_em,
        loja_id,
        vendedor:usuarios!vendas_vendedor_id_fkey(nome)
      `
      );

    if (lojaId) {
      query = query.eq("loja_id", lojaId);
    }

    const { data: todasVendas } = await query;

    // Filtrar por data
    const vendas = todasVendas?.filter((v: any) => {
      const dataVenda = v.finalizado_em || v.criado_em;
      return dataVenda >= dataInicio && dataVenda <= dataFim;
    });

    // Agrupar por vendedor
    const vendedoresMap: {
      [key: string]: {
        nome: string;
        total: number;
        quantidade: number;
      };
    } = {};

    vendas?.forEach((venda: any) => {
      const id = venda.vendedor_id;
      if (!vendedoresMap[id]) {
        vendedoresMap[id] = {
          nome: venda.vendedor?.nome || "N/A",
          total: 0,
          quantidade: 0,
        };
      }
      vendedoresMap[id].total += Number(venda.valor_total);
      vendedoresMap[id].quantidade += 1;
    });

    return Object.entries(vendedoresMap)
      .map(([id, info]) => ({
        vendedor_id: id,
        vendedor_nome: info.nome,
        total_vendas: info.quantidade,
        quantidade_vendas: info.quantidade,
        ticket_medio: info.total / info.quantidade,
        total_faturamento: info.total,
      }))
      .sort((a, b) => b.total_faturamento - a.total_faturamento)
      .slice(0, 10);
  }

  private static async buscarOSTecnicos(
    dataInicio: string,
    dataFim: string,
    lojaId?: number
  ) {
    let query = supabase
      .from("ordem_servico")
      .select(
        `
        id,
        tecnico_responsavel,
        status,
        valor_total,
        data_entrada,
        data_conclusao,
        id_loja
      `
      )
      .not("tecnico_responsavel", "is", null)
      .gte("data_entrada", dataInicio)
      .lte("data_entrada", dataFim);

    if (lojaId) {
      query = query.eq("id_loja", lojaId);
    }

    const { data: os } = await query;

    // Buscar nomes dos técnicos - primeiro da tabela tecnicos, depois usuarios
    const tecnicoIds = Array.from(
      new Set(os?.map((o: any) => o.tecnico_responsavel))
    );

    // Buscar na tabela tecnicos
    const { data: tecnicos } = await supabase
      .from("tecnicos")
      .select("usuario_id, nome")
      .in("usuario_id", tecnicoIds);

    // Se não encontrar na tabela tecnicos, buscar direto na usuarios
    const tecnicosMap = new Map(tecnicos?.map((t) => [t.usuario_id, t.nome]));

    // Para os que não foram encontrados em tecnicos, buscar em usuarios
    const idsNaoEncontrados = tecnicoIds.filter((id) => !tecnicosMap.has(id));
    if (idsNaoEncontrados.length > 0) {
      const { data: usuarios } = await supabase
        .from("usuarios")
        .select("id, nome")
        .in("id", idsNaoEncontrados);

      usuarios?.forEach((u) => tecnicosMap.set(u.id, u.nome));
    }

    // Agrupar por técnico
    const tecnicosStats: {
      [key: string]: {
        nome: string;
        concluidas: number;
        em_andamento: number;
        dias_total: number;
        valor_total: number;
      };
    } = {};

    os?.forEach((ordem: any) => {
      const id = ordem.tecnico_responsavel;
      if (!tecnicosStats[id]) {
        tecnicosStats[id] = {
          nome: tecnicosMap.get(id) || "N/A",
          concluidas: 0,
          em_andamento: 0,
          dias_total: 0,
          valor_total: 0,
        };
      }

      if (ordem.status === "entregue") {
        tecnicosStats[id].concluidas += 1;
        if (ordem.data_conclusao) {
          const entrada = new Date(ordem.data_entrada);
          const conclusao = new Date(ordem.data_conclusao);
          const dias =
            (conclusao.getTime() - entrada.getTime()) / (1000 * 60 * 60 * 24);
          tecnicosStats[id].dias_total += dias;
        }
      } else if (ordem.status !== "cancelado") {
        tecnicosStats[id].em_andamento += 1;
      }

      tecnicosStats[id].valor_total += Number(ordem.valor_total || 0);
    });

    return Object.entries(tecnicosStats).map(([id, stats]) => ({
      tecnico_id: id,
      tecnico_nome: stats.nome,
      os_concluidas: stats.concluidas,
      os_em_andamento: stats.em_andamento,
      tempo_medio_conclusao:
        stats.concluidas > 0
          ? Math.round((stats.dias_total / stats.concluidas) * 10) / 10
          : 0,
      valor_total_os: stats.valor_total,
    }));
  }

  private static async buscarPecasMaisUsadas(
    dataInicio: string,
    dataFim: string,
    lojaId?: number
  ) {
    let query = supabase
      .from("ordem_servico_pecas")
      .select(
        `
        id_produto,
        descricao_peca,
        quantidade,
        valor_total,
        id_ordem_servico,
        ordem_servico:ordem_servico!ordem_servico_pecas_id_ordem_servico_fkey(
          data_entrada,
          id_loja
        )
      `
      )
      .not("id_produto", "is", null)
      .eq("estoque_baixado", true);

    if (lojaId) {
      query = query.eq("id_loja", lojaId);
    }

    const { data: todasPecas } = await query;

    // Filtrar por data
    const pecas = todasPecas?.filter((p: any) => {
      const dataOS = p.ordem_servico?.data_entrada;
      return dataOS && dataOS >= dataInicio && dataOS <= dataFim;
    });

    // Agrupar por produto
    const pecasMap: {
      [key: string]: {
        descricao: string;
        quantidade: number;
        valor: number;
        os_count: Set<string>;
      };
    } = {};

    pecas?.forEach((peca: any) => {
      const id = peca.id_produto;
      if (!pecasMap[id]) {
        pecasMap[id] = {
          descricao: peca.descricao_peca,
          quantidade: 0,
          valor: 0,
          os_count: new Set(),
        };
      }
      pecasMap[id].quantidade += peca.quantidade;
      pecasMap[id].valor += Number(peca.valor_total);
      pecasMap[id].os_count.add(peca.id_ordem_servico);
    });

    return Object.entries(pecasMap)
      .map(([id, info]) => ({
        produto_id: id,
        produto_nome: info.descricao,
        quantidade_usada: info.quantidade,
        valor_total: info.valor,
        quantidade_os: info.os_count.size,
      }))
      .sort((a, b) => b.quantidade_usada - a.quantidade_usada)
      .slice(0, 10);
  }

  private static async buscarGiroEstoque(
    dataInicio: string,
    dataFim: string,
    lojaId?: number
  ) {
    // Buscar vendas de produtos
    let query = supabase
      .from("itens_venda")
      .select(
        `
        produto_id,
        produto_nome,
        quantidade,
        venda:vendas!itens_venda_venda_id_fkey(
          status,
          finalizado_em,
          criado_em,
          loja_id
        )
      `
      );

    if (lojaId) {
      query = query.eq("venda.loja_id", lojaId);
    }

    const { data: todosItens } = await query;

    // Filtrar por data
    const itens = todosItens?.filter((item: any) => {
      if (!item.venda) return false;
      const dataVenda = item.venda.finalizado_em || item.venda.criado_em;
      return dataVenda >= dataInicio && dataVenda <= dataFim;
    });

    // Buscar estoque atual
    let queryEstoque = supabase.from("estoque_lojas").select(
      `
        id_produto,
        quantidade,
        produto:produtos!estoque_lojas_id_produto_fkey(descricao)
      `
    );

    if (lojaId) {
      queryEstoque = queryEstoque.eq("id_loja", lojaId);
    }

    const { data: estoques } = await queryEstoque;

    // Agrupar vendas por produto
    const vendasMap: { [key: string]: { nome: string; quantidade: number } } =
      {};

    itens?.forEach((item: any) => {
      const id = item.produto_id;
      if (!vendasMap[id]) {
        vendasMap[id] = {
          nome: item.produto_nome,
          quantidade: 0,
        };
      }
      vendasMap[id].quantidade += item.quantidade;
    });

    // Calcular giro
    const giros = Object.entries(vendasMap)
      .map(([id, info]) => {
        const estoque = estoques?.find((e: any) => e.id_produto === id);
        const estoqueAtual = estoque?.quantidade || 0;
        const estoqueInicial = estoqueAtual + info.quantidade;
        const estoqueMedio = (estoqueInicial + estoqueAtual) / 2;
        const giro = estoqueMedio > 0 ? info.quantidade / estoqueMedio : 0;

        return {
          produto_id: id,
          produto_nome: info.nome,
          quantidade_vendida: info.quantidade,
          estoque_medio: Math.round(estoqueMedio),
          giro: Math.round(giro * 100) / 100,
        };
      })
      .filter((g) => g.quantidade_vendida > 0)
      .sort((a, b) => b.giro - a.giro)
      .slice(0, 10);

    return giros;
  }

  private static async buscarFaturamentoMensal(lojaId?: number) {
    const hoje = new Date();
    const seisMesesAtras = new Date(hoje);
    seisMesesAtras.setMonth(seisMesesAtras.getMonth() - 6);

    // Buscar vendas dos últimos 6 meses
    let queryVendas = supabase
      .from("vendas")
      .select("valor_total, finalizado_em, criado_em, loja_id")
      .gte("criado_em", seisMesesAtras.toISOString());

    if (lojaId) {
      queryVendas = queryVendas.eq("loja_id", lojaId);
    }

    const { data: vendas } = await queryVendas;

    // Buscar OS dos últimos 6 meses
    let queryOS = supabase
      .from("ordem_servico")
      .select("valor_total, data_conclusao, data_entrada, id_loja")
      .eq("status", "entregue")
      .gte("data_entrada", seisMesesAtras.toISOString());

    if (lojaId) {
      queryOS = queryOS.eq("id_loja", lojaId);
    }

    const { data: os } = await queryOS;

    // Agrupar por mês
    const mesesMap: {
      [key: string]: { vendas: number; os: number };
    } = {};

    vendas?.forEach((venda: any) => {
      const data = new Date(venda.finalizado_em || venda.criado_em);
      const mesAno = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, "0")}`;
      if (!mesesMap[mesAno]) {
        mesesMap[mesAno] = { vendas: 0, os: 0 };
      }
      mesesMap[mesAno].vendas += Number(venda.valor_total);
    });

    os?.forEach((ordem: any) => {
      const data = new Date(ordem.data_conclusao || ordem.data_entrada);
      const mesAno = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, "0")}`;
      if (!mesesMap[mesAno]) {
        mesesMap[mesAno] = { vendas: 0, os: 0 };
      }
      mesesMap[mesAno].os += Number(ordem.valor_total || 0);
    });

    // Converter para array e ordenar
    return Object.entries(mesesMap)
      .map(([mes, valores]) => ({
        mes,
        faturamento_vendas: valores.vendas,
        faturamento_os: valores.os,
        total: valores.vendas + valores.os,
      }))
      .sort((a, b) => a.mes.localeCompare(b.mes));
  }

  private static async buscarRMAsAbertas(lojaId?: number) {
    let query = supabase
      .from("rmas")
      .select(
        `
        id,
        numero_rma,
        status,
        quantidade,
        criado_em,
        produto:produtos!rmas_produto_id_fkey(descricao),
        fornecedor:fornecedores!rmas_fornecedor_id_fkey(nome),
        loja_id
      `
      )
      .in("status", ["pendente", "em_analise", "em_transito"])
      .order("criado_em", { ascending: true });

    if (lojaId) {
      query = query.eq("loja_id", lojaId);
    }

    const { data: rmas } = await query;

    return (
      rmas?.map((rma: any) => {
        const criacao = new Date(rma.criado_em);
        const diasAberta = Math.floor(
          (Date.now() - criacao.getTime()) / (1000 * 60 * 60 * 24)
        );

        return {
          id: rma.id,
          numero_rma: rma.numero_rma,
          produto_nome: rma.produto?.descricao || "N/A",
          fornecedor_nome: rma.fornecedor?.nome || "N/A",
          quantidade: rma.quantidade,
          status: rma.status,
          dias_aberta: diasAberta,
        };
      }) || []
    );
  }

  private static async buscarQuebrasPendentes(lojaId?: number) {
    let query = supabase
      .from("quebra_pecas")
      .select(
        `
        id,
        produto_descricao,
        quantidade,
        valor_total,
        tipo_ocorrencia,
        motivo,
        responsavel,
        aprovado,
        criado_em,
        id_loja
      `
      )
      .eq("aprovado", false)
      .order("criado_em", { ascending: false });

    if (lojaId) {
      query = query.eq("id_loja", lojaId);
    }

    const { data: quebras } = await query;

    return (
      quebras?.map((quebra) => {
        const criacao = new Date(quebra.criado_em);
        const diasPendente = Math.floor(
          (Date.now() - criacao.getTime()) / (1000 * 60 * 60 * 24)
        );

        return {
          id: quebra.id,
          produto_descricao: quebra.produto_descricao || "N/A",
          quantidade: quebra.quantidade,
          valor_total: Number(quebra.valor_total) || 0,
          tipo_ocorrencia: quebra.tipo_ocorrencia,
          motivo: quebra.motivo,
          responsavel: quebra.responsavel || "N/A",
          aprovado: quebra.aprovado,
          criado_em: quebra.criado_em,
          dias_pendente: diasPendente,
        };
      }) || []
    );
  }

  private static async buscarMetricasAdicionais(
    dataInicio: string,
    dataFim: string,
    lojaId?: number
  ) {
    console.log("🔍 [DASHBOARD] Buscando métricas adicionais:", {
      dataInicio,
      dataFim,
      lojaId,
    });

    // Contas a receber total
    let queryContasReceber = supabase
      .from("vendas")
      .select("saldo_devedor, loja_id")
      .eq("tipo", "fiada")
      .neq("status", "cancelada")
      .gt("saldo_devedor", 0);

    if (lojaId) {
      queryContasReceber = queryContasReceber.eq("loja_id", lojaId);
    }

    const { data: contasReceber, error: crError } = await queryContasReceber;

    if (crError) {
      console.error(
        "❌ [DASHBOARD] Erro ao buscar contas a receber total:",
        crError
      );
    }

    const contasReceberTotal =
      contasReceber?.reduce((sum, v) => sum + Number(v.saldo_devedor), 0) || 0;
    const contasReceberQtd = contasReceber?.length || 0;

    console.log("💰 [DASHBOARD] Total contas a receber:", contasReceberTotal);

    // Créditos de clientes
    let queryCreditos = supabase
      .from("creditos_cliente")
      .select("saldo")
      .gt("saldo", 0);

    const { data: creditos } = await queryCreditos;
    const creditosTotal =
      creditos?.reduce((sum, c) => sum + Number(c.saldo), 0) || 0;

    // Taxa de conversão de OS
    let queryOSTaxa = supabase
      .from("ordem_servico")
      .select("status, id_loja")
      .gte("data_entrada", dataInicio)
      .lte("data_entrada", dataFim);

    if (lojaId) {
      queryOSTaxa = queryOSTaxa.eq("id_loja", lojaId);
    }

    const { data: osTaxa } = await queryOSTaxa;
    const totalOS = osTaxa?.length || 0;
    const osAprovadas =
      osTaxa?.filter((os) => os.status !== "cancelado").length || 0;
    const taxaConversao = totalOS > 0 ? (osAprovadas / totalOS) * 100 : 0;

    // Tempo médio de reparo
    let queryOSTempo = supabase
      .from("ordem_servico")
      .select("data_entrada, data_conclusao, id_loja")
      .eq("status", "entregue")
      .not("data_conclusao", "is", null)
      .gte("data_entrada", dataInicio)
      .lte("data_entrada", dataFim);

    if (lojaId) {
      queryOSTempo = queryOSTempo.eq("id_loja", lojaId);
    }

    const { data: osTempo } = await queryOSTempo;
    let tempoMedioReparo = 0;
    if (osTempo && osTempo.length > 0) {
      const somaTempos = osTempo.reduce((sum, os) => {
        const entrada = new Date(os.data_entrada);
        const conclusao = new Date(os.data_conclusao);
        const dias =
          (conclusao.getTime() - entrada.getTime()) / (1000 * 60 * 60 * 24);
        return sum + dias;
      }, 0);
      tempoMedioReparo = Math.round((somaTempos / osTempo.length) * 10) / 10;
    }

    // Sangrias do período
    let querySangrias = supabase
      .from("sangrias_caixa")
      .select(
        `
        valor,
        caixa:caixas!sangrias_caixa_caixa_id_fkey(loja_id)
      `
      )
      .gte("criado_em", dataInicio)
      .lte("criado_em", dataFim);

    const { data: todasSangrias } = await querySangrias;
    let sangrias = todasSangrias || [];

    if (lojaId && todasSangrias) {
      sangrias = todasSangrias.filter((s: any) => s.caixa?.loja_id === lojaId);
    }

    const sangriasTotal =
      sangrias?.reduce((sum, s) => sum + Number(s.valor), 0) || 0;

    // Produtos inativos
    let queryProdutosInativos = supabase
      .from("produtos")
      .select("id")
      .eq("ativo", false);

    const { data: produtosInativos } = await queryProdutosInativos;

    // Valor médio de OS
    let queryValorOS = supabase
      .from("ordem_servico")
      .select("valor_total, id_loja")
      .eq("status", "entregue")
      .not("valor_total", "is", null)
      .gte("data_entrada", dataInicio)
      .lte("data_entrada", dataFim);

    if (lojaId) {
      queryValorOS = queryValorOS.eq("id_loja", lojaId);
    }

    const { data: osValor } = await queryValorOS;
    const valorMedioOS =
      osValor && osValor.length > 0
        ? osValor.reduce((sum, os) => sum + Number(os.valor_total), 0) /
          osValor.length
        : 0;

    // Quebras de peças
    let queryQuebras = supabase
      .from("quebra_pecas")
      .select("valor_total, quantidade, aprovado, id_loja, criado_em")
      .gte("criado_em", dataInicio)
      .lte("criado_em", dataFim);

    if (lojaId) {
      queryQuebras = queryQuebras.eq("id_loja", lojaId);
    }

    const { data: quebras } = await queryQuebras;

    const quebrasTotalValor =
      quebras?.reduce((sum, q) => sum + Number(q.valor_total || 0), 0) || 0;

    const quebrasTotalQuantidade =
      quebras?.reduce((sum, q) => sum + Number(q.quantidade || 0), 0) || 0;

    const quebrasPendentesAprovacao =
      quebras?.filter((q) => !q.aprovado).length || 0;

    // Novas métricas - Transferências pendentes
    console.log("📦 [DASHBOARD] Buscando transferências pendentes...");
    let queryTransferencias = supabase
      .from("transferencias")
      .select(
        "id, loja_origem_id, loja_destino_id, status, criado_em, transferencias_itens(quantidade)"
      )
      .eq("status", "pendente"); // Removido filtro de data - transferências pendentes devem aparecer sempre

    if (lojaId) {
      queryTransferencias = queryTransferencias.or(
        `loja_origem_id.eq.${lojaId},loja_destino_id.eq.${lojaId}`
      );
    }

    const { data: transferencias, error: transError } =
      await queryTransferencias;

    if (transError) {
      console.error(
        "❌ [DASHBOARD] Erro ao buscar transferências:",
        transError
      );
    } else {
      console.log(
        "✅ [DASHBOARD] Transferências encontradas:",
        transferencias?.length || 0
      );
    }

    const transferenciasPendentes = transferencias?.length || 0;
    const valorTransferenciasPendentes = 0; // Não temos valor_total na tabela transferencias

    // Devoluções do mês
    console.log("↩️ [DASHBOARD] Buscando devoluções do período...");
    let queryDevolucoes = supabase
      .from("devolucoes_venda")
      .select(
        `
        id, 
        valor_total,
        venda:vendas!devolucoes_venda_venda_id_fkey(loja_id),
        criado_em
      `
      )
      .gte("criado_em", dataInicio)
      .lte("criado_em", dataFim);

    const { data: todasDevolucoes, error: devError } = await queryDevolucoes;

    if (devError) {
      console.error("❌ [DASHBOARD] Erro ao buscar devoluções:", devError);
    } else {
      console.log(
        "✅ [DASHBOARD] Devoluções encontradas:",
        todasDevolucoes?.length || 0
      );
    }

    let devolucoes = todasDevolucoes || [];
    if (lojaId && todasDevolucoes) {
      devolucoes = todasDevolucoes.filter(
        (d: any) => d.venda?.loja_id === lojaId
      );
    }

    const devolucoesMes = devolucoes.length;
    const valorDevolucoesMes =
      devolucoes.reduce((sum, d) => sum + Number(d.valor_total || 0), 0) || 0;

    // Todas as sangrias (filtradas por período)
    console.log("💰 [DASHBOARD] Buscando todas as sangrias do período...");
    let querySangriasPeriodo = supabase
      .from("sangrias_caixa")
      .select(
        `
        id,
        valor,
        motivo,
        caixa_id,
        criado_em
      `
      )
      .gte("criado_em", `${dataInicio}T00:00:00`)
      .lte("criado_em", `${dataFim}T23:59:59`);

    const { data: sangriasDia, error: sangriasError } = await querySangriasPeriodo;

    if (sangriasError) {
      console.error("❌ [DASHBOARD] Erro ao buscar sangrias:", sangriasError);
    }

    let sangriasFiltradas = sangriasDia || [];
    
    // Se precisar filtrar por loja, buscar os caixas separadamente
    if (lojaId && sangriasDia && sangriasDia.length > 0) {
      const caixaIds = sangriasDia.map((s: any) => s.caixa_id).filter(Boolean);
      
      if (caixaIds.length > 0) {
        const { data: caixas } = await supabase
          .from("caixas")
          .select("id, loja_id")
          .in("id", caixaIds);
        
        const caixasLoja = caixas?.filter(c => c.loja_id === lojaId).map(c => c.id) || [];
        sangriasFiltradas = sangriasDia.filter((s: any) => caixasLoja.includes(s.caixa_id));
      }
    }

    const totalSangrias = sangriasFiltradas.length;
    const valorTotalSangrias =
      sangriasFiltradas.reduce(
        (sum, s) => sum + Math.abs(Number(s.valor || 0)),
        0
      ) || 0;

    console.log("📊 [DASHBOARD] Métricas adicionais calculadas:", {
      contasReceberTotal,
      creditosTotal,
      taxaConversao: Math.round(taxaConversao * 10) / 10,
      tempoMedioReparo,
      transferenciasPendentes,
      valorTransferenciasPendentes,
      devolucoesMes,
      valorDevolucoesMes,
      totalSangrias,
      valorTotalSangrias,
    });

    return {
      contas_receber_total: contasReceberTotal,
      contas_receber_qtd: contasReceberQtd,
      creditos_cliente_total: creditosTotal,
      taxa_conversao_os: Math.round(taxaConversao * 10) / 10,
      tempo_medio_reparo_dias: tempoMedioReparo,
      sangrias_total: sangriasTotal,
      produtos_inativos: produtosInativos?.length || 0,
      valor_medio_os: valorMedioOS,
      quebras_total_valor: quebrasTotalValor,
      quebras_total_quantidade: quebrasTotalQuantidade,
      quebras_pendentes_aprovacao: quebrasPendentesAprovacao,
      transferencias_pendentes: transferenciasPendentes,
      valor_transferencias_pendentes: valorTransferenciasPendentes,
      devolucoes_mes: devolucoesMes,
      valor_devolucoes_mes: valorDevolucoesMes,
      movimentacoes_caixa_dia: totalSangrias,
      valor_movimentacoes_caixa_dia: valorTotalSangrias,
    };
  }
}
