-- Melhorar a trigger para evitar duplicação com vendas
CREATE OR REPLACE FUNCTION public.registrar_historico_ajuste_manual()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    v_usuario_id UUID;
BEGIN
    -- Capturar o usuário autenticado
    v_usuario_id := COALESCE(
        NEW.atualizado_por, 
        OLD.atualizado_por, 
        auth.uid()
    );

    -- Apenas para UPDATE de quantidade via ajuste manual
    IF TG_OP = 'UPDATE' 
       AND OLD.quantidade IS DISTINCT FROM NEW.quantidade 
       AND NEW.atualizado_por IS NOT NULL THEN
        
        -- Verificar se código já registrou manualmente (qualquer tipo de movimentação)
        IF NOT EXISTS(
            SELECT 1 
            FROM historico_estoque 
            WHERE id_produto = NEW.id_produto 
              AND id_loja = NEW.id_loja
              AND quantidade_nova = NEW.quantidade
              AND criado_em > NOW() - INTERVAL '2 seconds'  -- Aumentei para 2 segundos
        ) THEN
            -- Registrar ajuste manual
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
                ABS(NEW.quantidade - OLD.quantidade),
                OLD.quantidade,
                NEW.quantidade,
                v_usuario_id,
                'ajuste',
                'Ajuste manual de estoque'
            );
        END IF;
    END IF;

    RETURN NEW;
END;
$$;
