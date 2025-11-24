-- =====================================================
-- FIX RÁPIDO - POLÍTICAS RLS PERMISSÕES
-- =====================================================
-- A constraint UNIQUE já existe
-- O problema são as POLÍTICAS RLS bloqueando o SELECT
-- =====================================================

-- PASSO 1: Remover TODAS as políticas antigas
DROP POLICY IF EXISTS "allow_select_permissoes" ON public.permissoes;
DROP POLICY IF EXISTS "allow_insert_permissoes" ON public.permissoes;
DROP POLICY IF EXISTS "allow_update_permissoes" ON public.permissoes;
DROP POLICY IF EXISTS "allow_delete_permissoes" ON public.permissoes;
DROP POLICY IF EXISTS "permissoes_select_policy" ON public.permissoes;
DROP POLICY IF EXISTS "permissoes_insert_policy" ON public.permissoes;
DROP POLICY IF EXISTS "permissoes_update_policy" ON public.permissoes;
DROP POLICY IF EXISTS "permissoes_delete_policy" ON public.permissoes;

-- PASSO 2: Criar política PERMISSIVA para SELECT (permite TODOS os usuários autenticados)
CREATE POLICY "allow_select_all_permissoes"
ON public.permissoes
FOR SELECT
TO authenticated
USING (true);

-- PASSO 3: Criar política para INSERT (apenas admins via email)
CREATE POLICY "allow_insert_own_permissoes"
ON public.permissoes
FOR INSERT
TO authenticated
WITH CHECK (
  usuario_id = auth.uid()
  OR
  EXISTS (
    SELECT 1 FROM public.usuarios
    WHERE id = auth.uid()
    AND email IN ('admin@logcell.com', 'matheusmoxil@gmail.com')
  )
);

-- PASSO 4: Criar política para UPDATE (apenas admins via email)
CREATE POLICY "allow_update_own_permissoes"
ON public.permissoes
FOR UPDATE
TO authenticated
USING (
  usuario_id = auth.uid()
  OR
  EXISTS (
    SELECT 1 FROM public.usuarios
    WHERE id = auth.uid()
    AND email IN ('admin@logcell.com', 'matheusmoxil@gmail.com')
  )
);

-- PASSO 5: Criar política para DELETE (apenas admins via email)
CREATE POLICY "allow_delete_admin_permissoes"
ON public.permissoes
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.usuarios
    WHERE id = auth.uid()
    AND email IN ('admin@logcell.com', 'matheusmoxil@gmail.com')
  )
);

-- PASSO 6: Verificar políticas criadas
SELECT 
  policyname,
  cmd,
  permissive,
  roles
FROM pg_policies
WHERE tablename = 'permissoes'
ORDER BY policyname;

-- PASSO 7: Testar SELECT (NÃO deve dar erro 500)
SELECT COUNT(*) FROM public.permissoes;

-- =====================================================
-- RESULTADO ESPERADO:
-- =====================================================
-- O erro 500 deve sumir porque agora:
-- 1. UNIQUE constraint já existe (verificado)
-- 2. SELECT policy permite todos usuários autenticados
-- 3. INSERT/UPDATE permitem admin OU próprio usuário
-- 4. DELETE permite apenas admin
-- =====================================================
