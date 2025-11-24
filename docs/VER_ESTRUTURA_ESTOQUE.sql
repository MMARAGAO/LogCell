-- ============================================
-- VERIFICAR ESTRUTURA DA TABELA estoque_lojas
-- ============================================

-- Ver estrutura completa
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'estoque_lojas'
ORDER BY ordinal_position;

-- Ver uma linha de exemplo
SELECT * FROM estoque_lojas LIMIT 1;
