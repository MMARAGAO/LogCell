-- =====================================================
-- DIAGNÓSTICO COMPLETO DO TRIGGER DE NOTIFICAÇÕES
-- =====================================================

-- 1. Verificar se o trigger existe e está ativo
SELECT 
    tgname AS trigger_name,
    tgenabled AS enabled,
    tgtype,
    proname AS function_name
FROM pg_trigger t
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE tgname = 'trigger_alerta_estoque';

-- 2. Listar TODOS os triggers na tabela estoque_lojas
SELECT 
    t.tgname AS trigger_name,
    t.tgenabled AS enabled,
    p.proname AS function_name,
    pg_get_triggerdef(t.oid) AS trigger_definition
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE c.relname = 'estoque_lojas'
AND t.tgisinternal = false
ORDER BY t.tgname;

-- 3. Verificar se a função trigger_verificar_estoque existe
SELECT 
    proname,
    prosrc
FROM pg_proc
WHERE proname = 'trigger_verificar_estoque';

-- 4. Verificar se a função criar_notificacao_estoque existe
SELECT 
    proname,
    prosrc
FROM pg_proc
WHERE proname = 'criar_notificacao_estoque';

-- 5. Teste manual: Buscar um produto com estoque baixo
SELECT 
    el.id,
    el.id_produto,
    el.id_loja,
    p.descricao as produto,
    l.nome as loja,
    el.quantidade,
    p.quantidade_minima,
    CASE 
        WHEN el.quantidade = 0 THEN 'zerado'
        WHEN el.quantidade < p.quantidade_minima THEN 'baixo'
        ELSE 'normal'
    END as estado_atual
FROM estoque_lojas el
JOIN produtos p ON el.id_produto = p.id
JOIN lojas l ON el.id_loja = l.id
WHERE p.quantidade_minima > 0
ORDER BY el.quantidade ASC
LIMIT 5;

-- 6. Verificar estado atual no alertas_estoque_controle
SELECT 
    aec.*,
    p.descricao as produto,
    l.nome as loja
FROM alertas_estoque_controle aec
JOIN produtos p ON aec.produto_id = p.id
JOIN lojas l ON aec.loja_id = l.id
ORDER BY aec.ultimo_alerta_em DESC;

-- 7. Verificar últimas notificações criadas
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
LIMIT 10;

-- 8. TESTE MANUAL: Forçar UPDATE em um produto com estoque baixo
-- (Descomente e execute uma linha de cada vez)

/*
-- Passo 1: Escolha um id_produto e id_loja da consulta #5
-- Passo 2: Force um UPDATE (mesmo que o valor seja o mesmo)
UPDATE estoque_lojas 
SET quantidade = quantidade 
WHERE id_produto = 'd8096ee5-6339-4359-ae98-487c84ca65ec' -- SUBSTITUA pelo ID real
AND id_loja = 1; -- SUBSTITUA pelo ID real (INTEGER)

-- Passo 3: Verifique se notificação foi criada
SELECT * FROM notificacoes ORDER BY criado_em DESC LIMIT 5;

-- Passo 4: Verifique se o estado foi registrado
SELECT * FROM alertas_estoque_controle 
WHERE produto_id = 'd8096ee5-6339-4359-ae98-487c84ca65ec'
AND loja_id = 1; -- INTEGER
*/
