-- Verificar TODOS os triggers em ordem_servico_pecas
SELECT 
  trigger_name,
  event_manipulation,
  action_timing,
  action_order,
  action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'public'
  AND event_object_table = 'ordem_servico_pecas'
ORDER BY action_timing, action_order, trigger_name;

-- Verificar se há CHECK CONSTRAINTS
SELECT
  tc.constraint_name,
  tc.constraint_type,
  pg_get_constraintdef(pgc.oid) as definition
FROM information_schema.table_constraints tc
JOIN pg_constraint pgc ON pgc.conname = tc.constraint_name
WHERE tc.table_schema = 'public'
  AND tc.table_name = 'ordem_servico_pecas'
ORDER BY tc.constraint_type, tc.constraint_name;
