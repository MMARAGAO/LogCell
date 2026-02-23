import { supabase } from "@/lib/supabaseClient";

export interface ConfiguracoesUsuario {
  id?: string;
  usuario_id: string;
  notificacoes_email: boolean;
  notificacoes_push: boolean;
  notificacoes_estoque: boolean;
  modo_escuro: boolean;
  tema: string;
  idioma: string;
  formato_data: string;
  autenticacao_2fa: boolean;
  sessao_ativa: boolean;
  created_at?: string;
  updated_at?: string;
}

const CONFIGURACOES_PADRAO: Omit<ConfiguracoesUsuario, "usuario_id"> = {
  notificacoes_email: true,
  notificacoes_push: true,
  notificacoes_estoque: true,
  modo_escuro: false,
  tema: "default",
  idioma: "pt-BR",
  formato_data: "DD/MM/YYYY",
  autenticacao_2fa: false,
  sessao_ativa: true,
};

export const configuracoesService = {
  /**
   * Busca as configurações do usuário
   */
  async getConfiguracoes(usuarioId: string): Promise<ConfiguracoesUsuario> {
    try {
      // RLS já filtra por auth.uid(), então não precisamos do .eq()
      const { data, error } = await supabase
        .from("configuracoes_usuario")
        .select("*")
        .single();

      if (error) {
        // Se não existir, CRIA as configurações padrão
        if (error.code === "PGRST116") {
          console.log(
            "⚠️ Configurações não encontradas, criando padrão para:",
            usuarioId,
          );

          // Tenta criar configuração padrão
          const novaConfig = {
            ...CONFIGURACOES_PADRAO,
            usuario_id: usuarioId,
          };

          const { data: criada, error: erroInsert } = await supabase
            .from("configuracoes_usuario")
            .insert(novaConfig)
            .select()
            .single();

          if (erroInsert) {
            console.error("Erro ao criar configurações:", erroInsert);

            // Retorna padrão mesmo se falhar
            return novaConfig;
          }

          console.log("✅ Configurações criadas com sucesso");

          return criada;
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error("Erro ao buscar configurações:", error);

      return {
        ...CONFIGURACOES_PADRAO,
        usuario_id: usuarioId,
      };
    }
  },

  /**
   * Salva ou atualiza as configurações do usuário
   */
  async salvarConfiguracoes(
    configuracoes: ConfiguracoesUsuario,
  ): Promise<ConfiguracoesUsuario> {
    try {
      // Verifica se já existe configuração
      const { data: existente } = await supabase
        .from("configuracoes_usuario")
        .select("id")
        .eq("usuario_id", configuracoes.usuario_id)
        .single();

      if (existente) {
        // Atualizar
        const { data, error } = await supabase
          .from("configuracoes_usuario")
          .update({
            notificacoes_email: configuracoes.notificacoes_email,
            notificacoes_push: configuracoes.notificacoes_push,
            notificacoes_estoque: configuracoes.notificacoes_estoque,
            modo_escuro: configuracoes.modo_escuro,
            tema: configuracoes.tema,
            idioma: configuracoes.idioma,
            formato_data: configuracoes.formato_data,
            autenticacao_2fa: configuracoes.autenticacao_2fa,
            sessao_ativa: configuracoes.sessao_ativa,
          })
          .eq("usuario_id", configuracoes.usuario_id)
          .select()
          .single();

        if (error) throw error;

        return data;
      } else {
        // Inserir
        const { data, error } = await supabase
          .from("configuracoes_usuario")
          .insert({
            usuario_id: configuracoes.usuario_id,
            notificacoes_email: configuracoes.notificacoes_email,
            notificacoes_push: configuracoes.notificacoes_push,
            notificacoes_estoque: configuracoes.notificacoes_estoque,
            modo_escuro: configuracoes.modo_escuro,
            tema: configuracoes.tema,
            idioma: configuracoes.idioma,
            formato_data: configuracoes.formato_data,
            autenticacao_2fa: configuracoes.autenticacao_2fa,
            sessao_ativa: configuracoes.sessao_ativa,
          })
          .select()
          .single();

        if (error) throw error;

        return data;
      }
    } catch (error) {
      console.error("Erro ao salvar configurações:", error);
      throw error;
    }
  },

  /**
   * Reseta as configurações para o padrão
   */
  async resetarConfiguracoes(usuarioId: string): Promise<ConfiguracoesUsuario> {
    try {
      const configuracoesPadrao = {
        ...CONFIGURACOES_PADRAO,
        usuario_id: usuarioId,
      };

      return await this.salvarConfiguracoes(configuracoesPadrao);
    } catch (error) {
      console.error("Erro ao resetar configurações:", error);
      throw error;
    }
  },
};
