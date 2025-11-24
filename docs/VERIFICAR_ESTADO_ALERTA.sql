-- Verificar estado do controle de alertas para o produto Bateria iphone 17
SELECT 
    aec.*,
    p.descricao as produto_nome,
    l.nome as loja_nome
FROM alertas_estoque_controle aec
JOIN produtos p ON p.id = aec.produto_id
JOIN lojas l ON l.id = aec.loja_id
WHERE p.descricao LIKE '%Bateria iphone 17%';

-- Ver estoque atual
SELECT 
    el.quantidade,
    p.descricao as produto_nome,
    l.nome as loja_nome,
    p.quantidade_minima
FROM estoque_lojas el
JOIN produtos p ON p.id = el.id_produto
JOIN lojas l ON l.id = el.id_loja
WHERE p.descricao LIKE '%Bateria iphone 17%'
ORDER BY l.nome;
