import { supabase } from "@/lib/supabaseClient";
import { Permissoes, PermissoesModulos } from "@/types";

/**
 * Serviço para gerenciar permissões de usuários
 */
export class PermissoesService {
  /**
   * Busca as permissões de um usuário
   */
  static async getPermissoes(usuarioId: string): Promise<Permissoes | null> {
    try {
      const { data, error } = await supabase
        .from("permissoes")
        .select("*")
        .eq("usuario_id", usuarioId)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          // Não encontrado - retorna permissões vazias
          return null;
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error("Erro ao buscar permissões:", error);
      return null;
    }
  }

  /**
   * Cria ou atualiza permissões de um usuário
   */
  static async salvarPermissoes(
    usuarioId: string,
    permissoes: PermissoesModulos
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Verifica se já existe
      const permissoesExistentes = await this.getPermissoes(usuarioId);

      if (permissoesExistentes) {
        // Atualizar
        const { error } = await supabase
          .from("permissoes")
          .update({
            permissoes,
            atualizado_em: new Date().toISOString(),
          })
          .eq("usuario_id", usuarioId);

        if (error) throw error;
      } else {
        // Criar
        const { error } = await supabase.from("permissoes").insert({
          usuario_id: usuarioId,
          permissoes,
        });

        if (error) throw error;
      }

      return { success: true };
    } catch (error) {
      console.error("Erro ao salvar permissões:", error);
      return {
        success: false,
        error: "Erro ao salvar permissões",
      };
    }
  }

  /**
   * Verifica se um usuário tem uma permissão específica
   */
  static async verificarPermissao(
    usuarioId: string,
    modulo: keyof PermissoesModulos,
    acao: string
  ): Promise<boolean> {
    try {
      const permissoes = await this.getPermissoes(usuarioId);
      if (!permissoes) return false;

      const moduloPermissoes = permissoes.permissoes[modulo];
      if (!moduloPermissoes) return false;

      return (moduloPermissoes as any)[acao] === true;
    } catch (error) {
      console.error("Erro ao verificar permissão:", error);
      return false;
    }
  }

  /**
   * Remove todas as permissões de um usuário
   */
  static async removerPermissoes(
    usuarioId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from("permissoes")
        .delete()
        .eq("usuario_id", usuarioId);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error("Erro ao remover permissões:", error);
      return {
        success: false,
        error: "Erro ao remover permissões",
      };
    }
  }

  /**
   * Retorna permissões padrão para um novo usuário
   */
  static getPermissoesPadrao(): PermissoesModulos {
    return {
      usuarios: {
        visualizar: false,
        criar: false,
        editar: false,
        excluir: false,
        gerenciar_permissoes: false,
      },
      estoque: {
        visualizar: false,
        criar: false,
        editar: false,
        excluir: false,
        ajustar: false,
        ver_estatisticas: false,
        ver_preco_custo: false,
      },
      lojas: {
        visualizar: false,
        criar: false,
        editar: false,
        excluir: false,
      },
      clientes: {
        visualizar: false,
        criar: false,
        editar: false,
        excluir: false,
        processar_creditos: false,
      },
      fornecedores: {
        visualizar: false,
        criar: false,
        editar: false,
        excluir: false,
      },
      vendas: {
        visualizar: false,
        criar: false,
        editar: false,
        editar_pagas: false,
        cancelar: false,
        gerenciar_descontos: false,
        aplicar_desconto: false,
        processar_pagamentos: false,
        ver_estatisticas_faturamento: false,
        ver_todas_vendas: false,
        ver_resumo_pagamentos: false,
        desconto_maximo: 0,
      },
      os: {
        visualizar: false,
        criar: false,
        editar: false,
        excluir: false,
        cancelar: false,
        gerenciar_pecas: false,
        gerenciar_fotos: false,
        gerenciar_pagamentos: false,
        assumir: false,
      },
      tecnicos: {
        visualizar: false,
        criar: false,
        editar: false,
        excluir: false,
      },
      devolucoes: {
        visualizar: false,
        criar: false,
        processar_creditos: false,
      },
      aparelhos: {
        visualizar: false,
        criar: false,
        editar: false,
        deletar: false,
        alterar_status: false,
      },
      rma: {
        visualizar: false,
        criar: false,
      },
      transferencias: {
        visualizar: false,
        criar: false,
        editar: false,
        excluir: false,
        confirmar: false,
        aprovar: false,
      },
      caixa: {
        visualizar: false,
        abrir: false,
        fechar: false,
        visualizar_movimentacoes: false,
      },
      configuracoes: {
        gerenciar: false,
      },
      dashboard: {
        visualizar: false,
      },
      notificacoes: {
        visualizar: false,
      },
      dashboard_pessoal: {
        visualizar: false,
        definir_metas: false,
        visualizar_metas_outros: false,
      },
    };
  }

  /**
   * Retorna permissões de administrador (todas habilitadas)
   */
  static getPermissoesAdmin(): PermissoesModulos {
    return {
      usuarios: {
        visualizar: true,
        criar: true,
        editar: true,
        excluir: true,
        gerenciar_permissoes: true,
      },
      estoque: {
        visualizar: true,
        criar: true,
        editar: true,
        excluir: true,
        ajustar: true,
        ver_estatisticas: true,
        ver_preco_custo: true,
      },
      lojas: {
        visualizar: true,
        criar: true,
        editar: true,
        excluir: true,
      },
      clientes: {
        visualizar: true,
        criar: true,
        editar: true,
        excluir: true,
        processar_creditos: true,
      },
      fornecedores: {
        visualizar: true,
        criar: true,
        editar: true,
        excluir: true,
      },
      vendas: {
        visualizar: true,
        criar: true,
        editar: true,
        editar_pagas: true,
        cancelar: true,
        gerenciar_descontos: true,
        aplicar_desconto: true,
        processar_pagamentos: true,
        ver_estatisticas_faturamento: true,
        ver_todas_vendas: true,
        ver_resumo_pagamentos: true,
        desconto_maximo: 100,
      },
      os: {
        visualizar: true,
        criar: true,
        editar: true,
        excluir: true,
        cancelar: true,
        gerenciar_pecas: true,
        gerenciar_fotos: true,
        gerenciar_pagamentos: true,
        assumir: true,
      },
      tecnicos: {
        visualizar: true,
        criar: true,
        editar: true,
        excluir: true,
      },
      devolucoes: {
        visualizar: true,
        criar: true,
        processar_creditos: true,
      },
      aparelhos: {
        visualizar: true,
        criar: true,
        editar: true,
        deletar: true,
        alterar_status: true,
      },
      rma: {
        visualizar: true,
        criar: true,
      },
      transferencias: {
        visualizar: true,
        criar: true,
        editar: true,
        excluir: true,
        confirmar: true,
        aprovar: true,
      },
      caixa: {
        visualizar: true,
        abrir: true,
        fechar: true,
        visualizar_movimentacoes: true,
      },
      configuracoes: {
        gerenciar: true,
      },
      dashboard: {
        visualizar: true,
      },
      notificacoes: {
        visualizar: true,
      },
      dashboard_pessoal: {
        visualizar: true,
        definir_metas: true,
        visualizar_metas_outros: true,
      },
    };
  }
}
