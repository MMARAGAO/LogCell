-- Script para corrigir cálculo de estoque considerando ambos os sistemas
-- Data: 25/11/2025
-- Problema: historico_estoque tem dois padrões (quantidade vs quantidade_alterada)

-- =====================================================
-- PARTE 1: VERIFICAR ESTOQUE COM CÁLCULO CORRETO
-- =====================================================

-- Substituir os nomes dos produtos pelos IDs encontrados
-- ID do teste: 3fec3d6e-37ca-4587-a608-94e1eeb42800
-- ID da Bateria: e138eed1-e316-4d2a-990e-7f1ebdee06c7

-- Calcular estoque CORRETO usando AMBOS os sistemas
WITH movimentacoes_unificadas AS (
  SELECT 
    h.id_produto,
    p.descricao as produto,
    h.criado_em,
    h.tipo_movimentacao,
    h.motivo,
    -- Usar quantidade se preenchida (PRIORIDADE para evitar duplicação), senão usar quantidade_alterada
    COALESCE(
      CASE 
        -- Para entrada/saida com quantidade preenchida, usar diretamente
        WHEN h.quantidade IS NOT NULL AND h.tipo_movimentacao IN ('entrada', 'saida', 'devolucao_venda', 'quebra') THEN
          CASE 
            WHEN h.tipo_movimentacao IN ('entrada', 'devolucao_venda') THEN h.quantidade
            WHEN h.tipo_movimentacao IN ('saida', 'quebra') THEN -h.quantidade
          END
        -- Senão, usar quantidade_alterada APENAS se quantidade for NULL
        WHEN h.quantidade IS NULL THEN h.quantidade_alterada
        -- Fallback
        ELSE 0
      END,
      0
    ) as quantidade_efetiva,
    u.nome as usuario
  FROM historico_estoque h
  JOIN produtos p ON p.id = h.id_produto
  LEFT JOIN usuarios u ON u.id = h.usuario_id
  WHERE h.id_produto IN (
    '3fec3d6e-37ca-4587-a608-94e1eeb42800',  -- teste
    'e138eed1-e316-4d2a-990e-7f1ebdee06c7'   -- Bateria iPhone 17
  )
  AND h.id_loja = (SELECT id FROM lojas WHERE nome = 'ATACADO')
)
SELECT 
  produto,
  COUNT(*) as total_movimentacoes,
  SUM(quantidade_efetiva) as estoque_calculado,
  STRING_AGG(
    CONCAT(
      TO_CHAR(criado_em, 'DD/MM HH24:MI'), 
      ' | ', 
      tipo_movimentacao,
      ': ',
      quantidade_efetiva
    ), 
    E'\n' 
    ORDER BY criado_em
  ) as historico_resumido
FROM movimentacoes_unificadas
GROUP BY produto;

-- =====================================================
-- PARTE 2: COMPARAR COM ESTOQUE ATUAL
-- =====================================================

WITH estoque_calculado AS (
  SELECT 
    h.id_produto,
    p.descricao,
    SUM(
      COALESCE(
        CASE 
          -- Prioriza quantidade para evitar duplicação
          WHEN h.quantidade IS NOT NULL AND h.tipo_movimentacao IN ('entrada', 'saida', 'devolucao_venda', 'quebra') THEN
            CASE 
              WHEN h.tipo_movimentacao IN ('entrada', 'devolucao_venda') THEN h.quantidade
              WHEN h.tipo_movimentacao IN ('saida', 'quebra') THEN -h.quantidade
            END
          -- Usa quantidade_alterada APENAS se quantidade for NULL
          WHEN h.quantidade IS NULL THEN h.quantidade_alterada
          ELSE 0
        END,
        0
      )
    ) as calculado
  FROM historico_estoque h
  JOIN produtos p ON p.id = h.id_produto
  WHERE h.id_produto IN (
    '3fec3d6e-37ca-4587-a608-94e1eeb42800',
    'e138eed1-e316-4d2a-990e-7f1ebdee06c7'
  )
  AND h.id_loja = (SELECT id FROM lojas WHERE nome = 'ATACADO')
  GROUP BY h.id_produto, p.descricao
)
SELECT 
  ec.descricao as produto,
  e.quantidade as estoque_atual,
  ec.calculado as estoque_calculado,
  e.quantidade - ec.calculado as diferenca,
  CASE 
    WHEN e.quantidade = ec.calculado THEN '✅ OK'
    WHEN e.quantidade > ec.calculado THEN '⚠️ ESTOQUE MAIOR (possível entrada não registrada)'
    ELSE '🔴 ESTOQUE MENOR (possível saída não registrada)'
  END as status
FROM estoque_calculado ec
JOIN estoque_lojas e ON e.id_produto = ec.id_produto
WHERE e.id_loja = (SELECT id FROM lojas WHERE nome = 'ATACADO')
ORDER BY ec.descricao;

-- =====================================================
-- PARTE 3: CORRIGIR ESTOQUE (SE NECESSÁRIO)
-- =====================================================

-- ⚠️ ATENÇÃO: Execute apenas se a diferença for confirmada como erro real
-- Este script irá ajustar o estoque para o valor calculado

/*
WITH estoque_calculado AS (
  SELECT 
    h.id_produto,
    h.id_loja,
    SUM(
      COALESCE(
        CASE 
          -- Prioriza quantidade para evitar duplicação
          WHEN h.quantidade IS NOT NULL AND h.tipo_movimentacao IN ('entrada', 'saida', 'devolucao_venda', 'quebra') THEN
            CASE 
              WHEN h.tipo_movimentacao IN ('entrada', 'devolucao_venda') THEN h.quantidade
              WHEN h.tipo_movimentacao IN ('saida', 'quebra') THEN -h.quantidade
            END
          -- Usa quantidade_alterada APENAS se quantidade for NULL
          WHEN h.quantidade IS NULL THEN h.quantidade_alterada
          ELSE 0
        END,
        0
      )
    ) as calculado
  FROM historico_estoque h
  WHERE h.id_produto IN (
    '3fec3d6e-37ca-4587-a608-94e1eeb42800',
    'e138eed1-e316-4d2a-990e-7f1ebdee06c7'
  )
  AND h.id_loja = (SELECT id FROM lojas WHERE nome = 'ATACADO')
  GROUP BY h.id_produto, h.id_loja
)
UPDATE estoque_lojas e
SET 
  quantidade = ec.calculado,
  atualizado_em = NOW(),
  atualizado_por = auth.uid()
FROM estoque_calculado ec
WHERE e.id_produto = ec.id_produto 
  AND e.id_loja = ec.id_loja
  AND e.quantidade != ec.calculado
RETURNING 
  (SELECT descricao FROM produtos WHERE id = e.id_produto) as produto,
  quantidade as estoque_novo;
*/

-- =====================================================
-- PARTE 4: VERIFICAR MOVIMENTAÇÕES SUSPEITAS
-- =====================================================

-- Encontrar registros com padrão estranho (ambos preenchidos ou ambos NULL)
SELECT 
  p.descricao as produto,
  h.criado_em,
  h.tipo_movimentacao,
  h.quantidade,
  h.quantidade_alterada,
  h.quantidade_anterior,
  h.quantidade_nova,
  h.motivo,
  CASE 
    WHEN h.quantidade IS NOT NULL AND h.quantidade_alterada IS NOT NULL THEN '⚠️ AMBOS PREENCHIDOS'
    WHEN h.quantidade IS NULL AND h.quantidade_alterada IS NULL THEN '🔴 AMBOS NULL'
    ELSE '✅ OK'
  END as status
FROM historico_estoque h
JOIN produtos p ON p.id = h.id_produto
WHERE h.id_produto IN (
  '3fec3d6e-37ca-4587-a608-94e1eeb42800',
  'e138eed1-e316-4d2a-990e-7f1ebdee06c7'
)
AND h.id_loja = (SELECT id FROM lojas WHERE nome = 'ATACADO')
AND (
  (h.quantidade IS NOT NULL AND h.quantidade_alterada IS NOT NULL) OR
  (h.quantidade IS NULL AND h.quantidade_alterada IS NULL)
)
ORDER BY h.criado_em DESC;
