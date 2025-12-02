-- 1. Verificar se a trigger existe e está ativa
SELECT 
    t.trigger_name,
    t.event_object_table,
    t.action_timing,
    t.event_manipulation,
    t.action_statement,
    t.action_orientation,
    tg.tgenabled
FROM information_schema.triggers t
LEFT JOIN pg_trigger tg ON tg.tgname = t.trigger_name
WHERE t.event_object_table = 'estoque_lojas'
  AND t.trigger_schema = 'public'
ORDER BY t.trigger_name;

-- 2. Ver o código da função que registra no histórico
SELECT 
    p.proname as function_name,
    pg_get_functiondef(p.oid) as function_code
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
  AND p.proname ILIKE '%historico%estoque%'
ORDER BY p.proname;

-- 3. Verificar últimas alterações no estoque
SELECT 
    id,
    id_produto,
    id_loja,
    quantidade,
    atualizado_em
FROM estoque_lojas
ORDER BY atualizado_em DESC
LIMIT 10;

-- 4. Verificar últimos registros no histórico de estoque
SELECT 
    id,
    id_produto,
    id_loja,
    quantidade_anterior,
    quantidade_nova,
    tipo_movimentacao,
    criado_em
FROM historico_estoque
ORDER BY criado_em DESC
LIMIT 10;
