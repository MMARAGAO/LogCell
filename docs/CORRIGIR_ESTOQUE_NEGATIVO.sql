-- CORREÇÃO: Ajustar estoque do produto que ficou negativo na loja ATACADO

-- 1. Verificar o estoque atual
SELECT 
    e.id,
    e.id_produto,
    e.id_loja,
    e.quantidade,
    p.descricao,
    l.nome as loja
FROM estoque_lojas e
JOIN produtos p ON p.id = e.id_produto
JOIN lojas l ON l.id = e.id_loja
WHERE e.id_produto = 'e138eed1-e316-4d2a-990e-7f1ebdee06c7'
  AND e.id_loja = 16; -- ATACADO

-- 2. Corrigir o estoque (ajustar de -2 para 0)
UPDATE estoque_lojas
SET quantidade = 0,
    atualizado_em = NOW()
WHERE id_produto = 'e138eed1-e316-4d2a-990e-7f1ebdee06c7'
  AND id_loja = 16 -- ATACADO
  AND quantidade = -2;

-- 3. Registrar ajuste no histórico
INSERT INTO historico_estoque (
    id_produto,
    id_loja,
    quantidade_anterior,
    quantidade_nova,
    quantidade_alterada,
    tipo_movimentacao,
    observacao
) VALUES (
    'e138eed1-e316-4d2a-990e-7f1ebdee06c7',
    16, -- ATACADO
    -2,
    0,
    2,
    'ajuste',
    'Correção de estoque negativo causado por trigger que dava baixa 2x (ao adicionar item + ao finalizar venda)'
);

-- 4. Verificar se ficou correto
SELECT 
    e.quantidade,
    p.descricao,
    l.nome as loja
FROM estoque_lojas e
JOIN produtos p ON p.id = e.id_produto
JOIN lojas l ON l.id = e.id_loja
WHERE e.id_produto = 'e138eed1-e316-4d2a-990e-7f1ebdee06c7'
ORDER BY l.nome;
