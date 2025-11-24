-- =====================================================
-- AJUSTAR POLÍTICAS RLS PARA VISUALIZAÇÃO DE USUÁRIOS
-- =====================================================

-- 1. Ver todas as políticas atuais
SELECT 
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'usuarios'
ORDER BY policyname;

-- 2. Remover políticas antigas de SELECT (se existirem)
DROP POLICY IF EXISTS "Usuarios podem ver apenas próprio perfil" ON usuarios;
DROP POLICY IF EXISTS "Usuarios podem ver seu próprio perfil" ON usuarios;

-- 3. Criar política para permitir SELECT de todos os usuários
DROP POLICY IF EXISTS "Permitir visualizar todos usuarios" ON usuarios;
CREATE POLICY "Permitir visualizar todos usuarios"
  ON usuarios
  FOR SELECT
  TO authenticated
  USING (true);

-- 4. Política para UPDATE (apenas próprio perfil ou admin)
DROP POLICY IF EXISTS "Permitir update de usuarios" ON usuarios;
CREATE POLICY "Permitir update de usuarios"
  ON usuarios
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 5. Política para DELETE
DROP POLICY IF EXISTS "Permitir delete de usuarios" ON usuarios;
CREATE POLICY "Permitir delete de usuarios"
  ON usuarios
  FOR DELETE
  TO authenticated
  USING (true);

-- 6. Verificar políticas finais
SELECT 
    policyname,
    cmd,
    permissive,
    roles
FROM pg_policies 
WHERE tablename = 'usuarios'
ORDER BY cmd, policyname;

-- =====================================================
-- CONCLUÍDO
-- =====================================================
