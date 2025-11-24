-- ============================================
-- LIMPEZA COMPLETA DO TRIGGER DE HISTÓRICO
-- ============================================
-- Execute este script para garantir que não há
-- funções ou triggers antigos conflitantes
-- ============================================

-- 1. Listar todas as funções relacionadas (para debug)
SELECT 
    proname as function_name,
    prosrc as function_source
FROM pg_proc 
WHERE proname LIKE '%historico_produto%';

-- 2. Listar todos os triggers na tabela produtos (para debug)
SELECT 
    trigger_name,
    event_manipulation,
    action_statement,
    action_timing
FROM information_schema.triggers
WHERE event_object_table = 'produtos';

-- 3. DROPAR TODOS os triggers relacionados a historico na tabela produtos
DROP TRIGGER IF EXISTS trigger_historico_produto ON public.produtos;
DROP TRIGGER IF EXISTS historico_produto_trigger ON public.produtos;
DROP TRIGGER IF EXISTS produtos_historico_trigger ON public.produtos;
DROP TRIGGER IF EXISTS audit_produtos_trigger ON public.produtos;

-- 4. DROPAR TODAS as funções relacionadas
DROP FUNCTION IF EXISTS registrar_historico_produto() CASCADE;
DROP FUNCTION IF EXISTS public.registrar_historico_produto() CASCADE;
DROP FUNCTION IF EXISTS historico_produto() CASCADE;
DROP FUNCTION IF EXISTS public.historico_produto() CASCADE;
DROP FUNCTION IF EXISTS audit_produtos() CASCADE;
DROP FUNCTION IF EXISTS public.audit_produtos() CASCADE;

-- 5. Recriar a função CORRETA (sem referência a 'operacao')
CREATE OR REPLACE FUNCTION public.registrar_historico_produto()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    v_usuario_id UUID;
BEGIN
    -- Determinar o usuário que fez a alteração
    v_usuario_id := COALESCE(NEW.atualizado_por, auth.uid());

    -- Verificar alteração em descrição
    IF OLD.descricao IS DISTINCT FROM NEW.descricao THEN
        INSERT INTO historico_produtos (produto_id, campo, valor_antigo, valor_novo, usuario_id)
        VALUES (NEW.id, 'descricao', OLD.descricao, NEW.descricao, v_usuario_id);
    END IF;

    -- Verificar alteração em grupo
    IF OLD.grupo IS DISTINCT FROM NEW.grupo THEN
        INSERT INTO historico_produtos (produto_id, campo, valor_antigo, valor_novo, usuario_id)
        VALUES (NEW.id, 'grupo', OLD.grupo, NEW.grupo, v_usuario_id);
    END IF;

    -- Verificar alteração em categoria
    IF OLD.categoria IS DISTINCT FROM NEW.categoria THEN
        INSERT INTO historico_produtos (produto_id, campo, valor_antigo, valor_novo, usuario_id)
        VALUES (NEW.id, 'categoria', OLD.categoria, NEW.categoria, v_usuario_id);
    END IF;

    -- Verificar alteração em código do fabricante
    IF OLD.codigo_fabricante IS DISTINCT FROM NEW.codigo_fabricante THEN
        INSERT INTO historico_produtos (produto_id, campo, valor_antigo, valor_novo, usuario_id)
        VALUES (NEW.id, 'codigo_fabricante', OLD.codigo_fabricante, NEW.codigo_fabricante, v_usuario_id);
    END IF;

    -- Verificar alteração em modelos
    IF OLD.modelos IS DISTINCT FROM NEW.modelos THEN
        INSERT INTO historico_produtos (produto_id, campo, valor_antigo, valor_novo, usuario_id)
        VALUES (NEW.id, 'modelos', OLD.modelos, NEW.modelos, v_usuario_id);
    END IF;

    -- Verificar alteração em marca
    IF OLD.marca IS DISTINCT FROM NEW.marca THEN
        INSERT INTO historico_produtos (produto_id, campo, valor_antigo, valor_novo, usuario_id)
        VALUES (NEW.id, 'marca', OLD.marca, NEW.marca, v_usuario_id);
    END IF;

    -- Verificar alteração em preço de compra
    IF OLD.preco_compra IS DISTINCT FROM NEW.preco_compra THEN
        INSERT INTO historico_produtos (produto_id, campo, valor_antigo, valor_novo, usuario_id)
        VALUES (NEW.id, 'preco_compra', OLD.preco_compra::TEXT, NEW.preco_compra::TEXT, v_usuario_id);
    END IF;

    -- Verificar alteração em preço de venda
    IF OLD.preco_venda IS DISTINCT FROM NEW.preco_venda THEN
        INSERT INTO historico_produtos (produto_id, campo, valor_antigo, valor_novo, usuario_id)
        VALUES (NEW.id, 'preco_venda', OLD.preco_venda::TEXT, NEW.preco_venda::TEXT, v_usuario_id);
    END IF;

    -- Verificar alteração em quantidade mínima
    IF OLD.quantidade_minima IS DISTINCT FROM NEW.quantidade_minima THEN
        INSERT INTO historico_produtos (produto_id, campo, valor_antigo, valor_novo, usuario_id)
        VALUES (NEW.id, 'quantidade_minima', OLD.quantidade_minima::TEXT, NEW.quantidade_minima::TEXT, v_usuario_id);
    END IF;

    -- Verificar alteração em ativo
    IF OLD.ativo IS DISTINCT FROM NEW.ativo THEN
        INSERT INTO historico_produtos (produto_id, campo, valor_antigo, valor_novo, usuario_id)
        VALUES (NEW.id, 'ativo', OLD.ativo::TEXT, NEW.ativo::TEXT, v_usuario_id);
    END IF;

    RETURN NEW;
END;
$$;

-- 6. Recriar o trigger
CREATE TRIGGER trigger_historico_produto
    AFTER UPDATE ON public.produtos
    FOR EACH ROW
    EXECUTE FUNCTION public.registrar_historico_produto();

-- 7. Verificar se ficou tudo certo
SELECT 
    'Triggers ativos:' as info,
    trigger_name,
    event_manipulation,
    action_timing
FROM information_schema.triggers
WHERE event_object_table = 'produtos';

-- 8. Verificar a estrutura da tabela historico_produtos
SELECT 
    'Estrutura da tabela:' as info,
    column_name, 
    data_type
FROM information_schema.columns 
WHERE table_name = 'historico_produtos'
ORDER BY ordinal_position;

-- 9. Teste rápido: tentar inserir um registro de teste
DO $$
DECLARE
    test_produto_id UUID;
BEGIN
    -- Pegar um produto existente para teste
    SELECT id INTO test_produto_id FROM produtos LIMIT 1;
    
    IF test_produto_id IS NOT NULL THEN
        -- Tentar inserir um registro de teste
        INSERT INTO historico_produtos (produto_id, campo, valor_antigo, valor_novo, usuario_id)
        VALUES (test_produto_id, 'teste', 'valor_antigo_teste', 'valor_novo_teste', auth.uid());
        
        -- Deletar o registro de teste
        DELETE FROM historico_produtos WHERE campo = 'teste';
        
        RAISE NOTICE 'Teste de inserção OK!';
    END IF;
END $$;
