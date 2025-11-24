-- =====================================================
-- FIX: HISTÓRICO DE USUÁRIOS - Remover e Recriar
-- =====================================================
-- Execute este script se houver problemas com o histórico

-- 1. Remover políticas RLS antigas
DROP POLICY IF EXISTS "Usuários autenticados podem ver histórico" ON historico_usuarios;
DROP POLICY IF EXISTS "Sistema pode inserir histórico" ON historico_usuarios;
DROP POLICY IF EXISTS "Histórico é imutável" ON historico_usuarios;
DROP POLICY IF EXISTS "Histórico não pode ser deletado" ON historico_usuarios;

-- 2. Desabilitar RLS temporariamente para testar
ALTER TABLE historico_usuarios DISABLE ROW LEVEL SECURITY;

-- 3. Recriar políticas mais permissivas
ALTER TABLE historico_usuarios ENABLE ROW LEVEL SECURITY;

-- Permitir SELECT para autenticados
CREATE POLICY "allow_select_historico"
  ON historico_usuarios
  FOR SELECT
  USING (true);

-- Permitir INSERT sem restrições (trigger usa SECURITY DEFINER)
CREATE POLICY "allow_insert_historico"
  ON historico_usuarios
  FOR INSERT
  WITH CHECK (true);

-- Bloquear UPDATE e DELETE
CREATE POLICY "block_update_historico"
  ON historico_usuarios
  FOR UPDATE
  USING (false);

CREATE POLICY "block_delete_historico"
  ON historico_usuarios
  FOR DELETE
  USING (false);

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================
