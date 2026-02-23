export type EstadoAparelho = "novo" | "usado" | "seminovo" | "recondicionado";
export type CondicaoAparelho = "perfeito" | "bom" | "regular" | "ruim";
export type StatusAparelho =
  | "disponivel"
  | "vendido"
  | "reservado"
  | "defeito"
  | "transferido";
export type TipoDevolucaoAparelho = "devolucao" | "troca" | "garantia";

export interface FotoAparelho {
  id: string;
  aparelho_id: string;
  url: string;
  nome_arquivo: string;
  tamanho?: number | null;
  ordem: number;
  is_principal: boolean;
  criado_por?: string | null;
  criado_em: string;
}

export interface Aparelho {
  id: string;
  marca: string | null;
  modelo: string | null;
  armazenamento: string | null;
  memoria_ram: string | null;
  imei?: string | null;
  numero_serie?: string | null;
  cor?: string | null;
  estado: EstadoAparelho;
  condicao?: CondicaoAparelho | null;
  acessorios?: string | null;
  observacoes?: string | null;
  valor_compra?: number | null;
  valor_venda?: number | null;
  loja_id: number;
  status: StatusAparelho;
  data_entrada: string;
  data_venda?: string | null;
  venda_id?: string | null;
  saude_bateria?: number | null;

  // Campos de catálogo
  exibir_catalogo?: boolean;
  destaque?: boolean;
  promocao?: boolean;
  novidade?: boolean;
  ordem_catalogo?: number;

  criado_por?: string | null;
  criado_em: string;
  atualizado_em: string;
  atualizado_por?: string | null;

  // Relacionamentos
  loja?: {
    id: number;
    nome: string;
  };
}

export interface AparelhoFormData {
  marca: string;
  modelo: string;
  armazenamento: string;
  memoria_ram?: string;
  imei?: string;
  numero_serie?: string;
  cor?: string;
  estado: EstadoAparelho;
  condicao?: CondicaoAparelho;
  acessorios?: string;
  observacoes?: string;
  valor_compra?: number;
  valor_venda?: number;
  loja_id: number;
  status?: StatusAparelho;
  saude_bateria?: number;

  // Campos de catálogo
  exibir_catalogo?: boolean;
  destaque?: boolean;
  promocao?: boolean;
  novidade?: boolean;
  ordem_catalogo?: number;
}

export interface DevolucaoAparelho {
  id?: string;
  aparelho_id: string;
  venda_id?: string | null;
  loja_id: number;
  tipo: TipoDevolucaoAparelho;
  motivo: string;
  observacoes?: string | null;
  data_ocorrencia?: string;
  criado_em?: string;
  criado_por?: string | null;
  usuario?: {
    id: string;
    nome: string;
  };
}

export interface BrindeAparelho {
  id?: string;
  loja_id: number;
  venda_id?: string | null;
  descricao: string;
  valor_custo: number;
  data_ocorrencia?: string;
  criado_em?: string;
  criado_por?: string | null;
}

export interface FiltrosAparelhos {
  loja_id?: number;
  marca?: string;
  modelo?: string;
  estado?: EstadoAparelho;
  status?: StatusAparelho;
  busca?: string; // Para IMEI, número série, marca, modelo
  exibir_catalogo?: boolean;
  destaque?: boolean;
  promocao?: boolean;
  novidade?: boolean;
}
