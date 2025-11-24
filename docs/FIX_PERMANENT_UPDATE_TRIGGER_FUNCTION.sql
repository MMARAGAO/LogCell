-- =====================================================
-- CORREÇÃO PERMANENTE: Atualizar função processar_reserva_estoque_os
-- =====================================================
-- Esta correção atualiza a função para usar quantidade_alterada
-- em vez de quantidade, seguindo o novo padrão da tabela

CREATE OR REPLACE FUNCTION public.processar_reserva_estoque_os()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
  v_estoque_atual INTEGER;
BEGIN
  -- Apenas processar se for produto do estoque (não avulso)
  IF NEW.tipo_produto = 'estoque' AND NEW.id_produto IS NOT NULL THEN
    
    IF TG_OP = 'INSERT' THEN
      -- Verificar se há estoque disponível
      SELECT quantidade INTO v_estoque_atual
      FROM estoque_lojas
      WHERE id_produto = NEW.id_produto
        AND id_loja = NEW.id_loja;
      
      IF v_estoque_atual IS NULL OR v_estoque_atual < NEW.quantidade THEN
        RAISE EXCEPTION 'Estoque insuficiente para o produto';
      END IF;
      
      -- Apenas reservar (não dar baixa ainda)
      NEW.estoque_reservado := TRUE;
      NEW.data_reserva_estoque := NOW();
      
      -- Registrar reserva no histórico
      -- CORRIGIDO: Usando quantidade_alterada em vez de quantidade
      INSERT INTO historico_estoque (
        id_produto,
        id_loja,
        tipo_movimentacao,
        quantidade_alterada,  -- MUDADO: quantidade → quantidade_alterada
        quantidade_anterior,
        quantidade_nova,
        observacao,           -- MANTIDO: observacao (singular)
        usuario_id            -- MUDADO: criado_por → usuario_id
      ) VALUES (
        NEW.id_produto,
        NEW.id_loja,
        'reserva',
        NEW.quantidade,       -- Este é NEW.quantidade (da ordem_servico_pecas)
        v_estoque_atual,
        v_estoque_atual,
        'Reservado para OS #' || (SELECT numero_os FROM ordem_servico WHERE id = NEW.id_ordem_servico),
        NEW.criado_por
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Verificar se a função foi atualizada
SELECT pg_get_functiondef('processar_reserva_estoque_os'::regproc);
