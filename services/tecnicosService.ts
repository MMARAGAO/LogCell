import { supabase } from "@/lib/supabaseClient";
import { Tecnico } from "@/types";

/**
 * Serviço para gerenciamento de técnicos
 */
export class TecnicosService {
  /**
   * Busca todos os técnicos
   */
  static async getTecnicos(filtros?: {
    ativo?: boolean;
    id_loja?: number;
    busca?: string;
  }): Promise<Tecnico[]> {
    try {
      let query = supabase
        .from("tecnicos")
        .select(
          `
          *,
          lojas:id_loja(nome)
        `
        )
        .order("nome");

      if (filtros?.ativo !== undefined) {
        query = query.eq("ativo", filtros.ativo);
      }

      if (filtros?.id_loja) {
        query = query.eq("id_loja", filtros.id_loja);
      }

      if (filtros?.busca) {
        query = query.ilike("nome", `%${filtros.busca}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Erro ao buscar técnicos:", error);
        throw error;
      }

      return data as Tecnico[];
    } catch (error) {
      console.error("Erro em getTecnicos:", error);
      throw error;
    }
  }

  /**
   * Busca técnico por ID
   */
  static async getTecnicoById(id: string): Promise<Tecnico | null> {
    try {
      const { data, error } = await supabase
        .from("tecnicos")
        .select(
          `
          *,
          lojas:id_loja(nome)
        `
        )
        .eq("id", id)
        .single();

      if (error) {
        console.error("Erro ao buscar técnico:", error);
        return null;
      }

      return data as Tecnico;
    } catch (error) {
      console.error("Erro em getTecnicoById:", error);
      return null;
    }
  }

  /**
   * Busca técnicos ativos
   */
  static async getTecnicosAtivos(): Promise<Tecnico[]> {
    return this.getTecnicos({ ativo: true });
  }

  /**
   * Cria um novo técnico COM usuário de autenticação
   * Usa API Route para acessar Admin API do Supabase
   */
  static async criarTecnicoComAuth(
    dados: {
      nome: string;
      email: string;
      senha: string;
      telefone: string;
      cpf?: string;
      rg?: string;
      data_nascimento?: string;
      especialidades?: string[];
      registro_profissional?: string;
      data_admissao?: string;
      cor_agenda?: string;
      id_loja?: number;
    },
    criadoPor: string
  ): Promise<{ tecnico?: Tecnico; error?: string }> {
    try {
      // Chamar API Route que tem acesso ao Service Role Key
      const response = await fetch("/api/tecnicos/criar-com-auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...dados,
          criado_por: criadoPor,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          error: result.error || "Erro ao criar técnico",
        };
      }

      return {
        tecnico: result.tecnico as Tecnico,
      };
    } catch (error: any) {
      console.error("Erro em criarTecnicoComAuth:", error);
      return {
        error: error.message || "Erro ao criar técnico",
      };
    }
  }

  /**
   * Atualiza dados do técnico
   */
  static async atualizarTecnico(
    id: string,
    dados: Partial<Tecnico>,
    atualizadoPor: string
  ): Promise<Tecnico> {
    try {
      const { data, error } = await supabase
        .from("tecnicos")
        .update({
          ...dados,
          atualizado_por: atualizadoPor,
          atualizado_em: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Erro ao atualizar técnico:", error);
        throw error;
      }

      return data as Tecnico;
    } catch (error) {
      console.error("Erro em atualizarTecnico:", error);
      throw error;
    }
  }

  /**
   * Ativa/desativa um técnico
   */
  static async toggleAtivoTecnico(
    id: string,
    ativo: boolean,
    atualizadoPor: string
  ): Promise<Tecnico> {
    return this.atualizarTecnico(id, { ativo }, atualizadoPor);
  }

  /**
   * Deleta um técnico (soft delete)
   */
  static async deletarTecnico(id: string, deletadoPor: string): Promise<void> {
    try {
      await this.toggleAtivoTecnico(id, false, deletadoPor);
    } catch (error) {
      console.error("Erro em deletarTecnico:", error);
      throw error;
    }
  }

  /**
   * Busca técnicos por especialidade
   */
  static async getTecnicosPorEspecialidade(
    especialidade: string
  ): Promise<Tecnico[]> {
    try {
      const { data, error } = await supabase
        .from("tecnicos")
        .select("*")
        .contains("especialidades", [especialidade])
        .eq("ativo", true)
        .order("nome");

      if (error) {
        console.error("Erro ao buscar técnicos por especialidade:", error);
        throw error;
      }

      return data as Tecnico[];
    } catch (error) {
      console.error("Erro em getTecnicosPorEspecialidade:", error);
      throw error;
    }
  }

  /**
   * Reseta a senha de um técnico
   */
  static async resetarSenhaTecnico(email: string): Promise<void> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) {
        console.error("Erro ao resetar senha:", error);
        throw error;
      }
    } catch (error) {
      console.error("Erro em resetarSenhaTecnico:", error);
      throw error;
    }
  }
}
