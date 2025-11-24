// =====================================================
// TYPES: FORNECEDORES
// =====================================================

export interface Fornecedor {
  id: string;
  nome: string;
  cnpj?: string | null;
  telefone?: string | null;
  email?: string | null;
  endereco?: string | null;
  cidade?: string | null;
  estado?: string | null;
  cep?: string | null;
  contato_nome?: string | null;
  contato_telefone?: string | null;
  observacoes?: string | null;
  ativo: boolean;
  criado_em: string;
  atualizado_em: string;
  criado_por?: string | null;
  atualizado_por?: string | null;
}

export interface ProdutoFornecedor {
  id: string;
  produto_id: string;
  fornecedor_id: string;
  preco_custo?: number | null;
  prazo_entrega_dias?: number | null;
  observacoes?: string | null;
  ativo: boolean;
  criado_em: string;
  atualizado_em: string;
  criado_por?: string | null;
  atualizado_por?: string | null;
  // Relações
  fornecedor?: Fornecedor;
}

export interface FornecedorFormData {
  nome: string;
  cnpj?: string;
  telefone?: string;
  email?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  contato_nome?: string;
  contato_telefone?: string;
  observacoes?: string;
  ativo?: boolean;
}

export interface ProdutoFornecedorFormData {
  produto_id: string;
  fornecedor_id: string;
  preco_custo?: number;
  prazo_entrega_dias?: number;
  observacoes?: string;
  ativo?: boolean;
}

export interface HistoricoFornecedor {
  id: string;
  fornecedor_id: string;
  operacao: "INSERT" | "UPDATE" | "DELETE";
  dados_anteriores?: any;
  dados_novos?: any;
  usuario_id?: string;
  criado_em: string;
}
