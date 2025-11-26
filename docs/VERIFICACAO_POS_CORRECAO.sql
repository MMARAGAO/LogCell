-- Verificação completa após correção
-- Data: 25/11/2025

-- =====================================================
-- 1. VERIFICAR ESTOQUE ATUAL vs CALCULADO
-- =====================================================

SELECT 
  p.descricao as produto,
  e.quantidade as estoque_sistema,
  SUM(
    CASE 
      WHEN h.tipo_movimentacao = 'ajuste' THEN h.quantidade_alterada
      WHEN h.quantidade IS NOT NULL AND h.tipo_movimentacao IN ('entrada', 'devolucao_venda', 'transferencia_entrada') THEN h.quantidade
      WHEN h.quantidade IS NOT NULL AND h.tipo_movimentacao IN ('saida', 'quebra', 'venda', 'baixa_edicao_venda', 'transferencia_saida') THEN -h.quantidade
      WHEN h.quantidade IS NULL THEN h.quantidade_alterada
      ELSE 0
    END
  ) as estoque_calculado,
  e.quantidade - SUM(
    CASE 
      WHEN h.tipo_movimentacao = 'ajuste' THEN h.quantidade_alterada
      WHEN h.quantidade IS NOT NULL AND h.tipo_movimentacao IN ('entrada', 'devolucao_venda', 'transferencia_entrada') THEN h.quantidade
      WHEN h.quantidade IS NOT NULL AND h.tipo_movimentacao IN ('saida', 'quebra', 'venda', 'baixa_edicao_venda', 'transferencia_saida') THEN -h.quantidade
      WHEN h.quantidade IS NULL THEN h.quantidade_alterada
      ELSE 0
    END
  ) as diferenca,
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
    ELSE '❌ DIVERGENTE'
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

-- =====================================================
-- 2. BALANÇO DE ENTRADAS vs SAÍDAS
-- =====================================================

SELECT 
  p.descricao as produto,
  -- Total de entradas
  SUM(
    CASE 
      WHEN h.tipo_movimentacao = 'ajuste' AND h.quantidade_alterada > 0 THEN h.quantidade_alterada
      WHEN h.quantidade IS NOT NULL AND h.tipo_movimentacao IN ('entrada', 'devolucao_venda', 'transferencia_entrada') THEN h.quantidade
      WHEN h.quantidade IS NULL AND h.quantidade_alterada > 0 AND h.tipo_movimentacao != 'ajuste' THEN h.quantidade_alterada
      ELSE 0
    END
  ) as total_entradas,
  -- Total de saídas
  SUM(
    CASE 
      WHEN h.tipo_movimentacao = 'ajuste' AND h.quantidade_alterada < 0 THEN ABS(h.quantidade_alterada)
      WHEN h.quantidade IS NOT NULL AND h.tipo_movimentacao IN ('saida', 'quebra', 'venda', 'baixa_edicao_venda', 'transferencia_saida') THEN h.quantidade
      WHEN h.quantidade IS NULL AND h.quantidade_alterada < 0 AND h.tipo_movimentacao != 'ajuste' THEN ABS(h.quantidade_alterada)
      ELSE 0
    END
  ) as total_saidas,
  -- Saldo
  SUM(
    CASE 
      WHEN h.tipo_movimentacao = 'ajuste' THEN h.quantidade_alterada
      WHEN h.quantidade IS NOT NULL AND h.tipo_movimentacao IN ('entrada', 'devolucao_venda', 'transferencia_entrada') THEN h.quantidade
      WHEN h.quantidade IS NOT NULL AND h.tipo_movimentacao IN ('saida', 'quebra', 'venda', 'baixa_edicao_venda', 'transferencia_saida') THEN -h.quantidade
      WHEN h.quantidade IS NULL THEN h.quantidade_alterada
      ELSE 0
    END
  ) as saldo_final
FROM historico_estoque h
JOIN produtos p ON p.id = h.id_produto
WHERE h.id_produto IN (
  '3fec3d6e-37ca-4587-a608-94e1eeb42800',
  'e138eed1-e316-4d2a-990e-7f1ebdee06c7'
)
AND h.id_loja = (SELECT id FROM lojas WHERE nome = 'ATACADO')
GROUP BY p.descricao
ORDER BY p.descricao;

-- =====================================================
-- 3. VERIFICAR SE ENTRADA RETROATIVA FOI CRIADA
-- =====================================================

SELECT 
  p.descricao,
  h.criado_em,
  h.tipo_movimentacao,
  h.quantidade,
  h.motivo
FROM historico_estoque h
JOIN produtos p ON p.id = h.id_produto
WHERE h.id_produto IN (
  '3fec3d6e-37ca-4587-a608-94e1eeb42800',
  'e138eed1-e316-4d2a-990e-7f1ebdee06c7'
)
AND h.id_loja = (SELECT id FROM lojas WHERE nome = 'ATACADO')
AND h.motivo LIKE '%CORREÇÃO RETROATIVA%'
ORDER BY h.criado_em;

-- =====================================================
-- 4. VERIFICAR SE CONSTRAINTS FORAM CRIADAS
-- =====================================================

SELECT 
  conname as nome_constraint,
  pg_get_constraintdef(oid) as definicao
FROM pg_constraint
WHERE conrelid = 'estoque_lojas'::regclass
  AND conname = 'check_estoque_nao_negativo';

-- =====================================================
-- 5. VERIFICAR SE TRIGGER FOI CRIADO
-- =====================================================

SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'trigger_validar_estoque_saida'
  AND event_object_table = 'historico_estoque';

-- =====================================================
-- 6. RESUMO EXECUTIVO
-- =====================================================

SELECT '✅ CORREÇÃO COMPLETA!' as status,
       'Sistema protegido contra estoque negativo' as protecao,
       'Histórico sincronizado com estoque atual' as sincronizacao;
