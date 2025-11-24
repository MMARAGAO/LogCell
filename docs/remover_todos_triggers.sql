-- =====================================================
-- REMOVER ABSOLUTAMENTE TODOS OS TRIGGERS DA TABELA USUARIOS
-- =====================================================

-- Listar e remover todos os triggers (exceto os internos do sistema)
DO $$ 
DECLARE 
    trigger_rec RECORD;
BEGIN
    FOR trigger_rec IN 
        SELECT t.tgname
        FROM pg_trigger t
        JOIN pg_class c ON t.tgrelid = c.oid
        WHERE c.relname = 'usuarios'
        AND t.tgisinternal = false
    LOOP
        EXECUTE format('DROP TRIGGER %I ON usuarios', trigger_rec.tgname);
        RAISE NOTICE 'Trigger removido: %', trigger_rec.tgname;
    END LOOP;
END $$;

-- Verificar se restou algum
SELECT 
    'Triggers restantes:' as info,
    tgname as trigger_name
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
WHERE c.relname = 'usuarios'
AND t.tgisinternal = false;
