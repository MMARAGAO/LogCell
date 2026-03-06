import type {
  TaxaCartao,
  TaxaCartaoFormData,
  FiltrosTaxaCartao,
  SimulacaoTaxa,
  ResultadoSimulacaoTaxa,
  TipoProdutoTaxa,
  FormaPagamentoTaxa,
  BandeiraCartaoTaxa,
} from "@/types/taxasCartao";

import { supabase } from "@/lib/supabaseClient";

const TABELA_TAXAS_FIXAS: Record<
  BandeiraCartaoTaxa,
  {
    cartao_debito: { taxa_percentual: number; coeficiente: number };
    cartao_credito: Record<
      number,
      { taxa_percentual: number; coeficiente: number }
    >;
  }
> = {
  visa_mastercard: {
    cartao_debito: { taxa_percentual: 2.0, coeficiente: 0.98 },
    cartao_credito: {
      1: { taxa_percentual: 3.85, coeficiente: 0.9615 },
      2: { taxa_percentual: 5.0, coeficiente: 0.95 },
      3: { taxa_percentual: 5.95, coeficiente: 0.9405 },
      4: { taxa_percentual: 6.69, coeficiente: 0.9331 },
      5: { taxa_percentual: 7.35, coeficiente: 0.9265 },
      6: { taxa_percentual: 8.0, coeficiente: 0.92 },
      7: { taxa_percentual: 8.69, coeficiente: 0.9131 },
      8: { taxa_percentual: 9.28, coeficiente: 0.9072 },
      9: { taxa_percentual: 9.89, coeficiente: 0.9011 },
      10: { taxa_percentual: 10.9, coeficiente: 0.891 },
      11: { taxa_percentual: 11.3, coeficiente: 0.887 },
      12: { taxa_percentual: 12.1, coeficiente: 0.879 },
      13: { taxa_percentual: 13.3, coeficiente: 0.867 },
      14: { taxa_percentual: 14.1, coeficiente: 0.859 },
      15: { taxa_percentual: 15.19, coeficiente: 0.8481 },
      16: { taxa_percentual: 16.0, coeficiente: 0.84 },
      17: { taxa_percentual: 16.59, coeficiente: 0.8341 },
      18: { taxa_percentual: 17.1, coeficiente: 0.829 },
    },
  },
  elo: {
    cartao_debito: { taxa_percentual: 3.0, coeficiente: 0.97 },
    cartao_credito: {
      1: { taxa_percentual: 4.85, coeficiente: 0.9515 },
      2: { taxa_percentual: 6.0, coeficiente: 0.94 },
      3: { taxa_percentual: 6.95, coeficiente: 0.9305 },
      4: { taxa_percentual: 7.69, coeficiente: 0.9231 },
      5: { taxa_percentual: 8.35, coeficiente: 0.9165 },
      6: { taxa_percentual: 9.0, coeficiente: 0.91 },
      7: { taxa_percentual: 9.69, coeficiente: 0.9031 },
      8: { taxa_percentual: 10.28, coeficiente: 0.8972 },
      9: { taxa_percentual: 10.89, coeficiente: 0.8911 },
      10: { taxa_percentual: 11.9, coeficiente: 0.881 },
      11: { taxa_percentual: 12.3, coeficiente: 0.877 },
      12: { taxa_percentual: 13.1, coeficiente: 0.869 },
      13: { taxa_percentual: 14.3, coeficiente: 0.857 },
      14: { taxa_percentual: 15.1, coeficiente: 0.849 },
      15: { taxa_percentual: 16.19, coeficiente: 0.8381 },
      16: { taxa_percentual: 17.0, coeficiente: 0.83 },
      17: { taxa_percentual: 17.59, coeficiente: 0.8241 },
      18: { taxa_percentual: 18.1, coeficiente: 0.819 },
    },
  },
};

function obterTaxaTabelaFixa(
  forma_pagamento: FormaPagamentoTaxa,
  parcelas: number,
  bandeira: BandeiraCartaoTaxa,
) {
  const tabela = TABELA_TAXAS_FIXAS[bandeira];

  if (forma_pagamento === "cartao_debito") {
    return {
      ...tabela.cartao_debito,
      parcelas: 1,
    };
  }

  const parcelasAjustadas = Math.min(Math.max(parcelas, 1), 18);

  return {
    ...(tabela.cartao_credito[parcelasAjustadas] || tabela.cartao_credito[1]),
    parcelas: parcelasAjustadas,
  };
}

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

// Simular taxa de cartao
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
      bandeira = "visa_mastercard",
    } = simulacao;

    const taxaTabela = obterTaxaTabelaFixa(forma_pagamento, parcelas, bandeira);

    const valor_base = valor_bruto;
    const taxa_percentual = taxaTabela.taxa_percentual;
    const coeficiente = taxaTabela.coeficiente;
    const parcelasAplicadas = taxaTabela.parcelas;
    const valor_brutoCalculado = coeficiente > 0 ? valor_base / coeficiente : 0;
    const valor_taxa = (valor_brutoCalculado * taxa_percentual) / 100;
    const valor_liquido = valor_brutoCalculado - valor_taxa;
    const lucro_sem_taxa = valor_base - valor_custo;
    const lucro_com_taxa = valor_liquido - valor_custo;

    const margem_lucro_sem_taxa_percentual =
      valor_bruto > 0 ? (lucro_sem_taxa / valor_bruto) * 100 : 0;
    const margem_lucro_com_taxa_percentual =
      valor_bruto > 0 ? (lucro_com_taxa / valor_bruto) * 100 : 0;

    return {
      valor_base,
      valor_bruto: valor_brutoCalculado,
      valor_custo,
      taxa_percentual,
      coeficiente,
      valor_taxa,
      valor_liquido,
      lucro_sem_taxa,
      lucro_com_taxa,
      margem_lucro_sem_taxa_percentual,
      margem_lucro_com_taxa_percentual,
      forma_pagamento,
      parcelas: parcelasAplicadas,
      bandeira,
      tipo_produto,
    };
  } catch (error) {
    console.error("Erro ao simular taxa de cartao:", error);
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
