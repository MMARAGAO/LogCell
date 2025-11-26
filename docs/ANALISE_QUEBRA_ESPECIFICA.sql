-- Análise específica do caso da QUEBRA
-- Data: 25/11/2025

-- Verificar como a quebra está sendo registrada
SELECT 
  p.descricao,
  h.criado_em,
  h.tipo_movimentacao,
  h.quantidade as qtd_codigo,
  h.quantidade_alterada as qtd_trigger,
  h.quantidade_anterior,
  h.quantidade_nova,
  h.motivo,
  -- Cálculo ANTIGO (errado - soma ambos)
  CASE 
    WHEN h.tipo_movimentacao = 'quebra' THEN -h.quantidade
    ELSE 0
  END + COALESCE(h.quantidade_alterada, 0) as calculo_antigo_total,
  -- Cálculo NOVO (correto - prioriza quantidade)
  CASE 
    WHEN h.quantidade IS NOT NULL AND h.tipo_movimentacao = 'quebra' THEN -h.quantidade
    WHEN h.quantidade IS NULL THEN h.quantidade_alterada
    ELSE 0
  END as calculo_novo_total
FROM historico_estoque h
JOIN produtos p ON p.id = h.id_produto
WHERE h.tipo_movimentacao = 'quebra'
  AND h.id_produto = 'e138eed1-e316-4d2a-990e-7f1ebdee06c7'
  AND h.id_loja = (SELECT id FROM lojas WHERE nome = 'ATACADO')
ORDER BY h.criado_em DESC;

-- Análise: 
-- No caso visto: quantidade=1, quantidade_alterada=-1
-- 
-- ANTIGO: -1 (de quantidade) + (-1) (de quantidade_alterada) = -2 ❌
-- NOVO: -1 (de quantidade, ignora quantidade_alterada) = -1 ✅
