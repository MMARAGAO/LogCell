import type { NotificacaoCompleta } from "@/types";

import { supabase } from "@/lib/supabaseClient";

export class NotificacoesService {
  static async deletarTodasNotificacoes(usuarioId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from("notificacoes_usuarios")
        .delete()
        .eq("usuario_id", usuarioId);

      if (error) throw error;
    } catch (error) {
      console.error("Erro ao deletar notificações:", error);
      throw error;
    }
  }
  /**
   * Buscar notificações do usuário
   */
  static async obterNotificacoesUsuario(
    usuarioId: string,
    apenasNaoLidas: boolean = false,
    limite: number = 50,
  ): Promise<NotificacaoCompleta[]> {
    try {
      const { data, error } = await supabase.rpc("obter_notificacoes_usuario", {
        p_usuario_id: usuarioId,
        p_apenas_nao_lidas: apenasNaoLidas,
        p_limite: limite,
      });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error("Erro ao buscar notificações:", error);

      return [];
    }
  }

  /**
   * Contar notificações não lidas
   */
  static async contarNotificacoesNaoLidas(usuarioId: string): Promise<number> {
    try {
      const { data, error } = await supabase.rpc(
        "contar_notificacoes_nao_lidas",
        {
          p_usuario_id: usuarioId,
        },
      );

      if (error) throw error;

      return data || 0;
    } catch (error) {
      console.error("Erro ao contar notificações não lidas:", error);

      return 0;
    }
  }

  /**
   * Marcar notificação como lida
   */
  static async marcarComoLida(
    notificacaoId: number,
    usuarioId: string,
  ): Promise<void> {
    try {
      const { error } = await supabase.rpc("marcar_notificacao_lida", {
        p_notificacao_id: notificacaoId,
        p_usuario_id: usuarioId,
      });

      if (error) throw error;
    } catch (error) {
      console.error("Erro ao marcar notificação como lida:", error);
      throw error;
    }
  }

  /**
   * Marcar todas notificações como lidas
   */
  static async marcarTodasComoLidas(usuarioId: string): Promise<void> {
    try {
      const { error } = await supabase.rpc("marcar_todas_notificacoes_lidas", {
        p_usuario_id: usuarioId,
      });

      if (error) throw error;
    } catch (error) {
      console.error("Erro ao marcar todas notificações como lidas:", error);
      throw error;
    }
  }

  /**
   * Criar notificação manualmente (para o sistema)
   */
  static async criarNotificacao(dados: {
    tipo: string;
    titulo: string;
    mensagem: string;
    produtoId?: string;
    lojaId?: number;
    dadosExtras?: any;
    expiraEm?: string;
  }): Promise<void> {
    try {
      // Criar notificação
      const { data: notificacao, error: notifError } = await supabase
        .from("notificacoes")
        .insert({
          tipo: dados.tipo,
          titulo: dados.titulo,
          mensagem: dados.mensagem,
          produto_id: dados.produtoId,
          loja_id: dados.lojaId,
          dados_extras: dados.dadosExtras,
          expira_em: dados.expiraEm,
        })
        .select()
        .single();

      if (notifError) throw notifError;

      // Criar registros para todos os usuários ativos
      const { data: usuarios, error: usuariosError } = await supabase
        .from("usuarios")
        .select("id")
        .eq("ativo", true);

      if (usuariosError) throw usuariosError;

      if (usuarios && usuarios.length > 0) {
        const registros = usuarios.map((u) => ({
          notificacao_id: notificacao.id,
          usuario_id: u.id,
        }));

        const { error: insertError } = await supabase
          .from("notificacoes_usuarios")
          .insert(registros);

        if (insertError) throw insertError;
      }
    } catch (error) {
      console.error("Erro ao criar notificação:", error);
      throw error;
    }
  }

  /**
   * Subscrever para notificações em tempo real
   */
  static subscribeToNotifications(
    usuarioId: string,
    callback: (payload: any) => void,
  ) {
    const channel = supabase
      .channel(`notificacoes_${usuarioId}`, {
        config: {
          broadcast: { self: false },
          presence: { key: usuarioId },
        },
      })
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notificacoes_usuarios",
          filter: `usuario_id=eq.${usuarioId}`,
        },
        (payload) => {
          // Chama o callback diretamente - a notificação já foi filtrada pelo Supabase
          callback(payload);
        },
      )
      .subscribe();

    return channel;
  }
}
