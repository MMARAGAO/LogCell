-- Ver TODOS os triggers ativos relacionados a estoque e notificações
SELECT 
  t.tgname AS trigger_name,
  c.relname AS table_name,
  p.proname AS function_name,
  CASE 
    WHEN t.tgenabled = 'O' THEN 'ENABLED'
    ELSE 'DISABLED'
  END AS status,
  pg_get_triggerdef(t.oid) AS trigger_definition
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE c.relname IN ('estoque_lojas', 'ordem_servico_pecas', 'notificacoes')
  AND t.tgname NOT LIKE 'RI_%'
ORDER BY c.relname, t.tgname;

-- Ver código de TODAS as funções relacionadas a notificações e estoque
SELECT 
  p.proname AS function_name,
  pg_get_functiondef(p.oid) AS function_code
FROM pg_proc p
WHERE p.proname ILIKE '%notifica%'
   OR p.proname ILIKE '%estoque%'
   OR p.proname ILIKE '%alerta%'
ORDER BY p.proname;
