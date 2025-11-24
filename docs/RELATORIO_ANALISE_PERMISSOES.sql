-- ============================================================================
-- RELATÓRIO: ANÁLISE DE USO DE PERMISSÕES NO SISTEMA
-- ============================================================================
-- Este relatório compara as permissões definidas no modal com as realmente
-- utilizadas no código da aplicação
-- ============================================================================

-- PERMISSÕES DEFINIDAS NO MODAL (PermissoesModal.tsx)
-- =====================================================

-- USUÁRIOS
-- ✅ visualizar - USADO (UsuarioCard.tsx, usuarios/page.tsx)
-- ✅ criar - USADO (usuarios/page.tsx)
-- ✅ editar - USADO (UsuarioCard.tsx, usuarios/page.tsx)
-- ✅ excluir - USADO (UsuarioCard.tsx, usuarios/page.tsx) [chamado de "deletar" no código]
-- ✅ gerenciar_permissoes - USADO (permissoes/page.tsx)

-- ESTOQUE
-- ✅ visualizar - USADO (estoque/page.tsx)
-- ✅ criar - USADO (estoque/page.tsx)
-- ✅ editar - USADO (estoque/page.tsx)
-- ✅ excluir - USADO (estoque/page.tsx) [chamado de "deletar" no código]
-- ✅ ajustar - USADO (estoque/page.tsx)
-- ✅ transferir - USADO (transferencias/page.tsx)
-- ✅ ver_estatisticas - USADO (estoque/page.tsx)
-- ✅ ver_preco_custo - USADO (estoque/page.tsx)

-- LOJAS
-- ✅ visualizar - USADO (lojas/page.tsx)
-- ✅ criar - USADO (lojas/page.tsx)
-- ✅ editar - USADO (lojas/page.tsx)
-- ✅ excluir - USADO (lojas/page.tsx) [chamado de "deletar" no código]

-- CLIENTES
-- ✅ visualizar - USADO (ClienteCard.tsx, clientes/page.tsx)
-- ✅ criar - USADO (clientes/page.tsx)
-- ✅ editar - USADO (ClienteCard.tsx, clientes/page.tsx)
-- ✅ excluir - USADO (ClienteCard.tsx, clientes/page.tsx) [chamado de "deletar" no código]
-- ✅ processar_creditos - USADO (ClienteCard.tsx, clientes/page.tsx)

-- FORNECEDORES
-- ✅ visualizar - USADO (fornecedores/page.tsx)
-- ✅ criar - USADO (fornecedores/page.tsx)
-- ✅ editar - USADO (fornecedores/page.tsx)
-- ✅ excluir - USADO (fornecedores/page.tsx) [chamado de "deletar" no código]

-- VENDAS
-- ✅ visualizar - USADO (vendas/page.tsx)
-- ✅ criar - USADO (vendas/page.tsx)
-- ✅ editar - USADO (vendas/page.tsx)
-- ✅ editar_pagas - USADO (vendas/page.tsx)
-- ✅ cancelar - USADO (vendas/page.tsx)
-- ✅ gerenciar_descontos - ❓ NÃO ENCONTRADO (pode estar em outro componente)
-- ✅ aplicar_desconto - USADO (ProdutosComDescontoPanel.tsx, NovaVendaModal.tsx, DescontoModal.tsx)
-- ✅ processar_pagamentos - USADO (vendas/page.tsx)
-- ✅ ver_estatisticas_faturamento - USADO (vendas/page.tsx)
-- ✅ ver_todas_vendas - USADO (vendas/page.tsx)
-- ✅ desconto_maximo - USADO (é um valor numérico, não booleano)

-- ORDEM DE SERVIÇO (OS)
-- ✅ visualizar - USADO (ordem-servico/page.tsx)
-- ✅ criar - USADO (ordem-servico/page.tsx)
-- ✅ editar - USADO (ordem-servico/page.tsx)
-- ✅ deletar - USADO (ordem-servico/page.tsx) [RECÉM ADICIONADO]
-- ✅ cancelar - ❓ NÃO ENCONTRADO [DEFINIDO MAS NÃO IMPLEMENTADO]
-- ✅ assumir - USADO (ordem-servico/page.tsx) [RECÉM ADICIONADO]
-- ✅ atribuir_tecnico - ❓ NÃO ENCONTRADO [DEFINIDO MAS NÃO IMPLEMENTADO]
-- ✅ atualizar_status - ❓ NÃO ENCONTRADO [DEFINIDO MAS NÃO IMPLEMENTADO]
-- ✅ gerar_pdf - ❓ NÃO ENCONTRADO [DEFINIDO MAS NÃO IMPLEMENTADO]
-- ✅ gerenciar_pecas - USADO (ordem-servico/page.tsx)
-- ✅ gerenciar_fotos - USADO (ordem-servico/page.tsx)
-- ✅ gerenciar_pagamentos - USADO (ordem-servico/page.tsx)

-- TÉCNICOS
-- ✅ visualizar - USADO (tecnicos/page.tsx)
-- ✅ criar - USADO (tecnicos/page.tsx)
-- ✅ editar - USADO (tecnicos/page.tsx)
-- ✅ deletar - USADO (tecnicos/page.tsx)

-- DEVOLUÇÕES
-- ✅ visualizar - USADO (devolucoes/page.tsx)
-- ✅ criar - USADO (devolucoes/page.tsx)
-- ✅ editar - ❓ NÃO ENCONTRADO [DEFINIDO MAS NÃO IMPLEMENTADO]
-- ✅ deletar - ❓ NÃO ENCONTRADO [DEFINIDO MAS NÃO IMPLEMENTADO]
-- ✅ deletar_sem_restricao - ❓ NÃO ENCONTRADO [DEFINIDO MAS NÃO IMPLEMENTADO]
-- ✅ aprovar - ❓ NÃO ENCONTRADO [DEFINIDO MAS NÃO IMPLEMENTADO]
-- ✅ processar_creditos - USADO (ModalDevolucao.tsx)

-- RMA
-- ✅ visualizar - USADO (rmas/page.tsx)
-- ✅ criar - USADO (rmas/page.tsx)
-- ✅ editar - ❓ NÃO ENCONTRADO [DEFINIDO MAS NÃO IMPLEMENTADO]
-- ✅ deletar - ❓ NÃO ENCONTRADO [DEFINIDO MAS NÃO IMPLEMENTADO]
-- ✅ aprovar - ❓ NÃO ENCONTRADO [DEFINIDO MAS NÃO IMPLEMENTADO]

-- TRANSFERÊNCIAS
-- ✅ visualizar - ❓ NÃO ENCONTRADO [verifica estoque.transferir]
-- ✅ criar - ❓ NÃO ENCONTRADO [verifica estoque.transferir]
-- ✅ editar - ❓ NÃO ENCONTRADO [DEFINIDO MAS NÃO IMPLEMENTADO]
-- ✅ deletar - ❓ NÃO ENCONTRADO [DEFINIDO MAS NÃO IMPLEMENTADO]
-- ✅ confirmar - ❓ NÃO ENCONTRADO [DEFINIDO MAS NÃO IMPLEMENTADO]
-- ✅ aprovar - ❓ NÃO ENCONTRADO [DEFINIDO MAS NÃO IMPLEMENTADO]

-- CAIXA
-- ✅ visualizar - USADO (caixa/page.tsx)
-- ✅ abrir - USADO (caixa/page.tsx)
-- ✅ fechar - USADO (caixa/page.tsx)
-- ✅ visualizar_movimentacoes - USADO (caixa/page.tsx)

-- CONFIGURAÇÕES
-- ✅ gerenciar - USADO (configuracoes/page.tsx)

-- DASHBOARD
-- ✅ visualizar - USADO (dashboard/page.tsx)
-- ✅ ver_relatorios - ❓ NÃO ENCONTRADO [DEFINIDO MAS NÃO IMPLEMENTADO]
-- ✅ exportar_dados - ❓ NÃO ENCONTRADO [DEFINIDO MAS NÃO IMPLEMENTADO]

-- LOGS
-- ✅ visualizar - ❓ NÃO ENCONTRADO [DEFINIDO MAS NÃO IMPLEMENTADO]
-- ✅ filtrar - ❓ NÃO ENCONTRADO [DEFINIDO MAS NÃO IMPLEMENTADO]
-- ✅ ver_detalhes - ❓ NÃO ENCONTRADO [DEFINIDO MAS NÃO IMPLEMENTADO]
-- ✅ exportar - ❓ NÃO ENCONTRADO [DEFINIDO MAS NÃO IMPLEMENTADO]

-- RMA CLIENTES
-- ✅ visualizar - ❓ NÃO ENCONTRADO [DEFINIDO MAS NÃO IMPLEMENTADO]
-- ✅ criar - ❓ NÃO ENCONTRADO [DEFINIDO MAS NÃO IMPLEMENTADO]
-- ✅ editar - ❓ NÃO ENCONTRADO [DEFINIDO MAS NÃO IMPLEMENTADO]
-- ✅ deletar - ❓ NÃO ENCONTRADO [DEFINIDO MAS NÃO IMPLEMENTADO]

-- NOTIFICAÇÕES
-- ✅ visualizar - USADO (Header.tsx)

-- ============================================================================
-- RESUMO DE ANÁLISE
-- ============================================================================
-- Total de permissões definidas: ~90
-- Permissões efetivamente usadas: ~60 (67%)
-- Permissões não implementadas: ~30 (33%)

-- PERMISSÕES NÃO IMPLEMENTADAS MAS DEFINIDAS:
-- ============================================
-- 1. vendas.gerenciar_descontos
-- 2. os.cancelar
-- 3. os.atribuir_tecnico
-- 4. os.atualizar_status
-- 5. os.gerar_pdf
-- 6. devolucoes.editar
-- 7. devolucoes.deletar
-- 8. devolucoes.deletar_sem_restricao
-- 9. devolucoes.aprovar
-- 10. rma.editar
-- 11. rma.deletar
-- 12. rma.aprovar
-- 13. transferencias.visualizar (usa estoque.transferir)
-- 14. transferencias.criar (usa estoque.transferir)
-- 15. transferencias.editar
-- 16. transferencias.deletar
-- 17. transferencias.confirmar
-- 18. transferencias.aprovar
-- 19. dashboard.ver_relatorios
-- 20. dashboard.exportar_dados
-- 21-24. logs.* (todo o módulo)
-- 25-28. rma_clientes.* (todo o módulo)

-- RECOMENDAÇÕES:
-- ==============
-- 1. Implementar funcionalidades para permissões definidas mas não usadas
-- 2. OU remover permissões não utilizadas do sistema
-- 3. Padronizar nomenclatura: "excluir" vs "deletar"
-- 4. Transferências deveria ter seu próprio módulo de permissões separado de estoque
-- 5. Considerar implementar sistema de logs completo (auditoria)
-- 6. RMA Clientes parece duplicado com RMA - verificar necessidade
