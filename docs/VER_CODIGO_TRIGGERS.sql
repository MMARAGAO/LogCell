-- Ver todos os triggers e suas funções associadas
SELECT 
    t.trigger_name,
    t.event_object_table as table_name,
    t.action_timing,
    t.event_manipulation,
    t.action_statement,
    pg_get_functiondef(p.oid) as function_code
FROM information_schema.triggers t
LEFT JOIN pg_proc p ON p.proname = REPLACE(REPLACE(t.action_statement, 'EXECUTE FUNCTION ', ''), '()', '')
WHERE t.trigger_schema = 'public'
ORDER BY t.event_object_table, t.trigger_name;
