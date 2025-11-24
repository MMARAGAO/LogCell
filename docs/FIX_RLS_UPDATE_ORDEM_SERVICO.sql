-- =====================================================
-- FIX: Política RLS UPDATE para Técnicos pegarem OS
-- =====================================================

-- PROBLEMA: Técnicos não conseguem UPDATE em OS sem técnico
-- CAUSA: Política WHERE tecnico_responsavel = auth.uid() bloqueia
-- SOLUÇÃO: Permitir UPDATE quando:
--   1. Já é o técnico responsável (para atualizar suas OS)
--   2. OU está atribuindo a si mesmo (para pegar OS disponível)

-- Verificar políticas atuais
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'ordem_servico'
  AND cmd = 'UPDATE';

-- Remover política antiga de UPDATE
DROP POLICY IF EXISTS "ordem_servico_update_v2" ON ordem_servico;
DROP POLICY IF EXISTS "ordem_servico_update_final" ON ordem_servico;
DROP POLICY IF EXISTS "ordem_servico_update" ON ordem_servico;

-- Criar nova política de UPDATE para técnicos
CREATE POLICY "ordem_servico_update_tecnico"
  ON ordem_servico FOR UPDATE
  TO authenticated
  USING (
    -- Permitir se:
    -- 1. Já é o técnico responsável, OU
    -- 2. Está pegando uma OS disponível (NULL -> auth.uid)
    tecnico_responsavel = auth.uid() 
    OR tecnico_responsavel IS NULL
  )
  WITH CHECK (
    -- Garantir que está atribuindo para si mesmo
    tecnico_responsavel = auth.uid()
  );

-- Verificar política criada
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'ordem_servico'
  AND cmd = 'UPDATE';

-- Teste manual (opcional)
-- SELECT id, numero_os, tecnico_responsavel, status 
-- FROM ordem_servico 
-- WHERE tecnico_responsavel IS NULL 
-- LIMIT 1;

-- =====================================================
-- RESULTADO ESPERADO:
-- =====================================================
-- ✅ Política permite UPDATE quando:
--    - tecnico_responsavel IS NULL (pegar OS)
--    - tecnico_responsavel = auth.uid() (atualizar própria OS)
-- ✅ WITH CHECK garante que só pode atribuir para si mesmo
-- ✅ Técnicos podem "pegar" ordens disponíveis
