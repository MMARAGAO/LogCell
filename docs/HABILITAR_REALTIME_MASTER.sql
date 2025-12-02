-- =====================================================
-- HABILITAR REALTIME MASTER - TODAS AS TABELAS
-- =====================================================
-- Este script habilita Realtime para todas as tabelas críticas
-- do sistema LogCell que precisam de atualização em tempo real
-- =====================================================

-- =====================================================
-- 1. PERMISSÕES (usuários precisam ver alterações imediatamente)
-- =====================================================
ALTER TABLE public.permissoes REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS public.permissoes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.permissoes;

-- =====================================================
-- 2. NOTIFICAÇÕES (alertas de estoque, sistema, etc)
-- =====================================================
ALTER TABLE public.notificacoes REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS public.notificacoes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notificacoes;

ALTER TABLE public.notificacoes_usuarios REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS public.notificacoes_usuarios;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notificacoes_usuarios;

-- =====================================================
-- 3. VENDAS (atualizações de status, pagamentos)
-- =====================================================
ALTER TABLE public.vendas REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS public.vendas;
ALTER PUBLICATION supabase_realtime ADD TABLE public.vendas;

ALTER TABLE public.vendas_itens REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS public.vendas_itens;
ALTER PUBLICATION supabase_realtime ADD TABLE public.vendas_itens;

ALTER TABLE public.vendas_pagamentos REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS public.vendas_pagamentos;
ALTER PUBLICATION supabase_realtime ADD TABLE public.vendas_pagamentos;

-- =====================================================
-- 4. ESTOQUE (movimentações, transferências)
-- =====================================================
ALTER TABLE public.estoque_lojas REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS public.estoque_lojas;
ALTER PUBLICATION supabase_realtime ADD TABLE public.estoque_lojas;

ALTER TABLE public.historico_estoque REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS public.historico_estoque;
ALTER PUBLICATION supabase_realtime ADD TABLE public.historico_estoque;

-- =====================================================
-- 5. TRANSFERÊNCIAS (status, confirmações)
-- =====================================================
ALTER TABLE public.transferencias REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS public.transferencias;
ALTER PUBLICATION supabase_realtime ADD TABLE public.transferencias;

ALTER TABLE public.transferencias_itens REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS public.transferencias_itens;
ALTER PUBLICATION supabase_realtime ADD TABLE public.transferencias_itens;

-- =====================================================
-- 6. ORDEM DE SERVIÇO (atualizações de status)
-- =====================================================
ALTER TABLE public.ordem_servico REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS public.ordem_servico;
ALTER PUBLICATION supabase_realtime ADD TABLE public.ordem_servico;

ALTER TABLE public.ordem_servico_pecas REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS public.ordem_servico_pecas;
ALTER PUBLICATION supabase_realtime ADD TABLE public.ordem_servico_pecas;

-- =====================================================
-- 7. CAIXA (movimentações financeiras)
-- =====================================================
ALTER TABLE public.caixa REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS public.caixa;
ALTER PUBLICATION supabase_realtime ADD TABLE public.caixa;

-- =====================================================
-- 8. DEVOLUÇÕES (atualizações de status)
-- =====================================================
ALTER TABLE public.devolucoes REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS public.devolucoes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.devolucoes;

ALTER TABLE public.devolucoes_itens REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS public.devolucoes_itens;
ALTER PUBLICATION supabase_realtime ADD TABLE public.devolucoes_itens;

-- =====================================================
-- 9. RMA (atualizações de status)
-- =====================================================
ALTER TABLE public.rma REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS public.rma;
ALTER PUBLICATION supabase_realtime ADD TABLE public.rma;

ALTER TABLE public.rma_produtos REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS public.rma_produtos;
ALTER PUBLICATION supabase_realtime ADD TABLE public.rma_produtos;

-- =====================================================
-- 10. CONFIGURAÇÕES (mudanças globais do sistema)
-- =====================================================
ALTER TABLE public.configuracoes_usuario REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS public.configuracoes_usuario;
ALTER PUBLICATION supabase_realtime ADD TABLE public.configuracoes_usuario;

-- =====================================================
-- 11. CLIENTES E TÉCNICOS (alterações cadastrais)
-- =====================================================
ALTER TABLE public.clientes REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS public.clientes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.clientes;

ALTER TABLE public.tecnicos REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS public.tecnicos;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tecnicos;

-- =====================================================
-- 12. FORNECEDORES (alterações cadastrais)
-- =====================================================
ALTER TABLE public.fornecedores REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS public.fornecedores;
ALTER PUBLICATION supabase_realtime ADD TABLE public.fornecedores;

ALTER TABLE public.produtos_fornecedores REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS public.produtos_fornecedores;
ALTER PUBLICATION supabase_realtime ADD TABLE public.produtos_fornecedores;

-- =====================================================
-- VERIFICAÇÃO FINAL
-- =====================================================
SELECT 
  schemaname,
  tablename,
  '✅ REALTIME HABILITADO' as status
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime'
  AND schemaname = 'public'
ORDER BY tablename;

-- =====================================================
-- INSTRUÇÕES DE USO
-- =====================================================
/*
1. EXECUTAR NO SUPABASE:
   - Acesse: Supabase Dashboard > SQL Editor
   - Cole este script completo
   - Execute (Run)
   - Verifique a lista de tabelas no final

2. VERIFICAR NO DASHBOARD:
   - Vá em: Database > Replication
   - Todas as tabelas listadas devem aparecer
   - Verifique se os eventos estão marcados: INSERT, UPDATE, DELETE

3. TESTAR REALTIME:
   - Abra o sistema em duas abas
   - Faça uma alteração em uma aba (ex: atualizar permissão)
   - Veja a outra aba atualizar automaticamente
   - Verifique o console (F12) para logs de "✅ [REALTIME]"

4. TROUBLESHOOTING:
   - Se não aparecer: Adicionar manualmente via Dashboard
   - Se não atualizar: Verificar políticas RLS
   - Se der erro: Verificar se tabela existe no banco
*/

-- =====================================================
-- DESABILITAR REALTIME (se necessário)
-- =====================================================
/*
-- Para desabilitar uma tabela específica:
ALTER PUBLICATION supabase_realtime DROP TABLE public.permissoes;

-- Para desabilitar todas (NÃO RECOMENDADO):
-- ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS public.permissoes;
-- ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS public.notificacoes;
-- (... repetir para todas)
*/

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================
SELECT '✅ Script de habilitação de Realtime executado!' as resultado;
SELECT COUNT(*) || ' tabelas com Realtime habilitado' as total
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime' AND schemaname = 'public';
