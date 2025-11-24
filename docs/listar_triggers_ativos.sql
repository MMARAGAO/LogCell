-- =====================================================
-- LISTAR TODOS OS TRIGGERS ATIVOS NA TABELA USUARIOS
-- =====================================================

SELECT 
    t.tgname as trigger_name,
    p.proname as function_name,
    pg_get_triggerdef(t.oid) as trigger_definition
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE c.relname = 'usuarios'
AND t.tgisinternal = false
ORDER BY t.tgname;
