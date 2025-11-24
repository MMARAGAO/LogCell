-- =====================================================
-- SOLUÇÃO COMPLETA PARA ERRO 500 - TABELA PERMISSOES
-- =====================================================
-- Execute este script COMPLETO no SQL Editor do Supabase
-- =====================================================

-- PASSO 1: Adicionar constraint UNIQUE no usuario_id
-- Isso permite usar .maybeSingle() sem erro
ALTER TABLE public.permissoes 
ADD CONSTRAINT permissoes_usuario_id_unique UNIQUE (usuario_id);

-- PASSO 2: Habilitar RLS
ALTER TABLE public.permissoes ENABLE ROW LEVEL SECURITY;

-- PASSO 3: Remover políticas antigas (se existirem)
DROP POLICY IF EXISTS "Usuários podem ler suas próprias permissões" ON public.permissoes;
DROP POLICY IF EXISTS "Admins podem inserir permissões" ON public.permissoes;
DROP POLICY IF EXISTS "Admins podem atualizar permissões" ON public.permissoes;
DROP POLICY IF EXISTS "Admins podem deletar permissões" ON public.permissoes;
DROP POLICY IF EXISTS "Todos podem ler permissões" ON public.permissoes;
DROP POLICY IF EXISTS "Admins podem gerenciar permissões" ON public.permissoes;

-- PASSO 4: Criar política permissiva para SELECT (todos usuários autenticados)
CREATE POLICY "Permitir leitura de permissões"
ON public.permissoes
FOR SELECT
TO authenticated
USING (true);

-- PASSO 5: Criar política para INSERT (apenas admins)
CREATE POLICY "Admins podem criar permissões"
ON public.permissoes
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.usuarios
    WHERE id = auth.uid()
    AND email IN ('admin@logcell.com', 'matheusmoxil@gmail.com')
  )
);

-- PASSO 6: Criar política para UPDATE (apenas admins)
CREATE POLICY "Admins podem atualizar permissões"
ON public.permissoes
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.usuarios
    WHERE id = auth.uid()
    AND email IN ('admin@logcell.com', 'matheusmoxil@gmail.com')
  )
);

-- PASSO 7: Criar política para DELETE (apenas admins)
CREATE POLICY "Admins podem deletar permissões"
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

-- PASSO 8: Verificar se tudo está correto
SELECT 
  'Constraint UNIQUE' as verificacao,
  COUNT(*) as total
FROM information_schema.table_constraints
WHERE table_name = 'permissoes' 
  AND constraint_type = 'UNIQUE'
UNION ALL
SELECT 
  'Políticas RLS' as verificacao,
  COUNT(*) as total
FROM pg_policies
WHERE tablename = 'permissoes'
UNION ALL
SELECT 
  'Registros existentes' as verificacao,
  COUNT(*) as total
FROM public.permissoes;

-- PASSO 9: Testar acesso
SELECT 
  p.id,
  u.nome,
  u.email,
  jsonb_array_length(p.permissoes) as total_permissoes
FROM public.permissoes p
JOIN public.usuarios u ON u.id = p.usuario_id;

-- =====================================================
-- PRONTO! Agora teste na aplicação:
-- 1. Recarregue a página
-- 2. O erro 500 não deve aparecer mais
-- 3. Sistema usará permissões padrão do perfil
-- =====================================================
