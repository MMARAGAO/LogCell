// Tipos para o sistema de garantias

export interface ClausulaGarantia {
  numero: number;
  texto: string;
}

export type TipoServicoGarantia =
  | "servico_geral"
  | "troca_vidro"
  | "troca_tampa"
  | "venda_aparelho";

export interface TextoGarantia {
  id: number;
  tipo_servico: TipoServicoGarantia;
  dias_garantia: number;
  titulo: string;
  clausulas: ClausulaGarantia[];
  ativo: boolean;
  criado_em: string;
  atualizado_em: string;
}

export interface TextoGarantiaResponse {
  id: number;
  tipo_servico: TipoServicoGarantia;
  dias_garantia: number;
  titulo: string;
  clausulas: ClausulaGarantia[];
}

// Mapeamento de tipos de serviço para descrições
export const TIPOS_SERVICO_GARANTIA: Record<TipoServicoGarantia, string> = {
  servico_geral: "Serviço Geral",
  troca_vidro: "Troca de Vidro",
  troca_tampa: "Troca de Tampa",
  venda_aparelho: "Venda de Aparelho",
};
