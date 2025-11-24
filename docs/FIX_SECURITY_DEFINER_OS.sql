-- ==========================================
-- ADICIONAR SECURITY DEFINER NO TRIGGER DE OS
-- ==========================================

CREATE OR REPLACE FUNCTION public.processar_baixa_estoque_os()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER  -- ⭐ CRUCIAL: Executar com permissões elevadas
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
  
  -- Apenas processar se for produto do estoque (não avulso)
  IF NEW.tipo_produto = 'estoque' AND NEW.id_produto IS NOT NULL AND NEW.id_loja IS NOT NULL THEN
    
    RAISE NOTICE 'Tipo produto: %', NEW.tipo_produto;
    RAISE NOTICE 'ID Produto: %', NEW.id_produto;
    RAISE NOTICE 'ID Loja: %', NEW.id_loja;
    RAISE NOTICE 'Quantidade solicitada: %', NEW.quantidade;
    
    -- Buscar número da OS, descrição do produto e quantidade mínima
    SELECT numero_os INTO v_numero_os
    FROM ordem_servico
    WHERE id = NEW.id_ordem_servico;
    
    RAISE NOTICE 'Número da OS: %', v_numero_os;

    SELECT descricao, COALESCE(quantidade_minima, 5) 
    INTO v_descricao_produto, v_quantidade_minima
    FROM produtos
    WHERE id = NEW.id_produto;
    
    RAISE NOTICE 'Produto: %', v_descricao_produto;
    RAISE NOTICE 'Quantidade mínima configurada: %', v_quantidade_minima;

    -- Verificar estoque disponível
    SELECT quantidade INTO v_estoque_atual
    FROM estoque_lojas
    WHERE id_produto = NEW.id_produto
      AND id_loja = NEW.id_loja;
    
    RAISE NOTICE 'Estoque ANTES da baixa: %', v_estoque_atual;

    IF v_estoque_atual IS NULL THEN
      RAISE EXCEPTION 'Produto não encontrado no estoque da loja';
    END IF;

    IF v_estoque_atual < NEW.quantidade THEN
      RAISE EXCEPTION 'Estoque insuficiente. Disponível: %, Solicitado: %', v_estoque_atual, NEW.quantidade;
    END IF;
    
    -- Calcular novo estoque
    v_estoque_novo := v_estoque_atual - NEW.quantidade;
    
    RAISE NOTICE 'Estoque DEPOIS da baixa: %', v_estoque_novo;
    RAISE NOTICE 'Diferença: %', v_estoque_atual - v_estoque_novo;

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
    
    RAISE NOTICE '✅ Flags de baixa marcadas!';

    -- Usar a função existente para criar notificação inteligente
    RAISE NOTICE '----------------------------------------';
    RAISE NOTICE 'CHAMANDO criar_notificacao_estoque...';
    RAISE NOTICE 'Parâmetros:';
    RAISE NOTICE '  - Produto ID: %', NEW.id_produto;
    RAISE NOTICE '  - Loja ID: %', NEW.id_loja;
    RAISE NOTICE '  - Quantidade nova: %', v_estoque_novo;
    RAISE NOTICE '  - Quantidade mínima: %', v_quantidade_minima;
    
    BEGIN
      PERFORM criar_notificacao_estoque(
        NEW.id_produto,
        NEW.id_loja,
        v_estoque_novo,
        v_quantidade_minima
      );
      RAISE NOTICE '✅ criar_notificacao_estoque executada SEM ERROS!';
    EXCEPTION
      WHEN OTHERS THEN
        RAISE NOTICE '❌ ERRO ao executar criar_notificacao_estoque: %', SQLERRM;
        RAISE NOTICE 'SQLSTATE: %', SQLSTATE;
    END;
    
    RAISE NOTICE '----------------------------------------';

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
    
    RAISE NOTICE '✅ Histórico registrado!';

    RAISE NOTICE '========================================';
    RAISE NOTICE 'FIM DO TRIGGER processar_baixa_estoque_os';
    RAISE NOTICE '========================================';
  ELSE
    RAISE NOTICE '⚠️ Produto avulso ou dados incompletos - NÃO processa estoque';
    RAISE NOTICE '   tipo_produto: %', NEW.tipo_produto;
    RAISE NOTICE '   id_produto: %', NEW.id_produto;
    RAISE NOTICE '   id_loja: %', NEW.id_loja;
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '❌❌❌ ERRO FATAL NO TRIGGER: %', SQLERRM;
    RAISE NOTICE 'SQLSTATE: %', SQLSTATE;
    RAISE;
END;
$function$;

COMMENT ON FUNCTION public.processar_baixa_estoque_os() IS 
'Trigger BEFORE INSERT em ordem_servico_pecas. Baixa estoque e cria notificações. 
SECURITY DEFINER para garantir execução de criar_notificacao_estoque().';

-- Verificar se foi aplicado
SELECT 
  p.proname,
  CASE WHEN p.prosecdef THEN 'SECURITY DEFINER ✅' ELSE 'SECURITY INVOKER ❌' END as security
FROM pg_proc p
WHERE p.proname = 'processar_baixa_estoque_os';
