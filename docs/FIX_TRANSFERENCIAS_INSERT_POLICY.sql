-- ============================================================================
-- CORREÇÃO: Adicionar política permissiva de INSERT para transferências
-- ============================================================================
-- Problema: Apenas UPDATE e DELETE têm políticas permissivas
-- A política de INSERT existente usa auth.uid() que retorna NULL
-- Solução: Adicionar política permissiva para INSERT
-- ============================================================================

-- ============================================================================
-- PASSO 1: Remover política restritiva de INSERT
-- ============================================================================

DROP POLICY IF EXISTS "Usuários podem criar transferências" ON transferencias;

-- ============================================================================
-- PASSO 2: Criar política permissiva de INSERT
-- ============================================================================

CREATE POLICY "Usuarios autenticados podem criar transferencias"
ON transferencias FOR INSERT TO authenticated WITH CHECK (true);

-- ============================================================================
-- PASSO 3: Verificar política de INSERT para itens de transferência
-- ============================================================================

-- Remover política restritiva se existir
DROP POLICY IF EXISTS "Usuários podem adicionar itens" ON transferencias_itens;

-- Criar política permissiva
CREATE POLICY "Usuarios autenticados podem criar transferencias itens"
ON transferencias_itens FOR INSERT TO authenticated WITH CHECK (true);

-- ============================================================================
-- VERIFICAÇÃO FINAL
-- ============================================================================

-- Listar todas as políticas de transferências
SELECT 
    schemaname,
    tablename,
    policyname,
    CASE cmd
        WHEN 'r' THEN 'SELECT'
        WHEN 'a' THEN 'INSERT'
        WHEN 'w' THEN 'UPDATE'
        WHEN 'd' THEN 'DELETE'
        WHEN '*' THEN 'ALL'
    END as command,
    roles,
    qual as using_expression,
    with_check as with_check_expression
FROM pg_policies
WHERE tablename IN ('transferencias', 'transferencias_itens')
ORDER BY tablename, policyname;

-- ============================================================================
-- FIM DO SCRIPT
-- ============================================================================
