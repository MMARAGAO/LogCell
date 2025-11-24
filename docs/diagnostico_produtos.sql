-- Diagnóstico da tabela produtos

-- 1. Ver todas as colunas da tabela produtos
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'produtos'
ORDER BY ordinal_position;

-- 2. Ver todos os triggers ativos na tabela produtos
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE event_object_table = 'produtos';

-- 3. Ver definição da função usada pelo trigger
SELECT 
    p.proname as function_name,
    pg_get_functiondef(p.oid) as definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND p.proname LIKE '%produtos%'
OR p.proname LIKE '%updated%'
OR p.proname LIKE '%atualizado%';
