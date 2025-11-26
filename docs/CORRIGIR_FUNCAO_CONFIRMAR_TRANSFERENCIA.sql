-- =====================================================
-- CORRIGIR FUNÇÃO CONFIRMAR_TRANSFERENCIA
-- Data: 25/11/2025
-- =====================================================
-- Problema: Função usa quantidade_alterada (campo antigo)
-- Solução: Atualizar para usar campo quantidade
-- =====================================================

CREATE OR REPLACE FUNCTION public.confirmar_transferencia(
  p_transferencia_id uuid,
  p_usuario_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_transferencia RECORD;
  v_item RECORD;
  v_estoque_origem RECORD;
  v_estoque_destino RECORD;
BEGIN
  -- 1. Buscar dados da transferência
  SELECT * INTO v_transferencia
  FROM public.transferencias
  WHERE id = p_transferencia_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Transferência não encontrada');
  END IF;

  IF v_transferencia.status != 'pendente' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Esta transferência já foi ' || v_transferencia.status);
  END IF;

  -- 2. Processar cada item
  FOR v_item IN 
    SELECT ti.*, p.descricao as produto_nome
    FROM public.transferencias_itens ti
    JOIN public.produtos p ON p.id = ti.produto_id
    WHERE ti.transferencia_id = p_transferencia_id
  LOOP
    -- Verificar estoque origem
    SELECT * INTO v_estoque_origem
    FROM public.estoque_lojas
    WHERE id_produto = v_item.produto_id AND id_loja = v_transferencia.loja_origem_id;

    IF NOT FOUND THEN
      RETURN jsonb_build_object('success', false, 'error', 'Produto "' || v_item.produto_nome || '" não encontrado no estoque da loja de origem');
    END IF;

    IF v_estoque_origem.quantidade < v_item.quantidade THEN
      RETURN jsonb_build_object('success', false, 'error', 'Estoque insuficiente para "' || v_item.produto_nome || '". Disponível: ' || v_estoque_origem.quantidade || ', Necessário: ' || v_item.quantidade);
    END IF;

    -- Reduzir estoque origem
    UPDATE public.estoque_lojas
    SET quantidade = quantidade - v_item.quantidade, atualizado_por = p_usuario_id, atualizado_em = now()
    WHERE id = v_estoque_origem.id;

    -- Registrar histórico SAÍDA (origem)
    INSERT INTO public.historico_estoque (
      id_produto, id_loja, usuario_id,
      quantidade, quantidade_anterior, quantidade_nova,
      tipo_movimentacao, observacao
    ) VALUES (
      v_item.produto_id, v_transferencia.loja_origem_id, p_usuario_id,
      v_item.quantidade, v_estoque_origem.quantidade, v_estoque_origem.quantidade - v_item.quantidade,
      'transferencia_saida', 'Transferência #' || p_transferencia_id::text || ' → Loja ID: ' || v_transferencia.loja_destino_id
    );

    -- Adicionar estoque destino
    SELECT * INTO v_estoque_destino
    FROM public.estoque_lojas
    WHERE id_produto = v_item.produto_id AND id_loja = v_transferencia.loja_destino_id;

    IF FOUND THEN
      -- Atualizar estoque existente
      UPDATE public.estoque_lojas
      SET quantidade = quantidade + v_item.quantidade, atualizado_por = p_usuario_id, atualizado_em = now()
      WHERE id = v_estoque_destino.id;

      -- Registrar histórico ENTRADA (destino)
      INSERT INTO public.historico_estoque (
        id_produto, id_loja, usuario_id,
        quantidade, quantidade_anterior, quantidade_nova,
        tipo_movimentacao, observacao
      ) VALUES (
        v_item.produto_id, v_transferencia.loja_destino_id, p_usuario_id,
        v_item.quantidade, v_estoque_destino.quantidade, v_estoque_destino.quantidade + v_item.quantidade,
        'transferencia_entrada', 'Transferência #' || p_transferencia_id::text || ' ← Loja ID: ' || v_transferencia.loja_origem_id
      );
    ELSE
      -- Criar novo estoque
      INSERT INTO public.estoque_lojas (id_produto, id_loja, quantidade, atualizado_por)
      VALUES (v_item.produto_id, v_transferencia.loja_destino_id, v_item.quantidade, p_usuario_id);

      -- Registrar histórico ENTRADA (destino)
      INSERT INTO public.historico_estoque (
        id_produto, id_loja, usuario_id,
        quantidade, quantidade_anterior, quantidade_nova,
        tipo_movimentacao, observacao
      ) VALUES (
        v_item.produto_id, v_transferencia.loja_destino_id, p_usuario_id,
        v_item.quantidade, 0, v_item.quantidade,
        'transferencia_entrada', 'Transferência #' || p_transferencia_id::text || ' ← Loja ID: ' || v_transferencia.loja_origem_id
      );
    END IF;
  END LOOP;

  -- 3. Atualizar status da transferência
  UPDATE public.transferencias
  SET status = 'confirmada'
  WHERE id = p_transferencia_id;

  RETURN jsonb_build_object('success', true);
END;
$$;

-- =====================================================
-- VERIFICAÇÃO
-- =====================================================

SELECT 
  '✅ Função confirmar_transferencia atualizada!' as status,
  'Agora usa campo quantidade ao invés de quantidade_alterada' as descricao;
