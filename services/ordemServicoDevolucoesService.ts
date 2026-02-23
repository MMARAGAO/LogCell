import { supabase } from "@/lib/supabaseClient";

export interface DevolucaoOS {
  id: string;
  id_ordem_servico: string;
  tipo_devolucao: "reembolso" | "credito";
  valor_total: number;
  motivo?: string;
  criado_em: string;
  realizado_por: string;
  ordem_servico?: any; // Supabase relationship array
  usuario?: any; // Supabase relationship array
}

export class OrdemServicoDevolucoesService {
  /**
   * Registra uma devolução de OS
   */
  static async registrarDevolucaoOS(dados: {
    id_ordem_servico: string;
    tipo_devolucao: "reembolso" | "credito";
    valor_total: number;
    motivo?: string;
    usuario_id: string;
    cliente_id?: string;
  }): Promise<{
    success: boolean;
    devolucao?: DevolucaoOS;
    error?: string;
  }> {
    try {
      // Criar registro da devolução
      const { data: devolucao, error: errorDev } = await supabase
        .from("devolu_ordem_servico")
        .insert({
          id_ordem_servico: dados.id_ordem_servico,
          tipo_devolucao: dados.tipo_devolucao,
          valor_total: dados.valor_total,
          motivo: dados.motivo,
          realizado_por: dados.usuario_id,
        })
        .select()
        .single();

      if (errorDev) throw errorDev;

      // Se for devolução com crédito, gera crédito para o cliente
      if (dados.tipo_devolucao === "credito" && dados.cliente_id) {
        await this.gerarCreditoCliente({
          cliente_id: dados.cliente_id,
          ordem_servico_id: dados.id_ordem_servico,
          devolucao_os_id: devolucao.id,
          valor: dados.valor_total,
          motivo: `Devolução da OS #${dados.id_ordem_servico}`,
          gerado_por: dados.usuario_id,
        });
      }

      return { success: true, devolucao };
    } catch (error: any) {
      console.error("Erro ao registrar devolução de OS:", error);

      return { success: false, error: error.message };
    }
  }

  /**
   * Gera crédito para cliente a partir de devolução de OS
   */
  private static async gerarCreditoCliente(dados: {
    cliente_id: string;
    ordem_servico_id: string;
    devolucao_os_id: string;
    valor: number;
    motivo: string;
    gerado_por: string;
  }): Promise<void> {
    try {
      await supabase.from("creditos_cliente").insert({
        cliente_id: dados.cliente_id,
        ordem_servico_id: dados.ordem_servico_id,
        devolucao_os_id: dados.devolucao_os_id,
        valor: dados.valor,
        saldo: dados.valor,
        motivo: dados.motivo,
        gerado_por: dados.gerado_por,
      });
    } catch (error) {
      console.error("Erro ao gerar crédito para cliente:", error);
      throw error;
    }
  }

  /**
   * Busca devoluções de OS por período
   */
  static async buscarDevolucoesOSPorPeriodo(
    data_inicio: string,
    data_fim: string,
    loja_id?: number,
  ): Promise<DevolucaoOS[]> {
    try {
      let query = supabase
        .from("devolu_ordem_servico")
        .select(
          `
          id,
          id_ordem_servico,
          tipo_devolucao,
          valor_total,
          motivo,
          criado_em,
          realizado_por,
          ordem_servico:ordem_servico(
            numero_os,
            cliente_nome,
            cliente_id,
            id_loja
          ),
          usuario:usuarios(id, nome)
        `,
        )
        .gte("criado_em", data_inicio)
        .lte("criado_em", data_fim);

      const { data, error } = await query;

      if (error) throw error;

      let result = (data || []) as DevolucaoOS[];

      if (loja_id) {
        result = result.filter((dev) => {
          const os = Array.isArray(dev.ordem_servico)
            ? (dev.ordem_servico as any[])[0]
            : dev.ordem_servico;

          return (os as any)?.id_loja === loja_id;
        });
      }

      return result;
    } catch (error) {
      console.error("Erro ao buscar devoluções de OS:", error);

      return [];
    }
  }

  /**
   * Busca devoluções de OS com reembolso para um caixa específico
   */
  static async buscarReembolsosOS(
    data_inicio: string,
    data_fim: string,
    loja_id?: number,
  ): Promise<DevolucaoOS[]> {
    try {
      let query = supabase
        .from("devolu_ordem_servico")
        .select(
          `
          id,
          id_ordem_servico,
          tipo_devolucao,
          valor_total,
          motivo,
          criado_em,
          realizado_por,
          ordem_servico:ordem_servico(
            numero_os,
            cliente_nome,
            id_loja
          ),
          usuario:usuarios(id, nome)
        `,
        )
        .eq("tipo_devolucao", "reembolso")
        .gte("criado_em", data_inicio)
        .lte("criado_em", data_fim);

      const { data, error } = await query;

      if (error) throw error;

      let result = (data || []) as DevolucaoOS[];

      if (loja_id) {
        result = result.filter((dev) => {
          const os = Array.isArray(dev.ordem_servico)
            ? (dev.ordem_servico as any[])[0]
            : dev.ordem_servico;

          return (os as any)?.id_loja === loja_id;
        });
      }

      return result;
    } catch (error) {
      console.error("Erro ao buscar reembolsos de OS:", error);

      return [];
    }
  }

  /**
   * Busca devoluções de OS com crédito para um caixa específico
   */
  static async buscarCreditosOS(
    data_inicio: string,
    data_fim: string,
    loja_id?: number,
  ): Promise<DevolucaoOS[]> {
    try {
      let query = supabase
        .from("devolu_ordem_servico")
        .select(
          `
          id,
          id_ordem_servico,
          tipo_devolucao,
          valor_total,
          motivo,
          criado_em,
          realizado_por,
          ordem_servico:ordem_servico(
            numero_os,
            cliente_nome,
            id_loja
          ),
          usuario:usuarios(id, nome)
        `,
        )
        .eq("tipo_devolucao", "credito")
        .gte("criado_em", data_inicio)
        .lte("criado_em", data_fim);

      const { data, error } = await query;

      if (error) throw error;

      let result = (data || []) as DevolucaoOS[];

      if (loja_id) {
        result = result.filter((dev) => {
          const os = Array.isArray(dev.ordem_servico)
            ? (dev.ordem_servico as any[])[0]
            : dev.ordem_servico;

          return (os as any)?.id_loja === loja_id;
        });
      }

      return result;
    } catch (error) {
      console.error("Erro ao buscar créditos de OS:", error);

      return [];
    }
  }
}
