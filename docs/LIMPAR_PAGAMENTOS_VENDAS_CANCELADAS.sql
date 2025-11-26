-- =====================================================
-- LIMPAR PAGAMENTOS DE VENDAS CANCELADAS
-- Data: 25/11/2025
-- =====================================================
-- Remove pagamentos e sangrias de vendas canceladas
-- pois não deveriam aparecer no caixa
-- Também zera valor_pago e saldo_devedor das vendas
-- =====================================================

-- Verificar quantos pagamentos serão removidos
SELECT 
    COUNT(*) as total_pagamentos,
    SUM(pv.valor) as valor_total,
    'Pagamentos de vendas canceladas' as descricao
FROM pagamentos_venda pv
INNER JOIN vendas v ON pv.venda_id = v.id
WHERE v.status = 'cancelada';

-- Verificar quantas sangrias serão removidas
SELECT 
    COUNT(*) as total_sangrias,
    SUM(sc.valor) as valor_total,
    'Sangrias de vendas canceladas' as descricao
FROM sangrias_caixa sc
INNER JOIN vendas v ON sc.venda_id = v.id
WHERE v.status = 'cancelada';

-- Remover pagamentos de vendas canceladas
DELETE FROM pagamentos_venda
WHERE venda_id IN (
    SELECT id 
    FROM vendas 
    WHERE status = 'cancelada'
);

-- Remover sangrias de vendas canceladas
DELETE FROM sangrias_caixa
WHERE venda_id IN (
    SELECT id 
    FROM vendas 
    WHERE status = 'cancelada'
);

-- Zerar valores das vendas canceladas
UPDATE vendas
SET valor_pago = 0,
    saldo_devedor = 0
WHERE status = 'cancelada';

-- Verificar limpeza de pagamentos
SELECT 
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ Pagamentos removidos!'
        ELSE '⚠️ Ainda há ' || COUNT(*) || ' pagamentos de vendas canceladas'
    END as status
FROM pagamentos_venda pv
INNER JOIN vendas v ON pv.venda_id = v.id
WHERE v.status = 'cancelada';

-- Verificar limpeza de sangrias
SELECT 
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ Sangrias removidas!'
        ELSE '⚠️ Ainda há ' || COUNT(*) || ' sangrias de vendas canceladas'
    END as status
FROM sangrias_caixa sc
INNER JOIN vendas v ON sc.venda_id = v.id
WHERE v.status = 'cancelada';

-- Verificar vendas canceladas
SELECT 
    numero_venda,
    valor_total,
    valor_pago,
    saldo_devedor,
    status
FROM vendas
WHERE status = 'cancelada'
ORDER BY numero_venda;
