-- ============================================
-- VERIFICAR E CORRIGIR POLÍTICAS DE DELETE
-- Tabela: historico_estoque
-- ============================================

-- 1. Ver políticas existentes
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'historico_estoque'
ORDER BY cmd, policyname;

-- 2. Ver se há RLS ativado
SELECT 
    tablename, 
    rowsecurity 
FROM pg_tables 
WHERE tablename = 'historico_estoque';

-- 3. SOLUÇÃO: Adicionar política de DELETE para usuários autenticados
-- (Execute apenas se não houver política de DELETE)

-- Opção 1: DELETE apenas dos próprios registros
DROP POLICY IF EXISTS "Usuários podem deletar seus próprios registros" ON historico_estoque;
CREATE POLICY "Usuários podem deletar seus próprios registros"
ON historico_estoque
FOR DELETE
TO authenticated
USING (auth.uid() = usuario_id);

-- Opção 2: DELETE de qualquer registro (mais permissivo - use com cuidado!)
-- DROP POLICY IF EXISTS "Usuários autenticados podem deletar registros" ON historico_estoque;
-- CREATE POLICY "Usuários autenticados podem deletar registros"
-- ON historico_estoque
-- FOR DELETE
-- TO authenticated
-- USING (true);

-- 4. Verificar novamente as políticas
SELECT 
    policyname,
    cmd,
    qual
FROM pg_policies
WHERE tablename = 'historico_estoque'
AND cmd = 'DELETE';

-- 5. TESTE: Tentar deletar um registro específico
-- Substitua os IDs pelos que você está tentando deletar
-- DELETE FROM historico_estoque 
-- WHERE id IN ('8136ce7b-ff9d-4f17-8808-7237a3107788', 'fc8e7843-4021-4061-a5c8-b047ab4c7298');
