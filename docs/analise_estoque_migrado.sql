-- ================================================================================
-- ANÁLISE COMPLETA DO ESTOQUE MIGRADO
-- ================================================================================
-- Execute este SQL diretamente no Supabase (banco NOVO)
-- ================================================================================

-- 1. RESUMO GERAL
-- ================================================================================
SELECT 
    '📊 RESUMO GERAL' as secao,
    COUNT(*) as total_registros,
    SUM(quantidade) as total_unidades,
    COUNT(DISTINCT id_produto) as produtos_unicos,
    COUNT(DISTINCT id_loja) as lojas_com_estoque,
    ROUND(AVG(quantidade), 2) as media_por_registro,
    MIN(quantidade) as quantidade_minima,
    MAX(quantidade) as quantidade_maxima
FROM estoque_lojas;

-- ================================================================================
-- 2. ANÁLISE POR LOJA
-- ================================================================================
SELECT 
    '🏪 POR LOJA' as secao,
    l.id as loja_id,
    l.nome as loja_nome,
    COUNT(e.id_produto) as produtos_diferentes,
    SUM(e.quantidade) as total_unidades,
    ROUND(AVG(e.quantidade), 2) as media_quantidade,
    MIN(e.quantidade) as min_quantidade,
    MAX(e.quantidade) as max_quantidade
FROM estoque_lojas e
LEFT JOIN lojas l ON e.id_loja = l.id
GROUP BY l.id, l.nome
ORDER BY total_unidades DESC;

-- ================================================================================
-- 3. TOP 20 PRODUTOS COM MAIS ESTOQUE
-- ================================================================================
SELECT 
    '📦 TOP 20 PRODUTOS' as secao,
    p.descricao as produto,
    SUM(e.quantidade) as total_estoque,
    COUNT(e.id_loja) as em_quantas_lojas,
    STRING_AGG(CONCAT('Loja ', l.nome, ': ', e.quantidade), ', ') as distribuicao
FROM estoque_lojas e
JOIN produtos p ON e.id_produto = p.id
LEFT JOIN lojas l ON e.id_loja = l.id
GROUP BY p.id, p.descricao
ORDER BY total_estoque DESC
LIMIT 20;

-- ================================================================================
-- 4. PRODUTOS COM ESTOQUE BAIXO (menos de 5 unidades no total)
-- ================================================================================
SELECT 
    '⚠️ ESTOQUE BAIXO' as secao,
    p.descricao as produto,
    SUM(e.quantidade) as total_estoque,
    COUNT(e.id_loja) as em_quantas_lojas,
    STRING_AGG(CONCAT('Loja ', l.nome, ': ', e.quantidade), ', ') as distribuicao
FROM estoque_lojas e
JOIN produtos p ON e.id_produto = p.id
LEFT JOIN lojas l ON e.id_loja = l.id
GROUP BY p.id, p.descricao
HAVING SUM(e.quantidade) < 5 AND SUM(e.quantidade) > 0
ORDER BY total_estoque ASC
LIMIT 20;

-- ================================================================================
-- 5. PRODUTOS SEM ESTOQUE (quantidade = 0)
-- ================================================================================
SELECT 
    '❌ SEM ESTOQUE (Zerados)' as secao,
    COUNT(*) as total_registros_zerados,
    COUNT(DISTINCT id_produto) as produtos_diferentes_zerados
FROM estoque_lojas
WHERE quantidade = 0;

-- ================================================================================
-- 6. DISTRIBUIÇÃO DE QUANTIDADE (Faixas)
-- ================================================================================
SELECT 
    '📊 DISTRIBUIÇÃO POR FAIXA' as secao,
    CASE 
        WHEN quantidade = 0 THEN '0 - Sem estoque'
        WHEN quantidade BETWEEN 1 AND 5 THEN '1-5 unidades'
        WHEN quantidade BETWEEN 6 AND 10 THEN '6-10 unidades'
        WHEN quantidade BETWEEN 11 AND 50 THEN '11-50 unidades'
        WHEN quantidade BETWEEN 51 AND 100 THEN '51-100 unidades'
        WHEN quantidade BETWEEN 101 AND 500 THEN '101-500 unidades'
        ELSE '501+ unidades'
    END as faixa,
    COUNT(*) as quantidade_registros,
    SUM(quantidade) as total_unidades
FROM estoque_lojas
GROUP BY faixa
ORDER BY MIN(quantidade);

-- ================================================================================
-- 7. VERIFICAR DUPLICATAS (Mesmo produto na mesma loja)
-- ================================================================================
SELECT 
    '🔍 DUPLICATAS' as secao,
    id_produto,
    id_loja,
    COUNT(*) as vezes_duplicado,
    SUM(quantidade) as total_quantidade
FROM estoque_lojas
GROUP BY id_produto, id_loja
HAVING COUNT(*) > 1;

-- ================================================================================
-- 8. PRODUTOS EM MÚLTIPLAS LOJAS
-- ================================================================================
SELECT 
    '🏪 PRODUTOS EM MÚLTIPLAS LOJAS' as secao,
    p.descricao as produto,
    COUNT(DISTINCT e.id_loja) as numero_lojas,
    SUM(e.quantidade) as total_unidades,
    STRING_AGG(CONCAT('Loja ', l.nome, ': ', e.quantidade), ', ') as distribuicao
FROM estoque_lojas e
JOIN produtos p ON e.id_produto = p.id
LEFT JOIN lojas l ON e.id_loja = l.id
GROUP BY p.id, p.descricao
HAVING COUNT(DISTINCT e.id_loja) > 1
ORDER BY numero_lojas DESC, total_unidades DESC
LIMIT 30;

-- ================================================================================
-- 9. ÚLTIMOS 50 REGISTROS INSERIDOS (por created_at se existir)
-- ================================================================================
SELECT 
    '🕒 ÚLTIMOS REGISTROS' as secao,
    p.descricao as produto,
    l.nome as loja,
    e.quantidade,
    e.criado_em
FROM estoque_lojas e
JOIN produtos p ON e.id_produto = p.id
LEFT JOIN lojas l ON e.id_loja = l.id
WHERE e.criado_em IS NOT NULL
ORDER BY e.criado_em DESC
LIMIT 50;

-- ================================================================================
-- 10. AMOSTRA ALEATÓRIA (20 registros para verificação manual)
-- ================================================================================
SELECT 
    '🎲 AMOSTRA ALEATÓRIA' as secao,
    p.descricao as produto,
    l.nome as loja,
    e.quantidade,
    p.preco_venda,
    p.preco_compra
FROM estoque_lojas e
JOIN produtos p ON e.id_produto = p.id
LEFT JOIN lojas l ON e.id_loja = l.id
ORDER BY RANDOM()
LIMIT 20;
