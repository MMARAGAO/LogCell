-- =====================================================
-- CORREÇÃO DEFINITIVA: Remover TODAS as políticas e recriar
-- =====================================================

-- PASSO 1: Desabilitar RLS temporariamente (apenas para limpeza)
ALTER TABLE fotos_perfil DISABLE ROW LEVEL SECURITY;
ALTER TABLE configuracoes_usuario DISABLE ROW LEVEL SECURITY;

-- PASSO 2: Buscar e remover TODAS as políticas existentes de fotos_perfil
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'fotos_perfil')
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON fotos_perfil';
    END LOOP;
END $$;

-- PASSO 3: Buscar e remover TODAS as políticas existentes de configuracoes_usuario
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'configuracoes_usuario')
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON configuracoes_usuario';
    END LOOP;
END $$;

-- PASSO 4: Reativar RLS
ALTER TABLE fotos_perfil ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracoes_usuario ENABLE ROW LEVEL SECURITY;

-- PASSO 5: Verificar se todas foram removidas
SELECT 
  tablename,
  COUNT(*) as total_policies
FROM pg_policies
WHERE tablename IN ('fotos_perfil', 'configuracoes_usuario')
GROUP BY tablename;

-- ⚠️ Deve retornar 0 para ambas as tabelas

-- =====================================================
-- CRIAR POLÍTICAS NOVAS (ÚNICAS)
-- =====================================================

-- Políticas para FOTOS_PERFIL
CREATE POLICY "fotos_perfil_select_final"
  ON fotos_perfil FOR SELECT
  TO authenticated
  USING (usuario_id = auth.uid());

CREATE POLICY "fotos_perfil_insert_final"
  ON fotos_perfil FOR INSERT
  TO authenticated
  WITH CHECK (usuario_id = auth.uid());

CREATE POLICY "fotos_perfil_update_final"
  ON fotos_perfil FOR UPDATE
  TO authenticated
  USING (usuario_id = auth.uid())
  WITH CHECK (usuario_id = auth.uid());

CREATE POLICY "fotos_perfil_delete_final"
  ON fotos_perfil FOR DELETE
  TO authenticated
  USING (usuario_id = auth.uid());

-- Políticas para CONFIGURACOES_USUARIO
CREATE POLICY "configuracoes_usuario_select_final"
  ON configuracoes_usuario FOR SELECT
  TO authenticated
  USING (usuario_id = auth.uid());

CREATE POLICY "configuracoes_usuario_insert_final"
  ON configuracoes_usuario FOR INSERT
  TO authenticated
  WITH CHECK (usuario_id = auth.uid());

CREATE POLICY "configuracoes_usuario_update_final"
  ON configuracoes_usuario FOR UPDATE
  TO authenticated
  USING (usuario_id = auth.uid())
  WITH CHECK (usuario_id = auth.uid());

CREATE POLICY "configuracoes_usuario_delete_final"
  ON configuracoes_usuario FOR DELETE
  TO authenticated
  USING (usuario_id = auth.uid());

-- =====================================================
-- VERIFICAÇÃO FINAL
-- =====================================================
SELECT 
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE tablename IN ('fotos_perfil', 'configuracoes_usuario')
ORDER BY tablename, cmd, policyname;

-- ✅ Deve mostrar EXATAMENTE 8 políticas:
-- configuracoes_usuario_delete_final   | DELETE
-- configuracoes_usuario_insert_final   | INSERT
-- configuracoes_usuario_select_final   | SELECT
-- configuracoes_usuario_update_final   | UPDATE
-- fotos_perfil_delete_final            | DELETE
-- fotos_perfil_insert_final            | INSERT
-- fotos_perfil_select_final            | SELECT
-- fotos_perfil_update_final            | UPDATE
