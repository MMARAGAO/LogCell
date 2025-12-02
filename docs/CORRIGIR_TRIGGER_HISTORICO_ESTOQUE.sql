-- Corrigir a função para registrar histórico mesmo quando atualizado_por é NULL
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

    -- Registrar QUALQUER UPDATE de quantidade
    -- Removemos a condição "NEW.atualizado_por IS NOT NULL"
    IF TG_OP = 'UPDATE' 
       AND OLD.quantidade IS DISTINCT FROM NEW.quantidade THEN
        
        -- Verificar se código já registrou manualmente (evita duplicação)
        IF NOT EXISTS(
            SELECT 1 
            FROM historico_estoque 
            WHERE id_produto = NEW.id_produto 
              AND id_loja = NEW.id_loja
              AND quantidade_nova = NEW.quantidade
              AND criado_em > NOW() - INTERVAL '1 second'
        ) THEN
            -- Registrar ajuste
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
                CASE 
                    WHEN NEW.atualizado_por IS NOT NULL THEN 'Ajuste manual de estoque'
                    ELSE 'Ajuste de estoque (origem desconhecida)'
                END
            );
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

-- Comentário sobre a mudança
COMMENT ON FUNCTION public.registrar_historico_ajuste_manual() IS 
'Registra no histórico QUALQUER alteração de quantidade na tabela estoque_lojas, independente de atualizado_por estar preenchido ou não';
