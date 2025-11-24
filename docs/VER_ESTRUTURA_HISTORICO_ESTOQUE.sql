-- Ver estrutura da tabela historico_estoque
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'historico_estoque'
ORDER BY ordinal_position;
