-- =====================================================
-- CORREÇÃO: REMOVER ENTRADAS DUPLICADAS
-- Data: 25/11/2025
-- =====================================================
-- Problema: Script foi executado 2x, duplicando as entradas retroativas
-- Solução: Deletar registros duplicados e recalcular estoque
-- =====================================================

BEGIN;

-- =====================================================
-- PASSO 1: DELETAR ENTRADAS DUPLICADAS
-- =====================================================

-- Deletar duplicatas mantendo apenas 1 registro de cada
WITH duplicatas AS (
  SELECT id, 
         ROW_NUMBER() OVER (
           PARTITION BY id_produto, motivo, criado_em 
           ORDER BY id
         ) as rn
  FROM historico_estoque
  WHERE motivo LIKE '%CORREÇÃO RETROATIVA%'
    AND criado_em = '2025-11-11 18:00:00+00'
)
DELETE FROM historico_estoque
WHERE id IN (
  SELECT id FROM duplicatas WHERE rn > 1
);

-- =====================================================
-- PASSO 2: RECALCULAR ESTOQUE CORRETO
-- =====================================================

-- Bateria iPhone 17
UPDATE estoque_lojas
SET 
  quantidade = (
    SELECT SUM(
      CASE 
        WHEN h.tipo_movimentacao = 'ajuste' THEN h.quantidade_alterada
        WHEN h.quantidade IS NOT NULL AND h.tipo_movimentacao IN ('entrada', 'devolucao_venda', 'transferencia_entrada') THEN h.quantidade
        WHEN h.quantidade IS NOT NULL AND h.tipo_movimentacao IN ('saida', 'quebra', 'venda', 'baixa_edicao_venda', 'transferencia_saida') THEN -h.quantidade
        WHEN h.quantidade IS NULL THEN h.quantidade_alterada
        ELSE 0
      END
    )
    FROM historico_estoque h
    WHERE h.id_produto = 'e138eed1-e316-4d2a-990e-7f1ebdee06c7'
      AND h.id_loja = estoque_lojas.id_loja
  ),
  atualizado_em = NOW()
WHERE id_produto = 'e138eed1-e316-4d2a-990e-7f1ebdee06c7'
  AND id_loja = (SELECT id FROM lojas WHERE nome = 'ATACADO');

-- teste
UPDATE estoque_lojas
SET 
  quantidade = (
    SELECT SUM(
      CASE 
        WHEN h.tipo_movimentacao = 'ajuste' THEN h.quantidade_alterada
        WHEN h.quantidade IS NOT NULL AND h.tipo_movimentacao IN ('entrada', 'devolucao_venda', 'transferencia_entrada') THEN h.quantidade
        WHEN h.quantidade IS NOT NULL AND h.tipo_movimentacao IN ('saida', 'quebra', 'venda', 'baixa_edicao_venda', 'transferencia_saida') THEN -h.quantidade
        WHEN h.quantidade IS NULL THEN h.quantidade_alterada
        ELSE 0
      END
    )
    FROM historico_estoque h
    WHERE h.id_produto = '3fec3d6e-37ca-4587-a608-94e1eeb42800'
      AND h.id_loja = estoque_lojas.id_loja
  ),
  atualizado_em = NOW()
WHERE id_produto = '3fec3d6e-37ca-4587-a608-94e1eeb42800'
  AND id_loja = (SELECT id FROM lojas WHERE nome = 'ATACADO');

COMMIT;

-- =====================================================
-- VERIFICAÇÃO IMEDIATA
-- =====================================================

SELECT 
  '🔧 DUPLICATAS REMOVIDAS' as resultado,
  COUNT(*) as registros_restantes
FROM historico_estoque
WHERE motivo LIKE '%CORREÇÃO RETROATIVA%'
  AND criado_em = '2025-11-11 18:00:00+00';

SELECT 
  p.descricao as produto,
  e.quantidade as estoque_atual,
  SUM(
    CASE 
      WHEN h.tipo_movimentacao = 'ajuste' THEN h.quantidade_alterada
      WHEN h.quantidade IS NOT NULL AND h.tipo_movimentacao IN ('entrada', 'devolucao_venda', 'transferencia_entrada') THEN h.quantidade
      WHEN h.quantidade IS NOT NULL AND h.tipo_movimentacao IN ('saida', 'quebra', 'venda', 'baixa_edicao_venda', 'transferencia_saida') THEN -h.quantidade
      WHEN h.quantidade IS NULL THEN h.quantidade_alterada
      ELSE 0
    END
  ) as estoque_calculado,
  CASE 
    WHEN e.quantidade = SUM(
      CASE 
        WHEN h.tipo_movimentacao = 'ajuste' THEN h.quantidade_alterada
        WHEN h.quantidade IS NOT NULL AND h.tipo_movimentacao IN ('entrada', 'devolucao_venda', 'transferencia_entrada') THEN h.quantidade
        WHEN h.quantidade IS NOT NULL AND h.tipo_movimentacao IN ('saida', 'quebra', 'venda', 'baixa_edicao_venda', 'transferencia_saida') THEN -h.quantidade
        WHEN h.quantidade IS NULL THEN h.quantidade_alterada
        ELSE 0
      END
    ) THEN '✅ CORRETO'
    ELSE '❌ AINDA DIVERGENTE'
  END as status
FROM historico_estoque h
JOIN produtos p ON p.id = h.id_produto
LEFT JOIN estoque_lojas e ON e.id_produto = h.id_produto AND e.id_loja = h.id_loja
WHERE h.id_produto IN (
  '3fec3d6e-37ca-4587-a608-94e1eeb42800',
  'e138eed1-e316-4d2a-990e-7f1ebdee06c7'
)
AND h.id_loja = (SELECT id FROM lojas WHERE nome = 'ATACADO')
GROUP BY p.descricao, e.quantidade
ORDER BY p.descricao;
