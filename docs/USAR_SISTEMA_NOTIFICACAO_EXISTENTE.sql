    -- =====================================================
    -- ATUALIZAR TRIGGER PARA USAR SISTEMA EXISTENTE
    -- =====================================================

    -- Atualizar função processar_baixa_estoque_os para usar criar_notificacao_estoque
    CREATE OR REPLACE FUNCTION processar_baixa_estoque_os()
    RETURNS TRIGGER AS $$
    DECLARE
    v_estoque_atual INTEGER;
    v_estoque_novo INTEGER;
    v_numero_os INTEGER;
    v_descricao_produto TEXT;
    v_quantidade_minima INTEGER;
    BEGIN
    -- Apenas processar se for produto do estoque (não avulso)
    IF NEW.tipo_produto = 'estoque' AND NEW.id_produto IS NOT NULL AND NEW.id_loja IS NOT NULL THEN
        
        RAISE NOTICE '=== TRIGGER BAIXA ESTOQUE INICIADO ===';
        RAISE NOTICE 'Produto: %, Loja: %, Quantidade: %', NEW.id_produto, NEW.id_loja, NEW.quantidade;
        
        -- Buscar número da OS, descrição do produto e quantidade mínima
        SELECT numero_os INTO v_numero_os
        FROM ordem_servico
        WHERE id = NEW.id_ordem_servico;

        SELECT descricao, COALESCE(quantidade_minima, 5) INTO v_descricao_produto, v_quantidade_minima
        FROM produtos
        WHERE id = NEW.id_produto;

        -- Verificar estoque disponível
        SELECT quantidade INTO v_estoque_atual
        FROM estoque_lojas
        WHERE id_produto = NEW.id_produto
        AND id_loja = NEW.id_loja;
        
        RAISE NOTICE 'Estoque atual: %', v_estoque_atual;

        IF v_estoque_atual IS NULL THEN
        RAISE EXCEPTION 'Produto não encontrado no estoque da loja';
        END IF;

        IF v_estoque_atual < NEW.quantidade THEN
        RAISE EXCEPTION 'Estoque insuficiente. Disponível: %, Solicitado: %', v_estoque_atual, NEW.quantidade;
        END IF;
        
        -- Calcular novo estoque
        v_estoque_novo := v_estoque_atual - NEW.quantidade;

        RAISE NOTICE 'Baixando estoque de % para %', v_estoque_atual, v_estoque_novo;

        -- BAIXAR DO ESTOQUE
        UPDATE estoque_lojas
        SET quantidade = v_estoque_novo,
            atualizado_em = NOW(),
            atualizado_por = NEW.criado_por
        WHERE id_produto = NEW.id_produto
        AND id_loja = NEW.id_loja;
        
        -- Marcar como estoque baixado
        NEW.estoque_baixado := TRUE;
        NEW.data_baixa_estoque := NOW();
        
        RAISE NOTICE 'Estoque baixado com sucesso!';

        -- Usar a função existente para criar notificação inteligente
        BEGIN
        PERFORM criar_notificacao_estoque(
            NEW.id_produto,
            NEW.id_loja,
            v_estoque_novo,
            v_quantidade_minima
        );
        RAISE NOTICE 'Sistema de notificações acionado!';
        EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE 'Erro ao acionar notificação: %', SQLERRM;
        END;

        -- Registrar no histórico de estoque
        INSERT INTO historico_estoque (
        id_produto,
        id_loja,
        tipo_movimentacao,
        quantidade,
        quantidade_anterior,
        quantidade_nova,
        quantidade_alterada,
        motivo,
        observacao,
        usuario_id,
        id_ordem_servico
        ) VALUES (
        NEW.id_produto,
        NEW.id_loja,
        'saida',
        NEW.quantidade,
        v_estoque_atual,
        v_estoque_novo,
        NEW.quantidade,
        'ordem_servico',
        'Saída para OS #' || COALESCE(v_numero_os::TEXT, 'N/A') || ' - ' || COALESCE(v_descricao_produto, 'Produto'),
        NEW.criado_por,
        NEW.id_ordem_servico
        );

        RAISE NOTICE '=== TRIGGER BAIXA ESTOQUE FINALIZADO ===';
    ELSE
        RAISE NOTICE 'Produto avulso ou dados incompletos - não processa estoque';
    END IF;
    
    RETURN NEW;
    EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'ERRO NO TRIGGER: %', SQLERRM;
        RAISE;
    END;
    $$ LANGUAGE plpgsql;

    -- Verificar se foi atualizado
    SELECT 
    p.proname AS function_name,
    'Atualizado com sucesso!' AS status
    FROM pg_proc p
    WHERE p.proname = 'processar_baixa_estoque_os';
