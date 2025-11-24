-- Verificar triggers de notificação no estoque_lojas
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE event_object_table = 'estoque_lojas'
ORDER BY trigger_name;

-- Ver funções relacionadas a notificações de estoque
SELECT 
    proname as function_name,
    prosrc as source_code
FROM pg_proc
WHERE proname LIKE '%notifica%estoque%' 
   OR proname LIKE '%estoque%notifica%'
   OR proname LIKE '%verificar_estoque%';
