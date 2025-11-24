-- =====================================================
-- BUSCAR TODOS OS TRIGGERS E FUNÇÕES
-- =====================================================

-- 1. Ver TODOS os triggers da tabela usuarios
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'usuarios'
ORDER BY trigger_name;

-- 2. Ver código de TODAS as funções que podem estar envolvidas
SELECT 
    p.proname as function_name,
    pg_get_functiondef(p.oid) as full_definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND (
    p.proname LIKE '%usuario%' 
    OR p.proname LIKE '%historico%'
)
ORDER BY p.proname;

-- =====================================================
-- Execute e me mostre o resultado
-- =====================================================
