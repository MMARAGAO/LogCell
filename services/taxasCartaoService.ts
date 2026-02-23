import type {
  TaxaCartao,
  TaxaCartaoFormData,
  FiltrosTaxaCartao,
  SimulacaoTaxa,
  ResultadoSimulacaoTaxa,
  TipoProdutoTaxa,
  FormaPagamentoTaxa,
} from "@/types/taxasCartao";

import { supabase } from "@/lib/supabaseClient";

/**
 * Serviço para gerenciamento de taxas de cartão
 */

// Buscar todas as taxas com filtros
export async function getTaxasCartao(
  filtros?: FiltrosTaxaCartao,
): Promise<TaxaCartao[]> {
  try {
    let query = supabase
      .from("taxas_cartao")
      .select("*")
      .order("tipo_produto")
      .order("forma_pagamento")
      .order("parcelas_min");

    // Filtrar por loja
    if (filtros?.loja_id !== undefined) {
      query = query.or(`loja_id.eq.${filtros.loja_id},loja_id.is.null`);
    }

    // Filtrar por tipo de produto
    if (filtros?.tipo_produto) {
      query = query.or(
        `tipo_produto.eq.${filtros.tipo_produto},tipo_produto.eq.todos`,
      );
    }

    // Filtrar por forma de pagamento
    if (filtros?.forma_pagamento) {
      query = query.eq("forma_pagamento", filtros.forma_pagamento);
    }

    // Filtrar por ativo
    if (filtros?.ativo !== undefined) {
      query = query.eq("ativo", filtros.ativo);
    }

    const { data, error } = await query;

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error("Erro ao buscar taxas de cartão:", error);
    throw error;
  }
}

// Buscar taxa específica por ID
export async function getTaxaCartaoById(
  id: string,
): Promise<TaxaCartao | null> {
  try {
    const { data, error } = await supabase
      .from("taxas_cartao")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error("Erro ao buscar taxa de cartão:", error);
    throw error;
  }
}

// Buscar taxa aplicável para uma situação específica
export async function getTaxaAplicavel(
  loja_id: number | null,
  tipo_produto: TipoProdutoTaxa,
  forma_pagamento: FormaPagamentoTaxa,
  parcelas: number,
): Promise<TaxaCartao | null> {
  try {
    let query = supabase
      .from("taxas_cartao")
      .select("*")
      .eq("forma_pagamento", forma_pagamento)
      .eq("ativo", true)
      .lte("parcelas_min", parcelas)
      .gte("parcelas_max", parcelas);

    // Buscar primeiro por tipo de produto específico e loja específica
    const { data: taxasEspecificas } = await query
      .eq("tipo_produto", tipo_produto)
      .eq("loja_id", loja_id)
      .limit(1);

    if (taxasEspecificas && taxasEspecificas.length > 0) {
      return taxasEspecificas[0];
    }

    // Se não encontrou, buscar por tipo de produto específico e loja null (global)
    const { data: taxasEspecificasGlobais } = await query
      .eq("tipo_produto", tipo_produto)
      .is("loja_id", null)
      .limit(1);

    if (taxasEspecificasGlobais && taxasEspecificasGlobais.length > 0) {
      return taxasEspecificasGlobais[0];
    }

    // Se não encontrou, buscar por "todos" os produtos e loja específica
    const { data: taxasTodosLoja } = await query
      .eq("tipo_produto", "todos")
      .eq("loja_id", loja_id)
      .limit(1);

    if (taxasTodosLoja && taxasTodosLoja.length > 0) {
      return taxasTodosLoja[0];
    }

    // Por último, buscar por "todos" os produtos e loja null (global)
    const { data: taxasTodosGlobal } = await query
      .eq("tipo_produto", "todos")
      .is("loja_id", null)
      .limit(1);

    if (taxasTodosGlobal && taxasTodosGlobal.length > 0) {
      return taxasTodosGlobal[0];
    }

    return null;
  } catch (error) {
    console.error("Erro ao buscar taxa aplicável:", error);
    throw error;
  }
}

// Simular taxa de cartão
export async function simularTaxaCartao(
  simulacao: SimulacaoTaxa,
): Promise<ResultadoSimulacaoTaxa> {
  try {
    const {
      valor_bruto,
      valor_custo = 0,
      tipo_produto,
      forma_pagamento,
      parcelas,
    } = simulacao;

    // Buscar taxa aplicável (sem passar loja_id, pode ser adicionado depois se necessário)
    const taxaAplicavel = await getTaxaAplicavel(
      null,
      tipo_produto,
      forma_pagamento,
      parcelas,
    );

    const taxa_percentual = taxaAplicavel?.taxa_percentual || 0;

    // Cálculos
    const valor_taxa = (valor_bruto * taxa_percentual) / 100;
    const valor_liquido = valor_bruto - valor_taxa;
    const lucro_sem_taxa = valor_bruto - valor_custo;
    const lucro_com_taxa = valor_liquido - valor_custo;

    const margem_lucro_sem_taxa_percentual =
      valor_bruto > 0 ? (lucro_sem_taxa / valor_bruto) * 100 : 0;
    const margem_lucro_com_taxa_percentual =
      valor_bruto > 0 ? (lucro_com_taxa / valor_bruto) * 100 : 0;

    return {
      valor_bruto,
      valor_custo,
      taxa_percentual,
      valor_taxa,
      valor_liquido,
      lucro_sem_taxa,
      lucro_com_taxa,
      margem_lucro_sem_taxa_percentual,
      margem_lucro_com_taxa_percentual,
      forma_pagamento,
      parcelas,
      tipo_produto,
    };
  } catch (error) {
    console.error("Erro ao simular taxa de cartão:", error);
    throw error;
  }
}

// Criar nova taxa
export async function criarTaxaCartao(
  taxa: TaxaCartaoFormData,
  usuarioId: string,
): Promise<TaxaCartao> {
  try {
    const { data, error } = await supabase
      .from("taxas_cartao")
      .insert({
        ...taxa,
        ativo: taxa.ativo ?? true,
        criado_por: usuarioId,
      })
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error("Erro ao criar taxa de cartão:", error);
    throw error;
  }
}

// Atualizar taxa
export async function atualizarTaxaCartao(
  id: string,
  taxa: Partial<TaxaCartaoFormData>,
  usuarioId: string,
): Promise<TaxaCartao> {
  try {
    const { data, error } = await supabase
      .from("taxas_cartao")
      .update({
        ...taxa,
        atualizado_por: usuarioId,
        atualizado_em: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error("Erro ao atualizar taxa de cartão:", error);
    throw error;
  }
}

// Deletar taxa
export async function deletarTaxaCartao(id: string): Promise<void> {
  try {
    const { error } = await supabase.from("taxas_cartao").delete().eq("id", id);

    if (error) throw error;
  } catch (error) {
    console.error("Erro ao deletar taxa de cartão:", error);
    throw error;
  }
}

// Ativar/Desativar taxa
export async function toggleAtivoTaxaCartao(
  id: string,
  ativo: boolean,
  usuarioId: string,
): Promise<TaxaCartao> {
  try {
    const { data, error } = await supabase
      .from("taxas_cartao")
      .update({
        ativo,
        atualizado_por: usuarioId,
        atualizado_em: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error("Erro ao alterar status da taxa:", error);
    throw error;
  }
}
