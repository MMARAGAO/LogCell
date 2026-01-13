import { supabase } from "@/lib/supabaseClient";
import { ProdutoCatalogo, AparelhoCatalogo, ItemCatalogo } from "@/types/catalogo";

/**
 * Serviço para gerenciar o catálogo de produtos e aparelhos
 */

interface FiltrosCatalogo {
  busca?: string;
  categoria?: string;
  marca?: string;
  preco_min?: number;
  preco_max?: number;
  pagina?: number;
  limite?: number;
  ordenar_por?: "nome" | "preco" | "novidade" | "destaque";
  ordem?: "asc" | "desc";
}

/**
 * Buscar produtos do catálogo (apenas os que têm exibir_catalogo = true)
 */
export async function buscarProdutosCatalogo(
  filtros?: FiltrosCatalogo
): Promise<{ produtos: ProdutoCatalogo[]; total: number }> {
  try {
    const {
      busca = "",
      categoria = "",
      marca = "",
      preco_min = 0,
      preco_max = Number.MAX_VALUE,
      pagina = 1,
      limite = 20,
      ordenar_por = "ordem_catalogo",
      ordem = "asc",
    } = filtros || {};

    // Query base - apenas produtos que devem ser exibidos no catálogo
    let query = supabase
      .from("produtos")
      .select(
        `
        *,
        fotos:fotos_produtos(id, url, nome_arquivo, is_principal),
        estoques:estoque_lojas(quantidade)
      `,
        { count: "exact" }
      )
      .eq("ativo", true)
      .eq("exibir_catalogo", true);

    // Aplicar filtros
    if (busca) {
      query = query.or(
        `descricao.ilike.%${busca}%,modelos.ilike.%${busca}%,marca.ilike.%${busca}%`
      );
    }

    if (categoria) {
      query = query.eq("categoria", categoria);
    }

    if (marca) {
      query = query.eq("marca", marca);
    }

    // Filtrar por preço (feito no cliente após busca, pois não há range queries simples)
    // Os preços serão filtrados após a busca

    // Ordenação
    const mapaOrdenacao: Record<string, string> = {
      nome: "descricao",
      preco: "preco_venda",
      novidade: "novidade",
      destaque: "destaque",
      ordem_catalogo: "ordem_catalogo",
    };

    const campoOrdenacao = mapaOrdenacao[ordenar_por] || "ordem_catalogo";
    query = query.order(campoOrdenacao, { ascending: ordem === "asc" });

    // Paginação
    const offset = (pagina - 1) * limite;
    query = query.range(offset, offset + limite - 1);

    const { data, error, count } = await query;

    if (error) throw error;

    // Mapear os dados para o tipo ProdutoCatalogo e calcular quantidade total em estoque
    const produtos: ProdutoCatalogo[] = (data || []).map((produto: any) => {
      const quantidade_disponivel = (produto.estoques || []).reduce(
        (acc: number, estoque: any) => acc + (estoque.quantidade || 0),
        0
      );

      return {
        ...produto,
        quantidade_disponivel,
        fotos: produto.fotos || [],
      };
    });

    // Filtrar por preço no cliente (após busca)
    const produtosFiltrados = produtos.filter(
      (p) =>
        (p.preco_venda || 0) >= preco_min &&
        (p.preco_venda || 0) <= preco_max
    );

    return {
      produtos: produtosFiltrados,
      total: count || 0,
    };
  } catch (erro) {
    console.error("Erro ao buscar produtos do catálogo:", erro);
    throw erro;
  }
}

/**
 * Buscar um produto específico do catálogo por ID
 */
export async function buscarProdutoCatalogoPorId(
  produtoId: string
): Promise<ProdutoCatalogo | null> {
  try {
    const { data, error } = await supabase
      .from("produtos")
      .select(
        `
        *,
        fotos:fotos_produtos(id, url, nome_arquivo, is_principal),
        estoques:estoque_lojas(quantidade)
      `
      )
      .eq("id", produtoId)
      .eq("exibir_catalogo", true)
      .single();

    if (error) throw error;

    if (!data) return null;

    const quantidade_disponivel = (data.estoques || []).reduce(
      (acc: number, estoque: any) => acc + (estoque.quantidade || 0),
      0
    );

    return {
      ...data,
      quantidade_disponivel,
      fotos: data.fotos || [],
    };
  } catch (erro) {
    console.error("Erro ao buscar produto do catálogo:", erro);
    return null;
  }
}

/**
 * Buscar categorias disponíveis no catálogo
 */
export async function buscarCategoriasCatalogo(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from("produtos")
      .select("categoria", { count: "exact" })
      .eq("ativo", true)
      .eq("exibir_catalogo", true)
      .not("categoria", "is", null);

    if (error) throw error;

    // Eliminar duplicatas usando Set
    const categorias = Array.from(
      new Set(
        (data || [])
          .map((item: any) => item.categoria)
          .filter((cat: any) => cat && cat.trim())
      )
    ) as string[];

    return categorias.sort();
  } catch (erro) {
    console.error("Erro ao buscar categorias:", erro);
    return [];
  }
}

/**
 * Buscar marcas disponíveis no catálogo
 */
export async function buscarMarcasCatalogo(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from("produtos")
      .select("marca", { count: "exact" })
      .eq("ativo", true)
      .eq("exibir_catalogo", true)
      .not("marca", "is", null);

    if (error) throw error;

    // Eliminar duplicatas usando Set
    const marcas = Array.from(
      new Set(
        (data || [])
          .map((item: any) => item.marca)
          .filter((marca: any) => marca && marca.trim())
      )
    ) as string[];

    return marcas.sort();
  } catch (erro) {
    console.error("Erro ao buscar marcas:", erro);
    return [];
  }
}

/**
 * Buscar produtos em destaque
 */
export async function buscarProdutosDestaque(
  limite: number = 10
): Promise<ProdutoCatalogo[]> {
  try {
    const { data, error } = await supabase
      .from("produtos")
      .select(
        `
        *,
        fotos:fotos_produtos(id, url, nome_arquivo, is_principal),
        estoques:estoque_lojas(quantidade)
      `
      )
      .eq("ativo", true)
      .eq("exibir_catalogo", true)
      .eq("destaque", true)
      .order("ordem_catalogo", { ascending: true })
      .limit(limite);

    if (error) throw error;

    return (data || []).map((produto: any) => {
      const quantidade_disponivel = (produto.estoques || []).reduce(
        (acc: number, estoque: any) => acc + (estoque.quantidade || 0),
        0
      );

      return {
        ...produto,
        quantidade_disponivel,
        fotos: produto.fotos || [],
      };
    });
  } catch (erro) {
    console.error("Erro ao buscar produtos em destaque:", erro);
    return [];
  }
}

/**
 * Buscar novidades (produtos novos)
 */
export async function buscarNovidadesCatalogo(
  limite: number = 10
): Promise<ProdutoCatalogo[]> {
  try {
    const { data, error } = await supabase
      .from("produtos")
      .select(
        `
        *,
        fotos:fotos_produtos(id, url, nome_arquivo, is_principal),
        estoques:estoque_lojas(quantidade)
      `
      )
      .eq("ativo", true)
      .eq("exibir_catalogo", true)
      .eq("novidade", true)
      .order("criado_em", { ascending: false })
      .limit(limite);

    if (error) throw error;

    return (data || []).map((produto: any) => {
      const quantidade_disponivel = (produto.estoques || []).reduce(
        (acc: number, estoque: any) => acc + (estoque.quantidade || 0),
        0
      );

      return {
        ...produto,
        quantidade_disponivel,
        fotos: produto.fotos || [],
      };
    });
  } catch (erro) {
    console.error("Erro ao buscar novidades:", erro);
    return [];
  }
}

/**
 * Buscar aparelhos do catálogo
 */
export async function buscarAparelhosCatalogo(filtros?: {
  busca?: string;
  marca?: string;
  estado?: string;
  preco_min?: number;
  preco_max?: number;
  pagina?: number;
  limite?: number;
  ordenar_por?: "nome" | "preco" | "novidade" | "destaque";
  ordem?: "asc" | "desc";
}): Promise<{ aparelhos: AparelhoCatalogo[]; total: number }> {
  try {
    const {
      busca = "",
      marca = "",
      estado = "",
      preco_min = 0,
      preco_max = Number.MAX_VALUE,
      pagina = 1,
      limite = 20,
      ordenar_por = "ordem_catalogo",
      ordem = "asc",
    } = filtros || {};

    // Query base - apenas aparelhos disponíveis para catálogo
    let query = supabase
      .from("aparelhos")
      .select(
        `
        *,
        fotos:fotos_aparelhos(id, url, nome_arquivo, is_principal)
      `,
        { count: "exact" }
      )
      .eq("status", "disponivel")
      .eq("exibir_catalogo", true);

    // Aplicar filtros
    if (busca) {
      query = query.or(
        `marca.ilike.%${busca}%,modelo.ilike.%${busca}%,armazenamento.ilike.%${busca}%`
      );
    }

    if (marca) {
      query = query.eq("marca", marca);
    }

    if (estado) {
      query = query.eq("estado", estado);
    }

    // Ordenação
    const mapaOrdenacao: Record<string, string> = {
      nome: "modelo",
      preco: "valor_venda",
      novidade: "novidade",
      destaque: "destaque",
      ordem_catalogo: "ordem_catalogo",
    };

    const campoOrdenacao = mapaOrdenacao[ordenar_por] || "ordem_catalogo";
    query = query.order(campoOrdenacao, { ascending: ordem === "asc" });

    // Paginação
    const offset = (pagina - 1) * limite;
    query = query.range(offset, offset + limite - 1);

    const { data, error, count } = await query;

    if (error) throw error;

    // Mapear os dados
    const aparelhos: AparelhoCatalogo[] = (data || []).map((aparelho: any) => ({
      ...aparelho,
      fotos: aparelho.fotos || [],
    }));

    // Filtrar por preço no cliente
    const aparelhosFiltrados = aparelhos.filter(
      (a) =>
        (a.valor_venda || 0) >= preco_min &&
        (a.valor_venda || 0) <= preco_max
    );

    return {
      aparelhos: aparelhosFiltrados,
      total: count || 0,
    };
  } catch (erro) {
    console.error("Erro ao buscar aparelhos do catálogo:", erro);
    throw erro;
  }
}

/**
 * Buscar marcas de aparelhos disponíveis no catálogo
 */
export async function buscarMarcasAparelhos(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from("aparelhos")
      .select("marca", { count: "exact" })
      .eq("status", "disponivel")
      .eq("exibir_catalogo", true)
      .not("marca", "is", null);

    if (error) throw error;

    const marcas = Array.from(
      new Set(
        (data || [])
          .map((item: any) => item.marca)
          .filter((marca: any) => marca && marca.trim())
      )
    ) as string[];

    return marcas.sort();
  } catch (erro) {
    console.error("Erro ao buscar marcas de aparelhos:", erro);
    return [];
  }
}

/**
 * Buscar todos os itens do catálogo (produtos + aparelhos)
 */
export async function buscarItensCatalogo(filtros?: {
  busca?: string;
  tipo?: "todos" | "produtos" | "aparelhos";
  categoria?: string;
  marca?: string;
  preco_min?: number;
  preco_max?: number;
  pagina?: number;
  limite?: number;
  ordenar_por?: "nome" | "preco" | "novidade" | "destaque";
  ordem?: "asc" | "desc";
}): Promise<{ itens: ItemCatalogo[]; total: number }> {
  try {
    const tipo = filtros?.tipo || "todos";
    let todosProdutos: ProdutoCatalogo[] = [];
    let todosAparelhos: AparelhoCatalogo[] = [];

    // Buscar produtos se necessário
    if (tipo === "todos" || tipo === "produtos") {
      const { produtos } = await buscarProdutosCatalogo(filtros);
      todosProdutos = produtos;
    }

    // Buscar aparelhos se necessário
    if (tipo === "todos" || tipo === "aparelhos") {
      const { aparelhos } = await buscarAparelhosCatalogo(filtros);
      todosAparelhos = aparelhos;
    }

    // Combinar e mapear para ItemCatalogo
    const itens: ItemCatalogo[] = [
      ...todosProdutos.map((p): ItemCatalogo => ({ tipo: "produto", dados: p })),
      ...todosAparelhos.map((a): ItemCatalogo => ({ tipo: "aparelho", dados: a })),
    ];

    // Ordenar itens combinados
    if (filtros?.ordenar_por === "preco") {
      itens.sort((a, b) => {
        const precoA = a.tipo === "produto" ? (a.dados.preco_venda || 0) : (a.dados.valor_venda || 0);
        const precoB = b.tipo === "produto" ? (b.dados.preco_venda || 0) : (b.dados.valor_venda || 0);
        return filtros?.ordem === "desc" ? precoB - precoA : precoA - precoB;
      });
    }

    // Aplicar paginação no lado do cliente para itens combinados
    const pagina = filtros?.pagina || 1;
    const limite = filtros?.limite || 20;
    const offset = (pagina - 1) * limite;
    const itensPaginados = itens.slice(offset, offset + limite);

    return {
      itens: itensPaginados,
      total: itens.length,
    };
  } catch (erro) {
    console.error("Erro ao buscar itens do catálogo:", erro);
    return { itens: [], total: 0 };
  }
}

/**
 * Buscar produto por ID
 */
export async function buscarProdutoPorId(id: string): Promise<ProdutoCatalogo | null> {
  try {
    const { data, error } = await supabase
      .from("produtos")
      .select(
        `
        *,
        fotos:fotos_produtos(id, url, nome_arquivo, is_principal),
        estoques:estoque_lojas(quantidade)
      `
      )
      .eq("id", id)
      .eq("ativo", true)
      .single();

    if (error || !data) {
      return null;
    }

    // Processar fotos
    const fotos = (data.fotos || [])
      .sort((a: any, b: any) => (b.is_principal ? 1 : 0) - (a.is_principal ? 1 : 0))
      .map((f: any) => ({
        id: f.id,
        url: f.url,
        nome_arquivo: f.nome_arquivo,
        is_principal: f.is_principal,
      }));

    // Calcular quantidade disponível
    const quantidade_disponivel = (data.estoques || []).reduce(
      (total: number, estoque: any) => total + (estoque.quantidade || 0),
      0
    );

    return {
      ...data,
      fotos,
      quantidade_disponivel,
    } as ProdutoCatalogo;
  } catch (erro) {
    console.error("Erro ao buscar produto por ID:", erro);
    return null;
  }
}

/**
 * Buscar aparelho por ID
 */
export async function buscarAparelhoPorId(id: string): Promise<AparelhoCatalogo | null> {
  try {
    const { data, error } = await supabase
      .from("aparelhos")
      .select(
        `
        *,
        fotos:fotos_aparelhos(id, url, nome_arquivo, is_principal)
      `
      )
      .eq("id", id)
      .eq("status", "disponivel")
      .single();

    if (error || !data) {
      return null;
    }

    // Processar fotos
    const fotos = (data.fotos || [])
      .sort((a: any, b: any) => (b.is_principal ? 1 : 0) - (a.is_principal ? 1 : 0))
      .map((f: any) => ({
        id: f.id,
        url: f.url,
        nome_arquivo: f.nome_arquivo,
        is_principal: f.is_principal,
      }));

    return {
      ...data,
      fotos,
    } as AparelhoCatalogo;
  } catch (erro) {
    console.error("Erro ao buscar aparelho por ID:", erro);
    return null;
  }
}
