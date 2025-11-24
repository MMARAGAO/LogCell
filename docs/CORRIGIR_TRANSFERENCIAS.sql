-- ============================================
-- SCRIPT DE CORREÇÃO DE TRANSFERÊNCIAS
-- Executa correções automáticas se necessário
-- ============================================

-- ATENÇÃO: Execute primeiro o script VALIDAR_TRANSFERENCIAS.sql
-- para identificar os problemas antes de corrigir!

-- ============================================
-- CORREÇÃO 1: Remover Duplicatas Exatas
-- ============================================
-- Remove registros completamente duplicados (mantém apenas o mais antigo)
WITH duplicatas AS (
    SELECT 
        id,
        ROW_NUMBER() OVER (
            PARTITION BY id_produto, id_loja, tipo_movimentacao, 
                         quantidade_alterada, DATE_TRUNC('second', criado_em)
            ORDER BY criado_em ASC
        ) as rn
    FROM historico_estoque
    WHERE tipo_movimentacao IN ('transferencia_saida', 'transferencia_entrada')
)
DELETE FROM historico_estoque
WHERE id IN (
    SELECT id FROM duplicatas WHERE rn > 1
);

-- Verificar quantas foram removidas
SELECT 'Duplicatas removidas' as acao, COUNT(*) as quantidade
FROM (
    SELECT 1 -- placeholder, execute o DELETE acima primeiro
) x
WHERE FALSE; -- Altere para TRUE após executar o DELETE

-- ============================================
-- CORREÇÃO 2: Remover Transferências Órfãs
-- ============================================
-- Remove transferências de produtos que não existem mais
DELETE FROM historico_estoque
WHERE tipo_movimentacao IN ('transferencia_saida', 'transferencia_entrada')
AND id_produto NOT IN (SELECT id FROM produtos);

-- ============================================
-- CORREÇÃO 3: Identificar e Reportar Saídas sem Entrada
-- ============================================
-- Encontra saídas que não têm entrada correspondente
WITH saidas_sem_entrada AS (
    SELECT 
        h1.id,
        h1.id_produto,
        h1.id_loja,
        h1.quantidade_alterada,
        h1.criado_em,
        h1.observacao
    FROM historico_estoque h1
    WHERE h1.tipo_movimentacao = 'transferencia_saida'
    AND NOT EXISTS (
        SELECT 1 
        FROM historico_estoque h2
        WHERE h2.id_produto = h1.id_produto
        AND h2.tipo_movimentacao = 'transferencia_entrada'
        AND DATE_TRUNC('minute', h2.criado_em) = DATE_TRUNC('minute', h1.criado_em)
        AND ABS(h2.quantidade_alterada) = ABS(h1.quantidade_alterada)
    )
)
SELECT 
    'ATENÇÃO: Saídas sem entrada correspondente' as tipo,
    COUNT(*) as total,
    SUM(ABS(quantidade_alterada)) as unidades_afetadas
FROM saidas_sem_entrada;

-- Lista detalhada das saídas sem entrada
SELECT 
    h.id,
    p.descricao as produto,
    l.nome as loja_origem,
    ABS(h.quantidade_alterada) as quantidade,
    h.criado_em,
    h.observacao,
    '⚠️ FALTA ENTRADA' as status
FROM historico_estoque h
JOIN produtos p ON p.id = h.id_produto
JOIN lojas l ON l.id = h.id_loja
WHERE h.tipo_movimentacao = 'transferencia_saida'
AND NOT EXISTS (
    SELECT 1 
    FROM historico_estoque h2
    WHERE h2.id_produto = h.id_produto
    AND h2.tipo_movimentacao = 'transferencia_entrada'
    AND DATE_TRUNC('minute', h2.criado_em) = DATE_TRUNC('minute', h1.criado_em)
    AND ABS(h2.quantidade_alterada) = ABS(h1.quantidade_alterada)
)
ORDER BY h.criado_em DESC;

-- ============================================
-- CORREÇÃO 4: Identificar Entradas sem Saída
-- ============================================
WITH entradas_sem_saida AS (
    SELECT 
        h1.id,
        h1.id_produto,
        h1.id_loja,
        h1.quantidade_alterada,
        h1.criado_em,
        h1.observacao
    FROM historico_estoque h1
    WHERE h1.tipo_movimentacao = 'transferencia_entrada'
    AND NOT EXISTS (
        SELECT 1 
        FROM historico_estoque h2
        WHERE h2.id_produto = h1.id_produto
        AND h2.tipo_movimentacao = 'transferencia_saida'
        AND DATE_TRUNC('minute', h2.criado_em) = DATE_TRUNC('minute', h1.criado_em)
        AND ABS(h2.quantidade_alterada) = ABS(h1.quantidade_alterada)
    )
)
SELECT 
    'ATENÇÃO: Entradas sem saída correspondente' as tipo,
    COUNT(*) as total,
    SUM(ABS(quantidade_alterada)) as unidades_afetadas
FROM entradas_sem_saida;

-- ============================================
-- CORREÇÃO 5: Limpar Transferências Incompletas
-- ============================================
-- CUIDADO: Isso remove transferências sem par
-- Execute apenas se tiver certeza!

-- DESCOMENTE PARA EXECUTAR:
/*
-- Remove saídas sem entrada
DELETE FROM historico_estoque
WHERE id IN (
    SELECT h1.id
    FROM historico_estoque h1
    WHERE h1.tipo_movimentacao = 'transferencia_saida'
    AND NOT EXISTS (
        SELECT 1 
        FROM historico_estoque h2
        WHERE h2.id_produto = h1.id_produto
        AND h2.tipo_movimentacao = 'transferencia_entrada'
        AND DATE_TRUNC('minute', h2.criado_em) = DATE_TRUNC('minute', h1.criado_em)
        AND ABS(h2.quantidade_alterada) = ABS(h1.quantidade_alterada)
    )
);

-- Remove entradas sem saída
DELETE FROM historico_estoque
WHERE id IN (
    SELECT h1.id
    FROM historico_estoque h1
    WHERE h1.tipo_movimentacao = 'transferencia_entrada'
    AND NOT EXISTS (
        SELECT 1 
        FROM historico_estoque h2
        WHERE h2.id_produto = h1.id_produto
        AND h2.tipo_movimentacao = 'transferencia_saida'
        AND DATE_TRUNC('minute', h2.criado_em) = DATE_TRUNC('minute', h1.criado_em)
        AND ABS(h2.quantidade_alterada) = ABS(h1.quantidade_alterada)
    )
);
*/

-- ============================================
-- VERIFICAÇÃO FINAL
-- ============================================
-- Execute após as correções para confirmar
SELECT 
    'Verificação Pós-Correção' as tipo,
    COUNT(DISTINCT DATE_TRUNC('minute', criado_em) || '_' || id_produto) as transferencias_unicas,
    SUM(CASE WHEN tipo_movimentacao = 'transferencia_saida' THEN ABS(quantidade_alterada) ELSE 0 END) as total_unidades_saida,
    SUM(CASE WHEN tipo_movimentacao = 'transferencia_entrada' THEN ABS(quantidade_alterada) ELSE 0 END) as total_unidades_entrada,
    CASE 
        WHEN SUM(CASE WHEN tipo_movimentacao = 'transferencia_saida' THEN ABS(quantidade_alterada) ELSE 0 END) =
             SUM(CASE WHEN tipo_movimentacao = 'transferencia_entrada' THEN ABS(quantidade_alterada) ELSE 0 END)
        THEN '✅ BALANCEADO'
        ELSE '❌ DESBALANCEADO'
    END as status
FROM historico_estoque
WHERE tipo_movimentacao IN ('transferencia_saida', 'transferencia_entrada');

-- ============================================
-- BACKUP ANTES DE CORREÇÕES
-- ============================================
-- Execute antes de qualquer correção destrutiva:
/*
CREATE TABLE historico_estoque_backup_transferencias AS
SELECT * FROM historico_estoque
WHERE tipo_movimentacao IN ('transferencia_saida', 'transferencia_entrada');

SELECT 'Backup criado com sucesso!' as mensagem, COUNT(*) as registros_salvos
FROM historico_estoque_backup_transferencias;
*/

-- ============================================
-- RESTAURAR DO BACKUP (SE NECESSÁRIO)
-- ============================================
/*
-- 1. Remover registros atuais
DELETE FROM historico_estoque
WHERE tipo_movimentacao IN ('transferencia_saida', 'transferencia_entrada');

-- 2. Restaurar do backup
INSERT INTO historico_estoque
SELECT * FROM historico_estoque_backup_transferencias;

-- 3. Verificar restauração
SELECT 'Backup restaurado!' as mensagem, COUNT(*) as registros_restaurados
FROM historico_estoque
WHERE tipo_movimentacao IN ('transferencia_saida', 'transferencia_entrada');
*/
