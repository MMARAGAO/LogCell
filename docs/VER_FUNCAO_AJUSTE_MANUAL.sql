-- Ver o código da função que a trigger realmente chama
SELECT 
    p.proname as function_name,
    pg_get_functiondef(p.oid) as function_code
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
  AND p.proname = 'registrar_historico_ajuste_manual';

-- Testar um UPDATE manual para ver se gera registro
-- (substitua os IDs por valores reais do seu sistema)
/*
UPDATE estoque_lojas 
SET quantidade = quantidade + 1
WHERE id = '07396225-f400-4224-ab0f-03c61683ac4e';

-- Depois verifique se criou registro:
SELECT * FROM historico_estoque 
WHERE id_produto = 'cebb1ad4-765c-4882-857d-c7a225785e72' 
  AND id_loja = 3
ORDER BY criado_em DESC 
LIMIT 3;
*/
