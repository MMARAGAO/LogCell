-- =====================================================
-- SCRIPT DE LIMPEZA - CAIXAS
-- =====================================================
-- Remove TODOS os dados de caixa e registros relacionados
-- ⚠️  ATENÇÃO: NÃO remove as lojas, apenas dados de caixa!
-- ⚠️  Esta operação é IRREVERSÍVEL!
-- =====================================================

-- =====================================================
-- PASSO 1: Remover registros relacionados a CAIXAS
-- =====================================================

-- 1.1 - Limpar sangrias de caixa
DELETE FROM public.sangrias_caixa;

-- =====================================================
-- PASSO 2: Remover CAIXAS
-- =====================================================

DELETE FROM public.caixas;

-- =====================================================
-- PASSO 3: Resetar sequências (se houver)
-- =====================================================

-- Caixas usam UUID, então não há sequência para resetar

-- =====================================================
-- VERIFICAÇÃO FINAL
-- =====================================================

-- Verificar se foi tudo removido
SELECT COUNT(*) as total_caixas FROM public.caixas;
SELECT COUNT(*) as total_sangrias FROM public.sangrias_caixa;

-- Verificar que as lojas ainda existem
SELECT COUNT(*) as total_lojas FROM public.lojas;

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================
