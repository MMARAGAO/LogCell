-- Script para verificar a estrutura da tabela historico_estoque
-- Data: 25/11/2025

-- 1. Ver estrutura da tabela
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'historico_estoque'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Ver triggers ativos na tabela estoque_lojas
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers
WHERE event_object_table = 'estoque_lojas'
AND event_object_schema = 'public';

-- 3. Ver último registro de cada tipo de movimentação
SELECT DISTINCT ON (tipo_movimentacao)
    tipo_movimentacao,
    quantidade,
    quantidade_anterior,
    quantidade_nova,
    quantidade_alterada,
    criado_em
FROM historico_estoque
ORDER BY tipo_movimentacao, criado_em DESC;
