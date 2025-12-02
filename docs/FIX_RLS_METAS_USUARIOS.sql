-- CORRIGIR RLS DA TABELA METAS_USUARIOS

-- Remover políticas existentes (se houver)
DROP POLICY IF EXISTS "Admins podem ver todas as metas" ON public.metas_usuarios;
DROP POLICY IF EXISTS "Usuarios podem ver suas proprias metas" ON public.metas_usuarios;
DROP POLICY IF EXISTS "Admins podem inserir metas" ON public.metas_usuarios;
DROP POLICY IF EXISTS "Admins podem atualizar metas" ON public.metas_usuarios;
DROP POLICY IF EXISTS "Admins podem deletar metas" ON public.metas_usuarios;

-- Garantir que RLS está habilitado
ALTER TABLE public.metas_usuarios ENABLE ROW LEVEL SECURITY;

-- Adicionar constraint única se não existir
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'metas_usuarios_unico'
  ) THEN
    ALTER TABLE public.metas_usuarios 
    ADD CONSTRAINT metas_usuarios_unico UNIQUE(usuario_id, loja_id);
  END IF;
END $$;

-- Políticas de segurança

-- Usuários podem ver suas próprias metas
CREATE POLICY "Usuarios podem ver suas proprias metas"
  ON public.metas_usuarios
  FOR SELECT
  TO authenticated
  USING (usuario_id = auth.uid());

-- Usuários com permissão podem ver todas as metas
CREATE POLICY "Admins podem ver todas as metas"
  ON public.metas_usuarios
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.permissoes p
      WHERE p.usuario_id = auth.uid()
      AND (
        (p.permissoes->>'usuarios.gerenciar_permissoes')::boolean = true
        OR (p.permissoes->>'dashboard_pessoal.visualizar_metas_outros')::boolean = true
      )
    )
  );

-- Usuários com permissão podem inserir metas
CREATE POLICY "Admins podem inserir metas"
  ON public.metas_usuarios
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Qualquer usuário pode inserir suas próprias metas
    usuario_id = auth.uid()
    OR
    -- Ou ter permissão gerenciar_permissoes para inserir metas de outros
    EXISTS (
      SELECT 1 FROM public.permissoes p
      WHERE p.usuario_id = auth.uid()
      AND (p.permissoes->>'usuarios.gerenciar_permissoes')::boolean = true
    )
  );

-- Usuários com permissão podem atualizar metas
CREATE POLICY "Admins podem atualizar metas"
  ON public.metas_usuarios
  FOR UPDATE
  TO authenticated
  USING (
    -- Qualquer usuário pode atualizar suas próprias metas
    usuario_id = auth.uid()
    OR
    -- Ou ter permissão gerenciar_permissoes para atualizar metas de outros
    EXISTS (
      SELECT 1 FROM public.permissoes p
      WHERE p.usuario_id = auth.uid()
      AND (p.permissoes->>'usuarios.gerenciar_permissoes')::boolean = true
    )
  );

-- Usuários com permissão podem deletar metas
CREATE POLICY "Admins podem deletar metas"
  ON public.metas_usuarios
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.permissoes p
      WHERE p.usuario_id = auth.uid()
      AND (p.permissoes->>'usuarios.gerenciar_permissoes')::boolean = true
    )
  );
