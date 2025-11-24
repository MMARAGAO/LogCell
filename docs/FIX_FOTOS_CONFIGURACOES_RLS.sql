-- =====================================================
-- CORREÇÃO: Políticas RLS para fotos_perfil e configuracoes_usuario
-- =====================================================

-- 1. REMOVER todas as políticas antigas de FOTOS_PERFIL
DROP POLICY IF EXISTS "Fotos Perfil DELETE policy" ON fotos_perfil;
DROP POLICY IF EXISTS "Fotos Perfil INSERT policy" ON fotos_perfil;
DROP POLICY IF EXISTS "Fotos Perfil SELECT policy" ON fotos_perfil;
DROP POLICY IF EXISTS "Fotos Perfil UPDATE policy" ON fotos_perfil;
DROP POLICY IF EXISTS "Usuários podem ver suas fotos" ON fotos_perfil;
DROP POLICY IF EXISTS "Usuários podem inserir suas fotos" ON fotos_perfil;
DROP POLICY IF EXISTS "Usuários podem atualizar suas fotos" ON fotos_perfil;
DROP POLICY IF EXISTS "Usuários podem deletar suas fotos" ON fotos_perfil;
DROP POLICY IF EXISTS "Permitir SELECT próprias fotos" ON fotos_perfil;
DROP POLICY IF EXISTS "Permitir INSERT próprias fotos" ON fotos_perfil;
DROP POLICY IF EXISTS "Permitir UPDATE próprias fotos" ON fotos_perfil;
DROP POLICY IF EXISTS "Permitir DELETE próprias fotos" ON fotos_perfil;
DROP POLICY IF EXISTS "Usuários podem deletar suas próprias fotos" ON fotos_perfil;
DROP POLICY IF EXISTS "fotos_perfil_delete_own" ON fotos_perfil;
DROP POLICY IF EXISTS "fotos_perfil_delete_policy" ON fotos_perfil;
DROP POLICY IF EXISTS "Usuarios podem enviar suas fotos de perfil" ON fotos_perfil;
DROP POLICY IF EXISTS "Usuários podem inserir suas próprias fotos" ON fotos_perfil;
DROP POLICY IF EXISTS "fotos_perfil_insert_own" ON fotos_perfil;
DROP POLICY IF EXISTS "fotos_perfil_insert_policy" ON fotos_perfil;
DROP POLICY IF EXISTS "Usuarios podem ver suas fotos de perfil" ON fotos_perfil;
DROP POLICY IF EXISTS "Usuários podem visualizar suas próprias fotos" ON fotos_perfil;
DROP POLICY IF EXISTS "fotos_perfil_select_own" ON fotos_perfil;
DROP POLICY IF EXISTS "fotos_perfil_select_policy" ON fotos_perfil;
DROP POLICY IF EXISTS "Usuários podem atualizar suas próprias fotos" ON fotos_perfil;
DROP POLICY IF EXISTS "fotos_perfil_update_own" ON fotos_perfil;
DROP POLICY IF EXISTS "fotos_perfil_update_policy" ON fotos_perfil;

-- 2. REMOVER todas as políticas antigas de CONFIGURACOES_USUARIO
DROP POLICY IF EXISTS "Configuracoes Usuario DELETE policy" ON configuracoes_usuario;
DROP POLICY IF EXISTS "Configuracoes Usuario INSERT policy" ON configuracoes_usuario;
DROP POLICY IF EXISTS "Configuracoes Usuario SELECT policy" ON configuracoes_usuario;
DROP POLICY IF EXISTS "Configuracoes Usuario UPDATE policy" ON configuracoes_usuario;
DROP POLICY IF EXISTS "Usuários podem ver suas configurações" ON configuracoes_usuario;
DROP POLICY IF EXISTS "Usuários podem criar suas configurações" ON configuracoes_usuario;
DROP POLICY IF EXISTS "Usuários podem atualizar suas configurações" ON configuracoes_usuario;
DROP POLICY IF EXISTS "Usuários podem deletar suas configurações" ON configuracoes_usuario;
DROP POLICY IF EXISTS "Permitir SELECT próprias configs" ON configuracoes_usuario;
DROP POLICY IF EXISTS "Permitir INSERT próprias configs" ON configuracoes_usuario;
DROP POLICY IF EXISTS "Permitir UPDATE próprias configs" ON configuracoes_usuario;
DROP POLICY IF EXISTS "Permitir DELETE próprias configs" ON configuracoes_usuario;
DROP POLICY IF EXISTS "configuracoes_usuario_delete_policy" ON configuracoes_usuario;
DROP POLICY IF EXISTS "Usuarios podem inserir suas configuracoes" ON configuracoes_usuario;
DROP POLICY IF EXISTS "configuracoes_usuario_insert_policy" ON configuracoes_usuario;
DROP POLICY IF EXISTS "Usuarios podem ver suas configuracoes" ON configuracoes_usuario;
DROP POLICY IF EXISTS "configuracoes_usuario_select_policy" ON configuracoes_usuario;
DROP POLICY IF EXISTS "Usuarios podem atualizar suas configuracoes" ON configuracoes_usuario;
DROP POLICY IF EXISTS "configuracoes_usuario_update_policy" ON configuracoes_usuario;

-- =====================================================
-- CRIAR POLÍTICAS CORRETAS (SIMPLIFICADAS)
-- =====================================================

-- 3. Políticas para FOTOS_PERFIL
-- Usuário autenticado pode gerenciar suas próprias fotos

-- SELECT: Ver próprias fotos
CREATE POLICY "fotos_perfil_select_v2"
  ON fotos_perfil FOR SELECT
  TO authenticated
  USING (usuario_id = auth.uid());

-- INSERT: Criar próprias fotos
CREATE POLICY "fotos_perfil_insert_v2"
  ON fotos_perfil FOR INSERT
  TO authenticated
  WITH CHECK (usuario_id = auth.uid());

-- UPDATE: Atualizar próprias fotos
CREATE POLICY "fotos_perfil_update_v2"
  ON fotos_perfil FOR UPDATE
  TO authenticated
  USING (usuario_id = auth.uid())
  WITH CHECK (usuario_id = auth.uid());

-- DELETE: Deletar próprias fotos
CREATE POLICY "fotos_perfil_delete_v2"
  ON fotos_perfil FOR DELETE
  TO authenticated
  USING (usuario_id = auth.uid());

-- 4. Políticas para CONFIGURACOES_USUARIO
-- Usuário autenticado pode gerenciar suas próprias configurações

-- SELECT: Ver próprias configurações
CREATE POLICY "configuracoes_usuario_select_v2"
  ON configuracoes_usuario FOR SELECT
  TO authenticated
  USING (usuario_id = auth.uid());

-- INSERT: Criar próprias configurações
CREATE POLICY "configuracoes_usuario_insert_v2"
  ON configuracoes_usuario FOR INSERT
  TO authenticated
  WITH CHECK (usuario_id = auth.uid());

-- UPDATE: Atualizar próprias configurações
CREATE POLICY "configuracoes_usuario_update_v2"
  ON configuracoes_usuario FOR UPDATE
  TO authenticated
  USING (usuario_id = auth.uid())
  WITH CHECK (usuario_id = auth.uid());

-- DELETE: Deletar próprias configurações
CREATE POLICY "configuracoes_usuario_delete_v2"
  ON configuracoes_usuario FOR DELETE
  TO authenticated
  USING (usuario_id = auth.uid());

-- =====================================================
-- VERIFICAR POLÍTICAS CRIADAS
-- =====================================================
SELECT 
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE tablename IN ('fotos_perfil', 'configuracoes_usuario')
ORDER BY tablename, cmd, policyname;

-- ✅ Deve mostrar apenas 8 políticas:
-- fotos_perfil: SELECT, INSERT, UPDATE, DELETE
-- configuracoes_usuario: SELECT, INSERT, UPDATE, DELETE
