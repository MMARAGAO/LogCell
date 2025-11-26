-- =====================================================
-- LIMPAR APENAS DUPLICATAS DO HISTÓRICO
-- Data: 25/11/2025
-- =====================================================
-- Remove apenas registros duplicados visuais
-- Mantém o registro com observação mais detalhada
-- =====================================================

-- Remover duplicatas genéricas (manter a específica com Venda #X, RMA #Y, etc)
WITH duplicatas AS (
    SELECT 
        h1.id as id_generico
    FROM historico_estoque h1
    INNER JOIN historico_estoque h2 
        ON h1.id_produto = h2.id_produto 
        AND h1.id_loja = h2.id_loja
        AND h1.quantidade_nova = h2.quantidade_nova
        AND h1.id < h2.id
        AND ABS(EXTRACT(EPOCH FROM (h2.criado_em - h1.criado_em))) < 3
    WHERE h1.observacao = 'Ajuste manual de estoque'
      AND (h2.observacao LIKE 'Venda #%' 
           OR h2.observacao LIKE 'RMA #%'
           OR h2.observacao LIKE '%ordem de servi%'
           OR h2.observacao LIKE '%Devolu%')
)
DELETE FROM historico_estoque
WHERE id IN (SELECT id_generico FROM duplicatas);

-- Verificar limpeza
SELECT 
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ Duplicatas removidas!'
        ELSE '⚠️ Ainda há ' || COUNT(*) || ' duplicatas'
    END as status
FROM (
    SELECT h1.id
    FROM historico_estoque h1
    INNER JOIN historico_estoque h2 
        ON h1.id_produto = h2.id_produto 
        AND h1.id_loja = h2.id_loja
        AND h1.quantidade_nova = h2.quantidade_nova
        AND h1.id != h2.id
        AND ABS(EXTRACT(EPOCH FROM (h2.criado_em - h1.criado_em))) < 3
) sub;
