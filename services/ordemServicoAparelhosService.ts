// =====================================================
// SERVICE: APARELHOS MÚLTIPLOS DA ORDEM DE SERVIÇO
// =====================================================

import { supabase } from "@/lib/supabaseClient";
import { OrdemServicoAparelho } from "@/types/ordemServico";

// =====================================================
// CRUD DE APARELHOS MÚLTIPLOS
// =====================================================

/**
 * Buscar todos os aparelhos de uma OS
 */
export async function buscarAparelhosOS(
  idOrdemServico: string,
): Promise<{ data: OrdemServicoAparelho[] | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from("ordem_servico_aparelhos")
      .select("*")
      .eq("id_ordem_servico", idOrdemServico)
      .eq("status", "ativo")
      .order("sequencia", { ascending: true });

    if (error) throw error;

    return { data: data as OrdemServicoAparelho[], error: null };
  } catch (error: any) {
    console.error("Erro ao buscar aparelhos da OS:", error);

    return { data: null, error: error.message };
  }
}

/**
 * Adicionar novo aparelho à OS
 */
export async function adicionarAparelho(
  idOrdemServico: string,
  aparelho: Omit<OrdemServicoAparelho, "id" | "criado_em" | "atualizado_em">,
  userId: string,
): Promise<{ data: OrdemServicoAparelho | null; error: string | null }> {
  try {
    // Buscar próxima sequência
    const { data: ultimoAparelho } = await supabase
      .from("ordem_servico_aparelhos")
      .select("sequencia")
      .eq("id_ordem_servico", idOrdemServico)
      .eq("status", "ativo")
      .order("sequencia", { ascending: false })
      .limit(1)
      .single();

    const proximaSequencia = (ultimoAparelho?.sequencia || 0) + 1;

    const { data, error } = await supabase
      .from("ordem_servico_aparelhos")
      .insert({
        ...aparelho,
        id_ordem_servico: idOrdemServico,
        sequencia: proximaSequencia,
        criado_por: userId,
        atualizado_por: userId,
      })
      .select()
      .single();

    if (error) throw error;

    // Atualizar OS para indicar múltiplos aparelhos
    await atualizarStatusMultiplosAparelhosOS(idOrdemServico);

    return { data: data as OrdemServicoAparelho, error: null };
  } catch (error: any) {
    console.error("Erro ao adicionar aparelho:", error);

    return { data: null, error: error.message };
  }
}

/**
 * Atualizar aparelho
 */
export async function atualizarAparelho(
  idAparelho: string,
  aparelho: Partial<OrdemServicoAparelho>,
  userId: string,
): Promise<{ data: OrdemServicoAparelho | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from("ordem_servico_aparelhos")
      .update({
        ...aparelho,
        atualizado_por: userId,
      })
      .eq("id", idAparelho)
      .select()
      .single();

    if (error) throw error;

    // Recalcular totais da OS se houver mudança de valores
    if (
      aparelho.valor_orcamento ||
      aparelho.valor_desconto ||
      aparelho.valor_total ||
      aparelho.valor_pago
    ) {
      const aparelhoAtualizado = data as OrdemServicoAparelho;

      await atualizarTotalOS(aparelhoAtualizado.id_ordem_servico);
    }

    return { data: data as OrdemServicoAparelho, error: null };
  } catch (error: any) {
    console.error("Erro ao atualizar aparelho:", error);

    return { data: null, error: error.message };
  }
}

/**
 * Remover aparelho (soft delete)
 */
export async function removerAparelho(
  idAparelho: string,
  userId: string,
): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase
      .from("ordem_servico_aparelhos")
      .update({
        status: "removido",
        atualizado_por: userId,
      })
      .eq("id", idAparelho);

    if (error) throw error;

    // Recalcular totais
    const aparelho = await supabase
      .from("ordem_servico_aparelhos")
      .select("id_ordem_servico")
      .eq("id", idAparelho)
      .single();

    if (aparelho.data) {
      await atualizarTotalOS(aparelho.data.id_ordem_servico);
    }

    return { error: null };
  } catch (error: any) {
    console.error("Erro ao remover aparelho:", error);

    return { error: error.message };
  }
}

/**
 * Atualizar total geral da OS (soma de todos os aparelhos ativos)
 */
export async function atualizarTotalOS(
  idOrdemServico: string,
): Promise<{ error: string | null }> {
  try {
    // Buscar todos os aparelhos ativos
    const { data: aparelhos, error: erroAparelhos } = await supabase
      .from("ordem_servico_aparelhos")
      .select("valor_total, valor_orcamento, valor_desconto, valor_pago")
      .eq("id_ordem_servico", idOrdemServico)
      .eq("status", "ativo");

    if (erroAparelhos) throw erroAparelhos;

    // Calcular totais
    const totalGeral = (aparelhos || []).reduce(
      (sum, app) => sum + (app.valor_total || 0),
      0,
    );
    const totalOrcamento = (aparelhos || []).reduce(
      (sum, app) => sum + (app.valor_orcamento || 0),
      0,
    );
    const totalDesconto = (aparelhos || []).reduce(
      (sum, app) => sum + (app.valor_desconto || 0),
      0,
    );
    const totalPago = (aparelhos || []).reduce(
      (sum, app) => sum + (app.valor_pago || 0),
      0,
    );

    // Atualizar OS
    const { error } = await supabase
      .from("ordem_servico")
      .update({
        total_geral_multiplos: totalGeral,
        valor_orcamento: totalOrcamento,
        valor_desconto: totalDesconto,
        valor_pago: totalPago,
        valor_total: totalGeral,
      })
      .eq("id", idOrdemServico);

    if (error) throw error;

    return { error: null };
  } catch (error: any) {
    console.error("Erro ao atualizar total da OS:", error);

    return { error: error.message };
  }
}

/**
 * Atualizar flag de múltiplos aparelhos na OS
 */
export async function atualizarStatusMultiplosAparelhosOS(
  idOrdemServico: string,
): Promise<{ error: string | null }> {
  try {
    // Contar aparelhos ativos
    const { data: aparelhos } = await supabase
      .from("ordem_servico_aparelhos")
      .select("id", { count: "exact" })
      .eq("id_ordem_servico", idOrdemServico)
      .eq("status", "ativo");

    const temMultiplos = (aparelhos?.length || 0) > 1;

    const { error } = await supabase
      .from("ordem_servico")
      .update({
        permite_multiplos_aparelhos: temMultiplos,
      })
      .eq("id", idOrdemServico);

    if (error) throw error;

    return { error: null };
  } catch (error: any) {
    console.error("Erro ao atualizar status de múltiplos aparelhos:", error);

    return { error: error.message };
  }
}

/**
 * Migrar dados de uma OS com um único aparelho para o novo formato
 * (Convertendo os campos antigos em um registro de aparelho)
 */
export async function migrarOSParaMultiplosAparelhos(
  idOrdemServico: string,
  userId: string,
): Promise<{ error: string | null }> {
  try {
    // Buscar OS atual
    const { data: os, error: erroOS } = await supabase
      .from("ordem_servico")
      .select("*")
      .eq("id", idOrdemServico)
      .single();

    if (erroOS) throw erroOS;
    if (!os) throw new Error("OS não encontrada");

    // Se já migrada, ignorar
    if (os.permite_multiplos_aparelhos) {
      return { error: null };
    }

    // Criar primeiro aparelho com dados legados
    const aparelho: Omit<
      OrdemServicoAparelho,
      "id" | "criado_em" | "atualizado_em"
    > = {
      id_ordem_servico: idOrdemServico,
      id_loja: os.id_loja,
      sequencia: 1,
      equipamento_tipo: os.equipamento_tipo,
      equipamento_marca: os.equipamento_marca,
      equipamento_modelo: os.equipamento_modelo,
      equipamento_numero_serie: os.equipamento_numero_serie,
      equipamento_senha: os.equipamento_senha,
      defeito_reclamado: os.defeito_reclamado,
      estado_equipamento: os.estado_equipamento,
      acessorios_entregues: os.acessorios_entregues,
      diagnostico: os.diagnostico,
      valor_orcamento: os.valor_orcamento,
      valor_desconto: os.valor_desconto,
      valor_total: os.valor_total,
      valor_pago: os.valor_pago,
      servico_realizado: os.servico_realizado,
      laudo_diagnostico: os.laudo_diagnostico,
      laudo_causa: os.laudo_causa,
      laudo_procedimentos: os.laudo_procedimentos,
      laudo_recomendacoes: os.laudo_recomendacoes,
      laudo_garantia_dias: os.laudo_garantia_dias,
      laudo_condicao_final: os.laudo_condicao_final,
      observacoes_tecnicas: os.observacoes_tecnicas,
      status: "ativo",
      criado_por: userId,
      atualizado_por: userId,
    };

    const { error: erroInsercao } = await supabase
      .from("ordem_servico_aparelhos")
      .insert(aparelho);

    if (erroInsercao) throw erroInsercao;

    // Marcar OS como migrada
    const { error: erroAtualizacao } = await supabase
      .from("ordem_servico")
      .update({
        permite_multiplos_aparelhos: true,
      })
      .eq("id", idOrdemServico);

    if (erroAtualizacao) throw erroAtualizacao;

    return { error: null };
  } catch (error: any) {
    console.error("Erro ao migrar OS para múltiplos aparelhos:", error);

    return { error: error.message };
  }
}

/**
 * Calcular totais por aparelho e geral
 */
export async function calcularTotaisOS(idOrdemServico: string): Promise<{
  totalGeral: number;
  totalOrcamento: number;
  totalDesconto: number;
  totalPago: number;
  saldoDevedor: number;
  porAparelho: Array<{
    sequencia: number;
    total: number;
    pago: number;
    saldo: number;
  }>;
}> {
  const { data: aparelhos } = await supabase
    .from("ordem_servico_aparelhos")
    .select("sequencia, valor_total, valor_pago")
    .eq("id_ordem_servico", idOrdemServico)
    .eq("status", "ativo")
    .order("sequencia", { ascending: true });

  const porAparelho = (aparelhos || []).map((app) => ({
    sequencia: app.sequencia,
    total: app.valor_total || 0,
    pago: app.valor_pago || 0,
    saldo: (app.valor_total || 0) - (app.valor_pago || 0),
  }));

  const totalGeral = porAparelho.reduce((sum, app) => sum + app.total, 0);
  const totalPago = porAparelho.reduce((sum, app) => sum + app.pago, 0);
  const saldoDevedor = totalGeral - totalPago;

  return {
    totalGeral,
    totalOrcamento: totalGeral,
    totalDesconto: 0,
    totalPago,
    saldoDevedor,
    porAparelho,
  };
}
