-- =====================================================
-- VERIFICAR DIFERENÇAS ENTRE POLÍTICAS
-- =====================================================

-- Ver políticas de fotos_perfil (que FUNCIONA)
SELECT 
  'fotos_perfil' as tabela,
  policyname,
  cmd,
  permissive,
  roles,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'fotos_perfil'
ORDER BY cmd, policyname;

-- Ver políticas de configuracoes_usuario (que NÃO FUNCIONA)
SELECT 
  'configuracoes_usuario' as tabela,
  policyname,
  cmd,
  permissive,
  roles,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'configuracoes_usuario'
ORDER BY cmd, policyname;

-- Verificar se RLS está ativado em ambas
SELECT 
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename IN ('fotos_perfil', 'configuracoes_usuario');
