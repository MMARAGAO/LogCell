import { supabase } from "@/lib/supabaseClient";
import {
  CaixaCompleto,
  AbrirCaixaParams,
  FecharCaixaParams,
  ResumoCaixa,
  MovimentacaoCaixa,
} from "@/types/caixa";

export class CaixaService {
  // Abrir caixa
  static async abrirCaixa(params: AbrirCaixaParams): Promise<CaixaCompleto> {
    try {
      // Verificar se já existe caixa aberto
      const { data: caixaAberto, error: erroVerificacao } = await supabase
        .from("caixas")
        .select("*")
        .eq("loja_id", params.loja_id)
        .eq("status", "aberto")
        .single();

      if (caixaAberto) {
        throw new Error("Já existe um caixa aberto para esta loja");
      }

      // Criar novo caixa
      const { data, error } = await supabase
        .from("caixas")
        .insert({
          loja_id: params.loja_id,
          usuario_abertura: params.usuario_id,
          saldo_inicial: params.saldo_inicial,
          observacoes_abertura: params.observacoes_abertura,
          status: "aberto",
        })
        .select(
          `
          *,
          loja:lojas(id, nome),
          usuario_abertura_info:usuarios!caixas_usuario_abertura_fkey(id, nome)
        `,
        )
        .single();

      if (error) throw error;

      return data as CaixaCompleto;
    } catch (error: any) {
      console.error("Erro ao abrir caixa:", error);
      throw error;
    }
  }

  // Fechar caixa
  static async fecharCaixa(params: FecharCaixaParams): Promise<CaixaCompleto> {
    try {
      const { data, error } = await supabase
        .from("caixas")
        .update({
          usuario_fechamento: params.usuario_id,
          data_fechamento: new Date().toISOString(),
          saldo_final: params.saldo_final,
          observacoes_fechamento: params.observacoes_fechamento,
          status: "fechado",
          atualizado_em: new Date().toISOString(),
        })
        .eq("id", params.caixa_id)
        .select(
          `
          *,
          loja:lojas(id, nome),
          usuario_abertura_info:usuarios!caixas_usuario_abertura_fkey(id, nome),
          usuario_fechamento_info:usuarios!caixas_usuario_fechamento_fkey(id, nome)
        `,
        )
        .single();

      if (error) throw error;

      return data as CaixaCompleto;
    } catch (error: any) {
      console.error("Erro ao fechar caixa:", error);
      throw error;
    }
  }

  // Buscar caixa aberto de uma loja
  static async buscarCaixaAberto(
    lojaId: number,
  ): Promise<CaixaCompleto | null> {
    try {
      const { data, error } = await supabase
        .from("caixas")
        .select(
          `
          *,
          loja:lojas(id, nome),
          usuario_abertura_info:usuarios!caixas_usuario_abertura_fkey(id, nome)
        `,
        )
        .eq("loja_id", lojaId)
        .eq("status", "aberto")
        .maybeSingle();

      if (error) throw error;

      return data as CaixaCompleto | null;
    } catch (error: any) {
      console.error("Erro ao buscar caixa aberto:", error);

      return null;
    }
  }

  // Listar caixas com filtros
  static async listarCaixas(filtros?: {
    loja_id?: number;
    status?: "aberto" | "fechado";
    data_inicio?: string;
    data_fim?: string;
    page?: number;
    pageSize?: number;
  }): Promise<{ data: CaixaCompleto[]; count: number }> {
    try {
      let query = supabase
        .from("caixas")
        .select(
          `
          *,
          loja:lojas(id, nome),
          usuario_abertura_info:usuarios!caixas_usuario_abertura_fkey(id, nome),
          usuario_fechamento_info:usuarios!caixas_usuario_fechamento_fkey(id, nome)
        `,
          { count: "exact", head: false },
        )
        .order("data_abertura", { ascending: false });

      if (filtros?.loja_id) {
        query = query.eq("loja_id", filtros.loja_id);
      }

      if (filtros?.status) {
        query = query.eq("status", filtros.status);
      }

      if (filtros?.data_inicio) {
        query = query.gte("data_abertura", filtros.data_inicio);
      }

      if (filtros?.data_fim) {
        query = query.lte("data_abertura", filtros.data_fim);
      }

      if (filtros?.page && filtros?.pageSize) {
        const from = (filtros.page - 1) * filtros.pageSize;
        const to = from + filtros.pageSize - 1;

        query = query.range(from, to);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      return { data: (data as CaixaCompleto[]) || [], count: count || 0 };
    } catch (error: any) {
      console.error("Erro ao listar caixas:", error);

      return { data: [], count: 0 };
    }
  }

  // Buscar resumo do caixa
  static async buscarResumoCaixa(caixaId: string): Promise<ResumoCaixa> {
    try {
      // Buscar dados do caixa
      const { data: caixa, error: erroCaixa } = await supabase
        .from("caixas")
        .select("*")
        .eq("id", caixaId)
        .single();

      if (erroCaixa) {
        console.error("❌ Erro ao buscar caixa:", erroCaixa);
        throw new Error(
          `Erro ao buscar caixa: ${erroCaixa.message || JSON.stringify(erroCaixa)}`,
        );
      }

      console.log("🔍 DEBUG CAIXA - Dados do caixa:", {
        id: caixa.id,
        data_abertura: caixa.data_abertura,
        data_fechamento: caixa.data_fechamento,
        loja_id: caixa.loja_id,
      });

      const dataAbertura = caixa.data_abertura;
      const dataFechamento = caixa.data_fechamento || new Date().toISOString();

      // Buscar pagamentos de vendas do período (buscar pelo momento do pagamento)
      const { data: pagamentosRaw, error: erroPagamentos } = await supabase
        .from("pagamentos_venda")
        .select(
          `
          id,
          tipo_pagamento,
          valor,
          criado_em,
          venda:vendas!pagamentos_venda_venda_id_fkey(
            id,
            numero_venda,
            loja_id,
            valor_total,
            status
          )
        `,
        )
        .gte("criado_em", dataAbertura)
        .lte("criado_em", dataFechamento)
        .eq("venda.loja_id", caixa.loja_id);
      const pagamentosLoja = (pagamentosRaw || []).filter(
        (pag: any) => pag.venda?.loja_id === caixa.loja_id,
      );

      // Buscar IDs de vendas que possuem aparelhos (para separar no resumo)
      const vendaIdsNoPeriodo = pagamentosLoja
        .map((p: any) => p.venda?.id)
        .filter(Boolean);
      const { data: aparelhosNoPeriodo } = await supabase
        .from("aparelhos")
        .select("venda_id")
        .in(
          "venda_id",
          vendaIdsNoPeriodo.length > 0
            ? vendaIdsNoPeriodo
            : ["00000000-0000-0000-0000-000000000000"],
        );
      const vendasComAparelhos = new Set<string>(
        (aparelhosNoPeriodo || []).map((a: any) => a.venda_id),
      );

      // Buscar devoluções do período
      const { data: devolucoesRaw, error: erroDevolucoes } = await supabase
        .from("devolucoes_venda")
        .select(
          `
          id,
          valor_total,
          criado_em,
          tipo,
          venda_id,
          venda:vendas!devolucoes_venda_venda_id_fkey(
            id,
            loja_id,
            criado_em,
            valor_total
          )
        `,
        )
        .gte("criado_em", dataAbertura)
        .lte("criado_em", dataFechamento)
        .eq("venda.loja_id", caixa.loja_id);
      const devolucoesLoja = devolucoesRaw || [];

      // Buscar ordens de serviço pagas no período
      console.log("🔍 Buscando OS do período:", {
        dataAbertura,
        dataFechamento,
        lojaId: caixa.loja_id,
      });

      const { data: ordensServico, error: erroOS } = await supabase
        .from("ordem_servico_pagamentos")
        .select(
          `
          id,
          valor,
          forma_pagamento,
          criado_em,
          ordem_servico:ordem_servico!ordem_servico_pagamentos_id_ordem_servico_fkey(id_loja, numero_os, cliente_nome)
        `,
        )
        .gte("criado_em", dataAbertura)
        .lte("criado_em", dataFechamento)
        .eq("ordem_servico.id_loja", caixa.loja_id);

      console.log("📊 Resultado busca OS:", {
        sucesso: !erroOS,
        totalOS: ordensServico?.length || 0,
        erro: erroOS,
      });

      // Se houver erro de OS, continua com array vazio

      console.log("💰 DEBUG CAIXA - OS buscadas:", {
        total: ordensServico?.length || 0,
        ordensServico: ordensServico?.map((os: any) => ({
          id: os.id,
          valor: os.valor,
          criado_em: os.criado_em,
          ordem_servico_completo: os.ordem_servico,
          loja_os: os.ordem_servico?.id_loja,
          loja_caixa: caixa.loja_id,
          numero_os: os.ordem_servico?.numero_os,
          match: os.ordem_servico?.id_loja === caixa.loja_id,
        })),
      });

      // Filtrar OS da loja
      const osLoja =
        ordensServico?.filter(
          (os: any) => os.ordem_servico?.id_loja === caixa.loja_id,
        ) || [];

      console.log("✅ DEBUG CAIXA - OS filtradas da loja:", {
        total: osLoja.length,
        osLoja: osLoja.map((os: any) => ({
          id: os.id,
          valor: os.valor,
          numero_os: os.ordem_servico?.numero_os,
          cliente: os.ordem_servico?.cliente_nome,
        })),
      });

      // Calcular resumo de vendas por forma de pagamento
      const porFormaPagamento: { [key: string]: number } = {};
      const porFormaPagamentoAparelhos: { [key: string]: number } = {};
      let totalVendas = 0;
      let totalVendasAparelhos = 0;
      let totalVendasDinheiro = 0; // Vendas que entram dinheiro no caixa (sem crédito)

      // Identificar vendas que foram devolvidas SEM CREDITO no mesmo dia do caixa
      // Devoluções com crédito NÃO diminuem o caixa (dinheiro permanece como crédito)
      const vendasDevolvidasSemCreditoMesmoDia = new Set<string>();
      const valorVendasDevolvidasMesmoDia: { [venda_id: string]: number } = {};

      devolucoesLoja.forEach((dev: any) => {
        // Apenas considerar devoluções SEM CRÉDITO
        if (dev.tipo !== "sem_credito") return;

        const vendaCriadaEm = new Date(dev.venda?.criado_em);
        const devolucaoCriadaEm = new Date(dev.criado_em);
        const caixaAberturaData = new Date(caixa.data_abertura);

        // Verifica se a venda e a devolução são do mesmo dia de abertura do caixa
        const mesmodia =
          vendaCriadaEm.toDateString() === caixaAberturaData.toDateString() &&
          devolucaoCriadaEm.toDateString() === caixaAberturaData.toDateString();

        if (mesmodia && dev.venda_id) {
          vendasDevolvidasSemCreditoMesmoDia.add(dev.venda_id);
          // Armazena o valor devolvido (pode ser parcial)
          valorVendasDevolvidasMesmoDia[dev.venda_id] =
            (valorVendasDevolvidasMesmoDia[dev.venda_id] || 0) +
            Number(dev.valor_total);
        }
      });

      console.log(
        "🔍 DEBUG CAIXA - Vendas devolvidas SEM CRÉDITO no mesmo dia:",
        {
          vendas: Array.from(vendasDevolvidasSemCreditoMesmoDia),
          valores: valorVendasDevolvidasMesmoDia,
        },
      );

      pagamentosLoja.forEach((pag: any) => {
        const vendaDevolvida = vendasDevolvidasSemCreditoMesmoDia.has(
          pag.venda?.id,
        );
        const forma = pag.tipo_pagamento;
        const valor = Number(pag.valor);
        const ehAparelho = vendasComAparelhos.has(pag.venda?.id);

        console.log(`🔍 Processando pagamento:`, {
          numero_venda: pag.venda?.numero_venda,
          valor,
          forma,
          vendaDevolvida,
          ehAparelho,
          vai_contar: !vendaDevolvida,
        });

        // Se não foi devolvida SEM CRÉDITO no mesmo dia, conta normalmente
        if (!vendaDevolvida) {
          if (ehAparelho) {
            porFormaPagamentoAparelhos[forma] =
              (porFormaPagamentoAparelhos[forma] || 0) + valor;
            totalVendasAparelhos += valor;
          } else {
            porFormaPagamento[forma] = (porFormaPagamento[forma] || 0) + valor;
            totalVendas += valor;
          }
        }

        // Só soma no dinheiro físico se não for crédito do cliente (crédito da loja)
        // E se não foi venda devolvida SEM CRÉDITO no mesmo dia
        // credito = cartão de crédito (conta no caixa)
        // credito_cliente = crédito da loja (NÃO conta no caixa)
        if (forma !== "credito_cliente" && !vendaDevolvida) {
          totalVendasDinheiro += valor;
        }
      });

      // Contar apenas pagamentos que não são credito_cliente
      const quantidadePagamentosReais = pagamentosLoja.filter(
        (pag: any) =>
          pag.tipo_pagamento !== "credito_cliente" &&
          !vendasDevolvidasSemCreditoMesmoDia.has(pag.venda?.id),
      ).length;

      const quantidadeAparelhos = pagamentosLoja.filter(
        (pag: any) =>
          pag.tipo_pagamento !== "credito_cliente" &&
          !vendasDevolvidasSemCreditoMesmoDia.has(pag.venda?.id) &&
          vendasComAparelhos.has(pag.venda?.id),
      ).length;

      // Calcular total de pagamentos de venda que entram no caixa (sem credito_cliente)
      const totalPagamentosSemCredito = pagamentosLoja.reduce(
        (sum: number, pag: any) => {
          // Não contar vendas devolvidas SEM CRÉDITO no mesmo dia
          if (vendasDevolvidasSemCreditoMesmoDia.has(pag.venda?.id)) return sum;
          // Não contar crédito do cliente
          if (pag.tipo_pagamento === "credito_cliente") return sum;

          return sum + Number(pag.valor);
        },
        0,
      );

      // Calcular total de pagamentos sem crédito (incluindo vendas devolvidas com crédito, apenas para relatório)
      const totalPagamentosSemCreditoIncluindoDevolvidas =
        pagamentosLoja.reduce((sum: number, pag: any) => {
          // Não contar crédito do cliente
          if (pag.tipo_pagamento === "credito_cliente") return sum;

          return sum + Number(pag.valor);
        }, 0);

      const totalAparelhosSemCreditoIncluindoDevolvidas = pagamentosLoja.reduce(
        (sum: number, pag: any) => {
          if (pag.tipo_pagamento === "credito_cliente") return sum;
          if (!vendasComAparelhos.has(pag.venda?.id)) return sum;

          return sum + Number(pag.valor);
        },
        0,
      );

      // Calcular resumo de ordens de serviço por forma de pagamento
      const osFormasPagamento: { [key: string]: number } = {};
      let totalOS = osLoja.reduce(
        (sum: number, os: any) => sum + Number(os.valor),
        0,
      );

      osLoja.forEach((os: any) => {
        const forma = os.forma_pagamento;
        const valor = Number(os.valor);

        osFormasPagamento[forma] = (osFormasPagamento[forma] || 0) + valor;
      });

      // Calcular totais de devoluções separados por tipo
      const devolucoesComCredito = devolucoesLoja.filter(
        (d: any) => d.tipo === "com_credito",
      );
      const devolucoesSemCredito = devolucoesLoja.filter(
        (d: any) => d.tipo === "sem_credito",
      );

      const totalDevolucoesComCredito = devolucoesComCredito.reduce(
        (sum: number, d: any) => sum + Number(d.valor_total),
        0,
      );

      const totalDevolucoesSemCredito = devolucoesSemCredito.reduce(
        (sum: number, d: any) => sum + Number(d.valor_total),
        0,
      );

      const totalDevolucoes =
        totalDevolucoesComCredito + totalDevolucoesSemCredito;
      // Apenas devoluções sem crédito saem dinheiro do caixa
      const totalDevolucoesDinheiro = totalDevolucoesSemCredito;

      // Buscar sangrias do período
      const { data: sangrias, error: erroSangrias } = await supabase
        .from("sangrias_caixa")
        .select("id, valor")
        .eq("caixa_id", caixaId)
        .gte("criado_em", dataAbertura)
        .lte("criado_em", dataFechamento);

      // Se houver erro, continua com array vazio
      const totalSangrias =
        sangrias?.reduce((sum: number, s: any) => sum + Number(s.valor), 0) ||
        0;

      // Buscar quebras do período
      const { data: quebras, error: erroQuebras } = await supabase
        .from("quebra_pecas")
        .select("*")
        .eq("id_loja", caixa.loja_id)
        .gte("criado_em", dataAbertura)
        .lte("criado_em", dataFechamento);

      console.log("🔨 DEBUG CAIXA - Quebras no período:", {
        total: quebras?.length || 0,
        loja_id: caixa.loja_id,
        quebras: quebras?.map((q: any) => ({
          id: q.id,
          criado_em: q.criado_em,
          valor_total: q.valor_total,
          id_loja: q.id_loja,
        })),
      });

      // Se houver erro de quebras, continua com array vazio

      const totalQuebras =
        quebras?.reduce(
          (sum: number, q: any) => sum + Number(q.valor_total || 0),
          0,
        ) || 0;

      // Buscar OS devolvidas com crédito no período
      const { data: osDevolvidasCredito, error: erroOsDevolvidasCredito } =
        await supabase
          .from("ordem_servico")
          .select("id, numero_os, cliente_nome, valor_total, criado_em")
          .eq("id_loja", caixa.loja_id)
          .gte("criado_em", dataAbertura)
          .lte("criado_em", dataFechamento);

      // Se houver erro, continua com array vazio
      const { data: devolucoesOSRaw } = await supabase
        .from("devolu_ordem_servico")
        .select(
          `
          id,
          id_ordem_servico,
          tipo_devolucao,
          valor_total,
          criado_em,
          ordem_servico:ordem_servico(numero_os, cliente_nome, id_loja)
        `,
        )
        .gte("criado_em", dataAbertura)
        .lte("criado_em", dataFechamento)
        .eq("ordem_servico.id_loja", caixa.loja_id);
      const devolucoesOSLoja = devolucoesOSRaw || [];

      // Separar devoluções de OS por tipo (reembolso vs crédito)
      const devolucoesOSReembolso = devolucoesOSLoja.filter(
        (dev: any) => dev.tipo_devolucao === "reembolso",
      );
      const devolucoesOSCredito = devolucoesOSLoja.filter(
        (dev: any) => dev.tipo_devolucao === "credito",
      );

      const totalDevolucoesOSReembolso = devolucoesOSReembolso.reduce(
        (sum: number, dev: any) => sum + Number(dev.valor_total),
        0,
      );

      const totalDevolucoesOSCredito = devolucoesOSCredito.reduce(
        (sum: number, dev: any) => sum + Number(dev.valor_total),
        0,
      );

      // Saldo esperado considera apenas movimentações de dinheiro físico (quebras NÃO afetam)
      const saldoEsperado =
        Number(caixa.saldo_inicial) +
        totalPagamentosSemCredito +
        totalOS -
        totalDevolucoesDinheiro -
        totalDevolucoesOSReembolso -
        totalSangrias;
      const diferenca = caixa.saldo_final
        ? Number(caixa.saldo_final) - saldoEsperado
        : undefined;

      return {
        vendas: {
          quantidade: quantidadePagamentosReais - quantidadeAparelhos, // Apenas vendas sem aparelho
          total:
            totalPagamentosSemCreditoIncluindoDevolvidas -
            totalAparelhosSemCreditoIncluindoDevolvidas, // Total sem aparelho
          por_forma_pagamento: porFormaPagamento,
        },
        vendas_aparelhos: {
          quantidade: quantidadeAparelhos,
          total: totalAparelhosSemCreditoIncluindoDevolvidas,
          por_forma_pagamento: porFormaPagamentoAparelhos,
        },
        devolucoes: {
          quantidade: devolucoesLoja.length,
          total: totalDevolucoes,
        },
        devolucoes_com_credito: {
          quantidade: devolucoesComCredito.length,
          total: totalDevolucoesComCredito,
        },
        devolucoes_sem_credito: {
          quantidade: devolucoesSemCredito.length,
          total: totalDevolucoesSemCredito,
        },
        ordens_servico: {
          quantidade: osLoja.length,
          total: totalOS,
          por_forma_pagamento: osFormasPagamento,
        },
        os_devolvidas_com_credito: {
          quantidade: osDevolvidasCredito?.length || 0,
          total:
            osDevolvidasCredito?.reduce(
              (sum: number, os: any) => sum + Number(os.valor_total || 0),
              0,
            ) || 0,
          lista: osDevolvidasCredito || [],
        },
        devolu_os_reembolso: {
          quantidade: devolucoesOSReembolso.length,
          total: totalDevolucoesOSReembolso,
          lista: devolucoesOSReembolso,
        },
        devolu_os_credito: {
          quantidade: devolucoesOSCredito.length,
          total: totalDevolucoesOSCredito,
          lista: devolucoesOSCredito,
        },
        sangrias: {
          quantidade: sangrias?.length || 0,
          total: totalSangrias,
        },
        quebras: {
          quantidade: quebras?.length || 0,
          total: totalQuebras,
        },
        saldo_inicial: Number(caixa.saldo_inicial),
        total_entradas: totalPagamentosSemCredito + totalOS, // Todos os pagamentos que entram dinheiro (sem credito_cliente) + OS
        total_saidas:
          totalDevolucoesDinheiro + totalDevolucoesOSReembolso + totalSangrias, // Devoluções sem crédito + reembolsos de OS + sangrias
        saldo_esperado: saldoEsperado,
        saldo_informado: caixa.saldo_final
          ? Number(caixa.saldo_final)
          : undefined,
        diferenca: diferenca,
      };
    } catch (error: any) {
      console.error("Erro ao buscar resumo do caixa:", error);
      throw error;
    }
  }

  // Buscar saldo esperado de múltiplos caixas de uma só vez (elimina N+1)
  static async buscarSaldosEsperados(caixas: CaixaCompleto[]): Promise<{
    saldos: Map<string, number>;
    aparelhosPorCaixa: Map<string, number>;
  }> {
    if (caixas.length === 0)
      return { saldos: new Map(), aparelhosPorCaixa: new Map() };

    const dataMin = caixas.reduce(
      (min, c) => (c.data_abertura < min ? c.data_abertura : min),
      caixas[0].data_abertura,
    );
    const dataMax = caixas.reduce(
      (max, c) =>
        (c.data_fechamento || new Date().toISOString()) > max
          ? c.data_fechamento || new Date().toISOString()
          : max,
      caixas[0].data_fechamento || new Date().toISOString(),
    );
    const lojaId = caixas[0].loja_id;

    // 1. Buscar todos os pagamentos de vendas do período
    const { data: pagamentosVendas } = await supabase
      .from("pagamentos_venda")
      .select(
        `
        id,
        tipo_pagamento,
        valor,
        criado_em,
        venda:vendas!pagamentos_venda_venda_id_fkey(id, loja_id, criado_em)
      `,
      )
      .gte("criado_em", dataMin)
      .lte("criado_em", dataMax)
      .eq("venda.loja_id", lojaId);

    // 2. Buscar todas as devoluções do período
    const { data: devolucoes } = await supabase
      .from("devolucoes_venda")
      .select(
        `
        id,
        valor_total,
        criado_em,
        tipo,
        venda_id,
        venda:vendas!devolucoes_venda_venda_id_fkey(id, loja_id, criado_em, valor_total)
      `,
      )
      .gte("criado_em", dataMin)
      .lte("criado_em", dataMax)
      .eq("venda.loja_id", lojaId);

    // 3. Buscar todos os pagamentos de OS do período
    const { data: pagamentosOS } = await supabase
      .from("ordem_servico_pagamentos")
      .select(
        `
        id,
        id_ordem_servico,
        valor,
        criado_em,
        ordem_servico:ordem_servico!ordem_servico_pagamentos_id_ordem_servico_fkey(id_loja)
      `,
      )
      .gte("criado_em", dataMin)
      .lte("criado_em", dataMax)
      .eq("ordem_servico.id_loja", lojaId);

    // 4. Buscar todas as sangrias destes caixas
    const caixaIds = caixas.map((c) => c.id);
    const { data: sangrias } = await supabase
      .from("sangrias_caixa")
      .select("id, caixa_id, valor, criado_em")
      .in("caixa_id", caixaIds);

    // 5. Buscar devoluções de OS do período
    const { data: devolucoesOS } = await supabase
      .from("devolu_ordem_servico")
      .select(
        `
        id,
        id_ordem_servico,
        tipo_devolucao,
        valor_total,
        criado_em,
        ordem_servico:ordem_servico(id_loja)
      `,
      )
      .gte("criado_em", dataMin)
      .lte("criado_em", dataMax)
      .eq("ordem_servico.id_loja", lojaId);

    // Calcular saldo esperado para cada caixa
    const result = new Map<string, number>();
    const aparelhosResult = new Map<string, number>();

    for (const caixa of caixas) {
      const dataAbertura = caixa.data_abertura;
      const dataFechamento =
        caixa.data_fechamento || new Date().toISOString();

      // Filtrar pagamentos dentro do período deste caixa (e da loja correta)
      const pagamentosLoja = (pagamentosVendas || []).filter(
        (pag: any) =>
          pag.venda?.loja_id === (caixa.loja_id) &&
          pag.criado_em >= dataAbertura &&
          pag.criado_em <= dataFechamento,
      );

      // Filtrar devoluções dentro do período deste caixa (e da loja correta)
      const devolucoesLoja = (devolucoes || []).filter(
        (dev: any) =>
          dev.venda?.loja_id === (caixa.loja_id) &&
          dev.criado_em >= dataAbertura &&
          dev.criado_em <= dataFechamento,
      );

      // Identificar devoluções sem crédito no mesmo dia
      const vendasDevolvidasSemCredito = new Set<string>();
      devolucoesLoja.forEach((dev: any) => {
        if (dev.tipo !== "sem_credito") return;
        const vendaCriadaEm = new Date(dev.venda?.criado_em);
        const devolucaoCriadaEm = new Date(dev.criado_em);
        const caixaAberturaData = new Date(caixa.data_abertura);
        const mesmodia =
          vendaCriadaEm.toDateString() === caixaAberturaData.toDateString() &&
          devolucaoCriadaEm.toDateString() === caixaAberturaData.toDateString();
        if (mesmodia && dev.venda_id) {
          vendasDevolvidasSemCredito.add(dev.venda_id);
        }
      });

      // Calcular total de pagamentos sem crédito
      let totalPagamentosSemCredito = 0;
      pagamentosLoja.forEach((pag: any) => {
        if (vendasDevolvidasSemCredito.has(pag.venda?.id)) return;
        if (pag.tipo_pagamento === "credito_cliente") return;
        totalPagamentosSemCredito += Number(pag.valor);
      });

      // Calcular total de OS
      const totalOS = (pagamentosOS || [])
        .filter(
          (os: any) =>
            os.criado_em >= dataAbertura && os.criado_em <= dataFechamento,
        )
        .reduce((sum: number, os: any) => sum + Number(os.valor), 0);

      // Calcular total de devoluções sem crédito
      const totalDevolucoesDinheiro = devolucoesLoja
        .filter((d: any) => d.tipo === "sem_credito")
        .reduce((sum: number, d: any) => sum + Number(d.valor_total), 0);

      // Calcular total de sangrias deste caixa
      const totalSangrias = (sangrias || [])
        .filter((s: any) => s.caixa_id === caixa.id)
        .reduce((sum: number, s: any) => sum + Number(s.valor), 0);

      // Calcular total de reembolsos de OS
      const totalDevolucoesOSReembolso = (devolucoesOS || [])
        .filter(
          (dev: any) =>
            dev.criado_em >= dataAbertura &&
            dev.criado_em <= dataFechamento &&
            dev.tipo_devolucao === "reembolso",
        )
        .reduce((sum: number, dev: any) => sum + Number(dev.valor_total), 0);

      // Calcular total de aparelhos vendidos neste caixa (query por venda_ids filtrados, igual ao modal)
      const vendaIdsCaixa = Array.from(
        new Set(
          pagamentosLoja
            .map((p: any) => p.venda?.id)
            .filter(Boolean) as string[],
        ),
      );
      let totalAparelhosNoCaixa = 0;
      if (vendaIdsCaixa.length > 0) {
        const { data: dataAp } = await supabase
          .from("aparelhos")
          .select("valor_venda")
          .in("venda_id", vendaIdsCaixa);
        totalAparelhosNoCaixa = (dataAp || []).reduce(
          (s: number, a: any) => s + Number(a.valor_venda || 0),
          0,
        );
      }

      const saldoEsperado =
        Number(caixa.saldo_inicial) +
        totalPagamentosSemCredito +
        totalOS -
        totalDevolucoesDinheiro -
        totalDevolucoesOSReembolso -
        totalSangrias;

      result.set(caixa.id, saldoEsperado);
      aparelhosResult.set(caixa.id, totalAparelhosNoCaixa);
    }

    return { saldos: result, aparelhosPorCaixa: aparelhosResult };
  }

  // Buscar resumo agregado do histórico (totais de todos os caixas, sem paginação)
  static async buscarResumoHistorico(filtros?: {
    loja_id?: number;
    data_inicio?: string;
    data_fim?: string;
  }): Promise<{
    totalCaixas: number;
    totalSaldoInicial: number;
    totalSaldoFinal: number;
  }> {
    try {
      let query = supabase
        .from("caixas")
        .select("saldo_inicial, saldo_final", { count: "exact", head: false })
        .eq("status", "fechado");

      if (filtros?.loja_id) {
        query = query.eq("loja_id", filtros.loja_id);
      }

      if (filtros?.data_inicio) {
        query = query.gte("data_abertura", filtros.data_inicio);
      }

      if (filtros?.data_fim) {
        query = query.lte("data_abertura", filtros.data_fim);
      }

      const { data, count, error } = await query;

      if (error) throw error;

      const totalSaldoInicial = (data || []).reduce(
        (sum: number, c: any) => sum + Number(c.saldo_inicial || 0),
        0,
      );
      const totalSaldoFinal = (data || []).reduce(
        (sum: number, c: any) => sum + Number(c.saldo_final || 0),
        0,
      );

      return {
        totalCaixas: count || 0,
        totalSaldoInicial,
        totalSaldoFinal,
      };
    } catch (error: any) {
      console.error("Erro ao buscar resumo do histórico:", error);

      return { totalCaixas: 0, totalSaldoInicial: 0, totalSaldoFinal: 0 };
    }
  }

  // Buscar movimentações do caixa
  static async buscarMovimentacoes(
    caixaId: string,
  ): Promise<MovimentacaoCaixa[]> {
    try {
      // Buscar dados do caixa
      const { data: caixa, error: erroCaixa } = await supabase
        .from("caixas")
        .select("*")
        .eq("id", caixaId)
        .single();

      if (erroCaixa) throw erroCaixa;

      const dataAbertura = caixa.data_abertura;
      const dataFechamento = caixa.data_fechamento || new Date().toISOString();

      const movimentacoes: MovimentacaoCaixa[] = [];

      // Buscar pagamentos de vendas (buscar pelo momento do pagamento)
      const { data: pagamentosVendas } = await supabase
        .from("pagamentos_venda")
        .select(
          `
          id,
          tipo_pagamento,
          valor,
          criado_em,
          venda:vendas!pagamentos_venda_venda_id_fkey(
            id,
            numero_venda,
            loja_id,
            status,
            cliente:clientes(nome)
          )
        `,
        )
        .gte("criado_em", dataAbertura)
        .lte("criado_em", dataFechamento);

      // Filtrar apenas pagamentos da loja correta (independente do status da venda)
      pagamentosVendas
        ?.filter((pag: any) => pag.venda?.loja_id === caixa.loja_id)
        .forEach((pag: any) => {
          // Não incluir crédito de cliente como movimentação de caixa (não entra dinheiro)
          if (pag.tipo_pagamento === "credito_cliente") return;

          movimentacoes.push({
            tipo: "venda",
            descricao: `Venda #${pag.venda?.numero_venda} - ${pag.venda?.cliente?.nome || "Cliente"}`,
            valor: Number(pag.valor),
            data: pag.criado_em,
            referencia_id: pag.venda?.id,
            forma_pagamento: pag.tipo_pagamento,
            usou_credito: false, // Não temos essa informação no nível de pagamento
          });
        });

      // Buscar devoluções
      const { data: devolucoes } = await supabase
        .from("devolucoes_venda")
        .select(
          `
          id,
          valor_total,
          criado_em,
          tipo,
          forma_pagamento,
          venda:vendas!devolucoes_venda_venda_id_fkey(
            numero_venda,
            loja_id,
            cliente:clientes(nome)
          )
        `,
        )
        .gte("criado_em", dataAbertura)
        .lte("criado_em", dataFechamento);

      devolucoes
        ?.filter((d: any) => d.venda?.loja_id === caixa.loja_id)
        .forEach((dev: any) => {
          movimentacoes.push({
            tipo: "devolucao",
            descricao: `Devolução Venda #${dev.venda?.numero_venda} - ${dev.venda?.cliente?.nome || "Cliente"}`,
            valor: -Number(dev.valor_total),
            data: dev.criado_em,
            referencia_id: dev.id,
            gerou_credito: dev.tipo === "com_credito",
            forma_pagamento: dev.forma_pagamento,
          });
        });

      // Buscar pagamentos de OS
      const { data: pagamentosOS } = await supabase
        .from("ordem_servico_pagamentos")
        .select(
          `
          id,
          id_ordem_servico,
          valor,
          forma_pagamento,
          criado_em,
          ordem_servico:ordem_servico!ordem_servico_pagamentos_id_ordem_servico_fkey(
            numero_os,
            id_loja,
            cliente_nome
          )
        `,
        )
        .gte("criado_em", dataAbertura)
        .lte("criado_em", dataFechamento)
        .eq("ordem_servico.id_loja", caixa.loja_id);

      // Agrupar pagamentos de OS por id_ordem_servico
      const osAgrupadas: { [key: string]: any } = {};

      pagamentosOS?.forEach((pag: any) => {
        const osId = pag.id_ordem_servico;

        if (!osAgrupadas[osId]) {
          osAgrupadas[osId] = {
            tipo: "ordem_servico",
            descricao: `OS #${pag.ordem_servico?.numero_os} - ${pag.ordem_servico?.cliente_nome}`,
            valor: 0,
            data: pag.criado_em,
            referencia_id: osId,
            forma_pagamento: pag.forma_pagamento,
            pagamentos: [],
            id_loja: pag.ordem_servico?.id_loja, // Adiciona id_loja
          };
        }
        osAgrupadas[osId].valor += Number(pag.valor);
        osAgrupadas[osId].pagamentos.push({
          tipo_pagamento: pag.forma_pagamento,
          valor: Number(pag.valor),
        });
      });

      // Adicionar OS agrupadas às movimentações
      Object.values(osAgrupadas).forEach((os) => {
        movimentacoes.push(os);
      });

      // Buscar quebras
      const { data: quebras } = await supabase
        .from("quebra_pecas")
        .select(
          `
          id,
          quantidade,
          motivo,
          valor_total,
          criado_em,
          produtos:id_produto(descricao)
        `,
        )
        .eq("id_loja", caixa.loja_id)
        .gte("criado_em", dataAbertura)
        .lte("criado_em", dataFechamento);

      quebras?.forEach((quebra: any) => {
        movimentacoes.push({
          tipo: "quebra",
          descricao: `Quebra - ${quebra.produtos?.descricao || "Produto"} (${quebra.quantidade}x) - ${quebra.motivo}`,
          valor: -Number(quebra.valor_total || 0), // Negativo apenas para visualização
          data: quebra.criado_em,
          referencia_id: quebra.id,
        });
      });

      // Buscar sangrias
      const { data: sangrias } = await supabase
        .from("sangrias_caixa")
        .select(
          `
          id,
          valor,
          motivo,
          criado_em,
          venda_id,
          usuario:usuarios!sangrias_caixa_realizado_por_fkey(nome),
          venda:vendas!sangrias_caixa_venda_id_fkey(numero_venda, cliente:clientes(nome))
        `,
        )
        .eq("caixa_id", caixa.id)
        .gte("criado_em", dataAbertura)
        .lte("criado_em", dataFechamento);

      sangrias?.forEach((sangria: any) => {
        // Se tem venda_id, é um reembolso
        const isReembolso = sangria.venda_id && sangria.venda;
        const descricao = isReembolso
          ? `Reembolso - Venda #${sangria.venda?.numero_venda} - ${sangria.venda?.cliente?.nome || "Cliente"}`
          : `Sangria Manual - ${sangria.motivo}`;

        movimentacoes.push({
          tipo: "sangria",
          descricao,
          valor: -Number(sangria.valor),
          data: sangria.criado_em,
          referencia_id: sangria.id,
          usuario_responsavel: sangria.usuario?.nome || "N/A",
          eh_reembolso: isReembolso || false,
        });
      });

      // Ordenar por data
      movimentacoes.sort(
        (a, b) => new Date(a.data).getTime() - new Date(b.data).getTime(),
      );

      return movimentacoes;
    } catch (error: any) {
      console.error("Erro ao buscar movimentações:", error);

      return [];
    }
  }

  // Registrar sangria
  static async registrarSangria(params: {
    caixa_id: string;
    valor: number;
    motivo: string;
    usuario_id: string;
  }): Promise<void> {
    try {
      const { error } = await supabase.from("sangrias_caixa").insert({
        caixa_id: params.caixa_id,
        valor: params.valor,
        motivo: params.motivo,
        realizado_por: params.usuario_id,
      });

      if (error) throw error;
    } catch (error: any) {
      console.error("Erro ao registrar sangria:", error);
      throw error;
    }
  }

  // Buscar sangrias de um caixa
  static async buscarSangrias(caixaId: string) {
    try {
      const { data, error } = await supabase
        .from("sangrias_caixa")
        .select(
          `
          *,
          usuario:usuarios!sangrias_caixa_realizado_por_fkey(id, nome)
        `,
        )
        .eq("caixa_id", caixaId)
        .order("criado_em", { ascending: false });

      if (error) throw error;

      return data;
    } catch (error: any) {
      console.error("Erro ao buscar sangrias:", error);

      return [];
    }
  }

  // Buscar IDs de vendas que possuem aparelhos
  static async buscarVendasComAparelhos(caixaId: string): Promise<Set<string>> {
    try {
      const { data: caixa } = await supabase
        .from("caixas")
        .select("data_abertura, data_fechamento, loja_id")
        .eq("id", caixaId)
        .single();

      if (!caixa) return new Set();

      const dataAbertura = caixa.data_abertura;
      const dataFechamento = caixa.data_fechamento || new Date().toISOString();

      const { data: aparelhos } = await supabase
        .from("aparelhos")
        .select("venda_id")
        .not("venda_id", "is", null)
        .eq("loja_id", caixa.loja_id)
        .gte("data_venda", dataAbertura)
        .lte("data_venda", dataFechamento);

      if (!aparelhos) return new Set();

      return new Set(aparelhos.map((a: any) => a.venda_id));
    } catch (error: any) {
      console.error("Erro ao buscar vendas com aparelhos:", error);

      return new Set();
    }
  }

  // Buscar vendas detalhadas agrupadas por forma de pagamento
  static async buscarVendasDetalhadasPorPagamento(caixaId: string) {
    try {
      // Buscar dados do caixa
      const { data: caixa, error: erroCaixa } = await supabase
        .from("caixas")
        .select("*")
        .eq("id", caixaId)
        .single();

      if (erroCaixa) throw erroCaixa;

      const dataAbertura = caixa.data_abertura;
      const dataFechamento = caixa.data_fechamento || new Date().toISOString();

      // Buscar todos os pagamentos do período
      const { data: pagamentosVendas, error } = await supabase
        .from("pagamentos_venda")
        .select(
          `
          id,
          tipo_pagamento,
          valor,
          criado_em,
          venda:vendas!pagamentos_venda_venda_id_fkey(
            id,
            numero_venda,
            valor_total,
            valor_desconto,
            valor_pago,
            criado_em,
            loja_id,
            status,
            cliente:clientes(id, nome, doc)
          )
        `,
        )
        .gte("criado_em", dataAbertura)
        .lte("criado_em", dataFechamento)
        .order("criado_em", { ascending: true });

      if (error) throw error;

      // Filtrar apenas pagamentos da loja correta (independente do status da venda)
      const pagamentosLoja =
        pagamentosVendas?.filter(
          (pag: any) => pag.venda?.loja_id === caixa.loja_id,
        ) || [];

      // Agrupar pagamentos por forma de pagamento
      const vendasPorFormaPagamento: {
        [key: string]: {
          vendas: Array<{
            numero_venda: string;
            cliente_nome: string;
            cliente_cpf?: string;
            valor_total: number;
            valor_desconto: number;
            valor_pago: number;
            criado_em: string;
            hora: string;
          }>;
          total: number;
        };
      } = {};

      pagamentosLoja.forEach((pag: any) => {
        const formaPagamento = pag.tipo_pagamento || "nao_informado";

        if (!vendasPorFormaPagamento[formaPagamento]) {
          vendasPorFormaPagamento[formaPagamento] = {
            vendas: [],
            total: 0,
          };
        }

        // Extrair hora do pagamento
        const dataPagamento = new Date(pag.criado_em);
        const hora = dataPagamento.toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        });

        vendasPorFormaPagamento[formaPagamento].vendas.push({
          numero_venda: pag.venda?.numero_venda || "",
          cliente_nome: pag.venda?.cliente?.nome || "Cliente não informado",
          cliente_cpf: pag.venda?.cliente?.doc, // agora doc pode ser CPF ou CNPJ
          valor_total: Number(pag.venda?.valor_total || 0),
          valor_desconto: Number(pag.venda?.valor_desconto || 0),
          valor_pago: Number(pag.valor),
          criado_em: pag.criado_em,
          hora: hora,
        });

        vendasPorFormaPagamento[formaPagamento].total += Number(pag.valor);
      });

      return vendasPorFormaPagamento;
    } catch (error: any) {
      console.error("Erro ao buscar vendas detalhadas por pagamento:", error);

      return {};
    }
  }
}
