-- ============================================
-- SCRIPT DE VALIDAÇÃO DE TRANSFERÊNCIAS
-- Diagnóstico completo dos dados
-- ============================================

-- 1. VERIFICAR TOTAL DE REGISTROS DE TRANSFERÊNCIA
SELECT 
    'Total de Registros' as tipo,
    COUNT(*) as total
FROM historico_estoque
WHERE tipo_movimentacao IN ('transferencia_saida', 'transferencia_entrada');

-- 2. CONTAR SAÍDAS E ENTRADAS SEPARADAMENTE
SELECT 
    tipo_movimentacao,
    COUNT(*) as quantidade_registros,
    SUM(ABS(quantidade_alterada)) as total_unidades
FROM historico_estoque
WHERE tipo_movimentacao IN ('transferencia_saida', 'transferencia_entrada')
GROUP BY tipo_movimentacao
ORDER BY tipo_movimentacao;

-- 3. VERIFICAR SE SAÍDAS E ENTRADAS ESTÃO BALANCEADAS
-- (Cada saída deve ter uma entrada correspondente)
WITH transferencias AS (
    SELECT 
        id_produto,
        DATE_TRUNC('minute', criado_em) as momento,
        tipo_movimentacao,
        ABS(quantidade_alterada) as quantidade
    FROM historico_estoque
    WHERE tipo_movimentacao IN ('transferencia_saida', 'transferencia_entrada')
),
agrupadas AS (
    SELECT 
        id_produto,
        momento,
        SUM(CASE WHEN tipo_movimentacao = 'transferencia_saida' THEN quantidade ELSE 0 END) as saidas,
        SUM(CASE WHEN tipo_movimentacao = 'transferencia_entrada' THEN quantidade ELSE 0 END) as entradas,
        COUNT(CASE WHEN tipo_movimentacao = 'transferencia_saida' THEN 1 END) as num_saidas,
        COUNT(CASE WHEN tipo_movimentacao = 'transferencia_entrada' THEN 1 END) as num_entradas
    FROM transferencias
    GROUP BY id_produto, momento
)
SELECT 
    'Transferências Balanceadas' as tipo,
    COUNT(*) as total_grupos,
    SUM(CASE WHEN saidas = entradas THEN 1 ELSE 0 END) as balanceadas,
    SUM(CASE WHEN saidas != entradas THEN 1 ELSE 0 END) as desbalanceadas
FROM agrupadas;

-- 4. LISTAR TRANSFERÊNCIAS DESBALANCEADAS (SE HOUVER)
WITH transferencias AS (
    SELECT 
        id_produto,
        DATE_TRUNC('minute', criado_em) as momento,
        tipo_movimentacao,
        ABS(quantidade_alterada) as quantidade
    FROM historico_estoque
    WHERE tipo_movimentacao IN ('transferencia_saida', 'transferencia_entrada')
),
agrupadas AS (
    SELECT 
        id_produto,
        momento,
        SUM(CASE WHEN tipo_movimentacao = 'transferencia_saida' THEN quantidade ELSE 0 END) as saidas,
        SUM(CASE WHEN tipo_movimentacao = 'transferencia_entrada' THEN quantidade ELSE 0 END) as entradas
    FROM transferencias
    GROUP BY id_produto, momento
    HAVING SUM(CASE WHEN tipo_movimentacao = 'transferencia_saida' THEN quantidade ELSE 0 END) 
        != SUM(CASE WHEN tipo_movimentacao = 'transferencia_entrada' THEN quantidade ELSE 0 END)
)
SELECT 
    p.descricao as produto,
    p.marca,
    a.momento,
    a.saidas,
    a.entradas,
    (a.saidas - a.entradas) as diferenca
FROM agrupadas a
JOIN produtos p ON p.id = a.id_produto
ORDER BY a.momento DESC;

-- 5. CONTAGEM CORRETA PARA A TELA (MÉTODO USADO NO CÓDIGO)
-- Conta apenas as SAÍDAS agrupadas por produto+timestamp
WITH transferencias_agrupadas AS (
    SELECT DISTINCT
        id_produto,
        DATE_TRUNC('minute', criado_em) as momento,
        MAX(CASE WHEN tipo_movimentacao = 'transferencia_saida' THEN ABS(quantidade_alterada) END) as quantidade_saida
    FROM historico_estoque
    WHERE tipo_movimentacao IN ('transferencia_saida', 'transferencia_entrada')
    GROUP BY id_produto, DATE_TRUNC('minute', criado_em)
    HAVING MAX(CASE WHEN tipo_movimentacao = 'transferencia_saida' THEN 1 END) = 1
)
SELECT 
    COUNT(*) as total_transferencias,
    SUM(quantidade_saida) as total_unidades_transferidas
FROM transferencias_agrupadas;

-- 6. DETALHAMENTO DAS ÚLTIMAS 10 TRANSFERÊNCIAS COM PRODUTOS
SELECT 
    h.id,
    p.descricao as produto,
    p.marca,
    l.nome as loja,
    h.tipo_movimentacao,
    ABS(h.quantidade_alterada) as quantidade,
    h.criado_em,
    u.nome as usuario,
    SUBSTRING(h.observacao, 1, 100) as observacao
FROM historico_estoque h
JOIN produtos p ON p.id = h.id_produto
JOIN lojas l ON l.id = h.id_loja
LEFT JOIN usuarios u ON u.id = h.usuario_id
WHERE h.tipo_movimentacao IN ('transferencia_saida', 'transferencia_entrada')
ORDER BY h.criado_em DESC
LIMIT 20;

-- 7. VERIFICAR DUPLICATAS (REGISTROS IDÊNTICOS)
SELECT 
    id_produto,
    id_loja,
    tipo_movimentacao,
    quantidade_alterada,
    DATE_TRUNC('second', criado_em) as momento,
    COUNT(*) as duplicatas
FROM historico_estoque
WHERE tipo_movimentacao IN ('transferencia_saida', 'transferencia_entrada')
GROUP BY id_produto, id_loja, tipo_movimentacao, quantidade_alterada, DATE_TRUNC('second', criado_em)
HAVING COUNT(*) > 1;

-- 8. ESTATÍSTICAS POR PRODUTO
SELECT 
    p.descricao as produto,
    p.marca,
    COUNT(DISTINCT DATE_TRUNC('minute', h.criado_em)) as num_transferencias,
    SUM(CASE WHEN h.tipo_movimentacao = 'transferencia_saida' THEN ABS(h.quantidade_alterada) ELSE 0 END) as total_saidas,
    SUM(CASE WHEN h.tipo_movimentacao = 'transferencia_entrada' THEN ABS(h.quantidade_alterada) ELSE 0 END) as total_entradas
FROM historico_estoque h
JOIN produtos p ON p.id = h.id_produto
WHERE h.tipo_movimentacao IN ('transferencia_saida', 'transferencia_entrada')
GROUP BY p.id, p.descricao, p.marca
ORDER BY num_transferencias DESC;

-- 9. VERIFICAR INTEGRIDADE TEMPORAL
-- Verifica se entradas acontecem próximas às saídas (mesma transação)
WITH pares AS (
    SELECT 
        h1.id as id_saida,
        h1.id_produto,
        h1.criado_em as saida_em,
        h2.id as id_entrada,
        h2.criado_em as entrada_em,
        EXTRACT(EPOCH FROM (h2.criado_em - h1.criado_em)) as diferenca_segundos
    FROM historico_estoque h1
    LEFT JOIN historico_estoque h2 ON 
        h2.id_produto = h1.id_produto
        AND h2.tipo_movimentacao = 'transferencia_entrada'
        AND DATE_TRUNC('minute', h2.criado_em) = DATE_TRUNC('minute', h1.criado_em)
        AND ABS(h2.quantidade_alterada) = ABS(h1.quantidade_alterada)
    WHERE h1.tipo_movimentacao = 'transferencia_saida'
)
SELECT 
    'Integridade Temporal' as tipo,
    COUNT(*) as total_saidas,
    SUM(CASE WHEN id_entrada IS NOT NULL THEN 1 ELSE 0 END) as com_entrada_pareada,
    SUM(CASE WHEN id_entrada IS NULL THEN 1 ELSE 0 END) as sem_entrada_pareada,
    ROUND(AVG(diferenca_segundos)::numeric, 2) as tempo_medio_segundos
FROM pares;

-- 10. RESUMO FINAL PARA A TELA
SELECT 
    '=== RESUMO PARA A TELA ===' as secao,
    '' as detalhe
UNION ALL
SELECT 
    'Total de Lojas' as secao,
    COUNT(DISTINCT id)::text as detalhe
FROM lojas
UNION ALL
SELECT 
    'Transferências Registradas (Grupos)' as secao,
    COUNT(DISTINCT DATE_TRUNC('minute', criado_em) || '_' || id_produto)::text as detalhe
FROM historico_estoque
WHERE tipo_movimentacao = 'transferencia_saida'
UNION ALL
SELECT 
    'Produtos/Unidades Transferidas' as secao,
    SUM(ABS(quantidade_alterada))::text as detalhe
FROM historico_estoque
WHERE tipo_movimentacao = 'transferencia_saida';

-- 11. VERIFICAR SE HÁ REGISTROS ÓRFÃOS
SELECT 
    'Registros Órfãos' as tipo,
    COUNT(*) as total
FROM historico_estoque h
WHERE h.tipo_movimentacao IN ('transferencia_saida', 'transferencia_entrada')
AND NOT EXISTS (
    SELECT 1 FROM produtos p WHERE p.id = h.id_produto
);
