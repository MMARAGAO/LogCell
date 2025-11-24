-- =====================================================
-- DIAGNÓSTICO: Por que trigger não dispara pelo sistema?
-- =====================================================

-- 1. Ver a definição EXATA do trigger
SELECT 
    t.tgname AS trigger_name,
    t.tgenabled AS enabled,
    pg_get_triggerdef(t.oid) AS trigger_definition
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
WHERE c.relname = 'estoque_lojas'
AND t.tgname = 'trigger_alerta_estoque';

-- 2. Ver a estrutura da tabela estoque_lojas
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'estoque_lojas'
ORDER BY ordinal_position;

-- 3. Verificar se o trigger está configurado para UPDATE OF quantidade
-- O trigger DEVE estar assim:
-- CREATE TRIGGER trigger_alerta_estoque 
-- AFTER INSERT OR UPDATE OF quantidade 
-- ON estoque_lojas 
-- FOR EACH ROW 
-- EXECUTE FUNCTION trigger_verificar_estoque();

-- 4. Simular UPDATE que o sistema faz (provavelmente atualiza mais colunas)
-- Teste 1: UPDATE apenas quantidade (como você faz no SQL)
/*
UPDATE estoque_lojas 
SET quantidade = 1 
WHERE id_produto = 'SEU_ID'
AND id_loja = 1;
*/

-- Teste 2: UPDATE quantidade + atualizado_por + atualizado_em (como o sistema faz)
/*
UPDATE estoque_lojas 
SET 
    quantidade = 1,
    atualizado_por = '1c0d76a8-563c-47f4-8583-4a8fcb2a063f',
    atualizado_em = NOW()
WHERE id_produto = 'SEU_ID'
AND id_loja = 1;
*/
