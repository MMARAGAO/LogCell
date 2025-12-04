-- =====================================================
-- SCRIPT DE LIMPEZA - CLIENTES
-- =====================================================
-- Este script remove TODOS os clientes do banco novo
-- ⚠️  ATENÇÃO: Esta operação é IRREVERSÍVEL!
-- =====================================================

-- Desabilitar triggers temporariamente (se necessário)
-- SET session_replication_role = 'replica';

-- =====================================================
-- PASSO 1: Remover registros relacionados a VENDAS
-- =====================================================

-- 1.1 - Limpar histórico de vendas
DELETE FROM public.historico_vendas;

-- 1.2 - Limpar itens de devolução
DELETE FROM public.itens_devolucao;

-- 1.3 - Limpar devoluções de vendas
DELETE FROM public.devolucoes_venda;

-- 1.4 - Limpar descontos de vendas
DELETE FROM public.descontos_venda;

-- 1.5 - Limpar pagamentos de vendas
DELETE FROM public.pagamentos_venda;

-- 1.6 - Limpar itens de vendas
DELETE FROM public.itens_venda;

-- 1.7 - Limpar trocas de produtos (se existir)
DELETE FROM public.trocas_produtos WHERE venda_id IS NOT NULL;

-- 1.8 - Limpar sangrias de caixa vinculadas a vendas (se existir)
DELETE FROM public.sangrias_caixa WHERE venda_id IS NOT NULL;

-- =====================================================
-- PASSO 2: Remover VENDAS
-- =====================================================

DELETE FROM public.vendas;

-- =====================================================
-- PASSO 3: Remover registros relacionados a CLIENTES
-- =====================================================

-- 3.1 - Limpar créditos de clientes
DELETE FROM public.creditos_cliente;

-- =====================================================
-- PASSO 4: Remover CLIENTES
-- =====================================================

DELETE FROM public.clientes;

-- =====================================================
-- PASSO 5: Resetar sequências (se necessário)
-- =====================================================

-- Clientes e vendas usam UUID, então não há sequência para resetar

-- =====================================================
-- PASSO 6: Reabilitar triggers (se desabilitou)
-- =====================================================

-- SET session_replication_role = 'origin';

-- =====================================================
-- VERIFICAÇÃO FINAL
-- =====================================================

-- Verificar se foi tudo removido
SELECT COUNT(*) as total_clientes FROM public.clientes;
SELECT COUNT(*) as total_creditos FROM public.creditos_cliente;
SELECT COUNT(*) as total_vendas FROM public.vendas;
SELECT COUNT(*) as total_itens_venda FROM public.itens_venda;

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================
