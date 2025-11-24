-- =====================================================
-- INSPEÇÃO COMPLETA: ordem_servico_pecas
-- =====================================================

-- 1. Ver estrutura completa da tabela
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default,
  character_maximum_length
FROM information_schema.columns
WHERE table_name = 'ordem_servico_pecas'
ORDER BY ordinal_position;

-- 2. Ver constraints e chaves estrangeiras
SELECT
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
LEFT JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'ordem_servico_pecas';

-- 3. Ver políticas RLS ativas
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
WHERE tablename = 'ordem_servico_pecas';

-- 4. Verificar se RLS está habilitado
SELECT 
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename = 'ordem_servico_pecas';

-- 5. Tentar INSERT de teste (comentado - use apenas para debug)
-- Descomente e ajuste os valores se quiser testar manualmente
/*
INSERT INTO ordem_servico_pecas (
  id_ordem_servico,
  id_produto,
  id_loja,
  tipo_produto,
  descricao_peca,
  quantidade,
  valor_custo,
  valor_venda,
  valor_total,
  criado_por
) VALUES (
  'c02110ee-53d2-4e93-acf8-449d3f0b3afb',
  'd8096ee5-6339-4359-ae98-487c84ca65ec',
  16,
  'estoque',
  'IPhone 16 Pro Max',
  1,
  0,
  0,
  0,
  auth.uid()
);
*/
