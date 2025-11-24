-- CORRIGIR FUNÇÃO PARA NÃO DUPLICAR REGISTRO DE VENDAS
-- A função registrar_historico_estoque deve IGNORAR quando é uma venda
-- (pois a trigger de venda já registra com informações completas)

CREATE OR REPLACE FUNCTION registrar_historico_estoque()
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

    -- ⚠️ IMPORTANTE: Ignorar UPDATE se atualizado_por está preenchido
    -- Isso significa que foi uma operação controlada (venda) e já foi registrada
    IF TG_OP = 'UPDATE' AND NEW.atualizado_por IS NOT NULL THEN
        -- É uma venda, não registrar duplicado
        RETURN NEW;
    END IF;

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

    -- UPDATE: alteração de quantidade (apenas se não for venda)
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
$$ LANGUAGE plpgsql;

-- Verificar
SELECT 'Função atualizada! Agora não vai duplicar registros de vendas.' as status;
