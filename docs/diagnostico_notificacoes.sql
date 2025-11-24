-- =====================================================
-- DIAGNÓSTICO DO SISTEMA DE NOTIFICAÇÕES
-- =====================================================

-- 1. Verificar se as tabelas existem
SELECT 
    'notificacoes' as tabela,
    EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'notificacoes') as existe
UNION ALL
SELECT 
    'notificacoes_usuarios',
    EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'notificacoes_usuarios')
UNION ALL
SELECT 
    'alertas_estoque_controle',
    EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'alertas_estoque_controle');

-- 2. Verificar se as funções existem
SELECT 
    p.proname as funcao,
    pg_get_functiondef(p.oid) as existe
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE p.proname IN ('criar_notificacao_estoque', 'trigger_verificar_estoque')
AND n.nspname = 'public';

-- 3. Verificar triggers ativos em estoque_lojas
SELECT 
    t.trigger_name,
    t.event_manipulation,
    t.action_timing
FROM information_schema.triggers t
WHERE t.event_object_table = 'estoque_lojas'
AND t.event_object_schema = 'public'
ORDER BY t.trigger_name;

-- 4. Verificar produtos com quantidade_minima configurada
SELECT 
    COUNT(*) as total_produtos,
    COUNT(CASE WHEN quantidade_minima > 0 THEN 1 END) as com_minima_configurada,
    COUNT(CASE WHEN quantidade_minima IS NULL OR quantidade_minima = 0 THEN 1 END) as sem_minima
FROM produtos;

-- 5. Verificar estoques baixos (que deveriam gerar notificação)
SELECT 
    p.descricao as produto,
    l.nome as loja,
    el.quantidade as qtd_atual,
    p.quantidade_minima as qtd_minima,
    CASE 
        WHEN el.quantidade = 0 THEN '🔴 ZERADO'
        WHEN el.quantidade <= p.quantidade_minima THEN '🟡 BAIXO'
        ELSE '🟢 NORMAL'
    END as status
FROM estoque_lojas el
JOIN produtos p ON el.id_produto = p.id
JOIN lojas l ON el.id_loja = l.id
WHERE p.quantidade_minima > 0
AND el.quantidade <= p.quantidade_minima
ORDER BY el.quantidade ASC;

-- 6. Verificar se há notificações criadas
SELECT 
    COUNT(*) as total_notificacoes,
    COUNT(CASE WHEN tipo = 'estoque_baixo' THEN 1 END) as estoque_baixo,
    COUNT(CASE WHEN tipo = 'estoque_zerado' THEN 1 END) as estoque_zerado,
    COUNT(CASE WHEN tipo = 'estoque_reposto' THEN 1 END) as estoque_reposto
FROM notificacoes;

-- 7. Verificar últimas notificações (se existirem)
SELECT 
    n.id,
    n.tipo,
    n.titulo,
    n.mensagem,
    n.criado_em,
    COUNT(nu.id) as usuarios_notificados,
    COUNT(CASE WHEN nu.lida THEN 1 END) as usuarios_leram
FROM notificacoes n
LEFT JOIN notificacoes_usuarios nu ON n.id = nu.notificacao_id
GROUP BY n.id, n.tipo, n.titulo, n.mensagem, n.criado_em
ORDER BY n.criado_em DESC
LIMIT 10;

-- 8. Verificar controle de alertas (estado atual dos estoques)
SELECT 
    p.descricao as produto,
    l.nome as loja,
    aec.estado,
    aec.quantidade_atual,
    aec.quantidade_minima,
    aec.ultimo_alerta_em
FROM alertas_estoque_controle aec
JOIN produtos p ON aec.produto_id = p.id
JOIN lojas l ON aec.loja_id = l.id
ORDER BY aec.ultimo_alerta_em DESC;

-- 9. Verificar RLS policies nas tabelas
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE tablename IN ('notificacoes', 'notificacoes_usuarios', 'alertas_estoque_controle')
ORDER BY tablename, policyname;
