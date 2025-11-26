-- =====================================================
-- CORREÇÃO DO ENCODING EM REGISTROS ANTIGOS DO HISTÓRICO
-- =====================================================
-- Este script corrige os registros antigos que foram salvos com encoding incorreto

-- Corrigir "DevoluÃ§Ã£o" para "Devolucao" no campo motivo
UPDATE historico_estoque
SET motivo = REPLACE(motivo, 'DevoluÃ§Ã£o', 'Devolucao')
WHERE motivo LIKE '%DevoluÃ§Ã£o%';

-- Verificar quantos registros foram corrigidos
SELECT 
  COUNT(*) as registros_corrigidos,
  'Registros com encoding corrigido' as descricao
FROM historico_estoque
WHERE motivo LIKE '%Devolucao%' AND tipo_movimentacao = 'devolucao_venda';

-- Mostrar alguns exemplos corrigidos
SELECT 
  id,
  tipo_movimentacao,
  motivo,
  criado_em
FROM historico_estoque
WHERE tipo_movimentacao = 'devolucao_venda'
ORDER BY criado_em DESC
LIMIT 10;
