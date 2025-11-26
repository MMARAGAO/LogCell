-- ================================================================================
-- VERIFICAR POLÍTICAS RLS - ESTOQUE_LOJAS
-- ================================================================================
-- Execute no SQL Editor do Supabase para ver as políticas ativas
-- ================================================================================

-- 1. Verificar se RLS está ativado
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_ativado
FROM pg_tables
WHERE tablename = 'estoque_lojas';

-- 2. Listar TODAS as políticas da tabela estoque_lojas
SELECT 
    schemaname,
    tablename,
    policyname as nome_politica,
    permissive as tipo,
    roles as roles,
    cmd as comando,
    qual as condicao_using,
    with_check as condicao_check
FROM pg_policies
WHERE tablename = 'estoque_lojas'
ORDER BY policyname;

-- 3. Desabilitar RLS temporariamente para TESTE (não recomendado em produção)
-- DESCOMENTE a linha abaixo APENAS para testar
-- ALTER TABLE estoque_lojas DISABLE ROW LEVEL SECURITY;

-- 4. OU criar política que permite ler TODOS os registros
-- DESCOMENTE as linhas abaixo para criar política permissiva
/*
DROP POLICY IF EXISTS "Permitir leitura de estoque para usuários autenticados" ON estoque_lojas;

CREATE POLICY "Permitir leitura de estoque para usuários autenticados"
ON estoque_lojas
FOR SELECT
TO authenticated
USING (true);
*/
