-- VERIFICAR POLÍTICAS RLS DA TABELA PERMISSOES

-- 1. Ver todas as políticas da tabela permissoes
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
WHERE tablename = 'permissoes'
ORDER BY policyname;

-- 2. Verificar se RLS está habilitado
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'permissoes';

-- 3. Testar se o usuário atual consegue ver suas próprias permissões
SELECT 
  id,
  usuario_id,
  loja_id,
  todas_lojas,
  auth.uid() as meu_id,
  (usuario_id = auth.uid()) as sou_eu
FROM permissoes
WHERE usuario_id = auth.uid();
