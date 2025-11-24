-- Verificar políticas de UPDATE na tabela vendas
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
WHERE tablename = 'vendas' 
  AND cmd = 'UPDATE';

-- Se nenhuma política aparecer, o UPDATE pode estar bloqueado
-- Nesse caso, precisamos adicionar uma política de UPDATE

-- Verificar também se RLS está ativado
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'vendas';
