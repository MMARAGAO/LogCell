-- ============================================
-- VALIDAÇÃO CORRIGIDA - Conta transferências únicas
-- Usa id_loja_origem + id_loja_destino para distinguir
-- ============================================

WITH transferencias_detalhadas AS (
    SELECT 
        hs.id_produto,
        hs.id_loja as loja_origem,
        DATE_TRUNC('minute', hs.criado_em) as momento,
        ABS(hs.quantidade_alterada) as quantidade_saida,
        hs.observacao
    FROM historico_estoque hs
    WHERE hs.tipo_movimentacao = 'transferencia_saida'
)
SELECT 
    '🏪 Total de Lojas' as metrica,
    (SELECT COUNT(*) FROM lojas)::text as valor
UNION ALL
SELECT 
    '📦 Transferências Registradas' as metrica,
    COUNT(*)::text as valor
FROM transferencias_detalhadas
UNION ALL
SELECT 
    '📊 Produtos/Unidades Transferidas' as metrica,
    SUM(quantidade_saida)::text as valor
FROM transferencias_detalhadas
UNION ALL
SELECT 
    '⚠️ Status' as metrica,
    CASE 
        WHEN (
            SELECT SUM(ABS(quantidade_alterada)) 
            FROM historico_estoque 
            WHERE tipo_movimentacao = 'transferencia_saida'
        ) = (
            SELECT SUM(ABS(quantidade_alterada)) 
            FROM historico_estoque 
            WHERE tipo_movimentacao = 'transferencia_entrada'
        )
        THEN '✅ Balanceado - Dados Corretos'
        ELSE '❌ Desbalanceado - Verificar Dados'
    END as valor;
