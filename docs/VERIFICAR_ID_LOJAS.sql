-- Ver o ID das lojas
SELECT 
    id,
    nome
FROM lojas
ORDER BY id;

-- Ver o estoque específico do produto na loja ATACADO
SELECT 
    e.id,
    e.id_produto,
    p.descricao as produto_nome,
    e.id_loja,
    l.nome as loja_nome,
    e.quantidade
FROM estoque_lojas e
JOIN produtos p ON p.id = e.id_produto
JOIN lojas l ON l.id = e.id_loja
WHERE p.descricao ILIKE '%BATERIA IPHONE FOXCONN BLACK 11 PRO MAX%'
ORDER BY l.nome;
