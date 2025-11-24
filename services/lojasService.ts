import { supabase } from "@/lib/supabaseClient";
import { Loja } from "@/types";

/**
 * Serviço para gerenciar lojas/filiais
 */
export class LojasService {
  /**
   * Busca todas as lojas
   */
  static async getTodasLojas(): Promise<Loja[]> {
    try {
      const { data, error } = await supabase
        .from("lojas")
        .select("*")
        .order("nome", { ascending: true });

      if (error) {
        // Tabela não existe ou sem permissão
        if (error.code === "42P01" || error.code === "PGRST204") {
          console.warn("Tabela 'lojas' não encontrada ou sem dados");
          return [];
        }
        console.error("Erro na query de lojas:", error);
        throw error;
      }

      return data || [];
    } catch (error: any) {
      console.error("Erro ao buscar lojas:", error?.message || error);
      return [];
    }
  }

  /**
   * Busca apenas lojas ativas
   */
  static async getLojasAtivas(): Promise<Loja[]> {
    try {
      const { data, error } = await supabase
        .from("lojas")
        .select("*")
        .eq("ativo", true)
        .order("nome", { ascending: true });

      if (error) {
        if (error.code === "42P01" || error.code === "PGRST204") {
          return [];
        }
        throw error;
      }

      return data || [];
    } catch (error: any) {
      console.error("Erro ao buscar lojas ativas:", error?.message || error);
      return [];
    }
  }

  /**
   * Busca uma loja por ID
   */
  static async getLojaPorId(id: number): Promise<Loja | null> {
    try {
      const { data, error } = await supabase
        .from("lojas")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error("Erro ao buscar loja:", error);
      return null;
    }
  }

  /**
   * Busca loja por CNPJ
   */
  static async getLojaPorCNPJ(cnpj: string): Promise<Loja | null> {
    try {
      const { data, error } = await supabase
        .from("lojas")
        .select("*")
        .eq("cnpj", cnpj)
        .single();

      if (error) {
        if (error.code === "PGRST116") return null; // Não encontrado
        throw error;
      }

      return data;
    } catch (error) {
      console.error("Erro ao buscar loja por CNPJ:", error);
      return null;
    }
  }
}
