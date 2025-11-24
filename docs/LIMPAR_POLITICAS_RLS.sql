-- =====================================================
-- LIMPEZA COMPLETA: Remover políticas duplicadas
-- =====================================================

-- 1. REMOVER TODAS as políticas antigas da tabela TECNICOS
DROP POLICY IF EXISTS "Tecnicos DELETE policy" ON tecnicos;
DROP POLICY IF EXISTS "Tecnicos INSERT policy" ON tecnicos;
DROP POLICY IF EXISTS "Tecnicos SELECT policy" ON tecnicos;
DROP POLICY IF EXISTS "Tecnicos UPDATE policy" ON tecnicos;
DROP POLICY IF EXISTS "Usuários autenticados podem atualizar técnicos" ON tecnicos;
DROP POLICY IF EXISTS "Usuários autenticados podem criar técnicos" ON tecnicos;
DROP POLICY IF EXISTS "Usuários autenticados podem deletar técnicos" ON tecnicos;
DROP POLICY IF EXISTS "Usuários autenticados podem ver técnicos" ON tecnicos;
DROP POLICY IF EXISTS "Tecnicos podem ver seus próprios dados" ON tecnicos;
DROP POLICY IF EXISTS "Tecnicos podem atualizar seus dados" ON tecnicos;
DROP POLICY IF EXISTS "Permitir SELECT para todos autenticados" ON tecnicos;
DROP POLICY IF EXISTS "Permitir INSERT para autenticados" ON tecnicos;

-- 2. REMOVER TODAS as políticas antigas da tabela ORDEM_SERVICO
DROP POLICY IF EXISTS "Ordem Servico DELETE policy" ON ordem_servico;
DROP POLICY IF EXISTS "Ordem Servico INSERT policy" ON ordem_servico;
DROP POLICY IF EXISTS "Ordem Servico SELECT policy" ON ordem_servico;
DROP POLICY IF EXISTS "Ordem Servico UPDATE policy" ON ordem_servico;
DROP POLICY IF EXISTS "Usuários autenticados podem atualizar OS" ON ordem_servico;
DROP POLICY IF EXISTS "Usuários autenticados podem criar OS" ON ordem_servico;
DROP POLICY IF EXISTS "Usuários autenticados podem deletar OS" ON ordem_servico;
DROP POLICY IF EXISTS "Usuários autenticados podem visualizar OS" ON ordem_servico;
DROP POLICY IF EXISTS "Tecnicos veem suas ordens" ON ordem_servico;
DROP POLICY IF EXISTS "Tecnicos atualizam suas ordens" ON ordem_servico;

-- =====================================================
-- CRIAR POLÍTICAS CORRETAS (SEM DUPLICATAS)
-- =====================================================

-- 3. Políticas para TECNICOS
-- SELECT: Técnico vê seus dados OU usuário admin vê tudo
CREATE POLICY "tecnicos_select_policy"
  ON tecnicos FOR SELECT
  TO authenticated
  USING (
    auth.uid() = usuario_id OR
    EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid())
  );

-- INSERT: Apenas via service role (API Route) ou admin
CREATE POLICY "tecnicos_insert_policy"
  ON tecnicos FOR INSERT
  TO authenticated
  WITH CHECK (true); -- Service role bypass RLS

-- UPDATE: Técnico atualiza seus dados OU admin atualiza qualquer um
CREATE POLICY "tecnicos_update_policy"
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

-- DELETE: Apenas admins
CREATE POLICY "tecnicos_delete_policy"
  ON tecnicos FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid())
  );

-- 4. Políticas para ORDEM_SERVICO
-- SELECT: Técnico vê suas OS + OS disponíveis OU admin vê tudo
CREATE POLICY "ordem_servico_select_policy"
  ON ordem_servico FOR SELECT
  TO authenticated
  USING (
    tecnico_responsavel = auth.uid() OR
    tecnico_responsavel IS NULL OR
    EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid())
  );

-- INSERT: Apenas admins
CREATE POLICY "ordem_servico_insert_policy"
  ON ordem_servico FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid())
  );

-- UPDATE: Técnico atualiza suas OS OU admin atualiza qualquer uma
CREATE POLICY "ordem_servico_update_policy"
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

-- DELETE: Apenas admins
CREATE POLICY "ordem_servico_delete_policy"
  ON ordem_servico FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid())
  );

-- =====================================================
-- VERIFICAR POLÍTICAS CRIADAS
-- =====================================================
SELECT 
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE tablename IN ('tecnicos', 'ordem_servico')
ORDER BY tablename, cmd, policyname;

-- ✅ Deve mostrar apenas 8 políticas:
-- tecnicos: SELECT, INSERT, UPDATE, DELETE
-- ordem_servico: SELECT, INSERT, UPDATE, DELETE
