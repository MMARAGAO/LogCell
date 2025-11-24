-- =====================================================
-- LIMPEZA COMPLETA - REMOVER TUDO E RECOMEÇAR
-- =====================================================

-- PASSO 1: DESABILITAR RLS
ALTER TABLE public.permissoes DISABLE ROW LEVEL SECURITY;

-- PASSO 2: Ver TODAS as políticas que existem
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'permissoes';

-- PASSO 3: Remover TODAS as políticas (copie os nomes do PASSO 2 e execute)
-- Liste TODOS os nomes que aparecerem:
DROP POLICY IF EXISTS "allow_select_all_permissoes" ON public.permissoes;
DROP POLICY IF EXISTS "allow_insert_own_permissoes" ON public.permissoes;
DROP POLICY IF EXISTS "allow_update_own_permissoes" ON public.permissoes;
DROP POLICY IF EXISTS "allow_delete_admin_permissoes" ON public.permissoes;
DROP POLICY IF EXISTS "permissoes_select_all" ON public.permissoes;
DROP POLICY IF EXISTS "permissoes_insert_own" ON public.permissoes;
DROP POLICY IF EXISTS "permissoes_update_own" ON public.permissoes;
DROP POLICY IF EXISTS "permissoes_delete_own" ON public.permissoes;

-- PASSO 4: Confirmar que NÃO há mais políticas
SELECT 
  policyname
FROM pg_policies
WHERE tablename = 'permissoes';
-- Deve retornar VAZIO

-- PASSO 5: Testar se funciona SEM RLS
SELECT COUNT(*) FROM public.permissoes;

-- =====================================================
-- RESULTADO ESPERADO:
-- =====================================================
-- RLS desabilitado + sem políticas = deve funcionar
-- =====================================================

-- DEPOIS DE CONFIRMAR QUE FUNCIONA:
-- Você pode deixar assim (sem RLS) temporariamente
-- Ou criar políticas MUITO simples depois
