/**
 * Tipos para o módulo de Catálogo e Carrinho
 */

import { Produto } from "./index";
import { Aparelho } from "./aparelhos";

/**
 * Produto exibido no catálogo (com informações de estoque)
 */
export interface ProdutoCatalogo extends Produto {
  quantidade_disponivel: number; // Quantidade total em estoque nas lojas
  exibir_catalogo: boolean; // Flag para mostrar no catálogo público
  destaque: boolean; // Produto em destaque
  promocao: boolean; // Produto em promoção
  novidade: boolean; // Produto novo
  ordem_catalogo: number; // Ordem de exibição
  fotos?: {
    id: string;
    url: string;
    nome_arquivo: string;
    is_principal: boolean;
  }[];
}

/**
 * Aparelho exibido no catálogo
 */
export interface AparelhoCatalogo extends Aparelho {
  exibir_catalogo: boolean;
  destaque: boolean;
  promocao: boolean;
  novidade: boolean;
  ordem_catalogo: number;
  fotos?: {
    id: string;
    url: string;
    nome_arquivo: string;
    is_principal: boolean;
  }[];
}

/**
 * Item do catálogo (pode ser produto ou aparelho)
 */
export type ItemCatalogo = {
  tipo: 'produto';
  dados: ProdutoCatalogo;
} | {
  tipo: 'aparelho';
  dados: AparelhoCatalogo;
};

/**
 * Item adicionado ao carrinho
 */
export interface ItemCarrinho {
  id: string; // ID único do item no carrinho (pode ser diferente do produto)
  produto_id: string; // ID do produto
  produto_nome: string;
  produto_marca?: string;
  foto_principal?: string; // URL da foto principal
  preco_unitario: number;
  quantidade: number;
  subtotal: number; // preco_unitario * quantidade
}

/**
 * Estado do carrinho
 */
export interface Carrinho {
  itens: ItemCarrinho[];
  subtotal: number;
  desconto: number;
  total: number;
  total_itens: number; // Soma de todas as quantidades
}

/**
 * Resposta da API de catálogo
 */
export interface RespostaCatalogo {
  sucesso: boolean;
  mensagem?: string;
  dados?: ProdutoCatalogo[];
  total?: number;
  pagina?: number;
  limite?: number;
}
