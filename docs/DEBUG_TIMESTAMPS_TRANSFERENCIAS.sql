-- ============================================
-- DEBUG: Verificar timestamps exatos
-- Para entender por que a transferência não está pareando
-- ============================================

-- Ver timestamps EXATOS (com milissegundos)
SELECT 
    p.descricao as produto,
    l.nome as loja,
    h.tipo_movimentacao,
    ABS(h.quantidade_alterada) as quantidade,
    h.criado_em,
    -- Timestamp truncado em segundos (usado no código)
    DATE_TRUNC('second', h.criado_em) as momento_segundo,
    -- Timestamp formatado ISO até segundos
    TO_CHAR(h.criado_em, 'YYYY-MM-DD"T"HH24:MI:SS') as iso_segundo,
    h.observacao
FROM historico_estoque h
JOIN produtos p ON p.id = h.id_produto
JOIN lojas l ON l.id = h.id_loja
WHERE h.tipo_movimentacao IN ('transferencia_saida', 'transferencia_entrada')
ORDER BY h.criado_em DESC;

-- Verificar se existem pares com timestamps diferentes
WITH saidas AS (
    SELECT 
        id_produto,
        id_loja,
        DATE_TRUNC('second', criado_em) as momento,
        ABS(quantidade_alterada) as qtd,
        criado_em
    FROM historico_estoque
    WHERE tipo_movimentacao = 'transferencia_saida'
),
entradas AS (
    SELECT 
        id_produto,
        id_loja,
        DATE_TRUNC('second', criado_em) as momento,
        ABS(quantidade_alterada) as qtd,
        criado_em
    FROM historico_estoque
    WHERE tipo_movimentacao = 'transferencia_entrada'
)
SELECT 
    'Transferências sem par exato' as tipo,
    s.id_produto,
    s.momento as saida_momento,
    s.qtd,
    e.momento as entrada_momento,
    EXTRACT(EPOCH FROM (e.criado_em - s.criado_em)) as diferenca_segundos
FROM saidas s
LEFT JOIN entradas e ON 
    e.id_produto = s.id_produto 
    AND e.qtd = s.qtd
    AND ABS(EXTRACT(EPOCH FROM (e.criado_em - s.criado_em))) < 5  -- Até 5 segundos de diferença
WHERE s.momento != e.momento OR e.momento IS NULL
ORDER BY s.momento DESC;
