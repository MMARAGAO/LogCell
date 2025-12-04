-- ============================================================================
-- IDENTIFICAR E CORRIGIR BAIXA DUPLICADA DE ESTOQUE
-- ============================================================================
-- Problema: Vendas editadas tiveram baixa duplicada (código + trigger)
-- Solução: Identificar e devolver ao estoque as quantidades duplicadas
-- ============================================================================

-- 1. IDENTIFICAR itens com baixa duplicada no histórico
-- (procurar por itens que têm 2 registros de baixa com mesma quantidade)
SELECT 
    he.id_produto,
    p.descricao as produto,
    he.id_loja,
    l.nome as loja,
    he.observacao,
    he.quantidade,
    he.criado_em,
    COUNT(*) OVER (
        PARTITION BY he.id_produto, he.id_loja, he.quantidade, 
        DATE_TRUNC('second', he.criado_em)
    ) as registros_duplicados
FROM historico_estoque he
JOIN produtos p ON p.id = he.id_produto
JOIN lojas l ON l.id = he.id_loja
WHERE he.tipo_movimentacao IN ('baixa_edicao_venda', 'venda')
  AND he.criado_em >= '2025-12-04'  -- Ajustar data conforme necessário
ORDER BY he.criado_em DESC;

-- 2. IDENTIFICAR produtos que precisam de correção
-- (baixas duplicadas nos últimos registros)
WITH baixas_recentes AS (
    SELECT 
        id_produto,
        id_loja,
        tipo_movimentacao,
        quantidade,
        observacao,
        criado_em,
        LAG(quantidade) OVER (
            PARTITION BY id_produto, id_loja 
            ORDER BY criado_em
        ) as quantidade_anterior,
        LAG(tipo_movimentacao) OVER (
            PARTITION BY id_produto, id_loja 
            ORDER BY criado_em
        ) as tipo_anterior,
        LAG(criado_em) OVER (
            PARTITION BY id_produto, id_loja 
            ORDER BY criado_em
        ) as data_anterior
    FROM historico_estoque
    WHERE tipo_movimentacao IN ('baixa_edicao_venda', 'venda')
      AND criado_em >= '2025-12-04'
)
SELECT 
    br.id_produto,
    p.descricao as produto,
    br.id_loja,
    l.nome as loja,
    br.quantidade as qtd_baixada,
    br.criado_em,
    br.observacao,
    EXTRACT(EPOCH FROM (br.criado_em - br.data_anterior)) as segundos_entre_baixas,
    'POSSÍVEL DUPLICAÇÃO' as status
FROM baixas_recentes br
JOIN produtos p ON p.id = br.id_produto
JOIN lojas l ON l.id = br.id_loja
WHERE br.quantidade = br.quantidade_anterior
  AND br.tipo_movimentacao IN ('baixa_edicao_venda', 'venda')
  AND br.tipo_anterior IN ('baixa_edicao_venda', 'venda')
  AND EXTRACT(EPOCH FROM (br.criado_em - br.data_anterior)) < 5  -- Menos de 5 segundos
ORDER BY br.criado_em DESC;

-- 3. VERIFICAR estoque atual vs esperado para produtos afetados
-- Execute a query #2 acima primeiro para identificar os produtos
-- Depois ajuste os IDs abaixo conforme necessário

/*
-- Exemplo para produto específico:
SELECT 
    p.descricao,
    l.nome as loja,
    el.quantidade as estoque_atual,
    -- Somar todas as movimentações para calcular estoque esperado
    COALESCE((
        SELECT SUM(
            CASE 
                WHEN tipo_movimentacao IN ('entrada', 'devolucao_venda', 'transferencia_entrada') 
                THEN quantidade
                WHEN tipo_movimentacao IN ('saida', 'venda', 'baixa_edicao_venda', 'quebra', 'transferencia_saida') 
                THEN -quantidade
                ELSE quantidade_alterada
            END
        )
        FROM historico_estoque he
        WHERE he.id_produto = p.id 
          AND he.id_loja = l.id
    ), 0) as estoque_calculado,
    el.quantidade - COALESCE((
        SELECT SUM(
            CASE 
                WHEN tipo_movimentacao IN ('entrada', 'devolucao_venda', 'transferencia_entrada') 
                THEN quantidade
                WHEN tipo_movimentacao IN ('saida', 'venda', 'baixa_edicao_venda', 'quebra', 'transferencia_saida') 
                THEN -quantidade
                ELSE quantidade_alterada
            END
        )
        FROM historico_estoque he
        WHERE he.id_produto = p.id 
          AND he.id_loja = l.id
    ), 0) as diferenca
FROM estoque_lojas el
JOIN produtos p ON p.id = el.id_produto
JOIN lojas l ON l.id = el.id_loja
WHERE p.id = 'ID_DO_PRODUTO_AQUI'  -- Substituir pelo ID do produto
  AND l.id = 3;  -- Substituir pelo ID da loja
*/

-- ============================================================================
-- 4. CORREÇÃO: Devolver ao estoque itens com baixa duplicada
-- ============================================================================
-- CUIDADO: Execute apenas após confirmar os itens na query #2

/*
-- Para cada produto identificado com baixa duplicada:
-- Exemplo: Produto X teve baixa de 10 unidades duplicada na loja 3

-- A) Adicionar de volta ao estoque
UPDATE estoque_lojas
SET 
    quantidade = quantidade + 10,  -- Substituir pela quantidade duplicada
    atualizado_em = NOW(),
    atualizado_por = (SELECT id FROM usuarios WHERE email = 'seu_email@exemplo.com' LIMIT 1)
WHERE id_produto = 'ID_DO_PRODUTO'  -- Substituir
  AND id_loja = 3;  -- Substituir

-- B) Registrar no histórico a correção
INSERT INTO historico_estoque (
    id_produto,
    id_loja,
    usuario_id,
    quantidade,
    quantidade_anterior,
    quantidade_nova,
    tipo_movimentacao,
    motivo,
    observacao
)
SELECT 
    'ID_DO_PRODUTO',  -- Substituir
    3,  -- Substituir pelo ID da loja
    (SELECT id FROM usuarios WHERE email = 'seu_email@exemplo.com' LIMIT 1),
    10,  -- Quantidade a devolver
    el.quantidade - 10,
    el.quantidade,
    'ajuste',
    'Correção de baixa duplicada',
    'Devolução ao estoque devido a duplicação de baixa automática (trigger + código manual)'
FROM estoque_lojas el
WHERE el.id_produto = 'ID_DO_PRODUTO'
  AND el.id_loja = 3;
*/

-- ============================================================================
-- PROCEDIMENTO RECOMENDADO:
-- ============================================================================
-- 1. Execute query #2 para listar produtos com possível duplicação
-- 2. Para cada produto listado:
--    a) Anote: produto_id, loja_id, quantidade duplicada
--    b) Descomente e ajuste o código de CORREÇÃO acima
--    c) Execute UPDATE + INSERT para cada produto
-- 3. Verifique o estoque final com a query #3
-- ============================================================================

-- ============================================================================
-- FIM DO SCRIPT
-- ============================================================================
