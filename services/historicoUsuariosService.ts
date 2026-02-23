import { supabase } from "@/lib/supabaseClient";

export interface HistoricoUsuario {
  id: string;
  usuario_id: string;
  usuario_alterou_id: string | null;
  campo_alterado: string;
  valor_anterior: string | null;
  valor_novo: string | null;
  tipo_operacao: "INSERT" | "UPDATE" | "DELETE";
  data_alteracao: string;
  usuario_alterou?: {
    nome: string;
    email: string;
  };
}

/**
 * Service para gerenciar histórico de alterações de usuários
 */
export class HistoricoUsuariosService {
  /**
   * Busca o histórico de alterações de um usuário específico
   */
  static async getHistoricoUsuario(
    usuarioId: string,
  ): Promise<HistoricoUsuario[]> {
    const { data, error } = await supabase
      .from("historico_usuarios")
      .select(
        `
        *,
        usuario_alterou:usuario_alterou_id (
          nome,
          email
        )
      `,
      )
      .eq("usuario_id", usuarioId)
      .order("data_alteracao", { ascending: false });

    if (error) {
      console.error("Erro ao buscar histórico do usuário:", error);
      throw error;
    }

    return data as HistoricoUsuario[];
  }

  /**
   * Busca todo o histórico de alterações (para auditoria)
   */
  static async getTodoHistorico(): Promise<HistoricoUsuario[]> {
    const { data, error } = await supabase
      .from("historico_usuarios")
      .select(
        `
        *,
        usuario_alterou:usuario_alterou_id (
          nome,
          email
        )
      `,
      )
      .order("data_alteracao", { ascending: false })
      .limit(100); // Limita a 100 registros mais recentes

    if (error) {
      console.error("Erro ao buscar histórico completo:", error);
      throw error;
    }

    return data as HistoricoUsuario[];
  }

  /**
   * Formata o nome do campo para exibição
   */
  static formatarNomeCampo(campo: string): string {
    const campos: Record<string, string> = {
      criacao: "Criação",
      nome: "Nome",
      email: "Email",
      cpf: "CPF",
      telefone: "Telefone",
      data_nascimento: "Data de Nascimento",
      cargo: "Cargo",
      status: "Status",
      exclusao: "Exclusão",
    };

    return campos[campo] || campo;
  }

  /**
   * Formata a operação para exibição
   */
  static formatarOperacao(operacao: string): string {
    const operacoes: Record<string, string> = {
      INSERT: "Criação",
      UPDATE: "Atualização",
      DELETE: "Exclusão",
    };

    return operacoes[operacao] || operacao;
  }

  /**
   * Retorna a cor para o tipo de operação
   */
  static getCorOperacao(
    operacao: string,
  ): "success" | "warning" | "danger" | "default" {
    const cores: Record<string, "success" | "warning" | "danger" | "default"> =
      {
        INSERT: "success",
        UPDATE: "warning",
        DELETE: "danger",
      };

    return cores[operacao] || "default";
  }
}
