-- Ver TODOS os triggers em historico_estoque
SELECT 
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'public'
  AND event_object_table = 'historico_estoque'
ORDER BY action_timing, trigger_name;
