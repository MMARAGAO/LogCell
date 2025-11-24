-- CORRIGIR DUPLICAÇÃO DE REGISTROS NO HISTÓRICO
-- Desabilitar trigger genérica que registra todas as alterações de estoque

-- 1. Ver triggers atuais
SELECT 
    t.tgname as trigger_name,
    t.tgenabled as enabled,
    pg_get_triggerdef(t.oid) as definition
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
WHERE c.relname = 'estoque_lojas'
  AND NOT t.tgisinternal
  AND t.tgname NOT LIKE 'trigger_baixa_estoque%'
  AND t.tgname NOT LIKE 'trigger_notificar%'
ORDER BY t.tgname;

-- 2. Se existir uma trigger genérica de histórico (ex: trigger_historico_estoque),
--    desabilite ou modifique para não disparar em vendas:

-- Opção A: Desabilitar completamente (se existir)
-- ALTER TABLE estoque_lojas DISABLE TRIGGER trigger_historico_estoque;

-- Opção B: Modificar a função para ignorar vendas
-- Você precisará ver o código da função e adicionar:
-- IF TG_TABLE_NAME = 'estoque_lojas' AND NEW.atualizado_por IS NOT NULL THEN
--     -- Se tem usuario_id, é uma venda controlada, não registrar
--     RETURN NEW;
-- END IF;

SELECT 'Execute as queries acima conforme necessário' as instrucoes;
