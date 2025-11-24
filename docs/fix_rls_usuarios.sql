-- =====================================================
-- VERIFICAR E AJUSTAR POLÍTICAS RLS DA TABELA USUARIOS
-- =====================================================

-- 1. Ver políticas atuais
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
WHERE tablename = 'usuarios'
ORDER BY policyname;

-- 2. Verificar se RLS está habilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'usuarios';

-- =====================================================
-- CRIAR POLÍTICA PARA PERMITIR INSERT
-- =====================================================

-- Remover política se existir e recriar
DROP POLICY IF EXISTS "Permitir insert de novos usuarios" ON usuarios;

-- Permitir que usuários autenticados possam criar novos usuários
-- (necessário para o cadastro funcionar)
CREATE POLICY "Permitir insert de novos usuarios"
  ON usuarios
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- =====================================================
-- VERIFICAR NOVAMENTE
-- =====================================================

SELECT 
    policyname,
    cmd
FROM pg_policies 
WHERE tablename = 'usuarios'
ORDER BY policyname;
