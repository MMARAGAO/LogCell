import { supabase } from "@/lib/supabaseClient";
import { Produto, ProdutoCompleto } from "@/types";

/**
 * Serviço para gerenciamento de produtos
 */

// Buscar todos os produtos
export async function getProdutos(filtros?: {
  ativo?: boolean;
  busca?: string;
}): Promise<Produto[]> {
  try {
    let query = supabase
      .from("produtos")
      .select("*")
      .order("descricao", { ascending: true });

    // Filtrar por status ativo/inativo
    if (filtros?.ativo !== undefined) {
      query = query.eq("ativo", filtros.ativo);
    }

    // Busca por descrição, modelos ou marca
    if (filtros?.busca) {
      query = query.or(
        `descricao.ilike.%${filtros.busca}%,modelos.ilike.%${filtros.busca}%,marca.ilike.%${filtros.busca}%`
      );
    }

    const { data, error } = await query;

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error("Erro ao buscar produtos:", error);
    throw error;
  }
}

// Buscar produto por ID com detalhes completos
export async function getProdutoById(
  id: string
): Promise<ProdutoCompleto | null> {
  try {
    const { data, error } = await supabase
      .from("produtos")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error("Erro ao buscar produto:", error);
    throw error;
  }
}

// Criar novo produto
export async function criarProduto(
  produto: Omit<Produto, "id" | "criado_em" | "atualizado_em">,
  usuarioId: string
): Promise<Produto> {
  try {
    const { data, error } = await supabase
      .from("produtos")
      .insert({
        ...produto,
        criado_por: usuarioId,
      })
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error("Erro ao criar produto:", error);
    throw error;
  }
}

// Atualizar produto
export async function atualizarProduto(
  id: string,
  produto: Partial<
    Omit<
      Produto,
      "id" | "criado_em" | "atualizado_em" | "criado_por" | "atualizado_por"
    >
  >,
  usuarioId?: string
): Promise<Produto> {
  try {
    // Adicionar atualizado_por se o usuário for fornecido
    const dadosAtualizacao = usuarioId
      ? { ...produto, atualizado_por: usuarioId }
      : produto;

    const { data, error } = await supabase
      .from("produtos")
      .update(dadosAtualizacao)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Erro do Supabase:", error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Erro ao atualizar produto:", error);
    throw error;
  }
}

// Deletar produto
export async function deletarProduto(id: string): Promise<void> {
  try {
    const { error } = await supabase.from("produtos").delete().eq("id", id);

    if (error) throw error;
  } catch (error) {
    console.error("Erro ao deletar produto:", error);
    throw error;
  }
}

// Ativar/Desativar produto
export async function toggleAtivoProduto(
  id: string,
  ativo: boolean,
  usuarioId?: string
): Promise<Produto> {
  try {
    // Adicionar atualizado_por se o usuário for fornecido
    const dadosAtualizacao = usuarioId
      ? { ativo, atualizado_por: usuarioId }
      : { ativo };

    const { data, error } = await supabase
      .from("produtos")
      .update(dadosAtualizacao)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error("Erro ao ativar/desativar produto:", error);
    throw error;
  }
}

// Estatísticas de produtos
export async function getEstatisticasProdutos() {
  try {
    const [totalProdutos, produtosAtivos, produtosInativos] = await Promise.all(
      [
        supabase.from("produtos").select("id", { count: "exact", head: true }),
        supabase
          .from("produtos")
          .select("id", { count: "exact", head: true })
          .eq("ativo", true),
        supabase
          .from("produtos")
          .select("id", { count: "exact", head: true })
          .eq("ativo", false),
      ]
    );

    return {
      total: totalProdutos.count || 0,
      ativos: produtosAtivos.count || 0,
      inativos: produtosInativos.count || 0,
    };
  } catch (error) {
    console.error("Erro ao buscar estatísticas de produtos:", error);
    throw error;
  }
}

// Estatísticas financeiras e de estoque
export async function getEstatisticasFinanceiras() {
  try {
    // Buscar todos os produtos com preços
    const { data: produtos, error: produtosError } = await supabase
      .from("produtos")
      .select("id, preco_compra, preco_venda, quantidade_minima, ativo");

    if (produtosError) throw produtosError;

    // Buscar todos os estoques
    const { data: estoques, error: estoquesError } = await supabase
      .from("estoque_lojas")
      .select("id_produto, quantidade");

    if (estoquesError) throw estoquesError;

    // Criar mapa de quantidades por produto
    const estoqueMap = new Map<string, number>();
    estoques?.forEach((est) => {
      const atual = estoqueMap.get(est.id_produto) || 0;
      estoqueMap.set(est.id_produto, atual + est.quantidade);
    });

    // Calcular estatísticas
    let valorTotalCompra = 0;
    let valorTotalVenda = 0;
    let valorEstoqueCompra = 0;
    let valorEstoqueVenda = 0;
    let quantidadeTotal = 0;
    let produtosEstoqueBaixo = 0;
    let produtosSemEstoque = 0;

    produtos?.forEach((produto) => {
      const quantidade = estoqueMap.get(produto.id) || 0;
      const precoCompra = produto.preco_compra || 0;
      const precoVenda = produto.preco_venda || 0;
      const quantidadeMinima = produto.quantidade_minima || 0;

      // Somar valores totais (de todos os produtos)
      if (produto.ativo) {
        valorTotalCompra += precoCompra;
        valorTotalVenda += precoVenda;
      }

      // Valores considerando estoque
      valorEstoqueCompra += precoCompra * quantidade;
      valorEstoqueVenda += precoVenda * quantidade;
      quantidadeTotal += quantidade;

      // Produtos com estoque baixo ou zerado
      if (produto.ativo) {
        if (quantidade === 0) {
          produtosSemEstoque++;
        } else if (quantidade < quantidadeMinima && quantidadeMinima > 0) {
          produtosEstoqueBaixo++;
        }
      }
    });

    return {
      valorTotalCompra,
      valorTotalVenda,
      valorEstoqueCompra,
      valorEstoqueVenda,
      margemLucro:
        valorEstoqueVenda > 0
          ? ((valorEstoqueVenda - valorEstoqueCompra) / valorEstoqueVenda) * 100
          : 0,
      quantidadeTotal,
      produtosEstoqueBaixo,
      produtosSemEstoque,
    };
  } catch (error) {
    console.error("Erro ao buscar estatísticas financeiras:", error);
    throw error;
  }
}
