-- ============================================================================
-- VERIFICAR E CORRIGIR POLÍTICAS RLS PARA TRANSFERÊNCIAS
-- Data: 08/12/2025
-- Problema: Outros usuários não conseguem criar transferências
-- ============================================================================

-- ============================================================================
-- PASSO 1: VERIFICAR POLÍTICAS ATUAIS
-- ============================================================================

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
    roles::text as roles,
    qual::text as using_expression,
    with_check::text as with_check_expression
FROM pg_policies 
WHERE tablename IN ('transferencias', 'transferencias_itens')
ORDER BY tablename, cmd;

-- ============================================================================
-- PASSO 2: REMOVER POLÍTICAS RESTRITIVAS DE INSERT (SE EXISTIREM)
-- ============================================================================

DROP POLICY IF EXISTS "Usuários podem criar transferências" ON transferencias;
DROP POLICY IF EXISTS "Usuários podem adicionar itens" ON transferencias_itens;

-- ============================================================================
-- PASSO 3: CRIAR POLÍTICAS PERMISSIVAS DE INSERT
-- ============================================================================

-- Política para INSERT em transferencias
DROP POLICY IF EXISTS "Usuarios autenticados podem criar transferencias" ON transferencias;
CREATE POLICY "Usuarios autenticados podem criar transferencias"
ON transferencias FOR INSERT TO authenticated WITH CHECK (true);

-- Política para INSERT em transferencias_itens
DROP POLICY IF EXISTS "Usuarios autenticados podem criar transferencias itens" ON transferencias_itens;
CREATE POLICY "Usuarios autenticados podem criar transferencias itens"
ON transferencias_itens FOR INSERT TO authenticated WITH CHECK (true);

-- ============================================================================
-- PASSO 4: GARANTIR QUE SELECT TAMBÉM ESTÁ PERMISSIVO
-- ============================================================================

-- Se não existir política de SELECT permissiva, criar
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'transferencias' 
        AND cmd = 'r' 
        AND policyname LIKE '%autenticados%'
    ) THEN
        DROP POLICY IF EXISTS "Usuarios autenticados podem ver transferencias" ON transferencias;
        CREATE POLICY "Usuarios autenticados podem ver transferencias"
        ON transferencias FOR SELECT TO authenticated USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'transferencias_itens' 
        AND cmd = 'r'
        AND policyname LIKE '%autenticados%'
    ) THEN
        DROP POLICY IF EXISTS "Usuarios autenticados podem ver transferencias itens" ON transferencias_itens;
        CREATE POLICY "Usuarios autenticados podem ver transferencias itens"
        ON transferencias_itens FOR SELECT TO authenticated USING (true);
    END IF;
END $$;

-- ============================================================================
-- PASSO 5: VERIFICAÇÃO FINAL
-- ============================================================================

SELECT 
    '=== POLÍTICAS APÓS CORREÇÃO ===' as titulo;

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
    roles::text as roles
FROM pg_policies 
WHERE tablename IN ('transferencias', 'transferencias_itens')
ORDER BY tablename, cmd;

-- ============================================================================
-- RESULTADO ESPERADO:
-- ============================================================================
-- Deve mostrar políticas permissivas (WITH CHECK (true) ou USING (true))
-- para INSERT, SELECT, UPDATE e DELETE em ambas as tabelas
-- ============================================================================
