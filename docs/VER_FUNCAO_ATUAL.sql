-- Ver definição COMPLETA da função atual
SELECT pg_get_functiondef(p.oid) as definicao_completa
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.proname = 'processar_baixa_estoque_os';
