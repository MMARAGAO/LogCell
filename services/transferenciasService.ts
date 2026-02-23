import type { TransferenciaCompleta } from "@/types";

import { supabase } from "@/lib/supabaseClient";

export class TransferenciasService {
  /**
   * Buscar todas as transferências com filtros opcionais
   */
  static async buscarTransferencias(filtros?: {
    status?: "pendente" | "confirmada" | "cancelada";
    loja_id?: number;
  }): Promise<TransferenciaCompleta[]> {
    try {
      let query = supabase
        .from("transferencias")
        .select(
          `
          *,
          itens:transferencias_itens(
            *,
            produto:produtos(
              descricao, 
              codigo_fabricante, 
              marca,
              estoque_lojas(
                id_loja,
                quantidade
              )
            )
          ),
          loja_origem:lojas!loja_origem_id(nome),
          loja_destino:lojas!loja_destino_id(nome),
          criado_por_usuario:usuarios!usuario_id(nome),
          confirmado_por_usuario:usuarios!confirmado_por(nome),
          cancelado_por_usuario:usuarios!cancelado_por(nome)
        `,
        )
        .order("criado_em", { ascending: false });

      if (filtros?.status) {
        query = query.eq("status", filtros.status);
      }

      if (filtros?.loja_id) {
        query = query.or(
          `loja_origem_id.eq.${filtros.loja_id},loja_destino_id.eq.${filtros.loja_id}`,
        );
      }

      const { data, error } = await query;

      if (error) {
        console.error("Erro ao buscar transferências:", error);
        throw new Error(
          `Erro ao buscar transferências: ${error.message || error.details || JSON.stringify(error)}`,
        );
      }

      // Formatar dados com aliases para compatibilidade
      return (
        data?.map((t: any) => ({
          ...t,
          itens:
            t.itens?.map((item: any) => ({
              ...item,
              produto_descricao: item.produto?.descricao,
              produto_codigo: item.produto?.codigo_fabricante,
              produto_marca: item.produto?.marca,
              produtos: item.produto, // Incluir produto completo com estoque_lojas
            })) || [],
          loja_origem_nome: t.loja_origem?.nome,
          loja_origem: t.loja_origem?.nome, // Alias
          loja_destino_nome: t.loja_destino?.nome,
          loja_destino: t.loja_destino?.nome, // Alias
          criado_por_nome: t.criado_por_usuario?.nome,
          usuario_nome: t.criado_por_usuario?.nome, // Alias
          confirmado_por_nome: t.confirmado_por_usuario?.nome,
          cancelado_por_nome: t.cancelado_por_usuario?.nome,
          // observacao já vem correto do banco (não precisa alias)
        })) || []
      );
    } catch (error) {
      console.error("Erro ao buscar transferências:", error);
      throw error;
    }
  }

  /**
   * Confirmar transferência (executa a movimentação de estoque)
   */
  static async confirmarTransferencia(
    transferencia_id: string,
    usuario_id: string,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await supabase.rpc("confirmar_transferencia", {
        p_transferencia_id: transferencia_id,
        p_usuario_id: usuario_id,
      });

      if (error) throw error;

      const result = data as { success: boolean; error?: string };

      if (!result.success) {
        return { success: false, error: result.error };
      }

      return { success: true };
    } catch (error: any) {
      console.error("Erro ao confirmar transferência:", error);

      return { success: false, error: error.message };
    }
  }

  /**
   * Cancelar transferência
   */
  static async cancelarTransferencia(
    transferencia_id: string,
    usuario_id: string,
    motivo: string,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from("transferencias")
        .update({
          status: "cancelada",
          cancelado_por: usuario_id,
          cancelado_em: new Date().toISOString(),
          motivo_cancelamento: motivo,
        })
        .eq("id", transferencia_id)
        .eq("status", "pendente");

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      console.error("Erro ao cancelar transferência:", error);

      return { success: false, error: error.message };
    }
  }

  /**
   * Buscar transferência por ID
   */
  static async buscarTransferenciaPorId(
    id: string,
  ): Promise<TransferenciaCompleta | null> {
    try {
      const { data, error } = await supabase
        .from("transferencias")
        .select(
          `
          *,
          itens:transferencias_itens(
            *,
            produto:produtos(descricao, codigo_fabricante)
          ),
          loja_origem:lojas!loja_origem_id(nome),
          loja_destino:lojas!loja_destino_id(nome),
          criado_por_usuario:usuarios!criado_por(nome),
          confirmado_por_usuario:usuarios!confirmado_por(nome)
        `,
        )
        .eq("id", id)
        .single();

      if (error) throw error;

      if (!data) return null;

      return {
        ...data,
        itens:
          data.itens?.map((item: any) => ({
            ...item,
            produto_descricao: item.produto?.descricao,
            produto_codigo: item.produto?.codigo_fabricante,
          })) || [],
        loja_origem_nome: data.loja_origem?.nome,
        loja_destino_nome: data.loja_destino?.nome,
        criado_por_nome: data.criado_por_usuario?.nome,
        confirmado_por_nome: data.confirmado_por_usuario?.nome,
      };
    } catch (error) {
      console.error("Erro ao buscar transferência:", error);
      throw error;
    }
  }
}

// Exportar funções individuais para facilitar o uso
export const buscarTransferencias = TransferenciasService.buscarTransferencias;
export const confirmarTransferencia =
  TransferenciasService.confirmarTransferencia;
export const cancelarTransferencia =
  TransferenciasService.cancelarTransferencia;
export const buscarTransferenciaPorId =
  TransferenciasService.buscarTransferenciaPorId;
