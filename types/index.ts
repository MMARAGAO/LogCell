import { SVGProps } from "react";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

// Tipos para o sistema de autenticação
export type TipoUsuario = "usuario" | "tecnico";

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  cpf?: string;
  ativo: boolean;
  criado_em: string;
  atualizado_em: string;
  foto_url?: string;
  tipo_usuario?: TipoUsuario; // Define se é usuário administrativo ou técnico
}

// Tipo para técnicos com login próprio
export interface Tecnico {
  id: string;
  nome: string;
  cpf?: string;
  rg?: string;
  data_nascimento?: string;
  telefone: string;
  email: string;
  especialidades?: string[];
  registro_profissional?: string;
  data_admissao?: string;
  data_demissao?: string;
  cor_agenda?: string;
  ativo: boolean;
  usuario_id?: string; // Vinculação com auth.users do Supabase
  id_loja?: number;
  criado_em: string;
  atualizado_em: string;
  criado_por?: string;
  atualizado_por?: string;
}

export interface FotoPerfil {
  id: number;
  usuario_id: string;
  url: string;
  criado_em: string;
}

export interface Permissoes {
  id: number;
  usuario_id: string;
  permissoes: PermissoesModulos;
  loja_id?: number | null; // ID da loja específica ou null para todas
  todas_lojas?: boolean; // true se tem acesso a todas as lojas
  criado_em: string;
  atualizado_em: string;
}

export interface PermissoesModulos {
  usuarios?: {
    visualizar: boolean;
    criar: boolean;
    editar: boolean;
    excluir: boolean;
    gerenciar_permissoes: boolean;
  };
  estoque?: {
    visualizar: boolean;
    criar: boolean;
    editar: boolean;
    excluir: boolean;
    ajustar: boolean;
    ver_estatisticas: boolean;
    ver_preco_custo: boolean;
  };
  lojas?: {
    visualizar: boolean;
    criar: boolean;
    editar: boolean;
    excluir: boolean;
  };
  clientes?: {
    visualizar: boolean;
    criar: boolean;
    editar: boolean;
    excluir: boolean;
    processar_creditos: boolean;
  };
  fornecedores?: {
    visualizar: boolean;
    criar: boolean;
    editar: boolean;
    excluir: boolean;
  };
  vendas?: {
    visualizar: boolean;
    criar: boolean;
    editar: boolean;
    editar_pagas: boolean;
    concluir: boolean;
    cancelar: boolean;
    gerenciar_descontos: boolean;
    aplicar_desconto: boolean;
    processar_pagamentos: boolean;
    ver_estatisticas_faturamento: boolean;
    ver_todas_vendas: boolean;
    ver_resumo_pagamentos: boolean;
    desconto_maximo?: number;
  };
  os?: {
    visualizar: boolean;
    criar: boolean;
    editar: boolean;
    excluir: boolean;
    deletar_entregue: boolean;
    cancelar: boolean;
    cancelar_entregue: boolean;
    gerenciar_pecas: boolean;
    gerenciar_fotos: boolean;
    gerenciar_pagamentos: boolean;
    assumir: boolean;
  };
  tecnicos?: {
    visualizar: boolean;
    criar: boolean;
    editar: boolean;
    excluir: boolean;
  };
  devolucoes?: {
    visualizar: boolean;
    criar: boolean;
    processar_creditos: boolean;
  };
  aparelhos?: {
    visualizar: boolean;
    criar: boolean;
    editar: boolean;
    deletar: boolean;
    alterar_status: boolean;
    receber: boolean;
    vender: boolean;
    gerenciar_fotos: boolean;
    ver_relatorios: boolean;
    ver_dashboard: boolean;
  };
  rma?: {
    visualizar: boolean;
    criar: boolean;
  };
  transferencias?: {
    visualizar: boolean;
    criar: boolean;
    editar: boolean;
    excluir: boolean;
    confirmar: boolean;
    aprovar: boolean;
  };
  caixa?: {
    visualizar: boolean;
    abrir: boolean;
    fechar: boolean;
    visualizar_movimentacoes: boolean;
  };
  financeiro?: {
    visualizar: boolean;
    folha: boolean;
    contas_lojas: boolean;
    vales: boolean;
    retiradas: boolean;
    fornecedores: boolean;
    impostos: boolean;
    funcionarios: boolean;
    custos: boolean;
    relatorios: boolean;
  };
  configuracoes?: {
    gerenciar: boolean;
  };
  dashboard?: {
    visualizar: boolean;
  };
  dashboard_pessoal?: {
    visualizar: boolean;
    definir_metas: boolean;
    visualizar_metas_outros: boolean;
  };
  notificacoes?: {
    visualizar: boolean;
  };
}

export interface CadastroUsuarioData {
  nome: string;
  email: string;
  senha: string;
  telefone?: string;
  cpf?: string;
}

export interface LoginData {
  email: string;
  senha: string;
}

// Tipos para o sistema de lojas
export interface Loja {
  id: number;
  nome: string;
  cnpj?: string;
  telefone?: string;
  email?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  ativo: boolean;
  criado_em: string;
  atualizado_em: string;
}

// Tipos para o histórico de lojas
export interface HistoricoLoja {
  id: number;
  loja_id: number;
  usuario_id: string;
  operacao: "INSERT" | "UPDATE" | "DELETE";
  dados_antigos: Loja | null;
  dados_novos: Loja | null;
  campos_modificados: string[] | null;
  criado_em: string;
}

export interface HistoricoLojaComUsuario extends HistoricoLoja {
  loja_nome: string;
  usuario_nome: string;
  usuario_email: string;
}

// Tipos para fotos de lojas
export interface LojaFoto {
  id: number;
  loja_id: number;
  url: string;
  legenda?: string;
  ordem: number;
  is_principal: boolean;
  criado_em: string;
  atualizado_em: string;
}

// Tipos para o sistema de estoque e produtos
export interface Produto {
  id: string;
  descricao: string;
  grupo?: string;
  categoria?: string;
  codigo_fabricante?: string;
  modelos?: string;
  marca?: string;
  preco_compra?: number;
  preco_venda?: number;
  quantidade_minima: number;
  ativo: boolean;
  criado_por?: string;
  criado_em: string;
  atualizado_por?: string;
  atualizado_em: string;
}

export interface EstoqueLoja {
  id: string;
  id_produto: string;
  id_loja: number; // INTEGER no banco (compatível com lojas)
  quantidade: number;
  atualizado_por?: string;
  atualizado_em: string;
}

export interface EstoqueLojaCompleto extends EstoqueLoja {
  produto_descricao: string;
  produto_marca?: string;
  loja_nome: string;
}

export interface HistoricoProduto {
  id: string;
  produto_id: string;
  usuario_id?: string;
  operacao: "INSERT" | "UPDATE" | "DELETE";
  campo_alterado?: string;
  valor_anterior?: string;
  valor_novo?: string;
  criado_em: string;
}

export interface HistoricoProdutoCompleto extends HistoricoProduto {
  produto_descricao: string;
  usuario_nome?: string;
}

export interface HistoricoEstoque {
  id: string;
  id_produto: string;
  id_loja?: number; // INTEGER no banco (compatível com lojas)
  usuario_id?: string;
  quantidade_anterior?: number;
  quantidade_nova?: number;
  quantidade_alterada?: number;
  tipo_movimentacao?: string;
  motivo?: string;
  observacao?: string;
  criado_em: string;
}

export interface HistoricoEstoqueCompleto extends HistoricoEstoque {
  produto_descricao: string;
  produto_marca?: string;
  loja_nome?: string;
  usuario_nome?: string;
}

export interface FotoProduto {
  id: string;
  produto_id: string;
  url: string;
  nome_arquivo: string;
  tamanho?: number;
  ordem: number;
  is_principal: boolean;
  criado_por?: string;
  criado_em: string;
}

export interface ProdutoCompleto extends Produto {
  fotos?: FotoProduto[];
  estoques?: EstoqueLojaCompleto[];
  quantidade_total?: number; // Soma de todas as lojas
}

// Tipos para o sistema de notificações
export type TipoNotificacao =
  | "estoque_baixo"
  | "estoque_zerado"
  | "estoque_reposto"
  | "sistema"
  | "produto_inativo";

export interface Notificacao {
  id: number;
  tipo: TipoNotificacao;
  titulo: string;
  mensagem: string;
  produto_id?: string;
  loja_id?: number;
  dados_extras?: {
    quantidade?: number;
    quantidade_minima?: number;
    estado?: string;
    [key: string]: any;
  };
  criado_em: string;
  expira_em?: string;
}

export interface NotificacaoUsuario {
  id: number;
  notificacao_id: number;
  usuario_id: string;
  lida: boolean;
  lida_em?: string;
  criado_em: string;
}

export interface NotificacaoCompleta extends Notificacao {
  lida: boolean;
  lida_em?: string;
  produto_nome?: string;
  loja_nome?: string;
}

export interface AlertaEstoqueControle {
  id: number;
  produto_id: string;
  loja_id: number;
  estado: "baixo" | "zerado" | "normal";
  quantidade_atual: number;
  quantidade_minima: number;
  ultimo_alerta_em: string;
  criado_em: string;
  atualizado_em: string;
}

// Tipos para Fotos de Ordem de Serviço
export interface FotoOrdemServico {
  id: string;
  id_ordem_servico: string;
  url: string;
  ordem: number;
  is_principal: boolean;
  criado_por?: string;
  criado_em: string;
  atualizado_em?: string;
}

// Tipos para Transferências entre Lojas
export interface Transferencia {
  id: string;
  loja_origem_id: number;
  loja_destino_id: number;
  status: "pendente" | "confirmada" | "cancelada";
  observacoes?: string;
  criado_por: string;
  criado_em: string;
  confirmado_por?: string;
  confirmado_em?: string;
  cancelado_por?: string;
  cancelado_em?: string;
  motivo_cancelamento?: string;
}

export interface TransferenciaItem {
  id: string;
  transferencia_id: string;
  produto_id: string;
  quantidade: number;
  criado_em: string;
}

export interface TransferenciaCompleta extends Transferencia {
  itens: (TransferenciaItem & {
    produto_descricao?: string;
    produto_codigo?: string;
    produto_marca?: string;
  })[];
  loja_origem_nome?: string;
  loja_origem?: string; // Alias para compatibilidade
  loja_destino_nome?: string;
  loja_destino?: string; // Alias para compatibilidade
  criado_por_nome?: string;
  usuario_nome?: string; // Alias para compatibilidade
  confirmado_por_nome?: string;
  cancelado_por_nome?: string;
  observacao?: string; // Alias para observacoes
}
