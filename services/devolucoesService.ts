import type { DevolucaoVenda, CreditoCliente } from "@/types/vendas";

import { supabase } from "@/lib/supabaseClient";

export class DevolucoesService {
  /**
   * Registra uma devolução
   */
  static async registrarDevolucao(dados: {
    venda_id: string;
    tipo: "com_credito" | "sem_credito";
    itens: Array<{
      item_venda_id: string;
      quantidade: number;
      motivo?: string;
    }>;
    motivo_geral: string;
    usuario_id: string;
  }): Promise<{
    success: boolean;
    devolucao?: DevolucaoVenda;
    error?: string;
  }> {
    try {
      // Calcula valor total da devolução
      const { data: itensVenda } = await supabase
        .from("itens_venda")
        .select("id, preco_unitario, quantidade, devolvido")
        .in(
          "id",
          dados.itens.map((i) => i.item_venda_id),
        );

      if (!itensVenda || itensVenda.length === 0) {
        throw new Error("Itens não encontrados");
      }

      let valorTotal = 0;
      const itensMap = new Map(itensVenda.map((item: any) => [item.id, item]));

      for (const item of dados.itens) {
        const itemVenda = itensMap.get(item.item_venda_id);

        if (!itemVenda) continue;

        // Verifica quantidade disponível
        const disponivelDevolver = itemVenda.quantidade - itemVenda.devolvido;

        if (item.quantidade > disponivelDevolver) {
          throw new Error(`Quantidade para devolução excede disponível`);
        }

        valorTotal += itemVenda.preco_unitario * item.quantidade;
      }

      // Cria devolução
      const { data: devolucao, error: errorDev } = await supabase
        .from("devolucoes_venda")
        .insert({
          venda_id: dados.venda_id,
          tipo: dados.tipo,
          motivo: dados.motivo_geral,
          valor_total: valorTotal,
          realizado_por: dados.usuario_id,
        })
        .select()
        .single();

      if (errorDev) throw errorDev;

      // Insere itens da devolução
      const itensDevolucao = dados.itens.map((item) => ({
        devolucao_id: devolucao.id,
        item_venda_id: item.item_venda_id,
        quantidade: item.quantidade,
        motivo: item.motivo,
      }));

      const { error: errorItens } = await supabase
        .from("itens_devolucao")
        .insert(itensDevolucao);

      if (errorItens) throw errorItens;

      // Atualiza quantidade devolvida nos itens da venda
      for (const item of dados.itens) {
        const itemVenda = itensMap.get(item.item_venda_id);

        if (!itemVenda) continue;

        await supabase
          .from("itens_venda")
          .update({
            devolvido: itemVenda.devolvido + item.quantidade,
          })
          .eq("id", item.item_venda_id);
      }

      // Se for devolução com crédito, gera crédito para o cliente
      if (dados.tipo === "com_credito") {
        const { data: venda } = await supabase
          .from("vendas")
          .select("cliente_id")
          .eq("id", dados.venda_id)
          .single();

        if (venda) {
          await this.gerarCredito({
            cliente_id: venda.cliente_id,
            venda_id: dados.venda_id,
            devolucao_id: devolucao.id,
            valor: valorTotal,
            motivo: `Devolução: ${dados.motivo_geral}`,
            gerado_por: dados.usuario_id,
          });
        }
      }

      // Registra no histórico
      await this.registrarHistorico({
        venda_id: dados.venda_id,
        tipo_acao: "devolucao",
        descricao: `Devolução registrada (${dados.tipo}) - R$ ${valorTotal.toFixed(2)}`,
        usuario_id: dados.usuario_id,
      });

      return { success: true, devolucao };
    } catch (error: any) {
      console.error("Erro ao registrar devolução:", error);

      return { success: false, error: error.message };
    }
  }

  /**
   * Gera crédito para cliente
   */
  private static async gerarCredito(dados: {
    cliente_id: string;
    venda_id?: string;
    devolucao_id?: string;
    valor: number;
    motivo: string;
    gerado_por: string;
  }): Promise<void> {
    try {
      await supabase.from("creditos_cliente").insert({
        cliente_id: dados.cliente_id,
        venda_id: dados.venda_id,
        devolucao_id: dados.devolucao_id,
        valor: dados.valor,
        saldo: dados.valor,
        motivo: dados.motivo,
        gerado_por: dados.gerado_por,
      });
    } catch (error) {
      console.error("Erro ao gerar crédito:", error);
      throw error;
    }
  }

  /**
   * Busca créditos disponíveis do cliente
   */
  static async buscarCreditosCliente(
    clienteId: string,
  ): Promise<CreditoCliente[]> {
    try {
      const { data, error } = await supabase
        .from("creditos_cliente")
        .select("*")
        .eq("cliente_id", clienteId)
        .gt("saldo", 0)
        .order("criado_em", { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error("Erro ao buscar créditos:", error);

      return [];
    }
  }

  /**
   * Utiliza crédito em pagamento
   */
  static async utilizarCredito(
    creditoId: string,
    valor: number,
    vendaId: string,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Busca crédito
      const { data: credito } = await supabase
        .from("creditos_cliente")
        .select("saldo")
        .eq("id", creditoId)
        .single();

      if (!credito || credito.saldo < valor) {
        throw new Error("Saldo insuficiente");
      }

      // Atualiza saldo do crédito
      const { error: errorCredito } = await supabase
        .from("creditos_cliente")
        .update({
          saldo: credito.saldo - valor,
          utilizado_em:
            valor === credito.saldo ? new Date().toISOString() : undefined,
        })
        .eq("id", creditoId);

      if (errorCredito) throw errorCredito;

      return { success: true };
    } catch (error: any) {
      console.error("Erro ao utilizar crédito:", error);

      return { success: false, error: error.message };
    }
  }

  /**
   * Busca devoluções de uma venda
   */
  static async buscarDevolucoes(vendaId: string): Promise<DevolucaoVenda[]> {
    try {
      const { data, error } = await supabase
        .from("devolucoes_venda")
        .select(
          `
          *,
          itens:itens_devolucao(
            *,
            item_venda:itens_venda(
              produto:produtos(descricao, codigo_fabricante)
            )
          ),
          realizado:usuarios(nome)
        `,
        )
        .eq("venda_id", vendaId)
        .order("criado_em", { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error("Erro ao buscar devoluções:", error);

      return [];
    }
  }

  /**
   * Registra ação no histórico
   */
  private static async registrarHistorico(dados: {
    venda_id: string;
    tipo_acao: string;
    descricao: string;
    usuario_id: string;
  }): Promise<void> {
    try {
      await supabase.from("historico_vendas").insert(dados);
    } catch (error) {
      console.error("Erro ao registrar histórico:", error);
    }
  }

  /**
   * Calcula total de créditos disponíveis do cliente
   */
  static async calcularTotalCreditosDisponiveis(
    clienteId: string,
  ): Promise<number> {
    try {
      const { data, error } = await supabase
        .from("creditos_cliente")
        .select("saldo")
        .eq("cliente_id", clienteId)
        .gt("saldo", 0);

      if (error) throw error;

      return data?.reduce((sum, c) => sum + c.saldo, 0) || 0;
    } catch (error) {
      console.error("Erro ao calcular créditos:", error);

      return 0;
    }
  }

  /**
   * Busca histórico de uso de créditos do cliente
   */
  static async buscarHistoricoCreditos(
    clienteId: string,
  ): Promise<CreditoCliente[]> {
    try {
      const { data, error } = await supabase
        .from("creditos_cliente")
        .select(
          `
          *,
          venda:vendas(numero_venda),
          devolucao:devolucoes_venda(motivo),
          gerado:usuarios(nome)
        `,
        )
        .eq("cliente_id", clienteId)
        .order("criado_em", { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error("Erro ao buscar histórico de créditos:", error);

      return [];
    }
  }
}
