-- =====================================================
-- ATUALIZAR TRIGGER: Adicionar mais logs para debug
-- =====================================================

CREATE OR REPLACE FUNCTION public.processar_baixa_estoque_os()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  v_estoque_atual INTEGER;
  v_estoque_novo INTEGER;
  v_numero_os INTEGER;
  v_descricao_produto TEXT;
  v_quantidade_minima INTEGER;
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'INÍCIO DO TRIGGER processar_baixa_estoque_os';
  RAISE NOTICE '========================================';
  
  RAISE NOTICE '🔍 DADOS RECEBIDOS (NEW):';
  RAISE NOTICE '  - NEW.id_loja: %', NEW.id_loja;
  RAISE NOTICE '  - NEW.id_produto: %', NEW.id_produto;
  RAISE NOTICE '  - NEW.quantidade: %', NEW.quantidade;
  RAISE NOTICE '  - NEW.tipo_produto: %', NEW.tipo_produto;
  RAISE NOTICE '  - NEW.id_ordem_servico: %', NEW.id_ordem_servico;
  
  -- Apenas processar se for produto do estoque (não avulso)
  IF NEW.tipo_produto = 'estoque' AND NEW.id_produto IS NOT NULL AND NEW.id_loja IS NOT NULL THEN
    
    -- Buscar número da OS, descrição do produto e quantidade mínima
    SELECT numero_os INTO v_numero_os
    FROM ordem_servico
    WHERE id = NEW.id_ordem_servico;
    
    RAISE NOTICE '📋 Número da OS: %', v_numero_os;

    SELECT descricao, COALESCE(quantidade_minima, 5) 
    INTO v_descricao_produto, v_quantidade_minima
    FROM produtos
    WHERE id = NEW.id_produto;
    
    RAISE NOTICE '📦 Produto: %', v_descricao_produto;
    RAISE NOTICE '⚙️ Quantidade mínima configurada: %', v_quantidade_minima;

    -- QUERY DETALHADA DE ESTOQUE
    RAISE NOTICE '🔎 CONSULTANDO ESTOQUE:';
    RAISE NOTICE '  WHERE id_produto = % AND id_loja = %', NEW.id_produto, NEW.id_loja;
    
    SELECT quantidade INTO v_estoque_atual
    FROM estoque_lojas
    WHERE id_produto = NEW.id_produto
      AND id_loja = NEW.id_loja;
    
    RAISE NOTICE '📊 RESULTADO DA CONSULTA:';
    RAISE NOTICE '  - v_estoque_atual = %', v_estoque_atual;
    
    -- Se não encontrou, mostrar o que TEM na tabela para esse produto
    IF v_estoque_atual IS NULL THEN
      RAISE NOTICE '❌ ESTOQUE NÃO ENCONTRADO! Verificando o que existe:';
      
      DECLARE
        r RECORD;
      BEGIN
        FOR r IN 
          SELECT el.id_loja, l.nome, el.quantidade, el.id
          FROM estoque_lojas el
          JOIN lojas l ON l.id = el.id_loja
          WHERE el.id_produto = NEW.id_produto
        LOOP
          RAISE NOTICE '  → Loja %, Nome: %, Qtd: %, ID: %', 
            r.id_loja, r.nome, r.quantidade, r.id;
        END LOOP;
      END;
      
      RAISE EXCEPTION 'Produto não encontrado no estoque da loja';
    END IF;

    IF v_estoque_atual < NEW.quantidade THEN
      RAISE EXCEPTION 'Estoque insuficiente. Disponível: %, Necessário: %', 
        v_estoque_atual, NEW.quantidade;
    END IF;
    
    -- Calcular novo estoque
    v_estoque_novo := v_estoque_atual - NEW.quantidade;
    
    RAISE NOTICE '✅ Estoque ANTES: %, DEPOIS: %', v_estoque_atual, v_estoque_novo;

    -- BAIXAR DO ESTOQUE
    UPDATE estoque_lojas
    SET quantidade = v_estoque_novo,
        atualizado_em = NOW(),
        atualizado_por = NEW.criado_por
    WHERE id_produto = NEW.id_produto
      AND id_loja = NEW.id_loja;
    
    RAISE NOTICE '✅ Estoque atualizado no banco!';
    
    -- Marcar como estoque baixado
    NEW.estoque_baixado := TRUE;
    NEW.data_baixa_estoque := NOW();

    -- Criar notificação se necessário
    BEGIN
      PERFORM criar_notificacao_estoque(
        NEW.id_produto,
        NEW.id_loja,
        v_estoque_novo,
        v_quantidade_minima
      );
    EXCEPTION
      WHEN OTHERS THEN
        RAISE NOTICE '⚠️ Erro ao criar notificação: %', SQLERRM;
    END;

    -- Registrar no histórico
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
    
    RAISE NOTICE '✅ Histórico registrado!';
    RAISE NOTICE '========================================';
  ELSE
    RAISE NOTICE '⚠️ Produto avulso ou dados incompletos - NÃO processa estoque';
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '❌ ERRO FATAL: %', SQLERRM;
    RAISE;
END;
$function$;

-- Comentário
COMMENT ON FUNCTION processar_baixa_estoque_os() IS 
'Trigger BEFORE INSERT que baixa estoque e cria notificações quando peça é adicionada à OS. Versão com logs detalhados para debug.';
