-- =====================================================
-- BUSCAR TODAS AS POLÍTICAS RLS DA TABELA PERMISSOES
-- =====================================================

-- 1. Ver TODAS as políticas da tabela permissoes
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual as "USING (condição)",
  with_check as "WITH CHECK (condição)"
FROM pg_policies
WHERE tablename = 'permissoes'
ORDER BY policyname;

-- 2. Ver status do RLS
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_habilitado
FROM pg_tables
WHERE tablename = 'permissoes';

-- 3. Ver detalhes técnicos de cada política
SELECT 
  pol.polname as "Nome da Política",
  CASE pol.polcmd
    WHEN 'r' THEN 'SELECT'
    WHEN 'a' THEN 'INSERT'
    WHEN 'w' THEN 'UPDATE'
    WHEN 'd' THEN 'DELETE'
    WHEN '*' THEN 'ALL'
  END as "Comando",
  CASE pol.polpermissive
    WHEN true THEN 'PERMISSIVE'
    WHEN false THEN 'RESTRICTIVE'
  END as "Tipo",
  pg_get_expr(pol.polqual, pol.polrelid) as "Expressão USING",
  pg_get_expr(pol.polwithcheck, pol.polrelid) as "Expressão WITH CHECK"
FROM pg_policy pol
JOIN pg_class cls ON pol.polrelid = cls.oid
WHERE cls.relname = 'permissoes'
ORDER BY pol.polname;

-- 4. Verificar se há triggers na tabela (podem causar recursão)
SELECT 
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'permissoes'
ORDER BY trigger_name;

-- 5. Ver todas as foreign keys relacionadas
SELECT 
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'permissoes'
  AND tc.constraint_type = 'FOREIGN KEY';

-- =====================================================
-- SCRIPT PARA REMOVER TODAS AS POLÍTICAS ENCONTRADAS
-- (Execute após ver os resultados acima)
-- =====================================================
/*
-- Descomente as linhas abaixo após identificar os nomes corretos:

DROP POLICY IF EXISTS "allow_select_all_permissoes" ON public.permissoes;
DROP POLICY IF EXISTS "allow_insert_own_permissoes" ON public.permissoes;
DROP POLICY IF EXISTS "allow_update_own_permissoes" ON public.permissoes;
DROP POLICY IF EXISTS "allow_delete_admin_permissoes" ON public.permissoes;
DROP POLICY IF EXISTS "permissoes_select_all" ON public.permissoes;
DROP POLICY IF EXISTS "permissoes_insert_own" ON public.permissoes;
DROP POLICY IF EXISTS "permissoes_update_own" ON public.permissoes;
DROP POLICY IF EXISTS "permissoes_delete_own" ON public.permissoes;

-- Desabilitar RLS
ALTER TABLE public.permissoes DISABLE ROW LEVEL SECURITY;
*/
