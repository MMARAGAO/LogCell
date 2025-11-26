-- Resumo Executivo - Impacto da Correção no Estoque
-- Data: 25/11/2025

-- =====================================================
-- RESUMO DAS DUPLICAÇÕES ENCONTRADAS
-- =====================================================

-- Total de registros com duplicação
SELECT 
  COUNT(*) as total_registros_duplicados,
  SUM(h.quantidade) as total_unidades_duplicadas,
  COUNT(*) FILTER (WHERE h.tipo_movimentacao = 'saida') as duplicacoes_os,
  COUNT(*) FILTER (WHERE h.tipo_movimentacao = 'quebra') as duplicacoes_quebra
FROM historico_estoque h
WHERE h.id_produto = 'e138eed1-e316-4d2a-990e-7f1ebdee06c7'
  AND h.id_loja = (SELECT id FROM lojas WHERE nome = 'ATACADO')
  AND h.quantidade IS NOT NULL 
  AND h.quantidade_alterada IS NOT NULL;

-- =====================================================
-- IMPACTO NO CÁLCULO
-- =====================================================

WITH calculos AS (
  SELECT 
    p.descricao,
    -- SISTEMA ANTIGO (com duplicação)
    SUM(
      COALESCE(
        CASE 
          WHEN h.quantidade IS NOT NULL AND h.tipo_movimentacao IN ('entrada', 'saida', 'devolucao_venda', 'quebra') THEN
            CASE 
              WHEN h.tipo_movimentacao IN ('entrada', 'devolucao_venda') THEN h.quantidade
              WHEN h.tipo_movimentacao IN ('saida', 'quebra') THEN -h.quantidade
            END
          ELSE 0
        END,
        0
      ) + COALESCE(h.quantidade_alterada, 0)  -- ❌ Soma mesmo quando quantidade não é NULL
    ) as estoque_antigo,
    
    -- SISTEMA NOVO (sem duplicação)
    SUM(
      COALESCE(
        CASE 
          WHEN h.quantidade IS NOT NULL AND h.tipo_movimentacao IN ('entrada', 'saida', 'devolucao_venda', 'quebra') THEN
            CASE 
              WHEN h.tipo_movimentacao IN ('entrada', 'devolucao_venda') THEN h.quantidade
              WHEN h.tipo_movimentacao IN ('saida', 'quebra') THEN -h.quantidade
            END
          WHEN h.quantidade IS NULL THEN h.quantidade_alterada  -- ✅ Só usa se quantidade for NULL
          ELSE 0
        END,
        0
      )
    ) as estoque_novo
  FROM historico_estoque h
  JOIN produtos p ON p.id = h.id_produto
  WHERE h.id_produto IN (
    '3fec3d6e-37ca-4587-a608-94e1eeb42800',
    'e138eed1-e316-4d2a-990e-7f1ebdee06c7'
  )
  AND h.id_loja = (SELECT id FROM lojas WHERE nome = 'ATACADO')
  GROUP BY p.descricao
)
SELECT 
  c.descricao as produto,
  c.estoque_antigo as calculo_com_bug,
  c.estoque_novo as calculo_corrigido,
  (c.estoque_novo - c.estoque_antigo) as unidades_recuperadas,
  e.quantidade as estoque_atual_sistema,
  (e.quantidade - c.estoque_novo) as diferenca_restante,
  CASE 
    WHEN e.quantidade = c.estoque_novo THEN '✅ PERFEITO - Estoque bate'
    WHEN ABS(e.quantidade - c.estoque_novo) <= 2 THEN '⚠️ QUASE - Diferença pequena'
    ELSE '🔴 DIVERGENTE - Investigar mais'
  END as status_final
FROM calculos c
LEFT JOIN estoque_lojas e ON e.id_produto = (
  SELECT id FROM produtos WHERE descricao = c.descricao
)
WHERE e.id_loja = (SELECT id FROM lojas WHERE nome = 'ATACADO');

-- =====================================================
-- DETALHAMENTO POR TIPO DE MOVIMENTAÇÃO
-- =====================================================

SELECT 
  h.tipo_movimentacao,
  COUNT(*) as total_registros,
  
  -- Duplicados
  COUNT(*) FILTER (
    WHERE h.quantidade IS NOT NULL AND h.quantidade_alterada IS NOT NULL
  ) as com_duplicacao,
  
  -- Unidades afetadas
  SUM(h.quantidade) FILTER (
    WHERE h.quantidade IS NOT NULL AND h.quantidade_alterada IS NOT NULL
  ) as unidades_duplicadas,
  
  -- Impacto no estoque (diferença entre antigo e novo)
  SUM(ABS(h.quantidade_alterada)) FILTER (
    WHERE h.quantidade IS NOT NULL AND h.quantidade_alterada IS NOT NULL
  ) as impacto_correcao
FROM historico_estoque h
WHERE h.id_produto = 'e138eed1-e316-4d2a-990e-7f1ebdee06c7'
  AND h.id_loja = (SELECT id FROM lojas WHERE nome = 'ATACADO')
GROUP BY h.tipo_movimentacao
HAVING COUNT(*) FILTER (
  WHERE h.quantidade IS NOT NULL AND h.quantidade_alterada IS NOT NULL
) > 0
ORDER BY impacto_correcao DESC;
