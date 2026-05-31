import type { TransferenciaCompleta } from "@/types";

import { supabase } from "@/lib/supabaseClient";

export class TransferenciasService {
  /**
   * Buscar transferências com paginação e filtros opcionais
   */
  static async buscarTransferencias(
    filtros?: {
      status?: "pendente" | "confirmada" | "cancelada";
      loja_id?: number;
      busca?: string;
    },
    page: number = 1,
    pageSize: number = 15,
  ): Promise<{ data: TransferenciaCompleta[]; total: number }> {
    try {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      let query = supabase
        .from("transferencias")
        .select(
          `
          *,
          itens:transferencias_itens(
            id, produto_id, quantidade,
            produto:produtos(
              descricao, 
              codigo_fabricante, 
              marca
            )
          ),
          loja_origem:lojas!loja_origem_id(nome),
          loja_destino:lojas!loja_destino_id(nome),
          criado_por_usuario:usuarios!usuario_id(nome),
          confirmado_por_usuario:usuarios!confirmado_por(nome),
          cancelado_por_usuario:usuarios!cancelado_por(nome)
        `,
          { count: "exact", head: false },
        )
        .order("criado_em", { ascending: false })
        .range(from, to);

      if (filtros?.status) {
        query = query.eq("status", filtros.status);
      }

      if (filtros?.loja_id) {
        query = query.or(
          `loja_origem_id.eq.${filtros.loja_id},loja_destino_id.eq.${filtros.loja_id}`,
        );
      }

      if (filtros?.busca) {
        const termo = filtros.busca.trim();

        if (termo) {
          const condicoes = [`observacao.ilike.%${termo}%`];

          const { data: lojasEncontradas } = await supabase
            .from("lojas")
            .select("id")
            .ilike("nome", `%${termo}%`);

          if (lojasEncontradas && lojasEncontradas.length > 0) {
            const lojaIds = lojasEncontradas.map((l) => l.id).join(",");

            condicoes.push(`loja_origem_id.in.(${lojaIds})`);
            condicoes.push(`loja_destino_id.in.(${lojaIds})`);
          }

          query = query.or(condicoes.join(","));
        }
      }

      const { data, error, count } = await query;

      if (error) {
        console.error("Erro ao buscar transferências:", error);
        throw new Error(
          `Erro ao buscar transferências: ${error.message || error.details || JSON.stringify(error)}`,
        );
      }

      return {
        data:
          data?.map((t: any) => ({
            ...t,
            itens:
              t.itens?.map((item: any) => ({
                ...item,
                produto_descricao: item.produto?.descricao,
                produto_codigo: item.produto?.codigo_fabricante,
                produto_marca: item.produto?.marca,
                produtos: item.produto,
              })) || [],
            loja_origem_nome: t.loja_origem?.nome,
            loja_origem: t.loja_origem?.nome,
            loja_destino_nome: t.loja_destino?.nome,
            loja_destino: t.loja_destino?.nome,
            criado_por_nome: t.criado_por_usuario?.nome,
            usuario_nome: t.criado_por_usuario?.nome,
            confirmado_por_nome: t.confirmado_por_usuario?.nome,
            cancelado_por_nome: t.cancelado_por_usuario?.nome,
          })) || [],
        total: count || 0,
      };
    } catch (error) {
      console.error("Erro ao buscar transferências:", error);
      throw error;
    }
  }

  /**
   * Contar transferências por status com os mesmos filtros
   */
  static async contarTransferencias(filtros?: { loja_id?: number }): Promise<{
    pendente: number;
    confirmada: number;
    cancelada: number;
    total: number;
  }> {
    try {
      const baseQuery = () =>
        supabase.from("transferencias").select("*", {
          count: "exact",
          head: true,
        });

      const applyLojaFilter = (q: any) => {
        if (filtros?.loja_id) {
          return q.or(
            `loja_origem_id.eq.${filtros.loja_id},loja_destino_id.eq.${filtros.loja_id}`,
          );
        }

        return q;
      };

      const [pendenteRes, confirmadaRes, canceladaRes, totalRes] =
        await Promise.all([
          applyLojaFilter(baseQuery().eq("status", "pendente")),
          applyLojaFilter(baseQuery().eq("status", "confirmada")),
          applyLojaFilter(baseQuery().eq("status", "cancelada")),
          applyLojaFilter(baseQuery()),
        ]);

      return {
        pendente: pendenteRes.count || 0,
        confirmada: confirmadaRes.count || 0,
        cancelada: canceladaRes.count || 0,
        total: totalRes.count || 0,
      };
    } catch (error) {
      console.error("Erro ao contar transferências:", error);

      return { pendente: 0, confirmada: 0, cancelada: 0, total: 0 };
    }
  }

  /**
   * Analisar disponibilidade de cada item da transferência
   */
  static async analisarDisponibilidade(
    transferencia: TransferenciaCompleta,
  ): Promise<{
    podeConfirmar: boolean;
    itens: Array<{
      item_id: string;
      produto_id: string;
      produto_descricao: string;
      quantidade_solicitada: number;
      estoque_atual: number;
      saldo_disponivel: number;
      tem_problema: boolean;
      transferencias_conflitantes: Array<{
        id: string;
        de_para: string;
        quantidade: number;
        confirmado_por: string;
        confirmado_em: string;
      }>;
    }>;
  }> {
    const resultado: any[] = [];

    for (const item of transferencia.itens) {
      const { data: estoque } = await supabase
        .from("estoque_lojas")
        .select("quantidade")
        .eq("id_produto", item.produto_id)
        .eq("id_loja", transferencia.loja_origem_id)
        .single();

      const estoqueAtual = estoque?.quantidade || 0;

      // Buscar transferências confirmadas APÓS a criação desta
      // que consumiram o mesmo produto da mesma loja de origem
      const { data: conflitos } = await supabase
        .from("transferencias_itens")
        .select(
          `
          quantidade,
          transferencia_id
        `,
        )
        .eq("produto_id", item.produto_id)
        .neq("transferencia_id", transferencia.id);

      const transferenciasConflitantes: Array<{
        id: string;
        de_para: string;
        quantidade: number;
        confirmado_por: string;
        confirmado_em: string;
      }> = [];

      if (conflitos && conflitos.length > 0) {
        const ids = conflitos.map((c: any) => c.transferencia_id);
        const { data: transferencias_conf } = await supabase
          .from("transferencias")
          .select(
            `
            id, status, confirmado_em, loja_origem_id,
            loja_origem:lojas!loja_origem_id(nome),
            loja_destino:lojas!loja_destino_id(nome),
            confirmado_por_usuario:usuarios!confirmado_por(nome)
          `,
          )

          .in("id", ids);

        for (const raw of transferencias_conf || []) {
          const tc: any = raw;

          if (
            tc.status === "confirmada" &&
            tc.confirmado_em > transferencia.criado_em &&
            tc.loja_origem_id === transferencia.loja_origem_id
          ) {
            const item_conflito = conflitos.find(
              (c: any) => c.transferencia_id === tc.id,
            );

            transferenciasConflitantes.push({
              id: tc.id,
              de_para: `${tc.loja_origem?.nome || "?"} → ${tc.loja_destino?.nome || "?"}`,
              quantidade: item_conflito?.quantidade || 0,
              confirmado_por: tc.confirmado_por_usuario?.nome || "N/A",
              confirmado_em: new Date(tc.confirmado_em).toLocaleString("pt-BR"),
            });
          }
        }
      }

      const totalConsumido = transferenciasConflitantes.reduce(
        (s: number, c: any) => s + c.quantidade,
        0,
      );

      resultado.push({
        item_id: item.id,
        produto_id: item.produto_id,
        produto_descricao: item.produto_descricao || "Produto",
        quantidade_solicitada: item.quantidade,
        estoque_atual: estoqueAtual,
        saldo_disponivel: estoqueAtual,
        tem_problema: estoqueAtual < item.quantidade,
        transferencias_conflitantes: transferenciasConflitantes,
      });
    }

    return {
      podeConfirmar: resultado.every((r) => !r.tem_problema),
      itens: resultado,
    };
  }

  /**
   * Confirmar transferência com ajustes de quantidade nos itens problemáticos
   */
  static async confirmarComAjustes(
    transferencia_id: string,
    usuario_id: string,
    ajustes: Array<{ item_id: string; nova_quantidade: number }>,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      for (const ajuste of ajustes) {
        const { error } = await supabase
          .from("transferencias_itens")
          .update({ quantidade: ajuste.nova_quantidade })
          .eq("id", ajuste.item_id);

        if (error) throw error;
      }

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
      console.error("Erro ao confirmar transferência com ajustes:", error);

      return { success: false, error: error.message };
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
export const contarTransferencias = TransferenciasService.contarTransferencias;
export const confirmarTransferencia =
  TransferenciasService.confirmarTransferencia;
export const confirmarComAjustes = TransferenciasService.confirmarComAjustes;
export const analisarDisponibilidade =
  TransferenciasService.analisarDisponibilidade;
export const cancelarTransferencia =
  TransferenciasService.cancelarTransferencia;
export const buscarTransferenciaPorId =
  TransferenciasService.buscarTransferenciaPorId;
