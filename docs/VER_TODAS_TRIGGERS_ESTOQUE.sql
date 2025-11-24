-- Verificar todas as triggers no estoque_lojas
SELECT 
    t.tgname as trigger_name,
    p.proname as function_name,
    pg_get_triggerdef(t.oid) as trigger_definition
FROM pg_trigger t
JOIN pg_proc p ON t.tgfoid = p.oid
JOIN pg_class c ON t.tgrelid = c.oid
WHERE c.relname = 'estoque_lojas'
  AND NOT t.tgisinternal
ORDER BY t.tgname;
