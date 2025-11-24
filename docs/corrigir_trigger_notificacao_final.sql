-- =====================================================
-- CORREÇÃO FINAL: Trigger de Notificações
-- =====================================================
-- PROBLEMA: Trigger com "UPDATE OF quantidade" só dispara se a quantidade MUDAR
-- SOLUÇÃO: Remover "OF quantidade" e verificar mudança dentro da função

-- 1. Dropar trigger existente
DROP TRIGGER IF EXISTS trigger_alerta_estoque ON public.estoque_lojas;

-- 2. Recriar trigger SEM "OF quantidade"
CREATE TRIGGER trigger_alerta_estoque
    AFTER INSERT OR UPDATE
    ON public.estoque_lojas
    FOR EACH ROW
    EXECUTE FUNCTION trigger_verificar_estoque();

-- 3. Verificar se foi criado corretamente
SELECT 
    t.tgname AS trigger_name,
    t.tgenabled AS enabled,
    pg_get_triggerdef(t.oid) AS trigger_definition
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
WHERE c.relname = 'estoque_lojas'
AND t.tgname = 'trigger_alerta_estoque';

-- Mensagem de sucesso
DO $$ 
BEGIN 
    RAISE NOTICE '✅ Trigger corrigido!'; 
    RAISE NOTICE '📢 Agora vai disparar em QUALQUER UPDATE na tabela estoque_lojas'; 
    RAISE NOTICE '🔍 A função trigger_verificar_estoque() vai verificar se a quantidade mudou'; 
END $$;
