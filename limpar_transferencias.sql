-- =====================================================
-- SCRIPT DE LIMPEZA - TRANSFERÊNCIAS
-- =====================================================
-- Remove TODAS as transferências e registros relacionados
-- ⚠️  ATENÇÃO: Esta operação é IRREVERSÍVEL!
-- =====================================================

-- =====================================================
-- PASSO 1: Remover registros relacionados a TRANSFERÊNCIAS
-- =====================================================

-- 1.1 - Limpar itens de transferência
DELETE FROM public.transferencias_itens;

-- =====================================================
-- PASSO 2: Remover TRANSFERÊNCIAS
-- =====================================================

DELETE FROM public.transferencias;

-- =====================================================
-- PASSO 3: Resetar sequências (se houver)
-- =====================================================

-- Transferências usam UUID, então não há sequência para resetar

-- =====================================================
-- VERIFICAÇÃO FINAL
-- =====================================================

-- Verificar se foi tudo removido
SELECT COUNT(*) as total_transferencias FROM public.transferencias;
SELECT COUNT(*) as total_itens_transferencias FROM public.transferencias_itens;

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================
