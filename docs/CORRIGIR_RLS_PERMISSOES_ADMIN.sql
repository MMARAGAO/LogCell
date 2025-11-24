-- =====================================================
-- CORRIGIR RLS PERMISSÕES - PERMITIR ADMINS
-- =====================================================
-- Problema: Apenas o próprio usuário pode atualizar suas permissões
-- Solução: Permitir que admins atualizem permissões de qualquer usuário
-- =====================================================

-- PASSO 1: Remover políticas antigas de UPDATE e INSERT
DROP POLICY IF EXISTS "allow_insert_own_permissoes" ON public.permissoes;
DROP POLICY IF EXISTS "allow_update_own_permissoes" ON public.permissoes;

-- PASSO 2: Criar política para INSERT permitindo:
-- 1. O próprio usuário pode inserir suas permissões
-- 2. Usuários com permissão usuarios.gerenciar_permissoes
-- 3. Emails específicos de admin
CREATE POLICY "allow_insert_permissoes_admin"
ON public.permissoes
FOR INSERT
TO authenticated
WITH CHECK (
  -- Pode inserir suas próprias permissões
  usuario_id = auth.uid()
  OR
  -- Ou se for admin por email
  EXISTS (
    SELECT 1 FROM public.usuarios
    WHERE id = auth.uid()
    AND email IN ('admin@logcell.com', 'matheusmoxil@gmail.com')
  )
  OR
  -- Ou se tiver permissão de gerenciar permissões
  EXISTS (
    SELECT 1 FROM public.permissoes p
    WHERE p.usuario_id = auth.uid()
    AND (p.permissoes->'usuarios'->>'gerenciar_permissoes')::boolean = true
  )
);

-- PASSO 3: Criar política para UPDATE permitindo os mesmos casos
CREATE POLICY "allow_update_permissoes_admin"
ON public.permissoes
FOR UPDATE
TO authenticated
USING (
  -- Pode atualizar suas próprias permissões
  usuario_id = auth.uid()
  OR
  -- Ou se for admin por email
  EXISTS (
    SELECT 1 FROM public.usuarios
    WHERE id = auth.uid()
    AND email IN ('admin@logcell.com', 'matheusmoxil@gmail.com')
  )
  OR
  -- Ou se tiver permissão de gerenciar permissões
  EXISTS (
    SELECT 1 FROM public.permissoes p
    WHERE p.usuario_id = auth.uid()
    AND (p.permissoes->'usuarios'->>'gerenciar_permissoes')::boolean = true
  )
)
WITH CHECK (
  -- Mesma validação no WITH CHECK
  usuario_id = auth.uid()
  OR
  EXISTS (
    SELECT 1 FROM public.usuarios
    WHERE id = auth.uid()
    AND email IN ('admin@logcell.com', 'matheusmoxil@gmail.com')
  )
  OR
  EXISTS (
    SELECT 1 FROM public.permissoes p
    WHERE p.usuario_id = auth.uid()
    AND (p.permissoes->'usuarios'->>'gerenciar_permissoes')::boolean = true
  )
);

-- PASSO 4: Verificar políticas criadas
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
ORDER BY cmd, policyname;

-- PASSO 5: Testar atualização
-- Você pode testar manualmente fazendo um UPDATE:
-- UPDATE public.permissoes 
-- SET permissoes = '{"usuarios": {"gerenciar_permissoes": true}}'::jsonb
-- WHERE usuario_id = 'SEU_USER_ID';

SELECT 'Políticas RLS corrigidas com sucesso!' as status;
