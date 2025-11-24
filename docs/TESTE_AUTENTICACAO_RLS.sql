-- =====================================================
-- TESTE DE ACESSO COM AUTENTICAÇÃO
-- =====================================================

-- 1. Verificar o usuário atual da sessão (se estiver logado no SQL Editor)
SELECT 
  auth.uid() as meu_user_id,
  auth.email() as meu_email;

-- 2. Ver se o usuário existe na tabela usuarios
SELECT 
  id,
  nome,
  email,
  ativo
FROM public.usuarios
WHERE id = '1c0d76a8-563c-47f4-8583-4a8fcb2a063f';

-- 3. Testar política RLS diretamente
-- Este SELECT deve funcionar se as políticas estão corretas
SELECT 
  COUNT(*) as total_registros
FROM public.permissoes;

-- 4. Ver todas as políticas ativas
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

-- 5. Verificar se RLS está habilitado
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_habilitado
FROM pg_tables
WHERE tablename = 'permissoes';
