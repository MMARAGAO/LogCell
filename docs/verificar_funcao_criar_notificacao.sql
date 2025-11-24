-- =====================================================
-- VERIFICAR LÓGICA DA FUNÇÃO DE NOTIFICAÇÕES
-- =====================================================

-- 1. Ver o código completo da função criar_notificacao_estoque
SELECT 
    proname,
    prosrc
FROM pg_proc
WHERE proname = 'criar_notificacao_estoque';

-- 2. Ver o código da função trigger_verificar_estoque
SELECT 
    proname,
    prosrc
FROM pg_proc
WHERE proname = 'trigger_verificar_estoque';

-- 3. Testar manualmente a detecção de estado
-- Simular: produto com quantidade_minima = 10
SELECT 
    CASE 
        WHEN 0 = 0 THEN 'zerado'
        WHEN 0 < 10 THEN 'baixo'
        ELSE 'normal'
    END as estado_para_quantidade_0,
    CASE 
        WHEN 1 = 0 THEN 'zerado'
        WHEN 1 < 10 THEN 'baixo'
        ELSE 'normal'
    END as estado_para_quantidade_1,
    CASE 
        WHEN 5 = 0 THEN 'zerado'
        WHEN 5 < 10 THEN 'baixo'
        ELSE 'normal'
    END as estado_para_quantidade_5,
    CASE 
        WHEN 10 = 0 THEN 'zerado'
        WHEN 10 < 10 THEN 'baixo'
        ELSE 'normal'
    END as estado_para_quantidade_10,
    CASE 
        WHEN 15 = 0 THEN 'zerado'
        WHEN 15 < 10 THEN 'baixo'
        ELSE 'normal'
    END as estado_para_quantidade_15;

-- 4. Ver estados registrados no controle
SELECT 
    aec.id,
    p.descricao as produto,
    l.nome as loja,
    aec.quantidade_atual,
    aec.quantidade_minima,
    aec.estado,
    aec.ultimo_alerta_em
FROM alertas_estoque_controle aec
JOIN produtos p ON aec.produto_id = p.id
JOIN lojas l ON aec.loja_id = l.id
ORDER BY aec.ultimo_alerta_em DESC;
