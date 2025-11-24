-- =====================================================
-- LIMPEZA E CORREÇÃO COMPLETA DE TRIGGERS
-- =====================================================
-- Remove triggers antigos e recria corretamente

-- 1. Remover TODOS os triggers da tabela estoque_lojas
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT trigger_name 
        FROM information_schema.triggers 
        WHERE event_object_table = 'estoque_lojas' 
        AND event_object_schema = 'public'
    ) LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS %I ON public.estoque_lojas', r.trigger_name);
        RAISE NOTICE 'Trigger removido: %', r.trigger_name;
    END LOOP;
END $$;

-- 1.5. Corrigir função de histórico (se existir)
CREATE OR REPLACE FUNCTION public.registrar_historico_estoque()
RETURNS TRIGGER AS $$
DECLARE
    v_usuario_id UUID;
    v_produto_existe BOOLEAN;
BEGIN
    -- Determinar o usuário (usando atualizado_por correto)
    v_usuario_id := COALESCE(
        NEW.atualizado_por, 
        OLD.atualizado_por, 
        auth.uid()
    );

    -- Verificar se o produto ainda existe
    IF TG_OP = 'DELETE' THEN
        SELECT EXISTS(SELECT 1 FROM produtos WHERE id = OLD.id_produto) INTO v_produto_existe;
        
        IF NOT v_produto_existe THEN
            RETURN OLD;
        END IF;
        
        -- Registrar deleção (se tabela historico_estoque existir)
        BEGIN
            INSERT INTO historico_estoque (
                id_produto,
                id_loja,
                quantidade_anterior,
                quantidade_nova,
                quantidade_alterada,
                usuario_id,
                observacao
            ) VALUES (
                OLD.id_produto,
                OLD.id_loja,
                OLD.quantidade,
                0,
                -OLD.quantidade,
                v_usuario_id,
                'Estoque removido'
            );
        EXCEPTION
            WHEN undefined_table THEN
                -- Tabela não existe, ignorar
                NULL;
        END;
        
        RETURN OLD;
    END IF;

    -- INSERT: novo estoque
    IF TG_OP = 'INSERT' THEN
        BEGIN
            INSERT INTO historico_estoque (
                id_produto,
                id_loja,
                quantidade_anterior,
                quantidade_nova,
                quantidade_alterada,
                usuario_id,
                observacao
            ) VALUES (
                NEW.id_produto,
                NEW.id_loja,
                0,
                NEW.quantidade,
                NEW.quantidade,
                v_usuario_id,
                'Estoque criado'
            );
        EXCEPTION
            WHEN undefined_table THEN
                NULL;
        END;
        
        RETURN NEW;
    END IF;

    -- UPDATE: alteração de quantidade
    IF TG_OP = 'UPDATE' AND OLD.quantidade IS DISTINCT FROM NEW.quantidade THEN
        BEGIN
            INSERT INTO historico_estoque (
                id_produto,
                id_loja,
                quantidade_anterior,
                quantidade_nova,
                quantidade_alterada,
                usuario_id,
                observacao
            ) VALUES (
                NEW.id_produto,
                NEW.id_loja,
                OLD.quantidade,
                NEW.quantidade,
                NEW.quantidade - OLD.quantidade,
                v_usuario_id,
                'Quantidade alterada'
            );
        EXCEPTION
            WHEN undefined_table THEN
                NULL;
        END;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public';


-- 2. Recriar trigger de histórico
CREATE TRIGGER trigger_registrar_historico_estoque
    AFTER INSERT OR UPDATE OR DELETE
    ON public.estoque_lojas
    FOR EACH ROW
    EXECUTE FUNCTION public.registrar_historico_estoque();

-- 3. Recriar trigger de notificações
CREATE TRIGGER trigger_alerta_estoque
    AFTER INSERT OR UPDATE OF quantidade
    ON public.estoque_lojas
    FOR EACH ROW
    EXECUTE FUNCTION public.trigger_verificar_estoque();

-- 4. Criar trigger para atualizado_em
CREATE OR REPLACE FUNCTION public.atualizar_timestamp_estoque_lojas()
RETURNS TRIGGER AS $$
BEGIN
    NEW.atualizado_em = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_atualizar_timestamp_estoque_lojas
    BEFORE UPDATE ON public.estoque_lojas
    FOR EACH ROW
    EXECUTE FUNCTION public.atualizar_timestamp_estoque_lojas();

-- 5. Verificar triggers criados
SELECT 
    t.trigger_name,
    t.event_manipulation,
    t.action_timing
FROM information_schema.triggers t
WHERE t.event_object_table = 'estoque_lojas'
AND t.event_object_schema = 'public'
ORDER BY t.trigger_name;

-- Mensagem de sucesso
DO $$ 
BEGIN 
    RAISE NOTICE '✅ Triggers corrigidos com sucesso!'; 
    RAISE NOTICE '🔔 trigger_alerta_estoque - Notificações de estoque';
    RAISE NOTICE '⏰ trigger_atualizar_timestamp_estoque_lojas - Atualização de timestamp';
END $$;
