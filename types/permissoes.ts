// Tipos de permissões do sistema
export type Permissao =
  // Clientes
  | "clientes.visualizar"
  | "clientes.criar"
  | "clientes.editar"
  | "clientes.deletar"
  | "clientes.processar_creditos"
  // Ordem de Serviço
  | "os.visualizar"
  | "os.criar"
  | "os.editar"
  | "os.deletar"
  | "os.assumir"
  | "os.gerenciar_pecas"
  | "os.gerenciar_fotos"
  | "os.gerenciar_pagamentos"
  | "os.alterar_status"
  | "os.gerar_pdf"
  // Estoque
  | "estoque.visualizar"
  | "estoque.adicionar"
  | "estoque.editar"
  | "estoque.deletar"
  | "estoque.transferir"
  | "estoque.ajustar"
  | "estoque.ver_estatisticas"
  | "estoque.ver_preco_custo"
  // Vendas
  | "vendas.visualizar"
  | "vendas.criar"
  | "vendas.editar"
  | "vendas.editar_pagas"
  | "vendas.cancelar"
  | "vendas.aplicar_desconto"
  | "vendas.processar_pagamentos"
  | "vendas.ver_estatisticas_faturamento"
  | "vendas.ver_todas_vendas"
  | "vendas.devolver"
  // Fornecedores
  | "fornecedores.visualizar"
  | "fornecedores.criar"
  | "fornecedores.editar"
  | "fornecedores.deletar"
  // Usuários
  | "usuarios.visualizar"
  | "usuarios.criar"
  | "usuarios.editar"
  | "usuarios.deletar"
  | "usuarios.gerenciar_permissoes"
  // Técnicos
  | "tecnicos.visualizar"
  | "tecnicos.criar"
  | "tecnicos.editar"
  | "tecnicos.deletar"
  // Lojas
  | "lojas.visualizar"
  | "lojas.criar"
  | "lojas.editar"
  | "lojas.deletar"
  // Caixa
  | "caixa.visualizar"
  | "caixa.abrir"
  | "caixa.fechar"
  | "caixa.sangria"
  | "caixa.suprimento"
  | "caixa.visualizar_movimentacoes"
  // Dashboard
  | "dashboard.visualizar"
  | "dashboard.financeiro"
  | "dashboard.ver_relatorios"
  | "dashboard.exportar_dados"
  // Dashboard Pessoal
  | "dashboard_pessoal.visualizar"
  | "dashboard_pessoal.definir_metas"
  | "dashboard_pessoal.visualizar_metas_outros"
  // Logs
  | "logs.visualizar"
  | "logs.filtrar"
  | "logs.ver_detalhes"
  | "logs.exportar"
  // RMA
  | "rma.visualizar"
  | "rma.criar"
  | "rma.editar"
  | "rma.aprovar"
  | "rma.cancelar"
  // RMA Clientes
  | "rma_clientes.visualizar"
  | "rma_clientes.criar"
  | "rma_clientes.editar"
  | "rma_clientes.deletar"
  // Quebras
  | "quebras.visualizar"
  | "quebras.registrar"
  | "quebras.aprovar"
  | "quebras.rejeitar"
  // Devoluções
  | "devolucoes.visualizar"
  | "devolucoes.criar"
  | "devolucoes.editar"
  | "devolucoes.deletar"
  | "devolucoes.deletar_sem_restricao"
  | "devolucoes.aprovar"
  | "devolucoes.processar_creditos"
  // Transferências
  | "transferencias.visualizar"
  | "transferencias.criar"
  | "transferencias.editar"
  | "transferencias.deletar"
  | "transferencias.confirmar"
  | "transferencias.aprovar"
  | "transferencias.cancelar"
  // Configurações
  | "configuracoes.gerenciar";

// Perfis de usuário com suas permissões
export type PerfilUsuario = "admin" | "gerente" | "vendedor" | "tecnico";

// Mapeamento de perfis para permissões
export const PERMISSOES_POR_PERFIL: Record<PerfilUsuario, Permissao[]> = {
  admin: [
    // Admin tem todas as permissões
    "clientes.visualizar",
    "clientes.criar",
    "clientes.editar",
    "clientes.deletar",
    "clientes.processar_creditos",
    "os.visualizar",
    "os.criar",
    "os.editar",
    "os.deletar",
    "os.assumir",
    "os.gerenciar_pecas",
    "os.gerenciar_fotos",
    "os.gerenciar_pagamentos",
    "os.alterar_status",
    "os.gerar_pdf",
    "estoque.visualizar",
    "estoque.adicionar",
    "estoque.editar",
    "estoque.deletar",
    "estoque.transferir",
    "estoque.ajustar",
    "estoque.ver_estatisticas",
    "estoque.ver_preco_custo",
    "vendas.visualizar",
    "vendas.criar",
    "vendas.editar",
    "vendas.editar_pagas",
    "vendas.cancelar",
    "vendas.aplicar_desconto",
    "vendas.processar_pagamentos",
    "vendas.ver_estatisticas_faturamento",
    "vendas.ver_todas_vendas",
    "vendas.devolver",
    "fornecedores.visualizar",
    "fornecedores.criar",
    "fornecedores.editar",
    "fornecedores.deletar",
    "usuarios.visualizar",
    "usuarios.criar",
    "usuarios.editar",
    "usuarios.deletar",
    "usuarios.gerenciar_permissoes",
    "tecnicos.visualizar",
    "tecnicos.criar",
    "tecnicos.editar",
    "tecnicos.deletar",
    "lojas.visualizar",
    "lojas.criar",
    "lojas.editar",
    "lojas.deletar",
    "caixa.visualizar",
    "caixa.abrir",
    "caixa.fechar",
    "caixa.sangria",
    "caixa.suprimento",
    "caixa.visualizar_movimentacoes",
    "dashboard.visualizar",
    "dashboard.financeiro",
    "dashboard.ver_relatorios",
    "dashboard.exportar_dados",
    "dashboard_pessoal.visualizar",
    "dashboard_pessoal.definir_metas",
    "dashboard_pessoal.visualizar_metas_outros",
    "logs.visualizar",
    "logs.filtrar",
    "logs.ver_detalhes",
    "logs.exportar",
    "rma.visualizar",
    "rma.criar",
    "rma.editar",
    "rma.aprovar",
    "rma.cancelar",
    "rma_clientes.visualizar",
    "rma_clientes.criar",
    "rma_clientes.editar",
    "rma_clientes.deletar",
    "quebras.visualizar",
    "quebras.registrar",
    "quebras.aprovar",
    "quebras.rejeitar",
    "devolucoes.visualizar",
    "devolucoes.criar",
    "devolucoes.editar",
    "devolucoes.deletar",
    "devolucoes.deletar_sem_restricao",
    "devolucoes.aprovar",
    "devolucoes.processar_creditos",
    "transferencias.visualizar",
    "transferencias.criar",
    "transferencias.editar",
    "transferencias.deletar",
    "transferencias.confirmar",
    "transferencias.aprovar",
    "transferencias.cancelar",
    "configuracoes.gerenciar",
  ],

  gerente: [
    // Gerente tem quase todas, exceto deletar usuários e gerenciar lojas
    "clientes.visualizar",
    "clientes.criar",
    "clientes.editar",
    "clientes.deletar",
    "clientes.processar_creditos",
    "os.visualizar",
    "os.criar",
    "os.editar",
    "os.deletar",
    "os.assumir",
    "os.gerenciar_pecas",
    "os.gerenciar_fotos",
    "os.gerenciar_pagamentos",
    "os.alterar_status",
    "os.gerar_pdf",
    "estoque.visualizar",
    "estoque.adicionar",
    "estoque.editar",
    "estoque.transferir",
    "estoque.ajustar",
    "estoque.ver_estatisticas",
    "estoque.ver_preco_custo",
    "vendas.visualizar",
    "vendas.criar",
    "vendas.editar",
    "vendas.cancelar",
    "vendas.aplicar_desconto",
    "vendas.processar_pagamentos",
    "vendas.ver_estatisticas_faturamento",
    "vendas.ver_todas_vendas",
    "vendas.devolver",
    "fornecedores.visualizar",
    "fornecedores.criar",
    "fornecedores.editar",
    "usuarios.visualizar",
    "tecnicos.visualizar",
    "tecnicos.criar",
    "tecnicos.editar",
    "lojas.visualizar",
    "caixa.visualizar",
    "caixa.abrir",
    "caixa.fechar",
    "caixa.sangria",
    "caixa.suprimento",
    "caixa.visualizar_movimentacoes",
    "dashboard.visualizar",
    "dashboard.financeiro",
    "dashboard.ver_relatorios",
    "dashboard.exportar_dados",
    "dashboard_pessoal.visualizar",
    "dashboard_pessoal.definir_metas",
    "dashboard_pessoal.visualizar_metas_outros",
    "logs.visualizar",
    "logs.filtrar",
    "logs.ver_detalhes",
    "rma.visualizar",
    "rma.criar",
    "rma.editar",
    "rma.aprovar",
    "rma_clientes.visualizar",
    "rma_clientes.criar",
    "rma_clientes.editar",
    "quebras.visualizar",
    "quebras.registrar",
    "quebras.aprovar",
    "quebras.rejeitar",
    "devolucoes.visualizar",
    "devolucoes.criar",
    "devolucoes.editar",
    "devolucoes.aprovar",
    "devolucoes.processar_creditos",
    "transferencias.visualizar",
    "transferencias.criar",
    "transferencias.editar",
    "transferencias.confirmar",
    "transferencias.aprovar",
  ],

  vendedor: [
    // Vendedor foca em vendas e clientes
    "clientes.visualizar",
    "clientes.criar",
    "clientes.editar",
    "os.visualizar",
    "os.criar",
    "os.editar",
    "os.gerenciar_pagamentos",
    "os.gerar_pdf",
    "estoque.visualizar",
    "vendas.visualizar",
    "vendas.criar",
    "vendas.aplicar_desconto",
    "vendas.processar_pagamentos",
    "vendas.devolver",
    "caixa.visualizar",
    "dashboard.visualizar",
    "dashboard_pessoal.visualizar",
    "rma.visualizar",
    "rma.criar",
    "rma_clientes.visualizar",
    "rma_clientes.criar",
    "devolucoes.visualizar",
    "devolucoes.criar",
  ],

  tecnico: [
    // Técnico foca em OS
    "clientes.visualizar",
    "os.visualizar",
    "os.assumir",
    "os.gerenciar_pecas",
    "os.gerenciar_fotos",
    "os.alterar_status",
    "os.gerar_pdf",
    "estoque.visualizar",
    "dashboard.visualizar",
    "dashboard_pessoal.visualizar",
    "quebras.visualizar",
    "quebras.registrar",
  ],
};

// Interface para permissões customizadas de usuário
export interface PermissoesUsuario {
  perfil: PerfilUsuario;
  permissoes_adicionais?: Permissao[];
  permissoes_removidas?: Permissao[];
}
