-- =====================================================
-- SCRIPT DE LIMPEZA - FORNECEDORES (VERSÃO SIMPLIFICADA)
-- =====================================================
-- Remove TODOS os fornecedores e registros relacionados
-- ⚠️  ATENÇÃO: Esta operação é IRREVERSÍVEL!
-- =====================================================

-- =====================================================
-- SOLUÇÃO SIMPLES: Truncate com CASCADE
-- =====================================================
-- Truncate remove todos os dados e ignora triggers

-- Limpar tudo de uma vez
TRUNCATE TABLE public.fornecedores CASCADE;

-- Isso também limpa automaticamente:
-- - produtos_fornecedores
-- - historico_fornecedores

-- =====================================================
-- VERIFICAÇÃO FINAL
-- =====================================================

-- Verificar se foi tudo removido
SELECT COUNT(*) as total_fornecedores FROM public.fornecedores;
SELECT COUNT(*) as total_produtos_fornecedores FROM public.produtos_fornecedores;
SELECT COUNT(*) as total_historico_fornecedores FROM public.historico_fornecedores;

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================
