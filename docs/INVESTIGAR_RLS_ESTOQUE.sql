-- =====================================================
-- INVESTIGAR: Verificar RLS em estoque_lojas
-- =====================================================

-- Ver políticas RLS em estoque_lojas
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
WHERE schemaname = 'public'
  AND tablename = 'estoque_lojas'
ORDER BY policyname;

-- Ver se RLS está habilitado
SELECT 
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename = 'estoque_lojas';

-- Tentar SELECT manual como se fosse o trigger
-- (usando SECURITY DEFINER, ele executa como dono da função)
SELECT 
  id,
  id_produto,
  id_loja,
  quantidade
FROM estoque_lojas
WHERE id_produto = 'e138eed1-e316-4d2a-990e-7f1ebdee06c7'
  AND id_loja = 16;
