-- =====================================================
-- VERIFICAR FUNÇÃO criar_notificacao_estoque
-- =====================================================

-- 1. Verificar se a função existe e ver sua assinatura
SELECT 
    p.proname as function_name,
    pg_get_function_identity_arguments(p.oid) as arguments,
    pg_get_functiondef(p.oid) as full_definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND p.proname = 'criar_notificacao_estoque';

-- 2. Se não encontrou nada acima, listar todas as funções relacionadas a notificação
SELECT 
    p.proname as function_name,
    pg_get_function_identity_arguments(p.oid) as arguments
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND p.proname LIKE '%notifica%'
ORDER BY p.proname;
