-- =====================================================
-- DIAGNÓSTICO: TABELAS RELACIONADAS A ORDEM DE SERVIÇO
-- =====================================================

-- 1. VERIFICAR TODAS AS TABELAS QUE TÊM RELAÇÃO COM ordem_servico
SELECT 
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    rc.update_rule,
    rc.delete_rule
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
JOIN information_schema.referential_constraints AS rc
    ON rc.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND (ccu.table_name = 'ordem_servico' OR tc.table_name = 'ordem_servico')
ORDER BY tc.table_name, kcu.column_name;

-- 2. VERIFICAR ESTRUTURA DO historico_ordem_servico
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'historico_ordem_servico'
ORDER BY ordinal_position;

-- 3. VERIFICAR TRIGGERS EXISTENTES EM TABELAS RELACIONADAS A OS
SELECT 
    t.tgname AS trigger_name,
    c.relname AS table_name,
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
    END AS trigger_event,
    t.tgenabled AS is_enabled
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE c.relname IN (
    'ordem_servico',
    'ordem_servico_pecas',
    'ordem_servico_fotos',
    'quebra_pecas',
    'historico_ordem_servico'
)
AND NOT t.tgisinternal
ORDER BY c.relname, t.tgname;

-- 4. VERIFICAR ÚLTIMOS REGISTROS DO HISTÓRICO
SELECT 
    h.*,
    os.numero_os
FROM historico_ordem_servico h
LEFT JOIN ordem_servico os ON os.id = h.id_ordem_servico
ORDER BY h.criado_em DESC
LIMIT 10;

-- 5. VERIFICAR TIPOS DE AÇÃO REGISTRADOS NO HISTÓRICO
-- (Ajustar nome da coluna conforme estrutura da tabela)
SELECT 
    tipo_acao,
    COUNT(*) as quantidade,
    MIN(criado_em) as primeira_ocorrencia,
    MAX(criado_em) as ultima_ocorrencia
FROM historico_ordem_servico
GROUP BY tipo_acao
ORDER BY quantidade DESC;

-- 6. LISTAR TABELAS QUE PODEM PRECISAR DE TRIGGERS
SELECT 
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as num_colunas
FROM information_schema.tables t
WHERE table_schema = 'public'
    AND table_type = 'BASE TABLE'
    AND (
        table_name LIKE '%ordem_servico%'
        OR table_name IN ('quebra_pecas')
    )
ORDER BY table_name;
