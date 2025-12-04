-- ============================================================================
-- VERIFICAR TRIGGERS: itens_venda
-- ============================================================================

-- 1. Listar todas as triggers na tabela itens_venda
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_timing,
    action_statement
FROM information_schema.triggers
WHERE event_object_table = 'itens_venda'
ORDER BY trigger_name;

-- 2. Ver detalhes das funções chamadas pelas triggers
SELECT 
    n.nspname as schema_name,
    p.proname as function_name,
    pg_get_functiondef(p.oid) as function_definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE p.proname LIKE '%item%venda%' OR p.proname LIKE '%estoque%'
ORDER BY p.proname;

-- ============================================================================
-- FIM DO SCRIPT
-- ============================================================================
