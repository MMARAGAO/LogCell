-- Script de teste para verificar correção da duplicação
-- Data: 25/11/2025

-- =====================================================
-- TESTE 1: Comparar cálculo ANTIGO vs NOVO
-- =====================================================

-- CÁLCULO ANTIGO (com duplicação)
WITH calc_antigo AS (
  SELECT 
    p.descricao,
    SUM(
      COALESCE(
        CASE 
          WHEN h.quantidade IS NOT NULL AND h.tipo_movimentacao IN ('entrada', 'saida', 'devolucao_venda', 'quebra') THEN
            CASE 
              WHEN h.tipo_movimentacao IN ('entrada', 'devolucao_venda') THEN h.quantidade
              WHEN h.tipo_movimentacao IN ('saida', 'quebra') THEN -h.quantidade
            END
          ELSE h.quantidade_alterada  -- AQUI: Usa mesmo se quantidade não for NULL
        END,
        0
      )
    ) as estoque_antigo
  FROM historico_estoque h
  JOIN produtos p ON p.id = h.id_produto
  WHERE h.id_produto IN (
    '3fec3d6e-37ca-4587-a608-94e1eeb42800',
    'e138eed1-e316-4d2a-990e-7f1ebdee06c7'
  )
  AND h.id_loja = (SELECT id FROM lojas WHERE nome = 'ATACADO')
  GROUP BY p.descricao
),
-- CÁLCULO NOVO (sem duplicação)
calc_novo AS (
  SELECT 
    p.descricao,
    SUM(
      COALESCE(
        CASE 
          WHEN h.quantidade IS NOT NULL AND h.tipo_movimentacao IN ('entrada', 'saida', 'devolucao_venda', 'quebra') THEN
            CASE 
              WHEN h.tipo_movimentacao IN ('entrada', 'devolucao_venda') THEN h.quantidade
              WHEN h.tipo_movimentacao IN ('saida', 'quebra') THEN -h.quantidade
            END
          WHEN h.quantidade IS NULL THEN h.quantidade_alterada  -- AQUI: Só usa se quantidade for NULL
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
  COALESCE(a.descricao, n.descricao) as produto,
  a.estoque_antigo as calculo_com_duplicacao,
  n.estoque_novo as calculo_corrigido,
  (n.estoque_novo - a.estoque_antigo) as diferenca_encontrada,
  e.quantidade as estoque_atual,
  (e.quantidade - n.estoque_novo) as diferenca_ainda_existe
FROM calc_antigo a
FULL JOIN calc_novo n ON a.descricao = n.descricao
LEFT JOIN estoque_lojas e ON e.id_produto = (
  SELECT id FROM produtos WHERE descricao = COALESCE(a.descricao, n.descricao)
)
WHERE e.id_loja = (SELECT id FROM lojas WHERE nome = 'ATACADO');

-- =====================================================
-- TESTE 2: Contar registros duplicados por tipo
-- =====================================================

SELECT 
  h.tipo_movimentacao,
  COUNT(*) as total_registros,
  COUNT(*) FILTER (WHERE h.quantidade IS NOT NULL AND h.quantidade_alterada IS NOT NULL) as com_duplicacao,
  COUNT(*) FILTER (WHERE h.quantidade IS NOT NULL AND h.quantidade_alterada IS NULL) as so_quantidade,
  COUNT(*) FILTER (WHERE h.quantidade IS NULL AND h.quantidade_alterada IS NOT NULL) as so_alterada,
  COUNT(*) FILTER (WHERE h.quantidade IS NULL AND h.quantidade_alterada IS NULL) as nenhum
FROM historico_estoque h
WHERE h.id_produto IN (
  '3fec3d6e-37ca-4587-a608-94e1eeb42800',
  'e138eed1-e316-4d2a-990e-7f1ebdee06c7'
)
AND h.id_loja = (SELECT id FROM lojas WHERE nome = 'ATACADO')
GROUP BY h.tipo_movimentacao
ORDER BY com_duplicacao DESC;

-- =====================================================
-- TESTE 3: Ver registros que causam duplicação
-- =====================================================

SELECT 
  p.descricao,
  h.criado_em,
  h.tipo_movimentacao,
  h.quantidade as qtd_manual,
  h.quantidade_alterada as qtd_trigger,
  h.motivo,
  '⚠️ DUPLICADO: ' || 
  CASE 
    WHEN h.quantidade IS NOT NULL AND h.quantidade_alterada IS NOT NULL THEN
      'Contado ' || (ABS(h.quantidade) + ABS(h.quantidade_alterada)) || ' vezes (deveria ser ' || ABS(h.quantidade) || ')'
    ELSE 'OK'
  END as problema
FROM historico_estoque h
JOIN produtos p ON p.id = h.id_produto
WHERE h.id_produto IN (
  '3fec3d6e-37ca-4587-a608-94e1eeb42800',
  'e138eed1-e316-4d2a-990e-7f1ebdee06c7'
)
AND h.id_loja = (SELECT id FROM lojas WHERE nome = 'ATACADO')
AND h.quantidade IS NOT NULL 
AND h.quantidade_alterada IS NOT NULL
ORDER BY h.criado_em DESC
LIMIT 10;
