-- =====================================================
-- FIX FINAL - POLÍTICAS SEM RECURSÃO
-- =====================================================

-- PASSO 1: Remover TODAS as políticas
DROP POLICY IF EXISTS "allow_select_all_permissoes" ON public.permissoes;
DROP POLICY IF EXISTS "allow_insert_own_permissoes" ON public.permissoes;
DROP POLICY IF EXISTS "allow_update_own_permissoes" ON public.permissoes;
DROP POLICY IF EXISTS "allow_delete_admin_permissoes" ON public.permissoes;

-- PASSO 2: Criar política SIMPLES para SELECT (sem subquery)
-- Permite que TODOS os usuários autenticados leiam TODAS as permissões
CREATE POLICY "permissoes_select_all"
ON public.permissoes
FOR SELECT
TO authenticated
USING (true);

-- PASSO 3: Criar política SIMPLES para INSERT (sem subquery)
-- Permite que todos usuários autenticados insiram apenas suas próprias permissões
CREATE POLICY "permissoes_insert_own"
ON public.permissoes
FOR INSERT
TO authenticated
WITH CHECK (usuario_id = auth.uid());

-- PASSO 4: Criar política SIMPLES para UPDATE (sem subquery)
-- Permite que todos usuários autenticados atualizem apenas suas próprias permissões
CREATE POLICY "permissoes_update_own"
ON public.permissoes
FOR UPDATE
TO authenticated
USING (usuario_id = auth.uid());

-- PASSO 5: Criar política SIMPLES para DELETE (sem subquery)
-- Permite que todos usuários autenticados deletem apenas suas próprias permissões
CREATE POLICY "permissoes_delete_own"
ON public.permissoes
FOR DELETE
TO authenticated
USING (usuario_id = auth.uid());

-- PASSO 6: Verificar políticas criadas
SELECT 
  policyname,
  cmd,
  permissive,
  roles
FROM pg_policies
WHERE tablename = 'permissoes'
ORDER BY policyname;

-- PASSO 7: Testar (NÃO deve dar erro de recursão)
SELECT COUNT(*) FROM public.permissoes;

-- =====================================================
-- RESULTADO ESPERADO:
-- =====================================================
-- ✅ Sem recursão infinita (não há subqueries)
-- ✅ Todos podem ler permissões
-- ✅ Cada um só pode modificar suas próprias permissões
-- =====================================================

-- OBSERVAÇÃO: 
-- Para permitir que apenas admins gerenciem permissões de outros,
-- isso deve ser feito via server action com service role key,
-- não via RLS (para evitar recursão).
