-- =========================================================================
-- QUERIES PARA EXECUTAR AGORA - Diagnóstico de Transferências
-- =========================================================================

-- =========================================================================
-- QUERY 1: VISÃO GERAL - Transferências Pendentes com Problemas
-- =========================================================================
-- Esta é a query PRINCIPAL - Execute primeiro!
SELECT 
    t.id as transferencia_id,
    t.status,
    TO_CHAR(t.criado_em, 'DD/MM/YYYY HH24:MI') as criada_em,
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
    COALESCE(el.quantidade, 0) - ti.quantidade as saldo
FROM transferencias t
INNER JOIN transferencias_itens ti ON t.id = ti.transferencia_id
INNER JOIN produtos p ON ti.produto_id = p.id
LEFT JOIN lojas lo ON t.loja_origem_id = lo.id
LEFT JOIN lojas ld ON t.loja_destino_id = ld.id
LEFT JOIN estoque_lojas el ON el.id_produto = ti.produto_id AND el.id_loja = t.loja_origem_id
WHERE t.status = 'pendente'
ORDER BY 
    CASE 
        WHEN COALESCE(el.quantidade, 0) = 0 THEN 1
        WHEN COALESCE(el.quantidade, 0) < ti.quantidade THEN 2
        ELSE 3
    END,
    t.criado_em DESC;

-- =========================================================================
-- QUERY 2: PRODUTOS ZERADOS em Transferências Pendentes
-- =========================================================================
-- Mostra APENAS produtos com estoque = 0 que estão em transferências
SELECT 
    p.descricao as produto,
    l.nome as loja,
    COUNT(*) as qtd_transferencias_pendentes,
    SUM(ti.quantidade) as total_solicitado
FROM produtos p
CROSS JOIN lojas l
LEFT JOIN estoque_lojas el ON el.id_produto = p.id AND el.id_loja = l.id
INNER JOIN transferencias_itens ti ON ti.produto_id = p.id
INNER JOIN transferencias t ON t.id = ti.transferencia_id AND t.loja_origem_id = l.id
WHERE COALESCE(el.quantidade, 0) = 0
  AND t.status = 'pendente'
GROUP BY p.descricao, l.nome
ORDER BY total_solicitado DESC;

-- =========================================================================
-- QUERY 3: VERIFICAR DUPLICAÇÃO no Histórico (últimos 7 dias)
-- =========================================================================
-- Detecta se a trigger está criando registros duplicados
SELECT 
    TO_CHAR(he1.criado_em, 'DD/MM HH24:MI:SS') as data,
    p.descricao as produto,
    l.nome as loja,
    he1.tipo_movimentacao as tipo_1,
    he2.tipo_movimentacao as tipo_2,
    he1.quantidade_nova,
    ROUND(EXTRACT(EPOCH FROM (he2.criado_em - he1.criado_em))::numeric, 3) as diferenca_seg
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
  AND he1.tipo_movimentacao IN ('transferencia_saida', 'transferencia_entrada')
  AND he2.tipo_movimentacao = 'ajuste'
ORDER BY he1.criado_em DESC
LIMIT 20;

-- =========================================================================
-- QUERY 4: LISTA Transferências Recentes (7 dias)
-- =========================================================================
SELECT 
    t.id,
    t.status,
    TO_CHAR(t.criado_em, 'DD/MM/YYYY HH24:MI') as criado_em,
    lo.nome as origem,
    ld.nome as destino,
    u.nome as usuario,
    (SELECT COUNT(*) FROM transferencias_itens WHERE transferencia_id = t.id) as itens
FROM transferencias t
LEFT JOIN lojas lo ON t.loja_origem_id = lo.id
LEFT JOIN lojas ld ON t.loja_destino_id = ld.id
LEFT JOIN usuarios u ON t.usuario_id = u.id
WHERE t.criado_em > NOW() - INTERVAL '7 days'
ORDER BY t.criado_em DESC;

-- =========================================================================
-- QUERY 5: RESUMO Rápido - Contagem de Problemas
-- =========================================================================
SELECT 
    'Transferências Pendentes' as tipo,
    COUNT(DISTINCT t.id) as quantidade
FROM transferencias t
WHERE t.status = 'pendente'

UNION ALL

SELECT 
    'Itens com Estoque Zerado' as tipo,
    COUNT(*) as quantidade
FROM transferencias t
INNER JOIN transferencias_itens ti ON t.id = ti.transferencia_id
LEFT JOIN estoque_lojas el ON el.id_produto = ti.produto_id AND el.id_loja = t.loja_origem_id
WHERE t.status = 'pendente'
  AND COALESCE(el.quantidade, 0) = 0

UNION ALL

SELECT 
    'Itens com Estoque Insuficiente' as tipo,
    COUNT(*) as quantidade
FROM transferencias t
INNER JOIN transferencias_itens ti ON t.id = ti.transferencia_id
LEFT JOIN estoque_lojas el ON el.id_produto = ti.produto_id AND el.id_loja = t.loja_origem_id
WHERE t.status = 'pendente'
  AND COALESCE(el.quantidade, 0) < ti.quantidade
  AND COALESCE(el.quantidade, 0) > 0

UNION ALL

SELECT 
    'Duplicatas no Histórico (7 dias)' as tipo,
    COUNT(*) as quantidade
FROM historico_estoque he1
INNER JOIN historico_estoque he2 
    ON he1.id_produto = he2.id_produto 
    AND he1.id_loja = he2.id_loja
    AND ABS(EXTRACT(EPOCH FROM (he2.criado_em - he1.criado_em))) < 2
    AND he1.quantidade_nova = he2.quantidade_nova
    AND he1.id < he2.id
WHERE he1.criado_em > NOW() - INTERVAL '7 days'
  AND he1.tipo_movimentacao IN ('transferencia_saida', 'transferencia_entrada')
  AND he2.tipo_movimentacao = 'ajuste';

-- =========================================================================
-- INSTRUÇÕES:
-- =========================================================================
-- 1. Execute a QUERY 5 primeiro para ter um resumo rápido
-- 2. Execute a QUERY 1 para ver detalhes dos problemas
-- 3. Execute a QUERY 3 para verificar duplicações
-- 4. Se encontrar produtos específicos problemáticos, use as queries do 
--    arquivo ANALISE_PROFUNDA_TRANSFERENCIAS.sql
