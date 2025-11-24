import { supabase } from "@/lib/supabaseClient";
import type { HistoricoLojaComUsuario } from "@/types";

export class HistoricoLojasService {
  /**
   * Buscar todo o histórico de lojas
   */
  static async getTodoHistorico(): Promise<HistoricoLojaComUsuario[]> {
    try {
      const { data, error } = await supabase
        .from("vw_historico_lojas")
        .select("*")
        .order("criado_em", { ascending: false });

      if (error) {
        // Se a view não existir, retornar array vazio
        if (error.code === "42P01" || error.code === "PGRST204") {
          console.warn(
            "View vw_historico_lojas não encontrada. Execute o script de configuração."
          );
          return [];
        }
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error("Erro ao buscar histórico:", error);
      return [];
    }
  }

  /**
   * Buscar histórico de uma loja específica
   */
  static async getHistoricoPorLoja(
    lojaId: number
  ): Promise<HistoricoLojaComUsuario[]> {
    try {
      const { data, error } = await supabase.rpc("obter_historico_loja", {
        p_loja_id: lojaId,
      });

      if (error) {
        // Se a função não existir, retornar array vazio
        if (error.code === "42883" || error.code === "PGRST204") {
          console.warn(
            "Função obter_historico_loja não encontrada. Execute o script de configuração."
          );
          return [];
        }
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error("Erro ao buscar histórico da loja:", error);
      return [];
    }
  }

  /**
   * Buscar apenas alterações (UPDATE)
   */
  static async getAlteracoes(): Promise<HistoricoLojaComUsuario[]> {
    try {
      const { data, error } = await supabase
        .from("vw_historico_lojas")
        .select("*")
        .eq("operacao", "UPDATE")
        .order("criado_em", { ascending: false });

      if (error) {
        if (error.code === "42P01" || error.code === "PGRST204") {
          console.warn("View vw_historico_lojas não encontrada.");
          return [];
        }
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error("Erro ao buscar alterações:", error);
      return [];
    }
  }

  /**
   * Buscar histórico por período
   */
  static async getHistoricoPorPeriodo(
    dataInicio: Date,
    dataFim: Date
  ): Promise<HistoricoLojaComUsuario[]> {
    try {
      const { data, error } = await supabase
        .from("vw_historico_lojas")
        .select("*")
        .gte("criado_em", dataInicio.toISOString())
        .lte("criado_em", dataFim.toISOString())
        .order("criado_em", { ascending: false });

      if (error) {
        if (error.code === "42P01" || error.code === "PGRST204") {
          console.warn("View vw_historico_lojas não encontrada.");
          return [];
        }
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error("Erro ao buscar histórico por período:", error);
      return [];
    }
  }

  /**
   * Buscar histórico por usuário
   */
  static async getHistoricoPorUsuario(
    usuarioEmail: string
  ): Promise<HistoricoLojaComUsuario[]> {
    try {
      const { data, error } = await supabase
        .from("vw_historico_lojas")
        .select("*")
        .eq("usuario_email", usuarioEmail)
        .order("criado_em", { ascending: false });

      if (error) {
        if (error.code === "42P01" || error.code === "PGRST204") {
          console.warn("View vw_historico_lojas não encontrada.");
          return [];
        }
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error("Erro ao buscar histórico por usuário:", error);
      return [];
    }
  }

  /**
   * Formatar campo modificado para exibição
   */
  static formatarCampo(campo: string): string {
    const mapeamento: Record<string, string> = {
      nome: "Nome",
      cnpj: "CNPJ",
      telefone: "Telefone",
      email: "E-mail",
      endereco: "Endereço",
      cidade: "Cidade",
      estado: "Estado",
      cep: "CEP",
      ativo: "Status",
    };

    return mapeamento[campo] || campo;
  }

  /**
   * Formatar operação para exibição
   */
  static formatarOperacao(operacao: string): string {
    const mapeamento: Record<string, string> = {
      INSERT: "Criação",
      UPDATE: "Alteração",
      DELETE: "Exclusão",
    };

    return mapeamento[operacao] || operacao;
  }

  /**
   * Obter cor da operação
   */
  static getCorOperacao(operacao: string): "success" | "warning" | "danger" {
    switch (operacao) {
      case "INSERT":
        return "success";
      case "UPDATE":
        return "warning";
      case "DELETE":
        return "danger";
      default:
        return "warning";
    }
  }

  /**
   * Formatar valor para exibição
   */
  static formatarValor(campo: string, valor: any): string {
    if (valor === null || valor === undefined) {
      return "-";
    }

    // Campos booleanos
    if (campo === "ativo") {
      return valor ? "Ativo" : "Inativo";
    }

    // Campos de data
    if (campo === "criado_em" || campo === "atualizado_em") {
      return new Date(valor).toLocaleString("pt-BR");
    }

    return String(valor);
  }
}
