-- TESTE: Adicionar estoque de volta para testar o sistema completo

-- 1. Adicionar 10 unidades do produto na loja ATACADO
UPDATE estoque_lojas
SET quantidade = 10,
    atualizado_em = NOW(),
    atualizado_por = '1c0d76a8-563c-47f4-8583-4a8fcb2a063f'
WHERE id_produto = 'e138eed1-e316-4d2a-990e-7f1ebdee06c7'
  AND id_loja = 16; -- ATACADO

-- 2. Registrar no histórico
INSERT INTO historico_estoque (
    id_produto,
    id_loja,
    usuario_id,
    quantidade_anterior,
    quantidade_nova,
    quantidade_alterada,
    tipo_movimentacao,
    observacao
) VALUES (
    'e138eed1-e316-4d2a-990e-7f1ebdee06c7',
    16, -- ATACADO
    '1c0d76a8-563c-47f4-8583-4a8fcb2a063f',
    0,
    10,
    10,
    'ajuste',
    'Reposição de estoque para testes'
);

-- 3. Verificar estoque em todas as lojas
SELECT 
    l.nome as loja,
    e.quantidade,
    p.descricao as produto
FROM estoque_lojas e
JOIN produtos p ON p.id = e.id_produto
JOIN lojas l ON l.id = e.id_loja
WHERE e.id_produto = 'e138eed1-e316-4d2a-990e-7f1ebdee06c7'
ORDER BY l.nome;
