-- Investigação dos ajustes problemáticos
-- Data: 25/11/2025

-- =====================================================
-- 1. VERIFICAR SE HÁ AJUSTES COM quantidade_alterada NEGATIVA
-- =====================================================

SELECT 
  p.descricao,
  h.criado_em,
  h.tipo_movimentacao,
  h.quantidade,
  h.quantidade_alterada,
  h.quantidade_anterior,
  h.quantidade_nova,
  h.motivo,
  CASE 
    WHEN h.quantidade_alterada < 0 THEN 'SAÍDA'
    WHEN h.quantidade_alterada > 0 THEN 'ENTRADA'
    ELSE 'ZERO'
  END as direcao
FROM historico_estoque h
JOIN produtos p ON p.id = h.id_produto
WHERE h.id_produto = 'e138eed1-e316-4d2a-990e-7f1ebdee06c7'
  AND h.id_loja = (SELECT id FROM lojas WHERE nome = 'ATACADO')
  AND h.tipo_movimentacao = 'ajuste'
  AND h.quantidade_alterada < 0
ORDER BY h.criado_em;

-- =====================================================
-- 2. CONTAR AJUSTES POSITIVOS vs NEGATIVOS
-- =====================================================

SELECT 
  CASE 
    WHEN h.quantidade_alterada < 0 THEN 'Ajuste NEGATIVO (saída)'
    WHEN h.quantidade_alterada > 0 THEN 'Ajuste POSITIVO (entrada)'
    ELSE 'Ajuste ZERO'
  END as tipo_ajuste,
  COUNT(*) as quantidade_registros,
  SUM(ABS(h.quantidade_alterada)) as soma_absoluta
FROM historico_estoque h
WHERE h.id_produto = 'e138eed1-e316-4d2a-990e-7f1ebdee06c7'
  AND h.id_loja = (SELECT id FROM lojas WHERE nome = 'ATACADO')
  AND h.tipo_movimentacao = 'ajuste'
GROUP BY 
  CASE 
    WHEN h.quantidade_alterada < 0 THEN 'Ajuste NEGATIVO (saída)'
    WHEN h.quantidade_alterada > 0 THEN 'Ajuste POSITIVO (entrada)'
    ELSE 'Ajuste ZERO'
  END;

-- =====================================================
-- 3. ANÁLISE DETALHADA: DE ONDE VEM OS 381 de SAÍDA?
-- =====================================================

-- Verificar se o problema está na diferença entre quantidade_anterior e quantidade_nova
SELECT 
  p.descricao,
  h.criado_em,
  h.tipo_movimentacao,
  h.quantidade,
  h.quantidade_alterada,
  h.quantidade_anterior,
  h.quantidade_nova,
  (h.quantidade_nova - COALESCE(h.quantidade_anterior, 0)) as diferenca_calculada,
  h.motivo
FROM historico_estoque h
JOIN produtos p ON p.id = h.id_produto
WHERE h.id_produto = 'e138eed1-e316-4d2a-990e-7f1ebdee06c7'
  AND h.id_loja = (SELECT id FROM lojas WHERE nome = 'ATACADO')
  AND h.tipo_movimentacao = 'ajuste'
  AND h.quantidade_alterada IS NOT NULL
  AND (h.quantidade_nova - COALESCE(h.quantidade_anterior, 0)) != h.quantidade_alterada
ORDER BY h.criado_em
LIMIT 20;

-- =====================================================
-- 4. RECALCULAR COM LÓGICA CORRETA PARA AJUSTES
-- =====================================================

-- Ajustes devem usar quantidade_alterada DIRETAMENTE (pode ser + ou -)
SELECT 
  p.descricao,
  -- Total de entradas (incluindo ajustes positivos)
  SUM(
    CASE 
      WHEN h.tipo_movimentacao = 'ajuste' AND h.quantidade_alterada > 0 THEN h.quantidade_alterada
      WHEN h.quantidade IS NOT NULL AND h.tipo_movimentacao IN ('entrada', 'devolucao_venda') THEN h.quantidade
      WHEN h.quantidade IS NULL AND h.quantidade_alterada > 0 AND h.tipo_movimentacao != 'ajuste' THEN h.quantidade_alterada
      ELSE 0
    END
  ) as total_entradas,
  -- Total de saídas (incluindo ajustes negativos)
  SUM(
    CASE 
      WHEN h.tipo_movimentacao = 'ajuste' AND h.quantidade_alterada < 0 THEN h.quantidade_alterada
      WHEN h.quantidade IS NOT NULL AND h.tipo_movimentacao IN ('saida', 'quebra', 'venda') THEN -h.quantidade
      WHEN h.quantidade IS NULL AND h.quantidade_alterada < 0 AND h.tipo_movimentacao != 'ajuste' THEN h.quantidade_alterada
      ELSE 0
    END
  ) as total_saidas,
  -- Saldo
  SUM(
    CASE 
      -- Ajustes: usar quantidade_alterada diretamente (já tem o sinal correto)
      WHEN h.tipo_movimentacao = 'ajuste' THEN h.quantidade_alterada
      -- Entradas/devoluções com quantidade preenchida
      WHEN h.quantidade IS NOT NULL AND h.tipo_movimentacao IN ('entrada', 'devolucao_venda') THEN h.quantidade
      -- Saídas/vendas com quantidade preenchida
      WHEN h.quantidade IS NOT NULL AND h.tipo_movimentacao IN ('saida', 'quebra', 'venda') THEN -h.quantidade
      -- Outros com quantidade_alterada
      WHEN h.quantidade IS NULL THEN h.quantidade_alterada
      ELSE 0
    END
  ) as saldo_calculado,
  e.quantidade as estoque_real,
  e.quantidade - SUM(
    CASE 
      WHEN h.tipo_movimentacao = 'ajuste' THEN h.quantidade_alterada
      WHEN h.quantidade IS NOT NULL AND h.tipo_movimentacao IN ('entrada', 'devolucao_venda') THEN h.quantidade
      WHEN h.quantidade IS NOT NULL AND h.tipo_movimentacao IN ('saida', 'quebra', 'venda') THEN -h.quantidade
      WHEN h.quantidade IS NULL THEN h.quantidade_alterada
      ELSE 0
    END
  ) as diferenca
FROM historico_estoque h
JOIN produtos p ON p.id = h.id_produto
LEFT JOIN estoque_lojas e ON e.id_produto = h.id_produto AND e.id_loja = h.id_loja
WHERE h.id_produto = 'e138eed1-e316-4d2a-990e-7f1ebdee06c7'
  AND h.id_loja = (SELECT id FROM lojas WHERE nome = 'ATACADO')
GROUP BY p.descricao, e.quantidade;

-- =====================================================
-- 5. COMPARAR: CÁLCULO ANTIGO vs NOVO
-- =====================================================

WITH calculo_antigo AS (
  SELECT 
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
    ) as saldo
  FROM historico_estoque h
  WHERE h.id_produto = 'e138eed1-e316-4d2a-990e-7f1ebdee06c7'
    AND h.id_loja = (SELECT id FROM lojas WHERE nome = 'ATACADO')
),
calculo_novo AS (
  SELECT 
    SUM(
      CASE 
        WHEN h.tipo_movimentacao = 'ajuste' THEN h.quantidade_alterada
        WHEN h.quantidade IS NOT NULL AND h.tipo_movimentacao IN ('entrada', 'devolucao_venda') THEN h.quantidade
        WHEN h.quantidade IS NOT NULL AND h.tipo_movimentacao IN ('saida', 'quebra', 'venda') THEN -h.quantidade
        WHEN h.quantidade IS NULL THEN h.quantidade_alterada
        ELSE 0
      END
    ) as saldo
  FROM historico_estoque h
  WHERE h.id_produto = 'e138eed1-e316-4d2a-990e-7f1ebdee06c7'
    AND h.id_loja = (SELECT id FROM lojas WHERE nome = 'ATACADO')
)
SELECT 
  ca.saldo as calculo_antigo,
  cn.saldo as calculo_novo,
  (SELECT quantidade FROM estoque_lojas WHERE id_produto = 'e138eed1-e316-4d2a-990e-7f1ebdee06c7' AND id_loja = (SELECT id FROM lojas WHERE nome = 'ATACADO')) as estoque_real,
  cn.saldo - ca.saldo as diferenca_entre_calculos
FROM calculo_antigo ca, calculo_novo cn;
