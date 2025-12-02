-- Desabilitar a trigger que está causando registros duplicados
-- A trigger registra "ajuste" mesmo quando é uma venda
-- Vamos deixar apenas o código TypeScript registrar o histórico

ALTER TABLE estoque_lojas 
DISABLE TRIGGER trigger_registrar_ajuste_manual;

-- Verificar triggers ativas:
SELECT 
    trigger_name,
    event_object_table,
    action_timing,
    event_manipulation,
    tgenabled as status
FROM information_schema.triggers t
LEFT JOIN pg_trigger tg ON tg.tgname = t.trigger_name
WHERE event_object_table = 'estoque_lojas'
ORDER BY trigger_name;

-- Para reabilitar no futuro (se necessário):
-- ALTER TABLE estoque_lojas ENABLE TRIGGER trigger_registrar_ajuste_manual;
