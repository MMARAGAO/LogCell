-- Script de investigação profunda das entradas não registradas
-- Data: 25/11/2025

-- =====================================================
-- 1. ANALISAR TODAS AS ENTRADAS REGISTRADAS
-- =====================================================

SELECT 
  p.descricao,
  h.criado_em,
  h.tipo_movimentacao,
  h.quantidade,
  h.quantidade_alterada,
  COALESCE(
    CASE 
      WHEN h.quantidade IS NOT NULL AND h.tipo_movimentacao IN ('entrada', 'devolucao_venda') THEN h.quantidade
      WHEN h.quantidade IS NULL AND h.quantidade_alterada > 0 THEN h.quantidade_alterada
      ELSE 0
    END,
    0
  ) as entrada_efetiva,
  h.motivo,
  u.nome as usuario
FROM historico_estoque h
JOIN produtos p ON p.id = h.id_produto
LEFT JOIN usuarios u ON u.id = h.usuario_id
WHERE h.id_produto = 'e138eed1-e316-4d2a-990e-7f1ebdee06c7'
  AND h.id_loja = (SELECT id FROM lojas WHERE nome = 'ATACADO')
  AND (
    h.tipo_movimentacao IN ('entrada', 'devolucao_venda', 'transferencia_entrada') OR
    (h.quantidade_alterada > 0 AND h.tipo_movimentacao = 'ajuste')
  )
ORDER BY h.criado_em;

-- =====================================================
-- 2. SOMAR ENTRADAS vs SAÍDAS
-- =====================================================

WITH movimentacoes AS (
  SELECT 
    h.tipo_movimentacao,
    -- Entradas (positivas)
    SUM(
      CASE 
        WHEN h.quantidade IS NOT NULL AND h.tipo_movimentacao IN ('entrada', 'devolucao_venda') THEN h.quantidade
        WHEN h.quantidade IS NULL AND h.quantidade_alterada > 0 THEN h.quantidade_alterada
        ELSE 0
      END
    ) as total_entradas,
    -- Saídas (negativas, transformar em positivo para visualização)
    SUM(
      CASE 
        WHEN h.quantidade IS NOT NULL AND h.tipo_movimentacao IN ('saida', 'quebra') THEN h.quantidade
        WHEN h.quantidade IS NULL AND h.quantidade_alterada < 0 THEN ABS(h.quantidade_alterada)
        ELSE 0
      END
    ) as total_saidas,
    COUNT(*) as qtd_registros
  FROM historico_estoque h
  WHERE h.id_produto = 'e138eed1-e316-4d2a-990e-7f1ebdee06c7'
    AND h.id_loja = (SELECT id FROM lojas WHERE nome = 'ATACADO')
  GROUP BY h.tipo_movimentacao
)
SELECT 
  tipo_movimentacao,
  COALESCE(total_entradas, 0) as entradas,
  COALESCE(total_saidas, 0) as saidas,
  qtd_registros
FROM movimentacoes
ORDER BY tipo_movimentacao;

-- =====================================================
-- 3. BALANÇO GERAL
-- =====================================================

SELECT 
  p.descricao,
  -- Total de entradas
  SUM(
    CASE 
      WHEN h.quantidade IS NOT NULL AND h.tipo_movimentacao IN ('entrada', 'devolucao_venda') THEN h.quantidade
      WHEN h.quantidade IS NULL AND h.quantidade_alterada > 0 THEN h.quantidade_alterada
      ELSE 0
    END
  ) as total_entradas,
  -- Total de saídas (já em negativo)
  SUM(
    CASE 
      WHEN h.quantidade IS NOT NULL AND h.tipo_movimentacao IN ('saida', 'quebra') THEN -h.quantidade
      WHEN h.quantidade IS NULL AND h.quantidade_alterada < 0 THEN h.quantidade_alterada
      ELSE 0
    END
  ) as total_saidas,
  -- Saldo
  SUM(
    COALESCE(
      CASE 
        WHEN h.quantidade IS NOT NULL AND h.tipo_movimentacao IN ('entrada', 'saida', 'devolucao_venda', 'quebra') THEN
          CASE 
            WHEN h.tipo_movimentacao IN ('entrada', 'devolucao_venda') THEN h.quantidade
            WHEN h.tipo_movimentacao IN ('saida', 'quebra') THEN -h.quantidade
          END
        WHEN h.quantidade IS NULL THEN h.quantidade_alterada
        ELSE 0
      END,
      0
    )
  ) as saldo_calculado,
  e.quantidade as estoque_real,
  e.quantidade - SUM(
    COALESCE(
      CASE 
        WHEN h.quantidade IS NOT NULL AND h.tipo_movimentacao IN ('entrada', 'saida', 'devolucao_venda', 'quebra') THEN
          CASE 
            WHEN h.tipo_movimentacao IN ('entrada', 'devolucao_venda') THEN h.quantidade
            WHEN h.tipo_movimentacao IN ('saida', 'quebra') THEN -h.quantidade
          END
        WHEN h.quantidade IS NULL THEN h.quantidade_alterada
        ELSE 0
      END,
      0
    )
  ) as entradas_nao_registradas
FROM historico_estoque h
JOIN produtos p ON p.id = h.id_produto
LEFT JOIN estoque_lojas e ON e.id_produto = h.id_produto AND e.id_loja = h.id_loja
WHERE h.id_produto IN (
  '3fec3d6e-37ca-4587-a608-94e1eeb42800',
  'e138eed1-e316-4d2a-990e-7f1ebdee06c7'
)
AND h.id_loja = (SELECT id FROM lojas WHERE nome = 'ATACADO')
GROUP BY p.descricao, e.quantidade;

-- =====================================================
-- 4. VERIFICAR VENDAS SEM HISTÓRICO
-- =====================================================

-- Verificar se há vendas que baixaram estoque mas não registraram no histórico
SELECT 
  v.id,
  v.numero_venda,
  v.criado_em,
  p.descricao as produto,
  iv.quantidade,
  'Venda sem registro no histórico?' as suspeita
FROM vendas v
JOIN itens_venda iv ON iv.id_venda = v.id
JOIN produtos p ON p.id = iv.id_produto
WHERE iv.id_produto = 'e138eed1-e316-4d2a-990e-7f1ebdee06c7'
  AND v.id_loja = (SELECT id FROM lojas WHERE nome = 'ATACADO')
  AND NOT EXISTS (
    SELECT 1 FROM historico_estoque h
    WHERE h.id_produto = iv.id_produto
      AND h.tipo_movimentacao IN ('venda', 'baixa_edicao_venda')
      AND h.criado_em BETWEEN v.criado_em - INTERVAL '1 minute' AND v.criado_em + INTERVAL '1 minute'
  )
ORDER BY v.criado_em DESC;

-- =====================================================
-- 5. VERIFICAR SE HÁ ESTOQUE INICIAL NÃO REGISTRADO
-- =====================================================

-- O primeiro registro deveria ser uma entrada inicial
SELECT 
  p.descricao,
  MIN(h.criado_em) as primeiro_registro,
  h.tipo_movimentacao as tipo_primeiro_registro,
  h.quantidade_anterior as estoque_antes,
  h.quantidade_nova as estoque_depois,
  CASE 
    WHEN h.quantidade_anterior IS NOT NULL AND h.quantidade_anterior > 0 THEN
      'ATENÇÃO: Havia ' || h.quantidade_anterior || ' unidades ANTES do primeiro registro!'
    ELSE 'OK'
  END as alerta
FROM historico_estoque h
JOIN produtos p ON p.id = h.id_produto
WHERE h.id_produto = 'e138eed1-e316-4d2a-990e-7f1ebdee06c7'
  AND h.id_loja = (SELECT id FROM lojas WHERE nome = 'ATACADO')
GROUP BY p.descricao, h.tipo_movimentacao, h.quantidade_anterior, h.quantidade_nova
ORDER BY MIN(h.criado_em)
LIMIT 1;
