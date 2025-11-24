-- =====================================================
-- CORRIGIR TABELA PERMISSOES E RLS
-- =====================================================
-- Execute este script no SQL Editor do Supabase
-- =====================================================

-- 1. Verificar se a tabela existe e sua estrutura
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'permissoes'
ORDER BY ordinal_position;

-- 2. Verificar constraint de unique no usuario_id
SELECT constraint_name, constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'permissoes' 
  AND table_schema = 'public';

-- 3. Se necessário, adicionar constraint UNIQUE no usuario_id
-- (Descomente se não existir)
-- ALTER TABLE public.permissoes
-- ADD CONSTRAINT permissoes_usuario_id_key UNIQUE (usuario_id);

-- 4. Habilitar RLS na tabela
ALTER TABLE public.permissoes ENABLE ROW LEVEL SECURITY;

-- 5. Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Permitir leitura de permissões para usuários autenticados" ON public.permissoes;
DROP POLICY IF EXISTS "Permitir inserção de permissões para admins" ON public.permissoes;
DROP POLICY IF EXISTS "Permitir atualização de permissões para admins" ON public.permissoes;
DROP POLICY IF EXISTS "Permitir exclusão de permissões para admins" ON public.permissoes;

-- 6. Criar políticas RLS permissivas

-- Política de SELECT: Usuários podem ler suas próprias permissões
CREATE POLICY "Usuários podem ler suas próprias permissões"
ON public.permissoes
FOR SELECT
TO authenticated
USING (
  usuario_id = auth.uid()
);

-- Política de INSERT: Admins podem inserir permissões
CREATE POLICY "Admins podem inserir permissões"
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

-- Política de UPDATE: Admins podem atualizar permissões
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

-- Política de DELETE: Admins podem deletar permissões
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

-- 7. Verificar se as políticas foram criadas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'permissoes'
ORDER BY policyname;

-- 8. Testar se a tabela está acessível
SELECT COUNT(*) as total_registros FROM public.permissoes;

-- 9. Se você quiser permitir que TODOS os usuários autenticados leiam permissões
-- (mais permissivo, use com cautela)
-- Descomente as linhas abaixo:

/*
DROP POLICY IF EXISTS "Usuários podem ler suas próprias permissões" ON public.permissoes;

CREATE POLICY "Todos podem ler permissões"
ON public.permissoes
FOR SELECT
TO authenticated
USING (true);
*/

-- 10. Verificar dados existentes
SELECT 
  p.id,
  p.usuario_id,
  u.nome,
  u.email,
  jsonb_array_length(p.permissoes) as total_permissoes,
  p.criado_em,
  p.atualizado_em
FROM public.permissoes p
LEFT JOIN public.usuarios u ON u.id = p.usuario_id;

-- =====================================================
-- OBSERVAÇÕES
-- =====================================================
-- O erro 500 geralmente ocorre por:
-- 1. RLS habilitado mas sem políticas corretas
-- 2. Constraint violada (ex: duplicate key)
-- 3. Permissões insuficientes no banco
-- 
-- Após executar este script, as permissões devem funcionar
-- =====================================================
