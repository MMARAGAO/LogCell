-- CORREÇÃO DEFINITIVA: Fix do trigger da tabela produtos
-- Problema: Função update_updated_at_column() usa "updated_at" 
-- mas a tabela produtos usa "atualizado_em"

-- 1. Remover TODOS os triggers problemáticos da tabela produtos
DROP TRIGGER IF EXISTS update_produtos_updated_at ON public.produtos;
DROP TRIGGER IF EXISTS update_produtos_timestamp_trigger ON public.produtos;
DROP TRIGGER IF EXISTS set_updated_at ON public.produtos;
DROP TRIGGER IF EXISTS trigger_atualizar_produtos ON public.produtos;

-- 2. Criar função ESPECÍFICA para produtos (usa atualizado_em)
CREATE OR REPLACE FUNCTION public.atualizar_timestamp_produtos()
RETURNS TRIGGER AS $$
BEGIN
    -- A tabela produtos usa atualizado_em (não updated_at)
    NEW.atualizado_em = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Criar trigger CORRETO para a tabela produtos
CREATE TRIGGER trigger_atualizar_produtos
    BEFORE UPDATE ON public.produtos
    FOR EACH ROW
    EXECUTE FUNCTION public.atualizar_timestamp_produtos();

-- 4. Verificar resultado
SELECT 
    t.trigger_name,
    t.event_manipulation,
    t.action_statement,
    t.action_timing
FROM information_schema.triggers t
WHERE t.event_object_table = 'produtos'
AND t.event_object_schema = 'public';

-- Mensagem de sucesso
DO $$ 
BEGIN 
    RAISE NOTICE '✅ Trigger da tabela produtos corrigido com sucesso!'; 
END $$;
