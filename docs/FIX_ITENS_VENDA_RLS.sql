-- ============================================================================
-- FIX: Políticas RLS para itens_venda
-- ============================================================================
-- Problema: Erro 403 ao inserir itens em vendas
-- Causa: Políticas RLS restritivas bloqueando INSERT
-- Solução: Criar políticas permissivas para usuários autenticados
-- ============================================================================

-- 1. Verificar políticas atuais
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
WHERE tablename = 'itens_venda'
ORDER BY policyname;

-- 2. Remover políticas restritivas antigas (se existirem)
DROP POLICY IF EXISTS "Permitir INSERT de itens_venda" ON itens_venda;
DROP POLICY IF EXISTS "Permitir UPDATE de itens_venda" ON itens_venda;
DROP POLICY IF EXISTS "Permitir DELETE de itens_venda" ON itens_venda;
DROP POLICY IF EXISTS "Permitir SELECT de itens_venda" ON itens_venda;

-- 3. Criar políticas PERMISSIVAS para usuários autenticados

-- SELECT: Todos usuários autenticados podem ver itens
CREATE POLICY "Permitir SELECT de itens_venda"
ON itens_venda
FOR SELECT
TO authenticated
USING (true);

-- INSERT: Todos usuários autenticados podem inserir itens
CREATE POLICY "Permitir INSERT de itens_venda"
ON itens_venda
FOR INSERT
TO authenticated
WITH CHECK (true);

-- UPDATE: Todos usuários autenticados podem atualizar itens
CREATE POLICY "Permitir UPDATE de itens_venda"
ON itens_venda
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- DELETE: Todos usuários autenticados podem deletar itens
CREATE POLICY "Permitir DELETE de itens_venda"
ON itens_venda
FOR DELETE
TO authenticated
USING (true);

-- 4. Verificar políticas criadas
SELECT 
    policyname,
    permissive,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'itens_venda'
ORDER BY cmd, policyname;

-- ============================================================================
-- FIM DO SCRIPT
-- ============================================================================
