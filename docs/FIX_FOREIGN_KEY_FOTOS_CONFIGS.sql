-- =====================================================
-- SOLUÇÃO: Remover constraint de foreign key
-- =====================================================

-- PROBLEMA IDENTIFICADO:
-- As tabelas fotos_perfil e configuracoes_usuario têm FK para 'usuarios'
-- Mas técnicos não estão na tabela 'usuarios', estão em 'tecnicos'
-- Técnicos usam auth.uid() que aponta para auth.users, não para usuarios

-- SOLUÇÃO: Remover a constraint de FK para permitir que tanto
-- usuários quanto técnicos possam ter fotos e configurações

-- PASSO 1: Desabilitar RLS e remover políticas temporariamente
ALTER TABLE fotos_perfil DISABLE ROW LEVEL SECURITY;
ALTER TABLE configuracoes_usuario DISABLE ROW LEVEL SECURITY;

-- Remover políticas de fotos_perfil
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'fotos_perfil')
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON fotos_perfil';
    END LOOP;
END $$;

-- Remover políticas de configuracoes_usuario
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'configuracoes_usuario')
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON configuracoes_usuario';
    END LOOP;
END $$;

-- PASSO 2: Remover constraints de FK
DO $$
DECLARE
    constraint_name text;
BEGIN
    -- Buscar o nome da constraint de fotos_perfil
    SELECT tc.constraint_name INTO constraint_name
    FROM information_schema.table_constraints AS tc
    WHERE tc.table_name = 'fotos_perfil'
      AND tc.constraint_type = 'FOREIGN KEY'
      AND EXISTS (
          SELECT 1 
          FROM information_schema.key_column_usage AS kcu
          WHERE kcu.constraint_name = tc.constraint_name
            AND kcu.column_name = 'usuario_id'
      );
    
    -- Remover constraint se existir
    IF constraint_name IS NOT NULL THEN
        EXECUTE 'ALTER TABLE fotos_perfil DROP CONSTRAINT ' || constraint_name;
        RAISE NOTICE 'Constraint % removida de fotos_perfil', constraint_name;
    END IF;
END $$;

DO $$
DECLARE
    constraint_name text;
BEGIN
    -- Buscar o nome da constraint de configuracoes_usuario
    SELECT tc.constraint_name INTO constraint_name
    FROM information_schema.table_constraints AS tc
    WHERE tc.table_name = 'configuracoes_usuario'
      AND tc.constraint_type = 'FOREIGN KEY'
      AND EXISTS (
          SELECT 1 
          FROM information_schema.key_column_usage AS kcu
          WHERE kcu.constraint_name = tc.constraint_name
            AND kcu.column_name = 'usuario_id'
      );
    
    -- Remover constraint se existir
    IF constraint_name IS NOT NULL THEN
        EXECUTE 'ALTER TABLE configuracoes_usuario DROP CONSTRAINT ' || constraint_name;
        RAISE NOTICE 'Constraint % removida de configuracoes_usuario', constraint_name;
    END IF;
END $$;

-- PASSO 3: Garantir que usuario_id é do tipo UUID
ALTER TABLE fotos_perfil 
  ALTER COLUMN usuario_id TYPE uuid USING usuario_id::uuid;

ALTER TABLE configuracoes_usuario 
  ALTER COLUMN usuario_id TYPE uuid USING usuario_id::uuid;

-- PASSO 4: Reativar RLS
ALTER TABLE fotos_perfil ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracoes_usuario ENABLE ROW LEVEL SECURITY;

-- PASSO 5: Recriar políticas
CREATE POLICY "fotos_perfil_select_final"
  ON fotos_perfil FOR SELECT
  TO authenticated
  USING (usuario_id = auth.uid());

CREATE POLICY "fotos_perfil_insert_final"
  ON fotos_perfil FOR INSERT
  TO authenticated
  WITH CHECK (usuario_id = auth.uid());

CREATE POLICY "fotos_perfil_update_final"
  ON fotos_perfil FOR UPDATE
  TO authenticated
  USING (usuario_id = auth.uid())
  WITH CHECK (usuario_id = auth.uid());

CREATE POLICY "fotos_perfil_delete_final"
  ON fotos_perfil FOR DELETE
  TO authenticated
  USING (usuario_id = auth.uid());

CREATE POLICY "configuracoes_usuario_select_final"
  ON configuracoes_usuario FOR SELECT
  TO authenticated
  USING (usuario_id = auth.uid());

CREATE POLICY "configuracoes_usuario_insert_final"
  ON configuracoes_usuario FOR INSERT
  TO authenticated
  WITH CHECK (usuario_id = auth.uid());

CREATE POLICY "configuracoes_usuario_update_final"
  ON configuracoes_usuario FOR UPDATE
  TO authenticated
  USING (usuario_id = auth.uid())
  WITH CHECK (usuario_id = auth.uid());

CREATE POLICY "configuracoes_usuario_delete_final"
  ON configuracoes_usuario FOR DELETE
  TO authenticated
  USING (usuario_id = auth.uid());

-- PASSO 6: Verificar resultado
SELECT 
  tc.table_name,
  tc.constraint_name,
  tc.constraint_type
FROM information_schema.table_constraints AS tc
WHERE tc.table_name IN ('fotos_perfil', 'configuracoes_usuario')
  AND tc.constraint_type = 'FOREIGN KEY';

-- ✅ Não deve retornar nenhuma FK relacionada a usuario_id

-- PASSO 7: Verificar políticas recriadas
SELECT 
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE tablename IN ('fotos_perfil', 'configuracoes_usuario')
ORDER BY tablename, cmd, policyname;

-- ✅ Deve mostrar 8 políticas (4 por tabela)
