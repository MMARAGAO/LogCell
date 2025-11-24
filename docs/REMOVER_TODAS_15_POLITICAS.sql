-- =====================================================
-- REMOVER TODAS AS 15 POLÍTICAS RLS
-- =====================================================

-- Remover políticas que causam recursão
DROP POLICY IF EXISTS "Admins podem atualizar permissões" ON public.permissoes;
DROP POLICY IF EXISTS "Admins podem deletar permissões" ON public.permissoes;
DROP POLICY IF EXISTS "Admins podem gerenciar" ON public.permissoes;
DROP POLICY IF EXISTS "Admins podem gerenciar permissões" ON public.permissoes;
DROP POLICY IF EXISTS "Admins podem inserir permissões" ON public.permissoes;
DROP POLICY IF EXISTS "Admins podem visualizar todas as permissões" ON public.permissoes;

-- Remover políticas duplicadas/antigas
DROP POLICY IF EXISTS "Permitir leitura de permissões" ON public.permissoes;
DROP POLICY IF EXISTS "Usuários podem ler suas próprias permissões" ON public.permissoes;
DROP POLICY IF EXISTS "Usuários podem visualizar suas próprias permissões" ON public.permissoes;
DROP POLICY IF EXISTS "permissoes_all_service_role" ON public.permissoes;
DROP POLICY IF EXISTS "permissoes_delete_own" ON public.permissoes;
DROP POLICY IF EXISTS "permissoes_insert_own" ON public.permissoes;
DROP POLICY IF EXISTS "permissoes_select_all" ON public.permissoes;
DROP POLICY IF EXISTS "permissoes_select_own" ON public.permissoes;
DROP POLICY IF EXISTS "permissoes_update_own" ON public.permissoes;

-- Verificar que NÃO há mais políticas
SELECT 
  policyname
FROM pg_policies
WHERE tablename = 'permissoes';
-- Deve retornar VAZIO

-- =====================================================
-- CRIAR APENAS 4 POLÍTICAS SIMPLES (SEM RECURSÃO)
-- =====================================================

-- SELECT: Todos podem ler (sem subquery)
CREATE POLICY "permissoes_select_simple"
ON public.permissoes
FOR SELECT
TO authenticated
USING (true);

-- INSERT: Apenas próprias permissões (sem subquery)
CREATE POLICY "permissoes_insert_simple"
ON public.permissoes
FOR INSERT
TO authenticated
WITH CHECK (usuario_id = auth.uid());

-- UPDATE: Apenas próprias permissões (sem subquery)
CREATE POLICY "permissoes_update_simple"
ON public.permissoes
FOR UPDATE
TO authenticated
USING (usuario_id = auth.uid());

-- DELETE: Apenas próprias permissões (sem subquery)
CREATE POLICY "permissoes_delete_simple"
ON public.permissoes
FOR DELETE
TO authenticated
USING (usuario_id = auth.uid());

-- Verificar novas políticas
SELECT 
  pol.polname as policyname,
  CASE pol.polcmd
    WHEN 'r' THEN 'SELECT'
    WHEN 'a' THEN 'INSERT'
    WHEN 'w' THEN 'UPDATE'
    WHEN 'd' THEN 'DELETE'
  END as cmd,
  pg_get_expr(pol.polqual, pol.polrelid) as "USING"
FROM pg_policy pol
JOIN pg_class cls ON pol.polrelid = cls.oid
WHERE cls.relname = 'permissoes'
ORDER BY pol.polname;

-- Testar (não deve dar erro de recursão)
SELECT COUNT(*) FROM public.permissoes;

-- =====================================================
-- RESULTADO ESPERADO:
-- =====================================================
-- ✅ 4 políticas simples sem recursão
-- ✅ SELECT funciona para todos
-- ✅ INSERT/UPDATE/DELETE apenas próprias permissões
-- ✅ Admins gerenciam via Server Actions (não RLS)
-- =====================================================
