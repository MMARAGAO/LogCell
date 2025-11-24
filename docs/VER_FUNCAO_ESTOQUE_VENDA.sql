-- Ver o código da função que está causando o erro
SELECT pg_get_functiondef(oid)
FROM pg_proc
WHERE proname = 'atualizar_estoque_venda';

-- Alternativa se o comando acima não funcionar:
SELECT 
    n.nspname as schema,
    p.proname as function_name,
    pg_get_function_identity_arguments(p.oid) as arguments,
    pg_get_functiondef(p.oid) as definition
FROM pg_proc p
LEFT JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE p.proname = 'atualizar_estoque_venda';
