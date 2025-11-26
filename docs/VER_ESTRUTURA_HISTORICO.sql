-- Ver estrutura da tabela historico_estoque
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public'
  AND table_name = 'historico_estoque'
ORDER BY ordinal_position;

-- Ver constraints NOT NULL
SELECT
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_schema = 'public'
  AND tc.table_name = 'historico_estoque'
  AND tc.constraint_type = 'CHECK'
ORDER BY kcu.column_name;
