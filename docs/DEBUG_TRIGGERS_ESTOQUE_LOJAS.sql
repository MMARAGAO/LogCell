-- Ver TODOS os triggers na tabela estoque_lojas
SELECT 
  t.tgname AS trigger_name,
  p.proname AS function_name,
  CASE 
    WHEN t.tgenabled = 'O' THEN 'ENABLED'
    WHEN t.tgenabled = 'D' THEN 'DISABLED'
    ELSE 'OTHER'
  END AS status,
  pg_get_triggerdef(t.oid) AS definition
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE c.relname = 'estoque_lojas'
  AND t.tgname NOT LIKE 'RI_%'
ORDER BY t.tgname;

-- Ver código da função registrar_historico_estoque para ver se chama criar_notificacao_estoque
SELECT pg_get_functiondef(p.oid)
FROM pg_proc p
WHERE p.proname = 'registrar_historico_estoque';
