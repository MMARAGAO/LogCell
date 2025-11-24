-- ============================================
-- VALIDAÇÃO RÁPIDA - Execute no Supabase SQL Editor
-- ============================================

-- RESULTADO ESPERADO PARA A TELA:
-- Este deve ser o valor exato que aparece

WITH transferencias_agrupadas AS (
    SELECT DISTINCT
        id_produto,
        DATE_TRUNC('minute', criado_em) as momento,
        MAX(CASE WHEN tipo_movimentacao = 'transferencia_saida' THEN ABS(quantidade_alterada) END) as quantidade_saida,
        MAX(CASE WHEN tipo_movimentacao = 'transferencia_entrada' THEN ABS(quantidade_alterada) END) as quantidade_entrada
    FROM historico_estoque
    WHERE tipo_movimentacao IN ('transferencia_saida', 'transferencia_entrada')
    GROUP BY id_produto, DATE_TRUNC('minute', criado_em)
    HAVING MAX(CASE WHEN tipo_movimentacao = 'transferencia_saida' THEN 1 END) = 1
)
SELECT 
    '🏪 Total de Lojas' as metrica,
    (SELECT COUNT(*) FROM lojas)::text as valor
UNION ALL
SELECT 
    '📦 Transferências Registradas' as metrica,
    COUNT(*)::text as valor
FROM transferencias_agrupadas
UNION ALL
SELECT 
    '📊 Produtos/Unidades Transferidas' as metrica,
    SUM(quantidade_saida)::text as valor
FROM transferencias_agrupadas
UNION ALL
SELECT 
    '⚠️ Status' as metrica,
    CASE 
        WHEN (SELECT SUM(quantidade_saida) FROM transferencias_agrupadas) = 
             (SELECT SUM(quantidade_entrada) FROM transferencias_agrupadas)
        THEN '✅ Balanceado - Dados Corretos'
        ELSE '❌ Desbalanceado - Verificar Dados'
    END as valor;
