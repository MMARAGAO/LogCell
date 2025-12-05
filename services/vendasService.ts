import { supabase } from "@/lib/supabaseClient";
import type {
  Venda,
  ItemVenda,
  PagamentoVenda,
  DescontoVenda,
  DevolucaoVenda,
  ItemDevolucao,
  CreditoCliente,
  HistoricoVenda,
  VendaCompleta,
} from "@/types/vendas";

export class VendasService {
  /**
   * Helper para formatar valores monetários
   */
  private static formatarMoeda(valor: number): string {
    return valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  /**
   * Cria uma nova venda
   */
  static async criarVenda(dados: {
    cliente_id: string;
    loja_id: number;
    vendedor_id: string;
    tipo: "normal" | "fiada";
    data_prevista_pagamento?: string;
  }): Promise<{ success: boolean; venda?: Venda; error?: string }> {
    try {
      // Gera número da venda
      const { data: vendas } = await supabase
        .from("vendas")
        .select("numero_venda")
        .order("criado_em", { ascending: false })
        .limit(1);

      const numeroVenda =
        vendas && vendas.length > 0 ? vendas[0].numero_venda + 1 : 1;

      const { data, error } = await supabase
        .from("vendas")
        .insert({
          numero_venda: numeroVenda,
          cliente_id: dados.cliente_id,
          loja_id: dados.loja_id,
          vendedor_id: dados.vendedor_id,
          status: "em_andamento",
          tipo: dados.tipo,
          data_prevista_pagamento: dados.data_prevista_pagamento,
          valor_total: 0,
          valor_pago: 0,
          valor_desconto: 0,
          saldo_devedor: 0,
        })
        .select()
        .single();

      if (error) throw error;

      // Registra no histórico
      await this.registrarHistorico({
        venda_id: data.id,
        tipo_acao: "criacao",
        descricao: "Venda criada",
        usuario_id: dados.vendedor_id,
      });

      return { success: true, venda: data };
    } catch (error: any) {
      console.error("Erro ao criar venda:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Adiciona item à venda
   */
  static async adicionarItem(
    vendaId: string,
    item: Omit<ItemVenda, "id" | "venda_id" | "criado_em">
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Calcula valor do desconto se houver
      let valorDesconto = 0;
      if (item.desconto_tipo && item.desconto_valor) {
        if (item.desconto_tipo === "valor") {
          valorDesconto = item.desconto_valor;
        } else {
          // Desconto em porcentagem
          valorDesconto = (item.subtotal * item.desconto_valor) / 100;
        }
      }

      const itemParaInserir = {
        venda_id: vendaId,
        produto_id: item.produto_id,
        produto_nome: item.produto_nome || "",
        produto_codigo: item.produto_codigo || "",
        quantidade: item.quantidade,
        preco_unitario: item.preco_unitario,
        subtotal: item.subtotal,
        devolvido: item.devolvido || 0,
        desconto_tipo: item.desconto_tipo || null,
        desconto_valor: item.desconto_valor || null,
        valor_desconto: valorDesconto,
      };

      console.log("Inserindo item:", itemParaInserir);

      // Tenta inserir SEM select primeiro
      const { data, error } = await supabase
        .from("itens_venda")
        .insert(itemParaInserir);

      if (error) {
        console.error("Erro detalhado do Supabase:", error);
        console.error("Status code:", error.code);
        console.error("Detalhes:", error.details);
        console.error("Hint:", error.hint);
        throw error;
      }

      console.log("Item inserido com sucesso:", data);

      // Atualiza total da venda
      await this.recalcularTotais(vendaId);

      return { success: true };
    } catch (error: any) {
      console.error("Erro ao adicionar item:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Remove item da venda
   */
  static async removerItem(
    itemId: string,
    vendaId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from("itens_venda")
        .delete()
        .eq("id", itemId);

      if (error) throw error;

      // Atualiza total da venda
      await this.recalcularTotais(vendaId);

      return { success: true };
    } catch (error: any) {
      console.error("Erro ao remover item:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Adiciona pagamento à venda
   */
  static async adicionarPagamento(
    vendaId: string,
    pagamento: Omit<PagamentoVenda, "id" | "venda_id" | "criado_em">
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Se for pagamento com crédito do cliente, verificar e dar baixa
      if (pagamento.tipo_pagamento === "credito_cliente") {
        console.log("💳 Pagamento com crédito do cliente detectado");

        // Buscar a venda para pegar o cliente_id
        const { data: venda } = await supabase
          .from("vendas")
          .select("cliente_id")
          .eq("id", vendaId)
          .single();

        if (!venda) {
          return { success: false, error: "Venda não encontrada" };
        }

        console.log("👤 Cliente ID:", venda.cliente_id);

        // Buscar créditos disponíveis do cliente
        const { data: creditos, error: erroCreditos } = await supabase
          .from("creditos_cliente")
          .select("*")
          .eq("cliente_id", venda.cliente_id)
          .gt("saldo", 0)
          .order("criado_em", { ascending: true }); // FIFO - primeiro que entra, primeiro que sai

        console.log("💰 Créditos encontrados:", creditos?.length, creditos);

        if (erroCreditos) {
          console.error("❌ Erro ao buscar créditos:", erroCreditos);
          return {
            success: false,
            error: `Erro ao buscar créditos: ${erroCreditos.message}`,
          };
        }

        if (!creditos || creditos.length === 0) {
          return {
            success: false,
            error: "Cliente não possui crédito disponível",
          };
        }

        const totalDisponivel = creditos.reduce(
          (sum, c) => sum + Number(c.saldo),
          0
        );
        console.log("💵 Total disponível:", totalDisponivel);
        console.log("💸 Valor do pagamento:", pagamento.valor);

        if (totalDisponivel < pagamento.valor) {
          return {
            success: false,
            error: `Crédito insuficiente. Disponível: ${this.formatarMoeda(totalDisponivel)}`,
          };
        }

        // Dar baixa nos créditos (FIFO)
        let valorRestante = Number(pagamento.valor);
        for (const credito of creditos) {
          if (valorRestante <= 0) break;

          const saldoCredito = Number(credito.saldo);
          const valorUtilizar = Math.min(valorRestante, saldoCredito);

          console.log(`🔄 Dando baixa no crédito ${credito.id}:`, {
            saldo_atual: saldoCredito,
            valor_utilizar: valorUtilizar,
            novo_saldo: saldoCredito - valorUtilizar,
          });

          // Atualizar crédito
          const { error: erroUpdate } = await supabase
            .from("creditos_cliente")
            .update({
              valor_utilizado: Number(credito.valor_utilizado) + valorUtilizar,
              saldo: saldoCredito - valorUtilizar,
            })
            .eq("id", credito.id);

          if (erroUpdate) {
            console.error("❌ Erro ao atualizar crédito:", erroUpdate);
            return {
              success: false,
              error: `Erro ao dar baixa no crédito: ${erroUpdate.message}`,
            };
          }

          console.log("✅ Crédito atualizado com sucesso");
          valorRestante -= valorUtilizar;
        }

        console.log("✅ Baixa de crédito concluída");
      }

      // Inserir o pagamento
      const { error } = await supabase.from("pagamentos_venda").insert({
        venda_id: vendaId,
        ...pagamento,
      });

      if (error) throw error;

      // Atualiza totais
      await this.recalcularTotais(vendaId);

      // Registra no histórico
      if (pagamento.criado_por) {
        await this.registrarHistorico({
          venda_id: vendaId,
          tipo_acao: "pagamento",
          descricao: `Pagamento registrado: ${pagamento.tipo_pagamento.replace("_", " ")} - ${this.formatarMoeda(Number(pagamento.valor))}`,
          usuario_id: pagamento.criado_por,
        });
      }

      return { success: true };
    } catch (error: any) {
      console.error("Erro ao adicionar pagamento:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Edita forma de pagamento
   */
  static async editarPagamento(
    pagamentoId: string,
    vendaId: string,
    novoTipo: string,
    usuarioId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from("pagamentos_venda")
        .update({
          tipo_pagamento: novoTipo,
          editado: true,
          editado_em: new Date().toISOString(),
          editado_por: usuarioId,
        })
        .eq("id", pagamentoId);

      if (error) throw error;

      // Registra no histórico
      await this.registrarHistorico({
        venda_id: vendaId,
        tipo_acao: "edicao_pagamento",
        descricao: `Forma de pagamento alterada para: ${novoTipo}`,
        usuario_id: usuarioId,
      });

      return { success: true };
    } catch (error: any) {
      console.error("Erro ao editar pagamento:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Aplica desconto à venda
   */
  static async aplicarDesconto(
    vendaId: string,
    desconto: Omit<DescontoVenda, "id" | "venda_id" | "criado_em">
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.from("descontos_venda").insert({
        venda_id: vendaId,
        ...desconto,
      });

      if (error) throw error;

      // Atualiza totais
      await this.recalcularTotais(vendaId);

      // Registra no histórico
      await this.registrarHistorico({
        venda_id: vendaId,
        tipo_acao: "desconto",
        descricao: `Desconto aplicado: ${desconto.tipo === "valor" ? `R$ ${desconto.valor.toFixed(2)}` : `${desconto.valor}%`}`,
        usuario_id: desconto.aplicado_por,
      });

      return { success: true };
    } catch (error: any) {
      console.error("Erro ao aplicar desconto:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Finaliza a venda
   */
  static async finalizarVenda(
    vendaId: string,
    usuarioId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Atualiza status da venda
      // NOTA: O estoque já foi baixado pela trigger quando os itens foram adicionados
      const { error } = await supabase
        .from("vendas")
        .update({
          status: "concluida",
          finalizado_em: new Date().toISOString(),
          finalizado_por: usuarioId,
        })
        .eq("id", vendaId);

      if (error) throw error;

      // Registra no histórico
      await this.registrarHistorico({
        venda_id: vendaId,
        tipo_acao: "finalizacao",
        descricao: "Venda finalizada",
        usuario_id: usuarioId,
      });

      return { success: true };
    } catch (error: any) {
      console.error("Erro ao finalizar venda:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Busca venda completa com todos os relacionamentos
   */
  static async buscarVendaCompleta(
    vendaId: string
  ): Promise<VendaCompleta | null> {
    try {
      console.log("🔍 Buscando venda completa:", vendaId);

      const { data, error } = await supabase
        .from("vendas")
        .select(
          `
          *,
          cliente:clientes(id, nome, cpf, telefone),
          loja:lojas(id, nome),
          vendedor:usuarios!vendas_vendedor_id_fkey(id, nome),
          itens:itens_venda(*, produto:produtos(descricao, codigo_fabricante)),
          pagamentos:pagamentos_venda(*, criado_por_usuario:usuarios!pagamentos_venda_criado_por_fkey(id, nome)),
          descontos:descontos_venda(*),
          devolucoes:devolucoes_venda(*, itens:itens_devolucao(*)),
          historico:historico_vendas(*, usuario:usuarios(nome))
        `
        )
        .eq("id", vendaId)
        .maybeSingle();

      if (error) {
        console.error("❌ Erro ao buscar venda:", error);
        throw error;
      }

      console.log("📦 Venda encontrada:", {
        id: data?.id,
        qtd_itens: data?.itens?.length,
        itens: data?.itens?.map((i: any) => ({
          id: i.id,
          produto_nome: i.produto_nome,
          quantidade: i.quantidade,
          subtotal: i.subtotal,
        })),
      });

      return data as VendaCompleta;
    } catch (error) {
      console.error("Erro ao buscar venda:", error);
      return null;
    }
  }

  /**
   * Recalcula os totais da venda
   */
  private static async recalcularTotais(vendaId: string): Promise<void> {
    console.log("🧮 recalcularTotais iniciado para venda:", vendaId);

    try {
      // Busca itens
      const { data: itens, error: erroItens } = await supabase
        .from("itens_venda")
        .select("subtotal, valor_desconto")
        .eq("venda_id", vendaId);

      console.log("📦 Itens encontrados:", itens?.length || 0);
      console.log("🔍 Detalhes dos itens:", JSON.stringify(itens, null, 2));

      if (erroItens) {
        console.error("❌ Erro ao buscar itens:", erroItens);
        throw erroItens;
      }

      const valorTotal =
        itens?.reduce((sum, item) => sum + item.subtotal, 0) || 0;

      console.log("💰 Valor total calculado:", valorTotal);

      // Soma descontos individuais dos itens
      const descontosItens =
        itens?.reduce((sum, item) => sum + (item.valor_desconto || 0), 0) || 0;

      // Busca descontos gerais da venda
      const { data: venda } = await supabase
        .from("vendas")
        .select("*")
        .eq("id", vendaId)
        .single();

      const { data: descontos } = await supabase
        .from("descontos_venda")
        .select("*")
        .eq("venda_id", vendaId);

      let valorDescontoGeral = 0;
      for (const desconto of descontos || []) {
        if (desconto.tipo === "valor") {
          valorDescontoGeral += desconto.valor;
        } else {
          valorDescontoGeral += (valorTotal * desconto.valor) / 100;
        }
      }

      // Soma descontos dos itens + descontos gerais
      const valorDesconto = descontosItens + valorDescontoGeral;

      // Busca pagamentos
      const { data: pagamentos } = await supabase
        .from("pagamentos_venda")
        .select("valor")
        .eq("venda_id", vendaId);

      const valorPago =
        pagamentos?.reduce((sum, pag) => sum + pag.valor, 0) || 0;

      // Calcular valor total APÓS desconto
      const valorTotalComDesconto = valorTotal - valorDesconto;
      const saldoDevedor = valorTotalComDesconto - valorPago;

      // Manter status atual da venda (não atualizar automaticamente)
      // O status deve ser alterado manualmente pelo usuário
      const novoStatus = venda?.status;

      console.log("📊 Totais calculados:", {
        subtotalItens: valorTotal,
        valorDesconto,
        valorTotalComDesconto,
        valorPago,
        saldoDevedor,
        novoStatus,
      });

      // Atualiza venda
      const { error: erroUpdate } = await supabase
        .from("vendas")
        .update({
          valor_total: valorTotalComDesconto, // CORRIGIDO: valor após desconto
          valor_desconto: valorDesconto,
          valor_pago: valorPago,
          saldo_devedor: saldoDevedor,
          status: novoStatus,
        })
        .eq("id", vendaId);

      if (erroUpdate) {
        console.error("❌ Erro ao atualizar totais:", erroUpdate);
        throw erroUpdate;
      }

      console.log("✅ Totais atualizados com sucesso!");
    } catch (error) {
      console.error("Erro ao recalcular totais:", error);
      throw error;
    }
  }

  /**
   * Registra ação no histórico
   */
  private static async registrarHistorico(
    dados: Omit<HistoricoVenda, "id" | "criado_em">
  ): Promise<void> {
    try {
      await supabase.from("historico_vendas").insert(dados);
    } catch (error) {
      console.error("Erro ao registrar histórico:", error);
    }
  }

  /**
   * Cancela uma venda
   */
  static async cancelarVenda(
    vendaId: string,
    usuarioId: string,
    motivo: string
  ): Promise<{ success: boolean; error?: string }> {
    console.log("🚀 INICIANDO CANCELAMENTO DE VENDA:", {
      vendaId,
      usuarioId,
      motivo,
    });

    try {
      // Verificar se a venda pode ser cancelada
      const { data: venda } = await supabase
        .from("vendas")
        .select("*")
        .eq("id", vendaId)
        .single();

      console.log("📋 Venda encontrada:", venda);

      if (!venda) {
        return { success: false, error: "Venda não encontrada" };
      }

      if (venda.status === "cancelada") {
        return { success: false, error: "Venda já está cancelada" };
      }

      // Buscar itens da venda com suas devoluções
      const { data: itens } = await supabase
        .from("itens_venda")
        .select(
          `
          id,
          produto_id, 
          quantidade,
          itens_devolucao:itens_devolucao(quantidade)
        `
        )
        .eq("venda_id", vendaId);

      console.log("🔍 Itens da venda para devolver estoque:", itens);

      // Devolver estoque de cada item (apenas o que NÃO foi devolvido)
      if (itens && itens.length > 0) {
        for (const item of itens) {
          // Calcular quanto já foi devolvido deste item
          const quantidadeDevolvida =
            item.itens_devolucao?.reduce(
              (total: number, dev: any) => total + (dev.quantidade || 0),
              0
            ) || 0;

          // Calcular quanto ainda precisa ser devolvido
          const quantidadeADevolver = item.quantidade - quantidadeDevolvida;

          console.log(
            `📦 Produto ${item.produto_id}:`,
            `Total: ${item.quantidade},`,
            `Já devolvido: ${quantidadeDevolvida},`,
            `A devolver: ${quantidadeADevolver}`
          );

          // Se já devolveu tudo, pula este item
          if (quantidadeADevolver <= 0) {
            console.log(
              `⏭️ Produto ${item.produto_id} já foi totalmente devolvido, pulando...`
            );
            continue;
          }

          // Buscar estoque atual
          const { data: estoqueAtual, error: errorEstoque } = await supabase
            .from("estoque_lojas")
            .select("quantidade")
            .eq("id_produto", item.produto_id)
            .eq("id_loja", venda.loja_id)
            .single();

          console.log(
            `📊 Estoque atual do produto ${item.produto_id}:`,
            estoqueAtual
          );

          if (estoqueAtual) {
            const novaQuantidade =
              estoqueAtual.quantidade + quantidadeADevolver;
            console.log(`➕ Nova quantidade será: ${novaQuantidade}`);

            // Devolver ao estoque
            const { error: errorUpdate } = await supabase
              .from("estoque_lojas")
              .update({
                quantidade: novaQuantidade,
                atualizado_por: usuarioId,
                atualizado_em: new Date().toISOString(),
              })
              .eq("id_produto", item.produto_id)
              .eq("id_loja", venda.loja_id);

            if (errorUpdate) {
              console.error("❌ Erro ao atualizar estoque:", errorUpdate);
            } else {
              console.log(
                `✅ Estoque devolvido com sucesso para produto ${item.produto_id}: +${quantidadeADevolver}`
              );
            }
          } else {
            console.error(
              `❌ Estoque não encontrado para produto ${item.produto_id} na loja ${venda.loja_id}`,
              errorEstoque
            );
          }
        }
      }

      // Atualizar status da venda e zerar valores
      console.log("🔄 Atualizando status da venda para 'cancelada'...");
      const { data: vendaAtualizada, error } = await supabase
        .from("vendas")
        .update({
          status: "cancelada",
          valor_pago: 0,
          saldo_devedor: 0,
        })
        .eq("id", vendaId)
        .select()
        .single();

      if (error) {
        console.error("❌ ERRO ao atualizar status:", error);
        throw error;
      }

      console.log("✅ Venda atualizada no banco:", {
        id: vendaAtualizada.id,
        numero_venda: vendaAtualizada.numero_venda,
        status_novo: vendaAtualizada.status,
        atualizado_em: vendaAtualizada.atualizado_em,
      });

      // Remover pagamentos da venda cancelada
      console.log("🗑️ Removendo pagamentos da venda cancelada...");
      const { error: errorPagamentos } = await supabase
        .from("pagamentos_venda")
        .delete()
        .eq("venda_id", vendaId);

      if (errorPagamentos) {
        console.error("❌ Erro ao remover pagamentos:", errorPagamentos);
      } else {
        console.log("✅ Pagamentos removidos com sucesso!");
      }

      // Remover sangrias relacionadas à venda cancelada
      console.log("🗑️ Removendo sangrias relacionadas à venda...");
      const { error: errorSangrias } = await supabase
        .from("sangrias_caixa")
        .delete()
        .eq("venda_id", vendaId);

      if (errorSangrias) {
        console.error("❌ Erro ao remover sangrias:", errorSangrias);
      } else {
        console.log("✅ Sangrias removidas com sucesso!");
      }

      // Registrar no histórico
      await this.registrarHistorico({
        venda_id: vendaId,
        tipo_acao: "finalizacao",
        descricao: `Venda cancelada - estoque devolvido. Motivo: ${motivo}`,
        usuario_id: usuarioId,
      });

      return { success: true };
    } catch (error: any) {
      console.error("Erro ao cancelar venda:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Conclui uma venda manualmente
   */
  static async concluirVenda(
    vendaId: string,
    usuarioId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Buscar dados da venda
      const { data: venda, error: erroVenda } = await supabase
        .from("vendas")
        .select("*, itens:itens_venda(*)")
        .eq("id", vendaId)
        .single();

      if (erroVenda || !venda) {
        return { success: false, error: "Venda não encontrada" };
      }

      // Verificar se já está concluída
      if (venda.status === "concluida") {
        return { success: false, error: "Venda já está concluída" };
      }

      // Atualizar status para concluída
      const { error: erroUpdate } = await supabase
        .from("vendas")
        .update({
          status: "concluida",
        })
        .eq("id", vendaId);

      if (erroUpdate) {
        return { success: false, error: erroUpdate.message };
      }

      // Registrar no histórico
      await this.registrarHistorico({
        venda_id: vendaId,
        tipo_acao: "finalizacao",
        descricao: "Venda concluída manualmente",
        usuario_id: usuarioId,
      });

      return { success: true };
    } catch (error: any) {
      console.error("Erro ao concluir venda:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Edita dados de uma venda
   */
  /**
   * Edita uma venda de forma segura, comparando itens antigos com novos
   * e ajustando o estoque apenas das diferenças
   */
  static async editarVendaSeguro(
    vendaId: string,
    dados: {
      tipo: "normal" | "fiada";
      data_prevista_pagamento?: string;
      itens: Array<{
        produto_id: string;
        produto_nome: string;
        produto_codigo: string;
        quantidade: number;
        preco_unitario: number;
        subtotal: number;
        desconto_tipo?: "valor" | "percentual";
        desconto_valor?: number;
        valor_desconto?: number;
      }>;
      pagamentos: Array<{
        tipo_pagamento: string;
        valor: number;
        data_pagamento?: string;
      }>;
      desconto?: {
        tipo: "valor" | "percentual";
        valor: number;
        motivo: string;
      } | null;
    },
    usuarioId: string
  ): Promise<{ success: boolean; error?: string }> {
    console.log("🚀 editarVendaSeguro INICIADO", {
      vendaId,
      qtd_itens_novos: dados.itens.length,
      itens_novos: dados.itens.map((i) => ({
        nome: i.produto_nome,
        quantidade: i.quantidade,
      })),
    });

    try {
      // 1. Buscar venda atual
      const { data: vendaAtual, error: errorVenda } = await supabase
        .from("vendas")
        .select("*, itens:itens_venda(*), pagamentos:pagamentos_venda(*)")
        .eq("id", vendaId)
        .single();

      if (errorVenda || !vendaAtual) {
        console.error("❌ Venda não encontrada:", errorVenda);
        return { success: false, error: "Venda não encontrada" };
      }

      console.log("📦 Venda atual carregada:", {
        id: vendaAtual.id,
        qtd_itens_antigos: vendaAtual.itens?.length || 0,
        itens_antigos: vendaAtual.itens?.map((i: any) => ({
          id: i.id,
          nome: i.produto_nome,
          quantidade: i.quantidade,
        })),
      });

      // Não permitir editar vendas canceladas
      if (vendaAtual.status === "cancelada") {
        return {
          success: false,
          error: "Não é possível editar uma venda cancelada",
        };
      }

      const alteracoes: string[] = [];

      // 2. Comparar e ajustar ITENS
      const itensAntigos = (vendaAtual.itens as any[]) || [];
      const itensNovos = dados.itens;

      // Criar mapas para facilitar comparação
      const mapaAntigos = new Map(
        itensAntigos.map((item) => [item.produto_id, item])
      );
      const mapaNovos = new Map(
        itensNovos.map((item) => [item.produto_id, item])
      );

      // Processar itens removidos
      for (const itemAntigo of itensAntigos) {
        if (!mapaNovos.has(itemAntigo.produto_id)) {
          // Item foi removido - devolver estoque
          const { data: estoqueAtual } = await supabase
            .from("estoque_lojas")
            .select("quantidade")
            .eq("id_produto", itemAntigo.produto_id)
            .eq("id_loja", vendaAtual.loja_id)
            .single();

          if (estoqueAtual) {
            await supabase
              .from("estoque_lojas")
              .update({
                quantidade: estoqueAtual.quantidade + itemAntigo.quantidade,
                atualizado_por: usuarioId,
                atualizado_em: new Date().toISOString(),
              })
              .eq("id_produto", itemAntigo.produto_id)
              .eq("id_loja", vendaAtual.loja_id);

            // Registrar no histórico de estoque
            await supabase.from("historico_estoque").insert({
              id_produto: itemAntigo.produto_id,
              id_loja: vendaAtual.loja_id,
              usuario_id: usuarioId,
              quantidade: itemAntigo.quantidade,
              quantidade_anterior: estoqueAtual.quantidade,
              quantidade_nova: estoqueAtual.quantidade + itemAntigo.quantidade,
              tipo_movimentacao: "devolucao_edicao_venda",
              motivo: `Devolução ao estoque por remoção de item da venda ${vendaAtual.numero_venda}`,
            });
          }

          // Deletar item
          await supabase.from("itens_venda").delete().eq("id", itemAntigo.id);
          alteracoes.push(
            `Removido: ${itemAntigo.produto_nome} (${itemAntigo.quantidade}un)`
          );

          // Registrar no histórico da venda
          await this.registrarHistorico({
            venda_id: vendaId,
            tipo_acao: "remocao_item",
            descricao: `Item removido: ${itemAntigo.produto_nome} (${itemAntigo.quantidade}un × ${this.formatarMoeda(Number(itemAntigo.preco_unitario))})`,
            usuario_id: usuarioId,
          });
        }
      }

      // Processar itens novos e alterados
      for (const itemNovo of itensNovos) {
        const itemAntigo = mapaAntigos.get(itemNovo.produto_id);

        if (!itemAntigo) {
          // Item novo - adicionar (a trigger vai baixar o estoque automaticamente)
          const { data: estoqueAtual } = await supabase
            .from("estoque_lojas")
            .select("quantidade")
            .eq("id_produto", itemNovo.produto_id)
            .eq("id_loja", vendaAtual.loja_id)
            .single();

          console.log("📦 Verificando estoque para novo item:", {
            produto: itemNovo.produto_nome,
            quantidade_necessaria: itemNovo.quantidade,
            estoque_disponivel: estoqueAtual?.quantidade || 0,
            loja_id: vendaAtual.loja_id,
          });

          // Validar estoque ANTES de inserir
          if (!estoqueAtual || estoqueAtual.quantidade < itemNovo.quantidade) {
            return {
              success: false,
              error: `Estoque insuficiente para ${itemNovo.produto_nome}. Disponível: ${estoqueAtual?.quantidade || 0}, Necessário: ${itemNovo.quantidade}`,
            };
          }

          // Inserir item (trigger vai baixar estoque e registrar histórico automaticamente)
          const { data: itemInserido, error: erroInsert } = await supabase.from("itens_venda").insert({
            venda_id: vendaId,
            produto_id: itemNovo.produto_id,
            produto_nome: itemNovo.produto_nome,
            produto_codigo: itemNovo.produto_codigo,
            quantidade: itemNovo.quantidade,
            preco_unitario: itemNovo.preco_unitario,
            subtotal: itemNovo.subtotal,
            desconto_tipo: itemNovo.desconto_tipo || null,
            desconto_valor: itemNovo.desconto_valor || 0,
            valor_desconto: itemNovo.valor_desconto || 0,
            devolvido: 0,
          });

          if (erroInsert) {
            console.error("❌ ERRO AO INSERIR ITEM:", {
              produto: itemNovo.produto_nome,
              erro: erroInsert,
              dados: {
                venda_id: vendaId,
                produto_id: itemNovo.produto_id,
                quantidade: itemNovo.quantidade,
              }
            });
            return {
              success: false,
              error: `Erro ao adicionar item ${itemNovo.produto_nome}: ${erroInsert.message}`,
            };
          }

          console.log("✅ Item inserido com sucesso:", {
            produto: itemNovo.produto_nome,
            quantidade: itemNovo.quantidade,
            item: itemInserido,
          });

          alteracoes.push(
            `Adicionado: ${itemNovo.produto_nome} (${itemNovo.quantidade}un)`
          );

          // Registrar no histórico da venda
          await this.registrarHistorico({
            venda_id: vendaId,
            tipo_acao: "adicao_item",
            descricao: `Item adicionado: ${itemNovo.produto_nome} (${itemNovo.quantidade}un × ${this.formatarMoeda(Number(itemNovo.preco_unitario))})`,
            usuario_id: usuarioId,
          });
        } else {
          // Item já existia - verificar mudanças
          console.log("🔍 Comparando item:", {
            produto: itemNovo.produto_nome,
            antiga_quantidade: itemAntigo.quantidade,
            nova_quantidade: itemNovo.quantidade,
            antigo_preco: itemAntigo.preco_unitario,
            novo_preco: itemNovo.preco_unitario,
            antigo_subtotal: itemAntigo.subtotal,
            novo_subtotal: itemNovo.subtotal,
            item_antigo_id: itemAntigo.id,
          });

          const quantidadeMudou = itemAntigo.quantidade !== itemNovo.quantidade;
          const precoMudou =
            itemAntigo.preco_unitario !== itemNovo.preco_unitario;
          const subtotalMudou = itemAntigo.subtotal !== itemNovo.subtotal;

          console.log("📊 Mudanças detectadas:", {
            quantidadeMudou,
            precoMudou,
            subtotalMudou,
          });

          if (quantidadeMudou) {
            // Quantidade alterada - ajustar estoque
            const diferenca = itemNovo.quantidade - itemAntigo.quantidade;

            const { data: estoqueAtual } = await supabase
              .from("estoque_lojas")
              .select("quantidade")
              .eq("id_produto", itemNovo.produto_id)
              .eq("id_loja", vendaAtual.loja_id)
              .single();

            if (!estoqueAtual) {
              return {
                success: false,
                error: `Estoque não encontrado para ${itemNovo.produto_nome}`,
              };
            }

            // Se diferença > 0: vendeu mais, baixa estoque
            // Se diferença < 0: vendeu menos, devolve estoque
            if (diferenca > 0 && estoqueAtual.quantidade < diferenca) {
              return {
                success: false,
                error: `Estoque insuficiente para aumentar quantidade de ${itemNovo.produto_nome}`,
              };
            }

            const { error: erroEstoque } = await supabase
              .from("estoque_lojas")
              .update({
                quantidade: estoqueAtual.quantidade - diferenca,
                atualizado_por: usuarioId,
                atualizado_em: new Date().toISOString(),
              })
              .eq("id_produto", itemNovo.produto_id)
              .eq("id_loja", vendaAtual.loja_id);

            if (erroEstoque) {
              // Verifica se é erro de estoque negativo
              if (
                erroEstoque.code === "23514" ||
                erroEstoque.message?.includes("estoque_lojas_quantidade_check")
              ) {
                return {
                  success: false,
                  error: `Estoque insuficiente para aumentar quantidade de ${itemNovo.produto_nome}. Quantidade disponível: ${estoqueAtual.quantidade}`,
                };
              }
              throw erroEstoque;
            }

            // Registrar no histórico de estoque
            await supabase.from("historico_estoque").insert({
              id_produto: itemNovo.produto_id,
              id_loja: vendaAtual.loja_id,
              usuario_id: usuarioId,
              quantidade: diferenca,
              quantidade_anterior: estoqueAtual.quantidade,
              quantidade_nova: estoqueAtual.quantidade - diferenca,
              tipo_movimentacao:
                diferenca > 0 ? "baixa_edicao_venda" : "devolucao_edicao_venda",
              motivo: `Ajuste de estoque por alteração de quantidade na venda ${vendaAtual.numero_venda} (de ${itemAntigo.quantidade} para ${itemNovo.quantidade})`,
            });

            alteracoes.push(
              `Alterado: ${itemNovo.produto_nome} (${itemAntigo.quantidade} → ${itemNovo.quantidade}un)`
            );

            // Registrar no histórico da venda
            await this.registrarHistorico({
              venda_id: vendaId,
              tipo_acao: "edicao",
              descricao: `Quantidade alterada: ${itemNovo.produto_nome} (${itemAntigo.quantidade}un → ${itemNovo.quantidade}un)`,
              usuario_id: usuarioId,
            });
          }

          if (precoMudou) {
            alteracoes.push(
              `Preço alterado: ${itemNovo.produto_nome} (R$ ${itemAntigo.preco_unitario} → R$ ${itemNovo.preco_unitario})`
            );

            // Registrar no histórico da venda
            await this.registrarHistorico({
              venda_id: vendaId,
              tipo_acao: "edicao",
              descricao: `Preço alterado: ${itemNovo.produto_nome} (${this.formatarMoeda(Number(itemAntigo.preco_unitario))} → ${this.formatarMoeda(Number(itemNovo.preco_unitario))})`,
              usuario_id: usuarioId,
            });
          }

          // Atualizar item se houve qualquer mudança
          if (quantidadeMudou || precoMudou || subtotalMudou) {
            console.log("💾 Atualizando item no banco:", {
              id: itemAntigo.id,
              quantidade: itemNovo.quantidade,
              preco_unitario: itemNovo.preco_unitario,
              subtotal: itemNovo.subtotal,
            });

            const { data: updateResult, error: erroUpdate } = await supabase
              .from("itens_venda")
              .update({
                quantidade: itemNovo.quantidade,
                preco_unitario: itemNovo.preco_unitario,
                subtotal: itemNovo.subtotal,
                desconto_tipo: itemNovo.desconto_tipo,
                desconto_valor: itemNovo.desconto_valor,
              })
              .eq("id", itemAntigo.id)
              .select();

            if (erroUpdate) {
              console.error("❌ Erro ao atualizar item:", erroUpdate);
              return {
                success: false,
                error: `Erro ao atualizar item: ${erroUpdate.message}`,
              };
            }

            console.log(
              "✅ Item atualizado com sucesso. Resultado:",
              updateResult
            );

            // Verificar se realmente atualizou
            const { data: verificacao } = await supabase
              .from("itens_venda")
              .select("id, quantidade, preco_unitario, subtotal")
              .eq("id", itemAntigo.id)
              .single();

            console.log("🔍 Verificação após UPDATE:", verificacao);
          } else {
            console.log("⚠️ Nenhuma mudança detectada para este item");
          }
        }
      }

      // 3. Ajustar PAGAMENTOS (deletar e recriar)
      console.log("💳 Atualizando pagamentos...");
      await supabase.from("pagamentos_venda").delete().eq("venda_id", vendaId);

      for (const pag of dados.pagamentos) {
        await supabase.from("pagamentos_venda").insert({
          venda_id: vendaId,
          tipo_pagamento: pag.tipo_pagamento,
          valor: pag.valor,
          data_pagamento:
            pag.data_pagamento || new Date().toISOString().split("T")[0],
          criado_por: usuarioId,
        });
      }

      // 4. Ajustar DESCONTOS (deletar e recriar se houver)
      await supabase.from("descontos_venda").delete().eq("venda_id", vendaId);

      if (dados.desconto) {
        await supabase.from("descontos_venda").insert({
          venda_id: vendaId,
          tipo: dados.desconto.tipo,
          valor: dados.desconto.valor,
          motivo: dados.desconto.motivo,
          aplicado_por: usuarioId,
        });
      }

      // 6. Recalcular totais - calcular manualmente a partir dos dados novos
      console.log("🔄 Recalculando totais manualmente...");

      const valorTotalItens = dados.itens.reduce(
        (sum, item) => sum + item.subtotal,
        0
      );
      const valorPagoTotal = dados.pagamentos.reduce(
        (sum, pag) => sum + pag.valor,
        0
      );

      let valorDescontoTotal = 0;
      if (dados.desconto) {
        if (dados.desconto.tipo === "valor") {
          valorDescontoTotal = dados.desconto.valor;
        } else {
          valorDescontoTotal = (valorTotalItens * dados.desconto.valor) / 100;
        }
      }

      const saldoDevedorFinal =
        valorTotalItens - valorDescontoTotal - valorPagoTotal;

      let statusFinal = vendaAtual.status;
      if (saldoDevedorFinal <= 0 && valorPagoTotal > 0) {
        statusFinal = "concluida";
      } else if (valorPagoTotal > 0 && saldoDevedorFinal > 0) {
        statusFinal = "em_andamento";
      }

      console.log("📊 Totais calculados manualmente:", {
        valorTotal: valorTotalItens,
        valorDesconto: valorDescontoTotal,
        valorPago: valorPagoTotal,
        saldoDevedor: saldoDevedorFinal,
        status: statusFinal,
      });

      // Atualizar venda com os totais calculados
      await supabase
        .from("vendas")
        .update({
          tipo: dados.tipo,
          data_prevista_pagamento: dados.data_prevista_pagamento,
          valor_total: valorTotalItens,
          valor_desconto: valorDescontoTotal,
          valor_pago: valorPagoTotal,
          saldo_devedor: saldoDevedorFinal,
          status: statusFinal,
        })
        .eq("id", vendaId);

      // 7. Registrar no histórico
      await this.registrarHistorico({
        venda_id: vendaId,
        tipo_acao: "edicao",
        descricao: `Venda editada: ${alteracoes.join("; ") || "Dados atualizados"}`,
        usuario_id: usuarioId,
      });

      console.log("✅ editarVendaSeguro CONCLUÍDO com sucesso!");
      return { success: true };
    } catch (error: any) {
      console.error("❌ Erro ao editar venda:", error);

      // Tratamento específico para erro de estoque negativo
      if (
        error.code === "23514" ||
        error.message?.includes("estoque_lojas_quantidade_check")
      ) {
        return {
          success: false,
          error:
            "Estoque insuficiente. Um ou mais produtos não têm quantidade suficiente em estoque.",
        };
      }

      return { success: false, error: error.message };
    }
  }

  // ============================================================================
  // FUNÇÃO REMOVIDA: editarVenda (antiga versão)
  // ============================================================================
  // MOTIVO: Fazia baixa manual de estoque duplicando com a trigger 
  //         baixa_estoque_ao_adicionar_item que já executa automaticamente
  //         após INSERT em itens_venda.
  //
  // SOLUÇÃO: Use editarVendaSeguro() que delega corretamente para a trigger
  //          e evita duplicação de baixa de estoque.
  // ============================================================================

  /*
  // FUNÇÃO REMOVIDA: editarVenda (antiga versão com duplicação)
  // Esta função foi removida porque fazia baixa manual de estoque,
  // duplicando a ação da trigger baixa_estoque_ao_adicionar_item.
  // Use editarVendaSeguro() ao invés desta função.
  */

  /**
   * Exclui uma venda (apenas se não tiver pagamentos)
   */
  static async excluirVenda(
    vendaId: string,
    usuarioId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Buscar a venda
      const { data: venda } = await supabase
        .from("vendas")
        .select("status")
        .eq("id", vendaId)
        .single();

      if (!venda) {
        return {
          success: false,
          error: "Venda não encontrada",
        };
      }

      // Verificar se há pagamentos (apenas para vendas NÃO canceladas)
      if (venda.status !== "cancelada") {
        const { data: pagamentos } = await supabase
          .from("pagamentos_venda")
          .select("id")
          .eq("venda_id", vendaId);

        if (pagamentos && pagamentos.length > 0) {
          return {
            success: false,
            error:
              "Não é possível excluir venda com pagamentos registrados. Cancele a venda antes de excluir.",
          };
        }
      }

      // Registrar no histórico antes de deletar
      await this.registrarHistorico({
        venda_id: vendaId,
        tipo_acao: "exclusao",
        descricao: `Venda excluída do sistema (status: ${venda.status})`,
        usuario_id: usuarioId,
      });

      // Com CASCADE DELETE configurado no banco, basta deletar a venda
      // O banco vai automaticamente deletar todos os registros relacionados
      const { error } = await supabase
        .from("vendas")
        .delete()
        .eq("id", vendaId);

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      console.error("Erro ao excluir venda:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Lista vendas com filtros
   */
  static async listarVendas(filtros?: {
    cliente_id?: string;
    vendedor_id?: string;
    loja_id?: number;
    status?: string;
    data_inicio?: string;
    data_fim?: string;
  }): Promise<VendaCompleta[]> {
    try {
      let query = supabase
        .from("vendas")
        .select(
          `
          *,
          cliente:clientes(id, nome, cpf),
          loja:lojas(id, nome),
          vendedor:usuarios!vendas_vendedor_id_fkey(id, nome),
          pagamentos:pagamentos_venda(id, valor, tipo_pagamento, criado_em),
          itens:itens_venda(id, produto_id, quantidade, preco_unitario, subtotal, devolvido),
          devolucoes:devolucoes_venda(id)
        `
        )
        .order("criado_em", { ascending: false });

      if (filtros?.cliente_id) {
        query = query.eq("cliente_id", filtros.cliente_id);
      }
      if (filtros?.vendedor_id) {
        query = query.eq("vendedor_id", filtros.vendedor_id);
      }
      if (filtros?.loja_id) {
        query = query.eq("loja_id", filtros.loja_id);
      }
      if (filtros?.status) {
        query = query.eq("status", filtros.status);
      }
      if (filtros?.data_inicio) {
        query = query.gte("criado_em", filtros.data_inicio);
      }
      if (filtros?.data_fim) {
        query = query.lte("criado_em", filtros.data_fim);
      }

      const { data, error } = await query;

      if (error) throw error;

      return (data as VendaCompleta[]) || [];
    } catch (error) {
      console.error("Erro ao listar vendas:", error);
      return [];
    }
  }

  static async substituirVenda(
    vendaId: string,
    dados: {
      tipo: "normal" | "fiada";
      data_prevista_pagamento?: string;
      itens: Array<{
        produto_id: string;
        produto_nome: string;
        produto_codigo: string;
        quantidade: number;
        preco_unitario: number;
        subtotal: number;
        desconto_tipo?: string;
        desconto_valor?: number;
      }>;
      pagamentos: Array<{
        tipo_pagamento: string;
        valor: number;
        data_pagamento: string;
        observacao?: string;
      }>;
    },
    usuarioId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: vendaAtual, error: errorVenda } = await supabase
        .from("vendas")
        .select("*")
        .eq("id", vendaId)
        .single();

      if (errorVenda || !vendaAtual) {
        return { success: false, error: "Venda não encontrada" };
      }

      // Buscar itens da venda
      const { data: itensAntigos } = await supabase
        .from("itens_venda")
        .select("*")
        .eq("venda_id", vendaId);

      // Devolver estoque dos itens antigos manualmente
      // (pois o DELETE não tem trigger de devolução)
      for (const itemAntigo of itensAntigos || []) {
        console.log("🔄 Devolvendo estoque:", {
          produto_id: itemAntigo.produto_id,
          quantidade: itemAntigo.quantidade,
          loja_id: vendaAtual.loja_id,
        });

        const { data: estoqueAtual } = await supabase
          .from("estoque_lojas")
          .select("quantidade")
          .eq("id_produto", itemAntigo.produto_id)
          .eq("id_loja", vendaAtual.loja_id)
          .single();

        console.log(
          "📊 Estoque atual antes da devolução:",
          estoqueAtual?.quantidade
        );

        if (estoqueAtual) {
          await supabase
            .from("estoque_lojas")
            .update({
              quantidade: estoqueAtual.quantidade + itemAntigo.quantidade,
              atualizado_por: usuarioId,
              atualizado_em: new Date().toISOString(),
            })
            .eq("id_produto", itemAntigo.produto_id)
            .eq("id_loja", vendaAtual.loja_id);

          console.log(
            "✅ Estoque após devolução:",
            estoqueAtual.quantidade + itemAntigo.quantidade
          );
        }
      }

      // Deletar itens e pagamentos antigos
      console.log("🗑️ Deletando itens antigos da venda:", vendaId);
      await supabase.from("itens_venda").delete().eq("venda_id", vendaId);
      await supabase.from("pagamentos_venda").delete().eq("venda_id", vendaId);

      // Inserir novos itens (a trigger baixa o estoque automaticamente)
      console.log("➕ Inserindo novos itens:", dados.itens.length);
      for (const item of dados.itens) {
        console.log("📦 Inserindo item:", {
          produto_id: item.produto_id,
          quantidade: item.quantidade,
        });
        await supabase.from("itens_venda").insert({
          venda_id: vendaId,
          produto_id: item.produto_id,
          produto_nome: item.produto_nome,
          produto_codigo: item.produto_codigo,
          quantidade: item.quantidade,
          preco_unitario: item.preco_unitario,
          subtotal: item.subtotal,
          devolvido: 0,
          desconto_tipo: item.desconto_tipo,
          desconto_valor: item.desconto_valor,
        });
        // A trigger baixa o estoque automaticamente
      }

      for (const pag of dados.pagamentos) {
        await supabase.from("pagamentos_venda").insert({
          venda_id: vendaId,
          tipo_pagamento: pag.tipo_pagamento,
          valor: pag.valor,
          data_pagamento: pag.data_pagamento,
          observacao: pag.observacao,
          criado_por: usuarioId,
        });
      }

      await supabase
        .from("vendas")
        .update({
          tipo: dados.tipo,
          data_prevista_pagamento: dados.data_prevista_pagamento,
        })
        .eq("id", vendaId);

      return { success: true };
    } catch (error: any) {
      console.error("Erro ao substituir venda:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Busca os créditos disponíveis de um cliente
   */
  static async buscarCreditosCliente(
    clienteId: string
  ): Promise<{ data: any[] | null; error?: string }> {
    try {
      const { data, error } = await supabase
        .from("creditos_cliente")
        .select("*")
        .eq("cliente_id", clienteId)
        .gt("saldo", 0);

      if (error) throw error;

      return { data };
    } catch (error: any) {
      console.error("Erro ao buscar créditos do cliente:", error);
      return { data: null, error: error.message };
    }
  }

  // ==================== DEVOLUÇÕES ====================

  /**
   * Processa devolução de itens de uma venda
   */
  static async processarDevolucao(dados: {
    venda_id: string;
    itens: Array<{
      item_venda_id: string;
      produto_id: string;
      quantidade: number;
      preco_unitario: number;
    }>;
    gerar_credito: boolean;
    forma_pagamento: string;
    motivo: string;
    usuario_id: string;
  }): Promise<{
    success: boolean;
    devolucao?: DevolucaoVenda;
    error?: string;
  }> {
    try {
      console.log("🔵 Processando devolução:", dados);

      // Buscar venda
      const { data: venda, error: erroVenda } = await supabase
        .from("vendas")
        .select("*, cliente:clientes(id, nome)")
        .eq("id", dados.venda_id)
        .single();

      if (erroVenda || !venda) throw new Error("Venda não encontrada");

      if (venda.status !== "concluida") {
        throw new Error("Apenas vendas concluídas podem ter devolução");
      }

      // Calcular valor total da devolução (subtotal dos itens)
      const subtotalItens = dados.itens.reduce(
        (total, item) => total + item.quantidade * item.preco_unitario,
        0
      );

      console.log("💰 Subtotal dos itens devolvidos:", subtotalItens);
      console.log(
        "💰 Venda - desconto:",
        venda.valor_desconto,
        "total:",
        venda.valor_total
      );

      // Aplicar desconto proporcional se a venda teve desconto
      let valorDevolvido = subtotalItens;
      if (venda.valor_desconto > 0 && venda.valor_total > 0) {
        const percentualDesconto = venda.valor_desconto / venda.valor_total;
        const descontoProporcional = subtotalItens * percentualDesconto;
        valorDevolvido = subtotalItens - descontoProporcional;

        console.log("💰 Cálculo da devolução COM DESCONTO:", {
          subtotalItens,
          descontoVenda: venda.valor_desconto,
          totalVenda: venda.valor_total,
          percentualDesconto: (percentualDesconto * 100).toFixed(2) + "%",
          descontoProporcional,
          valorFinalDevolvido: valorDevolvido,
        });
      } else {
        console.log("💰 Cálculo da devolução SEM DESCONTO:", {
          subtotalItens,
          valorFinalDevolvido: valorDevolvido,
        });
      }

      // Criar registro de devolução
      const { data: devolucao, error: erroDevolucao } = await supabase
        .from("devolucoes_venda")
        .insert({
          venda_id: dados.venda_id,
          tipo: dados.gerar_credito ? "com_credito" : "sem_credito",
          valor_total: valorDevolvido,
          forma_pagamento: dados.forma_pagamento,
          motivo: dados.motivo,
          realizado_por: dados.usuario_id,
        })
        .select()
        .single();

      if (erroDevolucao) throw erroDevolucao;

      // Criar itens de devolução e atualizar estoque
      for (const item of dados.itens) {
        console.log("🔍 Processando item:", item);
        console.log(
          "🔍 item_venda_id:",
          item.item_venda_id,
          "tipo:",
          typeof item.item_venda_id
        );

        // Buscar informações completas do item de venda
        const { data: itemVenda, error: erroItemVenda } = await supabase
          .from("itens_venda")
          .select("produto_id, devolvido")
          .eq("id", item.item_venda_id)
          .single();

        if (erroItemVenda || !itemVenda) {
          throw new Error("Item de venda não encontrado");
        }

        console.log("🔍 Dados para inserir:", {
          devolucao_id: devolucao.id,
          item_venda_id: item.item_venda_id,
          quantidade: item.quantidade,
          motivo: dados.motivo,
        });

        // Inserir item de devolução
        const { error: erroItem } = await supabase
          .from("itens_devolucao")
          .insert({
            devolucao_id: devolucao.id,
            item_venda_id: item.item_venda_id,
            quantidade: item.quantidade,
            motivo: dados.motivo,
          });

        if (erroItem) {
          console.error("❌ Erro ao inserir item_devolucao:", erroItem);
          throw erroItem;
        }

        // Atualizar quantidade devolvida no item da venda
        const { error: erroUpdate } = await supabase.rpc(
          "atualizar_devolvido_item_venda",
          {
            p_item_id: item.item_venda_id,
            p_quantidade: item.quantidade,
          }
        );

        if (erroUpdate) {
          console.warn(
            "Aviso: RPC não encontrada, atualizando diretamente:",
            erroUpdate
          );
          // Fallback: atualizar diretamente
          await supabase
            .from("itens_venda")
            .update({
              devolvido: (itemVenda.devolvido || 0) + item.quantidade,
            })
            .eq("id", item.item_venda_id);
        }

        // NOTA: A trigger 'trigger_registrar_devolucao_estoque' automaticamente:
        // 1. Atualiza o estoque_lojas
        // 2. Registra no historico_estoque
        // Portanto, não precisamos chamar devolverEstoque aqui
      }

      // Gerar crédito se solicitado
      if (dados.gerar_credito) {
        console.log("💳 Gerando crédito:", {
          cliente_id: venda.cliente_id,
          venda_origem_id: dados.venda_id,
          devolucao_id: devolucao.id,
          valor_total: valorDevolvido,
          saldo: valorDevolvido,
        });

        const { data: creditoData, error: erroCredito } = await supabase
          .from("creditos_cliente")
          .insert({
            cliente_id: venda.cliente_id,
            venda_origem_id: dados.venda_id,
            devolucao_id: devolucao.id,
            tipo: "adicao",
            valor_total: valorDevolvido,
            valor_utilizado: 0,
            saldo: valorDevolvido,
            motivo: `Devolução de produtos - ${dados.motivo}`,
            gerado_por: dados.usuario_id,
          })
          .select()
          .single();

        if (erroCredito) {
          console.error("❌ Erro ao criar crédito:", erroCredito);
          throw erroCredito;
        }

        console.log("✅ Crédito criado com sucesso:", creditoData);
      }

      // Registrar no histórico
      await this.registrarHistorico({
        venda_id: dados.venda_id,
        tipo_acao: "devolucao",
        descricao: `Devolução processada: ${dados.itens.length} item(ns), valor: ${this.formatarMoeda(valorDevolvido)}${dados.gerar_credito ? " (crédito gerado)" : ""}`,
        usuario_id: dados.usuario_id,
      });

      console.log("✅ Devolução processada com sucesso");

      return { success: true, devolucao };
    } catch (error: any) {
      console.error("❌ Erro ao processar devolução:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Devolve produto ao estoque
   */
  private static async devolverEstoque(dados: {
    produto_id: string;
    loja_id: number;
    quantidade: number;
    motivo: string;
    usuario_id: string;
  }): Promise<void> {
    try {
      // Buscar estoque atual
      const { data: estoque } = await supabase
        .from("estoque_lojas")
        .select("*")
        .eq("id_produto", dados.produto_id)
        .eq("id_loja", dados.loja_id)
        .single();

      const quantidadeAtual = estoque?.quantidade || 0;
      const novaQuantidade = quantidadeAtual + dados.quantidade;

      if (estoque) {
        // Atualizar estoque existente
        await supabase
          .from("estoque_lojas")
          .update({
            quantidade: novaQuantidade,
            atualizado_em: new Date().toISOString(),
            atualizado_por: dados.usuario_id,
          })
          .eq("id_produto", dados.produto_id)
          .eq("id_loja", dados.loja_id);
      } else {
        // Criar novo registro de estoque
        await supabase.from("estoque_lojas").insert({
          id_produto: dados.produto_id,
          id_loja: dados.loja_id,
          quantidade: dados.quantidade,
          atualizado_por: dados.usuario_id,
        });
      }

      // Registrar no histórico de estoque
      await supabase.from("historico_estoque").insert({
        id_produto: dados.produto_id,
        id_loja: dados.loja_id,
        quantidade_anterior: quantidadeAtual,
        quantidade_nova: novaQuantidade,
        quantidade_alterada: dados.quantidade,
        tipo_movimentacao: "devolucao_venda",
        motivo: dados.motivo,
        usuario_id: dados.usuario_id,
      });

      console.log("✅ Estoque devolvido:", {
        produto: dados.produto_id,
        loja: dados.loja_id,
        quantidade: dados.quantidade,
      });
    } catch (error) {
      console.error("❌ Erro ao devolver estoque:", error);
      throw error;
    }
  }

  /**
   * Busca devoluções de uma venda
   */
  static async buscarDevolucoes(
    vendaId: string
  ): Promise<{ data: DevolucaoVenda[] | null; error?: string }> {
    try {
      const { data, error } = await supabase
        .from("devolucoes_venda")
        .select(
          `
          *,
          itens:itens_devolucao(*)
        `
        )
        .eq("venda_id", vendaId)
        .order("criado_em", { ascending: false });

      if (error) throw error;

      return { data };
    } catch (error: any) {
      console.error("Erro ao buscar devoluções:", error);
      return { data: null, error: error.message };
    }
  }
}
