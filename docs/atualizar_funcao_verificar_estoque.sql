-- =====================================================
-- ATUALIZAR FUNÇÃO trigger_verificar_estoque
-- =====================================================
-- Adicionar verificação se quantidade realmente mudou

CREATE OR REPLACE FUNCTION public.trigger_verificar_estoque()
RETURNS TRIGGER AS $$
DECLARE
    v_quantidade_minima INTEGER;
BEGIN
    -- Só processar se:
    -- 1. For INSERT (novo estoque), OU
    -- 2. For UPDATE e a quantidade mudou
    IF (TG_OP = 'INSERT') OR 
       (TG_OP = 'UPDATE' AND OLD.quantidade IS DISTINCT FROM NEW.quantidade) THEN
        
        -- Buscar quantidade_minima do produto
        SELECT quantidade_minima INTO v_quantidade_minima
        FROM produtos
        WHERE id = NEW.id_produto;
        
        -- Se não encontrou ou quantidade_minima é NULL, usar 0
        v_quantidade_minima := COALESCE(v_quantidade_minima, 0);
        
        -- Chamar função que cria notificação (com 4 parâmetros)
        PERFORM public.criar_notificacao_estoque(
            NEW.id_produto,
            NEW.id_loja,
            NEW.quantidade,
            v_quantidade_minima
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verificar se foi atualizada
SELECT 
    proname,
    prosrc
FROM pg_proc
WHERE proname = 'trigger_verificar_estoque';

-- Mensagem
DO $$ 
BEGIN 
    RAISE NOTICE '✅ Função atualizada!'; 
    RAISE NOTICE '🔍 Agora só processa quando quantidade realmente muda'; 
    RAISE NOTICE '📝 Usa IS DISTINCT FROM para comparar valores (inclusive NULL)'; 
END $$;
