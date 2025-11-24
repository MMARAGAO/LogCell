-- =====================================================
-- SOLUÇÃO DEFINITIVA: 406 Not Acceptable
-- =====================================================

-- PROBLEMA: Erro 406 persiste mesmo após remover FK
-- CAUSA PROVÁVEL: Políticas RLS duplicadas ou conflitantes
-- SOLUÇÃO: Limpeza TOTAL e recriação limpa

-- =====================================================
-- PARTE 1: DIAGNÓSTICO COMPLETO
-- =====================================================

-- 1.1 Verificar TODAS as políticas existentes
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
WHERE tablename IN ('fotos_perfil', 'configuracoes_usuario')
ORDER BY tablename, policyname;

-- 1.2 Verificar constraints FK (deve retornar 0)
SELECT 
  tc.table_name,
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name,
  ccu.table_name AS foreign_table_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
LEFT JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name IN ('fotos_perfil', 'configuracoes_usuario')
  AND tc.constraint_type = 'FOREIGN KEY';

-- 1.3 Verificar tipo da coluna usuario_id
SELECT 
  table_name,
  column_name,
  data_type,
  udt_name
FROM information_schema.columns
WHERE table_name IN ('fotos_perfil', 'configuracoes_usuario')
  AND column_name = 'usuario_id';

-- =====================================================
-- PARTE 2: LIMPEZA TOTAL
-- =====================================================

-- 2.1 Desabilitar RLS temporariamente
ALTER TABLE fotos_perfil DISABLE ROW LEVEL SECURITY;
ALTER TABLE configuracoes_usuario DISABLE ROW LEVEL SECURITY;

-- 2.2 Remover TODAS as políticas (incluindo as antigas)
DO $$
DECLARE
    r RECORD;
BEGIN
    -- Remover TODAS políticas de fotos_perfil
    FOR r IN (
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'fotos_perfil'
    )
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON fotos_perfil';
        RAISE NOTICE 'Política % removida de fotos_perfil', r.policyname;
    END LOOP;
    
    -- Remover TODAS políticas de configuracoes_usuario
    FOR r IN (
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'configuracoes_usuario'
    )
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON configuracoes_usuario';
        RAISE NOTICE 'Política % removida de configuracoes_usuario', r.policyname;
    END LOOP;
END $$;

-- 2.3 Garantir que não há FK constraints
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT tc.constraint_name, tc.table_name
        FROM information_schema.table_constraints AS tc
        WHERE tc.table_name IN ('fotos_perfil', 'configuracoes_usuario')
          AND tc.constraint_type = 'FOREIGN KEY'
          AND EXISTS (
              SELECT 1 
              FROM information_schema.key_column_usage AS kcu
              WHERE kcu.constraint_name = tc.constraint_name
                AND kcu.column_name = 'usuario_id'
          )
    )
    LOOP
        EXECUTE 'ALTER TABLE ' || r.table_name || ' DROP CONSTRAINT IF EXISTS ' || r.constraint_name;
        RAISE NOTICE 'Constraint % removida de %', r.constraint_name, r.table_name;
    END LOOP;
END $$;

-- 2.4 Garantir tipo UUID nas colunas
ALTER TABLE fotos_perfil 
  ALTER COLUMN usuario_id TYPE uuid USING usuario_id::uuid;

ALTER TABLE configuracoes_usuario 
  ALTER COLUMN usuario_id TYPE uuid USING usuario_id::uuid;

-- =====================================================
-- PARTE 3: RECRIAR POLÍTICAS LIMPAS
-- =====================================================

-- 3.1 Reativar RLS
ALTER TABLE fotos_perfil ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracoes_usuario ENABLE ROW LEVEL SECURITY;

-- 3.2 Criar políticas para fotos_perfil
CREATE POLICY "fotos_perfil_select_v2"
  ON fotos_perfil FOR SELECT
  TO authenticated
  USING (usuario_id = auth.uid());

CREATE POLICY "fotos_perfil_insert_v2"
  ON fotos_perfil FOR INSERT
  TO authenticated
  WITH CHECK (usuario_id = auth.uid());

CREATE POLICY "fotos_perfil_update_v2"
  ON fotos_perfil FOR UPDATE
  TO authenticated
  USING (usuario_id = auth.uid())
  WITH CHECK (usuario_id = auth.uid());

CREATE POLICY "fotos_perfil_delete_v2"
  ON fotos_perfil FOR DELETE
  TO authenticated
  USING (usuario_id = auth.uid());

-- 3.3 Criar políticas para configuracoes_usuario
CREATE POLICY "configuracoes_usuario_select_v2"
  ON configuracoes_usuario FOR SELECT
  TO authenticated
  USING (usuario_id = auth.uid());

CREATE POLICY "configuracoes_usuario_insert_v2"
  ON configuracoes_usuario FOR INSERT
  TO authenticated
  WITH CHECK (usuario_id = auth.uid());

CREATE POLICY "configuracoes_usuario_update_v2"
  ON configuracoes_usuario FOR UPDATE
  TO authenticated
  USING (usuario_id = auth.uid())
  WITH CHECK (usuario_id = auth.uid());

CREATE POLICY "configuracoes_usuario_delete_v2"
  ON configuracoes_usuario FOR DELETE
  TO authenticated
  USING (usuario_id = auth.uid());

-- =====================================================
-- PARTE 4: VERIFICAÇÃO FINAL
-- =====================================================

-- 4.1 Contar políticas (deve retornar 8 - 4 por tabela)
SELECT 
  tablename,
  COUNT(*) as total_policies
FROM pg_policies
WHERE tablename IN ('fotos_perfil', 'configuracoes_usuario')
GROUP BY tablename;

-- 4.2 Listar todas as políticas criadas
SELECT 
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE tablename IN ('fotos_perfil', 'configuracoes_usuario')
ORDER BY tablename, cmd, policyname;

-- 4.3 Confirmar que não há FK (deve retornar 0 linhas)
SELECT COUNT(*) as total_foreign_keys
FROM information_schema.table_constraints
WHERE table_name IN ('fotos_perfil', 'configuracoes_usuario')
  AND constraint_type = 'FOREIGN KEY';

-- 4.4 Verificar estrutura das tabelas
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name IN ('fotos_perfil', 'configuracoes_usuario')
ORDER BY table_name, ordinal_position;

-- =====================================================
-- PARTE 5: TESTE MANUAL (se necessário)
-- =====================================================

-- Testar SELECT como técnico (substitua pelo UUID real)
-- SET request.jwt.claims TO '{"sub": "59e37174-339c-4abe-9280-c4fb6a9d3962"}';
-- SELECT * FROM fotos_perfil WHERE usuario_id = '59e37174-339c-4abe-9280-c4fb6a9d3962';
-- SELECT * FROM configuracoes_usuario WHERE usuario_id = '59e37174-339c-4abe-9280-c4fb6a9d3962';

-- =====================================================
-- RESULTADO ESPERADO:
-- =====================================================
-- ✅ 8 políticas totais (4 por tabela) com sufixo _v2
-- ✅ 0 foreign keys
-- ✅ Colunas usuario_id do tipo UUID
-- ✅ RLS ativado em ambas as tabelas
-- ✅ Sem erros 406 ao fazer SELECT
