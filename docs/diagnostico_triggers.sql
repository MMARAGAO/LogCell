-- =====================================================
-- DIAGNÓSTICO: Verificar triggers e funções existentes
-- =====================================================

-- 1. Ver TODOS os triggers na tabela usuarios
SELECT 
    trigger_name,
    event_manipulation,
    action_statement,
    action_timing
FROM information_schema.triggers 
WHERE event_object_table = 'usuarios';

-- 2. Ver TODAS as funções que contém 'historico_usuario'
SELECT 
    routine_name,
    routine_definition
FROM information_schema.routines 
WHERE routine_name LIKE '%historico%usuario%';

-- 3. Ver estrutura da tabela historico_usuarios (se existir)
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'historico_usuarios'
ORDER BY ordinal_position;

-- =====================================================
-- Execute essas queries para diagnosticar o problema
-- =====================================================
