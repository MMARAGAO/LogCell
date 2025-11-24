-- =====================================================
-- TESTAR TRIGGER DE INSERT MANUALMENTE
-- =====================================================

-- 1. Inserir um usuário de teste para ver se o trigger funciona
-- (ATENÇÃO: Este usuário precisa ter um ID válido do auth.users)

-- Primeiro, veja se há algum erro no trigger
SELECT 
    p.proname as function_name,
    pg_get_functiondef(p.oid) as definition
FROM pg_proc p
WHERE p.proname = 'fn_registrar_mudancas_usuario';

-- Verificar se o trigger está ativo
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'usuarios'
AND trigger_name = 'trg_auditoria_usuarios';

-- =====================================================
-- Se quiser testar o trigger isoladamente:
-- =====================================================

-- Desabilitar o trigger temporariamente para cadastrar usuário
-- ALTER TABLE usuarios DISABLE TRIGGER trg_auditoria_usuarios;

-- Depois de cadastrar, reabilitar:
-- ALTER TABLE usuarios ENABLE TRIGGER trg_auditoria_usuarios;
