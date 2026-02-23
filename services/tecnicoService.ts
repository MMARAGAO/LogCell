// =====================================================
// SERVICE: TÉCNICOS
// =====================================================

import { supabase } from "@/lib/supabaseClient";
import { Tecnico, TecnicoFormData } from "@/types/clientesTecnicos";

/**
 * Buscar todos os técnicos
 */
export async function buscarTecnicos(filtros?: {
  busca?: string;
  ativo?: boolean;
  idLoja?: number;
}) {
  try {
    let query = supabase
      .from("tecnicos")
      .select(
        `
        *,
        loja:lojas!id_loja(id, nome)
      `,
      )
      .order("nome", { ascending: true });

    if (filtros?.ativo !== undefined) {
      query = query.eq("ativo", filtros.ativo);
    }

    if (filtros?.idLoja) {
      query = query.eq("id_loja", filtros.idLoja);
    }

    if (filtros?.busca) {
      query = query.or(
        `nome.ilike.%${filtros.busca}%,telefone.ilike.%${filtros.busca}%,email.ilike.%${filtros.busca}%`,
      );
    }

    const { data, error } = await query;

    if (error) throw error;

    return { data: data as Tecnico[], error: null };
  } catch (error: any) {
    console.error("Erro ao buscar técnicos:", error);

    return { data: null, error: error.message };
  }
}

/**
 * Buscar técnico por ID
 */
export async function buscarTecnicoPorId(id: string) {
  try {
    const { data, error } = await supabase
      .from("tecnicos")
      .select(
        `
        *,
        loja:lojas!id_loja(id, nome)
      `,
      )
      .eq("id", id)
      .single();

    if (error) throw error;

    return { data: data as Tecnico, error: null };
  } catch (error: any) {
    console.error("Erro ao buscar técnico:", error);

    return { data: null, error: error.message };
  }
}

/**
 * Criar novo técnico
 */
export async function criarTecnico(dados: TecnicoFormData, userId: string) {
  try {
    const { data, error } = await supabase
      .from("tecnicos")
      .insert({
        ...dados,
        criado_por: userId,
        atualizado_por: userId,
      })
      .select(
        `
        *,
        loja:lojas!id_loja(id, nome)
      `,
      )
      .single();

    if (error) throw error;

    return { data: data as Tecnico, error: null };
  } catch (error: any) {
    console.error("Erro ao criar técnico:", error);

    return { data: null, error: error.message };
  }
}

/**
 * Atualizar técnico
 */
export async function atualizarTecnico(
  id: string,
  dados: Partial<TecnicoFormData>,
  userId: string,
) {
  try {
    const { data, error } = await supabase
      .from("tecnicos")
      .update({
        ...dados,
        atualizado_por: userId,
      })
      .eq("id", id)
      .select(
        `
        *,
        loja:lojas!id_loja(id, nome)
      `,
      )
      .single();

    if (error) throw error;

    return { data: data as Tecnico, error: null };
  } catch (error: any) {
    console.error("Erro ao atualizar técnico:", error);

    return { data: null, error: error.message };
  }
}

/**
 * Deletar técnico
 */
export async function deletarTecnico(id: string) {
  try {
    const { error } = await supabase.from("tecnicos").delete().eq("id", id);

    if (error) throw error;

    return { error: null };
  } catch (error: any) {
    console.error("Erro ao deletar técnico:", error);

    return { error: error.message };
  }
}

/**
 * Ativar/Desativar técnico
 */
export async function toggleTecnicoAtivo(
  id: string,
  ativo: boolean,
  userId: string,
) {
  try {
    const { data, error } = await supabase
      .from("tecnicos")
      .update({
        ativo,
        atualizado_por: userId,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return { data: data as Tecnico, error: null };
  } catch (error: any) {
    console.error("Erro ao alterar status do técnico:", error);

    return { data: null, error: error.message };
  }
}

/**
 * Buscar OS atribuídas ao técnico
 */
export async function buscarOSTecnico(tecnicoId: string) {
  try {
    const { data, error } = await supabase
      .from("ordem_servico")
      .select("*")
      .eq("tecnico_responsavel", tecnicoId)
      .order("data_entrada", { ascending: false });

    if (error) throw error;

    return { data, error: null };
  } catch (error: any) {
    console.error("Erro ao buscar OS do técnico:", error);

    return { data: null, error: error.message };
  }
}

/**
 * Buscar técnicos ativos (para dropdowns)
 */
export async function buscarTecnicosAtivos(idLoja?: number) {
  return buscarTecnicos({ ativo: true, idLoja });
}
