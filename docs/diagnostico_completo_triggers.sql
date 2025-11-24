-- =====================================================
-- DIAGNÓSTICO COMPLETO DE TRIGGERS E NOTIFICAÇÕES
-- =====================================================

-- 1. Verificar triggers ativos em estoque_lojas
SELECT 
    t.trigger_name,
    t.event_manipulation,
    t.action_timing,
    t.action_statement
FROM information_schema.triggers t
WHERE t.event_object_table = 'estoque_lojas'
AND t.event_object_schema = 'public'
ORDER BY t.trigger_name;

-- 2. Verificar se a função trigger_verificar_estoque existe
SELECT 
    p.proname as function_name,
    CASE p.provolatile
        WHEN 'i' THEN 'IMMUTABLE'
        WHEN 's' THEN 'STABLE'
        WHEN 'v' THEN 'VOLATILE'
    END as volatility,
    CASE p.prosecdef
        WHEN true THEN 'SECURITY DEFINER'
        ELSE 'SECURITY INVOKER'
    END as security
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE p.proname IN ('trigger_verificar_estoque', 'criar_notificacao_estoque')
AND n.nspname = 'public';

-- 3. Testar trigger manualmente em um UPDATE
-- IMPORTANTE: Anote o produto_id e loja_id antes de executar
DO $$
DECLARE
    v_produto_id UUID;
    v_loja_id INTEGER;
    v_qtd_antes INTEGER;
    v_qtd_minima INTEGER;
BEGIN
    -- Buscar um produto com estoque > 0 e quantidade_minima configurada
    SELECT 
        el.id_produto,
        el.id_loja,
        el.quantidade,
        p.quantidade_minima
    INTO v_produto_id, v_loja_id, v_qtd_antes, v_qtd_minima
    FROM estoque_lojas el
    JOIN produtos p ON el.id_produto = p.id
    WHERE p.quantidade_minima > 0
    AND el.quantidade > 0
    LIMIT 1;
    
    IF v_produto_id IS NOT NULL THEN
        RAISE NOTICE '==========================================';
        RAISE NOTICE '🔍 Produto ID: %', v_produto_id;
        RAISE NOTICE '🏪 Loja ID: %', v_loja_id;
        RAISE NOTICE '📦 Quantidade atual: %', v_qtd_antes;
        RAISE NOTICE '⚠️ Quantidade mínima: %', v_qtd_minima;
        RAISE NOTICE '==========================================';
        RAISE NOTICE '';
        RAISE NOTICE '🚀 Forçando UPDATE para disparar trigger...';
        
        -- Fazer um UPDATE para disparar o trigger
        -- Reduzir para 0 para garantir que vai gerar notificação
        UPDATE estoque_lojas
        SET quantidade = 0
        WHERE id_produto = v_produto_id
        AND id_loja = v_loja_id;
        
        RAISE NOTICE '✅ UPDATE executado! Trigger deveria ter disparado.';
        RAISE NOTICE '';
        RAISE NOTICE '📊 Verificando resultado...';
        
        -- Aguardar um momento
        PERFORM pg_sleep(1);
        
    ELSE
        RAISE NOTICE '❌ Nenhum produto adequado encontrado para teste';
    END IF;
END $$;

-- 4. Verificar se notificações foram criadas
SELECT 
    COUNT(*) as total_notificacoes,
    MAX(criado_em) as ultima_notificacao
FROM notificacoes;

-- 5. Ver últimas notificações criadas
SELECT 
    id,
    tipo,
    titulo,
    LEFT(mensagem, 50) as mensagem_resumo,
    produto_id,
    loja_id,
    criado_em
FROM notificacoes
ORDER BY criado_em DESC
LIMIT 5;

-- 6. Verificar alertas_estoque_controle
SELECT 
    p.descricao as produto,
    l.nome as loja,
    aec.estado,
    aec.quantidade_atual,
    aec.quantidade_minima,
    aec.ultimo_alerta_em,
    aec.atualizado_em
FROM alertas_estoque_controle aec
JOIN produtos p ON aec.produto_id = p.id
JOIN lojas l ON aec.loja_id = l.id
ORDER BY aec.atualizado_em DESC
LIMIT 5;

-- 7. Verificar logs de erro (se houver WARNING)
-- Infelizmente não conseguimos ver os WARNINGS antigos,
-- mas eles aparecem no momento da execução
