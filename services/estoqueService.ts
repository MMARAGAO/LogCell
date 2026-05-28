import { supabase } from "@/lib/supabaseClient";
import { EstoqueLoja, EstoqueLojaCompleto } from "@/types";

/**
 * Serviço para gerenciamento de estoque por loja
 */

// Buscar estoque de um produto em todas as lojas
export async function getEstoqueProduto(
  produtoId: string,
): Promise<EstoqueLojaCompleto[]> {
  try {
    const { data, error } = await supabase
      .from("estoque_lojas")
      .select(
        `
        *,
        produto:produtos(descricao, marca),
        loja:lojas(nome)
      `,
      )
      .eq("id_produto", produtoId)
      .order("quantidade", { ascending: false });

    if (error) throw error;

    return (data || []).map((item: any) => ({
      ...item,
      produto_descricao: item.produto?.descricao || "",
      produto_marca: item.produto?.marca || "",
      loja_nome: item.loja?.nome || "",
    }));
  } catch (error) {
    console.error("Erro ao buscar estoque do produto:", error);
    throw error;
  }
}

// Buscar estoque de uma loja
export async function getEstoqueLoja(
  lojaId: number,
): Promise<EstoqueLojaCompleto[]> {
  try {
    const { data, error } = await supabase
      .from("estoque_lojas")
      .select(
        `
        *,
        produto:produtos(descricao, marca, modelos),
        loja:lojas(nome)
      `,
      )
      .eq("id_loja", lojaId)
      .order("quantidade", { ascending: false });

    if (error) throw error;

    return (data || []).map((item: any) => ({
      ...item,
      produto_descricao: item.produto?.descricao || "",
      produto_marca: item.produto?.marca || "",
      loja_nome: item.loja?.nome || "",
    }));
  } catch (error) {
    console.error("Erro ao buscar estoque da loja:", error);
    throw error;
  }
}

// Buscar estoque de um produto em uma loja específica
export async function getEstoqueProdutoLoja(
  produtoId: string,
  lojaId: number,
): Promise<EstoqueLoja | null> {
  try {
    const { data, error } = await supabase
      .from("estoque_lojas")
      .select("*")
      .eq("id_produto", produtoId)
      .eq("id_loja", lojaId)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null; // Não encontrado
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Erro ao buscar estoque:", error);
    throw error;
  }
}

// Criar ou atualizar estoque de um produto em uma loja
export async function upsertEstoqueLoja(
  estoque: Omit<EstoqueLoja, "id" | "atualizado_em">,
  usuarioId: string,
): Promise<EstoqueLoja> {
  try {
    const { data, error } = await supabase
      .from("estoque_lojas")
      .upsert(
        {
          ...estoque,
          // NÃO preencher atualizado_por para permitir notificações
          // atualizado_por: usuarioId,
        },
        {
          onConflict: "id_produto,id_loja",
        },
      )
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error("Erro ao criar/atualizar estoque:", error);
    throw error;
  }
}

// Atualizar quantidade de estoque
export async function atualizarQuantidadeEstoque(
  produtoId: string,
  lojaId: number,
  quantidade: number,
  usuarioId: string,
  observacao?: string,
): Promise<EstoqueLoja> {
  try {
    // Verifica se o produto já existe nesta loja
    const { data: estoqueExistente, error: erroCheck } = await supabase
      .from("estoque_lojas")
      .select("id")
      .eq("id_produto", produtoId)
      .eq("id_loja", lojaId)
      .maybeSingle();

    if (erroCheck) throw erroCheck;

    if (estoqueExistente) {
      // UPDATE se já existe
      const { data, error } = await supabase
        .from("estoque_lojas")
        .update({
          quantidade: quantidade,
          atualizado_em: new Date().toISOString(),
          atualizado_por: usuarioId, // Preencher para trigger registrar no histórico
        })
        .eq("id_produto", produtoId)
        .eq("id_loja", lojaId)
        .select()
        .single();

      if (error) throw error;

      return data;
    } else {
      // INSERT se não existe
      const { data, error } = await supabase
        .from("estoque_lojas")
        .insert({
          id_produto: produtoId,
          id_loja: lojaId,
          quantidade: quantidade,
        })
        .select()
        .single();

      if (error) throw error;

      return data;
    }
  } catch (error) {
    console.error("Erro ao atualizar quantidade:", error);
    throw error;
  }
} // Deletar estoque de uma loja
export async function deletarEstoqueLoja(
  produtoId: string,
  lojaId: number,
): Promise<void> {
  try {
    const { error } = await supabase
      .from("estoque_lojas")
      .delete()
      .eq("id_produto", produtoId)
      .eq("id_loja", lojaId);

    if (error) throw error;
  } catch (error) {
    console.error("Erro ao deletar estoque:", error);
    throw error;
  }
}

// Buscar todo o estoque (com paginação)
export async function getTodoEstoque(
  filtros?: {
    busca?: string;
    id_loja?: number;
  },
  page: number = 1,
  limit: number = 50,
): Promise<{ data: EstoqueLojaCompleto[]; total: number }> {
  try {
    let query = supabase.from("estoque_lojas").select(
      `
        *,
        produto:produtos(descricao, marca, modelos),
        loja:lojas(nome)
      `,
      { count: "exact" },
    );

    // Filtrar por loja
    if (filtros?.id_loja) {
      query = query.eq("id_loja", filtros.id_loja);
    }

    // Busca por descrição, marca ou modelos
    if (filtros?.busca) {
      query = query.or(
        `produto.descricao.ilike.%${filtros.busca}%,produto.marca.ilike.%${filtros.busca}%,produto.modelos.ilike.%${filtros.busca}%`,
      );
    }

    // Paginação
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await query
      .order("quantidade", { ascending: false })
      .range(from, to);

    if (error) throw error;

    const estoques = (data || []).map((item: any) => ({
      ...item,
      produto_descricao: item.produto?.descricao || "",
      produto_marca: item.produto?.marca || "",
      loja_nome: item.loja?.nome || "",
    }));

    return {
      data: estoques,
      total: count || 0,
    };
  } catch (error) {
    console.error("Erro ao buscar todo o estoque:", error);
    throw error;
  }
}

// Buscar filtros (marcas e categorias) para os dropdowns
export async function getFiltrosProdutos(): Promise<{
  marcas: string[];
  categorias: string[];
}> {
  try {
    const { data: marcas } = await supabase
      .from("produtos")
      .select("marca")
      .not("marca", "is", null)
      .order("marca");

    const { data: categorias } = await supabase
      .from("produtos")
      .select("categoria")
      .not("categoria", "is", null)
      .order("categoria");

    return {
      marcas: Array.from(
        new Set((marcas || []).map((m: any) => m.marca).filter(Boolean)),
      ),
      categorias: Array.from(
        new Set(
          (categorias || []).map((c: any) => c.categoria).filter(Boolean),
        ),
      ),
    };
  } catch (error) {
    console.error("Erro ao buscar filtros:", error);

    return { marcas: [], categorias: [] };
  }
}

// Buscar produtos com paginação e filtros server-side
export async function buscarProdutosPaginados(params: {
  busca?: string;
  ativo?: boolean;
  marca?: string;
  categoria?: string;
  page: number;
  pageSize: number;
}): Promise<{ data: any[]; total: number }> {
  try {
    const { busca, ativo, marca, categoria, page, pageSize } = params;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from("produtos")
      .select("*", { count: "exact", head: false })
      .order("descricao", { ascending: true })
      .range(from, to);

    if (busca) {
      const termos = busca
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim()
        .split(/\s+/)
        .filter((t) => t.length > 0);

      termos.forEach((token) => {
        query = query.or(
          `descricao.ilike.%${token}%,modelos.ilike.%${token}%,marca.ilike.%${token}%`,
        );
      });
    }

    if (ativo !== undefined) {
      query = query.eq("ativo", ativo);
    }

    if (marca && marca !== "todos") {
      query = query.eq("marca", marca);
    }

    if (categoria && categoria !== "todos") {
      query = query.eq("categoria", categoria);
    }

    const { data: produtos, error, count } = await query;

    if (error) {
      console.error("Erro ao buscar produtos:", error);
      throw error;
    }

    if (!produtos || produtos.length === 0) {
      return { data: [], total: count || 0 };
    }

    // Buscar estoques apenas dos produtos da página
    const produtoIds = produtos.map((p: any) => p.id);
    const { data: estoques } = await supabase
      .from("estoque_lojas")
      .select(
        `
        id_produto,
        id_loja,
        quantidade,
        loja:lojas(id, nome)
      `,
      )
      .in("id_produto", produtoIds);

    // Montar mapa de estoques
    const estoquesMap = new Map<string, any[]>();

    (estoques || []).forEach((estoque: any) => {
      if (!estoquesMap.has(estoque.id_produto)) {
        estoquesMap.set(estoque.id_produto, []);
      }
      estoquesMap.get(estoque.id_produto)!.push({
        id_loja: estoque.id_loja,
        loja_nome: estoque.loja?.nome || "Desconhecida",
        quantidade: estoque.quantidade,
      });
    });

    // Buscar todas as lojas ativas para preencher lojas sem registro
    const { data: lojasAtivas } = await supabase
      .from("lojas")
      .select("id, nome")
      .eq("ativo", true);

    const lojasMap = new Map<number, string>();

    (lojasAtivas || []).forEach((loja: any) => {
      lojasMap.set(loja.id, loja.nome);
    });

    // Combinar produtos com estoques
    const resultado = produtos.map((produto: any) => {
      const estoquesLoja = estoquesMap.get(produto.id) || [];

      // Preencher lojas sem registro com quantidade 0
      const lojasPresentes = new Set(estoquesLoja.map((e: any) => e.id_loja));

      lojasMap.forEach((nome, id) => {
        if (!lojasPresentes.has(id)) {
          estoquesLoja.push({
            id_loja: id,
            loja_nome: nome,
            quantidade: 0,
          });
        }
      });

      const total_estoque = estoquesLoja.reduce(
        (sum: number, e: any) => sum + e.quantidade,
        0,
      );

      return {
        ...produto,
        estoques_lojas: estoquesLoja,
        total_estoque,
      };
    });

    return { data: resultado, total: count || 0 };
  } catch (error) {
    console.error("Erro ao buscar produtos paginados:", error);
    throw error;
  }
}

// Buscar produtos com quantidades agrupadas por loja (apenas para filtros)
export async function getProdutosComEstoque(): Promise<any[]> {
  try {
    const { data: allProdutos, error: produtosError } = await supabase
      .from("produtos")
      .select("*")
      .order("descricao", { ascending: true })
      .limit(1000);

    if (produtosError) {
      console.error("Erro ao buscar produtos:", produtosError);
      throw produtosError;
    }

    const { data: allEstoques, error: estoqueError } = await supabase
      .from("estoque_lojas")
      .select(
        `
        id_produto,
        id_loja,
        quantidade,
        loja:lojas(id, nome)
      `,
      )
      .limit(2000);

    if (estoqueError) {
      console.error("Erro ao buscar estoques:", estoqueError);
      throw estoqueError;
    }

    const estoquesMap = new Map<string, any[]>();

    allEstoques.forEach((estoque: any) => {
      if (!estoquesMap.has(estoque.id_produto)) {
        estoquesMap.set(estoque.id_produto, []);
      }
      estoquesMap.get(estoque.id_produto)!.push({
        id_loja: estoque.id_loja,
        loja_nome: estoque.loja?.nome || "Desconhecida",
        quantidade: estoque.quantidade,
      });
    });

    const produtosComEstoque = allProdutos.map((produto: any) => {
      const estoquesLoja = estoquesMap.get(produto.id) || [];
      const total_estoque = estoquesLoja.reduce(
        (sum, e) => sum + e.quantidade,
        0,
      );

      return {
        ...produto,
        estoques_lojas: estoquesLoja,
        total_estoque: total_estoque,
      };
    });

    return produtosComEstoque || [];
  } catch (error) {
    console.error("Erro ao buscar produtos com estoque:", error);
    throw error;
  }
}
