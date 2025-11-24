-- ============================================
-- VERIFICAR E AJUSTAR TRIGGERS DE DELETE
-- ============================================

-- 1. Ver se há trigger AFTER DELETE no historico_estoque
SELECT 
    trigger_name,
    event_object_table,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers
WHERE event_object_table = 'estoque_lojas'
OR event_object_table = 'produtos'
ORDER BY event_object_table, action_timing, event_manipulation;

-- 2. SOLUÇÃO: Garantir que CASCADE está funcionando
-- Verificar as constraints atuais
SELECT
    tc.table_name,
    tc.constraint_name,
    kcu.column_name,
    rc.delete_rule,
    rc.update_rule
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.referential_constraints AS rc
    ON rc.constraint_name = tc.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
AND ccu.table_name = 'produtos'
ORDER BY tc.table_name;

-- 3. Se o problema persistir, remover triggers problemáticos
-- Lista todos os triggers em estoque_lojas
SELECT 
    t.tgname as trigger_name,
    pg_get_triggerdef(t.oid) as definition
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
WHERE c.relname = 'estoque_lojas'
AND NOT t.tgisinternal;
