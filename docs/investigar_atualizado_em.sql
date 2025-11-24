-- Investigar funções que mencionam "atualizado_em"
-- para encontrar onde está o problema

-- 1. Buscar todas as funções que mencionam "atualizado_em"
SELECT 
    n.nspname as schema,
    p.proname as function_name,
    pg_get_functiondef(p.oid) as function_definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE pg_get_functiondef(p.oid) ILIKE '%atualizado_em%'
  AND n.nspname = 'public'
ORDER BY p.proname;

-- 2. Buscar triggers que usam funções com "atualizado"
SELECT 
    t.tgname AS trigger_name,
    c.relname AS table_name,
    p.proname AS function_name,
    pg_get_functiondef(p.oid) as function_code
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE pg_get_functiondef(p.oid) ILIKE '%atualizado%'
  AND c.relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
ORDER BY c.relname, t.tgname;
