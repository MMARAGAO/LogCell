import { supabase } from "@/lib/supabaseClient";
import { Aparelho, AparelhoFormData, FiltrosAparelhos } from "@/types/aparelhos";

/**
 * Serviço para gerenciamento de aparelhos
 */

// Buscar todos os aparelhos com filtros
export async function getAparelhos(
  filtros?: FiltrosAparelhos
): Promise<Aparelho[]> {
  try {
    let query = supabase
      .from("aparelhos")
      .select(`
        *,
        loja:lojas (
          id,
          nome
        )
      `)
      .order("criado_em", { ascending: false });

    // Filtrar por loja
    if (filtros?.loja_id) {
      query = query.eq("loja_id", filtros.loja_id);
    }

    // Filtrar por marca
    if (filtros?.marca) {
      query = query.ilike("marca", `%${filtros.marca}%`);
    }

    // Filtrar por modelo
    if (filtros?.modelo) {
      query = query.ilike("modelo", `%${filtros.modelo}%`);
    }

    // Filtrar por estado
    if (filtros?.estado) {
      query = query.eq("estado", filtros.estado);
    }

    // Filtrar por status
    if (filtros?.status) {
      query = query.eq("status", filtros.status);
    }

    // Busca por marca, modelo, IMEI, número de série
    if (filtros?.busca) {
      query = query.or(
        `marca.ilike.%${filtros.busca}%,modelo.ilike.%${filtros.busca}%,imei.ilike.%${filtros.busca}%,numero_serie.ilike.%${filtros.busca}%`
      );
    }

    const { data, error } = await query;

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error("Erro ao buscar aparelhos:", error);
    throw error;
  }
}

// Buscar aparelho por ID
export async function getAparelhoById(id: string): Promise<Aparelho | null> {
  try {
    const { data, error } = await supabase
      .from("aparelhos")
      .select(`
        *,
        loja:lojas (
          id,
          nome
        )
      `)
      .eq("id", id)
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error("Erro ao buscar aparelho:", error);
    throw error;
  }
}

// Buscar aparelho por IMEI
export async function getAparelhoPorIMEI(imei: string): Promise<Aparelho | null> {
  try {
    const { data, error } = await supabase
      .from("aparelhos")
      .select(`
        *,
        loja:lojas (
          id,
          nome
        )
      `)
      .eq("imei", imei)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null; // Não encontrado
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Erro ao buscar aparelho por IMEI:", error);
    throw error;
  }
}

// Buscar aparelho pelo prefixo do IMEI (8 primeiros dígitos)
export async function getAparelhoPorPrefixoIMEI(
  prefixo: string
): Promise<Aparelho | null> {
  try {
    const prefixoLimpo = prefixo.trim();
    if (!prefixoLimpo) return null;

    const { data, error } = await supabase
      .from("aparelhos")
      .select(`
        *,
        loja:lojas (
          id,
          nome
        )
      `)
      .ilike("imei", `${prefixoLimpo}%`)
      .order("criado_em", { ascending: false })
      .limit(1);

    if (error) throw error;

    return data?.[0] || null;
  } catch (error) {
    console.error("Erro ao buscar aparelho por prefixo de IMEI:", error);
    throw error;
  }
}

// Criar novo aparelho
export async function criarAparelho(
  aparelho: AparelhoFormData,
  usuarioId: string
): Promise<Aparelho> {
  try {
    // Verificar se IMEI já existe
    if (aparelho.imei) {
      const existente = await getAparelhoPorIMEI(aparelho.imei);
      if (existente) {
        throw new Error("Já existe um aparelho cadastrado com este IMEI");
      }
    }

    const { data, error } = await supabase
      .from("aparelhos")
      .insert({
        ...aparelho,
        status: aparelho.status || "disponivel",
        criado_por: usuarioId,
      })
      .select(`
        *,
        loja:lojas (
          id,
          nome
        )
      `)
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error("Erro ao criar aparelho:", error);
    throw error;
  }
}

// Atualizar aparelho
export async function atualizarAparelho(
  id: string,
  aparelho: Partial<AparelhoFormData>,
  usuarioId: string
): Promise<Aparelho> {
  try {
    // Verificar se IMEI já existe em outro aparelho
    if (aparelho.imei) {
      const { data: existentes } = await supabase
        .from("aparelhos")
        .select("id")
        .eq("imei", aparelho.imei)
        .neq("id", id);

      if (existentes && existentes.length > 0) {
        throw new Error("Já existe outro aparelho cadastrado com este IMEI");
      }
    }

    const { data, error } = await supabase
      .from("aparelhos")
      .update({
        ...aparelho,
        atualizado_por: usuarioId,
        atualizado_em: new Date().toISOString(),
      })
      .eq("id", id)
      .select(`
        *,
        loja:lojas (
          id,
          nome
        )
      `)
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error("Erro ao atualizar aparelho:", error);
    throw error;
  }
}

// Deletar aparelho
export async function deletarAparelho(id: string): Promise<void> {
  try {
    // Verificar se aparelho já foi vendido
    const aparelho = await getAparelhoById(id);
    if (aparelho?.status === "vendido") {
      throw new Error("Não é possível deletar um aparelho que já foi vendido");
    }

    const { error } = await supabase.from("aparelhos").delete().eq("id", id);

    if (error) throw error;
  } catch (error) {
    console.error("Erro ao deletar aparelho:", error);
    throw error;
  }
}

// Marcar aparelho como vendido
export async function marcarAparelhoVendido(
  id: string,
  vendaId: string,
  usuarioId: string
): Promise<Aparelho> {
  try {
    const { data, error } = await supabase
      .from("aparelhos")
      .update({
        status: "vendido",
        venda_id: vendaId,
        data_venda: new Date().toISOString(),
        atualizado_por: usuarioId,
        atualizado_em: new Date().toISOString(),
      })
      .eq("id", id)
      .select(`
        *,
        loja:lojas (
          id,
          nome
        )
      `)
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error("Erro ao marcar aparelho como vendido:", error);
    throw error;
  }
}

// Atualizar status do aparelho
export async function atualizarStatusAparelho(
  id: string,
  status: "disponivel" | "vendido" | "reservado" | "defeito" | "transferido",
  usuarioId: string
): Promise<Aparelho> {
  try {
    const { data, error } = await supabase
      .from("aparelhos")
      .update({
        status,
        atualizado_por: usuarioId,
        atualizado_em: new Date().toISOString(),
      })
      .eq("id", id)
      .select(`
        *,
        loja:lojas (
          id,
          nome
        )
      `)
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error("Erro ao atualizar status do aparelho:", error);
    throw error;
  }
}

// Buscar aparelhos disponíveis por marca e modelo
export async function getAparelhosDisponiveis(
  lojaId?: number,
  marca?: string,
  modelo?: string
): Promise<Aparelho[]> {
  try {
    let query = supabase
      .from("aparelhos")
      .select(`
        *,
        loja:lojas (
          id,
          nome
        )
      `)
      .eq("status", "disponivel")
      .order("criado_em", { ascending: false });

    if (lojaId) {
      query = query.eq("loja_id", lojaId);
    }

    if (marca) {
      query = query.eq("marca", marca);
    }

    if (modelo) {
      query = query.eq("modelo", modelo);
    }

    const { data, error } = await query;

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error("Erro ao buscar aparelhos disponíveis:", error);
    throw error;
  }
}
