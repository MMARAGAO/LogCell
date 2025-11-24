-- =====================================================
-- SETUP: Sistema de Login para Técnicos
-- =====================================================
-- Este script adiciona suporte para que técnicos tenham
-- login próprio no sistema via Supabase Auth
-- =====================================================

-- 1. Adicionar email na tabela tecnicos (caso não exista)
ALTER TABLE tecnicos 
ADD COLUMN IF NOT EXISTS email VARCHAR(255) UNIQUE;

-- 2. Criar índice para email
CREATE INDEX IF NOT EXISTS idx_tecnicos_email ON tecnicos(email);

-- 3. Criar função para sincronizar técnico com auth.users
CREATE OR REPLACE FUNCTION criar_tecnico_auth_user(
  p_email VARCHAR(255),
  p_senha VARCHAR(255),
  p_nome VARCHAR(255),
  p_telefone VARCHAR(20),
  p_cpf VARCHAR(14) DEFAULT NULL,
  p_especialidades TEXT[] DEFAULT NULL,
  p_id_loja INTEGER DEFAULT NULL,
  p_criado_por UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_tecnico_id UUID;
BEGIN
  -- 1. Verificar se email já existe em auth.users
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = p_email;

  -- 2. Se não existe, criar usuário no Supabase Auth
  IF v_user_id IS NULL THEN
    -- Criar usuário via admin API do Supabase
    -- NOTA: Esta parte requer configuração no Supabase Dashboard
    -- ou uso da API administrativa
    RAISE EXCEPTION 'Criar usuário via Supabase Admin API ou Dashboard primeiro';
  END IF;

  -- 3. Criar registro na tabela tecnicos
  INSERT INTO tecnicos (
    id,
    nome,
    email,
    telefone,
    cpf,
    especialidades,
    id_loja,
    usuario_id,
    ativo,
    criado_por,
    criado_em,
    atualizado_em
  )
  VALUES (
    v_user_id, -- Usar mesmo ID do auth.users
    p_nome,
    p_email,
    p_telefone,
    p_cpf,
    p_especialidades,
    p_id_loja,
    v_user_id,
    true,
    p_criado_por,
    NOW(),
    NOW()
  )
  RETURNING id INTO v_tecnico_id;

  RETURN v_tecnico_id;
END;
$$;

-- 4. Criar função para verificar se usuário é técnico
CREATE OR REPLACE FUNCTION is_tecnico(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_is_tecnico BOOLEAN;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM tecnicos 
    WHERE id = user_id OR usuario_id = user_id
  ) INTO v_is_tecnico;
  
  RETURN v_is_tecnico;
END;
$$;

-- 5. Criar função para buscar tipo de usuário
CREATE OR REPLACE FUNCTION get_tipo_usuario(user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_tipo TEXT;
BEGIN
  -- Verificar se é técnico
  IF EXISTS(SELECT 1 FROM tecnicos WHERE id = user_id OR usuario_id = user_id) THEN
    RETURN 'tecnico';
  END IF;
  
  -- Verificar se é usuário administrativo
  IF EXISTS(SELECT 1 FROM usuarios WHERE id = user_id) THEN
    RETURN 'usuario';
  END IF;
  
  RETURN 'desconhecido';
END;
$$;

-- 6. Atualizar RLS da tabela tecnicos para permitir acesso próprio
-- Remover todas as políticas antigas primeiro
DROP POLICY IF EXISTS "Tecnicos podem ver seus próprios dados" ON tecnicos;
DROP POLICY IF EXISTS "Tecnicos podem atualizar seus dados" ON tecnicos;
DROP POLICY IF EXISTS "Permitir SELECT para todos autenticados" ON tecnicos;
DROP POLICY IF EXISTS "Permitir INSERT para autenticados" ON tecnicos;

-- Política SELECT: Técnicos veem seus dados, admins veem tudo
CREATE POLICY "Tecnicos SELECT policy"
  ON tecnicos FOR SELECT
  TO authenticated
  USING (
    auth.uid() = usuario_id OR
    EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid())
  );

-- Política INSERT: Apenas admins podem criar técnicos (via service role)
CREATE POLICY "Tecnicos INSERT policy"
  ON tecnicos FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid())
  );

-- Política UPDATE: Técnicos podem atualizar seus dados, admins podem atualizar tudo
CREATE POLICY "Tecnicos UPDATE policy"
  ON tecnicos FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = usuario_id OR
    EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid())
  )
  WITH CHECK (
    auth.uid() = usuario_id OR
    EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid())
  );

-- Política DELETE: Apenas admins podem deletar
CREATE POLICY "Tecnicos DELETE policy"
  ON tecnicos FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid())
  );

-- 7. Atualizar RLS da tabela ordem_servico
-- Remover políticas antigas
DROP POLICY IF EXISTS "Tecnicos veem suas ordens" ON ordem_servico;
DROP POLICY IF EXISTS "Tecnicos atualizam suas ordens" ON ordem_servico;

-- Técnicos podem ver: suas próprias OS + OS sem técnico atribuído
CREATE POLICY "Ordem Servico SELECT policy"
  ON ordem_servico FOR SELECT
  TO authenticated
  USING (
    tecnico_responsavel = auth.uid() OR
    tecnico_responsavel IS NULL OR
    EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid())
  );

-- Técnicos podem atualizar apenas suas próprias OS
CREATE POLICY "Ordem Servico UPDATE policy"
  ON ordem_servico FOR UPDATE
  TO authenticated
  USING (
    tecnico_responsavel = auth.uid() OR
    EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid())
  )
  WITH CHECK (
    tecnico_responsavel = auth.uid() OR
    EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid())
  );

-- Admins podem criar OS
CREATE POLICY "Ordem Servico INSERT policy"
  ON ordem_servico FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid())
  );

-- Admins podem deletar OS
CREATE POLICY "Ordem Servico DELETE policy"
  ON ordem_servico FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid())
  );

-- 8. Criar view para facilitar consultas
CREATE OR REPLACE VIEW vw_tecnicos_login AS
SELECT 
  t.id,
  t.nome,
  t.email,
  t.telefone,
  t.cpf,
  t.especialidades,
  t.id_loja,
  l.nome as loja_nome,
  t.ativo,
  t.usuario_id,
  'tecnico' as tipo_usuario,
  t.criado_em,
  t.atualizado_em
FROM tecnicos t
LEFT JOIN lojas l ON l.id = t.id_loja
WHERE t.ativo = true;

-- 9. Garantir que técnicos tenham acesso à view
GRANT SELECT ON vw_tecnicos_login TO authenticated;

-- =====================================================
-- COMENTÁRIOS IMPORTANTES
-- =====================================================
-- 
-- PARA CRIAR UM TÉCNICO COM LOGIN:
-- 
-- 1. Via Supabase Dashboard (Recomendado):
--    - Ir em Authentication > Users > Add User
--    - Email: email@tecnico.com
--    - Password: senha123
--    - Auto Confirm User: true
--    - Copiar o UUID gerado
-- 
-- 2. Depois, criar registro na tabela tecnicos:
--    INSERT INTO tecnicos (id, nome, email, telefone, usuario_id, ativo)
--    VALUES ('uuid-copiado', 'Nome do Técnico', 'email@tecnico.com', '11999999999', 'uuid-copiado', true);
--
-- 3. Via API (Programático):
--    - Usar Supabase Admin API para criar usuário
--    - Depois criar registro na tabela tecnicos
-- 
-- =====================================================

-- 10. Comentários nas tabelas
COMMENT ON COLUMN tecnicos.email IS 'Email usado para login no sistema';
COMMENT ON COLUMN tecnicos.usuario_id IS 'UUID do usuário no Supabase Auth (auth.users)';
COMMENT ON FUNCTION is_tecnico(UUID) IS 'Verifica se um UUID é de um técnico';
COMMENT ON FUNCTION get_tipo_usuario(UUID) IS 'Retorna o tipo de usuário: tecnico, usuario ou desconhecido';
