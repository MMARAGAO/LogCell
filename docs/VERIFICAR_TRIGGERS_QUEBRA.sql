-- =====================================================
-- VERIFICAR TRIGGERS DE QUEBRA
-- =====================================================

-- 1. Verificar se os triggers de quebra existem
SELECT 
    t.tgname AS trigger_name,
    t.tgenabled AS is_enabled,
    p.proname AS function_name,
    CASE 
        WHEN t.tgtype & 2 = 2 THEN 'BEFORE'
        WHEN t.tgtype & 64 = 64 THEN 'INSTEAD OF'
        ELSE 'AFTER'
    END AS trigger_timing,
    CASE 
        WHEN t.tgtype & 4 = 4 THEN 'INSERT'
        WHEN t.tgtype & 8 = 8 THEN 'DELETE'
        WHEN t.tgtype & 16 = 16 THEN 'UPDATE'
        ELSE 'UNKNOWN'
    END AS trigger_event
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE c.relname = 'quebra_pecas'
    AND NOT t.tgisinternal
ORDER BY t.tgname;

-- 2. Verificar se as funções existem
SELECT 
    p.proname AS function_name,
    pg_get_functiondef(p.oid) AS function_definition
FROM pg_proc p
WHERE p.proname IN ('registrar_quebra_registrada', 'registrar_quebra_aprovada');

-- 3. Verificar últimas quebras registradas
SELECT 
    id,
    id_ordem_servico,
    id_produto,
    quantidade,
    tipo_ocorrencia,
    aprovado,
    aprovado_em,
    criado_em
FROM quebra_pecas
ORDER BY criado_em DESC
LIMIT 10;

-- 4. Verificar eventos de quebra no histórico
SELECT 
    h.id,
    h.tipo_evento,
    h.descricao,
    h.criado_em,
    h.criado_por_nome,
    os.numero_os
FROM historico_ordem_servico h
LEFT JOIN ordem_servico os ON os.id = h.id_ordem_servico
WHERE h.tipo_evento IN ('quebra_registrada', 'quebra_aprovada', 'quebra_reprovada')
ORDER BY h.criado_em DESC
LIMIT 10;
