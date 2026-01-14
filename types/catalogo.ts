export interface ItemCarrinho {
  id: string;
  produto_id: string;
  nome: string;
  quantidade: number;
  preco_unitario: number;
  subtotal: number;
}

export interface Carrinho {
  itens: ItemCarrinho[];
  subtotal: number;
  desconto: number;
  total: number;
  total_itens: number;
}
