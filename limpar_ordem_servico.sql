-- =====================================================
-- SCRIPT DE LIMPEZA - ORDEM DE SERVIÇO
-- =====================================================
-- Remove TODAS as ordens de serviço e registros relacionados
-- ⚠️  ATENÇÃO: Esta operação é IRREVERSÍVEL!
-- =====================================================

-- =====================================================
-- PASSO 1: Remover registros relacionados a ORDEM DE SERVIÇO
-- =====================================================

-- 1.1 - Limpar histórico de ordem de serviço
DELETE FROM public.historico_ordem_servico;

-- 1.2 - Limpar anexos de ordem de serviço
DELETE FROM public.ordem_servico_anexos;

-- 1.3 - Limpar fotos de ordem de serviço
DELETE FROM public.ordem_servico_fotos;

-- 1.4 - Limpar pagamentos de ordem de serviço
DELETE FROM public.ordem_servico_pagamentos;

-- 1.5 - Limpar peças de ordem de serviço
DELETE FROM public.ordem_servico_pecas;

-- 1.6 - Limpar caixa de ordem de serviço
DELETE FROM public.ordem_servico_caixa;

-- 1.7 - Limpar quebra de peças relacionadas
DELETE FROM public.quebra_pecas WHERE id_ordem_servico IS NOT NULL;

-- 1.8 - Limpar histórico de estoque relacionado
DELETE FROM public.historico_estoque WHERE id_ordem_servico IS NOT NULL;

-- =====================================================
-- PASSO 2: Remover ORDENS DE SERVIÇO
-- =====================================================

DELETE FROM public.ordem_servico;

-- =====================================================
-- PASSO 3: Resetar sequência do número da OS
-- =====================================================

-- Resetar a sequência do numero_os para começar do 1 novamente
ALTER SEQUENCE ordem_servico_numero_os_seq RESTART WITH 1;

-- =====================================================
-- VERIFICAÇÃO FINAL
-- =====================================================

-- Verificar se foi tudo removido
SELECT COUNT(*) as total_ordem_servico FROM public.ordem_servico;
SELECT COUNT(*) as total_historico_os FROM public.historico_ordem_servico;
SELECT COUNT(*) as total_pecas_os FROM public.ordem_servico_pecas;
SELECT COUNT(*) as total_pagamentos_os FROM public.ordem_servico_pagamentos;
SELECT COUNT(*) as total_fotos_os FROM public.ordem_servico_fotos;
SELECT COUNT(*) as total_anexos_os FROM public.ordem_servico_anexos;
SELECT COUNT(*) as total_caixa_os FROM public.ordem_servico_caixa;

-- Verificar sequência resetada
SELECT last_value FROM ordem_servico_numero_os_seq;

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================
