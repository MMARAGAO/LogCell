-- ============================================================================
-- DEBUG: Verificar itens da venda V000019
-- ============================================================================

-- Buscar ID da venda
SELECT id, numero_venda, status, valor_total, saldo_devedor, cliente_id, loja_id, vendedor_id
FROM vendas
WHERE numero_venda = 19;

-- Buscar TODOS os itens da venda (usando o ID retornado acima)
SELECT 
    iv.*,
    p.descricao as produto_descricao,
    p.codigo_fabricante
FROM itens_venda iv
LEFT JOIN produtos p ON p.id = iv.produto_id
WHERE iv.venda_id = (SELECT id FROM vendas WHERE numero_venda = 19)
ORDER BY iv.criado_em DESC;

-- Verificar histórico da venda
SELECT *
FROM historico_vendas
WHERE venda_id = (SELECT id FROM vendas WHERE numero_venda = 19)
ORDER BY criado_em DESC;

-- Verificar histórico de estoque relacionado
SELECT 
    he.*,
    p.descricao as produto_descricao
FROM historico_estoque he
LEFT JOIN produtos p ON p.id = he.id_produto
WHERE he.motivo LIKE '%19%' OR he.observacao LIKE '%19%'
ORDER BY he.criado_em DESC;

-- ============================================================================
-- FIM DO SCRIPT
-- ============================================================================
