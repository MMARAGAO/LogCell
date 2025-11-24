-- =====================================================
-- REMOVER POLÍTICA ANTIGA DE UPDATE
-- =====================================================

-- Remover política que bloqueia técnicos
DROP POLICY IF EXISTS "ordem_servico_update_policy" ON ordem_servico;

-- Verificar que só existe a política correta
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'ordem_servico'
  AND cmd = 'UPDATE';

-- ✅ Deve retornar APENAS: ordem_servico_update_tecnico
