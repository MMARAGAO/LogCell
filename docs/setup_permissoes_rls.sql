-- ============================================
-- CONFIGURAÇÃO DE RLS PARA PERMISSÕES
-- ============================================

-- 1. Habilitar RLS na tabela permissoes
ALTER TABLE permissoes ENABLE ROW LEVEL SECURITY;

-- 2. Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Usuários podem visualizar suas próprias permissões" ON permissoes;
DROP POLICY IF EXISTS "Admins podem visualizar todas as permissões" ON permissoes;
DROP POLICY IF EXISTS "Admins podem inserir permissões" ON permissoes;
DROP POLICY IF EXISTS "Admins podem atualizar permissões" ON permissoes;
DROP POLICY IF EXISTS "Admins podem deletar permissões" ON permissoes;

-- 3. Criar política para usuários visualizarem suas próprias permissões
CREATE POLICY "Usuários podem visualizar suas próprias permissões"
ON permissoes
FOR SELECT
TO authenticated
USING (usuario_id = auth.uid());

-- 4. Criar política para admins visualizarem todas as permissões
-- NOTA: Ajuste esta política conforme sua lógica de admin
-- Opção 1: Verificar se o usuário tem permissão de gerenciar_permissoes
CREATE POLICY "Admins podem visualizar todas as permissões"
ON permissoes
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM permissoes p
    WHERE p.usuario_id = auth.uid()
    AND (p.permissoes->'usuarios'->>'gerenciar_permissoes')::boolean = true
  )
);

-- 5. Criar política para admins inserirem permissões
CREATE POLICY "Admins podem inserir permissões"
ON permissoes
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM permissoes p
    WHERE p.usuario_id = auth.uid()
    AND (p.permissoes->'usuarios'->>'gerenciar_permissoes')::boolean = true
  )
);

-- 6. Criar política para admins atualizarem permissões
CREATE POLICY "Admins podem atualizar permissões"
ON permissoes
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM permissoes p
    WHERE p.usuario_id = auth.uid()
    AND (p.permissoes->'usuarios'->>'gerenciar_permissoes')::boolean = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM permissoes p
    WHERE p.usuario_id = auth.uid()
    AND (p.permissoes->'usuarios'->>'gerenciar_permissoes')::boolean = true
  )
);

-- 7. Criar política para admins deletarem permissões
CREATE POLICY "Admins podem deletar permissões"
ON permissoes
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM permissoes p
    WHERE p.usuario_id = auth.uid()
    AND (p.permissoes->'usuarios'->>'gerenciar_permissoes')::boolean = true
  )
);

-- ============================================
-- CRIAR PRIMEIRO USUÁRIO ADMIN (OPCIONAL)
-- ============================================

-- Execute este comando APENAS para criar o primeiro admin do sistema
-- Substitua 'SEU_USER_ID_AQUI' pelo ID do usuário que será admin

/*
INSERT INTO permissoes (usuario_id, permissoes)
VALUES (
  'SEU_USER_ID_AQUI'::uuid,
  '{
    "usuarios": {
      "visualizar": true,
      "criar": true,
      "editar": true,
      "excluir": true,
      "gerenciar_permissoes": true
    },
    "estoque": {
      "visualizar": true,
      "criar": true,
      "editar": true,
      "excluir": true,
      "ajustar": true
    },
    "lojas": {
      "visualizar": true,
      "criar": true,
      "editar": true,
      "excluir": true
    }
  }'::jsonb
)
ON CONFLICT (usuario_id) DO UPDATE
SET permissoes = EXCLUDED.permissoes,
    atualizado_em = now();
*/

-- ============================================
-- VERIFICAÇÃO
-- ============================================

-- Verificar se as políticas foram criadas
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename = 'permissoes'
ORDER BY policyname;

-- Verificar estrutura da tabela
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns
WHERE table_name = 'permissoes'
ORDER BY ordinal_position;

-- Verificar permissões existentes
SELECT 
  id,
  usuario_id,
  permissoes,
  criado_em,
  atualizado_em
FROM permissoes;
