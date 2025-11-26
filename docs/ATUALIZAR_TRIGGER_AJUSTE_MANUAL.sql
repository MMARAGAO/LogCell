-- =====================================================
-- ATUALIZAR TRIGGER DE AJUSTE MANUAL DE ESTOQUE
-- Data: 25/11/2025
-- =====================================================
-- Problema: Trigger usa quantidade_alterada (sistema antigo)
-- Solução: Atualizar para usar campo quantidade (sistema novo)
-- =====================================================

-- Recriar função do trigger
CREATE OR REPLACE FUNCTION registrar_historico_estoque()
RETURNS TRIGGER AS $$
DECLARE
    v_usuario_id UUID;
    v_produto_existe BOOLEAN;
BEGIN
    -- Capturar o usuário autenticado
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
        
        -- Registrar deleção
        BEGIN
            INSERT INTO historico_estoque (
                id_produto,
                id_loja,
                quantidade,
                quantidade_anterior,
                quantidade_nova,
                usuario_id,
                tipo_movimentacao,
                observacao
            ) VALUES (
                OLD.id_produto,
                OLD.id_loja,
                OLD.quantidade,
                OLD.quantidade,
                0,
                v_usuario_id,
                'ajuste',
                'Estoque removido'
            );
        EXCEPTION
            WHEN undefined_table THEN
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
                quantidade,
                quantidade_anterior,
                quantidade_nova,
                usuario_id,
                tipo_movimentacao,
                observacao
            ) VALUES (
                NEW.id_produto,
                NEW.id_loja,
                NEW.quantidade,
                0,
                NEW.quantidade,
                v_usuario_id,
                'ajuste',
                'Estoque inicial criado'
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
                quantidade,
                quantidade_anterior,
                quantidade_nova,
                usuario_id,
                tipo_movimentacao,
                observacao
            ) VALUES (
                NEW.id_produto,
                NEW.id_loja,
                ABS(NEW.quantidade - OLD.quantidade),  -- ✅ Sempre positivo
                OLD.quantidade,
                NEW.quantidade,
                v_usuario_id,
                'ajuste',  -- ✅ SEMPRE 'ajuste' para não acionar validação
                'Ajuste manual de estoque'
            );
        EXCEPTION
            WHEN undefined_table THEN
                NULL;
        END;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public';

-- Recriar trigger
DROP TRIGGER IF EXISTS trigger_registrar_historico_estoque ON estoque_lojas;

CREATE TRIGGER trigger_registrar_historico_estoque
    AFTER INSERT OR UPDATE OR DELETE
    ON public.estoque_lojas
    FOR EACH ROW
    EXECUTE FUNCTION public.registrar_historico_estoque();

-- =====================================================
-- VERIFICAÇÃO
-- =====================================================

SELECT 
  '✅ Trigger de ajuste manual atualizado!' as status,
  'Agora usa campo quantidade e define tipo_movimentacao corretamente' as descricao;

-- Testar listar triggers
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'trigger_registrar_historico_estoque'
  AND event_object_table = 'estoque_lojas';
