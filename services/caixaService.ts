import { supabase } from "@/lib/supabaseClient";
import {
  Caixa,
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
        `
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
        `
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
    lojaId: number
  ): Promise<CaixaCompleto | null> {
    try {
      const { data, error } = await supabase
        .from("caixas")
        .select(
          `
          *,
          loja:lojas(id, nome),
          usuario_abertura_info:usuarios!caixas_usuario_abertura_fkey(id, nome)
        `
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
  }): Promise<CaixaCompleto[]> {
    try {
      let query = supabase
        .from("caixas")
        .select(
          `
          *,
          loja:lojas(id, nome),
          usuario_abertura_info:usuarios!caixas_usuario_abertura_fkey(id, nome),
          usuario_fechamento_info:usuarios!caixas_usuario_fechamento_fkey(id, nome)
        `
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

      const { data, error } = await query;

      if (error) throw error;

      return (data as CaixaCompleto[]) || [];
    } catch (error: any) {
      console.error("Erro ao listar caixas:", error);
      return [];
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
        throw new Error(`Erro ao buscar caixa: ${erroCaixa.message || JSON.stringify(erroCaixa)}`);
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
      const { data: pagamentosVendas, error: erroPagamentos } = await supabase
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
        `
        )
        .gte("criado_em", dataAbertura)
        .lte("criado_em", dataFechamento);

      if (erroPagamentos) {
        console.error("❌ Erro ao buscar pagamentos:", erroPagamentos);
        throw new Error(`Erro ao buscar pagamentos: ${erroPagamentos.message || JSON.stringify(erroPagamentos)}`);
      }

      // Filtrar apenas pagamentos de vendas da loja correta (independente do status da venda)
      const pagamentosLoja = pagamentosVendas?.filter(
        (pag: any) => pag.venda?.loja_id === caixa.loja_id
      ) || [];

      console.log("💰 DEBUG CAIXA - Pagamentos encontrados:", {
        total: pagamentosLoja.length,
        soma_valores: pagamentosLoja.reduce((sum: number, p: any) => sum + Number(p.valor), 0),
        pagamentos: pagamentosLoja.map((p: any) => ({
          venda_id: p.venda?.id,
          numero_venda: p.venda?.numero_venda,
          valor_pagamento: p.valor,
          tipo_pagamento: p.tipo_pagamento,
          criado_em: p.criado_em
        }))
      });

      // Buscar devoluções do período
      const { data: devolucoes, error: erroDevolucoes } = await supabase
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
        `
        )
        .gte("criado_em", dataAbertura)
        .lte("criado_em", dataFechamento);

      if (erroDevolucoes) {
        console.error("❌ Erro ao buscar devoluções:", erroDevolucoes);
        throw new Error(`Erro ao buscar devoluções: ${erroDevolucoes.message || JSON.stringify(erroDevolucoes)}`);
      }

      // Filtrar devoluções da loja
      const devolucoesLoja =
        devolucoes?.filter((d: any) => d.venda?.loja_id === caixa.loja_id) ||
        [];

      // Buscar ordens de serviço pagas no período
      console.log("🔍 Buscando OS do período:", { dataAbertura, dataFechamento, lojaId: caixa.loja_id });
      
      const { data: ordensServico, error: erroOS } = await supabase
        .from("ordem_servico_pagamentos")
        .select(
          `
          id,
          valor,
          forma_pagamento,
          criado_em,
          ordem_servico:ordem_servico!ordem_servico_pagamentos_id_ordem_servico_fkey(id_loja, numero_os, cliente_nome)
        `
        )
        .gte("criado_em", dataAbertura)
        .lte("criado_em", dataFechamento)
        .eq("ordem_servico.id_loja", caixa.loja_id);

      console.log("📊 Resultado busca OS:", { 
        sucesso: !erroOS, 
        totalOS: ordensServico?.length || 0,
        erro: erroOS 
      });

      if (erroOS) {
        console.error("❌ Erro COMPLETO ao buscar OS:", {
          erro: erroOS,
          message: erroOS.message,
          details: erroOS.details,
          hint: erroOS.hint,
          code: erroOS.code,
        });
        throw new Error(`Erro ao buscar ordens de serviço: ${erroOS.message || erroOS.code || JSON.stringify(erroOS)}`);
      }

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
          (os: any) => os.ordem_servico?.id_loja === caixa.loja_id
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
      let totalVendas = 0;
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

      console.log("🔍 DEBUG CAIXA - Vendas devolvidas SEM CRÉDITO no mesmo dia:", {
        vendas: Array.from(vendasDevolvidasSemCreditoMesmoDia),
        valores: valorVendasDevolvidasMesmoDia,
      });

      pagamentosLoja.forEach((pag: any) => {
        const vendaDevolvida = vendasDevolvidasSemCreditoMesmoDia.has(pag.venda?.id);
        const forma = pag.tipo_pagamento;
        const valor = Number(pag.valor);

        console.log(`🔍 Processando pagamento:`, {
          numero_venda: pag.venda?.numero_venda,
          valor,
          forma,
          vendaDevolvida,
          vai_contar: !vendaDevolvida
        });

        // Se não foi devolvida SEM CRÉDITO no mesmo dia, conta normalmente
        if (!vendaDevolvida) {
          porFormaPagamento[forma] = (porFormaPagamento[forma] || 0) + valor;
          totalVendas += valor;
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
        (pag: any) => pag.tipo_pagamento !== "credito_cliente" && !vendasDevolvidasSemCreditoMesmoDia.has(pag.venda?.id)
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
        0
      );

      // Calcular total de pagamentos sem crédito (incluindo vendas devolvidas com crédito, apenas para relatório)
      const totalPagamentosSemCreditoIncluindoDevolvidas = pagamentosLoja.reduce(
        (sum: number, pag: any) => {
          // Não contar crédito do cliente
          if (pag.tipo_pagamento === "credito_cliente") return sum;
          return sum + Number(pag.valor);
        },
        0
      );

      // Calcular totais de devoluções separados por tipo
      const devolucoesComCredito = devolucoesLoja.filter(
        (d: any) => d.tipo === "com_credito"
      );
      const devolucoesSemCredito = devolucoesLoja.filter(
        (d: any) => d.tipo === "sem_credito"
      );

      const totalDevolucoesComCredito = devolucoesComCredito.reduce(
        (sum: number, d: any) => sum + Number(d.valor_total),
        0
      );

      const totalDevolucoesSemCredito = devolucoesSemCredito.reduce(
        (sum: number, d: any) => sum + Number(d.valor_total),
        0
      );

      const totalDevolucoes =
        totalDevolucoesComCredito + totalDevolucoesSemCredito;
      // Apenas devoluções sem crédito saem dinheiro do caixa
      const totalDevolucoesDinheiro = totalDevolucoesSemCredito;

      const totalOS = osLoja.reduce(
        (sum: number, os: any) => sum + Number(os.valor),
        0
      );

      // Buscar sangrias do período
      const { data: sangrias, error: erroSangrias } = await supabase
        .from("sangrias_caixa")
        .select("*")
        .eq("caixa_id", caixaId)
        .gte("criado_em", dataAbertura)
        .lte("criado_em", dataFechamento);

      if (erroSangrias) {
        console.error("❌ Erro ao buscar sangrias:", erroSangrias);
        throw new Error(`Erro ao buscar sangrias: ${erroSangrias.message || JSON.stringify(erroSangrias)}`);
      }

      const totalSangrias =
        sangrias?.reduce((sum: number, s: any) => sum + Number(s.valor), 0) ||
        0;

      // Buscar quebras do período
      // Primeiro buscar TODAS as quebras da loja para debug
      const { data: todasQuebras } = await supabase
        .from("quebra_pecas")
        .select("*")
        .eq("id_loja", caixa.loja_id);

      console.log("🔍 DEBUG CAIXA - TODAS as quebras da loja:", {
        total: todasQuebras?.length || 0,
        loja_id: caixa.loja_id,
        range_busca: { dataAbertura, dataFechamento },
        quebras: todasQuebras?.map((q: any) => ({
          id: q.id,
          criado_em: q.criado_em,
          valor_total: q.valor_total,
          id_loja: q.id_loja,
          dentro_range:
            q.criado_em >= dataAbertura && q.criado_em <= dataFechamento,
        })),
      });

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

      if (erroQuebras) {
        console.error("❌ Erro ao buscar quebras:", erroQuebras);
        throw new Error(`Erro ao buscar quebras: ${erroQuebras.message || JSON.stringify(erroQuebras)}`);
      }

      const totalQuebras =
        quebras?.reduce(
          (sum: number, q: any) => sum + Number(q.valor_total || 0),
          0
        ) || 0;

      // Saldo esperado considera apenas movimentações de dinheiro físico (quebras NÃO afetam)
      const saldoEsperado =
        Number(caixa.saldo_inicial) +
        totalPagamentosSemCredito +
        totalOS -
        totalDevolucoesDinheiro -
        totalSangrias;
      const diferenca = caixa.saldo_final
        ? Number(caixa.saldo_final) - saldoEsperado
        : undefined;

      return {
        vendas: {
          quantidade: quantidadePagamentosReais, // Apenas pagamentos que geram entrada de dinheiro
          total: totalPagamentosSemCreditoIncluindoDevolvidas, // Todos os pagamentos sem credito_cliente para mostrar no relatório
          por_forma_pagamento: porFormaPagamento,
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
        total_saidas: totalDevolucoesDinheiro + totalSangrias, // Devoluções sem crédito + sangrias
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

  // Buscar movimentações do caixa
  static async buscarMovimentacoes(
    caixaId: string
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
        `
        )
        .gte("criado_em", dataAbertura)
        .lte("criado_em", dataFechamento);

      // Filtrar apenas pagamentos da loja correta (independente do status da venda)
      pagamentosVendas
        ?.filter(
          (pag: any) =>
            pag.venda?.loja_id === caixa.loja_id
        )
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
        `
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
        `
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
        `
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
          usuario:usuarios!sangrias_caixa_realizado_por_fkey(nome)
        `
        )
        .eq("caixa_id", caixa.id)
        .gte("criado_em", dataAbertura)
        .lte("criado_em", dataFechamento);

      sangrias?.forEach((sangria: any) => {
        movimentacoes.push({
          tipo: "sangria",
          descricao: `Sangria - ${sangria.motivo}`,
          valor: -Number(sangria.valor),
          data: sangria.criado_em,
          referencia_id: sangria.id,
        });
      });

      // Ordenar por data
      movimentacoes.sort(
        (a, b) => new Date(a.data).getTime() - new Date(b.data).getTime()
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
        `
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
        `
        )
        .gte("criado_em", dataAbertura)
        .lte("criado_em", dataFechamento)
        .order("criado_em", { ascending: true });

      if (error) throw error;

      // Filtrar apenas pagamentos da loja correta (independente do status da venda)
      const pagamentosLoja = pagamentosVendas?.filter(
        (pag: any) =>
          pag.venda?.loja_id === caixa.loja_id
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
      console.error(
        "Erro ao buscar vendas detalhadas por pagamento:",
        error
      );
      return {};
    }
  }
}
