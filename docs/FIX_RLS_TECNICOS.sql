-- =====================================================
-- CORREÇÃO RÁPIDA: Políticas RLS para Técnicos
-- =====================================================
-- Execute este script se estiver tendo erros 406
-- =====================================================

-- 1. Corrigir políticas RLS da tabela TECNICOS
-- Remover políticas antigas
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

-- Política INSERT: Via service role ou admins
CREATE POLICY "Tecnicos INSERT policy"
  ON tecnicos FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid())
  );

-- Política UPDATE: Técnicos atualizam seus dados, admins atualizam tudo
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

-- Política DELETE: Apenas admins
CREATE POLICY "Tecnicos DELETE policy"
  ON tecnicos FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid())
  );

-- 2. Corrigir políticas RLS da tabela ORDEM_SERVICO
-- Remover políticas antigas
DROP POLICY IF EXISTS "Tecnicos veem suas ordens" ON ordem_servico;
DROP POLICY IF EXISTS "Tecnicos atualizam suas ordens" ON ordem_servico;
DROP POLICY IF EXISTS "Ordem Servico SELECT policy" ON ordem_servico;
DROP POLICY IF EXISTS "Ordem Servico UPDATE policy" ON ordem_servico;
DROP POLICY IF EXISTS "Ordem Servico INSERT policy" ON ordem_servico;
DROP POLICY IF EXISTS "Ordem Servico DELETE policy" ON ordem_servico;

-- SELECT: Técnicos veem suas OS + OS disponíveis, admins veem tudo
CREATE POLICY "Ordem Servico SELECT policy"
  ON ordem_servico FOR SELECT
  TO authenticated
  USING (
    tecnico_responsavel = auth.uid() OR
    tecnico_responsavel IS NULL OR
    EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid())
  );

-- UPDATE: Técnicos atualizam suas OS, admins atualizam tudo
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

-- INSERT: Apenas admins
CREATE POLICY "Ordem Servico INSERT policy"
  ON ordem_servico FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid())
  );

-- DELETE: Apenas admins
CREATE POLICY "Ordem Servico DELETE policy"
  ON ordem_servico FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid())
  );

-- 3. Garantir que RLS está ativo
ALTER TABLE tecnicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE ordem_servico ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- TESTE: Verificar políticas criadas
-- =====================================================
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,
  roles
FROM pg_policies
WHERE tablename IN ('tecnicos', 'ordem_servico')
ORDER BY tablename, policyname;

-- =====================================================
-- ✅ Políticas RLS atualizadas com sucesso!
-- =====================================================
