-- ============================================
-- VERIFICAR ESTRUTURA alertas_estoque_controle
-- ============================================

-- Ver estrutura completa
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'alertas_estoque_controle'
ORDER BY ordinal_position;

-- Ver exemplos
SELECT * FROM alertas_estoque_controle LIMIT 3;
