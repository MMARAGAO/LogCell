-- Verificar todas as triggers na tabela itens_venda
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement,
    action_timing,
    action_orientation
FROM information_schema.triggers
WHERE event_object_table = 'itens_venda'
ORDER BY trigger_name;

-- Verificar o histórico de movimentações do produto
SELECT 
    h.*,
    p.descricao as produto_nome
FROM historico_estoque h
JOIN produtos p ON p.id = h.id_produto
WHERE h.id_produto = 'e138eed1-e316-4d2a-990e-7f1ebdee06c7'
ORDER BY h.criado_em DESC
LIMIT 10;

-- Verificar estoque atual do produto
SELECT 
    e.*,
    p.descricao as produto_nome,
    l.nome as loja_nome
FROM estoque_lojas e
JOIN produtos p ON p.id = e.id_produto
JOIN lojas l ON l.id = e.id_loja
WHERE e.id_produto = 'e138eed1-e316-4d2a-990e-7f1ebdee06c7';
