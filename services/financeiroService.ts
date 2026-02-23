import { supabase } from "@/lib/supabaseClient";

type MesAno = { mes: number; ano: number };

function buildMesAnoRange(dataInicio: string, dataFim: string): MesAno[] {
  const start = new Date(dataInicio);
  const end = new Date(dataFim);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return [];
  }

  start.setDate(1);
  end.setDate(1);

  const ranges: MesAno[] = [];
  const current = new Date(start);

  while (current <= end) {
    ranges.push({ mes: current.getMonth() + 1, ano: current.getFullYear() });
    current.setMonth(current.getMonth() + 1);
  }

  return ranges;
}

function applyMesAnoOr(query: unknown, ranges: MesAno[]) {
  if (ranges.length === 0) return query;

  const orConditions = ranges
    .map((r) => `and(mes.eq.${r.mes},ano.eq.${r.ano})`)
    .join(",");

  return (query as any).or(orConditions);
}

export interface FolhaSalarial {
  id?: string;
  mes: number;
  ano: number;
  funcionario_id: string;
  funcionario_nome?: string;
  salario_base: number;
  comissoes: number;
  descontos: number;
  vales: number;
  bonificacoes: number;
  total_liquido: number;
  status: "gerada" | "paga" | "cancelada";
  data_pagamento?: string;
  observacoes?: string;
  criado_em?: string;
  atualizado_em?: string;
  id_loja?: number;
  loja_nome?: string;
}

export interface ContaLoja {
  id?: string;
  loja_id: number;
  loja_nome?: string;
  descricao: string;
  tipo: "aluguel" | "internet" | "energia" | "agua" | "compras" | "outro";
  valor: number;
  desconto?: number;
  data_vencimento: string;
  data_pagamento?: string;
  status: "aberta" | "paga" | "vencida" | "cancelada";
  comprovante_url?: string;
  observacoes?: string;
  recorrente_id?: string;
  criado_em?: string;
  atualizado_em?: string;
}

export interface ContaLojaRecorrente {
  id?: string;
  loja_id: number;
  descricao: string;
  tipo: "aluguel" | "internet" | "energia" | "agua" | "compras" | "outro";
  valor: number;
  desconto?: number;
  periodicidade: "mensal";
  dia_vencimento: number;
  ativo: boolean;
  observacoes?: string;
  criado_em?: string;
  atualizado_em?: string;
}

export interface ValeFuncionario {
  id?: string;
  funcionario_id: string;
  funcionario_nome?: string;
  descricao: string;
  valor: number;
  data_solicitacao: string;
  data_pagamento?: string;
  status: "solicitado" | "aprovado" | "pago" | "cancelado";
  observacoes?: string;
  criado_em?: string;
  atualizado_em?: string;
}

export interface RetiradaPessoal {
  id?: string;
  usuario_id: string;
  valor: number;
  motivo?: string;
  data_retirada: string;
  comprovante_url?: string;
  observacoes?: string;
  criado_em?: string;
  atualizado_em?: string;
}

export interface ContaFornecedor {
  id?: string;
  fornecedor_id: string;
  fornecedor_nome?: string;
  descricao: string;
  valor: number;
  juros?: number;
  multa?: number;
  desconto?: number;
  data_vencimento: string;
  data_pagamento?: string;
  status: "aberta" | "paga" | "vencida" | "cancelada";
  numero_nf?: string;
  comprovante_url?: string;
  observacoes?: string;
  criado_em?: string;
  atualizado_em?: string;
}

export interface ImpostoConta {
  id?: string;
  tipo: "simples_nacional" | "icms" | "iss" | "das" | "irpj" | "csll" | "outro";
  descricao: string;
  valor: number;
  juros?: number;
  multa?: number;
  desconto?: number;
  data_vencimento: string;
  data_pagamento?: string;
  status: "aberta" | "paga" | "vencida" | "cancelada";
  loja_id?: number;
  loja_nome?: string;
  comprovante_url?: string;
  observacoes?: string;
  criado_em?: string;
  atualizado_em?: string;
}

export interface Comissao {
  id?: string;
  funcionario_id: string;
  tipo: "lucro" | "venda" | "performance" | "outro";
  valor: number;
  percentual?: number;
  data_inicio: string;
  data_fim?: string;
  mes: number;
  ano: number;
  status: "pendente" | "aprovada" | "paga" | "cancelada";
  observacoes?: string;
  criado_em?: string;
  atualizado_em?: string;
}

export interface Desconto {
  id?: string;
  funcionario_id: string;
  tipo: "faltas" | "atraso" | "adiantamento" | "outro";
  valor: number;
  percentual?: number;
  data_desconto: string;
  mes: number;
  ano: number;
  motivo: string;
  status: "pendente" | "descontado" | "cancelado";
  observacoes?: string;
  criado_em?: string;
  atualizado_em?: string;
}

export interface Bonificacao {
  id?: string;
  funcionario_id: string;
  tipo: "desempenho" | "assiduidade" | "metas" | "outro";
  valor: number;
  descricao: string;
  data_bonificacao: string;
  mes: number;
  ano: number;
  status: "pendente" | "aprovada" | "paga" | "cancelada";
  observacoes?: string;
  criado_em?: string;
  atualizado_em?: string;
}

export interface CentroCusto {
  id?: string;
  loja_id: number;
  loja_nome?: string;
  tipo: "estoque" | "marketing" | "estrutura" | "pessoal" | "outro";
  descricao: string;
  valor: number;
  data: string;
  mes: number;
  ano: number;
  categoria?: string;
  comprovante_url?: string;
  observacoes?: string;
  criado_em?: string;
  atualizado_em?: string;
}

export interface AnaliseCustoPorTipo {
  tipo: string;
  total: number;
  quantidade: number;
  percentual: number;
  media: number;
}

export interface AnaliseCustoPorLoja {
  loja_id: number;
  loja_nome?: string;
  total: number;
  quantidade: number;
  percentual: number;
  media: number;
}

export interface AnaliseComparativa {
  periodo_anterior: {
    mes: number;
    ano: number;
    total: number;
  };
  periodo_atual: {
    mes: number;
    ano: number;
    total: number;
  };
  variacao: number;
  percentual_variacao: number;
}

// =====================================================
// RELATÓRIOS GERENCIAIS - INTERFACES
// =====================================================

export interface LucroLiquidoReal {
  periodo: string;
  receita_total?: number;
  total_despesas: number;
  folha_pagamento: number;
  impostos: number;
  custos_operacionais: number;
  outras_despesas: number;
  lucro_liquido: number;
  margem_liquida: number; // percentual
}

export interface ComparativoMensal {
  mes_ano: string;
  folha_pagamento: number;
  impostos: number;
  custos: number;
  contas_despesas: number;
  vales: number;
  retiradas: number;
  total_despesas: number;
}

export interface GrowthAnalysis {
  periodo: string;
  valor_anterior: number;
  valor_atual: number;
  variacao_absoluta: number;
  variacao_percentual: number;
  tendencia: "crescimento" | "queda" | "estavel";
}

export interface MargeLucroProduto {
  produto_nome: string;
  quantidade_vendas?: number;
  valor_total?: number;
  custos?: number;
  lucro?: number;
  margem_percentual?: number;
}

export interface MargeLucroVendedor {
  vendedor_nome: string;
  comissoes: number;
  bonificacoes: number;
  descontos: number;
  valor_ganhos: number;
  taxa_custos: number; // percentual em relação a custos
}

export interface ResumoRelatorio {
  periodo: string;
  lucro_liquido: LucroLiquidoReal;
  comparativos: ComparativoMensal[];
  crescimento: GrowthAnalysis[];
}

// =====================================================
// FOLHA SALARIAL
// =====================================================

export async function getFolhasSalariais(
  mes?: number,
  ano?: number,
  lojaId?: number,
  dataInicio?: string,
  dataFim?: string,
): Promise<FolhaSalarial[]> {
  try {
    let query = supabase.from("folhas_salariais").select(`
        *,
        funcionario:usuarios(nome),
        loja:lojas(nome)
      `);

    if (dataInicio && dataFim) {
      const ranges = buildMesAnoRange(dataInicio, dataFim);

      query = applyMesAnoOr(query, ranges);
    } else {
      if (mes) {
        query = query.eq("mes", mes);
      }

      if (ano) {
        query = query.eq("ano", ano);
      }
    }

    if (lojaId) {
      query = query.eq("id_loja", lojaId);
    }

    const { data, error } = await query.order("criado_em", {
      ascending: false,
    });

    if (error) throw error;

    // Mapear os dados para incluir os nomes
    return (data || []).map((item: any) => ({
      ...item,
      funcionario_nome: item.funcionario?.nome || "Desconhecido",
      loja_nome: item.loja?.nome || "Desconhecida",
    }));
  } catch (error) {
    console.error("Erro ao buscar folhas salariais:", error);
    throw error;
  }
}

export async function criarFolhaSalarial(
  folha: Omit<FolhaSalarial, "id" | "criado_em" | "atualizado_em">,
): Promise<FolhaSalarial> {
  try {
    const { data, error } = await supabase
      .from("folhas_salariais")
      .insert([folha])
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error("Erro ao criar folha salarial:", error);
    throw error;
  }
}

export async function atualizarFolhaSalarial(
  id: string,
  folha: Partial<FolhaSalarial>,
): Promise<FolhaSalarial> {
  try {
    const { data, error } = await supabase
      .from("folhas_salariais")
      .update(folha)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error("Erro ao atualizar folha salarial:", error);
    throw error;
  }
}

export async function deletarFolhaSalarial(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from("folhas_salariais")
      .delete()
      .eq("id", id);

    if (error) throw error;
  } catch (error) {
    console.error("Erro ao deletar folha salarial:", error);
    throw error;
  }
}

// =====================================================
// CONTAS DAS LOJAS
// =====================================================

export async function getContasLojaRecorrentes(
  lojaId: number,
): Promise<ContaLojaRecorrente[]> {
  try {
    const { data, error } = await supabase
      .from("contas_lojas_recorrentes")
      .select("*")
      .eq("loja_id", lojaId)
      .order("descricao", { ascending: true });

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error("Erro ao buscar contas recorrentes:", error);
    throw error;
  }
}

export async function criarContaLojaRecorrente(
  conta: Omit<ContaLojaRecorrente, "id" | "criado_em" | "atualizado_em">,
): Promise<ContaLojaRecorrente> {
  try {
    const { data, error } = await supabase
      .from("contas_lojas_recorrentes")
      .insert([conta])
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error("Erro ao criar conta recorrente:", error);
    throw error;
  }
}

export async function atualizarContaLojaRecorrente(
  id: string,
  conta: Partial<ContaLojaRecorrente>,
): Promise<ContaLojaRecorrente> {
  try {
    const { data, error } = await supabase
      .from("contas_lojas_recorrentes")
      .update(conta)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error("Erro ao atualizar conta recorrente:", error);
    throw error;
  }
}

export async function deletarContaLojaRecorrente(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from("contas_lojas_recorrentes")
      .delete()
      .eq("id", id);

    if (error) throw error;
  } catch (error) {
    console.error("Erro ao deletar conta recorrente:", error);
    throw error;
  }
}

export async function gerarContasLojaRecorrentes(
  lojaId: number,
  mes: number,
  ano: number,
): Promise<void> {
  try {
    const { data: recorrentes, error } = await supabase
      .from("contas_lojas_recorrentes")
      .select("*")
      .eq("loja_id", lojaId)
      .eq("ativo", true);

    if (error) throw error;
    if (!recorrentes || recorrentes.length === 0) return;

    const pad = (value: number) => String(value).padStart(2, "0");
    const dataInicio = `${ano}-${pad(mes)}-01`;
    const dataFim = new Date(ano, mes, 1).toISOString().split("T")[0];
    const ultimoDia = new Date(ano, mes, 0).getDate();

    for (const rec of recorrentes) {
      const { data: existentes, error: errorExistente } = await supabase
        .from("contas_lojas")
        .select("id")
        .eq("loja_id", lojaId)
        .eq("recorrente_id", rec.id)
        .gte("data_vencimento", dataInicio)
        .lt("data_vencimento", dataFim)
        .limit(1);

      if (errorExistente) throw errorExistente;
      if (existentes && existentes.length > 0) continue;

      const dia = Math.min(rec.dia_vencimento || 1, ultimoDia);
      const dataVencimento = `${ano}-${pad(mes)}-${pad(dia)}`;

      const novaConta: Omit<ContaLoja, "id" | "criado_em" | "atualizado_em"> = {
        loja_id: rec.loja_id,
        descricao: rec.descricao,
        tipo: rec.tipo,
        valor: rec.valor,
        desconto: rec.desconto,
        data_vencimento: dataVencimento,
        status: "aberta",
        observacoes: rec.observacoes,
        recorrente_id: rec.id,
      };

      const { error: errorCriar } = await supabase
        .from("contas_lojas")
        .insert([novaConta]);

      if (errorCriar) throw errorCriar;
    }
  } catch (error) {
    console.error("Erro ao gerar contas recorrentes:", error);
    throw error;
  }
}

export async function getContasLoja(
  lojaId?: number,
  status?: string,
  mes?: number,
  ano?: number,
  dataInicio?: string,
  dataFim?: string,
): Promise<ContaLoja[]> {
  try {
    let query = supabase.from("contas_lojas").select(`
        *,
        loja:lojas(nome)
      `);

    if (lojaId) {
      query = query.eq("loja_id", lojaId);
    }

    if (status) {
      query = query.eq("status", status);
    }

    // Filtrar por periodo se fornecido
    if (dataInicio && dataFim) {
      query = query
        .gte("data_vencimento", dataInicio)
        .lte("data_vencimento", dataFim);
    } else if (mes && ano) {
      const periodoInicio = `${ano}-${String(mes).padStart(2, "0")}-01`;
      const ultimoDia = new Date(ano, mes, 0).getDate();
      const periodoFim = `${ano}-${String(mes).padStart(2, "0")}-${ultimoDia}`;

      query = query
        .gte("data_vencimento", periodoInicio)
        .lte("data_vencimento", periodoFim);
    }

    const { data, error } = await query.order("data_vencimento", {
      ascending: true,
    });

    if (error) throw error;

    // Mapear os dados para incluir o nome da loja
    return (data || []).map((item: any) => ({
      ...item,
      loja_nome: item.loja?.nome || "Desconhecida",
    }));
  } catch (error) {
    console.error("Erro ao buscar contas da loja:", error);
    throw error;
  }
}

export async function criarContaLoja(
  conta: Omit<ContaLoja, "id" | "criado_em" | "atualizado_em">,
): Promise<ContaLoja> {
  try {
    const { data, error } = await supabase
      .from("contas_lojas")
      .insert([conta])
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error("Erro ao criar conta da loja:", error);
    throw error;
  }
}

export async function atualizarContaLoja(
  id: string,
  conta: Partial<ContaLoja>,
): Promise<ContaLoja> {
  try {
    const { data, error } = await supabase
      .from("contas_lojas")
      .update(conta)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error("Erro ao atualizar conta da loja:", error);
    throw error;
  }
}

export async function deletarContaLoja(id: string): Promise<void> {
  try {
    const { error } = await supabase.from("contas_lojas").delete().eq("id", id);

    if (error) throw error;
  } catch (error) {
    console.error("Erro ao deletar conta da loja:", error);
    throw error;
  }
}

// =====================================================
// VALES DE FUNCIONÁRIO
// =====================================================

export async function getValesFuncionario(
  funcionarioId?: string,
  status?: string,
  mes?: number,
  ano?: number,
  dataInicio?: string,
  dataFim?: string,
): Promise<ValeFuncionario[]> {
  try {
    let query = supabase.from("vales_funcionarios").select(`
        *,
        funcionario:usuarios!funcionario_id(nome)
      `);

    if (funcionarioId) {
      query = query.eq("funcionario_id", funcionarioId);
    }

    if (status) {
      query = query.eq("status", status);
    }

    // Filtrar por periodo se fornecido
    if (dataInicio && dataFim) {
      query = query
        .gte("data_solicitacao", dataInicio)
        .lte("data_solicitacao", dataFim);
    } else if (mes && ano) {
      const periodoInicio = `${ano}-${String(mes).padStart(2, "0")}-01`;
      const ultimoDia = new Date(ano, mes, 0).getDate();
      const periodoFim = `${ano}-${String(mes).padStart(2, "0")}-${ultimoDia}`;

      query = query
        .gte("data_solicitacao", periodoInicio)
        .lte("data_solicitacao", periodoFim);
    }

    const { data, error } = await query.order("data_solicitacao", {
      ascending: false,
    });

    if (error) throw error;

    return (data || []).map((vale: any) => ({
      ...vale,
      funcionario_nome: vale.funcionario?.nome || "Funcionário não encontrado",
    }));
  } catch (error) {
    console.error("Erro ao buscar vales:", error);
    throw error;
  }
}

export async function criarValeFuncionario(
  vale: Omit<ValeFuncionario, "id" | "criado_em" | "atualizado_em">,
): Promise<ValeFuncionario> {
  try {
    const { data, error } = await supabase
      .from("vales_funcionarios")
      .insert([vale])
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error("Erro ao criar vale:", error);
    throw error;
  }
}

export async function atualizarValeFuncionario(
  id: string,
  vale: Partial<ValeFuncionario>,
): Promise<ValeFuncionario> {
  try {
    const { data, error } = await supabase
      .from("vales_funcionarios")
      .update(vale)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error("Erro ao atualizar vale:", error);
    throw error;
  }
}

export async function deletarValeFuncionario(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from("vales_funcionarios")
      .delete()
      .eq("id", id);

    if (error) throw error;
  } catch (error) {
    console.error("Erro ao deletar vale:", error);
    throw error;
  }
}

// =====================================================
// RETIRADAS PESSOAIS
// =====================================================

export async function getRetiradasPessoais(
  usuarioId?: string,
  mes?: number,
  ano?: number,
  dataInicio?: string,
  dataFim?: string,
): Promise<RetiradaPessoal[]> {
  try {
    let query = supabase.from("retiradas_pessoais").select("*");

    if (usuarioId) {
      query = query.eq("usuario_id", usuarioId);
    }

    // Filtrar por periodo se fornecido
    if (dataInicio && dataFim) {
      query = query
        .gte("data_retirada", dataInicio)
        .lte("data_retirada", dataFim);
    } else if (mes && ano) {
      const periodoInicio = `${ano}-${String(mes).padStart(2, "0")}-01`;
      const ultimoDia = new Date(ano, mes, 0).getDate();
      const periodoFim = `${ano}-${String(mes).padStart(2, "0")}-${ultimoDia}`;

      query = query
        .gte("data_retirada", periodoInicio)
        .lte("data_retirada", periodoFim);
    }

    const { data, error } = await query.order("data_retirada", {
      ascending: false,
    });

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error("Erro ao buscar retiradas pessoais:", error);
    throw error;
  }
}

export async function criarRetiradaPessoal(
  retirada: Omit<RetiradaPessoal, "id" | "criado_em" | "atualizado_em">,
): Promise<RetiradaPessoal> {
  try {
    const { data, error } = await supabase
      .from("retiradas_pessoais")
      .insert([retirada])
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error("Erro ao criar retirada pessoal:", error);
    throw error;
  }
}

export async function atualizarRetiradaPessoal(
  id: string,
  retirada: Partial<RetiradaPessoal>,
): Promise<RetiradaPessoal> {
  try {
    const { data, error } = await supabase
      .from("retiradas_pessoais")
      .update(retirada)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error("Erro ao atualizar retirada pessoal:", error);
    throw error;
  }
}

export async function deletarRetiradaPessoal(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from("retiradas_pessoais")
      .delete()
      .eq("id", id);

    if (error) throw error;
  } catch (error) {
    console.error("Erro ao deletar retirada pessoal:", error);
    throw error;
  }
}

// =====================================================
// CONTAS FORNECEDORES
// =====================================================

export async function getContasFornecedor(
  fornecedorId?: string,
  status?: string,
  mes?: number,
  ano?: number,
  dataInicio?: string,
  dataFim?: string,
): Promise<ContaFornecedor[]> {
  try {
    let query = supabase.from("contas_fornecedores").select(`
        *,
        fornecedor:fornecedores!fornecedor_id(nome)
      `);

    if (fornecedorId) {
      query = query.eq("fornecedor_id", fornecedorId);
    }

    if (status) {
      query = query.eq("status", status);
    }

    // Filtrar por periodo se fornecido
    if (dataInicio && dataFim) {
      query = query
        .gte("data_vencimento", dataInicio)
        .lte("data_vencimento", dataFim);
    } else if (mes && ano) {
      const periodoInicio = `${ano}-${String(mes).padStart(2, "0")}-01`;
      const ultimoDia = new Date(ano, mes, 0).getDate();
      const periodoFim = `${ano}-${String(mes).padStart(2, "0")}-${ultimoDia}`;

      query = query
        .gte("data_vencimento", periodoInicio)
        .lte("data_vencimento", periodoFim);
    }

    const { data, error } = await query.order("data_vencimento", {
      ascending: true,
    });

    if (error) throw error;

    return (data || []).map((conta: any) => ({
      ...conta,
      fornecedor_nome: conta.fornecedor?.nome || "Fornecedor não encontrado",
    }));
  } catch (error) {
    console.error("Erro ao buscar contas de fornecedores:", error);
    throw error;
  }
}

export async function criarContaFornecedor(
  conta: Omit<ContaFornecedor, "id" | "criado_em" | "atualizado_em">,
): Promise<ContaFornecedor> {
  try {
    const { data, error } = await supabase
      .from("contas_fornecedores")
      .insert([conta])
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error("Erro ao criar conta de fornecedor:", error);
    throw error;
  }
}

export async function atualizarContaFornecedor(
  id: string,
  conta: Partial<ContaFornecedor>,
): Promise<ContaFornecedor> {
  try {
    const { data, error } = await supabase
      .from("contas_fornecedores")
      .update(conta)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error("Erro ao atualizar conta de fornecedor:", error);
    throw error;
  }
}

export async function deletarContaFornecedor(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from("contas_fornecedores")
      .delete()
      .eq("id", id);

    if (error) throw error;
  } catch (error) {
    console.error("Erro ao deletar conta de fornecedor:", error);
    throw error;
  }
}

// =====================================================
// IMPOSTOS E TRIBUTOS
// =====================================================

export async function getImpostosConta(
  tipo?: string,
  status?: string,
  lojaId?: number,
  mes?: number,
  ano?: number,
  dataInicio?: string,
  dataFim?: string,
): Promise<ImpostoConta[]> {
  try {
    let query = supabase.from("impostos_contas").select(`
        *,
        loja:lojas(nome)
      `);

    if (tipo) {
      query = query.eq("tipo", tipo);
    }

    if (status) {
      query = query.eq("status", status);
    }

    if (lojaId) {
      query = query.eq("loja_id", lojaId);
    }

    // Filtrar por periodo se fornecido
    if (dataInicio && dataFim) {
      query = query
        .gte("data_vencimento", dataInicio)
        .lte("data_vencimento", dataFim);
    } else if (mes && ano) {
      const periodoInicio = `${ano}-${String(mes).padStart(2, "0")}-01`;
      const ultimoDia = new Date(ano, mes, 0).getDate();
      const periodoFim = `${ano}-${String(mes).padStart(2, "0")}-${ultimoDia}`;

      query = query
        .gte("data_vencimento", periodoInicio)
        .lte("data_vencimento", periodoFim);
    }

    const { data, error } = await query.order("data_vencimento", {
      ascending: true,
    });

    if (error) throw error;

    // Mapear os dados para incluir o nome da loja
    return (data || []).map((item: any) => ({
      ...item,
      loja_nome: item.loja?.nome || "Desconhecida",
    }));
  } catch (error) {
    console.error("Erro ao buscar impostos e contas:", error);
    throw error;
  }
}

export async function criarImpostoConta(
  imposto: Omit<ImpostoConta, "id" | "criado_em" | "atualizado_em">,
): Promise<ImpostoConta> {
  try {
    const { data, error } = await supabase
      .from("impostos_contas")
      .insert([imposto])
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error("Erro ao criar imposto/conta:", error);
    throw error;
  }
}

export async function atualizarImpostoConta(
  id: string,
  imposto: Partial<ImpostoConta>,
): Promise<ImpostoConta> {
  try {
    const { data, error } = await supabase
      .from("impostos_contas")
      .update(imposto)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error("Erro ao atualizar imposto/conta:", error);
    throw error;
  }
}

export async function deletarImpostoConta(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from("impostos_contas")
      .delete()
      .eq("id", id);

    if (error) throw error;
  } catch (error) {
    console.error("Erro ao deletar imposto/conta:", error);
    throw error;
  }
}

// =====================================================
// COMISSÕES
// =====================================================

export async function getComissoes(
  funcionarioId?: string,
  mes?: number,
  ano?: number,
  dataInicio?: string,
  dataFim?: string,
): Promise<Comissao[]> {
  try {
    let query = supabase.from("comissoes").select("*");

    if (funcionarioId) {
      query = query.eq("funcionario_id", funcionarioId);
    }

    if (dataInicio && dataFim) {
      const ranges = buildMesAnoRange(dataInicio, dataFim);

      query = applyMesAnoOr(query, ranges);
    } else {
      if (mes) {
        query = query.eq("mes", mes);
      }

      if (ano) {
        query = query.eq("ano", ano);
      }
    }

    const { data, error } = await query.order("criado_em", {
      ascending: false,
    });

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error("Erro ao buscar comissões:", error);
    throw error;
  }
}

export async function criarComissao(
  comissao: Omit<Comissao, "id" | "criado_em" | "atualizado_em">,
): Promise<Comissao> {
  try {
    const { data, error } = await supabase
      .from("comissoes")
      .insert([comissao])
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error("Erro ao criar comissão:", error);
    throw error;
  }
}

export async function atualizarComissao(
  id: string,
  comissao: Partial<Comissao>,
): Promise<Comissao> {
  try {
    const { data, error } = await supabase
      .from("comissoes")
      .update(comissao)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error("Erro ao atualizar comissão:", error);
    throw error;
  }
}

export async function deletarComissao(id: string): Promise<void> {
  try {
    const { error } = await supabase.from("comissoes").delete().eq("id", id);

    if (error) throw error;
  } catch (error) {
    console.error("Erro ao deletar comissão:", error);
    throw error;
  }
}

// =====================================================
// DESCONTOS
// =====================================================

export async function getDescontos(
  funcionarioId?: string,
  mes?: number,
  ano?: number,
  dataInicio?: string,
  dataFim?: string,
): Promise<Desconto[]> {
  try {
    let query = supabase.from("descontos").select("*");

    if (funcionarioId) {
      query = query.eq("funcionario_id", funcionarioId);
    }

    if (dataInicio && dataFim) {
      const ranges = buildMesAnoRange(dataInicio, dataFim);

      query = applyMesAnoOr(query, ranges);
    } else {
      if (mes) {
        query = query.eq("mes", mes);
      }

      if (ano) {
        query = query.eq("ano", ano);
      }
    }

    const { data, error } = await query.order("criado_em", {
      ascending: false,
    });

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error("Erro ao buscar descontos:", error);
    throw error;
  }
}

export async function criarDesconto(
  desconto: Omit<Desconto, "id" | "criado_em" | "atualizado_em">,
): Promise<Desconto> {
  try {
    const { data, error } = await supabase
      .from("descontos")
      .insert([desconto])
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error("Erro ao criar desconto:", error);
    throw error;
  }
}

export async function atualizarDesconto(
  id: string,
  desconto: Partial<Desconto>,
): Promise<Desconto> {
  try {
    const { data, error } = await supabase
      .from("descontos")
      .update(desconto)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error("Erro ao atualizar desconto:", error);
    throw error;
  }
}

export async function deletarDesconto(id: string): Promise<void> {
  try {
    const { error } = await supabase.from("descontos").delete().eq("id", id);

    if (error) throw error;
  } catch (error) {
    console.error("Erro ao deletar desconto:", error);
    throw error;
  }
}

// =====================================================
// BONIFICAÇÕES
// =====================================================

export async function getBonificacoes(
  funcionarioId?: string,
  mes?: number,
  ano?: number,
  dataInicio?: string,
  dataFim?: string,
): Promise<Bonificacao[]> {
  try {
    let query = supabase.from("bonificacoes").select("*");

    if (funcionarioId) {
      query = query.eq("funcionario_id", funcionarioId);
    }

    if (dataInicio && dataFim) {
      const ranges = buildMesAnoRange(dataInicio, dataFim);

      query = applyMesAnoOr(query, ranges);
    } else {
      if (mes) {
        query = query.eq("mes", mes);
      }

      if (ano) {
        query = query.eq("ano", ano);
      }
    }

    const { data, error } = await query.order("criado_em", {
      ascending: false,
    });

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error("Erro ao buscar bonificações:", error);
    throw error;
  }
}

export async function criarBonificacao(
  bonificacao: Omit<Bonificacao, "id" | "criado_em" | "atualizado_em">,
): Promise<Bonificacao> {
  try {
    const { data, error } = await supabase
      .from("bonificacoes")
      .insert([bonificacao])
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error("Erro ao criar bonificação:", error);
    throw error;
  }
}

export async function atualizarBonificacao(
  id: string,
  bonificacao: Partial<Bonificacao>,
): Promise<Bonificacao> {
  try {
    const { data, error } = await supabase
      .from("bonificacoes")
      .update(bonificacao)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error("Erro ao atualizar bonificação:", error);
    throw error;
  }
}

export async function deletarBonificacao(id: string): Promise<void> {
  try {
    const { error } = await supabase.from("bonificacoes").delete().eq("id", id);

    if (error) throw error;
  } catch (error) {
    console.error("Erro ao deletar bonificação:", error);
    throw error;
  }
}

// =====================================================
// HISTÓRICO FINANCEIRO DO FUNCIONÁRIO
// =====================================================

export interface HistoricoFuncionario {
  funcionario_id: string;
  mes: number;
  ano: number;
  salario_base: number;
  comissoes_total: number;
  comissoes_count: number;
  descontos_total: number;
  descontos_count: number;
  bonificacoes_total: number;
  bonificacoes_count: number;
  vales_total: number;
  vales_count: number;
  total_ganhos: number;
  total_descontos: number;
  liquido: number;
}

export async function getHistoricoFuncionario(
  funcionarioId: string,
  mes?: number,
  ano?: number,
): Promise<HistoricoFuncionario | null> {
  try {
    const currentYear = ano || new Date().getFullYear();
    const currentMonth = mes || new Date().getMonth() + 1;

    const [folhas, comissoes, descontos, bonificacoes, vales] =
      await Promise.all([
        getFolhasSalariais(currentMonth, currentYear),
        getComissoes(funcionarioId, currentMonth, currentYear),
        getDescontos(funcionarioId, currentMonth, currentYear),
        getBonificacoes(funcionarioId, currentMonth, currentYear),
        getValesFuncionario(funcionarioId),
      ]);

    const folha = folhas.find((f) => f.funcionario_id === funcionarioId);

    const comissoesTotal = comissoes.reduce<number>(
      (acc, c) => acc + (c.valor || 0),
      0,
    );
    const descontosTotal = descontos.reduce<number>(
      (acc, d) => acc + (d.valor || 0),
      0,
    );
    const bonificacoesTotal = bonificacoes.reduce<number>(
      (acc, b) => acc + (b.valor || 0),
      0,
    );
    const valesTotal = vales.reduce<number>(
      (acc, v) => acc + (v.valor || 0),
      0,
    );

    const totalGanhos =
      (folha?.salario_base || 0) + comissoesTotal + bonificacoesTotal;
    const totalDescontos = descontosTotal + valesTotal;
    const liquido = totalGanhos - totalDescontos;

    return {
      funcionario_id: funcionarioId,
      mes: currentMonth,
      ano: currentYear,
      salario_base: folha?.salario_base || 0,
      comissoes_total: comissoesTotal,
      comissoes_count: comissoes.length,
      descontos_total: descontosTotal,
      descontos_count: descontos.length,
      bonificacoes_total: bonificacoesTotal,
      bonificacoes_count: bonificacoes.length,
      vales_total: valesTotal,
      vales_count: vales.length,
      total_ganhos: totalGanhos,
      total_descontos: totalDescontos,
      liquido,
    };
  } catch (error) {
    console.error("Erro ao buscar histórico do funcionário:", error);
    throw error;
  }
}

// =====================================================
// CENTRO DE CUSTOS
// =====================================================

export async function getCentroCustosTodos(
  mes?: number,
  ano?: number,
  dataInicio?: string,
  dataFim?: string,
): Promise<CentroCusto[]> {
  try {
    let query = supabase.from("centro_custos").select(
      `
        *,
        loja:lojas(nome)
      `,
    );

    if (dataInicio && dataFim) {
      const ranges = buildMesAnoRange(dataInicio, dataFim);

      query = applyMesAnoOr(query, ranges);
    } else {
      if (mes) {
        query = query.eq("mes", mes);
      }

      if (ano) {
        query = query.eq("ano", ano);
      }
    }

    const { data, error } = await query.order("criado_em", {
      ascending: false,
    });

    if (error) throw error;

    return (data || []).map((item: any) => ({
      ...item,
      loja_nome: item.loja?.nome || "Desconhecida",
    }));
  } catch (error) {
    console.error("Erro ao buscar centro de custos:", error);
    throw error;
  }
}

export async function getCentroCustosLoja(
  lojaId: number,
  mes?: number,
  ano?: number,
  dataInicio?: string,
  dataFim?: string,
): Promise<CentroCusto[]> {
  try {
    let query = supabase
      .from("centro_custos")
      .select(
        `
        *,
        loja:lojas(nome)
      `,
      )
      .eq("loja_id", lojaId);

    if (dataInicio && dataFim) {
      const ranges = buildMesAnoRange(dataInicio, dataFim);

      query = applyMesAnoOr(query, ranges);
    } else {
      if (mes) {
        query = query.eq("mes", mes);
      }

      if (ano) {
        query = query.eq("ano", ano);
      }
    }

    const { data, error } = await query.order("criado_em", {
      ascending: false,
    });

    if (error) throw error;

    // Mapear os dados para incluir o nome da loja
    return (data || []).map((item: any) => ({
      ...item,
      loja_nome: item.loja?.nome || "Desconhecida",
    }));
  } catch (error) {
    console.error("Erro ao buscar centro de custos:", error);
    throw error;
  }
}

export async function criarCentroCusto(
  custo: Omit<CentroCusto, "id" | "criado_em" | "atualizado_em">,
): Promise<CentroCusto> {
  try {
    const { data, error } = await supabase
      .from("centro_custos")
      .insert([custo])
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error("Erro ao criar centro de custo:", error);
    throw error;
  }
}

export async function atualizarCentroCusto(
  id: string,
  custo: Partial<CentroCusto>,
): Promise<CentroCusto> {
  try {
    const { data, error } = await supabase
      .from("centro_custos")
      .update(custo)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error("Erro ao atualizar centro de custo:", error);
    throw error;
  }
}

export async function deletarCentroCusto(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from("centro_custos")
      .delete()
      .eq("id", id);

    if (error) throw error;
  } catch (error) {
    console.error("Erro ao deletar centro de custo:", error);
    throw error;
  }
}

export async function getAnaliseComPorTipo(
  lojaId: number,
  mes?: number,
  ano?: number,
  dataInicio?: string,
  dataFim?: string,
): Promise<AnaliseCustoPorTipo[]> {
  try {
    const custos = await getCentroCustosLoja(
      lojaId,
      mes,
      ano,
      dataInicio,
      dataFim,
    );

    const analise = new Map<
      string,
      { total: number; quantidade: number; valores: number[] }
    >();

    custos.forEach((custo) => {
      const tipo = custo.tipo;
      const existing = analise.get(tipo) || {
        total: 0,
        quantidade: 0,
        valores: [],
      };

      existing.total += custo.valor;
      existing.quantidade += 1;
      existing.valores.push(custo.valor);
      analise.set(tipo, existing);
    });

    const totalGeral = custos.reduce<number>((acc, c) => acc + c.valor, 0);

    return Array.from(analise.entries()).map(([tipo, data]) => ({
      tipo,
      total: data.total,
      quantidade: data.quantidade,
      percentual: totalGeral > 0 ? (data.total / totalGeral) * 100 : 0,
      media: data.valores.length > 0 ? data.total / data.quantidade : 0,
    }));
  } catch (error) {
    console.error("Erro ao calcular análise por tipo:", error);
    throw error;
  }
}

export async function getAnaliseCustoPorLoja(
  mes?: number,
  ano?: number,
  dataInicio?: string,
  dataFim?: string,
): Promise<AnaliseCustoPorLoja[]> {
  try {
    let query = supabase.from("centro_custos").select(`
        *,
        loja:lojas(id, nome)
      `);

    if (dataInicio && dataFim) {
      const ranges = buildMesAnoRange(dataInicio, dataFim);

      query = applyMesAnoOr(query, ranges);
    } else {
      if (mes) {
        query = query.eq("mes", mes);
      }

      if (ano) {
        query = query.eq("ano", ano);
      }
    }

    const { data: custos, error } = await query;

    if (error) throw error;

    const analise = new Map<
      number,
      { total: number; quantidade: number; valores: number[]; nome: string }
    >();

    (custos || []).forEach((custo: any) => {
      const lojaId = custo.loja_id;
      const existing = analise.get(lojaId) || {
        total: 0,
        quantidade: 0,
        valores: [] as number[],
        nome: custo.loja?.nome || "Desconhecida",
      };

      existing.total += custo.valor;
      existing.quantidade += 1;
      existing.valores.push(custo.valor);
      analise.set(lojaId, existing);
    });

    const totalGeral = (custos || []).reduce<number>(
      (acc, c: any) => acc + c.valor,
      0,
    );

    return Array.from(analise.entries()).map(([lojaId, data]) => ({
      loja_id: lojaId,
      loja_nome: data.nome,
      total: data.total,
      quantidade: data.quantidade,
      percentual: totalGeral > 0 ? (data.total / totalGeral) * 100 : 0,
      media: data.valores.length > 0 ? data.total / data.quantidade : 0,
    }));
  } catch (error) {
    console.error("Erro ao calcular análise por loja:", error);
    throw error;
  }
}

export async function getAnaliseComparativa(
  lojaId: number,
  mesAtual: number,
  anoAtual: number,
): Promise<AnaliseComparativa> {
  try {
    // Calcular período anterior
    let mesAnterior = mesAtual - 1;
    let anoAnterior = anoAtual;

    if (mesAnterior < 1) {
      mesAnterior = 12;
      anoAnterior--;
    }

    const custosAtual = await getCentroCustosLoja(lojaId, mesAtual, anoAtual);
    const custosAnterior = await getCentroCustosLoja(
      lojaId,
      mesAnterior,
      anoAnterior,
    );

    const totalAtual = custosAtual.reduce<number>((acc, c) => acc + c.valor, 0);
    const totalAnterior = custosAnterior.reduce<number>(
      (acc, c) => acc + c.valor,
      0,
    );

    const variacao = totalAtual - totalAnterior;
    const percentualVariacao =
      totalAnterior > 0 ? (variacao / totalAnterior) * 100 : 0;

    return {
      periodo_anterior: {
        mes: mesAnterior,
        ano: anoAnterior,
        total: totalAnterior,
      },
      periodo_atual: {
        mes: mesAtual,
        ano: anoAtual,
        total: totalAtual,
      },
      variacao,
      percentual_variacao: percentualVariacao,
    };
  } catch (error) {
    console.error("Erro ao calcular análise comparativa:", error);
    throw error;
  }
}

// =====================================================
// RELATÓRIOS GERENCIAIS (Cálculos)
// =====================================================

export async function getResumoFinanceiro(
  mes: number,
  ano: number,
  lojaId?: number,
  dataInicio?: string,
  dataFim?: string,
) {
  try {
    const folhas = await getFolhasSalariais(
      mes,
      ano,
      lojaId,
      dataInicio,
      dataFim,
    );
    const contas = lojaId
      ? await getContasLoja(lojaId, undefined, mes, ano, dataInicio, dataFim)
      : (
          await supabase
            .from("contas_lojas")
            .select("*")
            .gte("data_vencimento", dataInicio || "0001-01-01")
            .lte("data_vencimento", dataFim || "9999-12-31")
        ).data || [];
    const impostos = await getImpostosConta(
      undefined,
      undefined,
      lojaId,
      mes,
      ano,
      dataInicio,
      dataFim,
    );
    const retiradas = await getRetiradasPessoais(
      undefined,
      mes,
      ano,
      dataInicio,
      dataFim,
    );
    const vales = await getValesFuncionario(
      undefined,
      undefined,
      mes,
      ano,
      dataInicio,
      dataFim,
    );
    const contasFornecedor = await getContasFornecedor(
      undefined,
      undefined,
      mes,
      ano,
      dataInicio,
      dataFim,
    );

    const totalFolhas = folhas.reduce<number>(
      (acc, f) => acc + (f.total_liquido || 0),
      0,
    );
    const totalContas = contas.reduce<number>(
      (acc, c: any) => acc + (c.valor || 0),
      0,
    );
    const totalImpostos = impostos.reduce<number>(
      (acc, i) => acc + (i.valor || 0),
      0,
    );
    const totalRetiradas = retiradas.reduce<number>(
      (acc, r) => acc + (r.valor || 0),
      0,
    );
    const totalVales = vales.reduce<number>(
      (acc, v) => acc + (v.valor || 0),
      0,
    );
    const totalFornecedores = contasFornecedor.reduce<number>(
      (acc, c) => acc + (c.valor || 0),
      0,
    );

    return {
      periodo:
        dataInicio && dataFim
          ? `${dataInicio.split("-").reverse().join("/")} - ${dataFim.split("-").reverse().join("/")}`
          : `${String(mes).padStart(2, "0")}/${ano}`,
      totalFolhas,
      totalContas,
      totalImpostos,
      totalRetiradas,
      totalVales,
      totalFornecedores,
      totalDespesas:
        totalFolhas +
        totalContas +
        totalImpostos +
        totalRetiradas +
        totalVales +
        totalFornecedores,
      folhas: folhas.length,
      contasPagas: contas.filter((c: any) => c.status === "paga").length,
      contasAberta: contas.filter((c: any) => c.status === "aberta").length,
      impostosPagos: impostos.filter((i: ImpostoConta) => i.status === "paga")
        .length,
      impostosAbertos: impostos.filter(
        (i: ImpostoConta) => i.status === "aberta",
      ).length,
    };
  } catch (error) {
    console.error("Erro ao calcular resumo financeiro:", error);
    throw error;
  }
}

// =====================================================
// RELATÓRIOS GERENCIAIS - FUNCIONALIDADES AVANÇADAS
// =====================================================

/**
 * Calcula o lucro líquido real com todas as despesas descontadas
 */
export async function getLucroLiquidoReal(
  mes: number,
  ano: number,
  lojaId?: number,
): Promise<LucroLiquidoReal> {
  try {
    const folhas = await getFolhasSalariais(mes, ano, lojaId);
    const contas = lojaId
      ? await getContasLoja(lojaId)
      : (await supabase.from("contas_lojas").select("*")).data || [];
    const impostos = await getImpostosConta(undefined, undefined, lojaId);
    const centrosCustos = lojaId
      ? await getCentroCustosLoja(lojaId, mes, ano)
      : [];
    const vales = await getValesFuncionario();
    const retiradas = await getRetiradasPessoais();

    const folha = folhas.reduce(
      (acc: number, f: FolhaSalarial) => acc + (f.total_liquido || 0),
      0,
    );
    const contasVal = contas.reduce(
      (acc: number, c: any) => acc + (c.valor || 0),
      0,
    );
    const imposValue = impostos.reduce(
      (acc: number, i: ImpostoConta) => acc + (i.valor || 0),
      0,
    );
    const custosValue = centrosCustos.reduce(
      (acc: number, c: CentroCusto) => acc + c.valor,
      0,
    );
    const valesValue = vales.reduce(
      (acc: number, v: ValeFuncionario) => acc + v.valor,
      0,
    );
    const retiradasValue = retiradas.reduce(
      (acc: number, r: RetiradaPessoal) => acc + r.valor,
      0,
    );

    const totalDespesas =
      folha +
      contasVal +
      imposValue +
      custosValue +
      valesValue +
      retiradasValue;
    const receita = 0; // TODO: Integrar com tabela de vendas quando disponível
    const lucroLiquido = receita - totalDespesas;
    const margemLiquida = receita > 0 ? (lucroLiquido / receita) * 100 : 0;

    return {
      periodo: `${String(mes).padStart(2, "0")}/${ano}`,
      receita_total: receita,
      total_despesas: totalDespesas,
      folha_pagamento: folha,
      impostos: imposValue,
      custos_operacionais: custosValue,
      outras_despesas: contasVal + valesValue + retiradasValue,
      lucro_liquido: lucroLiquido,
      margem_liquida: margemLiquida,
    };
  } catch (error) {
    console.error("Erro ao calcular lucro líquido real:", error);
    throw error;
  }
}

/**
 * Comparativo de despesas mês a mês
 */
export async function getComparativoMensal(
  lojaId: number,
  quantidadeMeses: number = 6,
): Promise<ComparativoMensal[]> {
  try {
    const comparativos: ComparativoMensal[] = [];
    const hoje = new Date();
    let mes = hoje.getMonth() + 1;
    let ano = hoje.getFullYear();

    for (let i = 0; i < quantidadeMeses; i++) {
      const folhas = await getFolhasSalariais(mes, ano, lojaId);
      const contas = await getContasLoja(lojaId);
      const impostos = await getImpostosConta(undefined, undefined, lojaId);
      const custos = await getCentroCustosLoja(lojaId, mes, ano);
      const vales = await getValesFuncionario();
      const retiradas = await getRetiradasPessoais();

      const totalFolhas = folhas.reduce(
        (acc: number, f: FolhaSalarial) => acc + (f.total_liquido || 0),
        0,
      );
      const totalContas = contas.reduce(
        (acc: number, c: any) => acc + (c.valor || 0),
        0,
      );
      const totalImpostos = impostos.reduce(
        (acc: number, i: ImpostoConta) => acc + (i.valor || 0),
        0,
      );
      const totalCustos = custos.reduce(
        (acc: number, c: CentroCusto) => acc + c.valor,
        0,
      );
      const totalVales = vales.reduce(
        (acc: number, v: ValeFuncionario) => acc + v.valor,
        0,
      );
      const totalRetiradas = retiradas.reduce(
        (acc: number, r: RetiradaPessoal) => acc + r.valor,
        0,
      );

      comparativos.push({
        mes_ano: `${String(mes).padStart(2, "0")}/${ano}`,
        folha_pagamento: totalFolhas,
        impostos: totalImpostos,
        custos: totalCustos,
        contas_despesas: totalContas,
        vales: totalVales,
        retiradas: totalRetiradas,
        total_despesas:
          totalFolhas +
          totalImpostos +
          totalCustos +
          totalContas +
          totalVales +
          totalRetiradas,
      });

      mes--;
      if (mes < 1) {
        mes = 12;
        ano--;
      }
    }

    return comparativos.reverse();
  } catch (error) {
    console.error("Erro ao calcular comparativo mensal:", error);
    throw error;
  }
}

/**
 * Análise de crescimento/queda de período para período
 */
export async function getAnaliseGrowth(
  lojaId: number,
  quantidadeMeses: number = 12,
): Promise<GrowthAnalysis[]> {
  try {
    const comparativos = await getComparativoMensal(lojaId, quantidadeMeses);
    const growth: GrowthAnalysis[] = [];

    for (let i = 1; i < comparativos.length; i++) {
      const anterior = comparativos[i - 1].total_despesas;
      const atual = comparativos[i].total_despesas;
      const variacao = atual - anterior;
      const percentual = anterior > 0 ? (variacao / anterior) * 100 : 0;

      growth.push({
        periodo: comparativos[i].mes_ano,
        valor_anterior: anterior,
        valor_atual: atual,
        variacao_absoluta: variacao,
        variacao_percentual: Math.round(percentual * 100) / 100,
        tendencia:
          variacao > 5 ? "crescimento" : variacao < -5 ? "queda" : "estavel",
      });
    }

    return growth;
  } catch (error) {
    console.error("Erro ao calcular análise de growth:", error);
    throw error;
  }
}

/**
 * Calcula margens de lucro por vendedor (baseado em comissões)
 */
export async function getMargensPorVendedor(
  mes: number,
  ano: number,
): Promise<MargeLucroVendedor[]> {
  try {
    const { data: comissoes } = await supabase
      .from("comissoes")
      .select("*, funcionario_id")
      .eq("mes", mes)
      .eq("ano", ano);

    const { data: descontos } = await supabase
      .from("descontos")
      .select("*, funcionario_id")
      .eq("mes", mes)
      .eq("ano", ano);

    const { data: bonificacoes } = await supabase
      .from("bonificacoes")
      .select("*, funcionario_id")
      .eq("mes", mes)
      .eq("ano", ano);

    const vendedores = new Map<string, MargeLucroVendedor>();

    // Processa Comissões
    (comissoes || []).forEach((c: any) => {
      const key = `${c.funcionario_id}`;
      const vendedor = vendedores.get(key) || {
        vendedor_nome: `Vendedor ${c.funcionario_id}`,
        comissoes: 0,
        bonificacoes: 0,
        descontos: 0,
        valor_ganhos: 0,
        taxa_custos: 0,
      };

      vendedor.comissoes += c.valor || 0;
      vendedor.valor_ganhos += c.valor || 0;
      vendedores.set(key, vendedor);
    });

    // Processa Bonificações
    (bonificacoes || []).forEach((b: any) => {
      const key = `${b.funcionario_id}`;
      const vendedor = vendedores.get(key) || {
        vendedor_nome: `Vendedor ${b.funcionario_id}`,
        comissoes: 0,
        bonificacoes: 0,
        descontos: 0,
        valor_ganhos: 0,
        taxa_custos: 0,
      };

      vendedor.bonificacoes += b.valor || 0;
      vendedor.valor_ganhos += b.valor || 0;
      vendedores.set(key, vendedor);
    });

    // Processa Descontos
    (descontos || []).forEach((d: any) => {
      const key = `${d.funcionario_id}`;
      const vendedor = vendedores.get(key) || {
        vendedor_nome: `Vendedor ${d.funcionario_id}`,
        comissoes: 0,
        bonificacoes: 0,
        descontos: 0,
        valor_ganhos: 0,
        taxa_custos: 0,
      };

      vendedor.descontos += d.valor || 0;
      vendedor.valor_ganhos -= d.valor || 0;
      vendedores.set(key, vendedor);
    });

    // Calcula taxa de custos (aproximado)
    const totalGanhos = Array.from(vendedores.values()).reduce(
      (acc: number, v: MargeLucroVendedor) => acc + v.valor_ganhos,
      0,
    );

    if (totalGanhos > 0) {
      Array.from(vendedores.values()).forEach((v: MargeLucroVendedor) => {
        v.taxa_custos =
          Math.round((v.valor_ganhos / totalGanhos) * 10000) / 100;
      });
    }

    return Array.from(vendedores.values());
  } catch (error) {
    console.error("Erro ao calcular margens por vendedor:", error);
    throw error;
  }
}

/**
 * Retorna relatório completo consolidado
 */
export async function getRelatorioCompleto(
  mes: number,
  ano: number,
  lojaId: number,
): Promise<ResumoRelatorio> {
  try {
    const lucroLiquido = await getLucroLiquidoReal(mes, ano, lojaId);
    const comparativos = await getComparativoMensal(lojaId, 6);
    const crescimento = await getAnaliseGrowth(lojaId, 6);

    return {
      periodo: `${String(mes).padStart(2, "0")}/${ano}`,
      lucro_liquido: lucroLiquido,
      comparativos,
      crescimento,
    };
  } catch (error) {
    console.error("Erro ao gerar relatório completo:", error);
    throw error;
  }
}
