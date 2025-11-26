-- Script para padronizar sistema de histórico de estoque
-- Data: 25/11/2025
-- Objetivo: Garantir que TODAS as movimentações sejam registradas de forma consistente

-- =====================================================
-- PROBLEMA ATUAL
-- =====================================================
-- 1. Triggers automáticos usam: quantidade_alterada, quantidade_anterior, quantidade_nova
-- 2. Código manual (vendas, trocas, OS) usa: quantidade
-- 3. Isso causa inconsistência no cálculo de estoque

-- =====================================================
-- SOLUÇÃO: CRIAR VIEW UNIFICADA
-- =====================================================

-- Criar view que unifica ambos os sistemas para consultas
CREATE OR REPLACE VIEW vw_historico_estoque_unificado AS
SELECT 
  h.id,
  h.id_produto,
  h.id_loja,
  h.usuario_id,
  h.tipo_movimentacao,
  h.motivo,
  h.observacao,
  h.observacoes,
  h.criado_em,
  h.id_ordem_servico,
  
  -- QUANTIDADE EFETIVA: unifica os dois sistemas
  -- IMPORTANTE: Prioriza 'quantidade' para evitar duplicação quando ambos preenchidos
  COALESCE(
    CASE 
      -- Sistema novo: quantidade preenchida (PRIORIDADE)
      WHEN h.quantidade IS NOT NULL AND h.tipo_movimentacao IN ('entrada', 'saida', 'devolucao_venda', 'quebra') THEN
        CASE 
          WHEN h.tipo_movimentacao IN ('entrada', 'devolucao_venda') THEN h.quantidade
          WHEN h.tipo_movimentacao IN ('saida', 'quebra') THEN -h.quantidade
        END
      -- Sistema antigo: quantidade_alterada (APENAS se quantidade for NULL)
      WHEN h.quantidade IS NULL THEN h.quantidade_alterada
      -- Fallback
      ELSE 0
    END,
    0
  ) as quantidade_efetiva,
  
  -- Campos originais para referência
  h.quantidade,
  h.quantidade_alterada,
  h.quantidade_anterior,
  h.quantidade_nova
FROM historico_estoque h;

-- Dar permissões
GRANT SELECT ON vw_historico_estoque_unificado TO authenticated;

COMMENT ON VIEW vw_historico_estoque_unificado IS 'View que unifica os dois sistemas de registro de histórico (quantidade vs quantidade_alterada)';

-- =====================================================
-- CRIAR FUNÇÃO HELPER PARA CONSULTAS
-- =====================================================

CREATE OR REPLACE FUNCTION calcular_estoque_produto(
  p_id_produto UUID,
  p_id_loja INTEGER DEFAULT NULL
)
RETURNS TABLE (
  id_produto UUID,
  id_loja INTEGER,
  descricao TEXT,
  estoque_calculado INTEGER,
  estoque_atual INTEGER,
  diferenca INTEGER,
  em_ordem BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  WITH estoque_calc AS (
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
      )::INTEGER as calculado
    FROM historico_estoque h
    WHERE h.id_produto = p_id_produto
      AND (p_id_loja IS NULL OR h.id_loja = p_id_loja)
    GROUP BY h.id_produto, h.id_loja
  )
  SELECT 
    ec.id_produto,
    ec.id_loja,
    p.descricao,
    ec.calculado as estoque_calculado,
    COALESCE(e.quantidade, 0) as estoque_atual,
    (COALESCE(e.quantidade, 0) - ec.calculado)::INTEGER as diferenca,
    (COALESCE(e.quantidade, 0) = ec.calculado) as em_ordem
  FROM estoque_calc ec
  JOIN produtos p ON p.id = ec.id_produto
  LEFT JOIN estoque_lojas e ON e.id_produto = ec.id_produto AND e.id_loja = ec.id_loja;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Dar permissões
GRANT EXECUTE ON FUNCTION calcular_estoque_produto TO authenticated;

COMMENT ON FUNCTION calcular_estoque_produto IS 'Calcula estoque baseado no histórico unificado e compara com estoque atual';

-- =====================================================
-- CRIAR FUNÇÃO DE AUDITORIA
-- =====================================================

CREATE OR REPLACE FUNCTION auditar_estoques(
  p_id_loja INTEGER DEFAULT NULL
)
RETURNS TABLE (
  produto TEXT,
  loja TEXT,
  estoque_sistema INTEGER,
  estoque_calculado INTEGER,
  diferenca INTEGER,
  status TEXT,
  ultima_movimentacao TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  WITH estoque_calc AS (
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
      )::INTEGER as calculado,
      MAX(h.criado_em) as ultima_mov
    FROM historico_estoque h
    WHERE p_id_loja IS NULL OR h.id_loja = p_id_loja
    GROUP BY h.id_produto, h.id_loja
  )
  SELECT 
    p.descricao as produto,
    l.nome as loja,
    e.quantidade as estoque_sistema,
    ec.calculado as estoque_calculado,
    (e.quantidade - ec.calculado)::INTEGER as diferenca,
    CASE 
      WHEN e.quantidade = ec.calculado THEN '✅ OK'
      WHEN e.quantidade > ec.calculado THEN '⚠️ Estoque maior'
      ELSE '🔴 Estoque menor'
    END as status,
    ec.ultima_mov as ultima_movimentacao
  FROM estoque_calc ec
  JOIN produtos p ON p.id = ec.id_produto
  JOIN lojas l ON l.id = ec.id_loja
  LEFT JOIN estoque_lojas e ON e.id_produto = ec.id_produto AND e.id_loja = ec.id_loja
  WHERE e.quantidade != ec.calculado OR e.quantidade IS NULL
  ORDER BY ABS(e.quantidade - ec.calculado) DESC, p.descricao;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Dar permissões
GRANT EXECUTE ON FUNCTION auditar_estoques TO authenticated;

COMMENT ON FUNCTION auditar_estoques IS 'Retorna todos os produtos com divergência entre estoque sistema e calculado';

-- =====================================================
-- EXEMPLOS DE USO
-- =====================================================

-- 1. Consultar histórico unificado de um produto
/*
SELECT 
  p.descricao,
  h.criado_em,
  h.tipo_movimentacao,
  h.quantidade_efetiva,
  h.motivo,
  u.nome as usuario
FROM vw_historico_estoque_unificado h
JOIN produtos p ON p.id = h.id_produto
LEFT JOIN usuarios u ON u.id = h.usuario_id
WHERE h.id_produto = '3fec3d6e-37ca-4587-a608-94e1eeb42800'
ORDER BY h.criado_em DESC
LIMIT 50;
*/

-- 2. Calcular estoque de um produto específico
/*
SELECT * FROM calcular_estoque_produto('3fec3d6e-37ca-4587-a608-94e1eeb42800');
*/

-- 3. Auditar todos os estoques com divergência
/*
SELECT * FROM auditar_estoques();
*/

-- 4. Auditar estoques de uma loja específica
/*
SELECT * FROM auditar_estoques((SELECT id FROM lojas WHERE nome = 'ATACADO'));
*/
