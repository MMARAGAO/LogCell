-- =========================================================================
-- ANÁLISE PROFUNDA: Investigar problema de transferências com estoque zerado
-- Data: 6 de dezembro de 2025
-- =========================================================================
-- OBJETIVO: Entender como produtos sem estoque foram selecionados para transferência
-- e por que está dando erro "Estoque insuficiente" ao confirmar
-- =========================================================================

-- =========================================================================
-- 1. LISTAR TODAS AS TRANSFERÊNCIAS RECENTES (ÚLTIMOS 7 DIAS)
-- =========================================================================
SELECT 
    t.id,
    t.status,
    t.criado_em,
    t.confirmado_em,
    t.cancelado_em,
    lo.nome as loja_origem,
    ld.nome as loja_destino,
    u.nome as usuario,
    t.observacao,
    (SELECT COUNT(*) FROM transferencias_itens WHERE transferencia_id = t.id) as qtd_itens
FROM transferencias t
LEFT JOIN lojas lo ON t.loja_origem_id = lo.id
LEFT JOIN lojas ld ON t.loja_destino_id = ld.id
LEFT JOIN usuarios u ON t.usuario_id = u.id
WHERE t.criado_em > NOW() - INTERVAL '7 days'
ORDER BY t.criado_em DESC;

-- =========================================================================
-- 2. ANALISAR TRANSFERÊNCIAS PENDENTES COM DETALHES DOS ITENS
-- =========================================================================
SELECT 
    t.id as transferencia_id,
    t.status,
    t.criado_em as criada_em,
    lo.nome as loja_origem,
    ld.nome as loja_destino,
    p.descricao as produto,
    ti.quantidade as qtd_transferir,
    COALESCE(el.quantidade, 0) as estoque_atual_origem,
    CASE 
        WHEN COALESCE(el.quantidade, 0) >= ti.quantidade THEN '✅ OK'
        WHEN COALESCE(el.quantidade, 0) = 0 THEN '❌ SEM ESTOQUE'
        ELSE '⚠️ INSUFICIENTE'
    END as status_estoque,
    COALESCE(el.quantidade, 0) - ti.quantidade as saldo_apos_transferir
FROM transferencias t
INNER JOIN transferencias_itens ti ON t.id = ti.transferencia_id
INNER JOIN produtos p ON ti.produto_id = p.id
LEFT JOIN lojas lo ON t.loja_origem_id = lo.id
LEFT JOIN lojas ld ON t.loja_destino_id = ld.id
LEFT JOIN estoque_lojas el ON el.id_produto = ti.produto_id AND el.id_loja = t.loja_origem_id
WHERE t.status = 'pendente'
ORDER BY t.criado_em DESC, p.descricao;

-- =========================================================================
-- 3. HISTÓRICO COMPLETO DE UM PRODUTO ESPECÍFICO
-- =========================================================================
-- ⚠️ SUBSTITUIR 'TAMPA IPHONE 17 AZUL' pelo produto que deu erro
SELECT 
    he.criado_em,
    he.tipo_movimentacao,
    he.observacao,
    l.nome as loja,
    he.quantidade as qtd_movimentada,
    he.quantidade_anterior,
    he.quantidade_nova,
    he.quantidade_nova - he.quantidade_anterior as variacao,
    u.nome as usuario
FROM historico_estoque he
INNER JOIN produtos p ON he.id_produto = p.id
LEFT JOIN lojas l ON he.id_loja = l.id
LEFT JOIN usuarios u ON he.usuario_id = u.id
WHERE p.descricao ILIKE '%TAMPA IPHONE 17 AZUL%'
ORDER BY he.criado_em DESC
LIMIT 50;

-- =========================================================================
-- 4. VERIFICAR ESTOQUE ATUAL DE TODOS OS PRODUTOS EM TODAS AS LOJAS
-- =========================================================================
-- Mostra produtos que têm quantidade ZERADA mas estão em transferências pendentes
SELECT 
    p.descricao as produto,
    l.nome as loja,
    COALESCE(el.quantidade, 0) as estoque_atual,
    el.atualizado_em as ultima_atualizacao,
    u.nome as atualizado_por_usuario,
    -- Verifica se este produto está em alguma transferência pendente
    (
        SELECT COUNT(*)
        FROM transferencias_itens ti
        INNER JOIN transferencias t ON ti.transferencia_id = t.id
        WHERE ti.produto_id = p.id 
          AND t.loja_origem_id = l.id
          AND t.status = 'pendente'
    ) as em_transferencias_pendentes,
    (
        SELECT SUM(ti.quantidade)
        FROM transferencias_itens ti
        INNER JOIN transferencias t ON ti.transferencia_id = t.id
        WHERE ti.produto_id = p.id 
          AND t.loja_origem_id = l.id
          AND t.status = 'pendente'
    ) as qtd_em_transferencias
FROM produtos p
CROSS JOIN lojas l
LEFT JOIN estoque_lojas el ON el.id_produto = p.id AND el.id_loja = l.id
LEFT JOIN usuarios u ON el.atualizado_por = u.id
WHERE COALESCE(el.quantidade, 0) = 0
  AND EXISTS (
      SELECT 1
      FROM transferencias_itens ti
      INNER JOIN transferencias t ON ti.transferencia_id = t.id
      WHERE ti.produto_id = p.id 
        AND t.loja_origem_id = l.id
        AND t.status = 'pendente'
  )
ORDER BY p.descricao, l.nome;

-- =========================================================================
-- 5. TIMELINE DETALHADA: O QUE ACONTECEU COM O ESTOQUE DE UM PRODUTO
-- =========================================================================
-- Mostra TUDO que aconteceu com um produto específico em ordem cronológica
-- ⚠️ SUBSTITUIR pelo ID do produto que está dando problema
WITH produto_alvo AS (
    SELECT id FROM produtos WHERE descricao ILIKE '%TAMPA IPHONE 17 AZUL%' LIMIT 1
),
loja_estoque AS (
    SELECT id FROM lojas WHERE nome ILIKE '%ESTOQUE%' LIMIT 1
)
SELECT 
    he.criado_em,
    TO_CHAR(he.criado_em, 'DD/MM/YYYY HH24:MI:SS') as data_formatada,
    he.tipo_movimentacao,
    he.quantidade as qtd_movimentada,
    he.quantidade_anterior || ' → ' || he.quantidade_nova as mudanca,
    CASE 
        WHEN he.quantidade_nova > he.quantidade_anterior THEN '📈 ENTRADA'
        WHEN he.quantidade_nova < he.quantidade_anterior THEN '📉 SAÍDA'
        ELSE '➡️ SEM MUDANÇA'
    END as tipo_operacao,
    he.observacao,
    u.nome as usuario,
    l.nome as loja
FROM historico_estoque he
LEFT JOIN usuarios u ON he.usuario_id = u.id
LEFT JOIN lojas l ON he.id_loja = l.id
WHERE he.id_produto = (SELECT id FROM produto_alvo)
  AND he.id_loja = (SELECT id FROM loja_estoque)
ORDER BY he.criado_em DESC
LIMIT 100;

-- =========================================================================
-- 6. DETECTAR ANOMALIAS: TRANSFERÊNCIAS CRIADAS QUANDO NÃO HAVIA ESTOQUE
-- =========================================================================
-- Esta query identifica transferências onde o estoque JÁ ESTAVA ZERADO no momento da criação
SELECT 
    t.id as transferencia_id,
    t.criado_em as transferencia_criada_em,
    p.descricao as produto,
    ti.quantidade as qtd_na_transferencia,
    lo.nome as loja_origem,
    -- Busca o estoque na hora EXATA da criação da transferência
    (
        SELECT he.quantidade_nova
        FROM historico_estoque he
        WHERE he.id_produto = ti.produto_id
          AND he.id_loja = t.loja_origem_id
          AND he.criado_em <= t.criado_em
        ORDER BY he.criado_em DESC
        LIMIT 1
    ) as estoque_no_momento_criacao,
    -- Estoque atual
    COALESCE(el.quantidade, 0) as estoque_atual,
    u.nome as criado_por
FROM transferencias t
INNER JOIN transferencias_itens ti ON t.id = ti.transferencia_id
INNER JOIN produtos p ON ti.produto_id = p.id
INNER JOIN lojas lo ON t.loja_origem_id = lo.id
LEFT JOIN estoque_lojas el ON el.id_produto = ti.produto_id AND el.id_loja = t.loja_origem_id
LEFT JOIN usuarios u ON t.usuario_id = u.id
WHERE t.status = 'pendente'
  AND t.criado_em > NOW() - INTERVAL '30 days'
ORDER BY t.criado_em DESC, p.descricao;

-- =========================================================================
-- 7. VERIFICAR SE HÁ REGISTROS DUPLICADOS NO HISTÓRICO
-- =========================================================================
-- Detecta se há duplicação de registros (problema da trigger)
SELECT 
    he1.criado_em,
    p.descricao as produto,
    l.nome as loja,
    he1.tipo_movimentacao as tipo_1,
    he1.observacao as obs_1,
    he2.tipo_movimentacao as tipo_2,
    he2.observacao as obs_2,
    he1.quantidade_nova,
    EXTRACT(EPOCH FROM (he2.criado_em - he1.criado_em)) as diferenca_segundos,
    '🔴 DUPLICADO!' as status
FROM historico_estoque he1
INNER JOIN historico_estoque he2 
    ON he1.id_produto = he2.id_produto 
    AND he1.id_loja = he2.id_loja
    AND ABS(EXTRACT(EPOCH FROM (he2.criado_em - he1.criado_em))) < 2
    AND he1.quantidade_nova = he2.quantidade_nova
    AND he1.id < he2.id
LEFT JOIN produtos p ON he1.id_produto = p.id
LEFT JOIN lojas l ON he1.id_loja = l.id
WHERE he1.criado_em > NOW() - INTERVAL '7 days'
  AND (
      (he1.tipo_movimentacao IN ('transferencia_saida', 'transferencia_entrada') AND he2.tipo_movimentacao = 'ajuste')
      OR
      (he1.tipo_movimentacao = 'venda' AND he2.tipo_movimentacao = 'ajuste')
  )
ORDER BY he1.criado_em DESC;

-- =========================================================================
-- 8. AUDITORIA: QUEM CRIOU TRANSFERÊNCIAS E QUANDO
-- =========================================================================
SELECT 
    u.nome as usuario,
    u.email,
    COUNT(*) as total_transferencias,
    COUNT(*) FILTER (WHERE t.status = 'pendente') as pendentes,
    COUNT(*) FILTER (WHERE t.status = 'confirmada') as confirmadas,
    COUNT(*) FILTER (WHERE t.status = 'cancelada') as canceladas,
    MIN(t.criado_em) as primeira_transferencia,
    MAX(t.criado_em) as ultima_transferencia
FROM usuarios u
LEFT JOIN transferencias t ON t.usuario_id = u.id
WHERE t.criado_em > NOW() - INTERVAL '30 days'
GROUP BY u.id, u.nome, u.email
ORDER BY total_transferencias DESC;

-- =========================================================================
-- 9. VERIFICAR INTEGRIDADE DOS DADOS: ESTOQUE_LOJAS vs HISTORICO_ESTOQUE
-- =========================================================================
-- Compara se o estoque atual bate com o último registro do histórico
SELECT 
    p.descricao as produto,
    l.nome as loja,
    COALESCE(el.quantidade, 0) as estoque_atual,
    (
        SELECT he.quantidade_nova
        FROM historico_estoque he
        WHERE he.id_produto = p.id
          AND he.id_loja = l.id
        ORDER BY he.criado_em DESC
        LIMIT 1
    ) as ultimo_historico,
    CASE 
        WHEN COALESCE(el.quantidade, 0) = (
            SELECT he.quantidade_nova
            FROM historico_estoque he
            WHERE he.id_produto = p.id
              AND he.id_loja = l.id
            ORDER BY he.criado_em DESC
            LIMIT 1
        ) THEN '✅ OK'
        ELSE '❌ DIVERGÊNCIA'
    END as status_integridade
FROM produtos p
CROSS JOIN lojas l
LEFT JOIN estoque_lojas el ON el.id_produto = p.id AND el.id_loja = l.id
WHERE EXISTS (
    SELECT 1
    FROM historico_estoque he
    WHERE he.id_produto = p.id
      AND he.id_loja = l.id
)
AND COALESCE(el.quantidade, 0) != COALESCE((
    SELECT he.quantidade_nova
    FROM historico_estoque he
    WHERE he.id_produto = p.id
      AND he.id_loja = l.id
    ORDER BY he.criado_em DESC
    LIMIT 1
), 0)
ORDER BY p.descricao, l.nome;

-- =========================================================================
-- 10. QUERY DEFINITIVA: ANÁLISE COMPLETA DE UMA TRANSFERÊNCIA ESPECÍFICA
-- =========================================================================
-- ⚠️ SUBSTITUIR pelo ID da transferência problemática
-- Esta query mostra TUDO sobre uma transferência
WITH transferencia_alvo AS (
    SELECT id FROM transferencias WHERE status = 'pendente' ORDER BY criado_em DESC LIMIT 1
)
SELECT 
    '=== DADOS DA TRANSFERÊNCIA ===' as secao,
    t.id,
    t.status,
    t.criado_em,
    lo.nome as origem,
    ld.nome as destino,
    u.nome as usuario,
    t.observacao
FROM transferencias t
LEFT JOIN lojas lo ON t.loja_origem_id = lo.id
LEFT JOIN lojas ld ON t.loja_destino_id = ld.id
LEFT JOIN usuarios u ON t.usuario_id = u.id
WHERE t.id = (SELECT id FROM transferencia_alvo)

UNION ALL

SELECT 
    '=== ITENS DA TRANSFERÊNCIA ===' as secao,
    p.descricao,
    ti.quantidade::TEXT,
    COALESCE(el.quantidade, 0)::TEXT,
    (COALESCE(el.quantidade, 0) - ti.quantidade)::TEXT,
    CASE 
        WHEN COALESCE(el.quantidade, 0) >= ti.quantidade THEN '✅ OK'
        ELSE '❌ INSUFICIENTE'
    END,
    ''
FROM transferencias t
INNER JOIN transferencias_itens ti ON t.id = ti.transferencia_id
INNER JOIN produtos p ON ti.produto_id = p.id
LEFT JOIN estoque_lojas el ON el.id_produto = ti.produto_id AND el.id_loja = t.loja_origem_id
WHERE t.id = (SELECT id FROM transferencia_alvo);

-- =========================================================================
-- 11. QUERY PARA ENCONTRAR A TRANSFERÊNCIA DO ERRO ESPECÍFICO
-- =========================================================================
-- Encontra transferências com "TAMPA IPHONE 17 AZUL" onde estoque está zerado
SELECT 
    t.id as transferencia_id,
    t.criado_em,
    t.status,
    lo.nome as loja_origem,
    ld.nome as loja_destino,
    p.descricao as produto,
    ti.quantidade as solicitado,
    COALESCE(el.quantidade, 0) as disponivel,
    u.nome as usuario_criador
FROM transferencias t
INNER JOIN transferencias_itens ti ON t.id = ti.transferencia_id
INNER JOIN produtos p ON ti.produto_id = p.id
INNER JOIN lojas lo ON t.loja_origem_id = lo.id
INNER JOIN lojas ld ON t.loja_destino_id = ld.id
LEFT JOIN estoque_lojas el ON el.id_produto = ti.produto_id AND el.id_loja = t.loja_origem_id
LEFT JOIN usuarios u ON t.usuario_id = u.id
WHERE p.descricao ILIKE '%TAMPA%IPHONE%'
  AND t.status = 'pendente'
  AND COALESCE(el.quantidade, 0) < ti.quantidade
ORDER BY t.criado_em DESC;

-- =========================================================================
-- RESUMO DAS QUERIES:
-- =========================================================================
-- Query 1: Lista transferências recentes
-- Query 2: Analisa transferências pendentes com status de estoque
-- Query 3: Histórico completo de um produto específico
-- Query 4: Produtos zerados que estão em transferências pendentes
-- Query 5: Timeline detalhada de um produto
-- Query 6: Detecta transferências criadas sem estoque
-- Query 7: Verifica duplicação no histórico
-- Query 8: Auditoria de usuários
-- Query 9: Verifica integridade estoque vs histórico
-- Query 10: Análise completa de uma transferência
-- Query 11: Encontra a transferência específica do erro

-- =========================================================================
-- RECOMENDAÇÕES:
-- =========================================================================
-- 1. Execute a Query 2 primeiro para ver o panorama geral
-- 2. Use a Query 11 para encontrar exatamente a transferência problemática
-- 3. Com o ID da transferência, execute a Query 10 para análise completa
-- 4. Execute a Query 5 para ver o histórico do produto
-- 5. Execute a Query 7 para verificar duplicações
-- 6. Execute a Query 9 para verificar integridade dos dados
