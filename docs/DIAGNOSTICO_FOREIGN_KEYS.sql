-- =====================================================
-- DIAGNÓSTICO: Verificar estrutura das tabelas
-- =====================================================

-- 1. Verificar foreign keys de fotos_perfil
SELECT
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
WHERE 
    tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name = 'fotos_perfil';

-- 2. Verificar foreign keys de configuracoes_usuario
SELECT
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
WHERE 
    tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name = 'configuracoes_usuario';

-- 3. Verificar tipo da coluna usuario_id
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name IN ('fotos_perfil', 'configuracoes_usuario', 'tecnicos', 'usuarios')
  AND column_name IN ('usuario_id', 'id')
ORDER BY table_name, column_name;

-- 4. Verificar se o técnico existe
SELECT 
  'tecnicos' as tabela,
  id,
  usuario_id,
  nome
FROM tecnicos
WHERE usuario_id = '59e37174-339c-4abe-9280-c4fb6a9d3962';

-- 5. Verificar se existe usuário admin com esse ID
SELECT 
  'usuarios' as tabela,
  id,
  nome,
  email
FROM usuarios
WHERE id = '59e37174-339c-4abe-9280-c4fb6a9d3962';
