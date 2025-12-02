-- Verificar se o registro existe exatamente como esperado
SELECT 
    e.id,
    e.id_produto,
    e.id_loja,
    e.quantidade,
    p.descricao,
    p.ativo
FROM estoque_lojas e
LEFT JOIN produtos p ON p.id = e.id_produto
WHERE e.id_produto = 'cebb1ad4-765c-4882-857d-c7a225785e72'
  AND e.id_loja = 3;

-- Verificar se há alguma política RLS bloqueando
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'estoque_lojas';
