-- =====================================================
-- TESTE MANUAL: Forçar criação de notificação
-- =====================================================

-- 1. Buscar um produto com estoque baixo para testar
SELECT 
    el.id,
    el.id_produto,
    el.id_loja,
    p.descricao as produto,
    l.nome as loja,
    el.quantidade,
    p.quantidade_minima
FROM estoque_lojas el
JOIN produtos p ON el.id_produto = p.id
JOIN lojas l ON el.id_loja = l.id
WHERE p.quantidade_minima > 0
AND el.quantidade > 0
ORDER BY el.quantidade ASC
LIMIT 5;

-- 2. Atualizar quantidade para forçar notificação
-- IMPORTANTE: Abra o sistema no navegador ANTES de executar este UPDATE
-- para ver a notificação aparecer em tempo real!

-- Exemplo: Reduzir quantidade de 10 para 2 (abaixo do mínimo)
/*
UPDATE estoque_lojas 
SET quantidade = 2 
WHERE id_produto = 'SEU_ID_PRODUTO_AQUI' 
AND id_loja = 1;
*/

-- 3. Verificar se notificação foi criada
SELECT 
    n.id,
    n.tipo,
    n.titulo,
    n.mensagem,
    n.criado_em,
    p.descricao as produto,
    l.nome as loja
FROM notificacoes n
LEFT JOIN produtos p ON n.produto_id = p.id
LEFT JOIN lojas l ON n.loja_id = l.id
ORDER BY n.criado_em DESC
LIMIT 5;

-- 4. Verificar quantos usuários receberam a notificação
SELECT 
    nu.id,
    nu.notificacao_id,
    u.nome as usuario,
    nu.lida,
    nu.lida_em,
    nu.criado_em
FROM notificacoes_usuarios nu
JOIN usuarios u ON nu.usuario_id = u.id
ORDER BY nu.criado_em DESC
LIMIT 10;

-- 5. Zerar estoque para testar notificação de "estoque_zerado"
/*
UPDATE estoque_lojas 
SET quantidade = 0 
WHERE id_produto = 'SEU_ID_PRODUTO_AQUI' 
AND id_loja = 1;
*/

-- 6. Repor estoque para testar notificação de "estoque_reposto"
/*
UPDATE estoque_lojas 
SET quantidade = 20 
WHERE id_produto = 'SEU_ID_PRODUTO_AQUI' 
AND id_loja = 1;
*/
