// Alias e wrapper para clienteService com funções simplificadas
import { buscarClientes } from "./clienteService";

import { supabase } from "@/lib/supabaseClient";
import { Cliente, ClienteFormData } from "@/types/clientesTecnicos";

export { buscarClientes };

/**
 * Obter todos os clientes (sem paginação, para dropdowns)
 */
export async function getClientes(): Promise<Cliente[]> {
  try {
    const { data, error } = await supabase
      .from("clientes")
      .select("*")
      .eq("ativo", true)
      .order("nome", { ascending: true });

    if (error) throw error;

    return (data || []) as Cliente[];
  } catch (error: any) {
    console.error("Erro ao carregar clientes:", error);

    return [];
  }
}

/**
 * Criar novo cliente (versão simplificada)
 */
export async function criarCliente(
  dados: Partial<ClienteFormData>,
): Promise<Cliente> {
  try {
    const { data, error } = await supabase
      .from("clientes")
      .insert({
        nome: dados.nome || "",
        doc: dados.doc || null,
        telefone: dados.telefone || null,
        email: dados.email || null,
        ativo: true,
      })
      .select("*")
      .single();

    if (error) throw error;

    return data as Cliente;
  } catch (error: any) {
    console.error("Erro ao criar cliente:", error);
    throw new Error(error.message || "Erro ao criar cliente");
  }
}
