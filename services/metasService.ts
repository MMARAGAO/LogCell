import { createBrowserClient } from "@supabase/ssr";

export interface MetaUsuario {
  id: string;
  usuario_id: string;
  loja_id?: number;
  meta_mensal_vendas: number;
  meta_mensal_os: number;
  dias_uteis_mes: number;
  ativo: boolean;
  criado_em: string;
  atualizado_em: string;
  criado_por?: string;
  atualizado_por?: string;
}

export interface MetaUsuarioInput {
  usuario_id: string;
  loja_id?: number;
  meta_mensal_vendas?: number;
  meta_mensal_os?: number;
  dias_uteis_mes?: number;
}

export class MetasService {
  private static getSupabase() {
    return createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
  }

  /**
   * Buscar meta do usuário
   */
  static async buscarMetaUsuario(
    usuarioId: string,
    lojaId?: number,
  ): Promise<MetaUsuario | null> {
    const supabase = this.getSupabase();

    let query = supabase
      .from("metas_usuarios")
      .select("*")
      .eq("usuario_id", usuarioId)
      .eq("ativo", true)
      .order("criado_em", { ascending: false })
      .limit(1);

    if (lojaId) {
      query = query.eq("loja_id", lojaId);
    }

    const { data, error } = await query;

    // Retorna null se não houver meta cadastrada (não é um erro)
    if (error) {
      return null;
    }

    return data && data.length > 0 ? data[0] : null;
  }

  /**
   * Buscar todas as metas (admin)
   */
  static async buscarTodasMetas(): Promise<MetaUsuario[]> {
    const supabase = this.getSupabase();

    const { data, error } = await supabase
      .from("metas_usuarios")
      .select("*")
      .eq("ativo", true)
      .order("criado_em", { ascending: false })
      .limit(10000);

    if (error) throw error;

    return data || [];
  }

  /**
   * Criar meta para usuário
   */
  static async criarMeta(meta: MetaUsuarioInput): Promise<MetaUsuario> {
    const supabase = this.getSupabase();

    const { data: user } = await supabase.auth.getUser();

    console.log("🔧 Criando meta:", {
      meta,
      usuarioLogado: user.user?.id,
    });

    const { data, error } = await supabase
      .from("metas_usuarios")
      .insert({
        ...meta,
        criado_por: user.user?.id,
        atualizado_por: user.user?.id,
      })
      .select()
      .single();

    if (error) {
      console.error("❌ Erro ao criar meta:", error);
      throw error;
    }

    console.log("✅ Meta criada:", data);

    return data;
  }

  /**
   * Atualizar meta do usuário
   */
  static async atualizarMeta(
    id: string,
    meta: Partial<MetaUsuarioInput>,
  ): Promise<MetaUsuario> {
    const supabase = this.getSupabase();

    const { data: user } = await supabase.auth.getUser();

    console.log("🔧 Atualizando meta:", {
      id,
      meta,
      usuarioLogado: user.user?.id,
    });

    const { data, error } = await supabase
      .from("metas_usuarios")
      .update({
        ...meta,
        atualizado_por: user.user?.id,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("❌ Erro ao atualizar meta:", error);
      throw error;
    }

    console.log("✅ Meta atualizada:", data);

    return data;
  }

  /**
   * Criar ou atualizar meta do usuário (upsert)
   */
  static async salvarMeta(meta: MetaUsuarioInput): Promise<MetaUsuario> {
    const supabase = this.getSupabase();

    const { data: user } = await supabase.auth.getUser();

    // Verificar se já existe meta para este usuário
    const metaExistente = await this.buscarMetaUsuario(
      meta.usuario_id,
      meta.loja_id,
    );

    if (metaExistente) {
      return this.atualizarMeta(metaExistente.id, meta);
    } else {
      return this.criarMeta(meta);
    }
  }

  /**
   * Deletar meta (soft delete - marca como inativo)
   */
  static async deletarMeta(id: string): Promise<void> {
    const supabase = this.getSupabase();

    const { error } = await supabase
      .from("metas_usuarios")
      .update({ ativo: false })
      .eq("id", id);

    if (error) throw error;
  }

  /**
   * Buscar a meta consolidada da loja (soma das metas ativas dos usuários).
   * Usada no dashboard executivo. Quando lojaId é informado, soma apenas
   * as metas atreladas àquela loja (metas sem loja são ignoradas).
   */
  static async buscarMetaConsolidada(
    lojaId?: number,
  ): Promise<{ meta_vendas: number; meta_os: number; total_metas: number }> {
    const todas = await this.buscarTodasMetas();

    const relevantes = lojaId
      ? todas.filter((m) => Number(m.loja_id) === Number(lojaId))
      : todas;

    return relevantes.reduce(
      (acc, m) => ({
        meta_vendas: acc.meta_vendas + Number(m.meta_mensal_vendas || 0),
        meta_os: acc.meta_os + Number(m.meta_mensal_os || 0),
        total_metas: acc.total_metas + 1,
      }),
      { meta_vendas: 0, meta_os: 0, total_metas: 0 },
    );
  }

  /**
   * Calcular meta diária baseada na meta mensal
   */
  static calcularMetaDiaria(
    metaMensal: number,
    diasUteis: number = 26,
  ): number {
    return metaMensal / diasUteis;
  }

  /**
   * Calcular progresso da meta
   */
  static calcularProgresso(valorAtual: number, valorMeta: number): number {
    if (valorMeta === 0) return 0;

    return (valorAtual / valorMeta) * 100;
  }

  /**
   * Calcular valor faltante
   */
  static calcularFaltante(valorAtual: number, valorMeta: number): number {
    return Math.max(0, valorMeta - valorAtual);
  }

  /**
   * Obter meta padrão se não existir no banco
   */
  static getMetaPadrao(): MetaUsuario {
    return {
      id: "",
      usuario_id: "",
      meta_mensal_vendas: 10000,
      meta_mensal_os: 0,
      dias_uteis_mes: 26,
      ativo: true,
      criado_em: new Date().toISOString(),
      atualizado_em: new Date().toISOString(),
    };
  }
}
