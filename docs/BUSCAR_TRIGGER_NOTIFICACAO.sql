-- Buscar funções que contém criar_notificacao_estoque no nome
SELECT 
  p.proname AS function_name,
  'Contém criar_notificacao_estoque' AS info
FROM pg_proc p
WHERE p.proname ILIKE '%criar_notificacao%'
   OR p.proname ILIKE '%notifica%estoque%'
ORDER BY p.proname;

-- Ver todos os triggers em estoque_lojas com suas funções
SELECT 
  t.tgname AS trigger_name,
  p.proname AS function_name,
  CASE 
    WHEN t.tgenabled = 'O' THEN 'ENABLED'
    WHEN t.tgenabled = 'D' THEN 'DISABLED'
    ELSE 'OTHER'
  END AS status
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE c.relname = 'estoque_lojas'
  AND t.tgname NOT LIKE 'RI_%'
ORDER BY t.tgname;

-- Ver código da função criar_notificacao_estoque
SELECT pg_get_functiondef(p.oid)
FROM pg_proc p
WHERE p.proname = 'criar_notificacao_estoque';
