-- Verificar se o último ajuste manual foi registrado no histórico
SELECT 
    e.id,
    e.id_produto,
    p.descricao as produto_nome,
    e.id_loja,
    e.quantidade,
    e.atualizado_por,
    e.atualizado_em,
    CASE 
        WHEN e.atualizado_por IS NULL THEN '❌ Campo atualizado_por está NULL'
        ELSE '✅ Campo atualizado_por está preenchido'
    END as diagnostico
FROM estoque_lojas e
JOIN produtos p ON p.id = e.id_produto
ORDER BY e.atualizado_em DESC
LIMIT 5;

-- Ver se existe registro correspondente no histórico
SELECT 
    h.id,
    h.id_produto,
    p.descricao as produto_nome,
    h.id_loja,
    h.quantidade_anterior,
    h.quantidade_nova,
    h.tipo_movimentacao,
    h.usuario_id,
    h.criado_em,
    h.observacao
FROM historico_estoque h
JOIN produtos p ON p.id = h.id_produto
ORDER BY h.criado_em DESC
LIMIT 5;
