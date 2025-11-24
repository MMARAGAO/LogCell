-- Verificar se a trigger de alerta está funcionando
-- Testar manualmente uma atualização

-- 1. Ver estoque atual
SELECT 
    el.id_produto,
    el.id_loja,
    el.quantidade,
    p.descricao,
    l.nome as loja,
    p.quantidade_minima
FROM estoque_lojas el
JOIN produtos p ON p.id = el.id_produto
JOIN lojas l ON l.id = el.id_loja
WHERE p.descricao LIKE '%Bateria iphone 17%'
ORDER BY l.nome;

-- 2. Ver estado na tabela de controle de alertas
SELECT 
    aec.estado,
    aec.quantidade_atual,
    aec.quantidade_minima,
    l.nome as loja,
    p.descricao as produto,
    TO_CHAR(aec.ultimo_alerta_em, 'DD/MM/YYYY HH24:MI:SS') as ultimo_alerta
FROM alertas_estoque_controle aec
JOIN produtos p ON p.id = aec.produto_id
JOIN lojas l ON l.id = aec.loja_id
WHERE p.descricao LIKE '%Bateria iphone 17%'
ORDER BY l.nome;

-- 3. Ver últimas notificações
SELECT 
    n.tipo,
    n.titulo,
    n.mensagem,
    TO_CHAR(n.criado_em, 'DD/MM/YYYY HH24:MI:SS') as data_formatada
FROM notificacoes n
WHERE n.produto_id = 'e138eed1-e316-4d2a-990e-7f1ebdee06c7'
ORDER BY n.criado_em DESC
LIMIT 10;

-- 2. Forçar notificação (simular venda zerando estoque)
-- Descomente as linhas abaixo para testar:

/*
UPDATE estoque_lojas
SET quantidade = 0,
    atualizado_em = NOW(),
    atualizado_por = NULL  -- NULL para trigger genérica não ignorar
WHERE id_produto = 'e138eed1-e316-4d2a-990e-7f1ebdee06c7'
  AND id_loja = 15; -- LOJA FEIRA (que tem 1 unidade)

-- 3. Ver notificações criadas
SELECT 
    n.*,
    TO_CHAR(n.criado_em, 'DD/MM/YYYY HH24:MI:SS') as data_formatada
FROM notificacoes n
WHERE n.produto_id = 'e138eed1-e316-4d2a-990e-7f1ebdee06c7'
ORDER BY n.criado_em DESC
LIMIT 5;
*/
