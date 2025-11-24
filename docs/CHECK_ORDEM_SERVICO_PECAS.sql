-- =====================================================
-- VERIFICAR ESTRUTURA DA TABELA ordem_servico_pecas
-- =====================================================

SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'ordem_servico_pecas'
ORDER BY ordinal_position;
