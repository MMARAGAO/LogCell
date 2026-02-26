"use server";

import { createClient } from "@supabase/supabase-js";

import { createServerSupabaseClient } from "@/lib/supabase/action";

interface SalvarMetaPayload {
  usuario_id: string;
  loja_id?: number | null;
  meta_mensal_vendas: number;
  meta_mensal_os: number;
  dias_uteis_mes: number;
}

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
);

export async function salvarMetaUsuario(payload: SalvarMetaPayload) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: "Usuário não autenticado para salvar metas",
      };
    }

    if (!payload.usuario_id) {
      return {
        success: false,
        error: "Usuário da meta é obrigatório",
      };
    }

    const metaMensalVendas = Number(payload.meta_mensal_vendas || 0);
    const metaMensalOs = Number(payload.meta_mensal_os || 0);
    const diasUteisMes = Number(payload.dias_uteis_mes || 26);

    if (!Number.isFinite(metaMensalVendas) || metaMensalVendas < 0) {
      return { success: false, error: "Meta mensal de vendas inválida" };
    }
    if (!Number.isFinite(metaMensalOs) || metaMensalOs < 0) {
      return { success: false, error: "Meta mensal de OS inválida" };
    }
    if (
      !Number.isFinite(diasUteisMes) ||
      diasUteisMes < 1 ||
      diasUteisMes > 31
    ) {
      return { success: false, error: "Dias úteis deve estar entre 1 e 31" };
    }

    const lojaId = payload.loja_id ?? null;

    // Busca meta ativa existente para o mesmo usuário/loja
    let query = supabaseAdmin
      .from("metas_usuarios")
      .select("id")
      .eq("usuario_id", payload.usuario_id)
      .eq("ativo", true)
      .limit(1);

    if (lojaId === null) {
      query = query.is("loja_id", null);
    } else {
      query = query.eq("loja_id", lojaId);
    }

    const { data: existente, error: buscaError } = await query.maybeSingle();

    if (buscaError) {
      return {
        success: false,
        error: `Erro ao buscar meta existente: ${buscaError.message}`,
      };
    }

    if (existente?.id) {
      const { data, error } = await supabaseAdmin
        .from("metas_usuarios")
        .update({
          loja_id: lojaId,
          meta_mensal_vendas: metaMensalVendas,
          meta_mensal_os: metaMensalOs,
          dias_uteis_mes: diasUteisMes,
          atualizado_por: user.id,
        })
        .eq("id", existente.id)
        .select("*")
        .single();

      if (error) {
        return {
          success: false,
          error: `Erro ao atualizar meta: ${error.message}`,
        };
      }

      return { success: true, data };
    }

    const { data, error } = await supabaseAdmin
      .from("metas_usuarios")
      .insert({
        usuario_id: payload.usuario_id,
        loja_id: lojaId,
        meta_mensal_vendas: metaMensalVendas,
        meta_mensal_os: metaMensalOs,
        dias_uteis_mes: diasUteisMes,
        criado_por: user.id,
        atualizado_por: user.id,
      })
      .select("*")
      .single();

    if (error) {
      return {
        success: false,
        error: `Erro ao criar meta: ${error.message}`,
      };
    }

    return { success: true, data };
  } catch (error: any) {
    return {
      success: false,
      error: error?.message || "Erro inesperado ao salvar meta",
    };
  }
}
