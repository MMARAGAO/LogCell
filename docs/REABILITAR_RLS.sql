-- =====================================================
-- REABILITAR RLS COM POLÍTICAS CORRETAS
-- =====================================================
-- Execute DEPOIS de rodar FIX_POLITICAS_RLS_PERMISSOES.sql
-- =====================================================

-- PASSO 1: Reabilitar RLS
ALTER TABLE public.permissoes ENABLE ROW LEVEL SECURITY;

-- PASSO 2: Verificar se está habilitado
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename = 'permissoes';
-- Deve retornar rowsecurity = true

-- PASSO 3: Verificar políticas ativas
SELECT 
  policyname,
  cmd,
  permissive,
  roles
FROM pg_policies
WHERE tablename = 'permissoes'
ORDER BY policyname;
-- Deve mostrar 4 políticas: allow_select_all, allow_insert_own, allow_update_own, allow_delete_admin

-- PASSO 4: Testar acesso (não deve dar erro 500)
SELECT COUNT(*) FROM public.permissoes;
