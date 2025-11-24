-- ==========================================
-- ADICIONAR LOGS NA FUNÇÃO criar_notificacao_estoque
-- ==========================================

CREATE OR REPLACE FUNCTION public.criar_notificacao_estoque(
  p_produto_id uuid, 
  p_loja_id integer, 
  p_quantidade integer, 
  p_quantidade_minima integer
)
RETURNS void
LANGUAGE plpgsql
AS $function$
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
    RAISE NOTICE '🟢 criar_notificacao_estoque INICIADA';
    RAISE NOTICE '   Params: produto=%, loja=%, qtd=%, min=%', 
      p_produto_id, p_loja_id, p_quantidade, p_quantidade_minima;
    
    -- Buscar informações do produto e loja
    SELECT descricao INTO v_produto_nome FROM public.produtos WHERE id = p_produto_id;
    SELECT nome INTO v_loja_nome FROM public.lojas WHERE id = p_loja_id;
    
    RAISE NOTICE '   Produto: %, Loja: %', v_produto_nome, v_loja_nome;
    
    IF v_produto_nome IS NULL OR v_loja_nome IS NULL THEN
        RAISE NOTICE '❌ Produto ou loja não encontrados, saindo';
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
    
    RAISE NOTICE '   Estado atual: %', v_estado_atual;
    
    -- Verificar estado anterior
    SELECT estado INTO v_estado_anterior 
    FROM public.alertas_estoque_controle
    WHERE produto_id = p_produto_id AND loja_id = p_loja_id;
    
    RAISE NOTICE '   Estado anterior: %', v_estado_anterior;
    
    -- Se não mudou de estado, não fazer nada
    IF v_estado_anterior = v_estado_atual THEN
        RAISE NOTICE '⏭️  Estado não mudou (%->%), não criar notificação', v_estado_anterior, v_estado_atual;
        RETURN;
    END IF;
    
    RAISE NOTICE '✅ Estado mudou de % para %, criando notificação', v_estado_anterior, v_estado_atual;
    
    -- Determinar tipo e mensagem
    IF v_estado_anterior IN ('baixo', 'zerado') AND v_estado_atual = 'normal' THEN
        v_tipo := 'estoque_reposto';
        v_titulo := 'Estoque Reposto';
        v_mensagem := format('O estoque de "%s" foi reposto na loja "%s". Quantidade atual: %s unidades.',
            v_produto_nome, v_loja_nome, p_quantidade);
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
        RAISE NOTICE '⏭️  Nenhuma notificação necessária';
        RETURN;
    END IF;
    
    RAISE NOTICE '📝 Criando notificação tipo: %', v_tipo;
    
    -- Criar notificação
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
        
        RAISE NOTICE '✅ Notificação criada ID: %', v_notificacao_id;
        
        -- Criar registros para todos os usuários ativos
        INSERT INTO public.notificacoes_usuarios (notificacao_id, usuario_id)
        SELECT v_notificacao_id, id
        FROM public.usuarios
        WHERE ativo = true;
        
        RAISE NOTICE '✅ Registros de usuários criados';
        
    EXCEPTION
        WHEN OTHERS THEN
            RAISE WARNING '❌ Erro ao criar notificação: %', SQLERRM;
            RETURN;
    END;
    
    -- Atualizar controle de alerta
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
        
    RAISE NOTICE '✅ Controle de alerta atualizado';
    RAISE NOTICE '🏁 criar_notificacao_estoque CONCLUÍDA';
        
EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING '❌ Erro geral em criar_notificacao_estoque: %', SQLERRM;
        RETURN;
END;
$function$;

-- Testar com UPDATE
UPDATE estoque_lojas
SET quantidade = 15
WHERE id_produto = 'e138eed1-e316-4d2a-990e-7f1ebdee06c7'
  AND id_loja = 16;
