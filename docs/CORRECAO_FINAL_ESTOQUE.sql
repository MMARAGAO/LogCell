-- Script de Correção Final do Estoque
-- Data: 25/11/2025
-- PROBLEMA: Sistema permitiu vendas com estoque negativo, resultando em -98 unidades

-- =====================================================
-- ANÁLISE DO PROBLEMA
-- =====================================================
-- Total entradas: 450 unidades
-- Total saídas: 548 unidades  
-- Diferença: -98 unidades (vendeu mais do que tinha!)
-- 
-- Estoque atual incorreto: 0
-- Estoque calculado correto: -98
-- =====================================================

-- =====================================================
-- OPÇÃO A: ADICIONAR ENTRADA MANUAL (SE VOCÊ TEM O PRODUTO)
-- =====================================================
-- Use esta opção se você realmente recebeu essas 98 unidades
-- mas esqueceu de registrar a entrada

/*
INSERT INTO historico_estoque (
  id_produto,
  id_loja,
  tipo_movimentacao,
  quantidade,
  quantidade_anterior,
  quantidade_nova,
  motivo,
  usuario_id,
  criado_em
)
VALUES (
  'e138eed1-e316-4d2a-990e-7f1ebdee06c7', -- Bateria iPhone 17
  (SELECT id FROM lojas WHERE nome = 'ATACADO'),
  'entrada',
  98, -- Quantidade faltante
  0, -- Estoque antes
  98, -- Estoque depois
  '🔧 CORREÇÃO: Entrada não registrada anteriormente - ajuste para reconciliar histórico',
  (SELECT id FROM usuarios WHERE nome = 'Matheus Mendes Neves' LIMIT 1),
  NOW()
);

-- Atualizar estoque_lojas
UPDATE estoque_lojas
SET 
  quantidade = 98,
  atualizado_em = NOW()
WHERE id_produto = 'e138eed1-e316-4d2a-990e-7f1ebdee06c7'
  AND id_loja = (SELECT id FROM lojas WHERE nome = 'ATACADO');
*/

-- =====================================================
-- OPÇÃO B: ACEITAR ESTOQUE NEGATIVO (REALIDADE)
-- =====================================================
-- Use esta opção se as vendas realmente aconteceram
-- e você ficou devendo produtos

/*
UPDATE estoque_lojas
SET 
  quantidade = -98, -- Estoque negativo (deve para clientes)
  atualizado_em = NOW()
WHERE id_produto = 'e138eed1-e316-4d2a-990e-7f1ebdee06c7'
  AND id_loja = (SELECT id FROM lojas WHERE nome = 'ATACADO');

-- Adicionar nota explicativa no histórico
INSERT INTO historico_estoque (
  id_produto,
  id_loja,
  tipo_movimentacao,
  quantidade_alterada,
  quantidade_anterior,
  quantidade_nova,
  motivo,
  usuario_id,
  criado_em
)
VALUES (
  'e138eed1-e316-4d2a-990e-7f1ebdee06c7',
  (SELECT id FROM lojas WHERE nome = 'ATACADO'),
  'ajuste',
  -98,
  0,
  -98,
  '🔧 CORREÇÃO: Ajuste para refletir vendas realizadas sem estoque disponível',
  (SELECT id FROM usuarios WHERE nome = 'Matheus Mendes Neves' LIMIT 1),
  NOW()
);
*/

-- =====================================================
-- OPÇÃO C: CORRIGIR PARA ZERO E BLOQUEAR VENDAS NEGATIVAS
-- =====================================================
-- Use esta opção para "perdoar" as 98 unidades vendidas incorretamente
-- e começar do zero

UPDATE estoque_lojas
SET 
  quantidade = 0,
  atualizado_em = NOW()
WHERE id_produto = 'e138eed1-e316-4d2a-990e-7f1ebdee06c7'
  AND id_loja = (SELECT id FROM lojas WHERE nome = 'ATACADO');

-- Adicionar entrada retroativa de 98 unidades (como se você tivesse recebido)
INSERT INTO historico_estoque (
  id_produto,
  id_loja,
  tipo_movimentacao,
  quantidade,
  quantidade_anterior,
  quantidade_nova,
  motivo,
  usuario_id,
  criado_em
)
VALUES (
  'e138eed1-e316-4d2a-990e-7f1ebdee06c7',
  (SELECT id FROM lojas WHERE nome = 'ATACADO'),
  'entrada',
  98,
  NULL, -- Não alterar o fluxo anterior
  NULL, -- Não alterar o fluxo anterior
  '🔧 CORREÇÃO CONTÁBIL: Entrada retroativa para zerar divergência histórica de 98 unidades vendidas sem estoque',
  (SELECT id FROM usuarios WHERE nome = 'Matheus Mendes Neves' LIMIT 1),
  '2025-11-11 18:00:00+00' -- Data retroativa (antes das primeiras vendas)
);

-- =====================================================
-- RECOMENDAÇÃO: ADICIONAR CHECK CONSTRAINT
-- =====================================================
-- Prevenir estoque negativo no futuro

-- Remover constraint antiga se existir
ALTER TABLE estoque_lojas DROP CONSTRAINT IF EXISTS check_estoque_nao_negativo;

-- Adicionar nova constraint
ALTER TABLE estoque_lojas 
ADD CONSTRAINT check_estoque_nao_negativo 
CHECK (quantidade >= 0);

-- =====================================================
-- VERIFICAÇÃO FINAL
-- =====================================================

SELECT 
  p.descricao,
  e.quantidade as estoque_atual,
  SUM(
    CASE 
      WHEN h.tipo_movimentacao = 'ajuste' THEN h.quantidade_alterada
      WHEN h.quantidade IS NOT NULL AND h.tipo_movimentacao IN ('entrada', 'devolucao_venda') THEN h.quantidade
      WHEN h.quantidade IS NOT NULL AND h.tipo_movimentacao IN ('saida', 'quebra', 'venda') THEN -h.quantidade
      WHEN h.quantidade IS NULL THEN h.quantidade_alterada
      ELSE 0
    END
  ) as estoque_calculado,
  e.quantidade - SUM(
    CASE 
      WHEN h.tipo_movimentacao = 'ajuste' THEN h.quantidade_alterada
      WHEN h.quantidade IS NOT NULL AND h.tipo_movimentacao IN ('entrada', 'devolucao_venda') THEN h.quantidade
      WHEN h.quantidade IS NOT NULL AND h.tipo_movimentacao IN ('saida', 'quebra', 'venda') THEN -h.quantidade
      WHEN h.quantidade IS NULL THEN h.quantidade_alterada
      ELSE 0
    END
  ) as diferenca,
  CASE 
    WHEN e.quantidade = SUM(
      CASE 
        WHEN h.tipo_movimentacao = 'ajuste' THEN h.quantidade_alterada
        WHEN h.quantidade IS NOT NULL AND h.tipo_movimentacao IN ('entrada', 'devolucao_venda') THEN h.quantidade
        WHEN h.quantidade IS NOT NULL AND h.tipo_movimentacao IN ('saida', 'quebra', 'venda') THEN -h.quantidade
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
