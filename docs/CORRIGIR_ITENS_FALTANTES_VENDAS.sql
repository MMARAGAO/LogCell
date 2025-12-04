-- ============================================================================
-- IDENTIFICAR E CORRIGIR ITENS COM BAIXA MAS NÃO INSERIDOS EM VENDAS
-- ============================================================================
-- Problema: Produtos tiveram baixa no estoque (erro 403 bloqueou INSERT)
-- Solução: Identificar baixas órfãs e inserir itens faltantes nas vendas
-- ============================================================================

-- 1. IDENTIFICAR baixas de estoque SEM item correspondente em itens_venda
-- (baixas que aconteceram mas o item não foi inserido na venda)
WITH baixas_sem_item AS (
    SELECT 
        he.id,
        he.id_produto,
        p.descricao as produto,
        he.id_loja,
        l.nome as loja,
        he.quantidade,
        he.criado_em,
        he.observacao,
        -- Extrair ID da venda da observação
        CASE 
            WHEN he.observacao LIKE 'Venda #%' THEN
                CAST(SUBSTRING(he.observacao FROM 'Venda #(\d+)') AS INTEGER)
            ELSE NULL
        END as venda_numero
    FROM historico_estoque he
    JOIN produtos p ON p.id = he.id_produto
    JOIN lojas l ON l.id = he.id_loja
    WHERE he.tipo_movimentacao IN ('venda', 'baixa_edicao_venda')
      AND he.criado_em >= '2025-12-04'
      -- Tem observação de venda mas quantidade NULL (indica que não foi via trigger)
      AND he.quantidade IS NULL
      AND he.observacao IS NOT NULL
      AND he.observacao LIKE 'Venda #%'
)
SELECT 
    bsi.venda_numero,
    v.numero_venda,
    c.nome as cliente_nome,
    bsi.produto,
    bsi.loja,
    bsi.criado_em,
    bsi.observacao,
    -- Verificar se item existe na venda
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM itens_venda iv 
            WHERE iv.venda_id = v.id 
            AND iv.produto_id = bsi.id_produto
        ) THEN 'ITEM JÁ EXISTE'
        ELSE 'ITEM FALTANDO'
    END as status_item,
    bsi.id_produto,
    v.id as venda_id
FROM baixas_sem_item bsi
LEFT JOIN vendas v ON v.numero_venda = bsi.venda_numero
LEFT JOIN clientes c ON c.id = v.cliente_id
WHERE v.id IS NOT NULL
ORDER BY bsi.criado_em DESC;

-- ============================================================================
-- 2. ANÁLISE DETALHADA: Venda V000019 (exemplo problemático)
-- ============================================================================
-- Venda que teve item adicionado mas não apareceu (caso original do problema)

SELECT 
    'VENDA V000019 - ANÁLISE COMPLETA' as analise;

-- A) Dados da venda
SELECT 
    v.id,
    v.numero_venda,
    c.nome as cliente_nome,
    v.loja_id,
    v.valor_total,
    v.criado_em,
    v.status
FROM vendas v
LEFT JOIN clientes c ON c.id = v.cliente_id
WHERE v.numero_venda = 19;

-- B) Itens registrados na venda
SELECT 
    iv.id,
    iv.produto_nome,
    iv.quantidade,
    iv.preco_unitario,
    iv.subtotal,
    iv.criado_em
FROM itens_venda iv
JOIN vendas v ON v.id = iv.venda_id
WHERE v.numero_venda = 19
ORDER BY iv.criado_em;

-- C) Histórico de estoque relacionado à venda
SELECT 
    he.id,
    p.descricao as produto,
    he.tipo_movimentacao,
    he.quantidade,
    he.observacao,
    he.criado_em
FROM historico_estoque he
JOIN produtos p ON p.id = he.id_produto
WHERE he.observacao LIKE '%Venda #19%'
   OR (he.criado_em >= (SELECT criado_em FROM vendas WHERE numero_venda = 19) - INTERVAL '10 minutes'
       AND he.criado_em <= (SELECT criado_em FROM vendas WHERE numero_venda = 19) + INTERVAL '10 minutes'
       AND he.tipo_movimentacao IN ('venda', 'baixa_edicao_venda'))
ORDER BY he.criado_em;

-- D) Histórico de alterações da venda
SELECT 
    hv.tipo_acao,
    hv.descricao,
    hv.criado_em,
    u.nome as usuario
FROM historico_vendas hv
JOIN vendas v ON v.id = hv.venda_id
LEFT JOIN usuarios u ON u.id = hv.usuario_id
WHERE v.numero_venda = 19
ORDER BY hv.criado_em;

-- ============================================================================
-- 3. IDENTIFICAR PRODUTOS COM BAIXA DUPLICADA QUE PRECISAM SER INSERIDOS
-- ============================================================================
-- Produtos que tiveram:
-- 1. Baixa manual do código (registrado com observação)
-- 2. Baixa da trigger (registrado com quantidade)
-- Mas NÃO foram inseridos em itens_venda (erro 403)

WITH baixas_duplicadas AS (
    SELECT 
        he.id_produto,
        p.descricao as produto,
        he.id_loja,
        l.nome as loja,
        he.observacao,
        he.criado_em,
        -- Extrair número da venda
        CAST(SUBSTRING(he.observacao FROM 'Venda #(\d+)') AS INTEGER) as venda_numero,
        -- Buscar a baixa correspondente da trigger (mesma hora)
        (
            SELECT he2.quantidade 
            FROM historico_estoque he2
            WHERE he2.id_produto = he.id_produto
              AND he2.id_loja = he.id_loja
              AND he2.tipo_movimentacao IN ('venda', 'baixa_edicao_venda')
              AND he2.quantidade IS NOT NULL
              AND ABS(EXTRACT(EPOCH FROM (he2.criado_em - he.criado_em))) < 5
            LIMIT 1
        ) as quantidade_baixada
    FROM historico_estoque he
    JOIN produtos p ON p.id = he.id_produto
    JOIN lojas l ON l.id = he.id_loja
    WHERE he.tipo_movimentacao IN ('venda', 'baixa_edicao_venda')
      AND he.criado_em >= '2025-12-04'
      AND he.quantidade IS NULL
      AND he.observacao LIKE 'Venda #%'
)
SELECT 
    bd.venda_numero,
    v.numero_venda,
    c.nome as cliente_nome,
    bd.produto,
    bd.loja,
    bd.quantidade_baixada,
    bd.criado_em,
    -- Verificar se existe em itens_venda
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM itens_venda iv 
            WHERE iv.venda_id = v.id 
            AND iv.produto_id = bd.id_produto
        ) THEN '✓ Item já inserido'
        ELSE '✗ FALTA INSERIR'
    END as status,
    bd.id_produto,
    v.id as venda_id,
    v.loja_id
FROM baixas_duplicadas bd
LEFT JOIN vendas v ON v.numero_venda = bd.venda_numero
LEFT JOIN clientes c ON c.id = v.cliente_id
WHERE bd.quantidade_baixada IS NOT NULL
  AND v.id IS NOT NULL
ORDER BY bd.criado_em DESC;

-- ============================================================================
-- 4. CORREÇÃO: INSERIR ITENS FALTANTES NAS VENDAS
-- ============================================================================
-- ATENÇÃO: Só execute após revisar a query #3 acima!
-- Este INSERT vai adicionar os itens que faltam nas vendas

/*
-- Template de INSERT para cada item faltante identificado na query #3

-- Exemplo: VIDRO IPHONE 14 PLUS+ OCA PRETA na Venda #19
-- (ajuste os valores conforme a query #3)

INSERT INTO itens_venda (
    venda_id,
    produto_id,
    produto_nome,
    produto_codigo,
    quantidade,
    preco_unitario,
    subtotal,
    desconto_tipo,
    desconto_valor,
    valor_desconto,
    devolvido
)
SELECT 
    v.id,                           -- venda_id
    '476a804a-2068-4345-a4db-7fda99fa6c6b',  -- produto_id (SUBSTITUIR)
    'VIDRO IPHONE 14 PLUS+ OCA PRETA',       -- produto_nome (SUBSTITUIR)
    p.codigo,                        -- produto_codigo
    10,                              -- quantidade (SUBSTITUIR pela quantidade_baixada)
    p.preco_venda,                   -- preco_unitario (usar preço atual do produto)
    p.preco_venda * 10,              -- subtotal
    NULL,                            -- desconto_tipo
    0,                               -- desconto_valor
    0,                               -- valor_desconto
    0                                -- devolvido
FROM vendas v
CROSS JOIN produtos p
WHERE v.numero_venda = 19            -- SUBSTITUIR pelo venda_numero
  AND p.id = '476a804a-2068-4345-a4db-7fda99fa6c6b'  -- SUBSTITUIR
  -- Garantir que não existe duplicado
  AND NOT EXISTS (
      SELECT 1 FROM itens_venda iv 
      WHERE iv.venda_id = v.id 
      AND iv.produto_id = p.id
  );

-- IMPORTANTE: A trigger NÃO vai baixar estoque novamente porque 
-- o estoque já foi baixado manualmente (2x inclusive, já corrigido)
*/

-- ============================================================================
-- 5. ATUALIZAR VALOR TOTAL DA VENDA
-- ============================================================================
-- Após inserir os itens faltantes, recalcular o valor total da venda

/*
UPDATE vendas
SET 
    valor_total = (
        SELECT COALESCE(SUM(subtotal - COALESCE(valor_desconto, 0)), 0)
        FROM itens_venda
        WHERE venda_id = vendas.id
    ),
    atualizado_em = NOW(),
    atualizado_por = (SELECT id FROM usuarios LIMIT 1)
WHERE numero_venda = 19;  -- SUBSTITUIR pelo número da venda corrigida

-- Verificar novo valor
SELECT 
    v.numero_venda,
    c.nome as cliente_nome,
    v.valor_total as valor_atual,
    (
        SELECT COALESCE(SUM(iv.subtotal - COALESCE(iv.valor_desconto, 0)), 0)
        FROM itens_venda iv
        WHERE iv.venda_id = v.id
    ) as valor_calculado,
    (
        SELECT COUNT(*)
        FROM itens_venda iv
        WHERE iv.venda_id = v.id
    ) as total_itens
FROM vendas v
LEFT JOIN clientes c ON c.id = v.cliente_id
WHERE v.numero_venda = 19;
*/

-- ============================================================================
-- PROCEDIMENTO RECOMENDADO:
-- ============================================================================
-- 1. Execute query #3 para listar todos os itens faltantes
-- 2. Para cada item com status "✗ FALTA INSERIR":
--    a) Anote: venda_numero, produto_id, produto_nome, quantidade_baixada
--    b) Verifique o preço do produto no momento da venda (historico ou atual)
--    c) Ajuste e execute o INSERT do template acima
-- 3. Execute o UPDATE para recalcular o valor_total da venda
-- 4. Verifique se o item agora aparece na venda
-- 5. Registre no histórico da venda (opcional)
-- ============================================================================

-- ============================================================================
-- FIM DO SCRIPT
-- ============================================================================
