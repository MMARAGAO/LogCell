-- =====================================================
-- APLICAR SECURITY INVOKER - VERSÃO DEFINITIVA
-- =====================================================

-- 1. Dropar e recriar a função COM SECURITY INVOKER
DROP FUNCTION IF EXISTS public.processar_baixa_estoque_os() CASCADE;

CREATE OR REPLACE FUNCTION public.processar_baixa_estoque_os()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER  -- <<<< AQUI ESTÁ A SOLUÇÃO!
AS $function$
DECLARE
  v_estoque_atual INTEGER;
  v_estoque_novo INTEGER;
  v_numero_os INTEGER;
  v_descricao_produto TEXT;
  v_quantidade_minima INTEGER;
  v_linhas_afetadas INTEGER;
BEGIN
  -- Apenas processar se for produto do estoque (não avulso)
  IF NEW.tipo_produto = 'estoque' AND NEW.id_produto IS NOT NULL AND NEW.id_loja IS NOT NULL THEN
    
    -- Buscar dados da OS e produto
    SELECT numero_os INTO v_numero_os
    FROM ordem_servico
    WHERE id = NEW.id_ordem_servico;

    SELECT descricao, COALESCE(quantidade_minima, 5) 
    INTO v_descricao_produto, v_quantidade_minima
    FROM produtos
    WHERE id = NEW.id_produto;
    
    -- Usar UPDATE com RETURNING para pegar estoque anterior
    UPDATE estoque_lojas
    SET quantidade = quantidade - NEW.quantidade,
        atualizado_em = NOW(),
        atualizado_por = NEW.criado_por
    WHERE id_produto = NEW.id_produto
      AND id_loja = NEW.id_loja
      AND quantidade >= NEW.quantidade
    RETURNING quantidade + NEW.quantidade, quantidade 
    INTO v_estoque_atual, v_estoque_novo;
    
    -- Verificar se UPDATE afetou alguma linha
    GET DIAGNOSTICS v_linhas_afetadas = ROW_COUNT;
    
    IF v_linhas_afetadas = 0 THEN
      -- Buscar estoque atual para mensagem
      SELECT COALESCE(quantidade, 0) INTO v_estoque_atual
      FROM estoque_lojas
      WHERE id_produto = NEW.id_produto
        AND id_loja = NEW.id_loja;
      
      IF v_estoque_atual IS NULL THEN
        RAISE EXCEPTION 'Produto não encontrado no estoque da loja';
      ELSE
        RAISE EXCEPTION 'Estoque insuficiente! Disponível: %, Necessário: %', 
          v_estoque_atual, NEW.quantidade;
      END IF;
    END IF;
    
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
        NULL;
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
  END IF;
  
  RETURN NEW;
END;
$function$;

-- 2. Recriar o trigger
CREATE TRIGGER trigger_baixa_estoque_os
  BEFORE INSERT ON ordem_servico_pecas
  FOR EACH ROW
  EXECUTE FUNCTION processar_baixa_estoque_os();

-- 3. Verificar se aplicou corretamente
SELECT 
  p.proname as funcao,
  CASE p.prosecdef 
    WHEN true THEN 'SECURITY DEFINER ❌' 
    ELSE 'SECURITY INVOKER ✅' 
  END as security_type
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.proname = 'processar_baixa_estoque_os';
