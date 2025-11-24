-- =====================================================
-- ATUALIZAÇÃO DO SISTEMA DE NOTIFICAÇÕES
-- =====================================================
-- Corrige erros no trigger e adiciona tratamento de exceções

-- 1. Recriar função de criar notificação com tratamento de erros
CREATE OR REPLACE FUNCTION public.criar_notificacao_estoque(
    p_produto_id UUID,
    p_loja_id INTEGER,
    p_quantidade INTEGER,
    p_quantidade_minima INTEGER
)
RETURNS void AS $$
DECLARE
    v_produto_nome TEXT;
    v_loja_nome TEXT;
    v_estado_atual TEXT;
    v_estado_anterior TEXT;
    v_notificacao_id INTEGER;
    v_tipo TEXT;
    v_titulo TEXT;
    v_mensagem TEXT;
BEGIN
    -- Buscar informações do produto e loja (com tratamento de NULL)
    SELECT descricao INTO v_produto_nome FROM public.produtos WHERE id = p_produto_id;
    SELECT nome INTO v_loja_nome FROM public.lojas WHERE id = p_loja_id;
    
    -- Se não encontrou produto ou loja, sair
    IF v_produto_nome IS NULL OR v_loja_nome IS NULL THEN
        RETURN;
    END IF;
    
    -- Determinar estado atual
    IF p_quantidade = 0 THEN
        v_estado_atual := 'zerado';
    ELSIF p_quantidade <= p_quantidade_minima THEN
        v_estado_atual := 'baixo';
    ELSE
        v_estado_atual := 'normal';
    END IF;
    
    -- Verificar estado anterior
    SELECT estado INTO v_estado_anterior 
    FROM public.alertas_estoque_controle
    WHERE produto_id = p_produto_id AND loja_id = p_loja_id;
    
    -- Se não mudou de estado, não fazer nada
    IF v_estado_anterior = v_estado_atual THEN
        RETURN;
    END IF;
    
    -- Se voltou ao normal (estoque reposto), criar notificação de reposição
    IF v_estado_anterior IN ('baixo', 'zerado') AND v_estado_atual = 'normal' THEN
        v_tipo := 'estoque_reposto';
        v_titulo := 'Estoque Reposto';
        v_mensagem := format('O estoque de "%s" foi reposto na loja "%s". Quantidade atual: %s unidades.',
            v_produto_nome, v_loja_nome, p_quantidade);
    
    -- Se ficou baixo ou zerado, criar notificação de alerta
    ELSIF v_estado_atual = 'zerado' THEN
        v_tipo := 'estoque_zerado';
        v_titulo := 'Estoque Zerado';
        v_mensagem := format('O produto "%s" está sem estoque na loja "%s"!',
            v_produto_nome, v_loja_nome);
    
    ELSIF v_estado_atual = 'baixo' THEN
        v_tipo := 'estoque_baixo';
        v_titulo := 'Estoque Baixo';
        v_mensagem := format('O estoque de "%s" está baixo na loja "%s". Quantidade atual: %s (mínimo: %s).',
            v_produto_nome, v_loja_nome, p_quantidade, p_quantidade_minima);
    ELSE
        -- Nenhuma notificação necessária
        RETURN;
    END IF;
    
    -- Criar notificação (com tratamento de erro)
    BEGIN
        INSERT INTO public.notificacoes (
            tipo, titulo, mensagem, produto_id, loja_id,
            dados_extras
        )
        VALUES (
            v_tipo, v_titulo, v_mensagem, p_produto_id, p_loja_id,
            jsonb_build_object(
                'quantidade', p_quantidade,
                'quantidade_minima', p_quantidade_minima,
                'estado', v_estado_atual
            )
        )
        RETURNING id INTO v_notificacao_id;
        
        -- Criar registros para todos os usuários ativos
        INSERT INTO public.notificacoes_usuarios (notificacao_id, usuario_id)
        SELECT v_notificacao_id, id
        FROM public.usuarios
        WHERE ativo = true;
        
    EXCEPTION
        WHEN OTHERS THEN
            RAISE WARNING 'Erro ao criar notificação: %', SQLERRM;
            RETURN;
    END;
    
    -- Atualizar ou inserir controle de alerta
    INSERT INTO public.alertas_estoque_controle (
        produto_id, loja_id, estado, quantidade_atual, quantidade_minima
    )
    VALUES (
        p_produto_id, p_loja_id, v_estado_atual, p_quantidade, p_quantidade_minima
    )
    ON CONFLICT (produto_id, loja_id)
    DO UPDATE SET
        estado = v_estado_atual,
        quantidade_atual = p_quantidade,
        quantidade_minima = p_quantidade_minima,
        ultimo_alerta_em = NOW(),
        atualizado_em = NOW();
        
EXCEPTION
    WHEN OTHERS THEN
        -- Se houver qualquer erro, apenas logar mas não interromper a operação
        RAISE WARNING 'Erro geral em criar_notificacao_estoque: %', SQLERRM;
        RETURN;
END;
$$ LANGUAGE plpgsql;

-- 2. Recriar trigger com melhor tratamento de erros
CREATE OR REPLACE FUNCTION public.trigger_verificar_estoque()
RETURNS TRIGGER AS $$
DECLARE
    v_quantidade_minima INTEGER;
BEGIN
    -- Buscar quantidade mínima do produto (com tratamento de erro)
    BEGIN
        SELECT quantidade_minima INTO v_quantidade_minima 
        FROM public.produtos 
        WHERE id = NEW.id_produto;
        
        -- Se não encontrou o produto ou quantidade_minima é NULL/0, não fazer nada
        IF v_quantidade_minima IS NULL OR v_quantidade_minima = 0 THEN
            RETURN NEW;
        END IF;
        
        -- Chamar função de notificação
        PERFORM public.criar_notificacao_estoque(
            NEW.id_produto,
            NEW.id_loja,
            NEW.quantidade,
            v_quantidade_minima
        );
        
    EXCEPTION
        WHEN OTHERS THEN
            -- Log do erro mas não interrompe a operação
            RAISE WARNING 'Erro ao verificar estoque para notificação: %', SQLERRM;
    END;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Recriar o trigger
DROP TRIGGER IF EXISTS trigger_alerta_estoque ON public.estoque_lojas;
CREATE TRIGGER trigger_alerta_estoque
    AFTER INSERT OR UPDATE OF quantidade
    ON public.estoque_lojas
    FOR EACH ROW
    EXECUTE FUNCTION public.trigger_verificar_estoque();

-- Verificar atualização
DO $$ 
BEGIN 
    RAISE NOTICE '✅ Sistema de notificações atualizado com sucesso!'; 
    RAISE NOTICE '🔧 Funções atualizadas com tratamento de erros'; 
    RAISE NOTICE '🔔 Trigger recriado e ativo';
END $$;
