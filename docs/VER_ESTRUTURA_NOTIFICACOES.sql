-- Ver estrutura da tabela notificacoes
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'notificacoes'
ORDER BY ordinal_position;
