-- =====================================================
-- VERIFICAR TRIGGERS E FUNÇÕES DE historico_estoque
-- =====================================================

-- 1. Ver todos os triggers da tabela
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement,
  action_timing
FROM information_schema.triggers
WHERE event_object_table = 'historico_estoque';

-- 2. Ver estrutura atual da tabela
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'historico_estoque'
ORDER BY ordinal_position;

-- 3. Verificar se há função relacionada
SELECT 
  n.nspname as schema,
  p.proname as function_name,
  pg_get_functiondef(p.oid) as function_definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE p.proname LIKE '%historico_estoque%'
  OR p.proname LIKE '%estoque%'
ORDER BY p.proname;

-- 4. Tentar INSERT manual para ver erro detalhado
-- Descomente para testar:
/*
INSERT INTO historico_estoque (
  id_produto,
  id_loja,
  tipo_movimentacao,
  quantidade_alterada,
  quantidade_anterior,
  quantidade_nova,
  motivo,
  observacao,
  usuario_id
) VALUES (
  'd8096ee5-6339-4359-ae98-487c84ca65ec',
  16,
  'saida',
  -1,
  10,
  9,
  'Teste manual',
  'Teste',
  auth.uid()
);
*/
