SELECT proname 
FROM pg_proc 
WHERE pg_get_functiondef(oid) ILIKE '%operacao%'
AND pg_get_functiondef(oid) ILIKE '%historico_produtos%';
