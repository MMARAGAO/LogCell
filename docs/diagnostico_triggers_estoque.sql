-- =====================================================
-- DIAGNÓSTICO E CORREÇÃO DE TRIGGERS
-- =====================================================

-- 1. Ver todos os triggers na tabela estoque_lojas
SELECT 
    t.trigger_name,
    t.event_manipulation,
    t.action_statement,
    t.action_timing,
    t.action_orientation
FROM information_schema.triggers t
WHERE t.event_object_table = 'estoque_lojas'
AND t.event_object_schema = 'public';

-- 2. Ver todas as funções de trigger
SELECT 
    p.proname as function_name,
    pg_get_functiondef(p.oid) as definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE p.proname LIKE '%estoque%'
AND n.nspname = 'public'
AND p.prokind = 'f';
